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

  // Determine company category and segment
  // Logic Bridge: Support 'government' employment type and standardized 'GOVT' key
  let companyCategory = category || 'B';
  if (employmentType === 'government') {
    companyCategory = 'GOVT';
  } else if (companyCategory === 'Govt' || companyCategory === 'government') {
    companyCategory = 'GOVT';
  }

  // Determine segment based on category/employment
  const segment = (companyCategory === 'SUPER-A' || companyCategory === 'GOVT')
    ? 'A'
    : (companyCategory === 'B' ? 'B' : 'C');

  // Apply tenure capping based on segment
  // Logic Bridge: Support govtMaxTenure override
  const maxTenureForSegment = isGovtEmployee && govtMaxTenure ? govtMaxTenure : (segment === 'A' ? 72 : 60);

  if (!maxTenureForSegment) return { eligible: false, reason: `Category ${companyCategory} is currently non-serviced` };

  const cappedTenureYears = maxTenureForSegment / 12;
  const incomeForCalculation = isBT ? adjustedIncome : monthlyIncome;

  // Matrix FOIR logic (Segment x NTH)
  const segmentData = poonawalaConfig.foirMatrix[segment] || poonawalaConfig.foirMatrix['C'];
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
  if (!finalInterestRate) {
    // Standardize location key to "City, State" to match Admin lookup
    const locationKey = userData.city && userData.state ? `${userData.city}, ${userData.state}` : (userData.state || null);
    finalInterestRate = getInterestRateForLoan(companyCategory, (incomeForCalculation * 20), locationKey);
  }

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
    category: companyCategory,
    isBTMode: isBT
  };
};
