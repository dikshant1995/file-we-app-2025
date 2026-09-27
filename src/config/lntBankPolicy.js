// Exact Master Policy Configuration for L&T FINANCE from Excel
export const LNT_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roi20Lto30L: 11.50, roi10Lto20L: 14.00, roi1Lto10L: 14.50, minRoi: 10.99, maxRoi: 15.00, defaultRoi: 12.50 },
    { category: 'A', roi20Lto30L: 11.50, roi10Lto20L: 14.00, roi1Lto10L: 14.50, minRoi: 10.99, maxRoi: 15.00, defaultRoi: 12.50 },
    { category: 'B', roi20Lto30L: 11.50, roi10Lto20L: 14.00, roi1Lto10L: 14.50, minRoi: 11.50, maxRoi: 15.00, defaultRoi: 13.00 },
    { category: 'C', roi20Lto30L: 13.50, roi10Lto20L: 14.00, roi1Lto10L: 15.00, minRoi: 13.50, maxRoi: 15.00, defaultRoi: 14.00 },
    { category: 'D', roi20Lto30L: 14.00, roi10Lto20L: 14.50, roi1Lto10L: 15.00, minRoi: 14.00, maxRoi: 15.00, defaultRoi: 14.50 },
    { category: 'Govt', roi20Lto30L: 11.50, roi10Lto20L: 14.00, roi1Lto10L: 14.50, minRoi: 11.50, maxRoi: 15.00, defaultRoi: 12.50 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 1500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 55, slab2Foir: 70, slab3Foir: 75, maxFoir: 80, multiplier: 24, ccObligation: 5 },
    { category: 'A', slab1Foir: 55, slab2Foir: 70, slab3Foir: 75, maxFoir: 80, multiplier: 24, ccObligation: 5 },
    { category: 'B', slab1Foir: 55, slab2Foir: 70, slab3Foir: 75, maxFoir: 80, multiplier: 22, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 60, slab3Foir: 70, maxFoir: 75, multiplier: 20, ccObligation: 5 },
    { category: 'D', slab1Foir: 50, slab2Foir: 55, slab3Foir: 65, maxFoir: 70, multiplier: 16, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 55, slab2Foir: 70, slab3Foir: 75, maxFoir: 80, multiplier: 24, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minExperienceTotal: 6,
    minExperienceCurrent: 6,
    minCibilScore: 720,
    ccObligationPercent: 5,
    allowCcBt: false,
    ccBtAllowedCount: 0
  }
};
