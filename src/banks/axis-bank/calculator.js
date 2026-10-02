import { axisBankConfig } from './config.js';
import { AXIS_BANK_EXCEL_POLICY } from '../../config/axisBankPolicy.js';

// EMI Calculator Helper
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const r = annualInterestRate / 12 / 100;
  const n = tenureInYears * 12;
  if (r === 0) return Math.round(principal / n);
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
};

// Calculate Loan Amount from EMI Helper
const calculateLoanAmountFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const r = annualInterestRate / 12 / 100;
  const n = tenureInYears * 12;
  if (r === 0) return emi * n;
  const loan = emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  return Math.round(loan);
};

// 1. FACTOR LOOKUP: FOIR & Salary Multiplier (Dependent on Company Tier + Income Slab)
export const getAxisBankFoirAndMultiplier = (income, category) => {
  const normCat = String(category || 'A').toUpperCase().trim();
  const isSuperOrA = normCat.includes('SUPER') || normCat === 'A' || normCat === 'CAT A' || normCat === 'CATEGORY A';
  const isGovt = normCat.includes('GOVT') || normCat.includes('PSU');
  const isB = normCat === 'B' || normCat === 'CAT B' || normCat === 'CATEGORY B';
  const isC = normCat === 'C' || normCat === 'CAT C' || normCat === 'CATEGORY C';

  if (isSuperOrA || isGovt) {
    if (income > 75000) return { foir: 0.75, multiplier: 36, slabName: '> ₹75k (Slab 3)' };
    if (income >= 50000) return { foir: 0.65, multiplier: 30, slabName: '₹50k - ₹75k (Slab 2)' };
    return { foir: 0.55, multiplier: 24, slabName: '₹25k - ₹50k (Slab 1)' };
  } else if (isB) {
    if (income > 75000) return { foir: 0.75, multiplier: 30, slabName: '> ₹75k (Slab 3)' };
    if (income >= 50000) return { foir: 0.60, multiplier: 26, slabName: '₹50k - ₹75k (Slab 2)' };
    return { foir: 0.55, multiplier: 24, slabName: '₹25k - ₹50k (Slab 1)' };
  } else {
    // Category C
    if (income > 75000) return { foir: 0.60, multiplier: 20, slabName: '> ₹75k (Slab 3)' };
    if (income >= 50000) return { foir: 0.55, multiplier: 20, slabName: '₹50k - ₹75k (Slab 2)' };
    return { foir: 0.50, multiplier: 18, slabName: '₹25k - ₹50k (Slab 1)' };
  }
};

// 2. FACTOR LOOKUP: Interest Rate (Dependent on Company Tier + Sanctioned Loan Amount)
export const getAxisBankInterestRate = (loanAmount, category) => {
  const normCat = String(category || 'A').toUpperCase().trim();
  const isSuperOrA = normCat.includes('SUPER') || normCat === 'A' || normCat === 'CAT A' || normCat === 'CATEGORY A';
  const isB = normCat === 'B' || normCat === 'CAT B' || normCat === 'CATEGORY B';
  const isGovt = normCat.includes('GOVT') || normCat.includes('PSU');

  if (loanAmount >= 1500000) { // > ₹15 Lakhs
    if (isSuperOrA) return 9.99;
    if (isB || isGovt) return 10.39;
    return 10.59; // Cat C
  } else if (loanAmount >= 1000000) { // ₹10L - ₹15L
    if (isSuperOrA) return 10.35;
    if (isB || isGovt) return 10.45;
    return 10.75; // Cat C
  } else { // < ₹10 Lakhs
    if (isSuperOrA) return 10.49;
    if (isB || isGovt) return 10.75;
    return 11.25; // Cat C
  }
};

