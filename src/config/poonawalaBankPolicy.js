// Exact Master Policy Configuration for POONAWALLA FINCORP from Excel (Sheet: POONAWALA)
export const POONAWALA_BANK_EXCEL_POLICY = {
  // Flag indicating Poonawalla is a pure FOIR-based institution with no multiplier restrictions
  isFoirOnly: true,

  // Section 4: ROI STRUCTURES AND SLABS (Rows 34-52)
  interestRates: [
    { category: 'Super A', roiAbove35L: 11.99, roiAbove20L: 12.25, roiAbove75kSal: 12.50, roi50kTo75kSal: 13.50, roiBelow50kSal: 13.75, minRoi: 11.99, maxRoi: 15.00, defaultRoi: 12.50 },
    { category: 'A', roiAbove35L: 11.99, roiAbove20L: 12.25, roiAbove75kSal: 12.50, roi50kTo75kSal: 13.50, roiBelow50kSal: 13.75, minRoi: 11.99, maxRoi: 15.00, defaultRoi: 12.50 },
    { category: 'B', roiAbove35L: 13.50, roiAbove20L: 13.50, roiAbove75kSal: 13.75, roi50kTo75kSal: 14.00, roiBelow50kSal: 14.25, minRoi: 13.50, maxRoi: 15.50, defaultRoi: 13.75 },
    { category: 'C', roiAbove35L: 14.00, roiAbove20L: 14.00, roiAbove75kSal: 14.00, roi50kTo75kSal: 14.50, roiBelow50kSal: 15.24, minRoi: 14.00, maxRoi: 16.00, defaultRoi: 14.50 },
    { category: 'D', roiAbove35L: 14.74, roiAbove20L: 14.74, roiAbove75kSal: 14.74, roi50kTo75kSal: 15.24, roiBelow50kSal: 15.50, minRoi: 14.74, maxRoi: 17.24, defaultRoi: 15.24 },
    { category: 'Govt', roiAbove35L: 11.99, roiAbove20L: 12.25, roiAbove75kSal: 12.50, roi50kTo75kSal: 13.50, roiBelow50kSal: 13.75, minRoi: 11.99, maxRoi: 15.00, defaultRoi: 12.50 }
  ],

  // Section 4 Rows 55-68: Additional ROI & PF Markups
  rateMarkups: {
    ntcScoreMarkup: 1.00, // CIBIL 0 & -1: +1.00% ROI (Min ROI 14.50%)
    ntcMinRoi: 14.50,
    btUpTo2CcAppLoan: 1.25, // CC/App loan BT up to 2: +1.25% (Min ROI 15.00%)
    btUpTo2MinRoi: 15.00,
    bt3To4CcAppLoan: 2.25, // CC/App loan BT 3 to 4: +2.25% (Min ROI 16.25%)
    bt3To4MinRoi: 16.25,
    btMoreThan4CcAppLoan: 3.35, // CC/App loan BT > 4: +3.35% (Min ROI 17.25%)
    btMoreThan4MinRoi: 17.25,
    foir6YearTenureMarkup: 0.25, // Eligibility as per 6-year FOIR: +0.25%
    foir7YearTenureMarkup: 0.50  // Eligibility as per 7-year FOIR: +0.50%
  },

  // Section 3 & Section 5 Rows 24-31 & 84-85: LOAN CAPPING CAT WISE (Min 1 LAC)
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 6000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'A', minLoan: 100000, maxLoan: 6000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'B', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'D', minLoan: 100000, maxLoan: 1000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 30000 }
  ],

  // Section 5 Rows 86-87: LOAN CAPPING CITY WISE
  cityLoanCapping: {
    'METRO': 6000000,
    'TIER 1': 5000000,
    'TIER 2': 4000000,
    'OTHERS': 2500000
  },

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
  // >50k-75k: CAT A 65%, CAT B/GOVT 60%, CAT C 55%, CAT D 55%
  // >75k-1.5 LAC: CAT A 70%, CAT B/GOVT 65%, CAT C 55%, CAT D 55%
  // >1.5-2.5 L: CAT A 75%, CAT B/GOVT 70%, CAT C 60%, CAT D 60%
  // >2.5 L: CAT A 75%, CAT B/GOVT 70%, CAT C 65%, CAT D 65%
  // 5% Deviation allowed in FOIR case to case basis
  foirMatrixSlabs: [
    { label: '30k-50k', minSalary: 30000, maxSalary: 50000, catA: 60, catB: 50, catC: 50, catD: 50, govt: 50 },
    { label: '>50k-75k', minSalary: 50001, maxSalary: 75000, catA: 65, catB: 60, catC: 55, catD: 55, govt: 60 },
    { label: '>75k-1.5 LAC', minSalary: 75001, maxSalary: 150000, catA: 70, catB: 65, catC: 55, catD: 55, govt: 65 },
    { label: '>1.5-2.5 L', minSalary: 150001, maxSalary: 250000, catA: 75, catB: 70, catC: 60, catD: 60, govt: 70 },
    { label: '>2.5 L', minSalary: 250001, maxSalary: Infinity, catA: 75, catB: 70, catC: 65, catD: 65, govt: 70 }
  ],

  // Excel Policy does not use multipliers for Poonawalla; kept for UI schema backwards compatibility
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, multiplier: null, ccObligation: 5 },
    { category: 'A', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, multiplier: null, ccObligation: 5 },
    { category: 'B', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplier: null, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 55, maxFoir: 65, multiplier: null, ccObligation: 5 },
    { category: 'D', slab1Foir: 50, slab2Foir: 55, maxFoir: 65, multiplier: null, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplier: null, ccObligation: 5 }
  ],

  // Rows 89-98 & Section 1: DEMOGRAPHIC AND ELIGIBILITY CRITERIA
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 30000, // Excel Row 89: MIN 30K
    minExperienceTotal: 24, // Excel Row 10: 2YEARS
    minExperienceCurrent: 12,
    minLoanAmount: 100000, // Excel Row 26: 1LAC
    minCibilScore: 700, // Excel Row 93: 700 MINIMUM (0, -1 allowed in Tier 1, 2 & Cat A)
    allowNtcInTier1And2AndCatA: true,
    ccObligationPercent: 5, // Excel Row 11: 5% OBLIGATE
    allowCcBt: true,
    maxBtCountTotal: 8, // Excel Row 96: MAX TOTAL 8 (3 APP LOAN / 3 CC / 2 PL or OD)
    maxAppLoanBt: 3,
    maxCcBt: 3,
    maxPlBt: 2,
    maxCreditCardsForBT: 6, // Excel Row 11: 6 CC BT ALLOW
    maxCcPosMultiplier: 4, // Excel Row 11: CC POS MORE THEN 4 TIME NOT ALLOW
    kccObligateCount: 1, // Excel Row 11: 1 KCC OBLIGATE
    goldLoanObligateCount: 1, // Excel Row 11: 1 GL OBLIGATE
    maxCibilEnquiriesIn90Days: 6, // Excel Row 97: MAX USL 6 IN 90 DAYS (9 with deviation)
    geoLimitKm: 80, // Excel Row 98: 80 KM FROM POONAWALLA PL BRANCH LOCATION
    mode: '100% DIGITAL PROCESS' // Excel Row 95: 100% DIGITAL PROCESS
  }
};
