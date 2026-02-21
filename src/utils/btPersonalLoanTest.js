/**
 * Personal Loan BT Test - Your Exact Scenario
 * 
 * Customer Profile:
 * - Salary: ₹75,000
 * - Total Current EMI: ₹40,000
 * - Active Loans: 4
 *   - Home Loan: ₹20,000 EMI (NOT for BT)
 *   - Car Loan: ₹5,000 EMI (NOT for BT)
 *   - Consumer Loan: ₹5,000 EMI (NOT for BT)
 *   - Personal Loan: ₹10,000 EMI, ₹3,00,000 POS (FOR BT)
 * 
 * Key Calculation:
 * Effective Salary = ₹75,000 - ₹30,000 (non-personal EMIs) = ₹45,000
 */

import { 
  calculatePersonalLoanBT, 
  getPersonalLoanBTRecommendations,
  validatePersonalLoanBTData 
} from '../services/btPersonalLoanService.js';

console.log('\n' + '='.repeat(100));
console.log('PERSONAL LOAN BT CALCULATION - Exact Scenario');
console.log('='.repeat(100));

const customerScenario = {
  monthlyIncome: 75000,
  loanTenure: 6, // 6 years
  category: 'B',
  companyName: 'Infosys',
  creditScore: 720,
  employmentType: 'salaried',
  
  // All loans with type classification
  allLoans: [
    {
      loanType: 'Home Loan',
      loanName: 'HDFC Home Loan',
      emi: 20000,
      pos: 2500000, // Not relevant for BT calculation
      selectedForBT: false // Cannot BT - not a personal loan
    },
    {
      loanType: 'Car Loan',
      loanName: 'SBI Car Loan',
      emi: 5000,
      pos: 200000, // Not relevant for BT calculation
      selectedForBT: false // Cannot BT - not a personal loan
    },
    {
      loanType: 'Consumer Loan',
      loanName: 'Consumer Durable Loan',
      emi: 5000,
      pos: 150000, // Not relevant for BT calculation
      selectedForBT: false // Cannot BT - not a personal loan
    },
    {
      loanType: 'personal',
      loanName: 'Personal Loan',
      emi: 10000,
      pos: 300000,
      selectedForBT: true // This is the only loan for BT
    }
  ]
};

// Calculate totals
const totalCurrentEMI = customerScenario.allLoans.reduce((sum, loan) => sum + loan.emi, 0);
const personalLoans = customerScenario.allLoans.filter(l => l.loanType === 'personal');
const nonPersonalLoans = customerScenario.allLoans.filter(l => l.loanType !== 'personal');
const personalLoanEMI = personalLoans.reduce((sum, l) => sum + l.emi, 0);
const nonPersonalEMI = nonPersonalLoans.reduce((sum, l) => sum + l.emi, 0);
const personalLoanPOS = personalLoans.reduce((sum, l) => sum + l.pos, 0);
const effectiveSalary = customerScenario.monthlyIncome - nonPersonalEMI;

console.log('\n📊 CUSTOMER PROFILE:');
console.log('─'.repeat(100));
console.log(`   Monthly Salary: ₹${customerScenario.monthlyIncome.toLocaleString()}`);
console.log(`   Company Category: ${customerScenario.category} (${customerScenario.companyName})`);
console.log(`   Credit Score: ${customerScenario.creditScore}`);
console.log(`   Desired Tenure: ${customerScenario.loanTenure} years`);

console.log('\n📋 CURRENT LOAN SITUATION:');
console.log('─'.repeat(100));
console.log(`   Total Active Loans: ${customerScenario.allLoans.length}`);
console.log(`   Total Monthly EMI: ₹${totalCurrentEMI.toLocaleString()}`);

console.log('\n   Personal Loans (Eligible for BT):');
personalLoans.forEach((loan, idx) => {
  console.log(`      ${idx + 1}. ${loan.loanName}`);
  console.log(`         Type: ${loan.loanType}`);
  console.log(`         EMI: ₹${loan.emi.toLocaleString()}`);
  console.log(`         POS: ₹${loan.pos.toLocaleString()}`);
  console.log(`         Status: ✅ Selected for BT`);
});
console.log(`   Total Personal Loan EMI: ₹${personalLoanEMI.toLocaleString()}`);
console.log(`   Total Personal Loan POS: ₹${personalLoanPOS.toLocaleString()}`);

