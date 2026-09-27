// SMFG India Credit Eligibility Calculator
// Strictly adheres to Master Excel Policy (BANKS POLICYS.xlsx - Sheet: SMFG)

import { smfgConfig } from './config.js';

// Calculate monthly EMI using standard formula
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyRate === 0) return principal / numberOfMonths;

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
    (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

  return Math.round(emi);
};

// Calculate principal loan amount from available EMI capacity
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyRate === 0) return emi * numberOfMonths;

  const principal = (emi * (Math.pow(1 + monthlyRate, numberOfMonths) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths));

  return Math.round(principal);
};

// Helper: Determine ROI from Excel Sheet: SMFG based on Net Income Band & Category (Section 2)
const getSmfgROI = (monthlyIncome, category) => {
  let catKey = 'A';
  const c = String(category || '').toUpperCase();
  if (c.includes('SUPER') || c === 'A' || c.includes('GOVT')) catKey = 'A';
  else if (c === 'B') catKey = 'B';
  else if (c === 'C') catKey = 'C';
  else if (c === 'D') catKey = 'D';
  else if (c === 'E') catKey = 'E';

  const roundedSal = Math.round(monthlyIncome);
  for (const row of smfgConfig.roiMatrix) {
    if (roundedSal >= row.minSalary && roundedSal <= row.maxSalary) {
      return row[catKey] ?? 17.0;
    }
  }

  return 17.0; // Default lowest rate for high salary (>100k)
};

// Helper: Determine FOIR & Multiplier from Excel Sheet: SMFG (Section 3: FOIR & Multiplier)
// Excel: As per com cat and profile base (Cat A/Govt gets maxMult, Cat B gets mid, Cat C/D gets minMult)
const getSmfgFoirAndMultiplier = (monthlyIncome, category = 'B', companyType = '') => {
  const roundedSal = Math.round(monthlyIncome);
  let baseFoir = 0.70;
  let multiplier = 25;

  const c = String(category || '').toUpperCase();
  const isHighTier = c.includes('SUPER') || c === 'A' || c.includes('GOVT');
  const isMidTier = c === 'B';

  for (const slab of smfgConfig.salaryFoirSlabs) {
    if (roundedSal >= slab.minSalary && roundedSal <= slab.maxSalary) {
      baseFoir = slab.foir;
      if (isHighTier) {
        multiplier = slab.maxMult;
      } else if (isMidTier) {
        multiplier = Math.round((slab.minMult + slab.maxMult) / 2);
      } else {
        multiplier = slab.minMult;
      }
      break;
    }
  }

  // Check special firm restriction (Excel: PROP/PART/LLP FIRM: 55% FOIR)
  const compUpper = String(companyType || '').toUpperCase();
  const isPropOrLlp = compUpper.includes('PROP') || 
                      compUpper.includes('PARTNERSHIP') || 
                      compUpper.includes('LLP') ||
                      compUpper.includes('PARTNER');
  if (isPropOrLlp) {
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
    currentCompanyExperience,
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

  const actualMonthlyIncome = (basicSalary || monthlyIncome || 0) + (averageIncentive || 0);

  // 1. AGE CHECK (Excel: 21 to Pvt 60 / Govt 65)
  if (age !== undefined && age !== null) {
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

  // 3. WORK EXPERIENCE CHECK (Excel: CURRENT COM 2 YEARS)
  if (currentCompanyExperience !== undefined && currentCompanyExperience !== null) {
    const currentExpMonths = Number(currentCompanyExperience);
    if (currentExpMonths > 0 && currentExpMonths < smfgConfig.minCurrentCompanyExperience) {
      return {
        eligible: false,
        bankName: smfgConfig.name,
        reason: `SMFG India Credit requires minimum 2 years (24 months) experience in current company (Excel: CURRENT COM 2 YEARS). Found: ${currentExpMonths} months.`
      };
    }
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

  // 6. FOIR & MULTIPLIER (Excel: Band based + PROP/PART/LLP 55%)
  const incomeForCalc = isBT ? adjustedIncome : actualMonthlyIncome;
  const { foir: defaultFoir, multiplier: defaultMultiplier, isPropOrLlp } = getSmfgFoirAndMultiplier(incomeForCalc, category, companyType || companyName);
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

  // 8. ROI (Excel Matrix: Net Income Band vs Category)
  const dynamicROI = getSmfgROI(actualMonthlyIncome, category);
  const effectiveInterestRate = interestRateOverride || dynamicROI;

  // 9. LOAN CAPACITY (EMI capacity, Multiplier capacity, and Capping)
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, effectiveInterestRate, tenureYears);
  const multiplierLoanAmount = actualMonthlyIncome * effectiveMultiplier;
  let calculatedLoanAmount = Math.min(foirLoanAmount, multiplierLoanAmount);

  if (desiredLoanAmount && desiredLoanAmount > 0) {
    calculatedLoanAmount = Math.min(calculatedLoanAmount, desiredLoanAmount);
  }

  // 10. LOAN AMOUNT CAPPING (Excel: 1LAC to 30LAC across all)
  const maxCap = maxLoanOverride || smfgConfig.maxLoanAmount;
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
    isPropOrLlp: isPropOrLlp,
    btDetails: btDetails,
    isBTMode: isBT
  };
};
