import { iciciConfig as baseIciciConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService';
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

// Function to calculate loan amount from EMI
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

// Function to get FOIR percentage based on salary
const getFoirPercentage = (salary, config) => {
  const foirTable = config.foirTable || baseIciciConfig.foirTable;
  if (salary < 50000) return foirTable['<50000'];
  if (salary >= 50000) return foirTable['>=50000'];
  return null;
};

// Helper function to get interest rate
const getInterestRateForLoan = (category, loanAmount, config) => {
  const rateConfig = config.interestRates;
  if (!rateConfig || !rateConfig.categorySlabRates || !rateConfig.categorySlabRates[category]) {
    return config.interestRate || baseIciciConfig.interestRate;
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
  return config.interestRate || baseIciciConfig.interestRate;
};

// ICICI Bank specific eligibility calculation (FOIR only)
export const calculateIciciEligibility = (userData) => {
  // Get effective config (merges hardcoded + admin overrides)
  const config = getEffectiveConfig('ICICI Bank', baseIciciConfig);

  const {
    desiredLoanAmount,
    loanTenure,
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
    // Balance Transfer fields
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding
  } = userData;

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
        eligible: false,
        reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`,
        isBTMode: true
      };
    }
  }

  // CHECK: If customer already has a personal loan from ICICI Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const iciciBankNames = ['icici', 'icici bank'];
    const hasExistingIciciLoan = existingLoanBanks.some(bank =>
      iciciBankNames.some(name => bank.includes(name))
    );

    if (hasExistingIciciLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of ICICI Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config
  const minAge = config.ageRules ? config.ageRules.minAge : config.minAge;
  const maxAge = config.ageRules ? config.ageRules.maxAge : config.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Use user-provided interest rate or default to dynamic config
  const effectiveInterestRate = interestRate || getInterestRateForLoan(category || 'B', desiredLoanAmount || monthlyIncome * 20, config);

  // Check employment type
  if (!config.employmentTypes?.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }

  const companyCategory = category || 'B';

  // Apply tenure capping based on category
  const maxTenureForCategory = config.maxTenureByCategory ? config.maxTenureByCategory[companyCategory] : null;
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${companyCategory}`
    };
  }

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check minimum salary requirement
  const categoryMinSalary = (config.minSalary && config.minSalary[companyCategory]) || 25000;
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < categoryMinSalary) {
    return {
      eligible: false,
      reason: `Minimum monthly income required for ${companyCategory} category is ₹${categoryMinSalary.toLocaleString()}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`,
      isBTMode: isBT
    };
  }

  // Calculate using FOIR method
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirPercentage = getFoirPercentage(incomeForCalculation, config);
  if (!foirPercentage) {
    return {
      eligible: false,
      reason: 'Unable to determine FOIR percentage for the provided salary',
      isBTMode: isBT
    };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  // Calculate loan amount based on available EMI using the capped tenure (in years)
  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);

  // Take the minimum of desired loan amount and FOIR-based loan amount
  const preliminaryMaxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    foirLoanAmount
  );

  // Apply bank's maximum loan cap
  const finalMaxCap = config.loanCapping?.absoluteMaxLoan || config.maxLoanAmount || 5000000;
  const finalLoanAmount = Math.min(preliminaryMaxLoanAmount, finalMaxCap);
  const loanCapped = preliminaryMaxLoanAmount > finalMaxCap;

  // ========== BALANCE TRANSFER CALCULATION ==========
  let btDetails = null;
  if (isBT) {
    const btFreshAmount = finalLoanAmount - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return {
        eligible: false,
        reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds maximum eligible loan (₹${Math.round(finalLoanAmount).toLocaleString()})`,
        isBTMode: true
      };
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

  const monthlyEMI = calculateEMI(finalLoanAmount, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: config.id,
    bankName: config.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: finalMaxCap,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(preliminaryMaxLoanAmount) : null,
    interestRate: effectiveInterestRate,
    loanTenure: cappedTenureYears,
    monthlyEMI: Math.round(monthlyEMI),
    companyCategory: companyCategory,
    calculationMethod: 'FOIR-based',
    foirPercentage: foirPercentage,
    details: {
      foirLoanAmount: Math.round(foirLoanAmount),
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
