// Exact Master Policy Configuration for FINNABLE FINANCE LTD

export const FINNABLE_NEGATIVE_PROFILES = [
  'army', 'bar manager', 'bishop', 'border security force', 'bsf', 'court assistant', 'crpf',
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
  'gautam buddh nagar', 'gautam budh nagar', 'gauttam budhnagar', 'ghaziabad', 'faridabad',
  'mumbai', 'navi mumbai', 'thane', 'dombivli', 'kalyan', 'karjat', 'mira bhayandar', 'panvel',
  'bangalore', 'bengaluru', 'bangalore rural',
  'chennai',
  'hyderabad', 'secunderabad'
];

export const isFinnableTier1City = (city = '', state = '') => {
  const normCity = String(city || '').toLowerCase().trim();
  const normState = String(state || '').toLowerCase().trim();
  return FINNABLE_TIER1_CITIES.some(c => normCity.includes(c) || c.includes(normCity));
};

export const isFinnableNegativeProfile = (designation = '') => {
  const norm = String(designation || '').toLowerCase().trim();
  return FINNABLE_NEGATIVE_PROFILES.some(prof => norm === prof || norm.includes(prof));
};

export const isFinnableNegativeIndustry = (industryOrCompany = '') => {
  const norm = String(industryOrCompany || '').toLowerCase().trim();
  if (norm.includes('digital marketing')) return false;
  return FINNABLE_NEGATIVE_INDUSTRIES.some(ind => norm.includes(ind));
};

export const isSolePropAllowedZone = (state = '') => {
  const normState = String(state || '').toLowerCase().trim();
  return FINNABLE_WEST_SOUTH_STATES.some(st => normState.includes(st) || st.includes(normState));
};

export const FINNABLE_BANK_EXCEL_POLICY = {
  // Table 1: Overview & General Eligibility Parameters
  overview: {
    minLoanAmount: 50000,
    maxLoanAmount: 1000000,
    minRoi: 22.0,
    maxRoi: 36.0,
    minPf: 2.0,
    maxPf: 6.0,
    minTenureMonths: 12,
    maxTenureMonths: 60,
    minAge: 21,
    maxAgeLogin: 55,
    maxAgeMaturity: 60,
    ccObligationPercent: 5,
    goldLoanObligationPercent: 5,
    kccObligationPercent: 5,
    minSalary: 15000,
    minSalaryTier1: 20000,
    minSalaryTier2: 15000,
    minWorkExperienceMonths: 6
  },

  // Table 2: CIBIL Score & Risk Matrix
  riskMatrix: {
    cibil700Plus: {
      minLoanAmount: 50000,
      maxLoanAmount: 1000000,
      minTenureMonths: 6,
      maxTenureMonths: 60,
      minAge: 21,
      maxAgeLogin: 55,
      maxAgeMaturity: 60,
      minSalaryTier1: 20000,
      minSalaryTier2: 15000,
      form16Threshold: 500000
    },
    ntcMinusOne: {
      finnableScoreMin: 600,
      minLoanAmount: 50000,
      maxLoanAmount: 400000,
      minTenureMonths: 6,
      maxTenureMonths: 36,
      minAge: 21,
      maxAgeLogin: 55,
      maxAgeMaturity: 60,
      minSalaryTier1: 20000,
      minSalaryTier2: 15000,
      form16Threshold: 500000
    }
  },

  // Table 3: Tier 1 City Classification
  tier1Cities: FINNABLE_TIER1_CITIES,

  // Table 4: Negative Profiles
  negativeProfiles: FINNABLE_NEGATIVE_PROFILES,

  // Table 5: Employment Checks & Company Type Eligibility
  employmentChecks: {
    allowedEntities: ['Public Ltd', 'Pvt Ltd', 'LLP', 'Partnership', 'Sole Proprietorship', 'Schools', 'Colleges', 'Hospital', 'NGO', 'HUF'],
    solePropAllowedZones: FINNABLE_WEST_SOUTH_STATES,
    rules: [
      {
        companyType: 'Pvt Ltd / Public Ltd / LLP (With PF)',
        rule: '3 salary credits from 2 different companies allowed with PF (PF must be validated for both companies).'
      },
      {
        companyType: 'Pvt Ltd / Public Ltd / LLP (Without PF)',
        rule: '3 salary credits from the same company are mandatory.'
      },
      {
        companyType: 'Sole Prop / Partnership / HUF (With PF)',
        rule: '3 salary credits from the same company are mandatory.'
      },
      {
        companyType: 'Sole Prop / Partnership (Without PF)',
        rule: '6 salary credits from the same company are mandatory.'
      }
    ]
  },

  // Rates & Capping fallback structures
  interestRates: [
    { category: 'Super A', minRoi: 22.00, maxRoi: 36.00, defaultRoi: 22.00 },
    { category: 'A', minRoi: 22.00, maxRoi: 36.00, defaultRoi: 22.00 },
    { category: 'B', minRoi: 24.00, maxRoi: 36.00, defaultRoi: 24.00 },
    { category: 'C', minRoi: 26.00, maxRoi: 36.00, defaultRoi: 26.00 },
    { category: 'D', minRoi: 28.00, maxRoi: 36.00, defaultRoi: 28.00 },
    { category: 'Govt', minRoi: 22.00, maxRoi: 36.00, defaultRoi: 22.00 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 50000, maxLoan: 1000000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 },
    { tier: 'A', minLoan: 50000, maxLoan: 1000000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 },
    { tier: 'B', minLoan: 50000, maxLoan: 1000000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 },
    { tier: 'C', minLoan: 50000, maxLoan: 800000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 },
    { tier: 'D', minLoan: 50000, maxLoan: 500000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 },
    { tier: 'Govt', minLoan: 50000, maxLoan: 1000000, bachelorCap: null, minSalary: 15000, ntcMaxLoan: 400000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' },
    { category: 'A', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' },
    { category: 'B', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' },
    { category: 'C', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' },
    { category: 'D', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' },
    { category: 'Govt', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC -1 capped to 36 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 60, maxFoir: 65, multiplier: 20, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, slab2Foir: 60, maxFoir: 65, multiplier: 20, ccObligation: 5 },
    { category: 'B', slab1Foir: 45, slab2Foir: 55, maxFoir: 60, multiplier: 18, ccObligation: 5 },
    { category: 'C', slab1Foir: 40, slab2Foir: 50, maxFoir: 55, multiplier: 15, ccObligation: 5 },
    { category: 'D', slab1Foir: 40, slab2Foir: 45, maxFoir: 50, multiplier: 12, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, maxFoir: 65, multiplier: 20, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 55,
    maxAgeMaturity: 60,
    minSalaryTier1: 20000,
    minSalaryTier2: 15000,
    minSalary: 15000,
    minLoanAmount: 50000,
    maxLoanAmount: 1000000,
    ntcMaxLoan: 400000,
    minTenureMonths: 6,
    maxTenureMonths: 60,
    ntcMaxTenure: 36,
    minTotalExperienceMonths: 6,
    minWorkExperienceMonths: 6,
    minExperienceTotal: 6,
    minExperienceCurrent: 6,
    minCibilScore: 700,
    allowNtc: true,
    ccObligationPercent: 5,
    goldLoanObligationPercent: 5,
    kccObligationPercent: 5,
    processingFeeMin: 2.0,
    processingFeeMax: 6.0,
    form16Threshold: 500000
  }
};
