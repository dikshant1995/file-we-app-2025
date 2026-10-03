import { calculateLoanEligibility } from '../src/services/realLoanService.js';

const userFormInput = {
  fullName: "Rahul Sharma",
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

console.log("=== EVALUATING FORM INPUT ACROSS ALL 18 LENDING PARTNERS ===");
const res = await calculateLoanEligibility(userFormInput);

const allBanks = Array.isArray(res) ? res : (res?.eligibleBanks || []);

console.log("\n=== COMPREHENSIVE ELIGIBILITY REPORT ===");
console.log(JSON.stringify(allBanks, null, 2));
