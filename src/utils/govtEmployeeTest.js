// Government Employee Loan Eligibility Test
// Salary: ₹44,000/month
// Tenure: 6 years (72 months)
// Interest Rate: 11% p.a.

import { kotakConfig } from '../banks/kotak/config.js';
import { hdfcConfig } from '../banks/hdfc/config.js';
import { iciciConfig } from '../banks/icici/config.js';
import { bandhanConfig } from '../banks/bandhan/config.js';
import { cholaConfig } from '../banks/chola/config.js';
import { tataConfig } from '../banks/tata/config.js';

// EMI Calculation Function
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;
  
  if (monthlyInterestRate === 0) {
    return principal / numberOfMonths;
  }
  
  const emi = principal * monthlyInterestRate * 
    (Math.pow(1 + monthlyInterestRate, numberOfMonths)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
    
  return Math.round(emi);
};

// Reverse EMI Calculation - Calculate Principal from EMI
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;
  
  if (monthlyInterestRate === 0) {
    return emi * numberOfMonths;
  }
  
  const principal = emi * (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1) / 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths));
    
  return Math.round(principal);
};

// Helper function to get salary band
const getSalaryBand = (salary, bands) => {
  for (const band of Object.keys(bands)) {
    if (band.includes('-')) {
      const [min, max] = band.split('-').map(v => parseInt(v));
      if (salary >= min && salary <= max) return band;
    } else if (band.includes('+')) {
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) return band;
    } else if (band.includes('>')) {
      const min = parseInt(band.replace('>', ''));
      if (salary > min) return band;
    } else if (band.includes('>=')) {
      const min = parseInt(band.replace('>=', ''));
      if (salary >= min) return band;
    } else if (band.includes('<')) {
      const max = parseInt(band.replace('<', ''));
      if (salary < max) return band;
    } else if (band.includes('<=')) {
      const max = parseInt(band.replace('<=', ''));
      if (salary <= max) return band;
    }
  }
  // Return the last band as default
  const keys = Object.keys(bands);
  return keys[keys.length - 1];
};

// Test Data
const applicant = {
  monthlyIncome: 44000,
  existingEMI: 0,
  employmentType: 'government',
  tenure: 6, // years
  interestRate: 11, // % p.a.
  category: 'GOVT' // Government employee
};

console.log('\n=================================================');
console.log('LOAN ELIGIBILITY CALCULATION');
console.log('=================================================');
console.log(`Applicant: Government Employee`);
console.log(`Monthly Salary: ₹${applicant.monthlyIncome.toLocaleString()}`);
console.log(`Existing EMI: ₹${applicant.existingEMI.toLocaleString()}`);
console.log(`Loan Tenure: ${applicant.tenure} years (${applicant.tenure * 12} months)`);
console.log(`Interest Rate: ${applicant.interestRate}% p.a.`);
console.log('=================================================\n');

const results = [];

// 1. KOTAK MAHINDRA BANK
console.log('1. KOTAK MAHINDRA BANK');
console.log('-------------------');
try {
  const salary = applicant.monthlyIncome;
  const category = 'GOVT';
  
  // Get FOIR percentage
  const foirBand = getSalaryBand(salary, kotakConfig.foirTable);
  const foirPercentage = kotakConfig.foirTable[foirBand][category];
  const foirCap = salary * foirPercentage;
  const availableEMI = foirCap - applicant.existingEMI;
  
  // Get Multiplier
  let multiplierBand = getSalaryBand(salary, kotakConfig.multiplierTable);
  const multiplier = kotakConfig.multiplierTable[multiplierBand][category];
  
  // Calculate loan amounts
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, applicant.interestRate, applicant.tenure);
  const multiplierLoanAmount = salary * multiplier;
  const finalLoanAmount = Math.min(foirLoanAmount, multiplierLoanAmount);
  const finalEMI = calculateEMI(finalLoanAmount, applicant.interestRate, applicant.tenure);
  
  console.log(`Category: ${category}`);
  console.log(`FOIR: ${(foirPercentage * 100).toFixed(0)}% (Band: ${foirBand})`);
  console.log(`Available EMI: ₹${availableEMI.toLocaleString()}`);
  console.log(`Multiplier: ${multiplier}x (Band: ${multiplierBand})`);
  console.log(`Max Loan (FOIR): ₹${foirLoanAmount.toLocaleString()}`);
  console.log(`Max Loan (Multiplier): ₹${multiplierLoanAmount.toLocaleString()}`);
  console.log(`✅ Final Loan Amount: ₹${finalLoanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${finalEMI.toLocaleString()}`);
  
  results.push({
    bank: 'Kotak Mahindra Bank',
    loanAmount: finalLoanAmount,
    emi: finalEMI,
    method: finalLoanAmount === foirLoanAmount ? 'FOIR Limited' : 'Multiplier Limited'
  });
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}
console.log('\n');

