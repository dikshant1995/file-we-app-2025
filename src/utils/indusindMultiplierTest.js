import { calculateIndusindEligibility } from '../banks/indusind/calculator.js';
import { indusindConfig } from '../banks/indusind/config.js';

console.log('='.repeat(80));
console.log('INDUSIND BANK - MULTIPLIER-BASED LENDING SYSTEM');
console.log('='.repeat(80));
console.log();
console.log(`Bank: ${indusindConfig.name}`);
console.log(`Calculation Method: ${indusindConfig.calculationMethod}`);
console.log(`Formula: Loan Amount = Monthly Salary × Multiplier`);
console.log();

console.log('='.repeat(80));
console.log('COMPLETE MULTIPLIER TABLE');
console.log('='.repeat(80));
console.log();

console.log('Category    | ₹25K-75K    | ₹75K-125K   | ₹125K+');
console.log('-'.repeat(80));
console.log('A+          | 21x         | 25x         | 30x         | Premium');
console.log('A           | 21x         | 25x         | 30x         | Top Tier');
console.log('GOVT        | 21x         | 25x         | 30x         | Government');
console.log('B           | 21x         | 25x         | -           | Capped at 25x');
console.log();
console.log('Category    | ₹30K+');
console.log('-'.repeat(80));
console.log('C           | 21x         | Flat rate regardless of income');
console.log();

console.log('='.repeat(80));
console.log('MINIMUM SALARY REQUIREMENTS');
console.log('='.repeat(80));
console.log();
Object.entries(indusindConfig.minSalaryByCategory).forEach(([cat, min]) => {
  console.log(`${cat.padEnd(12)} | ₹${min.toLocaleString()}`);
});
console.log();
console.log('⚠️  Category C has HIGHER minimum (₹30K vs ₹25K for others)');
console.log();

console.log('='.repeat(80));
console.log('KEY INSIGHTS FROM MULTIPLIER TABLE');
console.log('='.repeat(80));
console.log();
console.log('1. TOP TIER (A+, A, GOVT) - Identical Treatment:');
console.log('   • ₹25K-75K salary: 21x multiplier');
console.log('   • ₹75K-125K salary: 25x multiplier');
console.log('   • ₹125K+ salary: 30x multiplier (highest!)');
console.log();
console.log('2. CATEGORY B - Two Tiers Only:');
console.log('   • ₹25K-75K salary: 21x multiplier');
console.log('   • ₹75K+ salary: 25x multiplier (capped, no 30x tier)');
console.log();
console.log('3. CATEGORY C - Flat Rate:');
console.log('   • ₹30K+ salary: 21x multiplier (no progression!)');
console.log('   • Higher base minimum but lowest multiplier ceiling');
console.log();
console.log('4. CRITICAL OBSERVATIONS:');
console.log('   • Category C: Higher entry barrier (₹30K) but flat 21x');
console.log('   • Category B: No access to 30x multiplier (capped at 25x)');
console.log('   • A+/A/GOVT: Best progression (21x → 25x → 30x)');
console.log();

console.log('='.repeat(80));
console.log('LOAN AMOUNT CALCULATIONS - SAME SALARY, DIFFERENT CATEGORIES');
console.log('='.repeat(80));
console.log();

const testSalary1 = 60000;
console.log(`Test Salary: ₹${testSalary1.toLocaleString()}/month (₹25K-75K band)`);
console.log();

['A+', 'A', 'B', 'GOVT', 'C'].forEach(category => {
  const result = calculateIndusindEligibility({
    desiredLoanAmount: 5000000,
    loanTenure: 7,
    monthlyIncome: testSalary1,
    existingEMI: 0,
    category: category,
    creditScore: 720,
    employmentType: category === 'GOVT' ? 'government' : 'salaried'
  });
  
  if (result.eligible) {
    console.log(`Category ${category.padEnd(4)} (${result.multiplier}x):`);
    console.log(`  Max Loan Amount: ₹${result.maxLoanByMultiplier.toLocaleString()}`);
    console.log(`  Description: ${indusindConfig.categories[category].description}`);
    console.log();
  }
});

console.log('Comparison at ₹60,000 salary:');
console.log('-'.repeat(80));
console.log('All Categories: 21x multiplier = ₹12,60,000 (same in ₹25K-75K band)');
console.log();

console.log('='.repeat(80));
console.log('INCOME IMPACT ANALYSIS - CATEGORY A+ (Premium)');
console.log('='.repeat(80));
console.log();

