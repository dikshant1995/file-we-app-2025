// L&T Finance Master Policy Configuration
export const lntConfig = {
  id: 'lnt',
  name: 'L&T Finance',
  minAge: 21,
  maxAge: 60,
  minCreditScore: 720, // CIBIL 720+ required as per policy
  maxLoanTenure: 6, // 6 Years (72 Months)
  maxLoanAmount: 3000000, // ₹30 Lakhs max loan
  minLoanAmount: 100000, // ₹1 Lakh min loan
  bachelorMaxLoanAmount: null,
  catDRentedMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for Rented Cat D
  interestRate: 11.50, // Base rate starting at 11.50%
  processingFee: 0.02, // 2.0% standard processing fee

  // Incentive policy
  incentivePercentage: 1.0,
  incentivePeriodMonths: 3,

  // Universal minimum salary requirement - ₹25,000 across all categories
  minSalary: 25000,
  minWorkExpMonths: 6,

  // FOIR table by category and salary slab
  foirTable: {
    'SUPER-A': { '<50000': 0.55, '50000-100000': 0.70, '100000-200000': 0.75, '>200000': 0.80 },
    'A': { '<50000': 0.55, '50000-100000': 0.70, '100000-200000': 0.75, '>200000': 0.80 },
    'GOVT': { '<50000': 0.55, '50000-100000': 0.70, '100000-200000': 0.75, '>200000': 0.80 },
    'B': { '<50000': 0.55, '50000-100000': 0.70, '100000-200000': 0.75, '>200000': 0.80 },
    'C': { '<50000': 0.50, '50000-100000': 0.60, '100000-200000': 0.70, '>200000': 0.75 },
    'D': { '<50000': 0.50, '50000-100000': 0.55, '100000-200000': 0.65, '>200000': 0.70 }
  },

  // Multiplier table by category and salary slab
  multiplierTable: {
    'SUPER-A': { '<50000': 18, '50000-100000': 20, '100000-200000': 24, '>200000': 24 },
    'A': { '<50000': 18, '50000-100000': 20, '100000-200000': 24, '>200000': 24 },
    'GOVT': { '<50000': 18, '50000-100000': 20, '100000-200000': 24, '>200000': 24 },
    'B': { '<50000': 18, '50000-100000': 20, '100000-200000': 24, '>200000': 24 },
    'C': { '<50000': 16, '50000-100000': 18, '100000-200000': 20, '>200000': 20 },
    'D': { '<50000': 14, '50000-100000': 15, '100000-200000': 16, '>200000': 16 }
  },

  // Maximum tenure by category (in months) - Up to 72 months across all categories
  maxTenureByCategory: {
    'SUPER-A': 72,
    'A': 72,
    'GOVT': 72,
    'B': 72,
    'C': 72,
    'D': 72
  },

  // Category descriptions
  categories: {
    'SUPER-A': { description: 'Super Category A - Top Tier Corporate' },
    'A': { description: 'Category A - Major Listed Companies' },
    'GOVT': { description: 'Government & PSU Employees' },
    'B': { description: 'Category B - Mid Tier Listed Companies' },
    'C': { description: 'Category C - Standard Companies' },
    'D': { description: 'Category D - Lower Tier / Unlisted Companies' }
  },

  employmentTypes: ['salaried', 'government'],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true,
    acceptsCreditCardBt: false, // Credit Card BT NOT ALLOWED
    description: 'L&T Finance permits Personal Loan Balance Transfer (Credit Card BT Not Allowed)'
  }
};
