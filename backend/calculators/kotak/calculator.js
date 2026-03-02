import { kotakConfig } from './config.js';
import { getBankConfig, getDynamicInterestRate } from '../../utils/configHelper.js';

// Helper function to get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, userData = {}) => {
  return getDynamicInterestRate('Kotak Mahindra Bank', category, loanAmount, { state: userData.state, city: userData.city }, kotakConfig.interestRate);
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

// Function to determine salary band for multiplier table
const getMultiplierSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 35000) return '25000-35000';
  if (salary >= 35001 && salary <= 50000) return '35001-50000';
  if (salary >= 50001 && salary <= 75000) return '50001-75000';
  if (salary > 75000) return '75000+';
  return null;
};

// Function to determine salary band for FOIR table
const getFoirSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 34999) return '25000-34999';
  if (salary >= 35000 && salary <= 49999) return '35000-49999';
  if (salary >= 50000) return '50000+';
  return null;
};

// Function to determine company category
const getCompanyCategory = (companyName, employmentType) => {
  // Government employees are always classified as Category A
  if (employmentType === 'government') {
    return 'GOVT';
  }

  // For this implementation, we'll use a simplified approach
  // In a real application, this would be based on an actual company database
  const company = companyName.toLowerCase();

  // Example categorization - in reality this would come from a database
  if (company.includes('google') || company.includes('microsoft') || company.includes('amazon')) {
    return 'AA';
  } else if (company.includes('tcs') || company.includes('infosys') || company.includes('wipro')) {
    return 'A';
  } else if (company.includes('hcl') || company.includes('tech mahindra')) {
    return 'B';
  } else if (company.includes('local') || company.includes('regional')) {
    return 'C';
  } else if (company.includes('startup') || company.includes('small')) {
    return 'D';
  }

  // Return null for unlisted companies (ineligible)
  return null;
};

// Function to get multiplier based on salary and category
const getMultiplier = (salary, category) => {
  const salaryBand = getMultiplierSalaryBand(salary);
  if (!salaryBand) return null;

  return kotakConfig.multiplierTable[salaryBand][category] || null;
};

// Function to get FOIR percentage based on salary and category
const getFoirPercentage = (salary, category) => {
  const salaryBand = getFoirSalaryBand(salary);
  if (!salaryBand) return null;

  return kotakConfig.foirTable[salaryBand][category] || null;
};

