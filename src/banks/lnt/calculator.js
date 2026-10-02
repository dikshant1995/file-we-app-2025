import { lntConfig } from './config.js';
import { getBankConfig, getAllBankConfig } from '../../services/bankConfigService.js';

// Helper to calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  if (!principal || principal <= 0) return 0;
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyRate === 0) {
    return Math.round(principal / numberOfMonths);
  }

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
              (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

  return Math.round(emi);
};

// Reverse calculation: Calculate principal from available EMI
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  if (!emi || emi <= 0) return 0;
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyRate === 0) {
    return Math.round(emi * numberOfMonths);
  }

  const r = monthlyRate;
  const n = numberOfMonths;
  const principal = (emi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));

  return Math.round(principal);
};

// Helper: Determine FOIR and Multiplier for L&T Finance based on Category and Income
const getLntFoirAndMultiplier = (monthlyIncome, category) => {
  const catUpper = String(category || '').toUpperCase();
  const sal = Math.round(monthlyIncome || 0);

  if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT' || catUpper === 'B') {
    if (sal >= 200000) return { foir: 0.80, multiplier: 24 };
    if (sal >= 100000) return { foir: 0.75, multiplier: 24 };
    if (sal >= 50000) return { foir: 0.70, multiplier: 20 };
    return { foir: 0.55, multiplier: 18 };
  } else if (catUpper === 'C') {
    if (sal >= 200000) return { foir: 0.75, multiplier: 20 };
    if (sal >= 100000) return { foir: 0.70, multiplier: 20 };
    if (sal >= 50000) return { foir: 0.60, multiplier: 18 };
    return { foir: 0.50, multiplier: 16 };
  } else {
    // Category D / Unlisted
    if (sal >= 200000) return { foir: 0.70, multiplier: 16 };
    if (sal >= 100000) return { foir: 0.65, multiplier: 16 };
    if (sal >= 50000) return { foir: 0.55, multiplier: 15 };
    return { foir: 0.50, multiplier: 14 };
  }
};

// Helper: Determine ROI for L&T Finance based on Loan Amount & Category
const getLntInterestRate = (loanAmount, category, creditScore, livingStatus, monthlyIncome) => {
  const catUpper = String(category || '').toUpperCase();
  const score = creditScore ? Number(creditScore) : 750;
  const sal = monthlyIncome || 0;
  const isOwnedHouse = livingStatus === 'owned' || livingStatus === 'self_owned';

  // Special Rate: 10.99% for Super A/A + Owned House + Salary >= 1.75L + CIBIL >= 775
  if ((catUpper.includes('SUPER') || catUpper === 'A') && isOwnedHouse && sal >= 175000 && score >= 775) {
    return 10.99;
  }

  const amount = loanAmount || 1000000;
  if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT' || catUpper === 'B') {
    if (amount >= 2000000) return 11.50;
    if (amount >= 1000000) return 14.00;
    return 13.50;
  } else if (catUpper === 'C') {
    if (amount >= 2000000) return 13.50;
    if (amount >= 1000000) return 14.00;
    return 14.00;
  } else {
    // Category D
    if (amount >= 2000000) return 14.00;
    if (amount >= 1000000) return 14.50;
    return 15.00;
  }
};

