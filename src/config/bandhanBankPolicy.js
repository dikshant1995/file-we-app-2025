// Exact Master Policy Configuration for BANDHAN BANK from Excel
export const BANDHAN_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove15L: 10.50, roi10Lto15L: 11.00, roiBelow10L: 11.50, minRoi: 10.50, maxRoi: 11.50, defaultRoi: 10.50 },
    { category: 'A', roiAbove15L: 10.50, roi10Lto15L: 11.00, roiBelow10L: 11.50, minRoi: 10.50, maxRoi: 11.50, defaultRoi: 10.50 },
    { category: 'B', roiAbove15L: 11.25, roi10Lto15L: 11.75, roiBelow10L: 12.00, minRoi: 11.25, maxRoi: 12.00, defaultRoi: 11.50 },
    { category: 'C', roiAbove15L: 12.25, roi10Lto15L: 12.75, roiBelow10L: 13.50, minRoi: 12.25, maxRoi: 13.50, defaultRoi: 12.50 },
    { category: 'D', roiAbove15L: 13.25, roi10Lto15L: 13.75, roiBelow10L: 14.50, minRoi: 13.25, maxRoi: 14.50, defaultRoi: 13.50 },
    { category: 'Govt', roiAbove15L: 10.50, roi10Lto15L: 11.00, roiBelow10L: 11.50, minRoi: 10.50, maxRoi: 11.50, defaultRoi: 10.50 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 40000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months) - Flat Cap' },
    { category: 'A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months) - Flat Cap' },
    { category: 'B', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months) - Flat Cap' },
    { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months) - Flat Cap' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months) - Flat Cap' },
    { category: 'Govt', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months) - Flat Cap' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 24, ccObligation: 3 },
    { category: 'A', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 24, ccObligation: 3 },
    { category: 'B', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 22, ccObligation: 3 },
    { category: 'C', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 18, ccObligation: 3 },
    { category: 'D', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 15, ccObligation: 3 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 24, ccObligation: 3 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minSalaryCatD: 40000,
    minExperienceTotal: 12,
    minExperienceCurrent: 1,
    minCibilScore: 0,
    ccObligationPercent: 3,
    ccExemptionThresholdMultiplier: 3, // Below 3x salary, no CC obligation
    exemptGlAndKcc: true
  }
};
