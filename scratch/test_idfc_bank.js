import { calculateLoanEligibility } from '../src/services/realLoanService.js';
import { calculateIdfcEligibility } from '../src/banks/idfc/calculator.js';

async function testIdfcBank() {
  console.log('====================================================');
  console.log('🧪 TESTING IDFC FIRST BANK CALCULATOR & SERVICE 🧪');
  console.log('====================================================\n');

  // Test 1: Standard Super A Applicant with 50k Salary & 25 months work exp
  const test1 = {
    monthlyIncome: 50000,
    category: 'Super A',
    companyName: 'TCS',
    totalWorkExperience: 25,
    workExperience: 'above_24m',
    workExperienceMonths: 25,
    creditScore: 780,
    desiredLoanAmount: 2000000,
    loanTenure: 7,
    existingEMI: 0,
    creditCardObligation: 2500,
    creditCards: [{ outstandingAmount: 50000, isBT: false }]
  };

  const res1 = calculateIdfcEligibility(test1);
  console.log('Test 1 (Super A, 50k Salary, >24M Work Exp):');
  console.log('  - Eligible:', res1.eligible);
  console.log('  - Reason:', res1.reason);
  console.log('  - Loan Amount:', res1.loanAmount);
  console.log('  - Interest Rate:', res1.interestRate);
  console.log('  - Multiplier:', res1.multiplier);
  console.log('  - FOIR %:', res1.foirPercentage);
  console.log('  - Monthly EMI:', res1.monthlyEMI);
  console.log('  - Max Loan Cap:', res1.maxLoanCap);
  console.log('  - Work Exp Capped:', res1.workExperienceCapped);
  console.log('');

  // Test 2: Work Experience Capping (< 24 months exp -> Capped at ₹15 Lakhs)
  const test2 = {
    monthlyIncome: 100000,
    category: 'Super A',
    companyName: 'Infosys',
    totalWorkExperience: 12,
    workExperience: '3m_to_24m',
    workExperienceMonths: 12,
    creditScore: 780,
    desiredLoanAmount: 3000000,
    loanTenure: 7
  };

  const res2 = calculateIdfcEligibility(test2);
  console.log('Test 2 (Super A, 100k Salary, 12M Work Exp -> Max ₹15L cap):');
  console.log('  - Eligible:', res2.eligible);
  console.log('  - Reason:', res2.reason);
  console.log('  - Loan Amount:', res2.loanAmount);
  console.log('  - Max Loan Cap:', res2.maxLoanCap);
  console.log('  - Work Exp Capped:', res2.workExperienceCapped);
  console.log('');

  // Test 3: Work Experience < 3 months -> Ineligible
  const test3 = {
    monthlyIncome: 50000,
    category: 'A',
    totalWorkExperience: 2,
    workExperience: 'below_3m',
    workExperienceMonths: 2,
    creditScore: 750
  };

  const res3 = calculateIdfcEligibility(test3);
  console.log('Test 3 (Work Exp < 3 months):');
  console.log('  - Eligible:', res3.eligible);
  console.log('  - Reason:', res3.reason);
  console.log('');

  // Test 4: Admin Dashboard UI Overrides Priority
  const test4 = {
    monthlyIncome: 60000,
    category: 'B',
    totalWorkExperience: 36,
    workExperience: 'above_24m',
    workExperienceMonths: 36,
    creditScore: 750,
    desiredLoanAmount: 2500000,
    loanTenure: 7,
    interestRateOverride: 11.5,
    foirOverride: 75,
    multiplierOverride: 30,
    maxTenureOverride: 84
  };

  const res4 = calculateIdfcEligibility(test4);
  console.log('Test 4 (Admin Dashboard UI Overrides - 11.5% ROI, 75% FOIR, 30x Multipliers):');
  console.log('  - Eligible:', res4.eligible);
  console.log('  - Reason:', res4.reason);
  console.log('  - Loan Amount:', res4.loanAmount);
  console.log('  - Applied Rate:', res4.interestRate);
  console.log('  - Applied Multiplier:', res4.multiplier);
  console.log('  - Applied FOIR %:', res4.foirPercentage);
  console.log('');

  // Test 5: End-to-End Real Loan Service Test
  console.log('Running calculateLoanEligibility via realLoanService...');
  const fullResults = await calculateLoanEligibility({
    monthlyIncome: 55000,
    category: 'A',
    companyName: 'Wipro',
    totalWorkExperience: 30,
    cibilScore: 760,
    desiredLoanAmount: 1500000,
    loanTenure: 6,
    city: 'Mumbai',
    state: 'Maharashtra'
  });

  const idfcResult = fullResults.find(b => b.bankName === 'IDFC First Bank' || b.bankId === 'idfc');
  console.log('\nReal Loan Service Result for IDFC First Bank:');
  console.log('  - Bank Name:', idfcResult?.bankName);
  console.log('  - Eligible:', idfcResult?.eligible);
  console.log('  - Reason:', idfcResult?.reason);
  console.log('  - Loan Amount:', idfcResult?.loanAmount);
  console.log('  - Interest Rate:', idfcResult?.interestRate);
  console.log('  - Monthly EMI:', idfcResult?.monthlyEMI);
  console.log('  - Processing Fee:', idfcResult?.processingFee);

  console.log('\n====================================================');
  console.log('✅ IDFC FIRST BANK TESTS COMPLETED SUCCESSFULLY ✅');
  console.log('====================================================');
}

testIdfcBank().catch(err => console.error('Test failed:', err));
