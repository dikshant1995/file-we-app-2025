// Exact Master Policy Configuration for ADITYA BIRLA FINANCE LTD (ABFL)

export const ABFL_BANK_EXCEL_POLICY = {
  // Table 1: Demographic and Age Eligibility Criteria
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementAge: 60,
    minSalaryTier1: 40000,
    minSalaryTier2: 35000,
    minSalaryTier3: 25000,
    minSalaryTier4: 20000,
    minWorkExperienceYears: 1,
    minWorkExperienceMonths: 12,
    ccObligationPercent: 5,
    ccBtAllowedCount: 5,
    maxCcBtSalaryMultiplier: 6,
    kccNotObligated: true,
    minLoanAmount: 100000
  },

  // Table 2: FOIR Policy Matrix (NO HL vs EVER HL/LAP)
  foirPolicyMatrix: [
    { label: 'Up to ₹25,000', minIncome: 0, maxIncome: 25000, foirNoHl: 50, foirEverHl: 50 },
    { label: '₹25,001 to ₹50,000', minIncome: 25001, maxIncome: 50000, foirNoHl: 60, foirEverHl: 60 },
    { label: '₹50,001 to ₹75,000', minIncome: 50001, maxIncome: 75000, foirNoHl: 65, foirEverHl: 70 },
    { label: '₹75,001 to ₹1,00,000', minIncome: 75001, maxIncome: 100000, foirNoHl: 65, foirEverHl: 70 },
    { label: 'Above ₹1,00,000', minIncome: 100001, maxIncome: Infinity, foirNoHl: 70, foirEverHl: 75 }
  ],

  // Table 3: Tenure and Repayment Windows
  tenureRules: [
    { categorisation: 'EMERGING / ELITE', tenureRange: '<= 60 Months', eligibilityFormula: 'Actual Tenure minus 12 Months', minTenure: 12, maxTenureTL: 84, maxTenureOD: 96 },
    { categorisation: 'ELITE', tenureRange: '61 - 72 Months', eligibilityFormula: 'Policy eligibility rules apply', minTenure: 12, maxTenureTL: 84, maxTenureOD: 96 },
    { categorisation: 'ELITE', tenureRange: '73 - 84 Months', eligibilityFormula: '84 Months applied is eligible for 72 Months', minTenure: 12, maxTenureTL: 84, maxTenureOD: 96 }
  ],

  // Table 4: Maximum Loan Amount Matrix (Company Cat vs Risk Segment)
  maxLoanMatrix: [
    { category: 'A', vlr: 5000000, lr: 5000000, mr: 4000000, hr: 4000000, minLoan: 1000000 },
    { category: 'B', vlr: 4000000, lr: 4000000, mr: 4000000, hr: 4000000, minLoan: 1000000 },
    { category: 'C', vlr: 4000000, lr: 4000000, mr: 3500000, hr: 3000000, minLoan: 500000 },
    { category: 'D', vlr: 3000000, lr: 2500000, mr: 1500000, hr: 1000000, minLoan: 500000 },
    { category: 'NC / Others', vlr: 800000, lr: 800000, mr: 500000, hr: 500000, minLoan: 500000 }
  ],

  // Enhanced Max Loan Conditions (Up to ₹65 Lacs)
  enhancedMaxLoanRule: {
    maxAmount: 6500000,
    conditions: [
      'Company Category A & Risk Segment VLR or LR',
      'CIBIL Score >= 755 & Ever HL = True',
      'Monthly Income >= ₹2.5 Lacs',
      'No DPD in 36M on loans & in 12M on credit card'
    ],
    minIncome: 250000,
    minCibil: 755
  },

  // Table 5: Salary Multiplier Program ROI Matrix
  salaryMultiplierRoiMatrix: {
    tier1or2: [
      { category: 'A / B', incomeBand: '<= 50k', roiBelow5L: 14.70, roi5Lto25L: 14.45, roiAbove25L: 13.45 },
      { category: 'A / B', incomeBand: '50k - 75k', roiBelow5L: 14.20, roi5Lto25L: 13.95, roiAbove25L: 12.95 },
      { category: 'A / B', incomeBand: '> 75k', roiBelow5L: 13.85, roi5Lto25L: 13.60, roiAbove25L: 12.60 },
      { category: 'C', incomeBand: '<= 50k', roiBelow5L: 15.65, roi5Lto25L: 15.40, roiAbove25L: 14.40 },
      { category: 'C', incomeBand: '50k - 75k', roiBelow5L: 15.15, roi5Lto25L: 14.90, roiAbove25L: 13.90 },
      { category: 'C', incomeBand: '> 75k', roiBelow5L: 14.80, roi5Lto25L: 14.55, roiAbove25L: 13.55 },
      { category: 'D', incomeBand: '<= 50k', roiBelow5L: 15.80, roi5Lto25L: 15.55, roiAbove25L: 14.55 },
      { category: 'D', incomeBand: '50k - 75k', roiBelow5L: 15.30, roi5Lto25L: 15.05, roiAbove25L: 14.05 },
      { category: 'D', incomeBand: '> 75k', roiBelow5L: 14.95, roi5Lto25L: 14.70, roiAbove25L: 13.70 },
      { category: 'Others', incomeBand: '<= 50k', roiBelow5L: 16.20, roi5Lto25L: 15.95, roiAbove25L: 14.95 },
      { category: 'Others', incomeBand: '50k - 75k', roiBelow5L: 15.70, roi5Lto25L: 15.45, roiAbove25L: 14.45 },
      { category: 'Others', incomeBand: '> 75k', roiBelow5L: 15.35, roi5Lto25L: 15.10, roiAbove25L: 14.10 }
    ],
    tier3or4: [
      { category: 'A / B', incomeBand: '<= 50k', roiBelow5L: 15.45, roi5Lto25L: 15.20, roiAbove25L: 14.20 },
      { category: 'A / B', incomeBand: '50k - 75k', roiBelow5L: 14.95, roi5Lto25L: 14.70, roiAbove25L: 13.70 },
      { category: 'A / B', incomeBand: '> 75k', roiBelow5L: 14.60, roi5Lto25L: 14.35, roiAbove25L: 13.35 },
      { category: 'C', incomeBand: '<= 50k', roiBelow5L: 16.40, roi5Lto25L: 16.15, roiAbove25L: 15.15 },
      { category: 'C', incomeBand: '50k - 75k', roiBelow5L: 15.90, roi5Lto25L: 15.65, roiAbove25L: 14.65 },
      { category: 'C', incomeBand: '> 75k', roiBelow5L: 15.55, roi5Lto25L: 15.30, roiAbove25L: 14.30 },
      { category: 'D', incomeBand: '<= 50k', roiBelow5L: 16.55, roi5Lto25L: 16.30, roiAbove25L: 15.30 },
      { category: 'D', incomeBand: '50k - 75k', roiBelow5L: 16.05, roi5Lto25L: 16.00, roiAbove25L: 14.80 },
      { category: 'D', incomeBand: '> 75k', roiBelow5L: 15.70, roi5Lto25L: 15.45, roiAbove25L: 14.45 },
      { category: 'Others', incomeBand: '<= 50k', roiBelow5L: 16.95, roi5Lto25L: 16.70, roiAbove25L: 15.70 },
      { category: 'Others', incomeBand: '50k - 75k', roiBelow5L: 16.45, roi5Lto25L: 16.20, roiAbove25L: 15.20 },
      { category: 'Others', incomeBand: '> 75k', roiBelow5L: 16.10, roi5Lto25L: 15.85, roiAbove25L: 14.85 }
    ]
  },

  // Table 6: PL Progressive Program ROI Matrix
  plProgressiveRoiMatrix: [
    { category: 'A & B', incomeBand: '<= 25k', tier1or2Below4L: 18.95, tier1or2Above4L: 17.95, tier3or4Below4L: 19.70, tier3or4Above4L: 18.70 },
    { category: 'A & B', incomeBand: '25k - 30k', tier1or2Below4L: 18.45, tier1or2Above4L: 17.45, tier3or4Below4L: 19.20, tier3or4Above4L: 18.20 },
    { category: 'A & B', incomeBand: '> 30k', tier1or2Below4L: 17.95, tier1or2Above4L: 16.95, tier3or4Below4L: 18.70, tier3or4Above4L: 17.70 },
    { category: 'C & D', incomeBand: '<= 25k', tier1or2Below4L: 19.70, tier1or2Above4L: 18.70, tier3or4Below4L: 20.45, tier3or4Above4L: 19.45 },
    { category: 'C & D', incomeBand: '25k - 30k', tier1or2Below4L: 19.20, tier1or2Above4L: 18.20, tier3or4Below4L: 19.95, tier3or4Above4L: 18.95 },
    { category: 'C & D', incomeBand: '> 30k', tier1or2Below4L: 18.70, tier1or2Above4L: 17.70, tier3or4Below4L: 19.45, tier3or4Above4L: 18.45 },
    { category: 'Others', incomeBand: '<= 25k', tier1or2Below4L: 20.30, tier1or2Above4L: 19.30, tier3or4Below4L: 21.05, tier3or4Above4L: 20.05 },
    { category: 'Others', incomeBand: '25k - 30k', tier1or2Below4L: 19.80, tier1or2Above4L: 18.80, tier3or4Below4L: 20.55, tier3or4Above4L: 19.55 },
    { category: 'Others', incomeBand: '> 30k', tier1or2Below4L: 19.30, tier1or2Above4L: 18.30, tier3or4Below4L: 20.05, tier3or4Above4L: 19.05 }
  ],

  // Table 7: Additional ROI Risk & Booking Add-ons
  additionalRoiRiskAddons: [
    { type: 'Booking Option', condition: 'Hybrid DL OD / DL OD', premium: 1.00 },
    { type: 'Booking Option', condition: 'Paperless BT', premium: 1.00 },
    { type: 'Risk Premium Bureau Band', condition: '810+', premium: 0.00 },
    { type: 'Risk Premium Bureau Band', condition: '786 - 810', premium: 0.30, range: '+0.00% to +0.60%' },
    { type: 'Risk Premium Bureau Band', condition: '746 - 785', premium: 1.12, range: '+0.65% to +1.60%' },
    { type: 'Risk Premium Bureau Band', condition: '701 - 745', premium: 2.30, range: '+2.25% to +2.40%' },
    { type: 'Risk Premium Bureau Band', condition: 'LT 700 / NTC', premium: 3.20, range: '+3.15% to +3.30%' }
  ]
};

