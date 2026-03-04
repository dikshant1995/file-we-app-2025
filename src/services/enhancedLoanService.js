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
 * Calculate Fresh Loan Eligibility (without BT)
 * @param {Object} customerInfo - Customer financial information
 * @returns {Promise<Array>} Results from all banks for fresh loan
 */
export const calculateFreshLoan = async (customerInfo) => {
  // Transform form data to match calculator expectations
  const calculatorInput = {
    desiredLoanAmount: customerInfo.desiredLoanAmount ? parseFloat(customerInfo.desiredLoanAmount) : null,
    loanTenure: customerInfo.loanTenure ? parseInt(customerInfo.loanTenure) : 5,
    monthlyIncome: customerInfo.monthlyIncome ? parseFloat(customerInfo.monthlyIncome) : 0,
    existingEMI: 0, // For fresh loan, we start with 0 existing EMI
    companyName: customerInfo.companyName || '',
    category: customerInfo.category || 'A',
    creditScore: customerInfo.creditScore ? parseInt(customerInfo.creditScore) : 700,
    employmentType: customerInfo.employmentType || 'salaried',
    state: customerInfo.state || '',
    city: customerInfo.city || ''
  };

  // Array of bank calculators with their names
  const bankCalculators = [
    { name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility },
    { name: 'HDFC Bank', calculator: calculateHdfcEligibility },
    { name: 'ICICI Bank', calculator: calculateIciciEligibility },
    { name: 'Bandhan Bank', calculator: calculateBandhanEligibility },
    { name: 'Cholamandalam Finance', calculator: calculateCholaEligibility },
    { name: 'Tata Capital', calculator: calculateTataEligibility },
    { name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility },
    { name: 'Axis Finance', calculator: calculateAxisFinEligibility },
    { name: 'IndusInd Bank', calculator: calculateIndusindEligibility },
    { name: 'IDFC Bank', calculator: calculateIdfcEligibility },
    { name: 'Shri Ram Finance', calculator: calculateShriRamEligibility },
    { name: 'Piramal Finance', calculator: calculatePiramalEligibility }
  ];

  // Calculate eligibility for each bank
  const results = bankCalculators.map(({ name, calculator }) => {
    try {
      const result = calculator(calculatorInput);
      return {
        bankName: result.bankName || name,
        ...result
      };
    } catch (error) {
      console.error(`Error calculating fresh loan for ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'Calculation error occurred: ' + error.message
      };
    }
  });

  return results;
};

/**
 * Calculate Full Balance Transfer (all existing loans)
 * @param {Object} customerInfo - Customer financial information
 * @param {Array} existingLiabilities - All existing loans and credit cards
 * @returns {Promise<Array>} Results from all banks for full BT
 */
export const calculateFullBT = async (customerInfo, existingLiabilities) => {
  // Filter out only the liabilities with valid outstanding amounts
  const validLiabilities = existingLiabilities.filter(liability =>
    liability.outstandingAmount && parseFloat(liability.outstandingAmount) > 0
  );

  if (validLiabilities.length === 0) {
    // If no valid liabilities, return fresh loan results
    return await calculateFreshLoan(customerInfo);
  }

  // Calculate total POS (Principal Outstanding) of all existing loans
  const totalPOS = validLiabilities.reduce((sum, liability) =>
    sum + parseFloat(liability.outstandingAmount), 0);

  // Calculate total existing EMI (for information only, not used in BT calculation)
  const totalExistingEMI = validLiabilities.reduce((sum, liability) =>
    sum + (parseFloat(liability.monthlyPayment) || 0), 0);

  // For BT, we ignore existing EMI and use full salary to calculate capacity
  const btInput = {
    desiredLoanAmount: null, // We'll calculate max amount
    loanTenure: customerInfo.loanTenure ? parseInt(customerInfo.loanTenure) : 5,
    monthlyIncome: customerInfo.monthlyIncome ? parseFloat(customerInfo.monthlyIncome) : 0,
    existingEMI: 0, // KEY: Set to 0 for BT calculation
    companyName: customerInfo.companyName || '',
    category: customerInfo.category || 'A',
    creditScore: customerInfo.creditScore ? parseInt(customerInfo.creditScore) : 700,
    employmentType: customerInfo.employmentType || 'salaried',
    state: customerInfo.state || '',
    city: customerInfo.city || ''
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
      const numberOfLoans = validLiabilities.length;

      // Check if bank offers BT
      if (config.btConfig && !config.btConfig.isAvailable) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `${config.name || name} does not offer Balance Transfer facility for personal loans`
        };
      }

      // Check for Fintech loans if bank doesn't accept them
      const hasFintechLoans = validLiabilities.some(liability =>
        liability.isFintechLoan === true || liability.loanSource === 'fintech');
      if (hasFintechLoans && config.btConfig && config.btConfig.acceptsFintechLoans === false) {
        const fintechLoanCount = validLiabilities.filter(liability =>
          liability.isFintechLoan === true || liability.loanSource === 'fintech').length;
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Fintech Loan Policy: ${config.name || name} does not accept Balance Transfer for loans from Fintech/digital lending platforms. You have ${fintechLoanCount} Fintech loan(s).`
        };
      }

      // Check loan capping limit
      if (config.btConfig && config.btConfig.maxLoansForBT < numberOfLoans) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Loan Capping Exceeded: You have ${numberOfLoans} existing loans, but ${config.name || name} allows BT for maximum ${config.btConfig.maxLoansForBT} loans`
        };
      }

      const result = calculator(btInput);

      if (!result.eligible) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: result.reason
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
          reason: `Total outstanding amount (₹${totalPOS.toLocaleString()}) exceeds maximum loan eligibility (₹${maxLoanAmount.toLocaleString()}). Not eligible for BT.`
        };
      }

      // Return BT result with additional information
      return {
        bankName: result.bankName || name,
        eligible: true,
        maxLoanAmount: maxLoanAmount,
        freshAmountDisbursed: freshAmount,
        totalPOS: totalPOS,
        totalExistingEMI: totalExistingEMI,
        newBTLoanEMI: result.monthlyEMI,
        newSingleEMI: result.monthlyEMI,
        interestRate: result.interestRate || 11, // Default to 11% if not provided
        tenure: btInput.loanTenure,
        calculationMethod: result.calculationMethod || 'BT Calculation'
      };
    } catch (error) {
      console.error(`Error calculating full BT for ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'Calculation error occurred: ' + error.message
      };
    }
  });

  return results;
};

