/**
 * Balance Transfer (BT) Loan Calculation Service
 * 
 * This service implements the "magical" BT logic where existing personal loans
 * are consolidated into a new single loan, providing fresh funds to the customer.
 * 
 * Key Concepts:
 * - BT (Balance Transfer): Consolidating existing personal loans into one new loan
 * - POS (Principal Outstanding): Current remaining balance of a loan
 * - Traditional vs BT: BT ignores current EMIs to calculate full capacity, then deducts POS
 */

// Import all bank calculators
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

// Import bank configurations for BT capping
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

/**
 * Calculate EMI for a given loan amount, interest rate, and tenure
 * @param {number} principal - Loan amount
 * @param {number} annualInterestRate - Annual interest rate (percentage)
 * @param {number} tenureInYears - Loan tenure in years
 * @returns {number} Monthly EMI
 */
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return principal / numberOfMonths;
  }

  const emi = principal * monthlyInterestRate *
    Math.pow(1 + monthlyInterestRate, numberOfMonths) /
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);

  return Math.round(emi);
};

/**
 * Calculate loan amount from EMI, interest rate, and tenure
 * @param {number} emi - Monthly EMI
 * @param {number} annualInterestRate - Annual interest rate (percentage)
 * @param {number} tenureInYears - Loan tenure in years
 * @returns {number} Loan amount
 */
const calculateLoanAmountFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return emi * numberOfMonths;
  }

  const loanAmount = emi *
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1) /
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths));

  return Math.round(loanAmount);
};

/**
 * Full BT Calculation - All existing loans to be transferred
 * 
 * Process:
 * 1. Calculate full EMI capacity (ignoring current EMIs)
 * 2. Calculate maximum eligible loan amount
 * 3. Deduct total POS of all existing loans
 * 4. Fresh amount = Max Loan - Total POS
 * 
 * @param {Object} userData - User data with existing loans
 * @returns {Promise<Array>} BT calculation results for all banks
 */
