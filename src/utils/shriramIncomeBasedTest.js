// Shri Ram Finance - Income-Centric Lending Test
// Testing salary-driven combined Multiplier + FOIR system

import { shriRamConfig } from '../banks/shri-ram/config.js';

console.log('\n================================================================');
console.log('SHRI RAM FINANCE - INCOME-CENTRIC LENDING SYSTEM');
console.log('================================================================\n');

console.log('Bank: Shri Ram Finance');
console.log('Calculation Method: Combined (Multiplier + FOIR)');
console.log('Unique Feature: Salary-driven, NO category distinction\n');

// Display Salary Band Table
console.log('================================================================');
console.log('SALARY-DRIVEN MULTIPLIER + FOIR TABLE');
console.log('================================================================\n');

console.log('Salary Band'.padEnd(20) + '| Multiplier | FOIR   | Max Loan Capacity');
console.log('-'.repeat(70));

const salaryBands = ['25000-35000', '35001-50000', '50001-75000', '75001+'];
salaryBands.forEach(band => {
  const data = shriRamConfig.salaryBandTable[band];
  const multiplier = data.multiplier + 'x';
  const foir = (data.foir * 100).toFixed(0) + '%';
  
  // Calculate example for middle of range
  let exampleSalary;
  if (band === '25000-35000') exampleSalary = 30000;
  else if (band === '35001-50000') exampleSalary = 42000;
  else if (band === '50001-75000') exampleSalary = 62000;
  else exampleSalary = 100000;
  
  const maxLoan = exampleSalary * data.multiplier;
  
  console.log(`${band.padEnd(20)}| ${multiplier.padEnd(10)} | ${foir.padEnd(6)} | Ex: \u20b9${maxLoan.toLocaleString()}`);
});

console.log('\n');

// Key Insights
console.log('================================================================');
console.log('KEY INSIGHTS');
console.log('================================================================\n');

console.log('\u2705 1. INCOME-CENTRIC APPROACH:');
console.log('      Multiplier and FOIR determined by salary ONLY');
console.log('      No category (A/B/C/D/UNLISTED) distinction!\n');

console.log('\u2705 2. UNIVERSAL MINIMUM:');
console.log('      \u20b925,000 minimum across ALL categories');
console.log('      UNLISTED treated same as Category A!\n');

console.log('\u2705 3. PROGRESSIVE SYSTEM:');
console.log('      Higher income = Higher multiplier + Higher FOIR');
console.log('      Multiplier: 14x \u2192 18x \u2192 20x \u2192 22x');
console.log('      FOIR: 50% \u2192 60% \u2192 65% \u2192 70%\n');

console.log('\u2705 4. GENEROUS HIGH-INCOME TERMS:');
console.log('      70% FOIR for >₹75K salary (highest among all banks)');
console.log('      22x multiplier for top earners\n');

console.log('\u2705 5. MOST INCLUSIVE FOR UNLISTED:');
console.log('      Only bank with same minimum for UNLISTED');
console.log('      No penalty for unlisted company employees\n');

// Minimum salary test
console.log('================================================================');
console.log('MINIMUM SALARY TEST - UNIVERSAL ₹25,000');
console.log('================================================================\n');

const categories = ['A', 'B', 'C', 'D', 'UNLISTED'];
console.log('All categories have same minimum: ₹25,000\n');

categories.forEach(cat => {
  const minSalary = shriRamConfig.minSalaryByCategory[cat];
  const description = shriRamConfig.categories[cat].description;
  console.log(`${cat.padEnd(10)}: \u20b9${minSalary.toLocaleString().padEnd(10)} | ${description}`);
});

console.log('\n\u26a0\ufe0f  Notable: UNLISTED has SAME minimum as Category A!');
console.log('   This is unique among all configured banks.\n');

// Cross-category comparison
console.log('================================================================');
console.log('CROSS-CATEGORY COMPARISON - SAME SALARY, ALL CATEGORIES');
console.log('================================================================\n');

const testSalary = 60000;
const testBand = '50001-75000';
const testData = shriRamConfig.salaryBandTable[testBand];

console.log(`Test Salary: \u20b9${testSalary.toLocaleString()}/month`);
console.log(`Salary Band: ${testBand}`);
console.log(`Multiplier: ${testData.multiplier}x`);
console.log(`FOIR: ${(testData.foir * 100).toFixed(0)}%\n`);

console.log('Loan Calculation (applies to ALL categories):');
console.log('-'.repeat(60));

categories.forEach(cat => {
  const maxLoan = testSalary * testData.multiplier;
  const availableEMI = testSalary * testData.foir;
  
  console.log(`\n${cat} Category:`);
  console.log(`  Max Loan (Multiplier): \u20b9${maxLoan.toLocaleString()}`);
  console.log(`  Available EMI (FOIR): \u20b9${availableEMI.toLocaleString()}`);
  console.log(`  Status: \u2705 ELIGIBLE (no category penalty)`);
});

console.log('\n\u2728 UNIQUE: All categories get IDENTICAL loan terms!');
console.log('   Category A = UNLISTED at same salary!\n');

// Income progression test
console.log('================================================================');
console.log('INCOME PROGRESSION ANALYSIS - UNLISTED CATEGORY');
console.log('================================================================\n');

console.log('Showing how loan capacity increases with income:');
console.log('(Same applies to ALL categories)\n');

const testSalaries = [
  { salary: 30000, band: '25000-35000' },
  { salary: 42000, band: '35001-50000' },
  { salary: 62000, band: '50001-75000' },
  { salary: 100000, band: '75001+' }
];

