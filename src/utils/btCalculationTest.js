/**
 * Balance Transfer (BT) Calculation Test Suite
 * Demonstrates Full BT and Partial BT calculations
 */

import { calculateFullBT, calculatePartialBT, getBTRecommendations } from '../services/btLoanService.js';

// ============================================================================
// TEST 1: Full BT Calculation
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('TEST 1: FULL BT CALCULATION - All Loans Transferred');
console.log('='.repeat(80));

const fullBTScenario = {
  monthlyIncome: 100000,
  loanTenure: 6, // years
  category: 'A',
  companyName: 'TCS',
  creditScore: 750,
  employmentType: 'salaried',
  
  // All 5 existing loans
  existingLoans: [
    { loanName: 'Loan 1', emi: 10000, pos: 100000, selectedForBT: true },
    { loanName: 'Loan 2', emi: 10000, pos: 120000, selectedForBT: true },
    { loanName: 'Loan 3', emi: 10000, pos: 130000, selectedForBT: true },
    { loanName: 'Loan 4', emi: 10000, pos: 100000, selectedForBT: true },
    { loanName: 'Loan 5', emi: 25000, pos: 150000, selectedForBT: true }
  ]
};

console.log('\n📊 Customer Profile:');
console.log(`   Salary: ₹${fullBTScenario.monthlyIncome.toLocaleString()}`);
console.log(`   Current Active Loans: ${fullBTScenario.existingLoans.length}`);
console.log(`   Current Total EMI: ₹${fullBTScenario.existingLoans.reduce((sum, l) => sum + l.emi, 0).toLocaleString()}`);
console.log(`   Total POS: ₹${fullBTScenario.existingLoans.reduce((sum, l) => sum + l.pos, 0).toLocaleString()}`);
console.log(`   Desired Tenure: ${fullBTScenario.loanTenure} years`);

console.log('\n📋 Existing Loans:');
fullBTScenario.existingLoans.forEach((loan, idx) => {
  console.log(`   ${idx + 1}. ${loan.loanName}: EMI ₹${loan.emi.toLocaleString()}, POS ₹${loan.pos.toLocaleString()}`);
});

