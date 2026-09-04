// Bank Configuration Service - Centralized storage and Cloud Firestore Sync
import { db } from '../config/firebase.js';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

const STORAGE_KEY = 'bank_configurations';

// Helper to generate a clean Firestore document ID for each bank
export const getBankDocId = (bankName) => {
  return String(bankName || '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

// Default configurations for all banks
const defaultConfigs = {
  'HDFC Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, limits: { unmarried_bachelor: null, unmarried_family: null, married_bachelor: null, unmarried_self_owned: null } } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5, maxCreditCardBTMultiplier: 6 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 },
    incentivePolicy: { percentage: 50, months: 3 }
  },
  'ICICI Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, limits: { unmarried_bachelor: null, unmarried_family: null, married_bachelor: null, unmarried_self_owned: null } } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5, maxCreditCardBTMultiplier: 6 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 },
    incentivePolicy: { percentage: 0, months: 0 }
  },
  'Axis Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, limits: { unmarried_bachelor: null, unmarried_family: null, married_bachelor: null, unmarried_self_owned: null } } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5, maxCreditCardBTMultiplier: 6 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 },
    incentivePolicy: { percentage: 100, months: 3 }
  },
  'Kotak Mahindra Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, limits: { unmarried_bachelor: null, unmarried_family: null, married_bachelor: null, unmarried_self_owned: null } } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5, maxCreditCardBTMultiplier: 6 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 },
    incentivePolicy: { percentage: 100, months: 3 }
  },
  'IndusInd Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, limits: { unmarried_bachelor: null, unmarried_family: null, married_bachelor: null, unmarried_self_owned: null } } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5, maxCreditCardBTMultiplier: 6 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 },
    incentivePolicy: { percentage: 100, months: 3 }
  },
  'IDFC First Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, limits: { unmarried_bachelor: null, unmarried_family: null, married_bachelor: null, unmarried_self_owned: null } } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5, maxCreditCardBTMultiplier: 6 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 },
    incentivePolicy: { percentage: 100, months: 3 }
  }
};

// Save configuration for a specific bank, section, and optional location (State/City)
export const saveBankConfig = (bankName, sectionName, config, location = null) => {
  try {
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    if (!allConfigs[bankName]) {
      allConfigs[bankName] = { ...defaultConfigs[bankName], cityOverrides: {} };
    }

    if (location) {
      // Ensure cityOverrides exists
      if (!allConfigs[bankName].cityOverrides) {
        allConfigs[bankName].cityOverrides = {};
      }
      // Ensure specific location entry exists
      if (!allConfigs[bankName].cityOverrides[location]) {
        allConfigs[bankName].cityOverrides[location] = {};
      }
      // Save to location-specific section
      allConfigs[bankName].cityOverrides[location][sectionName] = config;
      console.log(`📍 Saved ${sectionName} override for ${bankName} in ${location}:`, config);
    } else {
      // Save to global section
      allConfigs[bankName][sectionName] = config;
      console.log(`🌐 Saved Global ${sectionName} for ${bankName}:`, config);
    }

    // 1. Save locally for instant offline/zero-latency UI
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));

    // 2. Asynchronously sync to Firebase Firestore Cloud
    try {
      const bankDocId = getBankDocId(bankName);
      const docRef = doc(db, 'bank_configurations', bankDocId);
      setDoc(docRef, {
        bankName,
        config: allConfigs[bankName],
        lastUpdated: new Date().toISOString()
      }, { merge: true }).then(() => {
        console.log(`☁️ Synced ${bankName} policy to Firebase Firestore (doc: ${bankDocId})`);
      }).catch(cloudErr => {
        console.warn(`⚠️ Firebase sync warning for ${bankName}:`, cloudErr.message);
      });
    } catch (fbErr) {
      console.warn('Firebase Firestore background sync error:', fbErr);
    }

    return true;
  } catch (error) {
    console.error('Error saving bank config:', error);
    return false;
  }
};

