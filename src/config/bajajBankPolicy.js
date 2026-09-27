// Exact Master Policy Configuration for BAJAJ FINANCE from Excel
export const BAJAJ_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00 },
    { category: 'A', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00 },
    { category: 'B', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00 },
    { category: 'C', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00 },
    { category: 'D', roiAbove10L: 11.00, roi1Lto12L: 16.50, minRoi: 11.00, maxRoi: 16.50, defaultRoi: 14.50 },
    { category: 'Govt', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 27000 },
    { tier: 'A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 27000 },
    { tier: 'B', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 27000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'D', minLoan: 100000, maxLoan: 2000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 27000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 96, maxMonthsHighIncome: 108, description: 'Up to 8 Years (96 Months) / 108 Months for ₹1L+ Salary' },
    { category: 'A', minMonths: 12, maxMonths: 96, maxMonthsHighIncome: 108, description: 'Up to 8 Years (96 Months) / 108 Months for ₹1L+ Salary' },
    { category: 'B', minMonths: 12, maxMonths: 96, maxMonthsHighIncome: 108, description: 'Up to 8 Years (96 Months) / 108 Months for ₹1L+ Salary' },
    { category: 'C', minMonths: 12, maxMonths: 96, description: 'Up to 8 Years (96 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 96, description: 'Up to 8 Years (96 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 96, maxMonthsHighIncome: 108, description: 'Up to 8 Years (96 Months) / 108 Months for ₹1L+ Salary' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, hlBonusFoir: 10, multiplier: 30, ccObligation: 5 },
    { category: 'A', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, hlBonusFoir: 10, multiplier: 28, ccObligation: 5 },
    { category: 'B', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, hlBonusFoir: 10, multiplier: 25, ccObligation: 5 },
    { category: 'C', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, hlBonusFoir: 10, multiplier: 22, ccObligation: 5 },
    { category: 'D', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, hlBonusFoir: 10, multiplier: 18, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, hlBonusFoir: 10, multiplier: 28, ccObligation: 5 }
  ],
  demographics: {
    minAge: 23,
    maxAge: 59,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 27000,
    minSalaryUnlisted: 30000,
    minExperienceTotal: 0,
    minExperienceCurrent: 0,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: true,
    maxCcBtMultiplier: 6
  }
};
