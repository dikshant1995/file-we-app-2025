// Exact Master Policy Configuration for SMFG INDIA CREDIT from BANKS POLICYS.xlsx (Sheet: SMFG)
export const SMFG_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove100k: 17.00, roi75kTo100k: 18.50, roi50kTo75k: 18.50, roi40kTo50k: 19.00, roi35kTo40k: 19.50, roi30kTo35k: 21.50, roi25kTo30k: 23.00, roiBelow25k: 24.00, roi25001: 24.00, minRoi: 17.00, maxRoi: 24.00, defaultRoi: 18.50 },
    { category: 'A', roiAbove100k: 17.00, roi75kTo100k: 18.50, roi50kTo75k: 18.50, roi40kTo50k: 19.00, roi35kTo40k: 19.50, roi30kTo35k: 21.50, roi25kTo30k: 23.00, roiBelow25k: 24.00, roi25001: 24.00, minRoi: 17.00, maxRoi: 24.00, defaultRoi: 18.50 },
    { category: 'B', roiAbove100k: 17.00, roi75kTo100k: 18.50, roi50kTo75k: 18.50, roi40kTo50k: 20.00, roi35kTo40k: 21.00, roi30kTo35k: 22.00, roi25kTo30k: 24.00, roiBelow25k: 25.50, roi25001: 25.50, minRoi: 17.00, maxRoi: 25.50, defaultRoi: 18.50 },
    { category: 'C', roiAbove100k: 19.00, roi75kTo100k: 19.50, roi50kTo75k: 21.50, roi40kTo50k: 21.50, roi35kTo40k: 23.00, roi30kTo35k: 23.50, roi25kTo30k: 25.00, roiBelow25k: 27.50, roi25001: 27.50, minRoi: 19.00, maxRoi: 27.50, defaultRoi: 21.50 },
    { category: 'D', roiAbove100k: 20.00, roi75kTo100k: 20.00, roi50kTo75k: 22.00, roi40kTo50k: 24.00, roi35kTo40k: 24.00, roi30kTo35k: 25.00, roi25kTo30k: 28.00, roiBelow25k: 30.00, roi25001: 30.00, minRoi: 20.00, maxRoi: 30.00, defaultRoi: 24.00 },
    { category: 'E', roiAbove100k: 30.00, roi75kTo100k: 30.00, roi50kTo75k: 30.00, roi40kTo50k: 30.00, roi35kTo40k: 30.00, roi30kTo35k: 30.00, roi25kTo30k: 30.00, roiBelow25k: 30.00, roi25001: 30.00, minRoi: 30.00, maxRoi: 30.00, defaultRoi: 30.00 },
    { category: 'Govt', roiAbove100k: 17.00, roi75kTo100k: 18.50, roi50kTo75k: 18.50, roi40kTo50k: 19.00, roi35kTo40k: 19.50, roi30kTo35k: 21.50, roi25kTo30k: 23.00, roiBelow25k: 24.00, roi25001: 24.00, minRoi: 17.00, maxRoi: 24.00, defaultRoi: 18.50 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' },
    { category: 'A', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' },
    { category: 'B', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' },
    { category: 'C', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' },
    { category: 'Govt', minMonths: 12, maxMonths: 60, description: '12 to 60 Months (Up to 5 Years)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 30, ccObligation: 5 },
    { category: 'A', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 30, ccObligation: 5 },
    { category: 'B', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 25, ccObligation: 5 },
    { category: 'C', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 22, ccObligation: 5 },
    { category: 'D', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 18, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 60, slab2Foir: 65, maxFoir: 70, multiplier: 30, ccObligation: 5 }
  ],
  salaryBandsFoirAndMultiplier: [
    { band: 'Income Less Than 25K', minSalary: 0, maxSalary: 24999, foir: 0, multiplier: 'Not Eligible', multiplierMin: 0, multiplierMax: 0, eligible: false, notes: 'Min ₹25K+ Salary required with 0 deduction' },
    { band: '25K-30K', minSalary: 25000, maxSalary: 30000, foir: 60, multiplier: '12 TO 13', multiplierMin: 12, multiplierMax: 13, eligible: true, notes: 'AS PER COM CAT AND PROFILE BASE' },
    { band: '30K-35K', minSalary: 30001, maxSalary: 35000, foir: 65, multiplier: '15 TO 16', multiplierMin: 15, multiplierMax: 16, eligible: true, notes: 'AS PER COM CAT AND PROFILE BASE' },
    { band: '35K-40K', minSalary: 35001, maxSalary: 40000, foir: 70, multiplier: '16 TO 18', multiplierMin: 16, multiplierMax: 18, eligible: true, notes: 'COM TYPE PROP/PART/LLP FIRM MAX FOIR 55%' },
    { band: '40K-50K', minSalary: 40001, maxSalary: 50000, foir: 70, multiplier: '18 TO 20', multiplierMin: 18, multiplierMax: 20, eligible: true, notes: 'Standard 70% Max FOIR' },
    { band: '50K-75K', minSalary: 50001, maxSalary: 75000, foir: 70, multiplier: '22 TO 25', multiplierMin: 22, multiplierMax: 25, eligible: true, notes: 'Standard 70% Max FOIR' },
    { band: '75K-100K', minSalary: 75001, maxSalary: 100000, foir: 70, multiplier: '23 TO 30', multiplierMin: 23, multiplierMax: 30, eligible: true, notes: 'Standard 70% Max FOIR' },
    { band: '100K and Above', minSalary: 100001, maxSalary: Infinity, foir: 70, multiplier: '23 TO 30', multiplierMin: 23, multiplierMax: 30, eligible: true, notes: 'Max Multiplier up to 30x' }
  ],
  specialCompanyFoir: {
    propPartLlpFirmMaxFoir: 55 // PROP/PART/LLP FIRM: 55% FOIR
  },
  demographics: {
    minAge: 21, // MINIMUM APPLICANT AGE: 21
    maxAge: 60, // MAXIMUM AGE AT LOAN TIME: PVT 60
    maxAgePvt: 60,
    maxAgeGovt: 65, // GOVT 65(PENSIONER PROFILE)
    retirementAge: 65, // RETIREMENT AGE: 65
    retirementSalaried: 65,
    retirementGovt: 65,
    minSalary: 25000, // 25K+ SALARY WITH 0 DEDUCTION
    minExperienceTotal: 24, // CURRENT COM 2 YEARS
    minExperienceCurrent: 24, // CURRENT COM 2 YEARS
    minCurrentCompanyExperienceMonths: 24,
    minCibilScore: 0,
    ccObligationPercent: 5, // CC OBLIGATION: 0.05
    maxCcBt: 2, // MAX CC BT: 2 CC BT
    allowCcBt: true,
    ccBtAllowedCount: 2
  }
};
