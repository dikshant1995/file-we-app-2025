// Import all bank calculators
import { calculateKotakEligibility } from '../banks/kotak/calculator.js';
import { calculateHdfcEligibility } from '../banks/hdfc/calculator.js';
import { calculateIciciEligibility } from '../banks/icici/calculator.js';
import { calculateBandhanEligibility } from '../banks/bandhan/calculator.js';
import { calculateCholaEligibility } from '../banks/chola/calculator.js';
import { calculateTataEligibility } from '../banks/tata/calculator.js';
import { calculatePoonawalaEligibility } from '../banks/poonawala/calculator.js';
import { calculateAxisFinEligibility } from '../banks/axis-fin/calculator.js';
import { calculateIndusindEligibility } from '../banks/indusind/calculator.js';
import { calculateIdfcEligibility } from '../banks/idfc/calculator.js';
import { calculateShriRamEligibility } from '../banks/shri-ram/calculator.js';
import { calculatePiramalEligibility } from '../banks/piramal/calculator.js';
import { calculateSmfgEligibility } from '../banks/smfg/calculator.js';
import { calculateBajajEligibility } from '../banks/bajaj/calculator.js';
import { calculateAuEligibility, getAuROI } from '../banks/au/calculator.js';

// Import bank configs for transparency
import { kotakConfig } from '../banks/kotak/config.js';
import { hdfcConfig } from '../banks/hdfc/config.js';
import { iciciConfig } from '../banks/icici/config.js';
import { bandhanConfig } from '../banks/bandhan/config.js';
import { cholaConfig } from '../banks/chola/config.js';
import { tataConfig } from '../banks/tata/config.js';
import { poonawalaConfig } from '../banks/poonawala/config.js';
import { axisFinConfig } from '../banks/axis-fin/config.js';
import { indusindConfig } from '../banks/indusind/config.js';
import { idfcConfig } from '../banks/idfc/config.js';
import { shriRamConfig } from '../banks/shri-ram/config.js';
import { piramalConfig } from '../banks/piramal/config.js';
import { smfgConfig } from '../banks/smfg/config.js';
import { bajajConfig } from '../banks/bajaj/config.js';
import { auConfig } from '../banks/au/config.js';

// Import company database service
import { getCompanyCategoryForBank } from './companyDatabaseService.js';

// 🚫 IMPORT 5-LAYER PROCESSING FEE GUARD
import { protectAgainstProcessingFee } from '../utils/processingFeeGuard.js';

// Import bank configuration service for logic bridge
import { getBankConfig, getAllBankConfig } from './bankConfigService.js';

// Import Bank Policies from Bank Policy Excel (BANKS POLICYS.xlsx) via Registry
import { getExcelPolicyForBank } from '../config/bankPolicyRegistry.js';
import { AXIS_BANK_EXCEL_POLICY } from '../config/axisBankPolicy.js';
import { INDUSIND_BANK_EXCEL_POLICY } from '../config/indusindBankPolicy.js';
import { HDFC_BANK_EXCEL_POLICY } from '../config/hdfcBankPolicy.js';
import { getCityTier } from '../utils/policyUtils.js';
import { getAbflROI } from '../config/abflBankPolicy.js';
import { isFinnableTier1City, FINNABLE_NEGATIVE_PROFILES, isFinnableNegativeIndustry, isSolePropAllowedZone } from '../config/finnableBankPolicy.js';

/**
 * Universal Bank Calculator for Institutional Banks without legacy hardcoded calculators
 */
export const calculateUnifiedBankEligibility = (bankInput) => {
  const bankName = bankInput.bankName || 'Partner Institution';
  // Check if customer already has a personal loan with this institution
  if (bankInput.existingLoanBanks && Array.isArray(bankInput.existingLoanBanks)) {
    const bankNameLower = bankName.toLowerCase().trim();
    const hasExisting = bankInput.existingLoanBanks.some(b => {
      const bLower = String(b).toLowerCase().trim();
      return bankNameLower.includes(bLower) || bLower.includes(bankNameLower);
    });
    if (hasExisting && !bankInput.isBTMode) {
      return {
        bankName: bankName,
        eligible: false,
        reason: `Existing personal loan with ${bankName}. Policy restriction for new loan.`,
        category: bankInput.category || 'B'
      };
    }
  }

  return {
    bankName: bankName,
    eligible: true,
    loanAmount: 0,
    monthlyEMI: 0,
    interestRate: bankInput.interestRateOverride || 10.5,
    loanTenure: bankInput.loanTenure || 5,
    loanTenureMonths: (bankInput.loanTenure || 5) * 12,
    multiplier: bankInput.multiplierOverride || 24,
    foirPercentage: bankInput.foirOverride ? (bankInput.foirOverride / 100) : 0.60
  };
};

/**
 * Calculate loan eligibility across all 12 banks
 * @param {Object} userData - User input data
 * @returns {Promise<Array>} Array of results from all banks
 */
export const calculateLoanEligibility = async (userData) => {
  console.log('🏛️  === REAL LOAN SERVICE: STARTING CALCULATION ===');
  console.log('📄 Input received:', userData);

  // Check if this is a Balance Transfer request
  const isBTMode = userData.wantsBT && userData.selectedLoansForBT && userData.selectedLoansForBT.length > 0;

  console.log(`🔄 Mode: ${isBTMode ? 'BALANCE TRANSFER' : 'REGULAR LOAN'}`);

  if (isBTMode) {
    console.log('📦 BT Loan Details:');
    console.log('  - Selected loans:', userData.selectedLoansForBT.length);
    console.log('  - Loans for BT:', userData.loansForBT);

    // Calculate totals for selected BT loans
    const btTotalEMI = (userData.loansForBT || []).reduce((sum, loan) => sum + (parseFloat(loan.monthlyEMI) || 0), 0);
    const btTotalOutstanding = (userData.loansForBT || []).reduce((sum, loan) => sum + (parseFloat(loan.outstandingAmount) || 0), 0);

    console.log(`  - Total BT EMI: ₹${btTotalEMI.toLocaleString()}`);
    console.log(`  - Total BT Outstanding: ₹${btTotalOutstanding.toLocaleString()}`);
  }

  // Transform form data to match calculator expectations
  const calculatorInput = {
    desiredLoanAmount: userData.desiredLoanAmount ? parseFloat(userData.desiredLoanAmount) : null,
    loanTenure: userData.loanTenure ? parseInt(userData.loanTenure) : 5, // Default to 5 years
    basicSalary: userData.basicSalary !== undefined ? parseFloat(userData.basicSalary) : (userData.monthlyIncome ? parseFloat(userData.monthlyIncome) : (userData.monthlySalary ? parseFloat(userData.monthlySalary) : 0)),
    averageIncentive: userData.averageIncentive ? parseFloat(userData.averageIncentive) : 0,
    monthlyIncome: userData.monthlyIncome ? parseFloat(userData.monthlyIncome) : (userData.monthlySalary ? parseFloat(userData.monthlySalary) : (userData.basicSalary ? parseFloat(userData.basicSalary) : 0)),
    existingEMI: userData.existingEMI ? parseFloat(userData.existingEMI) : 0,
    companyName: userData.companyName || '',
    category: userData.category || userData.companyCategory || 'A', // Fallback category if company not found
    creditScore: 850, // CIBIL score bypassed across all lenders
    cibilScore: userData.cibilScore !== undefined ? userData.cibilScore : (userData.creditScore !== undefined ? userData.creditScore : null),
    customerReportedCreditScore: userData.cibilScore !== undefined ? userData.cibilScore : (userData.creditScore || null),
    employmentType: userData.employmentType || 'salaried',
    age: userData.age ? parseInt(userData.age) : null, // AGE for tenure capping
    existingLoanBanks: userData.existingLoanBanks || [], // CRITICAL: Banks where customer has existing loans
    state: userData.state || '',
    city: userData.city || '',
    salaryMode: userData.salaryMode || 'bank',
    maritalStatus: userData.maritalStatus || '', // Added for bachelor capping
    livingStatus: userData.livingStatus || '',   // Added for bachelor capping
    creditCards: userData.creditCards || [],
    creditCardObligation: (userData.creditCardObligation !== undefined && userData.creditCardObligation !== null)
      ? parseFloat(userData.creditCardObligation)
      : (userData.creditCards || [])
          .filter(card => !card.isBT)
          .reduce((sum, card) => sum + ((parseFloat(card.outstandingAmount) || 0) * 0.05), 0),
    // Balance Transfer specific data
    isBTMode: isBTMode,
    loansForBT: isBTMode ? (userData.loansForBT || []) : [],
    btTotalEMI: isBTMode ? (userData.loansForBT || []).reduce((sum, loan) => sum + (parseFloat(loan.monthlyEMI) || 0), 0) : 0,
    btTotalOutstanding: isBTMode ? (userData.loansForBT || []).reduce((sum, loan) => sum + (parseFloat(loan.outstandingAmount) || 0), 0) : 0,
    // PF / PPF Salary Deduction toggle
    hasPpfDeduction: userData.hasPpfDeduction !== undefined ? userData.hasPpfDeduction : (userData.hasPfDeduction !== undefined ? userData.hasPfDeduction : true),
    hasPfDeduction: userData.hasPfDeduction !== undefined ? userData.hasPfDeduction : (userData.hasPpfDeduction !== undefined ? userData.hasPpfDeduction : true),
    existingLoans: userData.existingLoans || [],
    existingLoanTypes: userData.existingLoanTypes || [],
    hasEverHomeLoan: Boolean(userData.hasEverHomeLoan || userData.hasHomeLoan || userData.everHL || userData.hlStatus),
    totalWorkExperience: userData.totalWorkExperience !== undefined ? Number(userData.totalWorkExperience) : (userData.workExperience !== undefined ? Number(userData.workExperience) : (userData.totalExperience !== undefined ? Number(userData.totalExperience) : 0)),
    workExperience: userData.workExperience !== undefined ? Number(userData.workExperience) : (userData.totalWorkExperience !== undefined ? Number(userData.totalWorkExperience) : 0),
    designation: userData.designation || userData.jobRole || userData.profession || '',
    profession: userData.profession || userData.designation || ''
    // Note: Interest rate will be pulled dynamically from Admin Config in the loop below
  };

  console.log('⚙️  Transformed input for calculators:', calculatorInput);
  console.log('🚨 EXISTING LOAN BANKS:', calculatorInput.existingLoanBanks);
  console.log('🏭 Company Name:', calculatorInput.companyName);
  console.log('');

  // Array of bank calculators with all 20 lending partner institutions
  const bankCalculators = [
    // 12 Core Banks
    { id: 'kotak', name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility, config: kotakConfig, hasDatabase: true },
    { id: 'tata', name: 'Tata Capital', calculator: calculateTataEligibility, config: tataConfig, hasDatabase: true },
    { id: 'poonawala', name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility, config: poonawalaConfig, hasDatabase: true },
    { id: 'idfc', name: 'IDFC First Bank', calculator: calculateIdfcEligibility, config: idfcConfig, hasDatabase: true },
    { id: 'hdfc', name: 'HDFC Bank', calculator: calculateHdfcEligibility, config: hdfcConfig, hasDatabase: true },
    { id: 'icici', name: 'ICICI Bank', calculator: calculateIciciEligibility, config: iciciConfig, hasDatabase: true },
    { id: 'bandhan', name: 'Bandhan Bank', calculator: calculateBandhanEligibility, config: bandhanConfig, hasDatabase: false },
    { id: 'chola', name: 'Cholamandalam Finance', calculator: calculateCholaEligibility, config: cholaConfig, hasDatabase: true },
    { id: 'axis', name: 'Axis Finance', calculator: calculateAxisFinEligibility, config: axisFinConfig, hasDatabase: true },
    { id: 'indusind', name: 'IndusInd Bank', calculator: calculateIndusindEligibility, config: indusindConfig, hasDatabase: true },
    { id: 'shriram', name: 'Shri Ram Finance', calculator: calculateShriRamEligibility, config: shriRamConfig, hasDatabase: false },
    { id: 'piramal', name: 'Piramal Finance', calculator: calculatePiramalEligibility, config: piramalConfig, hasDatabase: false },

    // 8 Additional Banks & NBFCs from Master Excel Policy
    { id: 'axis-bank', name: 'Axis Bank', calculator: calculateUnifiedBankEligibility, config: { name: 'Axis Bank', maxLoanCap: 5000000, defaultRate: 9.99 }, hasDatabase: true },
    { id: 'lnt', name: 'L&T Finance', calculator: calculateUnifiedBankEligibility, config: { name: 'L&T Finance', maxLoanCap: 3000000, defaultRate: 11.5 }, hasDatabase: false },
    { id: 'smfg', name: 'SMFG India Credit', calculator: calculateSmfgEligibility, config: smfgConfig, hasDatabase: false },
    { id: 'bajaj', name: 'Bajaj Finance', calculator: calculateBajajEligibility, config: bajajConfig, hasDatabase: true },
    { id: 'incred', name: 'Incred Finance', calculator: calculateUnifiedBankEligibility, config: { name: 'Incred Finance', maxLoanCap: 1500000, defaultRate: 13.49 }, hasDatabase: false },
    { id: 'au-bank', name: 'AU Small Finance Bank', calculator: calculateAuEligibility, config: auConfig, hasDatabase: false },
    { id: 'abfl', name: 'Aditya Birla Finance', calculator: calculateUnifiedBankEligibility, config: { name: 'Aditya Birla Finance', maxLoanCap: 5000000, defaultRate: 11.25 }, hasDatabase: false },
    { id: 'finnable', name: 'Finnable Finance', calculator: calculateUnifiedBankEligibility, config: { name: 'Finnable Finance', maxLoanCap: 1000000, defaultRate: 14.0 }, hasDatabase: false }
  ];

  // Respect Admin Suspensions if configured in LocalStorage
  let activeBankCalculators = bankCalculators;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('laxmi_admin_12_banks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const suspendedIds = new Set(parsed.filter(b => b.enabled === false).map(b => b.id));
          activeBankCalculators = bankCalculators.filter(b => !suspendedIds.has(b.id));
        }
      }
    }
  } catch (e) {
    console.warn('Bank suspension check notice:', e);
  }

  // Calculate eligibility for each bank
  console.log(`🏛️  Calling ${activeBankCalculators.length} institutions with Unified Policy active...`);
  console.log('='.repeat(60));

// Financial helper calculations for dynamic policy enforcement
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  if (!principal || principal <= 0) return 0;
  const monthlyRate = (annualInterestRate || 11.0) / 12 / 100;
  const numberOfMonths = (tenureInYears || 5) * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / 
              (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
  return Math.round(emi);
};

const calculateLoanAmountFromEMI = (emi, annualInterestRate, tenureInYears) => {
  if (!emi || emi <= 0) return 0;
  const monthlyRate = (annualInterestRate || 11.0) / 12 / 100;
  const numberOfMonths = (tenureInYears || 5) * 12;
  const loanAmount = (emi * (Math.pow(1 + monthlyRate, numberOfMonths) - 1)) / 
                     (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths));
  return Math.round(loanAmount);
};

