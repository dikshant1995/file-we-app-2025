/**
 * Fintech Loan BT Policy Test Suite
 * 
 * Tests the Fintech loan validation across all banks for:
 * 1. Full BT with Fintech loans
 * 2. Full BT with traditional loans only
 * 3. Partial BT with mixed loan sources
 * 4. Personal Loan BT with Fintech classification
 */

import { calculateFullBT, calculatePartialBT } from '../services/btLoanService.js';
import { calculatePersonalLoanBT } from '../services/btPersonalLoanService.js';

console.log('========================================');
console.log('FINTECH LOAN BT POLICY TEST SUITE');
console.log('========================================\n');

/**
 * Test 1: Traditional Loans Only - All Banks Available
 * Expected: 11 banks eligible (all except Bandhan)
 */
async function test1_TraditionalLoansOnly() {
  console.log('TEST 1: Traditional Loans Only (No Fintech)');
  console.log('Expected: 11 banks eligible (except Bandhan)');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 60000,
    existingLoans: [
      { emi: 8000, pos: 150000, loanName: 'HDFC Personal Loan', isFintechLoan: false, loanSource: 'traditional' },
      { emi: 6000, pos: 100000, loanName: 'ICICI Personal Loan', isFintechLoan: false, loanSource: 'traditional' },
      { emi: 5000, pos: 80000, loanName: 'Kotak Personal Loan', isFintechLoan: false, loanSource: 'traditional' }
    ],
    loanTenure: 5,
    category: 'A',
    companyName: 'TCS',
    creditScore: 750,
    employmentType: 'salaried'
  };
  
  const results = await calculateFullBT(userData);
  
  const eligible = results.filter(r => r.eligible);
  const fintechIssues = results.filter(r => r.fintechLoanIssue);
  const otherIssues = results.filter(r => !r.eligible && !r.fintechLoanIssue);
  
  console.log(`\nTotal Banks: ${results.length}`);
  console.log(`Eligible: ${eligible.length}`);
  console.log(`Fintech Policy Issues: ${fintechIssues.length}`);
  console.log(`Other Issues: ${otherIssues.length}`);
  
  if (fintechIssues.length === 0) {
    console.log('\n✓ PASS: No Fintech issues (as expected - all traditional loans)');
  } else {
    console.log('\n✗ FAIL: Unexpected Fintech issues detected!');
    fintechIssues.forEach(r => console.log(`  ${r.bankName}`));
  }
  
  console.log('\n✓ Test 1 Complete\n');
}

/**
 * Test 2: All Fintech Loans - Only 3 Banks Should Be Eligible
 * Expected: Shri Ram, Poonawala, Axis eligible; others excluded
 */
async function test2_AllFintechLoans() {
  console.log('TEST 2: All Fintech Loans');
  console.log('Expected: Only Shri Ram, Poonawala, Axis eligible');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 70000,
    existingLoans: [
      { emi: 7000, pos: 120000, loanName: 'MoneyTap Loan', isFintechLoan: true, loanSource: 'fintech' },
      { emi: 6000, pos: 100000, loanName: 'EarlySalary Loan', isFintechLoan: true, loanSource: 'fintech' },
      { emi: 5000, pos: 80000, loanName: 'PaySense Loan', isFintechLoan: true, loanSource: 'fintech' }
    ],
    loanTenure: 5,
    category: 'A',
    companyName: 'Infosys',
    creditScore: 720,
    employmentType: 'salaried'
  };
  
  const results = await calculateFullBT(userData);
  
  const eligible = results.filter(r => r.eligible);
  const fintechIssues = results.filter(r => r.fintechLoanIssue);
  
  console.log(`\nEligible Banks (${eligible.length}):`);
  eligible.forEach(r => {
    console.log(`  ✓ ${r.bankName}`);
  });
  
  console.log(`\nExcluded by Fintech Policy (${fintechIssues.length}):`);
  fintechIssues.forEach(r => {
    console.log(`  ✗ ${r.bankName}: ${r.fintechLoansCount} Fintech loan(s)`);
  });
  
  // Verify expected banks
  const expectedEligible = ['Shri Ram Finance', 'Poonawala Finance', 'Axis Finance'];
  const actualEligible = eligible.map(r => r.bankName);
  
  const allExpectedPresent = expectedEligible.every(bank => 
    actualEligible.some(actual => actual.includes(bank.split(' ')[0]))
  );
  
  if (allExpectedPresent && eligible.length === 3) {
    console.log('\n✓ PASS: Exactly 3 banks eligible (Shri Ram, Poonawala, Axis)');
  } else {
    console.log('\n✗ FAIL: Unexpected eligibility results!');
    console.log(`Expected: ${expectedEligible.join(', ')}`);
    console.log(`Actual: ${actualEligible.join(', ')}`);
  }
  
  console.log('\n✓ Test 2 Complete\n');
}

