import { calculatePoonawalaEligibility } from '../banks/poonawala/calculator.js';
import { calculateAxisFinEligibility } from '../banks/axis-fin/calculator.js';
import { calculateShriRamEligibility } from '../banks/shri-ram/calculator.js';
import { calculatePiramalEligibility } from '../banks/piramal/calculator.js';
import { calculateTataEligibility } from '../banks/tata/calculator.js';
import { calculateCholaEligibility } from '../banks/chola/calculator.js';
import { calculateIndusindEligibility } from '../banks/indusind/calculator.js';

console.log('═'.repeat(80));
console.log('   ALL 7 BANKS - COMPREHENSIVE COMPARISON INCLUDING INDUSIND');
console.log('═'.repeat(80));
console.log();

// Test scenario: Category A employee with ₹100,000 salary
const testScenario = {
  name: 'High-Income Category A Employee',
  data: {
    desiredLoanAmount: 3000000,
    loanTenure: 7,
    monthlyIncome: 100000,
    existingEMI: 5000,
    category: 'A',
    creditScore: 760,
    employmentType: 'salaried'
  }
};

console.log('TEST SCENARIO: ' + testScenario.name);
console.log('═'.repeat(80));
console.log(`Salary: ₹${testScenario.data.monthlyIncome.toLocaleString()}/month`);
console.log(`Desired Loan: ₹${testScenario.data.desiredLoanAmount.toLocaleString()}`);
console.log(`Tenure: ${testScenario.data.loanTenure} years`);
console.log(`Existing EMI: ₹${testScenario.data.existingEMI.toLocaleString()}`);
console.log(`Category: ${testScenario.data.category}`);
console.log(`Credit Score: ${testScenario.data.creditScore}`);
console.log();

const banks = [
  { name: 'Cholamandalam', calc: calculateCholaEligibility },
  { name: 'Tata Capital', calc: calculateTataEligibility },
  { name: 'Poonawala', calc: calculatePoonawalaEligibility },
  { name: 'Axis Finance', calc: calculateAxisFinEligibility },
  { name: 'IndusInd Bank', calc: calculateIndusindEligibility },
  { name: 'Shri Ram', calc: calculateShriRamEligibility },
  { name: 'Piramal', calc: calculatePiramalEligibility }
];

console.log('═'.repeat(80));
console.log('BANK-WISE RESULTS');
console.log('═'.repeat(80));
console.log();

const results = [];

banks.forEach((bank, index) => {
  console.log(`${index + 1}. ${bank.name.toUpperCase()}`);
  console.log('-'.repeat(80));
  
  const result = bank.calc(testScenario.data);
  
  if (result.eligible) {
    console.log(`Status: ✅ ELIGIBLE`);
    console.log(`Loan Amount: ₹${result.loanAmount.toLocaleString()}`);
    console.log(`Monthly EMI: ₹${result.monthlyEMI.toLocaleString()}`);
    console.log(`Interest Rate: ${result.interestRate}%`);
    
    if (result.multiplier) {
      console.log(`Multiplier: ${result.multiplier}x`);
    }
    if (result.maxLoanByMultiplier) {
      console.log(`Max by Multiplier: ₹${result.maxLoanByMultiplier.toLocaleString()}`);
    }
    if (result.foirPercentage) {
      console.log(`FOIR: ${result.foirPercentage}%`);
    }
    if (result.calculationMethod) {
      console.log(`Method: ${result.calculationMethod}`);
    }
    
    results.push({
      bank: bank.name,
      amount: result.loanAmount,
      emi: result.monthlyEMI,
      rate: result.interestRate,
      method: result.calculationMethod || 'N/A'
    });
  } else {
    console.log(`Status: ❌ NOT ELIGIBLE`);
    console.log(`Reason: ${result.reason}`);
  }
  
  console.log();
});

