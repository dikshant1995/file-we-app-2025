import { calculatePoonawalaEligibility } from '../src/banks/poonawala/calculator.js';

const testUserBaseline = {
  fullName: "Test User",
  monthlyIncome: 50000,
  basicSalary: 50000,
  age: 30,
  creditScore: 750,
  employmentType: "private",
  category: "A",
  desiredLoanAmount: 5000000,
  loanTenure: 5,
  existingEMI: 0
};

console.log("=== 1. BASELINE EXCEL POLICY RESULT (No Admin Overrides) ===");
const resBaseline = calculatePoonawalaEligibility(testUserBaseline);
console.log(`ROI: ${resBaseline.interestRate}% | FOIR: ${resBaseline.details.foirPercentage} | Max Tenure: ${resBaseline.maxTenureForCategory}M | Max Loan Cap: ₹${resBaseline.maxLoanCap.toLocaleString()}`);

console.log("\n=== 2. ADMIN DASHBOARD OVERRIDE RESULT (Priority 1 Active) ===");
const testUserWithAdminOverrides = {
  ...testUserBaseline,
  interestRateOverride: 11.25,
  foirOverride: 75,
  maxTenureOverride: 84,
  maxLoanOverride: 6000000
};

const resAdmin = calculatePoonawalaEligibility(testUserWithAdminOverrides);
console.log(`ROI: ${resAdmin.interestRate}% | FOIR: ${resAdmin.details.foirPercentage} | Max Tenure: ${resAdmin.maxTenureForCategory}M | Max Loan Cap: ₹${resAdmin.maxLoanCap.toLocaleString()}`);

if (
  resAdmin.interestRate === 11.25 &&
  resAdmin.details.foirPercentage === '75%' &&
  resAdmin.maxTenureForCategory === 84
) {
  console.log("\n SUCCESS: Admin Dashboard Overrides are taking TOP PRIORITY for Poonawalla Fincorp!");
} else {
  console.error("\n FAILURE: Admin Overrides were not respected correctly!");
}
