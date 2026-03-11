// Bank Configuration Service - Centralized storage and retrieval
const STORAGE_KEY = 'bank_configurations';

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
  },
  'Tata Capital': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 72, categoryBasedMaxTenure: { 'SUPER-A': 72, A: 72, B: 60, C: 60, D: 48 } },
    foirSettings: { categoryBasedFOIR: { 'SUPER-A': 75, A: 65, B: 60, C: 55, D: 50 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { 'SUPER-A': 27, A: 27, B: 25, C: 18, D: 18 } },
    creditScoreRules: { minCreditScore: 720, recommendedScore: 720, premiumScore: 750, autoRejectionThreshold: 650 },
    interestRates: { defaultRate: 11.0, categoryRates: { 'SUPER-A': 11.0, A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 3500000, minLoanAmount: 100000, bachelorCapping: { enabled: true, percentage: 50 } },
    employmentRules: { salariedMinSalary: 25000, selfEmployedMinIncome: 300000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 6, creditCardBTSupported: false, processingFeePercentage: 0.6 },
    feesAndCharges: { processingFeePercentage: 0.6, btChargesPercentage: 0.6, prepaymentChargesPercentage: 4 }
  },
  'Poonawala Finance': {
    ageRules: { minAge: 21, maxAge: 60, retirementAge: { salaried: 60, selfEmployed: 65 }, maxAgeAtLoanEnd: 60 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84, categoryBasedMaxTenure: { 'SUPER-A': 84, A: 84, B: 72, C: 72, D: 60 } },
    foirSettings: { categoryBasedFOIR: { 'SUPER-A': 75, A: 70, B: 65, C: 60, D: 55 }, creditCardObligationPercentage: 5 },
    multiplierRules: { categoryBasedMultiplier: { 'SUPER-A': 35, A: 32, B: 28, C: 24, D: 20 } },
    creditScoreRules: { minCreditScore: 650, recommendedScore: 700, premiumScore: 750, autoRejectionThreshold: 600 },
    interestRates: { defaultRate: 11.0, categoryRates: { 'SUPER-A': 11.0, A: 11.0, B: 11.0, C: 11.0, D: 11.0 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCapping: { enabled: true, percentage: 50 } },
    employmentRules: { salariedMinSalary: 30000, selfEmployedMinIncome: 400000, itrYearsRequired: 2 },
    btConfiguration: { enabled: true, maxLoansForBT: 3, creditCardBTSupported: true, processingFeePercentage: 1.0 },
    feesAndCharges: { processingFeePercentage: 1.0, btChargesPercentage: 1.0, prepaymentChargesPercentage: 4 }
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
      if (!allConfigs[bankName].cityOverrides) {
        allConfigs[bankName].cityOverrides = {};
      }
      if (!allConfigs[bankName].cityOverrides[location]) {
        allConfigs[bankName].cityOverrides[location] = {};
      }
      // Save to location-specific section (City, State or just State)
      allConfigs[bankName].cityOverrides[location][sectionName] = config;
      console.log(`📍 commit_local: ${sectionName} override for ${bankName} @ ${location}`);
    } else {
      // Save to global section
      allConfigs[bankName][sectionName] = config;
      console.log(`🌐 commit_global: ${sectionName} for ${bankName}`);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));
    return true;
  } catch (error) {
    console.error('Error saving bank config:', error);
    return false;
  }
};

// Get configuration for a specific bank, section, with hierarchical fallback
export const getBankConfig = (bankName, sectionName, location = null) => {
  try {
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const bankData = allConfigs[bankName] || defaultConfigs[bankName] || {};

    // 1. Try Specific City Override (e.g., "Jodhpur, Rajasthan")
    if (location && bankData.cityOverrides?.[location]?.[sectionName]) {
      return JSON.parse(JSON.stringify(bankData.cityOverrides[location][sectionName]));
    }

    // 2. Try State Level Fallback (e.g., "Rajasthan" if location was "Jodhpur, Rajasthan")
    if (location && location.includes(',')) {
      const statePart = location.split(',')[1].trim();
      if (bankData.cityOverrides?.[statePart]?.[sectionName]) {
        return JSON.parse(JSON.stringify(bankData.cityOverrides[statePart][sectionName]));
      }
    }

    // 3. Fallback to Global Saved Config
    if (bankData[sectionName]) {
      return JSON.parse(JSON.stringify(bankData[sectionName]));
    }

    // 4. Fallback to System Default
    if (defaultConfigs[bankName]?.[sectionName]) {
      return JSON.parse(JSON.stringify(defaultConfigs[bankName][sectionName]));
    }

    return null;
  } catch (error) {
    console.error('Error loading bank config:', error);
    return null;
  }
};

// Get all configuration for a bank at a specific location with source tracking
export const getAllBankConfig = (bankName, location = null) => {
  try {
    const allConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const template = allConfigs[bankName] || defaultConfigs[bankName] || {};

    // Start with a clean deep copy of global/default config
    let finalConfig = JSON.parse(JSON.stringify(template));
    let sourceTrace = location ? 'Global (No match found)' : 'Global Default';

    // Hierarchy Check
    if (location) {
      // Check City Level (High Priority)
      if (template.cityOverrides?.[location]) {
        finalConfig = { ...finalConfig, ...template.cityOverrides[location] };
        sourceTrace = `City Override (${location})`;
      }
      // Check State Level (Medium Priority)
      else if (location.includes(',')) {
        const statePart = location.split(',')[1].trim();
        if (template.cityOverrides?.[statePart]) {
          finalConfig = { ...finalConfig, ...template.cityOverrides[statePart] };
          sourceTrace = `State Override (${statePart})`;
        }
      }
    }

    // Remove cityOverrides from the final object to prevent recursion/leakage
    delete finalConfig.cityOverrides;

    // Attach source metadata
    finalConfig._ruleSource = sourceTrace;

    return finalConfig;
  } catch (error) {
    console.error('Error loading all bank config:', error);
    return { ...defaultConfigs[bankName], _ruleSource: 'Error Fallback (Defaults)' };
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
