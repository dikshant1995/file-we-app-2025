/**
 * BT Loan Capping Test Suite
 * 
 * Tests the loan capping validation across all banks for:
 * 1. Full BT with different loan counts
 * 2. Partial BT with selected loans
 * 3. Personal Loan BT with mixed loan types
 */

import { calculateFullBT, calculatePartialBT } from '../services/btLoanService.js';
import { calculatePersonalLoanBT } from '../services/btPersonalLoanService.js';

console.log('========================================');
console.log('BT LOAN CAPPING TEST SUITE');
console.log('========================================\n');

/**
 * Test 1: Customer with 3 Personal Loans
 * Expected: All banks eligible (except Bandhan - no BT)
 */
async function test1_ThreeLoans() {
  console.log('TEST 1: Customer with 3 Personal Loans');
  console.log('Expected: All banks eligible (except Bandhan)');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 60000,
    existingLoans: [
      { emi: 8000, pos: 150000, loanName: 'Personal Loan 1' },
      { emi: 6000, pos: 100000, loanName: 'Personal Loan 2' },
      { emi: 5000, pos: 80000, loanName: 'Personal Loan 3' }
    ],
    loanTenure: 5,
    category: 'A',
    companyName: 'TCS',
    creditScore: 750,
    employmentType: 'salaried'
  };
  
  const results = await calculateFullBT(userData);
  
  console.log('\nResults Summary:');
  console.log(`Total Banks: ${results.length}`);
  console.log(`Eligible: ${results.filter(r => r.eligible).length}`);
  console.log(`Ineligible: ${results.filter(r => !r.eligible).length}`);
  
  const btCappingIssues = results.filter(r => r.btCappingIssue);
  console.log(`BT Capping Issues: ${btCappingIssues.length}`);
  
  if (btCappingIssues.length > 0) {
    console.log('\nBanks with BT Capping Issues:');
    btCappingIssues.forEach(r => {
      console.log(`  - ${r.bankName}: ${r.reason}`);
    });
  }
  
  console.log('\n✓ Test 1 Complete\n');
}

/**
 * Test 2: Customer with 6 Personal Loans
 * Expected: Kotak, Chola, Tata, Axis, Poonawala, Shri Ram eligible
 * HDFC, IDFC (cap 3), ICICI/Piramal/IndusInd (cap 5) should be capped
 */
async function test2_SixLoans() {
  console.log('TEST 2: Customer with 6 Personal Loans');
  console.log('Expected: Only banks with cap >= 6 eligible');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 80000,
    existingLoans: [
      { emi: 7000, pos: 120000, loanName: 'Personal Loan 1' },
      { emi: 6500, pos: 110000, loanName: 'Personal Loan 2' },
      { emi: 6000, pos: 100000, loanName: 'Personal Loan 3' },
      { emi: 5500, pos: 90000, loanName: 'Personal Loan 4' },
      { emi: 5000, pos: 80000, loanName: 'Personal Loan 5' },
      { emi: 4500, pos: 70000, loanName: 'Personal Loan 6' }
    ],
    loanTenure: 5,
    category: 'A',
    companyName: 'Infosys',
    creditScore: 750,
    employmentType: 'salaried'
  };
  
  const results = await calculateFullBT(userData);
  
  console.log('\nResults by Capping Status:');
  
  const eligible = results.filter(r => r.eligible);
  const cappingIssues = results.filter(r => r.btCappingIssue);
  const otherIssues = results.filter(r => !r.eligible && !r.btCappingIssue);
  
  console.log(`\nEligible Banks (${eligible.length}):`);
  eligible.forEach(r => {
    console.log(`  ✓ ${r.bankName}`);
  });
  
  console.log(`\nCapping Exceeded (${cappingIssues.length}):`);
  cappingIssues.forEach(r => {
    console.log(`  ✗ ${r.bankName}: Max ${r.maxLoansAllowed} loans allowed`);
  });
  
  if (otherIssues.length > 0) {
    console.log(`\nOther Ineligibility Reasons (${otherIssues.length}):`);
    otherIssues.forEach(r => {
      console.log(`  ✗ ${r.bankName}: ${r.reason}`);
    });
  }
  
  console.log('\n✓ Test 2 Complete\n');
}

