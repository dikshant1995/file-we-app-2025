/**
 * Interest Rate Configuration System
 * 
 * This file centralizes all interest rate configurations.
 * Rates can be configured:
 * 1. Bank-wise (different rate per bank)
 * 2. Category-wise (different rate per category)
 * 3. Bank + Category combination (most granular)
 * 
 * Default: 11% for all banks and all categories
 * Future: Can be customized per bank and category
 */

/**
 * GLOBAL DEFAULT INTEREST RATE
 * This is used when no specific bank or category rate is defined
 */
export const DEFAULT_INTEREST_RATE = 11; // 11% default for all

/**
 * BANK-WISE INTEREST RATES
 * Define different rates for each bank (optional)
 * If not defined, DEFAULT_INTEREST_RATE is used
 */
export const bankWiseInterestRates = {
  'kotak': 11,              // Kotak Mahindra Bank
  'hdfc': 11,               // HDFC Bank
  'icici': 11,              // ICICI Bank
  'bandhan': 11,            // Bandhan Bank
  'chola': 11,              // Cholamandalam Finance
  'tata': 11,               // Tata Capital
  'poonawala': 11,          // Poonawala Finance
  'axis-fin': 11,           // Axis Finance
  'indusind': 11,           // IndusInd Bank
  'idfc': 11,               // IDFC Bank
  'shri-ram': 11,           // Shri Ram Finance
  'piramal': 11             // Piramal Finance
};

/**
 * CATEGORY-WISE INTEREST RATES
 * Define different rates for each category (optional)
 * If not defined, bank-wise or default rate is used
 */
export const categoryWiseInterestRates = {
  'AA': 11,      // Category AA - Premium companies
  'A': 11,       // Category A - Top tier companies
  'Super A': 11, // Category Super A - HDFC specific
  'SUPER-A': 11, // Category Super A - IDFC specific
  'A+': 11,      // Category A+ - IndusInd specific
  'SUP-A': 11,   // Category SUP-A - Poonawala/Tata specific
  'B': 11,       // Category B - Good companies
  'C': 11,       // Category C - Mid-tier companies
  'D': 11,       // Category D - Lower-tier companies
  'E': 11,       // Category E - Poonawala specific
  'GOVT': 11,    // Government employees
  'Govt': 11,    // Government (HDFC format)
  'UNLISTED': 11 // Unlisted companies
};

/**
 * BANK + CATEGORY SPECIFIC INTEREST RATES
 * Most granular control - define rate for specific bank and category combination
 * Format: 'bankId-category': rate
 * 
 * Example usage (currently all set to 11%):
 * - 'kotak-A': 10.5    // Kotak offers 10.5% for Category A
 * - 'hdfc-B': 11.25    // HDFC offers 11.25% for Category B
 * - 'icici-GOVT': 10   // ICICI offers 10% for Government employees
 */
export const bankCategoryInterestRates = {
  // Kotak Mahindra Bank
  'kotak-AA': 11,
  'kotak-A': 11,
  'kotak-B': 11,
  'kotak-C': 11,
  'kotak-D': 11,
  'kotak-GOVT': 11,
  
  // HDFC Bank
  'hdfc-Super A': 11,
  'hdfc-A': 11,
  'hdfc-B': 11,
  'hdfc-C': 11,
  'hdfc-Govt': 11,
  
  // ICICI Bank
  'icici-A': 11,
  'icici-B': 11,
  'icici-C': 11,
  'icici-D': 11,
  'icici-GOVT': 11,
  'icici-UNLISTED': 11,
  
  // Bandhan Bank
  'bandhan-A': 11,
  'bandhan-B': 11,
  'bandhan-C': 11,
  'bandhan-D': 11,
  'bandhan-GOVT': 11,
  'bandhan-UNLISTED': 11,
  
  // Cholamandalam Finance
  'chola-A': 11,
  'chola-B': 11,
  'chola-C': 11,
  'chola-D': 11,
  'chola-GOVT': 11,
  
  // Tata Capital
  'tata-SUP-A': 11,
  'tata-A': 11,
  'tata-B': 11,
  'tata-C': 11,
  'tata-D': 11,
  'tata-GOVT': 11,
  'tata-UNLISTED': 11,
  
  // Poonawala Finance
  'poonawala-SUP-A': 11,
  'poonawala-A': 11,
  'poonawala-B': 11,
  'poonawala-C': 11,
  'poonawala-D': 11,
  'poonawala-E': 11,
  'poonawala-GOVT': 11,
  
  // Axis Finance
  'axis-fin-A': 11,
  'axis-fin-B': 11,
  'axis-fin-C': 11,
  'axis-fin-D': 11,
  'axis-fin-GOVT': 11,
  
  // IndusInd Bank
  'indusind-A+': 11,
  'indusind-A': 11,
  'indusind-B': 11,
  'indusind-C': 11,
  'indusind-D': 11,
  'indusind-GOVT': 11,
  'indusind-UNLISTED': 11,
  
  // IDFC Bank
  'idfc-SUPER-A': 11,
  'idfc-A': 11,
  'idfc-B': 11,
  'idfc-C': 11,
  'idfc-D': 11,
  'idfc-GOVT': 11,
  
  // Shri Ram Finance
  'shri-ram-A': 11,
  'shri-ram-B': 11,
  'shri-ram-C': 11,
  'shri-ram-D': 11,
  'shri-ram-GOVT': 11,
  'shri-ram-UNLISTED': 11,
  
  // Piramal Finance
  'piramal-ALL': 11  // Piramal doesn't distinguish by category
};

