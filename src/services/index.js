/**
 * Central export file for all loan services
 */

// Core Calculation Engine (Local version - High Speed)
export {
  calculateLoanEligibility
} from './realLoanService.js';

// Balance Transfer Engine (Local version - High Speed)
export {
  calculateBTWithCreditCards
} from './btLoanService.js';

// Lead Management Services (Proxied via backend for security)
export {
  saveLead,
  saveSelectedBanks
} from './leadService.js';
