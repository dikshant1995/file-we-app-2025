import { bandhanConfig } from './config.js';

// Function to calculate EMI using standard amortization formula
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

// Function to calculate loan amount from EMI using standard amortization formula
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

// Function to get FOIR percentage based on net monthly salary (Excel Sheet: BANDHAN BANK - Section 2)
export const getBandhanFoir = (salary) => {
  if (salary > 75000) return 0.70;
  if (salary >= 50001) return 0.65;
  if (salary >= 30001) return 0.60;
  return 0.50;
};

// Function to get ROI based on Location, Category, Salary Slab, and CIBIL / QC Score (Excel Section 5)
export const getBandhanROI = (category, monthlyIncome, cibilScore = 750, location = 'Metro') => {
  const isNonMetro = location && String(location).toLowerCase().includes('non');
  const locKey = isNonMetro ? 'NonMetro' : 'Metro';

  const catUpper = String(category || 'B').toUpperCase().trim();
  let catKey = 'B';
  if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') catKey = 'A';
  else if (catUpper === 'C') catKey = 'C';
  else if (catUpper === 'D') catKey = 'D';

  let incomeKey = '<25000';
  if (monthlyIncome > 50000) incomeKey = '>50000';
  else if (monthlyIncome >= 25000) incomeKey = '25000-50000';

  const cibil = Number(cibilScore) || 750;
  let cibilKey = 'cibilGt750';
  if (cibil >= 750) cibilKey = 'cibilGt750';
  else if (cibil >= 700) cibilKey = 'cibil700to749';
  else cibilKey = 'cibil650to699';

  const locMatrix = bandhanConfig.roiMatrix?.[locKey] || bandhanConfig.roiMatrix?.Metro;
  const catMatrix = locMatrix?.[catKey] || locMatrix?.A;
  const rateRow = catMatrix?.[incomeKey] || catMatrix?.['>50000'];

  return rateRow?.[cibilKey] || bandhanConfig.interestRate;
};

// Function to get multiplier based on category, income, and tenure (Excel Sheet: BANDHAN BANK - Section 6)
export const getBandhanMultiplier = (category, salary, tenureMonths = 60) => {
  const catUpper = String(category || 'B').toUpperCase().trim();
  let matrixKey = 'AB_GOVT';
  if (catUpper === 'C') matrixKey = 'C';
  else if (catUpper === 'D') matrixKey = 'D';

  let incomeKey = '<=30000';
  if (salary > 75000) incomeKey = '>75000';
  else if (salary >= 50001) incomeKey = '50001-75000';
  else if (salary >= 30001) incomeKey = '30001-50000';

  let tenureBucket = 60;
  if (tenureMonths <= 12) tenureBucket = 12;
  else if (tenureMonths <= 24) tenureBucket = 24;
  else if (tenureMonths <= 36) tenureBucket = 36;
  else if (tenureMonths <= 48) tenureBucket = 48;
  else tenureBucket = 60;

  const row = bandhanConfig.multiplierMatrix[matrixKey]?.[incomeKey];
  if (!row) return 20;

  // Handle NA tenure cases (e.g. Cat D at 60M or Cat C <=50k at 60M)
  if (row[tenureBucket] !== null && row[tenureBucket] !== undefined) {
    return row[tenureBucket];
  }

  // Fallback to highest permissible tenure bucket for that category
  return row[48] || row[36] || 18;
};

