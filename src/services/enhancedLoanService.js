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
 * Calculate Fresh Loan Eligibility
 */
export const calculateFreshLoan = async (customerInfo) => {
  const calculatorInput = {
    desiredLoanAmount: customerInfo.desiredLoanAmount ? parseFloat(customerInfo.desiredLoanAmount) : null,
    loanTenure: customerInfo.loanTenure ? parseInt(customerInfo.loanTenure) : 5,
    monthlyIncome: customerInfo.monthlyIncome ? parseFloat(customerInfo.monthlyIncome) : 0,
    existingEMI: 0,
    companyName: customerInfo.companyName || '',
    category: customerInfo.category || 'A',
    creditScore: customerInfo.creditScore ? parseInt(customerInfo.creditScore) : 700,
    employmentType: customerInfo.employmentType || 'salaried',
    state: customerInfo.state || '',
    city: customerInfo.city || ''
  };

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

  return bankCalculators.map(({ name, calculator }) => {
    try {
      const result = calculator(calculatorInput);
      return {
        bankName: result.bankName || name,
        ...result
      };
    } catch (error) {
      return {
        bankName: name,
        isEligible: false,
        reason: 'Calculation error: ' + error.message
      };
    }
  });
};

/**
 * Calculate Full Balance Transfer
 */
export const calculateFullBT = async (customerInfo, existingLiabilities) => {
  const validLiabilities = existingLiabilities.filter(l => l.outstandingAmount && parseFloat(l.outstandingAmount) > 0);
  if (validLiabilities.length === 0) return await calculateFreshLoan(customerInfo);

  const totalPOS = validLiabilities.reduce((sum, l) => sum + parseFloat(l.outstandingAmount), 0);
  const totalExistingEMI = validLiabilities.reduce((sum, l) => sum + (parseFloat(l.monthlyPayment) || 0), 0);

  const btInput = {
    desiredLoanAmount: null,
    loanTenure: customerInfo.loanTenure ? parseInt(customerInfo.loanTenure) : 5,
    monthlyIncome: customerInfo.monthlyIncome ? parseFloat(customerInfo.monthlyIncome) : 0,
    existingEMI: 0,
    companyName: customerInfo.companyName || '',
    category: customerInfo.category || 'A',
    creditScore: customerInfo.creditScore ? parseInt(customerInfo.creditScore) : 700,
    employmentType: customerInfo.employmentType || 'salaried',
    state: customerInfo.state || '',
    city: customerInfo.city || ''
  };

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

  return bankCalculators.map(({ name, calculator, config }) => {
    try {
      if (config.btConfig && !config.btConfig.isAvailable) {
        return { bankName: config.name || name, isEligible: false, reason: 'BT not available' };
      }
      const result = calculator(btInput);
      if (!result.isEligible) return { bankName: result.bankName || name, isEligible: false, reason: result.reason };

      const maxLoanAmount = result.maxLoanAmount || result.loanAmount;
      const freshAmount = maxLoanAmount - totalPOS;
      if (freshAmount <= 0) return { bankName: result.bankName || name, isEligible: false, reason: 'Outstanding exceeds eligibility' };

      return {
        bankName: result.bankName || name,
        isEligible: true,
        maxLoanAmount,
        freshAmountDisbursed: freshAmount,
        totalPOS,
        totalExistingEMI,
        monthlyEMI: result.monthlyEMI,
        interestRate: result.interestRate || 11,
        tenure: btInput.loanTenure
      };
    } catch (error) {
      return { bankName: name, isEligible: false, reason: 'Error: ' + error.message };
    }
  });
};

/**
 * Calculate Partial Balance Transfer
 */
export const calculatePartialBT = async (customerInfo, existingLiabilities, selectedLiabilityIds) => {
  const selectedLiabilities = existingLiabilities.filter(l => selectedLiabilityIds.includes(l.id) && l.outstandingAmount && parseFloat(l.outstandingAmount) > 0);
  if (selectedLiabilities.length === 0) return await calculateFreshLoan(customerInfo);

  const selectedPOS = selectedLiabilities.reduce((sum, l) => sum + parseFloat(l.outstandingAmount), 0);
  const selectedEMI = selectedLiabilities.reduce((sum, l) => sum + (parseFloat(l.monthlyPayment) || 0), 0);

  const nonSelectedLiabilities = existingLiabilities.filter(l => !selectedLiabilityIds.includes(l.id) && l.outstandingAmount && parseFloat(l.outstandingAmount) > 0);
  const nonSelectedEMI = nonSelectedLiabilities.reduce((sum, l) => sum + (parseFloat(l.monthlyPayment) || 0), 0);

  const btInput = {
    desiredLoanAmount: null,
    loanTenure: customerInfo.loanTenure ? parseInt(customerInfo.loanTenure) : 5,
    monthlyIncome: customerInfo.monthlyIncome ? parseFloat(customerInfo.monthlyIncome) : 0,
    existingEMI: 0,
    companyName: customerInfo.companyName || '',
    category: customerInfo.category || 'A',
    creditScore: customerInfo.creditScore ? parseInt(customerInfo.creditScore) : 700,
    employmentType: customerInfo.employmentType || 'salaried',
    state: customerInfo.state || '',
    city: customerInfo.city || ''
  };

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

  return bankCalculators.map(({ name, calculator, config }) => {
    try {
      if (config.btConfig && !config.btConfig.isAvailable) {
        return { bankName: config.name || name, isEligible: false, reason: 'BT not available' };
      }
      const result = calculator(btInput);
      if (!result.isEligible) return { bankName: result.bankName || name, isEligible: false, reason: result.reason };

      const maxLoanAmount = result.maxLoanAmount || result.loanAmount;
      const freshAmount = maxLoanAmount - selectedPOS;
      if (freshAmount <= 0) return { bankName: result.bankName || name, isEligible: false, reason: 'Outstanding exceeds eligibility' };

      return {
        bankName: result.bankName || name,
        isEligible: true,
        maxLoanAmount,
        freshAmountDisbursed: freshAmount,
        selectedPOS,
        selectedEMI,
        nonSelectedEMI,
        monthlyEMI: result.monthlyEMI,
        totalOutflow: result.monthlyEMI + nonSelectedEMI,
        interestRate: result.interestRate || 11,
        tenure: btInput.loanTenure
      };
    } catch (error) {
      return { bankName: name, isEligible: false, reason: 'Error: ' + error.message };
    }
  });
};

/**
 * Calculate all scenarios
 */
export const calculateAllScenarios = async (formData) => {
  const { customerInfo, existingLiabilities, selectedLiabilities } = formData;
  const [fresh, full, partial] = await Promise.all([
    calculateFreshLoan(customerInfo),
    calculateFullBT(customerInfo, existingLiabilities),
    calculatePartialBT(customerInfo, existingLiabilities, selectedLiabilities)
  ]);

  return { freshLoan: fresh, fullBT: full, partialBT: partial };
};