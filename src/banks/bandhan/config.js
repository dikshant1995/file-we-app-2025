// Bandhan Bank Configuration (Fully verified & aligned with BANKS POLICYS.xlsx - Sheet: BANDHAN BANK & Admin Panel)
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
  maxLoanTenure: 60,       // 60 Months (Flat cap; Cat D max 48M)
  interestRate: 12.25,     // Baseline standard rate

  // Minimum salary requirements by category (Excel: 25K / CATD 40K)
  minSalary: {
    'Super A': 25000,
    'A': 25000,
    'GOVT': 25000,
    'B': 25000,
    'C': 25000,
    'D': 40000
  },

  // Maximum tenure by category (in months - Cat D max 48M in Section 6)
  maxTenureByCategory: {
    'Super A': 60,
    'A': 60,
    'GOVT': 60,
    'B': 60,
    'C': 60,
    'D': 48
  },

  // Section 2: FOIR table based on net monthly income
  foirTable: {
    '<=30000': 0.50,
    '30001-50000': 0.60,
    '50001-75000': 0.65,
    '>75000': 0.70
  },

  // Section 5: ROI Matrix by Location, Category, Income Tier and CIBIL / QC Score
  roiMatrix: {
    Metro: {
      'A': {
        '>50000': { cibilGt750: 12.15, cibil700to749: 12.25, cibil650to699: 13.49 },
        '25000-50000': { cibilGt750: 13.25, cibil700to749: 13.99, cibil650to699: 14.99 },
        '<25000': { cibilGt750: 13.99, cibil700to749: 14.99, cibil650to699: 15.49 }
      },
      'B': {
        '>50000': { cibilGt750: 12.25, cibil700to749: 12.49, cibil650to699: 14.49 },
        '25000-50000': { cibilGt750: 13.49, cibil700to749: 14.49, cibil650to699: 15.99 },
        '<25000': { cibilGt750: 14.25, cibil700to749: 14.99, cibil650to699: 15.99 }
      },
      'C': {
        '>50000': { cibilGt750: 13.49, cibil700to749: 14.49, cibil650to699: 15.99 },
        '25000-50000': { cibilGt750: 14.49, cibil700to749: 15.99, cibil650to699: 16.49 },
        '<25000': { cibilGt750: 15.99, cibil700to749: 16.49, cibil650to699: 16.90 }
      },
      'D': {
        '>50000': { cibilGt750: 13.69, cibil700to749: 14.49, cibil650to699: 16.00 },
        '25000-50000': { cibilGt750: 15.49, cibil700to749: 15.99, cibil650to699: 16.90 },
        '<25000': { cibilGt750: 16.49, cibil700to749: 16.90, cibil650to699: 16.90 }
      }
    },
    NonMetro: {
      'A': {
        '>50000': { cibilGt750: 12.15, cibil700to749: 12.25, cibil650to699: 13.59 },
        '25000-50000': { cibilGt750: 13.50, cibil700to749: 13.99, cibil650to699: 14.99 },
        '<25000': { cibilGt750: 14.49, cibil700to749: 15.49, cibil650to699: 15.99 }
      },
      'B': {
        '>50000': { cibilGt750: 12.49, cibil700to749: 12.99, cibil650to699: 13.99 },
        '25000-50000': { cibilGt750: 13.60, cibil700to749: 14.99, cibil650to699: 15.49 },
        '<25000': { cibilGt750: 14.99, cibil700to749: 15.49, cibil650to699: 16.49 }
      },
      'C': {
        '>50000': { cibilGt750: 13.99, cibil700to749: 14.99, cibil650to699: 16.49 },
        '25000-50000': { cibilGt750: 14.49, cibil700to749: 15.99, cibil650to699: 16.90 },
        '<25000': { cibilGt750: 15.99, cibil700to749: 16.49, cibil650to699: 16.90 }
      },
      'D': {
        '>50000': { cibilGt750: 13.99, cibil700to749: 14.99, cibil650to699: 16.49 },
        '25000-50000': { cibilGt750: 15.49, cibil700to749: 16.49, cibil650to699: 16.90 },
        '<25000': { cibilGt750: 16.90, cibil700to749: 16.90, cibil650to699: 16.90 }
      }
    }
  },

  // Section 6: Multiplier matrix by tenure and income range (Exact values from Excel)
  multiplierMatrix: {
    'AB_GOVT': {
      '<=30000': { 12: 6, 24: 10, 36: 14, 48: 17, 60: 20 },
      '30001-50000': { 12: 7, 24: 13, 36: 15, 48: 21, 60: 22 },
      '50001-75000': { 12: 8, 24: 13, 36: 16, 48: 22, 60: 24 },
      '>75000': { 12: 9, 24: 14, 36: 18, 48: 23, 60: 25 }
    },
    'C': {
      '<=30000': { 12: 5, 24: 7, 36: 10, 48: 12, 60: null },
      '30001-50000': { 12: 7, 24: 9, 36: 12, 48: 14, 60: null },
      '50001-75000': { 12: 7, 24: 10, 36: 16, 48: 17, 60: 18 },
      '>75000': { 12: 9, 24: 11, 36: 17, 48: 18, 60: 22 }
    },
    'D': {
      '<=30000': { 12: 5, 24: 7, 36: 10, 48: 12, 60: null },
      '30001-50000': { 12: 7, 24: 9, 36: 12, 48: 14, 60: null },
      '50001-75000': { 12: 7, 24: 10, 36: 16, 48: 17, 60: null },
      '>75000': { 12: 9, 24: 11, 36: 17, 48: 18, 60: null }
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