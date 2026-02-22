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
    // Balance Transfer specific data
    isBTMode: isBTMode,
    loansForBT: isBTMode ? userData.loansForBT : [],
    btTotalEMI: isBTMode ? userData.loansForBT.reduce((sum, loan) => sum + (parseFloat(loan.monthlyEMI) || 0), 0) : 0,
    btTotalOutstanding: isBTMode ? userData.loansForBT.reduce((sum, loan) => sum + (parseFloat(loan.outstandingAmount) || 0), 0) : 0,
    // Location Data for Pan-India Rules
    state: userData.state || (userData._metadata && userData._metadata.state) || '',
    city: userData.city || (userData._metadata && userData._metadata.city) || ''
    // Note: Interest rate is fixed at 11% for all banks, so we don't pass it from user input
  };

  console.log('⚙️  Transformed input for calculators:', calculatorInput);
  console.log('🚨 EXISTING LOAN BANKS:', calculatorInput.existingLoanBanks);
  console.log('🏭 Company Name:', calculatorInput.companyName);
  console.log('');

  // Array of bank calculators with their names and configs
  const bankCalculators = [
    // 4 NEW BANKS: With company database + dynamic rates
    { name: 'Kotak Mahindra Bank', calculator: calculateKotakEligibility, config: kotakConfig, hasDatabase: true },
    { name: 'Tata Capital', calculator: calculateTataEligibility, config: tataConfig, hasDatabase: true },
    { name: 'Poonawala Finance', calculator: calculatePoonawalaEligibility, config: poonawalaConfig, hasDatabase: true },
    { name: 'IDFC Bank', calculator: calculateIdfcEligibility, config: idfcConfig, hasDatabase: true },

    // 8 OLD BANKS: No database, default Category B + 11% rate
    { name: 'HDFC Bank', calculator: calculateHdfcEligibility, config: hdfcConfig, hasDatabase: true },
    { name: 'ICICI Bank', calculator: calculateIciciEligibility, config: iciciConfig, hasDatabase: true },
    { name: 'Bandhan Bank', calculator: calculateBandhanEligibility, config: bandhanConfig, hasDatabase: false },
    { name: 'Cholamandalam Finance', calculator: calculateCholaEligibility, config: cholaConfig, hasDatabase: true },
    { name: 'Axis Finance', calculator: calculateAxisFinEligibility, config: axisFinConfig, hasDatabase: true },
    { name: 'IndusInd Bank', calculator: calculateIndusindEligibility, config: indusindConfig, hasDatabase: true },
    { name: 'Shri Ram Finance', calculator: calculateShriRamEligibility, config: shriRamConfig, hasDatabase: false },
    { name: 'Piramal Finance', calculator: calculatePiramalEligibility, config: piramalConfig, hasDatabase: false }
  ];

  // Calculate eligibility for each bank
  console.log('🏛️  Calling 12 banks (4 with database, 8 with default Category B)...');
  console.log('='.repeat(60));

  const results = await Promise.all(bankCalculators.map(async ({ name, calculator, config, hasDatabase }, index) => {
    const bankStartTime = performance.now();
    console.log(`🏦 [${index + 1}/12] Calculating: ${name}...`);

    try {
      let bankCategory;

      if (hasDatabase) {
        // NEW BANKS: Look up category from database
        const bankDbKey = name.toLowerCase().replace(/\s+/g, '').includes('kotak') ? 'kotak'
          : name.toLowerCase().replace(/\s+/g, '').includes('tata') ? 'tata'
            : name.toLowerCase().replace(/\s+/g, '').includes('poonawala') ? 'poonawala'
              : name.toLowerCase().replace(/\s+/g, '').includes('idfc') ? 'idfc'
                : name.toLowerCase().replace(/\s+/g, '').includes('hdfc') ? 'hdfc'
                  : name.toLowerCase().replace(/\s+/g, '').includes('icici') ? 'icici'
                    : name.toLowerCase().replace(/\s+/g, '').includes('chola') ? 'chola'
                      : name.toLowerCase().replace(/\s+/g, '').includes('indusind') ? 'indusind'
                        : name.toLowerCase().replace(/\s+/g, '').includes('axis') ? 'axis_fin'
                          : null;

        if (bankDbKey && calculatorInput.companyName) {
          bankCategory = await getCompanyCategoryForBank(calculatorInput.companyName, bankDbKey);

          // HDFC Specific Mapping (IDFC keys to HDFC keys)
          if (bankDbKey === 'hdfc') {
            if (bankCategory === 'SCATA') bankCategory = 'Super A';
            else if (bankCategory === 'CATGA') bankCategory = 'A';
            else if (bankCategory === 'CATGB') bankCategory = 'B';
            else if (bankCategory === 'CATGC') bankCategory = 'C';
            else if (bankCategory === 'GOVT') bankCategory = 'Govt';
            // Any other category (like UNLISTED) remains as is
          }

          console.log(`   🏭 ${name}: ${calculatorInput.companyName} → ${bankCategory}`);
        } else {
          bankCategory = calculatorInput.category;
        }
      } else {
        // OLD BANKS: Default to Category B
        bankCategory = 'B';
        console.log(`   🏭 ${name}: Using default Category B (no database)`);
      }

      // Create bank-specific input with correct category
      const bankInput = {
        ...calculatorInput,
        category: bankCategory
      };

      const result = calculator(bankInput);
      const bankEndTime = performance.now();
      const bankTime = (bankEndTime - bankStartTime).toFixed(2);

      // Enhance result with config data for TRANSPARENCY
      const enhancedResult = {
        bankName: result.bankName || name,
        ...result,
        // Add config info to show HOW bank calculated
        btConfig: config.btConfig,
        incentivePercentage: config.incentivePercentage,
        incentivePeriodMonths: config.incentivePeriodMonths,
        bachelorMaxLoanAmount: config.bachelorMaxLoanAmount,
        category: bankCategory, // Show the category used for this bank
        employmentType: calculatorInput.employmentType,
        // BT-specific metadata
        isBTMode: calculatorInput.isBTMode,
        btTotalEMI: calculatorInput.btTotalEMI,
        btTotalOutstanding: calculatorInput.btTotalOutstanding,
        loansForBT: calculatorInput.loansForBT
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
  }));

  console.log('='.repeat(60));
  console.log('🏛️  === 12 BANKS CALCULATED ===');
  console.log('');

  // 🛡️ APPLY 5-LAYER PROTECTION AGAINST PROCESSING FEES (temporarily disabled for debugging)
  // const protectedResults = protectAgainstProcessingFee(results, 'realLoanService');
  // return protectedResults;

  return results;
};
