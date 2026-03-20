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

// Global bank list for internal mapping
const allBanks = [
  { id: 'kotak', name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility },
  { id: 'hdfc', name: 'HDFC Bank', calculator: calculateHdfcEligibility },
  { id: 'icici', name: 'ICICI Bank', calculator: calculateIciciEligibility },
  { id: 'bandhan', name: 'Bandhan Bank', calculator: calculateBandhanEligibility },
  { id: 'chola', name: 'Cholamandalam Finance', calculator: calculateCholaEligibility },
  { id: 'tata', name: 'Tata Capital', calculator: calculateTataEligibility },
  { id: 'poonawala', name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility },
  { id: 'axisfin', name: 'Axis Finance', calculator: calculateAxisFinEligibility },
  { id: 'indusind', name: 'IndusInd Bank', calculator: calculateIndusindEligibility },
  { id: 'idfc', name: 'IDFC First Bank', calculator: calculateIdfcEligibility },
  { id: 'shriram', name: 'Shri Ram Finance', calculator: calculateShriRamEligibility },
  { id: 'piramal', name: 'Piramal Finance', calculator: calculatePiramalEligibility }
];

/**
 * Calculate Fresh Loan Eligibility (without BT)
 */
export const calculateFreshLoan = async (customerInfo) => {
  const { state, city } = customerInfo;
  
  const calculatorInput = {
    desiredLoanAmount: customerInfo.desiredLoanAmount ? parseFloat(customerInfo.desiredLoanAmount) : null,
    loanTenure: customerInfo.loanTenure ? parseInt(customerInfo.loanTenure) : 5,
    monthlyIncome: customerInfo.monthlyIncome ? parseFloat(customerInfo.monthlyIncome) : 0,
    existingEMI: customerInfo.existingEMI || 0,
    companyName: customerInfo.companyName || '',
    category: customerInfo.category || 'A',
    creditScore: customerInfo.creditScore ? parseInt(customerInfo.creditScore) : 700,
    employmentType: customerInfo.employmentType || 'salaried',
    state: state || '',
    city: city || ''
  };

  const results = allBanks.map(({ name, calculator }) => {
    try {
      const adminAllConfig = getAllBankConfig(name, { state, city });
      const config = adminAllConfig.bankConfig;
      const result = calculator(calculatorInput, config); // Pass merged config to calculator
      return {
        bankName: name,
        ...result,
        adminApplied: true
      };
    } catch (error) {
      console.error(`Error calculating fresh loan for ${name}:`, error);
      return { bankName: name, eligible: false, reason: 'System calculation error' };
    }
  });

  return results;
};

/**
 * Calculate Full Balance Transfer (all existing loans)
 */
export const calculateFullBT = async (customerInfo, existingLiabilities) => {
  const { state, city } = customerInfo;
  const validLiabilities = existingLiabilities.filter(liability =>
    liability.outstandingAmount && parseFloat(liability.outstandingAmount) > 0
  );

  if (validLiabilities.length === 0) return await calculateFreshLoan(customerInfo);

  const totalPOS = validLiabilities.reduce((sum, l) => sum + parseFloat(l.outstandingAmount), 0);
  const totalExistingEMI = validLiabilities.reduce((sum, l) => sum + (parseFloat(l.monthlyPayment) || 0), 0);

  const btInput = {
    ...customerInfo,
    desiredLoanAmount: null,
    existingEMI: 0, // Reset EMI for BT flow
    totalPOS: totalPOS,
    isBTMode: true
  };

  // 11 Banks - Exclude Bandhan
  const btBanks = allBanks.filter(b => b.id !== 'bandhan');

  const results = btBanks.map(({ name, calculator }) => {
    try {
      const adminAllConfig = getAllBankConfig(name, { state, city });
      const btConfig = adminAllConfig.btConfiguration || {};
      const config = adminAllConfig.bankConfig || {};

      // Check if EXPLICITLY disabled in Admin
      if (btConfig.enabled === false) {
        return { bankName: name, eligible: false, reason: `${name} policy: BT currently disabled via Admin override.` };
      }

      // Fallback to local config if Admin hasn't specified
      if (btConfig.enabled === undefined && config.btConfig && !config.btConfig.isAvailable) {
        return { bankName: name, eligible: false, reason: `${name} does not offer Balance Transfer facility for personal loans` };
      }

      // Check Loan Capping
      const maxLoans = btConfig.maxHistoryLoans || 5;
      if (validLiabilities.length > maxLoans) {
        return { bankName: name, eligible: false, reason: `Policy: Maximum ${maxLoans} existing loans allowed for BT.` };
      }

      const result = calculator(btInput, adminAllConfig.bankConfig);
      
      if (!result.eligible) return { bankName: name, ...result };

      const maxLoan = result.loanAmount || result.maxLoanAmount;
      const freshAmount = maxLoan - totalPOS;

      if (freshAmount <= 0) {
        return { bankName: name, eligible: false, reason: `Outstanding POS (₹${totalPOS.toLocaleString()}) exceeds max limit.` };
      }

      return {
        ...result,
        bankName: name,
        eligible: true,
        isBTMode: true,
        btType: 'BT_WITH_PERSONAL_LOANS',
        calculationMethod: 'BT Calculation',
        loanAmount: maxLoan,
        totalDebtCleared: totalPOS,
        freshAmountDisbursed: freshAmount,
        totalExistingEMI: totalExistingEMI,
        adminApplied: true
      };
    } catch (err) {
      return { bankName: name, eligible: false, reason: 'BT logic error' };
    }
  });

  return results;
};

