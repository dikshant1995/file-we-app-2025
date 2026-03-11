import { calculateTataEligibility } from './src/banks/tata/calculator.js';

const mockUserData = {
    monthlyIncome: 100000,
    desiredLoanAmount: 500000,
    loanTenure: 5,
    existingEMI: 0,
    companyName: 'Bikaji',
    category: 'SUP-A', // This is what comes from the company database
    employmentType: 'salaried',
    creditScore: 750,
    age: 35
};

console.log('--- Testing Tata Capital Eligibility for Bikaji (SUP-A) ---');
try {
    const result = calculateTataEligibility(mockUserData);
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.eligible) {
        console.log('✅ SUCCESS: Tata Capital is now eligible for SUP-A (SUPER-A) companies.');
    } else {
        console.log('❌ FAILURE: Tata Capital still rejected SUP-A company. Reason:', result.reason);
    }
} catch (error) {
    console.error('❌ ERROR during calculation:', error);
}
