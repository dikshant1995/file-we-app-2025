import { bandhanConfig } from './config.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper function to get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' ? 'A' : category;
  return getSlabRate('Bandhan Bank', lookupCategory, loanAmount, location, bandhanConfig.interestRate);
};

// Function to calculate EMI using standard amortization formula
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  if (!principal || principal <= 0) return 0;
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return Math.round(principal / numberOfMonths);
  }

  const emi = principal * monthlyInterestRate *
    (Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);

  return Math.round(emi);
};

// Function to calculate loan amount from EMI using standard amortization formula
const calculateLoanAmountFromEMI = (emi, annualInterestRate, tenureInYears) => {
  if (!emi || emi <= 0) return 0;
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return Math.round(emi * numberOfMonths);
  }

  const r = monthlyInterestRate;
  const n = numberOfMonths;
  const loanAmount = emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  return Math.round(loanAmount);
};

// Function to get FOIR percentage based on net monthly salary (Excel Sheet: BANDHAN BANK - Section 2)
const getFoirPercentage = (salary) => {
  if (salary > 75000) return 0.70;
  if (salary >= 50001) return 0.65;
  if (salary >= 30001) return 0.60;
  return 0.50;
};

// Function to get multiplier based on category, income, and tenure (Excel Sheet: BANDHAN BANK - Section 6)
const getBandhanMultiplier = (category, salary, tenureMonths = 60) => {
  const catUpper = String(category || 'B').toUpperCase().trim();
  let matrixKey = 'AB_GOVT';
  if (catUpper === 'C') matrixKey = 'C';
  else if (catUpper === 'D') matrixKey = 'D';

  let incomeKey = '<=30000';
  if (salary > 75000) incomeKey = '>75000';
  else if (salary >= 50001) incomeKey = '50001-75000';
  else if (salary >= 30001) incomeKey = '30001-50000';

  let tenureBucket = 60;
  if (tenureMonths <= 12) tenureBucket = 12;
  else if (tenureMonths <= 24) tenureBucket = 24;
  else if (tenureMonths <= 36) tenureBucket = 36;
  else if (tenureMonths <= 48) tenureBucket = 48;
  else tenureBucket = 60;

  const row = bandhanConfig.multiplierMatrix[matrixKey]?.[incomeKey];
  return row ? (row[tenureBucket] || row[60] || 20) : 20;
};