/**
 * Calculate Partial Balance Transfer
 */
export const calculatePartialBT = async (customerInfo, existingLiabilities, selectedLiabilityIds) => {
  const { state, city } = customerInfo;
  const selectedLiabilities = existingLiabilities.filter(l => selectedLiabilityIds.includes(l.id));
  const validSelected = selectedLiabilities.filter(l => parseFloat(l.outstandingAmount) > 0);

  if (validSelected.length === 0) return await calculateFreshLoan(customerInfo);

  const selectedPOS = validSelected.reduce((sum, l) => sum + parseFloat(l.outstandingAmount), 0);
  const selectedExistingEMI = validSelected.reduce((sum, l) => sum + (parseFloat(l.monthlyPayment) || 0), 0);

  const nonSelectedLiabilities = existingLiabilities.filter(l => !selectedLiabilityIds.includes(l.id));
  const nonSelectedEMI = nonSelectedLiabilities.reduce((sum, l) => sum + (parseFloat(l.monthlyPayment) || 0), 0);

  const btInput = {
    ...customerInfo,
    desiredLoanAmount: null,
    existingEMI: nonSelectedEMI, // Retain non-selected EMIs
    totalPOS: selectedPOS,
    isBTMode: true
  };

  const btBanks = allBanks.filter(b => b.id !== 'bandhan');

  const results = btBanks.map(({ name, calculator }) => {
    try {
      const adminAllConfig = getAllBankConfig(name, { state, city });
      const btConfig = adminAllConfig.btConfiguration || {};
      const config = adminAllConfig.bankConfig || {};

      if (btConfig.enabled === false) {
        return { bankName: name, eligible: false, reason: `${name} policy: BT currently disabled.` };
      }

      if (btConfig.enabled === undefined && config.btConfig && !config.btConfig.isAvailable) {
        return { bankName: name, eligible: false, reason: `${name} does not offer BT facility.` };
      }

      const result = calculator(btInput, adminAllConfig.bankConfig);
      if (!result.eligible) return { bankName: name, ...result };

      const maxLoan = result.loanAmount || result.maxLoanAmount;
      const freshAmount = maxLoan - selectedPOS;

      if (freshAmount <= 0) {
        return { bankName: name, eligible: false, reason: `Selected POS exceeds max limit.` };
      }

      return {
        ...result,
        bankName: name,
        eligible: true,
        isBTMode: true,
        btType: 'PARTIAL_BT',
        calculationMethod: 'BT Calculation (Partial)',
        loanAmount: maxLoan,
        totalDebtCleared: selectedPOS,
        freshAmountDisbursed: freshAmount,
        selectedPOS: selectedPOS,
        nonSelectedEMI: nonSelectedEMI,
        adminApplied: true
      };
    } catch (err) {
      return { bankName: name, eligible: false, reason: 'Partial BT logic error' };
    }
  });

  return results;
};

export const calculateAllScenarios = async (formData) => {
  const { customerInfo, existingLiabilities, selectedLiabilities } = formData;
  try {
    const [fresh, full, partial] = await Promise.all([
      calculateFreshLoan(customerInfo),
      calculateFullBT(customerInfo, existingLiabilities),
      calculatePartialBT(customerInfo, existingLiabilities, selectedLiabilities)
    ]);
    return { freshLoan: fresh, fullBT: full, partialBT: partial };
  } catch (error) {
    throw new Error('Failed to calculate loan scenarios');
  }
};