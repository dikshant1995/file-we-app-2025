// InCred Finance Calculation Engine
import { incredConfig } from './config.js';

export const calculateIncredEligibility = (input) => {
  const salary = Number(input.monthlyIncome || input.monthlySalary || input.basicSalary || 0);
  const age = Number(input.age || 25);
  const totalExp = Number(input.totalWorkExperience || input.workExperience || 0);
  const currentExp = Number(input.currentCompanyExperience || input.workExperience || 0);
  const existingEMI = Number(input.existingEMI || 0);
  const ccObligation = Number(input.creditCardObligation || 0);
  const isCcBt = Boolean(input.isCcBt || (input.wantsBT && input.selectedLoansForBT?.some(l => l.type === 'Credit Card')));

  // 1. Rejection Checks
  if (salary < incredConfig.minSalary) {
    return {
      eligible: false,
      reason: `Minimum net monthly salary required for InCred Finance is ₹${incredConfig.minSalary.toLocaleString()} (Applicant: ₹${salary.toLocaleString()})`
    };
  }

  if (age < incredConfig.minAge || age > incredConfig.maxAge) {
    return {
      eligible: false,
      reason: `Applicant age must be between ${incredConfig.minAge} and ${incredConfig.maxAge} years for InCred Finance (Applicant: ${age} years)`
    };
  }

  if (totalExp < incredConfig.minTotalExperience && currentExp < incredConfig.minCurrentCompanyExperience) {
    return {
      eligible: false,
      reason: `Minimum work experience required for InCred Finance is 3 months`
    };
  }

  if (isCcBt) {
    return {
      eligible: false,
      reason: `Credit Card Balance Transfer (CC BT) is strictly NOT allowed by InCred Finance policy`
    };
  }

  // 2. FOIR Calculation by Salary Slab (FOIR Only - No Multiplier)
  let baseFoir = 0.40;
  if (salary > 40000) baseFoir = 0.65;
  else if (salary >= 30000) baseFoir = 0.60;
  else if (salary >= 20000) baseFoir = 0.50;
  else baseFoir = 0.40;

  // Account Aggregator Bonus: +5% FOIR
  const effectiveFoir = baseFoir + 0.05;

  const totalObligations = existingEMI + ccObligation;
  const foirCap = salary * effectiveFoir;
  const availableEMI = foirCap - totalObligations;

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed ${(effectiveFoir * 100).toFixed(0)}% FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // 3. Loan Amount Calculation
  const tenureYears = Math.min(incredConfig.maxTenureMonths / 12, Math.max(incredConfig.minTenureMonths / 12, input.loanTenure || 5));
  const rate = input.interestRateOverride || incredConfig.minInterestRate;
  const monthlyRate = rate / 12 / 100;
  const totalMonths = tenureYears * 12;

  const rawLoan = availableEMI * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)));
  const cappedLoan = Math.min(rawLoan, incredConfig.maxLoanAmount);

  if (cappedLoan < incredConfig.minLoanAmount) {
    return {
      eligible: false,
      reason: `Calculated loan eligibility (₹${Math.round(cappedLoan).toLocaleString()}) is below minimum sanction limit of ₹${incredConfig.minLoanAmount.toLocaleString()}`
    };
  }

  return {
    eligible: true,
    loanAmount: Math.round(cappedLoan),
    monthlyEMI: Math.round(availableEMI),
    interestRate: rate,
    loanTenure: tenureYears,
    loanTenureMonths: totalMonths,
    foirPercentage: effectiveFoir,
    multiplier: null, // FOIR Only
    isFoirOnly: true
  };
};
