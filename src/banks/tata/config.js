// Tata Capital Configuration according to BANKS POLICYS.xlsx (Sheet: TATA)
export const tataConfig = {
  id: 'tata',
  name: 'Tata Capital',
  minAge: 21, // Minimum age requirement (Excel: 21 Years)
  maxAgePvt: 58, // 58 in pvt
  maxAgeGovt: 60, // 60 in govt
  maxAge: 58, // Default max age
  minCreditScore: 0,
  minLoanAmount: 75000, // 75K
  maxLoanAmount: 5000000, // 50 LAC
  interestRate: 12.00, // Standard base rate

  // FOIR table based on salary band (Excel Section 3 Rows 56-60)
  foirTable: {
    'below-25k': 0.50, // <= 25k (Unsecured 40%)
    '25000-50000': 0.60, // 25k-50k (Unsecured 50%)
    '50001-75000': 0.65, // 50k-75k (Unsecured 55%)
    '75001+': 0.75 // > 75k (Unsecured 65%)
  },

  // Multiplier table based on salary bands and categories (Excel Section 3 Rows 24-31)
  multiplierTable: {
    'below-50k': {
      'SUPER-A': 20,
      'SUPER A': 20,
      'A': 20,
      'GOVT': 20,
      'B': 19,
      'C': 15,
      'D': 9,
      'UNLISTED': 9
    },
    '50001-75000': {
      'SUPER-A': 23.5,
      'SUPER A': 23.5,
      'A': 23.5,
      'GOVT': 23.5,
      'B': 22,
      'C': 18,
      'D': 15,
      'UNLISTED': 15
    },
    '75001+': {
      'SUPER-A': 27,
      'SUPER A': 27,
      'A': 27,
      'GOVT': 27,
      'B': 25,
      'C': 18,
      'D': 15,
      'UNLISTED': 15
    }
  },

  // Loan Amount based ROI Grid (Excel Section 2 Rows 15-20)
  roiGrid: {
    'SUPER-A': { above50L: 10.99, above20L: 12.00, below20L: 14.00 },
    'SUPER A': { above50L: 10.99, above20L: 12.00, below20L: 14.00 },
    'A': { above50L: 10.99, above20L: 12.00, below20L: 14.00 },
    'GOVT': { above50L: 10.99, above20L: 12.00, below20L: 14.00 },
    'B': { above40L: 10.99, above20L: 12.00, below20L: 14.00 },
    'C': { above30L: 12.00, above20L: 13.00, below20L: 15.00 },
    'D': { above20L: 13.50, below20L: 16.00 },
    'UNLISTED': { above20L: 13.50, below20L: 16.00 }
  },

  // Minimum salary requirement
  minSalary: 25000, // 25k across the board

  // Maximum loan amounts by category (Excel Section 5)
  maxLoanByCategory: {
    'SUPER-A': 5000000,
    'SUPER A': 5000000,
    'A': 5000000,
    'GOVT': 5000000,
    'B': 2500000, // 25 LAC
    'C': 2500000, // 25 LAC
    'D': 1000000, // 10 LAC
    'UNLISTED': 1000000
  },

  // Maximum tenure by category in months (Excel Section 4)
  // Min tenure: 24 Months
  minTenureMonths: 24,
  maxTenureByCategory: {
    'SUPER-A': 96, // 84 to 96 months
    'SUPER A': 96,
    'A': 96,
    'GOVT': 96,
    'B': 72,       // 72 months (84 if income > 75k)
    'C': 60,       // 60 months
    'D': 60,       // 60 months
    'UNLISTED': 60
  },

  // Demographics and obligations (Excel Section 1)
  minWorkExperienceMonths: 12, // 12 months stability
  stabilityWaiverRule: 'Current stability proof waived if age >=26, CIBIL >750, income >50k, and tradeline >2L >2 yrs old',
  stabilityWaiverConditions: {
    minAge: 26,
    minCibilScore: 750,
    minIncome: 50000,
    minTradelineAmount: 200000,
    minTradelineAgeYears: 2
  },
  ccObligationPercent: 5, // 5% CC OBLIGATE
  maxCreditCardsForBT: 5, // Max 5 Credit card BT allowed

  employmentTypes: ['salaried', 'government'],

  btConfig: {
    isAvailable: true,
    maxCreditCardsForBT: 5,
    maxLoansForBT: 5,
    description: 'Tata Capital allows BT for personal loans and up to 5 Credit Cards (no late fee allowed)'
  }
};