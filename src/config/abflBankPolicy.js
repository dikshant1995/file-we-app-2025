// Exact Master Policy Configuration for ADITYA BIRLA FINANCE LTD (ABFL) from BANKS POLICYS.xlsx (Sheet: ABFL)

export const getAbflROI = (arg1 = 'A', arg2 = 50000, arg3 = 1000000, arg4 = 750, arg5 = 'Tier 1', arg6 = false) => {
  let category, monthlyIncome, loanAmount, cibilScore, cityTier, isBT;
  if (typeof arg1 === 'number') {
    // Called as: (loanAmount, monthlyIncome, category, cityTier, cibilScore, isBT)
    loanAmount = arg1;
    monthlyIncome = Number(arg2 || 0);
    category = String(arg3 || 'A');
    cityTier = arg4;
    cibilScore = arg5;
    isBT = Boolean(arg6);
  } else {
    // Called as: (category, monthlyIncome, loanAmount, cibilScore, cityTier, isBT)
    category = String(arg1 || 'A');
    monthlyIncome = Number(arg2 || 0);
    loanAmount = Number(arg3 || 0);
    cibilScore = arg4;
    cityTier = arg5;
    isBT = Boolean(arg6);
  }
  const catUpper = String(category || '').toUpperCase();
  const tierUpper = String(cityTier || '').toUpperCase().trim();
  const isTier1or2 = tierUpper === 'METRO' || tierUpper === 'TIER 1' || tierUpper === 'TIER 2' || tierUpper.includes('METRO') || tierUpper.includes('TIER 1') || tierUpper.includes('TIER 2');

  // 1. Base rate lookup (Salary Multiplier Program - Excel Rows 49-64)
  let baseRoi = 14.20;

  if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'B' || catUpper === 'GOVT') {
    if (monthlyIncome > 75000) {
      if (loanAmount > 2500000) baseRoi = 12.60;
      else if (loanAmount > 500000) baseRoi = 13.60;
      else baseRoi = 13.85;
    } else if (monthlyIncome >= 50000) {
      if (loanAmount > 2500000) baseRoi = 12.95;
      else if (loanAmount > 500000) baseRoi = 13.95;
      else baseRoi = 14.20;
    } else {
      if (loanAmount > 2500000) baseRoi = 13.45;
      else if (loanAmount > 500000) baseRoi = 14.45;
      else baseRoi = 14.70;
    }
  } else if (catUpper === 'C') {
    if (monthlyIncome > 75000) {
      if (loanAmount > 2500000) baseRoi = 13.55;
      else if (loanAmount > 500000) baseRoi = 14.55;
      else baseRoi = 14.80;
    } else if (monthlyIncome >= 50000) {
      if (loanAmount > 2500000) baseRoi = 13.90;
      else if (loanAmount > 500000) baseRoi = 14.90;
      else baseRoi = 15.15;
    } else {
      if (loanAmount > 2500000) baseRoi = 14.40;
      else if (loanAmount > 500000) baseRoi = 15.40;
      else baseRoi = 15.65;
    }
  } else if (catUpper === 'D') {
    if (monthlyIncome > 75000) {
      if (loanAmount > 2500000) baseRoi = 13.70;
      else if (loanAmount > 500000) baseRoi = 14.70;
      else baseRoi = 14.95;
    } else if (monthlyIncome >= 50000) {
      if (loanAmount > 2500000) baseRoi = 14.05;
      else if (loanAmount > 500000) baseRoi = 15.05;
      else baseRoi = 15.30;
    } else {
      if (loanAmount > 2500000) baseRoi = 14.55;
      else if (loanAmount > 500000) baseRoi = 15.55;
      else baseRoi = 15.80;
    }
  } else {
    // Others / NC
    if (monthlyIncome > 75000) {
      if (loanAmount > 2500000) baseRoi = 14.10;
      else if (loanAmount > 500000) baseRoi = 15.10;
      else baseRoi = 15.35;
    } else if (monthlyIncome >= 50000) {
      if (loanAmount > 2500000) baseRoi = 14.45;
      else if (loanAmount > 500000) baseRoi = 15.45;
      else baseRoi = 15.70;
    } else {
      if (loanAmount > 2500000) baseRoi = 14.95;
      else if (loanAmount > 500000) baseRoi = 15.95;
      else baseRoi = 16.20;
    }
  }

  // Tier 3/4 Location Markup (+0.75% across the board in Excel)
  if (!isTier1or2) {
    baseRoi += 0.75;
  }

  // 2. Risk Premium Bureau Band (Excel Rows 68-73)
  const numCibil = cibilScore !== null && cibilScore !== undefined && cibilScore !== '' ? Number(cibilScore) : 750;
  let bureauPremium = 0;
  if (numCibil >= 810) {
    bureauPremium = 0.00;
  } else if (numCibil >= 786) {
    bureauPremium = 0.60;
  } else if (numCibil >= 746) {
    bureauPremium = 1.60;
  } else if (numCibil >= 701) {
    bureauPremium = 2.25;
  } else {
    // < 700 or NTC
    bureauPremium = 3.30;
  }

  let finalRoi = baseRoi + bureauPremium;

  // Paperless BT premium (+1.00% in Excel Row 70)
  if (isBT) {
    finalRoi += 1.00;
  }

  return Number(finalRoi.toFixed(2));
};

