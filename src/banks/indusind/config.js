// IndusInd Bank Configuration
// Multiplier-Only System (No FOIR)
// Uses category-based multipliers with salary bands
export const indusindConfig = {
  id: 'indusind',
  name: 'IndusInd Bank',
  minAge: 22, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 650,
  maxLoanTenure: 20,
  maxLoanAmount: 5000000, // ₹50 Lakhs (Mid-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.01,

  // Incentive policy
  incentivePercentage: 1.0, // 100% of average incentive
  incentivePeriodMonths: 3, // Last 3 months
  // FOIR table based on salary
  foirTable: {
    'A+': {
      '20000-35000': 0.50,
      '35001-50000': 0.60,
      '50001-80000': 0.70,
      '>80000': 0.75
    },
    'A': {
      '20000-35000': 0.50,
      '35001-50000': 0.60,
      '50001-80000': 0.70,
      '>80000': 0.75
    },
    'GOVT': {
      '20000-35000': 0.50,
      '35001-50000': 0.60,
      '50001-80000': 0.70,
      '>80000': 0.75
    },
    'B': {
      '20000-35000': 0.50,
      '35001-50000': 0.60,
      '50001-80000': 0.70,
      '>80000': 0.70
    },
    'C': {
      '20000-35000': 0.50,
      '35001-50000': 0.50,
      '50001-80000': 0.70,
      '>80000': 0.70
    },
    'D': {
      '20000-35000': 0.50,
      '35001-50000': 0.50,
      '50001-80000': 0.70,
      '>80000': 0.70
    },
    'UNLISTED': {
      '20000-35000': 0.50,
      '35001-50000': 0.50,
      '50001-80000': 0.70,
      '>80000': 0.70
    }
  },

  // Multiplier table based on salary bands and categories
  // Formula: Loan Amount = Monthly Salary × Multiplier
  multiplierTable: {
    // Categories A+, A, B, and GOVT (combined treatment)
    'A+': {
      '25000-75000': 21,
      '75001-125000': 25,
      '125001+': 30
    },
    'A': {
      '25000-75000': 21,
      '75001-125000': 25,
      '125001+': 30
    },
    'B': {
      '25000-75000': 21,
      '75001+': 25  // Only 2 tiers for Category B
    },
    'GOVT': {
      '25000-75000': 21,
      '75001-125000': 25,
      '125001+': 30
    },
    // Category C (separate treatment)
    'C': {
      '30000+': 21  // Single tier - starts at 30K base
    },
    // Categories D and UNLISTED (similar treatment)
    'D': {
      '25000+': 18  // Lower multiplier for Category D
    },
    'UNLISTED': {
      '25000+': 18  // Same as Category D
    }
  },

  // Minimum salary requirements by category
  minSalaryByCategory: {
    'A+': 25000,
    'A': 25000,
    'B': 25000,
    'GOVT': 25000,
    'C': 30000,  // Higher minimum for Category C
    'D': 25000,  // Same as A/B
    'UNLISTED': 25000  // Same as A/B
  },

  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'A+': 72,      // 6 years - CAT A+
    'A': 72,       // 6 years - CAT A
    'GOVT': 72,    // 6 years - CAT GOVT
    'B': 72,       // 6 years - CAT B
    'C': 48,       // 4 years - CAT C
    'D': 48,       // 4 years - CAT D
    'UNLISTED': 48 // 4 years - UNLISTED
  },

  // Category descriptions
  categories: {
    'A+': { description: 'Category A+ - Premium Companies (Highest Multipliers)' },
    'A': { description: 'Category A - Top Tier Companies (Highest Multipliers)' },
    'B': { description: 'Category B - Good Companies (Moderate Multipliers)' },
    'GOVT': { description: 'Government Employees (Highest Multipliers, Stable)' },
    'C': { description: 'Category C - Standard Companies (Base Multiplier)' },
    'D': { description: 'Category D - Lower Tier Companies' },
    'UNLISTED': { description: 'Unlisted Companies' }
  },

  employmentTypes: ['salaried', 'government'],
  specialPrograms: ['indusind-select', 'government-special', 'premium-banking'],

  // Calculation method
  calculationMethod: 'Both (Dual)',
  approach: 'Category-Based Minimum Salary + Tiered Multipliers',
  keyFeatures: [
    'Multiplier-only system (no FOIR calculation)',
    'Category C has higher minimum salary (₹30K vs ₹25K)',
    'A+, A, GOVT get highest multipliers (up to 30x)',
    'Category B capped at 25x multiplier',
    'Category C flat 21x multiplier regardless of income',
    'Progressive multipliers for premium categories'
  ],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 5, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: false, // Does NOT accept BT for Fintech/digital platform loans
    description: 'IndusInd Bank allows balance transfer for up to 5 existing personal loans (excluding Fintech loans)'
  }
};
