import { piramalConfig } from './config.js';
import { getBankConfig, getAllBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper function to get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' ? 'A' : category;
  return getSlabRate('Piramal Finance', lookupCategory, loanAmount, location, piramalConfig.interestRate);
};

// Function to calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  if (!principal || principal <= 0) return 0;
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return Math.round(principal / numberOfMonths);
  }

  const emi = principal * monthlyInterestRate *
    (Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);

  return Math.round(emi);
};

// Reverse calculation: Calculate principal from available EMI
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  if (!emi || emi <= 0) return 0;
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return Math.round(emi * numberOfMonths);
  }

  const r = monthlyInterestRate;
  const n = numberOfMonths;
  const principal = (emi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));

  return Math.round(principal);
};

// Helper function to get NTH band for FOIR
const getNTHBand = (nth, nthFoirTable) => {
  if (!nthFoirTable) return 0.70;
  for (const [band, data] of Object.entries(nthFoirTable)) {
    if (band.includes('+')) {
      const min = parseInt(band.replace('+', ''));
      if (nth >= min) {
        return data.foir;
      }
    } else {
      const [min, max] = band.split('-').map(s => parseInt(s));
      if (nth >= min && nth <= max) {
        return data.foir;
      }
    }
  }
  return 0.70;
};

// Helper function to get Ventile Band & Multipliers based on CIBIL Score range (700 to 800+)
const getCibilVentileBand = (cibilScore, customBands = null) => {
  const score = Number(cibilScore) || 0;
  if (Array.isArray(customBands) && customBands.length > 0) {
    let matchedBand = customBands.find(b => score >= (b.minCibil ?? 0) && score <= (b.maxCibil ?? 900));
    if (!matchedBand) {
      if (score >= 775) matchedBand = customBands[customBands.length - 1];
      else if (score >= 750) matchedBand = customBands[3] || customBands[customBands.length - 1];
      else if (score >= 730) matchedBand = customBands[2] || customBands[0];
      else if (score >= 700) matchedBand = customBands[1] || customBands[0];
      else matchedBand = customBands[0];
    }
    if (matchedBand) {
      return {
        band: matchedBand.ventileBand || 'V-Band',
        cibilRange: matchedBand.cibilRange || '700+',
        foir: (matchedBand.highFoir || 70) / 100,
        eliteMult: Number(matchedBand.eliteMult ?? 30),
        catBCMult: Number(matchedBand.catBCMult ?? 22),
        govtHighNmiMult: Number(matchedBand.govtHighNmiMult ?? 20),
        govtLowNmiMult: Number(matchedBand.govtLowNmiMult ?? 15),
        btGovtHighNmiMult: Number(matchedBand.btGovtHighNmiMult ?? 24),
        othersMult: Number(matchedBand.othersMult ?? 18)
      };
    }
  }

  if (score >= 775) {
    return { band: 'V13-V20', cibilRange: '775 – 800+', foir: 0.70, eliteMult: 30, catBCMult: 22, govtHighNmiMult: 20, govtLowNmiMult: 15, btGovtHighNmiMult: 24, othersMult: 18 };
  } else if (score >= 750) {
    return { band: 'V10-V12', cibilRange: '750 – 774', foir: 0.70, eliteMult: 24, catBCMult: 15, govtHighNmiMult: 15, govtLowNmiMult: 12, btGovtHighNmiMult: 18, othersMult: 12 };
  } else if (score >= 730) {
    return { band: 'V8-V9', cibilRange: '730 – 749', foir: 0.70, eliteMult: 15, catBCMult: 10, govtHighNmiMult: 8, govtLowNmiMult: 8, btGovtHighNmiMult: 10, othersMult: 8 };
  } else if (score >= 700) {
    return { band: 'V6-V7', cibilRange: '700 – 729', foir: 0.60, eliteMult: 9, catBCMult: 7.5, govtHighNmiMult: 6, govtLowNmiMult: 6, btGovtHighNmiMult: 7, othersMult: 6 };
  } else {
    return { band: 'NTC / V4-V5', cibilRange: '< 700 / NTC', foir: 0.55, eliteMult: 7.5, catBCMult: 6, govtHighNmiMult: 5, govtLowNmiMult: 5, btGovtHighNmiMult: 5, othersMult: 5 };
  }
};

