import { poonawalaConfig as basePoonawalaConfig } from './config.js';
import { getEffectiveConfig } from '../../utils/policyUtils';

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, config) => {
  const rateConfig = config.interestRates || basePoonawalaConfig.interestRates;
  if (!rateConfig || !rateConfig.categorySlabRates || !rateConfig.categorySlabRates[category]) {
    return config.interestRate || basePoonawalaConfig.interestRate;
  }

  const slabs = rateConfig.categorySlabRates[category];
  for (const slabLabel in slabs) {
    const match = slabLabel.match(/₹(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      if (loanAmount >= min && loanAmount <= max) return slabs[slabLabel];
    }
  }
  return config.interestRate || basePoonawalaConfig.interestRate;
};

// Function to calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) return principal / numberOfMonths;

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
const getNTHBandFOIR = (segment, nth, foirMatrix) => {
  const segmentData = foirMatrix[segment];
  if (!segmentData) return null;

  for (const [bandName, bandData] of Object.entries(segmentData)) {
    if (bandData.foir === null) continue;

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

// Poonawala Finance specific eligibility calculation
export const calculatePoonawalaEligibility = (userData) => {
  const config = getEffectiveConfig('Poonawala Finance', basePoonawalaConfig);

  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation,
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

  // Check age eligibility
  const minAge = config.ageRules ? config.ageRules.minAge : config.minAge;
  const maxAge = config.ageRules ? config.ageRules.maxAge : config.maxAge;
  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!config.employmentTypes?.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by Poonawala Finance`
    };
  }

  const customerSegment = getCustomerSegment(category);

  // Apply tenure capping based on segment
  const maxTenureTable = config.maxTenureByCategory || basePoonawalaConfig.maxTenureByCategory;
  const maxTenureForCategory = maxTenureTable[customerSegment] || 60;
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${customerSegment}`
    };
  }

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  const minNTHTable = config.minNTHBySegment || basePoonawalaConfig.minNTHBySegment;
  const minNTHRequired = minNTHTable[customerSegment];
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < minNTHRequired) {
    return { eligible: false, reason: `Minimum NTH salary of ₹${minNTHRequired.toLocaleString()} required for ${customerSegment} segment${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirMatrix = config.foirMatrix || basePoonawalaConfig.foirMatrix;
  const foirPercentage = getNTHBandFOIR(customerSegment, incomeForCalculation, foirMatrix);

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

  const baseRate = config.interestRate || basePoonawalaConfig.interestRate;
  const calculatedLoanAmountPass1 = calculatePrincipalFromEMI(
    availableEMI,
    baseRate,
    cappedTenureYears
  );

  const preliminaryLoanAmount = Math.min(
    calculatedLoanAmountPass1,
    desiredLoanAmount || Infinity
  );

  const absoluteMaxLoan = config.loanCapping?.absoluteMaxLoan || config.maxLoanAmount || 5000000;
  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, absoluteMaxLoan);

  const finalInterestRate = getInterestRateForLoan(category, preliminaryCappedLoan, config);
  const calculatedLoanAmount = calculatePrincipalFromEMI(
    availableEMI,
    finalInterestRate,
    cappedTenureYears
  );

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
      freshAmountDisbursed: Math.round(btFreshAmount),
      originalIncome: monthlyIncome,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const monthlyEMI = calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: config.id,
    bankName: config.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: absoluteMaxLoan,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
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
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
