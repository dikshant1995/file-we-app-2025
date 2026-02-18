/**
 * Enhanced Loan Calculator Test Suite
 * 
 * This file contains test cases to verify that the enhanced frontend
 * calculations match the backend results.
 */

import { calculateAllScenarios } from '../services/enhancedLoanService.js';

// Test Case 1: Fresh Loan with Good Salary
const testCase1 = {
  name: "Test Case 1: Fresh Loan - Category A, ₹75,000 salary",
  formData: {
    customerInfo: {
      desiredLoanAmount: '',
      monthlyIncome: '75000',
      loanTenure: '5',
      companyName: 'TCS',
      employmentType: 'salaried',
      category: 'A',
      creditScore: '750'
    },
    existingLiabilities: [],
    selectedLiabilities: []
  }
};

// Test Case 2: Full Balance Transfer with Multiple Loans
const testCase2 = {
  name: "Test Case 2: Full Balance Transfer - 3 existing loans",
  formData: {
    customerInfo: {
      desiredLoanAmount: '',
      monthlyIncome: '100000',
      loanTenure: '6',
      companyName: 'Microsoft',
      employmentType: 'salaried',
      category: 'A',
      creditScore: '800'
    },
    existingLiabilities: [
      {
        id: 1,
        type: 'Personal Loan',
        name: 'HDFC Personal Loan',
        outstandingAmount: '500000',
        monthlyPayment: '15000'
      },
      {
        id: 2,
        type: 'Personal Loan',
        name: 'ICICI Personal Loan',
        outstandingAmount: '300000',
        monthlyPayment: '10000'
      },
      {
        id: 3,
        type: 'Personal Loan',
        name: 'Axis Personal Loan',
        outstandingAmount: '200000',
        monthlyPayment: '8000'
      }
    ],
    selectedLiabilities: [1, 2, 3]
  }
};

// Test Case 3: Partial Balance Transfer with Credit Cards
const testCase3 = {
  name: "Test Case 3: Partial Balance Transfer - Selected loans and credit cards",
  formData: {
    customerInfo: {
      desiredLoanAmount: '',
      monthlyIncome: '95000',
      loanTenure: '6',
      companyName: 'Infosys',
      employmentType: 'salaried',
      category: 'A',
      creditScore: '720'
    },
    existingLiabilities: [
      {
        id: 1,
        type: 'Personal Loan',
        name: 'HDFC Personal Loan',
        outstandingAmount: '500000',
        monthlyPayment: '15000'
      },
      {
        id: 2,
        type: 'Personal Loan',
        name: 'ICICI Personal Loan',
        outstandingAmount: '300000',
        monthlyPayment: '10000'
      },
      {
        id: 3,
        type: 'Credit Card',
        name: 'HDFC Regalia',
        outstandingAmount: '200000',
        monthlyPayment: '8000'
      },
      {
        id: 4,
        type: 'Credit Card',
        name: 'ICICI Coral',
        outstandingAmount: '150000',
        monthlyPayment: '6000'
      }
    ],
    selectedLiabilities: [1, 3] // Select only first personal loan and first credit card
  }
};

// Test Case 4: Category B with Lower Salary
const testCase4 = {
  name: "Test Case 4: Category B - ₹50,000 salary with existing debt",
  formData: {
    customerInfo: {
      desiredLoanAmount: '',
      monthlyIncome: '50000',
      loanTenure: '5',
      companyName: 'Local Company',
      employmentType: 'salaried',
      category: 'B',
      creditScore: '680'
    },
    existingLiabilities: [
      {
        id: 1,
        type: 'Personal Loan',
        name: 'Existing Personal Loan',
        outstandingAmount: '150000',
        monthlyPayment: '5000'
      }
    ],
    selectedLiabilities: [1]
  }
};

