import { shriRamConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper function to get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' ? 'C' : category;
  return getSlabRate('Shri Ram Finance', lookupCategory, loanAmount, location, shriRamConfig.interestRate);
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
    basicSalary,
    averageIncentive,
    monthlyIncome,
    existingEMI = 0,
    category = 'C',
    creditScore,
    employmentType,
    age,
    existingLoanBanks,
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
    btTotalOutstanding,
    creditCardObligation = 0,
    // Incentive Overrides
    incentivePercentageOverride,
    incentiveMonthsOverride
  } = userData;

  // ========== INCENTIVE CALCULATION LOGIC ==========
  const effectiveIncentivePercentage = incentivePercentageOverride !== undefined 
    ? incentivePercentageOverride 
    : (shriRamConfig.incentivePercentage || 0);

  const effectiveIncentiveMonths = incentiveMonthsOverride !== undefined 
    ? incentiveMonthsOverride 
    : 3; // Default to 3 months if not specified

  const bankIncentiveConsidered = (averageIncentive || 0) * effectiveIncentivePercentage;
  const actualMonthlyIncome = (basicSalary || 0) + bankIncentiveConsidered;
  
  // Use actualMonthlyIncome for all subsequent calculations
  const monthlyIncomeForCalc = actualMonthlyIncome;

  const isBT = isBTMode && loansForBT && loansForBT.length > 0;
  let adjustedIncome = monthlyIncomeForCalc;
  let nonBTLoansEMI = 0;

  if (isBT) {
    nonBTLoansEMI = existingEMI - btTotalEMI;
    adjustedIncome = monthlyIncomeForCalc - nonBTLoansEMI;
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

  // Check age eligibility
  if (age && (age < shriRamConfig.minAge || age > shriRamConfig.maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${shriRamConfig.minAge} and ${shriRamConfig.maxAge} years. Current age: ${age}`
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
  // Logic Bridge: Support govtMaxTenure override
  let lookupCategory = category === 'Govt' ? 'C' : category; // Fallback Govt to C for Shri Ram
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : shriRamConfig.maxTenureByCategory[lookupCategory];

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

  const minSalaryRequired = shriRamConfig.minSalaryByCategory[category] || shriRamConfig.minSalaryByCategory['C'];
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncomeForCalc;
  if (incomeToCheck < minSalaryRequired) {
    return { eligible: false, reason: `Minimum salary of ₹${minSalaryRequired.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }

  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncomeForCalc;
  const salaryBand = getSalaryBand(incomeForCalculation, shriRamConfig.salaryBandTable);

  if (!salaryBand) {
    return { eligible: false, reason: 'Salary does not fall within any eligible band', isBTMode: isBT };
  }

  const bandData = shriRamConfig.salaryBandTable[salaryBand];

  // Logic Bridge: Support govtMultiplier and govtFOIR overrides
  let multiplier = isGovtEmployee && govtMultiplier ? govtMultiplier : bandData.multiplier;
  let foirPercentage = isGovtEmployee && govtFOIR ? (govtFOIR / 100) : bandData.foir;

  const foirCap = monthlyIncomeForCalc * foirPercentage;
  // User Logic: (Salary * FOIR%) - Non-BT EMI = Available EMI
  const availableEMI = isBT ? (foirCap - nonBTLoansEMI) : (foirCap - existingEMI);

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing EMI (₹${existingEMI.toLocaleString()}) exceeds FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }

  // Method 2: Multiplier-based calculation
  // IMPORTANT: For multiplier, use salary after deducting existing EMI + credit card obligations (non-BT mode)
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableSalary = isBT ? incomeForCalculation : (monthlyIncomeForCalc - totalObligations);
  const multiplierLoanAmount = availableSalary * multiplier;

  // Pass 1: Preliminary ROI for initial calculation
  const baseRate = shriRamConfig.interestRate;

  // Calculate preliminary loan amount based on available EMI using base rate
  const preliminaryFoirLoanAmount = calculatePrincipalFromEMI(availableEMI, baseRate, cappedTenureYears);

  // Take the minimum for first pass
  const preliminaryMaxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount,
    preliminaryFoirLoanAmount
  );

  // Apply bank's maximum loan cap for pass 1
  const preliminaryLoanAmount = Math.min(preliminaryMaxLoanAmount, shriRamConfig.maxLoanAmount);

  // Pass 2: Get final ROI based on preliminary loan amount
  let finalInterestRate = interestRateOverride;
  if (isGovtEmployee && govtROI) finalInterestRate = govtROI;
  if (!finalInterestRate) finalInterestRate = getInterestRateForLoan(category, preliminaryLoanAmount, userData.city || userData.state);

  const effectiveInterestRate = finalInterestRate;

  // Recalculate FOIR-based principal with final effective interest rate
  const foirLoanAmount = calculatePrincipalFromEMI(availableEMI, effectiveInterestRate, cappedTenureYears);


  // Final loan amount is minimum of both methods and desired amount
  const finalLoanAmount = Math.min(
    foirLoanAmount,
    multiplierLoanAmount,
    desiredLoanAmount || Infinity
  );

  const maxLoanCapAmount = Math.min(finalLoanAmount, shriRamConfig.maxLoanAmount);
  const loanCapped = finalLoanAmount > shriRamConfig.maxLoanAmount;

  // Apply Dynamic Bachelor Capping
  let appliedBachelorCap = false;
  let bachelorLimitAmount = null;
  let bachelorCapReasonStr = null;
  let cappedFinalLoan = maxLoanCapAmount;

  if (userData.dynamicBachelorLimitOverride !== undefined) {
    bachelorLimitAmount = userData.dynamicBachelorLimitOverride;
    if (cappedFinalLoan > bachelorLimitAmount) {
      cappedFinalLoan = bachelorLimitAmount;
      appliedBachelorCap = true;
      bachelorCapReasonStr = userData.dynamicBachelorCapReason || 'Dynamic Bachelor Capping limit applied';
    }
  } else if (shriRamConfig.bachelorMaxLoanAmount !== undefined && userData.maritalStatus === 'single' && userData.livingStatus === 'rented') {
    bachelorLimitAmount = shriRamConfig.bachelorMaxLoanAmount;
    if (cappedFinalLoan > bachelorLimitAmount) {
      cappedFinalLoan = bachelorLimitAmount;
      appliedBachelorCap = true;
      bachelorCapReasonStr = 'Rented Bachelor Limit Applied (Bank Default)';
    }
  }

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
      originalIncome: monthlyIncomeForCalc,
      adjustedIncome: Math.round(adjustedIncome)
    };
  }

  const monthlyEMI = calculateEMI(cappedFinalLoan, effectiveInterestRate, cappedTenureYears);

  return {
    eligible: true,
    bankId: shriRamConfig.id,
    bankName: shriRamConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: shriRamConfig.maxLoanAmount,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    bachelorCapped: appliedBachelorCap,
    bachelorCapReason: bachelorCapReasonStr,
    regularMaxLoan: Math.round(maxLoanCapAmount),
    bachelorMaxLoanAmount: bachelorLimitAmount !== null ? Math.round(bachelorLimitAmount) : null,
    interestRate: effectiveInterestRate,
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
    incentivePercentage: effectiveIncentivePercentage, // Dynamically reflect override
    incentiveMonths: effectiveIncentiveMonths,
    incentiveConsidered: bankIncentiveConsidered,
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

