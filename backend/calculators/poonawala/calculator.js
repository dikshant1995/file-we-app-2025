import { poonawalaConfig } from './config.js';
import { getBankConfig, getDynamicInterestRate } from '../../utils/configHelper.js';

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, userData = {}) => {
  return getDynamicInterestRate('Poonawala Finance', category, loanAmount, { state: userData.state, city: userData.city }, poonawalaConfig.interestRate);
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

// Helper function to determine customer segment based on category
const getCustomerSegment = (category) => {
  const segmentMapping = {
    'SUPER-A': 'SUP-A',
    'A': 'SUP-A',
    'B': 'A',
    'C': 'B',
    'D': 'C',
    'GOVT': 'GOVT',
    'UNLISTED': 'E'
  };
  return segmentMapping[category] || 'E';
};

// Helper function to find NTH band in FOIR matrix
const getNTHBandFOIR = (segment, nth) => {
  const segmentData = poonawalaConfig.foirMatrix[segment];
  if (!segmentData) return null;

  // Check each NTH band in the segment
  for (const [bandName, bandData] of Object.entries(segmentData)) {
    if (bandData.foir === null) continue; // Skip NA bands

    if (bandData.maxNTH === null && nth >= bandData.minNTH) {
      return bandData.foir;
    }
    if (nth >= bandData.minNTH && nth < bandData.maxNTH) {
      return bandData.foir;
    }
  }
  return null;
};

// Reverse calculation: Calculate principal from available EMI
// Using client's reverse calculator: Factor = 52.5375
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

// New helper function for calculating loan amount from EMI (standard formula)
const calculateLoanAmountFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return emi * numberOfMonths;
  }

  const r = monthlyInterestRate;
  const n = numberOfMonths;
  const principal = emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  return Math.round(principal);
};

