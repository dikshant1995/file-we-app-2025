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
    { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 30000 }
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

  // Section 3: Salary Slabs for FOIR & Multiplier (Both depend strictly on Salary Slab only)
  // < 50k: FOIR 70%, Mult 24x
  // 50k-75k: FOIR 70%, Mult 26x
  // 75k-100k (75k above): FOIR 65%, Mult 28x
  // >= 100k (1 Lac above): FOIR 60%, Mult 30x
  salaryMultiplierSlabs: [
    { minSalary: 30000, maxSalary: 49999, foir: 70, multiplier: 24, label: '< 50K (30K - <50K)' },
    { minSalary: 50000, maxSalary: 74999, foir: 70, multiplier: 26, label: '50K TO 75K' },
    { minSalary: 75000, maxSalary: 99999, foir: 65, multiplier: 28, label: '75K TO 1 LAC' },
    { minSalary: 100000, maxSalary: Infinity, foir: 60, multiplier: 30, label: '1 LAC ABOVE' }
  ],

  // Section 3: FOIR AND MULTIPLIER
  foirMultiplier: [
    { category: 'Super A', foirBelow50k: 70, foir50kTo75k: 70, foir75kTo100k: 65, foirAbove100k: 60, maxFoir: 70, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'A', foirBelow50k: 70, foir50kTo75k: 70, foir75kTo100k: 65, foirAbove100k: 60, maxFoir: 70, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'B', foirBelow50k: 70, foir50kTo75k: 70, foir75kTo100k: 65, foirAbove100k: 60, maxFoir: 70, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'C', foirBelow50k: 70, foir50kTo75k: 70, foir75kTo100k: 65, foirAbove100k: 60, maxFoir: 70, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'D', foirBelow50k: 70, foir50kTo75k: 70, foir75kTo100k: 65, foirAbove100k: 60, maxFoir: 70, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'Govt', foirBelow50k: 70, foir50kTo75k: 70, foir75kTo100k: 65, foirAbove100k: 60, maxFoir: 70, multiplierBelow50k: 24, multiplier50kTo75k: 26, multiplier75kTo100k: 28, multiplierAbove100k: 30, multiplier: 30, ccObligation: 5 }
  ],

  // Section 1: DEMOGRAPHIC AND AGE ELIGIBILITY CRITERIA
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalaryUrban: 30000,
    minSalaryRural: 30000,
    minSalary: 30000, // Minimum Salary ₹30,000
    minExperienceTotal: 6,
    minExperienceCurrent: 6,
    minLoanAmount: 100000,
    minTenureMonths: 12,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: true,
    ccBtAllowedCount: 5,
    btRoi: 18.00,
    goldLoanObligationPercent: 1,
    goldLoanObligationText: 'GOLD LOAN OBLIGATION 1% COUNT',
    kccExemptionLimit: 1500000,
    kccObligationText: 'KCC OBLIGATION UPTO 15LAC = 0 OBLIGATE'
  }
};
