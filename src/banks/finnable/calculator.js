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

  const actualIncome = Number(basicSalary || monthlyIncome || 0);

  // 1. Negative Designation / Profile Check
  if (designation && isFinnableNegativeProfile(designation)) {
    return {
      eligible: false,
      reason: `Designation '${designation}' is listed under Finnable Finance restricted negative profiles.`
    };
  }

  // 2. Age Criteria (21 to 55 Years at login, max 60 till loan maturity)
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

  // 3. Work Experience (Minimum 6 Months)
  const totalExpMonths = Number(totalWorkExperience || 6);
  if (totalExpMonths < finnableConfig.minWorkExperienceMonths) {
    return {
      eligible: false,
      reason: `Finnable requires minimum 6 months total work experience (Current: ${totalExpMonths} months).`
    };
  }

  // 4. City Tier & Minimum Salary Thresholds (Tier 1 = ₹20,000, Tier 2 = ₹15,000)
  const isTier1 = isFinnableTier1City(city, state);
  const minSalaryRequired = isTier1 ? finnableConfig.minSalaryTier1 : finnableConfig.minSalaryTier2;

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
  const maxLoanAllowed = isNtc ? (finnableConfig.ntcMaxLoanAmount || 400000) : (finnableConfig.maxLoanAmount || 1500000);
  const maxTenureMonthsAllowed = isNtc ? finnableConfig.ntcMaxTenureMonths : finnableConfig.maxTenureMonths;

  // 7. Obligations & Available EMI (Net Income capacity without category FOIR restriction)
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

  // 8. ROI (Standard 22% ROI, no category list dependencies)
  const appliedRoi = finnableConfig.minRoi || 22.0;

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
    availableEMI: Math.round(availableEMI),
    details: {
      bureauType: isNtc ? 'NTC (-1 / <700)' : 'CIBIL 700+',
      finnableScore: isNtc ? finnableScore : 'N/A',
      cityTier: isTier1 ? 'Tier 1 (Min ₹20k Salary)' : 'Tier 2 (Min ₹15k Salary)',
      isForm16Required,
      processingFeeRange: `${finnableConfig.minPf}% to ${finnableConfig.maxPf}%`
    }
  };
};

