// IndusInd Bank Configuration - Exact Master Policy from Excel
export const indusindConfig = {
  id: 'indusind',
  name: 'IndusInd Bank',
  minAge: 21, // Minimum age requirement: 21 Years from Excel
  maxAge: 60, // Maximum age at loan maturity: 60 Years from Excel
  minCreditScore: 0, // Bypassed (Not in Excel policy)
  maxLoanTenure: 7, // 84 months (7 years)
  maxLoanAmount: 7500000, // ₹75 Lakhs from Excel (Cat A, B, Govt: 75L; Cat C: 15L)
  bachelorMaxLoanAmount: null, // Bypassed (No bachelor limit in Excel policy)
  interestRate: 9.99, // Base rate for >= 10L
  processingFee: 0.01,

  // Incentive policy
  incentivePercentage: 1.0,
  incentivePeriodMonths: 3,

  // FOIR table based on salary and category from Excel
  foirTable: {
    'Super A': {
      '20000-35000': 0.50,
      '35001-50000': 0.60,
      '50001+': 0.70
    },
    'A+': {
      '20000-35000': 0.50,
      '35001-50000': 0.60,
      '50001+': 0.70
    },
    'A': {
      '20000-35000': 0.50,
      '35001-50000': 0.60,
      '50001+': 0.70
    },
    'GOVT': {
      '20000-35000': 0.50,
      '35001-50000': 0.60,
      '50001+': 0.70
    },
    'B': {
      '20000-35000': 0.50,
      '35001-50000': 0.60,
      '50001+': 0.70
    },
    'C': {
      '20000-35000': 0.50,
      '35001+': 0.60
    }
  },

  // Multiplier table based on salary bands and categories from Excel
  multiplierTable: {
    'Super A': {
      '>=125000': 30,
      '75000-124999': 25,
      '<75000': 20
    },
    'A+': {
      '>=125000': 30,
      '75000-124999': 25,
      '<75000': 20
    },
    'A': {
      '>=125000': 30,
      '75000-124999': 25,
      '<75000': 20
    },
    'GOVT': {
      '>=125000': 30,
      '75000-124999': 25,
      '<75000': 20
    },
    'B': {
      '>=125000': 30,
      '75000-124999': 25,
      '<75000': 20
    },
    'C': {
      '25000+': 21
    }
  },

  // Minimum salary requirements by category (Excel: Min 25K salary)
  minSalaryByCategory: {
    'Super A': 25000,
    'A+': 25000,
    'A': 25000,
    'B': 25000,
    'GOVT': 25000,
    'C': 25000
  },

  // Maximum tenure by category (Excel: up to 84 months, CIBIL -1 capped to 48 months)
  maxTenureByCategory: {
    'Super A': 84,
    'A+': 84,
    'A': 84,
    'GOVT': 84,
    'B': 84,
    'C': 84
  },

  // Category descriptions
  categories: {
    'Super A': { description: 'Category Super A - Top Tier Companies (Up to 30x Multiplier, ₹75L Max)' },
    'A+': { description: 'Category A+ - Premium Companies (Up to 30x Multiplier, ₹75L Max)' },
    'A': { description: 'Category A - Top Tier Companies (Up to 30x Multiplier, ₹75L Max)' },
    'B': { description: 'Category B - Good Companies (Up to 30x Multiplier, ₹75L Max)' },
    'GOVT': { description: 'Government Employees (Up to 30x Multiplier, ₹75L Max)' },
    'C': { description: 'Category C - Standard Companies (21x Multiplier, ₹15L Max)' }
  },

  employmentTypes: ['salaried', 'government'],
  specialPrograms: ['indusind-select', 'government-special', 'premium-banking'],

  calculationMethod: 'Both (Dual)',
  approach: 'Category-Based Minimum Salary + Tiered Multipliers & FOIR',
  keyFeatures: [
    'Dual evaluation (FOIR + Multiplier)',
    'Min salary ₹25,000 across all categories',
    'Max loan ₹75L for Cat A, B, Govt; ₹15L for Cat C',
    'Tenure up to 84 months (CIBIL -1 capped to 48 months)',
    'No bachelor capping (Bypassed)',
    'No CIBIL score cutoff (Bypassed)',
    '5% Credit card obligation (CC BT not allowed)'
  ],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true,
    maxLoansForBT: 5,
    acceptsFintechLoans: false,
    allowCreditCardBT: false, // Excel: CC BT NOT ALLOW
    description: 'IndusInd Bank allows balance transfer for up to 5 existing personal loans (CC BT not allowed)'
  }
};
