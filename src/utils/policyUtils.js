import { getAllBankConfig } from '../services/bankConfigService.js';

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

/**
 * Centrally finds the appropriate interest rate from a slab-based matrix.
 * 
 * @param {string} bankName - Full name of the bank.
 * @param {string} category - Normalized category (Super A, A, B, C, D, Govt).
 * @param {number} loanAmount - Calculated or desired loan amount.
 * @param {string} [location] - Optional location for overrides.
 * @param {number} [defaultRate=11.0] - Fallback rate if no match found.
 * @returns {number} The effective annual interest rate.
 */
export const getSlabRate = (bankName, category, loanAmount, location = null, defaultRate = 11.0) => {
    try {
        const config = getAllBankConfig(bankName, location);

        // Safety check for matrix existence
        if (!config || !config.interestRates || !config.interestRates.categorySlabRates) {
            return defaultRate;
        }

        const categoryMatrix = config.interestRates.categorySlabRates[category];
        if (!categoryMatrix) {
            // Fallback to global category-based rate if matrix doesn't have this specific category
            return config.interestRates.categoryRates?.[category] || defaultRate;
        }

        // Iterate through labels like "100000-500000" or "₹100000-500000"
        for (const label in categoryMatrix) {
            // Remove all non-numeric characters EXCEPT the hyphen for range identification
            const sanitizedLabel = label.replace(/[^\d-]/g, '');
            const parts = sanitizedLabel.split('-');

            if (parts.length === 2) {
                const min = parseInt(parts[0]);
                const max = parseInt(parts[1]);

                if (loanAmount >= min && loanAmount <= max) {
                    const rate = parseFloat(categoryMatrix[label]);
                    if (!isNaN(rate)) return rate;
                }
            }
        }

        // No slab matched? Use category-level or default
        return config.interestRates.categoryRates?.[category] || defaultRate;
    } catch (error) {
        console.error(`Slab lookup error for ${bankName}:`, error);
        return defaultRate;
    }
};
