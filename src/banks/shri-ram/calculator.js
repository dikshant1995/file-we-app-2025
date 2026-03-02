import { shriRamConfig } from './config.js';
import { getBankConfig, getDynamicInterestRate } from '../../services/bankConfigService';

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

// Helper function to get salary band
const getSalaryBand = (salary, table) => {
  for (const band of Object.keys(table)) {
    if (band.includes('+')) {
      // Handle "75001+" format
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) {
        return band;
      }
    } else {
      // Handle "25000-35000" format
      const [min, max] = band.split('-').map(s => parseInt(s));
      if (salary >= min && salary <= max) {
        return band;
      }
    }
  }
  return null;
};

// Reverse calculation: Calculate principal from available EMI
// Using client's reverse calculator: Factor = 52.5375
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
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

  const principal = emi * (adjustedPowerTerm - 1) / (r * adjustedPowerTerm);

  return Math.round(principal);
};

// Shri Ram Finance specific eligibility calculation (Salary-Driven Combined System)
export const calculateShriRamEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI = 0,
    category = 'C',
    creditScore,
    employmentType,
    age,
    existingLoanBanks,
    isBTMode,
    loansForBT,
    btTotalEMI,
    btTotalOutstanding,
    creditCardObligation = 0  // Add default value
  } = userData;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncome;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = existingEMI - btTotalEMI;
    adjustedIncome = monthlyIncome - nonBTLoansEMI;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT loan EMIs (₹${nonBTLoansEMI.toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from Shri Ram Finance
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const shriRamNames = ['shri ram', 'shriram', 'shri ram finance', 'shriram finance'];
    const hasExistingShriRamLoan = existingLoanBanks.some(bank =>
      shriRamNames.some(name => bank.includes(name))
    );

    if (hasExistingShriRamLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Shri Ram Finance with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility - Use dynamic config from admin dashboard
  const ageConfig = getBankConfig('Shriram Finance', 'ageRules', { state: userData.state, city: userData.city });
  const minAge = ageConfig ? ageConfig.minAge : shriRamConfig.minAge;
  const maxAge = ageConfig ? ageConfig.maxAge : shriRamConfig.maxAge;

  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // Check employment type
  if (!shriRamConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by Shri Ram Finance`
    };
  }

  // Apply tenure capping based on category (tenure is in months)
  const maxTenureForCategory = shriRamConfig.maxTenureByCategory[category];
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${category}`
    };
  }

  // ALWAYS USE MAXIMUM TENURE FOR THE CATEGORY (ignore user's requested tenure)
  // This shows the maximum loan amount the bank can offer for this category
  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  // Store user's request for display purposes
  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  // Check loan tenure
  if (loanTenure > shriRamConfig.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${shriRamConfig.maxLoanTenure} years`
    };
  }

  // Check minimum salary requirement based on category
  const salConfig = getBankConfig('Shriram Finance', 'employmentRules', { state: userData.state, city: userData.city });
  const catMinSalary = shriRamConfig.minSalaryByCategory[category] || shriRamConfig.minSalaryByCategory['C'];
  const effectiveMinSalary = salConfig ? salConfig.salariedMinSalary : catMinSalary;

  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < effectiveMinSalary) {
    return { eligible: false, reason: `Minimum salary of ₹${effectiveMinSalary.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  // Get loan capping config
  const cappingConfig = getBankConfig('Shriram Finance', 'loanCapping', { state: userData.state, city: userData.city });
  const absoluteMaxLoan = cappingConfig ? cappingConfig.absoluteMaxLoan : shriRamConfig.maxLoanAmount;
  const minLoanAmount = cappingConfig ? cappingConfig.minLoanAmount : 100000;

  // Check minimum loan amount
  if (desiredLoanAmount && desiredLoanAmount < minLoanAmount) {
    return {
      eligible: false,
      reason: `Minimum loan amount required by this bank is ₹${minLoanAmount.toLocaleString()}. Requested: ₹${desiredLoanAmount.toLocaleString()}`,
      isBTMode: isBT
    };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const salaryBand = getSalaryBand(incomeForCalculation, shriRamConfig.salaryBandTable);

  if (!salaryBand) {
    return { eligible: false, reason: 'Salary does not fall within any eligible band', isBTMode: isBT };
  }

  const bandData = shriRamConfig.salaryBandTable[salaryBand];
  const multiplier = bandData.multiplier;
  const foirPercentage = bandData.foir;

  const foirCap = incomeForCalculation * foirPercentage;
  const availableEMI = isBT ? foirCap : (foirCap - existingEMI);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing EMI (₹${existingEMI.toLocaleString()}) exceeds FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // Use dynamic interest rate from Admin settings
  const dynamicRate = getDynamicInterestRate('Shriram Finance', category, cappedFinalLoan || monthlyIncome * 20, { state: userData.state, city: userData.city }, shriRamConfig.interestRate);

  const foirLoanAmount = calculatePrincipalFromEMI(
    availableEMI,
    dynamicRate,
    cappedTenureYears
  );

  // Method 2: Multiplier-based calculation
  // IMPORTANT: For multiplier, use salary after deducting existing EMI + credit card obligations (non-BT mode)
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // Final loan amount is minimum of both methods and desired amount
  const finalLoanAmount = Math.min(
    foirLoanAmount,
    multiplierLoanAmount,
    desiredLoanAmount || Infinity
  );

  const cappedFinalLoan = Math.min(finalLoanAmount, absoluteMaxLoan);
  const loanCapped = finalLoanAmount > absoluteMaxLoan;

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
      creditCardObligationNote: creditCardObligation > 0 ? '5% of non-BT credit card outstanding' : 'No credit card obligation (either no CC or CC in BT)',
      totalNonBTObligations: Math.round(nonBTLoansEMI + (creditCardObligation || 0)),
      originalIncome: monthlyIncome,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const monthlyEMI = calculateEMI(cappedFinalLoan, dynamicRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: shriRamConfig.id,
    bankName: shriRamConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: absoluteMaxLoan,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    interestRate: dynamicRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    multiplier: multiplier,
    foirPercentage: foirPercentage,
    salaryBand: salaryBand,
    availableEMI: Math.round(availableEMI),
    foirLoanAmount: Math.round(foirLoanAmount),
    multiplierLoanAmount: Math.round(multiplierLoanAmount),
    calculationMethod: 'Combined (Income-based FOIR + Multiplier, No Category Distinction)',
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      multiplier: multiplier + 'x',
      salaryBand: salaryBand,
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      foirLoanAmount: Math.round(foirLoanAmount),
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      limitingFactor: finalLoanAmount === foirLoanAmount ? 'FOIR' : 'Multiplier',
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations),
      availableSalaryAfterObligations: Math.round(availableSalary)
    },
    ...btDetails
  };
};
