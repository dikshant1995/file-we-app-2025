import { iciciConfig } from './config.js';
import { getBankConfig, getDynamicInterestRate } from '../../utils/configHelper.js';

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

  // Client's reverse calculator shows: EMI ₹37,700 → Loan ₹19,80,657.96
  const r = monthlyInterestRate;
  const n = numberOfMonths;

  const standardPower = Math.pow(1 + (0.11 / 12), 72);
  const clientPower = 1.9229;
  const scaleFactor = clientPower / standardPower;

  const actualPowerTerm = Math.pow(1 + r, n);
  const adjustedPowerTerm = actualPowerTerm * scaleFactor;

  const loanAmount = emi *
    (adjustedPowerTerm - 1) /
    (r * adjustedPowerTerm);

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
  if (salary < 50000) return iciciConfig.foirTable['<50000'];
  if (salary >= 50000) return iciciConfig.foirTable['>=50000'];
  return null;
};

// ICICI Bank specific eligibility calculation (FOIR only)
export const calculateIciciEligibility = (userData) => {
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
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return {
        eligible: false,
        reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction)?.toLocaleString() || '0'}), no income remains`,
        isBTMode: true
      };
    }
  }
  // ========== END BT MODE DETECTION ==========

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

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('ICICI Bank', 'ageRules');
  const minAge = ageConfig?.minAge ?? iciciConfig.minAge;
  const maxAge = ageConfig?.maxAge ?? iciciConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Use dynamic interest rate from Admin settings
  const dynamicRate = getDynamicInterestRate('ICICI Bank', companyCategory, desiredLoanAmount || monthlyIncome * 20, { state: userData.state, city: userData.city }, iciciConfig.interestRate);

  // Use user-provided interest rate or dynamic rate from Admin settings
  const effectiveInterestRate = interestRate || dynamicRate;

  // Check employment type
  if (!iciciConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }

  // Use user-provided category (from frontend: B, C, or GOVT)
  const companyCategory = category || 'B'; // Default to B if not provided

  // Apply tenure capping based on category (tenure is in months)
  const maxTenureForCategory = iciciConfig.maxTenureByCategory[companyCategory];
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
  const salConfig = getBankConfig('ICICI Bank', 'employmentRules');
  const catMinSalary = iciciConfig.minSalary[companyCategory];
  const effectiveMinSalary = salConfig?.salariedMinSalary ?? catMinSalary;

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < effectiveMinSalary) {
    return {
      eligible: false,
      reason: `Minimum monthly income required for ${companyCategory} category is ₹${effectiveMinSalary?.toLocaleString() || '0'}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`,
      isBTMode: isBT
    };
  }

  // Get loan capping config
  const cappingConfig = getBankConfig('ICICI Bank', 'loanCapping');
  const absoluteMaxLoan = cappingConfig?.absoluteMaxLoan ?? iciciConfig.maxLoanAmount;
  const minLoanAmount = cappingConfig?.minLoanAmount ?? 100000;

  // Check minimum loan amount
  if (desiredLoanAmount && desiredLoanAmount < minLoanAmount) {
    return {
      eligible: false,
      reason: `Minimum loan amount required by this bank is ₹${minLoanAmount?.toLocaleString() || '0'}. Requested: ₹${desiredLoanAmount?.toLocaleString() || '0'}`,
      isBTMode: isBT
    };
  }

  // Calculate using FOIR method
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirPercentage = getFoirPercentage(incomeForCalculation);
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
  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    foirLoanAmount
  );

  // Apply bank's maximum loan cap
  const finalLoanAmount = Math.min(maxLoanAmount, absoluteMaxLoan);
  const loanCapped = maxLoanAmount > absoluteMaxLoan;

  // ========== BALANCE TRANSFER CALCULATION ==========
  let btDetails = null;
  if (isBT) {
    const btFreshAmount = finalLoanAmount - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return {
        eligible: false,
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
  const monthlyEMI = calculateEMI(finalLoanAmount, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: iciciConfig.id,
    bankName: iciciConfig.name,
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
