// Axis Finance - Multiplier System Test
// Testing category-based multiplier system with universal minimum salary

import { axisFinConfig } from '../banks/axis-fin/config.js';

console.log('\n================================================================');
console.log('AXIS FINANCE - MULTIPLIER-BASED LENDING SYSTEM');
console.log('================================================================\n');

console.log('Bank: Axis Finance');
console.log('Calculation Method: Multiplier-Only (No FOIR)');
console.log('Formula: Loan Amount = Monthly Salary × Multiplier\n');

// Display Multiplier Table
console.log('================================================================');
console.log('COMPLETE MULTIPLIER TABLE');
console.log('================================================================\n');

const categories = ['A', 'B', 'GOVT', 'C', 'D'];
const salaryBands = ['25000-50000', '50001-75000', '75001+'];

// Header row
console.log('Category'.padEnd(12) + '| ' + 
  '₹25K-50K'.padEnd(12) + '| ' +
  '₹50K-75K'.padEnd(12) + '| ' +
  '₹75K+'
);
console.log('-'.repeat(60));

// Data rows
categories.forEach(category => {
  const row = category.padEnd(12) + '| ';
  let rowData = row;
  salaryBands.forEach(band => {
    const multiplier = axisFinConfig.multiplierTable[band][category];
    rowData += (multiplier + 'x').padEnd(12) + '| ';
  });
  console.log(rowData);
});

console.log('\n');

// Key Insights
console.log('================================================================');
console.log('KEY INSIGHTS FROM MULTIPLIER TABLE');
console.log('================================================================\n');

console.log('1. TOP TIER (A, B, GOVT) - Grouped Together:');
console.log('   • ₹25K-50K salary: 24x multiplier');
console.log('   • ₹50K-75K salary: 26x multiplier');
console.log('   • ₹75K+ salary: 28x multiplier');
console.log('   • Consistent across all three categories\n');

console.log('2. MID-TIER (C):');
console.log('   • ₹25K-50K salary: 20x multiplier (17% less than top tier)');
console.log('   • ₹50K-75K salary: 22x multiplier (15% less than top tier)');
console.log('   • ₹75K+ salary: 24x multiplier (14% less than top tier)\n');

console.log('3. LOWER-TIER (D) - Severely Constrained:');
console.log('   • ₹25K-50K salary: 11x multiplier (54% less than top tier!)');
console.log('   • ₹50K-75K salary: 15x multiplier (42% less than top tier)');
console.log('   • ₹75K+ salary: 18x multiplier (36% less than top tier)');
console.log('   • Note: D at ₹75K+ (18x) < A/B/GOVT at ₹25K-50K (24x)\n');

console.log('4. CRITICAL OBSERVATION:');
console.log('   Category D even at HIGHEST income band gets LOWER multiplier');
console.log('   than Category A/B/GOVT at LOWEST income band!');
console.log('   18x (D, ₹75K+) < 24x (A/B/GOVT, ₹25K-50K)\n');

// Test scenarios
console.log('================================================================');
console.log('LOAN AMOUNT CALCULATIONS - SAME SALARY, DIFFERENT CATEGORIES');
console.log('================================================================\n');

const testSalary = 60000;
console.log(`Test Salary: ₹${testSalary.toLocaleString()}/month (₹50K-75K band)\n`);

categories.forEach(category => {
  const multiplier = axisFinConfig.multiplierTable['50001-75000'][category];
  const loanAmount = testSalary * multiplier;
  const description = axisFinConfig.categories[category].description;
  
  console.log(`Category ${category} (${multiplier}x):`);
  console.log(`  Loan Amount: ₹${loanAmount.toLocaleString()}`);
  console.log(`  Description: ${description}\n`);
});

// Category comparison
console.log('Comparison at ₹60,000 salary:');
console.log('-----------------------------');
const baseMultiplier = axisFinConfig.multiplierTable['50001-75000']['A'];
const baseLoan = testSalary * baseMultiplier;
console.log(`Category A/B/GOVT: ₹${baseLoan.toLocaleString()} (Baseline)`);

const cMultiplier = axisFinConfig.multiplierTable['50001-75000']['C'];
const cLoan = testSalary * cMultiplier;
const cDiff = ((baseLoan - cLoan) / baseLoan * 100).toFixed(1);
console.log(`Category C: ₹${cLoan.toLocaleString()} (-${cDiff}% vs baseline)`);

const dMultiplier = axisFinConfig.multiplierTable['50001-75000']['D'];
const dLoan = testSalary * dMultiplier;
const dDiff = ((baseLoan - dLoan) / baseLoan * 100).toFixed(1);
console.log(`Category D: ₹${dLoan.toLocaleString()} (-${dDiff}% vs baseline)\n`);

