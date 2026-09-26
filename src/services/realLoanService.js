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

// Import Axis Bank Master Excel Policy
import { AXIS_BANK_EXCEL_POLICY } from '../config/axisBankPolicy.js';

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
    basicSalary: userData.basicSalary || 0,
    averageIncentive: userData.averageIncentive || 0,
    monthlyIncome: userData.monthlyIncome ? parseFloat(userData.monthlyIncome) : 0,
    existingEMI: userData.existingEMI ? parseFloat(userData.existingEMI) : 0,
    companyName: userData.companyName || '',
    category: userData.category || 'A', // Fallback category if company not found
    creditScore: userData.creditScore ? parseInt(userData.creditScore) : 700,
    employmentType: userData.employmentType || 'salaried',
    age: userData.age ? parseInt(userData.age) : null, // AGE for tenure capping
    existingLoanBanks: userData.existingLoanBanks || [], // CRITICAL: Banks where customer has existing loans
    state: userData.state || '',
    city: userData.city || '',
    salaryMode: userData.salaryMode || 'bank',
    maritalStatus: userData.maritalStatus || '', // Added for bachelor capping
    livingStatus: userData.livingStatus || '',   // Added for bachelor capping
    creditCardObligation: (userData.creditCards || [])
      .filter(card => !card.isBT) // Only count cards NOT being transferred
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
    const stored = localStorage.getItem('laxmi_admin_12_banks');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const suspendedIds = new Set(parsed.filter(b => b.enabled === false).map(b => b.id));
        activeBankCalculators = bankCalculators.filter(b => !suspendedIds.has(b.id));
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

  // Super A / A+
  const isSuperA1 = s1 === 'SUPERA' || s1 === 'A+' || s1 === 'SCATA' || s1 === 'PLUS' || s1 === 'APLUS';
  const isSuperA2 = s2 === 'SUPERA' || s2 === 'A+' || s2 === 'SCATA' || s2 === 'PLUS' || s2 === 'APLUS';
  if (isSuperA1 && isSuperA2) return true;

  // Category A
  const isCatA1 = s1 === 'A' || s1 === 'CATA' || s1 === 'CATGA' || s1 === 'CATEGORYA';
  const isCatA2 = s2 === 'A' || s2 === 'CATA' || s2 === 'CATGA' || s2 === 'CATEGORYA';
  if (isCatA1 && isCatA2) return true;

  // Category B
  const isCatB1 = s1 === 'B' || s1 === 'CATB' || s1 === 'CATGB' || s1 === 'CATEGORYB';
  const isCatB2 = s2 === 'B' || s2 === 'CATB' || s2 === 'CATGB' || s2 === 'CATEGORYB';
  if (isCatB1 && isCatB2) return true;

  // Category C
  const isCatC1 = s1 === 'C' || s1 === 'CATC' || s1 === 'CATGC' || s1 === 'CATEGORYC';
  const isCatC2 = s2 === 'C' || s2 === 'CATC' || s2 === 'CATGC' || s2 === 'CATEGORYC';
  if (isCatC1 && isCatC2) return true;

  // Category D
  const isCatD1 = s1 === 'D' || s1 === 'CATD' || s1 === 'CATGD' || s1 === 'CATEGORYD';
  const isCatD2 = s2 === 'D' || s2 === 'CATD' || s2 === 'CATGD' || s2 === 'CATEGORYD';
  if (isCatD1 && isCatD2) return true;

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

      // Master Policy Fallback for Axis Bank from Excel
      if (!uPolicy && (name === 'Axis Bank' || id === 'axis-bank')) {
        uPolicy = AXIS_BANK_EXCEL_POLICY;
      }

      // 1. SALARY MODE GATE
      if (calculatorInput.salaryMode === 'cash' && adminAllConfig.employmentRules?.allowCashSalary === false) {
        return { bankName: name, eligible: false, reason: 'Cash salaries not accepted by this institution.', category: 'REJECTED' };
      }
      if (calculatorInput.salaryMode === 'cheque' && adminAllConfig.employmentRules?.allowChequeSalary === false) {
        return { bankName: name, eligible: false, reason: 'Cheque salaries not accepted by this institution.', category: 'REJECTED' };
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

        const minSalaryReq = demoRules.minSalary || adminAllConfig.employmentRules?.salariedMinSalary || 25000;
        if (calculatorInput.monthlyIncome < minSalaryReq) {
          return { bankName: name, eligible: false, reason: `Income below policy threshold (Min: ₹${minSalaryReq.toLocaleString()})`, category: 'REJECTED' };
        }

        const isAxisBank = name === 'Axis Bank' || id === 'axis-bank';
        if (!isAxisBank && demoRules.minCibilScore && Number(demoRules.minCibilScore) > 0 && calculatorInput.creditScore < demoRules.minCibilScore) {
          return { bankName: name, eligible: false, reason: `Credit score below minimum requirement (Min: ${demoRules.minCibilScore})`, category: 'REJECTED' };
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
        const bankDbKey = id === 'shriram' ? 'shriram' : id;

        if (calculatorInput.companyName) {
          bankCategory = getCompanyCategoryForBank(calculatorInput.companyName, bankDbKey);
          console.log(`   🏭 ${name}: ${calculatorInput.companyName} → ${bankCategory}`);
        } else {
          bankCategory = calculatorInput.category;
        }
      } else {
        bankCategory = 'B';
        console.log(`   🏭 ${name}: Using default Category B (no database)`);
      }

      // 🌉 INJECT ADMIN OVERRIDES INTO THE ENGINE
      const bankInput = {
        ...calculatorInput,
        category: bankCategory,
        bankName: name,
        bankId: id
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
        // 1. Dynamic Interest Rate match (Support Loan Amount Slabs: >=15L, 10L-15L, <10L)
        if (Array.isArray(uPolicy.interestRates)) {
          const matchedRate = uPolicy.interestRates.find(r => matchCategory(r.category, bankCategory));
          if (matchedRate) {
            const reqAmount = calculatorInput.desiredLoanAmount || 1000000;
            let dynamicRoi = matchedRate.defaultRoi || matchedRate.minRoi || 10.5;
            if (reqAmount >= 1500000 && matchedRate.roiAbove15L) {
              dynamicRoi = matchedRate.roiAbove15L;
            } else if (reqAmount >= 1000000 && matchedRate.roi10Lto15L) {
              dynamicRoi = matchedRate.roi10Lto15L;
            } else if (matchedRate.roiBelow10L) {
              dynamicRoi = matchedRate.roiBelow10L;
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
            const isAxis = name === 'Axis Bank' || id === 'axis-bank';
            if (!isAxis && matchedCap.bachelorCap && calculatorInput.maritalStatus === 'single' && calculatorInput.livingStatus === 'rented') {
              bankInput.dynamicBachelorLimitOverride = Number(matchedCap.bachelorCap);
            }
          }
        }

        // 3. Dynamic FOIR & Multiplier match (Tab 4 in Admin - Salary Slabs)
        if (Array.isArray(uPolicy.foirMultiplier)) {
          const matchedFoir = uPolicy.foirMultiplier.find(m => matchCategory(m.category, bankCategory));
          if (matchedFoir) {
            if (matchedFoir.multiplier) bankInput.multiplierOverride = Number(matchedFoir.multiplier);
            
            const income = calculatorInput.monthlyIncome || calculatorInput.basicSalary || 0;
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

        // 4. Dynamic Tenure match (Tab 3 in Admin)
        if (Array.isArray(uPolicy.tenureRules)) {
          const matchedTenure = uPolicy.tenureRules.find(t => matchCategory(t.category, bankCategory));
          if (matchedTenure && matchedTenure.maxMonths) {
            bankInput.maxTenureOverride = Number(matchedTenure.maxMonths);
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
      const isAxis = name === 'Axis Bank' || id === 'axis-bank';
      if (!isAxis && adminAllConfig.bachelorCapping?.enabled && adminAllConfig.bachelorCapping?.limits) {
        if (calculatorInput.maritalStatus === 'single' && calculatorInput.livingStatus === 'rented') {
          const rentedLimit = adminAllConfig.bachelorCapping.limits['rented_bachelor'];
          if (rentedLimit !== null && rentedLimit !== undefined && rentedLimit !== '') {
             bankInput.dynamicBachelorLimitOverride = rentedLimit;
             bankInput.dynamicBachelorCapReason = 'Rented / Living Alone Bachelor Limit Applied';
          }
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
        const tenureYears = tenureMonths / 12;

        const totalObligations = (calculatorInput.existingEMI || 0) + (calculatorInput.creditCardObligation || 0);
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
        const maxLoanCap = bankInput.maxLoanOverride || result.maxLoanCap || 5000000;
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
          if (maxEligibleLoan >= 1500000 && mRate.roiAbove15L) {
            finalRate = Number(mRate.roiAbove15L);
            appliedRoiSlab = '≥ ₹15 Lakhs';
          } else if (maxEligibleLoan >= 1000000 && mRate.roi10Lto15L) {
            finalRate = Number(mRate.roi10Lto15L);
            appliedRoiSlab = '₹10 Lakhs - ₹15 Lakhs';
          } else if (mRate.roiBelow10L) {
            finalRate = Number(mRate.roiBelow10L);
            appliedRoiSlab = '< ₹10 Lakhs';
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

        if (!result.details) result.details = {};
        result.details.foirPercentage = (effectiveFOIR * 100).toFixed(0) + '%';
        result.details.multiplier = effectiveMultiplier + 'x';
        result.details.foirCap = Math.round(foirCap);
        result.details.availableEMI = Math.round(availableEMI);
        result.details.foirLoanAmount = Math.round(finalFoirLoanAmount);
        result.details.multiplierLoanAmount = Math.round(multiplierLoanAmount);
        result.details.maxEligibleLoan = Math.round(maxEligibleLoan);
        result.details.appliedRoiSlab = appliedRoiSlab;
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
