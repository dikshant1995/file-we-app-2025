// Exact Master Policy Configuration for PIRAMAL FINANCE from Excel
export const PIRAMAL_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 11.99, note: 'As per Ventile score' },
    { category: 'A', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 11.99, note: 'As per Ventile score' },
    { category: 'B', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 12.99, note: 'As per Ventile score' },
    { category: 'C', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 13.99, note: 'As per Ventile score' },
    { category: 'D', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 14.99, note: 'As per Ventile score' },
    { category: 'Govt', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 11.99, note: 'As per Ventile score' }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 22000 },
    { tier: 'A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 22000 },
    { tier: 'B', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 22000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 22000 },
    { tier: 'D', minLoan: 100000, maxLoan: 2000000, bachelorCap: null, minSalary: 22000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 22000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, maxMonthsHighIncomeOd: 96, description: 'Up to 6 Years (72 Months) / 84-96M for OD' },
    { category: 'A', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, maxMonthsHighIncomeOd: 96, description: 'Up to 6 Years (72 Months) / 84-96M for OD' },
    { category: 'B', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, description: 'Up to 6 Years (72 Months) / 84M for OD' },
    { category: 'C', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, description: 'Up to 6 Years (72 Months) / 84M for OD' },
    { category: 'D', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, description: 'Up to 6 Years (72 Months) / 84M for OD' },
    { category: 'Govt', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, description: 'Up to 6 Years (72 Months) / 84M for OD' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 65, maxFoir: 70, multiplier: 30, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, slab2Foir: 65, maxFoir: 70, multiplier: 24, ccObligation: 5 },
    { category: 'B', slab1Foir: 45, slab2Foir: 55, maxFoir: 65, multiplier: 22, ccObligation: 5 },
    { category: 'C', slab1Foir: 40, slab2Foir: 50, maxFoir: 60, multiplier: 18, ccObligation: 5 },
    { category: 'D', slab1Foir: 40, slab2Foir: 50, maxFoir: 55, multiplier: 15, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 65, maxFoir: 70, multiplier: 24, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    maxAgeGovt: 63,
    retirementSalaried: 60,
    retirementGovt: 63,
    minSalary: 22000,
    pfMandatory: true,
    minExperienceTotal: 12,
    minExperienceCurrent: 12,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: true,
    ccBtAllowedCount: 2,
    requirePlBtWithCcBt: true
  }
};
