// Poonawala Finance Configuration
// FOIR-Based Only (No Multiplier Method)
// Uses sophisticated two-dimensional matrix: Customer Segment × NTH (Net Take-Home) Salary
export const poonawalaConfig = {
  id: 'poonawala',
  name: 'Poonawala Finance',
  minAge: 21, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity
  minCreditScore: 630,
  maxLoanTenure: 15,
  maxLoanAmount: 3000000, // ₹30 Lakhs (Moderate-Cap Lender)
  bachelorMaxLoanAmount: 2000000, // ₹20 Lakhs maximum for unmarried individuals
  interestRate: 11.0, // Fixed at 11% for all banks as per policy
  processingFee: 0.013,

  // Incentive policy
  incentivePercentage: 0.25, // 25% of average incentive
  incentivePeriodMonths: 3, // Last 3 months

  // Two-Dimensional FOIR Matrix
  // Rows: Customer Segment (SUP-A/A, B/GOVT, C/D, E)
  // Columns: NTH (Net Take-Home) Salary Bands
  foirMatrix: {
    // SUP A and A (Top Customer Segment - Lowest Risk)
    'SUPER-A': {
      'SUP-HNI': { minNTH: 250000, maxNTH: null, foir: 0.75 },        // >2.5L NTH
      'HNI': { minNTH: 150000, maxNTH: 250000, foir: 0.75 },          // 1.5L-2.5L NTH
      'AFFLUENT': { minNTH: 75000, maxNTH: 150000, foir: 0.70 },      // 75K-1.5L NTH
      'PRIME': { minNTH: 50000, maxNTH: 75000, foir: 0.65 },          // 50K-75K NTH
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.60 }          // 30K-50K NTH
    },
    'A': {
      'SUP-HNI': { minNTH: 250000, maxNTH: null, foir: 0.75 },
      'HNI': { minNTH: 150000, maxNTH: 250000, foir: 0.75 },
      'AFFLUENT': { minNTH: 75000, maxNTH: 150000, foir: 0.70 },
      'PRIME': { minNTH: 50000, maxNTH: 75000, foir: 0.65 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.60 }
    },

    // B and Government (Mid-High Customer Segment)
    'B': {
      'SUP-HNI': { minNTH: 250000, maxNTH: null, foir: 0.70 },
      'HNI': { minNTH: 150000, maxNTH: 250000, foir: 0.70 },
      'AFFLUENT': { minNTH: 75000, maxNTH: 150000, foir: 0.65 },
      'PRIME': { minNTH: 50000, maxNTH: 75000, foir: 0.60 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.50 }
    },
    'GOVT': {
      'SUP-HNI': { minNTH: 250000, maxNTH: null, foir: 0.70 },
      'HNI': { minNTH: 150000, maxNTH: 250000, foir: 0.70 },
      'AFFLUENT': { minNTH: 75000, maxNTH: 150000, foir: 0.65 },
      'PRIME': { minNTH: 50000, maxNTH: 75000, foir: 0.60 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.50 }
    },

    // C/D (Mid-Low Customer Segment)
    'C': {
      'SUP-HNI': { minNTH: 250000, maxNTH: null, foir: 0.65 },
      'HNI': { minNTH: 150000, maxNTH: 250000, foir: 0.60 },
      'AFFLUENT': { minNTH: 75000, maxNTH: 150000, foir: 0.55 },
      'PRIME': { minNTH: 50000, maxNTH: 75000, foir: 0.55 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.50 }
    },
    'D': {
      'SUP-HNI': { minNTH: 250000, maxNTH: null, foir: 0.65 },
      'HNI': { minNTH: 150000, maxNTH: 250000, foir: 0.60 },
      'AFFLUENT': { minNTH: 75000, maxNTH: 150000, foir: 0.55 },
      'PRIME': { minNTH: 50000, maxNTH: 75000, foir: 0.55 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.50 }
    },

    // E (Lowest Customer Segment - Highest Risk)
    'E': {
      'SUP-HNI': { minNTH: 250000, maxNTH: null, foir: 0.60 },
      'HNI': { minNTH: 150000, maxNTH: 250000, foir: 0.55 },
      'AFFLUENT': { minNTH: 75000, maxNTH: 150000, foir: 0.50 },
      'PRIME': { minNTH: 50000, maxNTH: 75000, foir: 0.45 },          // 45% FOIR for UNLISTED at 50K-75K
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: null }          // NA - Not Eligible
    }
  },


  // Minimum NTH (Net Take-Home) salary by segment
  minNTHBySegment: {
    'SUPER-A': 30000,
    'A': 30000,
    'B': 30000,
    'GOVT': 30000,
    'C': 30000,
    'D': 30000,
    'E': 30000  // E segment (UNLISTED) minimum NTH same as others, but lower FOIR
  },

  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'SUPER-A': 84,     // 7 years - CAT SUPER A
    'A': 84,         // 7 years - CAT A
    'B': 72,         // 6 years - CAT B
    'GOVT': 72,      // 6 years - CAT GOVT
    'C': 72,         // 6 years - CAT C
    'D': 60,         // 5 years - CAT D
    'E': 60          // 5 years - UNLISTED (mapped to E)
  },

  // Overall minimum NTH salary
  minNTH: 30000,

  // Customer segment categories
  customerSegments: {
    'SUPER-A': { description: 'Superior A - Premium Companies/Profiles (Lowest Risk)' },
    'A': { description: 'Category A - Top Tier Companies (Lowest Risk)' },
    'B': { description: 'Category B - Good Companies (Mid-High Risk)' },
    'GOVT': { description: 'Government Employees (Mid-High Risk, Stable)' },
    'C': { description: 'Category C - Average Companies (Mid-Low Risk)' },
    'D': { description: 'Category D - Standard Companies (Mid-Low Risk)' },
    'E': { description: 'Category E - Lower Companies (Highest Risk)' }
  },

  // NTH Salary bands description
  nthBands: {
    'SUP-HNI': { minNTH: 250000, description: 'Super High Net-Worth Individuals (>₹2.5L NTH)' },
    'HNI': { minNTH: 150000, description: 'High Net-Worth Individuals (₹1.5L-2.5L NTH)' },
    'AFFLUENT': { minNTH: 75000, description: 'Affluent (₹75K-1.5L NTH)' },
    'PRIME': { minNTH: 50000, description: 'Prime (₹50K-75K NTH)' },
    'OTHERS': { minNTH: 30000, description: 'Others (₹30K-50K NTH)' }
  },

  employmentTypes: ['salaried', 'government', 'self-employed'],
  specialPrograms: ['premium-lending', 'government-special', 'hni-program'],

  // Special notes
  calculationMethod: 'FOIR-Only',
  foirApproach: 'Two-Dimensional Matrix (Segment × NTH Salary)',
  keyFeatures: [
    'Uses Net Take-Home (NTH) salary instead of gross',
    'Two-dimensional risk assessment',
    'Segment E with PRIME/OTHERS NTH is ineligible',
    'Higher FOIR for premium segments and high earners',
    'Granular risk-based lending'
  ],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true, // BT facility is available
    maxLoansForBT: 9, // Maximum number of existing personal loans that can be consolidated
    acceptsFintechLoans: true, // ✅ ACCEPTS BT for Fintech/digital platform loans - More flexible policy
    description: 'Poonawala Finance allows balance transfer for up to 9 existing personal loans - one of the most flexible policies (INCLUDES Fintech loans)'
  }
};