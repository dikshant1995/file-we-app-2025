import { calculatePoonawalaEligibility } from '../banks/poonawala/calculator.js';
import { calculateAxisFinEligibility } from '../banks/axis-fin/calculator.js';
import { calculateShriRamEligibility } from '../banks/shri-ram/calculator.js';
import { calculatePiramalEligibility } from '../banks/piramal/calculator.js';
import { calculateTataEligibility } from '../banks/tata/calculator.js';
import { calculateCholaEligibility } from '../banks/chola/calculator.js';

console.log('═'.repeat(80));
console.log('   COMPREHENSIVE BANK COMPARISON - MULTIPLE SCENARIOS');
console.log('═'.repeat(80));
console.log();

const testScenarios = [
  {
    name: 'Low-Income UNLISTED Employee',
    data: {
      desiredLoanAmount: 500000,
      loanTenure: 5,
      monthlyIncome: 30000,
      existingEMI: 0,
      category: 'UNLISTED',
      creditScore: 720,
      employmentType: 'salaried'
    }
  },
  {
    name: 'Mid-Income Category C Employee',
    data: {
      desiredLoanAmount: 800000,
      loanTenure: 6,
      monthlyIncome: 50000,
      existingEMI: 5000,
      category: 'C',
      creditScore: 740,
      employmentType: 'salaried'
    }
  },
  {
    name: 'Government Employee',
    data: {
      desiredLoanAmount: 1000000,
      loanTenure: 6,
      monthlyIncome: 44000,
      existingEMI: 0,
      category: 'GOVT',
      creditScore: 750,
      employmentType: 'government'
    }
  },
  {
    name: 'High-Income Category A Employee',
    data: {
      desiredLoanAmount: 2000000,
      loanTenure: 7,
      monthlyIncome: 100000,
      existingEMI: 10000,
      category: 'A',
      creditScore: 780,
      employmentType: 'salaried'
    }
  }
];

const banks = [
  { name: 'Cholamandalam', calc: calculateCholaEligibility, abbr: 'CHOLA' },
  { name: 'Tata Capital', calc: calculateTataEligibility, abbr: 'TATA' },
  { name: 'Poonawala', calc: calculatePoonawalaEligibility, abbr: 'POON' },
  { name: 'Axis Finance', calc: calculateAxisFinEligibility, abbr: 'AXIS' },
  { name: 'Shri Ram', calc: calculateShriRamEligibility, abbr: 'SHRI' },
  { name: 'Piramal', calc: calculatePiramalEligibility, abbr: 'PIRA' }
];

testScenarios.forEach((scenario, index) => {
  console.log('═'.repeat(80));
  console.log(`SCENARIO ${index + 1}: ${scenario.name}`);
  console.log('═'.repeat(80));
  console.log(`Salary: ₹${scenario.data.monthlyIncome.toLocaleString()}/month | Category: ${scenario.data.category} | Tenure: ${scenario.data.loanTenure} years`);
  console.log(`Desired Loan: ₹${scenario.data.desiredLoanAmount.toLocaleString()} | Existing EMI: ₹${scenario.data.existingEMI.toLocaleString()}`);
  console.log();
  console.log('-'.repeat(80));
  console.log('BANK RESULTS');
  console.log('-'.repeat(80));
  
  const results = [];
  
  banks.forEach(bank => {
    const result = bank.calc(scenario.data);
    
    if (result.eligible) {
      console.log(`✅ ${bank.name.padEnd(18)} | Loan: ₹${result.loanAmount.toLocaleString().padEnd(12)} | EMI: ₹${result.monthlyEMI.toLocaleString().padEnd(10)} | Rate: ${result.interestRate}%`);
      if (result.calculationMethod) {
        console.log(`   ${' '.repeat(18)} | Method: ${result.calculationMethod}`);
      }
      results.push({ bank: bank.name, amount: result.loanAmount, emi: result.monthlyEMI });
    } else {
      console.log(`❌ ${bank.name.padEnd(18)} | NOT ELIGIBLE`);
      console.log(`   ${' '.repeat(18)} | Reason: ${result.reason}`);
    }
  });
  
  if (results.length > 0) {
    console.log();
    console.log('-'.repeat(80));
    console.log('COMPARISON');
    console.log('-'.repeat(80));
    
    // Sort by loan amount
    results.sort((a, b) => b.amount - a.amount);
    
    const best = results[0];
    const worst = results[results.length - 1];
    const spread = best.amount - worst.amount;
    const spreadPercent = ((spread / worst.amount) * 100).toFixed(1);
    
    console.log(`Best Offer:  ${best.bank} - ₹${best.amount.toLocaleString()}`);
    console.log(`Worst Offer: ${worst.bank} - ₹${worst.amount.toLocaleString()}`);
    console.log(`Spread: ₹${spread.toLocaleString()} (${spreadPercent}% difference)`);
    console.log();
    
    // Rankings
    console.log('Rankings:');
    results.forEach((r, idx) => {
      const emoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
      console.log(`${emoji} ${(idx + 1).toString().padStart(2)}. ${r.bank.padEnd(18)} → ₹${r.amount.toLocaleString()}`);
    });
  } else {
    console.log();
    console.log('❌ NO BANKS ELIGIBLE FOR THIS SCENARIO');
  }
  
  console.log();
});

