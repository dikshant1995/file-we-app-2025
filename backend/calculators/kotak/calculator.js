import { kotakConfig } from './config.js';

// Helper function to get interest rate based on category and loan amount from Excel policy
const getInterestRateForLoan = (category, loanAmount) => {
  const catUpper = String(category || 'B').toUpperCase().trim();
  let matrixKey = 'B';
  if (catUpper === 'SUPER A' || catUpper === 'AA') matrixKey = 'Super A';
  else if (catUpper === 'A' || catUpper === 'GOVT') matrixKey = 'A';
  else if (catUpper === 'C') matrixKey = 'C';
  else if (catUpper === 'D') matrixKey = 'D';

  const rates = kotakConfig.roiMatrix[matrixKey] || kotakConfig.roiMatrix['B'];
  const amt = loanAmount || 1000000;

  if (amt >= 1500000) {
    return rates.above15L;
  } else if (amt >= 1000000) {
    return rates['10Lto15L'];
  } else {
    return rates.below10L;
  }
};

// Function to calculate EMI using standard banking amortization formula
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

// Function to calculate loan amount from EMI using standard banking amortization formula
const calculateLoanAmountFromEMI = (emi, annualInterestRate, tenureInYears) => {
  if (!emi || emi <= 0) return 0;
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return Math.round(emi * numberOfMonths);
  }

  const r = monthlyInterestRate;
  const n = numberOfMonths;
  const loanAmount = emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  return Math.round(loanAmount);
};

// Function to get multiplier based on category (Excel Sheet: KOTAK - Section 3)
const getMultiplier = (category) => {
  const catUpper = String(category || 'B').toUpperCase().trim();
  if (catUpper === 'SUPER A' || catUpper === 'AA') return 31;
  if (catUpper === 'A' || catUpper === 'GOVT') return 27;
  if (catUpper === 'B') return 25;
  if (catUpper === 'C') return 20;
  if (catUpper === 'D') return 18;
  return 25;
};

// Function to get FOIR percentage based on category and live HL status (Excel Sheet: KOTAK - Section 3)
const getFoirPercentage = (category, hasLiveHl = false) => {
  const catUpper = String(category || 'B').toUpperCase().trim();
  let baseFoir = catUpper === 'D' ? 0.60 : 0.70;
  if (hasLiveHl && catUpper !== 'D') {
    baseFoir += 0.05; // 70% + 5% IF HL LIVE 10 LAKHS & ABOVE
  }
  return baseFoir;
};

// Function to get minimum salary based on category (Excel Sheet: KOTAK)
const getCategoryMinSalary = (category) => {
  const catUpper = String(category || 'B').toUpperCase().trim();
  if (catUpper === 'C' || catUpper === 'D') return 35000;
  return 25000;
};

// Function to get maximum loan amount based on category (Excel Sheet: KOTAK - Section 5)
const getCategoryMaxLoanAmount = (category) => {
  const catUpper = String(category || 'B').toUpperCase().trim();
  if (catUpper === 'C') return 3500000;
  if (catUpper === 'D') return 2000000;
  return 10000000; // 1 Crore for Super A, A, B, Govt
};

// Function to get maximum tenure in months based on category (Excel Sheet: KOTAK - Section 4)
const getCategoryMaxTenure = (category) => {
  const catUpper = String(category || 'B').toUpperCase().trim();
  if (catUpper === 'D') return 60; // 5 Years
  return 72; // 6 Years for Super A, A, B, C, Govt
};