// Kotak Mahindra Bank specific eligibility calculation
export const calculateKotakEligibility = (userData) => {
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
    console.log('🔄 KOTAK - BALANCE TRANSFER MODE ACTIVATED');
    nonBTLoansEMI = (existingEMI || 0) - btTotalEMI;
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;

    console.log('📊 Non-BT Loans EMI:', nonBTLoansEMI);
    console.log('💳 Credit Card Obligation (5% of non-BT CC):', creditCardDeduction);
    console.log('💵 Adjusted Income:', adjustedIncome);

    if (adjustedIncome <= 0) {
      return {
        eligible: false,
        reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction)?.toLocaleString() || '0'}), no income remains for Balance Transfer`,
        isBTMode: true
      };
    }
  }
  // ========== END BT MODE DETECTION ==========

  // CHECK: If customer already has a personal loan from Kotak Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const kotakBankNames = ['kotak', 'kotak mahindra', 'kotak mahindra bank'];
    const hasExistingKotakLoan = existingLoanBanks.some(bank =>
      kotakBankNames.some(name => bank.includes(name))
    );

    if (hasExistingKotakLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Kotak Mahindra Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('Kotak Mahindra Bank', 'ageRules', { state: userData.state, city: userData.city });
  const minAge = ageConfig?.minAge ?? kotakConfig.minAge;
  const maxAge = ageConfig?.maxAge ?? kotakConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Use user-provided interest rate or calculate based on category and loan amount
  const effectiveInterestRate = interestRate || getInterestRateForLoan(category || 'B', desiredLoanAmount || monthlyIncome * 20, userData);

  // Check employment type
  if (!kotakConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }

  // Use user-provided category (from frontend: B, C, or GOVT)
  const companyCategory = category || 'B'; // Default to B if not provided

  // Apply tenure capping based on category (tenure is in months)
  const maxTenureForCategory = kotakConfig.maxTenureByCategory[companyCategory];
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${companyCategory}`
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
  // Use dynamic config from admin dashboard
  const salConfig = getBankConfig('Kotak Mahindra Bank', 'employmentRules', { state: userData.state, city: userData.city });
  const catMinSalary = companyCategory === 'D' ?
    (salConfig?.selfEmployedMinIncome ? salConfig.selfEmployedMinIncome / 12 : kotakConfig.minSalary['D']) :
    (salConfig?.salariedMinSalary ?? kotakConfig.minSalary['A']);

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < catMinSalary) {
    return {
      eligible: false,
      reason: `Minimum monthly income required is ₹${catMinSalary?.toLocaleString() || '0'} for Category ${companyCategory}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`,
      isBTMode: isBT
    };
  }

  // Get loan capping config
  const cappingConfig = getBankConfig('Kotak Mahindra Bank', 'loanCapping', { state: userData.state, city: userData.city });
  const absoluteMaxLoan = cappingConfig?.absoluteMaxLoan ?? kotakConfig.maxLoanAmount;
  const minLoanAmount = cappingConfig?.minLoanAmount ?? 100000;

  // Check minimum loan amount
  if (desiredLoanAmount && desiredLoanAmount < minLoanAmount) {
    return {
      eligible: false,
      reason: `Minimum loan amount required by this bank is ₹${minLoanAmount?.toLocaleString() || '0'}. Requested: ₹${desiredLoanAmount?.toLocaleString() || '0'}`,
      isBTMode: isBT
    };
  }

  // ========== PASS 1: Calculate preliminary loan amount with base rate ==========
  const baseRate = kotakConfig.interestRate; // Use default 11% for initial calculation

  // Calculate using Multiplier method
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const multiplier = getMultiplier(incomeForCalculation, companyCategory);
  if (!multiplier) {
    return {
      eligible: false,
      reason: 'Unable to determine multiplier for the provided salary and category',
      isBTMode: isBT
    };
  }

  // IMPORTANT: For multiplier, use salary after deducting existing EMI + credit card obligations (non-BT mode)
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // Calculate using FOIR method with base rate
  const foirPercentage = getFoirPercentage(incomeForCalculation, companyCategory);
  if (!foirPercentage) {
    return {
      eligible: false,
      reason: 'Unable to determine FOIR percentage for the provided salary and category',
      isBTMode: isBT
    };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  // Calculate preliminary loan amount with base rate
  const preliminaryFoirLoanAmount = calculateLoanAmountFromEMI(availableEMI, baseRate, cappedTenureYears);

  // Take the minimum of the two calculations
  const preliminaryMaxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    preliminaryFoirLoanAmount
  );

  // Apply bank's maximum loan cap
  const preliminaryLoanAmount = Math.min(preliminaryMaxLoanAmount, absoluteMaxLoan);

  // ========== PASS 2: Get correct interest rate based on preliminary loan amount ==========
  const finalInterestRate = interestRate || getInterestRateForLoan(companyCategory, preliminaryLoanAmount, userData);

  console.log(`🔄 Two-Pass Calculation: Preliminary=₹${preliminaryLoanAmount}, Rate=${finalInterestRate}%`);

  // Recalculate FOIR loan amount with final interest rate
  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  // Take the minimum again with final rate
  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    foirLoanAmount
  );

  // Apply bank's maximum loan cap
  const finalLoanAmount = Math.min(maxLoanAmount, absoluteMaxLoan);
  const loanCapped = maxLoanAmount > absoluteMaxLoan;

  // ========== BALANCE TRANSFER CALCULATION ==========
  let btFreshAmount = 0;
  let btDetails = null;

  if (isBT) {
    btFreshAmount = finalLoanAmount - btTotalOutstanding;

    if (btFreshAmount < 0) {
      return {
        eligible: false,
        reason: `BT Outstanding (₹${btTotalOutstanding?.toLocaleString() || '0'}) exceeds maximum eligible loan amount (₹${Math.round(finalLoanAmount)?.toLocaleString() || '0'})`,
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

  // Calculate final EMI for the loan amount using capped tenure and final rate
  const monthlyEMI = calculateEMI(finalLoanAmount, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: kotakConfig.id,
    bankName: kotakConfig.name,
    loanAmount: Math.round(finalLoanAmount),
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
    companyCategory: companyCategory,
    calculationMethod: 'Combined (Multiplier and FOIR)',
    multiplier: multiplier,
    foirPercentage: foirPercentage,
    details: {
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      foirLoanAmount: Math.round(foirLoanAmount),
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};
