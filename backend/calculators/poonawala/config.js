// Poonawala Finance Configuration according to BANKS POLICYS.xlsx (Sheet: POONAWALA)
export const poonawalaConfig = {
  id: 'poonawala',
  name: 'Poonawala Finance',
  minAge: 21, // Minimum age requirement (Excel Row 90: MIN 21 YRS)
  maxAge: 60, // Maximum age at loan maturity (Excel Row 90: MAX 60 YRS)
  minCreditScore: 700, // Excel Row 93: 700 MINIMUM (0, -1 allowed in Tier 1, 2 cities & Cat A)
  minSalary: 30000, // Excel Row 89: MIN 30K
  maxLoanAmount: 6000000, // ₹60 Lakhs (Excel Section 5 Row 85: CAT A 60 LAC)
  interestRate: 12.50, // Standard default rate

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

  // Excel Section 4 Rows 34-52: Detailed Rate Grid Lookup Function
  getPoonawalaRate: (category, income, loanAmount, cibilScore) => {
    const cibil = Number(cibilScore || 750);
    const cat = String(category || 'A').toUpperCase().trim();
    const isSuperA = cat.includes('SUPER') || cat === 'A';
    const isGovtOrB = cat === 'GOVT' || cat === 'B';
    const isC = cat === 'C';
    const isD = cat === 'D';

    // Handle NTC (0 / -1)
    if (cibil === 0 || cibil === -1) {
      return 14.50; // Excel Row 65: For Cibil 0 and -1 min 14.50%
    }

    if (isSuperA) {
      if (income > 100000 && loanAmount >= 3500000) {
        return cibil >= 780 ? 11.99 : (cibil >= 730 ? 12.50 : 13.00);
      }
      if (income > 100000 && loanAmount >= 2000000) {
        return cibil >= 780 ? 12.25 : (cibil >= 730 ? 13.25 : 13.75);
      }
      if (income > 75000) {
        return cibil >= 780 ? 12.50 : (cibil >= 730 ? 13.50 : 14.00);
      }
      if (income > 50000) {
        return cibil >= 780 ? 13.50 : (cibil >= 730 ? 14.50 : 14.74);
      }
      // up to 50k
      return cibil >= 780 ? 13.75 : (cibil >= 730 ? 14.74 : 15.00);
    }

    if (isGovtOrB) {
      if (income > 100000 && loanAmount >= 2000000) {
        return cibil >= 780 ? 13.50 : (cibil >= 750 ? 14.25 : (cibil >= 730 ? 14.50 : 14.75));
      }
      if (income > 75000) {
        return cibil >= 780 ? 13.75 : (cibil >= 750 ? 14.50 : (cibil >= 730 ? 14.75 : 15.00));
      }
      if (income > 50000) {
        return cibil >= 780 ? 14.00 : (cibil >= 750 ? 14.75 : (cibil >= 730 ? 15.00 : 15.24));
      }
      // up to 50k
      return cibil >= 780 ? 14.25 : (cibil >= 750 ? 15.00 : (cibil >= 730 ? 15.24 : 15.50));
    }

    if (isC) {
      if (income > 100000 && loanAmount >= 2000000) {
        return cibil >= 780 ? 14.00 : (cibil >= 750 ? 14.25 : (cibil >= 730 ? 14.50 : 14.74));
      }
      if (income > 75000) {
        return cibil >= 780 ? 14.00 : (cibil >= 750 ? 14.50 : (cibil >= 730 ? 15.00 : 15.25));
      }
      if (income > 50000) {
        return cibil >= 780 ? 14.50 : (cibil >= 750 ? 15.00 : (cibil >= 730 ? 15.25 : 15.50));
      }
      // up to 50k
      return cibil >= 780 ? 15.24 : (cibil >= 750 ? 15.50 : (cibil >= 730 ? 15.75 : 16.00));
    }

    if (isD) {
      if (income > 75000) {
        return cibil >= 780 ? 14.74 : (cibil >= 750 ? 15.00 : (cibil >= 730 ? 15.24 : 15.75));
      }
      if (income > 50000) {
        return cibil >= 780 ? 15.24 : (cibil >= 750 ? 15.50 : (cibil >= 730 ? 15.75 : 16.24));
      }
      // up to 50k
      return cibil >= 780 ? 15.50 : (cibil >= 750 ? 15.75 : (cibil >= 730 ? 16.24 : 17.24));
    }

    // Cat E / Unlisted
    if (income > 75000) {
      return cibil >= 780 ? 16.75 : (cibil >= 750 ? 17.00 : (cibil >= 730 ? 17.24 : 17.74));
    }
    if (income > 50000) {
      return cibil >= 780 ? 17.25 : (cibil >= 750 ? 17.50 : (cibil >= 730 ? 17.74 : 18.24));
    }
    return cibil >= 780 ? 18.25 : (cibil >= 750 ? 18.50 : (cibil >= 730 ? 18.74 : 19.75));
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