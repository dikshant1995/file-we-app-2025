import { idfcConfig } from './config.js';
import { getBankConfig } from '../../utils/configHelper.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper to parse work experience in months
const parseWorkExperienceMonths = (userData) => {
  if (userData.workExperience === 'below_3m') return 2;
  if (userData.workExperience === '3m_to_24m') return 12;
  if (userData.workExperience === 'above_24m') return 25;

  const val = userData.workExperienceMonths ?? userData.workExperience ?? userData.totalWorkExperience ?? userData.currentCompanyExperience;
  if (val !== undefined && val !== null && !isNaN(Number(val)) && Number(val) >= 0) {
    return Number(val);
  }
  return 25; // Default to eligible (> 2 years) if unspecified
};

// Helper to look up dynamic FOIR from IDFC Table 1 (idfcFoirMatrix)
const getIdfcFoirFromMatrix = (monthlyIncome, category, foirMatrix) => {
  if (!foirMatrix || !Array.isArray(foirMatrix) || foirMatrix.length === 0) return null;
  const roundedSal = Math.round(monthlyIncome || 0);

  let row = null;
  if (category === 'Govt' || category === 'GOVT') {
    row = foirMatrix.find(r => r.nthBand === 'GOVT');
  }
  if (!row || row.catSaAB === 'Policy Rules Apply') {
    if (roundedSal < 40000) {
      row = foirMatrix.find(r => r.nthBand && (r.nthBand.includes('20K') || r.nthBand.includes('40K')));
    } else if (roundedSal <= 50000) {
      row = foirMatrix.find(r => r.nthBand && r.nthBand.includes('40K - 50K'));
    } else if (roundedSal <= 75000) {
      row = foirMatrix.find(r => r.nthBand && r.nthBand.includes('50K - 75K'));
    } else {
      row = foirMatrix.find(r => r.nthBand && (r.nthBand.includes('> 75K') || r.nthBand.includes('75K')));
    }
  }
  if (!row) row = foirMatrix[foirMatrix.length - 1];
  if (!row) return null;

  const catUpper = String(category || '').toUpperCase();
  const isSaAB = catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'B' || catUpper === 'SA' || catUpper === 'GOVT';
  const val = isSaAB ? row.catSaAB : row.catCD;
  const numVal = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return !isNaN(numVal) && numVal > 0 ? numVal / 100 : null;
};

// Helper to look up dynamic Multiplier from IDFC Table 2 (idfcMultiplierMatrix)
const getIdfcMultiplierFromMatrix = (monthlyIncome, category, multiplierMatrix) => {
  if (!multiplierMatrix || !Array.isArray(multiplierMatrix) || multiplierMatrix.length === 0) return null;
  const roundedSal = Math.round(monthlyIncome || 0);

  const catUpper = String(category || '').toUpperCase();
  let row = null;
  if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'SA') {
    row = multiplierMatrix.find(r => String(r.category).toUpperCase().includes('CAT SA') || String(r.category).toUpperCase().includes('CAT A'));
  } else if (catUpper === 'B') {
    row = multiplierMatrix.find(r => String(r.category).toUpperCase().includes('CAT B'));
  } else if (catUpper === 'C') {
    row = multiplierMatrix.find(r => String(r.category).toUpperCase().includes('CAT C'));
  } else if (catUpper === 'D') {
    row = multiplierMatrix.find(r => String(r.category).toUpperCase().includes('CAT D'));
  }

  if (!row) row = multiplierMatrix[0];
  if (!row) return null;

  let val = 0;
  if (roundedSal < 50000) val = row.nthLt50k;
  else if (roundedSal <= 75000) val = row.nth50kTo75k;
  else val = row.nthGt75k;

  const numVal = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return !isNaN(numVal) && numVal > 0 ? numVal : null;
};

