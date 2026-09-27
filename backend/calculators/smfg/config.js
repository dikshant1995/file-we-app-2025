// SMFG India Credit (Fullerton) Configuration
// Configured strictly according to Master Excel Policy (BANKS POLICYS.xlsx - Sheet: SMFG)

export const smfgConfig = {
  id: 'smfg',
  name: 'SMFG India Credit',
  minAge: 21, // Excel: 21
  maxAgePvt: 60, // Excel: PVT 60
  maxAgeGovt: 65, // Excel: GOVT 65 (PENSIONER PROFILE)
  maxAge: 60, // Default general max age
  retirementAgeSalaried: 60,
  retirementAgeGovt: 65, // Excel: RETIREMENT AGE: 65
  minCreditScore: 650,
  minSalary: 25000, // Excel: 25K+ SALARY WITH 0 DEDUCTION
  minCurrentCompanyExperience: 24, // Excel: CURRENT COM 2 YEARS (24 Months)
  maxLoanTenureMonths: 60, // Excel: 12 to 60 Months (Up to 5 Years) across all categories
  maxLoanTenureYears: 5,
  minLoanAmount: 100000, // Excel: 1LAC
  maxLoanAmount: 3000000, // Excel: 30LAC across all categories
  interestRate: 17.00, // Starting ROI: 17.00% to 30.00% as per Net Income Band & Category
  creditCardObligationPercent: 0.05, // Excel: 0.05 (5%)

  // Processing Fee Structure (Excel: Below 3L: 3.50%+GST, Above 3L: 2.50%+GST)
  processingFeeBelow3L: 0.035,
  processingFeeAbove3L: 0.025,

  // Balance Transfer (BT) Configuration (Excel: MAX CC BT: 2 CC BT)
  btConfig: {
    isAvailable: true,
    maxCreditCardsForBT: 2,
    maxPersonalLoansForBT: 5,
    description: 'SMFG India Credit allows up to 2 Credit Cards for Balance Transfer (Max 2 CC BT)'
  },

  // Employment types supported
  employmentTypes: ['salaried', 'government', 'salaried_professional'],

  // Universal minimum Net Monthly Salary
  minNTH: 25000,

  // FOIR Slabs by Net Monthly Salary Band
  salaryFoirSlabs: [
    { minSalary: 25000, maxSalary: 30000, foir: 0.60, minMult: 12, maxMult: 13 },
    { minSalary: 30001, maxSalary: 35000, foir: 0.65, minMult: 15, maxMult: 16 },
    { minSalary: 35001, maxSalary: 40000, foir: 0.70, minMult: 16, maxMult: 18 },
    { minSalary: 40001, maxSalary: 50000, foir: 0.70, minMult: 18, maxMult: 20 },
    { minSalary: 50001, maxSalary: 75000, foir: 0.70, minMult: 22, maxMult: 25 },
    { minSalary: 75001, maxSalary: 100000, foir: 0.70, minMult: 23, maxMult: 30 },
    { minSalary: 100001, maxSalary: Infinity, foir: 0.70, minMult: 30, maxMult: 30 }
  ],

  // Special Firm FOIR restriction
  propPartLlpMaxFoir: 0.55, // 55% Max FOIR for Proprietorship / Partnership / LLP

  // Maximum tenure by category (in months) (Excel: 12 to 60 Months across all)
  maxTenureByCategory: {
    'SUPER A': 60,
    'A': 60,
    'GOVT': 60,
    'B': 60,
    'C': 60,
    'D': 60,
    'E': 60,
    'UNLISTED': 60
  },

  // ROI lookup table from Excel Sheet: SMFG (by Net Income Band and Category)
  roiMatrix: [
    { band: '25001', minSalary: 25001, maxSalary: 25001, A: 24.0, B: 25.5, C: 27.5, D: 30.0, E: 30.0 },
    { band: '25k-30k', minSalary: 25000, maxSalary: 30000, A: 23.0, B: 24.0, C: 25.0, D: 28.0, E: 30.0 },
    { band: '30k-35k', minSalary: 30001, maxSalary: 35000, A: 21.5, B: 22.0, C: 23.5, D: 25.0, E: 30.0 },
    { band: '35k-40k', minSalary: 35001, maxSalary: 40000, A: 19.5, B: 21.0, C: 23.0, D: 24.0, E: 30.0 },
    { band: '40k-50k', minSalary: 40001, maxSalary: 50000, A: 19.0, B: 20.0, C: 21.5, D: 24.0, E: 30.0 },
    { band: '50k-75k', minSalary: 50001, maxSalary: 75000, A: 18.5, B: 18.5, C: 21.5, D: 22.0, E: 30.0 },
    { band: '75k-100k', minSalary: 75001, maxSalary: 100000, A: 18.5, B: 18.5, C: 19.5, D: 20.0, E: 30.0 },
    { band: '100k+', minSalary: 100001, maxSalary: Infinity, A: 17.0, B: 17.0, C: 19.0, D: 20.0, E: 30.0 }
  ]
};
