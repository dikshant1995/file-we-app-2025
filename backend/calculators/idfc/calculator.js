import { idfcConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' ? 'A' : category;
  return getSlabRate('IDFC First Bank', lookupCategory, loanAmount, location, idfcConfig.interestRate);
};

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

// Reverse calculation: Calculate principal from available EMI
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return emi * numberOfMonths;
  }

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

// Helper function to get salary band for a specific category
const getSalaryBand = (salary, category, table) => {
  const categoryBands = table[category];
  if (!categoryBands) return null;

  for (const band of Object.keys(categoryBands)) {
    if (band.includes('+')) {
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) return band;
    } else if (band.startsWith('>=')) {
      const min = parseInt(band.replace('>=', ''));
      if (salary >= min) return band;
    } else if (band.startsWith('>')) {
      const min = parseInt(band.replace('>', ''));
      if (salary > min) return band;
    } else if (band.startsWith('<=')) {
      const max = parseInt(band.replace('<=', ''));
      if (salary <= max) return band;
    } else if (band.startsWith('<')) {
      const max = parseInt(band.replace('<', ''));
      if (salary < max) return band;
    } else {
      const parts = band.split('-');
      if (parts.length === 2) {
        const min = parseInt(parts[0]);
        const max = parseInt(parts[1]);
        if (salary >= min && salary <= max) return band;
      }
    }
  }
  return null;
};

// IDFC Bank specific eligibility calculation (Multiplier-Only System)
export const calculateIdfcEligibility = (userData) => {
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
    : (idfcConfig.incentivePercentage || 0);

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

  // CHECK: If customer already has a personal loan from IDFC Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const idfcNames = ['idfc', 'idfc bank', 'idfc first', 'idfc first bank'];
    const hasExistingIdfcLoan = existingLoanBanks.some(bank =>
      idfcNames.some(name => bank.includes(name))
    );

    if (hasExistingIdfcLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of IDFC Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('IDFC First Bank', 'ageRules');
  const minAge = ageConfig ? ageConfig.minAge : idfcConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : idfcConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!idfcConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by IDFC Bank`
    };
  }

  // Map A+ to SUPER-A for consistency. Handle Govt fallback.
  let mappedCategory = category === 'A+' ? 'SUPER-A' : category;
  if (mappedCategory === 'Govt') mappedCategory = 'A';

  // Apply tenure capping based on category (tenure is in months)
  // Logic Bridge: Support govtMaxTenure override
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : idfcConfig.maxTenureByCategory[mappedCategory];

  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${mappedCategory}`
    };
  }

  // ALWAYS USE MAXIMUM TENURE FOR THE CATEGORY (ignore user's requested tenure)
  // This shows the maximum loan amount the bank can offer for this category
  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Store user's request for display purposes
  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check loan tenure
  if (loanTenure > idfcConfig.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${idfcConfig.maxLoanTenure} years`
    };
  }

  // Check if category is supported
  if (category === 'UNLISTED') {
    return {
      eligible: false,
      reason: 'IDFC Bank does not provide loans to UNLISTED category employees'
    };
  }

  if (!idfcConfig.multiplierTable[mappedCategory]) {
    return { eligible: false, reason: `Category ${category} not supported by IDFC Bank`, isBTMode: isBT };
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < idfcConfig.minSalary) {
    return { eligible: false, reason: `Minimum salary of ₹${idfcConfig.minSalary.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;
  
  const multiplierSalaryBand = getSalaryBand(incomeForCalculation, mappedCategory, idfcConfig.multiplierTable);
  const foirSalaryBand = getSalaryBand(incomeForCalculation, mappedCategory, idfcConfig.foirTable);

  if (!multiplierSalaryBand && !govtMultiplier) {
    return { eligible: false, reason: `Salary does not fall within any eligible multiplier band for category ${mappedCategory}`, isBTMode: isBT };
  }
  if (!foirSalaryBand && !govtFOIR) {
    return { eligible: false, reason: `Salary does not fall within any eligible FOIR band for category ${mappedCategory}`, isBTMode: isBT };
  }

  // Logic Bridge: Support overrides
  let multiplier = isGovtEmployee && govtMultiplier ? govtMultiplier : idfcConfig.multiplierTable[mappedCategory][multiplierSalaryBand];
  let foirPercentage = isGovtEmployee && govtFOIR ? (govtFOIR / 100) : idfcConfig.foirTable[mappedCategory][foirSalaryBand];

  if (!multiplier) {
    return { eligible: false, reason: `No multiplier available for category ${mappedCategory} at salary ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
  }
  if (!foirPercentage) {
    return { eligible: false, reason: `No FOIR percentage available for category ${mappedCategory} at salary ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
  }

  // MULTIPLIER PATH
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // FOIR PATH
  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);
  
  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // Pass 1: Preliminary ROI for initial calculation
  const baseRate = idfcConfig.interestRate;
  const preliminaryFoirLoanAmount = calculatePrincipalFromEMI(availableEMI, baseRate, cappedTenureYears);

  // Preliminary loan amount
  const preliminaryLoanAmount = Math.min(
    multiplierLoanAmount,
    preliminaryFoirLoanAmount,
    desiredLoanAmount || Infinity
  );

  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, idfcConfig.maxLoanAmount);

  // Get correct rate based on preliminary loan amount
  // Logic Bridge: Support ROI overrides
  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = getInterestRateForLoan(mappedCategory, preliminaryCappedLoan, userData.city || userData.state);

  // Pass 2: Calculate FOIR loan amount with final ROI
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  // Final loan amount is minimum of calculated and desired
  const finalLoanAmount = Math.min(
    multiplierLoanAmount,
    foirLoanAmount,
    desiredLoanAmount || Infinity
  );

  const maxLoanCapAmount = Math.min(finalLoanAmount, idfcConfig.maxLoanAmount);
  const loanCapped = finalLoanAmount > idfcConfig.maxLoanAmount;

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
  } else if (idfcConfig.bachelorMaxLoanAmount !== undefined && userData.maritalStatus === 'single' && userData.livingStatus === 'rented') {
    bachelorLimitAmount = idfcConfig.bachelorMaxLoanAmount;
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

  const monthlyEMI = calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: idfcConfig.id,
    bankName: idfcConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: idfcConfig.maxLoanAmount,
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
    monthlyEMI: Math.round(monthlyEMI),
    multiplier: multiplier,
    foirPercentage: foirPercentage,
    salaryBand: multiplierSalaryBand,
    category: mappedCategory,
    availableEMI: Math.round(availableEMI),
    foirLoanAmount: Math.round(foirLoanAmount),
    multiplierLoanAmount: Math.round(multiplierLoanAmount),
    calculationMethod: 'Combined (Dual)',
    incentivePercentage: effectiveIncentivePercentage, // Dynamically reflect override
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      multiplier: multiplier + 'x',
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      salaryBand: multiplierSalaryBand,
      foirBand: foirSalaryBand,
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      foirLoanAmount: Math.round(foirLoanAmount),
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      limitingFactor: finalLoanAmount === foirLoanAmount ? 'FOIR' : 'Multiplier',
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};

