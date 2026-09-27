// AU Small Finance Bank Eligibility Calculator
// Strictly adheres to Master Excel Policy (BANKS POLICYS.xlsx - Sheet: AU BANK)

import { auConfig } from './config.js';

// Calculate monthly EMI using standard formula
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyRate === 0) return principal / numberOfMonths;

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
    (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

  return Math.round(emi);
};

// Calculate principal loan amount from available EMI capacity
const calculatePrincipalFromEMI = (emi, annualInterestRate, tenureInYears) => {
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  if (monthlyRate === 0) return emi * numberOfMonths;

  const principal = (emi * (Math.pow(1 + monthlyRate, numberOfMonths) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths));

  return Math.round(principal);
};

// Determine ROI from Excel Section 5 Detailed Matrix (Sheet: AU BANK)
// Matrix is structured by: Segment (CIBIL & Loan Size) + Net Monthly Salary Slab (>1.5L, 50k-1.5L, <50k)
export const getAuROI = (loanAmount, cibilScore, category = 'B', monthlyIncome = 50000, customMatrix = null) => {
  const c = String(category || '').toUpperCase().trim();
  let catKey = 'B';
  let catProp = 'catB';
  if (c.includes('SUPER')) { catKey = 'SUPER A'; catProp = 'superA'; }
  else if (c === 'A') { catKey = 'A'; catProp = 'catA'; }
  else if (c === 'B') { catKey = 'B'; catProp = 'catB'; }
  else if (c === 'C') { catKey = 'C'; catProp = 'catC'; }
  else if (c === 'D') { catKey = 'D'; catProp = 'catD'; }
  else if (c.includes('GOVT')) { catKey = 'GOVT'; catProp = 'govt'; }
  else { catKey = 'OTHER'; catProp = 'other'; }

  const isNtc = cibilScore === -1 || cibilScore === 0 || !cibilScore;
  const isHighCibil = cibilScore >= 750;
  const isHighLoan = loanAmount >= 200000;

  let segmentKey = 'LT750_LA_LT200K';
  if (isNtc) {
    segmentKey = isHighLoan ? 'NTC_GTE200K' : 'NTC_LT200K';
  } else if (isHighCibil) {
    segmentKey = isHighLoan ? 'GTE750_LA_GTE200K' : 'GTE750_LA_LT200K';
  } else {
    segmentKey = isHighLoan ? 'LT750_LA_GTE200K' : 'LT750_LA_LT200K';
  }

  // Column 11: Net Monthly Salary (DOUBLE)
  const sal = Number(monthlyIncome) || 0;
  let salarySlabKey = '>=50K <=150K';
  if (sal > 150000) {
    salarySlabKey = '> 1,50K';
  } else if (sal < 50000) {
    salarySlabKey = '< 50K';
  }

  const matrix = customMatrix || auConfig.roiMatrixDetailed || [];
  const match = matrix.find(
    m => m.segment === segmentKey && (m.salarySlab === salarySlabKey || m.tier === salarySlabKey)
  );

  if (match && match.rates) {
    const val = match.rates[catKey] ?? match.rates[catProp] ?? match.rates[catKey.toLowerCase()];
    if (val !== undefined) return Number(val);
  }

  return 15.0; // fallback standard rate
};

// Determine FOIR, Multiplier & Exposure Capping (Excel Section 4)
const getAuFoirAndMultiplier = (monthlyIncome, category = 'B') => {
  const c = String(category || '').toUpperCase().trim();
  const isPriority1 = auConfig.priority1Categories.some(cat => c.includes(cat) || c === cat);
  const slabs = isPriority1 ? auConfig.priority1Slabs : auConfig.priority0Slabs;
  const sal = Number(monthlyIncome) || 0;

  for (const slab of slabs) {
    if (sal >= slab.minIncome && sal <= slab.maxIncome) {
      return {
        foir: slab.foir,
        multiplier: slab.multiplier,
        exposureCap: slab.maxCap,
        priority: isPriority1 ? 1 : 0
      };
    }
  }

  // Fallback for very high or lower edge
  if (sal >= 100000) {
    const lastSlab = slabs[slabs.length - 1];
    return { foir: lastSlab.foir, multiplier: lastSlab.multiplier, exposureCap: lastSlab.maxCap, priority: isPriority1 ? 1 : 0 };
  }

  const firstSlab = slabs[0];
  return { foir: firstSlab.foir, multiplier: firstSlab.multiplier, exposureCap: firstSlab.maxCap, priority: isPriority1 ? 1 : 0 };
};

