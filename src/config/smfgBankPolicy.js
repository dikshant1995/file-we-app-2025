// Exact Master Policy Configuration for SMFG INDIA CREDIT from Excel
export const SMFG_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove100k: 17.00, roi75kTo100k: 18.50, roi50kTo75k: 18.50, roi40kTo50k: 19.00, roi35kTo40k: 19.50, roi30kTo35k: 21.50, roi25kTo30k: 23.00, minRoi: 17.00, maxRoi: 23.00, defaultRoi: 18.50 },
    { category: 'A', roiAbove100k: 17.00, roi75kTo100k: 18.50, roi50kTo75k: 18.50, roi40kTo50k: 19.00, roi35kTo40k: 19.50, roi30kTo35k: 21.50, roi25kTo30k: 23.00, minRoi: 17.00, maxRoi: 23.00, defaultRoi: 18.50 },
    { category: 'B', roiAbove100k: 17.00, roi75kTo100k: 18.50, roi50kTo75k: 18.50, roi40kTo50k: 20.00, roi35kTo40k: 21.00, roi30kTo35k: 22.00, roi25kTo30k: 24.00, minRoi: 17.00, maxRoi: 24.00, defaultRoi: 19.50 },
    { category: 'C', roiAbove100k: 19.00, roi75kTo100k: 19.50, roi50kTo75k: 21.50, roi40kTo50k: 21.50, roi35kTo40k: 23.00, roi30kTo35k: 23.50, roi25kTo30k: 25.00, minRoi: 19.00, maxRoi: 25.00, defaultRoi: 21.50 },
    { category: 'D', roiAbove100k: 20.00, roi75kTo100k: 20.00, roi50kTo75k: 22.00, roi40kTo50k: 24.00, roi35kTo40k: 24.00, roi30kTo35k: 25.00, roi25kTo30k: 28.00, minRoi: 20.00, maxRoi: 28.00, defaultRoi: 23.00 },
    { category: 'Govt', roiAbove100k: 17.00, roi75kTo100k: 18.50, roi50kTo75k: 18.50, roi40kTo50k: 19.00, roi35kTo40k: 19.50, roi30kTo35k: 21.50, roi25kTo30k: 23.00, minRoi: 17.00, maxRoi: 23.00, defaultRoi: 18.50 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 3500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 1500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 25000 }
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
    { category: 'Super A', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 30, ccObligation: 5 },
    { category: 'A', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 28, ccObligation: 5 },
    { category: 'B', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 25, ccObligation: 5 },
    { category: 'C', slab1Foir: 55, slab2Foir: 60, maxFoir: 65, multiplier: 20, ccObligation: 5 },
    { category: 'D', slab1Foir: 50, slab2Foir: 55, maxFoir: 60, multiplier: 16, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 28, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    maxAgeGovtPensioner: 65,
    retirementSalaried: 60,
    retirementGovt: 65,
    minSalary: 25000,
    minExperienceTotal: 24,
    minExperienceCurrent: 24,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: true,
    ccBtAllowedCount: 2
  }
};
