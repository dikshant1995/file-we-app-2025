// IDFC Bank Configuration
// Multiplier-Only System (No FOIR)
// Uses category-based multipliers with salary bands
export const idfcConfig = {
  id: 'idfc',
  name: 'IDFC Bank',
  minAge: 23, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 640,
  maxLoanTenure: 20,
  maxLoanAmount: 5000000, // ₹50 Lakhs (Mid-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.012,

  // Incentive policy
  incentivePercentage: 1.0, // 100% of average incentive
  incentivePeriodMonths: 3, // Last 3 months

  // Multiplier table based on salary bands and categories
  // Formula: Loan Amount = Monthly Salary × Multiplier
  multiplierTable: {
    // SUPER A, A, and GOVT (combined - highest multipliers)
    'SUPER-A': {
      '<50000': 24,
      '50001-75000': 30,
      '>75001': 32  // Highest multiplier in the system
    },
    'A': {
      '<50000': 24,
      '50001-75000': 30,
      '>75001': 32
    },
    'GOVT': {
      '<50000': 24,
      '50001-75000': 30,
      '>75001': 32
    },
    // Category B (moderate multipliers)
    'B': {
      '<50000': 20,
      '50001-75000': 23,
      '>75001': 26
    },
    // Category C (lower multipliers)
    'C': {
      '<50000': 11,
      '50001-75000': 17,
      '>75001': 20
    },
    // Category D (lowest multipliers)
    'D': {
      '<50000': 11,
      '50001-75000': 15,
      '>75001': 18
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

  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'SUPER-A': 84,  // 7 years - CAT SUPER A
    'A': 84,        // 7 years - CAT A
    'GOVT': 84,     // 7 years - CAT GOVT
    'B': 84,        // 7 years - CAT B
    'C': 72,        // 6 years - CAT C
    'D': 72         // 6 years - CAT D
  },

  // Category descriptions
  categories: {
    'SUPER-A': { description: 'Super Category A - Premium Companies (Highest Multipliers)' },
    'A': { description: 'Category A - Top Tier Companies (Highest Multipliers)' },
    'GOVT': { description: 'Government Employees (Highest Multipliers, Stable)' },
    'B': { description: 'Category B - Good Companies (Moderate Multipliers)' },
    'C': { description: 'Category C - Standard Companies (Lower Multipliers)' },
    'D': { description: 'Category D - Lower-Tier Companies (Lowest Multipliers)' }
  },

  employmentTypes: ['salaried', 'government'],
  specialPrograms: ['idfc-first', 'government-special', 'premium-banking'],

  // Calculation method
  calculationMethod: 'Multiplier-Only',
  approach: 'Universal ₹20K Minimum + Category-Based Tiered Multipliers',
  keyFeatures: [
    'Multiplier-only system (no FOIR calculation)',
    'Universal ₹20,000 minimum across ALL categories (lowest barrier)',
    'SUPER-A/A/GOVT get highest multipliers (up to 32x)',
    'Three salary bands: <50K, 50K-75K, >75K',
    'Category C & D start with same low multiplier (11x)',
    'Progressive multipliers that reward higher incomes'
  ],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 3, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: false, // Does NOT accept BT for Fintech/digital platform loans
    description: 'IDFC Bank allows balance transfer for up to 3 existing personal loans (excluding Fintech loans)'
  }
};
