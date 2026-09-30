// Exact Master Policy Configuration for TATA CAPITAL from Excel & Policy Updates
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

  // Section 5: MINIMUM LOAN AMOUNT AND MAX LOAN CAPPING
  loanCapping: [
    { tier: 'Super A', minLoan: 75000, maxLoan: 5000000, minTenureMonths: 24, maxTenureMonths: 96, tenureDescription: 'TGE / Super CATA / CAT A / CAT G Not Applicable 84 months & 96 months', minSalary: 25000 },
    { tier: 'A', minLoan: 75000, maxLoan: 5000000, minTenureMonths: 24, maxTenureMonths: 96, tenureDescription: 'TGE / Super CATA / CAT A / CAT G Not Applicable 84 months & 96 months', minSalary: 25000 },
    { tier: 'B', minLoan: 75000, maxLoan: 2500000, minTenureMonths: 24, maxTenureMonths: 84, tenureDescription: 'CAT B Income > ₹75,000 84 months (else 72 months)', minSalary: 25000 },
    { tier: 'C', minLoan: 75000, maxLoan: 2500000, minTenureMonths: 24, maxTenureMonths: 60, tenureDescription: 'CAT C / Unlisted Not Applicable 60 months', minSalary: 25000 },
    { tier: 'D', minLoan: 75000, maxLoan: 1000000, minTenureMonths: 24, maxTenureMonths: 60, tenureDescription: 'CAT C / Unlisted Not Applicable 60 months', minSalary: 25000 },
    { tier: 'Govt', minLoan: 75000, maxLoan: 5000000, minTenureMonths: 24, maxTenureMonths: 96, tenureDescription: 'TGE / Super CATA / CAT A / CAT G Not Applicable 84 months & 96 months', minSalary: 25000 }
  ],

  // Section 4: TENURE AND REPAYMENT WINDOWS (Screenshot 1)
  tenureRules: [
    { category: 'Super A', minMonths: 24, maxMonths: 96, description: 'TGE / Super CATA / CAT A / CAT G Not Applicable 84 months & 96 months' },
    { category: 'A', minMonths: 24, maxMonths: 96, description: 'TGE / Super CATA / CAT A / CAT G Not Applicable 84 months & 96 months' },
    { category: 'B', minMonths: 24, maxMonths: 84, description: 'CAT B Income > ₹75,000 84 months (else 72 months)' },
    { category: 'C', minMonths: 24, maxMonths: 60, description: 'CAT C / Unlisted Not Applicable 60 months' },
    { category: 'D', minMonths: 24, maxMonths: 60, description: 'CAT C / Unlisted Not Applicable 60 months' },
    { category: 'Govt', minMonths: 24, maxMonths: 96, description: 'TGE / Super CATA / CAT A / CAT G Not Applicable 84 months & 96 months' }
  ],

  // Section 3A: FOIR BAND BY SALARY SLAB ONLY (Screenshot 3)
  salaryFoirSlabs: [
    { label: '<= 25K', minSalary: 0, maxSalary: 25000, maxFoir: 50, maxUnsecuredFoir: 40, ccObligation: 5 },
    { label: '25K TO 50K', minSalary: 25001, maxSalary: 50000, maxFoir: 60, maxUnsecuredFoir: 50, ccObligation: 5 },
    { label: '50K TO 75K', minSalary: 50001, maxSalary: 75000, maxFoir: 65, maxUnsecuredFoir: 55, ccObligation: 5 },
    { label: '> 75K', minSalary: 75001, maxSalary: Infinity, maxFoir: 75, maxUnsecuredFoir: 65, ccObligation: 5 }
  ],

  // Section 3B: MULTIPLIER BY CATEGORY AND SALARY SLAB (Screenshot 2)
  categoryMultiplierSlabs: [
    { category: 'Super A', multiplierAbove75k: 27, multiplier50kTo75k: 23.5, multiplierBelow50k: 20, multiplierDescription: '75K+: 27x, 50K-75K: 23-24x, <50K: 20x' },
    { category: 'A', multiplierAbove75k: 27, multiplier50kTo75k: 23.5, multiplierBelow50k: 20, multiplierDescription: '75K+: 27x, 50K-75K: 23-24x, <50K: 20x' },
    { category: 'B', multiplierAbove75k: 25, multiplier50kTo75k: 22, multiplierBelow50k: 19, multiplierDescription: '75K+: 25x, 50K-75K: 22x, <50K: 19x' },
    { category: 'C', multiplierAbove75k: 18, multiplier50kTo75k: 18, multiplierBelow50k: 15, multiplierDescription: '75K+: 18x, 50K-75K: 18x, <50K: 15x' },
    { category: 'Unlisted / D', multiplierAbove75k: 15, multiplier50kTo75k: 15, multiplierBelow50k: 9, multiplierDescription: '75K+: 15x, 50K-75K: 15x, <50K: 9x' },
    { category: 'Govt', multiplierAbove75k: 27, multiplier50kTo75k: 23.5, multiplierBelow50k: 20, multiplierDescription: '75K+: 27x, 50K-75K: 23-24x, <50K: 20x' }
  ],

  // Combined reference array for backwards compatibility
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
    minExperienceCurrent: 12, // Current employment Stability: Minimum 12 months
    stabilityWaiverRule: 'For applicants with Age >= 26 years, CIBIL > 750, Net Income > ₹50,000, and any tradeline (Live/Closed) in individual capacity with Loan Amount > ₹2 Lacs opened > 2 years ago, documented proof of 1-year current stability is not required.',
    stabilityWaiverConditions: {
      minAge: 26,
      minCibilScore: 750,
      minIncome: 50000,
      minTradelineAmount: 200000,
      minTradelineAgeYears: 2
    },
    minCibilScore: 0,
    minLoanAmount: 75000, // Excel Row 45: 75K
    minTenureMonths: 24, // Excel Row 35: 24 MONTHS
    ccObligationPercent: 5, // 5% CC OBLIGATE
    allowCcBt: true,
    ccBtAllowedCount: 5 // Max 5 Credit card BT allowed
  }
};

