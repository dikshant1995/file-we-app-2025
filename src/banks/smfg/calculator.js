// SMFG India Credit Eligibility Calculator
// Strictly adheres to Master Excel Policy (BANKS POLICYS.xlsx - Sheet: SMFG)

import { smfgConfig } from './config.js';
import { getAllBankConfig } from '../../services/bankConfigService.js';

// Calculate monthly EMI using standard formula
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  if (!principal || principal <= 0) return 0;
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyRate === 0) return Math.round(principal / numberOfMonths);

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
    (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

  return Math.round(emi);
};

// Calculate principal loan amount from available EMI capacity
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  if (!emi || emi <= 0) return 0;
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyRate === 0) return Math.round(emi * numberOfMonths);

  const principal = (emi * (Math.pow(1 + monthlyRate, numberOfMonths) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths));

  return Math.round(principal);
};

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

// Helper: Determine ROI from Excel Sheet: SMFG based on Net Income Band & Category (A to E)
const getSmfgROI = (monthlyIncome, category = 'B') => {
  const roundedSal = Math.round(monthlyIncome || 0);
  const catUpper = String(category || 'B').toUpperCase().trim();
  
  let col = 'B';
  if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') col = 'A';
  else if (catUpper === 'B') col = 'B';
  else if (catUpper === 'C') col = 'C';
  else if (catUpper === 'D') col = 'D';
  else col = 'E'; // Unlisted / E

  const row = smfgConfig.roiMatrix.find(r => roundedSal >= r.minSalary && roundedSal <= r.maxSalary) || smfgConfig.roiMatrix[smfgConfig.roiMatrix.length - 1];

  return row ? (row[col] || 20.0) : 20.0;
};

// Helper: Determine FOIR & Multiplier from Dynamic Admin Slabs or Excel Policy
const getSmfgFoirAndMultiplier = (monthlyIncome, companyType = '', configData = null) => {
  const roundedSal = Math.round(monthlyIncome || 0);
  let baseFoir = 0.70;
  let multiplier = 30;

  const slabs = configData?.salaryBandsFoirAndMultiplier;
  if (Array.isArray(slabs) && slabs.length > 0) {
    const match = slabs.find(s => roundedSal >= Number(s.minSalary) && roundedSal <= Number(s.maxSalary));
    if (match) {
      baseFoir = Number(match.maxFoir) / 100;
      multiplier = Number(match.multiplier);
    }
  } else {
    if (roundedSal < 25000) {
      baseFoir = 0.00;
      multiplier = 0;
    } else if (roundedSal <= 30000) {
      baseFoir = 0.60;
      multiplier = 13;
    } else if (roundedSal <= 35000) {
      baseFoir = 0.65;
      multiplier = 16;
    } else if (roundedSal <= 40000) {
      baseFoir = 0.70;
      multiplier = 18;
    } else if (roundedSal <= 50000) {
      baseFoir = 0.70;
      multiplier = 20;
    } else if (roundedSal <= 75000) {
      baseFoir = 0.70;
      multiplier = 25;
    } else {
      baseFoir = 0.70;
      multiplier = 30;
    }
  }

  // Check special firm restriction (Excel: PROP/PART/LLP FIRM: 55% FOIR)
  const compUpper = String(companyType || '').toUpperCase();
  const isPropOrLlp = compUpper.includes('PROP') || 
                      compUpper.includes('PARTNERSHIP') || 
                      compUpper.includes('LLP') ||
                      compUpper.includes('PARTNER');
  if (isPropOrLlp && baseFoir > 0) {
    baseFoir = Math.min(baseFoir, smfgConfig.propPartLlpMaxFoir);
  }

  return { foir: baseFoir, multiplier, isPropOrLlp };
};

