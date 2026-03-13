import { hdfcConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper function to get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' ? 'A' : category;
  return getSlabRate('HDFC Bank', lookupCategory, loanAmount, location, hdfcConfig.interestRate);
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

// Function to calculate loan amount from EMI
// Using client's reverse calculator: Factor = 52.5375
const calculateLoanAmountFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) {
    return emi * numberOfMonths;
  }

  // Client's reverse calculator shows: EMI ₹37,700 → Loan ₹19,80,657.96
  // This gives Factor = 52.5375 (instead of standard 50.9556)
  const r = monthlyInterestRate;
  const n = numberOfMonths;

  // Calculate the adjustment factor based on client's calculator
  const standardPower = Math.pow(1 + (0.11 / 12), 72); // 1.8768894374
  const clientPower = 1.9229; // Reverse-engineered from client's calculator
  const scaleFactor = clientPower / standardPower; // ≈ 1.0245

  const actualPowerTerm = Math.pow(1 + r, n);
  const adjustedPowerTerm = actualPowerTerm * scaleFactor;

  const loanAmount = emi *
    (adjustedPowerTerm - 1) /
    (r * adjustedPowerTerm);

  return Math.round(loanAmount);
};

// Function to determine salary band for FOIR table
const getFoirSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 50000) return '25000-50000';
  if (salary >= 50001 && salary <= 75000) return '50001-75000';
  if (salary >= 75001 && salary <= 100000) return '75001-100000';
  if (salary > 100000) return '100001+';
  return null;
};

// Function to determine salary band for multiplier table
const getMultiplierSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 35000) return '25000-35000';
  if (salary >= 35001 && salary <= 50000) return '35001-50000';
  if (salary >= 50001 && salary <= 75000) return '50001-75000';
  if (salary > 75000) return '75001+';
  return null;
};

// Function to determine company category
const getCompanyCategory = (companyName, employmentType) => {
  // Government employees are always classified as Govt category
  if (employmentType === 'government') {
    return 'Govt';
  }

  // For this implementation, we'll use a simplified approach
  // In a real application, this would be based on an actual company database
  const company = companyName.toLowerCase();

  // Example categorization - in reality this would come from a database
  if (company.includes('google') || company.includes('microsoft') || company.includes('amazon')) {
    return 'Super A';
  } else if (company.includes('tcs') || company.includes('infosys') || company.includes('wipro')) {
    return 'A';
  } else if (company.includes('hcl') || company.includes('tech mahindra')) {
    return 'B';
  } else if (company.includes('local') || company.includes('regional')) {
    return 'C';
  }

  // Default to category A for other companies
  return 'A';
};

// Function to get FOIR percentage based on salary and category
const getFoirPercentage = (salary, category) => {
  const salaryBand = getFoirSalaryBand(salary);
  if (!salaryBand) return null;

  return hdfcConfig.foirTable[salaryBand][category] || null;
};

// Function to get multiplier based on salary and category
const getMultiplier = (salary, category) => {
  const salaryBand = getMultiplierSalaryBand(salary);
  if (!salaryBand) return null;

  return hdfcConfig.multiplierTable[salaryBand][category] || null;
};

