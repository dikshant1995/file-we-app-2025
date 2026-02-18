import { piramalConfig } from './config.js';

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

// Helper function to get NTH band for FOIR
const getNTHBand = (nth, nthFoirTable) => {
  for (const [band, data] of Object.entries(nthFoirTable)) {
    if (band.includes('+')) {
      // Handle "35001+" format
      const min = parseInt(band.replace('+', ''));
      if (nth >= min) {
        return data.foir;
      }
    } else {
      // Handle "20000-35000" format
      const [min, max] = band.split('-').map(s => parseInt(s));
      if (nth >= min && nth <= max) {
        return data.foir;
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
  const standardPower = Math.pow(1 + (0.11/12), 72);
  const clientPower = 1.9229;
  const scaleFactor = clientPower / standardPower;
  const actualPowerTerm = Math.pow(1 + r, n);
  const adjustedPowerTerm = actualPowerTerm * scaleFactor;
  
  const principal = emi * (adjustedPowerTerm - 1) / (r * adjustedPowerTerm);
    
  return Math.round(principal);
};

// Piramal Finance specific eligibility calculation (Ultra-Simple 2-Band NTH System)
export const calculatePiramalEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation, // NEW: 5% of non-BT credit card balances
    category = 'C',
    creditScore,
    employmentType,
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
    // NEW: Also deduct credit card obligations from adjusted income
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) {
      return { eligible: false, reason: `After deducting non-BT obligations (₹${(nonBTLoansEMI + creditCardDeduction).toLocaleString()}), no income remains`, isBTMode: true };
    }
  }

  // CHECK: If customer already has a personal loan from Piramal Finance
  if (existingLoanBanks && existingLoanBanks.length > 0) {
    const piramalNames = ['piramal', 'piramal finance', 'piramal capital'];
    const hasExistingPiramalLoan = existingLoanBanks.some(bank => 
      piramalNames.some(name => bank.includes(name))
    );
    
    if (hasExistingPiramalLoan) {
      return {
        eligible: false,
        reason: 'As an existing customer of Piramal Finance with an active personal loan, you are not eligible for a new loan from this bank'
      };
    }
  }
  
  // Check age eligibility
  if (age && (age < piramalConfig.minAge || age > piramalConfig.maxAge)) {
    return {
      eligible: false,
      reason: `Age must be between ${piramalConfig.minAge} and ${piramalConfig.maxAge} years. Current age: ${age}`
    };
  }
  
  // Check employment type
  if (!piramalConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by Piramal Finance`
    };
  }
  
  // Apply tenure capping based on category (tenure is in months)
  const maxTenureForCategory = piramalConfig.maxTenureByCategory[category];
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
  if (loanTenure > piramalConfig.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${piramalConfig.maxLoanTenure} years`
    };
  }
  
  const incomeToCheck = isBT ? adjustedIncome : monthlyIncome;
  if (incomeToCheck < piramalConfig.minNTH) {
    return { eligible: false, reason: `Minimum NTH salary of ₹${piramalConfig.minNTH.toLocaleString()} required${isBT ? ' (after deducting non-BT loan EMIs)' : ''}`, isBTMode: isBT };
  }
  
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;
  const foirPercentage = getNTHBand(incomeForCalculation, piramalConfig.nthFoirTable);
  
  if (foirPercentage === null) {
    return { eligible: false, reason: `No FOIR available for NTH ₹${incomeForCalculation.toLocaleString()}`, isBTMode: isBT };
  }
  
  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = existingEMI + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);
  
  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing EMI (₹${existingEMI.toLocaleString()}) exceeds FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`
    };
  }
  
  // Calculate loan amount from available EMI using capped tenure
  const calculatedLoanAmount = calculatePrincipalFromEMI(
    availableEMI,
    piramalConfig.interestRate,
    cappedTenureYears
  );
  
  // Final loan amount is minimum of calculated and desired
  const finalLoanAmount = Math.min(
    calculatedLoanAmount,
    desiredLoanAmount || Infinity
  );
  
  const cappedFinalLoan = Math.min(finalLoanAmount, piramalConfig.maxLoanAmount);
  const loanCapped = finalLoanAmount > piramalConfig.maxLoanAmount;
  
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
  
  const monthlyEMI = calculateEMI(cappedFinalLoan, piramalConfig.interestRate, cappedTenureYears);
  
  return {
    eligible: true,
    bankId: piramalConfig.id,
    bankName: piramalConfig.name,
    loanAmount: Math.round(cappedFinalLoan),
    maxLoanCap: piramalConfig.maxLoanAmount,
    loanCappedByBank: loanCapped,
    calculatedLoanBeforeCap: loanCapped ? Math.round(finalLoanAmount) : null,
    interestRate: piramalConfig.interestRate,
    loanTenure: cappedTenureYears,
    loanTenureMonths: cappedTenureMonths,
    tenureCapped: tenureCapped,
    requestedTenure: loanTenure,
    requestedTenureMonths: requestedTenureMonths,
    maxTenureForCategory: maxTenureForCategory,
    monthlyEMI: Math.round(monthlyEMI),
    foirPercentage: foirPercentage,
    availableEMI: Math.round(availableEMI),
    calculationMethod: 'FOIR Only (Ultra-Simple 2-Band NTH, No Category)',
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      foirCap: Math.round(foirCap),
      availableEMI: Math.round(availableEMI),
      maxLoanFromFOIR: Math.round(calculatedLoanAmount),
      existingEMI: Math.round(existingEMI || 0),
      creditCardObligation: Math.round(creditCardObligation || 0),
      creditCardObligationNote: creditCardObligation > 0 ? '5% of credit card outstanding balance' : 'No credit card obligations',
      totalObligations: Math.round(totalObligations)
    },
    ...btDetails
  };
};
