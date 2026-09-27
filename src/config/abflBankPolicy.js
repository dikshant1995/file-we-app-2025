// Exact Master Policy Configuration for ADITYA BIRLA FINANCE LTD from Excel
export const ABFL_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove15L: 11.50, roi10Lto15L: 12.50, roiBelow10L: 13.50, minRoi: 11.50, maxRoi: 14.50, defaultRoi: 12.00 },
    { category: 'A', roiAbove15L: 11.50, roi10Lto15L: 12.50, roiBelow10L: 13.50, minRoi: 11.50, maxRoi: 14.50, defaultRoi: 12.00 },
    { category: 'B', roiAbove15L: 12.00, roi10Lto15L: 13.00, roiBelow10L: 14.00, minRoi: 12.00, maxRoi: 15.00, defaultRoi: 12.50 },
    { category: 'C', roiAbove15L: 13.00, roi10Lto15L: 14.00, roiBelow10L: 15.00, minRoi: 13.00, maxRoi: 16.00, defaultRoi: 13.50 },
    { category: 'D', roiAbove15L: 14.00, roi10Lto15L: 15.00, roiBelow10L: 16.00, minRoi: 14.00, maxRoi: 17.00, defaultRoi: 14.50 },
    { category: 'Govt', roiAbove15L: 11.50, roi10Lto15L: 12.50, roiBelow10L: 13.50, minRoi: 11.50, maxRoi: 14.50, defaultRoi: 12.00 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, maxLoanSpecial: 6500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 5000000, maxLoanSpecial: 6500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 20000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, maxMonthsOd: 96, description: 'Up to 7 Years (84 Months) / 96M for OD' },
    { category: 'A', minMonths: 12, maxMonths: 84, maxMonthsOd: 96, description: 'Up to 7 Years (84 Months) / 96M for OD' },
    { category: 'B', minMonths: 12, maxMonths: 84, maxMonthsOd: 96, description: 'Up to 7 Years (84 Months) / 96M for OD' },
    { category: 'C', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, maxMonthsOd: 96, description: 'Up to 7 Years (84 Months) / 96M for OD' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, hlMaxFoir: 75, multiplier: 28, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, hlMaxFoir: 75, multiplier: 26, ccObligation: 5 },
    { category: 'B', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, hlMaxFoir: 75, multiplier: 22, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, hlMaxFoir: 70, multiplier: 18, ccObligation: 5 },
    { category: 'D', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 65, hlMaxFoir: 65, multiplier: 15, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, hlMaxFoir: 75, multiplier: 26, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalaryTier4: 20000,
    minSalaryTier3: 25000,
    minSalaryTier2: 35000,
    minSalaryTier1: 40000,
    minSalary: 20000,
    minExperienceTotal: 12,
    minExperienceCurrent: 12,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: true,
    ccBtAllowedCount: 5,
    maxCcBtSalaryMultiplier: 6,
    kccNotObligated: true
  }
};
