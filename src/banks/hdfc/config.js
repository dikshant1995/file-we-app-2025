// HDFC Bank Configuration
export const hdfcConfig = {
  id: 'hdfc',
  name: 'HDFC Bank',
  minAge: 21, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 650,
  maxLoanTenure: 30,
  maxLoanAmount: 10000000, // ₹1 Crore (High-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.006,

  // Incentive policy
  incentivePercentage: 0.50, // 50% of average incentive
  incentivePeriodMonths: 3, // Last 3 months

  // Multiplier table based on salary bands and categories
  multiplierTable: {
    '25000-35000': {
      'SUPER-A': 19,
      'A': 19,
      'GOVT': 19,
      'B': 12,
      'C': null  // Not Applicable
    },
    '35001-50000': {
      'SUPER-A': 22,
      'A': 20,
      'GOVT': 20,
      'B': 15,
      'C': 13
    },
    '50001-75000': {
      'SUPER-A': 25,
      'A': 23,
      'GOVT': 23,
      'B': 20,
      'C': 20
    },
    '75001+': {
      'SUPER-A': 27,
      'A': 24,
      'GOVT': 24,
      'B': 22,
      'C': 21
    }
  },
  // FOIR table based on salary bands and categories
  foirTable: {
    '25000-50000': {
      'SUPER-A': 0.55,
      'A': 0.55,
      'B': 0.55,
      'C': 0.50,
      'GOVT': 0.55
    },
    '50001-75000': {
      'SUPER-A': 0.65,
      'A': 0.65,
      'B': 0.65,
      'C': 0.65,
      'GOVT': 0.65
    },
    '75001-100000': {
      'SUPER-A': 0.70,
      'A': 0.70,
      'B': 0.70,
      'C': 0.70,
      'GOVT': 0.70
    },
    '100001+': {
      'SUPER-A': 0.70,
      'A': 0.70,
      'B': 0.70,
      'C': 0.70,
      'GOVT': 0.70
    }
  },
  // Minimum salary requirements by category
  minSalary: {
    'SUPER-A': 25000,
    'A': 25000,
    'B': 25000,
    'C': 35000,
    'GOVT': 25000
  },
  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'SUPER-A': 72,  // 6 years - CAT SUPER A
    'A': 72,        // 6 years - CAT A
    'GOVT': 72,     // 6 years - CAT GOVT
    'B': 72,        // 6 years - CAT B
    'C': 60         // 5 years - CAT C
  },
  employmentTypes: ['salaried', 'government'],
  specialPrograms: ['hdfc-premium', 'salaried-classic', 'women-advantage'],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 3, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: false, // Does NOT accept BT for Fintech/digital platform loans
    description: 'HDFC allows balance transfer for up to 3 existing personal loans (excluding Fintech loans)'
  }
};