// 2. HDFC BANK
console.log('2. HDFC BANK');
console.log('-------------------');
try {
  const salary = applicant.monthlyIncome;
  const category = 'Govt';
  
  // Check minimum salary
  if (salary >= hdfcConfig.minSalary[category]) {
    // Get FOIR percentage
    const foirBand = getSalaryBand(salary, hdfcConfig.foirTable);
    const foirPercentage = hdfcConfig.foirTable[foirBand][category];
    const foirCap = salary * foirPercentage;
    const availableEMI = foirCap - applicant.existingEMI;
    
    // Calculate loan amount
    const loanAmount = calculatePrincipalFromEMI(availableEMI, applicant.interestRate, applicant.tenure);
    const finalEMI = calculateEMI(loanAmount, applicant.interestRate, applicant.tenure);
    
    console.log(`Category: ${category}`);
    console.log(`FOIR: ${(foirPercentage * 100).toFixed(0)}% (Band: ${foirBand})`);
    console.log(`Available EMI: ₹${availableEMI.toLocaleString()}`);
    console.log(`✅ Final Loan Amount: ₹${loanAmount.toLocaleString()}`);
    console.log(`Monthly EMI: ₹${finalEMI.toLocaleString()}`);
    
    results.push({
      bank: 'HDFC Bank',
      loanAmount: loanAmount,
      emi: finalEMI,
      method: 'FOIR Only'
    });
  } else {
    console.log(`❌ Not Eligible: Minimum salary required is ₹${hdfcConfig.minSalary[category].toLocaleString()}`);
  }
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}
console.log('\n');

// 3. ICICI BANK
console.log('3. ICICI BANK');
console.log('-------------------');
try {
  const salary = applicant.monthlyIncome;
  const category = 'GOVT';
  
  // Check minimum salary
  if (salary >= iciciConfig.minSalary[category]) {
    // Get FOIR percentage
    const foirBand = getSalaryBand(salary, iciciConfig.foirTable);
    const foirPercentage = iciciConfig.foirTable[foirBand];
    const foirCap = salary * foirPercentage;
    const availableEMI = foirCap - applicant.existingEMI;
    
    // Calculate loan amount
    const loanAmount = calculatePrincipalFromEMI(availableEMI, applicant.interestRate, applicant.tenure);
    const finalEMI = calculateEMI(loanAmount, applicant.interestRate, applicant.tenure);
    
    console.log(`Category: ${category}`);
    console.log(`FOIR: ${(foirPercentage * 100).toFixed(0)}% (Band: ${foirBand})`);
    console.log(`Available EMI: ₹${availableEMI.toLocaleString()}`);
    console.log(`✅ Final Loan Amount: ₹${loanAmount.toLocaleString()}`);
    console.log(`Monthly EMI: ₹${finalEMI.toLocaleString()}`);
    
    results.push({
      bank: 'ICICI Bank',
      loanAmount: loanAmount,
      emi: finalEMI,
      method: 'FOIR Only'
    });
  } else {
    console.log(`❌ Not Eligible: Minimum salary required is ₹${iciciConfig.minSalary[category].toLocaleString()}`);
  }
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}
console.log('\n');

// 4. BANDHAN BANK
console.log('4. BANDHAN BANK');
console.log('-------------------');
try {
  const salary = applicant.monthlyIncome;
  
  // Get FOIR percentage (no category for Bandhan)
  const foirBand = getSalaryBand(salary, bandhanConfig.foirTable);
  const foirPercentage = bandhanConfig.foirTable[foirBand];
  const foirCap = salary * foirPercentage;
  const availableEMI = foirCap - applicant.existingEMI;
  
  // Calculate loan amount
  const loanAmount = calculatePrincipalFromEMI(availableEMI, applicant.interestRate, applicant.tenure);
  const finalEMI = calculateEMI(loanAmount, applicant.interestRate, applicant.tenure);
  
  console.log(`FOIR: ${(foirPercentage * 100).toFixed(0)}% (Band: ${foirBand})`);
  console.log(`Available EMI: ₹${availableEMI.toLocaleString()}`);
  console.log(`✅ Final Loan Amount: ₹${loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${finalEMI.toLocaleString()}`);
  
  results.push({
    bank: 'Bandhan Bank',
    loanAmount: loanAmount,
    emi: finalEMI,
    method: 'FOIR Only'
  });
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}
console.log('\n');

