/**
 * Loan Eligibility Calculation
 * 
 * Customer Profile:
 * - Salary: ₹48,000
 * - Category: B
 * - No existing loans (fresh loan application)
 * - Interest Rate: 11% (FIXED for all banks)
 */

import { getInterestRate } from '../config/interestRateConfig.js';
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
console.log('LOAN ELIGIBILITY CALCULATION - Salary ₹48,000, Category B');
console.log('='.repeat(100));

// Customer data
const salary = 48000;
const category = 'B';
const existingEMI = 0;
const tenureYears = 6;
const tenureMonths = tenureYears * 12;

console.log('\n📊 CUSTOMER PROFILE:');
console.log('─'.repeat(100));
console.log(`   Monthly Salary: ₹${salary.toLocaleString()}`);
console.log(`   Category: ${category}`);
console.log(`   Existing EMI: ₹${existingEMI.toLocaleString()}`);
console.log(`   Desired Tenure: ${tenureYears} years (${tenureMonths} months)`);
console.log(`   Interest Rate: 11% (FIXED for all banks)`);

// Helper functions
function calculateLoanFromEMI(emi, annualRate, months) {
    const r = annualRate / 12 / 100;
    const n = months;
    const powTerm = Math.pow(1 + r, n);
    const loanAmount = emi * (powTerm - 1) / (r * powTerm);
    return Math.round(loanAmount);
}

function calculateEMI(principal, annualRate, months) {
    const r = annualRate / 12 / 100;
    const n = months;
    if (r === 0) return principal / n;
    const powTerm = Math.pow(1 + r, n);
    const emi = principal * r * powTerm / (powTerm - 1);
    return Math.round(emi);
}

// Bank configurations
const banks = [
    {
        name: 'Kotak Mahindra Bank',
        id: 'kotak',
        config: kotakConfig,
        foirCatB: 0.70,
        multiplierCatB: 24,
        method: 'BOTH',
        salaryBand: '25000-50000'
    },
    {
        name: 'HDFC Bank',
        id: 'hdfc',
        config: hdfcConfig,
        foirCatB: 0.55,
        multiplierCatB: 15,
        method: 'BOTH',
        salaryBand: '35001-50000'
    },
    {
        name: 'ICICI Bank',
        id: 'icici',
        config: iciciConfig,
        foirCatB: 0.55,
        multiplierCatB: null,
        method: 'FOIR',
        salaryBand: '<50000'
    },
    {
        name: 'Bandhan Bank',
        id: 'bandhan',
        config: bandhanConfig,
        foirCatB: 0.60,
        multiplierCatB: null,
        method: 'FOIR',
        salaryBand: '<75000'
    },
    {
        name: 'Cholamandalam Finance',
        id: 'chola',
        config: cholaConfig,
        foirCatB: 0.65,
        multiplierCatB: null,
        method: 'FOIR',
        salaryBand: '30001-50000'
    },
    {
        name: 'Tata Capital',
        id: 'tata',
        config: tataConfig,
        foirCatB: 0.60,
        multiplierCatB: 19,
        method: 'BOTH',
        salaryBand: '25000-50000'
    },
    {
        name: 'Poonawala Finance',
        id: 'poonawala',
        config: poonawalaConfig,
        foirCatB: 0.60,
        multiplierCatB: null,
        method: 'FOIR',
        salaryBand: 'OTHERS (30K-50K)'
    },
    {
        name: 'Axis Finance',
        id: 'axis-fin',
        config: axisFinConfig,
        foirCatB: null,
        multiplierCatB: 24,
        method: 'MULTIPLIER',
        salaryBand: '25000-50000'
    },
    {
        name: 'IndusInd Bank',
        id: 'indusind',
        config: indusindConfig,
        foirCatB: null,
        multiplierCatB: 21,
        method: 'MULTIPLIER',
        salaryBand: '25000-75000'
    },
    {
        name: 'IDFC Bank',
        id: 'idfc',
        config: idfcConfig,
        foirCatB: null,
        multiplierCatB: 20,
        method: 'MULTIPLIER',
        salaryBand: '<50000'
    },
    {
        name: 'Shri Ram Finance',
        id: 'shri-ram',
        config: shriRamConfig,
        foirCatB: 0.60,
        multiplierCatB: 18,
        method: 'BOTH',
        salaryBand: '35001-50000'
    },
    {
        name: 'Piramal Finance',
        id: 'piramal',
        config: piramalConfig,
        foirCatB: 0.65,
        multiplierCatB: null,
        method: 'FOIR',
        salaryBand: '35001+ NTH'
    }
];

console.log('\n' + '='.repeat(100));
console.log('DETAILED CALCULATIONS FOR EACH BANK');
console.log('='.repeat(100));

const results = [];

