import { calculateLoanEligibility } from '../src/services/realLoanService.js';
import { calculateAxisFinEligibility } from '../src/banks/axis-fin/calculator.js';

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

console.log("=== Direct Axis Finance Calculator Test ===");
const directRes = calculateAxisFinEligibility(testInput);
console.log(JSON.stringify(directRes, null, 2));

console.log("\n=== Unified realLoanService Test (Axis Finance) ===");
const realServiceRes = await calculateLoanEligibility(testInput);

const allBanks = realServiceRes?.eligibleBanks || realServiceRes?.banks || realServiceRes;
const axisFinResult = Array.isArray(allBanks) 
  ? allBanks.find(b => b.bankId === 'axis' || b.bankId === 'axis-fin' || b.bankName === 'Axis Finance')
  : null;

console.log("Axis Finance Result in Unified Engine:");
console.log(JSON.stringify(axisFinResult, null, 2));
