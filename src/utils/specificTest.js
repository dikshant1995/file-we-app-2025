// Specific test for ₹85,000 Category D employee
import { calculateKotakEligibility } from '../banks/kotak/calculator.js';

// Test data for government employee with ₹75,000 salary
const testData1 = {
  desiredLoanAmount: 5000000,
  loanTenure: 6,
  monthlyIncome: 75000,
  existingEMI: 0,
  companyName: 'State Government',
  employmentType: 'government',
  creditScore: 750,
  interestRate: 11 // 11% interest rate
};

// Test data for Category D employee with ₹85,000 salary
const testData2 = {
  desiredLoanAmount: 5000000,
  loanTenure: 6,
  monthlyIncome: 85000,
  existingEMI: 0,
  companyName: 'Small Private Company',
  employmentType: 'salaried',
  creditScore: 750,
  interestRate: 11 // 11% interest rate
};

console.log('=== Specific Test for ₹75,000 Government Employee ===\n');

const result1 = calculateKotakEligibility(testData1);

console.log('Input:');
console.log('- Monthly Income: ₹75,000');
console.log('- Employment Type: Government (GOVT category)');
console.log('- Tenure: 6 years');
console.log('- Interest Rate: 11%');

console.log('\nCalculation Details:');
console.log('- Salary Band (Multiplier): 50001-75000 (since 50001 ≤ 75000 ≤ 75000)');
console.log('- Salary Band (FOIR): 50000+ (since 75000 ≥ 50000)');
console.log('- Multiplier for GOVT in 50001-75000 band: ' + result1.multiplier);
console.log('- FOIR Percentage for GOVT in 50000+ band: ' + result1.foirPercentage);

if (result1.eligible) {
  console.log('\nResults:');
  console.log('- Multiplier Loan Amount: ₹' + result1.details.multiplierLoanAmount.toLocaleString() + ' (₹75,000 × ' + result1.multiplier + ')');
  console.log('- FOIR Cap: ₹' + result1.details.foirCap.toLocaleString() + ' (₹75,000 × ' + (result1.foirPercentage * 100) + '%)');
  console.log('- Available EMI: ₹' + result1.details.availableEMI.toLocaleString() + ' (FOIR Cap - Existing EMIs)');
  console.log('- FOIR Loan Amount: ₹' + result1.details.foirLoanAmount.toLocaleString() + ' (calculated from EMI)');
  console.log('- Final Eligible Loan Amount: ₹' + result1.loanAmount.toLocaleString() + ' (minimum of both methods)');
  console.log('- Monthly EMI: ₹' + result1.monthlyEMI.toLocaleString());
  console.log('- Interest Rate: ' + result1.interestRate + '%');
} else {
  console.log('Not Eligible: ' + result1.reason);
}

console.log('\n\n=== Specific Test for ₹85,000 Category D Employee ===\n');

const result2 = calculateKotakEligibility(testData2);

console.log('Input:');
console.log('- Monthly Income: ₹85,000');
console.log('- Employment Type: Salaried (Category D)');
console.log('- Tenure: 6 years');
console.log('- Interest Rate: 11%');

console.log('\nCalculation Details:');
console.log('- Salary Band (Multiplier): 75000+ (since 85000 > 75000)');
console.log('- Salary Band (FOIR): 50000+ (since 85000 ≥ 50000)');
console.log('- Multiplier for Category D in 75000+ band: ' + result2.multiplier);
console.log('- FOIR Percentage for Category D in 50000+ band: ' + result2.foirPercentage);

if (result2.eligible) {
  console.log('\nResults:');
  console.log('- Multiplier Loan Amount: ₹' + result2.details.multiplierLoanAmount.toLocaleString() + ' (₹85,000 × ' + result2.multiplier + ')');
  console.log('- FOIR Cap: ₹' + result2.details.foirCap.toLocaleString() + ' (₹85,000 × ' + (result2.foirPercentage * 100) + '%)');
  console.log('- Available EMI: ₹' + result2.details.availableEMI.toLocaleString() + ' (FOIR Cap - Existing EMIs)');
  console.log('- FOIR Loan Amount: ₹' + result2.details.foirLoanAmount.toLocaleString() + ' (calculated from EMI)');
  console.log('- Final Eligible Loan Amount: ₹' + result2.loanAmount.toLocaleString() + ' (minimum of both methods)');
  console.log('- Monthly EMI: ₹' + result2.monthlyEMI.toLocaleString());
  console.log('- Interest Rate: ' + result2.interestRate + '%');
  
  // Check minimum salary requirement for Category D
  console.log('\nCategory D Requirements:');
  console.log('- Minimum Salary Required: ₹35,000');
  console.log('- Actual Salary: ₹85,000');
  console.log('- Salary Requirement Met: ' + (85000 >= 35000 ? 'Yes' : 'No'));
} else {
  console.log('Not Eligible: ' + result2.reason);
}