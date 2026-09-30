// Axis Finance Configuration according to Master Policy & Policy Updates
export const axisFinConfig = {
  id: 'axis-fin',
  name: 'Axis Finance',
  minAge: 21,
  maxAge: 60,
  minCreditScore: 0,
  minSalaryUrban: 30000,
  minSalaryRural: 30000,
  minSalary: 30000, // Universal minimum salary requirement ₹30,000
  minWorkExperienceMonths: 6,
  interestRate: 13.50,

  roiByCategory: {
    'SUPER-A': 13.50,
    'SUPER A': 13.50,
    'A': 14.50,
    'B': 15.00,
    'C': 16.00,
    'D': 16.00,
    'GOVT': 13.50
  },
  btInterestRate: 18.00,

  // FOIR & Multipliers depend strictly on Salary Slab only:
  // < 50k: FOIR 70%, Mult 24x
  // 50k-75k: FOIR 70%, Mult 26x
  // 75k-100k (75k above): FOIR 65%, Mult 28x
  // >= 100k (1 Lac above): FOIR 60%, Mult 30x
  salarySlabs: [
    { band: '<50k', minSalary: 30000, maxSalary: 49999, foir: 0.70, multiplier: 24, label: '< 50K (30k to <50k)' },
    { band: '50k-75k', minSalary: 50000, maxSalary: 74999, foir: 0.70, multiplier: 26, label: '50K TO 75K' },
    { band: '75k-100k', minSalary: 75000, maxSalary: 99999, foir: 0.65, multiplier: 28, label: '75K TO 1 LAC' },
    { band: '100k+', minSalary: 100000, maxSalary: Infinity, foir: 0.60, multiplier: 30, label: '1 LAC ABOVE' }
  ],

  multiplierSlabs: [
    { minSalary: 0, maxSalary: 49999, multiplier: 24, label: '< 50K' },
    { minSalary: 50000, maxSalary: 74999, multiplier: 26, label: '50K TO 75K' },
    { minSalary: 75000, maxSalary: 99999, multiplier: 28, label: '75K TO 1 LAC' },
    { minSalary: 100000, maxSalary: Infinity, multiplier: 30, label: '1 LAC ABOVE' }
  ],

  maxLoanByCategory: {
    'SUPER-A': 5000000,
    'SUPER A': 5000000,
    'A': 5000000,
    'B': 2500000,
    'C': 2000000,
    'D': 1000000,
    'GOVT': 5000000
  },
  minLoanAmount: 100000,
  maxLoanAmount: 5000000,

  maxTenureByCategory: {
    'SUPER-A': 84,
    'SUPER A': 84,
    'A': 72,
    'B': 72,
    'C': 60,
    'D': 60,
    'GOVT': 84
  },

  ccObligationPercent: 5,
  maxCreditCardsForBT: 5,
  goldLoanObligationPercent: 1,
  kccExemptionLimit: 1500000,

  employmentTypes: ['salaried', 'government'],

  btConfig: {
    isAvailable: true,
    maxLoansForBT: 5,
    maxCreditCardsForBT: 5,
    btInterestRate: 18.00,
    description: 'Axis Finance allows BT for personal loans and up to 5 Credit Cards at 18% p.a.'
  }
};