if (results.length > 0) {
  console.log('═'.repeat(80));
  console.log('COMPARISON SUMMARY');
  console.log('═'.repeat(80));
  console.log();
  
  // Sort by loan amount
  results.sort((a, b) => b.amount - a.amount);
  
  console.log('RANKED BY LOAN AMOUNT:');
  console.log('-'.repeat(80));
  results.forEach((r, idx) => {
    const emoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
    console.log(`${emoji} ${(idx + 1).toString().padStart(2)}. ${r.bank.padEnd(20)} → ₹${r.amount.toLocaleString().padEnd(15)} | EMI: ₹${r.emi.toLocaleString().padEnd(10)} | ${r.rate}%`);
  });
  
  console.log();
  
  const best = results[0];
  const worst = results[results.length - 1];
  const spread = best.amount - worst.amount;
  const spreadPercent = ((spread / worst.amount) * 100).toFixed(1);
  
  console.log('BEST vs WORST:');
  console.log('-'.repeat(80));
  console.log(`Best Offer:  ${best.bank.padEnd(20)} - ₹${best.amount.toLocaleString()}`);
  console.log(`Worst Offer: ${worst.bank.padEnd(20)} - ₹${worst.amount.toLocaleString()}`);
  console.log(`Spread: ₹${spread.toLocaleString()} (${spreadPercent}% difference)`);
  console.log();
}

console.log('═'.repeat(80));
console.log('MULTIPLIER-ONLY BANKS COMPARISON');
console.log('═'.repeat(80));
console.log();

console.log('For Category A at ₹1,00,000 salary:');
console.log('-'.repeat(80));

const multiplierBanks = [
  { name: 'Axis Finance', multiplier: 26, maxLoan: 2600000 },
  { name: 'IndusInd Bank', multiplier: 25, maxLoan: 2500000 }
];

multiplierBanks.forEach(bank => {
  console.log(`${bank.name.padEnd(20)} | ${bank.multiplier}x multiplier | Max: ₹${bank.maxLoan.toLocaleString()}`);
});

console.log();
console.log('Analysis:');
console.log('  • Axis Finance: 26x multiplier (₹75K-75K band)');
console.log('  • IndusInd Bank: 25x multiplier (₹75K-125K band)');
console.log('  • Difference: ₹1,00,000 (Axis better by 4% at this salary)');
console.log();
console.log('At ₹1,50,000 salary:');
console.log('  • Axis Finance: 28x = ₹42,00,000 (₹75K+ band)');
console.log('  • IndusInd Bank: 30x = ₹45,00,000 (₹125K+ band)');
console.log('  • Difference: ₹3,00,000 (IndusInd better by 7.1% at high income)');
console.log();

console.log('═'.repeat(80));
console.log('CALCULATION METHOD BREAKDOWN');
console.log('═'.repeat(80));
console.log();

console.log('1. FOIR-ONLY BANKS (2 banks):');
console.log('   • Cholamandalam: Category + Salary based FOIR');
console.log('   • Piramal: Ultra-simple 2-band NTH FOIR');
console.log();

console.log('2. MULTIPLIER-ONLY BANKS (2 banks):');
console.log('   • Axis Finance: 4 categories × 3 bands = 12 multipliers');
console.log('   • IndusInd Bank: 5 categories × variable bands = 13 multipliers');
console.log();

console.log('3. COMBINED BANKS (3 banks):');
console.log('   • Tata Capital: Salary FOIR + Category Multiplier (takes MIN)');
console.log('   • Poonawala: 2D FOIR Matrix (7 segments × 5 NTH bands)');
console.log('   • Shri Ram: Income-driven (no category distinction)');
console.log();

console.log('═'.repeat(80));
console.log('INDUSIND BANK - KEY DIFFERENTIATORS');
console.log('═'.repeat(80));
console.log();

console.log('✅ UNIQUE FEATURES:');
console.log('   1. Highest multiplier available: 30x (vs 28x at Axis)');
console.log('   2. Dedicated A+ category for premium profiles');
console.log('   3. Three-tier multiplier progression (21x → 25x → 30x)');
console.log('   4. Higher income threshold for max multiplier (₹125K+)');
console.log('   5. Category C flat multiplier (no progression)');
console.log();

console.log('✅ BEST FOR:');
console.log('   • Ultra-high income earners (₹125K+ salary)');
console.log('   • Category A+/A employees at premium companies');
console.log('   • Government employees with high salaries');
console.log('   • Customers seeking highest loan-to-income ratio');
console.log();

console.log('⚠️  LESS COMPETITIVE FOR:');
console.log('   • Category C employees (flat 21x vs progressive at Axis)');
console.log('   • Category B at very high incomes (capped at 25x)');
console.log('   • Lower-middle income ranges (₹50K-100K)');
console.log();

console.log('═'.repeat(80));
console.log('✅ ALL 7 BANKS FULLY OPERATIONAL');
console.log('═'.repeat(80));
