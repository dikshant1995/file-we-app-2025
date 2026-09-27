// Bandhan Bank Configuration (from BANKS POLICYS.xlsx - Sheet: BANDHAN BANK)
export const bandhanConfig = {
  id: 'bandhan',
  name: 'Bandhan Bank',
  minAge: 21,
  maxAge: 60,
  retirementAge: 60,
  minCreditScore: 650,
  minLoanAmount: 100000,   // ₹1 Lakh (1LAC)
  maxLoanAmount: 2500000,  // ₹25 Lakhs (25LAC flat cap for all categories)
  minTenureMonths: 12,     // 12 Months
  maxLoanTenure: 60,       // 60 Months (5 Years flat cap)
  interestRate: 10.50,

  // Minimum salary requirements by category (Excel: 25K / CATD 40K)
  minSalary: {
    'Super A': 25000,
    'A': 25000,
    'GOVT': 25000,
    'B': 25000,
    'C': 25000,
    'D': 40000
  },

  // Maximum tenure by category (in months - flat 60M across all)
  maxTenureByCategory: {
    'Super A': 60,
    'A': 60,
    'GOVT': 60,
    'B': 60,
    'C': 60,
    'D': 60
  },

  // FOIR table based on net monthly income (Excel Section 2)
  foirTable: {
    '<=30000': 0.50,
    '30001-50000': 0.60,
    '50001-75000': 0.65,
    '>75000': 0.70
  },

  // Multiplier matrix by tenure and income range (Excel Section 6)
  multiplierMatrix: {
    'AB_GOVT': {
      '<=30000': { 12: 6, 24: 10, 36: 14, 48: 17, 60: 20 },
      '30001-50000': { 12: 7, 24: 13, 36: 15, 48: 21, 60: 22 },
      '50001-75000': { 12: 8, 24: 13, 36: 16, 48: 22, 60: 24 },
      '>75000': { 12: 9, 24: 14, 36: 18, 48: 23, 60: 25 }
    },
    'C': {
      '<=30000': { 12: 5, 24: 7, 36: 10, 48: 12, 60: 12 },
      '30001-50000': { 12: 7, 24: 9, 36: 12, 48: 14, 60: 14 },
      '50001-75000': { 12: 7, 24: 10, 36: 16, 48: 17, 60: 18 },
      '>75000': { 12: 9, 24: 11, 36: 17, 48: 18, 60: 22 }
    },
    'D': {
      '<=30000': { 12: 5, 24: 7, 36: 10, 48: 12, 60: 12 },
      '30001-50000': { 12: 7, 24: 9, 36: 12, 48: 14, 60: 14 },
      '50001-75000': { 12: 7, 24: 10, 36: 16, 48: 17, 60: 17 },
      '>75000': { 12: 9, 24: 11, 36: 17, 48: 18, 60: 18 }
    }
  },

  // Credit Card & Special obligations (Excel Section 1)
  ccObligationPercent: 0.03, // 3% of CC limit
  ccExemptionSalaryMultiplier: 3, // Salary ka below 3 time no obligation (0% if CC limit < 3x salary)
  exemptGlAndKcc: true, // GL and KCC not obligate

  // Work experience
  minTotalExperienceMonths: 12, // Overall 1 Year
  minCurrentCompanyExperienceMonths: 1, // 1 Month current company
  employmentTypes: ['salaried', 'government'],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: false,
    allowCcBt: false,
    maxLoansForBT: 0,
    description: 'Bandhan Bank does not offer Credit Card Balance Transfer.'
  }
};