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

// Helper function to get salary band
const getSalaryBand = (salary, table) => {
  for (const band of Object.keys(table)) {
    if (band.includes('+')) {
      // Handle "75001+" format
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) {
        return band;
      }
    } else {
      // Handle "25000-50000" format
      const [min, max] = band.split('-').map(s => parseInt(s));
      if (salary >= min && salary <= max) {
        return band;
      }
    }
  }
  return null;
};

// Axis Finance specific eligibility calculation (Multiplier-Only System)
export const calculateAxisFinEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
    category = 'C',
    creditScore,
    employmentType,
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
    : (axisFinConfig.incentivePercentage || 0);

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
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from Axis Finance
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const axisNames = ['axis', 'axis finance', 'axis bank'];
    const hasExistingAxisLoan = existingLoanBanks.some(bank =>
      axisNames.some(name => bank.includes(name))
    );

    if (hasExistingAxisLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Axis Finance with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility
  if (age && (age < axisFinConfig.minAge || age > axisFinConfig.maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${axisFinConfig.minAge} and ${axisFinConfig.maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!axisFinConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by Axis Finance`
    };
  }

  // 2. Apply tenure capping based on category (Excel Section 4)
  const normCategory = String(category || 'C').toUpperCase().trim();
  const isSuperA = normCategory.includes('SUPER');
  const isGovt = isGovtEmployee || normCategory === 'GOVT';
  const effectiveCategoryKey = isSuperA ? 'SUPER-A' : (isGovt ? 'GOVT' : (normCategory === 'A' ? 'A' : (normCategory === 'B' ? 'B' : (normCategory === 'D' ? 'D' : 'C'))));

  let maxTenureForCategory = isGovtEmployee && govtMaxTenure 
    ? govtMaxTenure 
    : (axisFinConfig.maxTenureByCategory[effectiveCategoryKey] || 60);

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  const requestedTenureMonths = (loanTenure || 5) * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check minimum requested loan amount (Excel: MINIMUM LOAN AMOUNT: 1 LAC)
  if (desiredLoanAmount && desiredLoanAmount < (axisFinConfig.minLoanAmount || 100000)) {
    return {
      eligible: false,
      reason: `Requested loan amount (₹${desiredLoanAmount.toLocaleString()}) is below Axis Finance minimum loan limit of ₹${(axisFinConfig.minLoanAmount || 100000).toLocaleString()}`
    };
  }

  // Minimum salary check: ₹30,000 required across all locations
  const reqMinSalary = 30000;
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < reqMinSalary) {
    return { 
      eligible: false, 
      reason: `Minimum net monthly salary required for Axis Finance is ₹${reqMinSalary.toLocaleString()} (Applicant: ₹${incomeToCheck.toLocaleString()})`, 
      isBTMode: isBT 
    };
  }

  // Work experience check (Excel Section 1: 6 Months)
  const totalExp = Number(userData.totalWorkExperience || userData.workExperience || userData.currentCompanyExperience || 0);
  if (totalExp > 0 && totalExp < axisFinConfig.minWorkExperienceMonths) {
    return {
      eligible: false,
      reason: `Axis Finance requires minimum ${axisFinConfig.minWorkExperienceMonths} months work experience (Excel: MINI WORK EXPRINCE: 6 MONTHS). Current: ${totalExp} months.`
    };
  }

  // Both FOIR and Multiplier depend strictly on Salary Slabs:
  // < 50k: FOIR 70%, Multiplier 24x
  // 50k - 75k: FOIR 70%, Multiplier 26x
  // 75k - 100k (75k above): FOIR 65%, Multiplier 28x
  // >= 100k (1 Lac above): FOIR 60%, Multiplier 30x
  let maxFoir = 0.70;
  let multiplier = 24;

  if (incomeToCheck >= 100000) {
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

  const calculationMethod = 'Salary Slab FOIR + Multiplier';

  // Determine ROI (Excel Section 2 & BT Note)
  let effectiveInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) {
    effectiveInterestRate = govtROI;
  } else if (!effectiveInterestRate) {
    if (isBT) {
      effectiveInterestRate = axisFinConfig.btInterestRate || 18.00; // 18% for BT
    } else {
      effectiveInterestRate = axisFinConfig.roiByCategory[effectiveCategoryKey] || 15.00;
    }
  }

  // Calculate Loan Amount:
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeToCheck : (monthlyIncomeForCalc - totalObligations);
  if (availableSalary <= 0) {
    return { eligible: false, reason: `Total obligations (₹${totalObligations.toLocaleString()}) exceed monthly income`, isBTMode: isBT };
  }

  const multLoan = availableSalary * multiplier;
  const maxAllowedEmi = (monthlyIncomeForCalc * maxFoir) - totalObligations;
  const r = (effectiveInterestRate / 12) / 100;
  const n = cappedTenureMonths;
  const foirMaxLoan = maxAllowedEmi > 0 ? (maxAllowedEmi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n))) : 0;
  const calculatedLoanAmount = foirMaxLoan > 0 ? Math.min(multLoan, foirMaxLoan) : multLoan;

  const categoryMaxCap = axisFinConfig.maxLoanByCategory[effectiveCategoryKey] || axisFinConfig.maxLoanAmount;
  const finalLoanAmount = Math.min(calculatedLoanAmount, desiredLoanAmount || Infinity);
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
      creditCardObligationNote: creditCardObligation > 0 ? '5% of non-BT credit card outstanding' : 'No credit card obligation',
      totalNonBTObligations: Math.round(nonBTLoansEMI + (creditCardObligation || 0)),
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
    salaryBand: incomeToCheck >= 100000 ? '1 LAC ABOVE' : (incomeToCheck >= 75000 ? '75K TO 1 LAC' : (incomeToCheck >= 50000 ? '50K TO 75K' : '< 50K')),
    category: effectiveCategoryKey,
    calculationMethod: calculationMethod,
    incentivePercentage: effectiveIncentivePercentage, // Dynamically reflect override
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      multiplier: multiplier > 0 ? (multiplier + 'x') : 'None (FOIR based)',
      salaryBand: incomeToCheck >= 100000 ? '1 LAC ABOVE' : (incomeToCheck >= 75000 ? '75K TO 1 LAC' : (incomeToCheck >= 50000 ? '50K TO 75K' : '< 50K')),
      multiplierLoanAmount: Math.round(calculatedLoanAmount),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};