export const ABFL_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove25L: 12.60, roi5Lto25L: 13.60, roiBelow5L: 13.85, minRoi: 12.60, maxRoi: 16.50, defaultRoi: 13.60 },
    { category: 'A', roiAbove25L: 12.60, roi5Lto25L: 13.60, roiBelow5L: 13.85, minRoi: 12.60, maxRoi: 16.50, defaultRoi: 13.60 },
    { category: 'B', roiAbove25L: 12.60, roi5Lto25L: 13.60, roiBelow5L: 13.85, minRoi: 12.60, maxRoi: 16.50, defaultRoi: 13.60 },
    { category: 'C', roiAbove25L: 13.55, roi5Lto25L: 14.55, roiBelow5L: 14.80, minRoi: 13.55, maxRoi: 17.50, defaultRoi: 14.55 },
    { category: 'D', roiAbove25L: 13.70, roi5Lto25L: 14.70, roiBelow5L: 14.95, minRoi: 13.70, maxRoi: 18.00, defaultRoi: 14.70 },
    { category: 'Govt', roiAbove25L: 12.60, roi5Lto25L: 13.60, roiBelow5L: 13.85, minRoi: 12.60, maxRoi: 16.50, defaultRoi: 13.60 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, maxLoanSpecial: 6500000, bachelorCap: null, minSalary: 20000 },
    { tier: 'A', minLoan: 100000, maxLoan: 5000000, maxLoanSpecial: 6500000, bachelorCap: null, minSalary: 20000 },
    { tier: 'B', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 20000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3500000, bachelorCap: null, minSalary: 20000 },
    { tier: 'D', minLoan: 100000, maxLoan: 2500000, bachelorCap: null, minSalary: 20000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 20000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, maxMonthsOd: 96, description: '12 to 84 Months (Term Loan) / 96M (OD)' },
    { category: 'A', minMonths: 12, maxMonths: 84, maxMonthsOd: 96, description: '12 to 84 Months (Term Loan) / 96M (OD)' },
    { category: 'B', minMonths: 12, maxMonths: 84, maxMonthsOd: 96, description: '12 to 84 Months (Term Loan) / 96M (OD)' },
    { category: 'C', minMonths: 12, maxMonths: 72, description: '12 to 72 Months' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: '12 to 60 Months' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, maxMonthsOd: 96, description: '12 to 84 Months (Term Loan) / 96M (OD)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, hlMaxFoir: 75, multiplier: 28, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, hlMaxFoir: 75, multiplier: 26, ccObligation: 5 },
    { category: 'B', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, hlMaxFoir: 75, multiplier: 22, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, hlMaxFoir: 70, multiplier: 18, ccObligation: 5 },
    { category: 'D', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 65, hlMaxFoir: 65, multiplier: 15, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, slab3Foir: 65, maxFoir: 70, hlMaxFoir: 75, multiplier: 26, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalaryTier1: 40000,
    minSalaryTier2: 35000,
    minSalaryTier3: 25000,
    minSalaryTier4: 20000,
    minSalary: 20000,
    minLoanAmount: 100000,
    maxLoanAmount: 5000000,
    maxLoanSpecial: 6500000,
    minExperienceTotal: 12,
    minExperienceCurrent: 12,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: true,
    ccBtAllowedCount: 5,
    maxCcBtSalaryMultiplier: 6,
    kccNotObligated: true
  }
};
