import { getBankConfig } from './bankConfigService';

/**
 * Enhanced Loan Service with Location Context Support
 * Supports hierarchical rule lookup: City > State > Global
 */

export const calculateEnhancedLoanEligibility = (bank, userData, locationContext = {}) => {
  const bankName = bank.name;
  const context = { state: locationContext.state || '', city: locationContext.city || '' };

  // 1. Load Location-Aware Configurations
  const categories = getBankConfig(bankName, 'categories', context);
  const interest = getBankConfig(bankName, 'interestRates', context);
  const capping = getBankConfig(bankName, 'loanCapping', context);
  const ageRules = getBankConfig(bankName, 'ageRules', context);
  const employment = getBankConfig(bankName, 'employmentRules', context);
  const multiplierRules = getBankConfig(bankName, 'multiplierRules', context);
  const foirSettings = getBankConfig(bankName, 'foirSettings', context);

  // 2. Validate Basic Eligibility
  if (userData.age < (ageRules?.minAge || 21) || userData.age > (ageRules?.maxAge || 60)) {
    return { isEligible: false, reason: 'Age outside policy limits' };
  }

  if (userData.monthlySalary < (employment?.salariedMinSalary || 25000)) {
    return { isEligible: false, reason: 'Income below minimum threshold' };
  }

  // 3. Determine Category & Multiplier
  // Logic to find category from database or defaults would go here
  // For now, assuming Category 'B' if not specified
  const category = userData.companyCategory || 'B';
  const categoryRule = categories ? categories[category] : null;

  const foir = categoryRule?.foir || foirSettings?.categoryBasedFOIR?.[category] || 60;
  const multiplier = categoryRule?.multiplier || multiplierRules?.categoryBasedMultiplier?.[category] || 25;

  // 4. Calculate Loan Amount
  let eligibleAmount = userData.monthlySalary * multiplier;

  // Apply FOIR check
  const maxEMI = (userData.monthlySalary * foir) / 100;
  const currentObligations = userData.existingEMI || 0;
  const availableEMI = maxEMI - currentObligations;

  if (availableEMI <= 0) {
    return { isEligible: false, reason: 'Existing obligations exceed FOIR limit' };
  }

  // 5. Interest Rate Lookup (Slab-based)
  let rate = 11.0;
  if (interest && interest.categorySlabRates && interest.categorySlabRates[category]) {
    const slabs = interest.categorySlabRates[category];
    // Find matching slab
    for (const [label, slabRate] of Object.entries(slabs)) {
      // label looks like "₹100000-500000"
      const [min, max] = label.replace(/₹/g, '').split('-').map(Number);
      if (eligibleAmount >= min && eligibleAmount <= max) {
        rate = slabRate;
        break;
      }
    }
  }

  // 6. Apply Cappings
  if (capping) {
    // Absolute cap
    if (eligibleAmount > capping.absoluteMaxLoan) {
      eligibleAmount = capping.absoluteMaxLoan;
    }

    // Bachelor capping
    if (userData.maritalStatus === 'Single' && capping.bachelorCapping?.enabled) {
      eligibleAmount = (eligibleAmount * capping.bachelorCapping.percentage) / 100;
    }
  }

  return {
    isEligible: true,
    maxLoanAmount: Math.floor(eligibleAmount),
    interestRate: rate,
    tenure: categoryRule?.maxTenureMonths || 60,
    emi: Math.floor((eligibleAmount * (rate / 12 / 100)) / (1 - Math.pow(1 + (rate / 12 / 100), -60))), // simplified EMI
    category: category,
    locationContext: context // Echo back the context used
  };
};