/**
 * Test 3: Customer with 10 Personal Loans
 * Expected: Only Shri Ram Finance eligible (cap: 10)
 */
async function test3_TenLoans() {
  console.log('TEST 3: Customer with 10 Personal Loans');
  console.log('Expected: Only Shri Ram Finance eligible');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 120000,
    existingLoans: [
      { emi: 5000, pos: 80000, loanName: 'Personal Loan 1' },
      { emi: 5000, pos: 80000, loanName: 'Personal Loan 2' },
      { emi: 4500, pos: 70000, loanName: 'Personal Loan 3' },
      { emi: 4500, pos: 70000, loanName: 'Personal Loan 4' },
      { emi: 4000, pos: 60000, loanName: 'Personal Loan 5' },
      { emi: 4000, pos: 60000, loanName: 'Personal Loan 6' },
      { emi: 3500, pos: 50000, loanName: 'Personal Loan 7' },
      { emi: 3500, pos: 50000, loanName: 'Personal Loan 8' },
      { emi: 3000, pos: 40000, loanName: 'Personal Loan 9' },
      { emi: 3000, pos: 40000, loanName: 'Personal Loan 10' }
    ],
    loanTenure: 5,
    category: 'A',
    companyName: 'Wipro',
    creditScore: 750,
    employmentType: 'salaried'
  };
  
  const results = await calculateFullBT(userData);
  
  const eligible = results.filter(r => r.eligible);
  const cappingIssues = results.filter(r => r.btCappingIssue);
  
  console.log(`\nEligible Banks (${eligible.length}):`);
  eligible.forEach(r => {
    console.log(`  ✓ ${r.bankName} - Fresh Amount: ₹${r.freshAmountDisbursed?.toLocaleString()}`);
  });
  
  console.log(`\nBanks Exceeding Cap (${cappingIssues.length}):`);
  const capGroups = {};
  cappingIssues.forEach(r => {
    const cap = r.maxLoansAllowed || 0;
    if (!capGroups[cap]) capGroups[cap] = [];
    capGroups[cap].push(r.bankName);
  });
  
  Object.keys(capGroups).sort((a, b) => b - a).forEach(cap => {
    console.log(`  Cap ${cap}: ${capGroups[cap].join(', ')}`);
  });
  
  console.log('\n✓ Test 3 Complete\n');
}

/**
 * Test 4: Partial BT - Customer selects 4 out of 7 loans
 * Expected: All banks with cap >= 4 eligible
 */
async function test4_PartialBT() {
  console.log('TEST 4: Partial BT - Customer selects 4 out of 7 loans');
  console.log('Expected: Banks with cap >= 4 eligible');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 70000,
    existingLoans: [
      { emi: 7000, pos: 120000, loanName: 'Personal Loan 1', selectedForBT: true },
      { emi: 6000, pos: 100000, loanName: 'Personal Loan 2', selectedForBT: true },
      { emi: 5500, pos: 90000, loanName: 'Personal Loan 3', selectedForBT: true },
      { emi: 5000, pos: 80000, loanName: 'Personal Loan 4', selectedForBT: true },
      { emi: 4500, pos: 70000, loanName: 'Personal Loan 5', selectedForBT: false },
      { emi: 4000, pos: 60000, loanName: 'Personal Loan 6', selectedForBT: false },
      { emi: 3500, pos: 50000, loanName: 'Personal Loan 7', selectedForBT: false }
    ],
    loanTenure: 5,
    category: 'B',
    companyName: 'HCL',
    creditScore: 720,
    employmentType: 'salaried'
  };
  
  const results = await calculatePartialBT(userData);
  
  const eligible = results.filter(r => r.eligible);
  const cappingIssues = results.filter(r => r.btCappingIssue);
  
  console.log(`\nSelected for BT: 4 loans`);
  console.log(`Not selected: 3 loans`);
  
  console.log(`\nEligible Banks (${eligible.length}):`);
  eligible.forEach(r => {
    console.log(`  ✓ ${r.bankName}`);
  });
  
  console.log(`\nCapping Exceeded (${cappingIssues.length}):`);
  cappingIssues.forEach(r => {
    console.log(`  ✗ ${r.bankName}: Max ${r.maxLoansAllowed} loans, selected ${r.selectedLoansForBT}`);
  });
  
  console.log('\n✓ Test 4 Complete\n');
}