export const calculateFullBT = async (userData) => {
  const {
    monthlyIncome,
    existingLoans, // Array of {emi, pos, loanName, type, creditLimitUsed}
    loanTenure,
    category,
    companyName,
    creditScore,
    employmentType
  } = userData;

  // Calculate total EMI and POS of all existing loans
  const totalExistingEMI = existingLoans.reduce((sum, loan) => sum + parseFloat(loan.emi || 0), 0);
  const totalPOS = existingLoans.reduce((sum, loan) => sum + parseFloat(loan.pos || 0), 0);

  // NEW: Calculate credit card obligation (5% of non-BT credit card balances)
  // For full BT, all loans are being cleared, so credit card obligation = 0
  const creditCardObligation = 0;

  // For BT, we ignore existing EMI and use full salary to calculate capacity
  const btInput = {
    desiredLoanAmount: null, // We'll calculate max amount
    loanTenure: parseInt(loanTenure),
    monthlyIncome: parseFloat(monthlyIncome),
    existingEMI: 0, // KEY: Set to 0 for BT calculation
    creditCardObligation: creditCardObligation, // NEW: Pass credit card obligation
    companyName: companyName,
    category: category || 'C',
    creditScore: parseInt(creditScore) || 700,
    employmentType: employmentType || 'salaried',
    // BT-specific fields
    isBTMode: true,
    loansForBT: existingLoans,
    btTotalEMI: totalExistingEMI,
    btTotalOutstanding: totalPOS,
    // Location Data for Pan-India Rules
    state: userData.state || (userData._metadata && userData._metadata.state) || '',
    city: userData.city || (userData._metadata && userData._metadata.city) || ''
  };

  // Array of bank calculators with configurations
  const bankCalculators = [
    { name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility, config: kotakConfig },
    { name: 'HDFC Bank', calculator: calculateHdfcEligibility, config: hdfcConfig },
    { name: 'ICICI Bank', calculator: calculateIciciEligibility, config: iciciConfig },
    { name: 'Bandhan Bank', calculator: calculateBandhanEligibility, config: bandhanConfig },
    { name: 'Cholamandalam Finance', calculator: calculateCholaEligibility, config: cholaConfig },
    { name: 'Tata Capital', calculator: calculateTataEligibility, config: tataConfig },
    { name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility, config: poonawalaConfig },
    { name: 'Axis Finance', calculator: calculateAxisFinEligibility, config: axisFinConfig },
    { name: 'IndusInd Bank', calculator: calculateIndusindEligibility, config: indusindConfig },
    { name: 'IDFC Bank', calculator: calculateIdfcEligibility, config: idfcConfig },
    { name: 'Shri Ram Finance', calculator: calculateShriRamEligibility, config: shriRamConfig },
    { name: 'Piramal Finance', calculator: calculatePiramalEligibility, config: piramalConfig }
  ];

  // Calculate BT eligibility for each bank
  const results = bankCalculators.map(({ name, calculator, config }) => {
    try {
      // Check BT loan capping constraint
      const numberOfLoans = existingLoans.length;

      // Check if bank offers BT
      if (config.btConfig && !config.btConfig.isAvailable) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `${config.name || name} does not offer Balance Transfer facility for personal loans`,
          btType: 'FULL_BT',
          btCappingIssue: true
        };
      }

      // Check for Fintech loans if bank doesn't accept them
      const hasFintechLoans = existingLoans.some(loan => loan.isFintechLoan === true || loan.loanSource === 'fintech');
      if (hasFintechLoans && config.btConfig && config.btConfig.acceptsFintechLoans === false) {
        const fintechLoanCount = existingLoans.filter(loan => loan.isFintechLoan === true || loan.loanSource === 'fintech').length;
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Fintech Loan Policy: ${config.name || name} does not accept Balance Transfer for loans from Fintech/digital lending platforms. You have ${fintechLoanCount} Fintech loan(s).`,
          btType: 'FULL_BT',
          fintechLoanIssue: true,
          fintechLoansCount: fintechLoanCount
        };
      }

      // Check loan capping limit
      if (config.btConfig && config.btConfig.maxLoansForBT < numberOfLoans) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Loan Capping Exceeded: You have ${numberOfLoans} existing loans, but ${config.name || name} allows BT for maximum ${config.btConfig.maxLoansForBT} loans`,
          btType: 'FULL_BT',
          btCappingIssue: true,
          maxLoansAllowed: config.btConfig.maxLoansForBT,
          currentLoans: numberOfLoans
        };
      }

      const result = calculator(btInput);

      if (!result.eligible) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: result.reason,
          btType: 'FULL_BT'
        };
      }

      // Calculate BT-specific values
      const maxLoanAmount = result.maxLoanAmount || result.loanAmount;
      const freshAmount = maxLoanAmount - totalPOS;

      // Check if fresh amount is positive
      if (freshAmount <= 0) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: `Total POS (₹${totalPOS.toLocaleString()}) exceeds max loan capacity (₹${maxLoanAmount.toLocaleString()})`,
          btType: 'FULL_BT'
        };
      }

      return {
        bankName: result.bankName || name,
        eligible: true,
        btType: 'FULL_BT',

        // BT-specific fields
        maxLoanAmount: Math.round(maxLoanAmount),
        totalPOS: Math.round(totalPOS),
        freshAmountDisbursed: Math.round(freshAmount),

        // Loan details
        newSingleEMI: result.monthlyEMI,
        interestRate: result.interestRate,
        tenure: loanTenure,
        processingFee: result.processingFee,

        // Previous loan details
        previousTotalEMI: Math.round(totalExistingEMI),
        numberOfLoansConsolidated: existingLoans.length,

        // Savings/Changes
        emiDifference: Math.round(result.monthlyEMI - totalExistingEMI),

        // Full result
        ...result
      };
    } catch (error) {
      console.error(`Error calculating BT for ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'BT calculation error occurred',
        btType: 'FULL_BT'
      };
    }
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(results);
    }, 500);
  });
};

/**
 * Partial BT Calculation - Only selected loans to be transferred
 * 
 * Process:
 * 1. Deduct EMIs of non-BT loans from salary (Adjusted Salary)
 * 2. Calculate EMI capacity based on Adjusted Salary
 * 3. Calculate maximum eligible loan amount
 * 4. Deduct POS of only selected BT loans
 * 5. Fresh amount = Max Loan - Selected POS
 * 
 * @param {Object} userData - User data with selected loans for BT
 * @returns {Promise<Array>} Partial BT calculation results for all banks
 */
export const calculatePartialBT = async (userData) => {
  const {
    monthlyIncome,
    existingLoans, // Array of {emi, pos, loanName, selectedForBT: boolean, type, creditLimitUsed}
    loanTenure,
    category,
    companyName,
    creditScore,
    employmentType
  } = userData;

  // Separate loans into BT and non-BT
  const loansForBT = existingLoans.filter(loan => loan.selectedForBT === true);
  const loansNotForBT = existingLoans.filter(loan => loan.selectedForBT !== true);

  // Calculate totals for BT loans
  const btLoansEMI = loansForBT.reduce((sum, loan) => sum + parseFloat(loan.emi || 0), 0);
  const btLoansPOS = loansForBT.reduce((sum, loan) => sum + parseFloat(loan.pos || 0), 0);

  // Calculate totals for non-BT loans
  const nonBTLoansEMI = loansNotForBT.reduce((sum, loan) => sum + parseFloat(loan.emi || 0), 0);

  // NEW: Calculate credit card obligation (5% of non-BT credit card balances)
  const creditCardObligation = loansNotForBT.reduce((sum, loan) => {
    // Check if loan is a credit card and NOT selected for BT
    if (loan.type === 'Credit Card' && loan.creditLimitUsed) {
      return sum + (parseFloat(loan.creditLimitUsed) * 0.05);
    }
    return sum;
  }, 0);

  // Calculate Adjusted Salary (Key difference from Full BT)
  const adjustedSalary = parseFloat(monthlyIncome) - nonBTLoansEMI - creditCardObligation;

  // Prepare input for bank calculators
  const btInput = {
    desiredLoanAmount: null, // We'll calculate max amount
    loanTenure: parseInt(loanTenure),
    monthlyIncome: adjustedSalary, // Using adjusted salary
    existingEMI: 0, // Set to 0 since we already adjusted salary
    creditCardObligation: creditCardObligation, // NEW: Pass credit card obligation
    companyName: companyName,
    category: category || 'C',
    creditScore: parseInt(creditScore) || 700,
    employmentType: employmentType || 'salaried',
    // BT-specific fields
    isBTMode: true,
    loansForBT: loansForBT,
    btTotalEMI: btLoansEMI,
    btTotalOutstanding: btLoansPOS,
    existingLoanBanks: loansNotForBT.map(loan => loan.lender || loan.loanName || '').filter(Boolean),
    // Location Data for Pan-India Rules
    state: userData.state || (userData._metadata && userData._metadata.state) || '',
    city: userData.city || (userData._metadata && userData._metadata.city) || ''
  };

  // Array of bank calculators with configurations
  const bankCalculators = [
    { name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility, config: kotakConfig },
    { name: 'HDFC Bank', calculator: calculateHdfcEligibility, config: hdfcConfig },
    { name: 'ICICI Bank', calculator: calculateIciciEligibility, config: iciciConfig },
    { name: 'Bandhan Bank', calculator: calculateBandhanEligibility, config: bandhanConfig },
    { name: 'Cholamandalam Finance', calculator: calculateCholaEligibility, config: cholaConfig },
    { name: 'Tata Capital', calculator: calculateTataEligibility, config: tataConfig },
    { name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility, config: poonawalaConfig },
    { name: 'Axis Finance', calculator: calculateAxisFinEligibility, config: axisFinConfig },
    { name: 'IndusInd Bank', calculator: calculateIndusindEligibility, config: indusindConfig },
    { name: 'IDFC Bank', calculator: calculateIdfcEligibility, config: idfcConfig },
    { name: 'Shri Ram Finance', calculator: calculateShriRamEligibility, config: shriRamConfig },
    { name: 'Piramal Finance', calculator: calculatePiramalEligibility, config: piramalConfig }
  ];

  // Calculate partial BT eligibility for each bank
  const results = bankCalculators.map(({ name, calculator, config }) => {
    try {
      // Check BT loan capping constraint
      const numberOfBTLoans = loansForBT.length;

      // Check if bank offers BT
      if (config.btConfig && !config.btConfig.isAvailable) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `${config.name || name} does not offer Balance Transfer facility for personal loans`,
          btType: 'PARTIAL_BT',
          btCappingIssue: true
        };
      }

      // Check for Fintech loans in selected BT loans
      const hasFintechLoans = loansForBT.some(loan => loan.isFintechLoan === true || loan.loanSource === 'fintech');
      if (hasFintechLoans && config.btConfig && config.btConfig.acceptsFintechLoans === false) {
        const fintechLoanCount = loansForBT.filter(loan => loan.isFintechLoan === true || loan.loanSource === 'fintech').length;
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Fintech Loan Policy: ${config.name || name} does not accept Balance Transfer for loans from Fintech/digital lending platforms. ${fintechLoanCount} of your selected loans are from Fintech lenders.`,
          btType: 'PARTIAL_BT',
          fintechLoanIssue: true,
          fintechLoansCount: fintechLoanCount
        };
      }

      // Check loan capping limit for selected BT loans
      if (config.btConfig && config.btConfig.maxLoansForBT < numberOfBTLoans) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Loan Capping Exceeded: You selected ${numberOfBTLoans} loans for BT, but ${config.name || name} allows BT for maximum ${config.btConfig.maxLoansForBT} loans`,
          btType: 'PARTIAL_BT',
          btCappingIssue: true,
          maxLoansAllowed: config.btConfig.maxLoansForBT,
          selectedLoansForBT: numberOfBTLoans
        };
      }

      const result = calculator(btInput);

      if (!result.eligible) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: result.reason,
          btType: 'PARTIAL_BT'
        };
      }

      // Calculate BT-specific values
      const maxLoanAmount = result.maxLoanAmount || result.loanAmount;
      const freshAmount = maxLoanAmount - btLoansPOS;

      // Check if fresh amount is positive
      if (freshAmount <= 0) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: `Selected loans POS (₹${btLoansPOS.toLocaleString()}) exceeds max loan capacity (₹${maxLoanAmount.toLocaleString()})`,
          btType: 'PARTIAL_BT'
        };
      }

      // Calculate total monthly outflow after BT
      const totalMonthlyOutflow = result.monthlyEMI + nonBTLoansEMI;

      return {
        bankName: result.bankName || name,
        eligible: true,
        btType: 'PARTIAL_BT',

        // BT-specific fields
        maxLoanAmount: Math.round(maxLoanAmount),
        selectedLoansPOS: Math.round(btLoansPOS),
        freshAmountDisbursed: Math.round(freshAmount),

        // Loan details
        newBTLoanEMI: result.monthlyEMI,
        interestRate: result.interestRate,
        tenure: loanTenure,
        processingFee: result.processingFee,

        // Adjusted salary calculation details
        originalSalary: parseFloat(monthlyIncome),
        nonBTLoansEMI: Math.round(nonBTLoansEMI),
        adjustedSalary: Math.round(adjustedSalary),

        // Loan consolidation details
        numberOfLoansConsolidated: loansForBT.length,
        numberOfLoansRemaining: loansNotForBT.length,
        consolidatedLoansEMI: Math.round(btLoansEMI),

        // Total outflow after BT
        totalMonthlyOutflow: Math.round(totalMonthlyOutflow),
        previousTotalEMI: Math.round(btLoansEMI + nonBTLoansEMI),
        emiDifference: Math.round(totalMonthlyOutflow - (btLoansEMI + nonBTLoansEMI)),

        // Full result
        ...result
      };
    } catch (error) {
      console.error(`Error calculating Partial BT for ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'Partial BT calculation error occurred',
        btType: 'PARTIAL_BT'
      };
    }
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(results);
    }, 500);
  });
};

