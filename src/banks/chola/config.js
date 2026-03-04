// Cholamandalam Finance Configuration
export const cholaConfig = {
  id: 'chola',
  name: 'Cholamandalam Finance',
  minAge: 23, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 620,
  maxLoanTenure: 20,
  maxLoanAmount: 2000000, // ₹20 Lakhs (Lower-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals (same as overall cap)
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.01,

  // Incentive policy
  incentivePercentage: 0.60, // 60% of average incentive
  incentivePeriodMonths: 3, // Last 3 months

  // FOIR table based on salary bands and categories
  foirTable: {
    '20000-30000': {
      'A': 0.65,
      'GOVT': 0.65,
      'B': 0.65,
      'C': 0.55,
      'D': 0.55
    },
    '30001-50000': {
      'A': 0.65,
      'GOVT': 0.65,
      'B': 0.65,
      'C': 0.55,
      'D': 0.55
    },
    '50001-75000': {
      'A': 0.70,
      'GOVT': 0.70,
      'B': 0.70,
      'C': 0.65,
      'D': 0.65
    },
    '75001+': {
      'A': 0.70,
      'GOVT': 0.70,
      'B': 0.70,
      'C': 0.65,
      'D': 0.65
    }
  },

  // Minimum salary requirements by category
  minSalary: {
    'A': 20000,
    'B': 25000,      // Higher minimum for Category B
    'C': 20000,
    'D': 25000,      // Higher minimum for Category D
    'GOVT': 20000,
    'UNLISTED': null  // UNLISTED companies are NOT ELIGIBLE
  },

  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'A': 84,        // 7 years - CAT A
    'GOVT': 84,     // 7 years - CAT GOVT
    'B': 84,        // 7 years - CAT B
    'C': 84,        // 7 years - CAT C
    'D': 60         // 5 years - CAT D
  },

  // Company categories
  companyCategories: {
    'A': { minIncome: 20000, description: 'Category A Companies' },
    'B': { minIncome: 25000, description: 'Category B Companies' },
    'C': { minIncome: 20000, description: 'Category C Companies' },
    'D': { minIncome: 25000, description: 'Category D Companies' },
    'GOVT': { minIncome: 20000, description: 'Government Employees' },
    'UNLISTED': { minIncome: null, description: 'UNLISTED Companies - NOT ELIGIBLE' }
  },

  employmentTypes: ['salaried', 'government', 'self-employed'],
  specialPrograms: ['auto-finance', 'retail-loan', 'service-sector'],

  // Special note: UNLISTED companies are not eligible for loans
  unlistedEligible: false,

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 6, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: false, // Does NOT accept BT for Fintech/digital platform loans
    description: 'Cholamandalam allows balance transfer for up to 6 existing personal loans (excluding Fintech loans)'
  }
};