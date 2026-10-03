import { calculateLoanEligibility } from '../src/services/realLoanService.js';

const testInput = {
  fullName: "Test User",
  mobileNumber: "9876543210",
  state: "Rajasthan",
  city: "Jaipur",
  basicSalary: 50000,
  averageIncentive: 0,
  monthlyIncome: 50000,
  hasPfDeduction: true,
  age: 30,
  creditScore: 750,
  maritalStatus: "Single",
  livingArrangement: "Rented",
  employmentType: "private",
  workExperienceMonths: 36,
  totalWorkExperience: 36,
  companyName: "TCS",
  companyCategory: "CAT A",
  salaryReceivedIn: "Bank Transfer",
  existingEMI: 0,
  creditCardObligation: 0,
  desiredLoanAmount: 500000,
  loanTenure: 5
};

console.log("=== Testing All Institutions via realLoanService ===");
const res = await calculateLoanEligibility(testInput);
const banks = Array.isArray(res) ? res : (res?.eligibleBanks || []);

console.log(`\nTotal Approved Institutions: ${banks.length}`);
banks.forEach((b, i) => {
  console.log(`${i+1}. ${b.bankName} (${b.bankId}) → Loan: ₹${(b.loanAmount/100000).toFixed(2)}L | EMI: ₹${b.monthlyEMI} | ROI: ${b.interestRate}% | Tenure: ${b.loanTenureMonths}M`);
});