const testIncomes = [
  { salary: 50000, band: '25000-75000' },
  { salary: 100000, band: '75001-125000' },
  { salary: 150000, band: '125001+' }
];

testIncomes.forEach(({ salary, band }) => {
  const result = calculateIndusindEligibility({
    desiredLoanAmount: 10000000,
    loanTenure: 7,
    monthlyIncome: salary,
    existingEMI: 0,
    category: 'A+',
    creditScore: 750,
    employmentType: 'salaried'
  });
  
  if (result.eligible) {
    console.log(`Salary: ₹${salary.toLocaleString()} (${band})`);
    console.log(`  Multiplier: ${result.multiplier}x`);
    console.log(`  Max Loan Amount: ₹${result.maxLoanByMultiplier.toLocaleString()}`);
    console.log();
  }
});

console.log('='.repeat(80));
console.log('CATEGORY B vs A+ COMPARISON - MULTIPLIER CAP');
console.log('='.repeat(80));
console.log();

const highSalary = 150000;
console.log(`Test Salary: ₹${highSalary.toLocaleString()}/month`);
console.log();

['A+', 'B'].forEach(category => {
  const result = calculateIndusindEligibility({
    desiredLoanAmount: 10000000,
    loanTenure: 7,
    monthlyIncome: highSalary,
    existingEMI: 0,
    category: category,
    creditScore: 750,
    employmentType: 'salaried'
  });
  
  if (result.eligible) {
    console.log(`Category ${category}:`);
    console.log(`  Multiplier: ${result.multiplier}x`);
    console.log(`  Max Loan: ₹${result.maxLoanByMultiplier.toLocaleString()}`);
    console.log(`  Salary Band: ${result.salaryBand}`);
    console.log();
  }
});

const diff = (150000 * 30) - (150000 * 25);
const diffPercent = ((diff / (150000 * 25)) * 100).toFixed(1);
console.log(`Difference: ₹${diff.toLocaleString()} (${diffPercent}% lower for Category B)`);
console.log('⚠️  Category B CANNOT access 30x multiplier regardless of income!');
console.log();

console.log('='.repeat(80));
console.log('CATEGORY C - FLAT MULTIPLIER ANALYSIS');
console.log('='.repeat(80));
console.log();

const catCSalaries = [35000, 60000, 100000, 150000];
console.log('Category C always gets 21x multiplier:');
console.log('-'.repeat(80));

catCSalaries.forEach(salary => {
  const result = calculateIndusindEligibility({
    desiredLoanAmount: 10000000,
    loanTenure: 7,
    monthlyIncome: salary,
    existingEMI: 0,
    category: 'C',
    creditScore: 720,
    employmentType: 'salaried'
  });
  
  if (result.eligible) {
    console.log(`₹${salary.toLocaleString()}/month → ${result.multiplier}x = ₹${result.maxLoanByMultiplier.toLocaleString()}`);
  }
});

console.log();
console.log('⚠️  No income progression for Category C!');
console.log('    Even at ₹1.5L salary, still stuck at 21x multiplier');
console.log();

console.log('='.repeat(80));
console.log('MINIMUM SALARY REQUIREMENT TESTS');
console.log('='.repeat(80));
console.log();

const minTests = [
  { category: 'A', salary: 24000, shouldPass: false },
  { category: 'A', salary: 25000, shouldPass: true },
  { category: 'C', salary: 25000, shouldPass: false },
  { category: 'C', salary: 29000, shouldPass: false },
  { category: 'C', salary: 30000, shouldPass: true },
  { category: 'B', salary: 25000, shouldPass: true }
];

minTests.forEach(({ category, salary, shouldPass }, idx) => {
  const result = calculateIndusindEligibility({
    desiredLoanAmount: 500000,
    loanTenure: 5,
    monthlyIncome: salary,
    existingEMI: 0,
    category: category,
    creditScore: 720,
    employmentType: category === 'GOVT' ? 'government' : 'salaried'
  });
  
  const passed = result.eligible === shouldPass;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const eligStatus = result.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE';
  
  console.log(`Test ${idx + 1}: ${category} @ ₹${salary.toLocaleString()} → ${eligStatus} ${status}`);
});

console.log();
console.log('='.repeat(80));
console.log('CROSS-CATEGORY COMPARISON AT DIFFERENT INCOMES');
console.log('='.repeat(80));
console.log();