// 5. CHOLAMANDALAM FINANCE
console.log('5. CHOLAMANDALAM FINANCE');
console.log('-------------------');
try {
  const salary = applicant.monthlyIncome;
  const category = 'GOVT';
  
  // Get FOIR percentage
  const foirBand = getSalaryBand(salary, cholaConfig.foirTable);
  const foirPercentage = cholaConfig.foirTable[foirBand][category];
  const foirCap = salary * foirPercentage;
  const availableEMI = foirCap - applicant.existingEMI;
  
  // Calculate loan amount
  const loanAmount = calculatePrincipalFromEMI(availableEMI, applicant.interestRate, applicant.tenure);
  const finalEMI = calculateEMI(loanAmount, applicant.interestRate, applicant.tenure);
  
  console.log(`Category: ${category}`);
  console.log(`FOIR: ${(foirPercentage * 100).toFixed(0)}% (Band: ${foirBand})`);
  console.log(`Available EMI: ₹${availableEMI.toLocaleString()}`);
  console.log(`✅ Final Loan Amount: ₹${loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${finalEMI.toLocaleString()}`);
  
  results.push({
    bank: 'Cholamandalam Finance',
    loanAmount: loanAmount,
    emi: finalEMI,
    method: 'FOIR Only'
  });
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}
console.log('\n');

// 6. TATA CAPITAL
console.log('6. TATA CAPITAL');
console.log('-------------------');
try {
  const salary = applicant.monthlyIncome;
  const category = 'GOVT';
  
  // Get FOIR percentage (salary-based only)
  const foirBand = getSalaryBand(salary, tataConfig.foirTable);
  const foirPercentage = tataConfig.foirTable[foirBand];
  const foirCap = salary * foirPercentage;
  const availableEMI = foirCap - applicant.existingEMI;
  
  // Get Multiplier
  const multiplierBand = getSalaryBand(salary, tataConfig.multiplierTable);
  const multiplier = tataConfig.multiplierTable[multiplierBand][category];
  
  // Calculate loan amounts
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, applicant.interestRate, applicant.tenure);
  const multiplierLoanAmount = salary * multiplier;
  const finalLoanAmount = Math.min(foirLoanAmount, multiplierLoanAmount);
  const finalEMI = calculateEMI(finalLoanAmount, applicant.interestRate, applicant.tenure);
  
  console.log(`Category: ${category}`);
  console.log(`FOIR: ${(foirPercentage * 100).toFixed(0)}% (Band: ${foirBand})`);
  console.log(`Available EMI: ₹${availableEMI.toLocaleString()}`);
  console.log(`Multiplier: ${multiplier}x (Band: ${multiplierBand})`);
  console.log(`Max Loan (FOIR): ₹${foirLoanAmount.toLocaleString()}`);
  console.log(`Max Loan (Multiplier): ₹${multiplierLoanAmount.toLocaleString()}`);
  console.log(`✅ Final Loan Amount: ₹${finalLoanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${finalEMI.toLocaleString()}`);
  
  results.push({
    bank: 'Tata Capital',
    loanAmount: finalLoanAmount,
    emi: finalEMI,
    method: finalLoanAmount === foirLoanAmount ? 'FOIR Limited' : 'Multiplier Limited'
  });
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}
console.log('\n');

// COMPARISON TABLE
console.log('=================================================');
console.log('COMPARISON TABLE - ALL BANKS');
console.log('=================================================\n');

// Sort by loan amount (descending)
results.sort((a, b) => b.loanAmount - a.loanAmount);

console.log('Rank | Bank Name                  | Loan Amount    | Monthly EMI   | Method');
console.log('-----|----------------------------|----------------|---------------|------------------');
results.forEach((result, index) => {
  const rank = (index + 1).toString().padEnd(4);
  const bank = result.bank.padEnd(26);
  const loan = ('₹' + result.loanAmount.toLocaleString()).padEnd(14);
  const emi = ('₹' + result.emi.toLocaleString()).padEnd(13);
  console.log(`${rank} | ${bank} | ${loan} | ${emi} | ${result.method}`);
});

console.log('\n=================================================');
console.log(`BEST OFFER: ${results[0].bank}`);
console.log(`Maximum Loan Amount: ₹${results[0].loanAmount.toLocaleString()}`);
console.log(`Monthly EMI: ₹${results[0].emi.toLocaleString()}`);
console.log('=================================================\n');

// Export for use in other modules
export { applicant, results };
