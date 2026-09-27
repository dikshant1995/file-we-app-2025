import { db } from '../config/firebase.js';
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';

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
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 72, categoryBasedMaxTenure: { 'Super Prime': 72, 'Preferred': 72, 'Elite': 72, 'Open Market': 72, 'Govt': 72, 'Army Profile': 72, 'NRI Case': 72, A: 72, B: 72, C: 72, D: 72 } },
    foirSettings: { categoryBasedFOIR: { 'Super Prime': 65, 'Preferred': 65, 'Elite': 65, 'Open Market': 55, 'Govt': 65, 'Army Profile': 65, 'NRI Case': 60, A: 65, B: 65, C: 55, D: 55 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { 'Super Prime': 28, 'Preferred': 27, 'Elite': 25, 'Open Market': 20, 'Govt': 27, 'Army Profile': 25, 'NRI Case': 20, A: 27, B: 25, C: 20, D: 20 } },
    creditScoreRules: { minCreditScore: 725, recommendedScore: 750, premiumScore: 775, autoRejectionThreshold: 725 },
    interestRates: { defaultRate: 9.99, categoryRates: { 'Super Prime': 9.99, 'Preferred': 9.99, 'Elite': 10.50, 'Open Market': 11.50, 'Govt': 9.99, 'Army Profile': 10.50, 'NRI Case': 11.00, A: 9.99, B: 10.50, C: 11.50, D: 11.50 } },
    loanCapping: { absoluteMaxLoan: 10000000, minLoanAmount: 610000, bachelorCapping: { enabled: false, limits: { unmarried_bachelor: null, unmarried_family: null, married_bachelor: null, unmarried_self_owned: null } } },
    employmentRules: { salariedMinSalary: 30000, selfEmployedMinIncome: 300000, itrYearsRequired: 1 },
    btConfiguration: { enabled: true, maxLoansForBT: 5, creditCardBTSupported: true, processingFeePercentage: 0.8, maxCreditCardBTMultiplier: 5 },
    feesAndCharges: { processingFeePercentage: 0.8, btChargesPercentage: 0.8, prepaymentChargesPercentage: 3 },
    incentivePolicy: { percentage: 0, months: 0 }
  },
  'Axis Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 60 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 84, D: 84 } },
    foirSettings: { categoryBasedFOIR: { 'Super A': 75, A: 75, B: 75, C: 75, D: 75, Govt: 75 }, creditCardObligationPercentage: 4 },
    multiplierRules: { categoryBasedMultiplier: { 'Super A': 36, A: 36, B: 36, C: 36, D: 36, Govt: 36 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 9.99, categoryRates: { 'Super A': 9.99, A: 9.99, B: 10.39, C: 10.59, Govt: 10.39 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 50000, bachelorCapping: { enabled: true, limits: { unmarried_bachelor: 2500000, unmarried_family: null, married_bachelor: null, unmarried_self_owned: null } } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 1 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, maxCreditCardBTCount: 5, processingFeePercentage: 1.5, maxCreditCardBTMultiplier: 6 },
    feesAndCharges: { processingFeePercentage: 2.0, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 },
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
    loanCapping: { absoluteMaxLoan: 7500000, minLoanAmount: 100000, bachelorCapping: { enabled: false } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 5, creditCardBTSupported: false, processingFeePercentage: 1.5, maxCreditCardBTMultiplier: 0 },
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
  },
  'L&T Finance': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 60 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 72, categoryBasedMaxTenure: { 'Super A': 72, A: 72, B: 72, C: 72, D: 72, Govt: 72 } },
    foirSettings: { categoryBasedFOIR: { 'Super A': 80, A: 80, B: 80, C: 75, D: 70, Govt: 80 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { 'Super A': 24, A: 24, B: 24, C: 20, D: 16, Govt: 24 } },
    creditScoreRules: { minCreditScore: 720, recommendedScore: 750, premiumScore: 775, autoRejectionThreshold: 720 },
    interestRates: { defaultRate: 12.50, categoryRates: { 'Super A': 11.50, A: 11.50, B: 11.50, C: 13.50, D: 14.50, Govt: 11.50 } },
    loanCapping: { absoluteMaxLoan: 3000000, minLoanAmount: 100000, bachelorCapping: { enabled: false }, rentedCapping: { D: 2000000 } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 1, minWorkExperienceMonths: 6 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: false, processingFeePercentage: 1.5, maxCreditCardBTMultiplier: 0 },
    feesAndCharges: { processingFeePercentage: 2.0, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 },
    incentivePolicy: { percentage: 0, months: 0 }
  }
};

