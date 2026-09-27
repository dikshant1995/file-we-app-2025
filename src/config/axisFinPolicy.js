// Exact Master Policy Configuration for AXIS FINANCE LTD from Excel (Sheet: AXIS FINANCE)
export const AXIS_FINANCE_EXCEL_POLICY = {
  // Section 2: ROI STRUCTURES AND SLABS (Loan Amount 5L to 25L)
  interestRates: [
    { category: 'Super A', roi5Lto25L: 13.50, minRoi: 13.50, maxRoi: 16.00, defaultRoi: 13.50, btRoi: 18.00, notes: 'ROI will change as per band score and program. CC BT / App BT: 18%' },
    { category: 'A', roi5Lto25L: 14.50, minRoi: 14.50, maxRoi: 16.50, defaultRoi: 14.50, btRoi: 18.00, notes: 'CC BT and App Loan BT ROI 18% applicable' },
    { category: 'B', roi5Lto25L: 15.00, minRoi: 15.00, maxRoi: 17.00, defaultRoi: 15.00, btRoi: 18.00 },
    { category: 'C', roi5Lto25L: 16.00, minRoi: 16.00, maxRoi: 18.00, defaultRoi: 16.00, btRoi: 18.00 },
    { category: 'D', roi5Lto25L: 16.00, minRoi: 16.00, maxRoi: 18.00, defaultRoi: 16.00, btRoi: 18.00 },
    { category: 'Govt', roi5Lto25L: 13.50, minRoi: 13.50, maxRoi: 16.00, defaultRoi: 13.50, btRoi: 18.00 }
  ],

  // Section 5: MINIMUM LOAN AMOUNT AND MAX LOAN AMOUNT (Excel Rows 44-51)
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'B', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 30000 },
    { tier: 'C', minLoan: 100000, maxLoan: 2000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'D', minLoan: 100000, maxLoan: 1000000, bachelorCap: null, minSalary: 30000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 }
  ],

  // Section 4: TENURE AND REPAYMENT WINDOWS (Excel Rows 34-41)
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' }
  ],

  // Section 3: Multiplier table based on salary slabs (Excel: "COM CAT NOT REQ FOR FOIR AND MULTIPLIER")
  // Category D has no multiplier (processed via FOIR)
  salaryMultiplierSlabs: [
    { minSalary: 0, maxSalary: 49999, multiplier: 24, label: '< 50K' },
    { minSalary: 50000, maxSalary: 74999, multiplier: 26, label: '50K TO 75K' },
    { minSalary: 75000, maxSalary: 99999, multiplier: 28, label: '75K TO 1 LAC' },
    { minSalary: 100000, maxSalary: Infinity, multiplier: 30, label: '1 LAC ABOVE' }
  ],

  // Section 3: FOIR AND MULTIPLIER (Excel Rows 24-31)
  foirMultiplier: [
    { category: 'Super A', maxFoir: 70, slab1Foir: 70, slab2Foir: 70, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'A', maxFoir: 70, slab1Foir: 70, slab2Foir: 70, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'B', maxFoir: 65, slab1Foir: 65, slab2Foir: 65, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 28, ccObligation: 5 },
    { category: 'C', maxFoir: 60, slab1Foir: 60, slab2Foir: 60, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 26, ccObligation: 5 },
    { category: 'D', maxFoir: 50, slab1Foir: 50, slab2Foir: 50, multiplierBelow50k: null, multiplier50kTo75k: null, multiplier75kTo100k: null, multiplierAbove100k: null, multiplier: null, ccObligation: 5, note: 'No multiplier applicable (After deviation case will be processed in FOIR)' },
    { category: 'Govt', maxFoir: 70, slab1Foir: 70, slab2Foir: 70, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 30, ccObligation: 5 }
  ],

  // Section 1: DEMOGRAPHIC AND AGE ELIGIBILITY CRITERIA (Excel Rows 4-11)
  demographics: {
    minAge: 21, // Excel Row 6: 21
    maxAge: 60, // Excel Row 7: 60
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalaryUrban: 30000, // Excel Row 9: URBAN 30K
    minSalaryRural: 25000, // Excel Row 9: RURAL 25
    minSalary: 25000,
    minExperienceTotal: 6, // Excel Row 10: 6 MONTHS
    minExperienceCurrent: 6,
    minLoanAmount: 100000, // Excel Row 46: 1 LAC
    minTenureMonths: 12, // Excel Row 36: 12 MONTHS
    minCibilScore: 0,
    ccObligationPercent: 5, // Excel Row 11: 5% OBLIGATE
    allowCcBt: true,
    ccBtAllowedCount: 5, // Excel Row 11: 5 CC BT ALLOW
    btRoi: 18.00, // Excel Row 17: CC BT AND APP LOAN BT ROI 18% APLICABLE
    goldLoanObligationPercent: 1, // Excel Row 11: GOLD LOAN OBLIGATION 1% COUNT
    kccExemptionLimit: 1500000 // Excel Row 11: KCC OBLIGATION UPTO 15LAC = 0 OBLIGATE
  }
};