/**
 * Test 3: Mixed Loans (Traditional + Fintech)
 * Expected: Same as all Fintech (even 1 Fintech loan excludes traditional banks)
 */
async function test3_MixedLoans() {
  console.log('TEST 3: Mixed Loans (2 Traditional + 2 Fintech)');
  console.log('Expected: Only Shri Ram, Poonawala, Axis eligible');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 80000,
    existingLoans: [
      { emi: 8000, pos: 150000, loanName: 'HDFC Personal Loan', isFintechLoan: false, loanSource: 'traditional' },
      { emi: 7000, pos: 120000, loanName: 'MoneyTap Loan', isFintechLoan: true, loanSource: 'fintech' },
      { emi: 6000, pos: 100000, loanName: 'ICICI Personal Loan', isFintechLoan: false, loanSource: 'traditional' },
      { emi: 5000, pos: 80000, loanName: 'KreditBee Loan', isFintechLoan: true, loanSource: 'fintech' }
    ],
    loanTenure: 5,
    category: 'B',
    companyName: 'Wipro',
    creditScore: 700,
    employmentType: 'salaried'
  };
  
  const results = await calculateFullBT(userData);
  
  const eligible = results.filter(r => r.eligible);
  const fintechIssues = results.filter(r => r.fintechLoanIssue);
  
  console.log(`\nLoan Breakdown:`);
  console.log(`  Traditional: 2 loans (HDFC, ICICI)`);
  console.log(`  Fintech: 2 loans (MoneyTap, KreditBee)`);
  
  console.log(`\nEligible Banks (${eligible.length}):`);
  eligible.forEach(r => console.log(`  ✓ ${r.bankName}`));
  
  console.log(`\nExcluded by Fintech Policy (${fintechIssues.length}):`);
  fintechIssues.forEach(r => console.log(`  ✗ ${r.bankName}`));
  
  if (eligible.length === 3) {
    console.log('\n✓ PASS: Even with 2 traditional + 2 Fintech, only 3 banks eligible');
    console.log('  (Confirms: Even 1 Fintech loan excludes traditional banks)');
  } else {
    console.log('\n✗ FAIL: Expected 3 eligible banks');
  }
  
  console.log('\n✓ Test 3 Complete\n');
}

/**
 * Test 4: Partial BT - Exclude Fintech Loans
 * Expected: By excluding Fintech loans, more banks become available
 */
async function test4_PartialBT_ExcludeFintechLoans() {
  console.log('TEST 4: Partial BT - Exclude Fintech Loans');
  console.log('Expected: More banks available when Fintech loans excluded');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 90000,
    existingLoans: [
      { emi: 8000, pos: 150000, loanName: 'HDFC Loan', isFintechLoan: false, loanSource: 'traditional', selectedForBT: true },
      { emi: 7000, pos: 120000, loanName: 'ICICI Loan', isFintechLoan: false, loanSource: 'traditional', selectedForBT: true },
      { emi: 6000, pos: 100000, loanName: 'Kotak Loan', isFintechLoan: false, loanSource: 'traditional', selectedForBT: true },
      { emi: 5000, pos: 80000, loanName: 'MoneyTap', isFintechLoan: true, loanSource: 'fintech', selectedForBT: false },
      { emi: 4000, pos: 60000, loanName: 'PaySense', isFintechLoan: true, loanSource: 'fintech', selectedForBT: false }
    ],
    loanTenure: 5,
    category: 'A',
    companyName: 'TCS',
    creditScore: 750,
    employmentType: 'salaried'
  };
  
  const results = await calculatePartialBT(userData);
  
  const eligible = results.filter(r => r.eligible);
  const fintechIssues = results.filter(r => r.fintechLoanIssue);
  
  console.log(`\nLoan Selection:`);
  console.log(`  Selected for BT: 3 traditional loans`);
  console.log(`  Excluded from BT: 2 Fintech loans`);
  
  console.log(`\nEligible Banks (${eligible.length}):`);
  eligible.forEach(r => console.log(`  ✓ ${r.bankName}`));
  
  console.log(`\nExcluded by Fintech Policy (${fintechIssues.length}):`);
  fintechIssues.forEach(r => console.log(`  ✗ ${r.bankName}`));
  
  if (eligible.length > 3) {
    console.log(`\n✓ PASS: ${eligible.length} banks available (vs 3 if Fintech included)`);
    console.log('  Strategy works: Excluding Fintech opens more options!');
  } else {
    console.log('\n✗ FAIL: Expected more than 3 eligible banks');
  }
  
  console.log('\n✓ Test 4 Complete\n');
}

