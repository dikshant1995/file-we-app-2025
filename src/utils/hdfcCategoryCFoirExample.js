// Example demonstrating FOIR calculation for Category C with correct minimum salary
import { calculateHdfcEligibility } from '../banks/hdfc/calculator.js';

console.log('=== HDFC Bank Category C FOIR Calculation Example ===\n');

// Example: Category C employee with salary above minimum
const categoryCTest = {
  monthlyIncome: 45000, // Above the ₹35,000 minimum for Category C
  existingEMI: 3000,    // Existing obligations
  loanTenure: 5,        // 5-year loan
  companyName: 'Local Regional Company', // Maps to Category C
  employmentType: 'salaried',
  interestRate: 11      // 11% interest rate
};

console.log('Applicant Details:');
console.log('------------------');
console.log(`Category: C (Local/Regional Company)`);
console.log(`Monthly Income: ₹${categoryCTest.monthlyIncome.toLocaleString()}`);
console.log(`Existing EMIs: ₹${categoryCTest.existingEMI.toLocaleString()}`);
console.log(`Loan Tenure: ${categoryCTest.loanTenure} years`);
console.log(`Interest Rate: ${categoryCTest.interestRate}%`);
console.log('');

const result = calculateHdfcEligibility(categoryCTest);

if (result.eligible) {
  console.log('Eligibility Result:');
  console.log('------------------');
  console.log(`Eligible: ${result.eligible}`);
  console.log(`Bank: ${result.bankName}`);
  console.log(`Company Category: ${result.companyCategory}`);
  console.log('');
  
  console.log('FOIR Calculation:');
  console.log('----------------');
  console.log(`Salary Band: Determined based on ₹${categoryCTest.monthlyIncome.toLocaleString()}`);
  console.log(`FOIR Percentage: ${(result.foirPercentage * 100)}% (Category C in 25K-50K band gets 50%)`);
  console.log(`FOIR Cap: ₹${categoryCTest.monthlyIncome.toLocaleString()} × ${result.foirPercentage} = ₹${result.details.foirCap.toLocaleString()}`);
  console.log(`Available EMI: ₹${result.details.foirCap.toLocaleString()} - ₹${categoryCTest.existingEMI.toLocaleString()} = ₹${result.details.availableEMI.toLocaleString()}`);
  console.log('');
  
  console.log('Loan Details:');
  console.log('-------------');
  console.log(`Maximum Eligible Loan Amount: ₹${result.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${result.monthlyEMI.toLocaleString()}`);
  console.log(`Processing Fee: ₹${result.processingFee.toLocaleString()}`);
  console.log(`Interest Rate: ${result.interestRate}%`);
  console.log(`Loan Tenure: ${categoryCTest.loanTenure} years`);
} else {
  console.log(`Not Eligible: ${result.reason}`);
}

console.log('\n=== Key Points ===');
console.log('1. Category C requires minimum salary of ₹35,000 (higher than other categories)');
console.log('2. In 25K-50K salary band, Category C gets 50% FOIR (preferential treatment)');
console.log('3. FOIR calculation: Salary × FOIR Percentage - Existing EMIs = Available EMI');
console.log('4. Loan amount is calculated based on available EMI, interest rate, and tenure');
console.log('5. Only applicants with salary ≥ ₹35,000 can be processed for Category C');