// Piramal Finance specific eligibility calculation
export const calculatePiramalEligibility = (userData, adminBankConfig) => {
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
    cibilScore,
    employmentType = 'salaried',
    age,
    totalWorkExperience,
    currentCompanyExperience,
    workExperience,
    existingLoanBanks,
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    foirOverride,
    multiplierOverride,
    maxTenureOverride,
    maxLoanOverride,
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
  const adminConfig = adminBankConfig || getAllBankConfig('Piramal Finance', userData.city || userData.state);

  // 1. BALANCE TRANSFER RESTRICTION CHECK (2 CC BT ALLOW WITH 1 PL BT)
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  if (isBT) {
    const plLoans = (loansForBT || []).filter(l => l.loanType !== 'credit_card' && l.type !== 'Credit Card');
    const ccLoans = (loansForBT || []).filter(l => l.loanType === 'credit_card' || l.type === 'Credit Card');

    if (plLoans.length > 1) {
      return {
        eligible: false,
        reason: `Piramal Finance permits maximum 1 Personal Loan for Balance Transfer (found ${plLoans.length}). Policy: 2 CC BT ALLOW WITH 1 PL BT`,
        isBTMode: true
      };
    }

    if (ccLoans.length > 2) {
      return {
        eligible: false,
        reason: `Piramal Finance permits maximum 2 Credit Cards for Balance Transfer (found ${ccLoans.length}). Policy: 2 CC BT ALLOW WITH 1 PL BT`,
        isBTMode: true
      };
    }

    if (ccLoans.length > 0 && plLoans.length === 0) {
      return {
        eligible: false,
        reason: 'Piramal Finance requires 1 Personal Loan BT along with Credit Card BT. Standalone Credit Card BT is not allowed (Policy: 2 CC BT ALLOW WITH 1 PL BT).',
        isBTMode: true
      };
    }
  }

  // 2. PF / PPF DEDUCTION REQUIREMENT CHECK (Excel: 22+PF DEDUCT REQ)
  const isPfDeducted = userData.hasPpfDeduction !== undefined 
    ? userData.hasPpfDeduction 
    : (userData.hasPfDeduction !== undefined ? userData.hasPfDeduction : true);

  if (!isPfDeducted) {
    return {
      eligible: false,
      reason: 'Piramal Finance strictly requires salary with PF/PPF deduction (Excel: 22+PF DEDUCT REQ)'
    };
  }

  // 3. WORK EXPERIENCE CHECK (MINIMUM 1 YEAR / 12 MONTHS)
  const totalExpMonths = Number(totalWorkExperience || workExperience || currentCompanyExperience || 0);
  if (totalExpMonths > 0 && totalExpMonths < 12) {
    return {
      eligible: false,
      reason: `Piramal Finance policy requires minimum 1 year (12 months) work experience (Current: ${totalExpMonths} months).`
    };
  }

  // 4. EXISTING LOAN WITH PIRAMAL FINANCE CHECK
  if (existingLoanBanks && Array.isArray(existingLoanBanks)) {
    const piramalNames = ['piramal', 'piramal finance', 'piramal capital'];
    const hasExistingPiramalLoan = existingLoanBanks.some(bank =>
      piramalNames.some(name => String(bank).toLowerCase().includes(name))
    );

    if (hasExistingPiramalLoan && !isBTMode) {
      return {
        eligible: false,
        reason: 'As an existing customer of Piramal Finance with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // 5. AGE CHECK (21 TO 63 YEARS)
  const ageConfig = adminConfig?.demographics || adminConfig?.ageRules;
  const minAge = ageConfig?.minAge || piramalConfig.minAge;
  const maxAge = ageConfig?.maxAge || piramalConfig.maxAge;

  if (age !== undefined && age !== null && age > 0) {
    if (age < minAge || age > maxAge) {
      return {
        eligible: false,
        reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
      };
    }
  }

  let mappedCategory = category === 'A+' ? 'SUPER-A' : category;
  if (mappedCategory === 'Govt' || employmentType === 'government') mappedCategory = 'GOVT';

  // 6. INCENTIVE & INCOME CALCULATION
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : (piramalConfig.incentivePercentage || 1.0);

  const effectiveIncentiveMonths = incentiveMonthsOverride !== undefined 
    ? incentiveMonthsOverride 
    : 3;

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const baseSalaryVal = (basicSalary !== undefined && basicSalary !== null && basicSalary > 0) ? basicSalary : (monthlyIncome || 0);
  const actualMonthlyIncome = baseSalaryVal + bankIncentiveConsidered;
  
  const monthlyIncomeForCalc = actualMonthlyIncome;

  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = existingEMI - (btTotalEMI || 0);
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // 7. MINIMUM SALARY CHECK (₹22,000 NTH)
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < piramalConfig.minNTH) {
    return { eligible: false, reason: `Minimum NTH salary of ₹${piramalConfig.minNTH.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;

  // 8. CIBIL VENTILE BAND & MULTIPLIER SELECTION
  const effectiveCibil = cibilScore ?? creditScore;
  const cibilBandInfo = getCibilVentileBand(effectiveCibil, adminConfig?.cibilVentileBands || userData?.cibilVentileBands);

  let cibilMultiplier = cibilBandInfo.othersMult;
  if (mappedCategory === 'SUPER-A' || mappedCategory === 'SUPER A' || mappedCategory === 'A') {
    cibilMultiplier = cibilBandInfo.eliteMult;
  } else if (mappedCategory === 'B' || mappedCategory === 'C') {
    cibilMultiplier = cibilBandInfo.catBCMult;
  } else if (mappedCategory === 'GOVT') {
    if (isBT && incomeForCalculation >= 60000) {
      cibilMultiplier = cibilBandInfo.btGovtHighNmiMult;
    } else if (incomeForCalculation >= 60000) {
      cibilMultiplier = cibilBandInfo.govtHighNmiMult;
    } else {
      cibilMultiplier = cibilBandInfo.govtLowNmiMult;
    }
  }

  let multiplier = multiplierOverride !== undefined && multiplierOverride !== null
    ? Number(multiplierOverride)
    : (isGovtEmployee && govtMultiplier ? govtMultiplier : cibilMultiplier);

  let foirPercentage = foirOverride !== undefined && foirOverride !== null
    ? (Number(foirOverride) / (Number(foirOverride) > 1 ? 100 : 1))
    : (isGovtEmployee && govtFOIR ? (govtFOIR / 100) : (cibilBandInfo.foir || getNTHBand(incomeForCalculation, piramalConfig.nthFoirTable) || 0.70));

  // 9. TENURE CALCULATION (OD Program up to 96M for >= 1L Salary Super A/A)
  let maxTenureForCategory = maxTenureOverride !== undefined && maxTenureOverride !== null
    ? Number(maxTenureOverride)
    : (isGovtEmployee && govtMaxTenure ? govtMaxTenure : piramalConfig.maxTenureByCategory[mappedCategory] || 72);

  if ((mappedCategory === 'SUPER-A' || mappedCategory === 'SUPER A' || mappedCategory === 'A') && incomeForCalculation >= 100000) {
    maxTenureForCategory = Math.max(maxTenureForCategory, 96); // Excel: OD+ >1L SALARY: 96M
  }

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  const requestedTenureMonths = (loanTenure || 5) * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // 10. MULTIPLIER & FOIR LOAN AMOUNTS
  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // Pass 1: Preliminary calculation
  const baseRate = piramalConfig.interestRate;
  const foirLoanAmountPrem = calculatePrincipalFromEMI(availableEMI, baseRate, cappedTenureYears);
  const multLoanAmountPrem = incomeForCalculation * multiplier;
  const preliminaryLoanAmount = Math.min(foirLoanAmountPrem, multLoanAmountPrem);

  // Pass 2: Final ROI lookup
  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = getInterestRateForLoan(mappedCategory, preliminaryLoanAmount, userData.city || userData.state);

  const foirLoanAmountFinal = calculatePrincipalFromEMI(availableEMI, finalInterestRate, cappedTenureYears);
  const multLoanAmountFinal = incomeForCalculation * multiplier;

  const calculatedLoanAmount = Math.min(foirLoanAmountFinal, multLoanAmountFinal);

  const finalLoanAmount = Math.min(
    calculatedLoanAmount,
    desiredLoanAmount || Infinity
  );

  let bankMaxCap = maxLoanOverride !== undefined && maxLoanOverride !== null
    ? Number(maxLoanOverride)
    : piramalConfig.maxLoanAmount;

  if (mappedCategory === 'GOVT') {
    bankMaxCap = Math.min(bankMaxCap, 3000000); // Excel: Govt max 30L
  }

  const maxLoanCapAmount = Math.min(finalLoanAmount, bankMaxCap);
  const loanCapped = finalLoanAmount > bankMaxCap;

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
      totalNonBTObligations: Math.round(nonBTLoansEMI + (creditCardObligation || 0)),
      originalIncome: monthlyIncomeForCalc,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const monthlyEMI = calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: piramalConfig.id,
    bankName: piramalConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: bankMaxCap,
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
    multiplier: multiplier,
    foirPercentage: foirPercentage,
    incentivePercentage: effectiveIncentivePercentage,
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
    availableEMI: Math.round(availableEMI),
    calculationMethod: 'Ventile Score & NTH-Based Matrix',
    details: {
      multiplier: multiplier + 'x',
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      maxLoanFromFOIR: Math.round(foirLoanAmountFinal),
      multiplierLoanAmount: Math.round(multLoanAmountFinal),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
