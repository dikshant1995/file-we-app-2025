import { hdfcConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Standard financial EMI formula
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  if (!principal || principal <= 0) return 0;
  const monthlyInterestRate = (annualInterestRate || 9.99) / 12 / 100;
  const numberOfMonths = (tenureInYears || 5) * 12;

  if (monthlyInterestRate === 0) {
    return principal / numberOfMonths;
  }

  const emi = principal * monthlyInterestRate *
    (Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);

  return Math.round(emi);
};

// Standard financial reverse formula: Calculate principal capacity from available EMI
const calculateLoanAmountFromEMI = (emi, annualInterestRate, tenureInYears) => {
  if (!emi || emi <= 0) return 0;
  const monthlyInterestRate = (annualInterestRate || 9.99) / 12 / 100;
  const numberOfMonths = (tenureInYears || 5) * 12;

  if (monthlyInterestRate === 0) {
    return emi * numberOfMonths;
  }

  const r = monthlyInterestRate;
  const n = numberOfMonths;
  const loanAmount = emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));

  return Math.round(loanAmount);
};

/**
 * HDFC Bank Interest Rate Lookup (Factor Dependency Flow)
 * 1. Factor 1: Category (Super A, A, B, Govt vs C, D)
 * 2. Factor 2: Sanctioned Loan Amount (>20L, 15L-20L, 10L-15L, 5L-10L, <5L)
 */
export const getHdfcInterestRate = (category, loanAmount, location = null) => {
  const catUpper = String(category || '').toUpperCase().trim();
  const isC = catUpper === 'C' || catUpper === 'CATGC' || catUpper === 'CAT C' || catUpper === 'D' || catUpper === 'CATGD';
  const amt = Number(loanAmount) || 0;

  if (isC) {
    if (amt >= 2000000) return 10.25;
    if (amt >= 1500000) return 10.50;
    if (amt >= 1000000) return 11.00;
    if (amt >= 500000) return 11.50;
    return 13.00;
  } else {
    // Super A, A, B, Govt
    if (amt >= 2000000) return 9.99;
    if (amt >= 1500000) return 10.15;
    if (amt >= 1000000) return 10.50;
    if (amt >= 500000) return 11.50;
    return 12.50;
  }
};

/**
 * HDFC Bank FOIR & Multiplier Lookup (Factor Dependency Flow)
 */
export const getHdfcFoirAndMultiplier = (category, monthlyIncome) => {
  const catUpper = String(category || '').toUpperCase().trim();
  const income = Number(monthlyIncome) || 0;

  let multiplier = 20;
  let foirPercentage = 0.50;

  const isSuperAorAorGovt = catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'CATA' || catUpper === 'CATGA' || catUpper === 'GOVT';
  const isCatB = catUpper === 'B' || catUpper === 'CATB' || catUpper === 'CATGB';

  if (isSuperAorAorGovt) {
    if (income > 75000) {
      multiplier = 27;
      foirPercentage = 0.70;
    } else if (income >= 50000) {
      multiplier = 25;
      foirPercentage = 0.60;
    } else {
      multiplier = 20;
      foirPercentage = 0.50;
    }
  } else if (isCatB) {
    if (income > 75000) {
      multiplier = 25;
      foirPercentage = 0.65;
    } else if (income >= 50000) {
      multiplier = 22;
      foirPercentage = 0.55;
    } else {
      multiplier = 18;
      foirPercentage = 0.50;
    }
  } else {
    // Cat C & Cat D
    if (income > 75000) {
      multiplier = 20;
      foirPercentage = 0.50;
    } else if (income >= 50000) {
      multiplier = 18;
      foirPercentage = 0.45;
    } else {
      multiplier = 15;
      foirPercentage = 0.40;
    }
  }

  return { multiplier, foirPercentage };
};

