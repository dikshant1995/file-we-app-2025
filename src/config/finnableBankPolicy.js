// Exact Master Policy Configuration for FINNABLE FINANCE LTD from BANKS POLICYS.xlsx (Sheet: FINNABLE)

export const FINNABLE_NEGATIVE_PROFILES = [
  'army', 'bar manager', 'bishop', 'border security force', 'court assistant', 'crpf',
  'delivery boy', 'delivery executive', 'delivery partner', 'diamond cutter', 'fitness coach',
  'fitness manager', 'fitness trainee', 'freelancer', 'granthi', 'gurudwara manager', 'gym owner',
  'gym trainer', 'helper', 'imam', 'indian navy', 'jeweler', 'jewelry consultant', 'labor',
  'lawyer', 'lineman', 'majdoor', 'media', 'missionary', 'mufti', 'own business', 'owner',
  'pandit', 'pastor', 'police', 'political parties', 'porter', 'priest', 'proprietor',
  'purohit', 'self employed', 'trackman', 'security guard', 'safai karamchari', 'peon', 'driver'
];

export const FINNABLE_NEGATIVE_INDUSTRIES = [
  'bar', 'bars', 'event management', 'spa', 'saloon', 'media'
];

export const FINNABLE_WEST_SOUTH_STATES = [
  'maharashtra', 'gujarat', 'goa', 'karnataka', 'tamil nadu', 'andhra pradesh', 'telangana', 'kerala'
];

export const FINNABLE_TIER1_CITIES = [
  'delhi', 'new delhi', 'east delhi', 'delhi ncr', 'noida', 'greater noida', 'gurgaon', 'gurugram',
  'gautam budh nagar', 'gauttam budhnagar', 'ghaziabad', 'faridabad',
  'mumbai', 'navi mumbai', 'thane', 'dombivli', 'kalyan', 'karjat', 'mira bhayandar', 'panvel', 'navi mumbai panvel',
  'bangalore', 'bengaluru', 'bangalore rural',
  'chennai',
  'hyderabad', 'secunderabad'
];

export const isFinnableTier1City = (city = '', state = '') => {
  const normCity = String(city || '').toLowerCase().trim();
  const normState = String(state || '').toLowerCase().trim();
  return FINNABLE_TIER1_CITIES.some(c => normCity.includes(c) || c.includes(normCity));
};

export const isFinnableNegativeIndustry = (industryOrCompany = '') => {
  const norm = String(industryOrCompany || '').toLowerCase().trim();
  // Digital marketing is allowed under media, and listed Spa/Saloon is allowed
  if (norm.includes('digital marketing')) return false;
  return FINNABLE_NEGATIVE_INDUSTRIES.some(ind => norm.includes(ind));
};

export const isSolePropAllowedZone = (state = '') => {
  const normState = String(state || '').toLowerCase().trim();
  return FINNABLE_WEST_SOUTH_STATES.some(st => normState.includes(st) || st.includes(normState));
};

export const FINNABLE_BANK_EXCEL_POLICY = {
  // Section 2: ROI STRUCTURES AND SLABS (22% to 36%)
  interestRates: [
    { category: 'Super A', minRoi: 22.00, maxRoi: 36.00, defaultRoi: 22.00 },
    { category: 'A', minRoi: 22.00, maxRoi: 36.00, defaultRoi: 22.00 },
    { category: 'B', minRoi: 24.00, maxRoi: 36.00, defaultRoi: 24.00 },
    { category: 'C', minRoi: 26.00, maxRoi: 36.00, defaultRoi: 26.00 },
    { category: 'D', minRoi: 28.00, maxRoi: 36.00, defaultRoi: 28.00 },
    { category: 'Govt', minRoi: 22.00, maxRoi: 36.00, defaultRoi: 22.00 }
  ],

  // Section 5: MINIMUM LOAN AMOUNT AND MAX LOAN AMOUNT (Excel: 50k to 10 Lac | NTC: 4 Lac)
  loanCapping: [
    { tier: 'Super A', minLoan: 50000, maxLoan: 1000000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 },
    { tier: 'A', minLoan: 50000, maxLoan: 1000000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 },
    { tier: 'B', minLoan: 50000, maxLoan: 1000000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 },
    { tier: 'C', minLoan: 50000, maxLoan: 800000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 },
    { tier: 'D', minLoan: 50000, maxLoan: 500000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 },
    { tier: 'Govt', minLoan: 50000, maxLoan: 1000000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 }
  ],

  // Section 4: TENURE RULES (Excel: 6 to 60 Months | NTC -1 capped to 36 Months)
  tenureRules: [
    { category: 'Super A', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' },
    { category: 'A', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' },
    { category: 'B', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' },
    { category: 'C', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' },
    { category: 'D', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' },
    { category: 'Govt', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' }
  ],

  // Section 3: FOIR & MULTIPLIERS
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 60, maxFoir: 65, multiplier: 20, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, slab2Foir: 60, maxFoir: 65, multiplier: 20, ccObligation: 5 },
    { category: 'B', slab1Foir: 45, slab2Foir: 55, maxFoir: 60, multiplier: 18, ccObligation: 5 },
    { category: 'C', slab1Foir: 40, slab2Foir: 50, maxFoir: 55, multiplier: 15, ccObligation: 5 },
    { category: 'D', slab1Foir: 40, slab2Foir: 45, maxFoir: 50, multiplier: 12, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, maxFoir: 65, multiplier: 20, ccObligation: 5 }
  ],

  // Section 1: DEMOGRAPHIC AND ELIGIBILITY CRITERIA
  demographics: {
    minAge: 21, // Excel Row 22: 21
    maxAge: 55, // Excel Row 23: 55 at login
    maxAgeMaturity: 60, // Excel Row 23: 60 till loan maturity
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalaryTier1: 20000, // Excel Row 24: 20,000 for Tier 1
    minSalaryTier2: 15000, // Excel Row 24: 15,000 for Tier 2
    minSalary: 15000,
    minLoanAmount: 50000, // Excel Row 18: 50,000
    maxLoanAmount: 1000000, // Excel Row 19: 10,00,000
    ntcMaxLoan: 400000, // Excel Row 19: 4,00,000
    minTenureMonths: 6, // Excel Row 20: 6
    maxTenureMonths: 60, // Excel Row 21: 60
    ntcMaxTenure: 36, // Excel Row 21: 36
    minTotalExperienceMonths: 6, // Excel Row 13: 6 MONTHS
    minWorkExperienceMonths: 6,
    minExperienceTotal: 6,
    minExperienceCurrent: 6,
    minCibilScore: 700, // Excel Row 16: 700 +
    allowNtc: true, // Excel Row 16: NTC (-1)
    ccObligationPercent: 5, // Excel Row 11: CC 5%
    goldLoanObligationPercent: 5, // Excel Row 11: Gold Loan 5%
    kccObligationPercent: 5, // Excel Row 11: KCC 5%
    processingFeeMin: 2.0, // Excel Row 7: 2% To 6%
    processingFeeMax: 6.0,
    processingFeePercentage: 2.5,
    form16Threshold: 500000, // Excel Row 26: >= 5 Lakhs Form 16 verified
    negativeDesignations: FINNABLE_NEGATIVE_PROFILES,
    negativeIndustries: FINNABLE_NEGATIVE_INDUSTRIES,
    tier1Cities: FINNABLE_TIER1_CITIES,
    westAndSouthStates: FINNABLE_WEST_SOUTH_STATES
  }
};