export const calculateSmfgEligibility = (userData, adminBankConfig) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation = 0,
    category = 'B',
    employmentType = 'salaried',
    age,
    companyName,
    companyType,
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding,
    interestRateOverride,
    foirOverride,
    multiplierOverride,
    maxTenureOverride,
    maxLoanOverride
  } = userData;

  // Dynamic policy from admin
  const adminConfig = adminBankConfig || getAllBankConfig('SMFG India Credit', userData.city || userData.state);

  const baseSalaryVal = (basicSalary !== undefined && basicSalary !== null && basicSalary > 0) ? basicSalary : (monthlyIncome || 0);
  const actualMonthlyIncome = baseSalaryVal + (averageIncentive || 0);

  // 1. AGE CHECK (Excel: 21 to Pvt 60 / Govt 65)
  if (age !== undefined && age !== null && age > 0) {
    const isGovt = employmentType === 'government';
    const maxAllowedAge = isGovt ? smfgConfig.maxAgeGovt : smfgConfig.maxAgePvt;
    if (age < smfgConfig.minAge) {
      return {
        eligible: false,
        bankName: smfgConfig.name,
        reason: `Applicant age must be at least ${smfgConfig.minAge} years (Excel: 21). Current: ${age}`
      };
    }
    if (age > maxAllowedAge) {
      return {
        eligible: false,
        bankName: smfgConfig.name,
        reason: `Maximum age at loan time is ${maxAllowedAge} years for ${isGovt ? 'Govt/Pensioner' : 'Private'} employees (Excel: PVT 60 AND GOVT 65). Current: ${age}`
      };
    }
  }

  // 2. MINIMUM SALARY CHECK (Excel: 25K+ SALARY WITH 0 DEDUCTION)
  if (actualMonthlyIncome < smfgConfig.minSalary) {
    return {
      eligible: false,
      bankName: smfgConfig.name,
      reason: `SMFG India Credit requires minimum monthly salary of ₹${smfgConfig.minSalary.toLocaleString()} (Excel: 25K+ SALARY WITH 0 DEDUCTION). Current: ₹${actualMonthlyIncome.toLocaleString()}`
    };
  }

  // 3. WORK EXPERIENCE CHECK & CAPPING (3 MONTH FOR UP TO 15L AND 15L ABOVE 2YEARS)
  const workExpMonths = parseWorkExperienceMonths(userData);
  if (workExpMonths < 3) {
    return {
      eligible: false,
      bankName: smfgConfig.name,
      reason: `SMFG India Credit requires a minimum of 3 months work experience. Provided experience is less than 3 months.`
    };
  }

  let workExpMaxCap = Infinity;
  if (workExpMonths <= 24) {
    workExpMaxCap = 1500000; // Capped at ₹15 Lakhs for 3 months to 2 years
  }

  // 4. BALANCE TRANSFER GATES (Excel: MAX CC BT: 2 CC BT)
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let nonBTLoansEMI = 0;
  let adjustedIncome = actualMonthlyIncome;

  if (isBT) {
    const ccLoans = (loansForBT || []).filter(l => l.loanType === 'credit_card' || l.type === 'Credit Card');
    if (ccLoans.length > smfgConfig.btConfig.maxCreditCardsForBT) {
      return {
        eligible: false,
        bankName: smfgConfig.name,
        reason: `SMFG India Credit allows maximum ${smfgConfig.btConfig.maxCreditCardsForBT} Credit Cards for Balance Transfer (found ${ccLoans.length}). Policy: 2 CC BT`,
        isBTMode: true
      };
    }

    nonBTLoansEMI = Math.max(0, existingEMI - (btTotalEMI || 0));
    adjustedIncome = actualMonthlyIncome - nonBTLoansEMI - (creditCardObligation || 0);

    if (adjustedIncome < smfgConfig.minSalary) {
      return {
        eligible: false,
        bankName: smfgConfig.name,
        reason: `After deducting non-BT obligations, remaining income (₹${Math.round(adjustedIncome).toLocaleString()}) is below minimum ₹${smfgConfig.minSalary.toLocaleString()}.`,
        isBTMode: true
      };
    }
  }

  // 5. TENURE DETERMINATION (Excel: 12 to 60 Months across all categories)
  const catKey = String(category || '').toUpperCase();
  const maxTenureMonthsAllowed = maxTenureOverride || smfgConfig.maxTenureByCategory[catKey] || smfgConfig.maxLoanTenureMonths;
  const requestedTenureMonths = loanTenure ? (loanTenure * 12) : 60;
  const tenureMonths = Math.min(requestedTenureMonths, maxTenureMonthsAllowed);
  const tenureYears = tenureMonths / 12;

  // 6. FOIR & MULTIPLIER (Excel / Dynamic Admin Slabs)
  const incomeForCalc = isBT ? adjustedIncome : actualMonthlyIncome;
  const { foir: defaultFoir, multiplier: defaultMultiplier, isPropOrLlp } = getSmfgFoirAndMultiplier(incomeForCalc, companyType || companyName, adminConfig);
  const effectiveFOIR = foirOverride ? (foirOverride / 100) : defaultFoir;
  const effectiveMultiplier = multiplierOverride ? Number(multiplierOverride) : defaultMultiplier;

  // 7. OBLIGATIONS & AVAILABLE EMI
  const ccObligation = creditCardObligation || Math.round(actualMonthlyIncome * smfgConfig.creditCardObligationPercent);
  const totalObligations = isBT ? nonBTLoansEMI : (existingEMI + ccObligation);
  const foirCap = incomeForCalc * effectiveFOIR;
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      bankName: smfgConfig.name,
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed ${(effectiveFOIR * 100).toFixed(0)}% FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // 8. ROI (Excel Matrix: Net Income Band & Category based)
  const dynamicROI = getSmfgROI(actualMonthlyIncome, category);
  const effectiveInterestRate = interestRateOverride || dynamicROI;

  // 9. LOAN CAPACITY (EMI capacity, Multiplier capacity, and Capping)
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, effectiveInterestRate, tenureYears);
  const multiplierLoanAmount = actualMonthlyIncome * effectiveMultiplier;
  let calculatedLoanAmount = Math.min(foirLoanAmount, multiplierLoanAmount);

  if (desiredLoanAmount && desiredLoanAmount > 0) {
    calculatedLoanAmount = Math.min(calculatedLoanAmount, desiredLoanAmount);
  }

  // 10. LOAN AMOUNT CAPPING (Excel: 1LAC to 30LAC across all & Work Experience Capping)
  const maxCap = Math.min(maxLoanOverride || smfgConfig.maxLoanAmount, workExpMaxCap);
  const finalLoanAmount = Math.min(calculatedLoanAmount, maxCap);

  if (finalLoanAmount < smfgConfig.minLoanAmount) {
    return {
      eligible: false,
      bankName: smfgConfig.name,
      reason: `Calculated loan amount (₹${Math.round(finalLoanAmount).toLocaleString()}) is below SMFG minimum ticket size of ₹${smfgConfig.minLoanAmount.toLocaleString()} (1LAC).`
    };
  }

  // 11. BT POST-PROCESSING
  let btDetails = null;
  if (isBT) {
    const btFreshAmount = finalLoanAmount - (btTotalOutstanding || 0);
    if (btFreshAmount < 0) {
      return {
        eligible: false,
        bankName: smfgConfig.name,
        reason: `BT Outstanding (₹${(btTotalOutstanding || 0).toLocaleString()}) exceeds maximum eligible loan of ₹${Math.round(finalLoanAmount).toLocaleString()}`,
        isBTMode: true
      };
    }
    btDetails = {
      isBTMode: true,
      loansConsolidated: loansForBT.length,
      btTotalOutstanding: Math.round(btTotalOutstanding || 0),
      btTotalEMI: Math.round(btTotalEMI || 0),
      freshAmountDisbursed: Math.round(btFreshAmount),
      nonBTLoansEMI: Math.round(nonBTLoansEMI),
      creditCardObligation: Math.round(ccObligation),
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const finalEMI = calculateEMI(finalLoanAmount, effectiveInterestRate, tenureYears);
  const processingFeePct = adminConfig?.feesAndCharges?.processingFeePercentage || (finalLoanAmount < 300000 ? 3.5 : 2.5);

  return {
    eligible: true,
    bankName: smfgConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanAmount: Math.round(finalLoanAmount),
    monthlyEMI: finalEMI,
    interestRate: effectiveInterestRate,
    loanTenure: tenureYears,
    loanTenureMonths: tenureMonths,
    foirPercentage: effectiveFOIR,
    multiplier: effectiveMultiplier,
    maxLoanCap: maxCap,
    processingFee: processingFeePct,
    workExperienceMonths: workExpMonths,
    workExperienceCapped: workExpMonths <= 24 && calculatedLoanAmount > 1500000,
    isPropOrLlp: isPropOrLlp,
    btDetails: btDetails,
    isBTMode: isBT
  };
};