// Helper to look up dynamic ROI from IDFC Tables 3, 4, 5, 6
const getIdfcRoiFromMatrix = (creditScore, loanAmount, category, isBT, idfcPolicy) => {
  let matrix = null;
  if (isBT && Array.isArray(idfcPolicy?.idfcBtMinRoiMatrix) && idfcPolicy.idfcBtMinRoiMatrix.length > 0) {
    matrix = idfcPolicy.idfcBtMinRoiMatrix;
  } else {
    const catUpper = String(category || '').toUpperCase();
    if ((catUpper === 'C' || catUpper === 'D') && Array.isArray(idfcPolicy?.idfcNonBtCatCdRoiMatrix) && idfcPolicy.idfcNonBtCatCdRoiMatrix.length > 0) {
      matrix = idfcPolicy.idfcNonBtCatCdRoiMatrix;
    } else if (Array.isArray(idfcPolicy?.idfcNonBtCatAceRoiMatrix) && idfcPolicy.idfcNonBtCatAceRoiMatrix.length > 0) {
      matrix = idfcPolicy.idfcNonBtCatAceRoiMatrix;
    } else if (Array.isArray(idfcPolicy?.idfcBaseRoiMatrix) && idfcPolicy.idfcBaseRoiMatrix.length > 0) {
      matrix = idfcPolicy.idfcBaseRoiMatrix;
    }
  }

  if (!matrix || matrix.length === 0) return null;

  const score = creditScore !== undefined && creditScore !== null && Number(creditScore) > 0 ? Number(creditScore) : 750;
  let row = null;
  if (score >= 775) {
    row = matrix.find(r => r.scoreBand.includes('775') || r.scoreBand.includes('725+'));
  } else if (score >= 750) {
    row = matrix.find(r => r.scoreBand.includes('750') || r.scoreBand.includes('725+'));
  } else if (score >= 725) {
    row = matrix.find(r => r.scoreBand.includes('725'));
  } else if (score >= 700) {
    row = matrix.find(r => r.scoreBand.includes('700'));
  } else {
    row = matrix.find(r => r.scoreBand.includes('LT 700') || r.scoreBand.includes('< 700'));
  }

  if (!row) row = matrix[matrix.length - 1];
  if (!row) return null;

  let colVal = 0;
  if (loanAmount < 500000) colVal = row.lt5L;
  else if (loanAmount <= 1000000) colVal = row.l5To10L;
  else if (loanAmount <= 1500000) colVal = row.l10To15L;
  else colVal = row.gt15L;

  const numVal = parseFloat(String(colVal).replace(/[^0-9.]/g, ''));
  return !isNaN(numVal) && numVal > 0 ? numVal : null;
};

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' ? 'A' : category;
  return getSlabRate('IDFC First Bank', lookupCategory, loanAmount, location, idfcConfig.interestRate);
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

// Reverse calculation: Calculate principal from available EMI
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

// Helper function to get salary band for a specific category
const getSalaryBand = (salary, category, table) => {
  const categoryBands = table[category];
  if (!categoryBands) return null;

  for (const band of Object.keys(categoryBands)) {
    if (band.includes('+')) {
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) return band;
    } else if (band.startsWith('>=')) {
      const min = parseInt(band.replace('>=', ''));
      if (salary >= min) return band;
    } else if (band.startsWith('>')) {
      const min = parseInt(band.replace('>', ''));
      if (salary > min) return band;
    } else if (band.startsWith('<=')) {
      const max = parseInt(band.replace('<=', ''));
      if (salary <= max) return band;
    } else if (band.startsWith('<')) {
      const max = parseInt(band.replace('<', ''));
      if (salary < max) return band;
    } else {
      const parts = band.split('-');
      if (parts.length === 2) {
        const min = parseInt(parts[0]);
        const max = parseInt(parts[1]);
        if (salary >= min && salary <= max) return band;
      }
    }
  }
  return null;
};

