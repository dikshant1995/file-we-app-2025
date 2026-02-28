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

// Import bank configs
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

// Import robust database service
import { getCompanyCategoryForBank } from './companyDatabaseService.js';

/**
 * Robust Bank Database Key Mapping
 * Ensures underscore/hyphen mismatches NEVER break the app again.
 */
const BANK_TO_DB_KEY = {
  'Kotak Mahindra Bank': 'kotak',
  'Tata Capital': 'tata',
  'Poonawala Finance': 'poonawala',
  'IDFC Bank': 'idfc',
  'HDFC Bank': 'hdfc',
  'ICICI Bank': 'icici',
  'Cholamandalam Finance': 'chola',
  'IndusInd Bank': 'indusind',
  'Axis Finance': 'axis_fin'
};

/**
 * Calculate loan eligibility across all 12 banks
 * REDIRECTED TO SECURE BACKEND
 */
export const calculateLoanEligibility = async (userData) => {
  console.log('🏛️  --- SECURE NEURAL ENGINE ACTIVATED ---');

  try {
    const response = await fetch('/api/loan-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userData,
        calculationType: 'regular'
      })
    });

    if (!response.ok) throw new Error('Backend engine error');

    const results = await response.json();
    console.log('✅ Secure results received from server');
    return results;
  } catch (error) {
    console.error('🚨 Backend Bridge Failure:', error);
    throw error;
  }
};
