// Axis Finance Configuration according to BANKS POLICYS.xlsx (Sheet: AXIS FINANCE)
export const axisFinConfig = {
  id: 'axis-fin',
  name: 'Axis Finance',
  minAge: 21, // Minimum age requirement (Excel: MINIMUM APLICANT AGE: 21)
  maxAge: 60, // Maximum age at loan maturity (Excel: MAXIMUM AGE AT LOAN TIME: 60)
  minCreditScore: 0, // No hard cutoff (score based program)
  minSalaryUrban: 30000,
  minSalaryRural: 25000,
  minSalary: 25000, // Universal minimum salary requirement
  minWorkExperienceMonths: 6, // 6 MONTHS
  interestRate: 13.50, // Base Super A / Govt ROI

  // Category-specific interest rates (Excel Section 2)
  roiByCategory: {
    'SUPER-A': 13.50,
    'SUPER A': 13.50,
    'A': 14.50,
    'B': 15.00,
    'C': 16.00,
    'D': 16.00,
    'GOVT': 13.50
  },
  btInterestRate: 18.00, // CC BT and App Loan BT ROI 18% applicable

  // FOIR limits by company category (Excel Section 3)
  foirByCategory: {
    'SUPER-A': 0.70,
    'SUPER A': 0.70,
    'A': 0.70,
    'B': 0.65,
    'C': 0.60,
    'D': 0.50,
    'GOVT': 0.70
  },

  // Multiplier table based on salary slabs (Excel Section 3: "COM CAT NOT REQ FOR FOIR AND MULTIPLIER")
  // Category D has no multiplier (processed via FOIR)
  multiplierSlabs: [
    { minSalary: 0, maxSalary: 49999, multiplier: 24, label: '< 50K' },
    { minSalary: 50000, maxSalary: 74999, multiplier: 26, label: '50K TO 75K' },
    { minSalary: 75000, maxSalary: 99999, multiplier: 28, label: '75K TO 1 LAC' },
    { minSalary: 100000, maxSalary: Infinity, multiplier: 30, label: '1 LAC ABOVE' }
  ],

  // Maximum loan amounts by category (Excel Section 5: MINIMUM LOAN AMOUNT AND MAX LOAN AMOUNT)
  maxLoanByCategory: {
    'SUPER-A': 5000000,
    'SUPER A': 5000000,
    'A': 5000000,
    'B': 2500000,
    'C': 2000000,
    'D': 1000000,
    'GOVT': 5000000
  },
  minLoanAmount: 100000, // 1 LAC
  maxLoanAmount: 5000000, // 50 LAC

  // Maximum tenure by category in months (Excel Section 4)
  maxTenureByCategory: {
    'SUPER-A': 84, // 7 years
    'SUPER A': 84,
    'A': 72,       // 6 years
    'B': 72,       // 6 years
    'C': 60,       // 5 years
    'D': 60,       // 5 years
    'GOVT': 84     // 7 years
  },

  // Demographics and obligations (Excel Section 1)
  ccObligationPercent: 5, // 5% OBLIGATE
  maxCreditCardsForBT: 5, // 5 CC BT ALLOW
  goldLoanObligationPercent: 1, // GOLD LOAN OBLIGATION 1% COUNT
  goldLoanObligationText: 'GOLD LOAN OBLIGATION 1% COUNT',
  kccExemptionLimit: 1500000, // KCC OBLIGATION UPTO 15LAC = 0 OBLIGATE
  kccObligationText: 'KCC OBLIGATION UPTO 15LAC = 0 OBLIGATE',

  employmentTypes: ['salaried', 'private', 'government'],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true,
    maxLoansForBT: 5,
    maxCreditCardsForBT: 5,
    btInterestRate: 18.00,
    description: 'Axis Finance allows BT for personal loans and up to 5 Credit Cards at 18% p.a.'
  }
};