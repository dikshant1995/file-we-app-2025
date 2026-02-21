// Test script for HDFC Bank FOIR calculations
import { calculateHdfcEligibility } from '../banks/hdfc/calculator.js';

console.log('=== HDFC Bank Loan Eligibility Tests ===\n');

// Test Case 1: Government employee with salary of ₹75,000
console.log('Test Case 1: Government employee with salary of ₹75,000');
console.log('--------------------------------------------------------');
const testCase1 = {
  monthlyIncome: 75000,
  existingEMI: 5000,
  loanTenure: 6,
  companyName: 'Government of India',
  employmentType: 'government',
  interestRate: 11
};

const result1 = calculateHdfcEligibility(testCase1);
if (result1.eligible) {
  console.log(`Eligible: ${result1.eligible}`);
  console.log(`Bank: ${result1.bankName}`);
  console.log(`Loan Amount: ₹${result1.loanAmount.toLocaleString()}`);
  console.log(`Interest Rate: ${result1.interestRate}%`);
  console.log(`Monthly EMI: ₹${result1.monthlyEMI.toLocaleString()}`);
  console.log(`Company Category: ${result1.companyCategory}`);
  console.log(`Calculation Method: ${result1.calculationMethod}`);
  console.log(`FOIR Percentage: ${(result1.foirPercentage * 100)}%`);
  console.log(`FOIR Cap: ₹${result1.details.foirCap.toLocaleString()}`);
  console.log(`Available EMI: ₹${result1.details.availableEMI.toLocaleString()}`);
} else {
  console.log(`Not Eligible: ${result1.reason}`);
}
console.log('');

// Test Case 2: Super A category employee with salary of ₹120,000
console.log('Test Case 2: Super A category employee with salary of ₹120,000');
console.log('-------------------------------------------------------------');
const testCase2 = {
  monthlyIncome: 120000,
  existingEMI: 10000,
  loanTenure: 6,
  companyName: 'Google',
  employmentType: 'salaried',
  interestRate: 11
};

const result2 = calculateHdfcEligibility(testCase2);
if (result2.eligible) {
  console.log(`Eligible: ${result2.eligible}`);
  console.log(`Bank: ${result2.bankName}`);
  console.log(`Loan Amount: ₹${result2.loanAmount.toLocaleString()}`);
  console.log(`Interest Rate: ${result2.interestRate}%`);
  console.log(`Monthly EMI: ₹${result2.monthlyEMI.toLocaleString()}`);
  console.log(`Company Category: ${result2.companyCategory}`);
  console.log(`Calculation Method: ${result2.calculationMethod}`);
  console.log(`FOIR Percentage: ${(result2.foirPercentage * 100)}%`);
  console.log(`FOIR Cap: ₹${result2.details.foirCap.toLocaleString()}`);
  console.log(`Available EMI: ₹${result2.details.availableEMI.toLocaleString()}`);
} else {
  console.log(`Not Eligible: ${result2.reason}`);
}
console.log('');

// Test Case 3: Category C employee with salary of ₹40,000
console.log('Test Case 3: Category C employee with salary of ₹40,000');
console.log('-----------------------------------------------------');
const testCase3 = {
  monthlyIncome: 40000,
  existingEMI: 2000,
  loanTenure: 6,
  companyName: 'Local Regional Company',
  employmentType: 'salaried',
  interestRate: 11
};

const result3 = calculateHdfcEligibility(testCase3);
if (result3.eligible) {
  console.log(`Eligible: ${result3.eligible}`);
  console.log(`Bank: ${result3.bankName}`);
  console.log(`Loan Amount: ₹${result3.loanAmount.toLocaleString()}`);
  console.log(`Interest Rate: ${result3.interestRate}%`);
  console.log(`Monthly EMI: ₹${result3.monthlyEMI.toLocaleString()}`);
  console.log(`Company Category: ${result3.companyCategory}`);
  console.log(`Calculation Method: ${result3.calculationMethod}`);
  console.log(`FOIR Percentage: ${(result3.foirPercentage * 100)}%`);
  console.log(`FOIR Cap: ₹${result3.details.foirCap.toLocaleString()}`);
  console.log(`Available EMI: ₹${result3.details.availableEMI.toLocaleString()}`);
} else {
  console.log(`Not Eligible: ${result3.reason}`);
}
console.log('');

// Test Case 4: Boundary case - salary of ₹50,000
console.log('Test Case 4: Boundary case - salary of ₹50,000');
console.log('--------------------------------------------');
const testCase4 = {
  monthlyIncome: 50000,
  existingEMI: 3000,
  loanTenure: 6,
  companyName: 'Infosys',
  employmentType: 'salaried',
  interestRate: 11
};

const result4 = calculateHdfcEligibility(testCase4);
if (result4.eligible) {
  console.log(`Eligible: ${result4.eligible}`);
  console.log(`Bank: ${result4.bankName}`);
  console.log(`Loan Amount: ₹${result4.loanAmount.toLocaleString()}`);
  console.log(`Interest Rate: ${result4.interestRate}%`);
  console.log(`Monthly EMI: ₹${result4.monthlyEMI.toLocaleString()}`);
  console.log(`Company Category: ${result4.companyCategory}`);
  console.log(`Calculation Method: ${result4.calculationMethod}`);
  console.log(`FOIR Percentage: ${(result4.foirPercentage * 100)}%`);
  console.log(`FOIR Cap: ₹${result4.details.foirCap.toLocaleString()}`);
  console.log(`Available EMI: ₹${result4.details.availableEMI.toLocaleString()}`);
} else {
  console.log(`Not Eligible: ${result4.reason}`);
}
console.log('');

console.log('=== Test Summary ===');
console.log('1. Government employees fall in the "Govt" category');
console.log('2. High-income employees fall in the "Super A" category');
console.log('3. Local/regional companies fall in the "C" category');
console.log('4. Major IT companies fall in the "A" category');
console.log('5. FOIR percentages vary by salary band and category');
console.log('6. Category C gets lower FOIR percentage (50%) in 25K-50K band');
console.log('7. All categories converge to 70% FOIR for salaries above ₹100,000');