/**
 * Calculate BT with Credit Card Inclusion - Customer agrees to BT both personal loans AND credit cards
 * 
 * Scenario 1: Customer Agrees to BT Both Personal Loans and Credit Cards
 * 
 * Process:
 * 1. Ignore all existing EMIs (both loans and credit cards)
 * 2. Calculate full EMI capacity based on full salary
 * 3. Calculate maximum eligible loan amount
 * 4. Deduct BOTH personal loan POS AND credit card outstanding (POS)
 * 5. Fresh amount = Max Loan - (Personal Loan POS + Credit Card POS)
 * 
 * Example:
 * - Salary: ₹95,000
 * - Personal Loans: 2 (EMI: ₹25,000, POS: ₹8 Lakhs)
 * - Credit Cards: 4 (Outstanding: ₹6 Lakhs)
 * - FOIR 70% = ₹66,500 EMI capacity
 * - Max Loan @ 11%, 6 years = ₹35,46,270
 * - Fresh Funding = ₹35,46,270 - ₹14,00,000 = ₹21,46,270
 * 
 * @param {Object} userData - User data with credit cards
 * @returns {Promise<Array>} BT calculation results for all banks
 */
export const calculateBTWithCreditCards = async (userData) => {
  const {
    monthlyIncome,
    existingLoans, // Array of {emi, pos, loanName}
    creditCards, // Array of {cardName, outstandingAmount}
    loanTenure,
    category,
    companyName,
    creditScore,
    employmentType
  } = userData;

  // DEBUG: Log received data
  console.log('📋 calculateBTWithCreditCards RECEIVED:');
  console.log('  existingLoans:', existingLoans);
  console.log('  creditCards:', creditCards);

  // Calculate total POS of personal loans
  const totalLoanPOS = existingLoans.reduce((sum, loan) => sum + parseFloat(loan.pos), 0);

  // Calculate total outstanding of credit cards
  const totalCreditCardPOS = creditCards.reduce((sum, card) => sum + parseFloat(card.outstandingAmount), 0);

  // Total debt to be cleared
  const totalDebtToClear = totalLoanPOS + totalCreditCardPOS;

  // DEBUG: Log calculated totals
  console.log('✅ CALCULATED TOTALS:');
  console.log('  totalLoanPOS:', totalLoanPOS);
  console.log('  totalCreditCardPOS:', totalCreditCardPOS);
  console.log('  totalDebtToClear:', totalDebtToClear);

  // For BT with credit cards, we ignore ALL existing payments and use full salary
  const btInput = {
    desiredLoanAmount: null, // We'll calculate max amount
    loanTenure: parseInt(loanTenure),
    monthlyIncome: parseFloat(monthlyIncome),
    existingEMI: 0, // KEY: Set to 0 for BT calculation (ignore all current payments)
    companyName: companyName,
    category: category || 'C',
    creditScore: parseInt(creditScore) || 700,
    employmentType: employmentType || 'salaried',
    // Location Data for Pan-India Rules
    state: userData.state || (userData._metadata && userData._metadata.state) || '',
    city: userData.city || (userData._metadata && userData._metadata.city) || ''
  };

  // Array of bank calculators with configurations
  const bankCalculators = [
    { name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility, config: kotakConfig },
    { name: 'HDFC Bank', calculator: calculateHdfcEligibility, config: hdfcConfig },
    { name: 'ICICI Bank', calculator: calculateIciciEligibility, config: iciciConfig },
    { name: 'Bandhan Bank', calculator: calculateBandhanEligibility, config: bandhanConfig },
    { name: 'Cholamandalam Finance', calculator: calculateCholaEligibility, config: cholaConfig },
    { name: 'Tata Capital', calculator: calculateTataEligibility, config: tataConfig },
    { name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility, config: poonawalaConfig },
    { name: 'Axis Finance', calculator: calculateAxisFinEligibility, config: axisFinConfig },
    { name: 'IndusInd Bank', calculator: calculateIndusindEligibility, config: indusindConfig },
    { name: 'IDFC Bank', calculator: calculateIdfcEligibility, config: idfcConfig },
    { name: 'Shri Ram Finance', calculator: calculateShriRamEligibility, config: shriRamConfig },
    { name: 'Piramal Finance', calculator: calculatePiramalEligibility, config: piramalConfig }
  ];

  // Calculate BT eligibility for each bank
  const results = bankCalculators.map(({ name, calculator, config }) => {
    try {
      // Check BT loan capping constraint (count only personal loans)
      const numberOfLoans = existingLoans.length;

      // Check if bank offers BT
      if (config.btConfig && !config.btConfig.isAvailable) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `${config.name || name} does not offer Balance Transfer facility for personal loans`,
          btType: 'BT_WITH_CREDIT_CARDS'
        };
      }

      // Check for Fintech loans
      const hasFintechLoans = existingLoans.some(loan => loan.isFintechLoan === true || loan.loanSource === 'fintech');
      if (hasFintechLoans && config.btConfig && config.btConfig.acceptsFintechLoans === false) {
        const fintechLoanCount = existingLoans.filter(loan => loan.isFintechLoan === true || loan.loanSource === 'fintech').length;
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Fintech Loan Policy: ${config.name || name} does not accept Balance Transfer for loans from Fintech/digital lending platforms. You have ${fintechLoanCount} Fintech loan(s).`,
          btType: 'BT_WITH_CREDIT_CARDS',
          fintechLoanIssue: true
        };
      }

      // Check loan capping limit
      if (config.btConfig && config.btConfig.maxLoansForBT < numberOfLoans) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Loan Capping Exceeded: You have ${numberOfLoans} existing loans, but ${config.name || name} allows BT for maximum ${config.btConfig.maxLoansForBT} loans`,
          btType: 'BT_WITH_CREDIT_CARDS',
          btCappingIssue: true
        };
      }

      const result = calculator(btInput);

      if (!result.eligible) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: result.reason,
          btType: 'BT_WITH_CREDIT_CARDS'
        };
      }

      // Calculate BT-specific values
      const maxLoanAmount = result.maxLoanAmount || result.loanAmount;
      const freshAmount = maxLoanAmount - totalDebtToClear;

      // Check if fresh amount is positive
      if (freshAmount <= 0) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: `Total debt (Loans: ₹${totalLoanPOS.toLocaleString()} + Credit Cards: ₹${totalCreditCardPOS.toLocaleString()} = ₹${totalDebtToClear.toLocaleString()}) exceeds max loan capacity (₹${maxLoanAmount.toLocaleString()})`,
          btType: 'BT_WITH_CREDIT_CARDS'
        };
      }

      return {
        bankName: result.bankName || name,
        eligible: true,
        btType: 'BT_WITH_CREDIT_CARDS',

        // BT-specific fields
        maxLoanAmount: Math.round(maxLoanAmount),
        totalPersonalLoanPOS: Math.round(totalLoanPOS),
        totalCreditCardOutstanding: Math.round(totalCreditCardPOS),
        totalDebtCleared: Math.round(totalDebtToClear),
        freshAmountDisbursed: Math.round(freshAmount),

        // Loan details
        newSingleEMI: result.monthlyEMI,
        interestRate: result.interestRate,
        tenure: loanTenure,
        processingFee: result.processingFee,

        // Consolidation details
        numberOfLoansConsolidated: existingLoans.length,
        numberOfCreditCardsCleared: creditCards.length,

        // Full result
        ...result
      };
    } catch (error) {
      console.error(`Error calculating BT with Credit Cards for ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'BT calculation error occurred',
        btType: 'BT_WITH_CREDIT_CARDS'
      };
    }
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(results);
    }, 500);
  });
};

/**
 * Calculate BT with Credit Card Obligation - Customer declines to BT credit cards
 * 
 * Scenario 2: Customer Declines Credit Card BT (Credit Card Obligation)
 * 
 * Process:
 * 1. Treat credit card outstanding as ongoing obligation
 * 2. Calculate Credit Card Monthly Obligation = 5% of outstanding amount
 * 3. Adjust salary by deducting credit card obligation
 * 4. Calculate EMI capacity based on adjusted salary
 * 5. Calculate maximum eligible loan amount
 * 6. Deduct ONLY personal loan POS (not credit cards)
 * 7. Fresh amount = Max Loan - Personal Loan POS
 * 8. Customer must continue managing credit card debt separately
 * 
 * Example:
 * - Salary: ₹95,000
 * - Personal Loans: 2 (EMI: ₹25,000, POS: ₹8 Lakhs)
 * - Credit Cards: 4 (Outstanding: ₹6 Lakhs)
 * - Credit Card Obligation = 5% of ₹6L = ₹30,000
 * - Adjusted Salary = ₹95,000 - ₹30,000 = ₹65,000
 * - FOIR 70% on ₹65,000 = ₹45,500 EMI capacity
 * - Max Loan @ 11%, 6 years = ₹23,64,180
 * - Fresh Funding = ₹23,64,180 - ₹8,00,000 = ₹15,64,180
 * 
 * @param {Object} userData - User data with credit cards
 * @returns {Promise<Array>} BT calculation results for all banks
 */
export const calculateBTWithCreditCardObligation = async (userData) => {
  const {
    monthlyIncome,
    existingLoans, // Array of {emi, pos, loanName}
    creditCards, // Array of {cardName, outstandingAmount}
    loanTenure,
    category,
    companyName,
    creditScore,
    employmentType
  } = userData;

  // Calculate total POS of personal loans
  const totalLoanPOS = existingLoans.reduce((sum, loan) => sum + parseFloat(loan.pos), 0);

  // Calculate total outstanding of credit cards
  const totalCreditCardOutstanding = creditCards.reduce((sum, card) => sum + parseFloat(card.outstandingAmount), 0);

  // KEY: Calculate Credit Card Obligation (5% of outstanding as monthly payment)
  const CREDIT_CARD_OBLIGATION_PERCENTAGE = 5; // 5% standard
  const creditCardMonthlyObligation = (totalCreditCardOutstanding * CREDIT_CARD_OBLIGATION_PERCENTAGE) / 100;

  // Calculate Adjusted Salary (deduct credit card obligation)
  const adjustedSalary = parseFloat(monthlyIncome) - creditCardMonthlyObligation;

  // Check if adjusted salary is positive
  if (adjustedSalary <= 0) {
    // Return all banks as ineligible
    const bankNames = [
      'Kotak Mahindra Bank', 'HDFC Bank', 'ICICI Bank', 'Bandhan Bank',
      'Cholamandalam Finance', 'Tata Capital', 'Poonawala Finance',
      'Axis Finance', 'IndusInd Bank', 'IDFC Bank', 'Shri Ram Finance', 'Piramal Finance'
    ];

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(bankNames.map(name => ({
          bankName: name,
          eligible: false,
          reason: `Credit card obligation (₹${Math.round(creditCardMonthlyObligation).toLocaleString()}) exceeds or equals your monthly income (₹${parseFloat(monthlyIncome).toLocaleString()})`,
          btType: 'BT_WITH_CC_OBLIGATION'
        })));
      }, 500);
    });
  }

  // For BT with credit card obligation, use adjusted salary
  const btInput = {
    desiredLoanAmount: null, // We'll calculate max amount
    loanTenure: parseInt(loanTenure),
    monthlyIncome: adjustedSalary, // KEY: Using adjusted salary after deducting CC obligation
    existingEMI: 0, // Set to 0 since we already adjusted salary
    companyName: companyName,
    category: category || 'C',
    creditScore: parseInt(creditScore) || 700,
    employmentType: employmentType || 'salaried',
    // Location Data for Pan-India Rules
    state: userData.state || (userData._metadata && userData._metadata.state) || '',
    city: userData.city || (userData._metadata && userData._metadata.city) || ''
  };

  // Array of bank calculators with configurations
  const bankCalculators = [
    { name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility, config: kotakConfig },
    { name: 'HDFC Bank', calculator: calculateHdfcEligibility, config: hdfcConfig },
    { name: 'ICICI Bank', calculator: calculateIciciEligibility, config: iciciConfig },
    { name: 'Bandhan Bank', calculator: calculateBandhanEligibility, config: bandhanConfig },
    { name: 'Cholamandalam Finance', calculator: calculateCholaEligibility, config: cholaConfig },
    { name: 'Tata Capital', calculator: calculateTataEligibility, config: tataConfig },
    { name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility, config: poonawalaConfig },
    { name: 'Axis Finance', calculator: calculateAxisFinEligibility, config: axisFinConfig },
    { name: 'IndusInd Bank', calculator: calculateIndusindEligibility, config: indusindConfig },
    { name: 'IDFC Bank', calculator: calculateIdfcEligibility, config: idfcConfig },
    { name: 'Shri Ram Finance', calculator: calculateShriRamEligibility, config: shriRamConfig },
    { name: 'Piramal Finance', calculator: calculatePiramalEligibility, config: piramalConfig }
  ];

  // Calculate BT eligibility for each bank
  const results = bankCalculators.map(({ name, calculator, config }) => {
    try {
      // Check BT loan capping constraint
      const numberOfLoans = existingLoans.length;

      // Check if bank offers BT
      if (config.btConfig && !config.btConfig.isAvailable) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `${config.name || name} does not offer Balance Transfer facility for personal loans`,
          btType: 'BT_WITH_CC_OBLIGATION'
        };
      }

      // Check for Fintech loans
      const hasFintechLoans = existingLoans.some(loan => loan.isFintechLoan === true || loan.loanSource === 'fintech');
      if (hasFintechLoans && config.btConfig && config.btConfig.acceptsFintechLoans === false) {
        const fintechLoanCount = existingLoans.filter(loan => loan.isFintechLoan === true || loan.loanSource === 'fintech').length;
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Fintech Loan Policy: ${config.name || name} does not accept Balance Transfer for loans from Fintech/digital lending platforms. You have ${fintechLoanCount} Fintech loan(s).`,
          btType: 'BT_WITH_CC_OBLIGATION',
          fintechLoanIssue: true
        };
      }

      // Check loan capping limit
      if (config.btConfig && config.btConfig.maxLoansForBT < numberOfLoans) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Loan Capping Exceeded: You have ${numberOfLoans} existing loans, but ${config.name || name} allows BT for maximum ${config.btConfig.maxLoansForBT} loans`,
          btType: 'BT_WITH_CC_OBLIGATION',
          btCappingIssue: true
        };
      }

      const result = calculator(btInput);

      if (!result.eligible) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: result.reason,
          btType: 'BT_WITH_CC_OBLIGATION'
        };
      }

      // Calculate BT-specific values
      const maxLoanAmount = result.maxLoanAmount || result.loanAmount;
      const freshAmount = maxLoanAmount - totalLoanPOS; // Only deduct personal loan POS

      // Check if fresh amount is positive
      if (freshAmount <= 0) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: `Personal loan POS (₹${totalLoanPOS.toLocaleString()}) exceeds max loan capacity (₹${maxLoanAmount.toLocaleString()}) after accounting for credit card obligation`,
          btType: 'BT_WITH_CC_OBLIGATION'
        };
      }

      // Calculate total monthly outflow after BT
      const totalMonthlyOutflow = result.monthlyEMI + creditCardMonthlyObligation;

      return {
        bankName: result.bankName || name,
        eligible: true,
        btType: 'BT_WITH_CC_OBLIGATION',

        // BT-specific fields
        maxLoanAmount: Math.round(maxLoanAmount),
        totalPersonalLoanPOS: Math.round(totalLoanPOS),
        freshAmountDisbursed: Math.round(freshAmount),

        // Loan details
        newBTLoanEMI: result.monthlyEMI,
        interestRate: result.interestRate,
        tenure: loanTenure,
        processingFee: result.processingFee,

        // Credit Card Obligation details
        totalCreditCardOutstanding: Math.round(totalCreditCardOutstanding),
        creditCardMonthlyObligation: Math.round(creditCardMonthlyObligation),
        creditCardObligationPercentage: CREDIT_CARD_OBLIGATION_PERCENTAGE,
        numberOfCreditCards: creditCards.length,

        // Salary adjustment details
        originalSalary: parseFloat(monthlyIncome),
        adjustedSalary: Math.round(adjustedSalary),
        salaryReduction: Math.round(creditCardMonthlyObligation),

        // Total outflow
        totalMonthlyOutflow: Math.round(totalMonthlyOutflow),

        // Consolidation details
        numberOfLoansConsolidated: existingLoans.length,

        // Important note
        importantNote: `Customer must continue managing ₹${Math.round(totalCreditCardOutstanding).toLocaleString()} credit card debt separately. Minimum monthly payment: ₹${Math.round(creditCardMonthlyObligation).toLocaleString()}`,

        // Full result
        ...result
      };
    } catch (error) {
      console.error(`Error calculating BT with CC Obligation for ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'BT calculation error occurred',
        btType: 'BT_WITH_CC_OBLIGATION'
      };
    }
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(results);
    }, 500);
  });
};

