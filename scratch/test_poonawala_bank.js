import { calculateLoanEligibility } from '../src/services/realLoanService.js';
import { calculatePoonawalaEligibility } from '../src/banks/poonawala/calculator.js';

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

console.log("=== Direct Poonawalla Fincorp Calculator Test ===");
const directRes = calculatePoonawalaEligibility(testInput);
console.log(JSON.stringify(directRes, null, 2));

console.log("\n=== Unified realLoanService Test (Poonawalla Fincorp) ===");
const realServiceRes = await calculateLoanEligibility(testInput);

const allBanks = Array.isArray(realServiceRes) ? realServiceRes : (realServiceRes?.eligibleBanks || []);
const poonawalaResult = allBanks.find(b => b.bankId === 'poonawala' || b.bankName?.toLowerCase().includes('poonaw'));

console.log("Poonawalla Fincorp Result in Unified Engine:");
console.log(JSON.stringify(poonawalaResult, null, 2));
