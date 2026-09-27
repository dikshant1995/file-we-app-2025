// Exact Master Policy Configuration for CHOLA FINANCE from Excel
export const CHOLA_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove10L75kSal: 13.75, roiAbove75L50kSal: 14.50, roiAbove5L: 15.00, minRoi: 13.75, maxRoi: 15.00, defaultRoi: 13.75 },
    { category: 'A', roiAbove10L75kSal: 13.75, roiAbove75L50kSal: 14.50, roiAbove5L: 15.00, minRoi: 13.75, maxRoi: 15.00, defaultRoi: 13.75 },
    { category: 'B', roiAbove10L75kSal: 14.50, roiAbove75L50kSal: 15.00, roiAbove5L: 15.00, minRoi: 14.50, maxRoi: 15.00, defaultRoi: 14.50 },
    { category: 'C', roiAbove10L75kSal: 15.00, roiAbove75L50kSal: 15.00, roiAbove5L: 15.00, minRoi: 15.00, maxRoi: 16.00, defaultRoi: 15.00 },
    { category: 'D', roiAbove10L75kSal: 15.00, roiAbove75L50kSal: 15.00, roiAbove5L: 15.00, minRoi: 15.00, maxRoi: 16.00, defaultRoi: 15.00 },
    { category: 'Govt', roiAbove10L75kSal: 13.75, roiAbove75L50kSal: 14.50, roiAbove5L: 15.00, minRoi: 13.75, maxRoi: 15.00, defaultRoi: 13.75 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 4000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 2000000, bachelorCap: null, minSalary: 25000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, bachelorCap: null, minSalary: 25000 }
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
    { category: 'Super A', slab1Foir: 65, slab2Foir: 70, maxFoir: 70, multiplier: 35, ccObligation: 5 },
    { category: 'A', slab1Foir: 65, slab2Foir: 70, maxFoir: 70, multiplier: 28, ccObligation: 5 },
    { category: 'B', slab1Foir: 65, slab2Foir: 70, maxFoir: 70, multiplier: 28, ccObligation: 5 },
    { category: 'C', slab1Foir: 55, slab2Foir: 65, maxFoir: 65, multiplier: 25, ccObligation: 5 },
    { category: 'D', slab1Foir: 55, slab2Foir: 65, maxFoir: 65, multiplier: 25, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 65, slab2Foir: 70, maxFoir: 70, multiplier: 35, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    coAppAgeLimit: 23, // 21-23 requires co-applicant
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minSalaryBankNbfc: 30000,
    minExperienceGovt: 3,
    minExperiencePvt: 12,
    minCibilScore: 0,
    ccObligationPercent: 5,
    allowCcBt: true,
    ccBtAllowedCount: 6,
    maxCcBtSalaryMultiplier: 6
  }
};
