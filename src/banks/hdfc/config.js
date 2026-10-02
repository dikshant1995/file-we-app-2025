// HDFC Bank Configuration - Master Policy from Excel (HDFC)
export const hdfcConfig = {
  id: 'hdfc',
  name: 'HDFC Bank',
  minAge: 21, // Minimum applicant age: 21 Years
  maxAge: 60, // Maximum age at loan maturity: 60 Years
  minCreditScore: 0, // Bypassed
  maxLoanTenure: 7, // 84 months (7 years)
  maxLoanAmount: 7500000, // ₹75 Lakhs across all categories (Super A, A, B, C, D, Govt)
  bachelorMaxLoanAmount: null, // No bachelor limit in Excel policy
  interestRate: 9.99, // Base rate for >= 20L
  processingFee: 0.005, // 0.5% processing fee

  // Incentive policy
  incentivePercentage: 0.50, // 50% of average incentive
  incentivePeriodMonths: 3, // Last 3 months

  // Multiplier table based on salary bands and categories from Excel
  multiplierTable: {
    '25000-50000': {
      'SUPER-A': 20,
      'Super A': 20,
      'A': 20,
      'Govt': 20,
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
      'Govt': 0.50,
      'B': 0.50,
      'C': 0.40,
      'D': 0.40
    },
    '50001-75000': {
      'SUPER-A': 0.60,
      'Super A': 0.60,
      'A': 0.60,
      'Govt': 0.60,
      'B': 0.55,
      'C': 0.45,
      'D': 0.45
    },
    '75001+': {
      'SUPER-A': 0.70,
      'Super A': 0.70,
      'A': 0.70,
      'Govt': 0.70,
      'B': 0.65,
      'C': 0.50,
      'D': 0.50
    }
  },

  // Minimum salary requirements by category (Excel: ₹25k+ for all)
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
  specialPrograms: ['hdfc-premium', 'salaried-classic'],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true,
    maxLoansForBT: 3,
    acceptsFintechLoans: false,
    description: 'HDFC Bank allows balance transfer for up to 3 existing personal loans'
  }
};