// Function to calculate exact ABFL ROI based on parameters
export const getAbflROI = (params = {}) => {
  const {
    category = 'A',
    monthlyIncome = 50000,
    loanAmount = 1000000,
    cibilScore = 750,
    cityTier = 'Tier 1',
    isBT = false,
    programType = 'Salary Multiplier Program',
    isHybridOd = false,
    paperlessBt = false
  } = params;

  const catUpper = String(category || '').toUpperCase();
  const tierUpper = String(cityTier || '').toUpperCase().trim();
  const isTier1or2 = tierUpper.includes('TIER 1') || tierUpper.includes('TIER 2') || tierUpper.includes('METRO') || tierUpper === '1' || tierUpper === '2';

  let baseRoi = 14.00;

  if (programType === 'PL Progressive Program') {
    // Table 6: PL Progressive Program
    let catGroup = 'Others';
    if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'B' || catUpper === 'GOVT') catGroup = 'A & B';
    else if (catUpper === 'C' || catUpper === 'D') catGroup = 'C & D';

    let incGroup = '> 30k';
    if (monthlyIncome <= 25000) incGroup = '<= 25k';
    else if (monthlyIncome <= 30000) incGroup = '25k - 30k';

    const matrixRow = ABFL_BANK_EXCEL_POLICY.plProgressiveRoiMatrix.find(r => r.category === catGroup && r.incomeBand === incGroup);
    if (matrixRow) {
      if (isTier1or2) {
        baseRoi = loanAmount <= 400000 ? matrixRow.tier1or2Below4L : matrixRow.tier1or2Above4L;
      } else {
        baseRoi = loanAmount <= 400000 ? matrixRow.tier3or4Below4L : matrixRow.tier3or4Above4L;
      }
    }
  } else {
    // Table 5: Salary Multiplier Program
    let catGroup = 'Others';
    if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'B' || catUpper === 'GOVT') catGroup = 'A / B';
    else if (catUpper === 'C') catGroup = 'C';
    else if (catUpper === 'D') catGroup = 'D';

    let incGroup = '> 75k';
    if (monthlyIncome <= 50000) incGroup = '<= 50k';
    else if (monthlyIncome <= 75000) incGroup = '50k - 75k';

    const gridList = isTier1or2 ? ABFL_BANK_EXCEL_POLICY.salaryMultiplierRoiMatrix.tier1or2 : ABFL_BANK_EXCEL_POLICY.salaryMultiplierRoiMatrix.tier3or4;
    const matrixRow = gridList.find(r => r.category === catGroup && r.incomeBand === incGroup);
    if (matrixRow) {
      if (loanAmount > 2500000) baseRoi = matrixRow.roiAbove25L;
      else if (loanAmount >= 500000) baseRoi = matrixRow.roi5Lto25L;
      else baseRoi = matrixRow.roiBelow5L;
    }
  }

  // Risk Premium Bureau Band
  const numCibil = Number(cibilScore || 750);
  let bureauPremium = 0;
  if (numCibil >= 810) bureauPremium = 0.00;
  else if (numCibil >= 786) bureauPremium = 0.30;
  else if (numCibil >= 746) bureauPremium = 1.12;
  else if (numCibil >= 701) bureauPremium = 2.30;
  else bureauPremium = 3.20;

  let finalRoi = baseRoi + bureauPremium;

  if (isHybridOd) finalRoi += 1.00;
  if (isBT || paperlessBt) finalRoi += 1.00;

  return Number(finalRoi.toFixed(2));
};
