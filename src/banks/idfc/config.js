// IDFC Bank Configuration
// Multiplier-Only System (No FOIR)
// Uses category-based multipliers with salary bands
export const idfcConfig = {
  id: 'idfc',
  name: 'IDFC First Bank',
  minAge: 23, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 640,
  maxLoanTenure: 7, // 7 Years (84 Months)
  maxLoanAmount: 10000000, // ₹1 Crore (₹100 Lakhs)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 10.25, // Base rate starting at 10.25%
  processingFee: 0.012, // 1.2%

  // Incentive policy
  incentivePercentage: 1.0, // 100% of average incentive
  incentivePeriodMonths: 3, // Last 3 months

  // FOIR table based on salary
  foirTable: {
    'SUPER-A': {
      '20000-40000': 0.60,
      '40001-50000': 0.60,
      '50001-75000': 0.65,
      '>75000': 0.70
    },
    'A': {
      '20000-40000': 0.60,
      '40001-50000': 0.60,
      '50001-75000': 0.65,
      '>75000': 0.70
    },
    'GOVT': {
      '20000-40000': 0.60,
      '40001-50000': 0.60,
      '50001-75000': 0.65,
      '>75000': 0.70
    },
    'B': {
      '20000-40000': 0.60,
      '40001-50000': 0.60,
      '50001-75000': 0.65,
      '>75000': 0.70
    },
    'C': {
      '20000-40000': 0.50,
      '40001-50000': 0.60,
      '50001-75000': 0.65,
      '>75000': 0.70
    },
    'D': {
      '20000-40000': 0.50,
      '40001-50000': 0.60,
      '50001-75000': 0.65,
      '>75000': 0.70
    }
  },

  // Multiplier table based on salary bands and categories (Master Excel Policy)
  multiplierTable: {
    'SUPER-A': {
      '<50000': 23,
      '50001-75000': 25,
      '>75001': 27
    },
    'A': {
      '<50000': 23,
      '50001-75000': 25,
      '>75001': 27
    },
    'GOVT': {
      '<50000': 23,
      '50001-75000': 25,
      '>75001': 27
    },
    'B': {
      '<50000': 16,
      '50001-75000': 20,
      '>75001': 22
    },
    'C': {
      '<50000': 11,
      '50001-75000': 13,
      '>75001': 15
    },
    'D': {
      '<50000': 11,
      '50001-75000': 13,
      '>75001': 15
    }
  },

  // Universal minimum salary requirement - ₹20,000 for ALL categories
  minSalary: 20000,

  // Minimum salary requirements by category (all same)
  minSalaryByCategory: {
    'SUPER-A': 20000,
    'A': 20000,
    'B': 20000,
    'C': 20000,
    'D': 20000,
    'GOVT': 20000
  },

  // Maximum tenure by category (in months) - Up to 84 months across all categories
  maxTenureByCategory: {
    'SUPER-A': 84,  // 7 years
    'A': 84,        // 7 years
    'GOVT': 84,     // 7 years
    'B': 84,        // 7 years
    'C': 84,        // 7 years
    'D': 84         // 7 years
  },

  // Category descriptions
  categories: {
    'SUPER-A': { description: 'Super Category A - Premium Companies' },
    'A': { description: 'Category A - Top Tier Companies' },
    'GOVT': { description: 'Government Employees' },
    'B': { description: 'Category B - Good Companies' },
    'C': { description: 'Category C - Standard Companies' },
    'D': { description: 'Category D - Lower-Tier Companies' }
  },

  employmentTypes: ['salaried', 'private', 'government'],
  specialPrograms: ['idfc-first', 'government-special', 'premium-banking'],

  // Calculation method
  calculationMethod: 'Both (Dual)',
  approach: 'Universal ₹20K Minimum + Category-Based Tiered Multipliers & FOIR',

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true,
    maxLoansForBT: 3,
    acceptsFintechLoans: false,
    description: 'IDFC First Bank allows balance transfer for up to 3 existing personal loans (excluding Fintech loans)'
  }
};

