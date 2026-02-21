/**
 * BT Calculation Scenario
 * 
 * Customer Profile:
 * - Salary: ₹77,000
 * - Category: B
 * - Active Personal Loans: 4
 * - Total POS: ₹8,00,000
 * - Interest Rate: 11%
 * - Loan Tenure: Default to 6 years (standard)
 */

import { calculateFullBT, getBTRecommendations } from '../services/btLoanService.js';

console.log('\n' + '='.repeat(80));
console.log('BT CALCULATION - Customer with ₹77K Salary, Category B, ₹8L POS');
console.log('='.repeat(80));

const customerScenario = {
  monthlyIncome: 77000,
  loanTenure: 6, // 6 years
  category: 'B',
  companyName: 'Tech Mahindra', // Category B company
  creditScore: 720,
  employmentType: 'salaried',
  interestRate: 11, // Fixed 11% interest rate
  
  // 4 existing personal loans (all selected for BT)
  existingLoans: [
    { loanName: 'Personal Loan 1', emi: 15000, pos: 200000, selectedForBT: true },
    { loanName: 'Personal Loan 2', emi: 18000, pos: 250000, selectedForBT: true },
    { loanName: 'Personal Loan 3', emi: 12000, pos: 180000, selectedForBT: true },
    { loanName: 'Personal Loan 4', emi: 10000, pos: 170000, selectedForBT: true }
  ]
};

// Calculate totals
const totalCurrentEMI = customerScenario.existingLoans.reduce((sum, loan) => sum + loan.emi, 0);
const totalPOS = customerScenario.existingLoans.reduce((sum, loan) => sum + loan.pos, 0);

console.log('\n📊 CUSTOMER PROFILE:');
console.log('─'.repeat(80));
console.log(`   Monthly Salary: ₹${customerScenario.monthlyIncome.toLocaleString()}`);
console.log(`   Company Category: ${customerScenario.category} (${customerScenario.companyName})`);
console.log(`   Credit Score: ${customerScenario.creditScore}`);
console.log(`   Interest Rate: ${customerScenario.interestRate}%`);
console.log(`   Desired Tenure: ${customerScenario.loanTenure} years`);

console.log('\n📋 EXISTING LOANS (All Selected for BT):');
console.log('─'.repeat(80));
customerScenario.existingLoans.forEach((loan, idx) => {
  console.log(`   ${idx + 1}. ${loan.loanName}`);
  console.log(`      Current EMI: ₹${loan.emi.toLocaleString()}`);
  console.log(`      Outstanding (POS): ₹${loan.pos.toLocaleString()}`);
});

console.log('\n📈 CURRENT SITUATION:');
console.log('─'.repeat(80));
console.log(`   Total Monthly EMI Payment: ₹${totalCurrentEMI.toLocaleString()}`);
console.log(`   Total Outstanding Balance (POS): ₹${totalPOS.toLocaleString()}`);
console.log(`   Number of Loans: ${customerScenario.existingLoans.length}`);
console.log(`   EMI to Salary Ratio: ${((totalCurrentEMI / customerScenario.monthlyIncome) * 100).toFixed(1)}%`);

