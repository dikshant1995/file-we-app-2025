import { shriRamConfig as baseShriRamConfig } from './config.js';
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

// Helper function to get salary band
const getSalaryBand = (salary, table) => {
  for (const band of Object.keys(table)) {
    if (band.includes('+')) {
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) return band;
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

// Shri Ram Finance specific eligibility calculation (Salary-Driven Combined System)
export const calculateShriRamEligibility = (userData) => {
  const config = getEffectiveConfig('Shriram Finance', baseShriRamConfig);

  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI = 0,
    category = 'C',
    creditScore,
    employmentType,
    age,
    existingLoanBanks,
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding,
    creditCardObligation = 0
  } = userData;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncome;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = existingEMI - btTotalEMI;
    adjustedIncome = monthlyIncome - nonBTLoansEMI;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT loan EMIs (₹${nonBTLoansEMI.toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from Shri Ram Finance
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const shriRamNames = ['shri ram', 'shriram', 'shri ram finance', 'shriram finance'];
    const hasExistingShriRamLoan = existingLoanBanks.some(bank =>
      shriRamNames.some(name => bank.includes(name))
    );

    if (hasExistingShriRamLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Shri Ram Finance with an active personal loan, you are not eligible for a new loan from this bank'
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
      reason: `Employment type ${employmentType} not supported by Shri Ram Finance`
    };
  }

  // Apply tenure capping based on category
  const maxTenureTable = config.maxTenureByCategory || baseShriRamConfig.maxTenureByCategory;
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

  const minSalaryTable = config.minSalaryByCategory || baseShriRamConfig.minSalaryByCategory;
  const minSalaryRequired = minSalaryTable[category] || minSalaryTable['C'];
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < minSalaryRequired) {
    return { eligible: false, reason: `Minimum salary of ₹${minSalaryRequired.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const salaryBandTable = config.salaryBandTable || config.multiplierTable || baseShriRamConfig.salaryBandTable;
  const salaryBand = getSalaryBand(incomeForCalculation, salaryBandTable);

  if (!salaryBand) {
    return { eligible: false, reason: 'Salary does not fall within any eligible band', isBTMode: isBT };
  }

  const bandData = salaryBandTable[salaryBand];
  const multiplier = bandData.multiplier;
  const foirPercentage = bandData.foir;

  const foirCap = incomeForCalculation * foirPercentage;
  const availableEMI = isBT ? foirCap : (foirCap - existingEMI);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing EMI (₹${existingEMI.toLocaleString()}) exceeds FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  const effectiveInterestRate = config.interestRate || baseShriRamConfig.interestRate;
  const foirLoanAmount = calculatePrincipalFromEMI(
    availableEMI,
    effectiveInterestRate,
    cappedTenureYears
  );

  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  const preliminaryLoanAmount = Math.min(
    foirLoanAmount,
    multiplierLoanAmount,
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
    multiplier: multiplier,
    foirPercentage: foirPercentage,
    calculationMethod: 'Combined (Income-based FOIR + Multiplier, No Category Distinction)',
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      multiplier: multiplier + 'x',
      salaryBand: salaryBand,
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      foirLoanAmount: Math.round(foirLoanAmount),
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      limitingFactor: preliminaryLoanAmount === foirLoanAmount ? 'FOIR' : 'Multiplier',
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
