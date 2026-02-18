// Cholamandalam Finance - Minimum Salary Slab Test
// Testing minimum salary requirements for different categories

import { cholaConfig } from '../banks/chola/config.js';

console.log('\n=================================================');
console.log('CHOLAMANDALAM FINANCE - MINIMUM SALARY TEST');
console.log('=================================================\n');

console.log('Bank: Cholamandalam Finance (CHOLA)');
console.log('\n');

// Test cases for each category
const testCases = [
  // Category A - Min: 20,000
  { category: 'A', salary: 19000, expectedEligible: false },
  { category: 'A', salary: 20000, expectedEligible: true },
  { category: 'A', salary: 25000, expectedEligible: true },
  
  // Category B - Min: 25,000
  { category: 'B', salary: 20000, expectedEligible: false },
  { category: 'B', salary: 24000, expectedEligible: false },
  { category: 'B', salary: 25000, expectedEligible: true },
  { category: 'B', salary: 30000, expectedEligible: true },
  
  // Category C - Min: 20,000
  { category: 'C', salary: 19000, expectedEligible: false },
  { category: 'C', salary: 20000, expectedEligible: true },
  { category: 'C', salary: 25000, expectedEligible: true },
  
  // Category D - Min: 25,000
  { category: 'D', salary: 20000, expectedEligible: false },
  { category: 'D', salary: 24000, expectedEligible: false },
  { category: 'D', salary: 25000, expectedEligible: true },
  { category: 'D', salary: 30000, expectedEligible: true },
  
  // Government - Min: 20,000
  { category: 'GOVT', salary: 19000, expectedEligible: false },
  { category: 'GOVT', salary: 20000, expectedEligible: true },
  
  // UNLISTED - NOT ELIGIBLE (no matter the salary)
  { category: 'UNLISTED', salary: 20000, expectedEligible: false },
  { category: 'UNLISTED', salary: 50000, expectedEligible: false },
  { category: 'UNLISTED', salary: 100000, expectedEligible: false },
];

console.log('MINIMUM SALARY REQUIREMENTS BY CATEGORY:');
console.log('=========================================\n');

// Display minimum salary for each category
const categories = ['A', 'B', 'C', 'D', 'GOVT', 'UNLISTED'];
categories.forEach(category => {
  const minSalary = cholaConfig.minSalary[category];
  const description = cholaConfig.companyCategories[category]?.description || 'N/A';
  const salaryDisplay = minSalary === null ? 'NOT ELIGIBLE' : `₹${minSalary.toLocaleString()}`;
  console.log(`Category: ${category.padEnd(10)} | Min Salary: ${salaryDisplay.padEnd(15)} | ${description}`);
});

console.log('\n');
console.log('=================================================');
console.log('ELIGIBILITY TEST RESULTS');
console.log('=================================================\n');

let passedTests = 0;
let failedTests = 0;

testCases.forEach((test, index) => {
  const minRequired = cholaConfig.minSalary[test.category];
  let isEligible = false;
  
  // Check if UNLISTED (never eligible)
  if (test.category === 'UNLISTED' || minRequired === null) {
    isEligible = false;
  } else {
    isEligible = test.salary >= minRequired;
  }
  
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
console.log('1. Category A: Minimum salary ₹20,000');
console.log('2. Category B: Minimum salary ₹25,000 (25% higher)');
console.log('3. Category C: Minimum salary ₹20,000');
console.log('4. Category D: Minimum salary ₹25,000 (25% higher)');
console.log('5. Government: Minimum salary ₹20,000');
console.log('6. UNLISTED: NOT ELIGIBLE (completely ineligible, regardless of salary)');
console.log('\n');

// Category comparison
console.log('=================================================');
console.log('CATEGORY COMPARISON');
console.log('=================================================\n');

console.log('Low Entry Barrier (₹20,000):');
console.log('  • Category A');
console.log('  • Category C');
console.log('  • Government Employees');
console.log('\n');

console.log('Higher Entry Barrier (₹25,000):');
console.log('  • Category B (+25% higher)');
console.log('  • Category D (+25% higher)');
console.log('\n');

console.log('No Entry (Ineligible):');
console.log('  • UNLISTED Companies ❌');
console.log('\n');

// Example scenarios
console.log('=================================================');
console.log('EXAMPLE SCENARIOS');
console.log('=================================================\n');

console.log('Scenario 1: Employee with ₹22,000 salary');
console.log('-------------------------------------------');
console.log('Category A: ✅ ELIGIBLE (Min: ₹20,000)');
console.log('Category B: ❌ NOT ELIGIBLE (Min: ₹25,000, Short by ₹3,000)');
console.log('Category C: ✅ ELIGIBLE (Min: ₹20,000)');
console.log('Category D: ❌ NOT ELIGIBLE (Min: ₹25,000, Short by ₹3,000)');
console.log('Government: ✅ ELIGIBLE (Min: ₹20,000)');
console.log('UNLISTED:   ❌ NOT ELIGIBLE (Company type not accepted)');
console.log('\n');

console.log('Scenario 2: Employee with ₹30,000 salary');
console.log('-------------------------------------------');
console.log('Category A: ✅ ELIGIBLE (Min: ₹20,000)');
console.log('Category B: ✅ ELIGIBLE (Min: ₹25,000)');
console.log('Category C: ✅ ELIGIBLE (Min: ₹20,000)');
console.log('Category D: ✅ ELIGIBLE (Min: ₹25,000)');
console.log('Government: ✅ ELIGIBLE (Min: ₹20,000)');
console.log('UNLISTED:   ❌ NOT ELIGIBLE (Company type not accepted)');
console.log('\n');

console.log('Scenario 3: UNLISTED company employee with ₹100,000 salary');
console.log('------------------------------------------------------------');
console.log('UNLISTED:   ❌ NOT ELIGIBLE');
console.log('Reason:     Cholamandalam Finance does not provide loans to');
console.log('            employees of unlisted companies, regardless of salary.');
console.log('\n');

console.log('=================================================');
console.log('IMPORTANT NOTE');
console.log('=================================================');
console.log('UNLISTED companies are COMPLETELY INELIGIBLE.');
console.log('This is a categorical restriction, not a salary-based one.');
console.log('Even with very high salaries (e.g., ₹1 lakh+), employees');
console.log('of unlisted companies cannot get loans from Cholamandalam.');
console.log('=================================================\n');

// Export results
export { testCases, passedTests, failedTests };
