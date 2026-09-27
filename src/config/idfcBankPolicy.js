// Exact Master Policy Configuration for IDFC FIRST BANK from Excel
export const IDFC_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove15L: 10.25, roi10Lto15L: 10.50, roiBelow10L: 10.99, minRoi: 10.25, maxRoi: 10.99, defaultRoi: 10.25 },
    { category: 'A', roiAbove15L: 10.25, roi10Lto15L: 10.50, roiBelow10L: 10.99, minRoi: 10.25, maxRoi: 10.99, defaultRoi: 10.25 },
    { category: 'B', roiAbove15L: 10.75, roi10Lto15L: 11.25, roiBelow10L: 11.75, minRoi: 10.75, maxRoi: 11.75, defaultRoi: 10.75 },
    { category: 'C', roiAbove15L: 11.50, roi10Lto15L: 12.00, roiBelow10L: 12.50, minRoi: 11.50, maxRoi: 12.50, defaultRoi: 11.50 },
    { category: 'D', roiAbove15L: 12.50, roi10Lto15L: 13.00, roiBelow10L: 13.50, minRoi: 12.50, maxRoi: 13.50, defaultRoi: 12.50 },
    { category: 'Govt', roiAbove15L: 10.25, roi10Lto15L: 10.50, roiBelow10L: 10.99, minRoi: 10.25, maxRoi: 10.99, defaultRoi: 10.25 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 10000000, bachelorCap: null, minSalary: 20000 },
    { tier: 'A', minLoan: 100000, maxLoan: 10000000, bachelorCap: null, minSalary: 20000 },
    { tier: 'B', minLoan: 100000, maxLoan: 10000000, bachelorCap: null, minSalary: 20000 },
    { tier: 'C', minLoan: 100000, maxLoan: 10000000, bachelorCap: null, minSalary: 20000 },
    { tier: 'D', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 20000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 10000000, bachelorCap: null, minSalary: 20000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 60, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 27, multiplierAbove75k: 27, multiplier50kTo75k: 25, multiplierBelow50k: 23, ccObligation: 5 },
    { category: 'A', slab1Foir: 60, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 27, multiplierAbove75k: 27, multiplier50kTo75k: 25, multiplierBelow50k: 23, ccObligation: 5 },
    { category: 'B', slab1Foir: 60, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 22, multiplierAbove75k: 22, multiplier50kTo75k: 20, multiplierBelow50k: 16, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 15, multiplierAbove75k: 15, multiplier50kTo75k: 13, multiplierBelow50k: 11, ccObligation: 5 },
    { category: 'D', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 15, multiplierAbove75k: 15, multiplier50kTo75k: 13, multiplierBelow50k: 11, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 60, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 27, multiplierAbove75k: 27, multiplier50kTo75k: 25, multiplierBelow50k: 23, ccObligation: 5 }
  ],
  demographics: {
    minAge: 23,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 20000,
    minExperienceTotal: 3, // 3 months for <= 15L, 2 years for >15L
    minExperienceCurrent: 3,
    minCibilScore: 0,
    ccObligationPercent: 5
  }
};
