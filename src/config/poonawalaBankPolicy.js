// Exact Master Policy Configuration for POONAWALLA FINCORP from Excel (Sheet: POONAWALA)
export const POONAWALA_BANK_EXCEL_POLICY = {
  // Flag indicating Poonawalla is a pure FOIR-based institution with no multiplier restrictions
  isFoirOnly: true,

  // Rate Grids (Excel Sheet: POONAWALA — Effective 1st Aug 2026)
  rateGrids: {
    superCatCatAGovtRatna: [
      { slab: 'NTH up to 50K', min700: 15.00, min730: 14.74, min780: 13.75 },
      { slab: 'NTH >50K–75K', min700: 14.74, min730: 14.50, min780: 13.50 },
      { slab: 'NTH >75K', min700: 14.00, min730: 13.50, min780: 12.50 },
      { slab: 'NTH >100K & LA ≥ 20L', min700: 13.75, min730: 13.25, min780: 12.25 },
      { slab: 'NTH >100K & LA ≥ 35L', min700: 13.00, min730: 12.50, min780: 11.99 }
    ],
    govtCatBCatEduDefence: [
      { slab: 'NTH up to 50K', min700: 15.50, min730: 15.24, min750: 15.00, min780: 14.25 },
      { slab: 'NTH >50K–75K', min700: 15.24, min730: 15.00, min750: 14.75, min780: 14.00 },
      { slab: 'NTH >75K', min700: 15.00, min730: 14.75, min750: 14.50, min780: 13.75 },
      { slab: 'NTH >100K & LA ≥ 20L', min700: 14.75, min730: 14.50, min750: 14.25, min780: 13.50 },
      { slab: 'NTH >100K & LA ≥ 35L', min700: null, min730: null, min750: null, min780: null }
    ],
    categoryC: [
      { slab: '≤ 50K', min700: 16.00, min730: 15.75, min750: 15.50, min780: 15.24 },
      { slab: '>50K–75K', min700: 15.50, min730: 15.25, min750: 15.00, min780: 14.50 },
      { slab: '>75K', min700: 15.25, min730: 15.00, min750: 14.50, min780: 14.00 },
      { slab: '>100K & LA ≥ 20L', min700: 14.74, min730: 14.50, min750: 14.25, min780: 14.00 }
    ],
    categoryD: [
      { slab: '≤ 50K', min700: 17.24, min730: 16.24, min750: 15.75, min780: 15.50 },
      { slab: '>50K–75K', min700: 16.24, min730: 15.75, min750: 15.50, min780: 15.24 },
      { slab: '>75K', min700: 15.75, min730: 15.24, min750: 15.00, min780: 14.74 }
    ],
    categoryE: [
      { slab: '≤ 50K', min700: 19.75, min730: 18.74, min750: 18.50, min780: 18.25 },
      { slab: '>50K–75K', min700: 18.24, min730: 17.74, min750: 17.50, min780: 17.25 },
      { slab: '>75K', min700: 17.74, min730: 17.24, min750: 17.00, min780: 16.75 }
    ]
  },

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

  // Section 5 Rows 76-83: FOIR MATRIX (Pure FOIR Institution)
  foirMatrixSlabs: [
    { label: '30k-50k', minSalary: 30000, maxSalary: 50000, catA: 60, catB: 50, catC: 50, catD: 50, govt: 50 },
    { label: '>50k-75k', minSalary: 50001, maxSalary: 75000, catA: 65, catB: 60, catC: 55, catD: 55, govt: 60 },
    { label: '>75k-1.5 LAC', minSalary: 75001, maxSalary: 150000, catA: 70, catB: 65, catC: 55, catD: 55, govt: 65 },
    { label: '>1.5-2.5 L', minSalary: 150001, maxSalary: 250000, catA: 75, catB: 70, catC: 60, catD: 60, govt: 70 },
    { label: '>2.5 L', minSalary: 250001, maxSalary: Infinity, catA: 75, catB: 70, catC: 65, catD: 65, govt: 70 }
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
    minCibilScore: 700, // 700 MIN CIBIL
    allowNtcInTier1And2AndCatA: true, // 0,-1 ALLOWED IN TIER 1, 2 CITIES & CAT A CATEGORY
    ccObligationPercent: 5, // 5% OBLIGATE
    allowCcBt: true,
    maxBtCountTotal: 8, // Combination of 3 APP LOAN / 3 CC / 2 PL or OD
    maxAppLoanBt: 3,
    maxCcBt: 3,
    maxPlBt: 2,
    maxCreditCardsForBT: 6, // 6 CC BT ALLOW
    maxCcPosMultiplier: 4, // CC POS MORE THEN 4 TIME NOT ALLOW
    kccObligateCount: 1, // 1 KCC OBLIGATE
    goldLoanObligateCount: 1, // 1 GL OBLIGATE
    maxCibilEnquiriesIn90Days: 6,
    geoLimitKm: 80,
    mode: '100% DIGITAL PROCESS'
  }
};
