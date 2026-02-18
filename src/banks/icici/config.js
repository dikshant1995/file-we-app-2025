// ICICI Bank Configuration
export const iciciConfig = {
  id: 'icici',
  name: 'ICICI Bank',
  minAge: 21, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 650,
  maxLoanTenure: 30,
  maxLoanAmount: 10000000, // ₹1 Crore (High-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.008,
  
  // Incentive policy
  incentivePercentage: 0.0, // 0% - Does not consider incentives
  incentivePeriodMonths: 0, // N/A
  
  // FOIR table based on salary bands
  foirTable: {
    '<50000': 0.55,
    '>=50000': 0.65
  },
  // Minimum salary requirements by category
  minSalary: {
    'A': 30000,
    'GOVT': 30000,
    'B': 30000,
    'C': 30000,
    'D': 40000,
    'UNLISTED': 50000
  },
  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'A': 84,        // 7 years - CAT A
    'GOVT': 84,     // 7 years - CAT GOVT
    'B': 72,        // 6 years - CAT B
    'C': 72,        // 6 years - CAT C
    'D': 60,        // 5 years - CAT D
    'UNLISTED': 60  // 5 years - UNLISTED
  },
  employmentTypes: ['salaried', 'self-employed', 'government'],
  specialPrograms: ['icici-premier', 'young-professional', 'self-employed-plus'],
  
  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 5, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: false, // Does NOT accept BT for Fintech/digital platform loans
    description: 'ICICI allows balance transfer for up to 5 existing personal loans (excluding Fintech loans)'
  }
};