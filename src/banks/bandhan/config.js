// Bandhan Bank Configuration
export const bandhanConfig = {
  id: 'bandhan',
  name: 'Bandhan Bank',
  minAge: 22, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 600,
  maxLoanTenure: 25,
  maxLoanAmount: 5000000, // ₹50 Lakhs (Mid-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.012,
  
  // Incentive policy
  incentivePercentage: 0.25, // 25% of average incentive
  incentivePeriodMonths: 3, // Last 3 months
  
  // FOIR table based on salary bands
  foirTable: {
    '<75000': 0.60,
    '>=75000': 0.70
  },
  // Minimum salary requirements by category
  minSalary: {
    'A': 20000,
    'GOVT': 20000,
    'B': 25000,
    'C': 30000,
    'D': 30000,
    'UNLISTED': null  // No loans for unlisted companies
  },
  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'A': 60,        // 5 years - CAT A
    'GOVT': 60,     // 5 years - CAT GOVT
    'B': 60,        // 5 years - CAT B
    'C': 48,        // 4 years - CAT C
    'D': 48,        // 4 years - CAT D
    'UNLISTED': 0   // No loans for unlisted companies
  },
  employmentTypes: ['salaried', 'self-employed', 'agriculture', 'government'],
  specialPrograms: ['rural-development', 'agriculture-finance', 'msme-support'],
  
  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: false, // BT facility is NOT available for Bandhan Bank
    maxLoansForBT: 0, // Does not offer balance transfer for personal loans
    acceptsFintechLoans: false, // Does NOT accept BT for Fintech loans (BT not offered at all)
    description: 'Bandhan Bank does not offer balance transfer facility for personal loans'
  }
};