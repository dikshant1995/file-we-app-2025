import { getAllBankConfig } from '../services/bankConfigService';

/**
 * Deep merges override configuration into base configuration.
 * @param {Object} base - The hardcoded base configuration.
 * @param {Object} override - The dynamic overrides from admin panel.
 * @returns {Object} The merged configuration.
 */
const deepMerge = (base, override) => {
    const result = { ...base };

    if (!override) return result;

    for (const key in override) {
        if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
            result[key] = deepMerge(base[key] || {}, override[key]);
        } else {
            result[key] = override[key];
        }
    }

    return result;
};

/**
 * Gets the effective configuration for a bank by merging hardcoded defaults
 * with dynamic overrides from the Admin Panel.
 * 
 * @param {string} bankName - Full name of the bank (e.g., 'Kotak Mahindra Bank').
 * @param {Object} hardcodedConfig - The original config.js object.
 * @returns {Object} The merged, effective configuration.
 */
export const getEffectiveConfig = (bankName, hardcodedConfig) => {
    try {
        const adminOverrides = getAllBankConfig(bankName);

        // Map of Admin Panel section names to config field names
        const sectionMap = {
            'ageRules': 'ageRules',
            'tenureRules': 'tenureRules',
            'foir': 'foirSettings',
            'foirSettings': 'foirSettings',
            'foirTable': 'foirTable', // New matrix support
            'multiplier': 'multiplierRules',
            'multiplierRules': 'multiplierRules',
            'multiplierTable': 'multiplierTable', // New matrix support
            'interestRates': 'interestRates',
            'loanCapping': 'loanCapping',
            'employment': 'employmentRules',
            'employmentRules': 'employmentRules',
            'fees': 'feesAndCharges',
            'feesAndCharges': 'feesAndCharges'
        };

        // Prepare a result object
        let effectiveConfig = { ...hardcodedConfig };

        // Apply specific section overrides if they exist
        // This handles the structure saved by bankConfigService.saveBankConfig(bankName, sectionName, config)
        if (adminOverrides) {
            // Handle mapped sections
            Object.keys(sectionMap).forEach(adminKey => {
                const configKey = sectionMap[adminKey];
                if (adminOverrides[adminKey]) {
                    effectiveConfig[configKey] = deepMerge(effectiveConfig[configKey] || {}, adminOverrides[adminKey]);
                }
            });

            // Also check if any high-level keys in hardcodedConfig match adminOverrides
            // (This is for when the entire config object might have been exported/imported)
            Object.keys(hardcodedConfig).forEach(key => {
                if (adminOverrides[key] && !sectionMap[key]) {
                    effectiveConfig[key] = deepMerge(effectiveConfig[key] || {}, adminOverrides[key]);
                }
            });
        }

        return effectiveConfig;
    } catch (error) {
        console.error(`Error merging config for ${bankName}:`, error);
        return hardcodedConfig;
    }
};