// Universal category matcher across bank configs and policy matrix
const matchCategory = (cat1, cat2) => {
  if (!cat1 || !cat2) return false;
  const s1 = String(cat1).toUpperCase().replace(/[^A-Z0-9+]/g, '');
  const s2 = String(cat2).toUpperCase().replace(/[^A-Z0-9+]/g, '');

  if (s1 === s2) return true;

  // Super Prime / Super A / A+
  const isSuperPrime1 = s1 === 'SUPERPRIME' || s1 === 'SUPERA' || s1 === 'A+' || s1 === 'SCATA' || s1 === 'PLUS' || s1 === 'APLUS';
  const isSuperPrime2 = s2 === 'SUPERPRIME' || s2 === 'SUPERA' || s2 === 'A+' || s2 === 'SCATA' || s2 === 'PLUS' || s2 === 'APLUS';
  if (isSuperPrime1 && isSuperPrime2) return true;

  // Preferred / Category A
  const isPreferred1 = s1 === 'PREFERRED' || s1 === 'A' || s1 === 'CATA' || s1 === 'CATGA' || s1 === 'CATEGORYA';
  const isPreferred2 = s2 === 'PREFERRED' || s2 === 'A' || s2 === 'CATA' || s2 === 'CATGA' || s2 === 'CATEGORYA';
  if (isPreferred1 && isPreferred2) return true;

  // Elite / Category B
  const isElite1 = s1 === 'ELITE' || s1 === 'B' || s1 === 'CATB' || s1 === 'CATGB' || s1 === 'CATEGORYB';
  const isElite2 = s2 === 'ELITE' || s2 === 'B' || s2 === 'CATB' || s2 === 'CATGB' || s2 === 'CATEGORYB';
  if (isElite1 && isElite2) return true;

  // Category C
  const isC1 = s1 === 'C' || s1 === 'CATC' || s1 === 'CATGC' || s1 === 'CATEGORYC';
  const isC2 = s2 === 'C' || s2 === 'CATC' || s2 === 'CATGC' || s2 === 'CATEGORYC';
  if (isC1 && isC2) return true;

  // Category D
  const isD1 = s1 === 'D' || s1 === 'CATD' || s1 === 'CATGD' || s1 === 'CATEGORYD';
  const isD2 = s2 === 'D' || s2 === 'CATD' || s2 === 'CATGD' || s2 === 'CATEGORYD';
  if (isD1 && isD2) return true;

  // Open Market / Unlisted (matches C or D or Open Market if one is Open Market / Unlisted)
  const isOpenMarket1 = s1 === 'OPENMARKET' || s1 === 'UNLISTED';
  const isOpenMarket2 = s2 === 'OPENMARKET' || s2 === 'UNLISTED';
  if ((isOpenMarket1 && (isOpenMarket2 || isC2 || isD2)) || (isOpenMarket2 && (isOpenMarket1 || isC1 || isD1))) return true;

  // Army Profile / Defense
  const isArmy1 = s1 === 'ARMYPROFILE' || s1 === 'ARMY' || s1 === 'DEFENSE';
  const isArmy2 = s2 === 'ARMYPROFILE' || s2 === 'ARMY' || s2 === 'DEFENSE';
  if (isArmy1 && isArmy2) return true;

  // NRI Case / NRI
  const isNri1 = s1 === 'NRICASE' || s1 === 'NRI';
  const isNri2 = s2 === 'NRICASE' || s2 === 'NRI';
  if (isNri1 && isNri2) return true;

  // Govt
  const isGovt1 = s1 === 'GOVT' || s1 === 'PSU' || s1 === 'GOVERNMENT';
  const isGovt2 = s2 === 'GOVT' || s2 === 'PSU' || s2 === 'GOVERNMENT';
  if (isGovt1 && isGovt2) return true;

  return false;
};

  const results = activeBankCalculators.map(({ id, name, calculator, config, hasDatabase }, index) => {
    const bankStartTime = performance.now();
    console.log(`🏦 [${index + 1}/${activeBankCalculators.length}] Calculating: ${name}...`);

    try {
      // 🧊 LOGIC BRIDGE: Retrieve real-time Admin Panel settings
      const location = (calculatorInput.city && calculatorInput.state) 
        ? `${calculatorInput.city}, ${calculatorInput.state}` 
        : (calculatorInput.city || calculatorInput.state);
      const adminAllConfig = getAllBankConfig(name, location);
      let uPolicy = adminAllConfig.unifiedPolicy;

      // Bank Policy Fallback from Bank Policy Excel (BANKS POLICYS.xlsx) for ALL institutions
      if (!uPolicy) {
        uPolicy = getExcelPolicyForBank(id, name);
      }

      // 1. SALARY MODE GATE
      if (calculatorInput.salaryMode === 'cash' && adminAllConfig.employmentRules?.allowCashSalary === false) {
        return { bankName: name, eligible: false, reason: 'Cash salaries not accepted by this institution.', category: 'REJECTED' };
      }
      if (calculatorInput.salaryMode === 'cheque' && adminAllConfig.employmentRules?.allowChequeSalary === false) {
        return { bankName: name, eligible: false, reason: 'Cheque salaries not accepted by this institution.', category: 'REJECTED' };
      }

      // 1.5 CC BT RESTRICTION GATES from Excel Policies:
      if (calculatorInput.isBTMode) {
        const ccBtLoans = (calculatorInput.loansForBT || []).filter(l => l.type === 'Credit Card' || l.type === 'credit_card');
        const hasCcInBt = ccBtLoans.length > 0;
        const numCcBt = ccBtLoans.length;

        // IndusInd Bank: CC BT NOT ALLOW
        if (hasCcInBt && (name === 'IndusInd Bank' || id === 'indusind')) {
          return {
            bankName: name,
            eligible: false,
            reason: 'Credit Card Balance Transfer is not permitted for IndusInd Bank (CC BT Not Allowed as per policy).',
            category: 'REJECTED'
          };
        }
        // Kotak Mahindra Bank: CC BT NOT ALLOW
        if (hasCcInBt && (name.toLowerCase().includes('kotak') || id === 'kotak')) {
          return {
            bankName: name,
            eligible: false,
            reason: 'Credit Card Balance Transfer is not permitted for Kotak Mahindra Bank (CC BT Not Allowed as per policy).',
            category: 'REJECTED'
          };
        }
        // Bandhan Bank: CC BT NOT ALLOW
        if (hasCcInBt && (name.toLowerCase().includes('bandhan') || id === 'bandhan')) {
          return {
            bankName: name,
            eligible: false,
            reason: 'Credit Card Balance Transfer is not permitted for Bandhan Bank (CC BT Not Allowed as per policy).',
            category: 'REJECTED'
          };
        }
        // L&T Finance: CC BT NOT ALLOW
        if (hasCcInBt && (name.toLowerCase().includes('l&t') || name.toLowerCase().includes('lnt') || id === 'lnt')) {
          return {
            bankName: name,
            eligible: false,
            reason: 'Credit Card Balance Transfer is not permitted for L&T Finance (CC BT Not Allowed as per policy).',
            category: 'REJECTED'
          };
        }
        // AU Small Finance Bank: ONLY PL BT ALLOWED
        if (hasCcInBt && (name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au')) {
          return {
            bankName: name,
            eligible: false,
            reason: 'Credit Card Balance Transfer is not permitted for AU Small Finance Bank (Only Personal Loan BT Allowed).',
            category: 'REJECTED'
          };
        }
        // Piramal Finance: 2 CC BT ALLOW WITH 1 PL BT
        if (name.toLowerCase().includes('piramal') || id === 'piramal') {
          const plBtLoans = (calculatorInput.loansForBT || []).filter(l => l.type !== 'Credit Card' && l.type !== 'credit_card' && l.loanType !== 'credit_card');
          if (plBtLoans.length > 1) {
            return {
              bankName: name,
              eligible: false,
              reason: `Piramal Finance allows maximum 1 Personal Loan for Balance Transfer (${plBtLoans.length} selected). Policy: 2 CC BT ALLOW WITH 1 PL BT.`,
              category: 'REJECTED'
            };
          }
          if (numCcBt > 2) {
            return {
              bankName: name,
              eligible: false,
              reason: `Piramal Finance allows maximum 2 Credit Card BTs with 1 Personal Loan BT (${numCcBt} selected). Policy: 2 CC BT ALLOW WITH 1 PL BT.`,
              category: 'REJECTED'
            };
          }
          if (numCcBt > 0 && plBtLoans.length === 0) {
            return {
              bankName: name,
              eligible: false,
              reason: 'Piramal Finance allows Credit Card Balance Transfer only WITH 1 Personal Loan BT (Policy: 2 CC BT ALLOW WITH 1 PL BT). Standalone Credit Card BT is not allowed.',
              category: 'REJECTED'
            };
          }
        }
        // SMFG India Credit: Max 2 CC BT allowed
        if (numCcBt > 2 && (name.toLowerCase().includes('smfg') || id === 'smfg')) {
          return {
            bankName: name,
            eligible: false,
            reason: `SMFG India Credit allows maximum 2 Credit Card BTs (${numCcBt} selected).`,
            category: 'REJECTED'
          };
        }
        // Tata Capital: Max 5 CC BT allowed
        if (numCcBt > 5 && (name.toLowerCase().includes('tata') || id === 'tata')) {
          return {
            bankName: name,
            eligible: false,
            reason: `Tata Capital allows maximum 5 Credit Card BTs (${numCcBt} selected).`,
            category: 'REJECTED'
          };
        }
        // Axis Bank & Axis Finance: Max 5 CC BT allowed
        if (numCcBt > 5 && (name.toLowerCase().includes('axis') || id.includes('axis'))) {
          return {
            bankName: name,
            eligible: false,
            reason: `${name} allows maximum 5 Credit Card BTs (${numCcBt} selected).`,
            category: 'REJECTED'
          };
        }
        // Aditya Birla Finance: Max 5 CC BT allowed
        if (numCcBt > 5 && (name.toLowerCase().includes('aditya') || name.toLowerCase().includes('abfl') || id === 'abfl')) {
          return {
            bankName: name,
            eligible: false,
            reason: `Aditya Birla Finance allows maximum 5 Credit Card BTs (${numCcBt} selected).`,
            category: 'REJECTED'
          };
        }
        // Poonawalla Fincorp: Max total 8 BTs (Combination of 3 APP LOAN / 3 CC / 2 PL or OD) - Excel Row 96
        if (name.toLowerCase().includes('poonawala') || name.toLowerCase().includes('poonawalla') || id === 'poonawala') {
          const totalBtCount = (calculatorInput.loansForBT || []).length;
          const appLoanCount = (calculatorInput.loansForBT || []).filter(l => String(l.type || l.loanType || '').toLowerCase().includes('app')).length;
          const plBtCount = (calculatorInput.loansForBT || []).filter(l => {
            const t = String(l.type || l.loanType || '').toLowerCase();
            return !t.includes('card') && !t.includes('app');
          }).length;

          if (totalBtCount > 8) {
            return {
              bankName: name,
              eligible: false,
              reason: `Poonawalla Fincorp allows maximum 8 total loans for Balance Transfer (${totalBtCount} selected). Excel Row 96: MAX TOTAL 8.`,
              category: 'REJECTED'
            };
          }
          if (numCcBt > 3) {
            return {
              bankName: name,
              eligible: false,
              reason: `Poonawalla Fincorp allows maximum 3 Credit Card BTs (${numCcBt} selected). Excel Row 96: MAX 3 CC.`,
              category: 'REJECTED'
            };
          }
          if (appLoanCount > 3) {
            return {
              bankName: name,
              eligible: false,
              reason: `Poonawalla Fincorp allows maximum 3 App Loan BTs (${appLoanCount} selected). Excel Row 96: MAX 3 APP LOAN.`,
              category: 'REJECTED'
            };
          }
          if (plBtCount > 2) {
            return {
              bankName: name,
              eligible: false,
              reason: `Poonawalla Fincorp allows maximum 2 Personal Loan or OD BTs (${plBtCount} selected). Excel Row 96: MAX 2 PL OR OD.`,
              category: 'REJECTED'
            };
          }
        }
        // Chola Finance: Max 6 CC BT allowed
        if (numCcBt > 6 && (name.toLowerCase().includes('chola') || id === 'chola')) {
          return {
            bankName: name,
            eligible: false,
            reason: `Chola Finance allows maximum 6 Credit Card BTs (${numCcBt} selected).`,
            category: 'REJECTED'
          };
        }

        // CC BT POS limits:
        const btCreditCardPOS = ccBtLoans.reduce((sum, loan) => sum + (parseFloat(loan.creditLimitUsed) || parseFloat(loan.outstandingAmount) || 0), 0);
        if ((name.toLowerCase().includes('poonawala') || name.toLowerCase().includes('poonawalla') || id === 'poonawala') && btCreditCardPOS > (calculatorInput.monthlyIncome * 4)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Poonawalla policy restricts Credit Card Outstanding exceeding 4x monthly income.`,
            category: 'REJECTED'
          };
        }
        if ((name.toLowerCase().includes('bajaj') || id === 'bajaj') && btCreditCardPOS > (calculatorInput.monthlyIncome * 6)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Bajaj Finance restricts Credit Card Outstanding exceeding 6x monthly income.`,
            category: 'REJECTED'
          };
        }
        if ((name.toLowerCase().includes('chola') || id === 'chola') && btCreditCardPOS > (calculatorInput.monthlyIncome * 6)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Chola Finance restricts Credit Card Outstanding exceeding 6x monthly income.`,
            category: 'REJECTED'
          };
        }
      }

      // 2. DEMOGRAPHIC & AGE RULES GATE (Tab 5 in Admin Console)
      const demoRules = uPolicy?.demographics || adminAllConfig.demographics || adminAllConfig.ageRules;
      if (demoRules) {
        if (calculatorInput.age) {
          const minAge = demoRules.minAge || 21;
          const maxAge = demoRules.maxAge || 60;
          if (calculatorInput.age < minAge) {
            return { bankName: name, eligible: false, reason: `Age below criteria (Min: ${minAge} years)`, category: 'REJECTED' };
          }
          if (calculatorInput.age > maxAge) {
            return { bankName: name, eligible: false, reason: `Age above criteria (Max: ${maxAge} years)`, category: 'REJECTED' };
          }
        }

        const minSalaryReq = demoRules.minSalary || adminAllConfig.employmentRules?.salariedMinSalary || 20000;
        if (calculatorInput.monthlyIncome < minSalaryReq) {
          return { bankName: name, eligible: false, reason: `Income below policy threshold (Min: ₹${minSalaryReq.toLocaleString()})`, category: 'REJECTED' };
        }
      }

      // NTC (-1 CIBIL) Rule for AU Bank
      const rawCibil = calculatorInput.cibilScore ?? calculatorInput.customerReportedCreditScore;
      const isNtc = rawCibil === -1 || rawCibil === '-1' || Number(rawCibil) === -1;
      if (isNtc && (name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au')) {
        const catUpper = String(calculatorInput.category || '').toUpperCase().trim();
        if (catUpper === 'C' || catUpper === 'D' || catUpper === 'UNLISTED') {
          return {
            bankName: name,
            eligible: false,
            reason: 'AU Small Finance Bank only permits New to Credit (-1 CIBIL) for Super A, A, B, and Govt categories.',
            category: 'REJECTED'
          };
        }
        if (calculatorInput.monthlyIncome < 30000) {
          return {
            bankName: name,
            eligible: false,
            reason: 'AU Small Finance Bank requires minimum ₹30,000 net salary for New to Credit (-1 CIBIL) applicants.',
            category: 'REJECTED'
          };
        }
      }

      // 2.5 BT CREDIT CARD MULTIPLIER GATE
      if (calculatorInput.isBTMode && adminAllConfig.btConfiguration?.maxCreditCardBTMultiplier) {
        const btCreditCardPOS = calculatorInput.loansForBT
            .filter(loan => loan.type === 'Credit Card')
            .reduce((sum, loan) => sum + (parseFloat(loan.creditLimitUsed) || parseFloat(loan.outstandingAmount) || 0), 0);
        
        const maxAllowedCCPOS = calculatorInput.monthlyIncome * adminAllConfig.btConfiguration.maxCreditCardBTMultiplier;
        
        if (btCreditCardPOS > maxAllowedCCPOS) {
           return { 
               bankName: name, 
               eligible: false, 
               reason: `BT Rejected: Credit Card Outstanding (₹${btCreditCardPOS.toLocaleString()}) exceeds the limit of ${adminAllConfig.btConfiguration.maxCreditCardBTMultiplier}x monthly income (Max Allowed: ₹${maxAllowedCCPOS.toLocaleString()}).`, 
               category: 'REJECTED' 
           };
        }
      }

      let bankCategory;
      let govtPolicy = null;

      // 3. GOVT OR PRIVATE SECTOR PATH
      if (calculatorInput.employmentType === 'government') {
        bankCategory = 'Govt';
        govtPolicy = getBankConfig(name, 'govtPolicy', location);
        console.log(`   🏛️ ${name}: Govt Direct Injection Active`, govtPolicy);
      } else if (hasDatabase) {
        let bankDbKey = id;
        if (id === 'axis-bank' || id === 'axis' || name === 'Axis Bank' || name === 'Axis Finance') {
          bankDbKey = 'axis_fin';
        } else if (id === 'shriram') {
          bankDbKey = 'shriram';
        }

        if (calculatorInput.companyName) {
          bankCategory = getCompanyCategoryForBank(calculatorInput.companyName, bankDbKey, calculatorInput.category || 'A');
          console.log(`   🏭 ${name}: ${calculatorInput.companyName} → ${bankCategory}`);
        } else {
          bankCategory = calculatorInput.category || 'A';
        }
      } else {
        bankCategory = calculatorInput.category || 'B';
        console.log(`   🏭 ${name}: Using default Category ${bankCategory} (no database)`);
      }

      // 3.5 INDUSIND BANK CATEGORY D RESTRICTION (Not in Policy)
      if (name === 'IndusInd Bank' || id === 'indusind') {
        const catUpper = String(bankCategory || '').toUpperCase().trim();
        if (catUpper === 'D' || catUpper === 'CATGD' || catUpper === 'CAT D' || catUpper === 'UNLISTED') {
          return {
            bankName: name,
            eligible: false,
            reason: 'IndusInd Bank policy does not fund Category D companies (Policy covers Category Super A, A, B, C, and Govt only).',
            category: bankCategory
          };
        }
      }

      // 3.6 AXIS BANK CATEGORY D RESTRICTION (Not in Policy; Axis Finance supports Cat D up to 10L)
      if (name === 'Axis Bank' || id === 'axis-bank') {
        const catUpper = String(bankCategory || '').toUpperCase().trim();
        if (catUpper === 'D' || catUpper === 'CATGD' || catUpper === 'CAT D' || catUpper === 'UNLISTED') {
          return {
            bankName: name,
            eligible: false,
            reason: `${name} policy does not fund Category D companies (Policy covers Category Super A, A, B, C, and Govt only).`,
            category: bankCategory
          };
        }
      }

      // 3.7 ICICI BANK EXCEL POLICY CHECKS (CIBIL 725+ or -1, Min Salary Govt 25k/Pvt 30k/Open 75k/NRI 2L, RJ Min Ticket 6.10L)
      const isIciciBankInst = name.toLowerCase().includes('icici') || id === 'icici';
      if (isIciciBankInst) {
        // CIBIL Check: 725+ or -1 (NTC) Doable
        if (rawCibil !== null && rawCibil !== undefined && rawCibil !== '') {
          const numCibil = Number(rawCibil);
          if (numCibil !== -1 && numCibil < 725) {
            return {
              bankName: name,
              eligible: false,
              reason: `ICICI Bank policy requires CIBIL score 725+ (Current CIBIL: ${numCibil}). CIBIL -1 is doable for new-to-credit applicants.`,
              category: bankCategory
            };
          }
        }

        // Min Salary Check
        const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
        const catStr = String(bankCategory || '').toUpperCase();
        let requiredSalary = 30000; // Pvt default (Super Prime, Preferred, Elite, A, B)
        if (catStr.includes('GOVT') || catStr.includes('PSU') || catStr.includes('ARMY')) {
          requiredSalary = 25000;
        } else if (catStr.includes('OPEN') || catStr.includes('UNLISTED') || catStr === 'C' || catStr === 'D') {
          requiredSalary = 75000;
        } else if (catStr.includes('NRI')) {
          requiredSalary = 200000;
        }
        if (income < requiredSalary) {
          return {
            bankName: name,
            eligible: false,
            reason: `ICICI Bank policy requires minimum monthly salary of ₹${requiredSalary.toLocaleString()} for ${bankCategory} (Current: ₹${income.toLocaleString()}).`,
            category: bankCategory
          };
        }

        // Rajasthan Ticket Size Check
        const isRajasthanLoc = String(calculatorInput.state || '').toLowerCase().includes('rajasthan') ||
                               String(calculatorInput.city || '').toLowerCase().includes('jaipur') ||
                               String(calculatorInput.city || '').toLowerCase().includes('jodhpur') ||
                               String(calculatorInput.city || '').toLowerCase().includes('kota') ||
                               String(calculatorInput.city || '').toLowerCase().includes('udaipur') ||
                               String(calculatorInput.city || '').toLowerCase().includes('bikaner') ||
                               String(calculatorInput.city || '').toLowerCase().includes('ajmer');
        if (isRajasthanLoc && calculatorInput.desiredLoanAmount && calculatorInput.desiredLoanAmount > 0 && calculatorInput.desiredLoanAmount < 610000) {
          return {
            bankName: name,
            eligible: false,
            reason: `ICICI Bank policy strictly requires a minimum loan amount of ₹6.10 Lakhs in Rajasthan (Requested: ₹${calculatorInput.desiredLoanAmount.toLocaleString()}).`,
            category: bankCategory
          };
        }
      }

      // 3.8 L&T FINANCE EXCEL POLICY CHECKS (CIBIL 720+, Min Salary 25k, Min 6 Months Salary Credit Work Exp)
      const isLntInst = name.toLowerCase().includes('l&t') || name.toLowerCase().includes('lnt') || id === 'lnt';
      if (isLntInst) {
        // CIBIL Check: 720+ Required (Sheet: CIBIL 720PLUS)
        if (rawCibil !== null && rawCibil !== undefined && rawCibil !== '') {
          const numCibil = Number(rawCibil);
          if (numCibil < 720) {
            return {
              bankName: name,
              eligible: false,
              reason: `L&T Finance policy strictly requires CIBIL score 720+ (Current CIBIL: ${numCibil}).`,
              category: bankCategory
            };
          }
        }

        // Min Salary Check: 25k
        const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
        if (income < 25000) {
          return {
            bankName: name,
            eligible: false,
            reason: `L&T Finance policy requires minimum monthly salary of ₹25,000 (Current: ₹${income.toLocaleString()}).`,
            category: bankCategory
          };
        }

        // Work Experience Check: 6 Months Salary Credit Required
        const totalExp = Number(calculatorInput.totalWorkExperience || calculatorInput.workExperience || 0);
        const currExp = Number(calculatorInput.currentCompanyExperience || calculatorInput.currentJobExperience || 0);
        if ((calculatorInput.totalWorkExperience !== undefined && totalExp > 0 && totalExp < 6) ||
            (calculatorInput.currentCompanyExperience !== undefined && currExp > 0 && currExp < 6)) {
          return {
            bankName: name,
            eligible: false,
            reason: 'L&T Finance policy requires minimum 6 months salary credit work experience.',
            category: bankCategory
          };
        }
      }

      // 3.9 SMFG INDIA CREDIT EXCEL POLICY CHECKS (Sheet: SMFG)
      const isSmfgInst = name.toLowerCase().includes('smfg') || id === 'smfg';
      if (isSmfgInst) {
        // Min Salary Check: 25k+ with 0 deduction
        const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
        if (income < 25000) {
          return {
            bankName: name,
            eligible: false,
            reason: `SMFG India Credit requires minimum monthly salary of ₹25,000 with 0 deduction (Excel: 25K+ SALARY WITH 0 DEDUCTION). Current: ₹${income.toLocaleString()}`,
            category: bankCategory
          };
        }

        // Age Check: 21 to Pvt 60 / Govt 65
        const age = calculatorInput.age ? Number(calculatorInput.age) : null;
        if (age !== null) {
          const isGovt = calculatorInput.employmentType === 'government';
          const maxAge = isGovt ? 65 : 60;
          if (age < 21) {
            return {
              bankName: name,
              eligible: false,
              reason: `Applicant age must be at least 21 years for SMFG India Credit (Current: ${age}).`,
              category: bankCategory
            };
          }
          if (age > maxAge) {
            return {
              bankName: name,
              eligible: false,
              reason: `Maximum age at loan time is ${maxAge} years for SMFG India Credit (${isGovt ? 'Govt/Pensioner' : 'Private'}). Current: ${age}`,
              category: bankCategory
            };
          }
        }

        // Current Company Experience Check: 2 Years (24 Months)
        const currExp = Number(calculatorInput.currentCompanyExperience || calculatorInput.currentJobExperience || 0);
        if (currExp > 0 && currExp < 24) {
          return {
            bankName: name,
            eligible: false,
            reason: `SMFG India Credit requires minimum 2 years (24 months) experience in current company (Excel: CURRENT COM 2 YEARS). Found: ${currExp} months.`,
            category: bankCategory
          };
        }
      }

      // 3.10 CHOLAMANDALAM FINANCE (CHOLA) EXCEL POLICY CHECKS (Sheet: CHOLA)
      const isCholaInst = name.toLowerCase().includes('chola') || id === 'chola';
      if (isCholaInst) {
        // Min Salary Check: 25k general, 30k for Banks & NBFCs employees without incentive
        const compStr = String(calculatorInput.companyName || '').toLowerCase();
        const typeStr = String(calculatorInput.companyType || '').toLowerCase();
        const isBankOrNbfc = compStr.includes('bank') || compStr.includes('nbfc') || compStr.includes('finance') || 
                             compStr.includes('capital') || compStr.includes('credit') || compStr.includes('lending') ||
                             typeStr.includes('bank') || typeStr.includes('nbfc');
        const reqMinSalary = isBankOrNbfc ? 30000 : 25000;
        const incomeNoIncentive = Number(calculatorInput.basicSalary || calculatorInput.monthlyIncome || 0);

        if (incomeNoIncentive < reqMinSalary) {
          return {
            bankName: name,
            eligible: false,
            reason: `Chola Finance requires minimum ₹${reqMinSalary.toLocaleString()} monthly salary without incentive for ${isBankOrNbfc ? 'Bank/NBFC employees' : 'salaried applicants'} (Excel: 25K AND BANKS AND NBFCS 30K WITHOUT INSENTIVE). Current: ₹${incomeNoIncentive.toLocaleString()}`,
            category: bankCategory
          };
        }

        // Designation Check: RM, SM, SO, SFE NOT ALLOW
        if (calculatorInput.designation) {
          const desigUpper = String(calculatorInput.designation).toUpperCase().trim();
          const restricted = ['RM', 'SM', 'SO', 'SFE', 'RELATIONSHIP MANAGER', 'SALES MANAGER', 'SALES OFFICER', 'SALES FINANCE EXECUTIVE'];
          const isRestricted = restricted.some(d => {
            const regex = new RegExp(`\\b${d}\\b`, 'i');
            return regex.test(desigUpper);
          });
          if (isRestricted) {
            return {
              bankName: name,
              eligible: false,
              reason: `Chola Finance policy does not allow designation "${calculatorInput.designation}" (Excel: RM SM SO SFE NOT ALLOW).`,
              category: bankCategory
            };
          }
        }

        // Work Experience Check: Govt 3 months, Pvt 12 months (1 year)
        const isGovt = calculatorInput.employmentType === 'government' || String(bankCategory).toUpperCase() === 'GOVT';
        const reqExpMonths = isGovt ? 3 : 12;
        const totalExp = Number(calculatorInput.totalWorkExperience || calculatorInput.workExperience || 0);
        if (totalExp > 0 && totalExp < reqExpMonths) {
          return {
            bankName: name,
            eligible: false,
            reason: `Chola Finance requires minimum ${reqExpMonths} months work experience for ${isGovt ? 'Govt employees' : 'private sector employees'} (Excel: GOVT 3 MONTHS/ PVT 1 YEARS). Found: ${totalExp} months.`,
            category: bankCategory
          };
        }
      }

      // 3.11 KOTAK MAHINDRA BANK EXCEL POLICY CHECKS (Sheet: KOTAK)
      const isKotakInst = name.toLowerCase().includes('kotak') || id === 'kotak';
      if (isKotakInst) {
        // Min Salary Check: 25k (Cat C & D: 35k)
        const catUpper = String(bankCategory || '').toUpperCase();
        const reqMinSalary = (catUpper === 'C' || catUpper === 'D') ? 35000 : 25000;
        const income = Number(calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0);

        if (income < reqMinSalary) {
          return {
            bankName: name,
            eligible: false,
            reason: `Kotak Mahindra Bank requires minimum monthly salary of ₹${reqMinSalary.toLocaleString()} for Category ${bankCategory} (Excel: 25K / Cat C & D: 35K). Current: ₹${income.toLocaleString()}`,
            category: bankCategory
          };
        }

        // Age Check: 21 to 60 Years
        const age = calculatorInput.age ? Number(calculatorInput.age) : null;
        if (age !== null && (age < 21 || age > 60)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Applicant age must be between 21 and 60 years for Kotak Mahindra Bank (Excel: 21 Years to 60 Years). Current: ${age}`,
            category: bankCategory
          };
        }
      }

      // 3.12 BANDHAN BANK EXCEL POLICY CHECKS (Sheet: BANDHAN BANK)
      const isBandhanInst = name.toLowerCase().includes('bandhan') || id === 'bandhan';
      if (isBandhanInst) {
        // Min Salary Check: 25k (Cat D: 40k)
        const catUpper = String(bankCategory || '').toUpperCase();
        const reqMinSalary = catUpper === 'D' ? 40000 : 25000;
        const income = Number(calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0);

        if (income < reqMinSalary) {
          return {
            bankName: name,
            eligible: false,
            reason: `Bandhan Bank requires minimum monthly salary of ₹${reqMinSalary.toLocaleString()} for Category ${bankCategory} (Excel: 25K / CAT D 40K). Current: ₹${income.toLocaleString()}`,
            category: bankCategory
          };
        }

        // Age Check: 21 to 60 Years
        const age = calculatorInput.age ? Number(calculatorInput.age) : null;
        if (age !== null && (age < 21 || age > 60)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Applicant age must be between 21 and 60 years for Bandhan Bank (Excel: 21 YEARS to 60 YEARS). Current: ${age}`,
            category: bankCategory
          };
        }

        // Work Experience Check: Overall 1 Year (12M)
        const totalExp = Number(calculatorInput.totalWorkExperience || calculatorInput.workExperience || 0);
        if (totalExp > 0 && totalExp < 12) {
          return {
            bankName: name,
            eligible: false,
            reason: `Bandhan Bank requires minimum 1 year (12 months) overall work experience (Excel: OVERALL 1YEARS). Found: ${totalExp} months.`,
            category: bankCategory
          };
        }
      }

      // 3.13 BAJAJ FINANCE EXCEL POLICY CHECKS (Sheet: BAJAJ)
      const isBajajInst = name.toLowerCase().includes('bajaj') || id === 'bajaj';
      if (isBajajInst) {
        const income = Number(calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0);
        const compType = String(calculatorInput.companyType || '').toLowerCase();
        const catUpper = String(bankCategory || '').toUpperCase();
        const isUnlisted = compType === 'unlisted' || catUpper === 'D' || catUpper === 'UNLISTED';
        const reqMinSalary = isUnlisted ? 30000 : 27000;

        // Min Salary Check: Listed 27k, Unlisted 30k
        if (income < reqMinSalary) {
          return {
            bankName: name,
            eligible: false,
            reason: `Bajaj Finance requires minimum monthly salary of ₹${reqMinSalary.toLocaleString()} for ${isUnlisted ? 'Unlisted' : 'Listed'} companies (Excel: LISTED 27K AND UNLISTED 30K). Current: ₹${income.toLocaleString()}`,
            category: bankCategory
          };
        }

        // Age Check: 23 to 59 Years (Govt/Retirement up to 65 with proof)
        const age = calculatorInput.age ? Number(calculatorInput.age) : null;
        if (age !== null) {
          const isGovt = calculatorInput.employmentType === 'government' || catUpper === 'GOVT';
          const maxAge = isGovt ? 65 : 59;
          if (age < 23) {
            return {
              bankName: name,
              eligible: false,
              reason: `Applicant age must be at least 23 years for Bajaj Finance (Excel: MINIMUM APLICANT AGE: 23 YEARS). Current: ${age}`,
              category: bankCategory
            };
          }
          if (age > maxAge) {
            return {
              bankName: name,
              eligible: false,
              reason: `Maximum age at loan time is ${maxAge} years for Bajaj Finance (${isGovt ? 'Govt / 65 with proof' : 'Private'}). Current: ${age}`,
              category: bankCategory
            };
          }
        }
      }

      // 3.14 AU SMALL FINANCE BANK EXCEL POLICY CHECKS (Sheet: AU BANK)
      const isAuInst = name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au';
      if (isAuInst) {
        const income = Number(calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0);
        const compType = String(calculatorInput.companyType || '').toLowerCase();
        const catUpper = String(bankCategory || '').toUpperCase();
        const isPriority1 = catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'B' || catUpper === 'GOVT' || catUpper === 'D';
        const isNtc = calculatorInput.cibilScore === -1 || calculatorInput.cibilScore === 0 || !calculatorInput.cibilScore;

        // Age Check: Salaried 21, Self-employed 23; Pvt 57, Govt 59
        const age = calculatorInput.age ? Number(calculatorInput.age) : null;
        if (age !== null) {
          const isGovt = calculatorInput.employmentType === 'government' || catUpper === 'GOVT';
          const maxAge = isGovt ? 59 : 57;
          if (age < 21) {
            return {
              bankName: name,
              eligible: false,
              reason: `Applicant age must be at least 21 years for AU Small Finance Bank (Excel: MINIMUM APLICANT AGE: 21YEARS). Current: ${age}`,
              category: bankCategory
            };
          }
          if (age > maxAge) {
            return {
              bankName: name,
              eligible: false,
              reason: `Maximum age at loan maturity is ${maxAge} years for AU Small Finance Bank (${isGovt ? 'Government' : 'Private'}). Current: ${age}`,
              category: bankCategory
            };
          }
        }

        // Work Experience Check: 1 Year (12M)
        const totalExp = Number(calculatorInput.totalWorkExperience || calculatorInput.workExperience || calculatorInput.currentCompanyExperience || 0);
        if (totalExp > 0 && totalExp < 12) {
          return {
            bankName: name,
            eligible: false,
            reason: `AU Small Finance Bank requires minimum 1 year (12 months) work experience (Excel: MINI WORK EXPRINCE: 1YEARS). Found: ${totalExp} months.`,
            category: bankCategory
          };
        }

        // Min Salary Check: Listed 20k, Unlisted 25k, NTC 30k (Listed/Govt only)
        if (isNtc) {
          if (!isPriority1) {
            return {
              bankName: name,
              eligible: false,
              reason: 'AU Small Finance Bank permits New to Credit (-1 CIBIL) only for Super A, Cat A, Cat B, and Govt categories (Excel: Lending to NTC allowed for Super A, CAT A, CAT B and CAT D only).',
              category: bankCategory
            };
          }
          if (income < 30000) {
            return {
              bankName: name,
              eligible: false,
              reason: `AU Small Finance Bank requires minimum ₹30,000 net salary for New to Credit (-1 CIBIL) applicants (Excel: -1 CIBIL 30K). Current: ₹${income.toLocaleString()}`,
              category: bankCategory
            };
          }
        } else {
          const isUnlisted = compType === 'unlisted' || catUpper === 'C' || catUpper === 'OTHERS' || catUpper === 'UNLISTED';
          const reqSalary = isUnlisted ? 25000 : 20000;
          if (income < reqSalary) {
            return {
              bankName: name,
              eligible: false,
              reason: `AU Small Finance Bank requires minimum monthly salary of ₹${reqSalary.toLocaleString()} for ${isUnlisted ? 'Unlisted' : 'Listed'} companies (Excel: LISTED 20K/UNLISTED 25K). Current: ₹${income.toLocaleString()}`,
              category: bankCategory
            };
          }
        }
      }

      // 3.15 AXIS FINANCE EXCEL POLICY CHECKS (Sheet: AXIS FINANCE)
      const isAxisFinInst = (name.toLowerCase().includes('axis') && name.toLowerCase().includes('fin')) || id === 'axis' || id === 'axis_fin';
      if (isAxisFinInst) {
        const income = Number(calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0);
        const cityTier = getCityTier(calculatorInput.city, calculatorInput.state);
        const cityTierNorm = String(cityTier || '').toUpperCase().trim();
        const isUrban = cityTierNorm === 'METRO' || cityTierNorm === 'TIER 1' || cityTierNorm.includes('METRO') || cityTierNorm.includes('TIER 1');
        const minReqSalary = isUrban ? 30000 : 25000;
        if (income < minReqSalary) {
          return {
            bankName: name,
            eligible: false,
            reason: `Axis Finance requires minimum monthly salary of ₹${minReqSalary.toLocaleString()} for ${isUrban ? 'Urban' : 'Rural'} locations (Excel: MINIMUM SALARY: 25K/30K). Current: ₹${income.toLocaleString()}`,
            category: bankCategory
          };
        }

        if (calculatorInput.desiredLoanAmount && Number(calculatorInput.desiredLoanAmount) < 100000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Axis Finance requires minimum loan amount of ₹1,00,000 (Excel: MINIMUM LOAN AMOUNT: 1 LAC). Requested: ₹${Number(calculatorInput.desiredLoanAmount).toLocaleString()}`,
            category: bankCategory
          };
        }

        const age = calculatorInput.age ? Number(calculatorInput.age) : null;
        if (age !== null && (age < 21 || age > 60)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Applicant age must be between 21 and 60 years for Axis Finance (Excel: 21 to 60 Years). Current: ${age}`,
            category: bankCategory
          };
        }

        const totalExp = Number(calculatorInput.totalWorkExperience || calculatorInput.workExperience || 0);
        if (totalExp > 0 && totalExp < 6) {
          return {
            bankName: name,
            eligible: false,
            reason: `Axis Finance requires minimum 6 months total work experience (Excel: TOTAL 6 MONTHS). Found: ${totalExp} months.`,
            category: bankCategory
          };
        }

        if (rawCibil !== null && rawCibil !== undefined && rawCibil !== '') {
          const numCibil = Number(rawCibil);
          if (numCibil > 0 && numCibil < 700) {
            return {
              bankName: name,
              eligible: false,
              reason: `Axis Finance policy requires CIBIL score 700+ (Excel: CIBIL: 700). Current CIBIL: ${numCibil}.`,
              category: bankCategory
            };
          }
        }
      }

      // 3.16 TATA CAPITAL EXCEL POLICY CHECKS (Sheet: TATA)
      const isTataInst = name.toLowerCase().includes('tata') || id === 'tata';
      if (isTataInst) {
        const income = Number(calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0);
        if (income < 25000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Tata Capital requires minimum monthly salary of ₹25,000 (Excel: MINIMUM SALARY AT LOAN TIME: 25k). Current: ₹${income.toLocaleString()}`,
            category: bankCategory
          };
        }

        if (calculatorInput.desiredLoanAmount && Number(calculatorInput.desiredLoanAmount) < 75000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Tata Capital requires minimum loan amount of ₹75,000 (Excel: MINIMUM LOAN AMOUNT: 75K). Requested: ₹${Number(calculatorInput.desiredLoanAmount).toLocaleString()}`,
            category: bankCategory
          };
        }

        const age = calculatorInput.age ? Number(calculatorInput.age) : null;
        if (age !== null) {
          const isGovt = calculatorInput.employmentType === 'government' || String(bankCategory).toUpperCase() === 'GOVT';
          const maxAge = isGovt ? 60 : 58;
          if (age < 21) {
            return {
              bankName: name,
              eligible: false,
              reason: `Applicant age must be at least 21 years for Tata Capital (Excel: MINIMUM APPLICANT AGE: 21). Current: ${age}`,
              category: bankCategory
            };
          }
          if (age > maxAge) {
            return {
              bankName: name,
              eligible: false,
              reason: `Maximum age at loan maturity is ${maxAge} years for Tata Capital (${isGovt ? 'Government' : 'Private'} - Excel: 58 IN PVT AND 60 IN GOVT). Current: ${age}`,
              category: bankCategory
            };
          }
        }

        const currExp = Number(calculatorInput.currentCompanyExperience || calculatorInput.workExperience || 0);
        const cibil = Number(rawCibil || 700);
        const hasStabilityWaiver = (age >= 26) && (cibil > 750) && (income > 50000);
        if (!hasStabilityWaiver && currExp > 0 && currExp < 12) {
          return {
            bankName: name,
            eligible: false,
            reason: `Tata Capital requires minimum 12 months current employment stability (Excel: Current employment Stability Minimum 12 months). Current: ${currExp} months.`,
            category: bankCategory
          };
        }
      }

      // 3.17 POONAWALLA FINCORP EXCEL POLICY CHECKS (Sheet: POONAWALA)
      const isPoonawalaInst = name.toLowerCase().includes('poonawala') || name.toLowerCase().includes('poonawalla') || id === 'poonawala';
      if (isPoonawalaInst) {
        const income = Number(calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0);
        if (income < 30000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Poonawalla Fincorp requires minimum monthly salary of ₹30,000 (Excel Row 89: MIN 30K). Current: ₹${income.toLocaleString()}`,
            category: bankCategory
          };
        }

        if (calculatorInput.desiredLoanAmount && Number(calculatorInput.desiredLoanAmount) < 100000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Poonawalla Fincorp requires minimum loan amount of ₹1,00,000 (Excel Row 95: MINIMUM LOAN AMOUNT: 1 LAC). Requested: ₹${Number(calculatorInput.desiredLoanAmount).toLocaleString()}`,
            category: bankCategory
          };
        }

        const age = calculatorInput.age ? Number(calculatorInput.age) : null;
        if (age !== null && (age < 21 || age > 60)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Applicant age must be between 21 and 60 years for Poonawalla Fincorp (Excel Row 90: MIN 21 YRS / MAX 60 YRS). Current: ${age}`,
            category: bankCategory
          };
        }

        const totalExp = Number(calculatorInput.totalWorkExperience || calculatorInput.workExperience || 0);
        if (totalExp > 0 && totalExp < 24) {
          return {
            bankName: name,
            eligible: false,
            reason: `Poonawalla Fincorp requires minimum 2 years (24 months) total work experience (Excel Row 92: TOTAL 2 YEARS). Found: ${totalExp} months.`,
            category: bankCategory
          };
        }

        const cityTier = getCityTier(calculatorInput.city, calculatorInput.state);
        const cityTierNorm = String(cityTier || '').toUpperCase().trim();
        const catUpper = String(bankCategory || '').toUpperCase();
        if (rawCibil !== null && rawCibil !== undefined && rawCibil !== '') {
          const numCibil = Number(rawCibil);
          if (numCibil <= 0) {
            const isEligibleNtc = (cityTierNorm === 'METRO' || cityTierNorm === 'TIER 1' || cityTierNorm === 'TIER 2' || cityTierNorm.includes('METRO') || cityTierNorm.includes('TIER 1') || cityTierNorm.includes('TIER 2')) && (catUpper.includes('SUPER') || catUpper === 'A');
            if (!isEligibleNtc) {
              return {
                bankName: name,
                eligible: false,
                reason: `Poonawalla Fincorp: NTC (-1/0 CIBIL) is allowed only for Tier 1 & Tier 2 cities and Company Category A (Excel Row 93). Current City Tier: ${cityTier}, Category: ${bankCategory}`,
                category: bankCategory
              };
            }
          } else if (numCibil < 700) {
            return {
              bankName: name,
              eligible: false,
              reason: `Poonawalla Fincorp requires minimum CIBIL score of 700 (Excel Row 93: 700 MINIMUM, 0 and -1 allowed for Tier 1, 2 cities & Cat A). Current CIBIL: ${numCibil}.`,
              category: bankCategory
            };
          }
        }

        // CC POS > 4x monthly income reject
        const totalCcOutstanding = (calculatorInput.creditCards || [])
          .reduce((sum, card) => sum + (parseFloat(card.outstandingAmount || card.creditLimitUsed || 0)), 0);
        if (totalCcOutstanding > (income * 4)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Poonawalla Fincorp: Total Credit Card outstanding (₹${totalCcOutstanding.toLocaleString()}) exceeds 4 times net monthly income (₹${(income * 4).toLocaleString()}) (Excel Row 94).`,
            category: bankCategory
          };
        }
      }

      // 3.18 ADITYA BIRLA FINANCE (ABFL) EXCEL POLICY CHECKS (Sheet: ABFL)
      const isAbflInst = name.toLowerCase().includes('aditya') || name.toLowerCase().includes('abfl') || id === 'abfl';
      if (isAbflInst) {
        const income = Number(calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0);
        const cityTier = getCityTier(calculatorInput.city, calculatorInput.state);
        const tierUpper = String(cityTier || '').toUpperCase().trim();
        // Tier-based salary requirements: Tier 1: 40k, Tier 2: 35k, Tier 3: 25k, Tier 4 / Others: 20k
        let reqSalary = 20000;
        if (tierUpper === 'METRO' || tierUpper === 'TIER 1' || tierUpper.includes('TIER 1') || tierUpper.includes('METRO')) reqSalary = 40000;
        else if (tierUpper === 'TIER 2' || tierUpper.includes('TIER 2')) reqSalary = 35000;
        else if (tierUpper === 'TIER 3' || tierUpper.includes('TIER 3')) reqSalary = 25000;
        else reqSalary = 20000;

        if (income < reqSalary) {
          return {
            bankName: name,
            eligible: false,
            reason: `Aditya Birla Finance requires minimum monthly salary of ₹${reqSalary.toLocaleString()} for ${cityTier || 'Others'} locations (Excel: TIER 1=40K, TIER 2=35K, TIER 3=25K, TIER 4=20K). Current: ₹${income.toLocaleString()}`,
            category: bankCategory
          };
        }

        if (calculatorInput.desiredLoanAmount && Number(calculatorInput.desiredLoanAmount) < 100000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Aditya Birla Finance requires minimum loan amount of ₹1,00,000 (Excel: MINI LOAN AMOUNT 1LAC). Requested: ₹${Number(calculatorInput.desiredLoanAmount).toLocaleString()}`,
            category: bankCategory
          };
        }

        const age = calculatorInput.age ? Number(calculatorInput.age) : null;
        if (age !== null && (age < 21 || age > 60)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Applicant age must be between 21 and 60 years for Aditya Birla Finance (Excel: MIN 21 YEARS / MAX 60 YEARS). Current: ${age}`,
            category: bankCategory
          };
        }

        const totalExp = Number(calculatorInput.totalWorkExperience || calculatorInput.workExperience || 0);
        if (totalExp > 0 && totalExp < 12) {
          return {
            bankName: name,
            eligible: false,
            reason: `Aditya Birla Finance requires minimum 1 year (12 months) total work experience (Excel: MINI WORK EXPRINCE 1YEARS). Found: ${totalExp} months.`,
            category: bankCategory
          };
        }

        // BT Salary Multiplier limit: Salary 6 times BT allowed (Excel Row 10: SALARY 6 TIME BT ALLOW)
        if (calculatorInput.isBTMode && calculatorInput.btTotalOutstanding > (income * 6)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Aditya Birla Finance allows maximum Balance Transfer of 6 times net monthly income (₹${(income * 6).toLocaleString()}). Selected BT: ₹${Math.round(calculatorInput.btTotalOutstanding).toLocaleString()} (Excel: SALARY 6 TIME BT ALLOW).`,
            category: bankCategory
          };
        }
      }

      // 3.19 FINNABLE FINANCE EXCEL POLICY CHECKS (Sheet: FINNABLE)
      const isFinnableInst = name.toLowerCase().includes('finnable') || id === 'finnable';
      if (isFinnableInst) {
        const income = Number(calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0);
        const cityTier = getCityTier(calculatorInput.city, calculatorInput.state);
        const isTier1 = isFinnableTier1City(calculatorInput.city, calculatorInput.state);
        const reqSalary = isTier1 ? 20000 : 15000;

        if (income < reqSalary) {
          return {
            bankName: name,
            eligible: false,
            reason: `Finnable Finance requires minimum monthly salary of ₹${reqSalary.toLocaleString()} for ${isTier1 ? 'Tier 1' : 'Tier 2 / Others'} locations (Excel: 20K FOR TIER 1, 15K FOR TIER 2). Current: ₹${income.toLocaleString()}`,
            category: bankCategory
          };
        }

        if (calculatorInput.desiredLoanAmount && Number(calculatorInput.desiredLoanAmount) < 50000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Finnable Finance requires minimum loan amount of ₹50,000 (Excel: Min. Loan Amount 50k). Requested: ₹${Number(calculatorInput.desiredLoanAmount).toLocaleString()}`,
            category: bankCategory
          };
        }

        const age = calculatorInput.age ? Number(calculatorInput.age) : null;
        if (age !== null && (age < 21 || age > 55)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Applicant age must be between 21 and 55 years at login for Finnable Finance (Excel: 21 yr to 55 yr). Current: ${age}`,
            category: bankCategory
          };
        }

        const totalExp = Number(calculatorInput.totalWorkExperience || calculatorInput.workExperience || 0);
        if (totalExp > 0 && totalExp < 6) {
          return {
            bankName: name,
            eligible: false,
            reason: `Finnable Finance requires minimum 6 months total work experience (Excel: Minimum work experience 6 MONTHS). Found: ${totalExp} months.`,
            category: bankCategory
          };
        }

        if (rawCibil !== null && rawCibil !== undefined && rawCibil !== '') {
          const numCibil = Number(rawCibil);
          // Score > 0 but < 700 is rejected (NTC -1 or 0 is allowed)
          if (numCibil > 0 && numCibil < 700) {
            return {
              bankName: name,
              eligible: false,
              reason: `Finnable Finance requires CIBIL score of 700+ or New to Credit (-1/0) (Excel: Cibil Score 700+ / NTC -1). Current CIBIL: ${numCibil}.`,
              category: bankCategory
            };
          }
        }

        // Negative Designation Profile Check
        const designation = String(calculatorInput.designation || calculatorInput.jobRole || calculatorInput.profession || '').toLowerCase().trim();
        if (designation) {
          if (FINNABLE_NEGATIVE_PROFILES.some(prof => designation.includes(prof))) {
            return {
              bankName: name,
              eligible: false,
              reason: `Applicant profile '${designation}' is on Finnable Finance negative profile list (Excel Row 29).`,
              category: bankCategory
            };
          }
        }

        // Negative Industry Check (Excel Row 30: Bars, Event management, Spa & saloon, Media)
        const companyOrIndustry = String(calculatorInput.industry || calculatorInput.companyType || calculatorInput.companyName || '').toLowerCase().trim();
        if (companyOrIndustry && isFinnableNegativeIndustry(companyOrIndustry)) {
          return {
            bankName: name,
            eligible: false,
            reason: `Company/Industry '${companyOrIndustry}' is in Finnable Finance negative industry list (Excel Row 30: Bars, Event management, Spa & Saloon, Media).`,
            category: bankCategory
          };
        }

        // Sole Proprietorship Geographic check (Excel Row 30: Sole proprietorship is only allowed in West and South zones)
        const compType = String(calculatorInput.companyType || '').toLowerCase().trim();
        if (compType.includes('proprietor') || compType === 'proprietorship' || compType === 'sole prop') {
          if (calculatorInput.state && !isSolePropAllowedZone(calculatorInput.state)) {
            return {
              bankName: name,
              eligible: false,
              reason: `Finnable Finance policy: Sole Proprietorship firms are allowed only in West and South zones (Excel Row 30). Current State: ${calculatorInput.state}.`,
              category: bankCategory
            };
          }
        }
      }

      // -------------------------------------------------------------
      // Dynamic Bank Policy Specific Credit Card Obligation Percentage
      // -------------------------------------------------------------
      let bankCcObligationPercent = 5; // Default standard bank policy

      // 1. Check Unified / Excel Policy foirMultiplier for this category
      if (uPolicy && Array.isArray(uPolicy.foirMultiplier)) {
        const matchedFoirRow = uPolicy.foirMultiplier.find(m => matchCategory(m.category, bankCategory));
        if (matchedFoirRow && matchedFoirRow.ccObligation !== undefined && matchedFoirRow.ccObligation !== null && matchedFoirRow.ccObligation !== '') {
          bankCcObligationPercent = Number(matchedFoirRow.ccObligation);
        }
      }
      // 2. Check Unified / Excel Policy demographics
      if (uPolicy?.demographics?.ccObligationPercent !== undefined && uPolicy?.demographics?.ccObligationPercent !== null && uPolicy?.demographics?.ccObligationPercent !== '') {
        bankCcObligationPercent = Number(uPolicy.demographics.ccObligationPercent);
      }
      // 3. Check Admin Panel FOIR settings
      if (adminAllConfig.foirSettings?.creditCardObligationPercentage !== undefined && adminAllConfig.foirSettings?.creditCardObligationPercentage !== null && adminAllConfig.foirSettings?.creditCardObligationPercentage !== '') {
        bankCcObligationPercent = Number(adminAllConfig.foirSettings.creditCardObligationPercentage);
      }

      // Calculate active credit card balance to obligate (excluding cards selected for BT)
      const activeCcOutstanding = (calculatorInput.creditCards || [])
        .filter(card => !card.isBT)
        .reduce((sum, card) => sum + (parseFloat(card.outstandingAmount || card.creditLimitUsed || 0)), 0);

      let bankCreditCardObligation = 0;
      // Bandhan Bank: 3% obligation, and if active CC POS < 3x monthly income, 0 obligation!
      if (name.toLowerCase().includes('bandhan') || id === 'bandhan') {
        bankCcObligationPercent = 3;
        const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
        if (activeCcOutstanding <= (income * 3)) {
          bankCreditCardObligation = 0; // Below 3x salary, no obligation as per Excel policy!
        } else {
          bankCreditCardObligation = Math.round(activeCcOutstanding * 0.03);
        }
      } else if (activeCcOutstanding > 0) {
        // Use exact bank policy percentage (e.g., 4% for Axis Bank, 5% for IndusInd Bank)
        bankCreditCardObligation = Math.round(activeCcOutstanding * (bankCcObligationPercent / 100));
      } else if (calculatorInput.creditCardObligation > 0) {
        // Fallback: pro-rate if only aggregated standard 5% obligation was passed
        bankCreditCardObligation = Math.round(calculatorInput.creditCardObligation * (bankCcObligationPercent / 5));
      }


      // 🌉 INJECT ADMIN OVERRIDES INTO THE ENGINE
      // Only apply customer's reported CIBIL score if the bank has an active CIBIL policy (e.g., IndusInd Bank for -1 capping)
      const bankHasCibilPolicy = (name === 'IndusInd Bank' || id === 'indusind');
      const effectiveCreditScore = bankHasCibilPolicy
        ? (rawCibil !== null && rawCibil !== undefined ? Number(rawCibil) : 750)
        : 750;

      const bankInput = {
        ...calculatorInput,
        creditScore: effectiveCreditScore,
        cibilScore: rawCibil,
        category: bankCategory,
        bankName: name,
        bankId: id,
        creditCardObligation: bankCreditCardObligation,
        creditCardObligationPercentage: bankCcObligationPercent
      };

      // Apply Govt Overrides if available
      if (govtPolicy) {
        bankInput.isGovtEmployee = true;
        bankInput.govtROI = govtPolicy.roi;
        bankInput.govtFOIR = govtPolicy.foir;
        bankInput.govtMultiplier = govtPolicy.multiplier;
        bankInput.govtMaxTenure = govtPolicy.maxTenureMonths;
      }

      // 🎯 BIND DYNAMIC UNIFIED BANK POLICY (Rates, Caps, FOIR, Multipliers, Tenure)
      if (uPolicy && !govtPolicy) {
        // 1. Dynamic Interest Rate match (Support All Loan Amount Slabs: >=50L, >=35L, >=20L, >=15L, >=10L, <10L)
        if (Array.isArray(uPolicy.interestRates)) {
          const matchedRate = uPolicy.interestRates.find(r => matchCategory(r.category, bankCategory));
          if (matchedRate) {
            let dynamicRoi = matchedRate.defaultRoi || matchedRate.minRoi || 10.5;
            const reqAmount = calculatorInput.desiredLoanAmount;
            const isSmfg = name.toLowerCase().includes('smfg') || id === 'smfg';
            const isChola = name.toLowerCase().includes('chola') || id === 'chola';
            if (isSmfg) {
              const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
              if (income >= 100000 && matchedRate.roiAbove100k) {
                dynamicRoi = matchedRate.roiAbove100k;
              } else if (income >= 75000 && matchedRate.roi75kTo100k) {
                dynamicRoi = matchedRate.roi75kTo100k;
              } else if (income >= 50000 && matchedRate.roi50kTo75k) {
                dynamicRoi = matchedRate.roi50kTo75k;
              } else if (income >= 40000 && matchedRate.roi40kTo50k) {
                dynamicRoi = matchedRate.roi40kTo50k;
              } else if (income >= 35000 && matchedRate.roi35kTo40k) {
                dynamicRoi = matchedRate.roi35kTo40k;
              } else if (income >= 30000 && matchedRate.roi30kTo35k) {
                dynamicRoi = matchedRate.roi30kTo35k;
              } else if (income >= 25000 && matchedRate.roi25kTo30k) {
                dynamicRoi = matchedRate.roi25kTo30k;
              } else if (matchedRate.roiBelow25k || matchedRate.roi25001) {
                dynamicRoi = matchedRate.roiBelow25k || matchedRate.roi25001;
              }
            } else if (isChola) {
              // Chola Finance (Sheet: CHOLA - Section 2)
              // Super A / A / Govt: >=10L & >=75k Sal -> 13.75%, >=7.5L & >=50k Sal -> 14.50%, Else -> 15.00%
              // B: >=5L -> 14.50% (to 15.00%), Else -> 15.00%
              // C / D: 15.00%
              const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
              const amt = reqAmount || 1000000;
              const catUpper = String(bankCategory || '').toUpperCase();
              if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') {
                if (amt >= 1000000 && income >= 75000 && matchedRate.roiAbove10L75kSal) {
                  dynamicRoi = matchedRate.roiAbove10L75kSal;
                } else if (amt >= 750000 && income >= 50000 && matchedRate.roiAbove75L50kSal) {
                  dynamicRoi = matchedRate.roiAbove75L50kSal;
                } else {
                  dynamicRoi = matchedRate.roiAbove5L || matchedRate.defaultRoi || 15.00;
                }
              } else if (catUpper === 'B') {
                if (amt >= 500000 && (matchedRate.roiAbove10L75kSal || matchedRate.roiAbove75L50kSal)) {
                  dynamicRoi = matchedRate.roiAbove10L75kSal || 14.50;
                } else {
                  dynamicRoi = matchedRate.roiAbove5L || matchedRate.defaultRoi || 15.00;
                }
              } else {
                dynamicRoi = matchedRate.roiAbove5L || matchedRate.defaultRoi || 15.00;
              }
            } else if (name.toLowerCase().includes('bandhan') || id === 'bandhan') {
              // Bandhan Bank (Sheet: BANDHAN BANK - Section 5)
              // Rates determined by Category, Monthly Income (>50k, 25k-50k, <25k), and CIBIL (>750, 700-749, 650-699)
              const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
              const cibil = Number(calculatorInput.creditScore) || 750;
              const is750Plus = cibil >= 750;
              const is700Plus = cibil >= 700 && cibil < 750;

              if (income > 50000) {
                if (is750Plus && matchedRate.roiAbove50k_750) dynamicRoi = matchedRate.roiAbove50k_750;
                else if (is700Plus && matchedRate.roiAbove50k_700) dynamicRoi = matchedRate.roiAbove50k_700;
                else if (matchedRate.roiAbove50k_650) dynamicRoi = matchedRate.roiAbove50k_650;
                else dynamicRoi = matchedRate.minRoi || 12.15;
              } else if (income >= 25000) {
                if (is750Plus && matchedRate.roi25kTo50k_750) dynamicRoi = matchedRate.roi25kTo50k_750;
                else if (is700Plus && matchedRate.roi25kTo50k_700) dynamicRoi = matchedRate.roi25kTo50k_700;
                else if (matchedRate.roi25kTo50k_650) dynamicRoi = matchedRate.roi25kTo50k_650;
                else dynamicRoi = matchedRate.defaultRoi || 13.49;
              } else {
                if (is750Plus && matchedRate.roiBelow25k_750) dynamicRoi = matchedRate.roiBelow25k_750;
                else if (is700Plus && matchedRate.roiBelow25k_700) dynamicRoi = matchedRate.roiBelow25k_700;
                else if (matchedRate.roiBelow25k_650) dynamicRoi = matchedRate.roiBelow25k_650;
                else dynamicRoi = matchedRate.maxRoi || 15.49;
              }
            } else if (name.toLowerCase().includes('bajaj') || id === 'bajaj') {
              // Bajaj Finance (Sheet: BAJAJ - Section 2)
              // 10L Above: 10%, 1 to 12 Lac (Sal Lite): 16%, Default case: 14%
              const amt = reqAmount || 1000000;
              if (amt >= 1000000 && matchedRate.roiAbove10L) {
                dynamicRoi = matchedRate.roiAbove10L; // 10.00%
              } else if (amt <= 1200000 && matchedRate.roi1Lto12L) {
                dynamicRoi = matchedRate.roi1Lto12L; // 16.00%
              } else {
                dynamicRoi = matchedRate.defaultRoi || 14.00;
              }
            } else if (name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au') {
              // AU Small Finance Bank (Sheet: AU BANK - Section 5)
              const amt = reqAmount || 1000000;
              const cibil = Number(calculatorInput.cibilScore || 750);
              dynamicRoi = getAuROI(amt, cibil, bankCategory);
            } else if ((name.toLowerCase().includes('axis') && name.toLowerCase().includes('fin')) || id === 'axis' || id === 'axis_fin') {
              // Axis Finance (Sheet: AXIS FINANCE - Section 2)
              const amt = reqAmount || 1000000;
              if (amt > 2000000 && matchedRate.roiAbove20L) {
                dynamicRoi = matchedRate.roiAbove20L;
              } else if (matchedRate.roiUpTo20L) {
                dynamicRoi = matchedRate.roiUpTo20L;
              } else {
                dynamicRoi = matchedRate.defaultRoi || 13.00;
              }
            } else if (name.toLowerCase().includes('tata') || id === 'tata') {
              // Tata Capital (Sheet: TATA - Section 2)
              const amt = reqAmount || 1000000;
              if (amt >= 5000000 && matchedRate.roiAbove50L) {
                dynamicRoi = matchedRate.roiAbove50L;
              } else if (amt >= 4000000 && matchedRate.roiAbove40L) {
                dynamicRoi = matchedRate.roiAbove40L;
              } else if (amt >= 3000000 && matchedRate.roiAbove30L) {
                dynamicRoi = matchedRate.roiAbove30L;
              } else if (amt > 2000000 && matchedRate.roiAbove20L) {
                dynamicRoi = matchedRate.roiAbove20L;
              } else if (matchedRate.roiUpTo20L) {
                dynamicRoi = matchedRate.roiUpTo20L;
              } else {
                dynamicRoi = matchedRate.defaultRoi || 12.00;
              }
            } else if (name.toLowerCase().includes('poonawala') || name.toLowerCase().includes('poonawalla') || id === 'poonawala') {
              // Poonawalla Fincorp (Sheet: POONAWALA - Section 4)
              const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
              const amt = reqAmount || 1000000;
              const cibil = Number(calculatorInput.creditScore || calculatorInput.cibilScore || 750);
              dynamicRoi = poonawalaConfig.getPoonawalaRate(bankCategory, income, amt, cibil);
            } else if (reqAmount && reqAmount > 0) {
              if (reqAmount >= 5000000 && matchedRate.roiAbove50L) {
                dynamicRoi = matchedRate.roiAbove50L;
              } else if (reqAmount >= 3500000 && matchedRate.roiAbove35L) {
                dynamicRoi = matchedRate.roiAbove35L;
              } else if (reqAmount >= 2000000 && (matchedRate.roiAbove20L || matchedRate.roi20Lto30L)) {
                dynamicRoi = matchedRate.roiAbove20L || matchedRate.roi20Lto30L;
              } else if (reqAmount >= 1500000 && (matchedRate.roi15Lto20L || matchedRate.roiAbove15L)) {
                dynamicRoi = matchedRate.roi15Lto20L || matchedRate.roiAbove15L;
              } else if (reqAmount >= 1000000 && (matchedRate.roi10Lto15L || matchedRate.roiAbove10L || matchedRate.roi10Lto20L || matchedRate.roiAbove10L75kSal)) {
                dynamicRoi = matchedRate.roi10Lto15L || matchedRate.roiAbove10L || matchedRate.roi10Lto20L || matchedRate.roiAbove10L75kSal;
              } else if (matchedRate.roi5Lto10L || matchedRate.roiBelow10L || matchedRate.roi1Lto10L || matchedRate.roiBelow20L || matchedRate.roi1Lto12L || matchedRate.roiAbove5L || matchedRate.roi5Lto25L) {
                dynamicRoi = matchedRate.roi5Lto10L || matchedRate.roiBelow10L || matchedRate.roi1Lto10L || matchedRate.roiBelow20L || matchedRate.roi1Lto12L || matchedRate.roiAbove5L || matchedRate.roi5Lto25L;
              }
            } else {
              // Customer entered NO loan amount: use best provisional base rate
              dynamicRoi = matchedRate.roiAbove50L || matchedRate.roiAbove35L || matchedRate.roiAbove20L || matchedRate.roiAbove15L || matchedRate.defaultRoi || matchedRate.minRoi || 9.99;
            }
            bankInput.interestRateOverride = Number(dynamicRoi);
            bankInput.matchedRateConfig = matchedRate;
          }
        }

        // 2. Dynamic Loan Capping match
        if (Array.isArray(uPolicy.loanCapping)) {
          const matchedCap = uPolicy.loanCapping.find(c => matchCategory(c.tier || c.category, bankCategory));
          if (matchedCap) {
            if (matchedCap.maxLoan) bankInput.maxLoanOverride = Number(matchedCap.maxLoan);

            // L&T Finance: Category D Rented Capping (₹20 Lakhs vs ₹30 Lakhs owned)
            const isLnt = name.toLowerCase().includes('l&t') || name.toLowerCase().includes('lnt') || id === 'lnt';
            const isRentedUser = calculatorInput.livingStatus === 'rented' || calculatorInput.residenceType === 'rented';
            if (isLnt && matchedCap.rentedCap && isRentedUser) {
              bankInput.maxLoanOverride = Number(matchedCap.rentedCap);
            }

            // Bachelor Capping ONLY applies to AU Small Finance Bank (Max 5L for PG / Rented Bachelor)
            const isAu = name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au';
            const isBachelorUser = calculatorInput.isBachelor || calculatorInput.maritalStatus === 'single' || calculatorInput.livingStatus === 'bachelor' || calculatorInput.livingStatus === 'rented';
            if (isAu && matchedCap.bachelorCap && isBachelorUser) {
              bankInput.dynamicBachelorLimitOverride = Number(matchedCap.bachelorCap);
              bankInput.dynamicBachelorCapReason = 'AU Bank PG/Rented Bachelor Policy Cap (Max ₹5 Lakhs)';
            }
          }
        }

        // 3. Dynamic FOIR & Multiplier match (Tab 4 in Admin - Salary Slabs)
        if (Array.isArray(uPolicy.foirMultiplier)) {
          const matchedFoir = uPolicy.foirMultiplier.find(m => matchCategory(m.category, bankCategory));
          if (matchedFoir) {
            const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
            const isIndusind = name === 'IndusInd Bank' || id === 'indusind';

            if (isIndusind) {
              // IndusInd Multipliers from Excel & Policy Config:
              let indusMultiplier = 20;
              const catUpper = String(bankCategory || '').toUpperCase();
              if (catUpper === 'C' || catUpper === 'CAT C') {
                indusMultiplier = matchedFoir.multiplierBelow75k ?? matchedFoir.multiplier ?? 21;
              } else {
                if (income >= 125000) indusMultiplier = matchedFoir.multiplierAbove125k ?? matchedFoir.multiplier ?? 30;
                else if (income >= 75000) indusMultiplier = matchedFoir.multiplier75kTo125k ?? matchedFoir.multiplier ?? 25;
                else indusMultiplier = matchedFoir.multiplierBelow75k ?? 20;
              }
              bankInput.multiplierOverride = indusMultiplier;

              let foirPct = 50;
              const hasHlOrLap = (calculatorInput.existingLoanTypes && 
                (calculatorInput.existingLoanTypes.includes('Home Loan') || 
                 calculatorInput.existingLoanTypes.includes('Loan Against Property') ||
                 calculatorInput.existingLoanTypes.includes('HL') ||
                 calculatorInput.existingLoanTypes.includes('LAP'))) ||
                (Array.isArray(calculatorInput.loansForBT) && 
                 calculatorInput.loansForBT.some(l => l.type === 'Home Loan' || l.type === 'LAP'));

              if (catUpper === 'C' || catUpper === 'CAT C') {
                if (income >= 35000) foirPct = 60;
                else foirPct = 50;
              } else {
                if (income >= 50000) {
                  if (hasHlOrLap) foirPct = 75;
                  else if (calculatorInput.livingStatus === 'owned') foirPct = 70;
                  else foirPct = 65;
                } else if (income >= 35000) {
                  foirPct = 60;
                } else {
                  foirPct = 50;
                }
              }
              bankInput.foirOverride = Number(foirPct);
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name === 'HDFC Bank' || id === 'hdfc') {
              // HDFC Bank Master Excel Policy
              const catUpper = String(bankCategory || '').toUpperCase();
              let hdfcMultiplier = matchedFoir.multiplier || 27;
              let hdfcFoir = matchedFoir.maxFoir || 70;

              if (income >= 75000) {
                hdfcMultiplier = matchedFoir.multiplier || ((catUpper === 'C' || catUpper === 'D') ? 20 : (catUpper === 'B' ? 25 : 27));
                hdfcFoir = matchedFoir.maxFoir || ((catUpper === 'C' || catUpper === 'D') ? 50 : (catUpper === 'B' ? 65 : 70));
              } else if (income >= 50000) {
                hdfcMultiplier = (catUpper === 'C' || catUpper === 'D') ? 18 : (catUpper === 'B' ? 22 : 25);
                hdfcFoir = matchedFoir.slab2Foir || ((catUpper === 'C' || catUpper === 'D') ? 45 : (catUpper === 'B' ? 55 : 60));
              } else {
                hdfcMultiplier = (catUpper === 'C' || catUpper === 'D') ? 15 : (catUpper === 'B' ? 18 : 20);
                hdfcFoir = matchedFoir.slab1Foir || ((catUpper === 'C' || catUpper === 'D') ? 40 : 50);
              }

              bankInput.multiplierOverride = hdfcMultiplier;
              bankInput.foirOverride = hdfcFoir;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name.toLowerCase().includes('kotak') || id === 'kotak') {
              // Kotak Mahindra Bank Excel Policy
              const catUpper = String(bankCategory || '').toUpperCase();
              let kotakMult = matchedFoir.multiplier || 27;
              if (catUpper === 'SUPER A') kotakMult = 31;
              else if (catUpper === 'A' || catUpper === 'GOVT') kotakMult = 27;
              else if (catUpper === 'B') kotakMult = 25;
              else if (catUpper === 'C') kotakMult = 20;
              else if (catUpper === 'D') kotakMult = 18;

              let kotakFoir = catUpper === 'D' ? 60 : 70;
              const hasLiveHl = (calculatorInput.existingLoanTypes && (calculatorInput.existingLoanTypes.includes('Home Loan') || calculatorInput.existingLoanTypes.includes('HL'))) ||
                (Array.isArray(calculatorInput.loansForBT) && calculatorInput.loansForBT.some(l => l.type === 'Home Loan'));
              if (hasLiveHl && catUpper !== 'D') {
                kotakFoir += 5; // 70% + 5% IF HL LIVE >= 10 LAKHS
              }
              bankInput.multiplierOverride = kotakMult;
              bankInput.foirOverride = kotakFoir;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name.toLowerCase().includes('tata') || id === 'tata') {
              // Tata Capital Excel Policy (Sheet: TATA - Section 3 FOIR & Section 5 Multipliers)
              const catUpper = String(bankCategory || '').toUpperCase();
              const hasHlOrLap = (calculatorInput.existingLoanTypes && 
                (calculatorInput.existingLoanTypes.includes('Home Loan') || 
                 calculatorInput.existingLoanTypes.includes('Loan Against Property') ||
                 calculatorInput.existingLoanTypes.includes('HL') ||
                 calculatorInput.existingLoanTypes.includes('LAP'))) ||
                (Array.isArray(calculatorInput.loansForBT) && 
                 calculatorInput.loansForBT.some(l => l.type === 'Home Loan' || l.type === 'LAP'));

              // FOIR based on Secured (with HL/LAP) vs Unsecured
              let tataFoir = 50;
              if (hasHlOrLap) {
                if (income > 75000) tataFoir = 75;
                else if (income >= 50000) tataFoir = 65;
                else if (income >= 25000) tataFoir = 60;
                else tataFoir = 50;
              } else {
                if (income > 75000) tataFoir = 65;
                else if (income >= 50000) tataFoir = 55;
                else if (income >= 25000) tataFoir = 50;
                else tataFoir = 40;
              }

              let tataMult = 20;
              if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') {
                if (income > 75000) tataMult = 27;
                else if (income >= 50000) tataMult = 23.5;
                else tataMult = 20;
              } else if (catUpper === 'B') {
                if (income > 75000) tataMult = 25;
                else if (income >= 50000) tataMult = 22;
                else tataMult = 19;
              } else if (catUpper === 'C') {
                if (income > 75000) tataMult = 18;
                else if (income >= 50000) tataMult = 18;
                else tataMult = 15;
              } else {
                // Category D / Unlisted
                if (income > 75000) tataMult = 15;
                else if (income >= 50000) tataMult = 15;
                else tataMult = 9;
              }
              bankInput.multiplierOverride = tataMult;
              bankInput.foirOverride = tataFoir;
              bankInput.ccObligationPercentOverride = 5;
            } else if (name.toLowerCase().includes('bajaj') || id === 'bajaj') {
              // Bajaj Finance Excel Policy (Sheet: BAJAJ - Sections 3 & 6)
              const hasHl = (calculatorInput.existingLoanTypes && (calculatorInput.existingLoanTypes.includes('Home Loan') || calculatorInput.existingLoanTypes.includes('HL'))) ||
                (Array.isArray(calculatorInput.loansForBT) && calculatorInput.loansForBT.some(l => l.type === 'Home Loan'));
              let bajajFoir = income < 50000 ? 60 : 65;
              if (hasHl) bajajFoir += (income < 50000 ? 10 : 5);
              bankInput.foirOverride = Math.min(75, bajajFoir);

              // Multipliers from Section 6 (Excel Sheet: BAJAJ)
              const catUpper = String(bankCategory || '').toUpperCase();
              let bajajMult = 16;
              if (catUpper.includes('SUPER') || catUpper.includes('DIAMOND') || catUpper.includes('SUPER GREEN')) {
                bajajMult = income < 50000 ? 18 : (income < 75000 ? 20 : (income <= 200000 ? 22 : 24));
              } else if (catUpper === 'A' || catUpper.includes('GOVT') || catUpper.includes('GREEN')) {
                bajajMult = income < 50000 ? 16 : (income < 75000 ? 16 : (income <= 200000 ? 22 : 24));
              } else if (catUpper === 'B' || catUpper.includes('AMBAR')) {
                bajajMult = income < 50000 ? 12 : (income < 75000 ? 12 : 16);
              } else if (catUpper === 'C' || catUpper.includes('RED')) {
                bajajMult = 10;
              } else {
                // Dark Red / D / Unlisted
                const isUnlisted = String(calculatorInput.companyType || '').toLowerCase() === 'unlisted' || catUpper === 'UNLISTED';
                bajajMult = isUnlisted ? 12 : 14;
              }

              // If configured/edited in Admin Policy Manager:
              if (matchedFoir && (matchedFoir.multBelow50k !== undefined || matchedFoir.mult50kTo75k !== undefined)) {
                if (income < 50000) bajajMult = Number(matchedFoir.multBelow50k ?? bajajMult);
                else if (income < 75000) bajajMult = Number(matchedFoir.mult50kTo75k ?? bajajMult);
                else if (income <= 200000) bajajMult = Number(matchedFoir.mult75kTo2L ?? bajajMult);
                else bajajMult = Number(matchedFoir.multAbove2L ?? bajajMult);
              }

              bankInput.multiplierOverride = bajajMult;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name.toLowerCase().includes('bandhan') || id === 'bandhan') {
              // Bandhan Bank Excel Policy (Sheet: BANDHAN BANK)
              // Section 2: FOIR Slabs by Salary: <=30k: 50%, 30k-50k: 60%, 50k-75k: 65%, >75k: 70%
              if (Array.isArray(matchedPolicy?.salaryFoirSlabs) && matchedPolicy.salaryFoirSlabs.length > 0) {
                bankInput.salaryFoirSlabs = matchedPolicy.salaryFoirSlabs;
              }
              if (matchedPolicy?.multiplierMatrix) {
                bankInput.multiplierMatrix = matchedPolicy.multiplierMatrix;
              }

              let bFoir = 50;
              if (income >= 75001) bFoir = 70;
              else if (income >= 50001) bFoir = 65;
              else if (income >= 30001) bFoir = 60;
              else bFoir = 50;
              if (!bankInput.salaryFoirSlabs) bankInput.foirOverride = bFoir;

              // Section 6: Multiplier from Tenure and Income Matrix
              const catUpper = String(bankCategory || '').toUpperCase();
              const reqTenureMonths = calculatorInput.loanTenure ? (calculatorInput.loanTenure * 12) : 60;
              let tenureBucket = 60;
              if (reqTenureMonths <= 12) tenureBucket = 12;
              else if (reqTenureMonths <= 24) tenureBucket = 24;
              else if (reqTenureMonths <= 36) tenureBucket = 36;
              else if (reqTenureMonths <= 48) tenureBucket = 48;
              else tenureBucket = 60;

              let bMult = 20;
              if (catUpper === 'C') {
                if (income > 75000) {
                  bMult = tenureBucket === 12 ? 9 : (tenureBucket === 24 ? 11 : (tenureBucket === 36 ? 17 : (tenureBucket === 48 ? 18 : 22)));
                } else if (income >= 50001) {
                  bMult = tenureBucket === 12 ? 7 : (tenureBucket === 24 ? 10 : (tenureBucket === 36 ? 16 : (tenureBucket === 48 ? 17 : 18)));
                } else if (income >= 30001) {
                  bMult = tenureBucket === 12 ? 7 : (tenureBucket === 24 ? 9 : (tenureBucket === 36 ? 12 : 14)); // 60M is NA
                } else {
                  bMult = tenureBucket === 12 ? 5 : (tenureBucket === 24 ? 7 : (tenureBucket === 36 ? 10 : 12)); // 60M is NA
                }
              } else if (catUpper === 'D') {
                if (income > 75000) {
                  bMult = tenureBucket === 12 ? 9 : (tenureBucket === 24 ? 11 : (tenureBucket === 36 ? 17 : 18)); // 60M is NA (Max 48M)
                } else if (income >= 50001) {
                  bMult = tenureBucket === 12 ? 7 : (tenureBucket === 24 ? 10 : (tenureBucket === 36 ? 16 : 17)); // 60M is NA (Max 48M)
                } else if (income >= 30001) {
                  bMult = tenureBucket === 12 ? 7 : (tenureBucket === 24 ? 9 : (tenureBucket === 36 ? 12 : 14)); // 60M is NA (Max 48M)
                } else {
                  bMult = tenureBucket === 12 ? 5 : (tenureBucket === 24 ? 7 : (tenureBucket === 36 ? 10 : 12)); // 60M is NA (Max 48M)
                }
              } else {
                // Super A, A, B, Govt
                if (income > 75000) {
                  bMult = tenureBucket === 12 ? 9 : (tenureBucket === 24 ? 14 : (tenureBucket === 36 ? 18 : (tenureBucket === 48 ? 23 : 25)));
                } else if (income >= 50001) {
                  bMult = tenureBucket === 12 ? 8 : (tenureBucket === 24 ? 13 : (tenureBucket === 36 ? 16 : (tenureBucket === 48 ? 22 : 24)));
                } else if (income >= 30001) {
                  bMult = tenureBucket === 12 ? 7 : (tenureBucket === 24 ? 13 : (tenureBucket === 36 ? 15 : (tenureBucket === 48 ? 21 : 22)));
                } else {
                  bMult = tenureBucket === 12 ? 6 : (tenureBucket === 24 ? 10 : (tenureBucket === 36 ? 14 : (tenureBucket === 48 ? 17 : 20)));
                }
              }
              
              if (!bankInput.multiplierMatrix && !calculatorInput.multiplierOverride) {
                bankInput.multiplierOverride = bMult;
              }

              // CC Obligation: 3% fixed across all categories (0% if CC limit < 3x monthly salary)
              const ccLimit = calculatorInput.totalCreditCardLimit || 0;
              if (ccLimit > 0 && ccLimit < (income * 3)) {
                bankInput.ccObligationPercentOverride = 0;
              } else {
                bankInput.ccObligationPercentOverride = 3;
              }
            } else if (name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au') {
              // AU Small Finance Bank Excel Policy (Sheet: AU BANK - Section 4)
              const catUpper = String(bankCategory || '').toUpperCase();
              const isPriority1 = catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'B' || catUpper === 'GOVT' || catUpper === 'D';
              let auFoir = 60;
              let auMult = 18;
              if (income >= 100000) {
                auFoir = isPriority1 ? 75 : 70;
                auMult = isPriority1 ? 24 : 20;
              } else if (income >= 75000) {
                auFoir = isPriority1 ? 70 : 65;
                auMult = isPriority1 ? 22 : 18;
              } else if (income >= 50000) {
                auFoir = isPriority1 ? 65 : 60;
                auMult = isPriority1 ? 20 : 15;
              } else {
                auFoir = isPriority1 ? 60 : 50;
                auMult = isPriority1 ? 18 : 11;
              }
              bankInput.foirOverride = auFoir;
              bankInput.multiplierOverride = auMult;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if ((name.toLowerCase().includes('axis') && name.toLowerCase().includes('fin')) || id === 'axis' || id === 'axis_fin') {
              // Axis Finance Excel Policy (Sheet: AXIS FINANCE)
              // Excel note: "COM CAT NOT REQ FOR FOIR AND MULTIPLIER" (FOIR is category-based, Multiplier is salary-based)
              const catUpper = String(bankCategory || '').toUpperCase();
              let axFoir = 60;
              if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') {
                axFoir = 70;
              } else if (catUpper === 'B') {
                axFoir = 65;
              } else if (catUpper === 'C') {
                axFoir = 60;
              } else {
                // Cat D: 50% FOIR (deviation), NO Multiplier
                axFoir = 50;
              }

              let axMult = null;
              if (catUpper !== 'D') {
                if (income > 100000) axMult = 30;
                else if (income >= 75000) axMult = 28;
                else if (income >= 50000) axMult = 26;
                else axMult = 24;
              }

              bankInput.foirOverride = axFoir;
              bankInput.multiplierOverride = axMult;
              if (axMult === null) {
                bankInput.isFoirOnly = true;
              }
              bankInput.ccObligationPercentOverride = 5;
            } else if (name.toLowerCase().includes('poonawala') || name.toLowerCase().includes('poonawalla') || id === 'poonawala') {
              // Poonawalla Fincorp Excel Policy (Sheet: POONAWALA - Section 5 Rows 77-82)
              // Pure FOIR Calculation (No multiplier in Excel policy)
              const catUpper = String(bankCategory || '').toUpperCase();
              const isCatA = catUpper.includes('SUPER') || catUpper === 'A';
              const isCatBGovt = catUpper === 'B' || catUpper === 'GOVT';

              let pFoir = 50;
              if (income > 250000) {
                pFoir = isCatA ? 75 : (isCatBGovt ? 70 : 65);
              } else if (income > 150000) {
                pFoir = isCatA ? 75 : (isCatBGovt ? 70 : 60);
              } else if (income > 75000) {
                pFoir = isCatA ? 70 : (isCatBGovt ? 65 : 55);
              } else if (income > 50000) {
                pFoir = isCatA ? 65 : (isCatBGovt ? 60 : 55);
              } else {
                // 30k to 50k
                pFoir = isCatA ? 60 : 50;
              }

              bankInput.foirOverride = pFoir;
              bankInput.isFoirOnly = true;
              bankInput.multiplierOverride = null;
              bankInput.ccObligationPercentOverride = 5;
            } else if (name.toLowerCase().includes('chola') || id === 'chola') {
              // Chola Finance Excel Policy (Sheet: CHOLA - Section 3)
              const catUpper = String(bankCategory || '').toUpperCase();
              let cholaFoir = 70;
              let cholaMult = 28;

              if (catUpper.includes('SUPER') || catUpper === 'GOVT') {
                if (income >= 30000) {
                  cholaFoir = matchedFoir.slab2Foir || matchedFoir.maxFoir || 70;
                  cholaMult = matchedFoir.multiplier || 35;
                } else {
                  cholaFoir = matchedFoir.slab1Foir || 65;
                  cholaMult = matchedFoir.multiplierSlab1 || 30;
                }
              } else if (catUpper === 'A' || catUpper === 'B') {
                if (income >= 30000) {
                  cholaFoir = matchedFoir.slab2Foir || matchedFoir.maxFoir || 70;
                  cholaMult = matchedFoir.multiplier || 28;
                } else {
                  cholaFoir = matchedFoir.slab1Foir || 65;
                  cholaMult = matchedFoir.multiplierSlab1 || 24;
                }
              } else {
                // Categories C and D
                if (income >= 30000) {
                  cholaFoir = matchedFoir.slab2Foir || matchedFoir.maxFoir || 65;
                  cholaMult = matchedFoir.multiplier || 25;
                } else {
                  cholaFoir = matchedFoir.slab1Foir || 55;
                  cholaMult = matchedFoir.multiplierSlab1 || 20;
                }
              }

              bankInput.foirOverride = cholaFoir;
              bankInput.multiplierOverride = cholaMult;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name.toLowerCase().includes('idfc') || id === 'idfc') {
              // IDFC First Bank Excel Policy
              const catUpper = String(bankCategory || '').toUpperCase();
              let idfcMult = 23;
              if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') {
                idfcMult = income > 75000 ? 27 : (income >= 50000 ? 25 : 23);
              } else if (catUpper === 'B') {
                idfcMult = income > 75000 ? 22 : (income >= 50000 ? 20 : 16);
              } else {
                idfcMult = income > 75000 ? 15 : (income >= 50000 ? 13 : 11);
              }
              let idfcFoir = income > 75000 ? 70 : (income >= 50000 ? 65 : 60);
              bankInput.foirOverride = idfcFoir;
              bankInput.multiplierOverride = idfcMult;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name.toLowerCase().includes('incred') || id === 'incred') {
              // Incred Finance Excel Policy
              let incFoir = 40;
              if (income > 40000) incFoir = 65;
              else if (income >= 30000) incFoir = 60;
              else if (income >= 20000) incFoir = 50;
              else incFoir = 40;
              bankInput.foirOverride = incFoir + 5; // +5% for account aggregator
              bankInput.multiplierOverride = matchedFoir.multiplier || 22;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name.toLowerCase().includes('aditya') || name.toLowerCase().includes('abfl') || id === 'abfl') {
              // Aditya Birla Finance Excel Policy (Sheet: ABFL - Section 2 FOIR Rows 15-21)
              const hasHlOrLap = (calculatorInput.existingLoanTypes && 
                (calculatorInput.existingLoanTypes.includes('Home Loan') || 
                 calculatorInput.existingLoanTypes.includes('Loan Against Property') ||
                 calculatorInput.existingLoanTypes.includes('HL') ||
                 calculatorInput.existingLoanTypes.includes('LAP'))) ||
                (Array.isArray(calculatorInput.loansForBT) && 
                 calculatorInput.loansForBT.some(l => l.type === 'Home Loan' || l.type === 'LAP'));

              let abflFoir = 50;
              if (income > 100000) {
                abflFoir = hasHlOrLap ? 75 : 70;
              } else if (income >= 50000) {
                abflFoir = hasHlOrLap ? 70 : 65;
              } else if (income >= 25000) {
                abflFoir = 60;
              } else {
                abflFoir = 50;
              }

              const catUpper = String(bankCategory || '').toUpperCase();
              let abflMult = 26;
              if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') {
                abflMult = income > 100000 ? 28 : 26;
              } else if (catUpper === 'B') {
                abflMult = income > 100000 ? 24 : 22;
              } else if (catUpper === 'C') {
                abflMult = 18;
              } else if (catUpper === 'D') {
                abflMult = 15;
              } else {
                abflMult = 12;
              }

              bankInput.foirOverride = abflFoir;
              bankInput.multiplierOverride = abflMult;
              bankInput.ccObligationPercentOverride = 5;
            } else if (name.toLowerCase().includes('icici') || id === 'icici') {
              // ICICI Bank Master Excel Policy
              // FOIR: 45% to 65% (HL RUNNING - 70%) | Open Market: 45% to 55%
              const hasLiveHl = (calculatorInput.existingLoanTypes && (calculatorInput.existingLoanTypes.includes('Home Loan') || calculatorInput.existingLoanTypes.includes('HL'))) ||
                (Array.isArray(calculatorInput.loansForBT) && calculatorInput.loansForBT.some(l => l.type === 'Home Loan'));
              const catUpper = String(bankCategory || '').toUpperCase();
              let iciciFoir = 65;
              if (catUpper.includes('OPEN') || catUpper === 'C' || catUpper === 'D' || catUpper.includes('UNLISTED')) {
                iciciFoir = income >= 50000 ? 55 : 45;
              } else {
                if (hasLiveHl) {
                  iciciFoir = 70; // Excel Policy: HL RUNING - 70%
                } else if (income >= 50000) {
                  iciciFoir = 65;
                } else if (income >= 30000) {
                  iciciFoir = 55;
                } else {
                  iciciFoir = 45;
                }
              }
              bankInput.foirOverride = iciciFoir;
              bankInput.multiplierOverride = matchedFoir.multiplier || (catUpper.includes('OPEN') ? 20 : 27);
              bankInput.ccObligationPercentOverride = 5;
            } else if (name.toLowerCase().includes('l&t') || name.toLowerCase().includes('lnt') || id === 'lnt') {
              // L&T Finance Policy from Bank Policy Excel (BANKS POLICYS.xlsx - Sheet: LNT) (CIBIL 720+)
              // Salary Slabs: 2L+ Salary, 1L to 2L, 50k to 1L, 25k to 50k
              const catUpper = String(bankCategory || '').toUpperCase();
              let lntFoir = 55;
              let lntMult = 18;

              if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'B' || catUpper.includes('GOVT')) {
                if (income >= 200000) {
                  lntFoir = 80;
                  lntMult = 24;
                } else if (income >= 100000) {
                  lntFoir = 75;
                  lntMult = 24;
                } else if (income >= 50000) {
                  lntFoir = 70;
                  lntMult = 20;
                } else {
                  lntFoir = 55;
                  lntMult = 18;
                }
              } else if (catUpper === 'C') {
                if (income >= 200000) {
                  lntFoir = 75;
                  lntMult = 20;
                } else if (income >= 100000) {
                  lntFoir = 70;
                  lntMult = 20;
                } else if (income >= 50000) {
                  lntFoir = 60;
                  lntMult = 18;
                } else {
                  lntFoir = 50;
                  lntMult = 16;
                }
              } else {
                // Category D
                if (income >= 200000) {
                  lntFoir = 70;
                  lntMult = 16;
                } else if (income >= 100000) {
                  lntFoir = 65;
                  lntMult = 16;
                } else if (income >= 50000) {
                  lntFoir = 55;
                  lntMult = 15;
                } else {
                  lntFoir = 50;
                  lntMult = 14;
                }
              }

              bankInput.foirOverride = lntFoir;
              bankInput.multiplierOverride = lntMult;
              bankInput.ccObligationPercentOverride = 5;
            } else if (name.toLowerCase().includes('smfg') || id === 'smfg') {
              // SMFG India Credit Master Excel Policy (BANKS POLICYS.xlsx - Sheet: SMFG)
              // 25k-30k: 60% FOIR (12-13x) | 30k-35k: 65% FOIR (15-16x) | 35k-40k: 70% (16-18x)
              // 40k-50k: 70% (18-20x) | 50k-75k: 70% (22-25x) | 75k-100k: 70% (23-30x) | 100k+: 70% (30x)
              // Multipliers scaled as per Category and Profile Base (Row 37: AS PER COM CAT AND PROFILE BASE)
              const catUpper = String(bankCategory || '').toUpperCase();
              const isHighTier = catUpper.includes('SUPER') || catUpper === 'A' || catUpper.includes('GOVT');
              const isMidTier = catUpper === 'B';

              let smfgFoir = 70;
              let smfgMult = isHighTier ? 30 : (isMidTier ? 26 : 23);
              if (income >= 100000) {
                smfgFoir = 70;
                smfgMult = isHighTier ? 30 : (isMidTier ? 26 : 23);
              } else if (income >= 75000) {
                smfgFoir = 70;
                smfgMult = isHighTier ? 30 : (isMidTier ? 26 : 23);
              } else if (income >= 50000) {
                smfgFoir = 70;
                smfgMult = isHighTier ? 25 : (isMidTier ? 23.5 : 22);
              } else if (income >= 40000) {
                smfgFoir = 70;
                smfgMult = isHighTier ? 20 : (isMidTier ? 19 : 18);
              } else if (income >= 35000) {
                smfgFoir = 70;
                smfgMult = isHighTier ? 18 : (isMidTier ? 17 : 16);
              } else if (income >= 30000) {
                smfgFoir = 65;
                smfgMult = isHighTier ? 16 : (isMidTier ? 15.5 : 15);
              } else if (income >= 25000) {
                smfgFoir = 60;
                smfgMult = isHighTier ? 13 : (isMidTier ? 12.5 : 12);
              }

              // Special Company Type Check (Excel: PROP/PART/LLP FIRM: 55% FOIR)
              const compType = String(calculatorInput.companyType || calculatorInput.companyName || '').toUpperCase();
              if (compType.includes('PROP') || compType.includes('PARTNERSHIP') || compType.includes('LLP') || compType.includes('PARTNER')) {
                smfgFoir = Math.min(smfgFoir, 55);
              }

              bankInput.foirOverride = smfgFoir;
              bankInput.multiplierOverride = smfgMult;
              bankInput.ccObligationPercentOverride = 5;
            } else if (name.toLowerCase().includes('finnable') || id === 'finnable') {
              // Finnable Finance Excel Policy (Sheet: FINNABLE)
              const catUpper = String(bankCategory || '').toUpperCase();
              let foirPct = 60;
              let mult = 18;
              if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') {
                foirPct = income >= 40000 ? 65 : (income >= 25000 ? 60 : 50);
                mult = 20;
              } else if (catUpper === 'B') {
                foirPct = income >= 40000 ? 60 : (income >= 25000 ? 55 : 45);
                mult = 18;
              } else if (catUpper === 'C') {
                foirPct = income >= 40000 ? 55 : (income >= 25000 ? 50 : 40);
                mult = 15;
              } else {
                // Cat D
                foirPct = income >= 40000 ? 50 : (income >= 25000 ? 45 : 40);
                mult = 12;
              }
              bankInput.foirOverride = foirPct;
              bankInput.multiplierOverride = mult;
              bankInput.ccObligationPercentOverride = 5;
            } else {
              // Standard Bank FOIR logic
              if (matchedFoir.multiplier) bankInput.multiplierOverride = Number(matchedFoir.multiplier);
              let foirPct = matchedFoir.maxFoir || 75;
              if (matchedFoir.slab1Foir && income >= 25000 && income < 35000) {
                foirPct = matchedFoir.slab1Foir;
              } else if (matchedFoir.slab2Foir && income >= 35000 && income < 40000) {
                foirPct = matchedFoir.slab2Foir;
              } else if (matchedFoir.maxFoir && income >= 40000) {
                foirPct = matchedFoir.maxFoir;
              }
              bankInput.foirOverride = Number(foirPct);
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            }
          }
        }

        // 4. Dynamic Tenure match (Tab 3 in Admin)
        if (Array.isArray(uPolicy.tenureRules)) {
          const matchedTenure = uPolicy.tenureRules.find(t => matchCategory(t.category, bankCategory));
          if (matchedTenure && matchedTenure.maxMonths) {
            let maxM = Number(matchedTenure.maxMonths);
            const isCibilMinusOne = calculatorInput.creditScore === -1 || 
                                    calculatorInput.creditScore === '-1' || 
                                    calculatorInput.cibilScore === -1 || 
                                    calculatorInput.cibilScore === '-1';
            const isIndusind = name === 'IndusInd Bank' || id === 'indusind';
            if (isIndusind && isCibilMinusOne) {
              maxM = Math.min(maxM, 48); // Excel Policy: CIBIL -1 H TO 48 TENURE
            }
            // Finnable CIBIL -1 capped to 36 months
            if ((name.toLowerCase().includes('finnable') || id === 'finnable') && isCibilMinusOne) {
              maxM = Math.min(maxM, 36);
            }
            // Bajaj ₹1L+ salary: up to 108 months
            const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
            if ((name.toLowerCase().includes('bajaj') || id === 'bajaj') && income >= 100000) {
              maxM = Math.max(maxM, 108);
            }
            bankInput.maxTenureOverride = maxM;
          }
        }
      } else if (adminAllConfig.interestRates && !govtPolicy) {
        const catRate = adminAllConfig.interestRates.categoryRates?.[bankCategory] || adminAllConfig.interestRates.defaultRate;
        if (catRate) bankInput.interestRateOverride = catRate;
      }

      // 🌉 INJECT INCENTIVE OVERRIDES
      if (adminAllConfig.incentivePolicy) {
        if (adminAllConfig.incentivePolicy.percentage !== undefined) {
          bankInput.incentivePercentageOverride = adminAllConfig.incentivePolicy.percentage / 100;
        }
        if (adminAllConfig.incentivePolicy.months !== undefined) {
          bankInput.incentiveMonthsOverride = adminAllConfig.incentivePolicy.months;
        }
      }

      // 👨 INJECT DYNAMIC BACHELOR CAPPING OVERRIDES
      // Only apply if the bank's policy specifies bachelor capping (AU Small Finance Bank)
      const bankHasBachelorCap = (name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au');
      if (bankHasBachelorCap && adminAllConfig.bachelorCapping?.enabled && adminAllConfig.bachelorCapping?.limits) {
        if (calculatorInput.maritalStatus === 'single' && calculatorInput.livingStatus === 'rented') {
          const rentedLimit = adminAllConfig.bachelorCapping.limits['rented_bachelor'] || 500000;
          bankInput.dynamicBachelorLimitOverride = rentedLimit;
          bankInput.dynamicBachelorCapReason = 'AU Bank PG/Rented Bachelor Policy Cap (Max ₹5 Lakhs)';
        }
      }


      // Execute base calculator
      const result = calculator(bankInput);

      // 🚀 ENFORCE AND RECALCULATE DYNAMIC ADMIN POLICY PARAMETERS (FOIR, Multiplier, Rate, Tenures)
      if (result && result.eligible) {
        const effectiveFOIR = bankInput.foirOverride 
          ? (Number(bankInput.foirOverride) / 100) 
          : (typeof result.foirPercentage === 'number' ? result.foirPercentage : 0.60);

        const effectiveMultiplier = bankInput.multiplierOverride 
          ? Number(bankInput.multiplierOverride) 
          : (result.multiplier || 20);

        const effectiveRate = bankInput.interestRateOverride 
          ? Number(bankInput.interestRateOverride) 
          : (result.interestRate || 11.0);

        const monthlyIncome = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;

        // Tenure calculations
        let tenureMonths = calculatorInput.loanTenure ? (calculatorInput.loanTenure * 12) : 60;
        if (bankInput.maxTenureOverride) {
          tenureMonths = Math.min(tenureMonths, Number(bankInput.maxTenureOverride));
        } else if (result.loanTenureMonths) {
          tenureMonths = Math.min(tenureMonths, result.loanTenureMonths);
        }

        // Tata Capital Excel Policy: Min 24 months, Max 72 or 84 months (Cat B > 75k Sal: 84)
        if (isTataInst) {
          tenureMonths = Math.max(24, tenureMonths);
          const catUpper = String(bankCategory || '').toUpperCase();
          if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT' || (catUpper === 'B' && monthlyIncome > 75000)) {
            tenureMonths = Math.min(tenureMonths, 84);
          } else if (catUpper === 'B') {
            tenureMonths = Math.min(tenureMonths, 72);
          } else {
            tenureMonths = Math.min(tenureMonths, 60);
          }
        }
        // Axis Finance Excel Policy: Max 84/72/60 Months (Super A/Govt: 84, Cat A: 72, Cat B: 72, Cat C/D: 60)
        if (isAxisFinInst) {
          tenureMonths = Math.max(12, tenureMonths);
          const catUpper = String(bankCategory || '').toUpperCase();
          if (catUpper.includes('SUPER') || catUpper === 'GOVT') {
            tenureMonths = Math.min(tenureMonths, 84);
          } else if (catUpper === 'A' || catUpper === 'B') {
            tenureMonths = Math.min(tenureMonths, 72);
          } else {
            tenureMonths = Math.min(tenureMonths, 60);
          }
        }
        // Poonawalla Fincorp Excel Policy: 12 to 84 Months (Cat A/Govt: 84M, Cat B, C, D: 72M)
        if (isPoonawalaInst) {
          tenureMonths = Math.max(12, tenureMonths);
          const catUpper = String(bankCategory || '').toUpperCase();
          if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') {
            tenureMonths = Math.min(tenureMonths, 84);
          } else {
            tenureMonths = Math.min(tenureMonths, 72);
          }
        }
        // Aditya Birla Finance Excel Policy: 12 to 84 Months (Cat C: 72M, Cat D: 60M)
        if (isAbflInst) {
          tenureMonths = Math.max(12, tenureMonths);
          const catUpper = String(bankCategory || '').toUpperCase();
          if (catUpper === 'D') {
            tenureMonths = Math.min(tenureMonths, 60);
          } else if (catUpper === 'C') {
            tenureMonths = Math.min(tenureMonths, 72);
          } else {
            tenureMonths = Math.min(tenureMonths, 84);
          }
        }
        // Finnable Finance Excel Policy: 6 to 60 Months (NTC capped to 36 Months)
        if (isFinnableInst) {
          tenureMonths = Math.max(6, Math.min(tenureMonths, 60));
          if (isNtc) {
            tenureMonths = Math.min(tenureMonths, 36);
          }
        }

        // IndusInd Bank & Finnable Excel Policy: CIBIL = -1 (New to Credit) tenure capping
        if ((name === 'IndusInd Bank' || id === 'indusind') && isNtc) {
          tenureMonths = Math.min(tenureMonths, 48); // IndusInd -1 capped to 48 months
        }
        if ((name.toLowerCase().includes('finnable') || id === 'finnable') && isNtc) {
          tenureMonths = Math.min(tenureMonths, 36); // Finnable -1 capped to 36 months
        }
        // Bajaj Finance Excel Policy: 108 Months for ₹1L+ Salary, else 96 Months
        if (name.toLowerCase().includes('bajaj') || id === 'bajaj') {
          const maxBajajTenure = monthlyIncome >= 100000 ? 108 : 96;
          tenureMonths = Math.min(tenureMonths, maxBajajTenure);
        }
        // AU Small Finance Bank Excel Policy: Max 60 Months (5 Years)
        if (name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au') {
          tenureMonths = Math.min(tenureMonths, 60);
        }
        const tenureYears = tenureMonths / 12;

        let bankExistingEMI = calculatorInput.existingEMI || 0;
        // Axis Finance special obligation handling for Gold Loan & KCC
        if (isAxisFinInst && Array.isArray(calculatorInput.existingLoans) && calculatorInput.existingLoans.length > 0) {
          let customEmi = 0;
          for (const loan of calculatorInput.existingLoans) {
            const loanType = String(loan.type || loan.loanType || '').toLowerCase();
            const pos = Number(loan.outstandingAmount || loan.pos || 0);
            const emi = Number(loan.monthlyEMI || loan.emi || 0);
            if (loanType.includes('gold')) {
              customEmi += Math.round(pos * 0.01); // Gold loan obligation: 1% of POS
            } else if (loanType.includes('kcc') || loanType.includes('kisan')) {
              if (pos > 1500000) customEmi += emi; // KCC up to 15L is 0 obligation
            } else {
              customEmi += emi;
            }
          }
          bankExistingEMI = customEmi;
        } else if (isAbflInst && Array.isArray(calculatorInput.existingLoans) && calculatorInput.existingLoans.length > 0) {
          // ABFL Excel Policy: "KKC NOT OBLIGATE" (KCC obligation is 0)
          let customEmi = 0;
          for (const loan of calculatorInput.existingLoans) {
            const loanType = String(loan.type || loan.loanType || '').toLowerCase();
            const emi = Number(loan.monthlyEMI || loan.emi || 0);
            if (loanType.includes('kcc') || loanType.includes('kisan')) {
              // KCC is not obligated as per ABFL policy
            } else {
              customEmi += emi;
            }
          }
          bankExistingEMI = customEmi;
        } else if (isFinnableInst && Array.isArray(calculatorInput.existingLoans) && calculatorInput.existingLoans.length > 0) {
          // Finnable Excel Policy: CC - 5% / GOLD LOAN - 5% / KCC - 5%
          let customEmi = 0;
          for (const loan of calculatorInput.existingLoans) {
            const loanType = String(loan.type || loan.loanType || '').toLowerCase();
            const pos = Number(loan.outstandingAmount || loan.pos || 0);
            const emi = Number(loan.monthlyEMI || loan.emi || 0);
            if (loanType.includes('gold') || loanType.includes('kcc') || loanType.includes('kisan')) {
              customEmi += emi > 0 ? emi : Math.round(pos * 0.05);
            } else {
              customEmi += emi;
            }
          }
          bankExistingEMI = customEmi;
        }

        const totalObligations = bankExistingEMI + (bankInput.creditCardObligation || 0);

        // FOIR calculations
        const foirCap = calculatorInput.isBTMode 
          ? (calculatorInput.adjustedIncome || monthlyIncome) * effectiveFOIR 
          : (monthlyIncome * effectiveFOIR);
        
        const availableEMI = calculatorInput.isBTMode 
          ? foirCap 
          : (foirCap - totalObligations);

        if (availableEMI <= 0 && !calculatorInput.isBTMode) {
          return {
            bankName: name,
            eligible: false,
            reason: `Existing EMI (₹${totalObligations.toLocaleString()}) exceeds ${(effectiveFOIR * 100).toFixed(0)}% FOIR limit of ₹${Math.round(foirCap).toLocaleString()}`,
            category: bankCategory
          };
        }

        // -------------------------------------------------------------
        // STEP 1: CALCULATE MAXIMUM ELIGIBLE CAPACITY (Independent of customer request)
        // -------------------------------------------------------------
        // Multiplier capacity (Poonawalla & Axis Finance Cat D are FOIR-only):
        const availableSalary = calculatorInput.isBTMode ? monthlyIncome : (monthlyIncome - totalObligations);
        const isFoirOnlyBank = bankInput.isFoirOnly || (bankInput.multiplierOverride === null && bankInput.multiplierOverride !== 0);
        const multiplierLoanAmount = isFoirOnlyBank
          ? Infinity
          : (availableSalary * effectiveMultiplier);

        // Base FOIR loan capacity using provisional effectiveRate:
        let provisionalFoirLoanAmount = calculateLoanAmountFromEMI(availableEMI, effectiveRate, tenureYears);

        // Sanction & bachelor limits:
        let maxLoanCap = bankInput.maxLoanOverride || result.maxLoanCap || 5000000;

        // Poonawalla Fincorp Excel Policy Cappings (Sheet: POONAWALA):
        if (isPoonawalaInst) {
          const rawCityTier = getCityTier(calculatorInput.city, calculatorInput.state);
          const cityTierNorm = String(rawCityTier || '').toUpperCase().trim();
          let cityCap = 2500000;
          if (cityTierNorm === 'METRO' || cityTierNorm.includes('METRO')) cityCap = 6000000;
          else if (cityTierNorm === 'TIER 1' || cityTierNorm.includes('TIER 1')) cityCap = 5000000;
          else if (cityTierNorm === 'TIER 2' || cityTierNorm.includes('TIER 2')) cityCap = 4000000;

          const catUpper = String(bankCategory || '').toUpperCase();
          let catCap = 3000000;
          if (catUpper.includes('SUPER') || catUpper === 'A') catCap = 6000000;
          else if (catUpper === 'B' || catUpper === 'GOVT') catCap = 4000000;
          else if (catUpper === 'C') catCap = 3000000;
          else if (catUpper === 'D') catCap = 1000000;

          maxLoanCap = Math.min(maxLoanCap, cityCap, catCap);
        }

        // Tata Capital Excel Policy Cappings (Sheet: TATA):
        if (isTataInst) {
          const catUpper = String(bankCategory || '').toUpperCase();
          let tataCap = 2500000;
          if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') {
            tataCap = 5000000;
          } else if (catUpper === 'B' || catUpper === 'C') {
            tataCap = 2500000;
          } else if (catUpper === 'D') {
            tataCap = 1000000;
          }
          maxLoanCap = Math.min(maxLoanCap, tataCap);
        }

        // Axis Finance Excel Policy Cappings (Sheet: AXIS FINANCE):
        if (isAxisFinInst) {
          const catUpper = String(bankCategory || '').toUpperCase();
          let axisCap = 2000000;
          if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') {
            axisCap = 5000000;
          } else if (catUpper === 'B') {
            axisCap = 2500000;
          } else if (catUpper === 'C') {
            axisCap = 2000000;
          } else if (catUpper === 'D') {
            axisCap = 1000000;
          }
          maxLoanCap = Math.min(maxLoanCap, axisCap);
        }
        
        // AU Small Finance Bank Excel Policy Cappings (Sheet: AU BANK):
        if (name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au') {
          maxLoanCap = Math.min(maxLoanCap, 1500000); // Excel: 15 lac overall capping
          if (isNtc) {
            maxLoanCap = Math.min(maxLoanCap, 300000); // Excel: NTC (-1) 3 lac
          }
          const catUpper = String(bankCategory || '').toUpperCase();
          const isPriority1 = catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'B' || catUpper === 'GOVT' || catUpper === 'D';
          // Exposure Capping from Section 4:
          if (monthlyIncome < 50000) {
            maxLoanCap = Math.min(maxLoanCap, 500000); // 5 Lac for <50k
          } else if (!isPriority1) {
            if (monthlyIncome < 75000) maxLoanCap = Math.min(maxLoanCap, 750000); // 7.5 Lac
            else maxLoanCap = Math.min(maxLoanCap, 1000000); // 10 Lac
          }
          // Thin Cibil Cat C/ Others 7.5 lac
          const numCibil = rawCibil !== null && rawCibil !== undefined && rawCibil !== '' ? Number(rawCibil) : 750;
          if (!isPriority1 && numCibil < 700) {
            maxLoanCap = Math.min(maxLoanCap, 750000);
          }
        }

        // Bajaj Finance Excel Policy Cappings (Sheet: BAJAJ):
        if (name.toLowerCase().includes('bajaj') || id === 'bajaj') {
          maxLoanCap = Math.min(maxLoanCap, 5000000); // 50LAC
          const compType = String(calculatorInput.companyType || '').toLowerCase();
          const catUpper = String(bankCategory || '').toUpperCase();
          if (compType === 'unlisted' || catUpper === 'UNLISTED') {
            maxLoanCap = Math.min(maxLoanCap, 2800000); // UNLISTED M 28LAC
          }
        }

        // Aditya Birla Finance Ltd (ABFL) Excel Policy Cappings (Sheet: ABFL):
        // Standard max: 50 Lakhs (Super A / A: up to 65 Lakhs if CIBIL >= 755 & Ever HL & Income >= 2.5L)
        // Cat B: 40L, Cat C: 35L, Cat D: 25L, NC: 8L
        if (isAbflInst) {
          const catStr = String(bankCategory || '').toUpperCase().trim();
          const isSuperOrA = catStr.includes('SUPER') || catStr === 'A' || catStr === 'CAT A' || catStr === 'CATEGORY A' || catStr.includes('GOVT');
          const isB = catStr === 'B' || catStr === 'CAT B' || catStr === 'CATEGORY B';
          const isC = catStr === 'C' || catStr === 'CAT C' || catStr === 'CATEGORY C';
          const isD = catStr === 'D' || catStr === 'CAT D' || catStr === 'CATEGORY D';

          const numCibil = rawCibil !== null && rawCibil !== undefined && rawCibil !== '' ? Number(rawCibil) : 750;
          const hasEverHl = Boolean(calculatorInput.hasEverHomeLoan) || (Array.isArray(calculatorInput.existingLoanTypes) && 
            (calculatorInput.existingLoanTypes.includes('Home Loan') || 
             calculatorInput.existingLoanTypes.includes('Loan Against Property') ||
             calculatorInput.existingLoanTypes.includes('HL') ||
             calculatorInput.existingLoanTypes.includes('LAP'))) ||
            (Array.isArray(calculatorInput.loansForBT) && 
             calculatorInput.loansForBT.some(l => l.type === 'Home Loan' || l.type === 'LAP'));
          
          let abflCap = 5000000;
          if (isSuperOrA) {
            if (numCibil >= 755 && hasEverHl && monthlyIncome >= 250000) {
              abflCap = 6500000;
            } else {
              abflCap = 5000000;
            }
          } else if (isB) {
            abflCap = 4000000;
          } else if (isC) {
            abflCap = 3500000;
          } else if (isD) {
            abflCap = 2500000;
          } else {
            abflCap = 800000;
          }
          maxLoanCap = abflCap;
        }

        // Finnable Finance Excel Policy Cappings (Sheet: FINNABLE):
        // Max loan: 10 Lakhs (NTC -1: 4 Lakhs; Cat C: 8 Lakhs; Cat D: 5 Lakhs)
        if (isFinnableInst) {
          const catStr = String(bankCategory || '').toUpperCase().trim();
          const isC = catStr === 'C' || catStr === 'CAT C' || catStr === 'CATEGORY C';
          const isD = catStr === 'D' || catStr === 'CAT D' || catStr === 'CATEGORY D';
          let finnableCap = 1000000;
          if (isNtc) {
            finnableCap = 400000;
          } else if (isD) {
            finnableCap = 500000;
          } else if (isC) {
            finnableCap = 800000;
          } else {
            finnableCap = 1000000;
          }
          maxLoanCap = finnableCap;
        }
        let maxEligibleLoan = Math.min(multiplierLoanAmount, provisionalFoirLoanAmount, maxLoanCap);
        if (bankInput.dynamicBachelorLimitOverride) {
          maxEligibleLoan = Math.min(maxEligibleLoan, bankInput.dynamicBachelorLimitOverride);
        }

        // -------------------------------------------------------------
        // STEP 2: CROSS-VERIFY ROI SLAB ACCORDING TO THIS MAX ELIGIBLE LOAN
        // -------------------------------------------------------------
        let finalRate = effectiveRate;
        let appliedRoiSlab = '< ₹10 Lakhs';
        if (bankInput.matchedRateConfig) {
          const mRate = bankInput.matchedRateConfig;
          if (maxEligibleLoan >= 5000000 && mRate.roiAbove50L) {
            finalRate = Number(mRate.roiAbove50L);
            appliedRoiSlab = '≥ ₹50 Lakhs';
          } else if (maxEligibleLoan >= 3500000 && mRate.roiAbove35L) {
            finalRate = Number(mRate.roiAbove35L);
            appliedRoiSlab = '≥ ₹35 Lakhs';
          } else if (maxEligibleLoan >= 2000000 && (mRate.roiAbove20L || mRate.roi20Lto30L)) {
            finalRate = Number(mRate.roiAbove20L || mRate.roi20Lto30L);
            appliedRoiSlab = '≥ ₹20 Lakhs';
          } else if (maxEligibleLoan >= 1500000 && (mRate.roi15Lto20L || mRate.roiAbove15L)) {
            finalRate = Number(mRate.roi15Lto20L || mRate.roiAbove15L);
            appliedRoiSlab = '₹15 Lakhs - ₹20 Lakhs';
          } else if (maxEligibleLoan >= 1000000 && (mRate.roi10Lto15L || mRate.roiAbove10L || mRate.roi10Lto20L || mRate.roiAbove10L75kSal)) {
            finalRate = Number(mRate.roi10Lto15L || mRate.roiAbove10L || mRate.roi10Lto20L || mRate.roiAbove10L75kSal);
            appliedRoiSlab = '₹10 Lakhs - ₹15 Lakhs';
          } else if (mRate.roi5Lto10L || mRate.roiBelow10L || mRate.roi1Lto10L || mRate.roiBelow20L || mRate.roi1Lto12L || mRate.roiAbove5L || mRate.roi5Lto25L) {
            finalRate = Number(mRate.roi5Lto10L || mRate.roiBelow10L || mRate.roi1Lto10L || mRate.roiBelow20L || mRate.roi1Lto12L || mRate.roiAbove5L || mRate.roi5Lto25L);
            appliedRoiSlab = '< ₹10 Lakhs';
          }

          // ICICI Bank Excel Special Notes:
          // CIBIL 775+ & SALARY 75K+ & LOAN AMOUNT ≥ 20 LAC = 9.99%
          // CIBIL 750 TO 774 + SALARY 75K+ & LOAN AMOUNT ≥ 20 LAC = 10.30%
          if (isIciciBankInst && maxEligibleLoan >= 2000000 && monthlyIncome >= 75000) {
            const numCibil = rawCibil !== null && rawCibil !== undefined && rawCibil !== '' ? Number(rawCibil) : 750;
            if (numCibil >= 775) {
              finalRate = 9.99;
              appliedRoiSlab = 'CIBIL 775+ & ₹75k+ Sal (≥₹20L)';
            } else if (numCibil >= 750) {
              finalRate = 10.30;
              appliedRoiSlab = 'CIBIL 750–774 & ₹75k+ Sal (≥₹20L)';
            }
          }

          // L&T Finance Excel Special Rates:
          // Super A & A: 10.99% if Owned House + Salary >= 1.75 Lakhs + CIBIL >= 775
          if (isLntInst) {
            const catUpper = String(bankCategory || '').toUpperCase();
            const numCibil = rawCibil !== null && rawCibil !== undefined && rawCibil !== '' ? Number(rawCibil) : 750;
            const isOwnedHouse = calculatorInput.livingStatus === 'owned' || calculatorInput.residenceType === 'owned';

            if ((catUpper.includes('SUPER') || catUpper === 'A') && isOwnedHouse && monthlyIncome >= 175000 && numCibil >= 775) {
              finalRate = 10.99;
              appliedRoiSlab = 'Owned House & ₹1.75L+ Sal & 775+ CIBIL (10.99%)';
            } else if (maxEligibleLoan >= 2000000) {
              if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'B' || catUpper.includes('GOVT')) {
                finalRate = 11.50;
              } else if (catUpper === 'C') {
                finalRate = 13.50;
              } else {
                finalRate = 14.00;
              }
              appliedRoiSlab = '₹20L – ₹30L Slabs (11.5%–12.5%)';
            } else if (maxEligibleLoan >= 1000000) {
              finalRate = 14.00;
              appliedRoiSlab = '₹10L – ₹20L Slabs (14.00%)';
            } else {
              if (catUpper.includes('SUPER') || catUpper === 'A') {
                finalRate = 13.00;
              } else if (catUpper === 'B' || catUpper.includes('GOVT')) {
                finalRate = 13.50;
              } else if (catUpper === 'C') {
                finalRate = 14.00;
              } else {
                finalRate = 15.00;
              }
              appliedRoiSlab = '₹1L – ₹10L Slabs (13%–15%)';
            }
          }

          // SMFG India Credit Excel Rate preservation:
          if (name.toLowerCase().includes('smfg') || id === 'smfg') {
            finalRate = effectiveRate;
            appliedRoiSlab = `Net Salary ${monthlyIncome >= 100000 ? '≥ ₹1 Lakh' : monthlyIncome >= 75000 ? '₹75k–₹1L' : monthlyIncome >= 50000 ? '₹50k–₹75k' : monthlyIncome >= 40000 ? '₹40k–₹50k' : monthlyIncome >= 35000 ? '₹35k–₹40k' : monthlyIncome >= 30000 ? '₹30k–₹35k' : '₹25k–₹30k'}`;
          }

          // Bajaj Finance Excel Rate (Sheet: BAJAJ - Section 2):
          // 10L Above: 10%, 1 to 12 Lac (Sal Lite): 16%, Default case: 14%
          if (name.toLowerCase().includes('bajaj') || id === 'bajaj') {
            if (maxEligibleLoan >= 1000000) {
              finalRate = 10.00;
              appliedRoiSlab = '≥ ₹10 Lakhs (10.00%)';
            } else if (maxEligibleLoan <= 1200000 && mRate.roi1Lto12L) {
              finalRate = Number(mRate.roi1Lto12L);
              appliedRoiSlab = '₹1L – ₹12L Sal Lite (16.00%)';
            } else {
              finalRate = Number(mRate.defaultRoi || 14.00);
              appliedRoiSlab = 'Default Case (14.00%)';
            }
          }

          // AU Small Finance Bank Excel Rate calculation (Sheet: AU BANK - Section 5):
          if (name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au') {
            const numCibil = rawCibil !== null && rawCibil !== undefined && rawCibil !== '' ? Number(rawCibil) : 750;
            finalRate = getAuROI(maxEligibleLoan, numCibil, bankCategory, monthlyIncome, policy?.roiMatrixDetailed);
            appliedRoiSlab = `AU Matrix (CIBIL ${numCibil}, ₹${(maxEligibleLoan / 100000).toFixed(1)}L, Sal ₹${(monthlyIncome / 1000).toFixed(0)}k)`;
          }

          // Axis Finance Excel Rate calculation (Sheet: AXIS FINANCE)
          if (isAxisFinInst) {
            if (calculatorInput.isBTMode) {
              finalRate = 18.00;
              appliedRoiSlab = 'Axis Finance BT Rate (18.00%)';
            } else {
              const catUpper = String(bankCategory || '').toUpperCase();
              if (catUpper.includes('SUPER') || catUpper === 'GOVT') {
                finalRate = 13.50;
              } else if (catUpper === 'A') {
                finalRate = 14.50;
              } else if (catUpper === 'B') {
                finalRate = 15.00;
              } else {
                finalRate = 16.00;
              }
              appliedRoiSlab = `Axis Finance Cat ${catUpper} (${finalRate.toFixed(2)}%)`;
            }
          }

          // Tata Capital Excel Rate calculation (Sheet: TATA - Section 2 Rows 53-73)
          if (isTataInst) {
            const catUpper = String(bankCategory || '').toUpperCase();
            if (catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'GOVT') {
              if (maxEligibleLoan >= 5000000) finalRate = 10.99;
              else if (maxEligibleLoan > 2000000) finalRate = 12.00;
              else finalRate = 14.00;
            } else if (catUpper === 'B') {
              if (maxEligibleLoan >= 4000000) finalRate = 10.99;
              else if (maxEligibleLoan > 2000000) finalRate = 12.00;
              else finalRate = 14.00;
            } else if (catUpper === 'C') {
              if (maxEligibleLoan >= 3000000) finalRate = 12.00;
              else if (maxEligibleLoan > 2000000) finalRate = 13.00;
              else finalRate = 15.00;
            } else {
              // Cat D / Unlisted
              if (maxEligibleLoan > 2000000) finalRate = 13.50;
              else finalRate = 16.00;
            }
            appliedRoiSlab = `Tata Capital Cat ${catUpper} (${finalRate.toFixed(2)}% | ₹${(maxEligibleLoan / 100000).toFixed(1)}L)`;
          }

          // Poonawalla Fincorp Excel Rate calculation (Sheet: POONAWALA - Section 4 Rows 34-52)
          if (isPoonawalaInst) {
            const numCibil = rawCibil !== null && rawCibil !== undefined && rawCibil !== '' ? Number(rawCibil) : 750;
            finalRate = poonawalaConfig.getPoonawalaRate(bankCategory, monthlyIncome, maxEligibleLoan, numCibil);
            appliedRoiSlab = `Poonawalla Grid (${finalRate.toFixed(2)}% | CIBIL: ${numCibil} | Sal: ₹${(monthlyIncome / 1000).toFixed(0)}k)`;
          }
        }

        // Direct guarantee for ABFL and Finnable Rate calculation from Excel Policies
        if (isAbflInst) {
          const numCibil = rawCibil !== null && rawCibil !== undefined && rawCibil !== '' ? Number(rawCibil) : 750;
          const cityTier = getCityTier(calculatorInput.city, calculatorInput.state);
          finalRate = getAbflROI(maxEligibleLoan, monthlyIncome, bankCategory, cityTier, numCibil, Boolean(calculatorInput.isBTMode));
          appliedRoiSlab = `ABFL Salary Multiplier (${finalRate.toFixed(2)}% | Tier: ${cityTier} | CIBIL: ${numCibil})`;
        } else if (isFinnableInst) {
          const catStr = String(bankCategory || '').toUpperCase().trim();
          const isSuperOrA = catStr.includes('SUPER') || catStr === 'A' || catStr === 'CAT A' || catStr === 'CATEGORY A' || catStr.includes('GOVT');
          const isB = catStr === 'B' || catStr === 'CAT B' || catStr === 'CATEGORY B';
          const isC = catStr === 'C' || catStr === 'CAT C' || catStr === 'CATEGORY C';
          if (isSuperOrA) {
            finalRate = 22.00;
          } else if (isB) {
            finalRate = 24.00;
          } else if (isC) {
            finalRate = 26.00;
          } else {
            finalRate = 28.00;
          }
          appliedRoiSlab = `Finnable Cat ${catStr} (${finalRate.toFixed(2)}%)`;
        }


        // -------------------------------------------------------------
        // STEP 3: RE-CROSS-VERIFY CAPACITY WITH FINAL SLAB ROI
        // -------------------------------------------------------------
        const finalFoirLoanAmount = (finalRate !== effectiveRate)
          ? calculateLoanAmountFromEMI(availableEMI, finalRate, tenureYears)
          : provisionalFoirLoanAmount;

        maxEligibleLoan = Math.min(multiplierLoanAmount, finalFoirLoanAmount, maxLoanCap);
        if (bankInput.dynamicBachelorLimitOverride) {
          maxEligibleLoan = Math.min(maxEligibleLoan, bankInput.dynamicBachelorLimitOverride);
        }

        // ICICI Bank Rajasthan Minimum Ticket Size Verification: ₹6.10 Lakhs
        if (isIciciBankInst) {
          const isRajasthanUser = String(calculatorInput.state || '').toLowerCase().includes('rajasthan') ||
                                  String(calculatorInput.city || '').toLowerCase().includes('jaipur') ||
                                  String(calculatorInput.city || '').toLowerCase().includes('jodhpur') ||
                                  String(calculatorInput.city || '').toLowerCase().includes('kota') ||
                                  String(calculatorInput.city || '').toLowerCase().includes('udaipur') ||
                                  String(calculatorInput.city || '').toLowerCase().includes('bikaner') ||
                                  String(calculatorInput.city || '').toLowerCase().includes('ajmer');
          if (isRajasthanUser && maxEligibleLoan < 610000) {
            return {
              bankName: name,
              eligible: false,
              reason: `Maximum eligible capacity (₹${Math.round(maxEligibleLoan).toLocaleString()}) is below ICICI Bank minimum ticket size of ₹6.10 Lakhs in Rajasthan.`,
              category: bankCategory
            };
          }
        }

        // Tata Capital Minimum Loan Ticket Size Check: ₹75,000 (Excel: MINIMUM LOAN AMOUNT: 75K)
        if (isTataInst && maxEligibleLoan < 75000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Maximum eligible capacity (₹${Math.round(maxEligibleLoan).toLocaleString()}) is below Tata Capital minimum loan threshold of ₹75,000 (Excel: MINIMUM LOAN AMOUNT: 75K).`,
            category: bankCategory
          };
        }

        // Axis Finance Minimum Loan Ticket Size Check: ₹1,00,000 (Excel: MINIMUM LOAN AMOUNT: 1 LAC)
        if (isAxisFinInst && maxEligibleLoan < 100000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Maximum eligible capacity (₹${Math.round(maxEligibleLoan).toLocaleString()}) is below Axis Finance minimum loan threshold of ₹1,00,000 (Excel: MINIMUM LOAN AMOUNT: 1 LAC).`,
            category: bankCategory
          };
        }

        // Poonawalla Fincorp Minimum Loan Ticket Size Check: ₹1,00,000 (Excel Row 95: MINIMUM LOAN AMOUNT: 1 LAC)
        if (isPoonawalaInst && maxEligibleLoan < 100000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Maximum eligible capacity (₹${Math.round(maxEligibleLoan).toLocaleString()}) is below Poonawalla Fincorp minimum loan threshold of ₹1,00,000 (Excel Row 95: MINIMUM LOAN AMOUNT: 1 LAC).`,
            category: bankCategory
          };
        }

        // Aditya Birla Finance Minimum Loan Ticket Size Check: ₹1,00,000 (Excel: MINI LOAN AMOUNT 1LAC)
        if (isAbflInst && maxEligibleLoan < 100000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Maximum eligible capacity (₹${Math.round(maxEligibleLoan).toLocaleString()}) is below Aditya Birla Finance minimum loan threshold of ₹1,00,000 (Excel: MINI LOAN AMOUNT 1LAC).`,
            category: bankCategory
          };
        }

        // Finnable Minimum Loan Ticket Size Check: ₹50,000 (Excel: MINIMUM LOAN AMOUNT: 50K)
        if (isFinnableInst && maxEligibleLoan < 50000) {
          return {
            bankName: name,
            eligible: false,
            reason: `Maximum eligible capacity (₹${Math.round(maxEligibleLoan).toLocaleString()}) is below Finnable minimum loan threshold of ₹50,000 (Excel: MINIMUM LOAN AMOUNT: 50K).`,
            category: bankCategory
          };
        }

        // If customer optionally requested an amount, cap to requested amount, else customer receives 100% max eligibility
        let calculatedLoan = maxEligibleLoan;
        if (calculatorInput.desiredLoanAmount && calculatorInput.desiredLoanAmount > 0) {
          calculatedLoan = Math.min(calculatorInput.desiredLoanAmount, maxEligibleLoan);
        }

        const finalLoanAmount = Math.max(0, Math.round(calculatedLoan));
        const finalMonthlyEMI = calculateEMI(finalLoanAmount, finalRate, tenureYears);

        // Update result object with exact policy values
        result.loanAmount = finalLoanAmount;
        result.maxEligibleLoan = Math.round(maxEligibleLoan);
        result.monthlyEMI = finalMonthlyEMI;
        result.interestRate = finalRate;
        result.loanTenure = tenureYears;
        result.loanTenureMonths = tenureMonths;
        result.multiplier = effectiveMultiplier;
        result.foirPercentage = effectiveFOIR;
        result.appliedRoiSlab = appliedRoiSlab;

        const isBypassBachelor = id !== 'au-bank' && id !== 'au_bank';
        if (isBypassBachelor) {
          result.bachelorCapped = false;
          result.bachelorCapReason = null;
        } else if (bankInput.dynamicBachelorLimitOverride && finalLoanAmount <= bankInput.dynamicBachelorLimitOverride) {
          result.bachelorCapped = true;
          result.bachelorCapReason = bankInput.dynamicBachelorCapReason || 'AU Bank PG/Rented Bachelor Policy Cap (Max ₹5 Lakhs)';
        }

        if (!result.details) result.details = {};
        result.details.foirPercentage = (effectiveFOIR * 100).toFixed(0) + '%';
        result.details.multiplier = effectiveMultiplier + 'x';
        result.details.foirCap = Math.round(foirCap);
        result.details.availableEMI = Math.round(availableEMI);
        result.details.foirLoanAmount = Math.round(finalFoirLoanAmount);
        result.details.multiplierLoanAmount = Math.round(multiplierLoanAmount);
        result.details.maxEligibleLoan = Math.round(maxEligibleLoan);
        result.details.appliedRoiSlab = appliedRoiSlab;
        result.details.bankCreditCardObligation = bankInput.creditCardObligation || 0;
        result.details.creditCardObligationPercentage = (bankInput.creditCardObligationPercentage || 5) + '%';
        result.details.totalObligations = totalObligations;

        if (isFinnableInst && maxEligibleLoan >= 500000) {
          result.form16Required = true;
          result.form16Note = 'Form 16 verification is required for loan amounts ≥ ₹5 Lakhs (Excel Row 26).';
          result.details.specialRequirement = 'Form 16 verification mandatory (Loan ≥ ₹5 Lakhs)';
        }
        if (isFinnableInst) {
          result.processingFee = 2.5; // Excel: 2% To 6%
          result.details.processingFeeRange = '2% - 6% (Excel: 2% To 6%)';
        }
      }

      const bankEndTime = performance.now();
      const bankTime = (bankEndTime - bankStartTime).toFixed(2);

      // 💎 ENHANCED RESULT WITH ADMIN TRANSPARENCY
      const enhancedResult = {
        bankName: result.bankName || name,
        ...result,
        category: bankCategory,
        salaryMode: calculatorInput.salaryMode,
        adminApplied: true,
        btConfig: adminAllConfig.btConfig || config.btConfig,
        processingFee: isFinnableInst ? (adminAllConfig.feesAndCharges?.processingFeePercentage || 2.5) : adminAllConfig.feesAndCharges?.processingFeePercentage,
      };

      if (result.eligible) {
        console.log(`   ✅ APPROVED - Loan: ₹${(result.loanAmount / 100000).toFixed(2)}L, EMI: ₹${result.monthlyEMI.toLocaleString()} (${bankTime}ms)`);
      } else {
        console.log(`   ❌ REJECTED - Reason: ${result.reason} (${bankTime}ms)`);
      }

      return enhancedResult;
    } catch (error) {
      const bankEndTime = performance.now();
      const bankTime = (bankEndTime - bankStartTime).toFixed(2);
      console.error(`   ⚠️  ERROR in ${name}:`, error.message, `(${bankTime}ms)`);
      return {
        bankName: name,
        eligible: false,
        reason: 'Calculation error occurred: ' + error.message,
        btConfig: config.btConfig,
        incentivePercentage: config.incentivePercentage,
        incentivePeriodMonths: config.incentivePeriodMonths
      };
    }
  });

  console.log('='.repeat(60));
  console.log(`🏛️  === ${results.length} INSTITUTIONS CALCULATED ===`);
  console.log('');

  // 🛡️ APPLY 5-LAYER PROTECTION AGAINST PROCESSING FEES (temporarily disabled for debugging)
  // const protectedResults = protectAgainstProcessingFee(results, 'realLoanService');
  // return protectedResults;

  return results;
};
