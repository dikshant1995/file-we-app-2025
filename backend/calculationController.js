// 🧠 Backend Calculation Engine (Unified Controller)
// This file handles both regular and BT calculations using the 12 proprietary bank calculators

import { calculateKotakEligibility } from './calculators/kotak/calculator.js';
import { calculateHdfcEligibility } from './calculators/hdfc/calculator.js';
import { calculateIciciEligibility } from './calculators/icici/calculator.js';
import { calculateBandhanEligibility } from './calculators/bandhan/calculator.js';
import { calculateCholaEligibility } from './calculators/chola/calculator.js';
import { calculateTataEligibility } from './calculators/tata/calculator.js';
import { calculatePoonawalaEligibility } from './calculators/poonawala/calculator.js';
import { calculateAxisFinEligibility } from './calculators/axis-fin/calculator.js';
import { calculateIndusindEligibility } from './calculators/indusind/calculator.js';
import { calculateIdfcEligibility } from './calculators/idfc/calculator.js';
import { calculateShriRamEligibility } from './calculators/shri-ram/calculator.js';
import { calculatePiramalEligibility } from './calculators/piramal/calculator.js';

// Import bank configs (for BT logic)
import { kotakConfig } from './calculators/kotak/config.js';
import { hdfcConfig } from './calculators/hdfc/config.js';
import { iciciConfig } from './calculators/icici/config.js';
import { bandhanConfig } from './calculators/bandhan/config.js';
import { cholaConfig } from './calculators/chola/config.js';
import { tataConfig } from './calculators/tata/config.js';
import { poonawalaConfig } from './calculators/poonawala/config.js';
import { axisFinConfig } from './calculators/axis-fin/config.js';
import { indusindConfig } from './calculators/indusind/config.js';
import { idfcConfig } from './calculators/idfc/config.js';
import { shriRamConfig } from './calculators/shri-ram/config.js';
import { piramalConfig } from './calculators/piramal/config.js';

/**
 * Universal Loan Calculation Entry Point
 */
export const performLoanCalculation = async (data) => {
    const isBTMode = data.calculationType === 'bt';

    if (isBTMode) {
        return handleBTCalculation(data);
    } else {
        return handleRegularCalculation(data);
    }
};

/**
 * Handle Regular Loan Eligibility
 */
const handleRegularCalculation = (userData) => {
    const baseInput = {
        desiredLoanAmount: parseFloat(userData.desiredLoanAmount) || null,
        loanTenure: parseInt(userData.loanTenure) || 5,
        monthlyIncome: parseFloat(userData.monthlyIncome) || 0,
        existingEMI: parseFloat(userData.existingEMI) || 0,
        companyName: userData.companyName || '',
        category: userData.category || 'B',
        creditScore: parseInt(userData.creditScore) || 700,
        employmentType: userData.employmentType || 'salaried',
        age: parseInt(userData.age) || null,
        existingLoanBanks: userData.existingLoanBanks || [],
        state: userData.state || '',
        city: userData.city || ''
    };

    const bankCalculators = [
        { name: 'Kotak Mahindra Bank', calc: calculateKotakEligibility },
        { name: 'Tata Capital', calc: calculateTataEligibility },
        { name: 'Poonawala Finance', calc: calculatePoonawalaEligibility },
        { name: 'IDFC Bank', calc: calculateIdfcEligibility },
        { name: 'HDFC Bank', calc: calculateHdfcEligibility },
        { name: 'ICICI Bank', calc: calculateIciciEligibility },
        { name: 'Bandhan Bank', calc: calculateBandhanEligibility },
        { name: 'Cholamandalam Finance', calc: calculateCholaEligibility },
        { name: 'Axis Finance', calc: calculateAxisFinEligibility },
        { name: 'IndusInd Bank', calc: calculateIndusindEligibility },
        { name: 'Shri Ram Finance', calc: calculateShriRamEligibility },
        { name: 'Piramal Finance', calc: calculatePiramalEligibility }
    ];

    return bankCalculators.map(({ name, calc }) => {
        try {
            const result = calc(baseInput);
            return {
                ...result,
                bankName: name
            };
        } catch (error) {
            console.error(`🚨 Backend Failure in ${name}:`, error);
            return { bankName: name, eligible: false, reason: 'Server calculation error' };
        }
    });
};

