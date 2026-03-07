import { indusindConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';

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
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
    govtMultiplier,
    govtMaxTenure,
    // Balance Transfer fields
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
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
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
  const ageConfig = getBankConfig('IndusInd Bank', 'ageRules');
  const minAge = ageConfig ? ageConfig.minAge : indusindConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : indusindConfig.maxAge;

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
  // Logic Bridge: Support govtMaxTenure override
  let lookupCategory = category === 'Govt' ? 'A' : category;
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : indusindConfig.maxTenureByCategory[lookupCategory];

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

  const minSalaryRequired = indusindConfig.minSalaryByCategory[category];
  if (!minSalaryRequired) {
    return { eligible: false, reason: `Category ${category} not supported by IndusInd Bank`, isBTMode: isBT };
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < minSalaryRequired) {
    return { eligible: false, reason: `Minimum salary of ₹${minSalaryRequired.toLocaleString()} required for category ${category}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const salaryBand = getSalaryBand(incomeForCalculation, category === 'Govt' ? 'A' : category, indusindConfig.multiplierTable);

  if (!salaryBand && !govtMultiplier) {
    return { eligible: false, reason: `Salary does not fall within any eligible band for category ${category}`, isBTMode: isBT };
  }

  // Logic Bridge: Support govtMultiplier override
  let multiplier = (isGovtEmployee && govtMultiplier) ? govtMultiplier : (indusindConfig.multiplierTable[category === 'Govt' ? 'A' : category]?.[salaryBand]);

  if (!multiplier) {
    return { eligible: false, reason: `No multiplier available for category ${category} at salary ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
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

  const cappedFinalLoan = Math.min(finalLoanAmount, indusindConfig.maxLoanAmount);
  const loanCapped = finalLoanAmount > indusindConfig.maxLoanAmount;

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

  // Logic Bridge: Support ROI overrides
  let effectiveInterestRate = interestRateOverride || indusindConfig.interestRate;
  if (isGovtEmployee && govtROI) effectiveInterestRate = govtROI;

  const monthlyEMI = calculateEMI(cappedFinalLoan, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: indusindConfig.id,
    bankName: indusindConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: indusindConfig.maxLoanAmount,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    interestRate: indusindConfig.interestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    multiplier: multiplier,
    salaryBand: salaryBand,
    category: category,
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
