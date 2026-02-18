// Comparison of loan eligibility without processing fees
import { calculateHdfcEligibility } from '../banks/hdfc/calculator.js';
import { calculateKotakEligibility } from '../banks/kotak/calculator.js';
import { calculateIciciEligibility } from '../banks/icici/calculator.js';

console.log('=== Loan Eligibility Comparison for Government Employee ===\n');
console.log('Profile: Government Employee with ₹35,000 monthly salary');
console.log('Loan Terms: 6-year tenure, 11% interest rate\n');

const applicantData = {
  monthlyIncome: 35000,
  existingEMI: 0, // No existing EMIs
  loanTenure: 6,
  companyName: 'Government of India',
  employmentType: 'government',
  interestRate: 11
};

console.log('HDFC Bank Calculation:');
console.log('=====================');

const hdfcResult = calculateHdfcEligibility(applicantData);

if (hdfcResult.eligible) {
  console.log(`Eligible: ${hdfcResult.eligible}`);
  console.log(`Bank: ${hdfcResult.bankName}`);
  console.log(`Company Category: ${hdfcResult.companyCategory}`);
  console.log(`Calculation Method: ${hdfcResult.calculationMethod}`);
  console.log(`FOIR Percentage: ${(hdfcResult.foirPercentage * 100)}%`);
  console.log(`FOIR Cap: ₹${hdfcResult.details.foirCap.toLocaleString()}`);
  console.log(`Available EMI: ₹${hdfcResult.details.availableEMI.toLocaleString()}`);
  console.log(`Maximum Loan Amount: ₹${hdfcResult.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${hdfcResult.monthlyEMI.toLocaleString()}`);
  console.log(`Interest Rate: ${hdfcResult.interestRate}%`);
} else {
  console.log(`Eligible: ${hdfcResult.eligible}`);
  console.log(`Reason: ${hdfcResult.reason}`);
}

console.log('\nKotak Mahindra Bank Calculation:');
console.log('==============================');

const kotakResult = calculateKotakEligibility(applicantData);

if (kotakResult.eligible) {
  console.log(`Eligible: ${kotakResult.eligible}`);
  console.log(`Bank: ${kotakResult.bankName}`);
  console.log(`Company Category: ${kotakResult.companyCategory}`);
  console.log(`Calculation Method: ${kotakResult.calculationMethod}`);
  if (kotakResult.multiplier) {
    console.log(`Multiplier: ${kotakResult.multiplier}`);
  }
  if (kotakResult.foirPercentage) {
    console.log(`FOIR Percentage: ${(kotakResult.foirPercentage * 100)}%`);
  }
  if (kotakResult.details) {
    if (kotakResult.details.multiplierLoanAmount) {
      console.log(`Multiplier Loan Amount: ₹${kotakResult.details.multiplierLoanAmount.toLocaleString()}`);
    }
    if (kotakResult.details.foirLoanAmount) {
      console.log(`FOIR Loan Amount: ₹${kotakResult.details.foirLoanAmount.toLocaleString()}`);
    }
    if (kotakResult.details.foirCap) {
      console.log(`FOIR Cap: ₹${kotakResult.details.foirCap.toLocaleString()}`);
    }
    if (kotakResult.details.availableEMI) {
      console.log(`Available EMI: ₹${kotakResult.details.availableEMI.toLocaleString()}`);
    }
  }
  console.log(`Maximum Loan Amount: ₹${kotakResult.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${kotakResult.monthlyEMI.toLocaleString()}`);
  console.log(`Interest Rate: ${kotakResult.interestRate}%`);
} else {
  console.log(`Eligible: ${kotakResult.eligible}`);
  console.log(`Reason: ${kotakResult.reason}`);
}

console.log('\nICICI Bank Calculation (FOIR Only):');
console.log('==================================');

const iciciResult = calculateIciciEligibility(applicantData);

if (iciciResult.eligible) {
  console.log(`Eligible: ${iciciResult.eligible}`);
  console.log(`Bank: ${iciciResult.bankName}`);
  console.log(`Company Category: ${iciciResult.companyCategory}`);
  console.log(`Calculation Method: ${iciciResult.calculationMethod}`);
  console.log(`FOIR Percentage: ${(iciciResult.foirPercentage * 100)}%`);
  console.log(`FOIR Cap: ₹${iciciResult.details.foirCap.toLocaleString()}`);
  console.log(`Available EMI: ₹${iciciResult.details.availableEMI.toLocaleString()}`);
  console.log(`FOIR-Based Loan Amount: ₹${iciciResult.details.foirLoanAmount.toLocaleString()}`);
  console.log(`Maximum Loan Amount: ₹${iciciResult.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${iciciResult.monthlyEMI.toLocaleString()}`);
  console.log(`Interest Rate: ${iciciResult.interestRate}%`);
} else {
  console.log(`Eligible: ${iciciResult.eligible}`);
  console.log(`Reason: ${iciciResult.reason}`);
}

console.log('\n=== Summary Comparison ===');
const results = [
  { bank: 'HDFC', amount: hdfcResult.eligible ? hdfcResult.loanAmount : 0 },
  { bank: 'ICICI', amount: iciciResult.eligible ? iciciResult.loanAmount : 0 },
  { bank: 'Kotak', amount: kotakResult.eligible ? kotakResult.loanAmount : 0 }
].filter(r => r.amount > 0).sort((a, b) => b.amount - a.amount);

results.forEach((result, index) => {
  console.log(`${index + 1}. ${result.bank} Bank: ₹${result.amount.toLocaleString()}`);
});

if (results.length > 0) {
  console.log(`\nRecommendation: ${results[0].bank} Bank offers the highest loan amount of ₹${results[0].amount.toLocaleString()}`);
}