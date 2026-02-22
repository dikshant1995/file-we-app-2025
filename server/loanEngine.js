// Backend Loan Engine - exhaustive search ported from realLoanService and btLoanService
import {
    kotakConfig, hdfcConfig, iciciConfig, bandhanConfig,
    cholaConfig, tataConfig, poonawalaConfig, axisFinConfig,
    shriRamConfig, piramalConfig, indusindConfig, idfcConfig
} from '../src/banks/index.js';

// Import calculators
import { calculateKotakEligibility } from '../src/banks/kotak/calculator.js';
import { calculateHdfcEligibility } from '../src/banks/hdfc/calculator.js';
import { calculateIciciEligibility } from '../src/banks/icici/calculator.js';
import { calculateBandhanEligibility } from '../src/banks/bandhan/calculator.js';
import { calculateCholaEligibility } from '../src/banks/chola/calculator.js';
import { calculateTataEligibility } from '../src/banks/tata/calculator.js';
import { calculatePoonawalaEligibility } from '../src/banks/poonawala/calculator.js';
import { calculateAxisFinEligibility } from '../src/banks/axis-fin/calculator.js';
import { calculateIndusindEligibility } from '../src/banks/indusind/calculator.js';
import { calculateIdfcEligibility } from '../src/banks/idfc/calculator.js';
import { calculateShriRamEligibility } from '../src/banks/shri-ram/calculator.js';
import { calculatePiramalEligibility } from '../src/banks/piramal/calculator.js';

import { getCompanyCategoryForBank } from './companyService.js';

const bankCalculators = [
    { name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility, config: kotakConfig, hasDatabase: true },
    { name: 'Tata Capital', calculator: calculateTataEligibility, config: tataConfig, hasDatabase: true },
    { name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility, config: poonawalaConfig, hasDatabase: true },
    { name: 'IDFC Bank', calculator: calculateIdfcEligibility, config: idfcConfig, hasDatabase: true },
    { name: 'HDFC Bank', calculator: calculateHdfcEligibility, config: hdfcConfig, hasDatabase: true },
    { name: 'ICICI Bank', calculator: calculateIciciEligibility, config: iciciConfig, hasDatabase: true },
    { name: 'Bandhan Bank', calculator: calculateBandhanEligibility, config: bandhanConfig, hasDatabase: false },
    { name: 'Cholamandalam Finance', calculator: calculateCholaEligibility, config: cholaConfig, hasDatabase: true },
    { name: 'Axis Finance', calculator: calculateAxisFinEligibility, config: axisFinConfig, hasDatabase: true },
    { name: 'IndusInd Bank', calculator: calculateIndusindEligibility, config: indusindConfig, hasDatabase: true },
    { name: 'Shri Ram Finance', calculator: calculateShriRamEligibility, config: shriRamConfig, hasDatabase: false },
    { name: 'Piramal Finance', calculator: calculatePiramalEligibility, config: piramalConfig, hasDatabase: false }
];

export const calculateServerLoanEligibility = async (userData) => {
    const isBTMode = userData.wantsBT && userData.selectedLoansForBT && userData.selectedLoansForBT.length > 0;

    const calculatorInput = {
        desiredLoanAmount: userData.desiredLoanAmount ? parseFloat(userData.desiredLoanAmount) : null,
        loanTenure: userData.loanTenure ? parseInt(userData.loanTenure) : 5,
        monthlyIncome: userData.monthlyIncome ? parseFloat(userData.monthlyIncome) : 0,
        existingEMI: userData.existingEMI ? parseFloat(userData.existingEMI) : 0,
        companyName: userData.companyName || '',
        category: userData.category || 'A',
        creditScore: userData.creditScore ? parseInt(userData.creditScore) : 700,
        employmentType: userData.employmentType || 'salaried',
        age: userData.age ? parseInt(userData.age) : null,
        existingLoanBanks: userData.existingLoanBanks || [],
        isBTMode: isBTMode,
        loansForBT: isBTMode ? userData.loansForBT : [],
        btTotalEMI: isBTMode ? userData.loansForBT.reduce((sum, loan) => sum + (parseFloat(loan.monthlyEMI) || 0), 0) : 0,
        btTotalOutstanding: isBTMode ? userData.loansForBT.reduce((sum, loan) => sum + (parseFloat(loan.outstandingAmount) || 0), 0) : 0,
        state: userData.state || '',
        city: userData.city || ''
    };

    const results = await Promise.all(bankCalculators.map(async ({ name, calculator, config, hasDatabase }) => {
        try {
            let bankCategory = 'B';

            if (hasDatabase) {
                const bankDbKey = name.toLowerCase().replace(/\s+/g, '').includes('kotak') ? 'kotak'
                    : name.toLowerCase().replace(/\s+/g, '').includes('tata') ? 'tata'
                        : name.toLowerCase().replace(/\s+/g, '').includes('poonawala') ? 'poonawala'
                            : name.toLowerCase().replace(/\s+/g, '').includes('idfc') ? 'idfc'
                                : name.toLowerCase().replace(/\s+/g, '').includes('hdfc') ? 'hdfc'
                                    : name.toLowerCase().replace(/\s+/g, '').includes('icici') ? 'icici'
                                        : name.toLowerCase().replace(/\s+/g, '').includes('chola') ? 'chola'
                                            : name.toLowerCase().replace(/\s+/g, '').includes('indusind') ? 'indusind'
                                                : name.toLowerCase().replace(/\s+/g, '').includes('axis') ? 'axis_fin'
                                                    : null;

                if (bankDbKey && calculatorInput.companyName) {
                    bankCategory = await getCompanyCategoryForBank(calculatorInput.companyName, bankDbKey);

                    if (bankDbKey === 'hdfc') {
                        if (bankCategory === 'SCATA') bankCategory = 'Super A';
                        else if (bankCategory === 'CATGA') bankCategory = 'A';
                        else if (bankCategory === 'CATGB') bankCategory = 'B';
                        else if (bankCategory === 'CATGC') bankCategory = 'C';
                        else if (bankCategory === 'GOVT') bankCategory = 'Govt';
                    }
                }
            }

            const result = calculator({ ...calculatorInput, category: bankCategory });

            return {
                bankName: result.bankName || name,
                ...result,
                category: bankCategory,
                isBTMode: calculatorInput.isBTMode,
                btTotalEMI: calculatorInput.btTotalEMI,
                btTotalOutstanding: calculatorInput.btTotalOutstanding
            };
        } catch (error) {
            return {
                bankName: name,
                eligible: false,
                reason: 'Calculation error: ' + error.message
            };
        }
    }));

    return results;
};
