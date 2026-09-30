// Exact Bank Policy Configuration for L&T FINANCE from Bank Policy Excel: BANKS POLICYS.xlsx (Sheet: LNT)
export const LNT_BANK_EXCEL_POLICY = {
  institutionName: 'L&T Finance',
  interestRates: [
    { 
      category: 'Super A', 
      roi20Lto30L: 11.50, 
      roi10Lto20L: 14.00, 
      roi1Lto10L: 13.50, 
      roiBelow10L: 13.50,
      minRoi: 10.99, 
      maxRoi: 15.00, 
      defaultRoi: 11.50,
      specialRate: 10.99,
      specialRateCondition: 'Owned House + ₹1.75L+ Salary + 775+ CIBIL'
    },
    { 
      category: 'A', 
      roi20Lto30L: 11.50, 
      roi10Lto20L: 14.00, 
      roi1Lto10L: 13.50, 
      roiBelow10L: 13.50,
      minRoi: 10.99, 
      maxRoi: 15.00, 
      defaultRoi: 11.50,
      specialRate: 10.99,
      specialRateCondition: 'Owned House + ₹1.75L+ Salary + 775+ CIBIL'
    },
    { 
      category: 'B', 
      roi20Lto30L: 11.50, 
      roi10Lto20L: 14.00, 
      roi1Lto10L: 13.50, 
      roiBelow10L: 13.50,
      minRoi: 11.50, 
      maxRoi: 15.00, 
      defaultRoi: 13.00 
    },
    { 
      category: 'C', 
      roi20Lto30L: 13.50, 
      roi10Lto20L: 14.00, 
      roi1Lto10L: 14.00, 
      roiBelow10L: 14.00,
      minRoi: 13.50, 
      maxRoi: 15.00, 
      defaultRoi: 14.00 
    },
    { 
      category: 'D', 
      roi20Lto30L: 14.00, 
      roi10Lto20L: 14.50, 
      roi1Lto10L: 15.00, 
      roiBelow10L: 15.00,
      minRoi: 14.00, 
      maxRoi: 15.00, 
      defaultRoi: 14.50 
    },
    { 
      category: 'Govt', 
      roi20Lto30L: 11.50, 
      roi10Lto20L: 14.00, 
      roi1Lto10L: 13.50, 
      roiBelow10L: 13.50,
      minRoi: 11.50, 
      maxRoi: 15.00, 
      defaultRoi: 12.50 
    }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, rentedCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, rentedCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, rentedCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, rentedCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, rentedCap: 2500000, minSalary: 25000, note: 'Rented capped at ₹25 Lakhs (25L), otherwise ₹30 Lakhs (30L)' },
    { tier: 'Govt', minLoan: 100000, maxLoan: 3000000, bachelorCap: null, rentedCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' }
  ],
  foirMultiplier: [
    { 
      category: 'Super A', 
      slab1Foir: 55, slab2Foir: 70, slab3Foir: 75, maxFoir: 80, 
      mult1: 18, mult2: 20, mult3: 24, mult4: 24,
      multiplier: 24, ccObligation: 5 
    },
    { 
      category: 'A', 
      slab1Foir: 55, slab2Foir: 70, slab3Foir: 75, maxFoir: 80, 
      mult1: 18, mult2: 20, mult3: 24, mult4: 24,
      multiplier: 24, ccObligation: 5 
    },
    { 
      category: 'B', 
      slab1Foir: 55, slab2Foir: 70, slab3Foir: 75, maxFoir: 80, 
      mult1: 18, mult2: 20, mult3: 24, mult4: 24,
      multiplier: 24, ccObligation: 5 
    },
    { 
      category: 'C', 
      slab1Foir: 50, slab2Foir: 60, slab3Foir: 70, maxFoir: 75, 
      mult1: 16, mult2: 18, mult3: 20, mult4: 20,
      multiplier: 20, ccObligation: 5 
    },
    { 
      category: 'D', 
      slab1Foir: 50, slab2Foir: 55, slab3Foir: 65, maxFoir: 70, 
      mult1: 14, mult2: 15, mult3: 16, mult4: 16,
      multiplier: 16, ccObligation: 5 
    },
    { 
      category: 'Govt', 
      slab1Foir: 55, slab2Foir: 70, slab3Foir: 75, maxFoir: 80, 
      mult1: 18, mult2: 20, mult3: 24, mult4: 24,
      multiplier: 24, ccObligation: 5 
    }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minExperienceTotal: 6,
    minExperienceCurrent: 6,
    minCibilScore: 720,
    ccObligationPercent: 5,
    allowCcBt: false,
    ccBtAllowedCount: 0
  }
};
