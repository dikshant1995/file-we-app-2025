/**
 * Regular Loan Calculation (NOT BT)
 * 
 * Customer Profile:
 * - Salary: ₹55,000
 * - Category: B
 * - No existing loans (fresh loan application)
 */

import { kotakConfig } from '../banks/kotak/config.js';
import { hdfcConfig } from '../banks/hdfc/config.js';
import { iciciConfig } from '../banks/icici/config.js';
import { bandhanConfig } from '../banks/bandhan/config.js';
import { cholaConfig } from '../banks/chola/config.js';
import { tataConfig } from '../banks/tata/config.js';
import { poonawalaConfig } from '../banks/poonawala/config.js';
import { axisFinConfig } from '../banks/axis-fin/config.js';
import { indusindConfig } from '../banks/indusind/config.js';
import { idfcConfig } from '../banks/idfc/config.js';
import { shriRamConfig } from '../banks/shri-ram/config.js';
import { piramalConfig } from '../banks/piramal/config.js';

console.log('\n' + '='.repeat(100));
console.log('LOAN ELIGIBILITY CALCULATION - Salary ₹55,000, Category B');
console.log('='.repeat(100));

// Customer data
const salary = 55000;
const category = 'B';
const existingEMI = 0; // No existing loans
const tenureYears = 6;
const tenureMonths = tenureYears * 12; // 72 months
const FIXED_INTEREST_RATE = 11; // FIXED 11% for ALL banks

console.log('\n📊 CUSTOMER PROFILE:');
console.log('─'.repeat(100));
console.log(`   Monthly Salary: ₹${salary.toLocaleString()}`);
console.log(`   Category: ${category}`);
console.log(`   Existing EMI: ₹${existingEMI.toLocaleString()}`);
console.log(`   Desired Tenure: ${tenureYears} years (${tenureMonths} months)`);

// Helper function to calculate loan amount from EMI
function calculateLoanFromEMI(emi, annualRate, months) {
    const r = annualRate / 12 / 100;
    const n = months;
    const powTerm = Math.pow(1 + r, n);
    const loanAmount = emi * (powTerm - 1) / (r * powTerm);
    return Math.round(loanAmount);
}

// Helper function to calculate EMI from loan amount
function calculateEMI(principal, annualRate, months) {
    const r = annualRate / 12 / 100;
    const n = months;
    if (r === 0) return principal / n;
    const powTerm = Math.pow(1 + r, n);
    const emi = principal * r * powTerm / (powTerm - 1);
    return Math.round(emi);
}

// Bank configurations with FOIR/Multiplier for Category B
const banks = [
    {
        name: 'Kotak Mahindra Bank',
        config: kotakConfig,
        foirCatB: 0.70, // From foirTable['50000+']['B']
        multiplierCatB: 24, // From multiplierTable['50001-75000']['B']
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'BOTH'
    },
    {
        name: 'HDFC Bank',
        config: hdfcConfig,
        foirCatB: 0.65, // From foirTable['50001-75000']['B']
        multiplierCatB: 20, // From multiplierTable['50001-75000']['B']
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'BOTH'
    },
    {
        name: 'ICICI Bank',
        config: iciciConfig,
        foirCatB: 0.65, // From foirTable['>=50000']
        multiplierCatB: null,
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'FOIR'
    },
    {
        name: 'Bandhan Bank',
        config: bandhanConfig,
        foirCatB: 0.60, // From foirTable['<75000'] - Salary ₹55K falls under <75K
        multiplierCatB: null,
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'FOIR'
    },
    {
        name: 'Cholamandalam Finance',
        config: cholaConfig,
        foirCatB: 0.65, // From foirTable['50001-75000']['B']
        multiplierCatB: null,
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'FOIR'
    },
    {
        name: 'Tata Capital',
        config: tataConfig,
        foirCatB: 0.65, // From foirTable['50001-75000']
        multiplierCatB: 22, // From multiplierTable['50001-75000']['B']
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'BOTH'
    },
    {
        name: 'Poonawala Finance',
        config: poonawalaConfig,
        foirCatB: 0.60, // From foirMatrix['B']['PRIME'] for 50K-75K NTH
        multiplierCatB: null,
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'FOIR'
    },
    {
        name: 'Axis Finance',
        config: axisFinConfig,
        foirCatB: null,
        multiplierCatB: 26, // From multiplierTable['50001-75000']['B']
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'MULTIPLIER'
    },
    {
        name: 'IndusInd Bank',
        config: indusindConfig,
        foirCatB: null,
        multiplierCatB: 21, // From multiplierTable['B']['25000-75000']
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'MULTIPLIER'
    },
    {
        name: 'IDFC Bank',
        config: idfcConfig,
        foirCatB: null,
        multiplierCatB: 23, // From multiplierTable['B']['50001-75000']
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'MULTIPLIER'
    },
    {
        name: 'Shri Ram Finance',
        config: shriRamConfig,
        foirCatB: 0.65, // From salaryBandTable['50001-75000']['foir']
        multiplierCatB: 20, // From salaryBandTable['50001-75000']['multiplier']
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'BOTH'
    },
    {
        name: 'Piramal Finance',
        config: piramalConfig,
        foirCatB: 0.70, // From nthFoirTable['35001+']
        multiplierCatB: null,
        interestRate: FIXED_INTEREST_RATE, // 11% FIXED
        method: 'FOIR'
    }
];

