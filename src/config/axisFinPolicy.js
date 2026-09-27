// Exact Master Policy Configuration for AXIS FINANCE LTD from Excel
export const AXIS_FINANCE_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roi5Lto25L: 13.50, minRoi: 13.50, maxRoi: 16.00, defaultRoi: 13.50, btRoi: 18.00 },
    { category: 'A', roi5Lto25L: 14.50, minRoi: 14.50, maxRoi: 16.50, defaultRoi: 14.50, btRoi: 18.00 },
    { category: 'B', roi5Lto25L: 15.00, minRoi: 15.00, maxRoi: 17.00, defaultRoi: 15.00, btRoi: 18.00 },
    { category: 'C', roi5Lto25L: 16.00, minRoi: 16.00, maxRoi: 18.00, defaultRoi: 16.00, btRoi: 18.00 },
    { category: 'D', roi5Lto25L: 16.00, minRoi: 16.00, maxRoi: 18.00, defaultRoi: 16.00, btRoi: 18.00 },
    { category: 'Govt', roi5Lto25L: 13.50, minRoi: 13.50, maxRoi: 16.00, defaultRoi: 13.50, btRoi: 18.00 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 50000, maxLoan: 2500000, bachelorCap: null, minSalary: 30000 },
    { tier: 'A', minLoan: 50000, maxLoan: 2500000, bachelorCap: null, minSalary: 30000 },
    { tier: 'B', minLoan: 50000, maxLoan: 2500000, bachelorCap: null, minSalary: 30000 },
    { tier: 'C', minLoan: 50000, maxLoan: 2500000, bachelorCap: null, minSalary: 30000 },
    { tier: 'D', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 30000 },
    { tier: 'Govt', minLoan: 50000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 70, slab2Foir: 70, maxFoir: 70, multiplier: 30, multiplierAbove100k: 30, multiplier75kTo100k: 28, multiplier50kTo75k: 26, multiplierBelow50k: 24, ccObligation: 5 },
    { category: 'A', slab1Foir: 70, slab2Foir: 70, maxFoir: 70, multiplier: 30, multiplierAbove100k: 30, multiplier75kTo100k: 28, multiplier50kTo75k: 26, multiplierBelow50k: 24, ccObligation: 5 },
    { category: 'B', slab1Foir: 65, slab2Foir: 65, maxFoir: 65, multiplier: 28, multiplierAbove100k: 30, multiplier75kTo100k: 28, multiplier50kTo75k: 26, multiplierBelow50k: 24, ccObligation: 5 },
    { category: 'C', slab1Foir: 60, slab2Foir: 60, maxFoir: 60, multiplier: 26, multiplierAbove100k: 30, multiplier75kTo100k: 28, multiplier50kTo75k: 26, multiplierBelow50k: 24, ccObligation: 5 },
    { category: 'D', slab1Foir: 50, slab2Foir: 50, maxFoir: 50, multiplier: 15, ccObligation: 5, note: 'No multiplier applicable (Deviation required)' },
    { category: 'Govt', slab1Foir: 70, slab2Foir: 70, maxFoir: 70, multiplier: 30, multiplierAbove100k: 30, multiplier75kTo100k: 28, multiplier50kTo75k: 26, multiplierBelow50k: 24, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalaryUrban: 30000,
    minSalaryRural: 25000,
    minSalary: 25000,
    minExperienceTotal: 6,
    minExperienceCurrent: 6,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: true,
    ccBtAllowedCount: 5,
    goldLoanObligationPercent: 1,
    kccExemptionLimit: 1500000 // KCC up to 15L = 0 obligation
  }
};
