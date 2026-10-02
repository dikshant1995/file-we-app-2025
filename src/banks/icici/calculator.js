import { iciciConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Standard financial EMI formula
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  if (!principal || principal <= 0) return 0;
  const monthlyInterestRate = (annualInterestRate || 10.30) / 12 / 100;
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
  const monthlyInterestRate = (annualInterestRate || 10.30) / 12 / 100;
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
 * ICICI Bank Interest Rate Lookup (Factor Dependency Flow)
 * 1. Factor 1: Category & CIBIL Score
 * 2. Factor 2: Sanctioned Loan Amount (>20L, 15L-20L, 10L-15L, 5L-10L, <5L)
 */
export const getIciciInterestRate = (category, loanAmount, cibilScore = 750, monthlyIncome = 0) => {
  const catUpper = String(category || '').toUpperCase().trim();
  const isOpenMarket = catUpper.includes('OPEN') || catUpper === 'C' || catUpper === 'D' || catUpper.includes('UNLISTED');
  const amt = Number(loanAmount) || 0;
  const cibil = Number(cibilScore) || 750;
  const salary = Number(monthlyIncome) || 0;

  if (isOpenMarket) {
    if (amt >= 1000000) return 11.00;
    if (amt >= 600000) return 11.50;
    return 12.80;
  } else {
    // Super Prime, Preferred, Elite, Govt, Army
    if (cibil >= 775 && salary >= 75000 && amt >= 2000000) return 9.99; // Excel: CIBIL 775+ SALARY 75K+ LOAN 20L = 9.99%
    if (cibil >= 750 && salary >= 75000 && amt >= 2000000) return 10.30; // Excel: CIBIL 750-774 SALARY 75K+ LOAN 20L = 10.30%
    
    if (amt >= 2000000) return 10.30;
    if (amt >= 1500000) return 10.50;
    if (amt >= 1000000) return 11.00;
    if (amt >= 500000) return 11.50;
    return 12.00;
  }
};

/**
 * ICICI Bank FOIR & Category Capping Lookup (Factor Dependency Flow)
 */
export const getIciciFoirPercentage = (category, monthlyIncome, hasRunningHl = false) => {
  const catUpper = String(category || '').toUpperCase().trim();
  const isOpenMarket = catUpper.includes('OPEN') || catUpper === 'C' || catUpper === 'D' || catUpper.includes('UNLISTED');
  const income = Number(monthlyIncome) || 0;

  if (isOpenMarket) {
    if (income >= 50000) return 0.55;
    return 0.45;
  } else {
    // Super Prime, Preferred, Elite, Govt, Army
    if (hasRunningHl) return 0.70; // Excel Policy: HL RUNNING - 70% FOIR!
    if (income >= 50000) return 0.65;
    if (income >= 30000) return 0.55;
    return 0.45;
  }
};

// ICICI Bank specific eligibility calculation
export const calculateIciciEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure = 5,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation = 0, // 5% credit card obligation from active CC balances
    companyName = '',
    creditScore,
    cibilScore,
    employmentType = 'salaried',
    interestRate,
    age = 30,
    category = 'Preferred',
    existingLoanBanks = [],
    existingLoanTypes = [],
    state = '',
    city = '',
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    foirOverride,
    maxTenureOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
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
    : (iciciConfig.incentivePercentage || 0);

  const effectiveIncentiveMonths = incentiveMonthsOverride !== undefined 
    ? incentiveMonthsOverride 
    : 0;

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

  // 2. Existing ICICI Loan Check
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const iciciBankNames = ['icici', 'icici bank'];
    const hasExistingIciciLoan = existingLoanBanks.some(bank =>
      iciciBankNames.some(name => String(bank).toLowerCase().includes(name))
    );

    if (hasExistingIciciLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of ICICI Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // 3. CIBIL Score Verification (CIBIL 725+ required; CIBIL -1 is doable)
  const effectiveCibil = cibilScore !== undefined ? cibilScore : (creditScore !== undefined ? creditScore : 750);
  const isCibilMinusOne = effectiveCibil === -1 || effectiveCibil === '-1' || effectiveCibil === 0;

  if (!isCibilMinusOne && Number(effectiveCibil) < 725) {
    return {
      eligible: false,
      reason: `ICICI Bank policy strictly requires CIBIL score 725+ (Current CIBIL: ${effectiveCibil}). CIBIL -1 is doable for New to Credit applicants.`
    };
  }

  // 4. Minimum Salary Requirement (Govt 25k, Pvt 30k, Open Market 75k, NRI 2L)
  let categoryMinSalary = 30000;
  if (categoryNormalized.includes('GOVT') || employmentType === 'government') {
    categoryMinSalary = 25000;
  } else if (categoryNormalized.includes('OPEN') || categoryNormalized === 'C' || categoryNormalized === 'D' || categoryNormalized.includes('UNLISTED')) {
    categoryMinSalary = 75000;
  } else if (categoryNormalized.includes('NRI')) {
    categoryMinSalary = 200000;
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < categoryMinSalary) {
    return {
      eligible: false,
      reason: `Minimum monthly income required for ${category} category is ₹${categoryMinSalary.toLocaleString()} (Current: ₹${Math.round(incomeToCheck).toLocaleString()})${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`,
      isBTMode: isBT
    };
  }

  // 5. Work Experience Check (Minimum 1 Year / 12 Months overall work experience from Row 12)
  const totalExp = Number(userData.totalWorkExperience || userData.workExperienceMonths || (userData.workExperience === 'above_24m' ? 25 : (userData.workExperience === '3m_to_24m' ? 12 : 2)) || 0);
  if (totalExp > 0 && totalExp < 12) {
    return {
      eligible: false,
      reason: `ICICI Bank policy requires minimum 1 year (12 months) overall work experience (Excel Row 12: 1 YEAR). Found: ${totalExp} months.`
    };
  }

  // 6. Age Check (21 to 60 Years at maturity; Pensioner: 65)
  const userAge = Number(age) || 30;
  const isPensioner = categoryNormalized.includes('PENSION') || categoryNormalized.includes('RETIRED');
  const maxAllowedAge = isPensioner ? 65 : 60;

  if (userAge < 21 || userAge > maxAllowedAge) {
    return {
      eligible: false,
      reason: `Age must be between 21 and ${maxAllowedAge} years for ICICI Bank. Current age: ${userAge}`
    };
  }

  // 7. Tenure Determination (Up to 72 Months / 6 Years)
  let maxTenureForCategory = 72; // Flat 72 Months (6 Years) from Row 39-45
  if (maxTenureOverride) {
    maxTenureForCategory = maxTenureOverride;
  } else if (isGovtEmployee && govtMaxTenure) {
    maxTenureForCategory = govtMaxTenure;
  }

  const maxAgeAllowedMonths = Math.max(0, (maxAllowedAge - userAge) * 12);
  const cappedTenureMonths = Math.min(maxTenureForCategory, maxAgeAllowedMonths);
  const cappedTenureYears = cappedTenureMonths / 12;

  if (cappedTenureMonths <= 0) {
    return {
      eligible: false,
      reason: `Age ${userAge} exceeds maximum retirement age limit of ${maxAllowedAge} years.`
    };
  }

  // 8. FOIR Calculation (Factor Dependency Flow)
  const hasRunningHl = Boolean(
    (existingLoanTypes && (existingLoanTypes.includes('Home Loan') || existingLoanTypes.includes('HL'))) ||
    (Array.isArray(loansForBT) && loansForBT.some(l => l.type === 'Home Loan')) ||
    userData.hasEverHomeLoan
  );

  const factorFoir = getIciciFoirPercentage(categoryNormalized, monthlyIncomeForCalc, hasRunningHl);

  let foirPercentage = foirOverride ? (foirOverride / 100) : ((isGovtEmployee && govtFOIR) ? (govtFOIR / 100) : factorFoir);

  // FOIR Capacity Calculation
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing monthly obligations (₹${Math.round(totalObligations).toLocaleString()}) exceed maximum allowed FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // Pass 1: Preliminary ROI & Principal Estimation
  const baseRate = iciciConfig.interestRate;
  const preliminaryFoirLoanAmount = calculateLoanAmountFromEMI(availableEMI, baseRate, cappedTenureYears);

  // Take minimum of FOIR loan capacity and desired loan
  const preliminaryMaxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    preliminaryFoirLoanAmount
  );

  // Category Loan Capping Limits
  let categoryMaxCap = 10000000; // 1 Crore for Super Prime, Preferred, Govt
  if (categoryNormalized.includes('ELITE') || categoryNormalized === 'B') {
    categoryMaxCap = 900000; // Elite: Max 9L
  } else if (categoryNormalized.includes('OPEN') || categoryNormalized === 'C' || categoryNormalized === 'D' || categoryNormalized.includes('UNLISTED')) {
    categoryMaxCap = 1500000; // Open Market: Max 15L
  } else if (categoryNormalized.includes('ARMY') || categoryNormalized.includes('NRI')) {
    categoryMaxCap = 1000000; // Army & NRI: Max 10L
  }

  const preliminaryLoanAmount = Math.min(preliminaryMaxLoanAmount, categoryMaxCap);

  // Pass 2: Exact ROI Lookup based on Category + CIBIL + Sanctioned Loan Amount
  let finalInterestRate = interestRateOverride || interestRate;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) {
    finalInterestRate = getIciciInterestRate(categoryNormalized, preliminaryLoanAmount, effectiveCibil, monthlyIncomeForCalc);
  }

  const effectiveInterestRate = finalInterestRate;

  // Recalculate FOIR loan capacity with exact effective interest rate
  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);

  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    foirLoanAmount
  );

  const maxLoanCapAmount = Math.min(maxLoanAmount, categoryMaxCap);
  const loanCapped = maxLoanAmount > categoryMaxCap;

  // 9. GEOGRAPHIC RAJASTHAN TICKET SIZE CHECK (Row 29-34: IN RAJASTHAN 6.10 LAC MINIMUM)
  const isRajasthanLocation = String(state || '').toLowerCase().includes('rajasthan') ||
                               String(city || '').toLowerCase().includes('jaipur') ||
                               String(city || '').toLowerCase().includes('jodhpur') ||
                               String(city || '').toLowerCase().includes('kota') ||
                               String(city || '').toLowerCase().includes('bikaner') ||
                               String(city || '').toLowerCase().includes('udaipur') ||
                               String(city || '').toLowerCase().includes('bhilwara') ||
                               String(city || '').toLowerCase().includes('alwar') ||
                               String(city || '').toLowerCase().includes('sikar') ||
                               String(city || '').toLowerCase().includes('pali') ||
                               String(city || '').toLowerCase().includes('ajmer');

  if (isRajasthanLocation) {
    if (desiredLoanAmount && Number(desiredLoanAmount) < 610000) {
      return {
        eligible: false,
        reason: `ICICI Bank policy strictly requires a minimum loan ticket size of ₹6.10 Lakhs in Rajasthan (Requested: ₹${Number(desiredLoanAmount).toLocaleString()}).`
      };
    }
    if (maxLoanCapAmount < 610000) {
      return {
        eligible: false,
        reason: `Eligible loan amount (₹${Math.round(maxLoanCapAmount).toLocaleString()}) is below ICICI Bank minimum ticket size requirement of ₹6.10 Lakhs for Rajasthan.`
      };
    }
  }

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
    bankId: iciciConfig.id,
    bankName: iciciConfig.name,
    loanAmount: Math.round(maxLoanCapAmount),
    maxLoanCap: categoryMaxCap,
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
    calculationMethod: 'FOIR-based',
    foirPercentage: foirPercentage,
    incentivePercentage: effectiveIncentivePercentage,
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      companyCategory: category,
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      foirLoanAmount: Math.round(foirLoanAmount),
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      ccObligationPercent: '5%',
      totalObligations: Math.round(totalObligations),
      categoryMaxLoanCap: categoryMaxCap,
      rajasthanRestrictionApplied: isRajasthanLocation,
      cibilCheckPassed: true
    },
    ...btDetails
  };
};
