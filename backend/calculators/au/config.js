// AU Small Finance Bank Configuration
// Strictly configured from Master Excel Policy (BANKS POLICYS.xlsx - Sheet: AU BANK)

export const auConfig = {
  id: 'au-bank',
  name: 'AU Small Finance Bank',
  minAge: 21, // Excel: MINIMUM APLICANT AGE: 21YEARS
  minAgeSelfEmployed: 23,
  maxAgePvt: 57, // Excel: MAXIMUM AGE AT LOAN TIME: PVT 57YEARS
  maxAgeGovt: 59, // Excel: GOVT 59YEARS
  maxAge: 57,
  retirementAge: 60, // Excel: RETIREMENT AGE: 60 YEARS
  retirementAgeSalaried: 57, // at maturity
  retirementAgeGovt: 59,
  minCreditScore: 0, // NTC (-1) is allowed for Super A, A, B, Govt
  minSalaryListed: 20000, // Excel: LISTED 20K
  minSalaryUnlisted: 25000, // Excel: UNLISTED 25K
  minSalaryNtc: 30000, // Excel: -1 CIBIL 30K(LISTD AND GOVT)
  minSalary: 20000,
  minTotalExperience: 12, // Excel: MINI WORK EXPRINCE: 1YEARS
  minCurrentCompanyExperience: 12,
  maxLoanTenureMonths: 60, // Excel: 12 to 60 MONTHS across all tiers
  minLoanAmount: 50000, // Excel: 50K
  maxLoanAmount: 1500000, // Excel: 15LAC overall capping
  ntcMaxLoan: 300000, // Excel: NTC (-1) 3 lac
  thinCibilMaxLoan: 750000, // Excel: Thin Cibil Cat C/ Others 7.5 lac
  bachelorMaxLoan: 500000, // Excel: PG/ Rented Bachelor Max 5 Lac
  creditCardObligationPercent: 0.05, // Excel: CC OBLIGATION: 5% OBLIGATE
  allowCcBt: false, // Excel: ONLY PL BT (No Credit Card BT)
  allowPlBt: true,

  btConfig: {
    isAvailable: true,
    allowCcBt: false,
    allowPlBt: true,
    maxPersonalLoansForBT: 5,
    description: 'AU Small Finance Bank allows ONLY Personal Loan Balance Transfer (CC BT not allowed)'
  },

  employmentTypes: ['salaried', 'government', 'salaried_professional'],

  // Section 4: ETC Customer (FOIR, Multiplier & Exposure Capping)
  priority1Categories: ['SUPER A', 'A', 'B', 'D', 'GOVT'],
  priority0Categories: ['C', 'OTHERS', 'UNLISTED'],

  priority1Slabs: [
    { minIncome: 20000, maxIncome: 49999, foir: 0.60, multiplier: 18, maxCap: 500000 },
    { minIncome: 50000, maxIncome: 74999, foir: 0.65, multiplier: 20, maxCap: 1500000 },
    { minIncome: 75000, maxIncome: 99999, foir: 0.70, multiplier: 22, maxCap: 1500000 },
    { minIncome: 100000, maxIncome: Infinity, foir: 0.75, multiplier: 24, maxCap: 1500000 }
  ],

  priority0Slabs: [
    { minIncome: 20000, maxIncome: 49999, foir: 0.50, multiplier: 11, maxCap: 500000 },
    { minIncome: 50000, maxIncome: 74999, foir: 0.60, multiplier: 15, maxCap: 750000 },
    { minIncome: 75000, maxIncome: 99999, foir: 0.65, multiplier: 18, maxCap: 1000000 },
    { minIncome: 100000, maxIncome: Infinity, foir: 0.70, multiplier: 20, maxCap: 1000000 }
  ],

  // Section 5: Detailed ROI Matrix from Excel (Sheet: AU BANK)
  // 6 Segments across CIBIL & Loan Amount, each with 3 Net Monthly Salary Slabs (>1.50L, 50k-1.50L, <50k)
  roiMatrixDetailed: [
    { segment: 'LT750_LA_LT200K', segmentLabel: 'CIBIL < 750 (Loan < ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'SUPER A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'GOVT': 15.0, 'OTHER': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },
    { segment: 'LT750_LA_LT200K', segmentLabel: 'CIBIL < 750 (Loan < ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'SUPER A': 16.0, 'A': 17.0, 'B': 18.0, 'C': 19.0, 'D': 18.0, 'GOVT': 16.0, 'OTHER': 23.0, superA: 16.0, catA: 17.0, catB: 18.0, catC: 19.0, catD: 18.0, govt: 16.0, other: 23.0 } },
    { segment: 'LT750_LA_LT200K', segmentLabel: 'CIBIL < 750 (Loan < ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'SUPER A': 17.0, 'A': 18.0, 'B': 19.0, 'C': 20.0, 'D': 19.0, 'GOVT': 17.0, 'OTHER': 24.0, superA: 17.0, catA: 18.0, catB: 19.0, catC: 20.0, catD: 19.0, govt: 17.0, other: 24.0 } },

    { segment: 'GTE750_LA_LT200K', segmentLabel: 'CIBIL ≥ 750 (Loan < ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'SUPER A': 14.0, 'A': 15.0, 'B': 16.0, 'C': 17.0, 'D': 16.0, 'GOVT': 14.0, 'OTHER': 21.0, superA: 14.0, catA: 15.0, catB: 16.0, catC: 17.0, catD: 16.0, govt: 14.0, other: 21.0 } },
    { segment: 'GTE750_LA_LT200K', segmentLabel: 'CIBIL ≥ 750 (Loan < ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'SUPER A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'GOVT': 15.0, 'OTHER': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },
    { segment: 'GTE750_LA_LT200K', segmentLabel: 'CIBIL ≥ 750 (Loan < ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'SUPER A': 16.0, 'A': 17.0, 'B': 18.0, 'C': 19.0, 'D': 18.0, 'GOVT': 16.0, 'OTHER': 23.0, superA: 16.0, catA: 17.0, catB: 18.0, catC: 19.0, catD: 18.0, govt: 16.0, other: 23.0 } },

    { segment: 'LT750_LA_GTE200K', segmentLabel: 'CIBIL < 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'SUPER A': 14.0, 'A': 15.0, 'B': 16.0, 'C': 17.0, 'D': 16.0, 'GOVT': 14.0, 'OTHER': 21.0, superA: 14.0, catA: 15.0, catB: 16.0, catC: 17.0, catD: 16.0, govt: 14.0, other: 21.0 } },
    { segment: 'LT750_LA_GTE200K', segmentLabel: 'CIBIL < 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'SUPER A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'GOVT': 15.0, 'OTHER': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },
    { segment: 'LT750_LA_GTE200K', segmentLabel: 'CIBIL < 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'SUPER A': 16.0, 'A': 17.0, 'B': 18.0, 'C': 19.0, 'D': 18.0, 'GOVT': 16.0, 'OTHER': 23.0, superA: 16.0, catA: 17.0, catB: 18.0, catC: 19.0, catD: 18.0, govt: 16.0, other: 23.0 } },

    { segment: 'GTE750_LA_GTE200K', segmentLabel: 'CIBIL ≥ 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'SUPER A': 13.0, 'A': 14.0, 'B': 15.0, 'C': 16.0, 'D': 15.0, 'GOVT': 13.0, 'OTHER': 20.0, superA: 13.0, catA: 14.0, catB: 15.0, catC: 16.0, catD: 15.0, govt: 13.0, other: 20.0 } },
    { segment: 'GTE750_LA_GTE200K', segmentLabel: 'CIBIL ≥ 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'SUPER A': 14.0, 'A': 15.0, 'B': 16.0, 'C': 17.0, 'D': 16.0, 'GOVT': 14.0, 'OTHER': 21.0, superA: 14.0, catA: 15.0, catB: 16.0, catC: 17.0, catD: 16.0, govt: 14.0, other: 21.0 } },
    { segment: 'GTE750_LA_GTE200K', segmentLabel: 'CIBIL ≥ 750 (Loan ≥ ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'SUPER A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'GOVT': 15.0, 'OTHER': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },

    { segment: 'NTC_LT200K', segmentLabel: 'NTC / -1 CIBIL (Loan < ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'SUPER A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'GOVT': 15.0, 'OTHER': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },
    { segment: 'NTC_LT200K', segmentLabel: 'NTC / -1 CIBIL (Loan < ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'SUPER A': 16.0, 'A': 17.0, 'B': 18.0, 'C': 19.0, 'D': 18.0, 'GOVT': 16.0, 'OTHER': 23.0, superA: 16.0, catA: 17.0, catB: 18.0, catC: 19.0, catD: 18.0, govt: 16.0, other: 23.0 } },
    { segment: 'NTC_LT200K', segmentLabel: 'NTC / -1 CIBIL (Loan < ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'SUPER A': 17.0, 'A': 18.0, 'B': 19.0, 'C': 20.0, 'D': 19.0, 'GOVT': 17.0, 'OTHER': 24.0, superA: 17.0, catA: 18.0, catB: 19.0, catC: 20.0, catD: 19.0, govt: 17.0, other: 24.0 } },

    { segment: 'NTC_GTE200K', segmentLabel: 'NTC / -1 CIBIL (Loan ≥ ₹2 Lakhs)', salarySlab: '> 1,50K', salaryLabel: '> ₹1.50 Lakhs', minSalary: 150001, maxSalary: Infinity, rates: { 'SUPER A': 14.0, 'A': 15.0, 'B': 16.0, 'C': 17.0, 'D': 16.0, 'GOVT': 14.0, 'OTHER': 21.0, superA: 14.0, catA: 15.0, catB: 16.0, catC: 17.0, catD: 16.0, govt: 14.0, other: 21.0 } },
    { segment: 'NTC_GTE200K', segmentLabel: 'NTC / -1 CIBIL (Loan ≥ ₹2 Lakhs)', salarySlab: '>=50K <=150K', salaryLabel: '₹50K – ₹1.50 Lakhs', minSalary: 50000, maxSalary: 150000, rates: { 'SUPER A': 15.0, 'A': 16.0, 'B': 17.0, 'C': 18.0, 'D': 17.0, 'GOVT': 15.0, 'OTHER': 22.0, superA: 15.0, catA: 16.0, catB: 17.0, catC: 18.0, catD: 17.0, govt: 15.0, other: 22.0 } },
    { segment: 'NTC_GTE200K', segmentLabel: 'NTC / -1 CIBIL (Loan ≥ ₹2 Lakhs)', salarySlab: '< 50K', salaryLabel: '< ₹50,000', minSalary: 0, maxSalary: 49999, rates: { 'SUPER A': 16.0, 'A': 17.0, 'B': 18.0, 'C': 19.0, 'D': 18.0, 'GOVT': 16.0, 'OTHER': 23.0, superA: 16.0, catA: 17.0, catB: 18.0, catC: 19.0, catD: 18.0, govt: 16.0, other: 23.0 } }
  ]
};
