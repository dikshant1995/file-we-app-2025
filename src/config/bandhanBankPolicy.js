// Exact Master Policy Configuration for BANDHAN BANK from Excel (BANKS POLICYS.xlsx - Sheet: BANDHAN BANK)
export const BANDHAN_BANK_EXCEL_POLICY = {
  // Section 5: ROI STRUCTURES AND SLABS (By Category, Salary Tier & CIBIL/QC Score)
  interestRates: [
    {
      category: 'Super A',
      roiAbove50k_750: 12.15,
      roiAbove50k_700: 12.25,
      roiAbove50k_650: 13.49,
      roi25kTo50k_750: 13.25,
      roi25kTo50k_700: 13.99,
      roi25kTo50k_650: 14.99,
      roiBelow25k_750: 13.99,
      roiBelow25k_700: 14.99,
      roiBelow25k_650: 15.49,
      minRoi: 12.15,
      defaultRoi: 12.25,
      maxRoi: 15.49,
      minSalary: 25000
    },
    {
      category: 'A',
      roiAbove50k_750: 12.15,
      roiAbove50k_700: 12.25,
      roiAbove50k_650: 13.49,
      roi25kTo50k_750: 13.25,
      roi25kTo50k_700: 13.99,
      roi25kTo50k_650: 14.99,
      roiBelow25k_750: 13.99,
      roiBelow25k_700: 14.99,
      roiBelow25k_650: 15.49,
      minRoi: 12.15,
      defaultRoi: 12.25,
      maxRoi: 15.49,
      minSalary: 25000
    },
    {
      category: 'B',
      roiAbove50k_750: 12.25,
      roiAbove50k_700: 12.49,
      roiAbove50k_650: 14.49,
      roi25kTo50k_750: 13.49,
      roi25kTo50k_700: 14.49,
      roi25kTo50k_650: 15.99,
      roiBelow25k_750: 14.25,
      roiBelow25k_700: 14.99,
      roiBelow25k_650: 15.99,
      minRoi: 12.25,
      defaultRoi: 13.49,
      maxRoi: 15.99,
      minSalary: 25000
    },
    {
      category: 'C',
      roiAbove50k_750: 13.49,
      roiAbove50k_700: 14.49,
      roiAbove50k_650: 15.99,
      roi25kTo50k_750: 14.49,
      roi25kTo50k_700: 15.99,
      roi25kTo50k_650: 16.49,
      roiBelow25k_750: 15.99,
      roiBelow25k_700: 16.49,
      roiBelow25k_650: 16.90,
      minRoi: 13.49,
      defaultRoi: 14.49,
      maxRoi: 16.90,
      minSalary: 25000
    },
    {
      category: 'D',
      roiAbove50k_750: 13.69,
      roiAbove50k_700: 14.49,
      roiAbove50k_650: 16.00,
      roi25kTo50k_750: 15.49,
      roi25kTo50k_700: 15.99,
      roi25kTo50k_650: 16.90,
      roiBelow25k_750: 16.49,
      roiBelow25k_700: 16.90,
      roiBelow25k_650: 16.90,
      minRoi: 13.69,
      defaultRoi: 15.49,
      maxRoi: 16.90,
      minSalary: 40000
    },
    {
      category: 'Govt',
      roiAbove50k_750: 12.15,
      roiAbove50k_700: 12.25,
      roiAbove50k_650: 13.49,
      roi25kTo50k_750: 13.25,
      roi25kTo50k_700: 13.99,
      roi25kTo50k_650: 14.99,
      roiBelow25k_750: 13.99,
      roiBelow25k_700: 14.99,
      roiBelow25k_650: 15.49,
      minRoi: 12.15,
      defaultRoi: 12.25,
      maxRoi: 15.49,
      minSalary: 25000
    }
  ],

  // Section 4: MINIMUM LOAN AMOUNT AND MAX LOAN AMOUNT (Flat ₹25 Lakhs sanction limit)
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 40000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 }
  ],

  // Section 3: TENURE AND REPAYMENT WINDOWS (Rate waiver not allow, 12M to 60M; Cat D: max 48M)
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Rate waiver not allow)' },
    { category: 'A', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Rate waiver not allow)' },
    { category: 'B', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Rate waiver not allow)' },
    { category: 'C', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (<=50k Salary max 48M)' },
    { category: 'D', minMonths: 12, maxMonths: 48, description: '12 to 48 Months (Strictly max 48M in Section 6)' },
    { category: 'Govt', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Rate waiver not allow)' }
  ],

  // Section 2: FOIR by Monthly Net Income Range
  salaryFoirSlabs: [
    { incomeSlab: '<= 30000', foir: 50, note: '50% FOIR' },
    { incomeSlab: '30001 to 50000', foir: 60, note: '60% FOIR' },
    { incomeSlab: '50001 to 75000', foir: 65, note: '65% FOIR' },
    { incomeSlab: '>= 75001', foir: 70, note: '70% FOIR' }
  ],

  // Category Level FOIR Fallbacks (Tab 4 table compatibility)
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 25, ccObligation: 3 },
    { category: 'A', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 25, ccObligation: 3 },
    { category: 'B', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 24, ccObligation: 3 },
    { category: 'C', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 22, ccObligation: 3 },
    { category: 'D', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 60, multiplier: 18, ccObligation: 3 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplier: 25, ccObligation: 3 }
  ],

  // Section 6: Multiplier based Eligibility Matrix (Exact values from Excel)
  multiplierMatrix: {
    'AB_GOVT': {
      '<=30000': { '12m': 6, '24m': 10, '36m': 14, '48m': 17, '60m': 20 },
      '30001-50000': { '12m': 7, '24m': 13, '36m': 15, '48m': 21, '60m': 22 },
      '50001-75000': { '12m': 8, '24m': 13, '36m': 16, '48m': 22, '60m': 24 },
      '>75000': { '12m': 9, '24m': 14, '36m': 18, '48m': 23, '60m': 25 }
    },
    'C': {
      '<=30000': { '12m': 5, '24m': 7, '36m': 10, '48m': 12, '60m': null },
      '30001-50000': { '12m': 7, '24m': 9, '36m': 12, '48m': 14, '60m': null },
      '50001-75000': { '12m': 7, '24m': 10, '36m': 16, '48m': 17, '60m': 18 },
      '>75000': { '12m': 9, '24m': 11, '36m': 17, '48m': 18, '60m': 22 }
    },
    'D': {
      '<=30000': { '12m': 5, '24m': 7, '36m': 10, '48m': 12, '60m': null },
      '30001-50000': { '12m': 7, '24m': 9, '36m': 12, '48m': 14, '60m': null },
      '50001-75000': { '12m': 7, '24m': 10, '36m': 16, '48m': 17, '60m': null },
      '>75000': { '12m': 9, '24m': 11, '36m': 17, '48m': 18, '60m': null }
    }
  },

  // Section 1: DEMOGRAPHIC AND AGE ELIGIBILITY CRITERIA
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minSalaryCatD: 40000,
    minExperienceTotal: 12, // OVERALL 1YEARS
    minExperienceCurrent: 1, // 1 MONTHS CURRENT COM
    minCibilScore: 650,
    ccObligationPercent: 3, // 3% OBLIGATE
    ccExemptionThresholdMultiplier: 3, // SALARY KA BELOW 3 TIME NO OBLIGATION
    exemptGlAndKcc: true, // GL AND KCC NOT OBLIGATE
    allowCcBt: false,
    ccBtAllowedCount: 0
  }
};
