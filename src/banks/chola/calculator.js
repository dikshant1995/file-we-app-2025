import { cholaConfig } from './config.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper function to get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' ? 'A' : category;
  return getSlabRate('Chola Finance', lookupCategory, loanAmount, location, cholaConfig.interestRate);
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

// Cholamandalam Finance specific eligibility calculation
// Method: FOIR Only (Category + Salary based)
// UNLISTED category is NOT ELIGIBLE
export const calculateCholaEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
    category = 'A',
    creditScore,
    employmentType = 'salaried',
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

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const bankIncentiveConsidered = (averageIncentive || 0) * (cholaConfig.incentivePercentage || 0);
  const actualMonthlyIncome = (basicSalary || 0) + bankIncentiveConsidered;
  
  // Use actualMonthlyIncome for all subsequent calculations
  const monthlyIncomeForCalc = actualMonthlyIncome;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = existingEMI - btTotalEMI;
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
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
        eligible: false,
        reason: 'As an existing customer of Cholamandalam Finance with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility
  if (age && (age < cholaConfig.minAge || age > cholaConfig.maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${cholaConfig.minAge} and ${cholaConfig.maxAge} years. Current age: ${age}`
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
  // Logic Bridge: Support govtMaxTenure override
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : cholaConfig.maxTenureByCategory[category];

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

  // 3. Check employment type
  if (!cholaConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported`
    };
  }

  // 4. Check loan tenure
  if (loanTenure > cholaConfig.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${cholaConfig.maxLoanTenure} years`
    };
  }

  const minSalary = cholaConfig.minSalary[category];
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (!minSalary || incomeToCheck < minSalary) {
    return { eligible: false, reason: `Minimum salary for ${category} is ₹${minSalary?.toLocaleString() || 'N/A'}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;
  const foirBand = getSalaryBand(incomeForCalculation, cholaConfig.foirTable);
  // Logic Bridge: Support govtFOIR override
  let lookupCategoryFOIR = category === 'Govt' ? 'A' : category;
  let foirPercentage = (isGovtEmployee && govtFOIR) ? (govtFOIR / 100) : cholaConfig.foirTable[foirBand]?.[lookupCategoryFOIR];

  if (!foirPercentage) {
    return { eligible: false, reason: `FOIR not defined for category ${category} at salary band ${foirBand}`, isBTMode: isBT };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = existingEMI + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: 'Existing EMI exceeds FOIR limit'
    };
  }

  // Pass 1: Preliminary ROI for initial calculation
  const baseRate = cholaConfig.interestRate;

  // Calculate preliminary loan amount based on available EMI using base rate
  const preliminaryLoanAmount = calculatePrincipalFromEMI(availableEMI, baseRate, cappedTenureYears);

  // Pass 2: Get final ROI based on preliminary loan amount
  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = getInterestRateForLoan(category, preliminaryLoanAmount, userData.city || userData.state);

  const effectiveInterestRate = finalInterestRate;

  // Recalculate loan amount with final effective interest rate
  const calculatedLoanAmount = calculatePrincipalFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);

  // 9. Final loan = minimum of calculated and desired
  const finalLoanAmount = Math.min(
    calculatedLoanAmount,
    desiredLoanAmount || Infinity
  );

  const cappedFinalLoan = Math.min(finalLoanAmount, cholaConfig.maxLoanAmount);
  const loanCapped = finalLoanAmount > cholaConfig.maxLoanAmount;

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
      originalIncome: monthlyIncomeForCalc,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const finalEMI = calculateEMI(cappedFinalLoan, cholaConfig.interestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: cholaConfig.id,
    bankName: cholaConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: cholaConfig.maxLoanAmount,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    interestRate: effectiveInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: finalEMI,
    category: category,
    calculationMethod: 'FOIR Only',
    incentivePercentage: cholaConfig.incentivePercentage,
    incentiveConsidered: bankIncentiveConsidered,
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