banks.forEach((bank, index) => {
    console.log(`\n${index + 1}. ${bank.name.toUpperCase()}`);
    console.log('─'.repeat(100));
    
    // Get interest rate from config system
    const interestRate = getInterestRate(bank.id, category);
    
    let maxLoanAmount = 0;
    let emiCapacity = 0;
    let calculatedEMI = 0;
    let eligible = true;
    let reason = '';
    
    // Check minimum salary requirement
    const minSalaryReq = bank.config.minSalary?.[category] || bank.config.minSalary?.['B'] || bank.config.minSalary;
    if (minSalaryReq && salary < minSalaryReq) {
        eligible = false;
        reason = `Minimum salary required: ₹${minSalaryReq.toLocaleString()}`;
    }
    
    if (eligible) {
        console.log(`   Calculation Method: ${bank.method}`);
        console.log(`   Interest Rate: ${interestRate}% (from config)`);
        console.log(`   Salary Band: ${bank.salaryBand}`);
        
        if (bank.method === 'FOIR' || bank.method === 'BOTH') {
            emiCapacity = salary * bank.foirCatB;
            console.log(`\n   Step 1: Calculate EMI Capacity (Using FOIR)`);
            console.log(`      FOIR for Category B: ${(bank.foirCatB * 100).toFixed(0)}%`);
            console.log(`      EMI Capacity = ₹${salary.toLocaleString()} × ${bank.foirCatB}`);
            console.log(`      EMI Capacity = ₹${Math.round(emiCapacity).toLocaleString()}`);
            
            const loanFromFOIR = calculateLoanFromEMI(emiCapacity, interestRate, tenureMonths);
            console.log(`\n   Step 2: Calculate Max Loan from EMI Capacity`);
            console.log(`      Loan Amount (FOIR) = ₹${loanFromFOIR.toLocaleString()}`);
            
            maxLoanAmount = loanFromFOIR;
        }
        
        if (bank.method === 'MULTIPLIER' || bank.method === 'BOTH') {
            console.log(`\n   ${bank.method === 'BOTH' ? 'Step 1 (Alternative):' : 'Step 1:'} Multiplier Method`);
            console.log(`      Multiplier for Category B: ${bank.multiplierCatB}x`);
            const loanFromMultiplier = salary * bank.multiplierCatB;
            console.log(`      Loan = ₹${salary.toLocaleString()} × ${bank.multiplierCatB}`);
            console.log(`      Loan Amount (Multiplier) = ₹${loanFromMultiplier.toLocaleString()}`);
            
            if (bank.method === 'BOTH') {
                const loanFromFOIR = maxLoanAmount;
                maxLoanAmount = Math.min(loanFromFOIR, loanFromMultiplier);
                console.log(`\n   Step 2: Take Minimum`);
                console.log(`      FOIR: ₹${loanFromFOIR.toLocaleString()}`);
                console.log(`      Multiplier: ₹${loanFromMultiplier.toLocaleString()}`);
                console.log(`      Final = ₹${maxLoanAmount.toLocaleString()}`);
            } else {
                maxLoanAmount = loanFromMultiplier;
            }
        }
        
        // Apply max loan cap
        if (bank.config.maxLoanAmount && maxLoanAmount > bank.config.maxLoanAmount) {
            console.log(`\n   Step 3: Apply Bank's Max Loan Cap`);
            console.log(`      Calculated: ₹${maxLoanAmount.toLocaleString()}`);
            console.log(`      Bank's Cap: ₹${bank.config.maxLoanAmount.toLocaleString()}`);
            maxLoanAmount = bank.config.maxLoanAmount;
            console.log(`      Final: ₹${maxLoanAmount.toLocaleString()}`);
        }
        
        calculatedEMI = calculateEMI(maxLoanAmount, interestRate, tenureMonths);
        const emiRatio = (calculatedEMI / salary) * 100;
        
        console.log(`\n   Final Result:`);
        console.log(`      Loan Amount: ₹${maxLoanAmount.toLocaleString()}`);
        console.log(`      Monthly EMI: ₹${calculatedEMI.toLocaleString()}`);
        console.log(`      EMI/Salary: ${emiRatio.toFixed(1)}%`);
    } else {
        console.log(`   ❌ NOT ELIGIBLE`);
        console.log(`   Reason: ${reason}`);
    }
    
    results.push({
        bank: bank.name,
        loanAmount: eligible ? maxLoanAmount : 0,
        emi: eligible ? calculatedEMI : 0,
        interestRate: interestRate,
        eligible: eligible,
        reason: reason,
        method: bank.method,
        emiRatio: eligible ? (calculatedEMI / salary) * 100 : 0
    });
});

// Summary Table
console.log('\n' + '='.repeat(100));
console.log('📊 SUMMARY COMPARISON TABLE');
console.log('='.repeat(100));

