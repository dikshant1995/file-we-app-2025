import { tataConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' ? 'A' : category;
  return getSlabRate('Tata Capital', lookupCategory, loanAmount, location, tataConfig.interestRate);
};

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
// Using client's reverse calculator: Factor = 52.5375
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

// Helper: Get salary band
const getSalaryBand = (salary, table) => {
  for (const band of Object.keys(table)) {
    if (band.includes('-')) {
      const [min, max] = band.split('-').map(v => parseInt(v));
      if (salary >= min && salary <= max) return band;
    } else if (band.includes('+')) {
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) return band;
    }
  }
  return Object.keys(table)[Object.keys(table).length - 1];
};

// Tata Capital specific eligibility calculation
// Method: Combined (Multiplier + FOIR)
// FOIR: Salary-based (no category), Multiplier: Category + Salary based
export const calculateTataEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
    category = 'A',
    creditScore,
    employmentType = 'salaried',
    age,
    existingLoanBanks,
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
    govtMultiplier,
    govtMaxTenure,
    // Balance Transfer fields
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding,
    // Incentive Overrides
    incentivePercentageOverride,
    incentiveMonthsOverride
  } = userData;

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : (tataConfig.incentivePercentage || 0);

  const effectiveIncentiveMonths = incentiveMonthsOverride !== undefined 
    ? incentiveMonthsOverride 
    : 3; // Default to 3 months if not specified

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const actualMonthlyIncome = (basicSalary || 0) + bankIncentiveConsidered;
  
  // Use actualMonthlyIncome for all subsequent calculations
  const monthlyIncomeForCalc = actualMonthlyIncome;

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

  // CHECK: If customer already has a personal loan from Tata Capital
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const tataBankNames = ['tata', 'tata capital'];
    const hasExistingTataLoan = existingLoanBanks.some(bank =>
      tataBankNames.some(name => bank.includes(name))
    );

    if (hasExistingTataLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Tata Capital with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility (Excel Section 1: 58 in pvt and 60 in govt)
  const normCategory = String(category || 'A').toUpperCase().trim();
  const isSuperA = normCategory.includes('SUPER');
  const isGovt = isGovtEmployee || normCategory === 'GOVT';
  const effectiveCategoryKey = isSuperA ? 'SUPER-A' : (isGovt ? 'GOVT' : (normCategory === 'A' ? 'A' : (normCategory === 'B' ? 'B' : (normCategory === 'C' ? 'C' : (normCategory === 'D' ? 'D' : 'UNLISTED')))));

  const maxAllowedAge = isGovt ? tataConfig.maxAgeGovt : tataConfig.maxAgePvt;
  if (age && (age < tataConfig.minAge || age > maxAllowedAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${tataConfig.minAge} and ${maxAllowedAge} years for Tata Capital (${isGovt ? 'Government' : 'Private'}). Current age: ${age}`
    };
  }

  // Work stability check (Excel Section 1: Min 12 Months stability)
  const currentExp = Number(userData.currentCompanyExperience || userData.workExperience || 0);
  const totalExp = Number(userData.totalWorkExperience || currentExp);
  const cibil = Number(creditScore || userData.cibilScore || 700);
  const hasStabilityWaiver = (age >= 26) && (cibil > 750) && (monthlyIncomeForCalc > 50000);

  if (!hasStabilityWaiver && currentExp > 0 && currentExp < (tataConfig.minWorkExperienceMonths || 12)) {
    return {
      eligible: false,
      reason: `Tata Capital requires minimum 12 months current employment stability (Excel: Current employment Stability Minimum 12 months). Current: ${currentExp} months.`
    };
  }

  // 1. Check employment type
  if (!tataConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported`
    };
  }

  // Check minimum requested loan amount (Excel: MINIMUM LOAN AMOUNT: 75K)
  if (desiredLoanAmount && desiredLoanAmount < (tataConfig.minLoanAmount || 75000)) {
    return {
      eligible: false,
      reason: `Requested loan amount (₹${desiredLoanAmount.toLocaleString()}) is below Tata Capital minimum loan limit of ₹${(tataConfig.minLoanAmount || 75000).toLocaleString()}`
    };
  }

  // 2. Apply tenure capping based on category (Excel Section 4: Min 24 Months)
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure 
    ? govtMaxTenure 
    : (tataConfig.maxTenureByCategory[effectiveCategoryKey] || 60);

  if (effectiveCategoryKey === 'B' && monthlyIncomeForCalc > 75000) {
    maxTenureForCategory = 84; // CAT B Income > 75,000: 84 months
  }

  const requestedTenureMonths = Math.max(24, (loanTenure || 5) * 12); // Min 24 Months
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

  // Check if applicant has secured loan (HL / LAP)
  const hasSecuredLoan = (userData.existingLoanTypes && (
    userData.existingLoanTypes.includes('Home Loan') ||
    userData.existingLoanTypes.includes('Loan Against Property') ||
    userData.existingLoanTypes.includes('HL') ||
    userData.existingLoanTypes.includes('LAP')
  )) || (Array.isArray(loansForBT) && loansForBT.some(l => l.type === 'Home Loan' || l.type === 'LAP'));

  // FOIR Band (Excel Section 3 Rows 56-60)
  // Max FOIR: <=25k: 50%, 25k-50k: 60%, 50k-75k: 65%, >75k: 75%
  // Max Unsecured FOIR: <=25k: 40%, 25k-50k: 50%, 50k-75k: 55%, >75k: 65%
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

  if (govtFOIR && isGovtEmployee) foirPercentage = govtFOIR / 100;


  // Multiplier by category and salary slab (Excel Section 3 Rows 24-31)
  let multiplier = 20;
  if (isGovtEmployee && govtMultiplier) {
    multiplier = govtMultiplier;
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
      // D / UNLISTED
      multiplier = isAbove75k ? 15 : (is50kTo75k ? 15 : 9);
    }
  }

  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Total obligations (₹${totalObligations.toLocaleString()}) exceed FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // ROI lookup helper by category and loan amount (Excel Section 2 Rows 15-20)
  const resolveTataRoi = (catKey, amt) => {
    if (catKey === 'SUPER-A' || catKey === 'SUPER A' || catKey === 'A' || catKey === 'GOVT') {
      return amt >= 5000000 ? 10.99 : (amt > 2000000 ? 12.00 : 14.00);
    } else if (catKey === 'B') {
      return amt >= 4000000 ? 10.99 : (amt > 2000000 ? 12.00 : 14.00);
    } else if (catKey === 'C') {
      return amt >= 3000000 ? 12.00 : (amt > 2000000 ? 13.00 : 15.00);
    } else {
      // D / UNLISTED
      return amt > 2000000 ? 13.50 : 16.00;
    }
  };

  // Pass 1: Base rate calculation
  let baseRate = interestRateOverride || (isGovtEmployee && govtROI ? govtROI : resolveTataRoi(effectiveCategoryKey, desiredLoanAmount || 1000000));
  const foirLoanAmountPass1 = calculatePrincipalFromEMI(availableEMI, baseRate, cappedTenureYears);

  // Multiplier-based loan
  const availableSalary = isBT ? incomeToCheck : (monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = Math.max(0, availableSalary * multiplier);

  // Preliminary loan = minimum of FOIR and Multiplier
  const preliminaryLoanAmount = Math.min(
    foirLoanAmountPass1,
    multiplierLoanAmount,
    desiredLoanAmount || Infinity
  );

  const categoryMaxCap = tataConfig.maxLoanByCategory[effectiveCategoryKey] || tataConfig.maxLoanAmount;
  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, categoryMaxCap);

  // Pass 2: Final interest rate from resolved loan amount
  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = resolveTataRoi(effectiveCategoryKey, preliminaryCappedLoan);

  // Recalculate FOIR loan with final rate
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

  if (userData.dynamicBachelorLimitOverride !== undefined) {
    bachelorLimitAmount = userData.dynamicBachelorLimitOverride;
    if (cappedFinalLoan > bachelorLimitAmount) {
      cappedFinalLoan = bachelorLimitAmount;
      appliedBachelorCap = true;
      bachelorCapReasonStr = userData.dynamicBachelorCapReason || 'Dynamic Bachelor Capping limit applied';
    }
  } else if (tataConfig.bachelorMaxLoanAmount !== undefined && userData.maritalStatus === 'single' && userData.livingStatus === 'rented') {
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
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of non-BT credit card outstanding' : 'No credit card obligation (either no CC or CC in BT)',
      totalNonBTObligations: Math.round(nonBTLoansEMI + (creditCardObligation || 0)),
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
    category: category,
    calculationMethod: 'Combined (FOIR + Multiplier)',
    incentivePercentage: effectiveIncentivePercentage, // Dynamically reflect override
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      multiplier: multiplier + 'x',
      foirLoanAmount: Math.round(foirLoanAmount),
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      limitingFactor: finalLoanAmount === foirLoanAmount ? 'FOIR' : 'Multiplier',
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};
