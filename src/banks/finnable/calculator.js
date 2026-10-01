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
export const calculateFinnableEligibility = (userData = {}) => {
  const {
    desiredLoanAmount = 500000,
    loanTenure = 5,
    basicSalary = 0,
    monthlyIncome = 0,
    existingEMI = 0,
    creditCardObligation = 0,
    category = 'A',
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

  const actualIncome = Number(basicSalary || monthlyIncome || 0);

  // 1. Negative Designation / Profile Check (Table 4)
  if (designation && isFinnableNegativeProfile(designation)) {
    return {
      eligible: false,
      reason: `Designation '${designation}' is listed under Finnable Finance restricted negative profiles.`
    };
  }

  // 2. Age Criteria (21 to 55 Years at login, max 60 till loan maturity) (Table 1 & 2)
  if (age && (age < finnableConfig.minAge || age > finnableConfig.maxAgeLogin)) {
    return {
      eligible: false,
      reason: `Applicant age must be between ${finnableConfig.minAge} and ${finnableConfig.maxAgeLogin} years at login for Finnable (Current: ${age} years).`
    };
  }

  const requestedTenureYears = Number(loanTenure || 5);
  if (age + requestedTenureYears > finnableConfig.maxAgeMaturity) {
    return {
      eligible: false,
      reason: `Applicant age at loan maturity (${age + requestedTenureYears} years) exceeds Finnable ceiling of ${finnableConfig.maxAgeMaturity} years.`
    };
  }

  // 3. Work Experience (Minimum 6 Months) (Table 1)
  const totalExpMonths = Number(totalWorkExperience || 6);
  if (totalExpMonths < finnableConfig.minWorkExperienceMonths) {
    return {
      eligible: false,
      reason: `Finnable requires minimum 6 months total work experience (Current: ${totalExpMonths} months).`
    };
  }

  // 4. City Tier & Minimum Salary Thresholds (Table 1, 2 & 3)
  const isTier1 = isFinnableTier1City(city, state);
  const minSalaryRequired = isTier1 ? finnableConfig.minSalaryTier1 : finnableConfig.minSalaryTier2;

  if (actualIncome < minSalaryRequired) {
    return {
      eligible: false,
      reason: `Minimum monthly income of ₹${minSalaryRequired.toLocaleString()} required for ${isTier1 ? 'Tier 1' : 'Tier 2'} location in Finnable (Current: ₹${actualIncome.toLocaleString()}).`
    };
  }

  // 5. Company Type & Employment Eligibility Checks (Table 5)
  const normCompanyType = String(companyType || '').toLowerCase().trim();
  const isSoleProp = normCompanyType.includes('sole') || normCompanyType.includes('proprietor');
  const isPartnership = normCompanyType.includes('partner');
  const isHuf = normCompanyType.includes('huf');

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

  // 6. CIBIL Score & Risk Matrix (Table 2)
  const isNtc = Number(creditScore || 0) < 700 || Number(creditScore) === -1;
  
  if (isNtc) {
    // Check Finnable internal score for NTC
    if (Number(finnableScore || 0) < finnableConfig.ntcFinnableScoreMin) {
      return {
        eligible: false,
        reason: `Finnable internal score of minimum ${finnableConfig.ntcFinnableScoreMin} is required for NTC / score <700 applicants (Current score: ${finnableScore}).`
      };
    }
  }

  // Capping limits by CIBIL Score
  const maxLoanAllowed = isNtc ? finnableConfig.ntcMaxLoanAmount : finnableConfig.maxLoanAmount;
  const maxTenureMonthsAllowed = isNtc ? finnableConfig.ntcMaxTenureMonths : finnableConfig.maxTenureMonths;

  // 7. Tenure Calculation & FOIR (50% to 65% based on category)
  const requestedTenureMonths = requestedTenureYears * 12;
  const calculationTenureMonths = Math.min(requestedTenureMonths, maxTenureMonthsAllowed);
  const tenureYears = calculationTenureMonths / 12;

  let foirPercentage = 0.55;
  const catUpper = String(category || 'A').toUpperCase().trim();
  if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper.includes('GOVT')) {
    foirPercentage = 0.65;
  } else if (catUpper === 'B') {
    foirPercentage = 0.60;
  } else if (catUpper === 'C') {
    foirPercentage = 0.55;
  } else {
    foirPercentage = 0.50;
  }

  const ccObligation = Number(creditCardObligation || 0);
  const totalObligations = Number(existingEMI || 0) + ccObligation;
  const foirCap = actualIncome * foirPercentage;
  const availableEMI = foirCap - totalObligations;

  if (availableEMI <= 0) {
    return {
      eligible: false,
      reason: `Existing obligations (₹${totalObligations.toLocaleString()}) exceed Finnable FOIR limit of ₹${Math.round(foirCap).toLocaleString()} (${(foirPercentage * 100).toFixed(0)}%).`
    };
  }

  // 8. ROI Lookup (22% to 36%)
  let appliedRoi = finnableConfig.defaultRoi;
  if (catUpper === 'B') appliedRoi = 24.0;
  else if (catUpper === 'C') appliedRoi = 26.0;
  else if (catUpper === 'D') appliedRoi = 28.0;

  // 9. Calculate Loan Amount & Final Verification
  const monthlyInterestRate = appliedRoi / 12 / 100;
  const numberOfMonths = calculationTenureMonths;
  const calculatedPrincipal = availableEMI * (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1) / (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths));

  let finalLoanAmount = Math.min(Math.round(calculatedPrincipal), maxLoanAllowed);
  if (desiredLoanAmount && desiredLoanAmount > 0) {
    finalLoanAmount = Math.min(finalLoanAmount, desiredLoanAmount);
  }

  if (finalLoanAmount < finnableConfig.minLoanAmount) {
    return {
      eligible: false,
      reason: `Calculated loan amount (₹${finalLoanAmount.toLocaleString()}) is below Finnable minimum threshold of ₹${finnableConfig.minLoanAmount.toLocaleString()}.`
    };
  }

  const monthlyEMI = calculateEMI(finalLoanAmount, appliedRoi, tenureYears);
  const isForm16Required = finalLoanAmount >= finnableConfig.form16Threshold;

  return {
    eligible: true,
    bankId: finnableConfig.id,
    bankName: finnableConfig.name,
    loanAmount: Math.round(finalLoanAmount),
    maxLoanCap: maxLoanAllowed,
    appliedRoi,
    interestRate: appliedRoi,
    loanTenure: tenureYears,
    loanTenureMonths: calculationTenureMonths,
    requestedTenureMonths,
    monthlyEMI,
    foirPercentage,
    availableEMI: Math.round(availableEMI),
    details: {
      foirPercentage: (foirPercentage * 100).toFixed(0) + '%',
      bureauType: isNtc ? 'NTC (-1 / <700)' : 'CIBIL 700+',
      finnableScore: isNtc ? finnableScore : 'N/A',
      cityTier: isTier1 ? 'Tier 1' : 'Tier 2',
      isForm16Required,
      processingFeeRange: `${finnableConfig.minPf}% to ${finnableConfig.maxPf}%`
    }
  };
};
