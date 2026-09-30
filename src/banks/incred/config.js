// InCred Finance Configuration
// Configured strictly according to Master Policy & Excel Screenshot

export const incredConfig = {
  id: 'incred',
  name: 'InCred Finance',
  minAge: 21,
  maxAge: 55,
  retirementAge: 55,
  minSalary: 15000,
  minTotalExperience: 3, // 3 Months
  minCurrentCompanyExperience: 3,
  minLoanAmount: 50000,
  maxLoanAmount: 1500000, // 15 Lakhs
  minTenureMonths: 24,
  maxTenureMonths: 60,
  minInterestRate: 13.49,
  maxInterestRate: 33.00,
  defaultInterestRate: 13.49,
  processingFeePercent: '2% to 5%',
  creditCardObligationPercent: 0.05,
  goldLoanObligationPercent: 0.05,
  kccObligationPercent: 0.05,
  isFoirOnly: true,

  btConfig: {
    isAvailable: false,
    maxCreditCardsForBT: 0,
    description: 'Credit Card Balance Transfer (CC BT) is strictly NOT allowed'
  },

  salaryFoirSlabs: [
    { band: '15k-20k', minSalary: 15000, maxSalary: 20000, baseFoir: 0.40, aaBonusFoir: 0.05, maxFoir: 0.45 },
    { band: '20k-30k', minSalary: 20001, maxSalary: 30000, baseFoir: 0.50, aaBonusFoir: 0.05, maxFoir: 0.55 },
    { band: '30k-40k', minSalary: 30001, maxSalary: 40000, baseFoir: 0.60, aaBonusFoir: 0.05, maxFoir: 0.65 },
    { band: '40k+', minSalary: 40001, maxSalary: Infinity, baseFoir: 0.65, aaBonusFoir: 0.05, maxFoir: 0.70 }
  ]
};
