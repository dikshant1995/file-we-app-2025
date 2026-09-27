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

// Import company database service
import { getCompanyCategoryForBank } from './companyDatabaseService.js';

// 🚫 IMPORT 5-LAYER PROCESSING FEE GUARD
import { protectAgainstProcessingFee } from '../utils/processingFeeGuard.js';

// Import bank configuration service for logic bridge
import { getBankConfig, getAllBankConfig } from './bankConfigService.js';

// Import Bank Master Excel Policies from Registry
import { getExcelPolicyForBank } from '../config/bankPolicyRegistry.js';
import { AXIS_BANK_EXCEL_POLICY } from '../config/axisBankPolicy.js';
import { INDUSIND_BANK_EXCEL_POLICY } from '../config/indusindBankPolicy.js';
import { HDFC_BANK_EXCEL_POLICY } from '../config/hdfcBankPolicy.js';

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
    category: userData.category || 'A', // Fallback category if company not found
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
    btTotalOutstanding: isBTMode ? (userData.loansForBT || []).reduce((sum, loan) => sum + (parseFloat(loan.outstandingAmount) || 0), 0) : 0
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
    { id: 'smfg', name: 'SMFG India Credit', calculator: calculateUnifiedBankEligibility, config: { name: 'SMFG India Credit', maxLoanCap: 3000000, defaultRate: 11.99 }, hasDatabase: false },
    { id: 'bajaj', name: 'Bajaj Finance', calculator: calculateUnifiedBankEligibility, config: { name: 'Bajaj Finance', maxLoanCap: 4000000, defaultRate: 10.0 }, hasDatabase: true },
    { id: 'incred', name: 'Incred Finance', calculator: calculateUnifiedBankEligibility, config: { name: 'Incred Finance', maxLoanCap: 1500000, defaultRate: 13.49 }, hasDatabase: false },
    { id: 'au-bank', name: 'AU Small Finance Bank', calculator: calculateUnifiedBankEligibility, config: { name: 'AU Small Finance Bank', maxLoanCap: 3500000, defaultRate: 11.5 }, hasDatabase: false },
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

      // Master Policy Fallback from Excel Registry for ALL institutions
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
        // Piramal Finance: Max 2 CC BT allowed
        if (numCcBt > 2 && (name.toLowerCase().includes('piramal') || id === 'piramal')) {
          return {
            bankName: name,
            eligible: false,
            reason: `Piramal Finance allows maximum 2 Credit Card BTs (${numCcBt} selected).`,
            category: 'REJECTED'
          };
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
        // Poonawalla Fincorp: Max 6 CC BT allowed
        if (numCcBt > 6 && (name.toLowerCase().includes('poonawala') || name.toLowerCase().includes('poonawalla') || id === 'poonawala')) {
          return {
            bankName: name,
            eligible: false,
            reason: `Poonawalla Fincorp allows maximum 6 Credit Card BTs (${numCcBt} selected).`,
            category: 'REJECTED'
          };
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

      // 3.6 AXIS BANK & AXIS FINANCE CATEGORY D RESTRICTION (Not in Policy)
      if (name === 'Axis Bank' || id === 'axis-bank' || name === 'Axis Finance' || id === 'axis') {
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
            if (reqAmount && reqAmount > 0) {
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
              // Tata Capital Excel Policy
              const catUpper = String(bankCategory || '').toUpperCase();
              let tataMult = 24;
              if (income >= 75000) {
                tataMult = (catUpper === 'C' ? 18 : (catUpper === 'B' ? 25 : 27));
              } else if (income >= 50000) {
                tataMult = (catUpper === 'C' ? 18 : (catUpper === 'B' ? 22 : 24));
              } else {
                tataMult = (catUpper === 'C' ? 15 : (catUpper === 'B' ? 19 : 20));
              }
              bankInput.multiplierOverride = tataMult;
              bankInput.foirOverride = matchedFoir.maxFoir || 70;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name.toLowerCase().includes('bajaj') || id === 'bajaj') {
              // Bajaj Finance Excel Policy
              const hasHl = (calculatorInput.existingLoanTypes && (calculatorInput.existingLoanTypes.includes('Home Loan') || calculatorInput.existingLoanTypes.includes('HL'))) ||
                (Array.isArray(calculatorInput.loansForBT) && calculatorInput.loansForBT.some(l => l.type === 'Home Loan'));
              let bajajFoir = income < 50000 ? 60 : 65;
              if (hasHl) bajajFoir += (income < 50000 ? 10 : 5);
              bankInput.foirOverride = Math.min(75, bajajFoir);
              bankInput.multiplierOverride = matchedFoir.multiplier || 28;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name.toLowerCase().includes('bandhan') || id === 'bandhan') {
              // Bandhan Bank Excel Policy
              let bFoir = 50;
              if (income >= 75001) bFoir = 70;
              else if (income >= 50001) bFoir = 65;
              else if (income >= 30001) bFoir = 60;
              else bFoir = 50;
              bankInput.foirOverride = bFoir;
              bankInput.multiplierOverride = matchedFoir.multiplier || 24;
              bankInput.ccObligationPercentOverride = 3;
            } else if (name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au') {
              // AU Small Finance Bank Excel Policy
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
                auMult = isPriority1 ? 20 : 16;
              } else {
                auFoir = isPriority1 ? 60 : 50;
                auMult = isPriority1 ? 18 : 15;
              }
              bankInput.foirOverride = auFoir;
              bankInput.multiplierOverride = auMult;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name === 'Axis Finance' || id === 'axis') {
              // Axis Finance Excel Policy
              const catUpper = String(bankCategory || '').toUpperCase();
              let axFoir = 70;
              if (catUpper === 'B') axFoir = 65;
              else if (catUpper === 'C') axFoir = 60;
              else if (catUpper === 'D') axFoir = 50;

              let axMult = 24;
              if (income >= 100000) axMult = 30;
              else if (income >= 75000) axMult = 28;
              else if (income >= 50000) axMult = 26;
              else axMult = 24;
              if (catUpper === 'D') axMult = 15;
              bankInput.foirOverride = axFoir;
              bankInput.multiplierOverride = axMult;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
            } else if (name.toLowerCase().includes('chola') || id === 'chola') {
              // Chola Finance Excel Policy
              const catUpper = String(bankCategory || '').toUpperCase();
              const isPriority = catUpper.includes('SUPER') || catUpper === 'A' || catUpper === 'B' || catUpper === 'GOVT';
              let cholaFoir = income >= 30000 ? (isPriority ? 70 : 65) : (isPriority ? 65 : 55);
              let cholaMult = (catUpper.includes('SUPER') || catUpper === 'GOVT') ? 35 : (isPriority ? 28 : 25);
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
              // Aditya Birla Finance Excel Policy
              let abflFoir = 50;
              if (income > 100000) abflFoir = 70;
              else if (income >= 50000) abflFoir = 65;
              else if (income >= 25000) abflFoir = 60;
              else abflFoir = 50;
              bankInput.foirOverride = abflFoir;
              bankInput.multiplierOverride = matchedFoir.multiplier || 26;
              if (matchedFoir.ccObligation !== undefined) bankInput.ccObligationPercentOverride = Number(matchedFoir.ccObligation);
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
              // L&T Finance Master Excel Policy (CIBIL 720+)
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

        // Tenure calculations
        let tenureMonths = calculatorInput.loanTenure ? (calculatorInput.loanTenure * 12) : 60;
        if (bankInput.maxTenureOverride) {
          tenureMonths = Math.min(tenureMonths, Number(bankInput.maxTenureOverride));
        } else if (result.loanTenureMonths) {
          tenureMonths = Math.min(tenureMonths, result.loanTenureMonths);
        }

        // IndusInd Bank & Finnable Excel Policy: CIBIL = -1 (New to Credit) tenure capping
        if ((name === 'IndusInd Bank' || id === 'indusind') && isNtc) {
          tenureMonths = Math.min(tenureMonths, 48); // IndusInd -1 capped to 48 months
        }
        if ((name.toLowerCase().includes('finnable') || id === 'finnable') && isNtc) {
          tenureMonths = Math.min(tenureMonths, 36); // Finnable -1 capped to 36 months
        }
        const tenureYears = tenureMonths / 12;

        const totalObligations = (calculatorInput.existingEMI || 0) + (bankInput.creditCardObligation || 0);
        const monthlyIncome = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;

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
        // Multiplier capacity:
        const availableSalary = calculatorInput.isBTMode ? monthlyIncome : (monthlyIncome - totalObligations);
        const multiplierLoanAmount = availableSalary * effectiveMultiplier;

        // Base FOIR loan capacity using provisional effectiveRate:
        let provisionalFoirLoanAmount = calculateLoanAmountFromEMI(availableEMI, effectiveRate, tenureYears);

        // Sanction & bachelor limits:
        let maxLoanCap = bankInput.maxLoanOverride || result.maxLoanCap || 5000000;
        // AU Bank NTC (-1) capped to 3 Lakhs
        if ((name.toLowerCase().includes('au ') || id === 'au-bank' || id === 'au') && isNtc) {
          maxLoanCap = Math.min(maxLoanCap, 300000);
        }
        // Finnable NTC (-1) capped to 4 Lakhs
        if ((name.toLowerCase().includes('finnable') || id === 'finnable') && isNtc) {
          maxLoanCap = Math.min(maxLoanCap, 400000);
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
        processingFee: adminAllConfig.feesAndCharges?.processingFeePercentage,
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
