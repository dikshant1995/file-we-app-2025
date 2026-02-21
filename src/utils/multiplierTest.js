// Test the Kotak Mahindra Bank multiplier table
import { kotakConfig } from '../banks/kotak/config.js';

console.log('=== Kotak Mahindra Bank Multiplier Table ===\n');

// Print the multiplier table
console.log('Multiplier Table:');
Object.keys(kotakConfig.multiplierTable).forEach(salaryBand => {
  const categories = kotakConfig.multiplierTable[salaryBand];
  let row = salaryBand + ': ';
  Object.keys(categories).forEach(category => {
    row += category + '=' + categories[category] + ' ';
  });
  console.log(row);
});

console.log('\n=== Testing Specific Cases ===\n');

// Test different salary values to see which band they fall into
const testSalaries = [30000, 45000, 67000, 80000];

testSalaries.forEach(salary => {
  let band = null;
  if (salary >= 25000 && salary <= 35000) band = '25000-35000';
  if (salary >= 35001 && salary <= 50000) band = '35001-50000';
  if (salary >= 50001 && salary <= 75000) band = '50001-75000';
  if (salary > 75000) band = '75000+';
  
  console.log(`Salary: ₹${salary.toLocaleString()}`);
  console.log(`Band: ${band}`);
  if (band && kotakConfig.multiplierTable[band]) {
    console.log(`Multipliers:`, kotakConfig.multiplierTable[band]);
  }
  console.log('---');
});