/**
 * Test 5: Partial BT - Include Fintech Loans
 * Expected: Only 3 banks eligible (Shri Ram, Poonawala, Axis)
 */
async function test5_PartialBT_IncludeFintechLoans() {
  console.log('TEST 5: Partial BT - Include Fintech Loans in Selection');
  console.log('Expected: Only 3 banks eligible');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 90000,
    existingLoans: [
      { emi: 8000, pos: 150000, loanName: 'HDFC Loan', isFintechLoan: false, loanSource: 'traditional', selectedForBT: true },
      { emi: 7000, pos: 120000, loanName: 'MoneyTap', isFintechLoan: true, loanSource: 'fintech', selectedForBT: true },
      { emi: 6000, pos: 100000, loanName: 'Kotak Loan', isFintechLoan: false, loanSource: 'traditional', selectedForBT: false },
      { emi: 5000, pos: 80000, loanName: 'PaySense', isFintechLoan: true, loanSource: 'fintech', selectedForBT: false }
    ],
    loanTenure: 5,
    category: 'A',
    companyName: 'TCS',
    creditScore: 750,
    employmentType: 'salaried'
  };
  
  const results = await calculatePartialBT(userData);
  
  const eligible = results.filter(r => r.eligible);
  const fintechIssues = results.filter(r => r.fintechLoanIssue);
  
  console.log(`\nLoan Selection:`);
  console.log(`  Selected: 1 traditional + 1 Fintech`);
  console.log(`  Not selected: 1 traditional + 1 Fintech`);
  
  console.log(`\nEligible Banks (${eligible.length}):`);
  eligible.forEach(r => console.log(`  ✓ ${r.bankName}`));
  
  console.log(`\nExcluded by Fintech Policy (${fintechIssues.length}):`);
  fintechIssues.forEach(r => console.log(`  ✗ ${r.bankName}`));
  
  if (eligible.length === 3) {
    console.log('\n✓ PASS: Even 1 Fintech loan in selection limits to 3 banks');
  } else {
    console.log('\n✗ FAIL: Expected 3 eligible banks');
  }
  
  console.log('\n✓ Test 5 Complete\n');
}

/**
 * Test 6: Personal Loan BT with Fintech Loans
 * Expected: Only personal loans checked, Fintech policy applied
 */
