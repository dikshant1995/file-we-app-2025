import { ABFL_BANK_EXCEL_POLICY, getAbflROI } from '../../config/abflBankPolicy.js';

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

  // Table 1: Tier-based Minimum Salary
  minSalaryByTier: {
    'TIER 1': 40000,
    'TIER 2': 35000,
    'TIER 3': 25000,
    'TIER 4': 20000,
    'METRO': 40000,
    'OTHERS': 20000
  },

  // Table 4: Max Loan Amount Matrix by Company Category & Risk Segment
  maxLoanMatrix: {
    'SUPER A': { VLR: 5000000, LR: 5000000, MR: 4000000, HR: 4000000, minLoan: 1000000 },
    'SUPER-A': { VLR: 5000000, LR: 5000000, MR: 4000000, HR: 4000000, minLoan: 1000000 },
    'A': { VLR: 5000000, LR: 5000000, MR: 4000000, HR: 4000000, minLoan: 1000000 },
    'GOVT': { VLR: 5000000, LR: 5000000, MR: 4000000, HR: 4000000, minLoan: 1000000 },
    'B': { VLR: 4000000, LR: 4000000, MR: 4000000, HR: 4000000, minLoan: 1000000 },
    'C': { VLR: 4000000, LR: 4000000, MR: 3500000, HR: 3000000, minLoan: 500000 },
    'D': { VLR: 3000000, LR: 2500000, MR: 1500000, HR: 1000000, minLoan: 500000 },
    'OTHERS': { VLR: 800000, LR: 800000, MR: 500000, HR: 500000, minLoan: 500000 },
    'NC': { VLR: 800000, LR: 800000, MR: 500000, HR: 500000, minLoan: 500000 }
  },

  // Table 2: FOIR Matrix (NO HL vs EVER HL/LAP)
  foirMatrix: ABFL_BANK_EXCEL_POLICY.foirPolicyMatrix,

  // Table 3: Tenure Rules
  tenureRules: ABFL_BANK_EXCEL_POLICY.tenureRules,

  // ROI Calculator helper
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
