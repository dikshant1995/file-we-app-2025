import { calculateLoanEligibility } from '../src/services/realLoanService.js';
import { calculateTataEligibility } from '../src/banks/tata/calculator.js';

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

console.log("=== Direct Tata Capital Calculator Test ===");
const directRes = calculateTataEligibility(testInput);
console.log(JSON.stringify(directRes, null, 2));

console.log("\n=== Unified realLoanService Test (Tata Capital) ===");
const realServiceRes = await calculateLoanEligibility(testInput);

const allBanks = Array.isArray(realServiceRes) ? realServiceRes : (realServiceRes?.eligibleBanks || []);
const tataResult = allBanks.find(b => b.bankId === 'tata' || b.bankName === 'Tata Capital');

console.log("Tata Capital Result in Unified Engine:");
console.log(JSON.stringify(tataResult, null, 2));