// Income impact analysis
console.log('================================================================');
console.log('INCOME IMPACT ANALYSIS - SAME CATEGORY, DIFFERENT INCOMES');
console.log('================================================================\n');

const testCategory = 'D';
const salaries = [30000, 60000, 100000];

console.log(`Test Category: ${testCategory} (Lower-Tier)\n`);

salaries.forEach(salary => {
  let band;
  let multiplier;
  
  if (salary >= 25000 && salary <= 50000) {
    band = '25000-50000';
    multiplier = axisFinConfig.multiplierTable['25000-50000'][testCategory];
  } else if (salary >= 50001 && salary <= 75000) {
    band = '50001-75000';
    multiplier = axisFinConfig.multiplierTable['50001-75000'][testCategory];
  } else {
    band = '75001+';
    multiplier = axisFinConfig.multiplierTable['75001+'][testCategory];
  }
  
  const loanAmount = salary * multiplier;
  
  console.log(`Salary: ₹${salary.toLocaleString()} (${band})`);
  console.log(`  Multiplier: ${multiplier}x`);
  console.log(`  Loan Amount: ₹${loanAmount.toLocaleString()}\n`);
});

console.log('Observation for Category D:');
console.log('  Even at ₹1L salary (₹75K+ band), gets only 18x multiplier');
console.log('  Compare to Category A at ₹30K salary: 24x multiplier');
console.log('  Higher income cannot fully compensate for lower category!\n');

// Cross-comparison
console.log('================================================================');
console.log('CROSS-CATEGORY COMPARISON AT DIFFERENT INCOMES');
console.log('================================================================\n');

const scenario1Salary = 30000;
const scenario2Salary = 100000;

console.log(`Scenario 1: Lower Income (₹${scenario1Salary.toLocaleString()}/month)`);
console.log('------------------------------------------------------------');
categories.forEach(cat => {
  const mult = axisFinConfig.multiplierTable['25000-50000'][cat];
  const loan = scenario1Salary * mult;
  console.log(`  ${cat.padEnd(6)}: ${mult}x → ₹${loan.toLocaleString()}`);
});

console.log(`\nScenario 2: Higher Income (₹${scenario2Salary.toLocaleString()}/month)`);
console.log('------------------------------------------------------------');
categories.forEach(cat => {
  const mult = axisFinConfig.multiplierTable['75001+'][cat];
  const loan = scenario2Salary * mult;
  console.log(`  ${cat.padEnd(6)}: ${mult}x → ₹${loan.toLocaleString()}`);
});

console.log('\n');

// Minimum salary test
console.log('================================================================');
console.log('MINIMUM SALARY REQUIREMENT TEST');
console.log('================================================================\n');

console.log(`Universal Minimum: ₹${axisFinConfig.minSalary.toLocaleString()}\n`);

const minTestCases = [
  { category: 'A', salary: 24000, expected: false },
  { category: 'A', salary: 25000, expected: true },
  { category: 'B', salary: 24000, expected: false },
  { category: 'B', salary: 25000, expected: true },
  { category: 'C', salary: 24000, expected: false },
  { category: 'C', salary: 25000, expected: true },
  { category: 'D', salary: 24000, expected: false },
  { category: 'D', salary: 25000, expected: true },
  { category: 'GOVT', salary: 24000, expected: false },
  { category: 'GOVT', salary: 25000, expected: true }
];

let passed = 0;
minTestCases.forEach((test, idx) => {
  const isEligible = test.salary >= axisFinConfig.minSalaryByCategory[test.category];
  const status = isEligible === test.expected ? '✅' : '❌';
  const result = isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE';
  
  console.log(`Test ${idx + 1}: ${test.category} @ ₹${test.salary.toLocaleString()} → ${result} ${status}`);
  if (isEligible === test.expected) passed++;
});

console.log(`\nTest Results: ${passed}/${minTestCases.length} passed ✅\n`);

// Strategic insights
console.log('================================================================');
console.log('STRATEGIC INSIGHTS');
console.log('================================================================\n');

console.log('✅ 1. CLEAR ENTRY BARRIER:');
console.log('      Universal ₹25,000 minimum simplifies screening\n');

console.log('✅ 2. CATEGORY DOMINANCE:');
console.log('      Category matters MORE than income');
console.log('      D at ₹1L (18x) < A at ₹30K (24x)\n');

console.log('✅ 3. TOP-TIER GROUPING:');
console.log('      A, B, and GOVT treated identically');
console.log('      Shows trust in government stability\n');

console.log('✅ 4. CONSERVATIVE ON RISK:');
console.log('      Category D severely constrained');
console.log('      54% lower multiplier at lowest band\n');

console.log('✅ 5. PROGRESSIVE MULTIPLIERS:');
console.log('      Higher income = higher multiplier');
console.log('      But category ceiling exists\n');

console.log('================================================================\n');

export { categories, salaryBands };
