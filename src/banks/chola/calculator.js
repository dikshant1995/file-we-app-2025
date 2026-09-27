// Cholamandalam Finance (Chola Finance) Eligibility Calculator
// Strictly adheres to Master Excel Policy (BANKS POLICYS.xlsx - Sheet: CHOLA)

import { cholaConfig } from './config.js';

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

// Helper: Determine ROI from Excel Sheet: CHOLA (Section 2)
// Super A / A / Govt: >=10L & >=75k Sal -> 13.75%, >=7.5L & >=50k Sal -> 14.50%, Else -> 15.00%
// B: >=5L -> 14.50%, Else -> 15.00%
// C / D: 15.00%
export const getCholaROI = (category, loanAmount = 0, monthlyIncome = 0) => {
  const c = String(category || '').toUpperCase().trim();
  const amt = Number(loanAmount || 0);
  const sal = Number(monthlyIncome || 0);

  if (c.includes('SUPER') || c === 'A' || c === 'GOVT') {
    if (amt >= 1000000 && sal >= 75000) return 13.75;
    if (amt >= 750000 && sal >= 50000) return 14.50;
    return 15.00;
  }

  if (c === 'B') {
    if (amt >= 500000) return 14.50;
    return 15.00;
  }

  // Categories C & D
  return 15.00;
};

// Helper: Determine FOIR & Multiplier from Excel Sheet: CHOLA (Section 3)
// 30k+ Salary: Super A/Govt (70% FOIR, 35x), A/B (70% FOIR, 28x), C/D (65% FOIR, 25x)
// 25k-30k Salary: Super A/Govt (65% FOIR, 30x), A/B (65% FOIR, 24x), C/D (55% FOIR, 20x)
export const getCholaFoirAndMultiplier = (category, monthlyIncome) => {
  const c = String(category || '').toUpperCase().trim();
  const sal = Number(monthlyIncome || 0);
  const isHighSalary = sal >= 30000;

  if (c.includes('SUPER') || c === 'GOVT') {
    return isHighSalary 
      ? { foir: 0.70, multiplier: 35, band: '30K+ Salary' }
      : { foir: 0.65, multiplier: 30, band: '25K-30K Salary' };
  }

  if (c === 'A' || c === 'B') {
    return isHighSalary
      ? { foir: 0.70, multiplier: 28, band: '30K+ Salary' }
      : { foir: 0.65, multiplier: 24, band: '25K-30K Salary' };
  }

  // Categories C & D
  return isHighSalary
    ? { foir: 0.65, multiplier: 25, band: '30K+ Salary' }
    : { foir: 0.55, multiplier: 20, band: '25K-30K Salary' };
};

