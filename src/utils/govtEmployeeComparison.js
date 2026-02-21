// Comparison of loan eligibility for government employee with ₹35,000 salary
import { calculateHdfcEligibility } from '../banks/hdfc/calculator.js';
import { calculateKotakEligibility } from '../banks/kotak/calculator.js';

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
  console.log(`Processing Fee: ₹${hdfcResult.processingFee.toLocaleString()}`);
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
  console.log(`Processing Fee: ₹${kotakResult.processingFee.toLocaleString()}`);
} else {
  console.log(`Eligible: ${kotakResult.eligible}`);
  console.log(`Reason: ${kotakResult.reason}`);
}

console.log('\n=== Summary Comparison ===');
if (hdfcResult.eligible && kotakResult.eligible) {
  console.log(`HDFC Loan Amount: ₹${hdfcResult.loanAmount.toLocaleString()}`);
  console.log(`Kotak Loan Amount: ₹${kotakResult.loanAmount.toLocaleString()}`);
  
  if (hdfcResult.loanAmount > kotakResult.loanAmount) {
    console.log(`Recommendation: HDFC offers ₹${(hdfcResult.loanAmount - kotakResult.loanAmount).toLocaleString()} higher loan amount`);
  } else if (kotakResult.loanAmount > hdfcResult.loanAmount) {
    console.log(`Recommendation: Kotak offers ₹${(kotakResult.loanAmount - hdfcResult.loanAmount).toLocaleString()} higher loan amount`);
  } else {
    console.log('Recommendation: Both banks offer the same loan amount');
  }
} else if (hdfcResult.eligible) {
  console.log('Recommendation: Only eligible for HDFC Bank');
} else if (kotakResult.eligible) {
  console.log('Recommendation: Only eligible for Kotak Mahindra Bank');
} else {
  console.log('Recommendation: Not eligible for either bank');
}