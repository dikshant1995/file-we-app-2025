// Exact Master Policy Configuration for PIRAMAL FINANCE from Excel (BANKS POLICYS.xlsx - Sheet: PIRAMAL)
export const PIRAMAL_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 11.99, note: 'AS PER VENTILE SCORE' },
    { category: 'A', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 11.99, note: 'AS PER VENTILE SCORE' },
    { category: 'B', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 12.99, note: 'AS PER VENTILE SCORE' },
    { category: 'C', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 13.99, note: 'AS PER VENTILE SCORE' },
    { category: 'D', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 14.99, note: 'AS PER VENTILE SCORE' },
    { category: 'Govt', minRoi: 11.99, maxRoi: 28.00, defaultRoi: 11.99, note: 'AS PER VENTILE SCORE' }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 22000, condition: '50LAC (2L salary req, 750+ CIBIL)' },
    { tier: 'A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 22000, condition: '50LAC (2L salary req, 750+ CIBIL)' },
    { tier: 'B', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 22000, condition: 'CASE TO CASE DEPEND' },
    { tier: 'C', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 22000, condition: 'CASE TO CASE DEPEND' },
    { tier: 'D', minLoan: 100000, maxLoan: 2000000, bachelorCap: null, minSalary: 22000, condition: 'CASE TO CASE DEPEND' },
    { tier: 'Govt', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 22000, condition: '30LAC' }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, maxMonthsHighIncomeOd: 96, description: '12 to 72M | OD: 84M | OD + >1L Salary: 96M' },
    { category: 'A', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, maxMonthsHighIncomeOd: 96, description: '12 to 72M | OD: 84M | OD + >1L Salary: 96M' },
    { category: 'B', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, maxMonthsHighIncomeOd: 84, description: '12 to 72M | OD: 84M' },
    { category: 'C', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, maxMonthsHighIncomeOd: 84, description: '12 to 72M | OD: 84M' },
    { category: 'D', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, maxMonthsHighIncomeOd: 84, description: '12 to 72M | OD: 84M' },
    { category: 'Govt', minMonths: 12, maxMonths: 72, maxMonthsOd: 84, maxMonthsHighIncomeOd: 84, description: '12 to 72M | OD: 84M' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 65, maxFoir: 70, multiplier: 30, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, slab2Foir: 65, maxFoir: 70, multiplier: 24, ccObligation: 5 },
    { category: 'B', slab1Foir: 45, slab2Foir: 55, maxFoir: 65, multiplier: 22, ccObligation: 5 },
    { category: 'C', slab1Foir: 40, slab2Foir: 50, maxFoir: 60, multiplier: 18, ccObligation: 5 },
    { category: 'D', slab1Foir: 40, slab2Foir: 50, maxFoir: 55, multiplier: 15, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 65, maxFoir: 70, multiplier: 24, ccObligation: 5 }
  ],
  ventileBands: [
    { band: 'NTC', lowFoir: 40, medFoir: 50, highFoir: 50, eliteMult: 7.5, catBCMult: 6, govtHighNmiMult: 5, govtLowNmiMult: 5, btGovtHighNmiMult: 5, othersMult: 5 },
    { band: 'V4-V5', lowFoir: 40, medFoir: 50, highFoir: 55, eliteMult: 7.5, catBCMult: 6, govtHighNmiMult: 5, govtLowNmiMult: 5, btGovtHighNmiMult: 5, othersMult: 5 },
    { band: 'V6-V7', lowFoir: 40, medFoir: 55, highFoir: 60, eliteMult: 9, catBCMult: 7.5, govtHighNmiMult: 6, govtLowNmiMult: 6, btGovtHighNmiMult: 7, othersMult: 6 },
    { band: 'V8-V9', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 15, catBCMult: 10, govtHighNmiMult: 8, govtLowNmiMult: 8, btGovtHighNmiMult: 10, othersMult: 8 },
    { band: 'V10-12', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 24, catBCMult: 15, govtHighNmiMult: 15, govtLowNmiMult: 12, btGovtHighNmiMult: 18, othersMult: 12 },
    { band: 'V13-V20', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 30, catBCMult: 22, govtHighNmiMult: 20, govtLowNmiMult: 15, btGovtHighNmiMult: 24, othersMult: 18 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 63,
    retirementSalaried: 60,
    retirementGovt: 63,
    minSalary: 22000,
    pfMandatory: true,
    minExperienceTotal: 12,
    minExperienceCurrent: 12,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: true,
    maxPlBtAllowed: 1,
    ccBtAllowedCount: 2,
    requirePlBtWithCcBt: true,
    btPolicyDescription: '2 CC BT ALLOW WITH 1 PL BT (1 PL BT + 2 CC BT Allowed)'
  }
};