const eligibleResults = results.filter(r => r.eligible);
const notEligibleResults = results.filter(r => !r.eligible);

if (eligibleResults.length > 0) {
    console.log('\n✅ ELIGIBLE BANKS:\n');
    console.log('┌─────┬────────────────────────────┬──────────────┬────────────┬──────────┬──────────┬──────────┐');
    console.log('│ No. │ Bank Name                  │ Loan Amount  │ Monthly EMI│ Interest │ EMI/Sal  │ Method   │');
    console.log('├─────┼────────────────────────────┼──────────────┼────────────┼──────────┼──────────┼──────────┤');
    
    eligibleResults.sort((a, b) => b.loanAmount - a.loanAmount);
    
    eligibleResults.forEach((result, idx) => {
        const no = (idx + 1).toString().padStart(3);
        const bank = result.bank.padEnd(26);
        const loan = `₹${(result.loanAmount / 100000).toFixed(2)}L`.padStart(12);
        const emi = `₹${(result.emi / 1000).toFixed(1)}K`.padStart(10);
        const interest = `${result.interestRate}%`.padStart(8);
        const emiRatio = `${result.emiRatio.toFixed(1)}%`.padStart(8);
        const method = result.method.padEnd(8);
        
        console.log(`│ ${no} │ ${bank} │ ${loan} │ ${emi} │ ${interest} │ ${emiRatio} │ ${method} │`);
    });
    
    console.log('└─────┴────────────────────────────┴──────────────┴────────────┴──────────┴──────────┴──────────┘');
}

if (notEligibleResults.length > 0) {
    console.log('\n\n❌ NOT ELIGIBLE BANKS:\n');
    notEligibleResults.forEach((result, idx) => {
        console.log(`   ${idx + 1}. ${result.bank}`);
        console.log(`      Reason: ${result.reason}`);
    });
}

// Top Recommendations
if (eligibleResults.length > 0) {
    console.log('\n' + '='.repeat(100));
    console.log('🏆 TOP 3 RECOMMENDATIONS');
    console.log('='.repeat(100));
    
    console.log(`\n1️⃣  MAXIMUM LOAN AMOUNT: ${eligibleResults[0].bank}`);
    console.log(`    Loan Amount: ₹${eligibleResults[0].loanAmount.toLocaleString()}`);
    console.log(`    Monthly EMI: ₹${eligibleResults[0].emi.toLocaleString()}`);
    console.log(`    Interest Rate: ${eligibleResults[0].interestRate}%`);
    
    const lowestEMI = [...eligibleResults].sort((a, b) => a.emi - b.emi)[0];
    console.log(`\n2️⃣  LOWEST EMI: ${lowestEMI.bank}`);
    console.log(`    Monthly EMI: ₹${lowestEMI.emi.toLocaleString()}`);
    console.log(`    Loan Amount: ₹${lowestEMI.loanAmount.toLocaleString()}`);
    console.log(`    Interest Rate: ${lowestEMI.interestRate}%`);
    
    const balanced = eligibleResults[Math.min(2, eligibleResults.length - 1)];
    console.log(`\n3️⃣  BALANCED OPTION: ${balanced.bank}`);
    console.log(`    Loan Amount: ₹${balanced.loanAmount.toLocaleString()}`);
    console.log(`    Monthly EMI: ₹${balanced.emi.toLocaleString()}`);
    console.log(`    Interest Rate: ${balanced.interestRate}%`);
}

// Summary
console.log('\n' + '='.repeat(100));
console.log('💡 SUMMARY');
console.log('='.repeat(100));

console.log('\n   CUSTOMER PROFILE:');
console.log(`      Salary: ₹${salary.toLocaleString()}`);
console.log(`      Category: ${category}`);
console.log(`      No existing EMI`);

if (eligibleResults.length > 0) {
    console.log(`\n   BEST OPTION (${eligibleResults[0].bank}):`);
    console.log(`      ✅ Maximum Loan: ₹${eligibleResults[0].loanAmount.toLocaleString()}`);
    console.log(`      ✅ Monthly EMI: ₹${eligibleResults[0].emi.toLocaleString()}`);
    console.log(`      ✅ Interest: ${eligibleResults[0].interestRate}%`);
    console.log(`      ✅ Tenure: ${tenureYears} years`);
    console.log(`      ℹ️  EMI/Salary: ${eligibleResults[0].emiRatio.toFixed(1)}%`);
}

console.log(`\n   ELIGIBILITY STATUS:`);
console.log(`      ✅ Eligible Banks: ${eligibleResults.length}`);
console.log(`      ❌ Not Eligible: ${notEligibleResults.length}`);

console.log('\n' + '='.repeat(100));
console.log('✅ CALCULATION COMPLETED');
console.log('='.repeat(100) + '\n');