// Poonawala Finance specific eligibility calculation
export const calculatePoonawalaEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI,
    creditCardObligation,
    companyName,
    employmentType,
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
    govtMultiplier,
    govtMaxTenure,
    // User fields
    age,
    category,
    existingLoanBanks,
    // Balance Transfer fields
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding
  } = userData;

  // ========== CATEGORY STANDARDIZATION ==========
  // Determine lookup category - handle both standard and GOVT cases
  let companyCategory = category || 'B';
  if (employmentType === 'government') {
    companyCategory = 'GOVT';
  } else if (companyCategory === 'Govt' || companyCategory === 'government') {
    companyCategory = 'GOVT';
  }

  // Use standardized GOVT for table lookups
  const lookupCategory = companyCategory;
  // ========== END CATEGORY STANDARDIZATION ==========

  // ========== BALANCE TRANSFER MODE DETECTION ==========
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncome;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = (existingEMI || 0) - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return {
        isEligible: false,
        reason: `After deducting non-BT obligations (₹${((existingEMI || 0) + (creditCardObligation || 0))?.toLocaleString() || '0'}), no income remains for Balance Transfer`,
        isBTMode: true
      };
    }
  }
  // ========== END BT MODE DETECTION ==========

  // CHECK: If customer already has a personal loan from Poonawala Finance
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const poonawalaNames = ['poonawala', 'poonawalla', 'poonawala finance', 'poonawalla finance'];
    const hasExistingPoonawalaLoan = existingLoanBanks.some(bank =>
      poonawalaNames.some(name => bank.includes(name))
    );

    if (hasExistingPoonawalaLoan) {
      return {
        isEligible: false,
        reason: 'As an existing customer of Poonawala Finance with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('Poonawala Finance', 'ageRules', { state: userData.state, city: userData.city });
  const minAge = ageConfig?.minAge ?? poonawalaConfig.minAge;
  const maxAge = ageConfig?.maxAge ?? poonawalaConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      isEligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!poonawalaConfig.employmentTypes.includes(employmentType)) {
    return {
      isEligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }

  // Apply tenure capping based on category (tenure is in months)
  // Logic Bridge: Support govtMaxTenure override
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : poonawalaConfig.maxTenureByCategory[lookupCategory];
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    maxTenureForCategory = 60; // Fallback
  }

  // ALWAYS USE MAXIMUM TENURE FOR THE CATEGORY (ignore user's requested tenure)
  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Store user's request for display purposes
  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check loan tenure
  if (loanTenure > poonawalaConfig.maxLoanTenure) {
    return {
      isEligible: false,
      reason: `Maximum loan tenure is ${poonawalaConfig.maxLoanTenure} years`
    };
  }

  // Check minimum salary requirement based on category
  const salConfig = getBankConfig('Poonawala Finance', 'employmentRules', { state: userData.state, city: userData.city });
  const catMinSalary = poonawalaConfig.minSalary[lookupCategory] || poonawalaConfig.minSalary['A'];
  const effectiveMinSalary = salConfig?.salariedMinSalary ?? catMinSalary;

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < effectiveMinSalary) {
    return {
      isEligible: false,
      reason: `Minimum monthly income required is ₹${catMinSalary?.toLocaleString() || '0'} for Category ${lookupCategory}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`,
      isBTMode: isBT
    };
  }

  // Get loan capping config
  const cappingConfig = getBankConfig('Poonawala Finance', 'loanCapping', { state: userData.state, city: userData.city });
  const absoluteMaxLoan = cappingConfig?.absoluteMaxLoan ?? poonawalaConfig.maxLoanAmount;
  const minLoanAmount = cappingConfig?.minLoanAmount ?? 100000;

  if (desiredLoanAmount && desiredLoanAmount < minLoanAmount) {
    return {
      isEligible: false,
      reason: `Minimum loan amount required by this bank is ₹${minLoanAmount?.toLocaleString() || '0'}. Requested: ₹${desiredLoanAmount?.toLocaleString() || '0'}`,
      isBTMode: isBT
    };
  }

  // Calculate using FOIR method
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  // Logic Bridge: FOIR override
  const foirPercentage = isGovtEmployee && govtFOIR ? (govtFOIR / 100) : getFoirPercentage(incomeForCalculation);
  if (!foirPercentage) {
    return {
      isEligible: false,
      reason: 'Unable to determine FOIR percentage for the provided salary',
      isBTMode: isBT
    };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      isEligible: false,
      reason: `Existing EMI (₹${(existingEMI || 0).toLocaleString()}) exceeds FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // ROI Logic Bridge Overrides
  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) {
    finalInterestRate = getDynamicInterestRate('Poonawala Finance', lookupCategory, desiredLoanAmount || monthlyIncome * 20, { state: userData.state, city: userData.city }, poonawalaConfig.interestRate);
  }

  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  // Take minimum of FOIR calculation and desired amount
  const maxLoanAmount = foirLoanAmount;

  // Apply bank's maximum loan cap
  const finalLoanAmount = Math.min(maxLoanAmount, desiredLoanAmount || Infinity, absoluteMaxLoan);
  const loanCapped = maxLoanAmount > absoluteMaxLoan;

  // ========== BALANCE TRANSFER CALCULATION ==========
  let btDetails = null;
  if (isBT) {
    const btFreshAmount = finalLoanAmount - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return {
        isEligible: false,
        reason: `BT Outstanding (₹${btTotalOutstanding?.toLocaleString() || '0'}) exceeds maximum eligible loan (₹${Math.round(finalLoanAmount)?.toLocaleString() || '0'})`,
        isBTMode: true
      };
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
      originalIncome: monthlyIncome,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }
  // ========== END BT CALCULATION ==========

  // Calculate final EMI for the loan amount using capped tenure
  const monthlyEMI = calculateEMI(finalLoanAmount, finalInterestRate, cappedTenureYears);

  return {
    isEligible: true,
    bankId: poonawalaConfig.id,
    bankName: poonawalaConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanAmount: Math.round(finalLoanAmount),
    maxLoanCap: absoluteMaxLoan,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(maxLoanAmount) : null,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    companyCategory: lookupCategory,
    foirPercentage: foirPercentage,
    details: {
      foirLoanAmount: Math.round(foirLoanAmount),
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI || 0),
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