// IDFC Bank specific eligibility calculation
export const calculateIdfcEligibility = (userData, adminBankConfig) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation,
    category = 'C',
    creditScore,
    employmentType,
    age,
    existingLoanBanks,
    // Admin Overrides
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

  // Retrieve Dynamic Bank Config from Admin
  const adminConfig = adminBankConfig || getBankConfig('IDFC First Bank');

  // ========== WORK EXPERIENCE CHECK & CAPPING ==========
  const workExpMonths = parseWorkExperienceMonths(userData);
  if (workExpMonths < 3) {
    return {
      eligible: false,
      reason: `IDFC Bank requires a minimum of 3 months work experience. Provided experience is less than 3 months.`
    };
  }

  // Work experience capping rule: 3 MONTH FOR UP TO 15L AND 15L ABOVE 2YEARS
  let workExpMaxCap = Infinity;
  if (workExpMonths <= 24) {
    workExpMaxCap = 1500000; // Capped at ₹15 Lakhs for 3 months to 2 years
  }

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : (idfcConfig.incentivePercentage || 0);

  const effectiveIncentiveMonths = incentiveMonthsOverride !== undefined 
    ? incentiveMonthsOverride 
    : 3;

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const actualMonthlyIncome = (basicSalary || 0) + bankIncentiveConsidered;
  
  const monthlyIncomeForCalc = actualMonthlyIncome;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = existingEMI - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from IDFC Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const idfcNames = ['idfc', 'idfc bank', 'idfc first', 'idfc first bank'];
    const hasExistingIdfcLoan = existingLoanBanks.some(bank =>
      idfcNames.some(name => bank.includes(name))
    );

    if (hasExistingIdfcLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of IDFC Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility
  const ageConfig = getBankConfig('IDFC First Bank', 'ageRules');
  const minAge = ageConfig ? ageConfig.minAge : idfcConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : idfcConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  const empTypeLower = String(employmentType || 'salaried').toLowerCase();
  const isSupportedEmp = idfcConfig.employmentTypes.some(t => t.toLowerCase() === empTypeLower || empTypeLower.includes(t.toLowerCase()) || t.toLowerCase().includes(empTypeLower));
  if (!isSupportedEmp) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by IDFC Bank`
    };
  }

  let mappedCategory = category === 'A+' ? 'SUPER-A' : category;
  if (mappedCategory === 'Govt') mappedCategory = 'A';

  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : idfcConfig.maxTenureByCategory[mappedCategory];

  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${mappedCategory}`
    };
  }

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  if (loanTenure > idfcConfig.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${idfcConfig.maxLoanTenure} years`
    };
  }

  if (category === 'UNLISTED') {
    return {
      eligible: false,
      reason: 'IDFC Bank does not provide loans to UNLISTED category employees'
    };
  }

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < idfcConfig.minSalary) {
    return { eligible: false, reason: `Minimum salary of ₹${idfcConfig.minSalary.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;
  
  const multiplierSalaryBand = getSalaryBand(incomeForCalculation, mappedCategory, idfcConfig.multiplierTable);
  const foirSalaryBand = getSalaryBand(incomeForCalculation, mappedCategory, idfcConfig.foirTable);

  // Evaluate dynamic FOIR & Multiplier from Table 1 & Table 2
  const dynamicFoir = getIdfcFoirFromMatrix(incomeForCalculation, mappedCategory, adminConfig?.idfcFoirMatrix);
  const dynamicMultiplier = getIdfcMultiplierFromMatrix(incomeForCalculation, mappedCategory, adminConfig?.idfcMultiplierMatrix);

  let multiplier = isGovtEmployee && govtMultiplier 
    ? govtMultiplier 
    : (dynamicMultiplier || (idfcConfig.multiplierTable[mappedCategory] ? idfcConfig.multiplierTable[mappedCategory][multiplierSalaryBand] : 20));

  let foirPercentage = isGovtEmployee && govtFOIR 
    ? (govtFOIR / 100) 
    : (dynamicFoir || (idfcConfig.foirTable[mappedCategory] ? idfcConfig.foirTable[mappedCategory][foirSalaryBand] : 0.65));

  if (!multiplier) {
    return { eligible: false, reason: `No multiplier available for category ${mappedCategory} at salary ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
  }
  if (!foirPercentage) {
    return { eligible: false, reason: `No FOIR percentage available for category ${mappedCategory} at salary ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
  }

  // MULTIPLIER PATH
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // FOIR PATH
  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);
  
  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // Pass 1: Preliminary ROI for initial calculation
  const baseRate = idfcConfig.interestRate;
  const preliminaryFoirLoanAmount = calculatePrincipalFromEMI(availableEMI, baseRate, cappedTenureYears);

  const preliminaryLoanAmount = Math.min(
    multiplierLoanAmount,
    preliminaryFoirLoanAmount,
    desiredLoanAmount || Infinity
  );

  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, idfcConfig.maxLoanAmount);

  // Dynamic ROI from Tables 3, 4, 5, 6
  let dynamicRoi = getIdfcRoiFromMatrix(creditScore, preliminaryCappedLoan, mappedCategory, isBT, adminConfig);

  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = dynamicRoi || getInterestRateForLoan(mappedCategory, preliminaryCappedLoan, userData.city || userData.state);

  // Pass 2: Calculate FOIR loan amount with final ROI
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  // Final loan amount before work exp and bank caps
  const finalLoanAmount = Math.min(
    multiplierLoanAmount,
    foirLoanAmount,
    desiredLoanAmount || Infinity
  );

  const effectiveMaxCap = Math.min(idfcConfig.maxLoanAmount, workExpMaxCap);
  const maxLoanCapAmount = Math.min(finalLoanAmount, effectiveMaxCap);
  const loanCapped = finalLoanAmount > effectiveMaxCap;

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
  } else if (idfcConfig.bachelorMaxLoanAmount !== undefined && userData.maritalStatus === 'single' && userData.livingStatus === 'rented') {
    bachelorLimitAmount = idfcConfig.bachelorMaxLoanAmount;
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

  const monthlyEMI = calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: idfcConfig.id,
    bankName: idfcConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: effectiveMaxCap,
    loanCappedByBank: loanCapped,
    workExperienceMonths: workExpMonths,
    workExperienceCapped: workExpMonths <= 24 && finalLoanAmount > 1500000,
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
    multiplier: multiplier,
    foirPercentage: foirPercentage,
    salaryBand: multiplierSalaryBand,
    category: mappedCategory,
    availableEMI: Math.round(availableEMI),
    foirLoanAmount: Math.round(foirLoanAmount),
    multiplierLoanAmount: Math.round(multiplierLoanAmount),
    calculationMethod: 'Combined (Dual)',
    incentivePercentage: effectiveIncentivePercentage,
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      multiplier: multiplier + 'x',
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      salaryBand: multiplierSalaryBand,
      foirBand: foirSalaryBand,
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      foirLoanAmount: Math.round(foirLoanAmount),
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      limitingFactor: finalLoanAmount === foirLoanAmount ? 'FOIR' : 'Multiplier',
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};


