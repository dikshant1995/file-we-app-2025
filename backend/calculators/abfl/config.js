import { ABFL_BANK_EXCEL_POLICY, getAbflROI } from '../../../src/config/abflBankPolicy.js';

export const abflConfig = {
  id: 'abfl',
  name: 'Aditya Birla Finance',
  minAge: 21,
  maxAge: 60,
  retirementAge: 60,
  minWorkExperienceYears: 1,
  minWorkExperienceMonths: 12,
  minCreditScore: 0,
  minLoanAmount: 100000,
  maxLoanAmount: 5000000,
  enhancedMaxLoanAmount: 6500000,
  interestRate: 13.45,

  minSalaryByTier: {
    'TIER 1': 40000,
    'TIER 2': 35000,
    'TIER 3': 25000,
    'TIER 4': 20000,
    'METRO': 40000,
    'OTHERS': 20000
  },

  maxLoanMatrix: {
    'SUPER A': { VLR: 5000000, LR: 5000000, MR: 4000000, HR: 4000000, minLoan: 100000 },
    'SUPER-A': { VLR: 5000000, LR: 5000000, MR: 4000000, HR: 4000000, minLoan: 100000 },
    'A': { VLR: 5000000, LR: 5000000, MR: 4000000, HR: 4000000, minLoan: 100000 },
    'GOVT': { VLR: 5000000, LR: 5000000, MR: 4000000, HR: 4000000, minLoan: 100000 },
    'B': { VLR: 4000000, LR: 4000000, MR: 4000000, HR: 4000000, minLoan: 100000 },
    'C': { VLR: 4000000, LR: 4000000, MR: 3500000, HR: 3000000, minLoan: 100000 },
    'D': { VLR: 3000000, LR: 2500000, MR: 1500000, HR: 1000000, minLoan: 100000 },
    'OTHERS': { VLR: 800000, LR: 800000, MR: 500000, HR: 500000, minLoan: 100000 },
    'NC': { VLR: 800000, LR: 800000, MR: 500000, HR: 500000, minLoan: 100000 }
  },

  employmentTypes: ['salaried', 'private', 'government'],

  foirMatrix: ABFL_BANK_EXCEL_POLICY.foirPolicyMatrix,
  tenureRules: ABFL_BANK_EXCEL_POLICY.tenureRules,

  getAbflRate: (category, income, loanAmount, cibil, tier, isBT, programType, isHybridOd, paperlessBt) => {
    return getAbflROI({
      category,
      monthlyIncome: income,
      loanAmount,
      cibilScore: cibil,
      cityTier: tier,
      isBT,
      programType,
      isHybridOd,
      paperlessBt
    });
  }
};
