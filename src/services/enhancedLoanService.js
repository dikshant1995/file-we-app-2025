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

// Import bank configuration service for logic bridge
import { getBankConfig, getAllBankConfig } from './bankConfigService.js';

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

  const location = (calculatorInput.city && calculatorInput.state)
    ? `${calculatorInput.city}, ${calculatorInput.state}`
    : (calculatorInput.city || calculatorInput.state);

  // Array of bank calculators with their names
  const bankCalculators = [
    { id: 'kotak', name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility },
    { id: 'hdfc', name: 'HDFC Bank', calculator: calculateHdfcEligibility },
    { id: 'icici', name: 'ICICI Bank', calculator: calculateIciciEligibility },
    { id: 'bandhan', name: 'Bandhan Bank', calculator: calculateBandhanEligibility },
    { id: 'chola', name: 'Cholamandalam Finance', calculator: calculateCholaEligibility },
    { id: 'tata', name: 'Tata Capital', calculator: calculateTataEligibility },
    { id: 'poonawala', name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility },
    { id: 'axis', name: 'Axis Finance', calculator: calculateAxisFinEligibility },
    { id: 'indusind', name: 'IndusInd Bank', calculator: calculateIndusindEligibility },
    { id: 'idfc', name: 'IDFC Bank', calculator: calculateIdfcEligibility },
    { id: 'shriram', name: 'Shri Ram Finance', calculator: calculateShriRamEligibility },
    { id: 'piramal', name: 'Piramal Finance', calculator: calculatePiramalEligibility }
  ];

  const results = bankCalculators.map(({ id, name, calculator }, index) => {
    try {
      const adminAllConfig = getAllBankConfig(name, location);

      const bankInput = {
        ...calculatorInput,
        // Inject Overrides
        incentivePercentageOverride: adminAllConfig.incentivePolicy?.percentage !== undefined ? adminAllConfig.incentivePolicy.percentage / 100 : undefined,
        incentiveMonthsOverride: adminAllConfig.incentivePolicy?.months
      };

      const result = calculator(bankInput);
      return {
        bankName: result.bankName || name,
        ...result,
        state: customerInfo.state || '',
        city: customerInfo.city || ''
      };
    } catch (error) {
      console.error(`Error calculating fresh loan for ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'Calculation error occurred: ' + error.message,
        state: customerInfo.state || '',
        city: customerInfo.city || ''
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
    basicSalary: customerInfo.basicSalary || 0,
    averageIncentive: customerInfo.averageIncentive || 0,
    monthlyIncome: customerInfo.monthlyIncome ? parseFloat(customerInfo.monthlyIncome) : 0,
    existingEMI: 0, // KEY: Set to 0 for BT calculation
    companyName: customerInfo.companyName || '',
    category: customerInfo.category || 'A',
    creditScore: customerInfo.creditScore ? parseInt(customerInfo.creditScore) : 700,
    employmentType: customerInfo.employmentType || 'salaried',
    state: customerInfo.state || '',
    city: customerInfo.city || '',
    maritalStatus: customerInfo.maritalStatus || '', // Added for bachelor capping
    livingStatus: customerInfo.livingStatus || ''    // Added for bachelor capping
  };

  const location = (btInput.city && btInput.state)
    ? `${btInput.city}, ${btInput.state}`
    : (btInput.city || btInput.state);

  // Array of bank calculators with configurations
  const bankCalculators = [
    { id: 'kotak', name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility },
    { id: 'hdfc', name: 'HDFC Bank', calculator: calculateHdfcEligibility },
    { id: 'icici', name: 'ICICI Bank', calculator: calculateIciciEligibility },
    { id: 'bandhan', name: 'Bandhan Bank', calculator: calculateBandhanEligibility },
    { id: 'chola', name: 'Cholamandalam Finance', calculator: calculateCholaEligibility },
    { id: 'tata', name: 'Tata Capital', calculator: calculateTataEligibility },
    { id: 'poonawala', name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility },
    { id: 'axis', name: 'Axis Finance', calculator: calculateAxisFinEligibility },
    { id: 'indusind', name: 'IndusInd Bank', calculator: calculateIndusindEligibility },
    { id: 'idfc', name: 'IDFC Bank', calculator: calculateIdfcEligibility },
    { id: 'shriram', name: 'Shri Ram Finance', calculator: calculateShriRamEligibility },
    { id: 'piramal', name: 'Piramal Finance', calculator: calculatePiramalEligibility }
  ];

  // Calculate BT eligibility for each bank
  const results = bankCalculators.map(({ id, name, calculator }) => {
    try {
      const adminAllConfig = getAllBankConfig(name, location);
      // Check if bank offers BT
      if (adminAllConfig.btConfiguration && !adminAllConfig.btConfiguration.enabled) {
        return {
          bankName: name,
          eligible: false,
          reason: `${name} does not offer Balance Transfer facility for personal loans`,
          state: customerInfo.state || '',
          city: customerInfo.city || ''
        };
      }

      // Check for Fintech loans if bank doesn't accept them
      const hasFintechLoans = validLiabilities.some(liability =>
        liability.isFintechLoan === true || liability.loanSource === 'fintech');
      if (hasFintechLoans && adminAllConfig.btConfiguration && adminAllConfig.btConfiguration.acceptsFintechLoans === false) {
        const fintechLoanCount = validLiabilities.filter(liability =>
          liability.isFintechLoan === true || liability.loanSource === 'fintech').length;
        return {
          bankName: name,
          eligible: false,
          reason: `Fintech Loan Policy: ${name} does not accept Balance Transfer for loans from Fintech/digital lending platforms. You have ${fintechLoanCount} Fintech loan(s).`,
          state: customerInfo.state || '',
          city: customerInfo.city || ''
        };
      }

      // Check loan capping limit
      if (adminAllConfig.btConfiguration && adminAllConfig.btConfiguration.maxLoansForBT < numberOfLoans) {
        return {
          bankName: name,
          eligible: false,
          reason: `Loan Capping Exceeded: You have ${numberOfLoans} existing loans, but ${name} allows BT for maximum ${adminAllConfig.btConfiguration.maxLoansForBT} loans`,
          state: customerInfo.state || '',
          city: customerInfo.city || ''
        };
      }

      const bankInput = {
        ...btInput,
        // Inject Overrides
        incentivePercentageOverride: adminAllConfig.incentivePolicy?.percentage !== undefined ? adminAllConfig.incentivePolicy.percentage / 100 : undefined,
        incentiveMonthsOverride: adminAllConfig.incentivePolicy?.months
      };

      // 👨 INJECT DYNAMIC BACHELOR CAPPING OVERRIDES
      // CRITICAL LOGIC: Capping ONLY applies to Rented/Living Alone Bachelors
      if (adminAllConfig.bachelorCapping?.enabled && adminAllConfig.bachelorCapping?.limits) {
        if (btInput.maritalStatus === 'single' && btInput.livingStatus === 'rented') {
          const rentedLimit = adminAllConfig.bachelorCapping.limits['rented_bachelor'];
          if (rentedLimit !== null && rentedLimit !== undefined && rentedLimit !== '') {
             bankInput.dynamicBachelorLimitOverride = rentedLimit;
             bankInput.dynamicBachelorCapReason = 'Rented / Living Alone Bachelor Limit Applied';
          }
        }
      }

      const result = calculator(bankInput);

      if (!result.eligible) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: result.reason,
          state: customerInfo.state || '',
          city: customerInfo.city || ''
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
          reason: `Total outstanding amount (₹${totalPOS.toLocaleString()}) exceeds maximum loan eligibility (₹${maxLoanAmount.toLocaleString()}). Not eligible for BT.`,
          state: customerInfo.state || '',
          city: customerInfo.city || ''
        };
      }

      // Return BT result with additional information
      return {
        ...result, // 💎 PRESERVE ALL CALCULATOR METADATA (Incentives, POS, etc.)
        bankName: result.bankName || name,
        eligible: true,
        maxLoanAmount: maxLoanAmount,
        freshAmountDisbursed: freshAmount,
        btTotalOutstanding: totalPOS,
        btTotalEMI: totalExistingEMI,
        newBTLoanEMI: result.monthlyEMI,
        newSingleEMI: result.monthlyEMI,
        interestRate: result.interestRate || 11, // Default to 11% if not provided
        tenure: btInput.loanTenure,
        calculationMethod: result.calculationMethod || 'BT Calculation',
        state: customerInfo.state || '',
        city: customerInfo.city || ''
      };
    } catch (error) {
      console.error(`Error calculating full BT for ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'Calculation error occurred: ' + error.message,
        state: customerInfo.state || '',
        city: customerInfo.city || ''
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
    basicSalary: customerInfo.basicSalary || 0,
    averageIncentive: customerInfo.averageIncentive || 0,
    monthlyIncome: customerInfo.monthlyIncome ? parseFloat(customerInfo.monthlyIncome) : 0,
    existingEMI: 0, // Still set to 0 for BT calculation
    companyName: customerInfo.companyName || '',
    category: customerInfo.category || 'A',
    creditScore: customerInfo.creditScore ? parseInt(customerInfo.creditScore) : 700,
    employmentType: customerInfo.employmentType || 'salaried',
    state: customerInfo.state || '',
    city: customerInfo.city || ''
  };

  const location = (btInput.city && btInput.state)
    ? `${btInput.city}, ${btInput.state}`
    : (btInput.city || btInput.state);

  // Array of bank calculators with configurations
  const bankCalculators = [
    { id: 'kotak', name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility },
    { id: 'hdfc', name: 'HDFC Bank', calculator: calculateHdfcEligibility },
    { id: 'icici', name: 'ICICI Bank', calculator: calculateIciciEligibility },
    { id: 'bandhan', name: 'Bandhan Bank', calculator: calculateBandhanEligibility },
    { id: 'chola', name: 'Cholamandalam Finance', calculator: calculateCholaEligibility },
    { id: 'tata', name: 'Tata Capital', calculator: calculateTataEligibility },
    { id: 'poonawala', name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility },
    { id: 'axis', name: 'Axis Finance', calculator: calculateAxisFinEligibility },
    { id: 'indusind', name: 'IndusInd Bank', calculator: calculateIndusindEligibility },
    { id: 'idfc', name: 'IDFC Bank', calculator: calculateIdfcEligibility },
    { id: 'shriram', name: 'Shri Ram Finance', calculator: calculateShriRamEligibility },
    { id: 'piramal', name: 'Piramal Finance', calculator: calculatePiramalEligibility }
  ];

  // Calculate BT eligibility for each bank
  const results = bankCalculators.map(({ id, name, calculator }) => {
    try {
      const adminAllConfig = getAllBankConfig(name, location);
      // Check if bank offers BT
      if (adminAllConfig.btConfiguration && !adminAllConfig.btConfiguration.enabled) {
        return {
          bankName: name,
          eligible: false,
          reason: `${name} does not offer Balance Transfer facility for personal loans`,
          state: customerInfo.state || '',
          city: customerInfo.city || ''
        };
      }

      // Check for Fintech loans if bank doesn't accept them
      const hasFintechLoans = validSelectedLiabilities.some(liability =>
        liability.isFintechLoan === true || liability.loanSource === 'fintech');
      if (hasFintechLoans && adminAllConfig.btConfiguration && adminAllConfig.btConfiguration.acceptsFintechLoans === false) {
        const fintechLoanCount = validSelectedLiabilities.filter(liability =>
          liability.isFintechLoan === true || liability.loanSource === 'fintech').length;
        return {
          bankName: name,
          eligible: false,
          reason: `Fintech Loan Policy: ${name} does not accept Balance Transfer for loans from Fintech/digital lending platforms. You have ${fintechLoanCount} Fintech loan(s).`,
          state: customerInfo.state || '',
          city: customerInfo.city || ''
        };
      }

      // Check loan capping limit
      if (adminAllConfig.btConfiguration && adminAllConfig.btConfiguration.maxLoansForBT < numberOfLoans) {
        return {
          bankName: name,
          eligible: false,
          reason: `Loan Capping Exceeded: You have ${numberOfLoans} selected loans, but ${name} allows BT for maximum ${adminAllConfig.btConfiguration.maxLoansForBT} loans`,
          state: customerInfo.state || '',
          city: customerInfo.city || ''
        };
      }

      const bankInput = {
        ...btInput,
        // Inject Overrides
        incentivePercentageOverride: adminAllConfig.incentivePolicy?.percentage !== undefined ? adminAllConfig.incentivePolicy.percentage / 100 : undefined,
        incentiveMonthsOverride: adminAllConfig.incentivePolicy?.months
      };

      // 👨 INJECT DYNAMIC BACHELOR CAPPING OVERRIDES
      // CRITICAL LOGIC: Capping ONLY applies to Rented/Living Alone Bachelors
      if (adminAllConfig.bachelorCapping?.enabled && adminAllConfig.bachelorCapping?.limits) {
        if (btInput.maritalStatus === 'single' && btInput.livingStatus === 'rented') {
          const rentedLimit = adminAllConfig.bachelorCapping.limits['rented_bachelor'];
          if (rentedLimit !== null && rentedLimit !== undefined && rentedLimit !== '') {
             bankInput.dynamicBachelorLimitOverride = rentedLimit;
             bankInput.dynamicBachelorCapReason = 'Rented / Living Alone Bachelor Limit Applied';
          }
        }
      }

      const result = calculator(bankInput);

      if (!result.eligible) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: result.reason,
          state: customerInfo.state || '',
          city: customerInfo.city || ''
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
          reason: `Selected outstanding amount (₹${selectedPOS.toLocaleString()}) exceeds maximum loan eligibility (₹${maxLoanAmount.toLocaleString()}). Not eligible for partial BT.`,
          state: customerInfo.state || '',
          city: customerInfo.city || ''
        };
      }

      // Return BT result with additional information
      return {
        ...result, // 💎 PRESERVE ALL CALCULATOR METADATA (Incentives, POS, etc.)
        bankName: result.bankName || name,
        eligible: true,
        maxLoanAmount: maxLoanAmount,
        freshAmountDisbursed: freshAmount,
        btTotalOutstanding: selectedPOS,
        btTotalEMI: selectedExistingEMI,
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