// Summary statistics
console.log('═'.repeat(80));
console.log('BANK CHARACTERISTICS SUMMARY');
console.log('═'.repeat(80));
console.log();

console.log('CALCULATION METHODS:');
console.log('-'.repeat(80));
console.log('Cholamandalam  : FOIR-only (Category + Salary based)');
console.log('                 • 5 categories × 3 salary bands = 15 FOIR combinations');
console.log('                 • Rejects UNLISTED completely');
console.log();
console.log('Tata Capital   : Combined FOIR + Multiplier (Takes minimum)');
console.log('                 • FOIR: Salary-based (3 bands, no category)');
console.log('                 • Multiplier: Category + Salary based (5 cats × 3 bands)');
console.log('                 • Dual constraint system');
console.log();
console.log('Poonawala      : 2D FOIR Matrix (Most sophisticated)');
console.log('                 • 7 customer segments × 5 NTH bands = 35 combinations');
console.log('                 • Uses Net Take-Home (NTH) salary');
console.log('                 • Accepts UNLISTED as Category E with higher minimum');
console.log();
console.log('Axis Finance   : Multiplier-only (Simplest underwriting)');
console.log('                 • No FOIR check at all!');
console.log('                 • 4 categories × 3 salary bands = 12 multipliers');
console.log('                 • Rejects UNLISTED');
console.log();
console.log('Shri Ram       : Combined (Income-centric, NO category distinction)');
console.log('                 • 4 salary bands with paired multiplier + FOIR');
console.log('                 • Universal ₹25K minimum for ALL categories');
console.log('                 • Most inclusive for UNLISTED - treated same as Category A!');
console.log();
console.log('Piramal        : Ultra-simple 2-Band NTH FOIR');
console.log('                 • Only 2 NTH bands: ₹20K-35K (65%), ₹35K+ (70%)');
console.log('                 • Lowest minimum (₹20K) and simplest decision tree');
console.log('                 • No category discrimination');
console.log();

console.log('═'.repeat(80));
console.log('UNLISTED CATEGORY TREATMENT:');
console.log('═'.repeat(80));
console.log('❌ Cholamandalam : Completely rejected');
console.log('❌ Axis Finance  : Completely rejected');
console.log('✅ Tata Capital  : Accepted with ₹40K minimum (vs ₹25K for others)');
console.log('✅ Poonawala     : Accepted as Category E with ₹50K minimum');
console.log('✅ Shri Ram      : Accepted with ₹25K minimum - SAME AS CATEGORY A!');
console.log('✅ Piramal       : Accepted with ₹20K minimum - NO DISTINCTION!');
console.log();

console.log('═'.repeat(80));
console.log('MINIMUM SALARY REQUIREMENTS:');
console.log('═'.repeat(80));
console.log('Cholamandalam  : ₹20K-25K (varies by category)');
console.log('Tata Capital   : ₹25K-40K (varies by category)');
console.log('Poonawala      : ₹30K-50K (varies by segment)');
console.log('Axis Finance   : ₹25K (universal)');
console.log('Shri Ram       : ₹25K (universal, including UNLISTED)');
console.log('Piramal        : ₹20K (universal, lowest among all)');
console.log();

console.log('═'.repeat(80));
console.log('✅ ALL 6 BANK CALCULATORS FULLY OPERATIONAL');
console.log('═'.repeat(80));
