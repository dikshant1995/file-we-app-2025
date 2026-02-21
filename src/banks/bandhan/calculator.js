import { bandhanConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService';

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
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding
  } = userData;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncome;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = (existingEMI || 0) - btTotalEMI;
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
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

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('Bandhan Bank', 'ageRules', { state: userData.state, city: userData.city });
  const minAge = ageConfig ? ageConfig.minAge : bandhanConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : bandhanConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Use user-provided interest rate or default to bank config
  const effectiveInterestRate = interestRate || bandhanConfig.interestRate;

  // Check minimum salary requirement based on category
  const companyCategory = category || 'B';
  const salConfig = getBankConfig('Bandhan Bank', 'employmentRules', { state: userData.state, city: userData.city });
  const catMinSalary = bandhanConfig.minSalary[companyCategory];
  const effectiveMinSalary = salConfig ? salConfig.salariedMinSalary : catMinSalary;

  if (effectiveMinSalary === null) {
    return { eligible: false, reason: `Bandhan Bank does not provide loans to ${companyCategory} companies` };
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < effectiveMinSalary) {
    return { eligible: false, reason: `Minimum monthly income required for ${companyCategory} category is ₹${effectiveMinSalary.toLocaleString()}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  // Get loan capping config
  const cappingConfig = getBankConfig('Bandhan Bank', 'loanCapping', { state: userData.state, city: userData.city });
  const absoluteMaxLoan = cappingConfig ? cappingConfig.absoluteMaxLoan : bandhanConfig.maxLoanAmount;
  const minLoanAmount = cappingConfig ? cappingConfig.minLoanAmount : 100000;

  // Check minimum loan amount
  if (desiredLoanAmount && desiredLoanAmount < minLoanAmount) {
    return {
      eligible: false,
      reason: `Minimum loan amount required by this bank is ₹${minLoanAmount.toLocaleString()}. Requested: ₹${desiredLoanAmount.toLocaleString()}`,
      isBTMode: isBT
    };
  }

  // Apply tenure capping based on category (tenure is in months)
  const maxTenureForCategory = bandhanConfig.maxTenureByCategory[companyCategory];
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `Bandhan Bank does not provide loans to ${companyCategory} companies`
    };
  }

  // ALWAYS USE MAXIMUM TENURE FOR THE CATEGORY (ignore user's requested tenure)
  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Store user's request for display purposes
  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirPercentage = getFoirPercentage(incomeForCalculation);
  if (!foirPercentage) {
    return { eligible: false, reason: 'Unable to determine FOIR percentage for the provided salary', isBTMode: isBT };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  // Calculate loan amount based on available EMI using the capped tenure (in years)
  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);

  // Take the minimum of desired loan amount and FOIR-based loan amount
  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    foirLoanAmount
  );

  const finalLoanAmount = Math.min(maxLoanAmount, absoluteMaxLoan);
  const loanCapped = maxLoanAmount > absoluteMaxLoan;

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
      originalIncome: monthlyIncome,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const monthlyEMI = calculateEMI(finalLoanAmount, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: bandhanConfig.id,
    bankName: bandhanConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: absoluteMaxLoan,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(maxLoanAmount) : null,
    interestRate: effectiveInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    companyCategory: companyCategory,
    calculationMethod: 'FOIR-based',
    foirPercentage: foirPercentage,
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