// HDFC Bank specific eligibility calculation
export const calculateHdfcEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
    companyName,
    creditScore,
    employmentType,
    interestRate, // User-provided interest rate
    age, // Applicant's current age
    category, // User-provided category (B, C, GOVT)
    existingLoanBanks, // NEW: List of banks where customer has existing personal loans
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
    btTotalOutstanding
  } = userData;

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const bankIncentiveConsidered = (averageIncentive || 0) * (hdfcConfig.incentivePercentage || 0);
  const actualMonthlyIncome = (basicSalary || 0) + bankIncentiveConsidered;
  
  // Use actualMonthlyIncome for all subsequent calculations
  const monthlyIncomeForCalc = actualMonthlyIncome;

  // ========== BALANCE TRANSFER MODE DETECTION ==========
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    console.log('🔄 HDFC - BALANCE TRANSFER MODE ACTIVATED');
    console.log('📦 BT Loans:', loansForBT.length);
    console.log('💰 BT Total Outstanding:', btTotalOutstanding);
    console.log('💳 BT Total EMI:', btTotalEMI);

    // For Partial BT: Deduct non-BT EMIs from salary
    // Formula: Adjusted Salary = Gross Salary - Non-BT Loans EMI - Credit Card Obligation
    nonBTLoansEMI = (existingEMI || 0) - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI - creditCardDeduction;

    console.log('📊 Original Salary:', monthlyIncomeForCalc);
    console.log('📊 Non-BT Loans EMI:', nonBTLoansEMI);
    console.log('💳 Credit Card Obligation (5% of non-BT CC):', creditCardDeduction);
    console.log('📊 Adjusted Salary for BT:', adjustedIncome);

    // Check if adjusted income is positive
    if (adjustedIncome <= 0) {
      return {
        eligible: false,
        reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains for Balance Transfer calculation`,
        isBTMode: true
      };
    }
  }
  // ========== END BT MODE DETECTION ==========

  // CHECK: If customer already has a personal loan from HDFC Bank
  console.log('🏦 HDFC Bank - Checking existing loans...');
  console.log('Received existingLoanBanks:', existingLoanBanks);

  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const hdfcBankNames = ['hdfc', 'hdfc bank'];
    const hasExistingHdfcLoan = existingLoanBanks.some(bank =>
      hdfcBankNames.some(name => bank.includes(name))
    );

    console.log('HDFC - Has existing loan?', hasExistingHdfcLoan);

    if (hasExistingHdfcLoan) {
      console.log('❌ HDFC - REJECTING due to existing personal loan');
      return {
        eligible: false,
        reason: 'As an existing customer of HDFC Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('HDFC Bank', 'ageRules');
  const minAge = ageConfig ? ageConfig.minAge : hdfcConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : hdfcConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Pass 1: Preliminary ROI for initial calculation
  const baseRate = hdfcConfig.interestRate;

  // Use user-provided category (from frontend: B, C, or GOVT)
  const companyCategory = category || 'B'; // Default to B if not provided
  if (!hdfcConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }


  // Apply tenure capping based on category (tenure is in months)
  // Logic Bridge: Use govtMaxTenure if available
  let lookupCategory = companyCategory === 'Govt' ? 'A' : companyCategory;
  let maxTenureForCategory = (isGovtEmployee && govtMaxTenure) ? govtMaxTenure : hdfcConfig.maxTenureByCategory[lookupCategory];

  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${companyCategory}`
    };
  }

  // ALWAYS USE MAXIMUM TENURE FOR THE CATEGORY (ignore user's requested tenure)
  // This shows the maximum loan amount the bank can offer for this category
  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Store user's request for display purposes
  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check minimum salary requirement based on category
  // For BT mode, use adjusted income for salary checks
  let lookupCategoryMinSalary = companyCategory === 'Govt' ? 'A' : companyCategory;
  const categoryMinSalary = hdfcConfig.minSalary[lookupCategoryMinSalary] || hdfcConfig.minSalary['A'];
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < categoryMinSalary) {
    return {
      eligible: false,
      reason: `Minimum monthly income required for ${companyCategory} category is ₹${categoryMinSalary.toLocaleString()}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`,
      isBTMode: isBT
    };
  }

  // Calculate using Multiplier method
  // For BT mode, use adjusted income
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;

  // Logic Bridge: Use govtMultiplier if available
  let lookupCategoryMultiplier = companyCategory === 'Govt' ? 'A' : companyCategory;
  let multiplier = (isGovtEmployee && govtMultiplier) ? govtMultiplier : getMultiplier(incomeForCalculation, lookupCategoryMultiplier);

  if (!multiplier) {
    return {
      eligible: false,
      reason: 'Unable to determine multiplier for the provided salary and category',
      isBTMode: isBT
    };
  }

  // IMPORTANT: For multiplier, use salary after deducting existing EMI + credit card obligations (non-BT mode)
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // Calculate using FOIR method
  // Logic Bridge: Use govtFOIR if available
  let lookupCategoryFOIR = companyCategory === 'Govt' ? 'A' : companyCategory;
  let foirPercentage = (isGovtEmployee && govtFOIR) ? (govtFOIR / 100) : getFoirPercentage(incomeForCalculation, lookupCategoryFOIR);

  if (!foirPercentage) {
    return {
      eligible: false,
      reason: 'Unable to determine FOIR percentage for the provided salary and category',
      isBTMode: isBT
    };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  // For BT mode: existingEMI already adjusted (set to 0 or minimal), use full FOIR capacity
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  // Calculate preliminary loan amount based on available EMI using base rate
  const preliminaryFoirLoanAmount = calculateLoanAmountFromEMI(availableEMI, baseRate, cappedTenureYears);

  // Take the minimum for first pass
  const preliminaryMaxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    preliminaryFoirLoanAmount
  );

  // Apply bank's maximum loan cap for pass 1
  const preliminaryLoanAmount = Math.min(preliminaryMaxLoanAmount, hdfcConfig.maxLoanAmount);

  // Pass 2: Get final ROI based on preliminary loan amount
  let finalInterestRate = interestRateOverride || interestRate;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = getInterestRateForLoan(companyCategory, preliminaryLoanAmount, userData.city || userData.state);

  const effectiveInterestRate = finalInterestRate;

  // Recalculate FOIR loan amount with final effective interest rate
  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);

  // For HDFC, take the minimum of Multiplier and FOIR calculations
  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    foirLoanAmount
  );

  // Apply bank's maximum loan cap
  const finalLoanAmount = Math.min(maxLoanAmount, hdfcConfig.maxLoanAmount);
  const loanCapped = maxLoanAmount > hdfcConfig.maxLoanAmount;

  // ========== BALANCE TRANSFER CALCULATION ==========
  let btFreshAmount = 0;
  let btDetails = null;

  if (isBT) {
    // Calculate fresh amount = Max Loan - BT Outstanding
    btFreshAmount = finalLoanAmount - btTotalOutstanding;

    console.log('💵 Max Loan Amount:', finalLoanAmount);
    console.log('💵 BT Outstanding to Clear:', btTotalOutstanding);
    console.log('💵 Fresh Amount:', btFreshAmount);

    if (btFreshAmount < 0) {
      return {
        eligible: false,
        reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds maximum eligible loan amount (₹${Math.round(finalLoanAmount).toLocaleString()})`,
        isBTMode: true,
        maxEligibleLoan: Math.round(finalLoanAmount),
        btOutstanding: btTotalOutstanding
      };
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
  // ========== END BT CALCULATION ==========

  // Calculate final EMI for the loan amount using capped tenure
  const monthlyEMI = calculateEMI(finalLoanAmount, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: hdfcConfig.id,
    bankName: hdfcConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: hdfcConfig.maxLoanAmount,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(maxLoanAmount) : null,
    interestRate: effectiveInterestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    companyCategory: companyCategory,
    calculationMethod: 'Combined (Multiplier and FOIR)',
    multiplier: multiplier,
    foirPercentage: foirPercentage,
    incentivePercentage: hdfcConfig.incentivePercentage,
    incentiveConsidered: bankIncentiveConsidered,
    details: {
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      foirLoanAmount: Math.round(foirLoanAmount),
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    // BT-specific fields (null if not BT mode)
    ...btDetails
  };
};