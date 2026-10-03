// Cholamandalam Finance (Chola Finance) Configuration
// Fully verified & aligned with Master Excel Policy (BANKS POLICYS.xlsx - Sheet: CHOLA) & Admin Dashboard

export const cholaConfig = {
  id: 'chola',
  name: 'Cholamandalam Finance',
  shortName: 'Chola',

  // Demographics (Section 1)
  minAge: 21,
  maxAge: 60,
  retirementAge: 60,
  coAppAgeLimit: 23, // 21 to 23 age group requires co-applicant (Excel: 21 TO 23 AGE GROUP CO APP REQ)
  minSalary: 25000, // 25K WITHOUT INCENTIVE
  minSalaryBankNbfc: 30000, // BANKS AND NBFCS 30K WITHOUT INCENTIVE
  restrictedDesignations: ['RM', 'SM', 'SO', 'SFE', 'RELATIONSHIP MANAGER', 'SALES MANAGER', 'SALES OFFICER', 'SALES FINANCE EXECUTIVE'],
  minExperienceGovtMonths: 3, // GOVT 3 MONTHS
  minExperiencePvtMonths: 12, // PVT 1 YEARS (12 MONTHS)
  minCreditScore: 620,

  // Loan Amount Limits (Section 5)
  minLoanAmount: 100000, // 1 LAC
  maxLoanAmount: 3000000, // 30 LACS
  loanAmountCaps: {
    'SUPER A': 3000000,
    'A': 3000000,
    'B': 2000000,
    'C': 2000000,
    'D': 2000000,
    'GOVT': 3000000
  },
  coAppAboveLoanAmountCatA: 2000000, // Co-applicant required above 20L for Category A

  // Tenure Windows (Section 4)
  minLoanTenureMonths: 12,
  maxLoanTenureMonths: 84,
  maxTenureByCategory: {
    'SUPER A': 84, // 7 Years (84 Months)
    'A': 84,       // 7 Years (84 Months)
    'B': 84,       // 7 Years (84 Months)
    'C': 60,       // 5 Years (60 Months)
    'D': 60,       // 5 Years (60 Months)
    'GOVT': 84     // 7 Years (84 Months)
  },

  // FOIR & Multiplier (Section 3)
  creditCardObligationPercent: 0.05, // 5%
  foirAndMultipliers: {
    above30k: {
      'SUPER A': { foir: 0.70, multiplier: 35 },
      'A': { foir: 0.70, multiplier: 28 },
      'B': { foir: 0.70, multiplier: 28 },
      'C': { foir: 0.65, multiplier: 25 },
      'D': { foir: 0.65, multiplier: 25 },
      'GOVT': { foir: 0.70, multiplier: 35 }
    },
    band25kTo30k: {
      'SUPER A': { foir: 0.65, multiplier: 30 },
      'A': { foir: 0.65, multiplier: 24 },
      'B': { foir: 0.65, multiplier: 24 },
      'C': { foir: 0.55, multiplier: 20 },
      'D': { foir: 0.55, multiplier: 20 },
      'GOVT': { foir: 0.65, multiplier: 30 }
    }
  },

  // ROI Structure & Slabs (Section 2)
  roiSlabs: [
    {
      category: 'SUPER A',
      slab1: { minLoan: 1000000, minSalary: 75000, roi: 13.75 },
      slab2: { minLoan: 750000, minSalary: 50000, roi: 14.50 },
      defaultRoi: 15.00
    },
    {
      category: 'A',
      slab1: { minLoan: 1000000, minSalary: 75000, roi: 13.75 },
      slab2: { minLoan: 750000, minSalary: 50000, roi: 14.50 },
      defaultRoi: 15.00
    },
    {
      category: 'B',
      slab1: { minLoan: 500000, minSalary: 0, roi: 14.50 },
      defaultRoi: 15.00
    },
    {
      category: 'C',
      defaultRoi: 15.00
    },
    {
      category: 'D',
      defaultRoi: 15.00
    },
    {
      category: 'GOVT',
      slab1: { minLoan: 1000000, minSalary: 75000, roi: 13.75 },
      slab2: { minLoan: 750000, minSalary: 50000, roi: 14.50 },
      defaultRoi: 15.00
    }
  ],

  // Balance Transfer (BT) Configuration (Section 1)
  btConfig: {
    isAvailable: true,
    maxCreditCardsForBT: 6, // 6 CCBT ALLOW
    maxCcBtSalaryMultiplier: 6, // 6 TIME NOT ALLOW FOR BT (CC BT POS > 6x monthly salary not allowed)
    description: 'Chola allows up to 6 Credit Card BTs with total card outstanding capped at 6x monthly income'
  }
};