/**
 * Test 5: Personal Loan BT with Mixed Loan Types
 * Expected: Only personal loans counted for capping
 */
async function test5_PersonalLoanBT() {
  console.log('TEST 5: Personal Loan BT with Mixed Loan Types');
  console.log('Expected: Only 4 personal loans counted for capping');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 90000,
    allLoans: [
      { loanType: 'personal', emi: 8000, pos: 150000, loanName: 'Personal Loan 1' },
      { loanType: 'personal', emi: 7000, pos: 120000, loanName: 'Personal Loan 2' },
      { loanType: 'personal', emi: 6000, pos: 100000, loanName: 'Personal Loan 3' },
      { loanType: 'personal', emi: 5000, pos: 80000, loanName: 'Personal Loan 4' },
      { loanType: 'home', emi: 12000, pos: 500000, loanName: 'Home Loan' },
      { loanType: 'car', emi: 8000, pos: 150000, loanName: 'Car Loan' }
    ],
    loanTenure: 5,
    category: 'A',
    companyName: 'TCS',
    creditScore: 750,
    employmentType: 'salaried'
  };
  
  const results = await calculatePersonalLoanBT(userData);
  
  const personalLoans = userData.allLoans.filter(l => l.loanType === 'personal');
  const nonPersonalLoans = userData.allLoans.filter(l => l.loanType !== 'personal');
  
  console.log(`\nLoan Breakdown:`);
  console.log(`  Personal Loans: ${personalLoans.length} (for BT)`);
  console.log(`  Other Loans: ${nonPersonalLoans.length} (not for BT)`);
  
  const eligible = results.filter(r => r.eligible);
  const cappingIssues = results.filter(r => r.btCappingIssue);
  
  console.log(`\nEligible Banks (${eligible.length}):`);
  eligible.forEach(r => {
    console.log(`  ✓ ${r.bankName}`);
  });
  
  console.log(`\nCapping Exceeded (${cappingIssues.length}):`);
  cappingIssues.forEach(r => {
    console.log(`  ✗ ${r.bankName}: Max ${r.maxLoansAllowed} personal loans allowed`);
  });
  
  console.log('\n✓ Test 5 Complete\n');
}

/**
 * Test 6: Edge Case - 11 Personal Loans
 * Expected: No bank can handle (even Shri Ram max is 10)
 */
async function test6_ElevenLoans() {
  console.log('TEST 6: Edge Case - Customer with 11 Personal Loans');
  console.log('Expected: All banks exceed capping');
  console.log('----------------------------------------');
  
  const userData = {
    monthlyIncome: 150000,
    existingLoans: Array.from({ length: 11 }, (_, i) => ({
      emi: 4000,
      pos: 60000,
      loanName: `Personal Loan ${i + 1}`
    })),
    loanTenure: 5,
    category: 'A',
    companyName: 'Google',
    creditScore: 800,
    employmentType: 'salaried'
  };
  
  const results = await calculateFullBT(userData);
  
  const eligible = results.filter(r => r.eligible);
  const cappingIssues = results.filter(r => r.btCappingIssue);
  
  console.log(`\nTotal Loans: 11`);
  console.log(`Eligible Banks: ${eligible.length}`);
  console.log(`Capping Exceeded: ${cappingIssues.length}`);
  
  if (eligible.length === 0) {
    console.log('\n✓ Confirmed: No bank can handle 11 loans');
    console.log('Recommendation: Customer should consider Partial BT');
    console.log('  - Select 10 highest POS loans for Shri Ram Finance');
    console.log('  - Keep 1 loan active separately');
  } else {
    console.log('\n✗ Unexpected: Some banks accepted 11 loans!');
    eligible.forEach(r => {
      console.log(`  ${r.bankName}`);
    });
  }
  
  console.log('\n✓ Test 6 Complete\n');
}

/**
 * Run All Tests
 */
async function runAllTests() {
  console.log('Starting BT Loan Capping Tests...\n');
  
  try {
    await test1_ThreeLoans();
    await test2_SixLoans();
    await test3_TenLoans();
    await test4_PartialBT();
    await test5_PersonalLoanBT();
    await test6_ElevenLoans();
    
    console.log('========================================');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('========================================');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the tests
runAllTests();
