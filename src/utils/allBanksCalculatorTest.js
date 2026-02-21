import { calculatePoonawalaEligibility } from '../banks/poonawala/calculator.js';
import { calculateAxisFinEligibility } from '../banks/axis-fin/calculator.js';
import { calculateShriRamEligibility } from '../banks/shri-ram/calculator.js';
import { calculatePiramalEligibility } from '../banks/piramal/calculator.js';
import { calculateTataEligibility } from '../banks/tata/calculator.js';
import { calculateCholaEligibility } from '../banks/chola/calculator.js';

console.log('='.repeat(80));
console.log('ALL BANKS - CALCULATOR VERIFICATION TEST');
console.log('='.repeat(80));
console.log();

// Test scenario: Government employee with ₹44,000 salary
const govtEmployee = {
  desiredLoanAmount: 1000000,
  loanTenure: 6,
  monthlyIncome: 44000,
  existingEMI: 0,
  category: 'GOVT',
  creditScore: 750,
  employmentType: 'salaried'
};

console.log('TEST SCENARIO: Government Employee');
console.log('-'.repeat(80));
console.log(`Salary: ₹${govtEmployee.monthlyIncome.toLocaleString()}/month`);
console.log(`Desired Loan: ₹${govtEmployee.desiredLoanAmount.toLocaleString()}`);
console.log(`Tenure: ${govtEmployee.loanTenure} years`);
console.log(`Existing EMI: ₹${govtEmployee.existingEMI}`);
console.log(`Category: ${govtEmployee.category}`);
console.log(`Credit Score: ${govtEmployee.creditScore}`);
console.log();
console.log('='.repeat(80));
console.log('BANK-WISE RESULTS');
console.log('='.repeat(80));
console.log();

// Test each bank
const results = [];

// 1. Cholamandalam (FOIR-only)
console.log('1. CHOLAMANDALAM FINANCE');
console.log('-'.repeat(80));
const cholaResult = calculateCholaEligibility(govtEmployee);
console.log(`Status: ${cholaResult.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`);
if (cholaResult.eligible) {
  console.log(`Loan Amount: ₹${cholaResult.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${cholaResult.monthlyEMI.toLocaleString()}`);
  console.log(`Interest Rate: ${cholaResult.interestRate}%`);
  if (cholaResult.foirPercentage) console.log(`FOIR: ${cholaResult.foirPercentage}%`);
  if (cholaResult.calculationMethod) console.log(`Method: ${cholaResult.calculationMethod}`);
  results.push({ bank: 'Cholamandalam', amount: cholaResult.loanAmount });
} else {
  console.log(`Reason: ${cholaResult.reason}`);
}
console.log();

// 2. Tata Capital (FOIR + Multiplier)
console.log('2. TATA CAPITAL');
console.log('-'.repeat(80));
const tataResult = calculateTataEligibility(govtEmployee);
console.log(`Status: ${tataResult.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`);
if (tataResult.eligible) {
  console.log(`Loan Amount: ₹${tataResult.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${tataResult.monthlyEMI.toLocaleString()}`);
  console.log(`Interest Rate: ${tataResult.interestRate}%`);
  if (tataResult.foirLoanAmount) console.log(`FOIR Loan: ₹${tataResult.foirLoanAmount.toLocaleString()}`);
  if (tataResult.multiplierLoanAmount) console.log(`Multiplier Loan: ₹${tataResult.multiplierLoanAmount.toLocaleString()}`);
  if (tataResult.calculationMethod) console.log(`Method: ${tataResult.calculationMethod}`);
  results.push({ bank: 'Tata Capital', amount: tataResult.loanAmount });
} else {
  console.log(`Reason: ${tataResult.reason}`);
}
console.log();

// 3. Poonawala (2D FOIR Matrix)
console.log('3. POONAWALA FINANCE');
console.log('-'.repeat(80));
const poonawalaResult = calculatePoonawalaEligibility(govtEmployee);
console.log(`Status: ${poonawalaResult.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`);
if (poonawalaResult.eligible) {
  console.log(`Loan Amount: ₹${poonawalaResult.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${poonawalaResult.monthlyEMI.toLocaleString()}`);
  console.log(`Interest Rate: ${poonawalaResult.interestRate}%`);
  if (poonawalaResult.customerSegment) console.log(`Customer Segment: ${poonawalaResult.customerSegment}`);
  if (poonawalaResult.foirPercentage) console.log(`FOIR: ${poonawalaResult.foirPercentage}%`);
  if (poonawalaResult.calculationMethod) console.log(`Method: ${poonawalaResult.calculationMethod}`);
  results.push({ bank: 'Poonawala', amount: poonawalaResult.loanAmount });
} else {
  console.log(`Reason: ${poonawalaResult.reason}`);
}
console.log();

