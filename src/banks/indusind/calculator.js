import { indusindConfig } from './config.js';
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
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  if (!emi || emi <= 0) return 0;
  const monthlyInterestRate = (annualInterestRate || 9.99) / 12 / 100;
  const numberOfMonths = (tenureInYears || 5) * 12;

  if (monthlyInterestRate === 0) {
    return emi * numberOfMonths;
  }

  const r = monthlyInterestRate;
  const n = numberOfMonths;
  const principal = emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));

  return Math.round(principal);
};

/**
 * IndusInd Bank Interest Rate Lookup (Factor Dependency Flow)
 * 1. Factor 1: Category (Super A, A, B, Govt vs C)
 * 2. Factor 2: Sanctioned Loan Amount
 */
export const getIndusindInterestRate = (category, loanAmount) => {
  const catUpper = String(category || '').toUpperCase().trim();
  const isCatC = catUpper === 'C' || catUpper === 'CATGC' || catUpper === 'CAT C';
  const amount = Number(loanAmount) || 0;

  if (isCatC) {
    if (amount >= 1500000) return 10.60;
    if (amount >= 500000) return 13.00;
    return 13.50;
  } else {
    // Super A, A, B, Govt
    if (amount >= 1000000) return 9.99;
    if (amount >= 500000) return 12.00;
    return 12.50;
  }
};

/**
 * IndusInd Bank FOIR & Multiplier Lookup (Factor Dependency Flow)
 */
export const getIndusindFoirAndMultiplier = (category, monthlyIncome, hasHlOrLap = false, livingStatus = 'owned') => {
  const catUpper = String(category || '').toUpperCase().trim();
  const isCatC = catUpper === 'C' || catUpper === 'CATGC' || catUpper === 'CAT C';
  const income = Number(monthlyIncome) || 0;

  let multiplier = 20;
  let foirPercentage = 0.50;

  if (isCatC) {
    multiplier = 21;
    if (income >= 35000) {
      foirPercentage = 0.60;
    } else {
      foirPercentage = 0.50;
    }
  } else {
    // Super A, A, B, Govt
    if (income >= 125000) {
      multiplier = 30;
    } else if (income >= 75000) {
      multiplier = 25;
    } else {
      multiplier = 20;
    }

    if (income >= 50000) {
      if (hasHlOrLap) {
        foirPercentage = 0.75; // Excel: HL or LAP running -> up to 75% FOIR
      } else if (String(livingStatus).toLowerCase() === 'rented') {
        foirPercentage = 0.65;
      } else {
        foirPercentage = 0.70;
      }
    } else if (income >= 35000) {
      foirPercentage = 0.60;
    } else {
      foirPercentage = 0.50;
    }
  }

  return { multiplier, foirPercentage };
};

