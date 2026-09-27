// Exact Master Policy Configuration for BAJAJ FINANCE LTD from Excel (Sheet: BAJAJ)
export const BAJAJ_BANK_EXCEL_POLICY = {
  // Section 2: ROI STRUCTURES AND SLABS
  // Super A, A, B, C, Govt: 10L ABOVE: 10%, 1 TO 12 LAC (SAL LITE PROGRAM): 16%, Case calculation: 14%
  interestRates: [
    { category: 'Super A', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00, note: 'Case calculation 14% / Day offer ROI' },
    { category: 'A', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00, note: 'Case calculation 14% / Day offer ROI' },
    { category: 'B', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00, note: 'Case calculation 14% / Day offer ROI' },
    { category: 'C', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00, note: 'Case calculation 14% / Day offer ROI' },
    { category: 'D', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00, note: 'Case calculation 14% / Day offer ROI' },
    { category: 'Govt', roiAbove10L: 10.00, roi1Lto12L: 16.00, minRoi: 10.00, maxRoi: 16.00, defaultRoi: 14.00, note: 'Case calculation 14% / Day offer ROI' }
  ],

  // Section 5: MINIMUM LOAN AMOUNT AND MAX LOAN AMOUNT
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, unlistedMaxLoan: 2800000, salLiteMaxLoan: 1400000, bachelorCap: null, minSalary: 27000 },
    { tier: 'A', minLoan: 100000, maxLoan: 5000000, unlistedMaxLoan: 2800000, salLiteMaxLoan: 1400000, bachelorCap: null, minSalary: 27000 },
    { tier: 'B', minLoan: 100000, maxLoan: 5000000, unlistedMaxLoan: 2800000, salLiteMaxLoan: 1400000, bachelorCap: null, minSalary: 27000 },
    { tier: 'C', minLoan: 100000, maxLoan: 5000000, unlistedMaxLoan: 2800000, salLiteMaxLoan: 1400000, bachelorCap: null, minSalary: 30000 },
    { tier: 'D', minLoan: 100000, maxLoan: 5000000, unlistedMaxLoan: 2800000, salLiteMaxLoan: 1400000, bachelorCap: null, minSalary: 30000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, unlistedMaxLoan: 2800000, salLiteMaxLoan: 1400000, bachelorCap: null, minSalary: 27000 }
  ],

  // Section 4: TENURE AND REPAYMENT WINDOWS
  // 12 to 96 Months across tiers; 108 Months for ₹1L+ salary (Excel Row 38)
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 96, maxMonthsHighIncome: 108, description: '12 to 96 Months (108 Months for ₹1L+ Salary)' },
    { category: 'A', minMonths: 12, maxMonths: 96, maxMonthsHighIncome: 108, description: '12 to 96 Months (108 Months for ₹1L+ Salary)' },
    { category: 'B', minMonths: 12, maxMonths: 96, maxMonthsHighIncome: 108, description: '12 to 96 Months (108 Months for ₹1L+ Salary)' },
    { category: 'C', minMonths: 12, maxMonths: 96, maxMonthsHighIncome: 108, description: '12 to 96 Months (108 Months for ₹1L+ Salary)' },
    { category: 'D', minMonths: 12, maxMonths: 96, maxMonthsHighIncome: 108, description: '12 to 96 Months (108 Months for ₹1L+ Salary)' },
    { category: 'Govt', minMonths: 12, maxMonths: 96, maxMonthsHighIncome: 108, description: '12 to 96 Months (108 Months for ₹1L+ Salary)' }
  ],

  // Section 3: FOIR & Section 6: MULTIPLIER
  // FOIR: <50k: 60% + HL running 10% extra, >=50k: 65% + HL running 5% extra (Max FOIR 75% case to case)
  // Multipliers by Company Grade (Super Green/Green/Ambar/Red/Dark Red):
  // Super Green: <50k: 18x, 50k-75k: 20x, 75k-2L: 22x, >2L: 24x
  // Green (Cat A/Govt): <50k: 16x, 50k-75k: 16x, 75k-2L: 22x, >2L: 24x
  // Ambar (Cat B): <50k: 12x, 50k-75k: 12x, 75k-2L: 16x, >2L: 16x
  // Red (Cat C): <50k: 10x, 50k-75k: 10x, 75k-2L: 10x, >2L: 10x
  // Dark Red (Cat D/Unlisted): Listed 14x and Unlisted 12x
  foirMultiplier: [
    { category: 'Super A', grade: 'SUPER GREEN', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, hlBonusSlab1: 10, hlBonusSlab2: 5, multBelow50k: 18, mult50kTo75k: 20, mult75kTo2L: 22, multAbove2L: 24, multiplier: 24, ccObligation: 5 },
    { category: 'A', grade: 'GREEN', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, hlBonusSlab1: 10, hlBonusSlab2: 5, multBelow50k: 16, mult50kTo75k: 16, mult75kTo2L: 22, multAbove2L: 24, multiplier: 24, ccObligation: 5 },
    { category: 'B', grade: 'AMBAR', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, hlBonusSlab1: 10, hlBonusSlab2: 5, multBelow50k: 12, mult50kTo75k: 12, mult75kTo2L: 16, multAbove2L: 16, multiplier: 16, ccObligation: 5 },
    { category: 'C', grade: 'RED', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, hlBonusSlab1: 10, hlBonusSlab2: 5, multBelow50k: 10, mult50kTo75k: 10, mult75kTo2L: 10, multAbove2L: 10, multiplier: 10, ccObligation: 5 },
    { category: 'D', grade: 'DARK RED', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, hlBonusSlab1: 10, hlBonusSlab2: 5, multBelow50k: 14, mult50kTo75k: 14, mult75kTo2L: 14, multAbove2L: 14, multListed: 14, multUnlisted: 12, multiplier: 14, ccObligation: 5 },
    { category: 'Govt', grade: 'GREEN', slab1Foir: 60, slab2Foir: 65, maxFoir: 75, hlBonusSlab1: 10, hlBonusSlab2: 5, multBelow50k: 16, mult50kTo75k: 16, mult75kTo2L: 22, multAbove2L: 24, multiplier: 24, ccObligation: 5 }
  ],

  // Section 1: DEMOGRAPHIC AND AGE ELIGIBILITY CRITERIA
  demographics: {
    minAge: 23,
    maxAge: 59,
    retirementSalaried: 59,
    retirementGovt: 65, // RETIREMENT PROOF REQ FOR 65 YEARS
    minSalary: 27000,   // LISTED 27K
    minSalaryUnlisted: 30000, // UNLISTED 30K
    minExperienceTotal: 0,    // NO REQUIRED
    minExperienceCurrent: 0,  // NO REQUIRED
    minCibilScore: 0,
    ccObligationPercent: 5,   // 5% OBLIGATE
    maxCcBtMultiplier: 6,     // MORE THEN 6 TIME NOT ALLOW
    addressProofReq: false    // ADDRESS PROOF NOT REQ
  }
};
