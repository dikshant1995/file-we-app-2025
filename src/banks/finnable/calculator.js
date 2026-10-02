import { finnableConfig } from './config.js';
import { 
  isFinnableTier1City, 
  isFinnableNegativeProfile, 
  isSolePropAllowedZone 
} from '../../config/finnableBankPolicy.js';

// Helper function to calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const r = annualInterestRate / 12 / 100;
  const n = tenureInYears * 12;
  if (r === 0) return Math.round(principal / n);
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
};

// Main Eligibility Calculator for Finnable Finance Ltd
export const calculateFinnableEligibility = (userData = {}, configOverride = {}) => {
  const {
    desiredLoanAmount = 1500000,
    loanTenure = 5,
    basicSalary = 0,
    monthlyIncome = 0,
    existingEMI = 0,
    creditCardObligation = 0,
    creditScore = 720,
    designation = '',
    employmentType = 'salaried',
    companyType = 'Pvt Ltd',
    hasPfDeduction = true,
    sameCompanySalaryCredits = 3,
    age = 30,
    totalWorkExperience = 12,
    city = 'Tier 1',
    state = '',
    finnableScore = 650
  } = userData;

  // Merge dynamic admin config overrides if available
  const cfg = {
    ...finnableConfig,
    ...(configOverride || {}),
    ...(configOverride?.finnableOverview || {}),
    ...(configOverride?.demographics || {})
  };

  const actualIncome = Number(basicSalary || monthlyIncome || 0);

  // 1. Negative Designation / Profile Check
  if (designation && isFinnableNegativeProfile(designation)) {
    return {
      eligible: false,
      reason: `Designation '${designation}' is listed under Finnable Finance restricted negative profiles.`
    };
  }

  // 2. Age Criteria (21 to 55 Years at login, max 60 till loan maturity)
  const minAge = cfg.minAge || 21;
  const maxAgeLogin = cfg.maxAgeLogin || cfg.maxAge || 55;
  const maxAgeMaturity = cfg.maxAgeMaturity || 60;

  if (age && (age < minAge || age > maxAgeLogin)) {
    return {
      eligible: false,
      reason: `Applicant age must be between ${minAge} and ${maxAgeLogin} years at login for Finnable (Current: ${age} years).`
    };
  }

  const requestedTenureYears = Number(loanTenure || 5);
  if (age + requestedTenureYears > maxAgeMaturity) {
    return {
      eligible: false,
      reason: `Applicant age at loan maturity (${age + requestedTenureYears} years) exceeds Finnable ceiling of ${maxAgeMaturity} years.`
    };
  }

  // 3. Work Experience (Minimum 6 Months)
  const minWorkExp = cfg.minWorkExperienceMonths || cfg.minExperienceTotal || 6;
  const totalExpMonths = Number(totalWorkExperience || 6);
  if (totalExpMonths < minWorkExp) {
    return {
      eligible: false,
      reason: `Finnable requires minimum ${minWorkExp} months total work experience (Current: ${totalExpMonths} months).`
    };
  }

  // 4. City Tier & Minimum Salary Thresholds (Tier 1 = ₹20,000, Tier 2 = ₹15,000)
  const isTier1 = isFinnableTier1City(city, state);
  const minSalaryRequired = isTier1 
    ? (cfg.minSalaryTier1 || 20000) 
    : (cfg.minSalaryTier2 || cfg.minSalary || 15000);

  if (actualIncome < minSalaryRequired) {
    return {
      eligible: false,
      reason: `Minimum monthly income of ₹${minSalaryRequired.toLocaleString()} required for ${isTier1 ? 'Tier 1' : 'Tier 2'} location in Finnable (Current: ₹${actualIncome.toLocaleString()}).`
    };
  }

  // 5. Company Type & Employment Eligibility Checks
  const normCompanyType = String(companyType || '').toLowerCase().trim();
  const isSoleProp = normCompanyType.includes('sole') || normCompanyType.includes('proprietor');
  const isPartnership = normCompanyType.includes('partner');

  // Sole Proprietorship Zone Restriction (Allowed in West & South zones only)
  if (isSoleProp && !isSolePropAllowedZone(state)) {
    return {
      eligible: false,
      reason: `Sole Proprietorship applications for Finnable are allowed ONLY in West and South zones (Maharashtra, Gujarat, Goa, Karnataka, Tamil Nadu, Andhra, Telangana, Kerala).`
    };
  }

  // Salary credits validation based on company type & PF status
  if (!hasPfDeduction && (isSoleProp || isPartnership) && Number(sameCompanySalaryCredits || 0) < 6) {
    return {
      eligible: false,
      reason: `Finnable policy requires minimum 6 salary credits from the same company for Sole Prop / Partnership without PF deduction (Provided: ${sameCompanySalaryCredits}).`
    };
  }

  if (!hasPfDeduction && !isSoleProp && !isPartnership && Number(sameCompanySalaryCredits || 0) < 3) {
    return {
      eligible: false,
      reason: `Finnable policy requires minimum 3 salary credits from the same company without PF deduction (Provided: ${sameCompanySalaryCredits}).`
    };
  }

  // 6. CIBIL Score & Risk Matrix (CIBIL 700+ => ₹15L Max | NTC -1 => ₹4L Max)
  const isNtc = Number(creditScore || 0) < 700 || Number(creditScore) === -1;
  const ntcMinScore = cfg.ntcFinnableScoreMin || cfg.finnableRiskMatrix?.ntcMinusOne?.finnableScoreMin || 600;

  if (isNtc) {
    if (Number(finnableScore || 0) < ntcMinScore) {
      return {
        eligible: false,
        reason: `Finnable internal score of minimum ${ntcMinScore} is required for NTC / score <700 applicants (Current score: ${finnableScore}).`
      };
    }
  }

  // Capping limits by CIBIL Score
  const ntcMaxCap = cfg.ntcMaxLoanAmount || cfg.finnableRiskMatrix?.ntcMinusOne?.maxLoanAmount || 400000;
  const defaultMaxCap = cfg.maxLoanAmount || cfg.finnableRiskMatrix?.cibil700Plus?.maxLoanAmount || 1500000;
  const maxLoanAllowed = isNtc ? ntcMaxCap : defaultMaxCap;

  const ntcMaxTenure = cfg.ntcMaxTenureMonths || 36;
  const defaultMaxTenure = cfg.maxTenureMonths || 60;
  const maxTenureMonthsAllowed = isNtc ? ntcMaxTenure : defaultMaxTenure;

  // 7. Obligations & Available EMI
  const requestedTenureMonths = requestedTenureYears * 12;
  const calculationTenureMonths = Math.min(requestedTenureMonths, maxTenureMonthsAllowed);
  const tenureYears = calculationTenureMonths / 12;

  const ccObligation = Number(creditCardObligation || 0);
  const totalObligations = Number(existingEMI || 0) + ccObligation;
  const availableEMI = actualIncome - totalObligations;

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing monthly obligations (₹${totalObligations.toLocaleString()}) equal or exceed total monthly income (₹${actualIncome.toLocaleString()}).`
    };
  }

  // 8. Net Income Capacity Calculation (No FOIR cap & No Multiplier cap)
  const initialMonthlyRate = (cfg.minRoi || 22.0) / 12 / 100;
  const numberOfMonths = calculationTenureMonths;
  const calculatedCapacity = availableEMI * (Math.pow(1 + initialMonthlyRate, numberOfMonths) - 1) / (initialMonthlyRate * Math.pow(1 + initialMonthlyRate, numberOfMonths));

  // Eligible loan is determined directly by income capacity, capped by max loan ceiling & desired amount
  let finalLoanAmount = Math.min(Math.round(calculatedCapacity), maxLoanAllowed);

  if (desiredLoanAmount && desiredLoanAmount > 0) {
    finalLoanAmount = Math.min(finalLoanAmount, desiredLoanAmount);
  }

  const minLoanThreshold = cfg.minLoanAmount || 50000;
  if (finalLoanAmount < minLoanThreshold) {
    return {
      eligible: false,
      reason: `Calculated loan amount (₹${finalLoanAmount.toLocaleString()}) is below Finnable minimum threshold of ₹${minLoanThreshold.toLocaleString()}.`
    };
  }

  // Calculate dynamic ROI: 36% for minimum loan (50k) down to 22% for max loan (15L)
  const minL = minLoanThreshold;
  const maxL = maxLoanAllowed;
  const maxR = cfg.maxRoi || 36.0;
  const minR = cfg.minRoi || 22.0;

  let appliedRoi = maxR;
  if (finalLoanAmount >= maxL) {
    appliedRoi = minR;
  } else if (finalLoanAmount <= minL) {
    appliedRoi = maxR;
  } else {
    const rawRoi = maxR - ((finalLoanAmount - minL) / (maxL - minL)) * (maxR - minR);
    appliedRoi = Number(rawRoi.toFixed(2));
  }

  const monthlyEMI = calculateEMI(finalLoanAmount, appliedRoi, tenureYears);
  const form16Threshold = cfg.form16Threshold || 500000;
  const isForm16Required = finalLoanAmount >= form16Threshold;

  return {
    eligible: true,
    bankId: cfg.id || 'finnable',
    bankName: cfg.name || 'Finnable Finance Ltd',
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: maxLoanAllowed,
    appliedRoi,
    interestRate: appliedRoi,
    loanTenure: tenureYears,
    loanTenureMonths: calculationTenureMonths,
    requestedTenureMonths,
    monthlyEMI,
    availableEMI: Math.round(availableEMI),
    details: {
      bureauType: isNtc ? 'NTC (-1 / <700)' : 'CIBIL 700+',
      finnableScore: isNtc ? finnableScore : 'N/A',
      cityTier: isTier1 ? 'Tier 1' : 'Tier 2',
      isForm16Required,
      processingFeeRange: `${cfg.minPf || 2}% to ${cfg.maxPf || 6}%`
    }
  };
};

