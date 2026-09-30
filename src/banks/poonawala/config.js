// Poonawala Finance Configuration according to BANKS POLICYS.xlsx (Sheet: POONAWALA)
export const poonawalaConfig = {
  id: 'poonawala',
  name: 'Poonawala Finance',
  isFoirOnly: true, // Excel Sheet POONAWALA: FOIR-only institution (no multiplier)
  minAge: 21, // Minimum age requirement (Excel Row 90: MIN 21 YRS)
  maxAge: 60, // Maximum age at loan maturity (Excel Row 90: MAX 60 YRS)
  minCreditScore: 700, // Excel Row 93: 700 MINIMUM (0, -1 allowed in Tier 1, 2 cities & Cat A)
  minSalary: 30000, // Excel Row 89: MIN 30K
  minExperienceMonths: 24, // Excel Row 10: 2YEARS (24 Months)
  minLoanAmount: 100000, // Excel Row 26: 1 LAC
  maxLoanAmount: 6000000, // ₹60 Lakhs (Excel Section 5 Row 85: CAT A 60 LAC)
  interestRate: 12.50, // Standard default rate

  // City-wise Loan Capping (Excel Section 5 Rows 86-87)
  cityLoanCapping: {
    'METRO': 6000000,
    'TIER 1': 5000000,
    'TIER 2': 4000000,
    'OTHERS': 2500000
  },

  // Incentive policy
  incentivePercentage: 0.25, // 25% of average incentive
  incentivePeriodMonths: 3, // Last 3 months

  // Category Loan Caps (Excel Section 5 Rows 84-85)

  maxLoanByCategory: {
    'SUPER-A': 6000000,
    'SUPER A': 6000000,
    'A': 6000000,
    'B': 4000000,
    'GOVT': 4000000,
    'C': 3000000,
    'D': 1000000,
    'E': 1000000
  },

  // Maximum tenure by category in months (Excel Row 91: CAT A 84 MONTH, CAT B, C, D 72 MONTH)
  maxTenureByCategory: {
    'SUPER-A': 84, // 7 years
    'SUPER A': 84,
    'A': 84,
    'GOVT': 84,
    'B': 72,       // 6 years
    'C': 72,       // 6 years
    'D': 72,       // 6 years
    'E': 72
  },

  // Two-Dimensional FOIR Matrix (Excel Section 5 Rows 77-82)
  // Rows: Customer Segment (SUP-A/A, B/GOVT, C/D, E)
  // Columns: NTH Salary Bands: 30-50k, >50k-75k, >75k-1.5L, >1.5L-2.5L, >2.5L
  foirMatrix: {
    'SUPER-A': {
      'SUP-HNI': { minNTH: 250001, maxNTH: null, foir: 0.75 },        // >2.5L
      'HNI': { minNTH: 150001, maxNTH: 250000, foir: 0.75 },          // >1.5L-2.5L
      'AFFLUENT': { minNTH: 75001, maxNTH: 150000, foir: 0.70 },      // >75k-1.5L
      'PRIME': { minNTH: 50001, maxNTH: 75000, foir: 0.65 },          // >50k-75k
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.60 }          // 30k-50k
    },
    'A': {
      'SUP-HNI': { minNTH: 250001, maxNTH: null, foir: 0.75 },
      'HNI': { minNTH: 150001, maxNTH: 250000, foir: 0.75 },
      'AFFLUENT': { minNTH: 75001, maxNTH: 150000, foir: 0.70 },
      'PRIME': { minNTH: 50001, maxNTH: 75000, foir: 0.65 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.60 }
    },
    'B': {
      'SUP-HNI': { minNTH: 250001, maxNTH: null, foir: 0.70 },
      'HNI': { minNTH: 150001, maxNTH: 250000, foir: 0.70 },
      'AFFLUENT': { minNTH: 75001, maxNTH: 150000, foir: 0.65 },
      'PRIME': { minNTH: 50001, maxNTH: 75000, foir: 0.60 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.50 }
    },
    'GOVT': {
      'SUP-HNI': { minNTH: 250001, maxNTH: null, foir: 0.70 },
      'HNI': { minNTH: 150001, maxNTH: 250000, foir: 0.70 },
      'AFFLUENT': { minNTH: 75001, maxNTH: 150000, foir: 0.65 },
      'PRIME': { minNTH: 50001, maxNTH: 75000, foir: 0.60 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.50 }
    },
    'C': {
      'SUP-HNI': { minNTH: 250001, maxNTH: null, foir: 0.65 },
      'HNI': { minNTH: 150001, maxNTH: 250000, foir: 0.60 },
      'AFFLUENT': { minNTH: 75001, maxNTH: 150000, foir: 0.55 },
      'PRIME': { minNTH: 50001, maxNTH: 75000, foir: 0.55 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.50 }
    },
    'D': {
      'SUP-HNI': { minNTH: 250001, maxNTH: null, foir: 0.65 },
      'HNI': { minNTH: 150001, maxNTH: 250000, foir: 0.60 },
      'AFFLUENT': { minNTH: 75001, maxNTH: 150000, foir: 0.55 },
      'PRIME': { minNTH: 50001, maxNTH: 75000, foir: 0.55 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: 0.50 }
    },
    'E': {
      'SUP-HNI': { minNTH: 250001, maxNTH: null, foir: 0.60 },
      'HNI': { minNTH: 150001, maxNTH: 250000, foir: 0.55 },
      'AFFLUENT': { minNTH: 75001, maxNTH: 150000, foir: 0.50 },
      'PRIME': { minNTH: 50001, maxNTH: 75000, foir: 0.45 },
      'OTHERS': { minNTH: 30000, maxNTH: 50000, foir: null } // NA
    }
  },

  // Rate Grids (Excel Sheet: POONAWALA — Effective 1st Aug 2026)
  rateGrids: {
    superCatCatAGovtRatna: [
      { slab: 'NTH up to 50K', min700: 15.00, min730: 14.74, min780: 13.75 },
      { slab: 'NTH >50K–75K', min700: 14.74, min730: 14.50, min780: 13.50 },
      { slab: 'NTH >75K', min700: 14.00, min730: 13.50, min780: 12.50 },
      { slab: 'NTH >100K & LA ≥ 20L', min700: 13.75, min730: 13.25, min780: 12.25 },
      { slab: 'NTH >100K & LA ≥ 35L', min700: 13.00, min730: 12.50, min780: 11.99 }
    ],
    govtCatBCatEduDefence: [
      { slab: 'NTH up to 50K', min700: 15.50, min730: 15.24, min750: 15.00, min780: 14.25 },
      { slab: 'NTH >50K–75K', min700: 15.24, min730: 15.00, min750: 14.75, min780: 14.00 },
      { slab: 'NTH >75K', min700: 15.00, min730: 14.75, min750: 14.50, min780: 13.75 },
      { slab: 'NTH >100K & LA ≥ 20L', min700: 14.75, min730: 14.50, min750: 14.25, min780: 13.50 },
      { slab: 'NTH >100K & LA ≥ 35L', min700: null, min730: null, min750: null, min780: null }
    ],
    categoryC: [
      { slab: '≤ 50K', min700: 16.00, min730: 15.75, min750: 15.50, min780: 15.24 },
      { slab: '>50K–75K', min700: 15.50, min730: 15.25, min750: 15.00, min780: 14.50 },
      { slab: '>75K', min700: 15.25, min730: 15.00, min750: 14.50, min780: 14.00 },
      { slab: '>100K & LA ≥ 20L', min700: 14.74, min730: 14.50, min750: 14.25, min780: 14.00 }
    ],
    categoryD: [
      { slab: '≤ 50K', min700: 17.24, min730: 16.24, min750: 15.75, min780: 15.50 },
      { slab: '>50K–75K', min700: 16.24, min730: 15.75, min750: 15.50, min780: 15.24 },
      { slab: '>75K', min700: 15.75, min730: 15.24, min750: 15.00, min780: 14.74 }
    ],
    categoryE: [
      { slab: '≤ 50K', min700: 19.75, min730: 18.74, min750: 18.50, min780: 18.25 },
      { slab: '>50K–75K', min700: 18.24, min730: 17.74, min750: 17.50, min780: 17.25 },
      { slab: '>75K', min700: 17.74, min730: 17.24, min750: 17.00, min780: 16.75 }
    ]
  },

  // Additional ROI Markups (Excel Section 4 Rows 55-68)
  rateMarkups: {
    ntcScoreMarkup: 1.00,
    ntcMinRoi: 14.50,
    btUpTo2CcAppLoan: 1.25,
    btUpTo2MinRoi: 15.00,
    bt3To4CcAppLoan: 2.25,
    bt3To4MinRoi: 16.25,
    btMoreThan4CcAppLoan: 3.35,
    btMoreThan4MinRoi: 17.25,
    foir6YearTenureMarkup: 0.25,
    foir7YearTenureMarkup: 0.50
  },

  // Dynamic Rate Lookup with Markups
  getPoonawalaRate: (category, income, loanAmount, cibilScore, btCount = 0, is6YrTenure = false, is7YrTenure = false) => {
    const cibil = Number(cibilScore || 750);
    const cat = String(category || 'A').toUpperCase().trim();
    const isSuperA = cat.includes('SUPER') || cat === 'A';
    const isGovtOrB = cat === 'GOVT' || cat === 'B';
    const isC = cat === 'C';
    const isD = cat === 'D';

    let baseRoi = 14.50;

    if (isSuperA) {
      if (income > 100000 && loanAmount >= 3500000) {
        baseRoi = cibil >= 780 ? 11.99 : (cibil >= 730 ? 12.50 : 13.00);
      } else if (income > 100000 && loanAmount >= 2000000) {
        baseRoi = cibil >= 780 ? 12.25 : (cibil >= 730 ? 13.25 : 13.75);
      } else if (income > 75000) {
        baseRoi = cibil >= 780 ? 12.50 : (cibil >= 730 ? 13.50 : 14.00);
      } else if (income > 50000) {
        baseRoi = cibil >= 780 ? 13.50 : (cibil >= 730 ? 14.50 : 14.74);
      } else {
        baseRoi = cibil >= 780 ? 13.75 : (cibil >= 730 ? 14.74 : 15.00);
      }
    } else if (isGovtOrB) {
      if (income > 100000 && loanAmount >= 2000000) {
        baseRoi = cibil >= 780 ? 13.50 : (cibil >= 750 ? 14.25 : (cibil >= 730 ? 14.50 : 14.75));
      } else if (income > 75000) {
        baseRoi = cibil >= 780 ? 13.75 : (cibil >= 750 ? 14.50 : (cibil >= 730 ? 14.75 : 15.00));
      } else if (income > 50000) {
        baseRoi = cibil >= 780 ? 14.00 : (cibil >= 750 ? 14.75 : (cibil >= 730 ? 15.00 : 15.24));
      } else {
        baseRoi = cibil >= 780 ? 14.25 : (cibil >= 750 ? 15.00 : (cibil >= 730 ? 15.24 : 15.50));
      }
    } else if (isC) {
      if (income > 100000 && loanAmount >= 2000000) {
        baseRoi = cibil >= 780 ? 14.00 : (cibil >= 750 ? 14.25 : (cibil >= 730 ? 14.50 : 14.74));
      } else if (income > 75000) {
        baseRoi = cibil >= 780 ? 14.00 : (cibil >= 750 ? 14.50 : (cibil >= 730 ? 15.00 : 15.25));
      } else if (income > 50000) {
        baseRoi = cibil >= 780 ? 14.50 : (cibil >= 750 ? 15.00 : (cibil >= 730 ? 15.25 : 15.50));
      } else {
        baseRoi = cibil >= 780 ? 15.24 : (cibil >= 750 ? 15.50 : (cibil >= 730 ? 15.75 : 16.00));
      }
    } else if (isD) {
      if (income > 75000) {
        baseRoi = cibil >= 780 ? 14.74 : (cibil >= 750 ? 15.00 : (cibil >= 730 ? 15.24 : 15.75));
      } else if (income > 50000) {
        baseRoi = cibil >= 780 ? 15.24 : (cibil >= 750 ? 15.50 : (cibil >= 730 ? 15.75 : 16.24));
      } else {
        baseRoi = cibil >= 780 ? 15.50 : (cibil >= 750 ? 15.75 : (cibil >= 730 ? 16.24 : 17.24));
      }
    } else {
      // Cat E / Unlisted
      if (income > 75000) {
        baseRoi = cibil >= 780 ? 16.75 : (cibil >= 750 ? 17.00 : (cibil >= 730 ? 17.24 : 17.74));
      } else if (income > 50000) {
        baseRoi = cibil >= 780 ? 17.25 : (cibil >= 750 ? 17.50 : (cibil >= 730 ? 17.74 : 18.24));
      } else {
        baseRoi = cibil >= 780 ? 18.25 : (cibil >= 750 ? 18.50 : (cibil >= 730 ? 18.74 : 19.75));
      }
    }

    let finalRoi = baseRoi;

    // Apply NTC markup
    if (cibil === 0 || cibil === -1) {
      finalRoi = Math.max(finalRoi + 1.00, 14.50);
    }

    // Apply BT count markup
    if (btCount > 0) {
      if (btCount <= 2) {
        finalRoi = Math.max(finalRoi + 1.25, 15.00);
      } else if (btCount <= 4) {
        finalRoi = Math.max(finalRoi + 2.25, 16.25);
      } else {
        finalRoi = Math.max(finalRoi + 3.35, 17.25);
      }
    }

    // Apply tenure markup
    if (is7YrTenure) {
      finalRoi += 0.50;
    } else if (is6YrTenure) {
      finalRoi += 0.25;
    }

    return Number(finalRoi.toFixed(2));
  },

  employmentTypes: ['salaried', 'government', 'self-employed'],

  // Balance Transfer (BT) Configuration (Excel Row 96)
  btConfig: {
    isAvailable: true,
    maxBtCountTotal: 8, // Combination of 3 App loans / 3 CC / 2 PL
    maxAppLoanBt: 3,
    maxCreditCardsForBT: 3,
    maxPlBt: 2,
    description: 'Poonawala allows up to 8 total balance transfers (Max 3 App loans, 3 Credit Cards, 2 Personal loans)'
  }
};