console.log('\n' + '='.repeat(100));
console.log('DETAILED CALCULATIONS FOR EACH BANK');
console.log('='.repeat(100));

const results = [];

banks.forEach((bank, index) => {
    console.log(`\n${index + 1}. ${bank.name.toUpperCase()}`);
    console.log('─'.repeat(100));
    
    let maxLoanAmount = 0;
    let emiCapacity = 0;
    let calculatedEMI = 0;
    
    console.log(`   Calculation Method: ${bank.method}`);
    console.log(`   Interest Rate: ${bank.interestRate}%`);
    
    // Step 1: Calculate EMI Capacity or Loan from Multiplier
    if (bank.method === 'FOIR' || bank.method === 'BOTH') {
        emiCapacity = salary * bank.foirCatB;
        console.log(`\n   Step 1: Calculate EMI Capacity (Using FOIR)`);
        console.log(`      FOIR for Category B: ${(bank.foirCatB * 100).toFixed(0)}%`);
        console.log(`      EMI Capacity = Salary × FOIR`);
        console.log(`      EMI Capacity = ₹${salary.toLocaleString()} × ${bank.foirCatB}`);
        console.log(`      EMI Capacity = ₹${Math.round(emiCapacity).toLocaleString()}`);
        
        // Step 2: Calculate Max Loan from EMI
        const loanFromFOIR = calculateLoanFromEMI(emiCapacity, bank.interestRate, tenureMonths);
        console.log(`\n   Step 2: Calculate Max Loan Amount from EMI Capacity`);
        console.log(`      Using: EMI = ₹${Math.round(emiCapacity).toLocaleString()}, Tenure = ${tenureYears} years, Rate = ${bank.interestRate}%`);
        console.log(`      Loan Amount (FOIR Method) = ₹${loanFromFOIR.toLocaleString()}`);
        
        maxLoanAmount = loanFromFOIR;
    }
    
    if (bank.method === 'MULTIPLIER' || bank.method === 'BOTH') {
        console.log(`\n   ${bank.method === 'BOTH' ? 'Step 1 (Alternative):' : 'Step 1:'} Calculate Loan from Multiplier`);
        console.log(`      Multiplier for Category B: ${bank.multiplierCatB}x`);
        const loanFromMultiplier = salary * bank.multiplierCatB;
        console.log(`      Loan Amount = Salary × Multiplier`);
        console.log(`      Loan Amount = ₹${salary.toLocaleString()} × ${bank.multiplierCatB}`);
        console.log(`      Loan Amount (Multiplier Method) = ₹${loanFromMultiplier.toLocaleString()}`);
        
        if (bank.method === 'BOTH') {
            const loanFromFOIR = maxLoanAmount;
            maxLoanAmount = Math.min(loanFromFOIR, loanFromMultiplier);
            console.log(`\n   Step 2: Take Minimum of FOIR and Multiplier`);
            console.log(`      FOIR Method: ₹${loanFromFOIR.toLocaleString()}`);
            console.log(`      Multiplier Method: ₹${loanFromMultiplier.toLocaleString()}`);
            console.log(`      Final Loan = MIN(${loanFromFOIR.toLocaleString()}, ${loanFromMultiplier.toLocaleString()})`);
            console.log(`      Final Loan = ₹${maxLoanAmount.toLocaleString()}`);
        } else {
            maxLoanAmount = loanFromMultiplier;
        }
    }
    
    // Apply bank's max loan cap if exists
    if (bank.config.maxLoanAmount && maxLoanAmount > bank.config.maxLoanAmount) {
        console.log(`\n   Step 3: Apply Bank's Maximum Loan Cap`);
        console.log(`      Calculated Loan: ₹${maxLoanAmount.toLocaleString()}`);
        console.log(`      Bank's Max Cap: ₹${bank.config.maxLoanAmount.toLocaleString()}`);
        maxLoanAmount = bank.config.maxLoanAmount;
        console.log(`      Final Loan (After Cap): ₹${maxLoanAmount.toLocaleString()}`);
    }
    
    // Calculate EMI for the final loan amount
    calculatedEMI = calculateEMI(maxLoanAmount, bank.interestRate, tenureMonths);
    console.log(`\n   Final EMI Calculation:`);
    console.log(`      Loan Amount: ₹${maxLoanAmount.toLocaleString()}`);
    console.log(`      Interest Rate: ${bank.interestRate}%`);
    console.log(`      Tenure: ${tenureYears} years (${tenureMonths} months)`);
    console.log(`      Monthly EMI: ₹${calculatedEMI.toLocaleString()}`);
    
    // Calculate EMI to Salary ratio
    const emiToSalaryRatio = (calculatedEMI / salary) * 100;
    console.log(`      EMI to Salary Ratio: ${emiToSalaryRatio.toFixed(1)}%`);
    
    // Store result
    results.push({
        bank: bank.name,
        loanAmount: maxLoanAmount,
        emi: calculatedEMI,
        interestRate: bank.interestRate,
        foir: bank.foirCatB,
        multiplier: bank.multiplierCatB,
        method: bank.method,
        emiToSalaryRatio: emiToSalaryRatio
    });
});

