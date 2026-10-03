import { calculateLoanEligibility } from '../src/services/realLoanService.js';
import { calculateSmfgEligibility } from '../src/banks/smfg/calculator.js';

async function testSmfgBank() {
  console.log('====================================================');
  console.log('🧪 TESTING SMFG INDIA CREDIT CALCULATOR & SERVICE 🧪');
  console.log('====================================================\n');

  // Test 1: Standard Category A Applicant with 55k Salary & 25 months work exp
  const test1 = {
    monthlyIncome: 55000,
    basicSalary: 55000,
    category: 'A',
    totalWorkExperience: 25,
    desiredLoanAmount: 1500000,
    loanTenure: 5,
    existingEMI: 0,
    creditCardObligation: 2750,
    creditCards: [{ outstandingAmount: 55000, isBT: false }]
  };

  const res1 = calculateSmfgEligibility(test1);
  console.log('Test 1 (Cat A, 55k Salary, >24M Work Exp):');
  console.log('  - Eligible:', res1.eligible);
  console.log('  - Loan Amount:', res1.loanAmount);
  console.log('  - Interest Rate:', res1.interestRate);
  console.log('  - Multiplier:', res1.multiplier);
  console.log('  - FOIR %:', res1.foirPercentage);
  console.log('  - Monthly EMI:', res1.monthlyEMI);
  console.log('  - Processing Fee %:', res1.processingFee);
  console.log('');

  // Test 2: Salary < 25,000 -> Ineligible (Excel: 25K+ SALARY WITH 0 DEDUCTION)
  const test2 = {
    monthlyIncome: 22000,
    basicSalary: 22000,
    category: 'B',
    totalWorkExperience: 24
  };

  const res2 = calculateSmfgEligibility(test2);
  console.log('Test 2 (Salary ₹22k < ₹25k required):');
  console.log('  - Eligible:', res2.eligible);
  console.log('  - Reason:', res2.reason);
  console.log('');

  // Test 3: Proprietorship / Partnership / LLP Firm Restriction (55% FOIR Max)
  const test3 = {
    monthlyIncome: 60000,
    basicSalary: 60000,
    category: 'B',
    companyType: 'Proprietorship Firm',
    totalWorkExperience: 30,
    desiredLoanAmount: 1500000,
    loanTenure: 5
  };

  const res3 = calculateSmfgEligibility(test3);
  console.log('Test 3 (Proprietorship Firm Applicant -> Max 55% FOIR):');
  console.log('  - Eligible:', res3.eligible);
  console.log('  - Applied FOIR %:', res3.foirPercentage);
  console.log('  - Is Prop/LLP:', res3.isPropOrLlp);
  console.log('');

  // Test 4: Balance Transfer CC Limit (> 2 Credit Cards BT requested -> Rejected)
  const test4 = {
    monthlyIncome: 70000,
    basicSalary: 70000,
    category: 'A',
    totalWorkExperience: 30,
    isBTMode: true,
    loansForBT: [
      { type: 'Credit Card', outstandingAmount: 50000 },
      { type: 'Credit Card', outstandingAmount: 50000 },
      { type: 'Credit Card', outstandingAmount: 50000 } // 3 CCs -> Invalid (Max 2 CC BT)
    ]
  };

  const res4 = calculateSmfgEligibility(test4);
  console.log('Test 4 (3 Credit Cards BT Requested -> Max 2 CC BT Allowed):');
  console.log('  - Eligible:', res4.eligible);
  console.log('  - Reason:', res4.reason);
  console.log('');

  // Test 5: Admin Dashboard Overrides
  const test5 = {
    monthlyIncome: 60000,
    basicSalary: 60000,
    category: 'B',
    totalWorkExperience: 30,
    desiredLoanAmount: 1800000,
    loanTenure: 5,
    interestRateOverride: 17.5,
    foirOverride: 75,
    multiplierOverride: 28,
    maxTenureOverride: 60
  };

  const res5 = calculateSmfgEligibility(test5);
  console.log('Test 5 (Admin Dashboard Overrides - 17.5% ROI, 75% FOIR, 28x Multiplier):');
  console.log('  - Eligible:', res5.eligible);
  console.log('  - Loan Amount:', res5.loanAmount);
  console.log('  - Applied Rate:', res5.interestRate);
  console.log('  - Applied Multiplier:', res5.multiplier);
  console.log('  - Applied FOIR %:', res5.foirPercentage);
  console.log('');

  // Test 6: End-to-End Real Loan Service Test
  console.log('Running calculateLoanEligibility via realLoanService...');
  const fullResults = await calculateLoanEligibility({
    monthlyIncome: 55000,
    basicSalary: 55000,
    category: 'A',
    companyName: 'Infosys',
    totalWorkExperience: 30,
    cibilScore: 750,
    desiredLoanAmount: 1375000,
    loanTenure: 5,
    city: 'Delhi',
    state: 'Delhi'
  });

  const smfgResult = fullResults.find(b => b.bankName === 'SMFG India Credit' || b.bankId === 'smfg');
  console.log('\nReal Loan Service Result for SMFG India Credit:');
  console.log('  - Bank Name:', smfgResult?.bankName);
  console.log('  - Eligible:', smfgResult?.eligible);
  console.log('  - Loan Amount:', smfgResult?.loanAmount);
  console.log('  - Interest Rate:', smfgResult?.interestRate);
  console.log('  - Monthly EMI:', smfgResult?.monthlyEMI);
  console.log('  - Processing Fee %:', smfgResult?.processingFee);

  console.log('\n====================================================');
  console.log('✅ SMFG INDIA CREDIT TESTS COMPLETED SUCCESSFULLY ✅');
  console.log('====================================================');
}

testSmfgBank().catch(err => console.error('Test failed:', err));