// Save configuration for a specific bank, section, and optional location (State/City)
export const saveBankConfig = (bankName, sectionName, config, location = null) => {
  try {
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    if (!allConfigs[bankName]) {
      allConfigs[bankName] = { ...defaultConfigs[bankName], cityOverrides: {} };
    }

    const isGlobal = !location || 
      location === 'All India-All Cities' || 
      location === 'All India' || 
      location === 'All Cities' ||
      String(location).includes('All India') ||
      String(location).includes('All Cities');

    if (isGlobal) {
      // 1. Save directly to global root for the bank (available to all cities)
      allConfigs[bankName][sectionName] = config;

      // 2. Also keep 'All India-All Cities' override synced for backward compatibility
      if (!allConfigs[bankName].cityOverrides) allConfigs[bankName].cityOverrides = {};
      if (!allConfigs[bankName].cityOverrides['All India-All Cities']) {
        allConfigs[bankName].cityOverrides['All India-All Cities'] = {};
      }
      allConfigs[bankName].cityOverrides['All India-All Cities'][sectionName] = config;

      // 3. If unifiedPolicy, also update sub-objects for older legacy readers
      if (sectionName === 'unifiedPolicy' && config) {
        if (config.demographics) allConfigs[bankName].demographics = config.demographics;
        if (config.demographics) allConfigs[bankName].ageRules = {
          minAge: config.demographics.minAge,
          maxAge: config.demographics.maxAge,
          retirementAge: { salaried: config.demographics.retirementSalaried || 60, selfEmployed: 65 }
        };
        if (config.interestRates) allConfigs[bankName].interestRates = config.interestRates;
        if (config.loanCapping) allConfigs[bankName].loanCapping = config.loanCapping;
        if (config.tenureRules) allConfigs[bankName].tenureRules = config.tenureRules;
        if (config.foirMultiplier) allConfigs[bankName].foirMultiplier = config.foirMultiplier;
      }
      console.log(`🌐 Saved Global ${sectionName} for ${bankName}:`, config);
    } else {
      // Save to specific location entry
      if (!allConfigs[bankName].cityOverrides) allConfigs[bankName].cityOverrides = {};
      if (!allConfigs[bankName].cityOverrides[location]) {
        allConfigs[bankName].cityOverrides[location] = {};
      }
      allConfigs[bankName].cityOverrides[location][sectionName] = config;

      // Also ensure bank's global has unifiedPolicy as fallback if not already set
      if (!allConfigs[bankName][sectionName]) {
        allConfigs[bankName][sectionName] = config;
      }
      console.log(`📍 Saved ${sectionName} override for ${bankName} in ${location}:`, config);
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
    const rawStorage = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const allConfigs = JSON.parse(rawStorage || '{}');

    // 1. Try to get City-Specific Override first
    if (location && allConfigs[bankName]?.cityOverrides?.[location]?.[sectionName]) {
      return allConfigs[bankName].cityOverrides[location][sectionName];
    }

    // 2. Try 'All India-All Cities'
    if (allConfigs[bankName]?.cityOverrides?.['All India-All Cities']?.[sectionName]) {
      return allConfigs[bankName].cityOverrides['All India-All Cities'][sectionName];
    }

    // 3. Fallback to Global Saved Config
    if (allConfigs[bankName]?.[sectionName]) {
      return allConfigs[bankName][sectionName];
    }

    // 4. Fallback to Default Template
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
    const rawStorage = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const allConfigs = JSON.parse(rawStorage || '{}');
    const baseConfig = { ...(defaultConfigs[bankName] || {}), ...(allConfigs[bankName] || {}) };

    // Resolve unifiedPolicy fallback if missing from baseConfig root
    if (!baseConfig.unifiedPolicy) {
      if (allConfigs[bankName]?.cityOverrides?.['All India-All Cities']?.unifiedPolicy) {
        baseConfig.unifiedPolicy = allConfigs[bankName].cityOverrides['All India-All Cities'].unifiedPolicy;
      } else if (allConfigs[bankName]?.cityOverrides) {
        // Fallback to any configured city's unifiedPolicy if global hasn't been set
        const firstKey = Object.keys(allConfigs[bankName].cityOverrides).find(k => allConfigs[bankName].cityOverrides[k]?.unifiedPolicy);
        if (firstKey) {
          baseConfig.unifiedPolicy = allConfigs[bankName].cityOverrides[firstKey].unifiedPolicy;
        }
      }
    }

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

/**
 * Real-time listener for bank configurations from Firebase Firestore
 */
export const initBankConfigRealtimeListener = (onChangeCallback) => {
  if (typeof window === 'undefined') return () => {};
  try {
    const colRef = collection(db, 'bank_configurations');
    return onSnapshot(colRef, (snapshot) => {
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

            // Ensure unifiedPolicy is on root if stored under All India-All Cities
            if (!allConfigs[data.bankName].unifiedPolicy && data.config.cityOverrides?.['All India-All Cities']?.unifiedPolicy) {
              allConfigs[data.bankName].unifiedPolicy = data.config.cityOverrides['All India-All Cities'].unifiedPolicy;
            }

            syncCount++;

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
        console.log(`⚡ Real-time synced ${syncCount} bank policies from Cloud Firestore.`);
        if (typeof onChangeCallback === 'function') {
          onChangeCallback(allConfigs);
        }
      }
    }, (err) => {
      console.warn('⚠️ Real-time Firestore policy listener notice:', err.message);
    });
  } catch (err) {
    console.warn('Could not initialize real-time Firestore policy listener:', err.message);
    return () => {};
  }
};

// Automatic initial sync & real-time subscription in browser environment
if (typeof window !== 'undefined') {
  syncAllBankConfigsFromCloud();
  initBankConfigRealtimeListener();
}