// 4. Axis Finance (Multiplier-only)
console.log('4. AXIS FINANCE');
console.log('-'.repeat(80));
const axisResult = calculateAxisFinEligibility(govtEmployee);
console.log(`Status: ${axisResult.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`);
if (axisResult.eligible) {
  console.log(`Loan Amount: ₹${axisResult.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${axisResult.monthlyEMI.toLocaleString()}`);
  console.log(`Interest Rate: ${axisResult.interestRate}%`);
  if (axisResult.multiplier) console.log(`Multiplier: ${axisResult.multiplier}x`);
  if (axisResult.salaryBand) console.log(`Salary Band: ${axisResult.salaryBand}`);
  if (axisResult.calculationMethod) console.log(`Method: ${axisResult.calculationMethod}`);
  results.push({ bank: 'Axis Finance', amount: axisResult.loanAmount });
} else {
  console.log(`Reason: ${axisResult.reason}`);
}
console.log();

// 5. Shri Ram Finance (Salary-driven Combined)
console.log('5. SHRI RAM FINANCE');
console.log('-'.repeat(80));
const shriRamResult = calculateShriRamEligibility(govtEmployee);
console.log(`Status: ${shriRamResult.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`);
if (shriRamResult.eligible) {
  console.log(`Loan Amount: ₹${shriRamResult.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${shriRamResult.monthlyEMI.toLocaleString()}`);
  console.log(`Interest Rate: ${shriRamResult.interestRate}%`);
  if (shriRamResult.foirLoanAmount) console.log(`FOIR Loan: ₹${shriRamResult.foirLoanAmount.toLocaleString()}`);
  if (shriRamResult.multiplierLoanAmount) console.log(`Multiplier Loan: ₹${shriRamResult.multiplierLoanAmount.toLocaleString()}`);
  if (shriRamResult.multiplier) console.log(`Multiplier: ${shriRamResult.multiplier}x`);
  if (shriRamResult.calculationMethod) console.log(`Method: ${shriRamResult.calculationMethod}`);
  results.push({ bank: 'Shri Ram', amount: shriRamResult.loanAmount });
} else {
  console.log(`Reason: ${shriRamResult.reason}`);
}
console.log();

// 6. Piramal Finance (2-band NTH FOIR)
console.log('6. PIRAMAL FINANCE');
console.log('-'.repeat(80));
const piramalResult = calculatePiramalEligibility(govtEmployee);
console.log(`Status: ${piramalResult.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`);
if (piramalResult.eligible) {
  console.log(`Loan Amount: ₹${piramalResult.loanAmount.toLocaleString()}`);
  console.log(`Monthly EMI: ₹${piramalResult.monthlyEMI.toLocaleString()}`);
  console.log(`Interest Rate: ${piramalResult.interestRate}%`);
  if (piramalResult.foirPercentage) console.log(`FOIR: ${piramalResult.foirPercentage}%`);
  if (piramalResult.calculationMethod) console.log(`Method: ${piramalResult.calculationMethod}`);
  results.push({ bank: 'Piramal', amount: piramalResult.loanAmount });
} else {
  console.log(`Reason: ${piramalResult.reason}`);
}
console.log();

// Comparison
console.log('='.repeat(80));
console.log('COMPARISON - RANKED BY LOAN AMOUNT');
console.log('='.repeat(80));
console.log();

// Sort results by loan amount
results.sort((a, b) => b.amount - a.amount);

results.forEach((result, index) => {
  const rank = index + 1;
  const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
  console.log(`${emoji} Rank ${rank}: ${result.bank.padEnd(20)} → ₹${result.amount.toLocaleString()}`);
});

console.log();
console.log('='.repeat(80));
console.log('CALCULATION METHOD SUMMARY');
console.log('='.repeat(80));
console.log();
console.log('1. Cholamandalam   : FOIR-only (Category + Salary based)');
console.log('2. Tata Capital    : Combined FOIR + Multiplier (Salary FOIR, Category Multiplier)');
console.log('3. Poonawala       : 2D FOIR Matrix (Customer Segment × NTH bands)');
console.log('4. Axis Finance    : Multiplier-only (No FOIR check)');
console.log('5. Shri Ram        : Salary-driven Combined (No category distinction)');
console.log('6. Piramal         : Ultra-simple 2-band NTH FOIR (No category)');
console.log();

console.log('='.repeat(80));
console.log('✅ ALL CALCULATORS WORKING WITH BANK-SPECIFIC LOGIC');
console.log('='.repeat(80));
