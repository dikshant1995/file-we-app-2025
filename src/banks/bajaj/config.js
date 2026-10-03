// Bajaj Finance Configuration
// Strictly configured from Master Excel Policy (BANKS POLICYS.xlsx - Sheet: BAJAJ)

export const bajajConfig = {
  id: 'bajaj',
  name: 'Bajaj Finance',
  minAge: 23, // Excel: MINIMUM APLICANT AGE: 23 YEARS
  maxAge: 59, // Excel: MAXIMUM AGE AT LOAN TIME: 59 YEARS
  retirementAge: 59,
  retirementAgeSalaried: 59,
  retirementAgeGovt: 65, // Excel: RETIREMENT PROOF REQ FOR 65 YEARS
  minCreditScore: 650,
  minSalaryListed: 27000, // Excel: MINIMUM SALARY AT LOAN TIME: LISTED 27K
  minSalaryUnlisted: 30000, // Excel: UNLISTED 30K
  minSalary: 27000,
  minTotalExperience: 0, // Excel: MINI WORK EXPRINCE: NO REQUIRED
  minCurrentCompanyExperience: 0,
  maxLoanTenureMonths: 96, // Excel: 12 to 96 MONTHS (8 Years)
  maxLoanTenureHighSalary: 108, // Excel: 108 TENURE FOR 1LAC+ SALARY
  minLoanAmount: 100000, // Excel: 1LAC
  maxLoanAmount: 5000000, // Excel: 50LAC
  unlistedMaxLoan: 2800000, // Excel: UNLISTED M 28LAC
  salLiteMaxLoan: 1400000, // Excel: SAL LITE 14LAC
  creditCardObligationPercent: 0.05, // Excel: CC OBLIGATION: 5% OBLIGATE
  maxCcBtMultiple: 6, // Excel: AND MORE THEN 6 TIME NOT ALLOW

  btConfig: {
    isAvailable: true,
    maxCreditCardMultiple: 6,
    description: 'Bajaj Finance allows Credit Card BT provided CC POS <= 6x monthly income'
  },

  employmentTypes: ['salaried', 'private', 'government', 'salaried_professional'],

  // ROI Rules (Excel Section 2):
  // 10L Above: 10%, 1 to 12 Lac (Sal Lite): 16%, Default case calculation: 14%
  defaultRoi: 14.00,
  roiAbove10L: 10.00,
  roiSalLite: 16.00,

  // Multiplier matrix by company grade and salary bracket (Excel Section 6):
  multiplierMatrix: {
    'SUPER GREEN': { below50k: 18, from50kTo75k: 20, from75kTo2L: 22, above2L: 24 },
    'GREEN': { below50k: 16, from50kTo75k: 16, from75kTo2L: 22, above2L: 24 },
    'AMBAR': { below50k: 12, from50kTo75k: 12, from75kTo2L: 16, above2L: 16 },
    'RED': { below50k: 10, from50kTo75k: 10, from75kTo2L: 10, above2L: 10 },
    'DARK RED': { listed: 14, unlisted: 12 }
  }
};
