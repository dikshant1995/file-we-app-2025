// Bajaj Finance Eligibility Calculator
// Strictly adheres to Master Excel Policy (BANKS POLICYS.xlsx - Sheet: BAJAJ)

import { bajajConfig } from './config.js';

// Calculate monthly EMI using standard formula
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyRate === 0) return principal / numberOfMonths;

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
    (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

  return Math.round(emi);
};

// Calculate principal loan amount from available EMI capacity
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyRate === 0) return emi * numberOfMonths;

  const principal = (emi * (Math.pow(1 + monthlyRate, numberOfMonths) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths));

  return Math.round(principal);
};

// Determine ROI based on loan amount and category (Excel Section 2)
// 10L Above: 10%, 1 to 12 Lac (Sal Lite): 16%, Default case: 14%
const getBajajROI = (loanAmount, isSalLite = false) => {
  if (loanAmount >= 1000000) {
    return bajajConfig.roiAbove10L; // 10.00%
  }
  if (isSalLite && loanAmount <= 1200000) {
    return bajajConfig.roiSalLite; // 16.00%
  }
  return bajajConfig.defaultRoi; // 14.00%
};

// Determine Multiplier from Excel Section 6
const getBajajMultiplier = (monthlyIncome, category = 'B', isUnlisted = false) => {
  const c = String(category || '').toUpperCase().trim();
  const sal = Number(monthlyIncome) || 0;

  if (c.includes('SUPER') || c.includes('DIAMOND')) {
    if (sal < 50000) return 18;
    if (sal < 75000) return 20;
    if (sal <= 200000) return 22;
    return 24;
  }
  if (c === 'A' || c.includes('GOVT')) {
    if (sal < 50000) return 16;
    if (sal < 75000) return 16;
    if (sal <= 200000) return 22;
    return 24;
  }
  if (c === 'B') {
    if (sal < 50000) return 12;
    if (sal < 75000) return 12;
    if (sal <= 200000) return 16;
    return 16;
  }
  if (c === 'C') {
    return 10;
  }
  // Dark Red / D / Unlisted
  return isUnlisted ? 12 : 14;
};

// Determine FOIR from Excel Section 3
// <50k: 60% (+10% if live home loan running = 70%)
// >=50k: 65% (+5% if live home loan running = 70%)
// Max FOIR 75% case-to-case
const getBajajFoir = (monthlyIncome, hasHomeLoan = false) => {
  const sal = Number(monthlyIncome) || 0;
  let baseFoir = sal < 50000 ? 0.60 : 0.65;
  if (hasHomeLoan) {
    baseFoir += (sal < 50000 ? 0.10 : 0.05);
  }
  return Math.min(0.75, baseFoir);
};

