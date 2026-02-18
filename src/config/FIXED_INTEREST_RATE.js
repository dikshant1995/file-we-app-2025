/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔒 FIXED INTEREST RATE POLICY - LOCKED AND IMMUTABLE
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * ⚠️  CRITICAL POLICY: ALL BANKS MUST USE 11% INTEREST RATE
 * 
 * This rate is FIXED and CANNOT be changed without explicit authorization.
 * Any attempt to use a different rate is a violation of the policy.
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * FIXED INTEREST RATE - 11% FOR ALL BANKS
 * 
 * DO NOT MODIFY THIS VALUE!
 * DO NOT CREATE BANK-SPECIFIC RATES!
 * DO NOT USE ANY OTHER RATE!
 * 
 * This is the ONLY interest rate to be used across:
 * - All 12 banks
 * - All customer categories (A, B, C, D, GOVT, UNLISTED)
 * - All loan types (Fresh, Balance Transfer, Partial BT)
 * - All salary bands
 * - All tenures
 */
export const FIXED_INTEREST_RATE = 11.0;

/**
 * Frozen object to prevent any modifications
 */
export const INTEREST_RATE_POLICY = Object.freeze({
  rate: 11.0,
  isFixed: true,
  appliesTo: 'ALL_BANKS',
  lastUpdated: '2025-10-16',
  policy: 'UNIVERSAL_FIXED_RATE',
  description: 'Fixed 11% interest rate across all banks and all categories',
  warning: '⚠️ DO NOT MODIFY - This is a locked policy rate'
});

/**
 * Validation function to ensure no bank is using a different rate
 * @param {number} rate - The rate to validate
 * @throws {Error} If rate is not 11.0
 */
export function validateInterestRate(rate) {
  if (rate !== FIXED_INTEREST_RATE) {
    throw new Error(
      `❌ POLICY VIOLATION: Interest rate must be ${FIXED_INTEREST_RATE}%. ` +
      `Attempted to use ${rate}%. This is not allowed!`
    );
  }
  return true;
}

/**
 * Get the interest rate (always returns 11.0)
 * This function exists to enforce the policy programmatically
 */
export function getInterestRate() {
  return FIXED_INTEREST_RATE;
}

/**
 * Convert monthly rate (for EMI calculations)
 * @returns {number} Monthly interest rate (11% / 12)
 */
export function getMonthlyInterestRate() {
  return FIXED_INTEREST_RATE / 12 / 100;
}

/**
 * Get annual rate (for display purposes)
 * @returns {number} Annual interest rate (always 11%)
 */
export function getAnnualInterestRate() {
  return FIXED_INTEREST_RATE;
}

// Freeze the module to prevent modifications
Object.freeze(FIXED_INTEREST_RATE);

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔐 POLICY ENFORCEMENT
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * ALL BANKS MUST IMPORT AND USE THIS FILE:
 * 
 * import { FIXED_INTEREST_RATE } from '../../config/FIXED_INTEREST_RATE.js';
 * 
 * DO NOT define interestRate in bank config files!
 * USE THIS CENTRALIZED RATE ONLY!
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */
