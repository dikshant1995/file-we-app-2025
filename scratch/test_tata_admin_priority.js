import { calculateTataEligibility } from '../src/banks/tata/calculator.js';

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
const resBaseline = calculateTataEligibility(testUserBaseline);
console.log(`ROI: ${resBaseline.interestRate}% | FOIR: ${resBaseline.details.foirPercentage} | Multiplier: ${resBaseline.details.multiplier} | Max Tenure: ${resBaseline.maxTenureForCategory}M | Max Loan Cap: ₹${resBaseline.maxLoanCap.toLocaleString()}`);

console.log("\n=== 2. ADMIN DASHBOARD OVERRIDE RESULT (Priority 1 Active) ===");
const testUserWithAdminOverrides = {
  ...testUserBaseline,
  interestRateOverride: 10.50,
  foirOverride: 75,
  multiplierOverride: 30,
  maxTenureOverride: 84,
  maxLoanOverride: 6000000
};

const resAdmin = calculateTataEligibility(testUserWithAdminOverrides);
console.log(`ROI: ${resAdmin.interestRate}% | FOIR: ${resAdmin.details.foirPercentage} | Multiplier: ${resAdmin.details.multiplier} | Max Tenure: ${resAdmin.maxTenureForCategory}M | Max Loan Cap: ₹${resAdmin.maxLoanCap.toLocaleString()}`);

if (
  resAdmin.interestRate === 10.50 &&
  resAdmin.details.foirPercentage === '75%' &&
  resAdmin.details.multiplier === '30x' &&
  resAdmin.maxTenureForCategory === 84
) {
  console.log("\n SUCCESS: Admin Dashboard Overrides are taking TOP PRIORITY over baseline Excel policy!");
} else {
  console.error("\n FAILURE: Admin Overrides were not respected correctly!");
}