export const calculateBajajEligibility = (input) => {
  const {
    age = 25,
    monthlyIncome = 0,
    companyCategory = 'B',
    companyType = '',
    existingObligations = 0,
    existingEmi = 0,
    creditCardLimit = 0,
    creditCardOutstanding = 0,
    creditCardPOS = 0,
    isGovt = false,
    hasHomeLoan = false,
    isBTMode = false,
    desiredTenureMonths = null
  } = input;

  const isUnlisted = companyType === 'unlisted' || String(companyCategory).toUpperCase() === 'D' || String(companyCategory).toUpperCase() === 'UNLISTED';
  const minRequiredSalary = isUnlisted ? bajajConfig.minSalaryUnlisted : bajajConfig.minSalaryListed;

  // 1. Demographic & Salary Eligibility
  if (age < bajajConfig.minAge) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `Applicant age must be at least ${bajajConfig.minAge} years for Bajaj Finance (Current: ${age}).`,
      bank: 'Bajaj Finance'
    };
  }

  const maxAllowedAge = isGovt ? bajajConfig.retirementAgeGovt : bajajConfig.maxAge;
  if (age > maxAllowedAge) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `Maximum age for Bajaj Finance is ${maxAllowedAge} years (Current: ${age}).`,
      bank: 'Bajaj Finance'
    };
  }

  if (monthlyIncome < minRequiredSalary) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `Bajaj Finance requires minimum monthly salary of ₹${minRequiredSalary.toLocaleString('en-IN')} for ${isUnlisted ? 'Unlisted' : 'Listed'} companies (Current: ₹${Math.round(monthlyIncome).toLocaleString('en-IN')}).`,
      bank: 'Bajaj Finance'
    };
  }

  // 2. Credit Card Outstanding Limit Check (Excel: "5% OBLIGATE AND MORE THEN 6 TIME NOT ALLOW")
  const totalCcPOS = Number(creditCardPOS || creditCardOutstanding || 0);
  if (totalCcPOS > monthlyIncome * bajajConfig.maxCcBtMultiple) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `Bajaj Finance restricts Credit Card Outstanding exceeding 6x monthly salary (Current CC POS: ₹${Math.round(totalCcPOS).toLocaleString('en-IN')} vs Max: ₹${Math.round(monthlyIncome * 6).toLocaleString('en-IN')}).`,
      bank: 'Bajaj Finance'
    };
  }

  // 3. Obligations Calculation (Excel: CC OBLIGATION 5%)
  const ccObligation = (creditCardLimit > 0 ? creditCardLimit * 0.05 : totalCcPOS * 0.05);
  const totalObligations = (Number(existingObligations) || Number(existingEmi) || 0) + ccObligation;

  // 4. FOIR Calculation
  const foir = getBajajFoir(monthlyIncome, hasHomeLoan);
  const maxAllowableEmi = (monthlyIncome * foir) - totalObligations;

  if (maxAllowableEmi <= 0) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `Existing obligations (₹${Math.round(totalObligations).toLocaleString('en-IN')}) exceed the permitted FOIR limit of ${Math.round(foir * 100)}% for Bajaj Finance.`,
      bank: 'Bajaj Finance'
    };
  }

  // 5. Tenure Calculation
  // Standard up to 96 months (8 years); 108 months (9 years) for ₹1L+ salary
  const maxPossibleTenureMonths = (monthlyIncome >= 100000) ? bajajConfig.maxLoanTenureHighSalary : bajajConfig.maxLoanTenureMonths;
  const ageRemainingMonths = Math.max(0, (maxAllowedAge - age) * 12);
  let finalTenureMonths = Math.min(maxPossibleTenureMonths, ageRemainingMonths);

  if (desiredTenureMonths && desiredTenureMonths > 0) {
    finalTenureMonths = Math.min(finalTenureMonths, desiredTenureMonths);
  }
  finalTenureMonths = Math.max(12, finalTenureMonths);
  const tenureYears = finalTenureMonths / 12;

  // 6. Multiplier Calculation (Excel Section 6)
  const multiplier = getBajajMultiplier(monthlyIncome, companyCategory, isUnlisted);
  const multiplierCap = Math.round(monthlyIncome * multiplier);

  // 7. Initial Loan Amount Estimation & Iterative ROI Resolution
  let currentRoi = bajajConfig.defaultRoi; // 14.00%
  let foirLoanAmount = calculatePrincipalFromEMI(maxAllowableEmi, currentRoi, tenureYears);

  // Adjust ROI based on loan amount (Excel: >= 10L is 10.00%)
  if (foirLoanAmount >= 1000000) {
    currentRoi = bajajConfig.roiAbove10L; // 10.00%
    foirLoanAmount = calculatePrincipalFromEMI(maxAllowableEmi, currentRoi, tenureYears);
  }

  // 8. Sanction Capping (Excel Section 5: Max 50L, Unlisted Max 28L)
  let maxCap = bajajConfig.maxLoanAmount; // 50 Lakhs
  if (isUnlisted) {
    maxCap = Math.min(maxCap, bajajConfig.unlistedMaxLoan); // 28 Lakhs
  }

  const finalLoanAmount = Math.min(foirLoanAmount, multiplierCap, maxCap);

  if (finalLoanAmount < bajajConfig.minLoanAmount) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `Calculated eligibility (₹${Math.round(finalLoanAmount).toLocaleString('en-IN')}) is below Bajaj Finance minimum loan threshold of ₹1,00,000.`,
      bank: 'Bajaj Finance'
    };
  }

  const roundedSanction = Math.round(finalLoanAmount / 1000) * 1000;
  const finalEmi = calculateEMI(roundedSanction, currentRoi, tenureYears);

  return {
    isEligible: true,
    bank: 'Bajaj Finance',
    eligibleLoanAmount: roundedSanction,
    maxLoanAmount: roundedSanction,
    interestRate: currentRoi,
    tenureMonths: finalTenureMonths,
    tenureYears: Math.round(tenureYears * 10) / 10,
    monthlyEMI: finalEmi,
    foir: Math.round(foir * 100),
    multiplier,
    appliedMultiplier: multiplier,
    notes: [
      `FOIR applied: ${Math.round(foir * 100)}%${hasHomeLoan ? ' (including Home Loan bonus)' : ''}`,
      `Multiplier: ${multiplier}x Net Monthly Salary`,
      `Tenure: ${finalTenureMonths} Months (${(finalTenureMonths / 12).toFixed(1)} Years)`,
      currentRoi === 10.00 ? 'High Sanction Rate: 10.00% (≥ ₹10 Lakhs)' : 'Standard Interest Rate: 14.00%'
    ]
  };
};
