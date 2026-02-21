/**
 * BT Calculation Scenario - Detailed with Manual Calculations
 * 
 * Customer Profile:
 * - Salary: ₹77,000
 * - Category: B
 * - Active Personal Loans: 4
 * - Current Total EMI: ₹22,000
 * - Total POS: ₹8,00,000
 * - Interest Rate: 11% (FIXED - DO NOT CHANGE)
 * - Loan Tenure: 6 years (72 months)
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
console.log('BALANCE TRANSFER CALCULATION - DETAILED STEP-BY-STEP');
console.log('='.repeat(100));

// Customer data
const salary = 77000;
const category = 'B';
const currentTotalEMI = 22000;
const totalPOS = 800000;
const interestRate = 11; // FIXED 11%
const tenureYears = 6;
const tenureMonths = tenureYears * 12; // 72 months

console.log('\n📊 CUSTOMER PROFILE:');
console.log('─'.repeat(100));
console.log(`   Monthly Salary: ₹${salary.toLocaleString()}`);
console.log(`   Category: ${category}`);
console.log(`   Current Total EMI (4 loans): ₹${currentTotalEMI.toLocaleString()}`);
console.log(`   Total Outstanding (POS): ₹${totalPOS.toLocaleString()}`);
console.log(`   Interest Rate (Fixed): ${interestRate}%`);
console.log(`   Desired Tenure: ${tenureYears} years (${tenureMonths} months)`);

console.log('\n📐 EMI TO LOAN AMOUNT FORMULA:');
console.log('─'.repeat(100));
console.log('   Loan Amount = EMI × [(1+r)^n - 1] / [r × (1+r)^n]');
console.log('   Where:');
console.log(`      r = Monthly Interest Rate = ${interestRate}% / 12 / 100 = ${(interestRate/12/100).toFixed(6)}`);
console.log(`      n = Number of months = ${tenureMonths}`);
console.log(`      (1+r)^n = (1+${(interestRate/12/100).toFixed(6)})^${tenureMonths} = ${Math.pow(1 + interestRate/12/100, tenureMonths).toFixed(6)}`);

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

// Bank configurations with FOIR for Category B
const banks = [
    {
        name: 'Kotak Mahindra Bank',
        config: kotakConfig,
        foirCatB: 0.70, // From foirTable['50000+']['B']
        multiplierCatB: 24, // From multiplierTable['50001-75000']['B']
        method: 'BOTH' // Uses both multiplier and FOIR
    },
    {
        name: 'HDFC Bank',
        config: hdfcConfig,
        foirCatB: 0.65, // From foirTable['50001-75000']['B']
        multiplierCatB: 20, // From multiplierTable['50001-75000']['B']
        method: 'BOTH'
    },
    {
        name: 'ICICI Bank',
        config: iciciConfig,
        foirCatB: 0.65, // From foirTable['>=50000']
        multiplierCatB: null,
        method: 'FOIR'
    },
    {
        name: 'Bandhan Bank',
        config: bandhanConfig,
        foirCatB: 0.70, // From foirTable['>=75000']
        multiplierCatB: null,
        method: 'FOIR'
    },
    {
        name: 'Cholamandalam Finance',
        config: cholaConfig,
        foirCatB: 0.70, // From foirTable['75001+']['B']
        multiplierCatB: null,
        method: 'FOIR'
    },
    {
        name: 'Tata Capital',
        config: tataConfig,
        foirCatB: 0.65, // From foirTable['50001-75000']
        multiplierCatB: 22, // From multiplierTable['50001-75000']['B']
        method: 'BOTH'
    },
    {
        name: 'Poonawala Finance',
        config: poonawalaConfig,
        foirCatB: 0.65, // From foirMatrix['B']['PRIME'] for 50K-75K NTH
        multiplierCatB: null,
        method: 'FOIR'
    },
    {
        name: 'Axis Finance',
        config: axisFinConfig,
        foirCatB: null,
        multiplierCatB: 26, // From multiplierTable['50001-75000']['B']
        method: 'MULTIPLIER'
    },
    {
        name: 'IndusInd Bank',
        config: indusindConfig,
        foirCatB: null,
        multiplierCatB: 21, // From multiplierTable['B']['25000-75000']
        method: 'MULTIPLIER'
    },
    {
        name: 'IDFC Bank',
        config: idfcConfig,
        foirCatB: null,
        multiplierCatB: 23, // From multiplierTable['B']['50001-75000']
        method: 'MULTIPLIER'
    },
    {
        name: 'Shri Ram Finance',
        config: shriRamConfig,
        foirCatB: 0.65, // From salaryBandTable['50001-75000']['foir']
        multiplierCatB: 20, // From salaryBandTable['50001-75000']['multiplier']
        method: 'BOTH'
    },
    {
        name: 'Piramal Finance',
        config: piramalConfig,
        foirCatB: 0.70, // From nthFoirTable['35001+']
        multiplierCatB: null,
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
    
    console.log(`   Calculation Method: ${bank.method}`);
    
    // Step 1: Calculate EMI Capacity (BT Logic - ignore existing EMI)
    if (bank.method === 'FOIR' || bank.method === 'BOTH') {
        emiCapacity = salary * bank.foirCatB;
        console.log(`\n   Step 1: Calculate EMI Capacity (Using FOIR)`);
        console.log(`      FOIR for Category B: ${(bank.foirCatB * 100).toFixed(0)}%`);
        console.log(`      EMI Capacity = Salary × FOIR`);
        console.log(`      EMI Capacity = ₹${salary.toLocaleString()} × ${bank.foirCatB}`);
        console.log(`      EMI Capacity = ₹${Math.round(emiCapacity).toLocaleString()}`);
        
        // Step 2: Calculate Max Loan from EMI
        const loanFromFOIR = calculateLoanFromEMI(emiCapacity, interestRate, tenureMonths);
        console.log(`\n   Step 2: Calculate Max Loan Amount from EMI Capacity`);
        console.log(`      Using formula: Loan = EMI × [(1+r)^n - 1] / [r × (1+r)^n]`);
        console.log(`      Loan Amount (FOIR) = ₹${loanFromFOIR.toLocaleString()}`);
        
        maxLoanAmount = loanFromFOIR;
    }
    
    if (bank.method === 'MULTIPLIER' || bank.method === 'BOTH') {
        console.log(`\n   Step 1: Calculate Loan from Multiplier Method`);
        console.log(`      Multiplier for Category B: ${bank.multiplierCatB}x`);
        const loanFromMultiplier = salary * bank.multiplierCatB;
        console.log(`      Loan Amount = Salary × Multiplier`);
        console.log(`      Loan Amount = ₹${salary.toLocaleString()} × ${bank.multiplierCatB}`);
        console.log(`      Loan Amount (Multiplier) = ₹${loanFromMultiplier.toLocaleString()}`);
        
        if (bank.method === 'BOTH') {
            // Take minimum of both
            const loanFromFOIR = maxLoanAmount;
            maxLoanAmount = Math.min(loanFromFOIR, loanFromMultiplier);
            console.log(`\n   Step 2: Take Minimum of FOIR and Multiplier`);
            console.log(`      FOIR Method: ₹${loanFromFOIR.toLocaleString()}`);
            console.log(`      Multiplier Method: ₹${loanFromMultiplier.toLocaleString()}`);
            console.log(`      Final Max Loan = MIN(${loanFromFOIR.toLocaleString()}, ${loanFromMultiplier.toLocaleString()})`);
            console.log(`      Final Max Loan = ₹${maxLoanAmount.toLocaleString()}`);
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
        console.log(`      Final Max Loan (After Cap): ₹${maxLoanAmount.toLocaleString()}`);
    }
    
    // Step 3: Deduct POS
    const freshAmount = maxLoanAmount - totalPOS;
    console.log(`\n   Final Step: Calculate Fresh Amount`);
    console.log(`      Fresh Amount = Max Loan - Total POS`);
    console.log(`      Fresh Amount = ₹${maxLoanAmount.toLocaleString()} - ₹${totalPOS.toLocaleString()}`);
    console.log(`      Fresh Amount = ₹${freshAmount.toLocaleString()}`);
    
    // Calculate new EMI
    const newEMI = calculateEMI(maxLoanAmount, interestRate, tenureMonths);
    console.log(`\n   New EMI Calculation:`);
    console.log(`      New EMI for ₹${maxLoanAmount.toLocaleString()} @ ${interestRate}% for ${tenureMonths} months`);
    console.log(`      New EMI = ₹${newEMI.toLocaleString()}`);
    
    // EMI comparison
    const emiDifference = newEMI - currentTotalEMI;
    console.log(`\n   EMI Comparison:`);
    console.log(`      Previous Total EMI: ₹${currentTotalEMI.toLocaleString()}`);
    console.log(`      New Single EMI: ₹${newEMI.toLocaleString()}`);
    console.log(`      Difference: ₹${emiDifference.toLocaleString()} ${emiDifference >= 0 ? '⬆️ (increase)' : '⬇️ (decrease)'}`);
    
    // Store result
    results.push({
        bank: bank.name,
        maxLoan: maxLoanAmount,
        freshAmount: freshAmount,
        newEMI: newEMI,
        emiDifference: emiDifference,
        foir: bank.foirCatB,
        multiplier: bank.multiplierCatB,
        method: bank.method
    });
});

// Summary Table
console.log('\n' + '='.repeat(100));
console.log('📊 SUMMARY COMPARISON TABLE - ALL BANKS');
console.log('='.repeat(100));

console.log('\n┌─────┬────────────────────────────┬──────────────┬──────────────┬────────────┬─────────────┬──────────┐');
console.log('│ No. │ Bank Name                  │ Max Loan     │ Fresh Amount │ New EMI    │ EMI Change  │ Method   │');
console.log('├─────┼────────────────────────────┼──────────────┼──────────────┼────────────┼─────────────┼──────────┤');

// Sort by fresh amount descending
results.sort((a, b) => b.freshAmount - a.freshAmount);

results.forEach((result, idx) => {
    const no = (idx + 1).toString().padStart(3);
    const bank = result.bank.padEnd(26);
    const maxLoan = `₹${(result.maxLoan / 100000).toFixed(2)}L`.padStart(12);
    const fresh = `₹${(result.freshAmount / 100000).toFixed(2)}L`.padStart(12);
    const emi = `₹${(result.newEMI / 1000).toFixed(1)}K`.padStart(10);
    const change = `${result.emiDifference >= 0 ? '+' : ''}₹${(result.emiDifference / 1000).toFixed(1)}K`.padStart(11);
    const method = result.method.padEnd(8);
    
    console.log(`│ ${no} │ ${bank} │ ${maxLoan} │ ${fresh} │ ${emi} │ ${change} │ ${method} │`);
});

console.log('└─────┴────────────────────────────┴──────────────┴──────────────┴────────────┴─────────────┴──────────┘');

// Top 3 Recommendations
console.log('\n' + '='.repeat(100));
console.log('🏆 TOP 3 RECOMMENDATIONS');
console.log('='.repeat(100));

console.log(`\n1️⃣  MAXIMUM FRESH FUNDS: ${results[0].bank}`);
console.log(`    Fresh Amount: ₹${results[0].freshAmount.toLocaleString()}`);
console.log(`    Max Loan: ₹${results[0].maxLoan.toLocaleString()}`);
console.log(`    New EMI: ₹${results[0].newEMI.toLocaleString()}`);

const lowestEMI = [...results].sort((a, b) => a.newEMI - b.newEMI)[0];
console.log(`\n2️⃣  LOWEST EMI: ${lowestEMI.bank}`);
console.log(`    New EMI: ₹${lowestEMI.newEMI.toLocaleString()}`);
console.log(`    Fresh Amount: ₹${lowestEMI.freshAmount.toLocaleString()}`);
console.log(`    Max Loan: ₹${lowestEMI.maxLoan.toLocaleString()}`);

const balanced = results.find(r => r.freshAmount > 1500000 && r.newEMI < 40000) || results[1];
console.log(`\n3️⃣  BALANCED OPTION: ${balanced.bank}`);
console.log(`    Fresh Amount: ₹${balanced.freshAmount.toLocaleString()}`);
console.log(`    New EMI: ₹${balanced.newEMI.toLocaleString()}`);
console.log(`    Max Loan: ₹${balanced.maxLoan.toLocaleString()}`);

// Customer Benefit Summary
console.log('\n' + '='.repeat(100));
console.log('💡 CUSTOMER BENEFIT SUMMARY');
console.log('='.repeat(100));

console.log('\n   CURRENT SITUATION (Before BT):');
console.log(`      • 4 separate personal loans`);
console.log(`      • Total monthly EMI: ₹${currentTotalEMI.toLocaleString()}`);
console.log(`      • Total outstanding: ₹${totalPOS.toLocaleString()}`);
console.log(`      • Fresh funds available: ₹0`);

console.log(`\n   AFTER BT (Best Option - ${results[0].bank}):`);
console.log(`      • Single consolidated loan`);
console.log(`      • New monthly EMI: ₹${results[0].newEMI.toLocaleString()}`);
console.log(`      • Fresh cash in hand: ₹${results[0].freshAmount.toLocaleString()} 💰`);
console.log(`      • All old loans closed`);

console.log('\n   KEY BENEFITS:');
console.log(`      ✅ Fresh funds unlocked: ₹${results[0].freshAmount.toLocaleString()}`);
console.log(`      ✅ Loans simplified: 4 → 1`);
console.log(`      ✅ EMI change: ${results[0].emiDifference >= 0 ? '+' : ''}₹${results[0].emiDifference.toLocaleString()}`);
console.log(`      ✅ Fresh funds as % of POS: ${((results[0].freshAmount / totalPOS) * 100).toFixed(0)}%`);
console.log(`      ✅ For every ₹1 of debt, getting ₹${(results[0].freshAmount / totalPOS).toFixed(2)} fresh!`);

console.log('\n' + '='.repeat(100));
console.log('✅ CALCULATION COMPLETED');
console.log('='.repeat(100) + '\n');
