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
    const btTotalEMI = userData.loansForBT.reduce((sum, loan) => sum + (parseFloat(loan.monthlyEMI) || 0), 0);
    const btTotalOutstanding = userData.loansForBT.reduce((sum, loan) => sum + (parseFloat(loan.outstandingAmount) || 0), 0);

    console.log(`  - Total BT EMI: ₹${btTotalEMI.toLocaleString()}`);
    console.log(`  - Total BT Outstanding: ₹${btTotalOutstanding.toLocaleString()}`);
  }

  // Transform form data to match calculator expectations
  const calculatorInput = {
    desiredLoanAmount: userData.desiredLoanAmount ? parseFloat(userData.desiredLoanAmount) : null,
    loanTenure: userData.loanTenure ? parseInt(userData.loanTenure) : 5, // Default to 5 years
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
    // Balance Transfer specific data
    isBTMode: isBTMode,
    loansForBT: isBTMode ? userData.loansForBT : [],
    btTotalEMI: isBTMode ? userData.loansForBT.reduce((sum, loan) => sum + (parseFloat(loan.monthlyEMI) || 0), 0) : 0,
    btTotalOutstanding: isBTMode ? userData.loansForBT.reduce((sum, loan) => sum + (parseFloat(loan.outstandingAmount) || 0), 0) : 0
    // Note: Interest rate will be pulled dynamically from Admin Config in the loop below
  };

  console.log('⚙️  Transformed input for calculators:', calculatorInput);
  console.log('🚨 EXISTING LOAN BANKS:', calculatorInput.existingLoanBanks);
  console.log('🏭 Company Name:', calculatorInput.companyName);
  console.log('');

  // Array of bank calculators with their names and configs
  const bankCalculators = [
    // 4 NEW BANKS: With company database + dynamic rates
    { id: 'kotak', name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility, config: kotakConfig, hasDatabase: true },
    { id: 'tata', name: 'Tata Capital', calculator: calculateTataEligibility, config: tataConfig, hasDatabase: true },
    { id: 'poonawala', name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility, config: poonawalaConfig, hasDatabase: true },
    { id: 'idfc', name: 'IDFC Bank', calculator: calculateIdfcEligibility, config: idfcConfig, hasDatabase: true },

    // 8 OLD BANKS: No database, default Category B + 11% rate
    { id: 'hdfc', name: 'HDFC Bank', calculator: calculateHdfcEligibility, config: hdfcConfig, hasDatabase: true },
    { id: 'icici', name: 'ICICI Bank', calculator: calculateIciciEligibility, config: iciciConfig, hasDatabase: true },
    { id: 'bandhan', name: 'Bandhan Bank', calculator: calculateBandhanEligibility, config: bandhanConfig, hasDatabase: false },
    { id: 'chola', name: 'Cholamandalam Finance', calculator: calculateCholaEligibility, config: cholaConfig, hasDatabase: true },
    { id: 'axis', name: 'Axis Finance', calculator: calculateAxisFinEligibility, config: axisFinConfig, hasDatabase: true },
    { id: 'indusind', name: 'IndusInd Bank', calculator: calculateIndusindEligibility, config: indusindConfig, hasDatabase: true },
    { id: 'shriram', name: 'Shri Ram Finance', calculator: calculateShriRamEligibility, config: shriRamConfig, hasDatabase: false },
    { id: 'piramal', name: 'Piramal Finance', calculator: calculatePiramalEligibility, config: piramalConfig, hasDatabase: false }
  ];

  // Calculate eligibility for each bank
  console.log('🏛️  Calling 12 banks with Logic Bridge active...');
  console.log('='.repeat(60));

  const results = bankCalculators.map(({ id, name, calculator, config, hasDatabase }, index) => {
    const bankStartTime = performance.now();
    console.log(`🏦 [${index + 1}/12] Calculating: ${name}...`);

    try {
      // 🧊 LOGIC BRIDGE: Retrieve real-time Admin Panel settings
      const location = calculatorInput.city || calculatorInput.state;
      const adminAllConfig = getAllBankConfig(name, location);

      // 1. STRING 8: SALARY MODE GATE
      if (calculatorInput.salaryMode === 'cash' && adminAllConfig.employmentRules?.allowCashSalary === false) {
        return { bankName: name, eligible: false, reason: 'Cash salaries not accepted by this institution.', category: 'REJECTED' };
      }
      if (calculatorInput.salaryMode === 'cheque' && adminAllConfig.employmentRules?.allowChequeSalary === false) {
        return { bankName: name, eligible: false, reason: 'Cheque salaries not accepted by this institution.', category: 'REJECTED' };
      }

      // 2. STRING 2 & 3: BASIC ELIGIBILITY GATES
      if (calculatorInput.age && adminAllConfig.ageRules) {
        if (calculatorInput.age < adminAllConfig.ageRules.minAge) {
          return { bankName: name, eligible: false, reason: `Age below criteria (Min: ${adminAllConfig.ageRules.minAge})`, category: 'REJECTED' };
        }
        if (calculatorInput.age > adminAllConfig.ageRules.maxAge) {
          return { bankName: name, eligible: false, reason: `Age above criteria (Max: ${adminAllConfig.ageRules.maxAge})`, category: 'REJECTED' };
        }
      }

      if (calculatorInput.monthlyIncome < (adminAllConfig.employmentRules?.salariedMinSalary || 25000)) {
        return { bankName: name, eligible: false, reason: `Income below bank threshold (Min: ₹${adminAllConfig.employmentRules?.salariedMinSalary || 25000})`, category: 'REJECTED' };
      }

      let bankCategory;
      let govtPolicy = null;

      // 3. STRING 7: GOVT DIRECT INJECTION
      if (calculatorInput.employmentType === 'government') {
        bankCategory = 'Govt';
        govtPolicy = getBankConfig(name, 'govtPolicy', location);
        console.log(`   🏛️ ${name}: Govt Direct Injection Active`, govtPolicy);
      } else if (hasDatabase) {
        // PRIVATE SECTOR PATH
        const bankDbKey = id === 'shriram' ? 'shriram' : id; // Match Database keys

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
        category: bankCategory
      };

      // Apply Govt Overrides if available
      if (govtPolicy) {
        // Note: These flags tell the individual bank calculators to use Govt rules
        bankInput.isGovtEmployee = true;
        bankInput.govtROI = govtPolicy.roi;
        bankInput.govtFOIR = govtPolicy.foir;
        bankInput.govtMultiplier = govtPolicy.multiplier;
        bankInput.govtMaxTenure = govtPolicy.maxTenureMonths;
      }

      // Apply Global Multiplier/Rate Overrides from Admin Panel
      if (adminAllConfig.interestRates && !govtPolicy) {
        const catRate = adminAllConfig.interestRates.categoryRates?.[bankCategory] || adminAllConfig.interestRates.defaultRate;
        if (catRate) bankInput.interestRateOverride = catRate;
      }

      const result = calculator(bankInput);
      const bankEndTime = performance.now();
      const bankTime = (bankEndTime - bankStartTime).toFixed(2);

      // 💎 ENHANCED RESULT WITH ADMIN TRANSPARENCY
      const enhancedResult = {
        bankName: result.bankName || name,
        ...result,
        category: bankCategory,
        salaryMode: calculatorInput.salaryMode,
        adminApplied: true, // Marker for Logic Bridge
        // Pass through Admin config for UI display
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
  console.log('🏛️  === 12 BANKS CALCULATED ===');
  console.log('');

  // 🛡️ APPLY 5-LAYER PROTECTION AGAINST PROCESSING FEES (temporarily disabled for debugging)
  // const protectedResults = protectAgainstProcessingFee(results, 'realLoanService');
  // return protectedResults;

  return results;
};