// Test Case 5: Government Employee
const testCase5 = {
  name: "Test Case 5: Government Employee - High eligibility",
  formData: {
    customerInfo: {
      desiredLoanAmount: '',
      monthlyIncome: '80000',
      loanTenure: '6',
      companyName: 'Government of India',
      employmentType: 'government',
      category: 'GOVT',
      creditScore: '780'
    },
    existingLiabilities: [
      {
        id: 1,
        type: 'Personal Loan',
        name: 'Existing Loan',
        outstandingAmount: '400000',
        monthlyPayment: '12000'
      }
    ],
    selectedLiabilities: [1]
  }
};

/**
 * Run a single test case and display results
 */
export const runTestCase = async (testCase) => {
  console.log('\n' + '='.repeat(80));
  console.log(testCase.name);
  console.log('='.repeat(80));
  
  console.log('\n📋 Input Data:');
  console.log('Customer Info:', testCase.formData.customerInfo);
  console.log('Existing Liabilities:', testCase.formData.existingLiabilities);
  console.log('Selected Liabilities:', testCase.formData.selectedLiabilities);
  
  try {
    const startTime = performance.now();
    const results = await calculateAllScenarios(testCase.formData);
    const endTime = performance.now();
    
    console.log(`\n⏱️  Calculation Time: ${(endTime - startTime).toFixed(2)}ms`);
    
    // Display Fresh Loan Results
    console.log('\n💰 FRESH LOAN RESULTS:');
    console.log('-'.repeat(80));
    const freshEligible = results.freshLoan.filter(r => r.eligible);
    console.log(`Eligible Banks: ${freshEligible.length} of ${results.freshLoan.length}`);
    
    if (freshEligible.length > 0) {
      const bestFresh = freshEligible.reduce((best, current) => 
        current.loanAmount > best.loanAmount ? current : best
      );
      console.log(`\nBest Offer: ${bestFresh.bankName}`);
      console.log(`  Loan Amount: ₹${bestFresh.loanAmount?.toLocaleString()}`);
      console.log(`  Monthly EMI: ₹${bestFresh.monthlyEMI?.toLocaleString()}`);
      console.log(`  Interest Rate: ${bestFresh.interestRate}%`);
      console.log(`  Calculation Method: ${bestFresh.calculationMethod}`);
    }
    
    // Display Full BT Results
    console.log('\n🔄 FULL BALANCE TRANSFER RESULTS:');
    console.log('-'.repeat(80));
    const fullBTEligible = results.fullBT.filter(r => r.eligible);
    console.log(`Eligible Banks: ${fullBTEligible.length} of ${results.fullBT.length}`);
    
    if (fullBTEligible.length > 0) {
      const bestFullBT = fullBTEligible.reduce((best, current) => 
        current.freshAmountDisbursed > best.freshAmountDisbursed ? current : best
      );
      console.log(`\nBest Offer: ${bestFullBT.bankName}`);
      console.log(`  Total Loan Amount: ₹${bestFullBT.maxLoanAmount?.toLocaleString()}`);
      console.log(`  Fresh Funds Disbursed: ₹${bestFullBT.freshAmountDisbursed?.toLocaleString()}`);
      console.log(`  Total POS Cleared: ₹${bestFullBT.totalPOS?.toLocaleString()}`);
      console.log(`  New Single EMI: ₹${(bestFullBT.newSingleEMI || bestFullBT.newBTLoanEMI)?.toLocaleString()}`);
      console.log(`  Interest Rate: ${bestFullBT.interestRate}%`);
    }
    
    // Display Partial BT Results
    console.log('\n☑️  PARTIAL BALANCE TRANSFER RESULTS:');
    console.log('-'.repeat(80));
    const partialBTEligible = results.partialBT.filter(r => r.eligible);
    console.log(`Eligible Banks: ${partialBTEligible.length} of ${results.partialBT.length}`);
    
    if (partialBTEligible.length > 0) {
      const bestPartialBT = partialBTEligible.reduce((best, current) => 
        current.freshAmountDisbursed > best.freshAmountDisbursed ? current : best
      );
      console.log(`\nBest Offer: ${bestPartialBT.bankName}`);
      console.log(`  Total Loan Amount: ₹${bestPartialBT.maxLoanAmount?.toLocaleString()}`);
      console.log(`  Fresh Funds Disbursed: ₹${bestPartialBT.freshAmountDisbursed?.toLocaleString()}`);
      console.log(`  Selected POS Cleared: ₹${bestPartialBT.selectedPOS?.toLocaleString()}`);
      console.log(`  New BT Loan EMI: ₹${(bestPartialBT.newSingleEMI || bestPartialBT.newBTLoanEMI)?.toLocaleString()}`);
      console.log(`  Non-Selected EMI: ₹${bestPartialBT.nonSelectedEMI?.toLocaleString()}`);
      console.log(`  Total Monthly Outflow: ₹${bestPartialBT.totalMonthlyOutflow?.toLocaleString()}`);
      console.log(`  Interest Rate: ${bestPartialBT.interestRate}%`);
    }
    
    // Display Bank-by-Bank Comparison
    console.log('\n📊 BANK-BY-BANK COMPARISON:');
    console.log('-'.repeat(80));
    console.log('Bank Name'.padEnd(25) + 'Fresh Loan'.padEnd(15) + 'Full BT'.padEnd(15) + 'Partial BT');
    console.log('-'.repeat(80));
    
    for (let i = 0; i < results.freshLoan.length; i++) {
      const fresh = results.freshLoan[i];
      const fullBT = results.fullBT[i];
      const partialBT = results.partialBT[i];
      
      const freshAmount = fresh.eligible ? `₹${(fresh.loanAmount / 100000).toFixed(2)}L` : 'N/A';
      const fullBTAmount = fullBT.eligible ? `₹${(fullBT.freshAmountDisbursed / 100000).toFixed(2)}L` : 'N/A';
      const partialBTAmount = partialBT.eligible ? `₹${(partialBT.freshAmountDisbursed / 100000).toFixed(2)}L` : 'N/A';
      
      console.log(
        fresh.bankName.padEnd(25) +
        freshAmount.padEnd(15) +
        fullBTAmount.padEnd(15) +
        partialBTAmount
      );
    }
    
    // Return results for further processing
    return {
      success: true,
      testName: testCase.name,
      results: results,
      summary: {
        freshLoan: {
          eligible: freshEligible.length,
          total: results.freshLoan.length,
          bestOffer: freshEligible.length > 0 ? freshEligible.reduce((best, current) => 
            current.loanAmount > best.loanAmount ? current : best
          ) : null
        },
        fullBT: {
          eligible: fullBTEligible.length,
          total: results.fullBT.length,
          bestOffer: fullBTEligible.length > 0 ? fullBTEligible.reduce((best, current) => 
            current.freshAmountDisbursed > best.freshAmountDisbursed ? current : best
          ) : null
        },
        partialBT: {
          eligible: partialBTEligible.length,
          total: results.partialBT.length,
          bestOffer: partialBTEligible.length > 0 ? partialBTEligible.reduce((best, current) => 
            current.freshAmountDisbursed > best.freshAmountDisbursed ? current : best
          ) : null
        }
      }
    };
    
  } catch (error) {
    console.error('\n❌ Error running test case:', error);
    return {
      success: false,
      testName: testCase.name,
      error: error.message
    };
  }
};

/**
 * Run all test cases
 */
export const runAllTests = async () => {
  console.log('\n' + '█'.repeat(80));
  console.log('ENHANCED LOAN CALCULATOR - COMPREHENSIVE TEST SUITE');
  console.log('█'.repeat(80));
  
  const testCases = [testCase1, testCase2, testCase3, testCase4, testCase5];
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runTestCase(testCase);
    results.push(result);
  }
  
  // Summary Report
  console.log('\n' + '█'.repeat(80));
  console.log('TEST SUITE SUMMARY');
  console.log('█'.repeat(80));
  
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success).length;
  
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  
  if (failedTests > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.testName}: ${r.error}`);
    });
  }
  
  return results;
};

// Export test cases for individual testing
export const testCases = {
  testCase1,
  testCase2,
  testCase3,
  testCase4,
  testCase5
};
