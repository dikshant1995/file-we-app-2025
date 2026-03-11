// Shri Ram Finance Configuration
// Combined Multiplier + FOIR System (Salary-Driven)
// Universal minimum salary across all categories including UNLISTED
export const shriRamConfig = {
  id: 'shri-ram',
  name: 'Shri Ram Finance',
  minAge: 23, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 600,
  maxLoanTenure: 20,
  maxLoanAmount: 3000000, // ₹30 Lakhs (Moderate-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.011,

  // Incentive policy
  incentivePercentage: 0.60, // 60% of average incentive
  incentivePeriodMonths: 3, // Last 3 months

  // Combined Multiplier + FOIR table based ONLY on salary
  // No category distinction for multiplier/FOIR calculation
  salaryBandTable: {
    '25000-35000': {
      multiplier: 14,
      foir: 0.50
    },
    '35001-50000': {
      multiplier: 18,
      foir: 0.60
    },
    '50001-75000': {
      multiplier: 20,
      foir: 0.65
    },
    '75001+': {
      multiplier: 22,
      foir: 0.70
    }
  },

  // Universal minimum salary requirement (same for all categories)
  minSalary: 25000,

  // Minimum salary by category (all same - unique feature)
  minSalaryByCategory: {
    'A': 25000,
    'B': 25000,
    'C': 25000,
    'D': 25000,
    'UNLISTED': 25000  // Same as others - very inclusive!
  },

  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'A': 60,        // 5 years - CAT A
    'GOVT': 60,     // 5 years - CAT GOVT
    'B': 60,        // 5 years - CAT B
    'C': 60,        // 5 years - CAT C
    'D': 60,        // 5 years - CAT D
    'UNLISTED': 60  // 5 years - UNLISTED
  },

  // Category descriptions (for reference only, doesn't affect multiplier/FOIR)
  categories: {
    'A': { description: 'Category A - Top Tier Companies' },
    'B': { description: 'Category B - Good Companies' },
    'C': { description: 'Category C - Mid-Tier Companies' },
    'D': { description: 'Category D - Lower-Tier Companies' },
    'UNLISTED': { description: 'Unlisted Companies - Fully Eligible (unique to Shriram)' }
  },

  employmentTypes: ['salaried', 'self-employed', 'unlisted', 'government'],
  specialPrograms: ['income-focused-lending', 'inclusive-finance', 'unlisted-friendly'],

  // Calculation method
  calculationMethod: 'Combined (Multiplier + FOIR)',
  approach: 'Income-Centric (Salary-Driven)',
  keyFeatures: [
    'Universal ₹25,000 minimum across ALL categories',
    'UNLISTED fully eligible (same minimum as others)',
    'Multiplier and FOIR determined by salary ONLY',
    'No category distinction in lending calculations',
    'Simplified, income-based assessment',
    'Up to 70% FOIR for high earners',
    'Most inclusive for UNLISTED category'
  ],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 10, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: true, // ✅ ACCEPTS BT for Fintech/digital platform loans - Highly inclusive
    description: 'Shri Ram Finance allows balance transfer for up to 10 existing personal loans - the most flexible BT policy among all lenders (INCLUDES Fintech loans)'
  }
};