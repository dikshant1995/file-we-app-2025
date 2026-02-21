// Axis Finance Configuration
// Multiplier-Based System (No FOIR)
// Uses category-based multipliers combined with salary bands
export const axisFinConfig = {
  id: 'axis-fin',
  name: 'Axis Finance',
  minAge: 23, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 660,
  maxLoanTenure: 25,
  maxLoanAmount: 5000000, // ₹50 Lakhs (Mid-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.009,
  
  // Incentive policy
  incentivePercentage: 1.0, // 100% of average incentive
  incentivePeriodMonths: 6, // Last 6 months (unique to Axis)
  
  // Multiplier table based on salary bands and categories
  // Formula: Loan Amount = Monthly Salary × Multiplier
  multiplierTable: {
    '25000-50000': {
      'A': 24,
      'B': 24,
      'GOVT': 24,
      'C': 20,
      'D': 11  // Significantly lower for Category D
    },
    '50001-75000': {
      'A': 26,
      'B': 26,
      'GOVT': 26,
      'C': 22,
      'D': 15  // Still constrained despite higher income
    },
    '75001+': {
      'A': 28,
      'B': 28,
      'GOVT': 28,
      'C': 24,
      'D': 18  // Lower than A/B/GOVT's lowest multiplier (24)
    }
  },
  
  // Universal minimum salary requirement
  minSalary: 25000,
  
  // Minimum salary requirements by category (all same)
  minSalaryByCategory: {
    'A': 25000,
    'B': 25000,
    'GOVT': 25000,
    'C': 25000,
    'D': 25000
  },
  
  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'A': 84,        // 7 years - CAT A
    'GOVT': 84,     // 7 years - CAT GOVT
    'B': 84,        // 7 years - CAT B
    'C': 60,        // 5 years - CAT C
    'D': 48         // 4 years - CAT D
  },
  
  // Category descriptions
  categories: {
    'A': { description: 'Category A - Top Tier Companies (Highest Multipliers)' },
    'B': { description: 'Category B - Good Companies (Highest Multipliers)' },
    'GOVT': { description: 'Government Employees (Highest Multipliers, Stable)' },
    'C': { description: 'Category C - Mid-Tier Companies (Moderate Multipliers)' },
    'D': { description: 'Category D - Lower-Tier Companies (Constrained Multipliers)' }
  },
  
  employmentTypes: ['salaried', 'government'],
  specialPrograms: ['axis-select', 'government-special', 'premium-lending'],
  
  // Calculation method
  calculationMethod: 'Multiplier-Only',
  approach: 'Universal Minimum Salary + Category-Based Multipliers',
  keyFeatures: [
    'Universal ₹25,000 minimum across all categories',
    'Category-based multiplier system',
    'A, B, GOVT grouped together with highest multipliers',
    'Category D significantly constrained even at high income',
    'Risk-adjusted lending through multipliers'
  ],
  
  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 6, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: true, // ✅ ACCEPTS BT for Fintech/digital platform loans
    description: 'Axis Finance allows balance transfer for up to 6 existing personal loans (INCLUDES Fintech loans)'
  }
};