// Run Full BT calculation
(async () => {
  try {
    const fullBTResults = await calculateFullBT(fullBTScenario);
    
    console.log('\n✅ Full BT Results:\n');
    
    // Filter eligible banks
    const eligible = fullBTResults.filter(r => r.eligible);
    const notEligible = fullBTResults.filter(r => !r.eligible);
    
    console.log(`   Total Banks Eligible: ${eligible.length} out of ${fullBTResults.length}`);
    
    if (eligible.length > 0) {
      console.log('\n   Top 5 Banks by Fresh Amount:');
      eligible
        .sort((a, b) => b.freshAmountDisbursed - a.freshAmountDisbursed)
        .slice(0, 5)
        .forEach((result, idx) => {
          console.log(`\n   ${idx + 1}. ${result.bankName}`);
          console.log(`      Max Loan Amount: ₹${result.maxLoanAmount.toLocaleString()}`);
          console.log(`      Total POS Deducted: ₹${result.totalPOS.toLocaleString()}`);
          console.log(`      Fresh Amount: ₹${result.freshAmountDisbursed.toLocaleString()} 💰`);
          console.log(`      New Single EMI: ₹${result.newSingleEMI.toLocaleString()}`);
          console.log(`      Interest Rate: ${result.interestRate}%`);
          console.log(`      Previous Total EMI: ₹${result.previousTotalEMI.toLocaleString()}`);
          console.log(`      EMI Difference: ₹${result.emiDifference.toLocaleString()}`);
        });
      
      // Get recommendations
      const recommendations = getBTRecommendations(fullBTResults);
      console.log('\n🏆 Recommendations:');
      console.log(`   Best for Fresh Funds: ${recommendations.bestForFreshFunds.bankName} (₹${recommendations.bestForFreshFunds.freshAmountDisbursed.toLocaleString()})`);
      console.log(`   Best for Low EMI: ${recommendations.bestForLowEMI.bankName} (₹${recommendations.bestForLowEMI.newSingleEMI.toLocaleString()})`);
      console.log(`   Best for Low Interest: ${recommendations.bestForLowInterest.bankName} (${recommendations.bestForLowInterest.interestRate}%)`);
    }
    
    if (notEligible.length > 0) {
      console.log('\n\n   ❌ Banks Not Eligible:');
      notEligible.forEach((result, idx) => {
        console.log(`   ${idx + 1}. ${result.bankName}: ${result.reason}`);
      });
    }
    
    // ============================================================================
    // TEST 2: Partial BT Calculation
    // ============================================================================
    
    console.log('\n\n' + '='.repeat(80));
    console.log('TEST 2: PARTIAL BT CALCULATION - Selected Loans Only');
    console.log('='.repeat(80));
    
    const partialBTScenario = {
      monthlyIncome: 100000,
      loanTenure: 6, // years
      category: 'A',
      companyName: 'TCS',
      creditScore: 750,
      employmentType: 'salaried',
      
      // Only 3 loans selected for BT
      existingLoans: [
        { loanName: 'Loan 1', emi: 10000, pos: 100000, selectedForBT: false }, // ❌ Not BT
        { loanName: 'Loan 2', emi: 10000, pos: 120000, selectedForBT: true },  // ✅ BT
        { loanName: 'Loan 3', emi: 10000, pos: 130000, selectedForBT: true },  // ✅ BT
        { loanName: 'Loan 4', emi: 10000, pos: 100000, selectedForBT: false }, // ❌ Not BT
        { loanName: 'Loan 5', emi: 25000, pos: 150000, selectedForBT: true }   // ✅ BT
      ]
    };
    
    const btLoans = partialBTScenario.existingLoans.filter(l => l.selectedForBT);
    const nonBTLoans = partialBTScenario.existingLoans.filter(l => !l.selectedForBT);
    
    console.log('\n📊 Customer Profile:');
    console.log(`   Salary: ₹${partialBTScenario.monthlyIncome.toLocaleString()}`);
    console.log(`   Total Active Loans: ${partialBTScenario.existingLoans.length}`);
    
    console.log('\n✅ Loans Selected for BT (${btLoans.length}):');
    btLoans.forEach((loan, idx) => {
      console.log(`   ${idx + 1}. ${loan.loanName}: EMI ₹${loan.emi.toLocaleString()}, POS ₹${loan.pos.toLocaleString()}`);
    });
    console.log(`   Total BT EMI: ₹${btLoans.reduce((sum, l) => sum + l.emi, 0).toLocaleString()}`);
    console.log(`   Total BT POS: ₹${btLoans.reduce((sum, l) => sum + l.pos, 0).toLocaleString()}`);
    
    console.log('\n❌ Loans NOT Selected for BT (${nonBTLoans.length}):');
    nonBTLoans.forEach((loan, idx) => {
      console.log(`   ${idx + 1}. ${loan.loanName}: EMI ₹${loan.emi.toLocaleString()}, POS ₹${loan.pos.toLocaleString()}`);
    });
    console.log(`   Total Non-BT EMI: ₹${nonBTLoans.reduce((sum, l) => sum + l.emi, 0).toLocaleString()}`);
    
    const adjustedSalary = partialBTScenario.monthlyIncome - nonBTLoans.reduce((sum, l) => sum + l.emi, 0);
    console.log(`\n💡 Adjusted Salary Calculation:`);
    console.log(`   Original Salary: ₹${partialBTScenario.monthlyIncome.toLocaleString()}`);
    console.log(`   Minus Non-BT EMI: ₹${nonBTLoans.reduce((sum, l) => sum + l.emi, 0).toLocaleString()}`);
    console.log(`   Adjusted Salary: ₹${adjustedSalary.toLocaleString()}`);
    
    // Run Partial BT calculation
    const partialBTResults = await calculatePartialBT(partialBTScenario);
    
    console.log('\n✅ Partial BT Results:\n');
    
    const eligiblePartial = partialBTResults.filter(r => r.eligible);
    const notEligiblePartial = partialBTResults.filter(r => !r.eligible);
    
    console.log(`   Total Banks Eligible: ${eligiblePartial.length} out of ${partialBTResults.length}`);
    
    if (eligiblePartial.length > 0) {
      console.log('\n   Top 5 Banks by Fresh Amount:');
      eligiblePartial
        .sort((a, b) => b.freshAmountDisbursed - a.freshAmountDisbursed)
        .slice(0, 5)
        .forEach((result, idx) => {
          console.log(`\n   ${idx + 1}. ${result.bankName}`);
          console.log(`      Max Loan Amount: ₹${result.maxLoanAmount.toLocaleString()}`);
          console.log(`      Selected Loans POS: ₹${result.selectedLoansPOS.toLocaleString()}`);
          console.log(`      Fresh Amount: ₹${result.freshAmountDisbursed.toLocaleString()} 💰`);
          console.log(`      New BT Loan EMI: ₹${result.newBTLoanEMI.toLocaleString()}`);
          console.log(`      Non-BT Loans EMI: ₹${result.nonBTLoansEMI.toLocaleString()}`);
          console.log(`      Total Monthly Outflow: ₹${result.totalMonthlyOutflow.toLocaleString()}`);
          console.log(`      Interest Rate: ${result.interestRate}%`);
          console.log(`      Adjusted Salary Used: ₹${result.adjustedSalary.toLocaleString()}`);
        });
      
      // Get recommendations
      const partialRecommendations = getBTRecommendations(partialBTResults);
      console.log('\n🏆 Recommendations:');
      console.log(`   Best for Fresh Funds: ${partialRecommendations.bestForFreshFunds.bankName} (₹${partialRecommendations.bestForFreshFunds.freshAmountDisbursed.toLocaleString()})`);
      console.log(`   Best for Low EMI: ${partialRecommendations.bestForLowEMI.bankName} (₹${partialRecommendations.bestForLowEMI.newBTLoanEMI.toLocaleString()})`);
      console.log(`   Best for Low Interest: ${partialRecommendations.bestForLowInterest.bankName} (${partialRecommendations.bestForLowInterest.interestRate}%)`);
    }
    
    if (notEligiblePartial.length > 0) {
      console.log('\n\n   ❌ Banks Not Eligible:');
      notEligiblePartial.forEach((result, idx) => {
        console.log(`   ${idx + 1}. ${result.bankName}: ${result.reason}`);
      });
    }
    
    // ============================================================================
    // Comparison Summary
    // ============================================================================
    
    console.log('\n\n' + '='.repeat(80));
    console.log('COMPARISON: Full BT vs Partial BT');
    console.log('='.repeat(80));
    
    if (eligible.length > 0 && eligiblePartial.length > 0) {
      const fullBest = eligible.sort((a, b) => b.freshAmountDisbursed - a.freshAmountDisbursed)[0];
      const partialBest = eligiblePartial.sort((a, b) => b.freshAmountDisbursed - a.freshAmountDisbursed)[0];
      
      console.log('\n📊 Best Bank for Full BT vs Partial BT:\n');
      console.log('   Full BT (All 5 loans):');
      console.log(`   Bank: ${fullBest.bankName}`);
      console.log(`   Fresh Amount: ₹${fullBest.freshAmountDisbursed.toLocaleString()}`);
      console.log(`   Monthly EMI: ₹${fullBest.newSingleEMI.toLocaleString()}`);
      console.log(`   Number of Active Loans After: 1`);
      
      console.log('\n   Partial BT (3 loans BT, 2 loans continue):');
      console.log(`   Bank: ${partialBest.bankName}`);
      console.log(`   Fresh Amount: ₹${partialBest.freshAmountDisbursed.toLocaleString()}`);
      console.log(`   Total Monthly Outflow: ₹${partialBest.totalMonthlyOutflow.toLocaleString()}`);
      console.log(`   Number of Active Loans After: ${partialBest.numberOfLoansRemaining + 1}`);
      
      console.log('\n💡 Analysis:');
      console.log(`   Fresh Amount Difference: ₹${(fullBest.freshAmountDisbursed - partialBest.freshAmountDisbursed).toLocaleString()}`);
      console.log(`   EMI Difference: ₹${(partialBest.totalMonthlyOutflow - fullBest.newSingleEMI).toLocaleString()}`);
      
      if (fullBest.freshAmountDisbursed > partialBest.freshAmountDisbursed) {
        console.log(`   ✅ Full BT gives ₹${(fullBest.freshAmountDisbursed - partialBest.freshAmountDisbursed).toLocaleString()} more fresh funds`);
      } else {
        console.log(`   ✅ Partial BT gives ₹${(partialBest.freshAmountDisbursed - fullBest.freshAmountDisbursed).toLocaleString()} more fresh funds`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETED');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('Error running BT tests:', error);
  }
})();
