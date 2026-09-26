// Exact Master Policy Configuration for AXIS BANK from Excel
export const AXIS_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove15L: 9.99, roi10Lto15L: 10.35, roiBelow10L: 10.49, minRoi: 9.99, maxRoi: 10.35, defaultRoi: 9.99 },
    { category: 'A', roiAbove15L: 9.99, roi10Lto15L: 10.35, roiBelow10L: 10.49, minRoi: 9.99, maxRoi: 10.35, defaultRoi: 9.99 },
    { category: 'B', roiAbove15L: 10.39, roi10Lto15L: 10.45, roiBelow10L: 10.75, minRoi: 10.39, maxRoi: 10.45, defaultRoi: 10.39 },
    { category: 'C', roiAbove15L: 10.59, roi10Lto15L: 10.75, roiBelow10L: 11.25, minRoi: 10.59, maxRoi: 10.75, defaultRoi: 10.59 },
    { category: 'Govt', roiAbove15L: 10.39, roi10Lto15L: 10.45, roiBelow10L: 10.75, minRoi: 10.39, maxRoi: 10.45, defaultRoi: 10.39 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 50000, maxLoan: 5000000, bachelorCap: null, minSalary: 175000 },
    { tier: 'A', minLoan: 50000, maxLoan: 5000000, bachelorCap: null, minSalary: 175000 },
    { tier: 'B', minLoan: 50000, maxLoan: 5000000, bachelorCap: null, minSalary: 175000 },
    { tier: 'C', minLoan: 50000, maxLoan: 5000000, bachelorCap: null, minSalary: 175000 },
    { tier: 'Govt', minLoan: 50000, maxLoan: 5000000, bachelorCap: null, minSalary: 175000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
    { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
    { category: 'B', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
    { category: 'C', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 55, slab2Foir: 65, maxFoir: 75, multiplier: 36, ccObligation: 4 },
    { category: 'A', slab1Foir: 55, slab2Foir: 65, maxFoir: 75, multiplier: 36, ccObligation: 4 },
    { category: 'B', slab1Foir: 55, slab2Foir: 65, maxFoir: 75, multiplier: 36, ccObligation: 4 },
    { category: 'C', slab1Foir: 55, slab2Foir: 65, maxFoir: 75, multiplier: 36, ccObligation: 4 },
    { category: 'Govt', slab1Foir: 55, slab2Foir: 65, maxFoir: 75, multiplier: 36, ccObligation: 4 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minExperienceTotal: 12,
    minExperienceCurrent: 6,
    minCibilScore: 0,
    ccObligationPercent: 4,
    ccBtAllowedCount: 5
  }
};