// Run Full BT calculation
(async () => {
  try {
    console.log('\n⚙️  CALCULATING BALANCE TRANSFER OPTIONS...\n');
    
    const btResults = await calculateFullBT(customerScenario);
    
    // Separate eligible and non-eligible banks
    const eligible = btResults.filter(r => r.eligible);
    const notEligible = btResults.filter(r => !r.eligible);
    
    console.log('\n' + '='.repeat(80));
    console.log('BT ELIGIBILITY RESULTS - ALL BANKS');
    console.log('='.repeat(80));
    console.log(`\n✅ Eligible Banks: ${eligible.length} out of ${btResults.length}`);
    console.log(`❌ Not Eligible Banks: ${notEligible.length} out of ${btResults.length}`);
    
    if (eligible.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('DETAILED RESULTS - ELIGIBLE BANKS');
      console.log('='.repeat(80));
      
      // Sort by fresh amount (descending)
      const sortedByFreshAmount = [...eligible].sort(
        (a, b) => b.freshAmountDisbursed - a.freshAmountDisbursed
      );
      
      sortedByFreshAmount.forEach((result, idx) => {
        console.log(`\n${idx + 1}. ${result.bankName.toUpperCase()}`);
        console.log('─'.repeat(80));
        
        // BT Loan Details
        console.log('   💰 BT Loan Details:');
        console.log(`      Maximum Loan Amount: ₹${result.maxLoanAmount.toLocaleString()}`);
        console.log(`      Less: Total POS Paid: ₹${result.totalPOS.toLocaleString()}`);
        console.log(`      Fresh Cash Disbursed: ₹${result.freshAmountDisbursed.toLocaleString()} 💵`);
        
        // EMI Comparison
        console.log('\n   📊 EMI Comparison:');
        console.log(`      Previous Total EMI: ₹${result.previousTotalEMI.toLocaleString()}`);
        console.log(`      New Single EMI: ₹${result.newSingleEMI.toLocaleString()}`);
        console.log(`      EMI Difference: ₹${result.emiDifference.toLocaleString()} ${result.emiDifference >= 0 ? '⬆️' : '⬇️'}`);
        console.log(`      EMI to Salary: ${((result.newSingleEMI / customerScenario.monthlyIncome) * 100).toFixed(1)}%`);
        
        // Loan Terms
        console.log('\n   📋 Loan Terms:');
        console.log(`      Interest Rate: ${result.interestRate}%`);
        console.log(`      Tenure: ${result.tenure} years (${result.tenure * 12} months)`);
        console.log(`      Processing Fee: ₹${result.processingFee.toLocaleString()}`);
        
        // Consolidation Benefits
        console.log('\n   ✨ Consolidation Benefits:');
        console.log(`      Loans Consolidated: ${result.numberOfLoansConsolidated} loans → 1 loan`);
        console.log(`      Total Debt Cleared: ₹${result.totalPOS.toLocaleString()}`);
        console.log(`      Fresh Funds Received: ₹${result.freshAmountDisbursed.toLocaleString()}`);
        
        // Calculate total interest payable
        const totalPayable = result.newSingleEMI * result.tenure * 12;
        const totalInterest = totalPayable - result.maxLoanAmount;
        console.log('\n   💸 Total Cost:');
        console.log(`      Total Amount Payable: ₹${totalPayable.toLocaleString()}`);
        console.log(`      Total Interest: ₹${totalInterest.toLocaleString()}`);
      });
      
      // Get and display recommendations
      const recommendations = getBTRecommendations(btResults);
      
      console.log('\n' + '='.repeat(80));
      console.log('🏆 TOP RECOMMENDATIONS');
      console.log('='.repeat(80));
      
      console.log('\n1️⃣  BEST FOR MAXIMUM FRESH FUNDS:');
      console.log(`   Bank: ${recommendations.bestForFreshFunds.bankName}`);
      console.log(`   Fresh Amount: ₹${recommendations.bestForFreshFunds.freshAmountDisbursed.toLocaleString()}`);
      console.log(`   New EMI: ₹${recommendations.bestForFreshFunds.newSingleEMI.toLocaleString()}`);
      console.log(`   Interest Rate: ${recommendations.bestForFreshFunds.interestRate}%`);
      
      console.log('\n2️⃣  BEST FOR LOWEST EMI:');
      console.log(`   Bank: ${recommendations.bestForLowEMI.bankName}`);
      console.log(`   New EMI: ₹${recommendations.bestForLowEMI.newSingleEMI.toLocaleString()}`);
      console.log(`   Fresh Amount: ₹${recommendations.bestForLowEMI.freshAmountDisbursed.toLocaleString()}`);
      console.log(`   Interest Rate: ${recommendations.bestForLowEMI.interestRate}%`);
      
      console.log('\n3️⃣  BEST FOR LOWEST INTEREST RATE:');
      console.log(`   Bank: ${recommendations.bestForLowInterest.bankName}`);
      console.log(`   Interest Rate: ${recommendations.bestForLowInterest.interestRate}%`);
      console.log(`   New EMI: ₹${recommendations.bestForLowInterest.newSingleEMI.toLocaleString()}`);
      console.log(`   Fresh Amount: ₹${recommendations.bestForLowInterest.freshAmountDisbursed.toLocaleString()}`);
      
      // Summary comparison table
      console.log('\n' + '='.repeat(80));
      console.log('📊 SUMMARY COMPARISON TABLE');
      console.log('='.repeat(80));
      console.log('\n   Bank Name               | Fresh Amount | New EMI   | Interest | Loan Amount');
      console.log('   ' + '─'.repeat(76));
      
      sortedByFreshAmount.forEach(result => {
        const bankName = result.bankName.padEnd(23);
        const freshAmount = `₹${(result.freshAmountDisbursed / 100000).toFixed(2)}L`.padEnd(12);
        const newEMI = `₹${(result.newSingleEMI / 1000).toFixed(1)}K`.padEnd(9);
        const interest = `${result.interestRate}%`.padEnd(8);
        const loanAmount = `₹${(result.maxLoanAmount / 100000).toFixed(2)}L`;
        
        console.log(`   ${bankName} | ${freshAmount} | ${newEMI} | ${interest} | ${loanAmount}`);
      });
    }
    
    if (notEligible.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('❌ BANKS NOT ELIGIBLE FOR BT');
      console.log('='.repeat(80));
      
      notEligible.forEach((result, idx) => {
        console.log(`\n   ${idx + 1}. ${result.bankName}`);
        console.log(`      Reason: ${result.reason}`);
      });
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('📌 CUSTOMER BENEFIT SUMMARY');
    console.log('='.repeat(80));
    
    if (eligible.length > 0) {
      const best = sortedByFreshAmount[0];
      
      console.log('\n   BEFORE BT:');
      console.log(`   • Managing ${customerScenario.existingLoans.length} separate loans`);
      console.log(`   • Paying ₹${totalCurrentEMI.toLocaleString()} total EMI per month`);
      console.log(`   • Total outstanding debt: ₹${totalPOS.toLocaleString()}`);
      console.log(`   • Fresh funds available: ₹0`);
      
      console.log('\n   AFTER BT (Best Option - ' + best.bankName + '):');
      console.log(`   • Single consolidated loan`);
      console.log(`   • Paying ₹${best.newSingleEMI.toLocaleString()} EMI per month`);
      console.log(`   • Fresh cash received: ₹${best.freshAmountDisbursed.toLocaleString()} 💰`);
      console.log(`   • All old loans closed`);
      
      console.log('\n   NET BENEFIT:');
      console.log(`   • Fresh funds unlocked: ₹${best.freshAmountDisbursed.toLocaleString()}`);
      console.log(`   • Loans simplified: ${customerScenario.existingLoans.length} → 1`);
      console.log(`   • EMI change: ${best.emiDifference >= 0 ? '+' : ''}₹${best.emiDifference.toLocaleString()}`);
      
      // Calculate ROI
      const freshFundsMultiple = (best.freshAmountDisbursed / totalPOS).toFixed(2);
      console.log(`   • Fresh funds as % of POS: ${((best.freshAmountDisbursed / totalPOS) * 100).toFixed(0)}%`);
      console.log(`   • For every ₹1 of debt, getting ₹${freshFundsMultiple} fresh`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ CALCULATION COMPLETED');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error calculating BT:', error);
    console.error(error.stack);
  }
})();
