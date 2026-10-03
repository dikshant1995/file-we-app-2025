// InCred Finance Calculation Engine
import { incredConfig } from './config.js';

export const calculateIncredEligibility = (inputData = {}) => {
  const input = inputData || {};

  // ========== DUMB USER INPUT SANITIZATION & NORMALIZATION ==========
  const numBasicSalary = Number(input.basicSalary) || 0;
  const numMonthlyIncome = Number(input.monthlyIncome || input.monthlySalary) || 0;
  const salary = numBasicSalary || numMonthlyIncome;

  if (!salary || isNaN(salary) || salary <= 0) {
    return {
      eligible: false,
      bankName: 'InCred Finance',
      reason: 'Valid monthly salary is required to calculate InCred Finance loan eligibility.'
    };
  }

  const numExistingEMI = Number(input.existingEMI) || 0;
  const numCcObligation = Number(input.creditCardObligation) || 0;
  const numTotalWorkExp = Number(input.totalWorkExperience || input.workExperience) || 0;
  const numCurrentExp = Number(input.currentCompanyExperience || input.workExperience) || 0;
  const numDesiredLoan = Number(input.desiredLoanAmount) || 0;
  const numLoanTenure = Number(input.loanTenure) || 0;

  // Age Sanitization (21 to 55 Years)
  let parsedAge = 25; // default
  if (input.age !== undefined && input.age !== null && input.age !== '') {
    parsedAge = Number(input.age);
    if (isNaN(parsedAge)) {
      return {
        eligible: false,
        bankName: 'InCred Finance',
        reason: `Invalid age format provided: "${input.age}".`
      };
    }
  }

  // 1. Rejection Checks
  if (salary < incredConfig.minSalary) {
    return {
      eligible: false,
      bankName: 'InCred Finance',
      reason: `Minimum net monthly salary required for InCred Finance is ₹${incredConfig.minSalary.toLocaleString()} (Current: ₹${salary.toLocaleString()})`
    };
  }

  if (parsedAge < incredConfig.minAge || parsedAge > incredConfig.maxAge) {
    return {
      eligible: false,
      bankName: 'InCred Finance',
      reason: `Applicant age must be between ${incredConfig.minAge} and ${incredConfig.maxAge} years for InCred Finance (Current age: ${parsedAge})`
    };
  }

  if (numTotalWorkExp > 0 && numTotalWorkExp < incredConfig.minTotalExperience && numCurrentExp < incredConfig.minCurrentCompanyExperience) {
    return {
      eligible: false,
      bankName: 'InCred Finance',
      reason: `Minimum work experience required for InCred Finance is 3 months`
    };
  }

  // Check CC BT
  const safeLoansForBT = Array.isArray(input.loansForBT || input.selectedLoansForBT) ? (input.loansForBT || input.selectedLoansForBT) : [];
  const isCcBt = Boolean(input.isCcBt || (input.isBTMode && safeLoansForBT.some(l => {
    if (!l) return false;
    const t = String(l.loanType || l.type || '').toLowerCase();
    return t.includes('credit') || t.includes('card') || t === 'cc';
  })));

  if (isCcBt) {
    return {
      eligible: false,
      bankName: 'InCred Finance',
      reason: `Credit Card Balance Transfer (CC BT) is strictly NOT allowed by InCred Finance policy`,
      isBTMode: true
    };
  }

  // 2. FOIR Calculation by Salary Slab (FOIR Only - No Multiplier)
  let baseFoir = 0.40;
  if (salary > 40000) baseFoir = 0.65;
  else if (salary >= 30000) baseFoir = 0.60;
  else if (salary >= 20000) baseFoir = 0.50;
  else baseFoir = 0.40;

  // Account Aggregator Bonus: +5% FOIR (Default enabled unless foirOverride is specified)
  const defaultFoir = baseFoir + 0.05;
  const effectiveFoir = input.foirOverride ? (input.foirOverride / 100) : defaultFoir;

  const totalObligations = numExistingEMI + numCcObligation;
  const foirCap = salary * effectiveFoir;
  const availableEMI = foirCap - totalObligations;

  if (availableEMI <= 0) {
    return {
      eligible: false,
      bankName: 'InCred Finance',
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed ${(effectiveFoir * 100).toFixed(0)}% FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // 3. Loan Amount Calculation
  const requestedTenureYears = numLoanTenure || 5;
  const maxTenureYears = (input.maxTenureOverride || incredConfig.maxTenureMonths) / 12;
  const minTenureYears = incredConfig.minTenureMonths / 12;
  const tenureYears = Math.min(maxTenureYears, Math.max(minTenureYears, requestedTenureYears));
  const totalMonths = tenureYears * 12;

  const rate = input.interestRateOverride || incredConfig.minInterestRate;
  const monthlyRate = rate / 12 / 100;

  let rawLoan = 0;
  if (monthlyRate === 0) {
    rawLoan = availableEMI * totalMonths;
  } else {
    rawLoan = availableEMI * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)));
  }

  const maxCap = input.maxLoanOverride || incredConfig.maxLoanAmount;
  let cappedLoan = Math.min(rawLoan, maxCap);
  if (numDesiredLoan > 0) {
    cappedLoan = Math.min(cappedLoan, numDesiredLoan);
  }

  if (cappedLoan < incredConfig.minLoanAmount) {
    return {
      eligible: false,
      bankName: 'InCred Finance',
      reason: `Calculated loan eligibility (₹${Math.round(cappedLoan).toLocaleString()}) is below minimum sanction limit of ₹${incredConfig.minLoanAmount.toLocaleString()}`
    };
  }

  return {
    eligible: true,
    bankName: 'InCred Finance',
    loanAmount: Math.round(cappedLoan),
    maxLoanAmount: Math.round(cappedLoan),
    monthlyEMI: Math.round(availableEMI),
    interestRate: Number(rate),
    loanTenure: tenureYears,
    loanTenureMonths: totalMonths,
    foirPercentage: effectiveFoir,
    multiplier: null, // FOIR Only
    isFoirOnly: true
  };
};