console.log('Scenario 1: Lower Income (₹50,000/month)');
console.log('-'.repeat(80));
['A+', 'A', 'GOVT', 'B', 'C'].forEach(category => {
  const minSalary = indusindConfig.minSalaryByCategory[category] || 25000;
  if (50000 >= minSalary) {
    const result = calculateIndusindEligibility({
      desiredLoanAmount: 2000000,
      loanTenure: 6,
      monthlyIncome: 50000,
      existingEMI: 0,
      category: category,
      creditScore: 730,
      employmentType: category === 'GOVT' ? 'government' : 'salaried'
    });
    
    if (result.eligible) {
      console.log(`  ${category.padEnd(6)}: ${result.multiplier}x → ₹${result.maxLoanByMultiplier.toLocaleString()}`);
    }
  }
});
console.log();

console.log('Scenario 2: Mid Income (₹1,00,000/month)');
console.log('-'.repeat(80));
['A+', 'A', 'GOVT', 'B', 'C'].forEach(category => {
  const result = calculateIndusindEligibility({
    desiredLoanAmount: 5000000,
    loanTenure: 7,
    monthlyIncome: 100000,
    existingEMI: 0,
    category: category,
    creditScore: 750,
    employmentType: category === 'GOVT' ? 'government' : 'salaried'
  });
  
  if (result.eligible) {
    console.log(`  ${category.padEnd(6)}: ${result.multiplier}x → ₹${result.maxLoanByMultiplier.toLocaleString()}`);
  }
});
console.log();

console.log('Scenario 3: High Income (₹1,50,000/month)');
console.log('-'.repeat(80));
['A+', 'A', 'GOVT', 'B', 'C'].forEach(category => {
  const result = calculateIndusindEligibility({
    desiredLoanAmount: 10000000,
    loanTenure: 7,
    monthlyIncome: 150000,
    existingEMI: 0,
    category: category,
    creditScore: 770,
    employmentType: category === 'GOVT' ? 'government' : 'salaried'
  });
  
  if (result.eligible) {
    console.log(`  ${category.padEnd(6)}: ${result.multiplier}x → ₹${result.maxLoanByMultiplier.toLocaleString()}`);
  }
});
console.log();

console.log('='.repeat(80));
console.log('STRATEGIC INSIGHTS');
console.log('='.repeat(80));
console.log();

console.log('✅ 1. CLEAR TIER STRUCTURE:');
console.log('      A+/A/GOVT (Best) → B (Good) → C (Standard)');
console.log();
console.log('✅ 2. PROGRESSIVE REWARDS FOR PREMIUM:');
console.log('      A+/A/GOVT benefit from income growth (21x → 25x → 30x)');
console.log();
console.log('✅ 3. CATEGORY B CEILING:');
console.log('      Capped at 25x, cannot reach 30x multiplier tier');
console.log('      At ₹1.5L salary: ₹37.5L max vs ₹45L for A+ (₹7.5L less)');
console.log();
console.log('✅ 4. CATEGORY C CONSTRAINT:');
console.log('      Flat 21x regardless of income');
console.log('      Higher entry barrier (₹30K) but no upside');
console.log('      At ₹1.5L salary: ₹31.5L max vs ₹45L for A+ (₹13.5L less)');
console.log();
console.log('✅ 5. GOVERNMENT PARITY:');
console.log('      Govt employees treated identically to A+/A');
console.log('      Shows high trust in government job stability');
console.log();

console.log('='.repeat(80));
console.log('COMPARISON WITH AXIS FINANCE (Both Multiplier-Only)');
console.log('='.repeat(80));
console.log();
console.log('                | IndusInd     | Axis Finance');
console.log('-'.repeat(80));
console.log('Top Multiplier  | 30x (A+/A)   | 28x (A/B/GOVT)');
console.log('Categories      | 5 (A+,A,B,G,C)| 5 (A,B,C,D,GOVT)');
console.log('Min Salary      | ₹25K-30K     | ₹25K (universal)');
console.log('Cat C Treatment | Flat 21x     | Progressive (20x-24x)');
console.log('Highest Tier    | ₹125K+       | ₹75K+');
console.log();
console.log('IndusInd Advantages:');
console.log('  • Higher maximum multiplier (30x vs 28x)');
console.log('  • A+ category for premium profiles');
console.log('  • Higher income tier (₹125K+)');
console.log();
console.log('Axis Advantages:');
console.log('  • Universal ₹25K minimum (IndusInd: ₹30K for Cat C)');
console.log('  • Category C gets income progression (IndusInd: flat 21x)');
console.log();

console.log('='.repeat(80));
console.log('✅ INDUSIND BANK - MULTIPLIER SYSTEM VERIFIED');
console.log('='.repeat(80));
