import { calculateFinnableEligibility } from '../src/banks/finnable/calculator.js';

console.log('--- TESTING FINNABLE FINANCE POLICY CALCULATOR ---');

// Test 1: Tier 1 City & Valid Applicant (750 CIBIL)
const test1 = calculateFinnableEligibility({
  monthlyIncome: 25000,
  creditScore: 750,
  age: 30,
  totalWorkExperience: 12,
  city: 'Mumbai',
  state: 'Maharashtra',
  designation: 'Software Engineer',
  companyType: 'Pvt Ltd',
  hasPfDeduction: true,
  desiredLoanAmount: 300000,
  loanTenure: 5
});
console.log('Test 1 (Tier 1 Valid 750 CIBIL):');
console.log('  Eligible:', test1.eligible);
console.log('  Max Sanction Amount:', test1.maxLoanCap);
console.log('  Applied ROI:', test1.rateOfInterest + '%');
console.log('  Max Tenure:', test1.maxTenure + ' Months');
console.log('  Calculated EMI:', test1.emi);

// Test 2: Tier 2 City Salary Threshold Failure (Salary < 15,000)
const test2 = calculateFinnableEligibility({
  monthlyIncome: 12000,
  creditScore: 720,
  age: 28,
  totalWorkExperience: 12,
  city: 'Jaipur',
  state: 'Rajasthan',
  designation: 'Accountant',
  companyType: 'Pvt Ltd',
  hasPfDeduction: true
});
console.log('\nTest 2 (Low Salary Rejection):');
console.log('  Eligible:', test2.eligible);
console.log('  Reason:', test2.reason);

// Test 3: Negative Profile Rejection (Police / Gym Trainer / Delivery Boy)
const test3 = calculateFinnableEligibility({
  monthlyIncome: 30000,
  creditScore: 730,
  age: 32,
  totalWorkExperience: 24,
  city: 'Delhi',
  state: 'Delhi',
  designation: 'Police Officer',
  companyType: 'Govt',
  hasPfDeduction: true
});
console.log('\nTest 3 (Negative Profile Rejection):');
console.log('  Eligible:', test3.eligible);
console.log('  Reason:', test3.reason);

// Test 4: Sole Proprietorship in North (Restricted Zone)
const test4 = calculateFinnableEligibility({
  monthlyIncome: 40000,
  creditScore: 740,
  age: 35,
  totalWorkExperience: 36,
  city: 'Delhi',
  state: 'Delhi',
  companyType: 'Sole Proprietorship',
  hasPfDeduction: true
});
console.log('\nTest 4 (Sole Prop Zone Restriction):');
console.log('  Eligible:', test4.eligible);
console.log('  Reason:', test4.reason);

// Test 5: NTC (-1) Case (Max Loan 4L, Max Tenure 36M, min score 600 required)
const test5 = calculateFinnableEligibility({
  monthlyIncome: 40000,
  creditScore: -1,
  finnableScore: 650,
  age: 26,
  totalWorkExperience: 18,
  city: 'Bangalore',
  state: 'Karnataka',
  designation: 'Analyst',
  companyType: 'Pvt Ltd',
  hasPfDeduction: true,
  desiredLoanAmount: 600000,
  loanTenure: 5
});
console.log('\nTest 5 (NTC Capping):');
console.log('  Eligible:', test5.eligible);
console.log('  Max Sanction Amount:', test5.maxLoanCap);
console.log('  Max Tenure:', test5.maxTenure + ' Months');

console.log('\n--- FINNABLE TESTS COMPLETED SUCCESSFULLY ---');
