// Exact Master Policy Configuration for POONAWALLA FINCORP from Excel (Sheet: POONAWALA)
export const POONAWALA_BANK_EXCEL_POLICY = {
  // Section 4: ROI STRUCTURES AND SLABS (Rows 34-52)
  interestRates: [
    { category: 'Super A', roiAbove35L: 11.99, roiAbove20L: 12.25, roiAbove75kSal: 12.50, roi50kTo75kSal: 13.50, roiBelow50kSal: 13.75, minRoi: 11.99, maxRoi: 15.00, defaultRoi: 12.50 },
    { category: 'A', roiAbove35L: 11.99, roiAbove20L: 12.25, roiAbove75kSal: 12.50, roi50kTo75kSal: 13.50, roiBelow50kSal: 13.75, minRoi: 11.99, maxRoi: 15.00, defaultRoi: 12.50 },
    { category: 'B', roiAbove35L: 13.50, roiAbove20L: 13.50, roiAbove75kSal: 13.75, roi50kTo75kSal: 14.00, roiBelow50kSal: 14.25, minRoi: 13.50, maxRoi: 15.50, defaultRoi: 13.75 },
    { category: 'C', roiAbove35L: 14.00, roiAbove20L: 14.00, roiAbove75kSal: 14.00, roi50kTo75kSal: 14.50, roiBelow50kSal: 15.24, minRoi: 14.00, maxRoi: 16.00, defaultRoi: 14.50 },
    { category: 'D', roiAbove35L: 14.74, roiAbove20L: 14.74, roiAbove75kSal: 14.74, roi50kTo75kSal: 15.24, roiBelow50kSal: 15.50, minRoi: 14.74, maxRoi: 17.24, defaultRoi: 15.24 },
    { category: 'Govt', roiAbove35L: 11.99, roiAbove20L: 12.25, roiAbove75kSal: 12.50, roi50kTo75kSal: 13.50, roiBelow50kSal: 13.75, minRoi: 11.99, maxRoi: 15.00, defaultRoi: 12.50 }
  ],

  // Section 5 Rows 84-85: LOAN CAPPING CAT WISE
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 6000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'A', minLoan: 100000, maxLoan: 6000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'B', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'D', minLoan: 100000, maxLoan: 1000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 30000 }
  ],

  // Section 2 & Row 91: TENURE
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' }
  ],

  // Section 5 Rows 76-83: FOIR MATRIX
  // 30k-50k: CAT A 60%, CAT B/GOVT 50%, CAT C 50%, CAT D 50%
  // 50k-75k: CAT A 65%, CAT B/GOVT 60%, CAT C 55%, CAT D 55%
  // 75k-1.5L: CAT A 70%, CAT B/GOVT 65%, CAT C 55%, CAT D 55%
  // 1.5L-2.5L: CAT A 75%, CAT B/GOVT 70%, CAT C 60%, CAT D 60%
  // >2.5L: CAT A 75%, CAT B/GOVT 70%, CAT C 65%, CAT D 65%
  // 5% Deviation allowed in FOIR case to case basis
  foirMatrixSlabs: [
    { label: '30k-50k', minSalary: 30000, maxSalary: 50000, catA: 60, catB: 50, catC: 50, catD: 50, govt: 50 },
    { label: '>50k-75k', minSalary: 50001, maxSalary: 75000, catA: 65, catB: 60, catC: 55, catD: 55, govt: 60 },
    { label: '>75k-1.5 LAC', minSalary: 75001, maxSalary: 150000, catA: 70, catB: 65, catC: 55, catD: 55, govt: 65 },
    { label: '>1.5-2.5 L', minSalary: 150001, maxSalary: 250000, catA: 75, catB: 70, catC: 60, catD: 60, govt: 70 },
    { label: '>2.5 L', minSalary: 250001, maxSalary: Infinity, catA: 75, catB: 70, catC: 65, catD: 65, govt: 70 }
  ],

  foirMultiplier: [
    { category: 'Super A', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, multiplier: 28, ccObligation: 5 },
    { category: 'A', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, multiplier: 28, ccObligation: 5 },
    { category: 'B', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplier: 24, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 55, maxFoir: 65, multiplier: 20, ccObligation: 5 },
    { category: 'D', slab1Foir: 50, slab2Foir: 55, maxFoir: 65, multiplier: 16, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplier: 24, ccObligation: 5 }
  ],

  // Rows 89-98: DEMOGRAPHIC AND ELIGIBILITY CRITERIA
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 30000, // Excel Row 89: MIN 30K
    minExperienceTotal: 24,
    minExperienceCurrent: 12,
    minCibilScore: 700, // Excel Row 93: 700 MINIMUM (0, -1 allowed in Tier 1, 2 & Cat A)
    allowNtcInTier1And2: true,
    ccObligationPercent: 5,
    allowCcBt: true,
    maxBtCountTotal: 8, // Row 96: MAX TOTAL 8 (3 APP LOAN / 3 CC / 2 PL or OD)
    maxAppLoanBt: 3,
    maxCcBt: 3,
    maxPlBt: 2,
    maxCibilEnquiriesIn90Days: 6 // Row 97: MAX USL 6 IN 90 DAYS (9 with deviation)
  }
};
