import { calculateKotakEligibility } from '../banks/kotak/calculator.js';
import { calculateHdfcEligibility } from '../banks/hdfc/calculator.js';
import { calculateIciciEligibility } from '../banks/icici/calculator.js';
import { calculateBandhanEligibility } from '../banks/bandhan/calculator.js';
import { calculateCholaEligibility } from '../banks/chola/calculator.js';
import { calculateTataEligibility } from '../banks/tata/calculator.js';
import { calculatePoonawalaEligibility } from '../banks/poonawala/calculator.js';
import { calculateAxisFinEligibility } from '../banks/axis-fin/calculator.js';
import { calculateIndusindEligibility } from '../banks/indusind/calculator.js';
import { calculateIdfcEligibility } from '../banks/idfc/calculator.js';
import { calculateShriRamEligibility } from '../banks/shri-ram/calculator.js';
import { calculatePiramalEligibility } from '../banks/piramal/calculator.js';

console.log('═'.repeat(90));
console.log('COMPREHENSIVE LOAN ELIGIBILITY TEST - CATEGORY B HIGH INCOME EMPLOYEE');
console.log('═'.repeat(90));
console.log();

// Test Parameters
const testData = {
  monthlyIncome: 125000,
  category: 'B',
  loanTenure: 6,
  interestRate: 11,
  existingEMI: 0,
  creditScore: 750,
  employmentType: 'salaried',
  desiredLoanAmount: 5000000 // High desired amount to see maximum limits
};

console.log('TEST PARAMETERS:');
console.log('─'.repeat(90));
console.log(`Monthly Income:       ₹${testData.monthlyIncome.toLocaleString()}`);
console.log(`Category:             ${testData.category}`);
console.log(`Loan Tenure:          ${testData.loanTenure} years`);
console.log(`Interest Rate:        ${testData.interestRate}%`);
console.log(`Existing EMI:         ₹${testData.existingEMI.toLocaleString()}`);
console.log(`Credit Score:         ${testData.creditScore}`);
console.log(`Desired Loan:         ₹${testData.desiredLoanAmount.toLocaleString()}`);
console.log();

console.log('═'.repeat(90));
console.log('BANK-BY-BANK DETAILED ANALYSIS');
console.log('═'.repeat(90));
console.log();

const results = [];

// Bank 1: Kotak Mahindra Bank
console.log('1️⃣  KOTAK MAHINDRA BANK');
console.log('─'.repeat(90));
console.log('Method: Combined (FOIR + Multiplier) - Takes MINIMUM of both');
console.log();

const kotakResult = calculateKotakEligibility({
  ...testData,
  companyName: 'Tech Company' // Needed for Kotak
});

console.log('Category B Rules:');
console.log('  Multiplier Table:');
console.log('    • ₹25K-35K: 15x');
console.log('    • ₹35K-50K: 18x');
console.log('    • ₹50K-75K: 24x');
console.log('    • ₹75K+: 26x ← APPLIES HERE');
console.log();
console.log('  FOIR Table:');
console.log('    • ₹25K-35K: 60%');
console.log('    • ₹35K-50K: 60%');
console.log('    • ₹50K+: 70% ← APPLIES HERE');
console.log();

