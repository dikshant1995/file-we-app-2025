import { cholaConfig } from './config.js';
import { getBankConfig, getDynamicInterestRate } from '../../services/bankConfigService';

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

// Cholamandalam Finance specific eligibility calculation
// Method: FOIR Only (Category + Salary based)
// UNLISTED category is NOT ELIGIBLE
export const calculateCholaEligibility = (userData) => {
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
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { isEligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from Cholamandalam Finance
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const cholaBankNames = ['chola', 'cholamandalam', 'cholamandalam finance'];
    const hasExistingCholaLoan = existingLoanBanks.some(bank =>
      cholaBankNames.some(name => bank.includes(name))
    );

    if (hasExistingCholaLoan) {
      return {
        isEligible: false,
        reason: 'As an existing customer of Cholamandalam Finance with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('Cholamandalam Finance', 'ageRules', { state: userData.state, city: userData.city });
  const minAge = ageConfig ? ageConfig.minAge : cholaConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : cholaConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      isEligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // 1. Check if UNLISTED (completely ineligible)
  if (category === 'UNLISTED') {
    return {
      eligible: false,
      reason: 'Cholamandalam Finance does not provide loans to UNLISTED company employees'
    };
  }

  // 2. Apply tenure capping based on category (tenure is in months)
  const maxTenureForCategory = cholaConfig.maxTenureByCategory[category];
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

  // 3. Check employment type
  if (!cholaConfig.employmentTypes.includes(employmentType)) {
    return {
      isEligible: false,
      reason: `Employment type ${employmentType} not supported by Cholamandalam Finance`
    };
  }

  // 4. Check loan tenure
  if (loanTenure > cholaConfig.maxLoanTenure) {
    return {
      isEligible: false,
      reason: `Maximum loan tenure is ${cholaConfig.maxLoanTenure} years`
    };
  }

  const salConfig = getBankConfig('Cholamandalam Finance', 'employmentRules', { state: userData.state, city: userData.city });
  const catMinSalary = cholaConfig.minSalary[category];
  const effectiveMinSalary = salConfig ? salConfig.salariedMinSalary : catMinSalary;

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (!effectiveMinSalary || incomeToCheck < effectiveMinSalary) {
    return { isEligible: false, reason: `Minimum monthly income of ₹${effectiveMinSalary.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  // Get loan capping config
  const cappingConfig = getBankConfig('Cholamandalam Finance', 'loanCapping', { state: userData.state, city: userData.city });
  const absoluteMaxLoan = cappingConfig ? cappingConfig.absoluteMaxLoan : cholaConfig.maxLoanAmount;
  const minLoanAmount = cappingConfig ? cappingConfig.minLoanAmount : 100000;

  // Check minimum loan amount
  if (desiredLoanAmount && desiredLoanAmount < minLoanAmount) {
    return {
      isEligible: false,
      reason: `Minimum loan amount required by this bank is ₹${minLoanAmount.toLocaleString()}. Requested: ₹${desiredLoanAmount.toLocaleString()}`,
      isBTMode: isBT
    };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirBand = getSalaryBand(incomeForCalculation, cholaConfig.foirTable);
  const foirPercentage = cholaConfig.foirTable[foirBand]?.[category];

  if (!foirPercentage) {
    return { isEligible: false, reason: `FOIR not defined for category ${category} at salary band ${fooirBand}`, isBTMode: isBT };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = existingEMI + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      isEligible: false,
      reason: 'Existing EMI exceeds FOIR limit'
    };
  }

  // Use dynamic interest rate from Admin settings
  const dynamicRate = getDynamicInterestRate('Cholamandalam Finance', category, cappedFinalLoan || monthlyIncome * 20, { state: userData.state, city: userData.city }, cholaConfig.interestRate);

  // 8. Calculate loan amount from available EMI using capped tenure
  const calculatedLoanAmount = calculatePrincipalFromEMI(availableEMI, dynamicRate, cappedTenureYears);

  // 9. Final loan = minimum of calculated and desired
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
      return {
        isEligible: false,
        reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds max loan (₹${Math.round(cappedFinalLoan).toLocaleString()})`,
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

  const finalEMI = calculateEMI(cappedFinalLoan, cholaConfig.interestRate, cappedTenureYears);

  return {
    isEligible: true,
    bankId: cholaConfig.id,
    bankName: cholaConfig.name,
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
    monthlyEMI: Math.round(finalEMI),
    category: category,
    calculationMethod: 'FOIR Only',
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      salaryBand: foirBand,
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      maxLoanFromFOIR: Math.round(calculatedLoanAmount),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
