// Piramal Finance Configuration
// FOIR-Only System (No Multiplier)
// Ultra-simple: Two NTH bands, No category distinction
export const piramalConfig = {
  id: 'piramal',
  name: 'Piramal Finance',
  minAge: 22, // Minimum age requirement
  maxAge: 63, // Maximum age at loan maturity (Highest among all banks)
  minCreditScore: 680,
  maxLoanTenure: 30,
  maxLoanAmount: 1200000, // ₹12 Lakhs (Lower-Cap Lender - Lowest)
  bachelorMaxLoanAmount: 1200000, // ₹12 Lakhs maximum for unmarried individuals (same as overall cap - most conservative)
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.0075,
  
  // Incentive policy
  incentivePercentage: 1.0, // 100% of average incentive
  incentivePeriodMonths: 3, // Last 3 months
  
  // Ultra-simple FOIR table based ONLY on NTH (Net Take-Home) salary
  // Only TWO bands - simplest among all banks!
  nthFoirTable: {
    '20000-35000': {
      foir: 0.65,
      description: 'Entry to Mid-range NTH (₹20K-35K)'
    },
    '35001+': {
      foir: 0.70,
      description: 'Higher NTH (>₹35K)'
    }
  },
  
  // Universal minimum NTH salary (lowest among all banks!)
  minNTH: 20000,
  
  // No category-specific minimums - everyone treated equally
  minNTHByCategory: {
    'ALL': 20000  // Universal for everyone
  },
  
  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'A': 60,        // 5 years - CAT A
    'GOVT': 60,     // 5 years - CAT GOVT
    'B': 60,        // 5 years - CAT B
    'C': 60,        // 5 years - CAT C
    'D': 60,        // 5 years - CAT D
    'UNLISTED': 60  // 5 years - UNLISTED
  },
  
  // Note: Piramal doesn't use traditional categories (A/B/C/D/UNLISTED)
  // for minimum salary or FOIR calculations
  categories: {
    'ALL': { description: 'All applicants (no category distinction)' }
  },
  
  employmentTypes: ['salaried', 'self-employed', 'all'],
  specialPrograms: ['accessible-lending', 'income-focused', 'simplified-approval'],
  
  // Calculation method
  calculationMethod: 'FOIR-Only',
  approach: 'Ultra-Simple NTH-Based (2 bands only)',
  keyFeatures: [
    'Lowest minimum NTH: ₹20,000 (most accessible)',
    'Only TWO NTH bands (simplest system)',
    'No category distinction for FOIR',
    'Generous FOIR: 65% and 70%',
    'Uses Net Take-Home (NTH) instead of gross',
    'Quick, clear decision-making process',
    'Focus on income, not employer category'
  ],
  
  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 5, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: false, // Does NOT accept BT for Fintech/digital platform loans
    description: 'Piramal Finance allows balance transfer for up to 5 existing personal loans (excluding Fintech loans)'
  }
};