import { kotakConfig as baseKotakConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService';
import { getEffectiveConfig } from '../../utils/policyUtils';

// Helper function to get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, config) => {
  const rateConfig = config.interestRates;

  if (!rateConfig || !rateConfig.categorySlabRates || !rateConfig.categorySlabRates[category]) {
    return config.interestRate || baseKotakConfig.interestRate;
  }

  const slabs = rateConfig.categorySlabRates[category];

  console.log(`📊 Loan: ₹${loanAmount}, Category: ${category}`);
  console.log('📋 Available slabs:', Object.keys(slabs));

  // Find matching slab by parsing rupee ranges (e.g., "₹100000-500000")
  for (const slabLabel in slabs) {
    // Extract min and max from label like "₹100000-500000"
    const match = slabLabel.match(/₹(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);

      if (loanAmount >= min && loanAmount <= max) {
        console.log(`✅ Matched slab: ${slabLabel} (₹${min}-₹${max}) = ${slabs[slabLabel]}%`);
        return slabs[slabLabel];
      }
    }
  }

  console.log('⚠️ No matching slab, using default');
  return kotakConfig.interestRate;
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
  // Government employees are always classified as Category A
  if (employmentType === 'government') {
    return 'GOVT';
  }

  // For this implementation, we'll use a simplified approach
  // In a real application, this would be based on an actual company database
  const company = companyName.toLowerCase();

  // Example categorization - in reality this would come from a database
  if (company.includes('google') || company.includes('microsoft') || company.includes('amazon')) {
    return 'AA';
  } else if (company.includes('tcs') || company.includes('infosys') || company.includes('wipro')) {
    return 'A';
  } else if (company.includes('hcl') || company.includes('tech mahindra')) {
    return 'B';
  } else if (company.includes('local') || company.includes('regional')) {
    return 'C';
  } else if (company.includes('startup') || company.includes('small')) {
    return 'D';
  }

  // Return null for unlisted companies (ineligible)
  return null;
};

// Function to get multiplier based on salary and category
const getMultiplier = (salary, category, config) => {
  const salaryBand = getMultiplierSalaryBand(salary);
  if (!salaryBand) return null;

  return (config.multiplierTable && config.multiplierTable[salaryBand] && config.multiplierTable[salaryBand][category]) || null;
};

// Function to get FOIR percentage based on salary and category
const getFoirPercentage = (salary, category, config) => {
  const salaryBand = getFoirSalaryBand(salary);
  if (!salaryBand) return null;

  return (config.foirTable && config.foirTable[salaryBand] && config.foirTable[salaryBand][category]) || null;
};

// Kotak Mahindra Bank specific eligibility calculation
export const calculateKotakEligibility = (userData) => {
  // Get effective config (merges hardcoded + admin overrides)
  const config = getEffectiveConfig('Kotak Mahindra Bank', baseKotakConfig);

  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
    companyName,
    creditScore,
    employmentType,
    interestRate,
    age,
    category,
    existingLoanBanks,
    // Balance Transfer fields
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding
  } = userData;

  // ========== BALANCE TRANSFER MODE DETECTION ==========
  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncome;
  let nonBTLoansEMI = 0;

  if (isBT) {
    console.log('🔄 KOTAK - BALANCE TRANSFER MODE ACTIVATED');
    nonBTLoansEMI = (existingEMI || 0) - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;

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
      kotakBankNames.some(name => bank.includes(name))
    );

    if (hasExistingKotakLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Kotak Mahindra Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config
  const minAge = config.ageRules ? config.ageRules.minAge : config.minAge;
  const maxAge = config.ageRules ? config.ageRules.maxAge : config.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Use user-provided interest rate or calculate based on category and loan amount
  const effectiveInterestRate = interestRate || getInterestRateForLoan(category || 'B', desiredLoanAmount || monthlyIncome * 20, config);

  // Check employment type
  if (!config.employmentTypes?.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }

  const companyCategory = category || 'B';

  // Apply tenure capping based on category
  const maxTenureForCategory = config.maxTenureByCategory ? config.maxTenureByCategory[companyCategory] : null;
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${companyCategory}`
    };
  }

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check minimum salary requirement
  const minSalary = (config.minSalary && config.minSalary[companyCategory]) || (config.minSalary && config.minSalary['A']) || 25000;

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < minSalary) {
    return {
      eligible: false,
      reason: `Minimum monthly income required is ₹${minSalary.toLocaleString()} for Category ${companyCategory}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`,
      isBTMode: isBT
    };
  }

  // ========== PASS 1: Calculate preliminary loan amount with base rate ==========
  const baseRate = config.interestRate || 11.0;

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const multiplier = getMultiplier(incomeForCalculation, companyCategory, config);
  if (!multiplier) {
    return {
      eligible: false,
      reason: 'Unable to determine multiplier for the provided salary and category',
      isBTMode: isBT
    };
  }

  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  const foirPercentage = getFoirPercentage(incomeForCalculation, companyCategory, config);
  if (!foirPercentage) {
    return {
      eligible: false,
      reason: 'Unable to determine FOIR percentage for the provided salary and category',
      isBTMode: isBT
    };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  const preliminaryFoirLoanAmount = calculateLoanAmountFromEMI(availableEMI, baseRate, cappedTenureYears);

  const preliminaryMaxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    preliminaryFoirLoanAmount
  );

  const maxLoanCap = config.loanCapping?.absoluteMaxLoan || config.maxLoanAmount || 5000000;
  const preliminaryLoanAmount = Math.min(preliminaryMaxLoanAmount, maxLoanCap);

  // ========== PASS 2: Get correct interest rate ==========
  const finalInterestRate = interestRate || getInterestRateForLoan(companyCategory, preliminaryLoanAmount, config);

  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    foirLoanAmount
  );

  const finalLoanAmount = Math.min(maxLoanAmount, maxLoanCap);
  const loanCapped = maxLoanAmount > maxLoanCap;

  // ========== BALANCE TRANSFER CALCULATION ==========
  let btFreshAmount = 0;
  let btDetails = null;

  if (isBT) {
    btFreshAmount = finalLoanAmount - btTotalOutstanding;

    if (btFreshAmount < 0) {
      return {
        eligible: false,
        reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds maximum eligible loan amount (₹${Math.round(finalLoanAmount).toLocaleString()})`,
        isBTMode: true
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
      originalIncome: monthlyIncome,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const monthlyEMI = calculateEMI(finalLoanAmount, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: config.id,
    bankName: config.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: maxLoanCap,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(maxLoanAmount) : null,
    interestRate: finalInterestRate,
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
    ...btDetails
  };
};