export const calculateCholaEligibility = (userData, adminBankConfig) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive = 0,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation = 0,
    category = 'A',
    employmentType = 'salaried',
    age,
    designation,
    companyName,
    companyType,
    totalWorkExperience,
    currentCompanyExperience,
    workExperience,
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding,
    // Admin overrides
    interestRateOverride,
    foirOverride,
    multiplierOverride,
    maxTenureOverride,
    maxLoanOverride
  } = userData;

  // Base income without incentive (Excel: 25K AND BANKS AND NBFCS 30K WITHOUT INSENTIVE)
  const salaryWithoutIncentive = Number(basicSalary || monthlyIncome || 0);
  const totalIncome = salaryWithoutIncentive + Number(averageIncentive || 0);

  // 1. AGE CHECK (Excel: 21 to 60 Years, 21-23 Co-applicant required)
  let coApplicantRequired = false;
  let coAppReason = null;
  if (age !== undefined && age !== null && age !== '') {
    const numAge = Number(age);
    if (numAge < cholaConfig.minAge) {
      return {
        eligible: false,
        bankName: cholaConfig.name,
        reason: `Applicant age must be at least ${cholaConfig.minAge} years (Excel: 21 YEARS). Current age: ${numAge}`
      };
    }
    if (numAge > cholaConfig.maxAge) {
      return {
        eligible: false,
        bankName: cholaConfig.name,
        reason: `Maximum age at loan time is ${cholaConfig.maxAge} years for Chola Finance (Excel: 60 YEARS). Current age: ${numAge}`
      };
    }
    if (numAge >= 21 && numAge <= cholaConfig.coAppAgeLimit) {
      coApplicantRequired = true;
      coAppReason = `Age ${numAge} is in the 21–23 age group which requires a co-applicant (Excel: 21 TO 23 AGE GROUP CO APP REQ).`;
    }
  }

  // 2. DESIGNATION CHECK (Excel: RM SM SO SFE NOT ALLOW)
  if (designation) {
    const desigUpper = String(designation).toUpperCase().trim();
    const isRestricted = cholaConfig.restrictedDesignations.some(d => {
      const regex = new RegExp(`\\b${d}\\b`, 'i');
      return regex.test(desigUpper);
    });
    if (isRestricted) {
      return {
        eligible: false,
        bankName: cholaConfig.name,
        reason: `Chola Finance policy restricts profiles with designation "${designation}" (Excel: RM SM SO SFE NOT ALLOW).`
      };
    }
  }

  // 3. MINIMUM SALARY CHECK (Excel: 25K AND BANKS AND NBFCS 30K WITHOUT INSENTIVE)
  const compStr = String(companyName || '').toLowerCase();
  const typeStr = String(companyType || '').toLowerCase();
  const isBankOrNbfc = compStr.includes('bank') || compStr.includes('nbfc') || compStr.includes('finance') || 
                       compStr.includes('capital') || compStr.includes('credit') || compStr.includes('lending') ||
                       typeStr.includes('bank') || typeStr.includes('nbfc');

  const requiredMinSalary = isBankOrNbfc ? cholaConfig.minSalaryBankNbfc : cholaConfig.minSalary;
  if (salaryWithoutIncentive < requiredMinSalary) {
    return {
      eligible: false,
      bankName: cholaConfig.name,
      reason: `Chola Finance requires minimum ₹${requiredMinSalary.toLocaleString()} monthly salary without incentive for ${isBankOrNbfc ? 'Bank/NBFC employees' : 'salaried applicants'} (Excel: 25K AND BANKS AND NBFCS 30K WITHOUT INSENTIVE). Current: ₹${salaryWithoutIncentive.toLocaleString()}`
    };
  }

  // 4. WORK EXPERIENCE CHECK (Excel: GOVT 3 MONTHS/ PVT 1 YEARS FOR CATA)
  const isGovt = employmentType === 'government' || String(category).toUpperCase() === 'GOVT';
  const minRequiredExpMonths = isGovt ? cholaConfig.minExperienceGovtMonths : cholaConfig.minExperiencePvtMonths;
  const totalExp = Number(totalWorkExperience || workExperience || 0);
  if (totalExp > 0 && totalExp < minRequiredExpMonths) {
    return {
      eligible: false,
      bankName: cholaConfig.name,
      reason: `Chola Finance requires minimum ${minRequiredExpMonths} months work experience for ${isGovt ? 'Govt employees' : 'private sector employees'} (Excel: GOVT 3 MONTHS / PVT 1 YEARS). Found: ${totalExp} months.`
    };
  }

  // 5. BALANCE TRANSFER GATES (Excel: 5% OBLIGATION AND 6 TIME NOT ALLOW FOR BT / 6 CCBT ALLOW)
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let nonBTLoansEMI = 0;
  let adjustedIncome = salaryWithoutIncentive;

  if (isBT) {
    const ccLoans = (loansForBT || []).filter(l => l.loanType === 'credit_card' || l.type === 'Credit Card');
    if (ccLoans.length > cholaConfig.btConfig.maxCreditCardsForBT) {
      return {
        eligible: false,
        bankName: cholaConfig.name,
        reason: `Chola Finance allows maximum ${cholaConfig.btConfig.maxCreditCardsForBT} Credit Cards for Balance Transfer (found ${ccLoans.length}). Excel: 6 CCBT ALLOW`,
        isBTMode: true
      };
    }

    const btCreditCardPOS = ccLoans.reduce((sum, loan) => 
      sum + (parseFloat(loan.creditLimitUsed) || parseFloat(loan.outstandingAmount) || 0), 0);
    const maxAllowedCCPOS = salaryWithoutIncentive * cholaConfig.btConfig.maxCcBtSalaryMultiplier;
    if (btCreditCardPOS > maxAllowedCCPOS) {
      return {
        eligible: false,
        bankName: cholaConfig.name,
        reason: `Chola Finance restricts Credit Card BT Outstanding (₹${btCreditCardPOS.toLocaleString()}) exceeding 6x monthly salary (Max: ₹${maxAllowedCCPOS.toLocaleString()}). Excel: 6 TIME NOT ALLOW FOR BT`,
        isBTMode: true
      };
    }

    nonBTLoansEMI = Math.max(0, existingEMI - (btTotalEMI || 0));
    adjustedIncome = salaryWithoutIncentive - nonBTLoansEMI - (creditCardObligation || 0);

    if (adjustedIncome < requiredMinSalary) {
      return {
        eligible: false,
        bankName: cholaConfig.name,
        reason: `After deducting non-BT loan obligations, remaining net salary (₹${Math.round(adjustedIncome).toLocaleString()}) is below required ₹${requiredMinSalary.toLocaleString()}.`,
        isBTMode: true
      };
    }
  }

  // 6. TENURE DETERMINATION (Excel: Super A/A/B/Govt: 12-84M, C/D: 12-60M)
  const catUpper = String(category || '').toUpperCase().trim();
  const maxTenureMonthsAllowed = maxTenureOverride || cholaConfig.maxTenureByCategory[catUpper] || 84;
  const requestedTenureMonths = loanTenure ? (loanTenure * 12) : maxTenureMonthsAllowed;
  const tenureMonths = Math.min(requestedTenureMonths, maxTenureMonthsAllowed);
  const tenureYears = tenureMonths / 12;

  // 7. FOIR & MULTIPLIER (Excel: Section 3)
  const incomeForCalc = isBT ? adjustedIncome : salaryWithoutIncentive;
  const { foir: defaultFoir, multiplier: defaultMultiplier, band: salaryBand } = getCholaFoirAndMultiplier(category, incomeForCalc);
  const effectiveFOIR = foirOverride ? (foirOverride / 100) : defaultFoir;
  const effectiveMultiplier = multiplierOverride ? Number(multiplierOverride) : defaultMultiplier;

  // 8. OBLIGATIONS & AVAILABLE EMI (Excel: 5% CC OBLIGATION)
  const activeCcObligation = creditCardObligation || Math.round(salaryWithoutIncentive * cholaConfig.creditCardObligationPercent);
  const totalObligations = isBT ? nonBTLoansEMI : (existingEMI + activeCcObligation);
  const foirCap = incomeForCalc * effectiveFOIR;
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      bankName: cholaConfig.name,
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed ${(effectiveFOIR * 100).toFixed(0)}% FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // 9. DYNAMIC ROI LOOKUP (Excel: Section 2)
  const dynamicROI = getCholaROI(category, desiredLoanAmount || 1000000, salaryWithoutIncentive);
  const effectiveInterestRate = interestRateOverride || dynamicROI;

  // 10. LOAN CAPACITY (FOIR vs Multiplier vs Capping)
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, effectiveInterestRate, tenureYears);
  const multiplierLoanAmount = salaryWithoutIncentive * effectiveMultiplier;
  let calculatedLoanAmount = Math.min(foirLoanAmount, multiplierLoanAmount);

  if (desiredLoanAmount && desiredLoanAmount > 0) {
    calculatedLoanAmount = Math.min(calculatedLoanAmount, desiredLoanAmount);
  }

  // 11. CATEGORY LOAN AMOUNT CAPPING (Excel: Super A/A/Govt: 30L, B/C/D: 20L)
  const categoryMaxCap = cholaConfig.loanAmountCaps[catUpper] || 2000000;
  const maxCap = maxLoanOverride || categoryMaxCap;
  const finalLoanAmount = Math.min(calculatedLoanAmount, maxCap);

  if (finalLoanAmount < cholaConfig.minLoanAmount) {
    return {
      eligible: false,
      bankName: cholaConfig.name,
      reason: `Calculated loan amount (₹${Math.round(finalLoanAmount).toLocaleString()}) is below Chola Finance minimum ticket size of ₹${cholaConfig.minLoanAmount.toLocaleString()} (1 LAC).`
    };
  }

  // Co-Applicant requirement for Category A > 20L (Excel: CO APP REQ ABOVE 20LAC)
  if (catUpper === 'A' && finalLoanAmount > cholaConfig.coAppAboveLoanAmountCatA) {
    coApplicantRequired = true;
    coAppReason = coAppReason 
      ? `${coAppReason} Also, loan amount (₹${Math.round(finalLoanAmount).toLocaleString()}) exceeds ₹20 Lakhs in Category A (Excel: CO APP REQ ABOVE 20LAC).`
      : `Chola Finance requires a co-applicant for Category A loan amounts exceeding ₹20 Lakhs (Excel: CO APP REQ ABOVE 20LAC).`;
  }

  // 12. BT POST-PROCESSING
  let btDetails = null;
  if (isBT) {
    const btFreshAmount = finalLoanAmount - (btTotalOutstanding || 0);
    if (btFreshAmount < 0) {
      return {
        eligible: false,
        bankName: cholaConfig.name,
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
      creditCardObligation: Math.round(activeCcObligation),
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const finalEMI = calculateEMI(finalLoanAmount, effectiveInterestRate, tenureYears);

  return {
    eligible: true,
    bankName: cholaConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanAmount: Math.round(finalLoanAmount),
    monthlyEMI: finalEMI,
    interestRate: effectiveInterestRate,
    loanTenure: tenureYears,
    loanTenureMonths: tenureMonths,
    foirPercentage: effectiveFOIR,
    multiplier: effectiveMultiplier,
    maxLoanCap: maxCap,
    salaryBand: salaryBand,
    coApplicantRequired: coApplicantRequired,
    coApplicantReason: coAppReason,
    btDetails: btDetails,
    isBTMode: isBT
  };
};