if (kotakResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   Multiplier Calculation: ₹${testData.monthlyIncome.toLocaleString()} × 26 = ₹${(testData.monthlyIncome * 26).toLocaleString()}`);
  console.log(`   FOIR Calculation: 70% FOIR on ₹${testData.monthlyIncome.toLocaleString()} = ₹${(testData.monthlyIncome * 0.7).toLocaleString()} available EMI`);
  console.log(`   → Loan Amount: ₹${kotakResult.loanAmount.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${kotakResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${kotakResult.interestRate}%`);
  results.push({ bank: 'Kotak Mahindra', amount: kotakResult.loanAmount, method: 'Combined', multiplier: '26x', foir: '70%' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${kotakResult.reason}`);
}
console.log();

// Bank 2: HDFC Bank
console.log('2️⃣  HDFC BANK');
console.log('─'.repeat(90));
console.log('Method: FOIR-Only (No Multiplier)');
console.log();

const hdfcResult = calculateHdfcEligibility(testData);

console.log('Category B Rules:');
console.log('  FOIR Table:');
console.log('    • ₹25K-50K: 55%');
console.log('    • ₹50K-75K: 65%');
console.log('    • ₹75K-100K: 70%');
console.log('    • >₹100K: 70% ← APPLIES HERE');
console.log('  Minimum Salary: ₹25,000');
console.log();

if (hdfcResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   FOIR: 70% on ₹${testData.monthlyIncome.toLocaleString()} = ₹${(testData.monthlyIncome * 0.7).toLocaleString()} available EMI`);
  console.log(`   → Loan Amount: ₹${hdfcResult.loanAmount.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${hdfcResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${hdfcResult.interestRate}%`);
  results.push({ bank: 'HDFC Bank', amount: hdfcResult.loanAmount, method: 'FOIR-Only', foir: '70%' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${hdfcResult.reason}`);
}
console.log();

// Bank 3: ICICI Bank
console.log('3️⃣  ICICI BANK');
console.log('─'.repeat(90));
console.log('Method: FOIR-Only (Simple 2-tier)');
console.log();

const iciciResult = calculateIciciEligibility(testData);

console.log('Category B Rules:');
console.log('  FOIR Table:');
console.log('    • <₹50K: 55%');
console.log('    • ≥₹50K: 65% ← APPLIES HERE');
console.log('  Minimum Salary: ₹30,000');
console.log();

if (iciciResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   FOIR: 65% on ₹${testData.monthlyIncome.toLocaleString()} = ₹${(testData.monthlyIncome * 0.65).toLocaleString()} available EMI`);
  console.log(`   → Loan Amount: ₹${iciciResult.loanAmount.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${iciciResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${iciciResult.interestRate}%`);
  results.push({ bank: 'ICICI Bank', amount: iciciResult.loanAmount, method: 'FOIR-Only', foir: '65%' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${iciciResult.reason}`);
}
console.log();

// Bank 4: Bandhan Bank
console.log('4️⃣  BANDHAN BANK');
console.log('─'.repeat(90));
console.log('Method: FOIR-Only (2-tier based on income)');
console.log();

const bandhanResult = calculateBandhanEligibility({
  ...testData,
  region: 'urban' // Assuming urban region
});

console.log('Rules (No category distinction):');
console.log('  FOIR Table:');
console.log('    • <₹75K: 60%');
console.log('    • ≥₹75K: 70% ← APPLIES HERE');
console.log('  Minimum Salary: ₹50,000 (Urban)');
console.log();

if (bandhanResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   FOIR: 70% on ₹${testData.monthlyIncome.toLocaleString()} = ₹${(testData.monthlyIncome * 0.7).toLocaleString()} available EMI`);
  console.log(`   → Loan Amount: ₹${bandhanResult.loanAmount.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${bandhanResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${bandhanResult.interestRate}%`);
  results.push({ bank: 'Bandhan Bank', amount: bandhanResult.loanAmount, method: 'FOIR-Only', foir: '70%' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${bandhanResult.reason}`);
}
console.log();

// Bank 5: Cholamandalam Finance
console.log('5️⃣  CHOLAMANDALAM FINANCE');
console.log('─'.repeat(90));
console.log('Method: FOIR-Only (Category-based)');
console.log();

const cholaResult = calculateCholaEligibility(testData);

console.log('Category B Rules:');
console.log('  FOIR Table:');
console.log('    • ₹20K-30K: 65%');
console.log('    • ₹30K-50K: 65%');
console.log('    • ₹50K-75K: 70%');
console.log('    • ₹75K+: 70% ← APPLIES HERE');
console.log('  Minimum Salary: ₹25,000');
console.log();

if (cholaResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   FOIR: 70% on ₹${testData.monthlyIncome.toLocaleString()} = ₹${(testData.monthlyIncome * 0.7).toLocaleString()} available EMI`);
  console.log(`   → Loan Amount: ₹${cholaResult.loanAmount.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${cholaResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${cholaResult.interestRate}%`);
  results.push({ bank: 'Cholamandalam', amount: cholaResult.loanAmount, method: 'FOIR-Only', foir: '70%' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${cholaResult.reason}`);
}
console.log();

// Bank 6: Tata Capital
console.log('6️⃣  TATA CAPITAL');
console.log('─'.repeat(90));
console.log('Method: Combined (FOIR + Multiplier) - Takes MINIMUM');
console.log();

const tataResult = calculateTataEligibility(testData);

console.log('Category B Rules:');
console.log('  FOIR Table (Salary-based, no category):');
console.log('    • ₹25K-50K: 60%');
console.log('    • ₹50K-75K: 65%');
console.log('    • ₹75K+: 75% ← APPLIES HERE');
console.log();
console.log('  Multiplier Table:');
console.log('    • ₹25K-50K: 19x');
console.log('    • ₹50K-75K: 22x');
console.log('    • ₹75K+: 25x ← APPLIES HERE');
console.log('  Minimum Salary: ₹25,000');
console.log();

if (tataResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   Multiplier: ₹${testData.monthlyIncome.toLocaleString()} × 25 = ₹${(testData.monthlyIncome * 25).toLocaleString()}`);
  console.log(`   FOIR: 75% on ₹${testData.monthlyIncome.toLocaleString()} = ₹${(testData.monthlyIncome * 0.75).toLocaleString()} available EMI`);
  if (tataResult.foirLoanAmount) console.log(`   FOIR Loan: ₹${tataResult.foirLoanAmount.toLocaleString()}`);
  if (tataResult.multiplierLoanAmount) console.log(`   Multiplier Loan: ₹${tataResult.multiplierLoanAmount.toLocaleString()}`);
  console.log(`   → Final Loan (MIN): ₹${tataResult.loanAmount.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${tataResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${tataResult.interestRate}%`);
  results.push({ bank: 'Tata Capital', amount: tataResult.loanAmount, method: 'Combined', multiplier: '25x', foir: '75%' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${tataResult.reason}`);
}
console.log();

// Bank 7: Poonawala Finance
console.log('7️⃣  POONAWALA FINANCE');
console.log('─'.repeat(90));
console.log('Method: 2D FOIR Matrix (Customer Segment × NTH Bands)');
console.log();

const poonawalaResult = calculatePoonawalaEligibility(testData);

console.log('Category B → Mapped to Segment "A" in Poonawala');
console.log('  NTH Salary: ₹1,25,000 → Falls in "HNI" band (₹1.5L-2.5L is wrong, ₹75K-150K is AFFLUENT)');
console.log('  Actually: ₹1,25,000 falls in AFFLUENT band (₹75K-150K)');
console.log();
console.log('  Segment A + AFFLUENT (₹75K-150K): 70% FOIR');
console.log('  Minimum NTH: ₹30,000');
console.log();

if (poonawalaResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   Customer Segment: ${poonawalaResult.customerSegment}`);
  console.log(`   FOIR: ${poonawalaResult.foirPercentage}% on ₹${testData.monthlyIncome.toLocaleString()}`);
  console.log(`   → Loan Amount: ₹${poonawalaResult.loanAmount.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${poonawalaResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${poonawalaResult.interestRate}%`);
  results.push({ bank: 'Poonawala', amount: poonawalaResult.loanAmount, method: '2D FOIR Matrix', foir: poonawalaResult.foirPercentage + '%' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${poonawalaResult.reason}`);
}
console.log();

// Bank 8: Axis Finance
console.log('8️⃣  AXIS FINANCE');
console.log('─'.repeat(90));
console.log('Method: Multiplier-Only (NO FOIR!)');
console.log();

const axisResult = calculateAxisFinEligibility(testData);

console.log('Category B Rules:');
console.log('  Multiplier Table:');
console.log('    • ₹25K-50K: 24x');
console.log('    • ₹50K-75K: 26x');
console.log('    • ₹75K+: 28x ← APPLIES HERE');
console.log('  Minimum Salary: ₹25,000');
console.log('  NO FOIR CHECK - Pure multiplier!');
console.log();

if (axisResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   Multiplier: ₹${testData.monthlyIncome.toLocaleString()} × 28 = ₹${(testData.monthlyIncome * 28).toLocaleString()}`);
  console.log(`   → Loan Amount: ₹${axisResult.loanAmount.toLocaleString()}`);
  console.log(`   → Max by Multiplier: ₹${axisResult.maxLoanByMultiplier.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${axisResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${axisResult.interestRate}%`);
  results.push({ bank: 'Axis Finance', amount: axisResult.loanAmount, method: 'Multiplier-Only', multiplier: '28x' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${axisResult.reason}`);
}
console.log();

// Bank 9: IndusInd Bank
console.log('9️⃣  INDUSIND BANK');
console.log('─'.repeat(90));
console.log('Method: Multiplier-Only (NO FOIR!)');
console.log();

const indusindResult = calculateIndusindEligibility(testData);

console.log('Category B Rules:');
console.log('  ⚠️  SPECIAL: Category B is CAPPED at 25x!');
console.log('  Multiplier Table:');
console.log('    • ₹25K-75K: 21x');
console.log('    • ₹75K+: 25x ← APPLIES HERE (NO 30x tier for B!)');
console.log('  Minimum Salary: ₹25,000');
console.log();

if (indusindResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   Multiplier: ₹${testData.monthlyIncome.toLocaleString()} × 25 = ₹${(testData.monthlyIncome * 25).toLocaleString()}`);
  console.log(`   ⚠️  NOTE: Category B capped at 25x (A/A+/GOVT would get 30x at >₹125K)`);
  console.log(`   → Loan Amount: ₹${indusindResult.loanAmount.toLocaleString()}`);
  console.log(`   → Max by Multiplier: ₹${indusindResult.maxLoanByMultiplier.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${indusindResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${indusindResult.interestRate}%`);
  results.push({ bank: 'IndusInd Bank', amount: indusindResult.loanAmount, method: 'Multiplier-Only', multiplier: '25x (capped)' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${indusindResult.reason}`);
}
console.log();

// Bank 10: IDFC Bank
console.log('🔟 IDFC BANK');
console.log('─'.repeat(90));
console.log('Method: Multiplier-Only (NO FOIR!)');
console.log();

const idfcResult = calculateIdfcEligibility(testData);

console.log('Category B Rules:');
console.log('  Multiplier Table:');
console.log('    • <₹50K: 20x');
console.log('    • ₹50K-75K: 23x');
console.log('    • >₹75K: 26x ← APPLIES HERE');
console.log('  Minimum Salary: ₹20,000');
console.log();

if (idfcResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   Multiplier: ₹${testData.monthlyIncome.toLocaleString()} × 26 = ₹${(testData.monthlyIncome * 26).toLocaleString()}`);
  console.log(`   → Loan Amount: ₹${idfcResult.loanAmount.toLocaleString()}`);
  console.log(`   → Max by Multiplier: ₹${idfcResult.maxLoanByMultiplier.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${idfcResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${idfcResult.interestRate}%`);
  results.push({ bank: 'IDFC Bank', amount: idfcResult.loanAmount, method: 'Multiplier-Only', multiplier: '26x' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${idfcResult.reason}`);
}
console.log();

// Bank 11: Shri Ram Finance
console.log('1️⃣1️⃣  SHRI RAM FINANCE');
console.log('─'.repeat(90));
console.log('Method: Combined (Income-Driven, NO category distinction!)');
console.log();

const shriRamResult = calculateShriRamEligibility(testData);

console.log('Rules (No category distinction):');
console.log('  Salary Band: ₹75K+ applies');
console.log('    • Multiplier: 22x');
console.log('    • FOIR: 70%');
console.log('  Minimum Salary: ₹25,000 (same for all!)');
console.log();

if (shriRamResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   Multiplier: ₹${testData.monthlyIncome.toLocaleString()} × 22 = ₹${(testData.monthlyIncome * 22).toLocaleString()}`);
  console.log(`   FOIR: 70% on ₹${testData.monthlyIncome.toLocaleString()}`);
  if (shriRamResult.foirLoanAmount) console.log(`   FOIR Loan: ₹${shriRamResult.foirLoanAmount.toLocaleString()}`);
  if (shriRamResult.multiplierLoanAmount) console.log(`   Multiplier Loan: ₹${shriRamResult.multiplierLoanAmount.toLocaleString()}`);
  console.log(`   → Final Loan (MIN): ₹${shriRamResult.loanAmount.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${shriRamResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${shriRamResult.interestRate}%`);
  results.push({ bank: 'Shri Ram', amount: shriRamResult.loanAmount, method: 'Combined (Income)', multiplier: '22x', foir: '70%' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${shriRamResult.reason}`);
}
console.log();

// Bank 12: Piramal Finance
console.log('1️⃣2️⃣  PIRAMAL FINANCE');
console.log('─'.repeat(90));
console.log('Method: FOIR-Only (Ultra-Simple 2-Band NTH)');
console.log();

const piramalResult = calculatePiramalEligibility(testData);

console.log('Rules (No category distinction):');
console.log('  NTH Bands:');
console.log('    • ₹20K-35K: 65%');
console.log('    • ₹35K+: 70% ← APPLIES HERE');
console.log('  Minimum NTH: ₹20,000');
console.log();

if (piramalResult.eligible) {
  console.log(`✅ ELIGIBLE`);
  console.log(`   FOIR: 70% on ₹${testData.monthlyIncome.toLocaleString()} = ₹${(testData.monthlyIncome * 0.7).toLocaleString()} available EMI`);
  console.log(`   → Loan Amount: ₹${piramalResult.loanAmount.toLocaleString()}`);
  console.log(`   → Monthly EMI: ₹${piramalResult.monthlyEMI.toLocaleString()}`);
  console.log(`   → Interest Rate: ${piramalResult.interestRate}%`);
  results.push({ bank: 'Piramal', amount: piramalResult.loanAmount, method: 'FOIR-Only', foir: '70%' });
} else {
  console.log(`❌ NOT ELIGIBLE: ${piramalResult.reason}`);
}
console.log();

// Summary
console.log('═'.repeat(90));
console.log('SUMMARY - ALL BANKS COMPARISON');
console.log('═'.repeat(90));
console.log();

// Sort by loan amount
results.sort((a, b) => b.amount - a.amount);

console.log('RANKED BY LOAN AMOUNT:');
console.log('─'.repeat(90));
results.forEach((r, idx) => {
  const emoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
  const methodInfo = r.multiplier ? `${r.multiplier}` : '';
  const foirInfo = r.foir ? ` | FOIR: ${r.foir}` : '';
  console.log(`${emoji} ${(idx + 1).toString().padStart(2)}. ${r.bank.padEnd(20)} → ₹${r.amount.toLocaleString().padEnd(12)} | ${r.method}${methodInfo ? ' | ' + methodInfo : ''}${foirInfo}`);
});

console.log();
console.log('═'.repeat(90));
console.log('KEY INSIGHTS FOR CATEGORY B AT ₹1,25,000 SALARY');
console.log('═'.repeat(90));
console.log();

const best = results[0];
const worst = results[results.length - 1];
const spread = best.amount - worst.amount;
const spreadPercent = ((spread / worst.amount) * 100).toFixed(1);

console.log('📊 STATISTICS:');
console.log(`   Best Offer:  ${best.bank.padEnd(20)} - ₹${best.amount.toLocaleString()}`);
console.log(`   Worst Offer: ${worst.bank.padEnd(20)} - ₹${worst.amount.toLocaleString()}`);
console.log(`   Spread: ₹${spread.toLocaleString()} (${spreadPercent}% difference)`);
console.log();

console.log('🎯 CATEGORY B SPECIFIC OBSERVATIONS:');
console.log();
console.log('1. MULTIPLIER BANKS:');
console.log('   • Axis Finance: 28x (Best multiplier-only for Cat B)');
console.log('   • IDFC Bank: 26x');
console.log('   • IndusInd Bank: 25x (CAPPED - A/A+ would get 30x at this income!)');
console.log();
console.log('2. FOIR BANKS:');
console.log('   • Most give 70% FOIR at ₹1.25L income');
console.log('   • ICICI gives only 65% (lower than others)');
console.log();
console.log('3. COMBINED BANKS:');
console.log('   • Take MINIMUM of FOIR and Multiplier calculations');
console.log('   • Usually limited by multiplier at high incomes');
console.log();
console.log('4. CATEGORY B DISADVANTAGES:');
console.log('   • IndusInd: Capped at 25x (A+ gets 30x = ₹6.25L more!)');
console.log('   • Kotak: Gets 26x (A gets 30x = ₹5L more!)');
console.log('   • Category A/A+ would get significantly better offers');
console.log();

console.log('═'.repeat(90));
console.log('✅ TEST COMPLETE - ALL 12 BANKS ANALYZED FOR CATEGORY B');
console.log('═'.repeat(90));
