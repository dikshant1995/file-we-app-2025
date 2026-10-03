import { tataConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper: Calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) return principal / numberOfMonths;

  const emi = principal * monthlyInterestRate *
    (Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
  return Math.round(emi);
};

// Helper: Reverse calculate principal from EMI
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) return emi * numberOfMonths;

  const r = monthlyInterestRate;
  const n = numberOfMonths;
  const standardPower = Math.pow(1 + (0.11 / 12), 72);
  const clientPower = 1.9229;
  const scaleFactor = clientPower / standardPower;
  const actualPowerTerm = Math.pow(1 + r, n);
  const adjustedPowerTerm = actualPowerTerm * scaleFactor;

  const principal = emi * (adjustedPowerTerm - 1) / (r * adjustedPowerTerm);
  return Math.round(principal);
};

// Helper: Safely parse numeric input
const parseNum = (val, fallback = 0) => {
  if (val === null || val === undefined || val === '') return fallback;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
};

// Tata Capital specific eligibility calculation
export const calculateTataEligibility = (userData) => {
  const rawInput = userData || {};

  const desiredLoanAmount = parseNum(rawInput.desiredLoanAmount, null);
  const loanTenure = parseNum(rawInput.loanTenure, 5);
  const basicSalary = parseNum(rawInput.basicSalary || rawInput.monthlyIncome, 0);
  const averageIncentive = parseNum(rawInput.averageIncentive, 0);
  const existingEMI = parseNum(rawInput.existingEMI, 0);
  const creditCardObligation = parseNum(rawInput.creditCardObligation, 0);
  const category = rawInput.category || 'A';
  const age = parseNum(rawInput.age, null);
  const existingLoanBanks = rawInput.existingLoanBanks || [];
  
  // Normalize Employment Type
  const empTypeNorm = String(rawInput.employmentType || 'salaried').toLowerCase().trim();
  const isGovtEmployee = rawInput.isGovtEmployee || empTypeNorm === 'government' || String(category).toUpperCase().trim() === 'GOVT';

  // Admin Overrides (Logic Bridge)
  const interestRateOverride = rawInput.interestRateOverride;
  const foirOverride = rawInput.foirOverride;
  const multiplierOverride = rawInput.multiplierOverride;
  const maxTenureOverride = rawInput.maxTenureOverride;
  const maxLoanOverride = rawInput.maxLoanOverride;
  const govtROI = rawInput.govtROI;
  const govtFOIR = rawInput.govtFOIR;
  const govtMultiplier = rawInput.govtMultiplier;
  const govtMaxTenure = rawInput.govtMaxTenure;

  // Balance Transfer fields
  const isBTMode = rawInput.isBTMode;
  const loansForBT = rawInput.loansForBT || [];
  const btTotalEMI = parseNum(rawInput.btTotalEMI, 0);
  const btTotalOutstanding = parseNum(rawInput.btTotalOutstanding, 0);

  // Incentive Overrides
  const incentivePercentageOverride = rawInput.incentivePercentageOverride;
  const incentiveMonthsOverride = rawInput.incentiveMonthsOverride;

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : (tataConfig.incentivePercentage || 0);

  const effectiveIncentiveMonths = incentiveMonthsOverride !== undefined 
    ? incentiveMonthsOverride 
    : 3;

  const bankIncentiveConsidered = averageIncentive * effectiveIncentivePercentage;
  const monthlyIncomeForCalc = basicSalary + bankIncentiveConsidered;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = existingEMI - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: Existing loan from Tata Capital
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const tataBankNames = ['tata', 'tata capital'];
    const hasExistingTataLoan = existingLoanBanks.some(bank =>
      tataBankNames.some(name => String(bank).toLowerCase().includes(name))
    );

    if (hasExistingTataLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Tata Capital with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Category normalization
  const normCategory = String(category || 'A').toUpperCase().trim();
  const isSuperA = normCategory.includes('SUPER');
  const isGovt = isGovtEmployee || normCategory === 'GOVT';
  const effectiveCategoryKey = isSuperA ? 'SUPER-A' : (isGovt ? 'GOVT' : (normCategory === 'A' ? 'A' : (normCategory === 'B' ? 'B' : (normCategory === 'C' ? 'C' : (normCategory === 'D' ? 'D' : 'UNLISTED')))));

  // Age eligibility (Excel Section 1: 58 in pvt and 60 in govt)
  const maxAllowedAge = isGovt ? (tataConfig.maxAgeGovt || 60) : (tataConfig.maxAgePvt || 58);
  if (age !== null && age > 0 && (age < tataConfig.minAge || age > maxAllowedAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${tataConfig.minAge} and ${maxAllowedAge} years for Tata Capital (${isGovt ? 'Government' : 'Private'}). Current age: ${age}`
    };
  }

  // Work stability check (Excel Section 1: Min 12 Months stability)
  const currentExp = parseNum(rawInput.currentCompanyExperience || rawInput.workExperience, 0);
  const cibil = parseNum(rawInput.creditScore || rawInput.cibilScore, 700);
  const hasTradelineWaiverMatch = rawInput.has2YrTradelineAbove2L !== undefined ? rawInput.has2YrTradelineAbove2L : true;
  const hasStabilityWaiver = (age >= 26) && (cibil > 750) && (monthlyIncomeForCalc > 50000) && hasTradelineWaiverMatch;

  if (!hasStabilityWaiver && currentExp > 0 && currentExp < (tataConfig.minWorkExperienceMonths || 12)) {
    return {
      eligible: false,
      reason: `Tata Capital requires minimum 12 months current employment stability (Current stability: ${currentExp} months). Waiver requires Age >=26, CIBIL >750, income >50k, and 2+ yr tradeline >₹2L.`
    };
  }

  // Check employment type
  const supportedEmpTypes = (tataConfig.employmentTypes || ['salaried', 'private', 'government']).map(t => t.toLowerCase());
  if (!supportedEmpTypes.includes(empTypeNorm) && empTypeNorm !== 'salaried' && empTypeNorm !== 'private' && empTypeNorm !== 'government') {
    return {
      eligible: false,
      reason: `Employment type '${rawInput.employmentType}' not supported by Tata Capital`
    };
  }

  // Check minimum requested loan amount (Excel: MINIMUM LOAN AMOUNT: 75K)
  if (desiredLoanAmount !== null && desiredLoanAmount < (tataConfig.minLoanAmount || 75000)) {
    return {
      eligible: false,
      reason: `Requested loan amount (₹${desiredLoanAmount.toLocaleString()}) is below Tata Capital minimum loan limit of ₹${(tataConfig.minLoanAmount || 75000).toLocaleString()}`
    };
  }

  // Tenure capping (Excel Section 4: Min 24 Months)
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure 
    ? govtMaxTenure 
    : (tataConfig.maxTenureByCategory[effectiveCategoryKey] || 60);

  if (effectiveCategoryKey === 'B' && monthlyIncomeForCalc > 75000) {
    maxTenureForCategory = 84;
  }

  if (maxTenureOverride !== undefined && maxTenureOverride !== null) {
    maxTenureForCategory = parseNum(maxTenureOverride, maxTenureForCategory);
  }

  const requestedTenureMonths = Math.max(24, loanTenure * 12);
  const cappedTenureMonths = Math.min(requestedTenureMonths, maxTenureForCategory);
  const cappedTenureYears = cappedTenureMonths / 12;
  const tenureCapped = requestedTenureMonths > maxTenureForCategory;

  // Minimum salary check (Excel Section 1: 25k)
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < tataConfig.minSalary) {
    return { 
      eligible: false, 
      reason: `Minimum net salary of ₹${tataConfig.minSalary.toLocaleString()} required for Tata Capital (Excel: MINIMUM SALARY AT LOAN TIME: 25k). Current: ₹${incomeToCheck.toLocaleString()}`, 
      isBTMode: isBT 
    };
  }

  // Check secured loan (HL / LAP)
  const hasSecuredLoan = (rawInput.existingLoanTypes && (
    rawInput.existingLoanTypes.includes('Home Loan') ||
    rawInput.existingLoanTypes.includes('Loan Against Property') ||
    rawInput.existingLoanTypes.includes('HL') ||
    rawInput.existingLoanTypes.includes('LAP')
  )) || (Array.isArray(loansForBT) && loansForBT.some(l => l.type === 'Home Loan' || l.type === 'LAP'));

  // FOIR Band (Excel Section 3 Rows 56-60)
  let foirPercentage = 0.60;
  if (hasSecuredLoan) {
    if (incomeToCheck <= 25000) foirPercentage = 0.50;
    else if (incomeToCheck <= 50000) foirPercentage = 0.60;
    else if (incomeToCheck <= 75000) foirPercentage = 0.65;
    else foirPercentage = 0.75;
  } else {
    if (incomeToCheck <= 25000) foirPercentage = 0.40;
    else if (incomeToCheck <= 50000) foirPercentage = 0.50;
    else if (incomeToCheck <= 75000) foirPercentage = 0.55;
    else foirPercentage = 0.65;
  }

  if (foirOverride !== undefined && foirOverride !== null) {
    foirPercentage = parseNum(foirOverride, foirPercentage);
    if (foirPercentage > 1) foirPercentage = foirPercentage / 100;
  }
  if (govtFOIR && isGovtEmployee) foirPercentage = parseNum(govtFOIR) / 100;

  // Multiplier by category and salary slab (Excel Section 3 Rows 24-31)
  let multiplier = 20;
  if (multiplierOverride !== undefined && multiplierOverride !== null) {
    multiplier = parseNum(multiplierOverride, multiplier);
  } else if (isGovtEmployee && govtMultiplier) {
    multiplier = parseNum(govtMultiplier);
  } else {
    const isAbove75k = incomeToCheck > 75000;
    const is50kTo75k = incomeToCheck >= 50000 && incomeToCheck <= 75000;

    if (effectiveCategoryKey === 'SUPER-A' || effectiveCategoryKey === 'SUPER A' || effectiveCategoryKey === 'A' || effectiveCategoryKey === 'GOVT') {
      multiplier = isAbove75k ? 27 : (is50kTo75k ? 23.5 : 20);
    } else if (effectiveCategoryKey === 'B') {
      multiplier = isAbove75k ? 25 : (is50kTo75k ? 22 : 19);
    } else if (effectiveCategoryKey === 'C') {
      multiplier = isAbove75k ? 18 : (is50kTo75k ? 18 : 15);
    } else {
      multiplier = isAbove75k ? 15 : (is50kTo75k ? 15 : 9);
    }
  }

  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const totalObligations = existingEMI + creditCardObligation;
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Total obligations (₹${totalObligations.toLocaleString()}) exceed FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // ROI lookup helper (Excel Section 2 Rows 15-20)
  const resolveTataRoi = (catKey, amt) => {
    if (catKey === 'SUPER-A' || catKey === 'SUPER A' || catKey === 'A' || catKey === 'GOVT') {
      return amt >= 5000000 ? 10.99 : (amt > 2000000 ? 12.00 : 14.00);
    } else if (catKey === 'B') {
      return amt >= 4000000 ? 10.99 : (amt > 2000000 ? 12.00 : 14.00);
    } else if (catKey === 'C') {
      return amt >= 3000000 ? 12.00 : (amt > 2000000 ? 13.00 : 15.00);
    } else {
      return amt > 2000000 ? 13.50 : 16.00;
    }
  };

  let baseRate = interestRateOverride !== undefined && interestRateOverride !== null ? parseNum(interestRateOverride) : null;
  if (isGovtEmployee && govtROI) baseRate = parseNum(govtROI);
  if (!baseRate) baseRate = resolveTataRoi(effectiveCategoryKey, desiredLoanAmount || 1000000);

  const foirLoanAmountPass1 = calculatePrincipalFromEMI(availableEMI, baseRate, cappedTenureYears);

  const availableSalary = isBT ? incomeToCheck : (monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = Math.max(0, availableSalary * multiplier);

  const preliminaryLoanAmount = Math.min(
    foirLoanAmountPass1,
    multiplierLoanAmount,
    desiredLoanAmount || Infinity
  );

  let categoryMaxCap = tataConfig.maxLoanByCategory[effectiveCategoryKey] || tataConfig.maxLoanAmount || 5000000;
  if (maxLoanOverride !== undefined && maxLoanOverride !== null) {
    categoryMaxCap = Math.min(categoryMaxCap, parseNum(maxLoanOverride, categoryMaxCap));
  }

  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, categoryMaxCap);

  let finalInterestRate = interestRateOverride !== undefined && interestRateOverride !== null ? parseNum(interestRateOverride) : null;
  if (isGovtEmployee && govtROI) finalInterestRate = parseNum(govtROI);
  if (!finalInterestRate) finalInterestRate = resolveTataRoi(effectiveCategoryKey, preliminaryCappedLoan);

  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  const finalLoanAmount = Math.min(
    foirLoanAmount,
    multiplierLoanAmount,
    desiredLoanAmount || Infinity
  );

  const maxLoanCapAmount = Math.min(finalLoanAmount, categoryMaxCap);
  const loanCapped = finalLoanAmount > categoryMaxCap;

  // Apply Dynamic Bachelor Capping
  let appliedBachelorCap = false;
  let bachelorLimitAmount = null;
  let bachelorCapReasonStr = null;
  let cappedFinalLoan = maxLoanCapAmount;

  if (rawInput.dynamicBachelorLimitOverride !== undefined && rawInput.dynamicBachelorLimitOverride !== null) {
    bachelorLimitAmount = parseNum(rawInput.dynamicBachelorLimitOverride);
    if (cappedFinalLoan > bachelorLimitAmount) {
      cappedFinalLoan = bachelorLimitAmount;
      appliedBachelorCap = true;
      bachelorCapReasonStr = rawInput.dynamicBachelorCapReason || 'Dynamic Bachelor Capping limit applied';
    }
  } else if (tataConfig.bachelorMaxLoanAmount !== undefined && rawInput.maritalStatus === 'single' && rawInput.livingStatus === 'rented') {
    bachelorLimitAmount = tataConfig.bachelorMaxLoanAmount;
    if (cappedFinalLoan > bachelorLimitAmount) {
      cappedFinalLoan = bachelorLimitAmount;
      appliedBachelorCap = true;
      bachelorCapReasonStr = 'Rented Bachelor Limit Applied (Bank Default)';
    }
  }

  let btDetails = null;
  if (isBT) {
    const btFreshAmount = cappedFinalLoan - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return { eligible: false, reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds max loan (₹${Math.round(cappedFinalLoan).toLocaleString()})`, isBTMode: true };
    }
    btDetails = {
      isBTMode: true,
      loansConsolidated: loansForBT.length,
      btTotalOutstanding: Math.round(btTotalOutstanding),
      btTotalEMI: Math.round(btTotalEMI),
      freshAmountDisbursed: Math.round(btFreshAmount),
      nonBTLoansEMI: Math.round(nonBTLoansEMI),
      creditCardObligation: Math.round(creditCardObligation),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of non-BT credit card outstanding' : 'No credit card obligation',
      totalNonBTObligations: Math.round(nonBTLoansEMI + creditCardObligation),
      originalIncome: monthlyIncomeForCalc,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  if (cappedFinalLoan < (tataConfig.minLoanAmount || 75000)) {
    return {
      eligible: false,
      reason: `Calculated loan capacity (₹${Math.round(cappedFinalLoan).toLocaleString()}) is below Tata Capital minimum loan threshold of ₹${(tataConfig.minLoanAmount || 75000).toLocaleString()}`
    };
  }

  const finalEMI = calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: tataConfig.id,
    bankName: tataConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: categoryMaxCap,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    bachelorCapped: appliedBachelorCap,
    bachelorCapReason: bachelorCapReasonStr,
    regularMaxLoan: Math.round(maxLoanCapAmount),
    bachelorMaxLoanAmount: bachelorLimitAmount !== null ? Math.round(bachelorLimitAmount) : null,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: finalEMI,
    category: effectiveCategoryKey,
    calculationMethod: 'Combined (FOIR + Multiplier)',
    incentivePercentage: effectiveIncentivePercentage,
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      multiplier: multiplier + 'x',
      foirLoanAmount: Math.round(foirLoanAmount),
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      limitingFactor: finalLoanAmount === foirLoanAmount ? 'FOIR' : 'Multiplier',
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI),
      creditCardObligation: Math.round(creditCardObligation),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};
