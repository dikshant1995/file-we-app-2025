import { calculateLoanEligibility } from '../src/services/realLoanService.js';
import { calculatePiramalEligibility } from '../src/banks/piramal/calculator.js';

async function testPiramalBank() {
  console.log('====================================================');
  console.log('🧪 TESTING PIRAMAL FINANCE CALCULATOR & SERVICE 🧪');
  console.log('====================================================\n');

  // Test 1: Standard Super A Applicant with 50k Salary & PF Deduction & 780 CIBIL (V13-V20)
  const test1 = {
    monthlyIncome: 50000,
    basicSalary: 50000,
    category: 'Super A',
    totalWorkExperience: 24,
    creditScore: 780,
    hasPfDeduction: true,
    hasPpfDeduction: true,
    desiredLoanAmount: 1500000,
    loanTenure: 5,
    existingEMI: 0,
    creditCardObligation: 0
  };

  const res1 = calculatePiramalEligibility(test1);
  console.log('Test 1 (Super A, 50k Salary, PF Deducted, 780 CIBIL):');
  console.log('  - Eligible:', res1.eligible);
  console.log('  - Loan Amount:', res1.loanAmount);
  console.log('  - Interest Rate:', res1.interestRate);
  console.log('  - Multiplier:', res1.multiplier);
  console.log('  - FOIR %:', res1.foirPercentage);
  console.log('  - Monthly EMI:', res1.monthlyEMI);
  console.log('');

  // Test 2: Salary WITHOUT PF / PPF Deduction -> Ineligible (Mandatory PF required)
  const test2 = {
    monthlyIncome: 40000,
    basicSalary: 40000,
    category: 'A',
    totalWorkExperience: 18,
    creditScore: 750,
    hasPfDeduction: false,
    hasPpfDeduction: false
  };

  const res2 = calculatePiramalEligibility(test2);
  console.log('Test 2 (Salary WITHOUT PF Deduction):');
  console.log('  - Eligible:', res2.eligible);
  console.log('  - Reason:', res2.reason);
  console.log('');

  // Test 3: Balance Transfer Rule (2 CC BT with 1 PL BT allowed; Standalone CC BT ineligible)
  const test3StandaloneCc = {
    monthlyIncome: 60000,
    basicSalary: 60000,
    category: 'B',
    totalWorkExperience: 24,
    creditScore: 750,
    hasPfDeduction: true,
    isBTMode: true,
    loansForBT: [{ type: 'Credit Card', outstandingAmount: 50000 }]
  };

  const res3 = calculatePiramalEligibility(test3StandaloneCc);
  console.log('Test 3 (Standalone Credit Card BT Requested):');
  console.log('  - Eligible:', res3.eligible);
  console.log('  - Reason:', res3.reason);
  console.log('');

  // Test 3b: Valid BT (1 PL BT + 2 CC BT) -> Eligible
  const test3ValidBt = {
    monthlyIncome: 60000,
    basicSalary: 60000,
    category: 'B',
    totalWorkExperience: 24,
    creditScore: 750,
    hasPfDeduction: true,
    isBTMode: true,
    existingEMI: 15000,
    btTotalEMI: 15000,
    btTotalOutstanding: 400000,
    loansForBT: [
      { type: 'Personal Loan', outstandingAmount: 300000, monthlyEMI: 11000 },
      { type: 'Credit Card', outstandingAmount: 50000, monthlyEMI: 2000 },
      { type: 'Credit Card', outstandingAmount: 50000, monthlyEMI: 2000 }
    ]
  };

  const res3b = calculatePiramalEligibility(test3ValidBt);
  console.log('Test 3b (Valid BT: 1 PL BT + 2 CC BT):');
  console.log('  - Eligible:', res3b.eligible);
  console.log('  - Loan Amount:', res3b.loanAmount);
  console.log('  - Fresh Amount Disbursed:', res3b.freshAmountDisbursed);
  console.log('');

  // Test 4: OD+ Program Tenure (> 1L Salary Super A -> 96 Months max tenure)
  const test4 = {
    monthlyIncome: 120000,
    basicSalary: 120000,
    category: 'Super A',
    totalWorkExperience: 36,
    creditScore: 780,
    hasPfDeduction: true,
    desiredLoanAmount: 3000000,
    loanTenure: 8
  };

  const res4 = calculatePiramalEligibility(test4);
  console.log('Test 4 (Super A, ₹1.2L Salary -> OD+ Max 96 Months Tenure):');
  console.log('  - Eligible:', res4.eligible);
  console.log('  - Max Tenure Months:', res4.maxTenureForCategory);
  console.log('  - Loan Tenure Years:', res4.loanTenure);
  console.log('');

  // Test 5: Admin Dashboard UI Overrides Priority
  const test5 = {
    monthlyIncome: 55000,
    basicSalary: 55000,
    category: 'B',
    totalWorkExperience: 24,
    creditScore: 740,
    hasPfDeduction: true,
    desiredLoanAmount: 1500000,
    loanTenure: 5,
    interestRateOverride: 12.5,
    foirOverride: 75,
    multiplierOverride: 25,
    maxTenureOverride: 72
  };

  const res5 = calculatePiramalEligibility(test5);
  console.log('Test 5 (Admin Dashboard Overrides - 12.5% ROI, 75% FOIR, 25x Multiplier):');
  console.log('  - Eligible:', res5.eligible);
  console.log('  - Loan Amount:', res5.loanAmount);
  console.log('  - Applied Rate:', res5.interestRate);
  console.log('  - Applied Multiplier:', res5.multiplier);
  console.log('  - Applied FOIR %:', res5.foirPercentage);
  console.log('');

  // Test 6: End-to-End Real Loan Service Test
  console.log('Running calculateLoanEligibility via realLoanService...');
  const fullResults = await calculateLoanEligibility({
    monthlyIncome: 50000,
    basicSalary: 50000,
    category: 'A',
    companyName: 'Wipro',
    totalWorkExperience: 24,
    cibilScore: 760,
    hasPfDeduction: true,
    desiredLoanAmount: 1200000,
    loanTenure: 5,
    city: 'Pune',
    state: 'Maharashtra'
  });

  const piramalResult = fullResults.find(b => b.bankName === 'Piramal Finance' || b.bankId === 'piramal');
  console.log('\nReal Loan Service Result for Piramal Finance:');
  console.log('  - Bank Name:', piramalResult?.bankName);
  console.log('  - Eligible:', piramalResult?.eligible);
  console.log('  - Loan Amount:', piramalResult?.loanAmount);
  console.log('  - Interest Rate:', piramalResult?.interestRate);
  console.log('  - Monthly EMI:', piramalResult?.monthlyEMI);
  console.log('  - Processing Fee:', piramalResult?.processingFee);

  console.log('\n====================================================');
  console.log('✅ PIRAMAL FINANCE TESTS COMPLETED SUCCESSFULLY ✅');
  console.log('====================================================');
}

testPiramalBank().catch(err => console.error('Test failed:', err));