// Summary Table
console.log('\n' + '='.repeat(100));
console.log('📊 SUMMARY COMPARISON TABLE - ALL BANKS');
console.log('='.repeat(100));

console.log('\n┌─────┬────────────────────────────┬──────────────┬────────────┬──────────┬──────────┬──────────┐');
console.log('│ No. │ Bank Name                  │ Loan Amount  │ Monthly EMI│ Interest │ EMI/Sal  │ Method   │');
console.log('├─────┼────────────────────────────┼──────────────┼────────────┼──────────┼──────────┼──────────┤');

// Sort by loan amount descending
results.sort((a, b) => b.loanAmount - a.loanAmount);

results.forEach((result, idx) => {
    const no = (idx + 1).toString().padStart(3);
    const bank = result.bank.padEnd(26);
    const loanAmount = `₹${(result.loanAmount / 100000).toFixed(2)}L`.padStart(12);
    const emi = `₹${(result.emi / 1000).toFixed(1)}K`.padStart(10);
    const interest = `${result.interestRate}%`.padStart(8);
    const emiRatio = `${result.emiToSalaryRatio.toFixed(1)}%`.padStart(8);
    const method = result.method.padEnd(8);
    
    console.log(`│ ${no} │ ${bank} │ ${loanAmount} │ ${emi} │ ${interest} │ ${emiRatio} │ ${method} │`);
});

console.log('└─────┴────────────────────────────┴──────────────┴────────────┴──────────┴──────────┴──────────┘');

// Top 3 Recommendations
console.log('\n' + '='.repeat(100));
console.log('🏆 TOP 3 RECOMMENDATIONS');
console.log('='.repeat(100));

console.log(`\n1️⃣  MAXIMUM LOAN AMOUNT: ${results[0].bank}`);
console.log(`    Loan Amount: ₹${results[0].loanAmount.toLocaleString()}`);
console.log(`    Monthly EMI: ₹${results[0].emi.toLocaleString()}`);
console.log(`    Interest Rate: ${results[0].interestRate}%`);

const lowestEMI = [...results].sort((a, b) => a.emi - b.emi)[0];
console.log(`\n2️⃣  LOWEST EMI: ${lowestEMI.bank}`);
console.log(`    Monthly EMI: ₹${lowestEMI.emi.toLocaleString()}`);
console.log(`    Loan Amount: ₹${lowestEMI.loanAmount.toLocaleString()}`);
console.log(`    Interest Rate: ${lowestEMI.interestRate}%`);

const lowestInterest = [...results].sort((a, b) => a.interestRate - b.interestRate)[0];
console.log(`\n3️⃣  LOWEST INTEREST RATE: ${lowestInterest.bank}`);
console.log(`    Interest Rate: ${lowestInterest.interestRate}%`);
console.log(`    Loan Amount: ₹${lowestInterest.loanAmount.toLocaleString()}`);
console.log(`    Monthly EMI: ₹${lowestInterest.emi.toLocaleString()}`);

// Summary
console.log('\n' + '='.repeat(100));
console.log('💡 SUMMARY');
console.log('='.repeat(100));

console.log('\n   CUSTOMER PROFILE:');
console.log(`      Salary: ₹${salary.toLocaleString()}`);
console.log(`      Category: ${category}`);
console.log(`      No existing EMI`);

console.log(`\n   BEST OPTION (${results[0].bank}):`);
console.log(`      ✅ Maximum Loan Amount: ₹${results[0].loanAmount.toLocaleString()}`);
console.log(`      ✅ Monthly EMI: ₹${results[0].emi.toLocaleString()}`);
console.log(`      ✅ Interest Rate: ${results[0].interestRate}%`);
console.log(`      ✅ Loan Tenure: ${tenureYears} years`);
console.log(`      ℹ️  EMI to Salary Ratio: ${results[0].emiToSalaryRatio.toFixed(1)}%`);

console.log('\n' + '='.repeat(100));
console.log('✅ CALCULATION COMPLETED');
console.log('='.repeat(100) + '\n');
