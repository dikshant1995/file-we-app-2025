// Exact Master Policy Configuration for INDUSIND BANK LTD from Excel
export const INDUSIND_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove15L: 9.99, roi10Lto15L: 9.99, roiBelow10L: 12.00, minRoi: 9.99, maxRoi: 12.00, defaultRoi: 9.99 },
    { category: 'A', roiAbove15L: 9.99, roi10Lto15L: 9.99, roiBelow10L: 12.00, minRoi: 9.99, maxRoi: 12.00, defaultRoi: 9.99 },
    { category: 'B', roiAbove15L: 9.99, roi10Lto15L: 9.99, roiBelow10L: 12.00, minRoi: 9.99, maxRoi: 12.00, defaultRoi: 9.99 },
    { category: 'C', roiAbove15L: 10.60, roi10Lto15L: 13.00, roiBelow10L: 13.00, minRoi: 10.60, maxRoi: 13.00, defaultRoi: 10.60 },
    { category: 'Govt', roiAbove15L: 9.99, roi10Lto15L: 9.99, roiBelow10L: 12.00, minRoi: 9.99, maxRoi: 12.00, defaultRoi: 9.99 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 1500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (CIBIL -1 capped to 48M)' },
    { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (CIBIL -1 capped to 48M)' },
    { category: 'B', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (CIBIL -1 capped to 48M)' },
    { category: 'C', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (CIBIL -1 capped to 48M)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (CIBIL -1 capped to 48M)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplierBelow75k: 20, multiplier75kTo125k: 25, multiplierAbove125k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplierBelow75k: 20, multiplier75kTo125k: 25, multiplierAbove125k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'B', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplierBelow75k: 20, multiplier75kTo125k: 25, multiplierAbove125k: 30, multiplier: 25, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 60, maxFoir: 60, multiplierBelow75k: 21, multiplier75kTo125k: 21, multiplierAbove125k: 21, multiplier: 21, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplierBelow75k: 20, multiplier75kTo125k: 25, multiplierAbove125k: 30, multiplier: 30, ccObligation: 5 }
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