// IndusInd Bank eligibility calculator
export const calculateIndusindEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure = 5,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation = 0, // 5% credit card obligation from active CC balances
    category = 'Super A',
    creditScore,
    cibilScore,
    employmentType = 'salaried',
    age = 30,
    existingLoanBanks = [],
    livingStatus = 'owned',
    existingLoanTypes = [],
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    multiplierOverride,
    foirOverride,
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
    : (indusindConfig.incentivePercentage || 0);

  const effectiveIncentiveMonths = incentiveMonthsOverride !== undefined 
    ? incentiveMonthsOverride 
    : 3;

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const actualMonthlyIncome = (basicSalary || monthlyIncome || 0) + bankIncentiveConsidered;
  const monthlyIncomeForCalc = actualMonthlyIncome;

  // IndusInd Bank policy check: Category D and Unlisted are not funded
  const categoryNormalized = String(category || '').toUpperCase().trim();
  if (categoryNormalized === 'D' || categoryNormalized === 'CATGD' || categoryNormalized === 'CAT D' || categoryNormalized === 'UNLISTED') {
    return {
      eligible: false,
      reason: `IndusInd Bank policy does not fund Category ${category} companies. Only Category Super A, A, B, C, and Govt are eligible.`
    };
  }

  // 1. Balance Transfer Restrictions
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    if (loansForBT.some(l => l.type === 'Credit Card' || l.type === 'credit_card' || l.loanType === 'credit_card')) {
      return { eligible: false, reason: 'IndusInd Bank policy does not allow Credit Card Balance Transfer (CC BT Not Allowed)', isBTMode: true };
    }
    nonBTLoansEMI = existingEMI - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // 2. Existing IndusInd Loan Check
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const indusindNames = ['indusind', 'indusind bank'];
    const hasExistingIndusindLoan = existingLoanBanks.some(bank =>
      indusindNames.some(name => String(bank).toLowerCase().includes(name))
    );

    if (hasExistingIndusindLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of IndusInd Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // 3. Minimum In-Hand Salary Check (₹25,000 required across all categories)
  const minSalaryRequired = 25000;
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < minSalaryRequired) {
    return { 
      eligible: false, 
      reason: `IndusInd Bank requires minimum monthly salary of ₹${minSalaryRequired.toLocaleString()} (Current: ₹${Math.round(incomeToCheck).toLocaleString()})`, 
      isBTMode: isBT 
    };
  }

  // 4. Age Check (21 to 60 Years at maturity)
  const userAge = Number(age) || 30;
  if (userAge < 21 || userAge > 60) {
    return {
      eligible: false,
      reason: `Age must be between 21 and 60 years for IndusInd Bank. Current age: ${userAge}`
    };
  }

  // 5. Calculate Tenure
  let maxTenureMonths = 84; // Excel: 84 Months (7 Years)
  const effectiveCibil = creditScore !== undefined ? creditScore : (cibilScore !== undefined ? cibilScore : 750);
  const isCibilMinusOne = effectiveCibil === -1 || effectiveCibil === '-1' || effectiveCibil === 0;
  
  if (isCibilMinusOne) {
    maxTenureMonths = 48; // Excel Policy: CIBIL -1 H TO 48 TENURE
  }

  // Capped by Retirement Age of 60
  const maxAgeAllowedMonths = Math.max(0, (60 - userAge) * 12);
  const cappedTenureMonths = Math.min(maxTenureMonths, maxAgeAllowedMonths);
  const cappedTenureYears = cappedTenureMonths / 12;

  if (cappedTenureMonths <= 0) {
    return {
      eligible: false,
      reason: `Age ${userAge} exceeds maximum retirement age limit of 60 years.`
    };
  }

  // 6. FOIR & Multipliers Determination (Factor Dependency Flow)
  const hasHlOrLap = (existingLoanTypes && 
    (existingLoanTypes.includes('Home Loan') || 
     existingLoanTypes.includes('Loan Against Property') ||
     existingLoanTypes.includes('HL') ||
     existingLoanTypes.includes('LAP'))) ||
    (Array.isArray(loansForBT) && loansForBT.some(l => l.type === 'Home Loan' || l.type === 'LAP'));

  const factorLookup = getIndusindFoirAndMultiplier(categoryNormalized, monthlyIncomeForCalc, hasHlOrLap, livingStatus);

  let multiplier = multiplierOverride || ((isGovtEmployee && govtMultiplier) ? govtMultiplier : factorLookup.multiplier);
  let foirPercentage = foirOverride ? (foirOverride / 100) : ((isGovtEmployee && govtFOIR) ? (govtFOIR / 100) : factorLookup.foirPercentage);

  // Calculate Capacity
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeToCheck : (monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing monthly obligations (₹${Math.round(totalObligations).toLocaleString()}) exceed maximum allowed FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // Pass 1: Preliminary ROI & Principal Estimation
  const preliminaryRoi = getIndusindInterestRate(categoryNormalized, 1000000);
  const preliminaryFoirLoanAmount = calculatePrincipalFromEMI(availableEMI, preliminaryRoi, cappedTenureYears);

  const preliminaryLoanAmount = Math.min(
    multiplierLoanAmount,
    preliminaryFoirLoanAmount,
    desiredLoanAmount || Infinity
  );

  // Category Loan Capping (Excel: Cat C: 15L, Cat A/B/Govt/Super A: 75L)
  const isCatC = categoryNormalized === 'C' || categoryNormalized === 'CATGC' || categoryNormalized === 'CAT C';
  const categoryMaxLoan = isCatC ? 1500000 : 7500000;
  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, categoryMaxLoan);

  // Pass 2: Exact ROI Lookup based on Category + Sanctioned Loan Amount
  let effectiveInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) {
    effectiveInterestRate = govtROI;
  } else if (!effectiveInterestRate) {
    effectiveInterestRate = getIndusindInterestRate(categoryNormalized, preliminaryCappedLoan);
  }

  // Recalculate FOIR Loan Capacity with Exact ROI
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);

  // Final Loan Amount Determination
  const finalLoanAmount = Math.min(
    multiplierLoanAmount,
    foirLoanAmount,
    desiredLoanAmount || Infinity
  );

  const maxLoanCapAmount = Math.min(finalLoanAmount, categoryMaxLoan);
  const loanCapped = finalLoanAmount > categoryMaxLoan;

  const monthlyEMI = calculateEMI(maxLoanCapAmount, effectiveInterestRate, cappedTenureYears);

  let btDetails = null;
  if (isBT) {
    const btFreshAmount = maxLoanCapAmount - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return { eligible: false, reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds max loan capacity (₹${Math.round(maxLoanCapAmount).toLocaleString()})`, isBTMode: true };
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

  return {
    eligible: true,
    bankId: indusindConfig.id,
    bankName: indusindConfig.name,
    loanAmount: Math.round(maxLoanCapAmount),
    maxLoanCap: categoryMaxLoan,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    bachelorCapped: false,
    bachelorCapReason: null,
    interestRate: effectiveInterestRate,
    appliedRoi: effectiveInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    monthlyEMI: Math.round(monthlyEMI),
    multiplier: multiplier,
    foirPercentage: foirPercentage,
    availableEMI: Math.round(availableEMI),
    foirLoanAmount: Math.round(foirLoanAmount),
    multiplierLoanAmount: Math.round(multiplierLoanAmount),
    calculationMethod: 'Dual (FOIR & Multiplier)',
    category: category,
    details: {
      companyCategory: category,
      multiplier: multiplier + 'x',
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      foirLoanAmount: Math.round(foirLoanAmount),
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      creditCardObligation: Math.round(creditCardObligation || 0),
      ccObligationPercent: '5%',
      totalObligations: Math.round(totalObligations),
      categoryMaxLoanCap: categoryMaxLoan,
      cibilMinusOneCapped: isCibilMinusOne
    },
    ...btDetails
  };
};
