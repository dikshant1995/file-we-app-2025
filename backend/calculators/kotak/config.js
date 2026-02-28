// Kotak Mahindra Bank Configuration
export const kotakConfig = {
  id: 'kotak',
  name: 'Kotak Mahindra Bank',
  minAge: 21, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 700,
  maxLoanTenure: 30,
  maxLoanAmount: 5000000, // ₹50 Lakhs (Mid-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.007,
  // Incentive policy
  incentivePercentage: 1.0, // 100% of average incentive
  incentivePeriodMonths: 3, // Last 3 months
  employmentTypes: ['salaried', 'government'],
  specialPrograms: ['kotak-premium', 'women-empowerment', 'salaried-plus'],
  
  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 6, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: false, // Does NOT accept BT for Fintech/digital platform loans
    description: 'Kotak allows balance transfer for up to 6 existing personal loans (excluding Fintech loans)'
  },
  // Multiplier table based on salary bands and categories
  multiplierTable: {
    '25000-35000': {
      'AA': 19,
      'A': 19,
      'GOVT': 19,
      'B': 15,
      'C': 9,
      'D': 8
    },
    '35001-50000': {
      'AA': 22,
      'A': 22,
      'GOVT': 22,
      'B': 18,
      'C': 12,
      'D': 10
    },
    '50001-75000': {
      'AA': 30,
      'A': 26,
      'GOVT': 26,
      'B': 24,
      'C': 18,
      'D': 16
    },
    '75000+': {
      'AA': 31,
      'A': 30,
      'GOVT': 30,
      'B': 26,
      'C': 20,
      'D': 18
    }
  },
  // FOIR table based on salary bands and categories
  foirTable: {
    '25000-34999': {
      'AA': 0.60,
      'A': 0.60,
      'B': 0.60,
      'C': 0.60,
      'GOVT': 0.60,
      'D': 0.50
    },
    '35000-49999': {
      'AA': 0.60,
      'A': 0.60,
      'B': 0.60,
      'C': 0.60,
      'GOVT': 0.60,
      'D': 0.55
    },
    '50000+': {
      'AA': 0.70,
      'A': 0.70,
      'B': 0.70,
      'C': 0.70,
      'GOVT': 0.70,
      'D': 0.60
    }
  },
  // Minimum salary requirements by category
  minSalary: {
    'A': 25000,
    'B': 25000,
    'C': 25000,
    'D': 35000
  },
  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'AA': 72,    // 6 years - Premium category
    'A': 72,     // 6 years - Premium category
    'GOVT': 72,  // 6 years - Government employees
    'B': 72,     // 6 years - Standard category
    'C': 60,     // 5 years - Lower-rated companies
    'D': 60      // 5 years - Lowest-rated companies
  }
};