/**
 * Smart BT Calculator - Automatically determines Full or Partial BT
 * @param {Object} userData - User data
 * @returns {Promise<Array>} BT calculation results
 */
export const calculateSmartBT = async (userData) => {
  const { existingLoans } = userData;

  // Check if all loans are selected for BT
  const allLoansSelected = existingLoans.every(loan => loan.selectedForBT === true);

  if (allLoansSelected) {
    return calculateFullBT(userData);
  } else {
    return calculatePartialBT(userData);
  }
};

/**
 * Get BT recommendations - Suggests best banks for BT
 * @param {Array} btResults - Results from BT calculation
 * @returns {Object} Recommendations
 */
export const getBTRecommendations = (btResults) => {
  // Filter eligible banks
  const eligibleBanks = btResults.filter(result => result.eligible);

  if (eligibleBanks.length === 0) {
    return {
      hasRecommendations: false,
      message: 'No banks eligible for Balance Transfer with current profile'
    };
  }

  // Sort by fresh amount (descending)
  const sortedByFreshAmount = [...eligibleBanks].sort(
    (a, b) => b.freshAmountDisbursed - a.freshAmountDisbursed
  );

  // Sort by lowest EMI
  const sortedByEMI = [...eligibleBanks].sort(
    (a, b) => (a.newSingleEMI || a.newBTLoanEMI) - (b.newSingleEMI || b.newBTLoanEMI)
  );

  // Sort by lowest interest rate
  const sortedByInterest = [...eligibleBanks].sort(
    (a, b) => a.interestRate - b.interestRate
  );

  return {
    hasRecommendations: true,
    bestForFreshFunds: sortedByFreshAmount[0],
    bestForLowEMI: sortedByEMI[0],
    bestForLowInterest: sortedByInterest[0],
    totalEligibleBanks: eligibleBanks.length,
    allEligible: eligibleBanks
  };
};
