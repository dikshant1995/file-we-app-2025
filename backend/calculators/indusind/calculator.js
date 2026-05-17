import { indusindConfig } from './config.js';
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

// IndusInd Bank specific eligibility calculation (Multiplier-Only System)
export const calculateIndusindEligibility = (userData) => {
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
    : (indusindConfig.incentivePercentage || 0);

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

  // CHECK: If customer already has a personal loan from IndusInd Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const indusindNames = ['indusind', 'indusind bank'];
    const hasExistingIndusindLoan = existingLoanBanks.some(bank =>
      indusindNames.some(name => bank.includes(name))
    );

    if (hasExistingIndusindLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of IndusInd Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('IndusInd Bank', 'ageRules');
  const minAge = ageConfig ? ageConfig.minAge : indusindConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : indusindConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!indusindConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by IndusInd Bank`
    };
  }

  // Apply tenure capping based on category (tenure is in months)
  // Logic Bridge: Support govtMaxTenure override
  let lookupCategory = category === 'Govt' ? 'A' : category;
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : indusindConfig.maxTenureByCategory[lookupCategory];

  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${category}`
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
  if (loanTenure > indusindConfig.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${indusindConfig.maxLoanTenure} years`
    };
  }

  const minSalaryRequired = indusindConfig.minSalaryByCategory[category];
  if (!minSalaryRequired) {
    return { eligible: false, reason: `Category ${category} not supported by IndusInd Bank`, isBTMode: isBT };
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < minSalaryRequired) {
    return { eligible: false, reason: `Minimum salary of ₹${minSalaryRequired.toLocaleString()} required for category ${category}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;
  const foirLookupCategory = category === 'Govt' ? 'GOVT' : category;
  const multiplierLookupCategory = category === 'Govt' ? 'A' : category;

  const multiplierSalaryBand = getSalaryBand(incomeForCalculation, multiplierLookupCategory, indusindConfig.multiplierTable);
  const foirSalaryBand = getSalaryBand(incomeForCalculation, foirLookupCategory, indusindConfig.foirTable);

  if (!multiplierSalaryBand && !govtMultiplier) {
    return { eligible: false, reason: `Salary does not fall within any eligible multiplier band for category ${category}`, isBTMode: isBT };
  }
  if (!foirSalaryBand && !govtFOIR) {
    return { eligible: false, reason: `Salary does not fall within any eligible FOIR band for category ${category}`, isBTMode: isBT };
  }

  // Logic Bridge: Support overrides
  let multiplier = (isGovtEmployee && govtMultiplier) ? govtMultiplier : (indusindConfig.multiplierTable[multiplierLookupCategory]?.[multiplierSalaryBand]);
  let foirPercentage = (isGovtEmployee && govtFOIR) ? (govtFOIR / 100) : (indusindConfig.foirTable[foirLookupCategory]?.[foirSalaryBand]);

  if (!multiplier) {
    return { eligible: false, reason: `No multiplier available for category ${category} at salary ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
  }
  if (!foirPercentage) {
    return { eligible: false, reason: `No FOIR percentage available for category ${category} at salary ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
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
  const baseRate = indusindConfig.interestRate;
  const preliminaryFoirLoanAmount = calculatePrincipalFromEMI(availableEMI, baseRate, cappedTenureYears);

  // Take the minimum for first pass
  const preliminaryLoanAmount = Math.min(
    multiplierLoanAmount,
    preliminaryFoirLoanAmount,
    desiredLoanAmount || Infinity
  );

  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, indusindConfig.maxLoanAmount);

  // ROI Calculation using Logic Bridge and Slabs
  let effectiveInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) {
    effectiveInterestRate = govtROI;
  } else if (!effectiveInterestRate) {
    // Check dynamic slabs in Admin Matrix
    effectiveInterestRate = getSlabRate('IndusInd Bank', multiplierLookupCategory, preliminaryCappedLoan, userData.city || userData.state, indusindConfig.interestRate);
  }

  // Pass 2: Calculate FOIR loan amount with final ROI
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);

  // Final loan amount is minimum of FOIR, Multiplier, and desired
  const finalLoanAmount = Math.min(
    multiplierLoanAmount,
    foirLoanAmount,
    desiredLoanAmount || Infinity
  );

  const maxLoanCapAmount = Math.min(finalLoanAmount, indusindConfig.maxLoanAmount);
  const loanCapped = finalLoanAmount > indusindConfig.maxLoanAmount;

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
  } else if (indusindConfig.bachelorMaxLoanAmount !== undefined && userData.maritalStatus === 'single' && userData.livingStatus === 'rented') {
    bachelorLimitAmount = indusindConfig.bachelorMaxLoanAmount;
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

  const monthlyEMI = calculateEMI(cappedFinalLoan, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: indusindConfig.id,
    bankName: indusindConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: indusindConfig.maxLoanAmount,
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
    foirPercentage: foirPercentage,
    incentivePercentage: effectiveIncentivePercentage, // Dynamically reflect override
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    salaryBand: multiplierSalaryBand,
    category: category,
    availableEMI: Math.round(availableEMI),
    foirLoanAmount: Math.round(foirLoanAmount),
    multiplierLoanAmount: Math.round(multiplierLoanAmount),
    calculationMethod: 'Combined (Dual)',
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

