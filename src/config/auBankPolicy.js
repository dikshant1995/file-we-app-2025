// Exact Master Policy Configuration for AU SMALL FINANCE BANK from Excel
export const AU_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove10L: 11.50, roiBelow10L: 12.50, minRoi: 11.50, maxRoi: 13.50, defaultRoi: 11.50 },
    { category: 'A', roiAbove10L: 11.50, roiBelow10L: 12.50, minRoi: 11.50, maxRoi: 13.50, defaultRoi: 11.50 },
    { category: 'B', roiAbove10L: 12.00, roiBelow10L: 13.00, minRoi: 12.00, maxRoi: 14.00, defaultRoi: 12.00 },
    { category: 'C', roiAbove10L: 13.50, roiBelow10L: 14.50, minRoi: 13.50, maxRoi: 15.50, defaultRoi: 13.50 },
    { category: 'D', roiAbove10L: 14.00, roiBelow10L: 15.00, minRoi: 14.00, maxRoi: 16.00, defaultRoi: 14.00 },
    { category: 'Govt', roiAbove10L: 11.50, roiBelow10L: 12.50, minRoi: 11.50, maxRoi: 13.50, defaultRoi: 11.50 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, minSalary: 20000, ntcCap: 300000 },
    { tier: 'A', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, minSalary: 20000, ntcCap: 300000 },
    { tier: 'B', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, minSalary: 20000, ntcCap: 300000 },
    { tier: 'C', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, minSalary: 25000, thinCibilCap: 750000 },
    { tier: 'D', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, minSalary: 25000 },
    { tier: 'Govt', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, minSalary: 20000, ntcCap: 300000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 60, slab2Foir: 65, slab3Foir: 70, maxFoir: 75, multiplier: 24, multiplierAbove100k: 24, multiplier75kTo100k: 22, multiplier50kTo75k: 20, multiplierBelow50k: 18, ccObligation: 5 },
    { category: 'A', slab1Foir: 60, slab2Foir: 65, slab3Foir: 70, maxFoir: 75, multiplier: 24, multiplierAbove100k: 24, multiplier75kTo100k: 22, multiplier50kTo75k: 20, multiplierBelow50k: 18, ccObligation: 5 },
    { category: 'B', slab1Foir: 60, slab2Foir: 65, slab3Foir: 70, maxFoir: 75, multiplier: 24, multiplierAbove100k: 24, multiplier75kTo100k: 22, multiplier50kTo75k: 20, multiplierBelow50k: 18, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 18, multiplierAbove100k: 20, multiplier75kTo100k: 18, multiplier50kTo75k: 16, multiplierBelow50k: 15, ccObligation: 5 },
    { category: 'D', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 18, multiplierAbove100k: 20, multiplier75kTo100k: 18, multiplier50kTo75k: 16, multiplierBelow50k: 15, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 60, slab2Foir: 65, slab3Foir: 70, maxFoir: 75, multiplier: 24, multiplierAbove100k: 24, multiplier75kTo100k: 22, multiplier50kTo75k: 20, multiplierBelow50k: 18, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 57,
    retirementSalaried: 57,
    retirementGovt: 59,
    minSalary: 20000,
    minSalaryUnlisted: 25000,
    minSalaryNtc: 30000,
    minExperienceTotal: 12,
    minExperienceCurrent: 12,
    minCibilScore: 0,
    allowNtc: true,
    ntcCapping: 300000,
    bachelorCapping: 500000,
    ccObligationPercent: 5,
    allowCcBt: false, // ONLY PL BT
    allowPlBt: true
  }
};
