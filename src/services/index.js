/**
 * Central export file for all loan services
 * 
 * Note: Calculation engine and BT logic have been moved 
 * to the backend for maximum security.
 */

// Lead Management Services (Proxied via backend)
export {
  saveLead,
  saveSelectedBanks
} from './leadService.js';
