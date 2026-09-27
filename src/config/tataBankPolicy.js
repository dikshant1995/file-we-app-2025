// Exact Master Policy Configuration for TATA CAPITAL from Excel
export const TATA_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove50L: 10.99, roiAbove20L: 12.00, roiBelow20L: 14.00, minRoi: 10.99, maxRoi: 14.00, defaultRoi: 12.00 },
    { category: 'A', roiAbove50L: 10.99, roiAbove20L: 12.00, roiBelow20L: 14.00, minRoi: 10.99, maxRoi: 14.00, defaultRoi: 12.00 },
    { category: 'B', roiAbove50L: 11.50, roiAbove20L: 12.00, roiBelow20L: 14.00, minRoi: 11.50, maxRoi: 14.00, defaultRoi: 12.00 },
    { category: 'C', roiAbove50L: 12.50, roiAbove20L: 13.00, roiBelow20L: 15.00, minRoi: 12.50, maxRoi: 15.00, defaultRoi: 13.00 },
    { category: 'D', roiAbove50L: 13.50, roiAbove20L: 14.00, roiBelow20L: 16.00, minRoi: 13.50, maxRoi: 16.00, defaultRoi: 14.00 },
    { category: 'Govt', roiAbove50L: 10.99, roiAbove20L: 12.00, roiBelow20L: 14.00, minRoi: 10.99, maxRoi: 14.00, defaultRoi: 12.00 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 1500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 24, maxMonths: 84, description: 'Up to 7-8 Years (84-96 Months)' },
    { category: 'A', minMonths: 24, maxMonths: 84, description: 'Up to 7-8 Years (84-96 Months)' },
    { category: 'B', minMonths: 24, maxMonths: 84, description: 'Income > ₹75k: 84 Months, else 72 Months' },
    { category: 'C', minMonths: 24, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'D', minMonths: 24, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'Govt', minMonths: 24, maxMonths: 84, description: 'Up to 7-8 Years (84-96 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 55, slab2Foir: 65, maxFoir: 70, multiplier: 27, multiplierAbove75k: 27, multiplier50kTo75k: 24, multiplierBelow50k: 20, ccObligation: 5 },
    { category: 'A', slab1Foir: 55, slab2Foir: 65, maxFoir: 70, multiplier: 27, multiplierAbove75k: 27, multiplier50kTo75k: 24, multiplierBelow50k: 20, ccObligation: 5 },
    { category: 'B', slab1Foir: 50, slab2Foir: 60, maxFoir: 65, multiplier: 25, multiplierAbove75k: 25, multiplier50kTo75k: 22, multiplierBelow50k: 19, ccObligation: 5 },
    { category: 'C', slab1Foir: 45, slab2Foir: 50, maxFoir: 55, multiplier: 18, multiplierAbove75k: 18, multiplier50kTo75k: 18, multiplierBelow50k: 15, ccObligation: 5 },
    { category: 'D', slab1Foir: 40, slab2Foir: 45, maxFoir: 50, multiplier: 15, multiplierAbove75k: 15, multiplier50kTo75k: 15, multiplierBelow50k: 9, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 55, slab2Foir: 65, maxFoir: 70, multiplier: 27, multiplierAbove75k: 27, multiplier50kTo75k: 24, multiplierBelow50k: 20, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 58,
    retirementSalaried: 58,
    retirementGovt: 60,
    minSalary: 25000,
    minExperienceTotal: 12,
    minExperienceCurrent: 12,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: true,
    ccBtAllowedCount: 5
  }
};