/**
 * Get interest rate for a specific bank and category
 * Priority order:
 * 1. Bank + Category specific rate (most specific)
 * 2. Category-wise rate
 * 3. Bank-wise rate
 * 4. Default rate (fallback)
 * 
 * @param {string} bankId - Bank identifier (e.g., 'kotak', 'hdfc')
 * @param {string} category - Category (e.g., 'A', 'B', 'C')
 * @returns {number} Interest rate (percentage)
 */
export const getInterestRate = (bankId, category) => {
  // Priority 1: Bank + Category specific
  const bankCategoryKey = `${bankId}-${category}`;
  if (bankCategoryInterestRates[bankCategoryKey] !== undefined) {
    return bankCategoryInterestRates[bankCategoryKey];
  }
  
  // Priority 2: Category-wise
  if (categoryWiseInterestRates[category] !== undefined) {
    return categoryWiseInterestRates[category];
  }
  
  // Priority 3: Bank-wise
  if (bankWiseInterestRates[bankId] !== undefined) {
    return bankWiseInterestRates[bankId];
  }
  
  // Priority 4: Default
  return DEFAULT_INTEREST_RATE;
};

/**
 * Set custom interest rate for a bank
 * @param {string} bankId - Bank identifier
 * @param {number} rate - Interest rate (percentage)
 */
export const setBankInterestRate = (bankId, rate) => {
  bankWiseInterestRates[bankId] = rate;
};

/**
 * Set custom interest rate for a category
 * @param {string} category - Category identifier
 * @param {number} rate - Interest rate (percentage)
 */
export const setCategoryInterestRate = (category, rate) => {
  categoryWiseInterestRates[category] = rate;
};

/**
 * Set custom interest rate for a bank + category combination
 * @param {string} bankId - Bank identifier
 * @param {string} category - Category identifier
 * @param {number} rate - Interest rate (percentage)
 */
export const setBankCategoryInterestRate = (bankId, category, rate) => {
  const key = `${bankId}-${category}`;
  bankCategoryInterestRates[key] = rate;
};

/**
 * Get all interest rates for a specific bank across all categories
 * @param {string} bankId - Bank identifier
 * @returns {Object} Object with category as key and rate as value
 */
export const getBankInterestRates = (bankId) => {
  const rates = {};
  const categories = Object.keys(categoryWiseInterestRates);
  
  categories.forEach(category => {
    rates[category] = getInterestRate(bankId, category);
  });
  
  return rates;
};

/**
 * Get all interest rates for a specific category across all banks
 * @param {string} category - Category identifier
 * @returns {Object} Object with bankId as key and rate as value
 */
export const getCategoryInterestRates = (category) => {
  const rates = {};
  const banks = Object.keys(bankWiseInterestRates);
  
  banks.forEach(bankId => {
    rates[bankId] = getInterestRate(bankId, category);
  });
  
  return rates;
};

/**
 * Reset all rates to default
 */
export const resetToDefaultRates = () => {
  // Reset all to default
  Object.keys(bankWiseInterestRates).forEach(bankId => {
    bankWiseInterestRates[bankId] = DEFAULT_INTEREST_RATE;
  });
  
  Object.keys(categoryWiseInterestRates).forEach(category => {
    categoryWiseInterestRates[category] = DEFAULT_INTEREST_RATE;
  });
  
  Object.keys(bankCategoryInterestRates).forEach(key => {
    bankCategoryInterestRates[key] = DEFAULT_INTEREST_RATE;
  });
};

/**
 * FUTURE CUSTOMIZATION EXAMPLES
 * Uncomment and modify these examples to set custom rates
 */

// Example 1: Different rates per bank
// setBankInterestRate('kotak', 10.5);
// setBankInterestRate('hdfc', 10.75);
// setBankInterestRate('icici', 11.0);

// Example 2: Different rates per category
// setCategoryInterestRate('A', 10.5);
// setCategoryInterestRate('B', 11.0);
// setCategoryInterestRate('C', 11.5);

// Example 3: Specific bank-category combinations
// setBankCategoryInterestRate('kotak', 'A', 10.25);  // Kotak offers 10.25% for Cat A
// setBankCategoryInterestRate('hdfc', 'B', 10.75);   // HDFC offers 10.75% for Cat B
// setBankCategoryInterestRate('icici', 'GOVT', 10.0); // ICICI offers 10% for Govt

/**
 * Export configuration for easy access
 */
export default {
  DEFAULT_INTEREST_RATE,
  getInterestRate,
  setBankInterestRate,
  setCategoryInterestRate,
  setBankCategoryInterestRate,
  getBankInterestRates,
  getCategoryInterestRates,
  resetToDefaultRates
};
