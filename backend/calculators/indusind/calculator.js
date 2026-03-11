import { indusindConfig } from './config.js';
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

// Helper function to get salary band for a specific category
const getSalaryBand = (salary, category, multiplierTable) => {
  const categoryBands = multiplierTable[category];
  if (!categoryBands) return null;

  for (const band of Object.keys(categoryBands)) {
    if (band.includes('+')) {
      // Handle "30000+" or "75001+" format
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) {
        return band;
      }
    } else {
      // Handle "25000-75000" format
      const [min, max] = band.split('-').map(s => parseInt(s));
      if (salary >= min && salary <= max) {
        return band;
      }
    }
  }
  return null;
};

// IndusInd Bank specific eligibility calculation (Multiplier-Only System)
export const calculateIndusindEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
    companyName,
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

  // CHECK: If customer already has a personal loan from IndusInd Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const indusindNames = ['indusind', 'indusind bank'];
    const hasExistingIndusindLoan = existingLoanBanks.some(bank =>
      indusindNames.some(name => bank.includes(name))
    );

    if (hasExistingIndusindLoan) {
      return {
        isEligible: false,
        reason: 'As an existing customer of IndusInd Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('IndusInd Bank', 'ageRules');
  const minAge = ageConfig?.minAge ?? indusindConfig.minAge;
  const maxAge = ageConfig?.maxAge ?? indusindConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      isEligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!indusindConfig.employmentTypes.includes(employmentType)) {
    return {
      isEligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }

  // Apply tenure capping based on category (tenure is in months)
  // Logic Bridge: Support govtMaxTenure override
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : indusindConfig.maxTenureByCategory[lookupCategory];
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    maxTenureForCategory = 72; // Fallback
  }

  // ALWAYS USE MAXIMUM TENURE FOR THE CATEGORY (ignore user's requested tenure)
  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Store user's request for display purposes
  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check minimum salary requirement based on category
  const salConfig = getBankConfig('IndusInd Bank', 'employmentRules');
  const catMinSalary = indusindConfig.minSalaryByCategory[lookupCategory];
  const effectiveMinSalary = salConfig?.salariedMinSalary ?? catMinSalary;

  if (!catMinSalary) {
    return { isEligible: false, reason: `Category ${category} not supported by IndusInd Bank`, isBTMode: isBT };
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < effectiveMinSalary) {
    return {
      isEligible: false,
      reason: `Minimum monthly income required is ₹${catMinSalary?.toLocaleString() || '0'} for Category ${lookupCategory}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`,
      isBTMode: isBT
    };
  }

  // Get loan capping config
  const cappingConfig = getBankConfig('IndusInd Bank', 'loanCapping');
  const absoluteMaxLoan = cappingConfig?.absoluteMaxLoan ?? indusindConfig.maxLoanAmount;
  const minLoanAmount = cappingConfig?.minLoanAmount ?? 100000;

  // Check minimum loan amount
  if (desiredLoanAmount && desiredLoanAmount < minLoanAmount) {
    return {
      isEligible: false,
      reason: `Minimum loan amount required by this bank is ₹${minLoanAmount?.toLocaleString() || '0'}. Requested: ₹${desiredLoanAmount?.toLocaleString() || '0'}`,
      isBTMode: isBT
    };
  }

  // Calculate using Multiplier method
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const salaryBand = getSalaryBand(incomeForCalculation, lookupCategory === 'GOVT' ? 'CAT-A' : lookupCategory, indusindConfig.multiplierTable);
  if (!salaryBand && !isGovtEmployee) {
    return { isEligible: false, reason: 'Salary does not fall within any eligible band', isBTMode: isBT };
  }

  // Logic Bridge: Multiple override
  const multiplier = isGovtEmployee && govtMultiplier ? govtMultiplier : indusindConfig.multiplierTable[lookupCategory]?.[salaryBand];
  if (!multiplier) {
    return {
      isEligible: false,
      reason: 'Unable to determine multiplier for the provided salary',
      isBTMode: isBT
    };
  }

  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // Apply bank's maximum loan cap
  const maxLoanAmount = multiplierLoanAmount;
  const finalLoanAmount = Math.min(maxLoanAmount, desiredLoanAmount || Infinity, absoluteMaxLoan);
  const loanCapped = maxLoanAmount > absoluteMaxLoan;

  // ROI Logic Bridge Overrides
  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) {
    finalInterestRate = getDynamicInterestRate('IndusInd Bank', lookupCategory, finalLoanAmount, { state: userData.state, city: userData.city }, indusindConfig.interestRate);
  }

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

  // Calculate final EMI for the loan amount using capped tenure
  const monthlyEMI = calculateEMI(finalLoanAmount, finalInterestRate, cappedTenureYears);

  return {
    isEligible: true,
    bankId: indusindConfig.id,
    bankName: indusindConfig.name,
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
    multiplier: multiplier,
    details: {
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      existingEMI: Math.round(existingEMI || 0),
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};
