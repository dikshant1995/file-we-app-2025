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

// Main Eligibility Calculator for Aditya Birla Finance Ltd (ABFL)
export const calculateAbflEligibility = (userData = {}) => {
  const {
    desiredLoanAmount = 1000000,
    loanTenure = 5,
    basicSalary = 0,
    monthlyIncome = 0,
    existingEMI = 0,
    creditCardObligation = 0,
    category = 'A',
    creditScore = 750,
    employmentType = 'salaried',
    age = 30,
    totalWorkExperience = 12,
    city = 'Tier 1',
    state = '',
    // ABFL Specific Parameters
    hlLapStatus = 'NO HL', // 'NO HL' or 'EVER HL/LAP'
    riskSegment = 'LR', // 'VLR', 'LR', 'MR', 'HR'
    programType = 'Salary Multiplier Program', // 'Salary Multiplier Program' or 'PL Progressive Program'
    productType = 'TL', // 'TL' (Term Loan) or 'OD' (Overdraft)
    isHybridOd = false,
    paperlessBt = false,
    isBTMode = false,
    loansForBT = [],
    btTotalEMI = 0,
    btTotalOutstanding = 0,
    noDpd36MLoans = true,
    noDpd12MCard = true
  } = userData;

  const actualIncome = Number(basicSalary || monthlyIncome || 0);

  // 1. Age Eligibility (21 to 60 Years)
  if (age && (age < abflConfig.minAge || age > abflConfig.maxAge)) {
    return {
      eligible: false,
      reason: `Applicant age must be between ${abflConfig.minAge} and ${abflConfig.maxAge} years for ABFL (Current: ${age} years).`
    };
  }

  // 2. Work Experience (Minimum 1 Year / 12 Months)
  const totalExpMonths = Number(totalWorkExperience || 12);
  if (totalExpMonths < abflConfig.minWorkExperienceMonths) {
    return {
      eligible: false,
      reason: `ABFL requires minimum 1 year (12 months) total work experience (Current: ${totalExpMonths} months).`
    };
  }

  // 3. Minimum Salary Validation by City Tier (Table 1)
  const cityTierStr = getCityTier(city, state).toUpperCase();
  let minSalaryRequired = abflConfig.minSalaryByTier['TIER 4'];
  if (cityTierStr.includes('TIER 1') || cityTierStr.includes('METRO')) {
    minSalaryRequired = abflConfig.minSalaryByTier['TIER 1'];
  } else if (cityTierStr.includes('TIER 2')) {
    minSalaryRequired = abflConfig.minSalaryByTier['TIER 2'];
  } else if (cityTierStr.includes('TIER 3')) {
    minSalaryRequired = abflConfig.minSalaryByTier['TIER 3'];
  }

  if (actualIncome < minSalaryRequired) {
    return {
      eligible: false,
      reason: `Minimum monthly income of ₹${minSalaryRequired.toLocaleString()} required for ${cityTierStr} in ABFL (Current: ₹${actualIncome.toLocaleString()}).`
    };
  }

  // 4. Credit Card Obligation & BT Capping (5% Obligation, Max 5 BTs, Max 6x Salary BT)
  const ccObligation = Number(creditCardObligation || 0);
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
  const isEverHl = String(hlLapStatus).toUpperCase().includes('EVER') || hlLapStatus === true || String(userData.everHl) === 'true';
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

  // Calculate Available FOIR EMI
  const totalObligations = (existingEMI || 0) + (ccObligation || 0);
  const foirCap = actualIncome * foirPercentage;
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed ABFL FOIR cap of ₹${Math.round(foirCap).toLocaleString()} (${(foirPercentage * 100).toFixed(0)}%).`
    };
  }

  // 6. Tenure Eligibility (Table 3)
  const requestedTenureMonths = Number(loanTenure || 5) * 12;
  const maxTenureAllowed = productType.toUpperCase() === 'OD' ? 96 : 84;
  let calculationTenureMonths = Math.min(requestedTenureMonths, maxTenureAllowed);

  if (requestedTenureMonths <= 60) {
    calculationTenureMonths = Math.max(12, requestedTenureMonths - 12);
  } else if (requestedTenureMonths > 72 && requestedTenureMonths <= 84) {
    calculationTenureMonths = 72;
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

  // Check Enhanced Maximum Loan (Up to ₹65 Lacs)
  let isEnhancedCap = false;
  if (
    (lookupCat === 'A' || catUpper === 'SUPER A') &&
    (riskBand === 'VLR' || riskBand === 'LR') &&
    Number(creditScore) >= 755 &&
    isEverHl &&
    actualIncome >= 250000 &&
    noDpd36MLoans &&
    noDpd12MCard
  ) {
    baseMaxCap = abflConfig.enhancedMaxLoanAmount; // ₹65 Lacs
    isEnhancedCap = true;
  }

  // Minimum Loan Amount validation
  let minLoanAmount = catCaps.minLoan || 500000;
  if (actualIncome < 30000) minLoanAmount = 100000;

  // 8. Dynamic ROI Lookup (Tables 5, 6, 7)
  const appliedRoi = abflConfig.getAbflRate(
    category,
    actualIncome,
    desiredLoanAmount,
    creditScore,
    cityTierStr,
    isBT,
    programType,
    isHybridOd,
    paperlessBt
  );

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
