// Exact Master Policy Configuration for HDFC BANK from Excel
export const HDFC_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove20L: 9.99, roi15Lto20L: 10.15, roi10Lto15L: 10.50, roi5Lto10L: 11.50, roiAbove15L: 10.15, roiBelow10L: 11.50, minRoi: 9.99, maxRoi: 11.50, defaultRoi: 9.99 },
    { category: 'A', roiAbove20L: 9.99, roi15Lto20L: 10.15, roi10Lto15L: 10.50, roi5Lto10L: 11.50, roiAbove15L: 10.15, roiBelow10L: 11.50, minRoi: 9.99, maxRoi: 11.50, defaultRoi: 9.99 },
    { category: 'B', roiAbove20L: 9.99, roi15Lto20L: 10.15, roi10Lto15L: 10.50, roi5Lto10L: 11.50, roiAbove15L: 10.15, roiBelow10L: 11.50, minRoi: 9.99, maxRoi: 11.50, defaultRoi: 9.99 },
    { category: 'C', roiAbove20L: 10.25, roi15Lto20L: 10.50, roi10Lto15L: 11.00, roi5Lto10L: 11.50, roiAbove15L: 10.50, roiBelow10L: 11.50, minRoi: 10.25, maxRoi: 11.50, defaultRoi: 10.25 },
    { category: 'D', roiAbove20L: 10.25, roi15Lto20L: 10.50, roi10Lto15L: 11.00, roi5Lto10L: 11.50, roiAbove15L: 10.50, roiBelow10L: 11.50, minRoi: 10.25, maxRoi: 11.50, defaultRoi: 10.25 },
    { category: 'Govt', roiAbove20L: 9.99, roi15Lto20L: 10.15, roi10Lto15L: 10.50, roi5Lto10L: 11.50, roiAbove15L: 10.15, roiBelow10L: 11.50, minRoi: 9.99, maxRoi: 11.50, defaultRoi: 9.99 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, mult1: 19, mult1_35k: 22, slab2Foir: 60, mult2: 25, maxFoir: 70, mult3: 27, multiplier: 27, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, mult1: 19, mult1_35k: 22, slab2Foir: 60, mult2: 25, maxFoir: 70, mult3: 27, multiplier: 27, ccObligation: 5 },
    { category: 'B', slab1Foir: 50, mult1: 15, mult1_35k: 18, slab2Foir: 55, mult2: 22, maxFoir: 65, mult3: 25, multiplier: 25, ccObligation: 5 },
    { category: 'C', slab1Foir: 40, mult1: 12, mult1_35k: 15, slab2Foir: 45, mult2: 18, maxFoir: 50, mult3: 20, multiplier: 20, ccObligation: 5 },
    { category: 'D', slab1Foir: 40, mult1: 12, mult1_35k: 15, slab2Foir: 45, mult2: 18, maxFoir: 50, mult3: 20, multiplier: 20, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, mult1: 19, mult1_35k: 22, slab2Foir: 60, mult2: 25, maxFoir: 70, mult3: 27, multiplier: 27, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minExperienceTotal: 12,
    minExperienceCurrent: 0,
    minCibilScore: 0,
    ccObligationPercent: 5,
    ccBtAllowedCount: 0,
    allowCcBt: false
  }
};
