import { axisFinConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Function to calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return principal / numberOfMonths;
  }

  const emi = principal * monthlyInterestRate *
    (Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);

  return Math.round(emi);
};

// Helper function to safely parse numeric input
const parseNum = (val, fallback = 0) => {
  if (val === null || val === undefined || val === '') return fallback;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
};

// Axis Finance specific eligibility calculation
export const calculateAxisFinEligibility = (userData) => {
  const rawInput = userData || {};

  const desiredLoanAmount = parseNum(rawInput.desiredLoanAmount, null);
  const loanTenure = parseNum(rawInput.loanTenure, 5);
  const basicSalary = parseNum(rawInput.basicSalary || rawInput.monthlyIncome, 0);
  const averageIncentive = parseNum(rawInput.averageIncentive, 0);
  const existingEMI = parseNum(rawInput.existingEMI, 0);
  const creditCardObligation = parseNum(rawInput.creditCardObligation, 0);
  const goldLoanOutstanding = parseNum(rawInput.goldLoanOutstanding, 0);
  const goldLoanObligation = rawInput.goldLoanObligation !== undefined ? parseNum(rawInput.goldLoanObligation, 0) : undefined;
  const kccOutstanding = parseNum(rawInput.kccOutstanding, 0);
  const kccObligation = rawInput.kccObligation !== undefined ? parseNum(rawInput.kccObligation, 0) : undefined;
  const category = rawInput.category || 'C';
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

  // ========== GOLD LOAN & KCC OBLIGATION CALCULATION ==========
  const effectiveGoldLoanObligation = goldLoanObligation !== undefined 
    ? goldLoanObligation 
    : Math.round((goldLoanOutstanding || 0) * ((axisFinConfig.goldLoanObligationPercent || 1) / 100));

  const kccExemptionLimit = axisFinConfig.kccExemptionLimit || 1500000;
  const kccTaxableAmount = Math.max(0, (kccOutstanding || 0) - kccExemptionLimit);
  const effectiveKccObligation = kccObligation !== undefined 
    ? kccObligation 
    : Math.round(kccTaxableAmount * 0.05);

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : (axisFinConfig.incentivePercentage || 0);

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

  // CHECK: Existing loan from Axis Finance
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const axisNames = ['axis', 'axis finance', 'axis bank'];
    const hasExistingAxisLoan = existingLoanBanks.some(bank =>
      axisNames.some(name => String(bank).toLowerCase().includes(name))
    );

    if (hasExistingAxisLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Axis Finance with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility
  if (age !== null && age > 0 && (age < axisFinConfig.minAge || age > axisFinConfig.maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${axisFinConfig.minAge} and ${axisFinConfig.maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  const supportedEmpTypes = (axisFinConfig.employmentTypes || ['salaried', 'private', 'government']).map(t => t.toLowerCase());
  if (!supportedEmpTypes.includes(empTypeNorm) && empTypeNorm !== 'salaried' && empTypeNorm !== 'private' && empTypeNorm !== 'government') {
    return {
      eligible: false,
      reason: `Employment type '${rawInput.employmentType}' not supported by Axis Finance`
    };
  }

  // Category normalization & Tenure capping (Excel Section 4)
  const normCategory = String(category || 'C').toUpperCase().trim();
  const isSuperA = normCategory.includes('SUPER');
  const isGovt = isGovtEmployee || normCategory === 'GOVT';
  const effectiveCategoryKey = isSuperA ? 'SUPER-A' : (isGovt ? 'GOVT' : (normCategory === 'A' ? 'A' : (normCategory === 'B' ? 'B' : (normCategory === 'D' ? 'D' : 'C'))));

  let maxTenureForCategory = isGovtEmployee && govtMaxTenure 
    ? govtMaxTenure 
    : (axisFinConfig.maxTenureByCategory[effectiveCategoryKey] || 60);

  if (maxTenureOverride !== undefined && maxTenureOverride !== null) {
    maxTenureForCategory = parseNum(maxTenureOverride, maxTenureForCategory);
  }

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check minimum requested loan amount (Excel: MINIMUM LOAN AMOUNT: 1 LAC)
  if (desiredLoanAmount !== null && desiredLoanAmount < (axisFinConfig.minLoanAmount || 100000)) {
    return {
      eligible: false,
      reason: `Requested loan amount (₹${desiredLoanAmount.toLocaleString()}) is below Axis Finance minimum loan limit of ₹${(axisFinConfig.minLoanAmount || 100000).toLocaleString()}`
    };
  }

  // Minimum salary check: Urban 30k, Rural 25k (default 30k)
  const isRural = rawInput.locationType === 'rural' || rawInput.isRural === true;
  const reqMinSalary = isRural ? (axisFinConfig.minSalaryRural || 25000) : (axisFinConfig.minSalaryUrban || 30000);
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < reqMinSalary) {
    return { 
      eligible: false, 
      reason: `Minimum net monthly salary required for Axis Finance is ₹${reqMinSalary.toLocaleString()} (${isRural ? 'Rural' : 'Urban'}). Applicant: ₹${incomeToCheck.toLocaleString()}`, 
      isBTMode: isBT 
    };
  }

  // Work experience check (Excel Section 1: 6 Months)
  const totalExp = parseNum(rawInput.totalWorkExperience || rawInput.workExperience || rawInput.currentCompanyExperience, 0);
  if (totalExp > 0 && totalExp < axisFinConfig.minWorkExperienceMonths) {
    return {
      eligible: false,
      reason: `Axis Finance requires minimum ${axisFinConfig.minWorkExperienceMonths} months work experience (Excel: MINI WORK EXPRINCE: 6 MONTHS). Current: ${totalExp} months.`
    };
  }

  // FOIR & Multipliers based on Salary Slabs (Excel Section 3)
  let maxFoir = 0.70;
  let multiplier = 24;

  if (effectiveCategoryKey === 'D') {
    multiplier = 0;
    maxFoir = axisFinConfig.foirByCategory ? (axisFinConfig.foirByCategory['D'] || 0.50) : 0.50;
  } else if (incomeToCheck >= 100000) {
    maxFoir = 0.60;
    multiplier = 30;
  } else if (incomeToCheck >= 75000) {
    maxFoir = 0.65;
    multiplier = 28;
  } else if (incomeToCheck >= 50000) {
    maxFoir = 0.70;
    multiplier = 26;
  } else {
    maxFoir = 0.70;
    multiplier = 24;
  }

  // Admin Overrides Priority
  if (foirOverride !== undefined && foirOverride !== null) {
    maxFoir = parseNum(foirOverride, maxFoir);
    if (maxFoir > 1) maxFoir = maxFoir / 100;
  }
  if (multiplierOverride !== undefined && multiplierOverride !== null) {
    multiplier = parseNum(multiplierOverride, multiplier);
  }
  if (isGovtEmployee && govtFOIR) maxFoir = parseNum(govtFOIR, maxFoir);
  if (isGovtEmployee && govtMultiplier) multiplier = parseNum(govtMultiplier, multiplier);

  const calculationMethod = multiplier > 0 ? 'Salary Slab FOIR + Multiplier' : 'FOIR Only (Cat D / Custom)';

  // Determine ROI (Excel Section 2 & BT Note)
  let effectiveInterestRate = interestRateOverride !== undefined && interestRateOverride !== null ? parseNum(interestRateOverride) : null;
  if (isGovtEmployee && govtROI) {
    effectiveInterestRate = parseNum(govtROI);
  } else if (!effectiveInterestRate) {
    if (isBT) {
      effectiveInterestRate = axisFinConfig.btInterestRate || 18.00;
    } else {
      effectiveInterestRate = axisFinConfig.roiByCategory[effectiveCategoryKey] || 15.00;
    }
  }

  // Calculate Loan Amount:
  const totalObligations = existingEMI + creditCardObligation + effectiveGoldLoanObligation + effectiveKccObligation;
  const availableSalary = isBT ? incomeToCheck : (monthlyIncomeForCalc - totalObligations);
  if (availableSalary <= 0) {
    return { eligible: false, reason: `Total obligations (₹${totalObligations.toLocaleString()}) exceed monthly income`, isBTMode: isBT };
  }

  const multLoan = multiplier > 0 ? (availableSalary * multiplier) : Infinity;
  const maxAllowedEmi = (monthlyIncomeForCalc * maxFoir) - totalObligations;
  const r = (effectiveInterestRate / 12) / 100;
  const n = cappedTenureMonths;
  const foirMaxLoan = maxAllowedEmi > 0 ? (maxAllowedEmi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n))) : 0;

  let calculatedLoanAmount = foirMaxLoan;
  if (multiplier > 0) {
    calculatedLoanAmount = foirMaxLoan > 0 ? Math.min(multLoan, foirMaxLoan) : multLoan;
  }

  let categoryMaxCap = axisFinConfig.maxLoanByCategory[effectiveCategoryKey] || axisFinConfig.maxLoanAmount || 5000000;
  if (maxLoanOverride !== undefined && maxLoanOverride !== null) {
    categoryMaxCap = Math.min(categoryMaxCap, parseNum(maxLoanOverride, categoryMaxCap));
  }

  const finalLoanAmount = Math.min(calculatedLoanAmount, desiredLoanAmount || Infinity);
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
      goldLoanObligation: Math.round(effectiveGoldLoanObligation),
      goldLoanObligationNote: effectiveGoldLoanObligation > 0 ? '1% of Gold Loan Outstanding' : 'No Gold Loan obligation',
      kccObligation: Math.round(effectiveKccObligation),
      kccObligationNote: effectiveKccObligation === 0 ? 'KCC Upto 15L = 0 Obligate' : '5% on KCC amount above 15L',
      totalNonBTObligations: Math.round(nonBTLoansEMI + creditCardObligation + effectiveGoldLoanObligation + effectiveKccObligation),
      originalIncome: monthlyIncomeForCalc,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  if (cappedFinalLoan < (axisFinConfig.minLoanAmount || 100000)) {
    return {
      eligible: false,
      reason: `Calculated loan capacity (₹${Math.round(cappedFinalLoan).toLocaleString()}) is below Axis Finance minimum loan threshold of ₹${(axisFinConfig.minLoanAmount || 100000).toLocaleString()}`
    };
  }

  const monthlyEMI = calculateEMI(cappedFinalLoan, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: axisFinConfig.id,
    bankName: axisFinConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: categoryMaxCap,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    bachelorCapped: appliedBachelorCap,
    bachelorCapReason: bachelorCapReasonStr,
    regularMaxLoan: Math.round(maxLoanCapAmount),
    bachelorMaxLoanAmount: bachelorLimitAmount !== null ? Math.round(bachelorLimitAmount) : null,
    interestRate: effectiveInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    multiplier: multiplier,
    foirPercentage: maxFoir,
    salaryBand: incomeToCheck >= 100000 ? '1 LAC ABOVE' : (incomeToCheck >= 75000 ? '75K TO 1 LAC' : (incomeToCheck >= 50000 ? '50K TO 75K' : '< 50K')),
    category: effectiveCategoryKey,
    calculationMethod: calculationMethod,
    incentivePercentage: effectiveIncentivePercentage,
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      multiplier: multiplier > 0 ? (multiplier + 'x') : 'None (FOIR based)',
      foirPercentage: Math.round(maxFoir * 100) + '%',
      salaryBand: incomeToCheck >= 100000 ? '1 LAC ABOVE' : (incomeToCheck >= 75000 ? '75K TO 1 LAC' : (incomeToCheck >= 50000 ? '50K TO 75K' : '< 50K')),
      multiplierLoanAmount: Math.round(calculatedLoanAmount),
      existingEMI: Math.round(existingEMI),
      creditCardObligation: Math.round(creditCardObligation),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      goldLoanObligation: Math.round(effectiveGoldLoanObligation),
      goldLoanObligationNote: effectiveGoldLoanObligation > 0 ? '1% of Gold Loan Outstanding' : 'No Gold Loan obligation',
      kccObligation: Math.round(effectiveKccObligation),
      kccObligationNote: effectiveKccObligation === 0 ? 'KCC Upto 15L = 0 Obligate' : '5% on KCC amount above 15L',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};
