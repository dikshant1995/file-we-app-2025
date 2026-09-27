// Exact Master Policy Configuration for POONAWALLA FINCORP from Excel
export const POONAWALA_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove35L: 11.99, roiAbove20L: 12.25, roiAbove75kSal: 12.50, roi50kTo75kSal: 13.50, roiBelow50kSal: 13.75, minRoi: 11.99, maxRoi: 15.00, defaultRoi: 12.50 },
    { category: 'A', roiAbove35L: 11.99, roiAbove20L: 12.25, roiAbove75kSal: 12.50, roi50kTo75kSal: 13.50, roiBelow50kSal: 13.75, minRoi: 11.99, maxRoi: 15.00, defaultRoi: 12.50 },
    { category: 'B', roiAbove35L: 13.50, roiAbove20L: 13.50, roiAbove75kSal: 13.75, roi50kTo75kSal: 14.00, roiBelow50kSal: 14.25, minRoi: 13.50, maxRoi: 15.50, defaultRoi: 13.75 },
    { category: 'C', roiAbove35L: 14.50, roiAbove20L: 14.50, roiAbove75kSal: 14.75, roi50kTo75kSal: 15.00, roiBelow50kSal: 15.50, minRoi: 14.50, maxRoi: 16.00, defaultRoi: 14.75 },
    { category: 'D', roiAbove35L: 15.00, roiAbove20L: 15.00, roiAbove75kSal: 15.25, roi50kTo75kSal: 15.50, roiBelow50kSal: 16.00, minRoi: 15.00, maxRoi: 16.50, defaultRoi: 15.50 },
    { category: 'Govt', roiAbove35L: 11.99, roiAbove20L: 12.25, roiAbove75kSal: 12.50, roi50kTo75kSal: 13.50, roiBelow50kSal: 13.75, minRoi: 11.99, maxRoi: 15.00, defaultRoi: 12.50 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 6000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'A', minLoan: 100000, maxLoan: 6000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'B', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'D', minLoan: 100000, maxLoan: 1000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 30000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 28, ccObligation: 5 },
    { category: 'A', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 28, ccObligation: 5 },
    { category: 'B', slab1Foir: 55, slab2Foir: 60, maxFoir: 65, multiplier: 24, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 55, maxFoir: 60, multiplier: 20, ccObligation: 5 },
    { category: 'D', slab1Foir: 45, slab2Foir: 50, maxFoir: 55, multiplier: 16, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 28, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 30000,
    minExperienceTotal: 24,
    minExperienceCurrent: 12,
    minCibilScore: 700,
    ccObligationPercent: 5,
    allowCcBt: true,
    ccBtAllowedCount: 6,
    maxCcPosMultiplier: 4 // CC POS > 4x salary not allowed
  }
};
