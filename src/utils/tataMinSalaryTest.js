// Tata Capital - Minimum Salary Slab Test
// Testing minimum salary requirements for different categories

import { tataConfig } from '../banks/tata/config.js';

console.log('\n=================================================');
console.log('TATA CAPITAL - MINIMUM SALARY REQUIREMENTS TEST');
console.log('=================================================\n');

console.log('Bank: Tata Capital');
console.log('Company Serial Number: 7');
console.log('\n');

// Test cases for each category
const testCases = [
  { category: 'SUP-A', salary: 24000, expectedEligible: false },
  { category: 'SUP-A', salary: 25000, expectedEligible: true },
  { category: 'A', salary: 24000, expectedEligible: false },
  { category: 'A', salary: 25000, expectedEligible: true },
  { category: 'GOVT', salary: 24000, expectedEligible: false },
  { category: 'GOVT', salary: 25000, expectedEligible: true },
  { category: 'B', salary: 24000, expectedEligible: false },
  { category: 'B', salary: 25000, expectedEligible: true },
  { category: 'C', salary: 24000, expectedEligible: false },
  { category: 'C', salary: 25000, expectedEligible: true },
  { category: 'D', salary: 24000, expectedEligible: false },
  { category: 'D', salary: 25000, expectedEligible: true },
  { category: 'UNLISTED', salary: 39000, expectedEligible: false },
  { category: 'UNLISTED', salary: 40000, expectedEligible: true },
];

console.log('MINIMUM SALARY REQUIREMENTS BY CATEGORY:');
console.log('=========================================\n');

// Display minimum salary for each category
const categories = ['SUP-A', 'A', 'GOVT', 'B', 'C', 'D', 'UNLISTED'];
categories.forEach(category => {
  const minSalary = tataConfig.minSalaryByCategory[category];
  const description = tataConfig.companyCategories[category]?.description || 'N/A';
  console.log(`Category: ${category.padEnd(10)} | Min Salary: ₹${minSalary.toLocaleString().padEnd(10)} | ${description}`);
});

console.log('\n');
console.log('=================================================');
console.log('ELIGIBILITY TEST RESULTS');
console.log('=================================================\n');

let passedTests = 0;
let failedTests = 0;

testCases.forEach((test, index) => {
  const minRequired = tataConfig.minSalaryByCategory[test.category];
  const isEligible = test.salary >= minRequired;
  const testPassed = isEligible === test.expectedEligible;
  
  const status = testPassed ? '✅ PASS' : '❌ FAIL';
  const eligibility = isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE';
  
  console.log(`Test ${(index + 1).toString().padStart(2)}: Category ${test.category.padEnd(10)} | Salary: ₹${test.salary.toLocaleString().padEnd(10)} | ${eligibility.padEnd(13)} | ${status}`);
  
  if (testPassed) {
    passedTests++;
  } else {
    failedTests++;
  }
});

console.log('\n=================================================');
console.log('TEST SUMMARY');
console.log('=================================================');
console.log(`Total Tests: ${testCases.length}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
console.log('=================================================\n');

// Key Insights
console.log('KEY INSIGHTS:');
console.log('-------------');
console.log('1. Categories A, B, C, D, SUP-A, GOVT: Minimum salary ₹25,000');
console.log('2. Category UNLISTED: Minimum salary ₹40,000 (60% higher!)');
console.log('3. UNLISTED category has the strictest entry requirement');
console.log('4. This reflects higher risk assessment for unlisted companies');
console.log('\n');

// Example scenarios
console.log('=================================================');
console.log('EXAMPLE SCENARIOS');
console.log('=================================================\n');

console.log('Scenario 1: Employee with ₹30,000 salary');
console.log('-------------------------------------------');
console.log('Category A: ✅ ELIGIBLE (Min: ₹25,000)');
console.log('Category B: ✅ ELIGIBLE (Min: ₹25,000)');
console.log('Category C: ✅ ELIGIBLE (Min: ₹25,000)');
console.log('UNLISTED:   ❌ NOT ELIGIBLE (Min: ₹40,000, Short by ₹10,000)');
console.log('\n');

console.log('Scenario 2: Employee with ₹45,000 salary');
console.log('-------------------------------------------');
console.log('Category A: ✅ ELIGIBLE (Min: ₹25,000)');
console.log('Category B: ✅ ELIGIBLE (Min: ₹25,000)');
console.log('Category C: ✅ ELIGIBLE (Min: ₹25,000)');
console.log('UNLISTED:   ✅ ELIGIBLE (Min: ₹40,000)');
console.log('\n');

console.log('=================================================\n');

// Export results
export { testCases, passedTests, failedTests };
