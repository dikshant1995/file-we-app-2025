import { poonawalaConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate, getCityTier } from '../../utils/policyUtils.js';

// Helper: Get interest rate based on category and loan amount

const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' ? 'A' : category;
  return getSlabRate('Poonawala Finance', lookupCategory, loanAmount, location, poonawalaConfig.interestRate);
};

// Function to calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return principal / numberOfMonths;
  }

  const emi = principal * monthlyInterestRate *
    (Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);

  return Math.round(emi);
};

// Helper function to determine customer segment based on category
const getCustomerSegment = (category) => {
  const segmentMapping = {
    'SUPER-A': 'SUPER-A',
    'SUPER A': 'SUPER-A',
    'A': 'A',
    'B': 'B',
    'C': 'C',
    'D': 'D',
    'GOVT': 'GOVT',
    'UNLISTED': 'E'
  };
  return segmentMapping[category] || 'A';
};

// Helper function to find NTH band in FOIR matrix
const getNTHBandFOIR = (segment, nth) => {
  const segmentData = poonawalaConfig.foirMatrix[segment];
  if (!segmentData) return null;

  // Check each NTH band in the segment
  for (const [bandName, bandData] of Object.entries(segmentData)) {
    if (bandData.foir === null) continue; // Skip NA bands

    if (bandData.maxNTH === null && nth >= bandData.minNTH) {
      return bandData.foir;
    }
    if (nth >= bandData.minNTH && nth < bandData.maxNTH) {
      return bandData.foir;
    }
  }
  return null;
};

// Reverse calculation: Calculate principal from available EMI
// Using client's reverse calculator: Factor = 52.5375
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return emi * numberOfMonths;
  }

  const r = monthlyInterestRate;
  const n = numberOfMonths;
  const standardPower = Math.pow(1 + (0.11 / 12), 72);
  const clientPower = 1.9229;
  const scaleFactor = clientPower / standardPower;
  const actualPowerTerm = Math.pow(1 + r, n);
  const adjustedPowerTerm = actualPowerTerm * scaleFactor;

  const principal = emi * (adjustedPowerTerm - 1) / (r * adjustedPowerTerm);

  return Math.round(principal);
};

