import { kotakConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper function to get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' || category === 'GOVT' ? 'A' : category;
  if (lookupCategory === 'SUPER-A') lookupCategory = 'AA'; // Map for Kotak internal rates

  // Use centralized slab rate finder
  const effectiveRate = getSlabRate(
    'Kotak Mahindra Bank',
    lookupCategory,
    loanAmount,
    location,
    kotakConfig.interestRate
  );

  console.log(`📊 Kotak ROI Search: Cat ${category}, Amount ₹${loanAmount} -> ${effectiveRate}%`);
  return effectiveRate;
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
const calculateLoanAmountFromEMI = (emi, annualInterestRate, tenureInYears) => {
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

  const loanAmount = emi * (adjustedPowerTerm - 1) / (r * adjustedPowerTerm);
  return Math.round(loanAmount);
};

// Function to determine salary band for multiplier table
const getMultiplierSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 35000) return '25000-35000';
  if (salary >= 35001 && salary <= 50000) return '35001-50000';
  if (salary >= 50001 && salary <= 75000) return '50001-75000';
  if (salary > 75000) return '75000+';
  return null;
};

// Function to determine salary band for FOIR table
const getFoirSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 34999) return '25000-34999';
  if (salary >= 35000 && salary <= 49999) return '35000-49999';
  if (salary >= 50000) return '50000+';
  return null;
};

// Function to determine company category
const getCompanyCategory = (companyName, employmentType) => {
  // Government employees are always classified as Category GOVT
  if (employmentType === 'government') {
    return 'GOVT';
  }

  // Simplified approach for initial detection
  const company = companyName.toLowerCase();
  if (company.includes('google') || company.includes('microsoft') || company.includes('amazon')) {
    return 'SUPER-A';
  } else if (company.includes('tcs') || company.includes('infosys') || company.includes('wipro')) {
    return 'A';
  } else if (company.includes('hcl') || company.includes('tech mahindra')) {
    return 'B';
  } else if (company.includes('local') || company.includes('regional')) {
    return 'C';
  }
  return 'D';
};

// Function to get multiplier based on salary and category
const getMultiplier = (salary, category) => {
  const salaryBand = getMultiplierSalaryBand(salary);
  if (!salaryBand) return null;

  // INTERNAL MAPPING for Kotak specific config
  let lookupCategory = category;
  if (category === 'SUPER-A') lookupCategory = 'AA';
  if (category === 'GOVT') lookupCategory = 'A';

  return kotakConfig.multiplierTable[salaryBand][lookupCategory] || null;
};

// Function to get FOIR percentage based on salary and category
const getFoirPercentage = (salary, category) => {
  const salaryBand = getFoirSalaryBand(salary);
  if (!salaryBand) return null;

  // INTERNAL MAPPING for Kotak specific config
  let lookupCategory = category;
  if (category === 'SUPER-A') lookupCategory = 'AA';
  if (category === 'GOVT') lookupCategory = 'A';

  return kotakConfig.foirTable[salaryBand][lookupCategory] || null;
};

// Kotak Mahindra Bank specific eligibility calculation
export const calculateKotakEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
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
    interestRateOverride,
    isGovtEmployee,
    govtROI,
    govtFOIR,
    govtMultiplier,
    govtMaxTenure,
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding
  } = userData;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncome;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = (existingEMI || 0) - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;

    if (adjustedIncome <= 0) {
      return {
        eligible: false,
        reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`,
        isBTMode: true
      };
    }
  }

  // CHECK: If customer already has a personal loan from Kotak Bank
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const kotakBankNames = ['kotak', 'kotak mahindra', 'kotak mahindra bank'];
    const hasExistingKotakLoan = existingLoanBanks.some(bank =>
      kotakBankNames.some(name => bank.includes(name))
    );

    if (hasExistingKotakLoan) {
      return {
        eligible: false,
        reason: 'Existing customer with active loan from Kotak Bank is not eligible for new loan'
      };
    }
  }

  // Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('Kotak Mahindra Bank', 'ageRules');
  const minAge = ageConfig ? ageConfig.minAge : kotakConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : kotakConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age criteria check failed (Min: ${minAge}, Max: ${maxAge})`
    };
  }

  // Standardize Category to SUPER-A / A / B / C / D / GOVT
  // Determine company category - handle both standard and GOVT cases
  // Logic Bridge: Support 'government' employment type and 'GOVT' category
  let companyCategory = category || getCompanyCategory(companyName || '', employmentType);
  if (employmentType === 'government') {
    companyCategory = 'GOVT';
  } else if (companyCategory === 'Govt' || companyCategory === 'government') {
    companyCategory = 'GOVT';
  }
  let finalCategory = companyCategory; // Ensure finalCategory is set for subsequent use

  // Use standardized GOVT for tenure lookup
  const lookupCategory = companyCategory === 'SUPER-A' ? 'AA' : (companyCategory === 'GOVT' ? 'A' : companyCategory);

  // Apply tenure capping based on category (tenure is in months)
  // Logic Bridge: Support govtMaxTenure override
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : kotakConfig.maxTenureByCategory[lookupCategory];

  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    // Fallback to A for government if config key is missing
    maxTenureForCategory = kotakConfig.maxTenureByCategory['GOVT'] || kotakConfig.maxTenureByCategory['A'] || 72;
  }

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Multiplier logic with standardized GOVT and SUPER-A
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  let multiplier = isGovtEmployee && govtMultiplier ? govtMultiplier : getMultiplier(incomeForCalculation, finalCategory);

  if (!multiplier) {
    return {
      eligible: false,
      reason: 'Logic Error: Risk multiplier assessment failed'
    };
  }

  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // FOIR logic with standardized GOVT and SUPER-A
  let foirPercentage = isGovtEmployee && govtFOIR ? (govtFOIR / 100) : getFoirPercentage(incomeForCalculation, finalCategory);

  if (!foirPercentage) {
    return {
      eligible: false,
      reason: 'Logic Error: FOIR threshold assessment failed'
    };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  // Interest Rate Matrix lookup
  let finalInterestRate = interestRateOverride || interestRate;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = getInterestRateForLoan(finalCategory, multiplierLoanAmount, userData.city || userData.state);

  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  // Take minimum of Multiplier, FOIR, and Max Cap
  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    foirLoanAmount
  );

  const finalLoanAmount = Math.min(maxLoanAmount, kotakConfig.maxLoanAmount);
  const loanCapped = maxLoanAmount > kotakConfig.maxLoanAmount;

  const monthlyEMI = calculateEMI(finalLoanAmount, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: kotakConfig.id,
    bankName: kotakConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: kotakConfig.maxLoanAmount,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
    monthlyEMI: Math.round(monthlyEMI),
    category: finalCategory,
    isBTMode: isBT,
    details: {
      multiplier: multiplier,
      foir: (foirPercentage * 100).toFixed(0) + '%'
    }
  };
};