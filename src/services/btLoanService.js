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
/**
 * Unified BT Calculation Proxy - REDIRECTED TO SECURE BACKEND
 */
const performBTCalculation = async (userData, type) => {
  console.log(`🏛️  --- SECURE BT ENGINE ACTIVATED (${type}) ---`);

  try {
    const response = await fetch('/api/loan-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userData,
        calculationType: 'bt',
        btType: type
      })
    });

    if (!response.ok) throw new Error('Backend BT engine error');

    const results = await response.json();
    console.log('✅ Secure BT results received from server');
    return results;
  } catch (error) {
    console.error('🚨 Backend BT Bridge Failure:', error);
    throw error;
  }
};

export const calculateFullBT = (userData) => performBTCalculation(userData, 'FULL');
export const calculatePartialBT = (userData) => performBTCalculation(userData, 'PARTIAL');
export const calculateBTWithCreditCards = (userData) => performBTCalculation(userData, 'WITH_CC');
export const calculateBTWithCreditCardObligation = (userData) => performBTCalculation(userData, 'WITH_CC_OBLIGATION');

// Logic migrated to /api/loan-eligibility


// 🧠 SMART RECOMMENDATIONS PROXIED TO BACKEND
export const calculateSmartBT = async (userData) => {
  return performBTCalculation(userData, 'SMART');
};

export const getBTRecommendations = (btResults) => {
  const eligibleBanks = btResults.filter(result => result.eligible);
  if (eligibleBanks.length === 0) return { hasRecommendations: false, message: 'No banks eligible' };

  const sortedByFreshAmount = [...eligibleBanks].sort((a, b) => b.freshAmountDisbursed - a.freshAmountDisbursed);
  const sortedByEMI = [...eligibleBanks].sort((a, b) => (a.newSingleEMI || a.newBTLoanEMI) - (b.newSingleEMI || b.newBTLoanEMI));
  const sortedByInterest = [...eligibleBanks].sort((a, b) => a.interestRate - b.interestRate);

  return {
    hasRecommendations: true,
    bestForFreshFunds: sortedByFreshAmount[0],
    bestForLowEMI: sortedByEMI[0],
    bestForLowInterest: sortedByInterest[0],
    totalEligibleBanks: eligibleBanks.length,
    allEligible: eligibleBanks
  };
};
