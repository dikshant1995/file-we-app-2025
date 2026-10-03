import { abflConfig } from './config.js';
import { getCityTier } from '../../utils/policyUtils.js';

// Helper function to calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const r = annualInterestRate / 12 / 100;
  const n = tenureInYears * 12;
  if (r === 0) return Math.round(principal / n);
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
};

// Helper function to safely parse numeric input
const parseNum = (val, fallback = 0) => {
  if (val === null || val === undefined || val === '') return fallback;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
};

// Main Eligibility Calculator for Aditya Birla Finance Ltd (ABFL)
export const calculateAbflEligibility = (userData = {}) => {
  const rawInput = userData || {};

  const desiredLoanAmount = parseNum(rawInput.desiredLoanAmount, null);
  const loanTenure = parseNum(rawInput.loanTenure, 5);
  const basicSalary = parseNum(rawInput.basicSalary || rawInput.monthlyIncome, 0);
  const averageIncentive = parseNum(rawInput.averageIncentive, 0);
  const existingEMI = parseNum(rawInput.existingEMI, 0);
  const creditCardObligation = parseNum(rawInput.creditCardObligation, 0);
  const category = rawInput.category || 'A';
  const creditScore = parseNum(rawInput.creditScore || rawInput.cibilScore, 750);
  const age = parseNum(rawInput.age, 30);
  const totalWorkExperience = parseNum(rawInput.totalWorkExperience, 12);
  const city = rawInput.city || 'Tier 1';
  const state = rawInput.state || '';

  // Admin Overrides (Logic Bridge)
  const interestRateOverride = rawInput.interestRateOverride;
  const foirOverride = rawInput.foirOverride;
  const multiplierOverride = rawInput.multiplierOverride;
  const maxTenureOverride = rawInput.maxTenureOverride;
  const maxLoanOverride = rawInput.maxLoanOverride;
  const govtROI = rawInput.govtROI;
  const govtFOIR = rawInput.govtFOIR;
  const govtMultiplier = rawInput.govtMultiplier;
  const govtMaxTenure = rawInput.govtMaxTenure;

  // ABFL Specific Parameters
  const hlLapStatus = rawInput.hlLapStatus || 'NO HL';
  const riskSegment = rawInput.riskSegment || 'LR';
  const programType = rawInput.programType || 'Salary Multiplier Program';
  const productType = rawInput.productType || 'TL';
  const isHybridOd = rawInput.isHybridOd || false;
  const paperlessBt = rawInput.paperlessBt || false;
  const isBTMode = rawInput.isBTMode || false;
  const loansForBT = rawInput.loansForBT || [];
  const btTotalEMI = parseNum(rawInput.btTotalEMI, 0);
  const btTotalOutstanding = parseNum(rawInput.btTotalOutstanding, 0);
  const noDpd36MLoans = rawInput.noDpd36MLoans !== undefined ? rawInput.noDpd36MLoans : true;
  const noDpd12MCard = rawInput.noDpd12MCard !== undefined ? rawInput.noDpd12MCard : true;

  const actualIncome = basicSalary || parseNum(rawInput.monthlyIncome, 0);

  // 1. Age Eligibility (21 to 60 Years)
  if (age !== null && age > 0 && (age < abflConfig.minAge || age > abflConfig.maxAge)) {
    return {
      eligible: false,
      reason: `Applicant age must be between ${abflConfig.minAge} and ${abflConfig.maxAge} years for ABFL (Current: ${age} years).`
    };
  }

  // 2. Work Experience (Minimum 1 Year / 12 Months)
  const totalExpMonths = totalWorkExperience;
  if (totalExpMonths > 0 && totalExpMonths < abflConfig.minWorkExperienceMonths) {
    return {
      eligible: false,
      reason: `ABFL requires minimum 1 year (12 months) total work experience (Current: ${totalExpMonths} months).`
    };
  }

  // 3. Minimum Salary Validation by City Tier (Table 1)
  const cityTierStr = getCityTier(city, state).toUpperCase();
  let minSalaryRequired = abflConfig.minSalaryByTier['TIER 4'] || 20000;
  if (cityTierStr.includes('TIER 1') || cityTierStr.includes('METRO')) {
    minSalaryRequired = abflConfig.minSalaryByTier['TIER 1'] || 40000;
  } else if (cityTierStr.includes('TIER 2')) {
    minSalaryRequired = abflConfig.minSalaryByTier['TIER 2'] || 35000;
  } else if (cityTierStr.includes('TIER 3')) {
    minSalaryRequired = abflConfig.minSalaryByTier['TIER 3'] || 25000;
  }

  if (actualIncome < minSalaryRequired) {
    return {
      eligible: false,
      reason: `Minimum monthly income of ₹${minSalaryRequired.toLocaleString()} required for ${cityTierStr} in ABFL (Current: ₹${actualIncome.toLocaleString()}).`
    };
  }

  // 4. Credit Card Obligation & BT Capping
  const ccObligation = creditCardObligation;
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  const btCount = isBT ? loansForBT.length : 0;
  
  if (isBT && btCount > 5) {
    return {
      eligible: false,
      reason: `ABFL policy permits a maximum of 5 Credit Card / Loan BTs (Requested: ${btCount} BTs).`
    };
  }

  if (isBT && btTotalOutstanding > (actualIncome * 6)) {
    return {
      eligible: false,
      reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds ABFL capping of 6 times monthly income (₹${(actualIncome * 6).toLocaleString()}).`
    };
  }

  // 5. FOIR Policy Matrix (Table 2: NO HL vs EVER HL/LAP)
  const isEverHl = String(hlLapStatus).toUpperCase().includes('EVER') || hlLapStatus === true || String(rawInput.everHl) === 'true';
  let foirPercentage = 0.60;

  if (actualIncome <= 25000) {
    foirPercentage = 0.50;
  } else if (actualIncome <= 50000) {
    foirPercentage = 0.60;
  } else if (actualIncome <= 75000) {
    foirPercentage = isEverHl ? 0.70 : 0.65;
  } else if (actualIncome <= 100000) {
    foirPercentage = isEverHl ? 0.70 : 0.65;
  } else {
    foirPercentage = isEverHl ? 0.75 : 0.70;
  }

  // Admin Overrides Priority
  if (foirOverride !== undefined && foirOverride !== null) {
    foirPercentage = parseNum(foirOverride, foirPercentage);
    if (foirPercentage > 1) foirPercentage = foirPercentage / 100;
  }
  if (govtFOIR && String(category).toUpperCase() === 'GOVT') foirPercentage = parseNum(govtFOIR) / 100;

  // Calculate Available FOIR EMI
  const totalObligations = existingEMI + ccObligation;
  const foirCap = actualIncome * foirPercentage;
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed ABFL FOIR cap of ₹${Math.round(foirCap).toLocaleString()} (${(foirPercentage * 100).toFixed(0)}%).`
    };
  }

  // 6. Tenure Eligibility (Table 3)
  const requestedTenureMonths = loanTenure * 12;
  let maxTenureAllowed = String(productType).toUpperCase() === 'OD' ? 96 : 84;
  if (maxTenureOverride !== undefined && maxTenureOverride !== null) {
    maxTenureAllowed = parseNum(maxTenureOverride, maxTenureAllowed);
  }

  let calculationTenureMonths = Math.min(requestedTenureMonths, maxTenureAllowed);
  if (maxTenureOverride === undefined || maxTenureOverride === null) {
    if (requestedTenureMonths <= 60) {
      calculationTenureMonths = Math.max(12, requestedTenureMonths - 12);
    } else if (requestedTenureMonths > 72 && requestedTenureMonths <= 84) {
      calculationTenureMonths = 72;
    }
  }

  const tenureYears = calculationTenureMonths / 12;

  // 7. Maximum Loan Amount Matrix (Table 4)
  const catUpper = String(category || 'A').toUpperCase().trim();
  let lookupCat = 'NC';
  if (catUpper.includes('SUPER') || catUpper === 'A') lookupCat = 'A';
  else if (catUpper === 'B') lookupCat = 'B';
  else if (catUpper === 'C') lookupCat = 'C';
  else if (catUpper === 'D') lookupCat = 'D';

  const riskBand = String(riskSegment || 'LR').toUpperCase().trim();
  const catCaps = abflConfig.maxLoanMatrix[lookupCat] || abflConfig.maxLoanMatrix['NC'];
  let baseMaxCap = catCaps[riskBand] || catCaps['LR'] || 4000000;

  if (maxLoanOverride !== undefined && maxLoanOverride !== null) {
    baseMaxCap = Math.min(baseMaxCap, parseNum(maxLoanOverride, baseMaxCap));
  }

  // Check Enhanced Maximum Loan (Up to ₹65 Lacs)
  let isEnhancedCap = false;
  if (
    (lookupCat === 'A' || catUpper === 'SUPER A') &&
    (riskBand === 'VLR' || riskBand === 'LR') &&
    creditScore >= 755 &&
    isEverHl &&
    actualIncome >= 250000 &&
    noDpd36MLoans &&
    noDpd12MCard &&
    (maxLoanOverride === undefined || maxLoanOverride === null)
  ) {
    baseMaxCap = abflConfig.enhancedMaxLoanAmount;
    isEnhancedCap = true;
  }

  // Minimum Loan Amount validation (Excel Row 43: MINI LOAN AMOUNT 1LAC)
  let minLoanAmount = abflConfig.minLoanAmount || 100000;

  // 8. Dynamic ROI Lookup (Tables 5, 6, 7)
  let appliedRoi = interestRateOverride !== undefined && interestRateOverride !== null ? parseNum(interestRateOverride) : null;
  if (govtROI && String(category).toUpperCase() === 'GOVT') appliedRoi = parseNum(govtROI);
  if (!appliedRoi) {
    appliedRoi = abflConfig.getAbflRate(
      category,
      actualIncome,
      desiredLoanAmount || 1000000,
      creditScore,
      cityTierStr,
      isBT,
      programType,
      isHybridOd,
      paperlessBt
    );
  }

  // 9. Calculate Loan Capacity from Available EMI
  const monthlyInterestRate = appliedRoi / 12 / 100;
  const numberOfMonths = calculationTenureMonths;
  const calculatedPrincipal = availableEMI * (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1) / (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths));

  let finalLoanAmount = Math.min(Math.round(calculatedPrincipal), baseMaxCap);
  if (desiredLoanAmount && desiredLoanAmount > 0) {
    finalLoanAmount = Math.min(finalLoanAmount, desiredLoanAmount);
  }

  if (finalLoanAmount < minLoanAmount) {
    return {
      eligible: false,
      reason: `Calculated loan amount (₹${finalLoanAmount.toLocaleString()}) is below ABFL minimum threshold of ₹${minLoanAmount.toLocaleString()}.`
    };
  }

  const monthlyEMI = calculateEMI(finalLoanAmount, appliedRoi, tenureYears);

  return {
    eligible: true,
    bankId: abflConfig.id,
    bankName: abflConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: baseMaxCap,
    isEnhancedCap,
    appliedRoi,
    interestRate: appliedRoi,
    loanTenure: tenureYears,
    loanTenureMonths: calculationTenureMonths,
    requestedTenureMonths,
    monthlyEMI,
    foirPercentage,
    availableEMI: Math.round(availableEMI),
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      incomeBand: actualIncome <= 25000 ? '<= 25k' : (actualIncome <= 50000 ? '25k-50k' : (actualIncome <= 75000 ? '50k-75k' : (actualIncome <= 100000 ? '75k-100k' : '> 100k'))),
      hlLapStatus: isEverHl ? 'EVER HL/LAP' : 'NO HL',
      riskSegment: riskBand,
      cityTier: cityTierStr,
      programType,
      appliedRoi,
      isEnhancedCapApplied: isEnhancedCap
    }
  };
};
