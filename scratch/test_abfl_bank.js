import { calculateLoanEligibility } from '../src/services/realLoanService.js';
import { calculateAbflEligibility } from '../src/banks/abfl/calculator.js';

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

console.log("=== Direct ABFL Calculator Test ===");
const directRes = calculateAbflEligibility(testInput);
console.log(JSON.stringify(directRes, null, 2));

console.log("\n=== Unified realLoanService Test (ABFL) ===");
const realServiceRes = await calculateLoanEligibility(testInput);

const allBanks = Array.isArray(realServiceRes) ? realServiceRes : (realServiceRes?.eligibleBanks || []);
const abflResult = allBanks.find(b => b.bankId === 'abfl' || b.bankName?.toLowerCase().includes('birla') || b.bankName?.toLowerCase().includes('abfl'));

console.log("Aditya Birla Finance Result in Unified Engine:");
console.log(JSON.stringify(abflResult, null, 2));
