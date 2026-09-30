// ICICI Bank Master Configuration from BANKS POLICYS.xlsx
export const iciciConfig = {
  id: 'icici',
  name: 'ICICI Bank',
  minAge: 21, // Minimum age requirement
  maxAge: 60, // Maximum age at loan maturity (Pensioner: 65)
  maxAgePensioner: 65,
  minCreditScore: 725, // CIBIL 725+ (CIBIL -1 is doable)
  allowNtc: true,
  maxLoanTenure: 6, // 6 Years (72 Months)
  maxLoanAmount: 10000000, // ₹1 Crore
  rajasthanMinLoan: 610000, // In Rajasthan minimum ticket size is ₹6.10 Lakhs
  bachelorMaxLoanAmount: null, // No restriction
  interestRate: 10.30,
  processingFee: 0.008,

  // Incentive policy
  incentivePercentage: 0.0, // 0%
  incentivePeriodMonths: 0,

  // FOIR table based on salary bands
  foirTable: {
    '<50000': 0.50,
    '>=50000': 0.65,
    'hlRunning': 0.70
  },

  // Minimum salary requirements by category
  minSalary: {
    'Super Prime': 30000,
    'Preferred': 30000,
    'Elite': 30000,
    'Open Market': 75000,
    'Govt': 25000,
    'Army Profile': 25000,
    'A': 30000,
    'B': 30000,
    'C': 75000,
    'D': 75000,
    'UNLISTED': 75000
  },
  // Maximum tenure by category (in months) - Up to 6 Years (72 Months) flat
  maxTenureByCategory: {
    'Super Prime': 72,
    'Preferred': 72,
    'Elite': 72,
    'Open Market': 72,
    'Govt': 72,
    'Army Profile': 72,
    'A': 72,
    'B': 72,
    'C': 72,
    'D': 72,
    'UNLISTED': 72
  },
  employmentTypes: ['salaried', 'self-employed', 'government'],
  specialPrograms: ['icici-premier', 'young-professional', 'self-employed-plus'],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true,
    maxLoansForBT: 5,
    acceptsFintechLoans: false,
    description: 'ICICI allows balance transfer for up to 5 existing personal loans (excluding Fintech loans)'
  }
};