// ICICI Bank Master Configuration from BANKS POLICYS.xlsx (ICICI)
export const iciciConfig = {
  id: 'icici',
  name: 'ICICI Bank',
  minAge: 21, // Minimum applicant age: 21 Years
  maxAge: 60, // Maximum age at loan maturity: 60 Years (Pensioner: 65 Years)
  maxAgePensioner: 65,
  minCreditScore: 725, // CIBIL 725+ (CIBIL -1 is doable)
  allowNtc: true,
  maxLoanTenure: 6, // 6 Years (72 Months)
  maxLoanAmount: 10000000, // ₹1 Crore for Super Prime, Preferred, Govt
  rajasthanMinLoan: 610000, // In Rajasthan minimum ticket size is ₹6.10 Lakhs
  bachelorMaxLoanAmount: null, // No bachelor limit in Excel policy
  interestRate: 10.30,
  processingFee: 0.008, // 0.8% processing fee

  // Incentive policy
  incentivePercentage: 0.0,
  incentivePeriodMonths: 0,

  // FOIR table based on salary bands
  foirTable: {
    '<30000': 0.45,
    '30000-50000': 0.55,
    '>50000': 0.65,
    'hlRunning': 0.70
  },

  // Minimum salary requirements by category (Excel: Govt 25k, Pvt 30k, Open Market 75k, NRI 2L)
  minSalary: {
    'Super Prime': 30000,
    'SUPER PRIME': 30000,
    'Super A': 30000,
    'Preferred': 30000,
    'PREFERRED': 30000,
    'A': 30000,
    'Elite': 30000,
    'ELITE': 30000,
    'B': 30000,
    'Open Market': 75000,
    'OPEN MARKET': 75000,
    'C': 75000,
    'D': 75000,
    'UNLISTED': 75000,
    'Govt': 25000,
    'GOVT': 25000,
    'Army Profile': 25000,
    'ARMY PROFILE': 25000,
    'NRI Case': 200000,
    'NRI CASE': 200000
  },

  // Category loan amount upper limits
  categoryMaxLoan: {
    'Super Prime': 10000000, // 1 CR
    'Preferred': 10000000,   // 1 CR
    'Govt': 10000000,        // 1 CR
    'Elite': 900000,         // 9 LAC (6L to 9L)
    'Open Market': 1500000,  // 15 LAC (6L to 15L)
    'Army Profile': 1000000, // 10 LAC
    'NRI Case': 1000000      // 10 LAC (6L to 10L)
  },

  // Category loan amount lower limits
  categoryMinLoan: {
    'Elite': 600000,        // 6 LAC
    'Open Market': 600000,  // 6 LAC
    'NRI Case': 600000      // 6 LAC
  },

  // Maximum tenure by category in months (Up to 6 Years / 72 Months)
  maxTenureByCategory: {
    'Super Prime': 72,
    'Preferred': 72,
    'Elite': 72,
    'Open Market': 72,
    'Govt': 72,
    'Army Profile': 72,
    'NRI Case': 72
  },

  employmentTypes: ['salaried', 'government'],
  specialPrograms: ['icici-premier', 'salaried-classic'],

  // Balance Transfer (BT) Configuration
  btConfig: {
    isAvailable: true,
    maxLoansForBT: 5,
    acceptsFintechLoans: false,
    description: 'ICICI Bank allows balance transfer for up to 5 existing personal loans'
  }
};