console.log('\n   Other Loans (NOT Eligible for BT - Continue Separately):');
nonPersonalLoans.forEach((loan, idx) => {
  console.log(`      ${idx + 1}. ${loan.loanName}`);
  console.log(`         Type: ${loan.loanType}`);
  console.log(`         EMI: ₹${loan.emi.toLocaleString()}`);
  console.log(`         Status: ❌ Cannot BT (Not a Personal Loan)`);
});
console.log(`   Total Non-Personal Loan EMI: ₹${nonPersonalEMI.toLocaleString()}`);

console.log('\n💡 EFFECTIVE SALARY CALCULATION:');
console.log('─'.repeat(100));
console.log(`   Original Salary: ₹${customerScenario.monthlyIncome.toLocaleString()}`);
console.log(`   Minus Non-Personal Loan EMIs: ₹${nonPersonalEMI.toLocaleString()}`);
console.log(`   (Home ₹20K + Car ₹5K + Consumer ₹5K = ₹30K)`);
console.log(`   ──────────────────────────────────────`);
console.log(`   Effective Salary for BT: ₹${effectiveSalary.toLocaleString()}`);
console.log(`   \n   👉 This Effective Salary is used for FOIR/Multiplier calculations`);

// Validate data first
console.log('\n⚙️  VALIDATING DATA...');
const validation = validatePersonalLoanBTData(customerScenario);
console.log(`   Validation: ${validation.valid ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`   Message: ${validation.message}`);
if (validation.valid) {
  console.log(`   Personal Loans Found: ${validation.personalLoansCount}`);
  console.log(`   Other Loans Found: ${validation.nonPersonalLoansCount}`);
  console.log(`   Effective Salary: ₹${validation.effectiveSalary.toLocaleString()}`);
}

// Run Personal Loan BT calculation
(async () => {
  try {
    console.log('\n⚙️  CALCULATING PERSONAL LOAN BT OPTIONS...\n');
    
    const btResults = await calculatePersonalLoanBT(customerScenario);
    
    // Separate eligible and non-eligible banks
    const eligible = btResults.filter(r => r.eligible);
    const notEligible = btResults.filter(r => !r.eligible);
    
    console.log('\n' + '='.repeat(100));
    console.log('PERSONAL LOAN BT RESULTS - ALL BANKS');
    console.log('='.repeat(100));
    console.log(`\n✅ Eligible Banks: ${eligible.length} out of ${btResults.length}`);
    console.log(`❌ Not Eligible Banks: ${notEligible.length} out of ${btResults.length}`);
    
    if (eligible.length > 0) {
      console.log('\n' + '='.repeat(100));
      console.log('DETAILED RESULTS - ELIGIBLE BANKS');
      console.log('='.repeat(100));
      
      // Sort by fresh amount (descending)
      const sortedByFreshAmount = [...eligible].sort(
        (a, b) => b.freshAmountDisbursed - a.freshAmountDisbursed
      );
      
      sortedByFreshAmount.forEach((result, idx) => {
        console.log(`\n${idx + 1}. ${result.bankName.toUpperCase()}`);
        console.log('─'.repeat(100));
        
        // Personal Loan BT Details
        console.log('   💰 Personal Loan BT Details:');
        console.log(`      Max Personal Loan Amount: ₹${result.maxPersonalLoanAmount.toLocaleString()}`);
        console.log(`      Less: Personal Loan POS: ₹${result.personalLoanPOS.toLocaleString()}`);
        console.log(`      Fresh Cash Disbursed: ₹${result.freshAmountDisbursed.toLocaleString()} 💵`);
        
        // EMI Breakdown
        console.log('\n   📊 EMI Breakdown After BT:');
        console.log(`      New Personal Loan EMI: ₹${result.newPersonalLoanEMI.toLocaleString()}`);
        console.log(`      Home Loan EMI (continues): ₹20,000`);
        console.log(`      Car Loan EMI (continues): ₹5,000`);
        console.log(`      Consumer Loan EMI (continues): ₹5,000`);
        console.log(`      ──────────────────────────────────`);
        console.log(`      Total Monthly Outflow: ₹${result.totalMonthlyOutflow.toLocaleString()}`);
        
        // Comparison
        console.log('\n   📈 Before vs After Comparison:');
        console.log(`      Previous Total EMI: ₹${result.previousTotalEMI.toLocaleString()}`);
        console.log(`      New Total EMI: ₹${result.totalMonthlyOutflow.toLocaleString()}`);
        console.log(`      EMI Difference: ₹${result.emiDifference.toLocaleString()} ${result.emiDifference >= 0 ? '⬆️' : '⬇️'}`);
        console.log(`      Previous Personal Loan EMI: ₹${result.previousPersonalLoanEMI.toLocaleString()}`);
        console.log(`      New Personal Loan EMI: ₹${result.newPersonalLoanEMI.toLocaleString()}`);
        console.log(`      Personal Loan EMI Change: ₹${result.personalLoanEMIDifference.toLocaleString()}`);
        
        // Loan Terms
        console.log('\n   📋 Loan Terms:');
        console.log(`      Interest Rate: ${result.interestRate}%`);
        console.log(`      Tenure: ${result.tenure} years`);
        console.log(`      Processing Fee: ₹${result.processingFee.toLocaleString()}`);
        
        // Calculation Method
        console.log('\n   🧮 Calculation Method:');
        console.log(`      Original Salary: ₹${result.originalSalary.toLocaleString()}`);
        console.log(`      Effective Salary Used: ₹${result.effectiveSalary.toLocaleString()}`);
        console.log(`      Non-Personal Loan EMIs Deducted: ₹${result.nonPersonalLoansEMI.toLocaleString()}`);
      });
      
      // Get and display recommendations
      const recommendations = getPersonalLoanBTRecommendations(btResults);
      
      console.log('\n' + '='.repeat(100));
      console.log('🏆 TOP RECOMMENDATIONS');
      console.log('='.repeat(100));
      
      console.log('\n1️⃣  BEST FOR MAXIMUM FRESH FUNDS:');
      console.log(`   Bank: ${recommendations.bestForFreshFunds.bankName}`);
      console.log(`   Fresh Amount: ₹${recommendations.bestForFreshFunds.freshAmountDisbursed.toLocaleString()}`);
      console.log(`   Total Monthly Outflow: ₹${recommendations.bestForFreshFunds.totalMonthlyOutflow.toLocaleString()}`);
      console.log(`   Interest Rate: ${recommendations.bestForFreshFunds.interestRate}%`);
      
      console.log('\n2️⃣  BEST FOR LOWEST TOTAL MONTHLY OUTFLOW:');
      console.log(`   Bank: ${recommendations.bestForLowestTotalOutflow.bankName}`);
      console.log(`   Total Monthly Outflow: ₹${recommendations.bestForLowestTotalOutflow.totalMonthlyOutflow.toLocaleString()}`);
      console.log(`   Fresh Amount: ₹${recommendations.bestForLowestTotalOutflow.freshAmountDisbursed.toLocaleString()}`);
      console.log(`   Interest Rate: ${recommendations.bestForLowestTotalOutflow.interestRate}%`);
      
      console.log('\n3️⃣  BEST FOR LOWEST PERSONAL LOAN EMI:');
      console.log(`   Bank: ${recommendations.bestForLowestPersonalLoanEMI.bankName}`);
      console.log(`   Personal Loan EMI: ₹${recommendations.bestForLowestPersonalLoanEMI.newPersonalLoanEMI.toLocaleString()}`);
      console.log(`   Fresh Amount: ₹${recommendations.bestForLowestPersonalLoanEMI.freshAmountDisbursed.toLocaleString()}`);
      console.log(`   Total Monthly Outflow: ₹${recommendations.bestForLowestPersonalLoanEMI.totalMonthlyOutflow.toLocaleString()}`);
      
      console.log('\n4️⃣  BEST FOR LOWEST INTEREST RATE:');
      console.log(`   Bank: ${recommendations.bestForLowInterest.bankName}`);
      console.log(`   Interest Rate: ${recommendations.bestForLowInterest.interestRate}%`);
      console.log(`   Fresh Amount: ₹${recommendations.bestForLowInterest.freshAmountDisbursed.toLocaleString()}`);
      console.log(`   Total Monthly Outflow: ₹${recommendations.bestForLowInterest.totalMonthlyOutflow.toLocaleString()}`);
      
      // Summary comparison table
      console.log('\n' + '='.repeat(100));
      console.log('📊 SUMMARY COMPARISON TABLE');
      console.log('='.repeat(100));
      console.log('\n   Bank Name               | Fresh Amount | Personal EMI | Total Outflow | Interest');
      console.log('   ' + '─'.repeat(92));
      
      sortedByFreshAmount.forEach(result => {
        const bankName = result.bankName.padEnd(23);
        const freshAmount = `₹${(result.freshAmountDisbursed / 100000).toFixed(2)}L`.padEnd(12);
        const personalEMI = `₹${(result.newPersonalLoanEMI / 1000).toFixed(1)}K`.padEnd(12);
        const totalOutflow = `₹${(result.totalMonthlyOutflow / 1000).toFixed(1)}K`.padEnd(13);
        const interest = `${result.interestRate}%`;
        
        console.log(`   ${bankName} | ${freshAmount} | ${personalEMI} | ${totalOutflow} | ${interest}`);
      });
    }
    
    if (notEligible.length > 0) {
      console.log('\n' + '='.repeat(100));
      console.log('❌ BANKS NOT ELIGIBLE FOR PERSONAL LOAN BT');
      console.log('='.repeat(100));
      
      notEligible.forEach((result, idx) => {
        console.log(`\n   ${idx + 1}. ${result.bankName}`);
        console.log(`      Reason: ${result.reason}`);
      });
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(100));
    console.log('📌 CUSTOMER BENEFIT SUMMARY');
    console.log('='.repeat(100));
    
    if (eligible.length > 0) {
      const best = sortedByFreshAmount[0];
      
      console.log('\n   BEFORE PERSONAL LOAN BT:');
      console.log(`   • Total loans: ${customerScenario.allLoans.length}`);
      console.log(`   • Personal Loan EMI: ₹${personalLoanEMI.toLocaleString()}`);
      console.log(`   • Other Loans EMI: ₹${nonPersonalEMI.toLocaleString()}`);
      console.log(`   • Total EMI: ₹${totalCurrentEMI.toLocaleString()}`);
      console.log(`   • Personal Loan POS: ₹${personalLoanPOS.toLocaleString()}`);
      console.log(`   • Fresh funds available: ₹0`);
      
      console.log('\n   AFTER PERSONAL LOAN BT (Best Option - ' + best.bankName + '):');
      console.log(`   • Total loans: ${best.numberOfNonPersonalLoansRemaining + 1} (1 new Personal Loan + ${best.numberOfNonPersonalLoansRemaining} other loans)`);
      console.log(`   • New Personal Loan EMI: ₹${best.newPersonalLoanEMI.toLocaleString()}`);
      console.log(`   • Other Loans EMI (unchanged): ₹${best.nonPersonalLoansEMI.toLocaleString()}`);
      console.log(`   • Total EMI: ₹${best.totalMonthlyOutflow.toLocaleString()}`);
      console.log(`   • Fresh cash received: ₹${best.freshAmountDisbursed.toLocaleString()} 💰`);
      console.log(`   • Old Personal Loan: CLOSED`);
      
      console.log('\n   NET BENEFIT:');
      console.log(`   ✅ Fresh funds unlocked: ₹${best.freshAmountDisbursed.toLocaleString()}`);
      console.log(`   ✅ Personal Loans consolidated: ${best.numberOfPersonalLoansConsolidated} → 1`);
      console.log(`   ✅ Total EMI change: ${best.emiDifference >= 0 ? '+' : ''}₹${best.emiDifference.toLocaleString()}`);
      console.log(`   ✅ Fresh funds as % of Personal Loan POS: ${((best.freshAmountDisbursed / personalLoanPOS) * 100).toFixed(0)}%`);
      console.log(`   ✅ For every ₹1 of personal loan debt, getting ₹${(best.freshAmountDisbursed / personalLoanPOS).toFixed(2)} fresh!`);
      console.log(`   ℹ️  Home, Car, and Consumer loans continue as-is`);
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ CALCULATION COMPLETED');
    console.log('='.repeat(100) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error calculating Personal Loan BT:', error);
    console.error(error.stack);
  }
})();
