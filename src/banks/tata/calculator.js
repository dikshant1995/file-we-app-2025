import { tataConfig as baseTataConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService';
import { getEffectiveConfig } from '../../utils/policyUtils';

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, config) => {
  const rateConfig = config.interestRates || baseTataConfig.interestRates;
  if (!rateConfig || !rateConfig.categorySlabRates || !rateConfig.categorySlabRates[category]) {
    return config.interestRate || baseTataConfig.interestRate;
  }

  const slabs = rateConfig.categorySlabRates[category];
  for (const slabLabel in slabs) {
    const match = slabLabel.match(/₹(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      if (loanAmount >= min && loanAmount <= max) return slabs[slabLabel];
    }
  }
  return config.interestRate || baseTataConfig.interestRate;
};

// Helper: Calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyInterestRate === 0) return principal / numberOfMonths;

  const emi = principal * monthlyInterestRate *
    (Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
  return Math.round(emi);
};

// Helper: Reverse calculate principal from EMI
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

// Helper: Get salary band
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

// Tata Capital specific eligibility calculation
export const calculateTataEligibility = (userData) => {
  const config = getEffectiveConfig('Tata Capital', baseTataConfig);

  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation,
    category = 'A',
    creditScore,
    employmentType = 'salaried',
    age,
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
    nonBTLoansEMI = existingEMI - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from Tata Capital
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const tataBankNames = ['tata', 'tata capital'];
    const hasExistingTataLoan = existingLoanBanks.some(bank =>
      tataBankNames.some(name => bank.includes(name))
    );

    if (hasExistingTataLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Tata Capital with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }

  // Check age eligibility
  const minAge = config.ageRules ? config.ageRules.minAge : config.minAge;
  const maxAge = config.ageRules ? config.ageRules.maxAge : config.maxAge;
  if (age && (age < minAge || age > maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${minAge} and ${maxAge} years. Current age: ${age}`
    };
  }

  // 1. Check employment type
  if (!config.employmentTypes?.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported`
    };
  }

  // 2. Apply tenure capping based on category
  const maxTenureForCategory = config.maxTenureByCategory ? config.maxTenureByCategory[category] : 60;
  if (!maxTenureForCategory || maxTenureForCategory === 0) {
    return {
      eligible: false,
      reason: `No loans available for Category ${category}`
    };
  }

  const cappedTenureMonths = maxTenureForCategory;
  const cappedTenureYears = cappedTenureMonths / 12;

  const requestedTenureMonths = loanTenure * 12;
  const tenureCapped = requestedTenureMonths !== maxTenureForCategory;

  const minSalaryTable = config.minSalaryByCategory || baseTataConfig.minSalaryByCategory;
  const minSalary = minSalaryTable[category];
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (!minSalary || incomeToCheck < minSalary) {
    return { eligible: false, reason: `Minimum salary for ${category} is ₹${minSalary?.toLocaleString() || 'N/A'}${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirTable = config.foirTable || config.foirSettings?.foirTable || baseTataConfig.foirTable;
  const foirBand = getSalaryBand(incomeForCalculation, foirTable);
  const foirPercentage = foirTable[foirBand];

  const multiplierTable = config.multiplierTable || config.multiplierRules?.multiplierTable || baseTataConfig.multiplierTable;
  const multiplierBand = getSalaryBand(incomeForCalculation, multiplierTable);
  const multiplier = multiplierTable[multiplierBand] ? multiplierTable[multiplierBand][category] : null;

  if (!multiplier) {
    return { eligible: false, reason: `Category ${category} not found in multiplier table`, isBTMode: isBT };
  }

  const foirCap = incomeForCalculation * foirPercentage;
  const availableEMI = isBT ? foirCap : (foirCap - existingEMI);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing EMI exceeds FOIR limit`
    };
  }

  const baseRate = config.interestRate || baseTataConfig.interestRate;
  const foirLoanAmountPass1 = calculatePrincipalFromEMI(availableEMI, baseRate, cappedTenureYears);

  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncome - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  const preliminaryLoanAmount = Math.min(
    foirLoanAmountPass1,
    multiplierLoanAmount,
    desiredLoanAmount || Infinity
  );

  const absoluteMaxLoan = config.loanCapping?.absoluteMaxLoan || config.maxLoanAmount || 5000000;
  const preliminaryCappedLoan = Math.min(preliminaryLoanAmount, absoluteMaxLoan);

  const finalInterestRate = getInterestRateForLoan(category, preliminaryCappedLoan, config);
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, finalInterestRate, cappedTenureYears);

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
      freshAmountDisbursed: Math.round(btFreshAmount),
      originalIncome: monthlyIncome,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const finalEMI = calculateEMI(cappedFinalLoan, finalInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: config.id,
    bankName: config.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: absoluteMaxLoan,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
    monthlyEMI: finalEMI,
    category: category,
    calculationMethod: 'Combined (FOIR + Multiplier)',
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      multiplier: multiplier + 'x',
      foirLoanAmount: Math.round(foirLoanAmount),
      multiplierLoanAmount: Math.round(multiplierLoanAmount),
      limitingFactor: finalLoanAmount === foirLoanAmount ? 'FOIR' : 'Multiplier',
      availableEMI: Math.round(availableEMI),
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
