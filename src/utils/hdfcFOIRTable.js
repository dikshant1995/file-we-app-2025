// HDFC FOIR Table Clarification
console.log('=== HDFC Bank FOIR Table ===\n');

// Based on the provided information:
const hdfcFOIRTable = {
  '25000-50000': {
    'Super A': 0.55,
    'A': 0.55,
    'B': 0.55,
    'C': 0.50,
    'Govt': 0.55
  },
  '50001-75000': {
    'Super A': 0.65,
    'A': 0.65,
    'B': 0.65,
    'C': 0.65,
    'Govt': 0.65
  },
  '75001-100000': {
    'Super A': 0.70,
    'A': 0.70,
    'B': 0.70,
    'C': 0.70,
    'Govt': 0.70
  },
  '100001+': {
    'Super A': 0.70,
    'A': 0.70,
    'B': 0.70,
    'C': 0.70,
    'Govt': 0.70
  }
};

console.log('HDFC FOIR Table:');
Object.keys(hdfcFOIRTable).forEach(salaryBand => {
  const categories = hdfcFOIRTable[salaryBand];
  let row = salaryBand + ': ';
  Object.keys(categories).forEach(category => {
    row += category + '=' + (categories[category] * 100) + '% ';
  });
  console.log(row);
});

console.log('\n=== Boundary Salary Examples for FOIR ===\n');

// Function to determine FOIR salary band for HDFC
const getHdfcFoirSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 50000) return '25000-50000';
  if (salary >= 50001 && salary <= 75000) return '50001-75000';
  if (salary >= 75001 && salary <= 100000) return '75001-100000';
  if (salary > 100000) return '100001+';
  return null;
};

// Test boundary values
const boundarySalaries = [24999, 25000, 50000, 50001, 75000, 75001, 100000, 100001, 150000];

boundarySalaries.forEach(salary => {
  const band = getHdfcFoirSalaryBand(salary);
  if (band && hdfcFOIRTable[band]) {
    console.log(`Salary: ₹${salary.toLocaleString()} → FOIR Band: ${band}`);
    
    // Show FOIR percentages for different categories at this salary level
    const foirPercentages = hdfcFOIRTable[band];
    let foirInfo = '  FOIR Percentages: ';
    Object.keys(foirPercentages).forEach(category => {
      foirInfo += `${category}=${foirPercentages[category] * 100}% `;
    });
    console.log(foirInfo);
  } else {
    console.log(`Salary: ₹${salary.toLocaleString()} → FOIR Band: ${band}`);
  }
  console.log('');
});

console.log('\n=== Key Observations ===\n');
console.log('1. Govt category has identical FOIR percentages as Category A across all salary bands');
console.log('2. Category C has a lower FOIR percentage (50%) in the 25K-50K band compared to others (55%)');
console.log('3. All categories converge to 70% FOIR for salaries above ₹75,000');
console.log('4. The FOIR bands are different from the Multiplier bands, with a specific range for 75K-100K');