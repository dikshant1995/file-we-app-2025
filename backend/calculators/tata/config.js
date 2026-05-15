// Tata Capital Configuration
export const tataConfig = {
  id: 'tata',
  name: 'Tata Capital',
  minAge: 21, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 720,
  maxLoanTenure: 25,
  maxLoanAmount: 3500000, // ₹35 Lakhs (Moderate-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.006,
  
  // Incentive policy
  incentivePercentage: 1.0, // 100% of average incentive
  incentivePeriodMonths: 3, // Last 3 months
  
  // FOIR table based on salary only (no category distinction)
  foirTable: {
    '25000-50000': 0.60,
    '50001-75000': 0.65,
    '75001+': 0.75
  },
  
  // Multiplier table based on salary bands and categories
  multiplierTable: {
    '25000-50000': {
      'SUP-A': 21,
      'A': 20,
      'GOVT': 20,
      'B': 19,
      'C': 15,
      'UNLISTED': 13
    },
    '50001-75000': {
      'SUP-A': 24,
      'A': 23,
      'GOVT': 23,
      'B': 22,
      'C': 18,
      'UNLISTED': 15
    },
    '75001+': {
      'SUP-A': 27,
      'A': 27,
      'GOVT': 27,
      'B': 25,
      'C': 18,
      'UNLISTED': 15
    }
  },
  
  // Minimum salary requirement (overall)
  minSalary: 25000,
  
  // Minimum salary requirements by category
  minSalaryByCategory: {
    'SUP-A': 25000,
    'A': 25000,
    'GOVT': 25000,
    'B': 25000,
    'C': 25000,
    'D': 25000,
    'UNLISTED': 40000  // Higher minimum salary for UNLISTED category
  },
  
  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'SUP-A': 72,     // 6 years - CAT SUP-A
    'A': 72,         // 6 years - CAT A
    'GOVT': 72,      // 6 years - CAT GOVT
    'B': 60,         // 5 years - CAT B
    'C': 60,         // 5 years - CAT C
    'D': 48,         // 4 years - CAT D
    'UNLISTED': 48   // 4 years - UNLISTED
  },
  
  // Company categories
  companyCategories: {
    'SUP-A': { minIncome: 25000, description: 'Superior A - Premium Companies/Profiles' },
    'A': { minIncome: 25000, description: 'Category A - Top Tier Companies' },
    'GOVT': { minIncome: 25000, description: 'Government Employees' },
    'B': { minIncome: 25000, description: 'Category B - Good Companies' },
    'C': { minIncome: 25000, description: 'Category C - Average Companies' },
    'D': { minIncome: 25000, description: 'Category D - Standard Companies' },
    'UNLISTED': { minIncome: 40000, description: 'Unlisted/Lower Category Companies - Higher minimum required' }
  },
  
  employmentTypes: ['salaried', 'government'],
  specialPrograms: ['tata-employee', 'mnc-professional', 'high-net-worth'],
  
  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 6, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: false, // Does NOT accept BT for Fintech/digital platform loans
    maxCreditCardBTMultiplier: 6, // Cannot BT if Credit Card POS > 6x Monthly Salary
    description: 'Tata Capital allows balance transfer for up to 6 existing personal loans (excluding Fintech loans). Total Credit Card POS cannot exceed 6x monthly salary.'
  }
};