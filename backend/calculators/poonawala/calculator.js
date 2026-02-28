import { poonawalaConfig } from './config.js';
import { getBankConfig } from '../../utils/configHelper.js';

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, userData = {}) => {
  const rateConfig = getBankConfig('Poonawala Finance', 'interestRates', { state: userData.state, city: userData.city });

  if (!rateConfig || !rateConfig.categorySlabRates || !rateConfig.categorySlabRates[category]) {
    return poonawalaConfig.interestRate;
  }

  const slabs = rateConfig.categorySlabRates[category];

  for (const slabLabel in slabs) {
    const match = slabLabel.match(/₹(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      if (loanAmount >= min && loanAmount <= max) {
        return slabs[slabLabel];
      }
    }
  }

  return poonawalaConfig.interestRate;
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

// Poonawala Finance specific eligibility calculation
export const calculatePoonawalaEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
    category = 'C',
    creditScore,
    employmentType,
    age,
    existingLoanBanks,
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding
  } = userData;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncome;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = existingEMI - btTotalEMI;
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from Poonawala Finance
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const poonawalaNames = ['poonawala', 'poonawalla', 'poonawala finance', 'poonawalla finance'];
    const hasExistingPoonawalaLoan = existingLoanBanks.some(bank =>
      poonawalaNames.some(name => bank.includes(name))
    );

    if (hasExistingPoonawalaLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Poonawala Finance with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('Poonawala Finance', 'ageRules', { state: userData.state, city: userData.city });
  const minAge = ageConfig ? ageConfig.minAge : poonawalaConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : poonawalaConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!poonawalaConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by Poonawala Finance`
    };
  }

  // Determine customer segment
  const customerSegment = getCustomerSegment(category);

  // Apply tenure capping based on category (tenure is in months)
  const maxTenureForCategory = poonawalaConfig.maxTenureByCategory[customerSegment];
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${customerSegment}`
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
  if (loanTenure > poonawalaConfig.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${poonawalaConfig.maxLoanTenure} years`
    };
  }

  // Check minimum salary requirement based on category
  const salConfig = getBankConfig('Poonawala Finance', 'employmentRules', { state: userData.state, city: userData.city });
  const catMinSalary = poonawalaConfig.minNTHBySegment[customerSegment];
  const effectiveMinSalary = salConfig ? salConfig.salariedMinSalary : catMinSalary;

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < effectiveMinSalary) {
    return { eligible: false, reason: `Minimum NTH salary of ₹${effectiveMinSalary.toLocaleString()} required for ${customerSegment} segment${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  // Get loan capping config
  const cappingConfig = getBankConfig('Poonawala Finance', 'loanCapping', { state: userData.state, city: userData.city });
  const absoluteMaxLoan = cappingConfig ? cappingConfig.absoluteMaxLoan : poonawalaConfig.maxLoanAmount;
  const minLoanAmount = cappingConfig ? cappingConfig.minLoanAmount : 100000;

  // Check minimum loan amount
  if (desiredLoanAmount && desiredLoanAmount < minLoanAmount) {
    return {
      eligible: false,
      reason: `Minimum loan amount required by this bank is ₹${minLoanAmount.toLocaleString()}. Requested: ₹${desiredLoanAmount.toLocaleString()}`,
      isBTMode: isBT
    };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirPercentage = getNTHBandFOIR(customerSegment, incomeForCalculation);

  if (foirPercentage === null) {
    return { eligible: false, reason: `No FOIR available for ${customerSegment} segment at NTH ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = existingEMI + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing EMI (₹${existingEMI.toLocaleString()}) exceeds FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // Pass 1: Calculate preliminary loan with base rate
  const baseRate = poonawalaConfig.interestRate;
  const calculatedLoanAmountPass1 = calculatePrincipalFromEMI(
    availableEMI,
    baseRate,
    cappedTenureYears
  );

  const preliminaryLoanAmount = Math.min(
    calculatedLoanAmountPass1,
    desiredLoanAmount || Infinity
  );

  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, absoluteMaxLoan);

  // Pass 2: Get correct rate based on preliminary loan amount
  const finalInterestRate = getInterestRateForLoan(category, preliminaryCappedLoan, userData);

  // Recalculate loan with final rate
  const calculatedLoanAmount = calculatePrincipalFromEMI(
    availableEMI,
    finalInterestRate,
    cappedTenureYears
  );

  // Final loan amount is minimum of calculated and desired
  const finalLoanAmount = Math.min(
    calculatedLoanAmount,
    desiredLoanAmount || Infinity
  );

  const cappedFinalLoan = Math.min(finalLoanAmount, absoluteMaxLoan);
  const loanCapped = finalLoanAmount > absoluteMaxLoan;

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
      originalIncome: monthlyIncome,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const monthlyEMI = calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: poonawalaConfig.id,
    bankName: poonawalaConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: absoluteMaxLoan,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    customerSegment: customerSegment,
    foirPercentage: foirPercentage,
    availableEMI: Math.round(availableEMI),
    calculationMethod: 'FOIR (2D Matrix: Segment × NTH)',
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      customerSegment: customerSegment,
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      maxLoanFromFOIR: Math.round(calculatedLoanAmount),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
