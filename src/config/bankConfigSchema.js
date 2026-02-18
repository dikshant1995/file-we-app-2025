/**
 * Complete Bank Configuration Schema
 * This defines ALL possible settings for EACH bank individually
 */

export const defaultBankConfig = {
  // Basic Bank Info
  bankInfo: {
    id: '',
    name: '',
    enabled: true,
    logo: '🏦',
    color: '#667eea',
    description: ''
  },

  // Interest Rates
  interestRates: {
    defaultRate: 11.0,
    categorySpecificRates: {
      A: 11.0,
      B: 11.0,
      C: 11.0,
      D: 11.0
    },
    creditScoreBasedRates: [
      { minScore: 750, rate: 10.5 },
      { minScore: 700, rate: 11.0 },
      { minScore: 650, rate: 11.5 }
    ]
  },

  // Category Configuration (A, B, C, D)
  categories: {
    A: {
      salaryRange: { min: 100000, max: null },
      foir: 65,
      multiplier: 35,
      maxTenureMonths: 84,
      maxLoanAmount: null,
      description: 'Top-tier companies, Listed MNCs'
    },
    B: {
      salaryRange: { min: 75000, max: 99999 },
      foir: 60,
      multiplier: 30,
      maxTenureMonths: 84,
      maxLoanAmount: null,
      description: 'Mid-tier companies, Established firms'
    },
    C: {
      salaryRange: { min: 50000, max: 74999 },
      foir: 55,
      multiplier: 25,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'Small companies, Startups'
    },
    D: {
      salaryRange: { min: 25000, max: 49999 },
      foir: 50,
      multiplier: 20,
      maxTenureMonths: 60,
      maxLoanAmount: null,
      description: 'Entry-level, Small businesses'
    }
  },

  // Loan Amount Capping
  loanCapping: {
    absoluteMaxLoan: 5000000, // 50 Lakhs
    categoryBasedMax: {
      A: null, // No limit
      B: 3000000, // 30 Lakhs
      C: 2000000, // 20 Lakhs
      D: 1000000  // 10 Lakhs
    },
    employmentTypeMax: {
      salaried: null,
      selfEmployed: 3000000
    },
    bachelorCapping: {
      enabled: true,
      percentage: 50 // 50% of regular loan
    },
    minLoanAmount: 100000 // 1 Lakh minimum
  },

  // Age-Based Rules
  ageRules: {
    minAge: 21,
    maxAge: 60,
    retirementAge: {
      salaried: 60,
      selfEmployed: 65,
      government: 62
    },
    maxAgeAtLoanEnd: 60, // Age + Tenure should not exceed this
    ageBasedTenureAdjustment: true
  },

  // Tenure Rules
  tenureRules: {
    minTenureMonths: 12,
    maxTenureMonths: 84,
    categoryBasedMaxTenure: {
      A: 84,
      B: 84,
      C: 72,
      D: 60
    },
    allowedTenures: [12, 24, 36, 48, 60, 72, 84], // Specific allowed values
    ageAdjustedTenure: true
  },

  // FOIR (Fixed Obligation to Income Ratio) Settings
  foirSettings: {
    categoryBasedFOIR: {
      A: 65,
      B: 60,
      C: 55,
      D: 50
    },
    creditCardObligationPercentage: 5, // 5% of CC outstanding treated as obligation
    btModeFOIRAdjustment: 0, // Additional FOIR % for BT mode
    includeExistingEMI: true
  },

  // Multiplier Rules
  multiplierRules: {
    categoryBasedMultiplier: {
      A: 35,
      B: 30,
      C: 25,
      D: 20
    },
    employmentTypeMultiplier: {
      salaried: 1.0, // 100%
      selfEmployed: 0.8 // 80% of salaried
    },
    creditScoreMultiplier: [
      { minScore: 750, multiplier: 1.1 }, // 10% bonus
      { minScore: 700, multiplier: 1.0 },
      { minScore: 650, multiplier: 0.9 } // 10% penalty
    ]
  },

  // Balance Transfer Configuration
  btConfiguration: {
    enabled: true,
    maxLoansForBT: 3,
    creditCardBTSupported: true,
    fintechLoanAccepted: true,
    topUpAllowed: true,
    topUpCalculation: 'FOIR', // or 'MULTIPLIER'
    processingFeePercentage: 1.5,
    minBTAmount: 100000,
    restrictions: {
      sameBank: false, // Can't BT from same bank
      minExistingTenure: 12 // Loan should be at least 12 months old
    }
  },

  // Credit Score Rules
  creditScoreRules: {
    minCreditScore: 650,
    recommendedScore: 700,
    premiumScore: 750,
    scoreBasedBenefits: {
      750: { rateReduction: 0.5, multiplierBonus: 1.1 },
      700: { rateReduction: 0.0, multiplierBonus: 1.0 },
      650: { rateReduction: 0.0, multiplierBonus: 0.9 }
    },
    autoRejectionThreshold: 600
  },

  // Employment Type Rules
  employmentRules: {
    salaried: {
      categories: ['A', 'B', 'C', 'D'],
      companyTypes: {
        listed: { multiplierBonus: 1.1, foirBonus: 5 },
        unlisted: { multiplierBonus: 1.0, foirBonus: 0 }
      },
      minSalary: 25000,
      requiredDocuments: ['salarySlips', 'bankStatement', 'idProof']
    },
    selfEmployed: {
      categories: ['A', 'B', 'C'],
      itrRequirement: {
        years: 2,
        minAnnualIncome: 300000
      },
      businessVintage: 24, // months
      multiplierAdjustment: 0.8,
      requiredDocuments: ['itr', 'bankStatement', 'businessProof', 'idProof']
    }
  },

  // Document Requirements
  documentRequirements: {
    salaried: {
      salarySlips: { months: 3, mandatory: true },
      bankStatements: { months: 6, mandatory: true },
      idProof: { types: ['Aadhar', 'PAN', 'Passport'], mandatory: true },
      addressProof: { types: ['Aadhar', 'Passport', 'Utility Bill'], mandatory: true },
      employmentProof: { types: ['Offer Letter', 'ID Card'], mandatory: false }
    },
    selfEmployed: {
      itr: { years: 2, mandatory: true },
      bankStatements: { months: 12, mandatory: true },
      businessProof: { types: ['GST Certificate', 'Shop Act'], mandatory: true },
      idProof: { types: ['Aadhar', 'PAN', 'Passport'], mandatory: true },
      addressProof: { types: ['Aadhar', 'Passport', 'Utility Bill'], mandatory: true }
    }
  },

  // Special Rules & Exceptions
  specialRules: {
    bachelorCapping: {
      enabled: true,
      cappingPercentage: 50,
      appliesTo: ['unmarried', 'bachelor']
    },
    existingCustomerBenefits: {
      enabled: true,
      rateReduction: 0.25,
      processingFeeWaiver: 50 // 50% waiver
    },
    creditCardHolderBenefits: {
      enabled: false,
      rateReduction: 0.1
    },
    promotionalOffers: [],
    vipCustomerRules: {
      enabled: false,
      criteria: 'income > 200000',
      benefits: { rateReduction: 0.5, feeWaiver: 100 }
    }
  },

  // Rejection Reasons
  rejectionReasons: {
    lowIncome: 'Monthly income below minimum requirement',
    lowCreditScore: 'Credit score below minimum threshold',
    ageExceeded: 'Age exceeds maximum limit',
    highObligations: 'Existing obligations too high (FOIR exceeded)',
    insufficientDocuments: 'Required documents not provided',
    categoryNotSupported: 'Employment category not supported',
    custom: []
  },

  // Processing Fees & Charges
  feesAndCharges: {
    processingFee: {
      percentage: 3.5,
      minAmount: 5000,
      maxAmount: 50000,
      gstApplicable: true,
      gstPercentage: 18
    },
    btCharges: {
      percentage: 1.5,
      minAmount: 2500,
      maxAmount: 25000
    },
    documentationCharges: 1000,
    legalCharges: 2000,
    prepaymentCharges: {
      percentage: 4,
      lockInPeriod: 12 // months
    },
    lateFeePercentage: 2
  },

  // Calculation Method
  calculationMethod: {
    primary: 'FOIR', // FOIR or MULTIPLIER
    fallback: 'MULTIPLIER',
    takeLowerAmount: true // Use lower of FOIR and Multiplier
  }
};

// Export a function to create a new bank config with defaults
export const createBankConfig = (bankId, bankName) => {
  const config = JSON.parse(JSON.stringify(defaultBankConfig));
  config.bankInfo.id = bankId;
  config.bankInfo.name = bankName;
  return config;
};

export default defaultBankConfig;
