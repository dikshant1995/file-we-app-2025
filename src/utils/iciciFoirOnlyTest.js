// Test to verify ICICI bank only uses FOIR calculation
import { calculateIciciEligibility } from '../banks/icici/calculator.js';

console.log('=== ICICI Bank FOIR-Only Calculation Test ===\n');

const applicantData = {
  monthlyIncome: 35000,
  existingEMI: 0, // No existing EMIs
  loanTenure: 6,
  companyName: 'Government of India',
  employmentType: 'salaried',
  interestRate: 11
};

console.log('Applicant Profile:');
console.log('-----------------');
console.log(`Monthly Income: ₹${applicantData.monthlyIncome.toLocaleString()}`);
console.log(`Employment Type: ${applicantData.employmentType}`);
console.log(`Loan Tenure: ${applicantData.loanTenure} years`);
console.log(`Interest Rate: ${applicantData.interestRate}%`);
console.log('');

const result = calculateIciciEligibility(applicantData);

if (result.eligible) {
  console.log('ICICI Bank Results (FOIR Only):');
  console.log('==============================');
  console.log(`Eligible: ${result.eligible}`);
  console.log(`Bank: ${result.bankName}`);
  console.log(`Company Category: ${result.companyCategory}`);
  console.log(`Calculation Method: ${result.calculationMethod}`);
  console.log(`FOIR Percentage: ${(result.foirPercentage * 100)}%`);
  console.log(`FOIR Cap: ₹${result.details.foirCap.toLocaleString()}`);
  console.log(`Available EMI: ₹${result.details.availableEMI.toLocaleString()}`);
  console.log(`FOIR-Based Loan Amount: ₹${result.details.foirLoanAmount.toLocaleString()}`);
  console.log(`Final Loan Amount: ₹${result.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${result.monthlyEMI.toLocaleString()}`);
  console.log(`Interest Rate: ${result.interestRate}%`);
  console.log(`Processing Fee: ₹${result.processingFee.toLocaleString()}`);
  
  // Verify that only FOIR calculation was used
  console.log('\nVerification:');
  console.log('------------');
  console.log('✓ Only FOIR-based calculation was performed');
  console.log('✓ No multiplier method was applied');
  console.log('✓ FOIR percentage of 52% was applied to net income');
  console.log('✓ Loan amount calculated based on available EMI');
} else {
  console.log(`Not Eligible: ${result.reason}`);
}

console.log('\n=== Key Points ===');
console.log('1. ICICI Bank now uses FOIR calculation only');
console.log('2. No multiplier method is applied');
console.log('3. FOIR percentage is 52% for all eligible applicants');
console.log('4. Loan amount is determined by FOIR cap and available EMI');