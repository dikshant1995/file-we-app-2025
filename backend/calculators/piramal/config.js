// Piramal Finance Configuration
// Configured strictly according to Master Excel Policy (BANKS POLICYS.xlsx - Sheet: PIRAMAL)
export const piramalConfig = {
  id: 'piramal',
  name: 'Piramal Finance',
  minAge: 21, // Minimum age requirement (Excel: 21 YEARS)
  maxAge: 63, // Maximum age at loan maturity (Excel: 63 YEARS)
  retirementAgeSalaried: 60, // Excel: 60 YEARS
  retirementAgeGovt: 63, // Excel: GOVT 63
  minCreditScore: 680,
  maxLoanTenure: 72, // 72 Months standard (Excel: 72M, OD: 84M, OD+ >1L Sal: 96M)
  maxLoanAmount: 5000000, // ₹50 Lakhs (Super A & A with 2L salary, 750+ CIBIL)
  bachelorMaxLoanAmount: 5000000,
  interestRate: 11.99, // Excel: 11.99% to 28% AS PER VENTILE SCORE
  processingFee: 0.0075,

  // Incentive policy
  incentivePercentage: 1.0, // 100% of average incentive
  incentivePeriodMonths: 3, // Last 3 months

  // Universal minimum NTH salary (Excel: 22+PF DEDUCT REQ)
  minNTH: 22000,
  pfDeductionRequired: true,

  // FOIR table based on NTH (Net Take-Home) salary
  nthFoirTable: {
    '22000-35000': {
      foir: 0.65,
      description: 'Entry to Mid-range NTH (₹22K-35K)'
    },
    '35001+': {
      foir: 0.70,
      description: 'Higher NTH (>₹35K)'
    }
  },

  minNTHByCategory: {
    'SUPER A': 22000,
    'A': 22000,
    'B': 22000,
    'C': 22000,
    'D': 22000,
    'GOVT': 22000,
    'ALL': 22000
  },

  // Maximum tenure by category (in months) (Excel: Standard 72M, OD 84M, OD+ >1L 96M)
  maxTenureByCategory: {
    'SUPER A': 72,
    'A': 72,
    'GOVT': 72,
    'B': 72,
    'C': 72,
    'D': 72,
    'UNLISTED': 72
  },

  categories: {
    'SUPER A': { description: 'Super A corporate profile' },
    'A': { description: 'Category A corporate profile' },
    'B': { description: 'Category B corporate profile' },
    'C': { description: 'Category C corporate profile' },
    'D': { description: 'Category D corporate profile' },
    'GOVT': { description: 'Government & Public Sector' },
    'ALL': { description: 'All applicants' }
  },

  employmentTypes: ['salaried', 'self-employed', 'all'],
  specialPrograms: ['accessible-lending', 'income-focused', 'simplified-approval', 'od-program-96m'],

  calculationMethod: 'FOIR-Only',
  approach: 'Ventile Score & NTH-Based Matrix',
  keyFeatures: [
    'Minimum NTH: ₹22,000 + Mandatory PF Deduction (Excel: 22+PF DEDUCT REQ)',
    'Applicant Age: 21 to 63 Years (Govt Retirement: 63 Years)',
    'ROI: 11.99% to 28.00% as per Ventile Score',
    'Standard Tenure: 12 to 72 Months (OD: 84 Months, OD+ >1L Sal: 96 Months)',
    'Max Loan: ₹50L (Cat A/Super A), ₹30L (Govt), Case to Case (B/C/D)',
    'Balance Transfer: 2 Credit Cards BT allowed with 1 Personal Loan BT'
  ],

  // Balance Transfer (BT) Configuration (Excel: 2 CC BT ALLOW WITH 1 PL BT)
  btConfig: {
    isAvailable: true,
    maxLoansForBT: 5,
    maxCreditCardsForBT: 2,
    requirePersonalLoanWithCcBt: true,
    acceptsFintechLoans: false,
    description: 'Piramal Finance allows BT for up to 2 Credit Cards when consolidated with 1 Personal Loan BT'
  }
};