// Main Eligibility Calculator for Axis Bank
export const calculateAxisBankEligibility = (userData = {}, configOverride = {}) => {
  const {
    desiredLoanAmount = null,
    loanTenure = 5,
    basicSalary = 0,
    monthlyIncome = 0,
    existingEMI = 0,
    creditCardObligation = 0,
    creditCardBalance = 0,
    creditScore = 750,
    cibilScore = 750,
    designation = '',
    employmentType = 'salaried',
    companyType = 'Pvt Ltd',
    companyName = '',
    category = 'A',
    age = 30,
    totalWorkExperience = 24,
    currentCompanyExperience = 12,
    city = 'Tier 1',
    state = ''
  } = userData;

  const cfg = {
    ...axisBankConfig,
    ...(configOverride || {}),
    ...(configOverride?.demographics || {})
  };

  const actualIncome = Number(basicSalary || monthlyIncome || 0);

  // 1. Age Verification (21 to 60 Years)
  const minAge = cfg.minAge || 21;
  const maxAge = cfg.maxAge || cfg.retirementAge || 60;
  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Applicant age must be between ${minAge} and ${maxAge} years for Axis Bank (Current: ${age} years).`
    };
  }

  // 1.5 Work Experience Verification (Minimum 1 Year / 12 Months overall work experience from Row 12)
  const totalExp = Number(userData.totalWorkExperience || userData.workExperienceMonths || (userData.workExperience === 'above_24m' ? 25 : (userData.workExperience === '3m_to_24m' ? 12 : 2)) || 0);
  if (totalExp > 0 && totalExp < 12) {
    return {
      eligible: false,
      reason: `Axis Bank policy requires minimum 1 year (12 months) overall work experience (Excel Row 12: 1 YEAR+). Found: ${totalExp} months.`
    };
  }

  // Max tenure limited by retirement age (60 Yrs)
  const maxTenureYearsByAge = maxAge - age;
  if (maxTenureYearsByAge <= 0) {
    return {
      eligible: false,
      reason: `Applicant has reached Axis Bank retirement age limit of ${maxAge} years.`
    };
  }

  const requestedTenureYears = Number(loanTenure || 5);
  const tenureYears = Math.min(requestedTenureYears, 7, maxTenureYearsByAge);
  const tenureMonths = tenureYears * 12;

  // 2. Work Experience Check (Min 12 Months Total, 6 Months Current)
  const totalExpMonths = Number(totalWorkExperience || 12);
  const minTotalExp = cfg.minExperienceTotalMonths || cfg.minExperienceTotal || 12;
  if (totalExpMonths < minTotalExp) {
    return {
      eligible: false,
      reason: `Axis Bank requires minimum ${minTotalExp} months total work experience (Current: ${totalExpMonths} months).`
    };
  }

  // 3. Minimum Salary Check (₹25,000)
  const minSalaryRequired = cfg.minSalary || 25000;
  if (actualIncome < minSalaryRequired) {
    return {
      eligible: false,
      reason: `Minimum monthly income of ₹${minSalaryRequired.toLocaleString()} required for Axis Bank (Current: ₹${actualIncome.toLocaleString()}).`
    };
  }

  // 4. Credit Card Obligation (4% of CC balance)
  const ccObligPercent = (cfg.ccObligationPercent || 4) / 100;
  const computedCcObligation = creditCardObligation > 0 
    ? creditCardObligation 
    : Math.round(Number(creditCardBalance || 0) * ccObligPercent);
  
  const totalObligations = Number(existingEMI || 0) + computedCcObligation;

  // 5. FACTOR LOOKUP 1: FOIR % & Salary Multiplier (From Company Tier + Income Slab)
  const compCategory = category || 'A';
  const { foir, multiplier, slabName } = getAxisBankFoirAndMultiplier(actualIncome, compCategory);

  const foirCap = actualIncome * foir;
  const availableEMI = foirCap - totalObligations;

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing monthly obligations (₹${totalObligations.toLocaleString()}) exceed Axis Bank FOIR cap of ₹${Math.round(foirCap).toLocaleString()} (${(foir * 100).toFixed(0)}%).`
    };
  }

  // Initial provisional loan capacity estimate
  const provisionalRate = 10.49;
  const foirLoanCapacity = calculateLoanAmountFromEMI(availableEMI, provisionalRate, tenureYears);
  
  const availableSalaryForMult = Math.max(0, actualIncome - totalObligations);
  const multiplierLoanCapacity = availableSalaryForMult * multiplier;

  const maxPolicyCap = cfg.maxLoanAmount || 5000000;
  let calculatedSanction = Math.min(foirLoanCapacity, multiplierLoanCapacity, maxPolicyCap);

  if (desiredLoanAmount && desiredLoanAmount > 0) {
    calculatedSanction = Math.min(calculatedSanction, desiredLoanAmount);
  }

  const finalLoanAmount = Math.max(0, Math.round(calculatedSanction));

  const minLoanThreshold = cfg.minLoanAmount || 50000;
  if (finalLoanAmount < minLoanThreshold) {
    return {
      eligible: false,
      reason: `Calculated loan amount (₹${finalLoanAmount.toLocaleString()}) is below Axis Bank minimum threshold of ₹${minLoanThreshold.toLocaleString()}.`
    };
  }

  // 6. FACTOR LOOKUP 2: Interest Rate (From Company Tier + Sanctioned Loan Amount)
  const appliedRoi = getAxisBankInterestRate(finalLoanAmount, compCategory);
  const monthlyEMI = calculateEMI(finalLoanAmount, appliedRoi, tenureYears);

  return {
    eligible: true,
    bankId: cfg.id || 'axis-bank',
    bankName: cfg.name || 'Axis Bank',
    loanAmount: finalLoanAmount,
    maxLoanCap: maxPolicyCap,
    interestRate: appliedRoi,
    appliedRoi,
    loanTenure: tenureYears,
    loanTenureMonths: tenureMonths,
    requestedTenureMonths: requestedTenureYears * 12,
    monthlyEMI,
    foirPercentage: foir,
    multiplier,
    availableEMI: Math.round(availableEMI),
    details: {
      companyCategory: compCategory,
      incomeSlab: slabName,
      foirPercentage: (foir * 100).toFixed(0) + '%',
      multiplier: multiplier + 'x',
      foirCap: Math.round(foirCap),
      foirLoanCapacity: Math.round(foirLoanCapacity),
      multiplierLoanCapacity: Math.round(multiplierLoanCapacity),
      creditCardObligation: computedCcObligation,
      ccObligationPercent: (ccObligPercent * 100).toFixed(0) + '%'
    }
  };
};
