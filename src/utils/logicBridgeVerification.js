import { calculateLoanEligibility } from '../services/realLoanService.js';
import * as bankConfigService from '../services/bankConfigService.js';

// --- MOCKING BROWSER GLOBALS FOR NODE.JS ---
global.performance = {
    now: () => Date.now()
};

const storage = {};
global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => { storage[key] = value; },
    removeItem: (key) => { delete storage[key]; }
};

// --- TEST SCENARIOS ---

async function runTests() {
    console.log('🚀 === STARTING LOGIC BRIDGE VERIFICATION ===\n');

    const baseUserData = {
        desiredLoanAmount: 500000,
        loanTenure: 5,
        monthlyIncome: 50000,
        existingEMI: 5000,
        companyName: 'TCS',
        employmentType: 'salaried',
        age: 30,
        salaryMode: 'bank',
        city: 'Mumbai'
    };

    // 1. TEST: Interest Rate Override
    console.log('--- TEST 1: Interest Rate Override (Admin Panel) ---');
    // Set a global override for HDFC to 15.5% (default is usually 11%)
    bankConfigService.saveBankConfig('HDFC Bank', 'interestRates', {
        defaultRate: 15.5,
        categoryRates: { 'A': 15.5, 'B': 15.5, 'C': 15.5 }
    });

    let results = await calculateLoanEligibility(baseUserData);
    const hdfcResult = results.find(r => r.bankName === 'HDFC Bank');
    console.log(`HDFC Expected Rate: 15.5%, Actual: ${hdfcResult?.interestRate}%`);
    if (hdfcResult?.interestRate === 15.5) console.log('✅ TEST 1 PASSED');
    else console.log('❌ TEST 1 FAILED');

    // 2. TEST: Salary Mode Gate (Cash)
    console.log('\n--- TEST 2: Salary Mode Gate (Allow Cash = No) ---');
    bankConfigService.saveBankConfig('ICICI Bank', 'employmentRules', {
        salariedMinSalary: 25000,
        allowCashSalary: false
    });

    const cashUserData = { ...baseUserData, salaryMode: 'cash' };
    results = await calculateLoanEligibility(cashUserData);
    const iciciResult = results.find(r => r.bankName === 'ICICI Bank');
    console.log(`ICICI Cash Result: ${iciciResult?.eligible ? 'Approved' : 'Rejected'}`);
    console.log(`Reason: ${iciciResult?.reason}`);
    if (!iciciResult?.eligible && iciciResult?.reason?.includes('Cash salaries')) console.log('✅ TEST 2 PASSED');
    else console.log('❌ TEST 2 FAILED');

    // 3. TEST: Age Capping Logic
    console.log('\n--- TEST 3: Age Capping Gate ---');
    bankConfigService.saveBankConfig('Kotak Mahindra Bank', 'ageRules', {
        minAge: 21,
        maxAge: 45 // Set low max age manually
    });

    const oldUserData = { ...baseUserData, age: 50 };
    results = await calculateLoanEligibility(oldUserData);
    const kotakResult = results.find(r => r.bankName === 'Kotak Mahindra Bank');
    console.log(`Kotak Age 50 Result: ${kotakResult?.eligible ? 'Approved' : 'Rejected'}`);
    console.log(`Reason: ${kotakResult?.reason}`);
    if (!kotakResult?.eligible && kotakResult?.reason?.includes('Age above criteria')) console.log('✅ TEST 3 PASSED');
    else console.log('❌ TEST 3 FAILED');

    // 4. TEST: Govt Policy Injection
    console.log('\n--- TEST 4: Govt Policy Direct Injection ---');
    // Set a specific govt policy for Axis Finance (Multiplier path)
    bankConfigService.saveBankConfig('Axis Finance', 'govtPolicy', {
        roi: 9.5,
        multiplier: 45,
        foir: 70,
        maxTenureMonths: 72
    });

    const govtUserData = { ...baseUserData, employmentType: 'government' };
    results = await calculateLoanEligibility(govtUserData);
    const axisResult = results.find(r => r.bankName === 'Axis Finance');
    console.log(`Axis Govt ROI: ${axisResult?.interestRate}%, Multiplier: ${axisResult?.multiplier}`);
    if (axisResult?.interestRate === 9.5 && axisResult?.multiplier === 45) console.log('✅ TEST 4 PASSED');
    else console.log('❌ TEST 4 FAILED');

    // 5. TEST: Verification across remaining institutions (e.g. Bandhan)
    console.log('\n--- TEST 5: Verify Batch 2 Institutions (Bandhan ROI Override) ---');
    bankConfigService.saveBankConfig('Bandhan Bank', 'interestRates', {
        defaultRate: 14.2
    });

    results = await calculateLoanEligibility(baseUserData);
    const bandhanResult = results.find(r => r.bankName === 'Bandhan Bank');
    console.log(`Bandhan Actual Rate: ${bandhanResult?.interestRate}%`);
    if (bandhanResult?.interestRate === 14.2) console.log('✅ TEST 5 PASSED');
    else console.log('❌ TEST 5 FAILED');

    console.log('\n🏁 === VERIFICATION COMPLETE ===');
}

runTests().catch(err => {
    console.error('❌ CRITICAL ERROR DURING TESTING:', err);
    process.exit(1);
});
