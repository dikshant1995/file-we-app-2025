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

export const calculateAuEligibility = (inputData = {}) => {
  const input = inputData || {};
  const {
    age,
    monthlyIncome,
    basicSalary,
    averageIncentive,
    companyCategory = 'B',
    category = 'B',
    companyType = '',
    totalWorkExperience,
    workExperience,
    currentCompanyExperience,
    cibilScore = 750,
    creditScore = 750,
    existingObligations,
    existingEmi,
    existingEMI,
    creditCardLimit,
    creditCardOutstanding,
    creditCardObligation,
    employmentType,
    isGovt,
    residenceType,
    salaryType,
    salaryMode,
    isBTMode,
    loansForBT,
    btLoans,
    hasCcInBt,
    desiredTenureMonths,
    loanTenure,
    desiredLoanAmount,
    location,
    city,
    state,
    cityTier,
    // Admin Overrides
    interestRateOverride,
    foirOverride,
    multiplierOverride,
    maxTenureOverride,
    maxLoanOverride
  } = input;

  // CASH SALARY CHECK: Cash Salary not to be considered for AU Bank
  const modeStr = String(salaryMode || salaryType || input.paymentType || '').toLowerCase();
  if (modeStr === 'cash') {
    return {
      eligible: false,
      isEligible: false,
      bankName: auConfig.name,
      bank: auConfig.name,
      reason: 'AU Small Finance Bank does not consider cash salary. Salary must be credited via direct bank transfer.'
    };
  }

  // VARIABLE PAY DEDUCTION: Net salary considers after all deductions. Variable pay (Incentives, Bonus, Allowances) deducted.
  const numBasicSalary = Number(basicSalary) || 0;
  const numMonthlyIncome = Number(monthlyIncome) || 0;
  const fixedMonthlySalary = numBasicSalary || numMonthlyIncome;

  if (!fixedMonthlySalary || isNaN(fixedMonthlySalary) || fixedMonthlySalary <= 0) {
    return {
      eligible: false,
      isEligible: false,
      bankName: auConfig.name,
      bank: auConfig.name,
      reason: 'Valid monthly salary is required to calculate AU Small Finance Bank loan eligibility.'
    };
  }

  const netMonthlySalaryForCalc = fixedMonthlySalary; // Incentives excluded

  // Age Sanitization
  let parsedAge = 25; // default
  if (age !== undefined && age !== null && age !== '') {
    parsedAge = Number(age);
    if (isNaN(parsedAge)) {
      return {
        eligible: false,
        isEligible: false,
        bankName: auConfig.name,
        bank: auConfig.name,
        reason: `Invalid age format provided: "${age}".`
      };
    }
  }

  const rawCibil = cibilScore ?? creditScore;
  const isNtc = rawCibil === -1 || rawCibil === 0 || rawCibil === '-1' || !rawCibil;
  const catCode = String(category || companyCategory || 'B').toUpperCase().trim();
  const isPriority1 = auConfig.priority1Categories.some(cat => catCode.includes(cat) || catCode === cat);
  const isGovtEmp = employmentType === 'government' || isGovt || catCode === 'GOVT';

  const locStr = String(location || city || state || cityTier || '').toLowerCase();
  const isNonMetro = locStr.includes('non') || locStr.includes('tier 2') || locStr.includes('tier 3') || locStr.includes('rural');

  // 1. Demographics: Age Check (Salaried 21, Self-employed 23; Pvt 57, Govt 59)
  if (parsedAge < auConfig.minAge) {
    return {
      eligible: false,
      isEligible: false,
      bankName: auConfig.name,
      bank: auConfig.name,
      reason: `Applicant age must be at least ${auConfig.minAge} years for AU Small Finance Bank (Current age: ${parsedAge}).`
    };
  }

  const maxAllowedAge = isGovtEmp ? auConfig.maxAgeGovt : auConfig.maxAgePvt;
  if (parsedAge > maxAllowedAge) {
    return {
      eligible: false,
      isEligible: false,
      bankName: auConfig.name,
      bank: auConfig.name,
      reason: `Maximum age at loan maturity is ${maxAllowedAge} years for AU Small Finance Bank (${isGovtEmp ? 'Government' : 'Private'} employee) (Current age: ${parsedAge}).`
    };
  }

  // 2. Work Experience Check (Excel: 1YEARS)
  const totalExp = Number(totalWorkExperience || workExperience || currentCompanyExperience || 0);
  if (totalExp > 0 && totalExp < auConfig.minTotalExperience) {
    return {
      eligible: false,
      isEligible: false,
      bankName: auConfig.name,
      bank: auConfig.name,
      reason: `AU Small Finance Bank requires minimum 1 year (12 months) total work experience (Found: ${totalExp} months).`
    };
  }

  // 3. Minimum Salary & NTC Rules
  // NTC (-1,0) allowed ONLY for Super A, Cat A, Cat B, and Cat D (Govt).
  // NTC Salary Requirement: ₹30,000 for both Metro and Non-Metro.
  if (isNtc) {
    if (!isPriority1) {
      return {
        eligible: false,
        isEligible: false,
        bankName: auConfig.name,
        bank: auConfig.name,
        reason: 'AU Small Finance Bank permits New to Credit (NTC / -1 CIBIL) only for Super A, Cat A, Cat B, and Cat D (Govt) categories.'
      };
    }
    if (netMonthlySalaryForCalc < 30000) {
      return {
        eligible: false,
        isEligible: false,
        bankName: auConfig.name,
        bank: auConfig.name,
        reason: `AU Small Finance Bank requires minimum net monthly salary of ₹30,000 for New to Credit (NTC / -1 CIBIL) applicants (Current: ₹${Math.round(netMonthlySalaryForCalc).toLocaleString('en-IN')}).`
      };
    }
  } else {
    // Non-NTC Salary Check (NMI Location & Category Slabs):
    // Super Cat A, Cat A, Cat B, Cat D(Govt) -> Metro: 30K, Non-metro: 20K
    // Cat C / Others / Unlisted -> Metro: 35K, Non-metro: 25K
    let requiredNmi = 20000;
    if (isPriority1) {
      requiredNmi = isNonMetro ? 20000 : 30000;
    } else {
      requiredNmi = isNonMetro ? 25000 : 35000;
    }

    if (netMonthlySalaryForCalc < requiredNmi) {
      return {
        eligible: false,
        isEligible: false,
        bankName: auConfig.name,
        bank: auConfig.name,
        reason: `AU Small Finance Bank requires minimum net monthly salary of ₹${requiredNmi.toLocaleString('en-IN')} for Category ${catCode} in ${isNonMetro ? 'Non-Metro' : 'Metro'} location (Current: ₹${Math.round(netMonthlySalaryForCalc).toLocaleString('en-IN')}).`
      };
    }
  }

  // 4. Balance Transfer Validation (Excel: ONLY PL BT)
  const safeLoansForBT = Array.isArray(loansForBT || btLoans) ? (loansForBT || btLoans) : [];
  const ccInBt = hasCcInBt || safeLoansForBT.some(l => {
    if (!l) return false;
    const t = String(l.loanType || l.type || '').toLowerCase();
    return t.includes('credit') || t.includes('card') || t === 'cc';
  });

  if (isBTMode && ccInBt) {
    return {
      eligible: false,
      isEligible: false,
      bankName: auConfig.name,
      bank: auConfig.name,
      reason: 'AU Small Finance Bank allows ONLY Personal Loan Balance Transfer. Credit Card BT is strictly prohibited.',
      isBTMode: true
    };
  }

  // 5. Obligations Calculation (Excel: CC OBLIGATION: 5% OBLIGATE)
  const numExistingEMI = Number(existingEMI || existingEmi || existingObligations) || 0;
  const numCcObligation = Number(creditCardObligation) || 0;
  const numCcLimit = Number(creditCardLimit || creditCardOutstanding) || 0;
  const calculatedCcObligation = numCcObligation > 0 ? numCcObligation : (numCcLimit * 0.05);
  const totalObligations = numExistingEMI + calculatedCcObligation;

  // 6. FOIR & Multipliers (Excel Section 4 & ETC Customer Table)
  const defaultFoirMult = getAuFoirAndMultiplier(netMonthlySalaryForCalc, catCode);
  const effectiveFoir = foirOverride ? (foirOverride / 100) : defaultFoirMult.foir;
  const effectiveMultiplier = multiplierOverride ? Number(multiplierOverride) : defaultFoirMult.multiplier;
  const exposureCap = defaultFoirMult.exposureCap;

  const maxAllowableEmi = (netMonthlySalaryForCalc * effectiveFoir) - totalObligations;

  if (maxAllowableEmi <= 0) {
    return {
      eligible: false,
      isEligible: false,
      bankName: auConfig.name,
      bank: auConfig.name,
      reason: `Existing obligations (₹${Math.round(totalObligations).toLocaleString('en-IN')}) exceed permitted FOIR limit of ${Math.round(effectiveFoir * 100)}% for AU Small Finance Bank.`
    };
  }

  // 7. Tenure Calculation (Excel: 12 to 60 Months)
  const requestedTenureMonths = loanTenure ? (loanTenure * 12) : (desiredTenureMonths || 60);
  const ageRemainingMonths = Math.max(0, (maxAllowedAge - parsedAge) * 12);
  const configuredMaxTenure = (maxTenureOverride || auConfig.maxLoanTenureMonths);
  let finalTenureMonths = Math.min(configuredMaxTenure, ageRemainingMonths, requestedTenureMonths);
  finalTenureMonths = Math.max(12, finalTenureMonths);
  const tenureYears = finalTenureMonths / 12;

  // 8. Multiplier Cap
  const multiplierCap = Math.round(netMonthlySalaryForCalc * effectiveMultiplier);

  // 9. Initial Principal Loan from EMI using initial estimate
  let estimatedRoi = interestRateOverride || getAuROI(1000000, rawCibil, catCode, netMonthlySalaryForCalc);
  let foirLoanAmount = calculatePrincipalFromEMI(maxAllowableEmi, estimatedRoi, tenureYears);

  // Re-check exact ROI from matrix based on actual loan amount & monthly salary
  const finalRoi = interestRateOverride || getAuROI(foirLoanAmount, rawCibil, catCode, netMonthlySalaryForCalc);
  if (!interestRateOverride && finalRoi !== estimatedRoi) {
    foirLoanAmount = calculatePrincipalFromEMI(maxAllowableEmi, finalRoi, tenureYears);
  }

  // 10. Capping Application (Excel Section 3 & Row 36)
  let maxSanctionCap = maxLoanOverride || auConfig.maxLoanAmount; // 15 Lakhs overall cap

  if (exposureCap && exposureCap < maxSanctionCap) {
    maxSanctionCap = exposureCap;
  }

  // NTC Capping: 3 Lakhs
  if (isNtc && auConfig.ntcMaxLoan < maxSanctionCap) {
    maxSanctionCap = auConfig.ntcMaxLoan; // 3 Lakhs
  }

  // Thin CIBIL Cat C / Others: 7.5 Lakhs
  if (!isPriority1 && rawCibil > 0 && rawCibil < 700 && auConfig.thinCibilMaxLoan < maxSanctionCap) {
    maxSanctionCap = auConfig.thinCibilMaxLoan; // 7.5 Lakhs
  }

  const numDesiredLoan = Number(desiredLoanAmount) || 0;
  let calculatedLoan = Math.min(foirLoanAmount, multiplierCap, maxSanctionCap);
  if (numDesiredLoan > 0) {
    calculatedLoan = Math.min(calculatedLoan, numDesiredLoan);
  }

  if (calculatedLoan < auConfig.minLoanAmount) {
    return {
      eligible: false,
      isEligible: false,
      bankName: auConfig.name,
      bank: auConfig.name,
      reason: `Calculated eligibility (₹${Math.round(calculatedLoan).toLocaleString('en-IN')}) is below AU Small Finance Bank minimum loan limit of ₹50,000.`
    };
  }

  const roundedSanction = Math.round(calculatedLoan);
  const finalEmi = calculateEMI(roundedSanction, finalRoi, tenureYears);

  return {
    eligible: true,
    isEligible: true,
    bankName: auConfig.name,
    bank: auConfig.name,
    loanAmount: roundedSanction,
    maxLoanAmount: roundedSanction,
    eligibleLoanAmount: roundedSanction,
    monthlyEMI: finalEmi,
    interestRate: Number(finalRoi),
    loanTenure: tenureYears,
    tenureYears: Math.round(tenureYears * 10) / 10,
    loanTenureMonths: finalTenureMonths,
    tenureMonths: finalTenureMonths,
    foirPercentage: effectiveFoir,
    foir: Math.round(effectiveFoir * 100),
    multiplier: effectiveMultiplier,
    appliedMultiplier: effectiveMultiplier,
    notes: [
      `FOIR applied: ${Math.round(effectiveFoir * 100)}% (${isPriority1 ? 'Priority 1 Tier' : 'Priority 0 Tier'})`,
      `Multiplier: ${effectiveMultiplier}x Net Monthly Salary`,
      `Interest Rate: ${finalRoi.toFixed(2)}% (Segment Based Matrix)`,
      `Tenure: ${finalTenureMonths} Months (${(finalTenureMonths / 12).toFixed(1)} Years)`,
      isNtc ? 'Capped to ₹3 Lakhs (NTC / -1 CIBIL Policy)' : null
    ].filter(Boolean)
  };
};

