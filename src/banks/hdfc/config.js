// HDFC Bank Configuration - Exact Master Policy from Excel
export const hdfcConfig = {
  id: 'hdfc',
  name: 'HDFC Bank',
  minAge: 21, // Minimum age requirement: 21 Years from Excel
  maxAge: 60, // Maximum age at loan maturity: 60 Years from Excel
  minCreditScore: 0, // Bypassed (Not in Excel policy)
  maxLoanTenure: 7, // 84 months (7 years)
  maxLoanAmount: 7500000, // ₹75 Lakhs from Excel (Super A, A, B, C, D, Govt: 75L)
  bachelorMaxLoanAmount: null, // Bypassed (No bachelor limit in Excel policy)
  interestRate: 9.99, // Base rate for >= 20L
  processingFee: 0.005,

  // Incentive policy
  incentivePercentage: 0.50, // 50% of average incentive
  incentivePeriodMonths: 3, // Last 3 months

  // Multiplier table based on salary bands and categories from Excel
  multiplierTable: {
    '25000-35000': {
      'SUPER-A': 19,
      'Super A': 19,
      'A': 19,
      'Govt': 19,
      'B': 15,
      'C': 12,
      'D': 12
    },
    '35001-50000': {
      'SUPER-A': 22,
      'Super A': 22,
      'A': 22,
      'Govt': 22,
      'B': 18,
      'C': 15,
      'D': 15
    },
    '50001-75000': {
      'SUPER-A': 25,
      'Super A': 25,
      'A': 25,
      'Govt': 25,
      'B': 22,
      'C': 18,
      'D': 18
    },
    '75001+': {
      'SUPER-A': 27,
      'Super A': 27,
      'A': 27,
      'Govt': 27,
      'B': 25,
      'C': 20,
      'D': 20
    }
  },
  // FOIR table based on salary bands and categories from Excel
  foirTable: {
    '25000-50000': {
      'SUPER-A': 0.50,
      'Super A': 0.50,
      'A': 0.50,
      'B': 0.50,
      'C': 0.40,
      'D': 0.40,
      'Govt': 0.50
    },
    '50001-75000': {
      'SUPER-A': 0.60,
      'Super A': 0.60,
      'A': 0.60,
      'B': 0.55,
      'C': 0.45,
      'D': 0.45,
      'Govt': 0.60
    },
    '75001+': {
      'SUPER-A': 0.70,
      'Super A': 0.70,
      'A': 0.70,
      'B': 0.65,
      'C': 0.50,
      'D': 0.50,
      'Govt': 0.70
    }
  },
  // Minimum salary requirements by category (Excel: 25K+ for all)
  minSalary: {
    'SUPER-A': 25000,
    'Super A': 25000,
    'A': 25000,
    'B': 25000,
    'C': 25000,
    'D': 25000,
    'Govt': 25000
  },
  // Maximum tenure by category in months from Excel
  // Super A/A/B/Govt: 7 Years (84M), C: 6 Years (72M), D: 5 Years (60M)
  maxTenureByCategory: {
    'SUPER-A': 84,
    'Super A': 84,
    'A': 84,
    'Govt': 84,
    'B': 84,
    'C': 72,
    'D': 60
  },
  employmentTypes: ['salaried', 'government'],
  specialPrograms: ['hdfc-premium', 'salaried-classic', 'women-advantage'],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true,
    maxLoansForBT: 3,
    acceptsFintechLoans: false,
    description: 'HDFC allows balance transfer for up to 3 existing personal loans (excluding Fintech loans)'
  }
};