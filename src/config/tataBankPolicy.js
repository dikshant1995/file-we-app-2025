// Exact Master Policy Configuration for TATA CAPITAL from Excel (Sheet: TATA)
export const TATA_BANK_EXCEL_POLICY = {
  // Section 2: ROI STRUCTURES AND SLABS (10.99% to 22%)
  interestRates: [
    { category: 'Super A', roiAbove50L: 10.99, roiAbove20L: 12.00, roiBelow20L: 14.00, minRoi: 10.99, maxRoi: 14.00, defaultRoi: 12.00 },
    { category: 'A', roiAbove50L: 10.99, roiAbove20L: 12.00, roiBelow20L: 14.00, minRoi: 10.99, maxRoi: 14.00, defaultRoi: 12.00 },
    { category: 'B', roiAbove50L: 10.99, roiAbove20L: 12.00, roiBelow20L: 14.00, minRoi: 10.99, maxRoi: 14.00, defaultRoi: 12.00, notes: '≥ 40 LAC: 10.99%' },
    { category: 'C', roiAbove50L: 12.00, roiAbove20L: 13.00, roiBelow20L: 15.00, minRoi: 12.00, maxRoi: 15.00, defaultRoi: 13.00, notes: '≥ 30 LAC: 12.00%' },
    { category: 'D', roiAbove50L: 13.50, roiAbove20L: 13.50, roiBelow20L: 16.00, minRoi: 13.50, maxRoi: 16.00, defaultRoi: 14.00 },
    { category: 'Govt', roiAbove50L: 10.99, roiAbove20L: 12.00, roiBelow20L: 14.00, minRoi: 10.99, maxRoi: 14.00, defaultRoi: 12.00 }
  ],

  // Section 5: MINIMUM LOAN AMOUNT AND MAX LOAN AMOUNT (Min 75k)
  loanCapping: [
    { tier: 'Super A', minLoan: 75000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 75000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 75000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 75000, maxLoan: 2500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 75000, maxLoan: 1000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'Govt', minLoan: 75000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 }
  ],

  // Section 4: TENURE AND REPAYMENT WINDOWS (Min 24 Months)
  tenureRules: [
    { category: 'Super A', minMonths: 24, maxMonths: 84, description: 'Min 24 Months, up to 84-96 Months' },
    { category: 'A', minMonths: 24, maxMonths: 84, description: 'Min 24 Months, up to 84-96 Months' },
    { category: 'B', minMonths: 24, maxMonths: 84, description: 'Income > ₹75k: 84 Months, else 72 Months' },
    { category: 'C', minMonths: 24, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'D', minMonths: 24, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'Govt', minMonths: 24, maxMonths: 84, description: 'Min 24 Months, up to 84-96 Months' }
  ],

  // Section 3: FOIR BAND BY SALARY (Rows 56-60)
  salaryFoirSlabs: [
    { label: '<= 25K', minSalary: 0, maxSalary: 25000, maxFoir: 50, maxUnsecuredFoir: 40 },
    { label: '25K TO 50K', minSalary: 25001, maxSalary: 50000, maxFoir: 60, maxUnsecuredFoir: 50 },
    { label: '50K TO 75K', minSalary: 50001, maxSalary: 75000, maxFoir: 65, maxUnsecuredFoir: 55 },
    { label: '> 75K', minSalary: 75001, maxSalary: Infinity, maxFoir: 75, maxUnsecuredFoir: 65 }
  ],

  // Section 3: MULTIPLIER BY CATEGORY & SALARY (Rows 24-31)
  // Super A / A / Govt: >75k: 27x, 50k-75k: 23.5x, <50k: 20x
  // Cat B: >75k: 25x, 50k-75k: 22x, <50k: 19x
  // Cat C: >75k: 18x, 50k-75k: 18x, <50k: 15x
  // Unlisted / D: >75k: 15x, 50k-75k: 15x, <50k: 9x
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, multiplierAbove75k: 27, multiplier50kTo75k: 23.5, multiplierBelow50k: 20, multiplier: 27, ccObligation: 5 },
    { category: 'A', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, multiplierAbove75k: 27, multiplier50kTo75k: 23.5, multiplierBelow50k: 20, multiplier: 27, ccObligation: 5 },
    { category: 'B', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, multiplierAbove75k: 25, multiplier50kTo75k: 22, multiplierBelow50k: 19, multiplier: 25, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 55, maxFoir: 65, multiplierAbove75k: 18, multiplier50kTo75k: 18, multiplierBelow50k: 15, multiplier: 18, ccObligation: 5 },
    { category: 'D', slab1Foir: 40, slab2Foir: 50, maxFoir: 60, multiplierAbove75k: 15, multiplier50kTo75k: 15, multiplierBelow50k: 9, multiplier: 15, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, multiplierAbove75k: 27, multiplier50kTo75k: 23.5, multiplierBelow50k: 20, multiplier: 27, ccObligation: 5 }
  ],

  // Section 1: DEMOGRAPHIC AND AGE ELIGIBILITY CRITERIA
  demographics: {
    minAge: 21,
    maxAgePvt: 58,
    maxAgeGovt: 60,
    maxAge: 58,
    retirementSalaried: 58,
    retirementGovt: 60,
    minSalary: 25000, // Excel Row 9: 25k
    minExperienceTotal: 12,
    minExperienceCurrent: 12,
    minCibilScore: 0,
    minLoanAmount: 75000, // Excel Row 45: 75K
    minTenureMonths: 24, // Excel Row 35: 24 MONTHS
    ccObligationPercent: 5, // Excel Row 11: 5% OBLIGATE
    allowCcBt: true,
    ccBtAllowedCount: 5, // Excel Row 11: Max 5 Credit card BT allowed
    stabilityWaiverRule: 'Current stability waived if age >=26, CIBIL >750, salary >50k, and 2-year-old loan tradeline >2L'
  }
};

