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
    existingEMI = 0,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
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
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction)?.toLocaleString() || '0'}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from IndusInd Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const indusindNames = ['indusind', 'indusind bank'];
    const hasExistingIndusindLoan = existingLoanBanks.some(bank =>
      indusindNames.some(name => bank.includes(name))
    );

    if (hasExistingIndusindLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of IndusInd Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('IndusInd Bank', 'ageRules', { state: userData.state, city: userData.city });
  const minAge = ageConfig?.minAge ?? indusindConfig.minAge;
  const maxAge = ageConfig?.maxAge ?? indusindConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!indusindConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by IndusInd Bank`
    };
  }

  // Apply tenure capping based on category (tenure is in months)
  const maxTenureForCategory = indusindConfig.maxTenureByCategory[category];
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${category}`
    };
  }

  // ALWAYS USE MAXIMUM TENURE FOR THE CATEGORY (ignore user's requested tenure)
  // This shows the maximum loan amount the bank can offer for this category
  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Store user's request for display purposes
  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check loan tenure
  if (loanTenure > indusindConfig.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${indusindConfig.maxLoanTenure} years`
    };
  }

  // Check minimum salary requirement based on category
  const salConfig = getBankConfig('IndusInd Bank', 'employmentRules', { state: userData.state, city: userData.city });
  const catMinSalary = indusindConfig.minSalaryByCategory[category];
  const effectiveMinSalary = salConfig?.salariedMinSalary ?? catMinSalary;

  if (!effectiveMinSalary) {
    return { eligible: false, reason: `Category ${category} not supported by IndusInd Bank`, isBTMode: isBT };
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < effectiveMinSalary) {
    return { eligible: false, reason: `Minimum salary of ₹${effectiveMinSalary?.toLocaleString() || '0'} required for category ${category}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  // Get loan capping config
  const cappingConfig = getBankConfig('IndusInd Bank', 'loanCapping', { state: userData.state, city: userData.city });
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

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const salaryBand = getSalaryBand(incomeForCalculation, category, indusindConfig.multiplierTable);

  if (!salaryBand) {
    return { isEligible: false, reason: `Salary does not fall within any eligible band for category ${category}`, isBTMode: isBT };
  }

  const multiplier = indusindConfig.multiplierTable[category][salaryBand];

  if (!multiplier) {
    return { isEligible: false, reason: `No multiplier available for category ${category} at salary ₹${incomeForCalculation?.toLocaleString() || '0'}`, isBTMode: isBT };
  }

  // IMPORTANT: For multiplier, use salary after deducting existing EMI and credit card obligation (non-BT mode)
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const calculatedLoanAmount = availableSalary * multiplier;

  // Final loan amount is minimum of calculated and desired
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
      return { isEligible: false, reason: `BT Outstanding (₹${btTotalOutstanding?.toLocaleString() || '0'}) exceeds max loan (₹${Math.round(cappedFinalLoan)?.toLocaleString() || '0'})`, isBTMode: true };
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

  // Use dynamic interest rate from Admin settings
  const dynamicRate = getDynamicInterestRate('IndusInd Bank', category, desiredLoanAmount || monthlyIncome * 20, { state: userData.state, city: userData.city }, indusindConfig.interestRate);

  const monthlyEMI = calculateEMI(cappedFinalLoan, dynamicRate, cappedTenureYears);

  return {
    isEligible: true,
    bankId: indusindConfig.id,
    bankName: indusindConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: absoluteMaxLoan,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    interestRate: dynamicRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    multiplier: multiplier,
    salaryBand: salaryBand,
    companyCategory: category,
    maxLoanByMultiplier: Math.round(calculatedLoanAmount),
    calculationMethod: 'Multiplier Only (No FOIR)',
    details: {
      multiplier: multiplier + 'x',
      salaryBand: salaryBand,
      multiplierLoanAmount: Math.round(calculatedLoanAmount),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};
