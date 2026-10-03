// Kotak Mahindra Bank Configuration (Fully verified & aligned with BANKS POLICYS.xlsx - Sheet: KOTAK & Admin Panel)
export const kotakConfig = {
  id: 'kotak',
  name: 'Kotak Mahindra Bank',
  minAge: 21,
  maxAge: 60,
  retirementAge: 60,
  minCreditScore: 650,
  minTenureMonths: 24, // 2 Years minimum tenure
  maxLoanTenure: 72,   // 6 Years maximum tenure (in months)
  minLoanAmount: 100000, // ₹1 Lakh
  maxLoanAmount: 10000000, // ₹1 Crore
  maxLoanAmountByCategory: {
    'Super A': 10000000,
    'AA': 10000000,
    'A': 10000000,
    'GOVT': 10000000,
    'B': 10000000,
    'C': 3500000,
    'D': 2000000
  },
  interestRate: 9.95,
  roiMatrix: {
    'Super A': { above15L: 9.95, '10Lto15L': 10.50, below10L: 10.99 },
    'AA': { above15L: 9.95, '10Lto15L': 10.50, below10L: 10.99 },
    'A': { above15L: 9.95, '10Lto15L': 10.50, below10L: 10.99 },
    'GOVT': { above15L: 9.95, '10Lto15L': 10.50, below10L: 10.99 },
    'B': { above15L: 9.95, '10Lto15L': 10.50, below10L: 10.99 },
    'C': { above15L: 11.00, '10Lto15L': 11.50, below10L: 12.00 },
    'D': { above15L: 12.00, '10Lto15L': 12.50, below10L: 13.00 }
  },
  // Minimum salary requirements by category
  minSalary: {
    'Super A': 25000,
    'AA': 25000,
    'A': 25000,
    'GOVT': 25000,
    'B': 25000,
    'C': 35000,
    'D': 35000
  },
  // Maximum tenure by category (in months)
  maxTenureByCategory: {
    'Super A': 72,
    'AA': 72,
    'A': 72,
    'GOVT': 72,
    'B': 72,
    'C': 72,
    'D': 60
  },
  // Multipliers by category
  multipliers: {
    'Super A': 31,
    'AA': 31,
    'A': 27,
    'GOVT': 27,
    'B': 25,
    'C': 20,
    'D': 18
  },
  // FOIR percentages by category
  foirByCategory: {
    'Super A': 0.70,
    'AA': 0.70,
    'A': 0.70,
    'GOVT': 0.70,
    'B': 0.70,
    'C': 0.70,
    'D': 0.60
  },
  liveHlBonusFoir: 0.05, // +5% if Home Loan is live and >= 10 Lakhs
  ccObligationPercent: 0.05, // 5% of CC outstanding
  minWorkExperienceMonths: 1, // 1 Month
  minCurrentCompanyExperienceMonths: 1,
  employmentTypes: ['salaried', 'government'],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true,
    allowCcBt: false, // CC BT NOT ALLOW
    maxLoansForBT: 6,
    acceptsFintechLoans: false,
    description: 'Kotak allows balance transfer for Personal Loans only. Credit Card Balance Transfer is strictly NOT allowed.'
  }
};