// HDFC Bank specific eligibility calculation
export const calculateHdfcEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure = 5,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation = 0, // 5% credit card obligation from active CC balances
    companyName = '',
    category = 'Super A',
    creditScore,
    cibilScore,
    employmentType = 'salaried',
    interestRate,
    age = 30,
    existingLoanBanks = [],
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    multiplierOverride,
    foirOverride,
    maxTenureOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
    govtMultiplier,
    govtMaxTenure,
    // Balance Transfer fields
    isBTMode,
    loansForBT = [],
    btTotalEMI = 0,
    btTotalOutstanding = 0,
    // Incentive Overrides
    incentivePercentageOverride,
    incentiveMonthsOverride
  } = userData;

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : (hdfcConfig.incentivePercentage || 0);

  const effectiveIncentiveMonths = incentiveMonthsOverride !== undefined 
    ? incentiveMonthsOverride 
    : 3;

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const actualMonthlyIncome = (basicSalary || monthlyIncome || 0) + bankIncentiveConsidered;
  const monthlyIncomeForCalc = actualMonthlyIncome;

  const categoryNormalized = String(category || '').toUpperCase().trim();

  // 1. Balance Transfer Restrictions
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = (existingEMI || 0) - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;

    if (adjustedIncome <= 0) {
      return {
        eligible: false,
        reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains for Balance Transfer calculation`,
        isBTMode: true
      };
    }
  }

  // 2. Existing HDFC Loan Check
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const hdfcBankNames = ['hdfc', 'hdfc bank'];
    const hasExistingHdfcLoan = existingLoanBanks.some(bank =>
      hdfcBankNames.some(name => String(bank).toLowerCase().includes(name))
    );

    if (hasExistingHdfcLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of HDFC Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // 3. Minimum Salary Requirement (₹25,000 for all categories)
  const categoryMinSalary = 25000;
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < categoryMinSalary) {
    return {
      eligible: false,
      reason: `Minimum monthly salary required for HDFC Bank is ₹${categoryMinSalary.toLocaleString()} (Current: ₹${Math.round(incomeToCheck).toLocaleString()})`,
      isBTMode: isBT
    };
  }

  // 4. Age Check (21 to 60 Years at maturity)
  const userAge = Number(age) || 30;
  if (userAge < 21 || userAge > 60) {
    return {
      eligible: false,
      reason: `Age must be between 21 and 60 years for HDFC Bank. Current age: ${userAge}`
    };
  }

  // 4.5 Work Experience Check (Minimum 1 Year / 12 Months overall work experience from Row 12)
  const totalExp = Number(userData.totalWorkExperience || userData.workExperienceMonths || (userData.workExperience === 'above_24m' ? 25 : (userData.workExperience === '3m_to_24m' ? 12 : 2)) || 0);
  if (totalExp > 0 && totalExp < 12) {
    return {
      eligible: false,
      reason: `HDFC Bank policy requires minimum 1 year (12 months) overall work experience (Excel Row 12: 1 YEAR +). Found: ${totalExp} months.`
    };
  }

  // 5. Tenure Determination by Category
  let maxTenureForCategory = 84; // Super A, A, B, Govt: 84M
  if (categoryNormalized === 'C' || categoryNormalized === 'CATGC' || categoryNormalized === 'CAT C') {
    maxTenureForCategory = 72; // Cat C: 72M
  } else if (categoryNormalized === 'D' || categoryNormalized === 'CATGD' || categoryNormalized === 'CAT D') {
    maxTenureForCategory = 60; // Cat D: 60M
  }

  if (maxTenureOverride) {
    maxTenureForCategory = maxTenureOverride;
  } else if (isGovtEmployee && govtMaxTenure) {
    maxTenureForCategory = govtMaxTenure;
  }

  const maxAgeAllowedMonths = Math.max(0, (60 - userAge) * 12);
  const cappedTenureMonths = Math.min(maxTenureForCategory, maxAgeAllowedMonths);
  const cappedTenureYears = cappedTenureMonths / 12;

  if (cappedTenureMonths <= 0) {
    return {
      eligible: false,
      reason: `Age ${userAge} exceeds maximum retirement age limit of 60 years.`
    };
  }

  // 6. FOIR & Multiplier Lookup (Factor Dependency Flow)
  const factorLookup = getHdfcFoirAndMultiplier(categoryNormalized, monthlyIncomeForCalc);

  let multiplier = multiplierOverride || ((isGovtEmployee && govtMultiplier) ? govtMultiplier : factorLookup.multiplier);
  let foirPercentage = foirOverride ? (foirOverride / 100) : ((isGovtEmployee && govtFOIR) ? (govtFOIR / 100) : factorLookup.foirPercentage);

  // Multiplier Loan Amount Calculation
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeToCheck : (monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // FOIR Capacity Calculation
  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing monthly obligations (₹${Math.round(totalObligations).toLocaleString()}) exceed maximum allowed FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // Pass 1: Preliminary ROI & Principal Estimation
  const baseRate = hdfcConfig.interestRate;
  const preliminaryFoirLoanAmount = calculateLoanAmountFromEMI(availableEMI, baseRate, cappedTenureYears);

  const preliminaryMaxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    preliminaryFoirLoanAmount
  );

  const preliminaryLoanAmount = Math.min(preliminaryMaxLoanAmount, hdfcConfig.maxLoanAmount);

  // Pass 2: Get Exact ROI based on Category + Sanctioned Loan Amount
  let finalInterestRate = interestRateOverride || interestRate;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) {
    finalInterestRate = getHdfcInterestRate(categoryNormalized, preliminaryLoanAmount, userData.city || userData.state);
  }

  const effectiveInterestRate = finalInterestRate;

  // Recalculate FOIR loan amount with exact effective interest rate
  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);

  // Take minimum of Multiplier, FOIR, and desired amount
  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    foirLoanAmount
  );

  const maxLoanCapAmount = Math.min(maxLoanAmount, hdfcConfig.maxLoanAmount);
  const loanCapped = maxLoanAmount > hdfcConfig.maxLoanAmount;

  let btFreshAmount = 0;
  let btDetails = null;

  if (isBT) {
    btFreshAmount = maxLoanCapAmount - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return {
        eligible: false,
        reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds maximum eligible loan capacity (₹${Math.round(maxLoanCapAmount).toLocaleString()})`,
        isBTMode: true,
        maxEligibleLoan: Math.round(maxLoanCapAmount),
        btOutstanding: btTotalOutstanding
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
      totalNonBTObligations: Math.round(nonBTLoansEMI + (creditCardObligation || 0)),
      originalIncome: monthlyIncomeForCalc,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const monthlyEMI = calculateEMI(maxLoanCapAmount, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: hdfcConfig.id,
    bankName: hdfcConfig.name,
    loanAmount: Math.round(maxLoanCapAmount),
    maxLoanCap: hdfcConfig.maxLoanAmount,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(maxLoanAmount) : null,
    bachelorCapped: false,
    bachelorCapReason: null,
    regularMaxLoan: Math.round(maxLoanCapAmount),
    bachelorMaxLoanAmount: null,
    interestRate: effectiveInterestRate,
    appliedRoi: effectiveInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: cappedTenureMonths !== (loanTenure * 12),
    requestedTenure: loanTenure,
    requestedTenureMonths: loanTenure * 12,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    companyCategory: category,
    calculationMethod: 'Dual (FOIR & Multiplier)',
    multiplier: multiplier,
    foirPercentage: foirPercentage,
    incentivePercentage: effectiveIncentivePercentage,
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      companyCategory: category,
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      multiplier: multiplier + 'x',
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      foirLoanAmount: Math.round(foirLoanAmount),
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      ccObligationPercent: '5%',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};
