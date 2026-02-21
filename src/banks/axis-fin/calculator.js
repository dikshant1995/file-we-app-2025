import { axisFinConfig as baseAxisFinConfig } from './config.js';
import { getEffectiveConfig } from '../../utils/policyUtils';

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

// Axis Finance specific eligibility calculation (Multiplier-Only System)
export const calculateAxisFinEligibility = (userData) => {
  const config = getEffectiveConfig('Axis Finance', baseAxisFinConfig);

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
      reason: `Employment type ${employmentType} not supported by Axis Finance`
    };
  }

  // Apply tenure capping based on category
  const maxTenureForCategory = config.maxTenureByCategory ? config.maxTenureByCategory[category] : 60;
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

  // Check if category is supported
  if (category === 'UNLISTED') {
    return {
      eligible: false,
      reason: 'Axis Finance does not provide loans to UNLISTED company employees'
    };
  }

  const minSalary = config.salariedMinSalary || config.minSalary || 25000;
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < minSalary) {
    return { eligible: false, reason: `Minimum salary of ₹${minSalary.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const multiplierTable = config.multiplierTable || config.multiplierRules?.multiplierTable || baseAxisFinConfig.multiplierTable;
  const salaryBand = getSalaryBand(incomeForCalculation, multiplierTable);

  if (!salaryBand) {
    return { eligible: false, reason: 'Salary does not fall within any eligible band', isBTMode: isBT };
  }

  const multiplier = multiplierTable[salaryBand] ? multiplierTable[salaryBand][category] : null;

  if (!multiplier) {
    return { eligible: false, reason: `No multiplier available for category ${category} at salary ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
  }

  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const calculatedLoanAmount = availableSalary * multiplier;

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

  const effectiveInterestRate = config.interestRate || baseAxisFinConfig.interestRate;
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
    category: category,
    calculationMethod: 'Multiplier Only (No FOIR)',
    details: {
      multiplier: multiplier + 'x',
      salaryBand: salaryBand,
      multiplierLoanAmount: Math.round(calculatedLoanAmount),
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