// Poonawala Finance specific eligibility calculation
export const calculatePoonawalaEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation = 0, // NEW: 5% of non-BT credit card balances
    category = 'C',
    creditScore,
    employmentType,
    age,
    existingLoanBanks,
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
    govtMultiplier,
    govtMaxTenure,
    // Balance Transfer fields
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding,
    // Incentive Overrides
    incentivePercentageOverride,
    incentiveMonthsOverride
  } = userData;

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : (poonawalaConfig.incentivePercentage || 0);

  const effectiveIncentiveMonths = incentiveMonthsOverride !== undefined 
    ? incentiveMonthsOverride 
    : 3; // Default to 3 months if not specified

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const actualMonthlyIncome = (basicSalary || 0) + bankIncentiveConsidered;
  
  // Use actualMonthlyIncome for all subsequent calculations
  const monthlyIncomeForCalc = actualMonthlyIncome;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = existingEMI - btTotalEMI;
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from Poonawala Finance
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const poonawalaNames = ['poonawala', 'poonawalla', 'poonawala finance', 'poonawalla finance'];
    const hasExistingPoonawalaLoan = existingLoanBanks.some(bank =>
      poonawalaNames.some(name => bank.includes(name))
    );

    if (hasExistingPoonawalaLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Poonawala Finance with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Determine customer segment and city tier
  const customerSegment = getCustomerSegment(category);
  const cityTier = getCityTier(userData.city || userData.location, userData.state);

  // Check CIBIL eligibility (Excel Row 93: 700 MINIMUM, 0 and -1 allowed for Tier 1, 2 cities & Cat A)
  const cibilScoreVal = Number(creditScore ?? userData.cibilScore ?? 750);
  const isNtc = cibilScoreVal === -1 || cibilScoreVal === 0 || String(creditScore) === '-1' || String(userData.cibilScore) === '-1';
  if (isNtc) {
    const isEligibleForNtc = customerSegment === 'SUPER-A' || customerSegment === 'A' || cityTier === 'METRO' || cityTier === 'TIER 1' || cityTier === 'TIER 2';
    if (!isEligibleForNtc) {
      return {
        eligible: false,
        reason: 'Poonawalla Fincorp permits New to Credit (0 or -1 CIBIL) only for Category Super A / A or Tier 1 & Tier 2 cities (Excel Row 93: 0,-1 ALLOWED IN TIER 1, 2 CITIES & CAT A CATEGORY).'
      };
    }
  } else if (cibilScoreVal > 0 && cibilScoreVal < (poonawalaConfig.minCreditScore || 700)) {
    return {
      eligible: false,
      reason: `Poonawalla Fincorp requires minimum CIBIL score of ${poonawalaConfig.minCreditScore || 700} (Excel Row 93: 700 MINIMUM). Current CIBIL: ${cibilScoreVal}`
    };
  }

  // Check work experience (Excel Row 10: 2YEARS)
  const totalExp = Number(userData.totalWorkExperience || userData.workExperience || userData.currentCompanyExperience || 0);
  if (totalExp > 0 && totalExp < (poonawalaConfig.minExperienceMonths || 24)) {
    return {
      eligible: false,
      reason: `Poonawalla Fincorp requires minimum 2 years (24 months) total work experience (Excel Row 10: MINI WORK EXPRINCE: 2YEARS). Found: ${totalExp} months.`
    };
  }

  // Check active Credit Card POS limit (Excel Row 11: CC POS MORE THEN 4 TIME NOT ALLOW)
  const activeCcOutstanding = (userData.creditCards || [])
    .filter(c => !c.isBT)
    .reduce((sum, c) => sum + (parseFloat(c.outstandingAmount || c.creditLimitUsed || 0)), 0);
  if (activeCcOutstanding > (monthlyIncomeForCalc * 4)) {
    return {
      eligible: false,
      reason: `Poonawalla policy restricts Credit Card Outstanding exceeding 4x monthly income (Excel Row 11: CC POS MORE THEN 4 TIME NOT ALLOW). Active CC POS: ₹${activeCcOutstanding.toLocaleString()}, 4x Income: ₹${(monthlyIncomeForCalc * 4).toLocaleString()}`
    };
  }

  // Check minimum requested loan amount (Excel Row 26: MINIMUM LOAN AMOUNT: 1LAC)
  if (desiredLoanAmount && desiredLoanAmount < (poonawalaConfig.minLoanAmount || 100000)) {
    return {
      eligible: false,
      reason: `Requested loan amount (₹${desiredLoanAmount.toLocaleString()}) is below Poonawalla Fincorp minimum loan limit of ₹${(poonawalaConfig.minLoanAmount || 100000).toLocaleString()}`
    };
  }

  // Check age eligibility (Excel Row 90: MIN 21 YRS / MAX 60 YRS)
  if (age && (age < poonawalaConfig.minAge || age > poonawalaConfig.maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${poonawalaConfig.minAge} and ${poonawalaConfig.maxAge} years for Poonawalla Fincorp. Current age: ${age}`
    };
  }

  // Check employment type
  if (!poonawalaConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by Poonawala Finance`
    };
  }

  // Apply tenure capping based on category (Excel Row 91: CAT A 84 MONTH, CAT B, C, D 72 MONTH)
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure 
    ? govtMaxTenure 
    : (poonawalaConfig.maxTenureByCategory[customerSegment] || 72);

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  const requestedTenureMonths = (loanTenure || 5) * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  const minNTHRequired = poonawalaConfig.minSalary; // 30,000 NTH
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < minNTHRequired) {
    return { eligible: false, reason: `Minimum NTH salary of ₹${minNTHRequired.toLocaleString()} required for Poonawala Finance (Excel Row 89: MIN 30K)${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;

  // Logic Bridge: Support govtFOIR override or lookup in FOIR Matrix (Excel Section 5 Rows 77-82)
  let foirPercentage = isGovtEmployee && govtFOIR ? (govtFOIR / 100) : getNTHBandFOIR(customerSegment, incomeForCalculation);

  if (foirPercentage === null) {
    return { eligible: false, reason: `No FOIR available for ${customerSegment} segment at NTH ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
  }

  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing EMI (₹${existingEMI.toLocaleString()}) exceeds FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // Combined Category Cap and City Cap (Excel Section 5 Rows 84-87)
  const categoryMaxCap = poonawalaConfig.maxLoanByCategory[customerSegment] || poonawalaConfig.maxLoanAmount;
  const cityMaxCap = poonawalaConfig.cityLoanCapping?.[cityTier] || 2500000;
  const overallMaxCap = Math.min(categoryMaxCap, cityMaxCap);

  // Pass 1: Calculate preliminary loan with base rate
  const btCount = isBT ? (loansForBT ? loansForBT.length : 0) : 0;
  const is6YrTenure = cappedTenureMonths === 72;
  const is7YrTenure = cappedTenureMonths === 84;

  let baseRate = interestRateOverride || (isGovtEmployee && govtROI ? govtROI : poonawalaConfig.getPoonawalaRate(customerSegment, incomeForCalculation, desiredLoanAmount || 1000000, cibilScoreVal, btCount, is6YrTenure, is7YrTenure));

  const calculatedLoanAmountPass1 = calculatePrincipalFromEMI(
    availableEMI,
    baseRate,
    cappedTenureYears
  );

  const preliminaryLoanAmount = Math.min(
    calculatedLoanAmountPass1,
    desiredLoanAmount || Infinity
  );

  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, overallMaxCap);

  // Pass 2: Get correct rate based on preliminary loan amount (Excel Section 4 Rows 34-52)
  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) {
    finalInterestRate = poonawalaConfig.getPoonawalaRate(customerSegment, incomeForCalculation, preliminaryCappedLoan, cibilScoreVal, btCount, is6YrTenure, is7YrTenure);
  }

  // Recalculate loan with final rate
  const calculatedLoanAmount = calculatePrincipalFromEMI(
    availableEMI,
    finalInterestRate,
    cappedTenureYears
  );

  // Final loan amount is minimum of calculated and desired
  const finalLoanAmount = Math.min(
    calculatedLoanAmount,
    desiredLoanAmount || Infinity
  );

  const maxLoanCapAmount = Math.min(finalLoanAmount, overallMaxCap);
  const loanCapped = finalLoanAmount > overallMaxCap;


  // Apply Dynamic Bachelor Capping
  let appliedBachelorCap = false;
  let bachelorLimitAmount = null;
  let bachelorCapReasonStr = null;
  let cappedFinalLoan = maxLoanCapAmount;

  if (userData.dynamicBachelorLimitOverride !== undefined) {
    bachelorLimitAmount = userData.dynamicBachelorLimitOverride;
    if (cappedFinalLoan > bachelorLimitAmount) {
      cappedFinalLoan = bachelorLimitAmount;
      appliedBachelorCap = true;
      bachelorCapReasonStr = userData.dynamicBachelorCapReason || 'Dynamic Bachelor Capping limit applied';
    }
  } else if (poonawalaConfig.bachelorMaxLoanAmount !== undefined && userData.maritalStatus === 'single' && userData.livingStatus === 'rented') {
    bachelorLimitAmount = poonawalaConfig.bachelorMaxLoanAmount;
    if (cappedFinalLoan > bachelorLimitAmount) {
      cappedFinalLoan = bachelorLimitAmount;
      appliedBachelorCap = true;
      bachelorCapReasonStr = 'Rented Bachelor Limit Applied (Bank Default)';
    }
  }

  let btDetails = null;
  if (isBT) {
    const btFreshAmount = cappedFinalLoan - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return { eligible: false, reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds max loan (₹${Math.round(cappedFinalLoan).toLocaleString()})`, isBTMode: true };
    }
    btDetails = {
      isBTMode: true,
      loansConsolidated: loansForBT.length,
      btTotalOutstanding: Math.round(btTotalOutstanding),
      btTotalEMI: Math.round(btTotalEMI),
      freshAmountDisbursed: Math.round(btFreshAmount),
      nonBTLoansEMI: Math.round(nonBTLoansEMI),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of non-BT credit card outstanding' : 'No credit card obligation (either no CC or CC in BT)',
      totalNonBTObligations: Math.round(nonBTLoansEMI + (creditCardObligation || 0)),
      originalIncome: monthlyIncomeForCalc,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  if (cappedFinalLoan < (poonawalaConfig.minLoanAmount || 100000)) {
    return {
      eligible: false,
      reason: `Calculated loan capacity (₹${Math.round(cappedFinalLoan).toLocaleString()}) is below Poonawalla Fincorp minimum loan threshold of ₹${(poonawalaConfig.minLoanAmount || 100000).toLocaleString()}`
    };
  }

  const monthlyEMI = calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears);

  return {

    eligible: true,
    bankId: poonawalaConfig.id,
    bankName: poonawalaConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: categoryMaxCap,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    bachelorCapped: appliedBachelorCap,
    bachelorCapReason: bachelorCapReasonStr,
    regularMaxLoan: Math.round(maxLoanCapAmount),
    bachelorMaxLoanAmount: bachelorLimitAmount !== null ? Math.round(bachelorLimitAmount) : null,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    customerSegment: customerSegment,
    foirPercentage: foirPercentage,
    availableEMI: Math.round(availableEMI),
    calculationMethod: 'FOIR Only',
    incentivePercentage: effectiveIncentivePercentage, // Dynamically reflect override
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      customerSegment: customerSegment,
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      maxLoanFromFOIR: Math.round(calculatedLoanAmount),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};

