import { bandhanConfig } from './config.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper function to get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' ? 'A' : category;
  return getSlabRate('Bandhan Bank', lookupCategory, loanAmount, location, bandhanConfig.interestRate);
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

// Function to calculate loan amount from EMI
// Using client's reverse calculator: Factor = 52.5375
const calculateLoanAmountFromEMI = (emi, annualInterestRate, tenureInYears) => {
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

  const loanAmount = emi * (adjustedPowerTerm - 1) / (r * adjustedPowerTerm);
  return Math.round(loanAmount);
};

// Function to determine company category
const getCompanyCategory = (companyName, employmentType) => {
  // Government employees are always classified as GOVT category
  if (employmentType === 'government') {
    return 'GOVT';
  }

  // For this implementation, we'll use a simplified approach
  // In a real application, this would be based on an actual company database
  const company = companyName.toLowerCase();

  // Example categorization - in reality this would come from a database
  if (company.includes('google') || company.includes('microsoft') || company.includes('amazon')) {
    return 'A';
  } else if (company.includes('tcs') || company.includes('infosys') || company.includes('wipro')) {
    return 'A';
  } else if (company.includes('hcl') || company.includes('tech mahindra')) {
    return 'B';
  } else if (company.includes('local') || company.includes('regional')) {
    return 'C';
  } else if (company.includes('startup') || company.includes('small')) {
    return 'D';
  }

  // Return UNLISTED for companies not in the database
  return 'UNLISTED';
};

// Function to get FOIR percentage based on salary
const getFoirPercentage = (salary) => {
  if (salary >= 75000) return bandhanConfig.foirTable['>=75000'];
  if (salary < 75000) return bandhanConfig.foirTable['<75000'];
  return null;
};

