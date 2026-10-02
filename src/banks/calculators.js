// Import all bank calculators
import { calculateKotakEligibility } from './kotak/calculator.js';
import { calculateHdfcEligibility } from './hdfc/calculator.js';
import { calculateIciciEligibility } from './icici/calculator.js';
import { calculateBandhanEligibility } from './bandhan/calculator.js';
import { calculateCholaEligibility } from './chola/calculator.js';
import { calculateTataEligibility } from './tata/calculator.js';
import { calculatePoonawalaEligibility } from './poonawala/calculator.js';
import { calculateAxisFinEligibility } from './axis-fin/calculator.js';
import { calculateShriRamEligibility } from './shri-ram/calculator.js';
import { calculatePiramalEligibility } from './piramal/calculator.js';
import { calculateIndusindEligibility } from './indusind/calculator.js';
import { calculateIdfcEligibility } from './idfc/calculator.js';
import { calculateSmfgEligibility } from './smfg/calculator.js';
import { calculateAbflEligibility } from './abfl/calculator.js';
import { calculateFinnableEligibility } from './finnable/calculator.js';
import { calculateAxisBankEligibility } from './axis-bank/calculator.js';

// Export all calculators in an array
export const bankCalculators = [
  calculateKotakEligibility,
  calculateHdfcEligibility,
  calculateIciciEligibility,
  calculateBandhanEligibility,
  calculateCholaEligibility,
  calculateTataEligibility,
  calculatePoonawalaEligibility,
  calculateAxisFinEligibility,
  calculateShriRamEligibility,
  calculatePiramalEligibility,
  calculateIndusindEligibility,
  calculateIdfcEligibility,
  calculateSmfgEligibility,
  calculateAbflEligibility,
  calculateFinnableEligibility,
  calculateAxisBankEligibility
];

export {
  calculateKotakEligibility,
  calculateHdfcEligibility,
  calculateIciciEligibility,
  calculateBandhanEligibility,
  calculateCholaEligibility,
  calculateTataEligibility,
  calculatePoonawalaEligibility,
  calculateAxisFinEligibility,
  calculateShriRamEligibility,
  calculatePiramalEligibility,
  calculateIndusindEligibility,
  calculateIdfcEligibility,
  calculateSmfgEligibility,
  calculateAbflEligibility,
  calculateFinnableEligibility,
  calculateAxisBankEligibility
};