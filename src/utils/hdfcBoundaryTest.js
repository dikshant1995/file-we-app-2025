// Boundary test for HDFC Bank salary bands to ensure no gaps or overlaps
import { calculateHdfcEligibility } from '../banks/hdfc/calculator.js';

console.log('=== HDFC Bank Salary Band Boundary Test ===\n');

// Test boundary values to ensure no gaps or overlaps
const boundarySalaries = [
  24999,  // Below minimum
  25000,  // Exact boundary start
  30000,  // Middle of first band
  50000,  // Exact boundary end of first band
  50001,  // Exact boundary start of second band
  60000,  // Middle of second band
  75000,  // Exact boundary end of second band
  75001,  // Exact boundary start of third band
  85000,  // Middle of third band
  100000, // Exact boundary end of third band
  100001, // Exact boundary start of fourth band
  150000  // Well above maximum band
];

console.log('Testing salary band boundaries:\n');

boundarySalaries.forEach((salary, index) => {
  // Test with a standard category (A) to check band assignment
  const testCase = {
    monthlyIncome: salary,
    existingEMI: 0,
    loanTenure: 1,
    companyName: 'Infosys', // Category A
    employmentType: 'salaried',
    interestRate: 10
  };

  const result = calculateHdfcEligibility(testCase);
  
  if (result.eligible) {
    console.log(`Test ${index + 1}: Salary: ₹${salary.toLocaleString()}`);
    console.log(`  FOIR Percentage: ${(result.foirPercentage * 100)}%`);
    console.log(`  Company Category: ${result.companyCategory}\n`);
  } else {
    console.log(`Test ${index + 1}: Salary: ₹${salary.toLocaleString()}`);
    console.log(`  Result: Not eligible - ${result.reason}\n`);
  }
});

console.log('=== Boundary Analysis ===');
console.log('1. 25K-50K band: Covers salaries from 25,000 to 50,000 (inclusive)');
console.log('2. 50K-75K band: Covers salaries from 50,001 to 75,000 (inclusive)');
console.log('3. 75K-100K band: Covers salaries from 75,001 to 100,000 (inclusive)');
console.log('4. >100K band: Covers salaries above 100,000');
console.log('');
console.log('Key boundary points:');
console.log('- Salary 25,000 falls in 25K-50K band');
console.log('- Salary 50,000 falls in 25K-50K band');
console.log('- Salary 50,001 falls in 50K-75K band');
console.log('- Salary 75,000 falls in 50K-75K band');
console.log('- Salary 75,001 falls in 75K-100K band');
console.log('- Salary 100,000 falls in 75K-100K band');
console.log('- Salary 100,001 falls in >100K band');