import { piramalConfig as basePiramalConfig } from './config.js';
import { getEffectiveConfig } from '../../utils/policyUtils';

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

// Helper function to get NTH band for FOIR
const getNTHBand = (nth, nthFoirTable) => {
  for (const [band, data] of Object.entries(nthFoirTable)) {
    if (band.includes('+')) {
      const min = parseInt(band.replace('+', ''));
      if (nth >= min) return data.foir;
    } else {
      const parts = band.split('-');
      if (parts.length === 2) {
        const min = parseInt(parts[0]);
        const max = parseInt(parts[1]);
        if (nth >= min && nth <= max) return data.foir;
      }
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

// Piramal Finance specific eligibility calculation (Ultra-Simple 2-Band NTH System)
export const calculatePiramalEligibility = (userData) => {
  const config = getEffectiveConfig('Piramal Finance', basePiramalConfig);

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

  // CHECK: If customer already has a personal loan from Piramal Finance
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const piramalNames = ['piramal', 'piramal finance', 'piramal capital'];
    const hasExistingPiramalLoan = existingLoanBanks.some(bank =>
      piramalNames.some(name => bank.includes(name))
    );

    if (hasExistingPiramalLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Piramal Finance with an active personal loan, you are not eligible for a new loan from this bank'
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
      reason: `Employment type ${employmentType} not supported by Piramal Finance`
    };
  }

  // Apply tenure capping based on category
  const maxTenureTable = config.maxTenureByCategory || basePiramalConfig.maxTenureByCategory;
  const maxTenureForCategory = maxTenureTable[category] || 60;
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${category}`
    };
  }

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  const minSalary = config.minNTH || 25000;
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < minSalary) {
    return { eligible: false, reason: `Minimum NTH salary of ₹${minSalary.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirTable = config.nthFoirTable || config.foirTable || basePiramalConfig.nthFoirTable;
  const foirPercentage = getNTHBand(incomeForCalculation, foirTable);

  if (foirPercentage === null) {
    return { eligible: false, reason: `No FOIR available for NTH ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
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

  const effectiveInterestRate = config.interestRate || basePiramalConfig.interestRate;
  const calculatedLoanAmount = calculatePrincipalFromEMI(
    availableEMI,
    effectiveInterestRate,
    cappedTenureYears
  );

  const preliminaryLoanAmount = Math.min(
    calculatedLoanAmount,
    desiredLoanAmount || Infinity
  );

  const absoluteMaxLoan = config.loanCapping?.absoluteMaxLoan || config.maxLoanAmount || 5000000;
  const cappedFinalLoan = Math.min(preliminaryLoanAmount, absoluteMaxLoan);
  const loanCapped = preliminaryLoanAmount > absoluteMaxLoan;

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

  const monthlyEMI = calculateEMI(cappedFinalLoan, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: config.id,
    bankName: config.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: absoluteMaxLoan,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(preliminaryLoanAmount) : null,
    interestRate: effectiveInterestRate,
    loanTenure: cappedTenureYears,
    monthlyEMI: Math.round(monthlyEMI),
    foirPercentage: foirPercentage,
    availableEMI: Math.round(availableEMI),
    calculationMethod: 'FOIR Only (Ultra-Simple 2-Band NTH, No Category)',
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
