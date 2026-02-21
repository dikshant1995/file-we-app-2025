import { iciciConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService';

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

// Function to determine company category
const getCompanyCategory = (companyName, employmentType) => {
  if (employmentType === 'government') {
    return 'GOVT';
  }
  const company = companyName.toLowerCase();
  if (company.includes('google') || company.includes('microsoft') || company.includes('amazon')) {
    return 'A';
  } else if (company.includes('tcs') || company.includes('infosys') || company.includes('wipro')) {
    return 'A';
  } else if (company.includes('hcl') || company.includes('tech mahindra')) {
    return 'B';
  } else if (company.includes('local') || company.includes('regional')) {
    return 'C';
  } else if (company.includes('startup') || company.includes('small')) {
    return 'D';
  }
  return 'UNLISTED';
};

// Function to get FOIR percentage based on salary
const getFoirPercentage = (salary) => {
  if (salary < 50000) return iciciConfig.foirTable['<50000'];
  if (salary >= 50000) return iciciConfig.foirTable['>=50000'];
  return null;
};

// Helper function to get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, userData = {}) => {
  const rateConfig = getBankConfig('Kotak Mahindra Bank', 'interestRates', { state: userData.state, city: userData.city });

  console.log('🔍 Rate Config:', rateConfig);

  if (!rateConfig || !rateConfig.categorySlabRates || !rateConfig.categorySlabRates[category]) {
    console.log('⚠️ No rate config found, using default:', kotakConfig.interestRate);
    return kotakConfig.interestRate;
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

// ICICI Bank specific eligibility calculation (FOIR only)
export const calculateIciciEligibility = (userData) => {
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

  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const iciciBankNames = ['icici', 'icici bank'];
    const hasExistingIciciLoan = existingLoanBanks.some(bank =>
      iciciBankNames.some(name => bank.includes(name))
    );
    if (hasExistingIciciLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of ICICI Bank with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  const ageConfig = getBankConfig('ICICI Bank', 'ageRules', { state: userData.state, city: userData.city });
  const minAge = ageConfig ? ageConfig.minAge : iciciConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : iciciConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Use user-provided interest rate or calculate based on category
  const effectiveInterestRate = interestRate || getInterestRateForLoan(category || 'B', userData);

  if (!iciciConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }

  const companyCategory = category || 'B';
  const maxTenureForCategory = iciciConfig.maxTenureByCategory[companyCategory];
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

  const salConfig = getBankConfig('ICICI Bank', 'employmentRules', { state: userData.state, city: userData.city });
  const catMinSalary = iciciConfig.minSalary[companyCategory];
  const effectiveMinSalary = salConfig ? salConfig.salariedMinSalary : catMinSalary;

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < effectiveMinSalary) {
    return {
      eligible: false,
      reason: `Minimum monthly income required for ${companyCategory} category is ₹${effectiveMinSalary.toLocaleString()}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`,
      isBTMode: isBT
    };
  }

  const cappingConfig = getBankConfig('ICICI Bank', 'loanCapping', { state: userData.state, city: userData.city });
  const absoluteMaxLoan = cappingConfig ? cappingConfig.absoluteMaxLoan : iciciConfig.maxLoanAmount;
  const minLoanAmount = cappingConfig ? cappingConfig.minLoanAmount : 100000;

  if (desiredLoanAmount && desiredLoanAmount < minLoanAmount) {
    return {
      eligible: false,
      reason: `Minimum loan amount required by this bank is ₹${minLoanAmount.toLocaleString()}. Requested: ₹${desiredLoanAmount.toLocaleString()}`,
      isBTMode: isBT
    };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirPercentage = getFoirPercentage(incomeForCalculation);
  if (!foirPercentage) {
    return {
      eligible: false,
      reason: 'Unable to determine FOIR percentage for the provided salary',
      isBTMode: isBT
    };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  const foirLoanAmount = calculateLoanAmountFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);

  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    foirLoanAmount
  );

  const finalLoanAmount = Math.min(maxLoanAmount, absoluteMaxLoan);
  const loanCapped = maxLoanAmount > absoluteMaxLoan;

  let btDetails = null;
  if (isBT) {
    const btFreshAmount = finalLoanAmount - btTotalOutstanding;
    if (btFreshAmount < 0) {
      return {
        eligible: false,
        reason: `BT Outstanding (₹${btTotalOutstanding.toLocaleString()}) exceeds maximum eligible loan (₹${Math.round(finalLoanAmount).toLocaleString()})`,
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

  const monthlyEMI = calculateEMI(finalLoanAmount, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: iciciConfig.id,
    bankName: iciciConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: absoluteMaxLoan,
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
    calculationMethod: 'FOIR-based',
    foirPercentage: foirPercentage,
    details: {
      foirLoanAmount: Math.round(foirLoanAmount),
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
