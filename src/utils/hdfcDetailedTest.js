// Detailed test for HDFC Bank FOIR calculations based on the provided table
import { calculateHdfcEligibility } from '../banks/hdfc/calculator.js';

console.log('=== HDFC Bank FOIR Table Verification ===\n');

// Test data based on the provided FOIR table
const testData = [
  // 25k-50k salary band
  { salary: 30000, category: 'Super A', expectedFoir: 0.55 },
  { salary: 30000, category: 'A', expectedFoir: 0.55 },
  { salary: 30000, category: 'B', expectedFoir: 0.55 },
  { salary: 30000, category: 'C', expectedFoir: 0.50 },
  { salary: 30000, category: 'Govt', expectedFoir: 0.55 },
  
  // 50k-75k salary band
  { salary: 60000, category: 'Super A', expectedFoir: 0.65 },
  { salary: 60000, category: 'A', expectedFoir: 0.65 },
  { salary: 60000, category: 'B', expectedFoir: 0.65 },
  { salary: 60000, category: 'C', expectedFoir: 0.65 },
  { salary: 60000, category: 'Govt', expectedFoir: 0.65 },
  
  // 75k-100k salary band
  { salary: 85000, category: 'Super A', expectedFoir: 0.70 },
  { salary: 85000, category: 'A', expectedFoir: 0.70 },
  { salary: 85000, category: 'B', expectedFoir: 0.70 },
  { salary: 85000, category: 'C', expectedFoir: 0.70 },
  { salary: 85000, category: 'Govt', expectedFoir: 0.70 },
  
  // >100k salary band
  { salary: 120000, category: 'Super A', expectedFoir: 0.70 },
  { salary: 120000, category: 'A', expectedFoir: 0.70 },
  { salary: 120000, category: 'B', expectedFoir: 0.70 },
  { salary: 120000, category: 'C', expectedFoir: 0.70 },
  { salary: 120000, category: 'Govt', expectedFoir: 0.70 }
];

// Function to simulate company category for testing
const getCompanyNameByCategory = (category) => {
  switch(category) {
    case 'Super A': return 'Google';
    case 'A': return 'Infosys';
    case 'B': return 'HCL';
    case 'C': return 'Local Regional Company';
    case 'Govt': return 'Government of India';
    default: return 'Infosys';
  }
};

// Function to get employment type by category
const getEmploymentTypeByCategory = (category) => {
  return category === 'Govt' ? 'government' : 'salaried';
};

console.log('Testing FOIR percentages for different salary bands and categories:\n');

let passedTests = 0;
let totalTests = testData.length;

testData.forEach((test, index) => {
  const companyName = getCompanyNameByCategory(test.category);
  const employmentType = getEmploymentTypeByCategory(test.category);
  
  const testCase = {
    monthlyIncome: test.salary,
    existingEMI: 0, // No existing EMIs for this test
    loanTenure: 1, // 1 year for simple calculation
    companyName: companyName,
    employmentType: employmentType,
    interestRate: 10 // 10% interest rate for calculation
  };

  const result = calculateHdfcEligibility(testCase);
  
  if (result.eligible) {
    const actualFoir = result.foirPercentage;
    const passed = Math.abs(actualFoir - test.expectedFoir) < 0.001;
    
    console.log(`Test ${index + 1}: Salary: ₹${test.salary.toLocaleString()}, Category: ${test.category}`);
    console.log(`  Expected FOIR: ${(test.expectedFoir * 100)}%, Actual FOIR: ${(actualFoir * 100)}%`);
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}\n`);
    
    if (passed) passedTests++;
  } else {
    console.log(`Test ${index + 1}: Salary: ₹${test.salary.toLocaleString()}, Category: ${test.category}`);
    console.log(`  FAILED - ${result.reason}\n`);
  }
});

console.log(`\n=== Test Summary ===`);
console.log(`Passed: ${passedTests}/${totalTests} tests`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(2)}%`);

console.log('\n=== Key Observations from FOIR Table ===');
console.log('1. In 25K-50K band: Category C gets 50% FOIR, all others get 55%');
console.log('2. In 50K-75K band: All categories get 65% FOIR');
console.log('3. In 75K-100K band: All categories get 70% FOIR');
console.log('4. In >100K band: All categories get 70% FOIR');
console.log('5. Government employees are treated the same as Category A in most bands');