// Bandhan Bank specific eligibility calculation (FOIR only)
export const calculateBandhanEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary, // NEW
    averageIncentive, // NEW
    monthlyIncome,
    existingEMI,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
    companyName,
    creditScore,
    employmentType,
    interestRate,
    age,
    category,
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
    : (bandhanConfig.incentivePercentage || 0);

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
    nonBTLoansEMI = (existingEMI || 0) - btTotalEMI;
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from Bandhan Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const bandhanBankNames = ['bandhan', 'bandhan bank'];
    const hasExistingBandhanLoan = existingLoanBanks.some(bank =>
      bandhanBankNames.some(name => bank.includes(name))
    );

    if (hasExistingBandhanLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Bandhan Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility
  if (age && (age < bandhanConfig.minAge || age > bandhanConfig.maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${bandhanConfig.minAge} and ${bandhanConfig.maxAge} years. Current age: ${age}`
    };
  }

  // Pass 1: Preliminary ROI for initial calculation
  const baseRate = bandhanConfig.interestRate;

  // Check employment type
  if (!bandhanConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }

  // Use user-provided category (from frontend: B, C, or GOVT)
  const companyCategory = category || 'B'; // Default to B if not provided

  // Apply tenure capping based on category (tenure is in months)
  // Logic Bridge: Support govtMaxTenure override
  let lookupCategory = companyCategory === 'Govt' ? 'A' : companyCategory;
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : bandhanConfig.maxTenureByCategory[lookupCategory];

  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `Bandhan Bank does not provide loans to ${companyCategory} companies`
    };
  }

  // ALWAYS USE MAXIMUM TENURE FOR THE CATEGORY (ignore user's requested tenure)
  // This shows the maximum loan amount the bank can offer for this category
  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Store user's request for display purposes
  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check minimum salary requirement based on category
  let lookupCategorySalary = companyCategory === 'Govt' ? 'A' : companyCategory;
  const categoryMinSalary = bandhanConfig.minSalary[lookupCategorySalary];

  if (categoryMinSalary === null) {
    return { eligible: false, reason: `Bandhan Bank does not provide loans to UNLISTED companies` };
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < categoryMinSalary) {
    return { eligible: false, reason: `Minimum monthly income required for ${companyCategory} category is ₹${categoryMinSalary.toLocaleString()}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  // Calculate using FOIR method
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;

  // Logic Bridge: Support govtFOIR override
  let foirPercentage = isGovtEmployee && govtFOIR ? (govtFOIR / 100) : getFoirPercentage(incomeForCalculation);

  if (!foirPercentage) {
    return { eligible: false, reason: 'Unable to determine FOIR percentage for the provided salary', isBTMode: isBT };
  }

  const foirCap = monthlyIncomeForCalc * foirPercentage;
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  // User Logic: (Salary * FOIR%) - Non-BT EMI = Available EMI
  const availableEMI = isBT ? (foirCap - nonBTLoansEMI) : (foirCap - totalObligations);

  // 1. FOIR Path: Calculate preliminary loan based on available EMI
  const preliminaryFoirLoanAmount = calculateLoanAmountFromEMI(availableEMI, baseRate, cappedTenureYears);

  // Preliminary Decision: Take the MINIMUM of FOIR and desired loan
  const preliminaryMaxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    preliminaryFoirLoanAmount
  );

  // Apply bank's maximum loan cap for pass 1
  const preliminaryLoanAmount = Math.min(preliminaryMaxLoanAmount, bandhanConfig.maxLoanAmount);

  // Pass 2: Get final ROI based on preliminary loan amount
  let finalInterestRate = interestRateOverride || interestRate;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = getInterestRateForLoan(companyCategory, preliminaryLoanAmount, userData.city || userData.state);

  const effectiveInterestRate = finalInterestRate;

  // Recalculate FOIR loan amount based on available EMI using the final interest rate
  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);

  // Final loan amount = minimum of final FOIR loan and desired
  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    foirLoanAmount
  );

  // Apply bank's maximum loan cap
  const maxLoanCapAmount = Math.min(maxLoanAmount, bandhanConfig.maxLoanAmount);
  const loanCapped = maxLoanAmount > bandhanConfig.maxLoanAmount;

  // Apply Dynamic Bachelor Capping
  let appliedBachelorCap = false;
  let bachelorLimitAmount = null;
  let bachelorCapReasonStr = null;
  let finalLoanAmount = maxLoanCapAmount;

  if (userData.dynamicBachelorLimitOverride !== undefined) {
    bachelorLimitAmount = userData.dynamicBachelorLimitOverride;
    if (finalLoanAmount > bachelorLimitAmount) {
      finalLoanAmount = bachelorLimitAmount;
      appliedBachelorCap = true;
      bachelorCapReasonStr = userData.dynamicBachelorCapReason || 'Dynamic Bachelor Capping limit applied';
    }
  } else if (bandhanConfig.bachelorMaxLoanAmount !== undefined && userData.maritalStatus === 'single' && userData.livingStatus === 'rented') {
    bachelorLimitAmount = bandhanConfig.bachelorMaxLoanAmount;
    if (finalLoanAmount > bachelorLimitAmount) {
      finalLoanAmount = bachelorLimitAmount;
      appliedBachelorCap = true;
      bachelorCapReasonStr = 'Rented Bachelor Limit Applied (Bank Default)';
    }
  }

  let btDetails = null;
  if (isBT) {
    const btFreshAmount = finalLoanAmount - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return { eligible: false, reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds max loan (₹${Math.round(finalLoanAmount).toLocaleString()})`, isBTMode: true };
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

  const monthlyEMI = calculateEMI(finalLoanAmount, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: bandhanConfig.id,
    bankName: bandhanConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: bandhanConfig.maxLoanAmount,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(maxLoanAmount) : null,
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
    companyCategory: companyCategory,
    calculationMethod: 'FOIR Only',
    incentivePercentage: effectiveIncentivePercentage, // Dynamically reflect override
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      foirLoanAmount: Math.round(foirLoanAmount),
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