/**
 * Calculate Partial Balance Transfer (selected loans only)
 * @param {Object} customerInfo - Customer financial information
 * @param {Array} existingLiabilities - All existing loans and credit cards
 * @param {Array} selectedLiabilityIds - IDs of selected liabilities for partial BT
 * @returns {Promise<Array>} Results from all banks for partial BT
 */
export const calculatePartialBT = async (customerInfo, existingLiabilities, selectedLiabilityIds) => {
  // Filter only selected liabilities
  const selectedLiabilities = existingLiabilities.filter(liability =>
    selectedLiabilityIds.includes(liability.id)
  );

  // Filter out only the liabilities with valid outstanding amounts
  const validSelectedLiabilities = selectedLiabilities.filter(liability =>
    liability.outstandingAmount && parseFloat(liability.outstandingAmount) > 0
  );

  if (validSelectedLiabilities.length === 0) {
    // If no selected liabilities, return fresh loan results
    return await calculateFreshLoan(customerInfo);
  }

  // Calculate total POS of selected loans
  const selectedPOS = validSelectedLiabilities.reduce((sum, liability) =>
    sum + parseFloat(liability.outstandingAmount), 0);

  // Calculate total existing EMI of selected loans (for information only)
  const selectedExistingEMI = validSelectedLiabilities.reduce((sum, liability) =>
    sum + (parseFloat(liability.monthlyPayment) || 0), 0);

  // Calculate total existing EMI of non-selected loans (these will continue separately)
  const nonSelectedLiabilities = existingLiabilities.filter(liability =>
    !selectedLiabilityIds.includes(liability.id) &&
    liability.outstandingAmount && parseFloat(liability.outstandingAmount) > 0
  );

  const nonSelectedEMI = nonSelectedLiabilities.reduce((sum, liability) =>
    sum + (parseFloat(liability.monthlyPayment) || 0), 0);

  // For partial BT, we use adjusted salary (full salary minus non-selected EMI)
  // But for the BT calculation itself, we still ignore existing EMIs
  const btInput = {
    desiredLoanAmount: null, // We'll calculate max amount
    loanTenure: customerInfo.loanTenure ? parseInt(customerInfo.loanTenure) : 5,
    monthlyIncome: customerInfo.monthlyIncome ? parseFloat(customerInfo.monthlyIncome) : 0,
    existingEMI: 0, // Still set to 0 for BT calculation
    companyName: customerInfo.companyName || '',
    category: customerInfo.category || 'A',
    creditScore: customerInfo.creditScore ? parseInt(customerInfo.creditScore) : 700,
    employmentType: customerInfo.employmentType || 'salaried',
    state: customerInfo.state || '',
    city: customerInfo.city || ''
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
      const numberOfLoans = validSelectedLiabilities.length;

      // Check if bank offers BT
      if (config.btConfig && !config.btConfig.isAvailable) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `${config.name || name} does not offer Balance Transfer facility for personal loans`
        };
      }

      // Check for Fintech loans if bank doesn't accept them
      const hasFintechLoans = validSelectedLiabilities.some(liability =>
        liability.isFintechLoan === true || liability.loanSource === 'fintech');
      if (hasFintechLoans && config.btConfig && config.btConfig.acceptsFintechLoans === false) {
        const fintechLoanCount = validSelectedLiabilities.filter(liability =>
          liability.isFintechLoan === true || liability.loanSource === 'fintech').length;
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Fintech Loan Policy: ${config.name || name} does not accept Balance Transfer for loans from Fintech/digital lending platforms. You have ${fintechLoanCount} Fintech loan(s).`
        };
      }

      // Check loan capping limit
      if (config.btConfig && config.btConfig.maxLoansForBT < numberOfLoans) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Loan Capping Exceeded: You have ${numberOfLoans} selected loans, but ${config.name || name} allows BT for maximum ${config.btConfig.maxLoansForBT} loans`
        };
      }

      const result = calculator(btInput);

      if (!result.eligible) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: result.reason
        };
      }

      // Calculate BT-specific values
      const maxLoanAmount = result.maxLoanAmount || result.loanAmount;
      const freshAmount = maxLoanAmount - selectedPOS;

      // Check if fresh amount is positive
      if (freshAmount <= 0) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: `Selected outstanding amount (₹${selectedPOS.toLocaleString()}) exceeds maximum loan eligibility (₹${maxLoanAmount.toLocaleString()}). Not eligible for partial BT.`
        };
      }

      // Return BT result with additional information
      return {
        bankName: result.bankName || name,
        eligible: true,
        maxLoanAmount: maxLoanAmount,
        freshAmountDisbursed: freshAmount,
        selectedPOS: selectedPOS,
        selectedExistingEMI: selectedExistingEMI,
        nonSelectedEMI: nonSelectedEMI,
        newBTLoanEMI: result.monthlyEMI,
        newSingleEMI: result.monthlyEMI,
        totalMonthlyOutflow: result.monthlyEMI + nonSelectedEMI,
        interestRate: result.interestRate || 11, // Default to 11% if not provided
        tenure: btInput.loanTenure,
        calculationMethod: result.calculationMethod || 'Partial BT Calculation',
        selectedLiabilities: validSelectedLiabilities,
        nonSelectedLiabilities: nonSelectedLiabilities
      };
    } catch (error) {
      console.error(`Error calculating partial BT for ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'Calculation error occurred: ' + error.message
      };
    }
  });

  return results;
};

/**
 * Calculate all three loan scenarios
 * @param {Object} formData - Complete form data including customer info and liabilities
 * @returns {Promise<Object>} Results for all three scenarios
 */
export const calculateAllScenarios = async (formData) => {
  const { customerInfo, existingLiabilities, selectedLiabilities } = formData;

  try {
    // Calculate all three scenarios in parallel
    const [freshLoanResults, fullBTResults, partialBTResults] = await Promise.all([
      calculateFreshLoan(customerInfo),
      calculateFullBT(customerInfo, existingLiabilities),
      calculatePartialBT(customerInfo, existingLiabilities, selectedLiabilities)
    ]);

    return {
      freshLoan: freshLoanResults,
      fullBT: fullBTResults,
      partialBT: partialBTResults,
      selectedLiabilities: existingLiabilities.filter(liability =>
        selectedLiabilities.includes(liability.id))
    };
  } catch (error) {
    console.error('Error calculating all scenarios:', error);
    throw new Error('Failed to calculate loan scenarios: ' + error.message);
  }
};