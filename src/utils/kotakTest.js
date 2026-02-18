// Test the Kotak Mahindra Bank implementation
import { calculateKotakEligibility } from '../banks/kotak/calculator.js';

// Test case 1: Example from the specification
const testUserData1 = {
  desiredLoanAmount: 1000000,
  loanTenure: 20,
  monthlyIncome: 40000,
  existingEMI: 5000,
  companyName: 'TCS',
  employmentType: 'salaried',
  creditScore: 750
};

// Test case 2: Government employee
const testUserData2 = {
  desiredLoanAmount: 1000000,
  loanTenure: 20,
  monthlyIncome: 30000,
  existingEMI: 0,
  companyName: 'State Government',
  employmentType: 'government',
  creditScore: 750
};

// Test case 3: Category D with minimum salary
const testUserData3 = {
  desiredLoanAmount: 1000000,
  loanTenure: 20,
  monthlyIncome: 40000,
  existingEMI: 0,
  companyName: 'Small Startup',
  employmentType: 'salaried',
  creditScore: 750
};

// Test case 4: Unlisted company (should be ineligible)
const testUserData4 = {
  desiredLoanAmount: 1000000,
  loanTenure: 20,
  monthlyIncome: 50000,
  existingEMI: 0,
  companyName: 'Unknown Company',
  employmentType: 'salaried',
  creditScore: 750
};

// Test case 5: Government employee with ₹67,000 salary, 6-year tenure, 11% interest
const testUserData5 = {
  desiredLoanAmount: 5000000,
  loanTenure: 6,
  monthlyIncome: 67000,
  existingEMI: 0,
  companyName: 'State Government',
  employmentType: 'government',
  creditScore: 750,
  interestRate: 11 // 11% interest rate
};

// Test case 6: Government employee with ₹75,000 salary, 6-year tenure, 11% interest
const testUserData6 = {
  desiredLoanAmount: 5000000,
  loanTenure: 6,
  monthlyIncome: 75000,
  existingEMI: 0,
  companyName: 'State Government',
  employmentType: 'government',
  creditScore: 750,
  interestRate: 11 // 11% interest rate
};

console.log('=== Kotak Mahindra Bank Calculation Tests ===\n');

console.log('Test Case 1: TCS Employee with 40,000 salary');
const result1 = calculateKotakEligibility(testUserData1);
console.log(JSON.stringify(result1, null, 2));

console.log('\nTest Case 2: Government Employee with 30,000 salary');
const result2 = calculateKotakEligibility(testUserData2);
console.log(JSON.stringify(result2, null, 2));

console.log('\nTest Case 3: Small Startup Employee (Category D) with 40,000 salary');
const result3 = calculateKotakEligibility(testUserData3);
console.log(JSON.stringify(result3, null, 2));

console.log('\nTest Case 4: Unknown Company Employee (Unlisted)');
const result4 = calculateKotakEligibility(testUserData4);
console.log(JSON.stringify(result4, null, 2));

console.log('\nTest Case 5: Government Employee with ₹67,000 salary, 6-year tenure, 11% interest');
const result5 = calculateKotakEligibility(testUserData5);
console.log('Government Employee with ₹67,000 salary:');
console.log('- Employment Type: Government (Category GOVT)');
console.log('- Salary: ₹67,000');
console.log('- Salary Band: 50,001-75,000 (Multiplier), ≥50,000 (FOIR)');
console.log('- Multiplier for GOVT category in 50,001-75,000 band: ' + result5.multiplier);
console.log('- FOIR Percentage for GOVT category in ≥50,000 band: ' + result5.foirPercentage);
if (result5.eligible) {
  console.log('- Multiplier Loan Amount: ₹' + result5.details.multiplierLoanAmount.toLocaleString());
  console.log('- FOIR Loan Amount: ₹' + result5.details.foirLoanAmount.toLocaleString());
  console.log('- Final Eligible Loan Amount: ₹' + result5.loanAmount.toLocaleString());
  console.log('- Monthly EMI: ₹' + result5.monthlyEMI.toLocaleString());
  console.log('- Interest Rate: ' + result5.interestRate + '%');
} else {
  console.log('- Not Eligible: ' + result5.reason);
}
console.log(JSON.stringify(result5, null, 2));

console.log('\nTest Case 6: Government Employee with ₹75,000 salary, 6-year tenure, 11% interest');
const result6 = calculateKotakEligibility(testUserData6);
console.log('Government Employee with ₹75,000 salary:');
console.log('- Employment Type: Government (Category GOVT)');
console.log('- Salary: ₹75,000');
console.log('- Salary Band: 75,000+ (Multiplier), ≥50,000 (FOIR)');
console.log('- Multiplier for GOVT category in 75,000+ band: ' + result6.multiplier);
console.log('- FOIR Percentage for GOVT category in ≥50,000 band: ' + result6.foirPercentage);
if (result6.eligible) {
  console.log('- Multiplier Loan Amount: ₹' + result6.details.multiplierLoanAmount.toLocaleString());
  console.log('- FOIR Loan Amount: ₹' + result6.details.foirLoanAmount.toLocaleString());
  console.log('- Final Eligible Loan Amount: ₹' + result6.loanAmount.toLocaleString());
  console.log('- Monthly EMI: ₹' + result6.monthlyEMI.toLocaleString());
  console.log('- Interest Rate: ' + result6.interestRate + '%');
} else {
  console.log('- Not Eligible: ' + result6.reason);
}
console.log(JSON.stringify(result6, null, 2));