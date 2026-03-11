
import { calculateIndusindEligibility } from './backend/calculators/indusind/calculator.js';
import { calculateAxisFinEligibility } from './backend/calculators/axis-fin/calculator.js';
import { calculateIdfcEligibility } from './backend/calculators/idfc/calculator.js';
import { calculateBandhanEligibility } from './backend/calculators/bandhan/calculator.js';
import { calculateCholaEligibility } from './backend/calculators/chola/calculator.js';
import { calculatePiramalEligibility } from './backend/calculators/piramal/calculator.js';
import { calculateHdfcEligibility } from './backend/calculators/hdfc/calculator.js';
import { calculateIciciEligibility } from './backend/calculators/icici/calculator.js';
import { calculateKotakEligibility } from './backend/calculators/kotak/calculator.js';
import { calculateSbiEligibility } from './backend/calculators/sbi/calculator.js';
import { calculateTataEligibility } from './backend/calculators/tata/calculator.js';
import { calculateGodrejEligibility } from './backend/calculators/godrej/calculator.js';

const mockGovtUser = {
    desiredLoanAmount: 500000,
    loanTenure: 5,
    monthlyIncome: 50000,
    existingEMI: 0,
    category: 'GOVT',
    employmentType: 'government',
    age: 35,
    creditScore: 750,
    isGovtEmployee: true,
    govtROI: 10.5,
    govtFOIR: 65,
    govtMaxTenure: 72,
    govtMultiplier: 15
};

const banks = [
    { name: 'IndusInd', calc: calculateIndusindEligibility },
    { name: 'Axis Finance', calc: calculateAxisFinEligibility },
    { name: 'IDFC', calc: calculateIdfcEligibility },
    { name: 'Bandhan', calc: calculateBandhanEligibility },
    { name: 'Chola', calc: calculateCholaEligibility },
    { name: 'Piramal', calc: calculatePiramalEligibility },
    { name: 'HDFC', calc: calculateHdfcEligibility },
    { name: 'ICICI', calc: calculateIciciEligibility },
    { name: 'Kotak', calc: calculateKotakEligibility },
    { name: 'SBI', calc: calculateSbiEligibility },
    { name: 'Tata Capital', calc: calculateTataEligibility },
    { name: 'Godrej', calc: calculateGodrejEligibility }
];

console.log('--- GOVERNMENT EMPLOYEE LOGIC VERIFICATION ---');
banks.forEach(bank => {
    try {
        const result = bank.calc(mockGovtUser);
        if (result.eligible || result.isEligible) {
            console.log(`✅ ${bank.name}: Eligible. Amt: ${result.loanAmount}, Rate: ${result.interestRate}%, Category: ${result.category || result.companyCategory}`);
        } else {
            console.log(`❌ ${bank.name}: REJECTED. Reason: ${result.reason}`);
        }
    } catch (err) {
        console.log(`💥 ${bank.name}: CRASHED. Error: ${err.message}`);
    }
});