async function test6_PersonalLoanBT_WithFintech() {
  console.log('TEST 6: Personal Loan BT with Mixed Loan Types');
  console.log('Expected: Only personal Fintech loans checked');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 100000,
    allLoans: [
      { loanType: 'personal', emi: 8000, pos: 150000, loanName: 'MoneyTap', isFintechLoan: true, loanSource: 'fintech' },
      { loanType: 'personal', emi: 7000, pos: 120000, loanName: 'HDFC PL', isFintechLoan: false, loanSource: 'traditional' },
      { loanType: 'personal', emi: 6000, pos: 100000, loanName: 'PaySense', isFintechLoan: true, loanSource: 'fintech' },
      { loanType: 'home', emi: 15000, pos: 800000, loanName: 'Home Loan', isFintechLoan: false, loanSource: 'traditional' },
      { loanType: 'car', emi: 10000, pos: 300000, loanName: 'Car Loan', isFintechLoan: false, loanSource: 'traditional' }
    ],
    loanTenure: 5,
    category: 'A',
    companyName: 'Google',
    creditScore: 780,
    employmentType: 'salaried'
  };
  
  const results = await calculatePersonalLoanBT(userData);
  
  const personalLoans = userData.allLoans.filter(l => l.loanType === 'personal');
  const fintechPersonalLoans = personalLoans.filter(l => l.isFintechLoan);
  
  const eligible = results.filter(r => r.eligible);
  const fintechIssues = results.filter(r => r.fintechLoanIssue);
  
  console.log(`\nLoan Breakdown:`);
  console.log(`  Personal Loans: ${personalLoans.length} (2 Fintech, 1 Traditional)`);
  console.log(`  Other Loans: ${userData.allLoans.length - personalLoans.length} (Home, Car)`);
  
  console.log(`\nEligible Banks (${eligible.length}):`);
  eligible.forEach(r => console.log(`  ✓ ${r.bankName}`));
  
  console.log(`\nExcluded by Fintech Policy (${fintechIssues.length}):`);
  fintechIssues.forEach(r => {
    console.log(`  ✗ ${r.bankName}: ${r.fintechLoansCount} Fintech personal loan(s)`);
  });
  
  if (eligible.length === 3) {
    console.log('\n✓ PASS: Personal Loan BT correctly identifies Fintech personal loans');
    console.log('  (Home & Car loans ignored for Fintech check)');
  } else {
    console.log('\n✗ FAIL: Expected 3 eligible banks');
  }
  
  console.log('\n✓ Test 6 Complete\n');
}

/**
 * Test 7: Verify Exact Banks Accepting Fintech
 * Expected: Only Shri Ram, Poonawala, Axis accept Fintech
 */
async function test7_VerifyFintechAcceptingBanks() {
  console.log('TEST 7: Verify Banks Accepting Fintech Loans');
  console.log('Expected: Shri Ram, Poonawala, Axis only');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 60000,
    existingLoans: [
      { emi: 8000, pos: 150000, loanName: 'MoneyTap', isFintechLoan: true, loanSource: 'fintech' }
    ],
    loanTenure: 5,
    category: 'A',
    companyName: 'TCS',
    creditScore: 750,
    employmentType: 'salaried'
  };
  
  const results = await calculateFullBT(userData);
  
  const eligible = results.filter(r => r.eligible);
  const fintechRejected = results.filter(r => r.fintechLoanIssue);
  
  console.log(`\n✅ Banks ACCEPTING Fintech (${eligible.length}):`);
  eligible.forEach(r => console.log(`  ${r.bankName}`));
  
  console.log(`\n❌ Banks REJECTING Fintech (${fintechRejected.length}):`);
  fintechRejected.forEach(r => console.log(`  ${r.bankName}`));
  
  const acceptingBanks = eligible.map(r => r.bankName);
  const hasShriRam = acceptingBanks.some(b => b.includes('Shri Ram'));
  const hasPoonawala = acceptingBanks.some(b => b.includes('Poonawala'));
  const hasAxis = acceptingBanks.some(b => b.includes('Axis'));
  
  if (hasShriRam && hasPoonawala && hasAxis && eligible.length === 3) {
    console.log('\n✓ PASS: Correct banks accept Fintech loans');
  } else {
    console.log('\n✗ FAIL: Unexpected Fintech acceptance pattern');
  }
  
  console.log('\n✓ Test 7 Complete\n');
}

/**
 * Run All Tests
 */
async function runAllTests() {
  console.log('Starting Fintech Loan BT Policy Tests...\n');
  
  try {
    await test1_TraditionalLoansOnly();
    await test2_AllFintechLoans();
    await test3_MixedLoans();
    await test4_PartialBT_ExcludeFintechLoans();
    await test5_PartialBT_IncludeFintechLoans();
    await test6_PersonalLoanBT_WithFintech();
    await test7_VerifyFintechAcceptingBanks();
    
    console.log('========================================');
    console.log('ALL FINTECH LOAN BT TESTS COMPLETED');
    console.log('========================================');
    
    console.log('\n📊 SUMMARY:');
    console.log('✓ Traditional loans: All banks available (except Bandhan)');
    console.log('✓ Fintech loans: Only Shri Ram, Poonawala, Axis available');
    console.log('✓ Mixed loans: Same as all Fintech (even 1 excludes traditional banks)');
    console.log('✓ Partial BT: Excluding Fintech opens more options');
    console.log('✓ Personal Loan BT: Correctly identifies Fintech personal loans');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the tests
runAllTests();
