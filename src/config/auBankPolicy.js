// Exact Master Policy Configuration for AU SMALL FINANCE BANK from Excel (Sheet: AU BANK)
export const AU_BANK_EXCEL_POLICY = {
  // Section 5: ROI STRUCTURES AND SLABS
  // 6 Segments by CIBIL & Loan Amount:
  // LT750_LA_LT200K, GTE750_LA_LT200K, LT750_LA_GTE200K, GTE750_LA_GTE200K, NTC_LT200K, NTC_GTE200K
  // Sub-tiers: > 1.50L, >= 50K <= 1.50L, < 50K
  // Categories: Super A, A, B, C, D, Other/Unlisted
  interestRates: [
    { category: 'Super A', roiAbove10L: 13.00, roiBelow10L: 14.00, minRoi: 13.00, maxRoi: 17.00, defaultRoi: 14.00 },
    { category: 'A', roiAbove10L: 14.00, roiBelow10L: 15.00, minRoi: 14.00, maxRoi: 18.00, defaultRoi: 15.00 },
    { category: 'B', roiAbove10L: 15.00, roiBelow10L: 16.00, minRoi: 15.00, maxRoi: 19.00, defaultRoi: 16.00 },
    { category: 'C', roiAbove10L: 16.00, roiBelow10L: 17.00, minRoi: 16.00, maxRoi: 20.00, defaultRoi: 17.00 },
    { category: 'D', roiAbove10L: 15.00, roiBelow10L: 16.00, minRoi: 15.00, maxRoi: 19.00, defaultRoi: 16.00 },
    { category: 'Govt', roiAbove10L: 13.00, roiBelow10L: 14.00, minRoi: 13.00, maxRoi: 17.00, defaultRoi: 14.00 }
  ],

  // Full detailed matrix from Excel Section 5 (Sheet: AU BANK)
  // 6 Segments by CIBIL & Loan Amount, each with 3 Net Monthly Salary Slabs (>1.50L, 50k-1.50L, <50k)
  roiMatrixDetailed: [
    { segment: 'LT750_LA_LT200K', segmentLabel: 'CIBIL < 750 (Loan < ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'Super A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'Govt': 15.0, 'Other': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },
    { segment: 'LT750_LA_LT200K', segmentLabel: 'CIBIL < 750 (Loan < ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'Super A': 16.0, 'A': 17.0, 'B': 18.0, 'C': 19.0, 'D': 18.0, 'Govt': 16.0, 'Other': 23.0, superA: 16.0, catA: 17.0, catB: 18.0, catC: 19.0, catD: 18.0, govt: 16.0, other: 23.0 } },
    { segment: 'LT750_LA_LT200K', segmentLabel: 'CIBIL < 750 (Loan < ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'Super A': 17.0, 'A': 18.0, 'B': 19.0, 'C': 20.0, 'D': 19.0, 'Govt': 17.0, 'Other': 24.0, superA: 17.0, catA: 18.0, catB: 19.0, catC: 20.0, catD: 19.0, govt: 17.0, other: 24.0 } },

    { segment: 'GTE750_LA_LT200K', segmentLabel: 'CIBIL ≥ 750 (Loan < ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'Super A': 14.0, 'A': 15.0, 'B': 16.0, 'C': 17.0, 'D': 16.0, 'Govt': 14.0, 'Other': 21.0, superA: 14.0, catA: 15.0, catB: 16.0, catC: 17.0, catD: 16.0, govt: 14.0, other: 21.0 } },
    { segment: 'GTE750_LA_LT200K', segmentLabel: 'CIBIL ≥ 750 (Loan < ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'Super A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'Govt': 15.0, 'Other': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },
    { segment: 'GTE750_LA_LT200K', segmentLabel: 'CIBIL ≥ 750 (Loan < ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'Super A': 16.0, 'A': 17.0, 'B': 18.0, 'C': 19.0, 'D': 18.0, 'Govt': 16.0, 'Other': 23.0, superA: 16.0, catA: 17.0, catB: 18.0, catC: 19.0, catD: 18.0, govt: 16.0, other: 23.0 } },

    { segment: 'LT750_LA_GTE200K', segmentLabel: 'CIBIL < 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'Super A': 14.0, 'A': 15.0, 'B': 16.0, 'C': 17.0, 'D': 16.0, 'Govt': 14.0, 'Other': 21.0, superA: 14.0, catA: 15.0, catB: 16.0, catC: 17.0, catD: 16.0, govt: 14.0, other: 21.0 } },
    { segment: 'LT750_LA_GTE200K', segmentLabel: 'CIBIL < 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'Super A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'Govt': 15.0, 'Other': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },
    { segment: 'LT750_LA_GTE200K', segmentLabel: 'CIBIL < 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'Super A': 16.0, 'A': 17.0, 'B': 18.0, 'C': 19.0, 'D': 18.0, 'Govt': 16.0, 'Other': 23.0, superA: 16.0, catA: 17.0, catB: 18.0, catC: 19.0, catD: 18.0, govt: 16.0, other: 23.0 } },

    { segment: 'GTE750_LA_GTE200K', segmentLabel: 'CIBIL ≥ 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'Super A': 13.0, 'A': 14.0, 'B': 15.0, 'C': 16.0, 'D': 15.0, 'Govt': 13.0, 'Other': 20.0, superA: 13.0, catA: 14.0, catB: 15.0, catC: 16.0, catD: 15.0, govt: 13.0, other: 20.0 } },
    { segment: 'GTE750_LA_GTE200K', segmentLabel: 'CIBIL ≥ 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'Super A': 14.0, 'A': 15.0, 'B': 16.0, 'C': 17.0, 'D': 16.0, 'Govt': 14.0, 'Other': 21.0, superA: 14.0, catA: 15.0, catB: 16.0, catC: 17.0, catD: 16.0, govt: 14.0, other: 21.0 } },
    { segment: 'GTE750_LA_GTE200K', segmentLabel: 'CIBIL ≥ 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'Super A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'Govt': 15.0, 'Other': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },

    { segment: 'NTC_LT200K', segmentLabel: 'NTC / -1 CIBIL (Loan < ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'Super A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'Govt': 15.0, 'Other': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },
    { segment: 'NTC_LT200K', segmentLabel: 'NTC / -1 CIBIL (Loan < ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'Super A': 16.0, 'A': 17.0, 'B': 18.0, 'C': 19.0, 'D': 18.0, 'Govt': 16.0, 'Other': 23.0, superA: 16.0, catA: 17.0, catB: 18.0, catC: 19.0, catD: 18.0, govt: 16.0, other: 23.0 } },
    { segment: 'NTC_LT200K', segmentLabel: 'NTC / -1 CIBIL (Loan < ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'Super A': 17.0, 'A': 18.0, 'B': 19.0, 'C': 20.0, 'D': 19.0, 'Govt': 17.0, 'Other': 24.0, superA: 17.0, catA: 18.0, catB: 19.0, catC: 20.0, catD: 19.0, govt: 17.0, other: 24.0 } },

    { segment: 'NTC_GTE200K', segmentLabel: 'NTC / -1 CIBIL (Loan ≥ ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'Super A': 14.0, 'A': 15.0, 'B': 16.0, 'C': 17.0, 'D': 16.0, 'Govt': 14.0, 'Other': 21.0, superA: 14.0, catA: 15.0, catB: 16.0, catC: 17.0, catD: 16.0, govt: 14.0, other: 21.0 } },
    { segment: 'NTC_GTE200K', segmentLabel: 'NTC / -1 CIBIL (Loan ≥ ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'Super A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'Govt': 15.0, 'Other': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },
    { segment: 'NTC_GTE200K', segmentLabel: 'NTC / -1 CIBIL (Loan ≥ ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'Super A': 16.0, 'A': 17.0, 'B': 18.0, 'C': 19.0, 'D': 18.0, 'Govt': 16.0, 'Other': 23.0, superA: 16.0, catA: 17.0, catB: 18.0, catC: 19.0, catD: 18.0, govt: 16.0, other: 23.0 } }
  ],

  // Section 3: MINIMUM LOAN AMOUNT AND MAX LOAN AMOUNT & Row 36 Capping
  loanCapping: [
    { tier: 'Super A', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, ntcCap: 300000, minSalary: 20000 },
    { tier: 'A', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, ntcCap: 300000, minSalary: 20000 },
    { tier: 'B', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, ntcCap: 300000, minSalary: 20000 },
    { tier: 'C', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, thinCibilCap: 750000, minSalary: 25000 },
    { tier: 'D', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, ntcCap: 300000, minSalary: 20000 },
    { tier: 'Govt', minLoan: 50000, maxLoan: 1500000, bachelorCap: 500000, ntcCap: 300000, minSalary: 20000 }
  ],

  // Section 2: TENURE AND REPAYMENT WINDOWS
  // 12 to 60 Months across all tiers
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' },
    { category: 'A', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' },
    { category: 'B', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' },
    { category: 'C', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' },
    { category: 'Govt', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' }
  ],

  // Section 4: ETC Customer (FOIR, Multipliers & Exposure Capping)
  // Priority 1 (Super A, A, B, D / Govt):
  // 20k-<50k: FOIR 60%, Mult 18x, Cap 5L
  // 50k-<75k: FOIR 65%, Mult 20x, Cap 15L
  // 75k-<100k: FOIR 70%, Mult 22x, Cap 15L
  // >=100k: FOIR 75%, Mult 24x, Cap 15L
  // Priority 0 (Cat C, Others, Unlisted):
  // 20k-<50k: FOIR 50%, Mult 11x, Cap 5L
  // 50k-<75k: FOIR 60%, Mult 15x, Cap 7.5L
  // 75k-<100k: FOIR 65%, Mult 18x, Cap 10L
  // >=100k: FOIR 70%, Mult 20x, Cap 10L
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 60, slab2Foir: 65, slab3Foir: 70, maxFoir: 75, multiplierBelow50k: 18, multiplier50kTo75k: 20, multiplier75kTo100k: 22, multiplierAbove100k: 24, multiplier: 24, ccObligation: 5, priority: 1 },
    { category: 'A', slab1Foir: 60, slab2Foir: 65, slab3Foir: 70, maxFoir: 75, multiplierBelow50k: 18, multiplier50kTo75k: 20, multiplier75kTo100k: 22, multiplierAbove100k: 24, multiplier: 24, ccObligation: 5, priority: 1 },
    { category: 'B', slab1Foir: 60, slab2Foir: 65, slab3Foir: 70, maxFoir: 75, multiplierBelow50k: 18, multiplier50kTo75k: 20, multiplier75kTo100k: 22, multiplierAbove100k: 24, multiplier: 24, ccObligation: 5, priority: 1 },
    { category: 'C', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, multiplierBelow50k: 11, multiplier50kTo75k: 15, multiplier75kTo100k: 18, multiplierAbove100k: 20, multiplier: 20, ccObligation: 5, priority: 0 },
    { category: 'D', slab1Foir: 60, slab2Foir: 65, slab3Foir: 70, maxFoir: 75, multiplierBelow50k: 18, multiplier50kTo75k: 20, multiplier75kTo100k: 22, multiplierAbove100k: 24, multiplier: 24, ccObligation: 5, priority: 1 },
    { category: 'Govt', slab1Foir: 60, slab2Foir: 65, slab3Foir: 70, maxFoir: 75, multiplierBelow50k: 18, multiplier50kTo75k: 20, multiplier75kTo100k: 22, multiplierAbove100k: 24, multiplier: 24, ccObligation: 5, priority: 1 }
  ],

  // Section 1: DEMOGRAPHIC AND AGE ELIGIBILITY CRITERIA
  demographics: {
    minAge: 21,                // 21 YEARS (Salaried) / 23 for Self Employed
    maxAge: 57,                // PVT 57 YEARS (At loan time / maturity)
    maxAgeGovt: 59,            // GOVT 59 YEARS
    retirementSalaried: 60,    // 60 YEARS
    retirementGovt: 60,        // 60 YEARS
    minSalary: 20000,          // LISTED 20K (Non-metro 20k / Metro 30k)
    minSalaryUnlisted: 25000,  // UNLISTED 25K (Non-metro 25k / Metro 35k)
    minSalaryNtc: 30000,       // -1 CIBIL 30K (LISTED AND GOVT ONLY)
    minExperienceTotal: 12,    // 1 YEAR (12 MONTHS)
    minExperienceCurrent: 12,  // 1 YEAR (12 MONTHS)
    minCibilScore: 0,          // Allowed NTC (-1) for Super A, A, B, Govt
    allowNtc: true,
    ntcCapping: 300000,        // NTC (-1) 3 LAC
    thinCibilCapping: 750000,  // Thin Cibil Cat C/Others 7.5 LAC
    bachelorCapping: 500000,   // PG / Rented Bachelor Max 5 Lac
    ccObligationPercent: 5,    // 5% OBLIGATE
    allowCcBt: false,          // ONLY PL BT (Credit Card BT strictly not allowed)
    allowPlBt: true
  }
};
