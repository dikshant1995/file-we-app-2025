import { calculateLoanEligibility } from '../src/services/realLoanService.js';
import { calculateLntEligibility } from '../src/banks/lnt/calculator.js';

async function testLntBank() {
  console.log('====================================================');
  console.log('🧪 TESTING L&T FINANCE CALCULATOR & SERVICE 🧪');
  console.log('====================================================\n');

  // Test 1: Standard Super A Applicant with 60k Salary & 12M work exp
  const test1 = {
    monthlyIncome: 60000,
    category: 'Super A',
    totalWorkExperience: 12,
    cibilScore: 750,
    desiredLoanAmount: 1500000,
    loanTenure: 5,
    existingEMI: 0,
    creditCardObligation: 2500,
    creditCards: [{ outstandingAmount: 50000, isBT: false }]
  };

  const res1 = calculateLntEligibility(test1);
  console.log('Test 1 (Super A, 60k Salary, 750 CIBIL):');
  console.log('  - Eligible:', res1.eligible);
  console.log('  - Loan Amount:', res1.loanAmount);
  console.log('  - Interest Rate:', res1.interestRate);
  console.log('  - Multiplier:', res1.multiplier);
  console.log('  - FOIR %:', res1.foirPercentage);
  console.log('  - Monthly EMI:', res1.monthlyEMI);
  console.log('');

  // Test 2: Low CIBIL (< 720) -> Ineligible
  const test2 = {
    monthlyIncome: 80000,
    category: 'A',
    totalWorkExperience: 24,
    cibilScore: 700
  };

  const res2 = calculateLntEligibility(test2);
  console.log('Test 2 (CIBIL Score 700 < 720 required):');
  console.log('  - Eligible:', res2.eligible);
  console.log('  - Reason:', res2.reason);
  console.log('');

  // Test 3: Credit Card BT Requested -> Rejected (CC BT Not Allowed)
  const test3 = {
    monthlyIncome: 70000,
    category: 'B',
    totalWorkExperience: 18,
    cibilScore: 750,
    isBTMode: true,
    loansForBT: [{ type: 'Credit Card', outstandingAmount: 100000 }]
  };

  const res3 = calculateLntEligibility(test3);
  console.log('Test 3 (Credit Card BT Requested):');
  console.log('  - Eligible:', res3.eligible);
  console.log('  - Reason:', res3.reason);
  console.log('');

  // Test 4: Category D Rented Capping (Capped at ₹20 Lakhs)
  const test4 = {
    monthlyIncome: 150000,
    category: 'D',
    totalWorkExperience: 36,
    cibilScore: 750,
    livingStatus: 'rented',
    desiredLoanAmount: 3000000,
    loanTenure: 6
  };

  const res4 = calculateLntEligibility(test4);
  console.log('Test 4 (Category D Rented Capping - Max ₹20L cap):');
  console.log('  - Eligible:', res4.eligible);
  console.log('  - Loan Amount:', res4.loanAmount);
  console.log('  - Max Loan Cap:', res4.maxLoanCap);
  console.log('  - Loan Capped by Bank:', res4.loanCappedByBank);
  console.log('');

  // Test 5: Admin Dashboard Overrides
  const test5 = {
    monthlyIncome: 60000,
    category: 'B',
    totalWorkExperience: 24,
    cibilScore: 740,
    desiredLoanAmount: 2000000,
    loanTenure: 5,
    interestRateOverride: 11.25,
    foirOverride: 75,
    multiplierOverride: 26,
    maxTenureOverride: 72
  };

  const res5 = calculateLntEligibility(test5);
  console.log('Test 5 (Admin Dashboard Overrides - 11.25% ROI, 75% FOIR, 26x Multiplier):');
  console.log('  - Eligible:', res5.eligible);
  console.log('  - Loan Amount:', res5.loanAmount);
  console.log('  - Applied Rate:', res5.interestRate);
  console.log('  - Applied Multiplier:', res5.multiplier);
  console.log('  - Applied FOIR %:', res5.foirPercentage);
  console.log('');

  // Test 6: End-to-End Real Loan Service Test
  console.log('Running calculateLoanEligibility via realLoanService...');
  const fullResults = await calculateLoanEligibility({
    monthlyIncome: 65000,
    category: 'A',
    companyName: 'L&T Technology Services',
    totalWorkExperience: 24,
    cibilScore: 760,
    desiredLoanAmount: 1200000,
    loanTenure: 5,
    city: 'Bangalore',
    state: 'Karnataka'
  });

  const lntResult = fullResults.find(b => b.bankName === 'L&T Finance' || b.bankId === 'lnt');
  console.log('\nReal Loan Service Result for L&T Finance:');
  console.log('  - Bank Name:', lntResult?.bankName);
  console.log('  - Eligible:', lntResult?.eligible);
  console.log('  - Loan Amount:', lntResult?.loanAmount);
  console.log('  - Interest Rate:', lntResult?.interestRate);
  console.log('  - Monthly EMI:', lntResult?.monthlyEMI);
  console.log('  - Processing Fee:', lntResult?.processingFee);

  console.log('\n====================================================');
  console.log('✅ L&T FINANCE TESTS COMPLETED SUCCESSFULLY ✅');
  console.log('====================================================');
}

testLntBank().catch(err => console.error('Test failed:', err));
