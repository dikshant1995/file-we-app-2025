// Exact Master Policy Configuration for KOTAK MAHINDRA BANK from Excel (BANKS POLICYS.xlsx - Sheet: KOTAK)
export const KOTAK_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove15L: 9.95, roi10Lto15L: 10.50, roiBelow10L: 10.99, minRoi: 9.95, maxRoi: 10.99, defaultRoi: 9.95 },
    { category: 'A', roiAbove15L: 9.95, roi10Lto15L: 10.50, roiBelow10L: 10.99, minRoi: 9.95, maxRoi: 10.99, defaultRoi: 9.95 },
    { category: 'B', roiAbove15L: 9.95, roi10Lto15L: 10.50, roiBelow10L: 10.99, minRoi: 9.95, maxRoi: 10.99, defaultRoi: 9.95 },
    { category: 'C', roiAbove15L: 11.00, roi10Lto15L: 11.50, roiBelow10L: 12.00, minRoi: 11.00, maxRoi: 12.00, defaultRoi: 11.00 },
    { category: 'D', roiAbove15L: 12.00, roi10Lto15L: 12.50, roiBelow10L: 13.00, minRoi: 12.00, maxRoi: 13.00, defaultRoi: 12.50 },
    { category: 'Govt', roiAbove15L: 9.95, roi10Lto15L: 10.50, roiBelow10L: 10.99, minRoi: 9.95, maxRoi: 10.99, defaultRoi: 9.95 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 10000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 10000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 10000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3500000, bachelorCap: null, minSalary: 35000 },
    { tier: 'D', minLoan: 100000, maxLoan: 2000000, bachelorCap: null, minSalary: 35000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 10000000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 24, maxMonths: 72, description: '2 to 6 Years (24 to 72 Months)' },
    { category: 'A', minMonths: 24, maxMonths: 72, description: '2 to 6 Years (24 to 72 Months)' },
    { category: 'B', minMonths: 24, maxMonths: 72, description: '2 to 6 Years (24 to 72 Months)' },
    { category: 'C', minMonths: 24, maxMonths: 72, description: '2 to 6 Years (24 to 72 Months)' },
    { category: 'D', minMonths: 24, maxMonths: 60, description: '2 to 5 Years (24 to 60 Months)' },
    { category: 'Govt', minMonths: 24, maxMonths: 72, description: '2 to 6 Years (24 to 72 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 70, slab2Foir: 70, maxFoir: 70, hlFoir: 75, multiplier: 31, ccObligation: 5 },
    { category: 'A', slab1Foir: 70, slab2Foir: 70, maxFoir: 70, hlFoir: 75, multiplier: 27, ccObligation: 5 },
    { category: 'B', slab1Foir: 70, slab2Foir: 70, maxFoir: 70, hlFoir: 75, multiplier: 25, ccObligation: 5 },
    { category: 'C', slab1Foir: 70, slab2Foir: 70, maxFoir: 70, hlFoir: 75, multiplier: 20, ccObligation: 5 },
    { category: 'D', slab1Foir: 60, slab2Foir: 60, maxFoir: 60, hlFoir: 60, multiplier: 18, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 70, slab2Foir: 70, maxFoir: 70, hlFoir: 75, multiplier: 27, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minSalaryCatC: 35000,
    minSalaryCatD: 35000,
    minExperienceTotal: 1,
    minExperienceCurrent: 1,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: false,
    ccBtAllowedCount: 0
  }
};
