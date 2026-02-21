/**
 * Balance Transfer (BT) for Personal Loans ONLY
 * 
 * CRITICAL CONSTRAINT: BT applies EXCLUSIVELY to Personal Loans
 * 
 * Key Rules:
 * 1. Only personal loans can be consolidated through BT
 * 2. Other loan types (Home, Car, Consumer, etc.) are treated as fixed obligations
 * 3. Non-personal loan EMIs are deducted from salary BEFORE calculating BT eligibility
 * 4. The "Effective Salary" = Full Salary - Non-Personal Loan EMIs
 * 5. BT calculation uses this Effective Salary for FOIR/Multiplier calculations
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
 * Calculate EMI from loan amount, interest rate, and tenure
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
 * Personal Loan BT Calculation
 * 
 * Process:
 * 1. Identify personal loans vs other loan types
 * 2. Calculate Effective Salary = Salary - Non-Personal Loan EMIs
 * 3. Use Effective Salary for BT eligibility calculation
 * 4. Deduct Personal Loan POS from max eligible amount
 * 5. Customer continues paying non-personal loan EMIs separately
 * 
 * @param {Object} userData - Customer data with loan details
 * @returns {Promise<Array>} BT calculation results for all banks
 */
export const calculatePersonalLoanBT = async (userData) => {
  const {
    monthlyIncome,
    allLoans, // Array of {loanType, emi, pos, loanName, selectedForBT}
    loanTenure,
    category,
    companyName,
    creditScore,
    employmentType
  } = userData;

  // Separate loans by type
  const personalLoans = allLoans.filter(loan => 
    loan.loanType === 'personal' || loan.loanType === 'Personal Loan'
  );
  
  const nonPersonalLoans = allLoans.filter(loan => 
    loan.loanType !== 'personal' && loan.loanType !== 'Personal Loan'
  );

  // Calculate totals
  const personalLoansEMI = personalLoans.reduce((sum, loan) => sum + parseFloat(loan.emi), 0);
  const personalLoansPOS = personalLoans.reduce((sum, loan) => sum + parseFloat(loan.pos), 0);
  const nonPersonalLoansEMI = nonPersonalLoans.reduce((sum, loan) => sum + parseFloat(loan.emi), 0);

  // CRITICAL STEP: Calculate Effective Salary
  // Deduct non-personal loan EMIs as they are fixed ongoing obligations
  const effectiveSalary = parseFloat(monthlyIncome) - nonPersonalLoansEMI;

  // Validation: Effective salary must be positive
  if (effectiveSalary <= 0) {
    return [{
      eligible: false,
      reason: `Non-personal loan EMIs (₹${nonPersonalLoansEMI.toLocaleString()}) exceed or equal salary (₹${monthlyIncome.toLocaleString()}). No capacity for personal loan BT.`,
      btType: 'PERSONAL_LOAN_BT'
    }];
  }

  // Prepare input for bank calculators using Effective Salary
  const btInput = {
    desiredLoanAmount: null, // We'll calculate max amount
    loanTenure: parseInt(loanTenure),
    monthlyIncome: effectiveSalary, // Using Effective Salary!
    existingEMI: 0, // Set to 0 since we already adjusted salary
    companyName: companyName,
    category: category || 'C',
    creditScore: parseInt(creditScore) || 700,
    employmentType: employmentType || 'salaried'
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

  // Calculate Personal Loan BT eligibility for each bank
  const results = bankCalculators.map(({ name, calculator, config }) => {
    try {
      // Check BT loan capping constraint
      const numberOfPersonalLoans = personalLoans.length;
      
      // Check if bank offers BT
      if (config.btConfig && !config.btConfig.isAvailable) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `${config.name || name} does not offer Balance Transfer facility for personal loans`,
          btType: 'PERSONAL_LOAN_BT',
          btCappingIssue: true
        };
      }
      
      // Check for Fintech loans in personal loans
      const hasFintechLoans = personalLoans.some(loan => loan.isFintechLoan === true || loan.loanSource === 'fintech');
      if (hasFintechLoans && config.btConfig && config.btConfig.acceptsFintechLoans === false) {
        const fintechLoanCount = personalLoans.filter(loan => loan.isFintechLoan === true || loan.loanSource === 'fintech').length;
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Fintech Loan Policy: ${config.name || name} does not accept Balance Transfer for loans from Fintech/digital lending platforms. You have ${fintechLoanCount} Fintech personal loan(s).`,
          btType: 'PERSONAL_LOAN_BT',
          fintechLoanIssue: true,
          fintechLoansCount: fintechLoanCount
        };
      }
      
      // Check loan capping limit for personal loans
      if (config.btConfig && config.btConfig.maxLoansForBT < numberOfPersonalLoans) {
        return {
          bankName: config.name || name,
          eligible: false,
          reason: `Loan Capping Exceeded: You have ${numberOfPersonalLoans} personal loans, but ${config.name || name} allows BT for maximum ${config.btConfig.maxLoansForBT} loans`,
          btType: 'PERSONAL_LOAN_BT',
          btCappingIssue: true,
          maxLoansAllowed: config.btConfig.maxLoansForBT,
          currentPersonalLoans: numberOfPersonalLoans
        };
      }
      
      const result = calculator(btInput);
      
      if (!result.eligible) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: result.reason,
          btType: 'PERSONAL_LOAN_BT'
        };
      }

      // Calculate BT-specific values
      const maxLoanAmount = result.maxLoanAmount || result.loanAmount;
      const freshAmount = maxLoanAmount - personalLoansPOS;

      // Check if fresh amount is positive
      if (freshAmount <= 0) {
        return {
          bankName: result.bankName || name,
          eligible: false,
          reason: `Personal Loan POS (₹${personalLoansPOS.toLocaleString()}) exceeds max loan capacity (₹${maxLoanAmount.toLocaleString()})`,
          btType: 'PERSONAL_LOAN_BT'
        };
      }

      // Calculate total monthly outflow after BT
      const newPersonalLoanEMI = result.monthlyEMI;
      const totalMonthlyOutflow = newPersonalLoanEMI + nonPersonalLoansEMI;
      const originalTotalEMI = personalLoansEMI + nonPersonalLoansEMI;

      return {
        bankName: result.bankName || name,
        eligible: true,
        btType: 'PERSONAL_LOAN_BT',
        
        // BT-specific fields
        maxPersonalLoanAmount: Math.round(maxLoanAmount),
        personalLoanPOS: Math.round(personalLoansPOS),
        freshAmountDisbursed: Math.round(freshAmount),
        
        // EMI breakdown
        newPersonalLoanEMI: Math.round(newPersonalLoanEMI),
        nonPersonalLoansEMI: Math.round(nonPersonalLoansEMI),
        totalMonthlyOutflow: Math.round(totalMonthlyOutflow),
        
        // Loan details
        interestRate: result.interestRate,
        tenure: loanTenure,
        processingFee: result.processingFee,
        
        // Salary calculation details
        originalSalary: parseFloat(monthlyIncome),
        effectiveSalary: Math.round(effectiveSalary),
        
        // Previous loan details
        previousPersonalLoanEMI: Math.round(personalLoansEMI),
        previousTotalEMI: Math.round(originalTotalEMI),
        numberOfPersonalLoansConsolidated: personalLoans.length,
        numberOfNonPersonalLoansRemaining: nonPersonalLoans.length,
        
        // Changes
        emiDifference: Math.round(totalMonthlyOutflow - originalTotalEMI),
        personalLoanEMIDifference: Math.round(newPersonalLoanEMI - personalLoansEMI),
        
        // Breakdown of loans
        personalLoansDetails: personalLoans.map(l => ({
          name: l.loanName,
          type: l.loanType,
          emi: l.emi,
          pos: l.pos
        })),
        nonPersonalLoansDetails: nonPersonalLoans.map(l => ({
          name: l.loanName,
          type: l.loanType,
          emi: l.emi,
          pos: l.pos
        })),
        
        // Full result
        ...result
      };
    } catch (error) {
      console.error(`Error calculating Personal Loan BT for ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'Personal Loan BT calculation error occurred',
        btType: 'PERSONAL_LOAN_BT'
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
 * Get Personal Loan BT recommendations
 * @param {Array} btResults - Results from Personal Loan BT calculation
 * @returns {Object} Recommendations
 */
export const getPersonalLoanBTRecommendations = (btResults) => {
  // Filter eligible banks
  const eligibleBanks = btResults.filter(result => result.eligible);
  
  if (eligibleBanks.length === 0) {
    return {
      hasRecommendations: false,
      message: 'No banks eligible for Personal Loan Balance Transfer with current profile'
    };
  }
  
  // Sort by fresh amount (descending)
  const sortedByFreshAmount = [...eligibleBanks].sort(
    (a, b) => b.freshAmountDisbursed - a.freshAmountDisbursed
  );
  
  // Sort by lowest total monthly outflow
  const sortedByTotalOutflow = [...eligibleBanks].sort(
    (a, b) => a.totalMonthlyOutflow - b.totalMonthlyOutflow
  );
  
  // Sort by lowest interest rate
  const sortedByInterest = [...eligibleBanks].sort(
    (a, b) => a.interestRate - b.interestRate
  );
  
  // Sort by lowest personal loan EMI
  const sortedByPersonalEMI = [...eligibleBanks].sort(
    (a, b) => a.newPersonalLoanEMI - b.newPersonalLoanEMI
  );
  
  return {
    hasRecommendations: true,
    bestForFreshFunds: sortedByFreshAmount[0],
    bestForLowestTotalOutflow: sortedByTotalOutflow[0],
    bestForLowInterest: sortedByInterest[0],
    bestForLowestPersonalLoanEMI: sortedByPersonalEMI[0],
    totalEligibleBanks: eligibleBanks.length,
    allEligible: eligibleBanks
  };
};

/**
 * Validate loan data for Personal Loan BT
 * @param {Object} userData - Customer data
 * @returns {Object} Validation result
 */
export const validatePersonalLoanBTData = (userData) => {
  const { allLoans, monthlyIncome } = userData;
  
  // Check if there are any personal loans
  const personalLoans = allLoans.filter(loan => 
    loan.loanType === 'personal' || loan.loanType === 'Personal Loan'
  );
  
  if (personalLoans.length === 0) {
    return {
      valid: false,
      message: 'No personal loans found. BT applies only to personal loans.'
    };
  }
  
  // Check if non-personal loan EMIs are reasonable
  const nonPersonalLoans = allLoans.filter(loan => 
    loan.loanType !== 'personal' && loan.loanType !== 'Personal Loan'
  );
  
  const nonPersonalLoansEMI = nonPersonalLoans.reduce((sum, loan) => sum + parseFloat(loan.emi), 0);
  
  if (nonPersonalLoansEMI >= parseFloat(monthlyIncome)) {
    return {
      valid: false,
      message: `Non-personal loan EMIs (₹${nonPersonalLoansEMI.toLocaleString()}) exceed salary. No capacity for personal loan BT.`
    };
  }
  
  return {
    valid: true,
    message: 'Data validated successfully for Personal Loan BT',
    personalLoansCount: personalLoans.length,
    nonPersonalLoansCount: nonPersonalLoans.length,
    effectiveSalary: parseFloat(monthlyIncome) - nonPersonalLoansEMI
  };
};
