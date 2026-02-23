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
 */
export const calculateLoanEligibility = async (userData) => {
  console.log('🏛️  --- ROBUST LOAN ENGINE ACTIVATED ---');

  const isBTMode = userData.wantsBT && userData.selectedLoansForBT?.length > 0;

  // Standardize calculator input
  const baseInput = {
    desiredLoanAmount: parseFloat(userData.desiredLoanAmount) || null,
    loanTenure: parseInt(userData.loanTenure) || 5,
    monthlyIncome: parseFloat(userData.monthlyIncome) || 0,
    existingEMI: parseFloat(userData.existingEMI) || 0,
    companyName: userData.companyName || '',
    category: userData.category || 'B', // Primary fallback from UI
    creditScore: parseInt(userData.creditScore) || 700,
    employmentType: userData.employmentType || 'salaried',
    age: parseInt(userData.age) || null,
    existingLoanBanks: userData.existingLoanBanks || [],
    isBTMode: isBTMode,
    loansForBT: isBTMode ? userData.loansForBT : [],
    btTotalEMI: isBTMode ? userData.loansForBT.reduce((sum, l) => sum + (parseFloat(l.monthlyEMI) || 0), 0) : 0,
    btTotalOutstanding: isBTMode ? userData.loansForBT.reduce((sum, l) => sum + (parseFloat(l.outstandingAmount) || 0), 0) : 0,
    state: userData.state || userData._metadata?.state || '',
    city: userData.city || userData._metadata?.city || ''
  };

  const bankCalculators = [
    { name: 'Kotak Mahindra Bank', calc: calculateKotakEligibility, config: kotakConfig },
    { name: 'Tata Capital', calc: calculateTataEligibility, config: tataConfig },
    { name: 'Poonawala Finance', calc: calculatePoonawalaEligibility, config: poonawalaConfig },
    { name: 'IDFC Bank', calc: calculateIdfcEligibility, config: idfcConfig },
    { name: 'HDFC Bank', calc: calculateHdfcEligibility, config: hdfcConfig },
    { name: 'ICICI Bank', calc: calculateIciciEligibility, config: iciciConfig },
    { name: 'Bandhan Bank', calc: calculateBandhanEligibility, config: bandhanConfig, noDb: true },
    { name: 'Cholamandalam Finance', calc: calculateCholaEligibility, config: cholaConfig },
    { name: 'Axis Finance', calc: calculateAxisFinEligibility, config: axisFinConfig },
    { name: 'IndusInd Bank', calc: calculateIndusindEligibility, config: indusindConfig },
    { name: 'Shri Ram Finance', calc: calculateShriRamEligibility, config: shriRamConfig, noDb: true },
    { name: 'Piramal Finance', calc: calculatePiramalEligibility, config: piramalConfig, noDb: true }
  ];

  return bankCalculators.map(({ name, calc, config, noDb }) => {
    try {
      const dbKey = BANK_TO_DB_KEY[name];

      // Determine category with fail-safe fallback
      let category = baseInput.category;
      if (!noDb && dbKey && baseInput.companyName) {
        // This will return baseInput.category if DB fetch failed or company is not found
        category = getCompanyCategoryForBank(baseInput.companyName, dbKey, baseInput.category);

        // HDFC Special Mapping Logic
        if (dbKey === 'hdfc') {
          const hdfcMap = { 'SCATA': 'Super A', 'CATGA': 'A', 'CATGB': 'B', 'CATGC': 'C', 'GOVT': 'Govt' };
          category = hdfcMap[category] || category;
        }
      }

      const result = calc({ ...baseInput, category });

      return {
        ...result,
        bankName: result.bankName || name,
        category, // Transparency: show which category was used
        btConfig: config.btConfig,
        incentivePercentage: config.incentivePercentage,
        isBTMode,
        btTotalEMI: baseInput.btTotalEMI,
        loansForBT: baseInput.loansForBT
      };
    } catch (error) {
      console.error(`🚨 Failure in ${name}:`, error);
      return {
        bankName: name,
        eligible: false,
        reason: 'Calculation engine error. Please contact support.',
        category: baseInput.category
      };
    }
  });
};