// Bandhan Bank specific eligibility calculation
export const calculateBandhanEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI,
    creditCardObligation,
    totalCreditCardLimit,
    creditScore,
    employmentType,
    interestRate,
    age,
    category,
    existingLoanBanks,
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
    govtMultiplier,
    govtMaxTenure,
    foirOverride,
    multiplierOverride,
    maxLoanOverride,
    // Balance Transfer fields
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding,
    // Incentive Overrides
    incentivePercentageOverride
  } = userData;

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : 0.25;

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const actualMonthlyIncome = (basicSalary || monthlyIncome || 0) + bankIncentiveConsidered;
  const monthlyIncomeForCalc = actualMonthlyIncome;

  // ========== CC BT RESTRICTION (Bandhan Bank does not allow CC BT) ==========
  if (Array.isArray(loansForBT) && loansForBT.length > 0) {
    const hasCcInBt = loansForBT.some(loan => {
      const type = (loan.loanType || loan.type || '').toLowerCase();
      return type.includes('credit') || type.includes('card') || type === 'cc';
    });
    if (hasCcInBt) {
      return {
        eligible: false,
        reason: 'Bandhan Bank does not allow Credit Card Balance Transfer. Only Personal Loan Balance Transfer is accepted.',
        isBTMode: true
      };
    }
  }

  // ========== BALANCE TRANSFER MODE DETECTION ==========
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = (existingEMI || 0) - (btTotalEMI || 0);
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;

    if (adjustedIncome <= 0) {
      return {
        eligible: false,
        reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains for Balance Transfer`,
        isBTMode: true
      };
    }
  }

  // CHECK: If customer already has a personal loan from Bandhan Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const bandhanBankNames = ['bandhan', 'bandhan bank'];
    const hasExistingBandhanLoan = existingLoanBanks.some(bank =>
      bandhanBankNames.some(name => String(bank).toLowerCase().includes(name))
    );

    if (hasExistingBandhanLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Bandhan Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility (21 to 60 Years)
  const minAge = bandhanConfig.minAge;
  const maxAge = bandhanConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (employmentType && !bandhanConfig.employmentTypes.includes(employmentType.toLowerCase())) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by Bandhan Bank`
    };
  }

  const companyCategory = category || 'B';
  const catUpper = String(companyCategory).toUpperCase().trim();
  const minSalaryRequired = catUpper === 'D' ? 40000 : 25000;
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;

  if (incomeToCheck < minSalaryRequired) {
    return {
      eligible: false,
      reason: `Minimum monthly salary required for Category ${companyCategory} is ₹${minSalaryRequired.toLocaleString()} (Policy: 25K / CAT D 40K)`,
      isBTMode: isBT
    };
  }

  // Tenure handling (flat 60 Months cap across all categories)
  const cappedTenureMonths = isGovtEmployee && govtMaxTenure ? govtMaxTenure : 60;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Credit Card Obligation: Excel Policy (3% of limit, BUT if total limit < 3x salary -> 0% obligation)
  let effectiveCcObligation = creditCardObligation || 0;
  if (totalCreditCardLimit && totalCreditCardLimit > 0) {
    if (totalCreditCardLimit < (monthlyIncomeForCalc * 3)) {
      effectiveCcObligation = 0; // "SALARY KA BELOW 3 TIME NO OBLIGATION"
    } else {
      effectiveCcObligation = totalCreditCardLimit * 0.03; // "3% OBLIGATE"
    }
  }

  // FOIR & Multiplier Calculation
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;
  const foirPercentage = foirOverride 
    ? (foirOverride / 100) 
    : (isGovtEmployee && govtFOIR ? (govtFOIR / 100) : getFoirPercentage(incomeForCalculation));

  const totalObligations = (existingEMI || 0) + effectiveCcObligation;
  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: 'Existing monthly debt obligations exceed the maximum permissible FOIR threshold',
      isBTMode: isBT
    };
  }

  // Multiplier method
  const multiplier = multiplierOverride || (isGovtEmployee && govtMultiplier ? govtMultiplier : getBandhanMultiplier(companyCategory, incomeForCalculation, cappedTenureMonths));
  const availableSalary = isBT ? incomeForCalculation : Math.max(0, monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // PASS 1: Preliminary Loan Amount
  const baseRate = bandhanConfig.interestRate;
  const preliminaryFoirLoanAmount = calculateLoanAmountFromEMI(availableEMI, baseRate, cappedTenureYears);
  const bankMaxLoanCap = maxLoanOverride || bandhanConfig.maxLoanAmount; // ₹25 Lakhs flat

  const preliminaryMaxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    preliminaryFoirLoanAmount
  );
  const preliminaryLoanAmount = Math.min(preliminaryMaxLoanAmount, bankMaxLoanCap);

  // PASS 2: Effective Interest Rate
  let finalInterestRate = interestRateOverride || interestRate;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = getInterestRateForLoan(companyCategory, preliminaryLoanAmount, userData.city || userData.state);

  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, finalInterestRate, cappedTenureYears);
  const calculatedLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    foirLoanAmount
  );
  const finalLoanAmount = Math.min(calculatedLoanAmount, bankMaxLoanCap);
  const emi = calculateEMI(finalLoanAmount, finalInterestRate, cappedTenureYears);

  // Check minimum loan threshold (₹1 Lakh)
  if (finalLoanAmount < bandhanConfig.minLoanAmount) {
    return {
      eligible: false,
      reason: `Calculated eligibility (₹${finalLoanAmount.toLocaleString()}) is below Bandhan Bank minimum loan limit of ₹1 Lakh`,
      isBTMode: isBT
    };
  }

  return {
    eligible: true,
    maxLoanAmount: Math.round(finalLoanAmount),
    calculatedLoanAmount: Math.round(finalLoanAmount),
    interestRate: Number(finalInterestRate),
    tenure: cappedTenureYears,
    tenureMonths: cappedTenureMonths,
    emi: Math.round(emi),
    foir: Number((foirPercentage * 100).toFixed(1)),
    multiplier: multiplier,
    category: companyCategory,
    bankName: 'Bandhan Bank',
    isBTMode: isBT,
    details: {
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      foirLoanAmount: Math.round(foirLoanAmount),
      availableEMI: Math.round(availableEMI),
      zeroCcObligationApplied: totalCreditCardLimit > 0 && totalCreditCardLimit < (monthlyIncomeForCalc * 3),
      maxCapApplied: finalLoanAmount >= bankMaxLoanCap
    }
  };
};
