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

export const FINNABLE_BANK_EXCEL_POLICY = {
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
    { category: 'Super A', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC capped to 36 Months)' },
    { category: 'A', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC capped to 36 Months)' },
    { category: 'B', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC capped to 36 Months)' },
    { category: 'C', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC capped to 36 Months)' },
    { category: 'D', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC capped to 36 Months)' },
    { category: 'Govt', minMonths: 6, maxMonths: 60, ntcMaxMonths: 36, description: '6 to 60 Months (NTC capped to 36 Months)' }
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
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalaryTier1: 20000,
    minSalaryTier2: 15000,
    minSalary: 15000,
    minLoanAmount: 50000,
    maxLoanAmount: 1000000,
    ntcMaxLoan: 400000,
    minExperienceTotal: 6,
    minExperienceCurrent: 6,
    minCibilScore: 700,
    allowNtc: true,
    ntcMaxTenure: 36,
    ccObligationPercent: 5,
    goldLoanObligationPercent: 5,
    kccObligationPercent: 5,
    negativeDesignations: FINNABLE_NEGATIVE_PROFILES,
    tier1Cities: FINNABLE_TIER1_CITIES
  }
};
