import { tataConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' || category === 'GOVT' ? 'A' : category;
  if (lookupCategory === 'SUPER-A') lookupCategory = 'SUPER-A'; // Tata supports SUPER-A label natively in matrix

  return getSlabRate('Tata Capital', lookupCategory, loanAmount, location, tataConfig.interestRate);
};

const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;
  if (monthlyInterestRate === 0) return principal / numberOfMonths;
  const emi = principal * monthlyInterestRate * (Math.pow(1 + monthlyInterestRate, numberOfMonths)) / (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
  return Math.round(emi);
};

const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;
  if (monthlyInterestRate === 0) return emi * numberOfMonths;
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

const getSalaryBand = (salary, table) => {
  for (const band of Object.keys(table)) {
    if (band.includes('-')) {
      const [min, max] = band.split('-').map(v => parseInt(v));
      if (salary >= min && salary <= max) return band;
    } else if (band.includes('+')) {
      const min = parseInt(band.replace('+', ''));
      if (salary >= min) return band;
    }
  }
  return Object.keys(table)[Object.keys(table).length - 1];
};

export const calculateTataEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation,
    category = 'A',
    employmentType = 'salaried',
    age,
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
    nonBTLoansEMI = existingEMI - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) return { eligible: false, reason: `Insufficient income for BT after obligations`, isBTMode: true };
  }

  // Standardize Category
  let finalCategory = category;
  if (category === 'SUP-A') finalCategory = 'SUPER-A';
  // Determine company category - handle both standard and GOVT cases
  // Logic Bridge: Support 'government' employment type and 'GOVT' category
  let companyCategory = category || 'B';
  if (employmentType === 'government') {
    companyCategory = 'GOVT';
  } else if (companyCategory === 'Govt' || companyCategory === 'government') {
    companyCategory = 'GOVT';
  }

  // Use standardized GOVT for multiplier and tenure lookups
  const lookupCategory = companyCategory;

  // Apply tenure capping based on category (tenure is in months)
  // Logic Bridge: Support govtMaxTenure override
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : tataConfig.maxTenureByCategory[lookupCategory];

  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    // Fallback if specific category tenure is missing
    maxTenureForCategory = 72;
  }

  const cappedTenureYears = maxTenureForCategory / 12;
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;

  // FOIR Logic
  const foirBand = getSalaryBand(incomeForCalculation, tataConfig.foirTable);
  const foirPercentage = isGovtEmployee && govtFOIR ? (govtFOIR / 100) : tataConfig.foirTable[foirBand];
  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) return { eligible: false, reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed FOIR limit` };

  // Multiplier Logic
  const multiplierBand = getSalaryBand(incomeForCalculation, tataConfig.multiplierTable); // Logic Bridge: Support govtMultiplier override
  let multiplier = isGovtEmployee && govtMultiplier ? govtMultiplier : tataConfig.multiplierTable[multiplierBand][lookupCategory];

  if (!multiplier) return { eligible: false, reason: `Multiplier data missing for category ${finalCategory}` };

  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // Interest Matrix lookup
  let finalInterestRate = interestRateOverride || (isGovtEmployee ? govtROI : null);
  if (!finalInterestRate) {
    // Standardize location key to "City, State" to match Admin lookup
    const locationKey = userData.city && userData.state ? `${userData.city}, ${userData.state}` : (userData.state || null);
    finalInterestRate = getInterestRateForLoan(companyCategory, multiplierLoanAmount, locationKey);
  }

  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

  const finalLoanAmount = Math.min(foirLoanAmount, multiplierLoanAmount, desiredLoanAmount || Infinity);
  const cappedFinalLoan = Math.min(finalLoanAmount, tataConfig.maxLoanAmount);

  return {
    eligible: true,
    bankId: tataConfig.id,
    bankName: tataConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: tataConfig.maxLoanAmount,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
    monthlyEMI: calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears),
    category: finalCategory,
    isBTMode: isBT
  };
};