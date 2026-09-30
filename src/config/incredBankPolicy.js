// Exact Master Policy Configuration for INCRED FINANCE from Excel & Policy Update
export const INCRED_BANK_EXCEL_POLICY = {
  // Section 1: ROI STRUCTURES AND SLABS (13.49% to 33.00% p.a. for Loan Amount ₹50k to 15L)
  interestRates: [
    { category: 'Super A', minRoi: 13.49, maxRoi: 33.00, defaultRoi: 13.49, roiDescription: '13.49% to 33.00% p.a.' },
    { category: 'A', minRoi: 13.49, maxRoi: 33.00, defaultRoi: 13.49, roiDescription: '13.49% to 33.00% p.a.' },
    { category: 'B', minRoi: 13.49, maxRoi: 33.00, defaultRoi: 13.49, roiDescription: '13.49% to 33.00% p.a.' },
    { category: 'C', minRoi: 13.49, maxRoi: 33.00, defaultRoi: 13.49, roiDescription: '13.49% to 33.00% p.a.' },
    { category: 'D', minRoi: 13.49, maxRoi: 33.00, defaultRoi: 13.49, roiDescription: '13.49% to 33.00% p.a.' },
    { category: 'Govt', minRoi: 13.49, maxRoi: 33.00, defaultRoi: 13.49, roiDescription: '13.49% to 33.00% p.a.' }
  ],

  // Section 2: LOAN CAPPING (₹50,000 to ₹15 Lakhs across all categories)
  loanCapping: [
    { tier: 'Super A', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 15000 },
    { tier: 'A', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 15000 },
    { tier: 'B', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 15000 },
    { tier: 'C', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 15000 },
    { tier: 'D', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 15000 },
    { tier: 'Govt', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 15000 }
  ],

  // Section 3: TENURE AND REPAYMENT (24 to 60 Months)
  tenureRules: [
    { category: 'Super A', minMonths: 24, maxMonths: 60, description: '24 to 60 Months (2 to 5 Years)' },
    { category: 'A', minMonths: 24, maxMonths: 60, description: '24 to 60 Months (2 to 5 Years)' },
    { category: 'B', minMonths: 24, maxMonths: 60, description: '24 to 60 Months (2 to 5 Years)' },
    { category: 'C', minMonths: 24, maxMonths: 60, description: '24 to 60 Months (2 to 5 Years)' },
    { category: 'D', minMonths: 24, maxMonths: 60, description: '24 to 60 Months (2 to 5 Years)' },
    { category: 'Govt', minMonths: 24, maxMonths: 60, description: '24 to 60 Months (2 to 5 Years)' }
  ],

  // Section 4: FOIR ONLY - Salary Slabs (Screenshot Structure)
  // 15-20k = 40%+5% basis on account aggregator (45% max)
  // 20-30k = 50%+5% basis on account aggregator (55% max)
  // 30-40k = 60%+5% basis on account aggregator (65% max)
  // >40k = 65%+5% basis on account aggregator (70% max)
  salaryFoirSlabs: [
    { salarySlab: '15K - 20K', minSalary: 15000, maxSalary: 20000, baseFoir: 40, aaBonusFoir: 5, maxFoir: 45, ccObligation: 5 },
    { salarySlab: '20K - 30K', minSalary: 20001, maxSalary: 30000, baseFoir: 50, aaBonusFoir: 5, maxFoir: 55, ccObligation: 5 },
    { salarySlab: '30K - 40K', minSalary: 30001, maxSalary: 40000, baseFoir: 60, aaBonusFoir: 5, maxFoir: 65, ccObligation: 5 },
    { salarySlab: '> 40K', minSalary: 40001, maxSalary: Infinity, baseFoir: 65, aaBonusFoir: 5, maxFoir: 70, ccObligation: 5 }
  ],

  // InCred Finance is FOIR ONLY (Multiplier is removed)
  isFoirOnly: true,
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: null, ccObligation: 5 },
    { category: 'A', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: null, ccObligation: 5 },
    { category: 'B', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: null, ccObligation: 5 },
    { category: 'C', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: null, ccObligation: 5 },
    { category: 'D', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: null, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: null, ccObligation: 5 }
  ],

  // Section 5: DEMOGRAPHICS AND ELIGIBILITY RULES
  demographics: {
    minAge: 21,                      // 21 Years
    maxAge: 55,                      // 55 Years
    retirementSalaried: 55,          // 55 Years
    retirementGovt: 55,              // 55 Years
    minSalary: 15000,                // Minimum Salary ₹15,000 (15k)
    minExperienceTotal: 3,           // Minimum 3 Months work experience
    minExperienceCurrent: 3,         // Minimum 3 Months current company experience
    minCibilScore: 0,
    ccObligationPercent: 5,          // CC / Gold Loan / KCC Obligation: 5%
    goldLoanObligationPercent: 5,    // 5%
    kccObligationPercent: 5,         // 5%
    allowCcBt: false,                // Credit Card BT NOT allowed
    ccBtAllowedCount: 0
  }
};