// Get configuration for a specific bank, section, and optional location (State/City)
export const getBankConfig = (bankName, sectionName, location = null) => {
  try {
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    // 1. Try to get City-Specific Override first
    if (location && allConfigs[bankName]?.cityOverrides?.[location]?.[sectionName]) {
      return allConfigs[bankName].cityOverrides[location][sectionName];
    }

    // 2. Fallback to Global Saved Config
    if (allConfigs[bankName]?.[sectionName]) {
      return allConfigs[bankName][sectionName];
    }

    // 3. Fallback to Default Template
    if (defaultConfigs[bankName]?.[sectionName]) {
      return defaultConfigs[bankName][sectionName];
    }

    return null;
  } catch (error) {
    console.error('Error loading bank config:', error);
    return null;
  }
};

// Get all configuration for a bank at a specific location
export const getAllBankConfig = (bankName, location = null) => {
  try {
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const baseConfig = allConfigs[bankName] || defaultConfigs[bankName] || {};

    if (location && allConfigs[bankName]?.cityOverrides?.[location]) {
      // Merge location specific overrides onto base config
      return {
        ...baseConfig,
        ...allConfigs[bankName].cityOverrides[location]
      };
    }

    return baseConfig;
  } catch (error) {
    console.error('Error loading all bank config:', error);
    return defaultConfigs[bankName] || {};
  }
};

// Reset to defaults
export const resetBankConfig = (bankName) => {
  try {
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    allConfigs[bankName] = { ...defaultConfigs[bankName] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));
    return true;
  } catch (error) {
    console.error('Error resetting bank config:', error);
    return false;
  }
};

// Export all configs (for backup)
export const exportAllConfigs = () => {
  try {
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return JSON.stringify(allConfigs, null, 2);
  } catch (error) {
    console.error('Error exporting configs:', error);
    return null;
  }
};

// Import configs (from backup)
export const importConfigs = (jsonString) => {
  try {
    const configs = JSON.parse(jsonString);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    return true;
  } catch (error) {
    console.error('Error importing configs:', error);
    return false;
  }
};

/**
 * Sync all bank configurations from Firebase Firestore to local storage
 */
export const syncAllBankConfigsFromCloud = async () => {
  try {
    const colRef = collection(db, 'bank_configurations');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      let syncCount = 0;

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.bankName && data.config) {
          allConfigs[data.bankName] = {
            ...defaultConfigs[data.bankName],
            ...allConfigs[data.bankName],
            ...data.config
          };
          syncCount++;

          // If this bank config contains cityOverrides with unifiedPolicy, also update local snapshot keys
          if (data.config.cityOverrides) {
            const bankDocId = getBankDocId(data.bankName);
            Object.entries(data.config.cityOverrides).forEach(([locationKey, locConfig]) => {
              if (locConfig && locConfig.unifiedPolicy) {
                try {
                  localStorage.setItem(`policy_config_${bankDocId}_${locationKey}`, JSON.stringify(locConfig.unifiedPolicy));
                } catch (snapErr) {
                  console.warn('Snapshot cache warning:', snapErr);
                }
              }
            });
          }
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));
      console.log(`☁️ Synced ${syncCount} bank policies from Firebase Firestore.`);
      return allConfigs;
    }
  } catch (err) {
    console.warn('⚠️ Cloud sync for bank policies unavailable, using local defaults:', err.message);
  }
  return null;
};

/**
 * Fetch a specific bank configuration directly from Cloud Firestore
 */
export const fetchBankConfigFromCloud = async (bankName) => {
  try {
    const bankDocId = getBankDocId(bankName);
    const docRef = doc(db, 'bank_configurations', bankDocId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.config) {
        const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        allConfigs[bankName] = {
          ...defaultConfigs[bankName],
          ...allConfigs[bankName],
          ...data.config
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));
        return data.config;
      }
    }
  } catch (err) {
    console.warn(`Could not load ${bankName} config from Firestore:`, err.message);
  }
  return null;
};

// Automatic initial sync in browser environment
if (typeof window !== 'undefined') {
  syncAllBankConfigsFromCloud();
}