/**
 * Handle BT Calculation (Simplified Mirror of btLoanService.js)
 */
const handleBTCalculation = (userData) => {
    const {
        monthlyIncome,
        existingLoans = [],
        creditCards = [],
        loanTenure,
        category,
        companyName,
        creditScore,
        employmentType
    } = userData;

    const totalLoanPOS = existingLoans.reduce((sum, loan) => sum + parseFloat(loan.pos || 0), 0);
    const totalLoanEMI = existingLoans.reduce((sum, loan) => sum + parseFloat(loan.emi || 0), 0);
    const totalCreditCardPOS = creditCards.reduce((sum, card) => sum + parseFloat(card.outstandingAmount || 0), 0);
    const totalDebtToClear = totalLoanPOS + totalCreditCardPOS;

    const btInput = {
        desiredLoanAmount: null,
        loanTenure: parseInt(loanTenure),
        monthlyIncome: parseFloat(monthlyIncome),
        existingEMI: 0, // Ignored in BT
        creditCardObligation: 0, // Set by specific BT scenarios if needed
        companyName: companyName,
        category: category || 'C',
        creditScore: parseInt(creditScore) || 700,
        employmentType: employmentType || 'salaried',
        isBTMode: true,
        loansForBT: existingLoans,
        btTotalEMI: totalLoanEMI,
        btTotalOutstanding: totalLoanPOS,
        state: userData.state || '',
        city: userData.city || ''
    };

    const bankCalculators = [
        { name: 'Kotak Mahindra Bank', calc: calculateKotakEligibility, config: kotakConfig },
        { name: 'HDFC Bank', calc: calculateHdfcEligibility, config: hdfcConfig },
        { name: 'ICICI Bank', calc: calculateIciciEligibility, config: iciciConfig },
        { name: 'Bandhan Bank', calc: calculateBandhanEligibility, config: bandhanConfig },
        { name: 'Cholamandalam Finance', calc: calculateCholaEligibility, config: cholaConfig },
        { name: 'Tata Capital', calc: calculateTataEligibility, config: tataConfig },
        { name: 'Poonawala Finance', calc: calculatePoonawalaEligibility, config: poonawalaConfig },
        { name: 'Axis Finance', calc: calculateAxisFinEligibility, config: axisFinConfig },
        { name: 'IndusInd Bank', calc: calculateIndusindEligibility, config: indusindConfig },
        { name: 'IDFC Bank', calc: calculateIdfcEligibility, config: idfcConfig },
        { name: 'Shri Ram Finance', calc: calculateShriRamEligibility, config: shriRamConfig },
        { name: 'Piramal Finance', calc: calculatePiramalEligibility, config: piramalConfig }
    ];

    return bankCalculators.map(({ name, calc, config }) => {
        try {
            // Basic BT checks (Availability, Fintech)
            if (config.btConfig && !config.btConfig.isAvailable) {
                return { bankName: name, eligible: false, reason: 'BT not available at this bank', btType: 'BT' };
            }

            const result = calc(btInput);
            if (!result.eligible) return { ...result, bankName: name, btType: 'BT' };

            const maxLoanAmount = result.maxLoanAmount || result.loanAmount;
            const freshAmount = maxLoanAmount - totalDebtToClear;

            if (freshAmount <= 0) {
                return { bankName: name, eligible: false, reason: 'Existing debt exceeds max capacity', btType: 'BT' };
            }

            return {
                ...result,
                bankName: name,
                eligible: true,
                btType: 'BT',
                maxLoanAmount: Math.round(maxLoanAmount),
                totalDebtCleared: Math.round(totalDebtToClear),
                freshAmountDisbursed: Math.round(freshAmount),
                emiSavings: Math.round(totalLoanEMI - result.monthlyEMI)
            };
        } catch (error) {
            console.error(`🚨 BT Backend Failure in ${name}:`, error);
            return { bankName: name, eligible: false, reason: 'Server BT calculation error' };
        }
    });
};
