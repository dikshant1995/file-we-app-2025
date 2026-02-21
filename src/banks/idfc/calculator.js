import { idfcConfig as baseIdfcConfig } from './config.js';
import { getEffectiveConfig } from '../../utils/policyUtils';

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, config) => {
  const rateConfig = config.interestRates || baseIdfcConfig.interestRates;
  if (!rateConfig || !rateConfig.categorySlabRates || !rateConfig.categorySlabRates[category]) {
    return config.interestRate || baseIdfcConfig.interestRate;
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
  return config.interestRate || baseIdfcConfig.interestRate;
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

// Helper function to get salary band for IDFC
const getSalaryBand = (salary) => {
  if (salary < 50000) return '<50000';
  if (salary >= 50001 && salary <= 75000) return '50001-75000';
  return '>75001';
};

// IDFC Bank specific eligibility calculation (Multiplier-Only System)
export const calculateIdfcEligibility = (userData) => {
  const config = getEffectiveConfig('IDFC First Bank', baseIdfcConfig);

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
      reason: `Employment type ${employmentType} not supported by IDFC Bank`
    };
  }

  const mappedCategory = category === 'A+' ? 'SUPER-A' : category;

  // Apply tenure capping based on category
  const maxTenureTable = config.maxTenureByCategory || baseIdfcConfig.maxTenureByCategory;
  const maxTenureForCategory = maxTenureTable[mappedCategory] || 60;
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${mappedCategory}`
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
      reason: 'IDFC Bank does not provide loans to UNLISTED category employees'
    };
  }

  const multiplierTable = config.multiplierTable || config.multiplierRules?.multiplierTable || baseIdfcConfig.multiplierTable;
  if (!multiplierTable[mappedCategory]) {
    return { eligible: false, reason: `Category ${category} not supported by IDFC Bank`, isBTMode: isBT };
  }

  const minSalary = config.salariedMinSalary || config.minSalary || 25000;
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < minSalary) {
    return { eligible: false, reason: `Minimum salary of ₹${minSalary.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const salaryBand = getSalaryBand(incomeForCalculation);
  const multiplier = multiplierTable[mappedCategory][salaryBand];

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
  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, absoluteMaxLoan);

  const finalInterestRate = getInterestRateForLoan(mappedCategory, preliminaryCappedLoan, config);

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
    multiplier: multiplier,
    category: mappedCategory,
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