export const calculateAuEligibility = (input) => {
  const {
    age = 25,
    monthlyIncome = 0,
    companyCategory = 'B',
    companyType = '',
    totalExperience = 12,
    currentCompanyExperience = 12,
    cibilScore = 750,
    existingObligations = 0,
    existingEmi = 0,
    creditCardLimit = 0,
    creditCardOutstanding = 0,
    isGovt = false,
    isBachelor = false,
    residenceType = '',
    isBTMode = false,
    btLoans = [],
    hasCcInBt = false,
    desiredTenureMonths = null
  } = input;

  const isNtc = cibilScore === -1 || cibilScore === 0 || !cibilScore;
  const c = String(companyCategory || '').toUpperCase().trim();
  const isPriority1 = auConfig.priority1Categories.some(cat => c.includes(cat) || c === cat);
  const isUnlisted = companyType === 'unlisted' || c === 'C' || c === 'OTHERS' || c === 'UNLISTED';

  // 1. Demographics: Age Check (Salaried 21, Self-employed 23)
  if (age < auConfig.minAge) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `Applicant age must be at least ${auConfig.minAge} years for AU Small Finance Bank (Current: ${age}).`,
      bank: 'AU Small Finance Bank'
    };
  }

  const maxAllowedAge = isGovt ? auConfig.maxAgeGovt : auConfig.maxAgePvt;
  if (age > maxAllowedAge) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `Maximum age at loan time is ${maxAllowedAge} years for AU Small Finance Bank (${isGovt ? 'Government' : 'Private'} employee) (Current: ${age}).`,
      bank: 'AU Small Finance Bank'
    };
  }

  // 2. Work Experience Check (Excel: 1YEARS)
  const totalExp = Number(totalExperience || currentCompanyExperience || 0);
  if (totalExp < auConfig.minTotalExperience) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `AU Small Finance Bank requires minimum 1 year (12 months) total work experience (Current: ${totalExp} months).`,
      bank: 'AU Small Finance Bank'
    };
  }

  // 3. Minimum Salary & NTC Rules
  // Excel: LISTED 20K / UNLISTED 25K / -1 CIBIL 30K (LISTED AND GOVT ONLY)
  if (isNtc) {
    if (!isPriority1) {
      return {
        isEligible: false,
        eligibleLoanAmount: 0,
        maxLoanAmount: 0,
        reason: 'AU Small Finance Bank permits New to Credit (-1 CIBIL) only for Super A, Cat A, Cat B, and Govt categories.',
        bank: 'AU Small Finance Bank'
      };
    }
    if (monthlyIncome < auConfig.minSalaryNtc) {
      return {
        isEligible: false,
        eligibleLoanAmount: 0,
        maxLoanAmount: 0,
        reason: `AU Small Finance Bank requires minimum net salary of ₹${auConfig.minSalaryNtc.toLocaleString('en-IN')} for New to Credit (-1 CIBIL) applicants (Current: ₹${Math.round(monthlyIncome).toLocaleString('en-IN')}).`,
        bank: 'AU Small Finance Bank'
      };
    }
  } else {
    const minSalary = isUnlisted ? auConfig.minSalaryUnlisted : auConfig.minSalaryListed;
    if (monthlyIncome < minSalary) {
      return {
        isEligible: false,
        eligibleLoanAmount: 0,
        maxLoanAmount: 0,
        reason: `AU Small Finance Bank requires minimum net monthly salary of ₹${minSalary.toLocaleString('en-IN')} for ${isUnlisted ? 'Unlisted' : 'Listed'} companies (Current: ₹${Math.round(monthlyIncome).toLocaleString('en-IN')}).`,
        bank: 'AU Small Finance Bank'
      };
    }
  }

  // 4. Balance Transfer Validation (Excel: ONLY PL BT)
  if (isBTMode && hasCcInBt) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: 'AU Small Finance Bank allows ONLY Personal Loan Balance Transfer. Credit Card BT is strictly prohibited.',
      bank: 'AU Small Finance Bank'
    };
  }

  // 5. Obligations Calculation (Excel: CC OBLIGATION: 5% OBLIGATE)
  const ccObligation = (creditCardLimit > 0 ? creditCardLimit * 0.05 : (creditCardOutstanding || 0) * 0.05);
  const totalObligations = (Number(existingObligations) || Number(existingEmi) || 0) + ccObligation;

  // 6. FOIR & Multipliers (Excel Section 4)
  const { foir, multiplier, exposureCap } = getAuFoirAndMultiplier(monthlyIncome, companyCategory);
  const maxAllowableEmi = (monthlyIncome * foir) - totalObligations;

  if (maxAllowableEmi <= 0) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `Existing obligations (₹${Math.round(totalObligations).toLocaleString('en-IN')}) exceed permitted FOIR limit of ${Math.round(foir * 100)}% for AU Small Finance Bank.`,
      bank: 'AU Small Finance Bank'
    };
  }

  // 7. Tenure Calculation (Excel: 12 to 60 Months)
  const ageRemainingMonths = Math.max(0, (maxAllowedAge - age) * 12);
  let finalTenureMonths = Math.min(auConfig.maxLoanTenureMonths, ageRemainingMonths);

  if (desiredTenureMonths && desiredTenureMonths > 0) {
    finalTenureMonths = Math.min(finalTenureMonths, desiredTenureMonths);
  }
  finalTenureMonths = Math.max(12, finalTenureMonths);
  const tenureYears = finalTenureMonths / 12;

  // 8. Multiplier Cap
  const multiplierCap = Math.round(monthlyIncome * multiplier);

  // 9. Initial Principal Loan from EMI using initial estimate
  let estimatedRoi = getAuROI(1000000, cibilScore, companyCategory, monthlyIncome);
  let foirLoanAmount = calculatePrincipalFromEMI(maxAllowableEmi, estimatedRoi, tenureYears);

  // Re-check exact ROI from matrix based on actual loan amount & monthly salary
  const finalRoi = getAuROI(foirLoanAmount, cibilScore, companyCategory, monthlyIncome);
  if (finalRoi !== estimatedRoi) {
    foirLoanAmount = calculatePrincipalFromEMI(maxAllowableEmi, finalRoi, tenureYears);
  }

  // 10. Capping Application (Excel Section 3 & Row 36)
  let maxSanctionCap = auConfig.maxLoanAmount; // 15 Lakhs overall cap

  if (exposureCap && exposureCap < maxSanctionCap) {
    maxSanctionCap = exposureCap;
  }

  // NTC Capping: 3 Lakhs
  if (isNtc && auConfig.ntcMaxLoan < maxSanctionCap) {
    maxSanctionCap = auConfig.ntcMaxLoan; // 3 Lakhs
  }

  // Thin CIBIL Cat C / Others: 7.5 Lakhs
  if (!isPriority1 && cibilScore > 0 && cibilScore < 700 && auConfig.thinCibilMaxLoan < maxSanctionCap) {
    maxSanctionCap = auConfig.thinCibilMaxLoan; // 7.5 Lakhs
  }

  // PG / Rented Bachelor Capping: Max 5 Lakhs
  const isBachelorUser = isBachelor || String(residenceType || '').toLowerCase().includes('bachelor') || String(residenceType || '').toLowerCase().includes('pg');
  if (isBachelorUser && auConfig.bachelorMaxLoan < maxSanctionCap) {
    maxSanctionCap = auConfig.bachelorMaxLoan; // 5 Lakhs
  }

  const finalLoanAmount = Math.min(foirLoanAmount, multiplierCap, maxSanctionCap);

  if (finalLoanAmount < auConfig.minLoanAmount) {
    return {
      isEligible: false,
      eligibleLoanAmount: 0,
      maxLoanAmount: 0,
      reason: `Calculated eligibility (₹${Math.round(finalLoanAmount).toLocaleString('en-IN')}) is below AU Small Finance Bank minimum loan limit of ₹50,000.`,
      bank: 'AU Small Finance Bank'
    };
  }

  const roundedSanction = Math.round(finalLoanAmount / 1000) * 1000;
  const finalEmi = calculateEMI(roundedSanction, finalRoi, tenureYears);

  return {
    isEligible: true,
    bank: 'AU Small Finance Bank',
    eligibleLoanAmount: roundedSanction,
    maxLoanAmount: roundedSanction,
    interestRate: finalRoi,
    tenureMonths: finalTenureMonths,
    tenureYears: Math.round(tenureYears * 10) / 10,
    monthlyEMI: finalEmi,
    foir: Math.round(foir * 100),
    multiplier,
    appliedMultiplier: multiplier,
    notes: [
      `FOIR applied: ${Math.round(foir * 100)}% (${isPriority1 ? 'Priority 1 Tier' : 'Priority 0 Tier'})`,
      `Multiplier: ${multiplier}x Net Monthly Salary`,
      `Interest Rate: ${finalRoi.toFixed(2)}% (Segment Based Matrix)`,
      `Tenure: ${finalTenureMonths} Months (${(finalTenureMonths / 12).toFixed(1)} Years)`,
      isBachelorUser ? 'Capped to ₹5 Lakhs (PG/Rented Bachelor Policy)' : null,
      isNtc ? 'Capped to ₹3 Lakhs (NTC / -1 CIBIL Policy)' : null
    ].filter(Boolean)
  };
};
