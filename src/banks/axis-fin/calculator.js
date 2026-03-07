import { axisFinConfig } from './config.js';
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

// Helper function to get salary band
const getSalaryBand = (salary, table) => {
  for (const band of Object.keys(table)) {
    if (band.includes('+')) {
      // Handle "75001+" format
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) {
        return band;
      }
    } else {
      // Handle "25000-50000" format
      const [min, max] = band.split('-').map(s => parseInt(s));
      if (salary >= min && salary <= max) {
        return band;
      }
    }
  }
  return null;
};

// Axis Finance specific eligibility calculation (Multiplier-Only System)
export const calculateAxisFinEligibility = (userData) => {
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
  if (age && (age < axisFinConfig.minAge || age > axisFinConfig.maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${axisFinConfig.minAge} and ${axisFinConfig.maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!axisFinConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by Axis Finance`
    };
  }

  // 2. Apply tenure capping based on category (tenure is in months)
  // Logic Bridge: Support govtMaxTenure override
  let lookupCategory = category === 'Govt' ? 'A' : category;
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : axisFinConfig.maxTenureByCategory[lookupCategory];

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
  if (loanTenure > axisFinConfig.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${axisFinConfig.maxLoanTenure} years`
    };
  }

  // Check if category is supported
  if (category === 'UNLISTED') {
    return {
      eligible: false,
      reason: 'Axis Finance does not provide loans to UNLISTED company employees'
    };
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < axisFinConfig.minSalary) {
    return { eligible: false, reason: `Minimum salary of ₹${axisFinConfig.minSalary.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const salaryBand = getSalaryBand(incomeForCalculation, axisFinConfig.multiplierTable);

  if (!salaryBand) {
    return { eligible: false, reason: 'Salary does not fall within any eligible band', isBTMode: isBT };
  }

  // Logic Bridge: Support govtMultiplier override
  let multiplier = isGovtEmployee && govtMultiplier ? govtMultiplier : axisFinConfig.multiplierTable[salaryBand]?.[category];

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

  const cappedFinalLoan = Math.min(finalLoanAmount, axisFinConfig.maxLoanAmount);
  const loanCapped = finalLoanAmount > axisFinConfig.maxLoanAmount;

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
  let effectiveInterestRate = interestRateOverride || axisFinConfig.interestRate;
  if (isGovtEmployee && govtROI) effectiveInterestRate = govtROI;

  const monthlyEMI = calculateEMI(cappedFinalLoan, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: axisFinConfig.id,
    bankName: axisFinConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: axisFinConfig.maxLoanAmount,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    interestRate: effectiveInterestRate,
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
