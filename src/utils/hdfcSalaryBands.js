// HDFC Salary Bands Clarification based on provided information
console.log('=== HDFC Bank Salary Bands and Multipliers ===\n');

// Based on the memory information:
const hdfcMultiplierTable = {
  '25000-35000': {
    'Super A': 19,
    'A': 19,
    'B': 12,
    'C': 0,
    'Govt': 19
  },
  '35001-50000': {
    'Super A': 22,
    'A': 20,
    'B': 15,
    'C': 13,
    'Govt': 20
  },
  '50001-75000': {
    'Super A': 25,
    'A': 23,
    'B': 20,
    'C': 20,
    'Govt': 23
  },
  '75001+': {
    'Super A': 27,
    'A': 24,
    'B': 22,
    'C': 21,
    'Govt': 24
  }
};

console.log('HDFC Multiplier Table:');
Object.keys(hdfcMultiplierTable).forEach(salaryBand => {
  const categories = hdfcMultiplierTable[salaryBand];
  let row = salaryBand + ': ';
  Object.keys(categories).forEach(category => {
    row += category + '=' + categories[category] + ' ';
  });
  console.log(row);
});

console.log('\n=== Boundary Salary Examples ===\n');

// Function to determine salary band for HDFC
const getHdfcSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 35000) return '25000-35000';
  if (salary >= 35001 && salary <= 50000) return '35001-50000';
  if (salary >= 50001 && salary <= 75000) return '50001-75000';
  if (salary > 75000) return '75001+';
  return null;
};

// Test boundary values
const boundarySalaries = [24999, 25000, 35000, 35001, 50000, 50001, 75000, 75001, 85000];

boundarySalaries.forEach(salary => {
  const band = getHdfcSalaryBand(salary);
  if (band && hdfcMultiplierTable[band]) {
    console.log(`Salary: ₹${salary.toLocaleString()} → Band: ${band}`);
    
    // Show multipliers for different categories at this salary level
    const multipliers = hdfcMultiplierTable[band];
    let multiplierInfo = '  Multipliers: ';
    Object.keys(multipliers).forEach(category => {
      multiplierInfo += `${category}=${multipliers[category]} `;
    });
    console.log(multiplierInfo);
  } else {
    console.log(`Salary: ₹${salary.toLocaleString()} → Band: ${band}`);
  }
  console.log('');
});