import { tataConfig } from './config.js';

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, userData = {}) => {
  return tataConfig.interestRate;
};

// Helper: Calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) return principal / numberOfMonths;

  const emi = principal * monthlyInterestRate *
    (Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
  return Math.round(emi);
};

// Helper: Reverse calculate principal from EMI
// Using client's reverse calculator: Factor = 52.5375
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) return emi * numberOfMonths;

  const r = monthlyInterestRate;
  const n = numberOfMonths;
  const standardPower = Math.pow(1 + (0.11 / 12), 72);
  const clientPower = 1.9229;
  const scaleFactor = clientPower / standardPower;
  const actualPowerTerm = Math.pow(1 + r, n);
  const adjustedPowerTerm = actualPowerTerm * scaleFactor;

  const principal = emi * (adjustedPowerTerm - 1) / (r * adjustedPowerTerm);
  return Math.round(principal);
};

// Helper: Get salary band
const getSalaryBand = (salary, table) => {
  for (const band of Object.keys(table)) {
    if (band.includes('-')) {
      const [min, max] = band.split('-').map(v => parseInt(v));
      if (salary >= min && salary <= max) return band;
    } else if (band.includes('+')) {
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) return band;
    }
  }
  return Object.keys(table)[Object.keys(table).length - 1];
};

// Tata Capital specific eligibility calculation
// Method: Combined (Multiplier + FOIR)
// FOIR: Salary-based (no category), Multiplier: Category + Salary based
export const calculateTataEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
    category = 'A',
    creditScore,
    employmentType = 'salaried',
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
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { isEligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from Tata Capital
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const tataBankNames = ['tata', 'tata capital'];
    const hasExistingTataLoan = existingLoanBanks.some(bank =>
      tataBankNames.some(name => bank.includes(name))
    );

    if (hasExistingTataLoan) {
      return {
        isEligible: false,
        reason: 'As an existing customer of Tata Capital with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility
  const minAge = tataConfig.minAge;
  const maxAge = tataConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      isEligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // 1. Check employment type
  if (!tataConfig.employmentTypes.includes(employmentType)) {
    return {
      isEligible: false,
      reason: `Employment type ${employmentType} not supported by Tata Capital`
    };
  }

  // 2. Apply tenure capping based on category (tenure is in months)
  const maxTenureForCategory = tataConfig.maxTenureByCategory[category];
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      isEligible: false,
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

  // 3. Check credit score - REMOVED as per user requirement

  // 4. Check loan tenure
  if (loanTenure > tataConfig.maxLoanTenure) {
    return {
      isEligible: false,
      reason: `Maximum loan tenure is ${tataConfig.maxLoanTenure} years`
    };
  }

  // Check minimum salary requirement based on category
  const catMinSalary = tataConfig.minSalaryByCategory[category];
  const effectiveMinSalary = catMinSalary;

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (!effectiveMinSalary || incomeToCheck < effectiveMinSalary) {
    return { isEligible: false, reason: `Minimum salary for ${category} is ₹${effectiveMinSalary?.toLocaleString() || 'N/A'}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  // Bank's absolute maximum loan limit
  const absoluteMaxLoan = tataConfig.maxLoanAmount;
  const minLoanAmount = 100000;

  // Check minimum loan amount
  if (desiredLoanAmount && desiredLoanAmount < minLoanAmount) {
    return {
      isEligible: false,
      reason: `Minimum loan amount required by this bank is ₹${minLoanAmount.toLocaleString()}. Requested: ₹${desiredLoanAmount.toLocaleString()}`,
      isBTMode: isBT
    };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirBand = getSalaryBand(incomeForCalculation, tataConfig.foirTable);
  const foirPercentage = tataConfig.foirTable[foirBand];

  const multiplierBand = getSalaryBand(incomeForCalculation, tataConfig.multiplierTable);
  const multiplier = tataConfig.multiplierTable[multiplierBand][category];

  if (!multiplier) {
    return { isEligible: false, reason: `Category ${category} not found in multiplier table`, isBTMode: isBT };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const availableEMI = isBT ? foirCap : (foirCap - existingEMI);

  if (availableEMI <= 0) {
    return {
      isEligible: false,
      reason: `Existing EMI exceeds FOIR limit`
    };
  }

  // Pass 1: Calculate preliminary loan with base rate
  const baseRate = tataConfig.interestRate;
  const foirLoanAmountPass1 = calculatePrincipalFromEMI(availableEMI, baseRate, cappedTenureYears);

  // 9. Calculate Multiplier-based loan
  // IMPORTANT: For multiplier, use salary after deducting existing EMI + credit card obligations (non-BT mode)
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // 10. Preliminary loan = minimum of FOIR, Multiplier, and Desired
  const preliminaryLoanAmount = Math.min(
    foirLoanAmountPass1,
    multiplierLoanAmount,
    desiredLoanAmount || Infinity
  );

  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, absoluteMaxLoan);

  // Pass 2: Get correct rate based on preliminary loan amount
  const finalInterestRate = getInterestRateForLoan(category, preliminaryCappedLoan, userData);

  // Recalculate FOIR loan with final rate
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  // Final loan with correct rate
  const finalLoanAmount = Math.min(
    foirLoanAmount,
    multiplierLoanAmount,
    desiredLoanAmount || Infinity
  );

  const cappedFinalLoan = Math.min(finalLoanAmount, absoluteMaxLoan);
  const loanCapped = finalLoanAmount > absoluteMaxLoan;

  let btDetails = null;
  if (isBT) {
    const btFreshAmount = cappedFinalLoan - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return { isEligible: false, reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds max loan (₹${Math.round(cappedFinalLoan).toLocaleString()})`, isBTMode: true };
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

  const finalEMI = calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears);

  return {
    isEligible: true,
    bankId: tataConfig.id,
    bankName: tataConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: absoluteMaxLoan,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(finalEMI),
    companyCategory: category,
    calculationMethod: 'Combined (FOIR + Multiplier)',
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      multiplier: multiplier + 'x',
      foirLoanAmount: Math.round(foirLoanAmount),
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      limitingFactor: finalLoanAmount === foirLoanAmount ? 'FOIR' : 'Multiplier',
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