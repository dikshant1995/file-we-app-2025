import { poonawalaConfig } from './config.js';
import { getBankConfig } from '../../services/bankConfigService.js';
import { getSlabRate } from '../../utils/policyUtils.js';

// Helper: Get interest rate based on category and loan amount
const getInterestRateForLoan = (category, loanAmount, location = null) => {
  let lookupCategory = category === 'Govt' || category === 'GOVT' ? 'A' : category;
  if (lookupCategory === 'SUPER-A') lookupCategory = 'SUPER-A';
  return getSlabRate('Poonawala Finance', lookupCategory, loanAmount, location, poonawalaConfig.interestRate);
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

export const calculatePoonawalaEligibility = (userData) => {
  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI = 0,
    creditCardObligation = 0,
    category = 'C',
    employmentType,
    age,
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

  if (isBT) {
    const nonBTLoansEMI = existingEMI - btTotalEMI;
    const creditCardDeduction = creditCardObligation || 0;
    adjustedIncome = monthlyIncome - nonBTLoansEMI - creditCardDeduction;
    if (adjustedIncome <= 0) return { eligible: false, reason: `Insufficient NTH for Balance Transfer`, isBTMode: true };
  }

  // Standardize Category to SUPER-A / A / B / C / D / GOVT
  let finalCategory = category;
  if (category === 'SUP-A' || category === 'SUPER A') finalCategory = 'SUPER-A';
  if (isGovtEmployee || employmentType === 'government') finalCategory = 'GOVT';

  // Apply tenure capping
  let lookupSegment = finalCategory === 'SUPER-A' ? 'SUP-A' : (finalCategory === 'GOVT' ? 'SUP-A' : finalCategory);
  let maxTenureForCategory = isGovtEmployee && govtMaxTenure ? govtMaxTenure : poonawalaConfig.maxTenureByCategory[lookupSegment];

  if (!maxTenureForCategory) return { eligible: false, reason: `Category ${finalCategory} is currently non-serviced` };

  const cappedTenureYears = maxTenureForCategory / 12;
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;

  // Matrix FOIR logic (Segment x NTH)
  const segmentData = poonawalaConfig.foirMatrix[lookupSegment] || poonawalaConfig.foirMatrix['C'];
  let foirPercentage = null;

  for (const [bandName, bandData] of Object.entries(segmentData)) {
    if (incomeForCalculation >= bandData.minNTH && (bandData.maxNTH === null || incomeForCalculation < bandData.maxNTH)) {
      foirPercentage = bandData.foir;
      break;
    }
  }

  if (isGovtEmployee && govtFOIR) foirPercentage = govtFOIR / 100;

  if (!foirPercentage) return { eligible: false, reason: `No lending policy for NTH ₹${incomeForCalculation.toLocaleString()}` };

  const foirCap = incomeForCalculation * foirPercentage;
  const totalObligations = (existingEMI || 0) + (creditCardObligation || 0);
  const availableEMI = isBT ? foirCap : (foirCap - totalObligations);

  if (availableEMI <= 0) return { eligible: false, reason: `Policy breach: Obligations exceed FOIR limit` };

  // Interest Matrix lookup
  let finalInterestRate = interestRateOverride || (isGovtEmployee ? govtROI : null);
  if (!finalInterestRate) finalInterestRate = getInterestRateForLoan(finalCategory, (incomeForCalculation * 20), userData.city || userData.state);

  const calculatedLoanAmount = calculatePrincipalFromEMI(availableEMI, finalInterestRate, cappedTenureYears);
  const finalLoanAmount = Math.min(calculatedLoanAmount, desiredLoanAmount || Infinity, poonawalaConfig.maxLoanAmount);

  return {
    eligible: true,
    bankId: poonawalaConfig.id,
    bankName: poonawalaConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: poonawalaConfig.maxLoanAmount,
    interestRate: finalInterestRate,
    loanTenure: cappedTenureYears,
    monthlyEMI: calculateEMI(finalLoanAmount, finalInterestRate, cappedTenureYears),
    category: finalCategory,
    isBTMode: isBT
  };
};
