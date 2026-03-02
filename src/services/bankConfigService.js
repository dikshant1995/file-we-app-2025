// Bank Configuration Service - Centralized storage and retrieval
const STORAGE_KEY = 'bank_configurations';

// Sync from Server on Load
export const initBankConfig = async () => {
  try {
    console.log('🔄 Syncing bank configs from server...');
    const response = await fetch('/api/bank-configs');
    if (response.ok) {
      const serverConfigs = await response.json();
      if (serverConfigs && Object.keys(serverConfigs).length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverConfigs));
        console.log('✅ LocalStorage synced with server configs');
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not sync with server, using local fallback:', error);
  }
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
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, percentage: 50 } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 }
  },
  'ICICI Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, percentage: 50 } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 }
  },
  'Axis Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, percentage: 50 } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 }
  },
  'Kotak Mahindra Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, percentage: 50 } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 }
  },
  'IndusInd Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, percentage: 50 } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 }
  },
  'IDFC First Bank': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { A: 35, B: 30, C: 25, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, percentage: 50 } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.5 },
    feesAndCharges: { processingFeePercentage: 3.5, btChargesPercentage: 1.5, prepaymentChargesPercentage: 4 }
  }
};

// Save configuration for a specific bank and section
// location can be a state name or city name for an override
export const saveBankConfig = async (bankName, sectionName, config, location = null) => {
  try {
    // 1. Save to localStorage (Instant UI update)
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!allConfigs[bankName]) allConfigs[bankName] = { ...defaultConfigs[bankName] };

    if (location) {
      if (!allConfigs[bankName].locationOverrides) allConfigs[bankName].locationOverrides = {};
      if (!allConfigs[bankName].locationOverrides[sectionName]) allConfigs[bankName].locationOverrides[sectionName] = {};
      allConfigs[bankName].locationOverrides[sectionName][location] = config;
    } else {
      allConfigs[bankName][sectionName] = config;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));

    // 2. Sync to Backend (The "Secret Vault")
    const response = await fetch('/api/bank-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankName, sectionName, config, locationKey: location })
    });

    if (!response.ok) throw new Error('Failed to sync config to server');

    console.log(`✅ Config synced to server for ${bankName}`);
    return true;
  } catch (error) {
    console.error('Error saving bank config:', error);
    return false;
  }
};

// Get configuration for a specific bank and section with location hierarchy support
// locationContext: { state: string, city: string }
export const getBankConfig = (bankName, sectionName, locationContext = {}) => {
  try {
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const bankConfig = allConfigs[bankName] || defaultConfigs[bankName] || {};

    // 1. Check for Overrides (City > State)
    const overrides = bankConfig.locationOverrides?.[sectionName] || {};

    // Check City Override
    if (locationContext.city && overrides[locationContext.city]) {
      // console.log(`📍 Using CITY override for ${sectionName} in ${locationContext.city}`);
      return overrides[locationContext.city];
    }

    // Check State Override
    if (locationContext.state && overrides[locationContext.state]) {
      // console.log(`📍 Using STATE override for ${sectionName} in ${locationContext.state}`);
      return overrides[locationContext.state];
    }

    // 2. Return saved Global config
    if (allConfigs[bankName] && allConfigs[bankName][sectionName]) {
      return allConfigs[bankName][sectionName];
    }

    // 3. Return default if exists
    if (defaultConfigs[bankName] && defaultConfigs[bankName][sectionName]) {
      return defaultConfigs[bankName][sectionName];
    }

    return null;
  } catch (error) {
    console.error('Error loading bank config:', error);
    return null;
  }
};

/**
 * Helper to get interest rate from slab-based config
 * Used by bank calculators to support Admin Dashboard overrides
 */
export const getDynamicInterestRate = (bankName, category, loanAmount, locationContext = {}, fallbackRate = 11.0) => {
  const rateConfig = getBankConfig(bankName, 'interestRates', locationContext);

  if (!rateConfig || !rateConfig.categorySlabRates || !rateConfig.categorySlabRates[category]) {
    return fallbackRate;
  }

  const slabs = rateConfig.categorySlabRates[category];

  // Find matching slab by parsing rupee ranges (e.g., "₹100000-500000")
  for (const slabLabel in slabs) {
    const match = slabLabel.match(/₹(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);

      if (loanAmount >= min && loanAmount <= max) {
        return slabs[slabLabel];
      }
    }
  }

  return fallbackRate;
};

// Get all configuration for a bank
export const getAllBankConfig = (bankName) => {
  try {
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    if (allConfigs[bankName]) {
      return allConfigs[bankName];
    }

    return defaultConfigs[bankName] || {};
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