// Main Eligibility Calculator for L&T Finance
export const calculateLntEligibility = (userData, adminBankConfig) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation,
    category = 'B',
    creditScore,
    cibilScore,
    employmentType = 'salaried',
    age,
    totalWorkExperience,
    currentCompanyExperience,
    workExperience,
    livingStatus,
    residenceType,
    existingLoanBanks,
    // Admin Overrides
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

  // Retrieve Dynamic Bank Config from Admin Panel
  const adminConfig = adminBankConfig || getAllBankConfig('L&T Finance', userData.city || userData.state);

  // 1. CREDIT CARD BALANCE TRANSFER RESTRICTION (CC BT NOT ALLOWED)
  if (isBTMode && Array.isArray(loansForBT)) {
    const ccBtLoans = loansForBT.filter(l => l.type === 'Credit Card' || l.type === 'credit_card');
    if (ccBtLoans.length > 0) {
      return {
        eligible: false,
        reason: 'Credit Card Balance Transfer is not permitted for L&T Finance (Policy: CC BT NOT ALLOWED).'
      };
    }
  }

  // 2. CIBIL SCORE CHECK (CIBIL 720+ REQUIRED)
  const rawCibil = cibilScore ?? creditScore;
  if (rawCibil !== null && rawCibil !== undefined && rawCibil !== '') {
    const numCibil = Number(rawCibil);
    if (numCibil > 0 && numCibil < lntConfig.minCreditScore) {
      return {
        eligible: false,
        reason: `L&T Finance policy strictly requires CIBIL score 720+ (Current CIBIL: ${numCibil}).`
      };
    }
  }

  // 3. WORK EXPERIENCE CHECK (MIN 6 MONTHS SALARY CREDIT REQUIRED)
  const totalExpMonths = Number(totalWorkExperience || workExperience || currentCompanyExperience || 0);
  if (totalExpMonths > 0 && totalExpMonths < lntConfig.minWorkExpMonths) {
    return {
      eligible: false,
      reason: `L&T Finance policy requires minimum 6 months salary credit work experience (Current: ${totalExpMonths} months).`
    };
  }

  // 4. AGE CHECK (21 TO 60 YEARS)
  const ageConfig = adminConfig.demographics || adminConfig.ageRules;
  const minAge = ageConfig?.minAge || lntConfig.minAge;
  const maxAge = ageConfig?.maxAge || lntConfig.maxAge;
  if (age !== undefined && age !== null && age > 0) {
    if (age < minAge || age > maxAge) {
      return {
        eligible: false,
        reason: `Applicant age must be between ${minAge} and ${maxAge} years for L&T Finance (Current: ${age}).`
      };
    }
  }

  // 5. EXISTING LOAN WITH L&T FINANCE CHECK
  if (existingLoanBanks && Array.isArray(existingLoanBanks)) {
    const lntNames = ['l&t', 'lnt', 'l&t finance', 'lnt finance'];
    const hasExistingLnt = existingLoanBanks.some(b =>
      lntNames.some(name => String(b).toLowerCase().includes(name))
    );
    if (hasExistingLnt && !isBTMode) {
      return {
        eligible: false,
        reason: 'As an existing customer of L&T Finance with an active personal loan, you are not eligible for a new loan.'
      };
    }
  }

  let mappedCategory = category === 'A+' ? 'SUPER-A' : category;
  if (mappedCategory === 'Govt' || employmentType === 'government') mappedCategory = 'GOVT';

  // 6. INCENTIVE & INCOME CALCULATION
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined
    ? incentivePercentageOverride
    : (lntConfig.incentivePercentage || 1.0);

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const baseSalaryVal = (basicSalary !== undefined && basicSalary !== null && basicSalary > 0) ? basicSalary : (monthlyIncome || 0);
  const actualMonthlyIncome = baseSalaryVal + bankIncentiveConsidered;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = actualMonthlyIncome;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = existingEMI - (btTotalEMI || 0);
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = actualMonthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return {
        eligible: false,
        reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains.`
      };
    }
  }

  // 7. MINIMUM SALARY CHECK (₹25,000)
  const incomeToCheck = isBT ? adjustedIncome : actualMonthlyIncome;
  if (incomeToCheck < lntConfig.minSalary) {
    return {
      eligible: false,
      reason: `L&T Finance requires minimum monthly salary of ₹${lntConfig.minSalary.toLocaleString()} (Current: ₹${incomeToCheck.toLocaleString()}).`
    };
  }

  // 8. DYNAMIC FOIR & MULTIPLIER SELECTION
  const defaultPolicy = getLntFoirAndMultiplier(incomeToCheck, mappedCategory);

  let foirPercentage = foirOverride !== undefined && foirOverride !== null
    ? (Number(foirOverride) / (Number(foirOverride) > 1 ? 100 : 1))
    : (isGovtEmployee && govtFOIR ? (govtFOIR / 100) : defaultPolicy.foir);

  let multiplier = multiplierOverride !== undefined && multiplierOverride !== null
    ? Number(multiplierOverride)
    : (isGovtEmployee && govtMultiplier ? govtMultiplier : defaultPolicy.multiplier);

  // 9. TENURE CALCULATION (UP TO 72 MONTHS)
  let maxTenureMonths = maxTenureOverride !== undefined && maxTenureOverride !== null
    ? Number(maxTenureOverride)
    : (isGovtEmployee && govtMaxTenure ? govtMaxTenure : (lntConfig.maxTenureByCategory[mappedCategory] || 72));

  const cappedTenureMonths = Math.min(maxTenureMonths, 72);
  const cappedTenureYears = cappedTenureMonths / 12;

  // 10. MULTIPLIER & FOIR ELIGIBILITY AMOUNTS
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeToCheck : (actualMonthlyIncome - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (actualMonthlyIncome * foirPercentage);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // 11. PASS 1 & PASS 2 INTEREST RATE LOOKUP
  const preliminaryLoanAmount = Math.min(
    multiplierLoanAmount,
    calculatePrincipalFromEMI(availableEMI, lntConfig.interestRate, cappedTenureYears),
    desiredLoanAmount || Infinity
  );

  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) {
    finalInterestRate = getLntInterestRate(preliminaryLoanAmount, mappedCategory, rawCibil, livingStatus || residenceType, actualMonthlyIncome);
  }

  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  const finalLoanAmount = Math.min(
    multiplierLoanAmount,
    foirLoanAmount,
    desiredLoanAmount || Infinity
  );

  // 12. CATEGORY D RENTED CAPPING (₹20 LAKHS RENTED CAP VS ₹30 LAKHS REGULAR)
  let bankMaxCap = maxLoanOverride !== undefined && maxLoanOverride !== null
    ? Number(maxLoanOverride)
    : lntConfig.maxLoanAmount;

  const isRented = livingStatus === 'rented' || residenceType === 'rented';
  if ((mappedCategory === 'D' || category === 'UNLISTED') && isRented) {
    bankMaxCap = Math.min(bankMaxCap, lntConfig.catDRentedMaxLoanAmount);
  }

  const cappedFinalLoan = Math.min(finalLoanAmount, bankMaxCap);
  const loanCapped = finalLoanAmount > bankMaxCap;

  if (cappedFinalLoan < lntConfig.minLoanAmount) {
    return {
      eligible: false,
      reason: `Calculated loan amount (₹${Math.round(cappedFinalLoan).toLocaleString()}) is below L&T Finance minimum loan threshold of ₹${lntConfig.minLoanAmount.toLocaleString()}`
    };
  }

  const monthlyEMI = calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: lntConfig.id,
    bankName: lntConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: bankMaxCap,
    loanCappedByBank: loanCapped,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    monthlyEMI: Math.round(monthlyEMI),
    multiplier: multiplier,
    foirPercentage: foirPercentage,
    category: mappedCategory,
    availableEMI: Math.round(availableEMI),
    foirLoanAmount: Math.round(foirLoanAmount),
    multiplierLoanAmount: Math.round(multiplierLoanAmount),
    calculationMethod: 'Combined (Dual)',
    details: {
      multiplier: multiplier + 'x',
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      totalObligations: Math.round(totalObligations)
    }
  };
};