// Kotak Mahindra Bank specific eligibility calculation
export const calculateKotakEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI,
    creditCardObligation,
    companyName,
    creditScore,
    employmentType,
    interestRate,
    age,
    category,
    existingLoanBanks,
    existingLoanTypes,
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
    govtMultiplier,
    govtMaxTenure,
    multiplierOverride,
    foirOverride,
    maxLoanOverride,
    // Balance Transfer fields
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding,
    // Incentive Overrides
    incentivePercentageOverride
  } = userData;

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : 1.0;

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const actualMonthlyIncome = (basicSalary || monthlyIncome || 0) + bankIncentiveConsidered;
  const monthlyIncomeForCalc = actualMonthlyIncome;

  // ========== CC BT RESTRICTION (Policy: CC BT NOT ALLOW) ==========
  if (Array.isArray(loansForBT) && loansForBT.length > 0) {
    const hasCcInBt = loansForBT.some(loan => {
      const type = (loan.loanType || loan.type || '').toLowerCase();
      return type.includes('credit') || type.includes('card') || type === 'cc';
    });
    if (hasCcInBt) {
      return {
        eligible: false,
        reason: 'Kotak Mahindra Bank policy strictly does not allow Credit Card Balance Transfer (CC BT NOT ALLOW). Only Personal Loan BT is accepted.',
        isBTMode: true
      };
    }
  }

  // ========== BALANCE TRANSFER MODE DETECTION ==========
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = (existingEMI || 0) - (btTotalEMI || 0);
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;

    if (adjustedIncome <= 0) {
      return {
        eligible: false,
        reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains for Balance Transfer`,
        isBTMode: true
      };
    }
  }

  // CHECK: If customer already has a personal loan from Kotak Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const kotakBankNames = ['kotak', 'kotak mahindra', 'kotak mahindra bank'];
    const hasExistingKotakLoan = existingLoanBanks.some(bank =>
      kotakBankNames.some(name => String(bank).toLowerCase().includes(name))
    );

    if (hasExistingKotakLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Kotak Mahindra Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility (21 to 60 Years)
  const minAge = kotakConfig.minAge;
  const maxAge = kotakConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (employmentType && !kotakConfig.employmentTypes.includes(employmentType.toLowerCase())) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by Kotak Mahindra Bank`
    };
  }

  const companyCategory = category || 'B';
  const catMinSalary = getCategoryMinSalary(companyCategory);
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;

  if (incomeToCheck < catMinSalary) {
    return {
      eligible: false,
      reason: `Minimum monthly salary required for Category ${companyCategory} is ₹${catMinSalary.toLocaleString()} (Policy: 25K / Cat C & D: 35K)`,
      isBTMode: isBT
    };
  }

  // Tenure handling (24 to 72 Months, Cat D max 60 Months)
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure 
    ? govtMaxTenure 
    : getCategoryMaxTenure(companyCategory);

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Live Home Loan detection for +5% bonus FOIR
  const hasLiveHl = (existingLoanTypes && (existingLoanTypes.includes('Home Loan') || existingLoanTypes.includes('HL'))) ||
    (Array.isArray(loansForBT) && loansForBT.some(l => (l.loanType || l.type || '').toLowerCase().includes('home')));

  // FOIR & Multiplier calculation
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;
  const multiplier = multiplierOverride || (isGovtEmployee && govtMultiplier ? govtMultiplier : getMultiplier(companyCategory));
  const foirPercentage = foirOverride 
    ? (foirOverride / 100) 
    : (isGovtEmployee && govtFOIR ? (govtFOIR / 100) : getFoirPercentage(companyCategory, hasLiveHl));

  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : Math.max(0, monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: 'Existing monthly debt obligations exceed the maximum permissible FOIR threshold',
      isBTMode: isBT
    };
  }

  // PASS 1: Preliminary Loan Amount at base rate
  const baseRate = kotakConfig.interestRate;
  const preliminaryFoirLoanAmount = calculateLoanAmountFromEMI(availableEMI, baseRate, cappedTenureYears);
  const bankMaxLoanCap = maxLoanOverride || getCategoryMaxLoanAmount(companyCategory);

  const preliminaryMaxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    preliminaryFoirLoanAmount
  );
  const preliminaryLoanAmount = Math.min(preliminaryMaxLoanAmount, bankMaxLoanCap);

  // PASS 2: Effective Interest Rate based on loan amount & category
  let finalInterestRate = interestRateOverride || interestRate;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = getInterestRateForLoan(companyCategory, preliminaryLoanAmount);

  // Final Loan Amount
  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, finalInterestRate, cappedTenureYears);
  const calculatedLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    foirLoanAmount
  );
  const finalLoanAmount = Math.min(calculatedLoanAmount, bankMaxLoanCap);
  const emi = calculateEMI(finalLoanAmount, finalInterestRate, cappedTenureYears);

  // Check minimum loan threshold (₹1 Lakh)
  if (finalLoanAmount < kotakConfig.minLoanAmount) {
    return {
      eligible: false,
      reason: `Calculated eligibility (₹${finalLoanAmount.toLocaleString()}) is below Kotak minimum loan limit of ₹1 Lakh`,
      isBTMode: isBT
    };
  }

  return {
    eligible: true,
    maxLoanAmount: Math.round(finalLoanAmount),
    calculatedLoanAmount: Math.round(finalLoanAmount),
    interestRate: Number(finalInterestRate),
    tenure: cappedTenureYears,
    tenureMonths: cappedTenureMonths,
    emi: Math.round(emi),
    foir: Number((foirPercentage * 100).toFixed(1)),
    multiplier: multiplier,
    category: companyCategory,
    bankName: 'Kotak Mahindra Bank',
    isBTMode: isBT,
    details: {
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      foirLoanAmount: Math.round(foirLoanAmount),
      availableEMI: Math.round(availableEMI),
      hasLiveHlBonus: hasLiveHl && String(companyCategory).toUpperCase() !== 'D',
      maxCapApplied: finalLoanAmount >= bankMaxLoanCap
    }
  };
};