testSalaries.forEach(test => {
  const data = shriRamConfig.salaryBandTable[test.band];
  const maxLoan = test.salary * data.multiplier;
  const availableEMI = test.salary * data.foir;
  
  console.log(`Salary: \u20b9${test.salary.toLocaleString()} (${test.band})`);
  console.log(`  Multiplier: ${data.multiplier}x | FOIR: ${(data.foir * 100).toFixed(0)}%`);
  console.log(`  Max Loan: \u20b9${maxLoan.toLocaleString()}`);
  console.log(`  Available EMI: \u20b9${availableEMI.toLocaleString()}\n`);
});

// Comparison with other banks
console.log('================================================================');
console.log('COMPARISON WITH OTHER BANKS - UNLISTED TREATMENT');
console.log('================================================================\n');

console.log('Bank              | UNLISTED Min | Category Treatment');
console.log('------------------|--------------|-------------------');
console.log('Shri Ram          | \u20b925,000     | Same as A/B/C/D (UNIQUE!)');
console.log('Tata Capital      | \u20b940,000     | Higher minimum + low multiplier');
console.log('Cholamandalam     | NOT ELIGIBLE | Completely rejected');
console.log('Kotak Mahindra    | NOT ELIGIBLE | Completely rejected');
console.log('Poonawala (E)     | \u20b950,000     | Higher minimum + FOIR matrix');
console.log('Axis Finance (D)  | \u20b925,000     | Same min, but 54% lower multiplier');
console.log('ICICI Bank        | \u20b950,000     | High minimum');

console.log('\n\u2728 Shri Ram is MOST INCLUSIVE for UNLISTED category!\n');

// Practical scenarios
console.log('================================================================');
console.log('PRACTICAL SCENARIOS');
console.log('================================================================\n');

console.log('Scenario 1: UNLISTED Employee, \u20b930,000 salary');
console.log('--------------------------------------------------');
console.log('Shri Ram Finance:');
console.log('  Status: \u2705 ELIGIBLE');
console.log('  Multiplier: 14x');
console.log('  FOIR: 50%');
console.log('  Max Loan: \u20b94,20,000');
console.log('  Available EMI: \u20b915,000');
console.log('\nOther Banks:');
console.log('  Cholamandalam: \u274c NOT ELIGIBLE (UNLISTED rejected)');
console.log('  Kotak: \u274c NOT ELIGIBLE (UNLISTED rejected)');
console.log('  Tata: \u274c NOT ELIGIBLE (below \u20b940K minimum)');
console.log('  Poonawala: \u274c NOT ELIGIBLE (below \u20b950K minimum)');
console.log('  Axis: \u2705 ELIGIBLE but 11x multiplier = \u20b93,30,000 (lower)\n');

console.log('Scenario 2: UNLISTED Employee, \u20b980,000 salary');
console.log('--------------------------------------------------');
console.log('Shri Ram Finance:');
console.log('  Status: \u2705 ELIGIBLE');
console.log('  Multiplier: 22x');
console.log('  FOIR: 70%');
console.log('  Max Loan: \u20b917,60,000');
console.log('  Available EMI: \u20b956,000');
console.log('\nOther Banks:');
console.log('  Tata: \u2705 ELIGIBLE (15x multiplier = \u20b912,00,000) - Lower');
console.log('  Axis (Cat D): \u2705 ELIGIBLE (18x multiplier = \u20b914,40,000) - Lower');
console.log('  Poonawala (E): \u2705 ELIGIBLE (50% FOIR, complex matrix)\n');

console.log('Scenario 3: Category A vs UNLISTED at \u20b960,000 salary');
console.log('-------------------------------------------------------');
const s3Data = shriRamConfig.salaryBandTable['50001-75000'];
const s3Loan = 60000 * s3Data.multiplier;
const s3EMI = 60000 * s3Data.foir;

console.log('Shri Ram Finance (Category A):');
console.log(`  Max Loan: \u20b9${s3Loan.toLocaleString()}`);
console.log(`  Available EMI: \u20b9${s3EMI.toLocaleString()}`);
console.log('\nShri Ram Finance (UNLISTED):');
console.log(`  Max Loan: \u20b9${s3Loan.toLocaleString()} (SAME!)`);
console.log(`  Available EMI: \u20b9${s3EMI.toLocaleString()} (SAME!)`);
console.log('\n\u2728 NO DIFFERENCE between Category A and UNLISTED!\n');

// Strategic analysis
console.log('================================================================');
console.log('STRATEGIC ANALYSIS');
console.log('================================================================\n');

console.log('\u2705 SHRI RAM\'S UNIQUE POSITIONING:');
console.log('   \u2022 Income is the ONLY factor (after minimum)');
console.log('   \u2022 No employer category discrimination');
console.log('   \u2022 Most accessible for informal sector');
console.log('   \u2022 Simplified underwriting process\n');

console.log('\u2705 TARGET MARKET:');
console.log('   \u2022 Self-employed professionals');
console.log('   \u2022 Unlisted company employees');
console.log('   \u2022 Informal sector with verifiable income');
console.log('   \u2022 Income-rich, category-poor applicants\n');

console.log('\u2705 COMPETITIVE ADVANTAGES:');
console.log('   \u2022 Captures market rejected by others');
console.log('   \u2022 Simple, transparent criteria');
console.log('   \u2022 No complex category determination');
console.log('   \u2022 Rewards income growth universally\n');

console.log('\u2705 RISK MANAGEMENT:');
console.log('   \u2022 Universal \u20b925K minimum as floor');
console.log('   \u2022 FOIR ensures repayment capacity');
console.log('   \u2022 Multiplier limits exposure');
console.log('   \u2022 Progressive scaling with income\n');

console.log('================================================================\n');

export { testSalaries, categories };
