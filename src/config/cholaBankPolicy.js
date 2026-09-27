// Exact Master Policy Configuration for CHOLA FINANCE from Excel (Sheet: CHOLA)
export const CHOLA_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove10L75kSal: 13.75, roiAbove75L50kSal: 14.50, roiAbove5L: 15.00, minRoi: 13.75, maxRoi: 15.00, defaultRoi: 13.75 },
    { category: 'A', roiAbove10L75kSal: 13.75, roiAbove75L50kSal: 14.50, roiAbove5L: 15.00, minRoi: 13.75, maxRoi: 15.00, defaultRoi: 13.75 },
    { category: 'B', roiAbove10L75kSal: 14.50, roiAbove75L50kSal: 15.00, roiAbove5L: 15.00, minRoi: 14.50, maxRoi: 15.00, defaultRoi: 14.50 },
    { category: 'C', roiAbove10L75kSal: 15.00, roiAbove75L50kSal: 15.00, roiAbove5L: 15.00, minRoi: 15.00, maxRoi: 15.00, defaultRoi: 15.00 },
    { category: 'D', roiAbove10L75kSal: 15.00, roiAbove75L50kSal: 15.00, roiAbove5L: 15.00, minRoi: 15.00, maxRoi: 15.00, defaultRoi: 15.00 },
    { category: 'Govt', roiAbove10L75kSal: 13.75, roiAbove75L50kSal: 14.50, roiAbove5L: 15.00, minRoi: 13.75, maxRoi: 15.00, defaultRoi: 13.75 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000, notes: 'Max 30L (Govt 1L+ / Pvt 1.5L+ salary)' },
    { tier: 'A', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000, coAppAbove20L: true, notes: 'Co-applicant required above 20L' },
    { tier: 'B', minLoan: 100000, maxLoan: 2000000, bachelorCap: null, minSalary: 25000, notes: 'Max 20L' },
    { tier: 'C', minLoan: 100000, maxLoan: 2000000, bachelorCap: null, minSalary: 25000, notes: 'Max 20L' },
    { tier: 'D', minLoan: 100000, maxLoan: 2000000, bachelorCap: null, minSalary: 25000, notes: 'Max 20L' },
    { tier: 'Govt', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000, notes: 'Max 30L (Govt 1L+ salary)' }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 65, slab2Foir: 70, maxFoir: 70, multiplierSlab1: 30, multiplier: 35, ccObligation: 5 },
    { category: 'A', slab1Foir: 65, slab2Foir: 70, maxFoir: 70, multiplierSlab1: 24, multiplier: 28, ccObligation: 5 },
    { category: 'B', slab1Foir: 65, slab2Foir: 70, maxFoir: 70, multiplierSlab1: 24, multiplier: 28, ccObligation: 5 },
    { category: 'C', slab1Foir: 55, slab2Foir: 65, maxFoir: 65, multiplierSlab1: 20, multiplier: 25, ccObligation: 5 },
    { category: 'D', slab1Foir: 55, slab2Foir: 65, maxFoir: 65, multiplierSlab1: 20, multiplier: 25, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 65, slab2Foir: 70, maxFoir: 70, multiplierSlab1: 30, multiplier: 35, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    coAppAgeLimit: 23, // 21-23 requires co-applicant (21 TO 23 AGE GROUP CO APP REQ)
    coAppRequiredNote: '21 to 23 age group co-applicant required',
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000, // 25K WITHOUT INCENTIVE
    minSalaryBankNbfc: 30000, // BANKS AND NBFCS 30K WITHOUT INCENTIVE
    restrictedDesignations: ['RM', 'SM', 'SO', 'SFE', 'RELATIONSHIP MANAGER', 'SALES MANAGER', 'SALES OFFICER', 'SALES FINANCE EXECUTIVE'],
    minExperienceGovt: 3, // GOVT 3 MONTHS
    minExperiencePvt: 12, // PVT 1 YEARS (12 MONTHS)
    minCibilScore: 0,
    ccObligationPercent: 5, // 5% OBLIGATION
    allowCcBt: true,
    ccBtAllowedCount: 6, // 6 CCBT ALLOW
    maxCcBtSalaryMultiplier: 6 // 6 TIME NOT ALLOW FOR BT (CC BT POS > 6x salary not allowed)
  }
};
