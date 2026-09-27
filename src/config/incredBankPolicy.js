// Exact Master Policy Configuration for INCRED FINANCE from Excel
export const INCRED_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', minRoi: 13.49, maxRoi: 33.00, defaultRoi: 16.00 },
    { category: 'A', minRoi: 13.49, maxRoi: 33.00, defaultRoi: 16.00 },
    { category: 'B', minRoi: 14.50, maxRoi: 33.00, defaultRoi: 18.00 },
    { category: 'C', minRoi: 16.00, maxRoi: 33.00, defaultRoi: 20.00 },
    { category: 'D', minRoi: 18.00, maxRoi: 33.00, defaultRoi: 22.00 },
    { category: 'Govt', minRoi: 13.49, maxRoi: 33.00, defaultRoi: 16.00 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 15000 },
    { tier: 'A', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 15000 },
    { tier: 'B', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 15000 },
    { tier: 'C', minLoan: 50000, maxLoan: 1000000, bachelorCap: null, minSalary: 15000 },
    { tier: 'D', minLoan: 50000, maxLoan: 800000, bachelorCap: null, minSalary: 15000 },
    { tier: 'Govt', minLoan: 50000, maxLoan: 1500000, bachelorCap: null, minSalary: 15000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 24, maxMonths: 60, description: '24 to 60 Months' },
    { category: 'A', minMonths: 24, maxMonths: 60, description: '24 to 60 Months' },
    { category: 'B', minMonths: 24, maxMonths: 60, description: '24 to 60 Months' },
    { category: 'C', minMonths: 24, maxMonths: 60, description: '24 to 60 Months' },
    { category: 'D', minMonths: 24, maxMonths: 60, description: '24 to 60 Months' },
    { category: 'Govt', minMonths: 24, maxMonths: 60, description: '24 to 60 Months' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: 22, ccObligation: 5 },
    { category: 'A', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: 22, ccObligation: 5 },
    { category: 'B', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: 20, ccObligation: 5 },
    { category: 'C', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: 18, ccObligation: 5 },
    { category: 'D', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: 15, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 40, slab2Foir: 50, slab3Foir: 60, maxFoir: 65, aaBonusFoir: 5, multiplier: 22, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 55,
    retirementSalaried: 55,
    retirementGovt: 58,
    minSalary: 15000,
    minExperienceTotal: 3,
    minExperienceCurrent: 3,
    minCibilScore: 0,
    ccObligationPercent: 5,
    goldLoanObligationPercent: 5,
    kccObligationPercent: 5
  }
};
