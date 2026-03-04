/**
 * Central export file for all loan services
 * 
 * Services Available:
 * 1. Regular Loan Calculation
 * 2. Balance Transfer (BT) - Full and Partial
 * 3. Personal Loan BT (Exclusive to Personal Loans)
 */

// Regular Loan Services
export {
  calculateLoanEligibility
} from './realLoanService.js';

// Balance Transfer Services (All Loans)
export {
  calculateFullBT,
  calculatePartialBT,
  calculateSmartBT,
  getBTRecommendations
} from './btLoanService.js';

// Personal Loan BT Services (Personal Loans Only)
export {
  calculatePersonalLoanBT,
  getPersonalLoanBTRecommendations,
  validatePersonalLoanBTData
} from './btPersonalLoanService.js';

// Lead Services
export {
  saveLead,
  saveSelectedBanks
} from './leadService.js';
