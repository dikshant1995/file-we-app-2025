import { bandhanConfig } from './config.js';
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
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
    govtMultiplier,
    govtMaxTenure,
    // User fields
    age,
    category,
    existingLoanBanks,
    // Balance Transfer fields
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding
  } = userData;

  // ========== CATEGORY STANDARDIZATION ==========
  // Determine lookup category - handle both standard and GOVT cases
  let companyCategory = category || 'B';
  if (employmentType === 'government') {
    companyCategory = 'GOVT';
  } else if (companyCategory === 'Govt' || companyCategory === 'government') {
    companyCategory = 'GOVT';
  }

  // Use standardized GOVT for table lookups
  const lookupCategory = companyCategory;
  // ========== END CATEGORY STANDARDIZATION ==========

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
        isEligible: false,
        reason: `After deducting non-BT obligations (₹${((existingEMI || 0) + (creditCardObligation || 0))?.toLocaleString() || '0'}), no income remains for Balance Transfer`,
        isBTMode: true
      };
    }
  }
  // ========== END BT MODE DETECTION ==========

  // CHECK: If customer already has a personal loan from Bandhan Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const bandhanBankNames = ['bandhan', 'bandhan bank'];
    const hasExistingBandhanLoan = existingLoanBanks.some(bank =>
      bandhanBankNames.some(name => bank.includes(name))
    );

    if (hasExistingBandhanLoan) {
      return {
        isEligible: false,
        reason: 'As an existing customer of Bandhan Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility
  const ageConfig = getBankConfig('Bandhan Bank', 'ageRules');
  const minAge = ageConfig?.minAge ?? bandhanConfig.minAge;
  const maxAge = ageConfig?.maxAge ?? bandhanConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      isEligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!bandhanConfig.employmentTypes.includes(employmentType)) {
    return {
      isEligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }

  // Apply tenure capping based on category (tenure is in months)
  // Logic Bridge: Support govtMaxTenure override
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : bandhanConfig.maxTenureByCategory[lookupCategory];
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    maxTenureForCategory = 60; // Fallback
  }

  // ALWAYS USE MAXIMUM TENURE FOR THE CATEGORY (ignore user's requested tenure)
  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Store user's request for display purposes
  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check minimum salary requirement based on category
  const salConfig = getBankConfig('Bandhan Bank', 'employmentRules');
  const catMinSalary = bandhanConfig.minSalary[lookupCategory] || bandhanConfig.minSalary['A'];
  const effectiveMinSalary = salConfig?.salariedMinSalary ?? catMinSalary;

  if (catMinSalary === null) {
    return { isEligible: false, reason: `Bandhan Bank does not provide loans to unlisted companies` };
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < effectiveMinSalary) {
    return {
      isEligible: false,
      reason: `Minimum monthly income required is ₹${catMinSalary?.toLocaleString() || '0'} for Category ${lookupCategory}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`,
      isBTMode: isBT
    };
  }

  // Calculate using FOIR method
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  // Logic Bridge: FOIR override
  const foirPercentage = isGovtEmployee && govtFOIR ? (govtFOIR / 100) : getFoirPercentage(incomeForCalculation);
  if (!foirPercentage) {
    return {
      isEligible: false,
      reason: 'Unable to determine FOIR percentage for the provided salary',
      isBTMode: isBT
    };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  // Preliminary loan amount with base rate
  const preliminaryLoanAmount = calculateLoanAmountFromEMI(availableEMI, bandhanConfig.interestRate, cappedTenureYears);

  // ROI Logic Bridge Overrides
  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) {
    finalInterestRate = getDynamicInterestRate('Bandhan Bank', lookupCategory, preliminaryLoanAmount, { state: userData.state, city: userData.city }, bandhanConfig.interestRate);
  }

  // Final loan amount
  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  // Take the minimum of desired loan amount and FOIR-based loan amount
  const maxLoanAmount = foirLoanAmount;

  // Get loan capping config
  const cappingConfig = getBankConfig('Bandhan Bank', 'loanCapping');
  const absoluteMaxLoan = cappingConfig?.absoluteMaxLoan ?? bandhanConfig.maxLoanAmount;

  const finalLoanAmount = Math.min(maxLoanAmount, desiredLoanAmount || Infinity, absoluteMaxLoan);
  const loanCapped = maxLoanAmount > absoluteMaxLoan;

  // ========== BALANCE TRANSFER CALCULATION ==========
  let btDetails = null;
  if (isBT) {
    const btFreshAmount = finalLoanAmount - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return {
        isEligible: false,
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

  const monthlyEMI = calculateEMI(finalLoanAmount, finalInterestRate, cappedTenureYears);

  return {
    isEligible: true,
    bankId: bandhanConfig.id,
    bankName: bandhanConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanAmount: Math.round(finalLoanAmount),
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
    companyCategory: lookupCategory,
    foirPercentage: foirPercentage,
    details: {
      foirLoanAmount: Math.round(foirLoanAmount),
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI || 0),
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
