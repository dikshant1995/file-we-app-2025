// Test to clarify salary band boundaries
import { kotakConfig } from '../banks/kotak/config.js';

// Function to determine salary band for multiplier table (copied from calculator)
const getMultiplierSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 35000) return '25000-35000';
  if (salary >= 35001 && salary <= 50000) return '35001-50000';
  if (salary >= 50001 && salary <= 75000) return '50001-75000';
  if (salary > 75000) return '75000+';
  return null;
};

console.log('=== Kotak Mahindra Bank Salary Band Boundaries ===\n');

// Test boundary values
const boundarySalaries = [24999, 25000, 35000, 35001, 50000, 50001, 75000, 75001, 85000];

boundarySalaries.forEach(salary => {
  const band = getMultiplierSalaryBand(salary);
  console.log(`Salary: ₹${salary.toLocaleString()} → Band: ${band}`);
});

console.log('\n=== Multiplier Values for Boundary Salaries (Category D) ===\n');

boundarySalaries.forEach(salary => {
  const band = getMultiplierSalaryBand(salary);
  if (band && kotakConfig.multiplierTable[band]) {
    const multiplier = kotakConfig.multiplierTable[band]['D'] || 'N/A';
    console.log(`Salary: ₹${salary.toLocaleString()} → Band: ${band} → Multiplier (D): ${multiplier}`);
  } else {
    console.log(`Salary: ₹${salary.toLocaleString()} → Band: ${band} → Multiplier (D): N/A`);
  }
});