// Bandhan Bank specific eligibility calculation
export const calculateBandhanEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI,
    creditCardObligation,
    totalCreditCardLimit,
    creditScore,
    employmentType,
    interestRate,
    age,
    category,
    existingLoanBanks,
    // Admin Overrides (Logic Bridge)
    interestRateOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
    govtMultiplier,
    govtMaxTenure,
    foirOverride,
    multiplierOverride,
    maxLoanOverride,
    // Balance Transfer fields
    isBTMode,
    loansForBT,
    btTotalEMI,
    // Incentive Overrides
    incentivePercentageOverride
  } = userData;

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : 0.25;

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const actualMonthlyIncome = (basicSalary || monthlyIncome || 0) + bankIncentiveConsidered;
  const monthlyIncomeForCalc = actualMonthlyIncome;

  // ========== CC BT RESTRICTION (Bandhan Bank does not allow CC BT) ==========
  if (Array.isArray(loansForBT) && loansForBT.length > 0) {
    const hasCcInBt = loansForBT.some(loan => {
      const type = (loan.loanType || loan.type || '').toLowerCase();
      return type.includes('credit') || type.includes('card') || type === 'cc';
    });
    if (hasCcInBt) {
      return {
        eligible: false,
        reason: 'Bandhan Bank does not allow Credit Card Balance Transfer. Only Personal Loan Balance Transfer is accepted.',
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

  // CHECK: If customer already has a personal loan from Bandhan Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const bandhanBankNames = ['bandhan', 'bandhan bank'];
    const hasExistingBandhanLoan = existingLoanBanks.some(bank =>
      bandhanBankNames.some(name => String(bank).toLowerCase().includes(name))
    );

    if (hasExistingBandhanLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Bandhan Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility (21 to 60 Years)
  const minAge = bandhanConfig.minAge;
  const maxAge = bandhanConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (employmentType && !bandhanConfig.employmentTypes.includes(employmentType.toLowerCase())) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by Bandhan Bank`
    };
  }

  const companyCategory = category || 'B';
  const catUpper = String(companyCategory).toUpperCase().trim();
  const minSalaryRequired = catUpper === 'D' ? 40000 : 25000;
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;

  if (incomeToCheck < minSalaryRequired) {
    return {
      eligible: false,
      reason: `Minimum monthly salary required for Category ${companyCategory} is ₹${minSalaryRequired.toLocaleString()} (Policy: 25K / CAT D 40K)`,
      isBTMode: isBT
    };
  }

  // Tenure handling (Section 3 & Section 6: Cat D is strictly max 48M; Cat C with <=50k is max 48M; others 60M)
  let maxPermissibleTenure = 60;
  if (catUpper === 'D') {
    maxPermissibleTenure = 48; // Section 6: 49-60m is NA for Cat D
  } else if (catUpper === 'C' && incomeToCheck <= 50000) {
    maxPermissibleTenure = 48; // Section 6: 49-60m is NA for Cat C <= 50k
  }

  const requestedTenureMonths = loanTenure ? (loanTenure * 12) : 60;
  let effectiveTenureMonths = Math.min(requestedTenureMonths, maxPermissibleTenure);
  if (isGovtEmployee && govtMaxTenure) {
    effectiveTenureMonths = Math.min(effectiveTenureMonths, govtMaxTenure);
  }
  const effectiveTenureYears = effectiveTenureMonths / 12;

  // Credit Card Obligation: Excel Policy (3% of limit, BUT if total limit < 3x salary -> 0% obligation)
  let effectiveCcObligation = creditCardObligation || 0;
  if (totalCreditCardLimit && totalCreditCardLimit > 0) {
    if (totalCreditCardLimit < (monthlyIncomeForCalc * 3)) {
      effectiveCcObligation = 0; // "SALARY KA BELOW 3 TIME NO OBLIGATION"
    } else {
      effectiveCcObligation = totalCreditCardLimit * 0.03; // "3% OBLIGATE"
    }
  }

  // FOIR & Multiplier Calculation
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;
  const foirPercentage = foirOverride 
    ? (foirOverride / 100) 
    : (isGovtEmployee && govtFOIR ? (govtFOIR / 100) : getBandhanFoir(incomeForCalculation));

  const totalObligations = (existingEMI || 0) + effectiveCcObligation;
  const foirCap = isBT ? (adjustedIncome * foirPercentage) : (monthlyIncomeForCalc * foirPercentage);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: 'Existing monthly debt obligations exceed the maximum permissible FOIR threshold',
      isBTMode: isBT
    };
  }

  // Section 6: Multiplier method
  const multiplier = multiplierOverride || (isGovtEmployee && govtMultiplier ? govtMultiplier : getBandhanMultiplier(companyCategory, incomeForCalculation, effectiveTenureMonths));
  const availableSalary = isBT ? incomeForCalculation : Math.max(0, monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // Section 5: Interest Rate Resolution
  let finalInterestRate = interestRateOverride || interestRate;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) {
    finalInterestRate = getBandhanROI(companyCategory, incomeForCalculation, creditScore, userData.city || userData.location);
  }

  // FOIR Loan Calculation
  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, finalInterestRate, effectiveTenureYears);
  const bankMaxLoanCap = maxLoanOverride || bandhanConfig.maxLoanAmount; // ₹25 Lakhs flat (Excel Section 4)

  const calculatedLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    foirLoanAmount
  );
  const finalLoanAmount = Math.min(calculatedLoanAmount, bankMaxLoanCap);
  const emi = calculateEMI(finalLoanAmount, finalInterestRate, effectiveTenureYears);

  // Check minimum loan threshold (₹1 Lakh)
  if (finalLoanAmount < bandhanConfig.minLoanAmount) {
    return {
      eligible: false,
      reason: `Calculated eligibility (₹${finalLoanAmount.toLocaleString()}) is below Bandhan Bank minimum loan limit of ₹1 Lakh`,
      isBTMode: isBT
    };
  }

  return {
    eligible: true,
    maxLoanAmount: Math.round(finalLoanAmount),
    calculatedLoanAmount: Math.round(finalLoanAmount),
    interestRate: Number(finalInterestRate),
    tenure: effectiveTenureYears,
    tenureMonths: effectiveTenureMonths,
    emi: Math.round(emi),
    foir: Number((foirPercentage * 100).toFixed(1)),
    multiplier: multiplier,
    category: companyCategory,
    bankName: 'Bandhan Bank',
    isBTMode: isBT,
    details: {
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      foirLoanAmount: Math.round(foirLoanAmount),
      availableEMI: Math.round(availableEMI),
      zeroCcObligationApplied: totalCreditCardLimit > 0 && totalCreditCardLimit < (monthlyIncomeForCalc * 3),
      maxCapApplied: finalLoanAmount >= bankMaxLoanCap,
      tenureCappedForProfile: effectiveTenureMonths < requestedTenureMonths
    }
  };
};
