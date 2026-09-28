const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Complete 19-Bank Data with Explicit Factor Dependencies
const banks = [
  {
    name: 'Axis Bank',
    sheet: 'AXIS BANK',
    color: '#97144D',
    type: 'Tier-1 Private Bank',
    demographics: 'Age: 21–60 Yrs • Min Sal: ₹25,000 • Exp: 2 Yrs Total (1 Yr Current) • CIBIL: 700+',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Universal Company Database lookup ➔ Super A, Cat A, Cat B, Cat C, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Net Salary',
        color: '#fbbf24',
        logic: 'Super A/A: ≥40k Sal ➔ 75% FOIR (25k-35k: 50%-55%, 35k-40k: 60%-65%) | Cat B/Govt: 50%-65% | Cat C: 50%-60%'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% of limit + all non-BT personal & vehicle loan EMIs'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'FOIR Net EMI + Multiplier',
        color: '#a78bfa',
        logic: 'Dual Engine: MIN(FOIR Loan, Multiplier Loan). Multipliers: Super A (up to 36x for 40k+), Cat A/B (24x-30x), Cat C (18x-20x)'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Category + Loan Amount Bracket',
        color: '#f43f5e',
        logic: '≥ ₹15L: Super A/A 10.35%, Cat B/Govt 10.45%, Cat C 10.75% | ₹10L–₹15L: Super A/A 10.45%, Cat B 10.65%, Cat C 10.99% | < ₹10L: 11.25%–13.00%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category + Age vs Retirement',
        color: '#34d399',
        logic: 'Super A, A, Govt ➔ 84 Months (7 Years) | Cat B & C ➔ 72 Months (6 Years). Cannot exceed age 60'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: 'Super A & A ➔ ₹50 Lakhs | Cat B & Govt ➔ ₹40 Lakhs | Cat C ➔ ₹25 Lakhs (Min Loan: ₹1 Lakh)'
      }
    ],
    distinctive: 'High ticket ≥10L unlocks 10.35%-10.45% rates. Super A 40k+ gets up to 36x salary multiplier.'
  },
  {
    name: 'IndusInd Bank',
    sheet: 'INDUSIND',
    color: '#005596',
    type: 'Private Commercial Bank',
    demographics: 'Age: 21–60 Yrs • Min Sal: Cat A/B/Govt ₹20k, Cat C ₹25k • Exp: 2 Yrs • CIBIL: 700+ (CIBIL -1 allowed)',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Classifies into: Super A, Cat A, Cat B, Cat C, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Salary + Housing + Live HL',
        color: '#fbbf24',
        logic: '20k-35k: 50% | 35k-50k: 60% | 50k-80k+ Owned: 70% FOIR (Rented: 65%) | ⭐ Live HL/LAP Running Bonus: FOIR escalates to 75%!'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% of card limit + all active external loan EMIs'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'FOIR Net EMI + Multiplier',
        color: '#a78bfa',
        logic: 'Net EMI Room reversed into loan. Multipliers: Cat A/B/Govt: ≥1.25L Sal ➔ 30x; 75k-1.25L ➔ 25x; 40k-75k ➔ 20x'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Loan Amount + Insurance Mandate',
        color: '#f43f5e',
        logic: '≥ ₹10 Lakhs (with Insurance): 9.99%–10.49% | ₹5L–₹10L: 10.75%–11.50% | < ₹5L: 11.50%–13.50%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category + CIBIL Score',
        color: '#34d399',
        logic: 'Standard: Up to 84 Months (7 Years). ⭐ SPECIAL RULE: CIBIL -1 (NTC) strictly capped to 48 Months (4 Years)!'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: 'Super A & A ➔ ₹75 Lakhs | Cat B ➔ ₹50 Lakhs | Cat C ➔ ₹25 Lakhs (Min Loan: ₹1 Lakh)'
      }
    ],
    distinctive: 'Owned vs Rented changes FOIR (70% vs 65%). Running HL gives 75% FOIR bonus. CIBIL -1 strictly capped to 48M.'
  },
  {
    name: 'HDFC Bank',
    sheet: 'HDFC',
    color: '#004C8F',
    type: 'Tier-1 Private Bank',
    demographics: 'Age: 21–60 Yrs • Min Sal: ₹25,000 (starts ₹25k+ up to ₹50k by category) • Exp: 2 Yrs Total (1 Yr Current) • CIBIL: 700+',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Maps company to: Super A, Cat A, Cat B, Cat C, Cat D, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Salary Slab',
        color: '#fbbf24',
        logic: 'Super A/A: 25k-35k (50%), 35k-50k (60%), 50k-75k (65%), 75k+ (70%-75%) | Cat B/Govt: 50%-65% | Cat C/D: 50%-60%'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% of usage / limit + non-BT loan installments'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'MIN(FOIR Loan, Multiplier Loan)',
        color: '#a78bfa',
        logic: 'Dual Engine: Calculates both FOIR Capacity and Multiplier (18x-30x), selects the lower value'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Category + Loan Amount (High Ticket Slabs)',
        color: '#f43f5e',
        logic: '≥ ₹20 Lakhs: 9.99%–10.50% | ₹15L–₹20L: 10.50% | ₹10L–₹15L: 10.75% | ₹5L–₹10L: 11.25% | < ₹5L: 12.00%–14.50%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category + Age vs Retirement',
        color: '#34d399',
        logic: 'Super A & A ➔ 84 Months (7 Years) | Cat B, C, D ➔ 72 Months (6 Years). Subject to age 60'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: 'Super A & A ➔ ₹75 Lakhs | Cat B ➔ ₹50 Lakhs | Cat C ➔ ₹35 Lakhs | Cat D ➔ ₹15 Lakhs'
      }
    ],
    distinctive: 'Dual engine takes minimum of FOIR and Multiplier. High ticket slabs drop rate down to 9.99%.'
  },
  {
    name: 'ICICI Bank',
    sheet: 'ICICI',
    color: '#ED1C24',
    type: 'Tier-1 Private Bank',
    demographics: 'Age: 21–60 Yrs (Pensioner: 65 Yrs) • Min Sal: Govt ₹25k, Pvt ₹30k, Open ₹75k, NRI ₹2L • CIBIL: 725+ (CIBIL -1 doable)',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name / Profile Type',
        color: '#38bdf8',
        logic: 'Classifies into: Super Prime, Preferred (A), Govt, Open Market, NRI Profile'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Profile + Salary + Live Home Loan',
        color: '#fbbf24',
        logic: 'Corporate: 45%-65% FOIR | ⭐ Live Home Loan Running Bonus: FOIR escalates directly to 70%! (HL RUNNING - 70%) | Open Market: 45%-55%'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% of card limit (5% CC OBLIGATE) + active personal/auto loan EMIs'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'FOIR Net EMI + Tenure + ROI',
        color: '#a78bfa',
        logic: 'Net Disposable EMI reversed into Loan Amount via PV formula at profile ROI'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Profile + Salary + CIBIL + Loan Amount',
        color: '#f43f5e',
        logic: 'CIBIL 775+ & 75k+ Sal (LA ≥ 20L): 9.99% | CIBIL 750–774 & 75k+ Sal: 10.30% | Corporate Prime: 10.75%–11.50% | Open Market: 11.00%–12.80%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Profile + Age',
        color: '#34d399',
        logic: 'Flat up to 72 Months (6 Years) across all profiles. Pensioners eligible up to age 65'
      },
      {
        metric: '7. Max Loan & Min Ticket',
        dependsOn: 'Profile + State / Location',
        color: '#2dd4bf',
        logic: '⭐ IN RAJASTHAN: Minimum loan strictly ₹6.10 Lakhs! Standard Min: ₹1 Lakh. Max: Corporate ₹1 Cr (100L) | Open Market: ₹15L | Army/NRI: ₹10L'
      }
    ],
    distinctive: 'Rajasthan minimum loan is strictly ₹6.10 Lakhs. Running Home Loan boosts FOIR to 70%. CIBIL 775+ unlocks 9.99%.'
  },
  {
    name: 'Kotak Mahindra Bank',
    sheet: 'KOTAK',
    color: '#ED1C24',
    type: 'Tier-1 Private Bank',
    demographics: 'Age: 21–60 Yrs • Min Sal: ₹25,000 • Exp: 2 Yrs • CIBIL: 700+ • ⭐ Credit Card BT: Strictly NOT ALLOWED',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Maps to: Super A, Cat A, Cat B, Cat C, Cat D, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Salary Slab',
        color: '#fbbf24',
        logic: 'Super A / A: 50% to 70% | Cat B / Govt: 50% to 65% | Cat C / D: 50% to 55%'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards (NO CC BT allowed)',
        color: '#f87171',
        logic: 'Credit Card: 5% limit. ⚠️ Credit Card BT strictly NOT ALLOWED (only PL/OD BT permitted)'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'MIN(FOIR Loan, Multiplier Loan)',
        color: '#a78bfa',
        logic: 'Dual Engine: Net EMI reversed into loan vs Multiplier up to 30x. Selects lower value'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Category + Loan Amount Bracket',
        color: '#f43f5e',
        logic: '≥ ₹15 Lakhs: 9.95%–10.50% | ₹10L–₹15L: 10.25%–10.75% | < ₹10L: 11.00%–12.50%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category',
        color: '#34d399',
        logic: 'Super A, A, B, C, Govt: 72 Months (6 Years) | Cat D: strictly 60 Months (5 Years)'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: 'Super A, A, B, Govt: Massive ₹1 Crore (100L) Cap! | Cat C: ₹35 Lakhs | Cat D: ₹20 Lakhs'
      }
    ],
    distinctive: 'Zero Credit Card BT permitted. Category B qualifies for full ₹1 Crore cap. Cat D capped to 60 Months.'
  },
  {
    name: 'Poonawalla Fincorp',
    sheet: 'POONAWALA',
    color: '#005596',
    type: 'Leading NBFC',
    demographics: 'Age: 21–60 Yrs • Min Sal: ₹30,000 (30K NTH) • Exp: 2 Yrs • CIBIL: 700+ (0/-1 in Tier 1/2 & Cat A) • Max 6 USL Enquiries in 90 days • Geo: 80 KM',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Classifies into: Super A, Cat A, Cat B, Cat C, Cat D, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Net Take Home (NTH) Salary',
        color: '#fbbf24',
        logic: 'Pure FOIR Engine: 30k-50k (60%/50%), >50k-75k (65%/60%/55%), >75k-1.5L (70%/65%/55%), >1.5L-2.5L (75%/70%/60%), >2.5L (75%/70%/65%). +5% deviation allowed'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'CC POS (5%) + KCC + Gold Loan',
        color: '#f87171',
        logic: 'CC: 5% POS. ⚠️ CC POS > 4x salary NOT ALLOWED. 1 KCC obligate, 1 Gold Loan obligate. Max 8 BTs (3 App, 3 CC, 2 PL)'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'Pure FOIR Net EMI Room (No Multipliers)',
        color: '#a78bfa',
        logic: 'Pure FOIR Model: Net EMI Room reversed directly into Loan Amount via PV formula. Zero multiplier limitations!'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Category + Salary + Loan + CIBIL + Markups',
        color: '#f43f5e',
        logic: '5 Grids: Super Cat (11.99%-15%), Cat B/Govt (13.50%-15.50%), Cat C (14%-16%), Cat D (14.74%-17.24%), Cat E (16.75%-19.75%) + Deviations (6-yr +0.25%, 7-yr +0.50%, CIBIL 0/-1 +1%, CC BT +1.25% to +3.35%)'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category',
        color: '#34d399',
        logic: 'Super A, A, Govt ➔ 84 Months (7 Years) | Cat B, C, D ➔ 72 Months (6 Years)'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category + City Tier',
        color: '#2dd4bf',
        logic: 'Category: Super A/A (₹60L), B/Govt (₹40L), C (₹30L), D (₹10L) | City: Metro (₹60L), Tier 1 (₹50L), Tier 2 (₹40L), Others (₹25L). Min: ₹1 Lakh'
      }
    ],
    distinctive: 'Pure FOIR architecture (no multiplier cap). CC POS > 4x salary strictly rejected. 100% digital with 80 KM geo-limit.'
  },
  {
    name: 'Tata Capital',
    sheet: 'TATA',
    color: '#1F4E78',
    type: 'Leading NBFC',
    demographics: 'Age: Pvt 21–58 Yrs, Govt 21–60 Yrs • Min Sal: ₹25,000 • Min Loan: ₹75,000 • Exp: 2 Yrs • CIBIL: 700+',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Classifies into: Super A, Cat A, Cat B, Cat C, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Salary Slab',
        color: '#fbbf24',
        logic: '50% to 70% FOIR across salary brackets and categories'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% of card limit + all active external loan installments'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'FOIR Net EMI + Multiplier (18x-25x)',
        color: '#a78bfa',
        logic: 'Calculates loan capacity from net disposable EMI and checks against 18x to 25x multiplier'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Category + Loan Amount Bracket',
        color: '#f43f5e',
        logic: 'Special ₹50L Cases: 10.99% | ₹20L–₹50L: 11.25%–11.75% | < ₹20L: 12.00%–14.50%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Sector + Age vs Retirement',
        color: '#34d399',
        logic: 'Govt ➔ up to 84 Months (max age 60); Pvt ➔ up to 84 Months (strictly capped at retirement age 58)'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: 'Maximum Sanction: ₹50 Lakhs (Min Loan: ₹75,000)'
      }
    ],
    distinctive: 'Private employee max age capped to 58 yrs. Special ₹50L tickets unlock 10.99%. Min ticket starts at ₹75k.'
  },
  {
    name: 'Bajaj Finance',
    sheet: 'BAJAJ',
    color: '#0072BB',
    type: 'Leading NBFC',
    demographics: 'Age: 23–59/60 Yrs (Retirement proof for 65 yrs) • Min Sal: Listed ₹27,000, Unlisted ₹30,000 • Exp: 2 Yrs • CIBIL: 720+',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Classifies into: Super A, Cat A, Cat B, Cat C, Unlisted'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Salary Slab',
        color: '#fbbf24',
        logic: '55% to 70% FOIR (up to 75% on case-to-case basis)'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% of card limit + non-BT loan EMIs'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'FOIR Net EMI + Multiplier (up to 30x)',
        color: '#a78bfa',
        logic: 'Combines FOIR capacity with aggressive multiplier (up to 30x) over extended tenure'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Loan Amount + Sal Lite Segment',
        color: '#f43f5e',
        logic: 'Prime ≥ ₹10L: 10.00%–11.00% | ₹5L–₹10L: 11.50% | Sal Lite (flexible docs): 12.00%–14.00%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: '⭐ Net Monthly Salary Threshold',
        color: '#34d399',
        logic: '⭐ Net Salary ≥ ₹1 Lakh ➔ 108 Months (9 Years)! Standard Max Tenure: 96 Months (8 Years)'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: 'Maximum Sanction: ₹50 Lakhs'
      }
    ],
    distinctive: 'Offers industry-leading 108 Months (9 Years) tenure for ₹1L+ salary. Starts at age 23. Standard tenure is 96M.'
  },
  {
    name: 'Axis Finance',
    sheet: 'AXIS FINANCE',
    color: '#800000',
    type: 'NBFC Subsidiary',
    demographics: 'Age: 21–60 Yrs • Min Sal: Urban ₹30k, Rural ₹25k • Exp: 6 Months salary credit • CIBIL: 700+',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Maps to: Super A, Cat A, Cat B, Cat C, Cat D, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Salary Slab',
        color: '#fbbf24',
        logic: '50% to 70% FOIR based on salary brackets'
      },
      {
        metric: '3. Obligations',
        dependsOn: '⭐ SPECIAL EXEMPTIONS (KCC & Gold Loan)',
        color: '#f87171',
        logic: '⭐ KCC Loan ≤ ₹15 Lakhs: 0% Obligation (Zero deduction)! ⭐ Gold Loan: Only 1% monthly obligation! Standard CC: 5%'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'Exemption-Adjusted Net Cashflow',
        color: '#a78bfa',
        logic: 'Permissible EMI = (Salary × FOIR%) - (Liabilities with KCC & Gold Loan relief). Converted to loan'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Product Type (PL vs BT)',
        color: '#f43f5e',
        logic: 'Regular Personal Loan: 13.50%–15.50% | Credit Card BT / App Loan BT: 18.00% Flat'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category',
        color: '#34d399',
        logic: 'Super A & Govt: 84 Months (7 Years) | Cat A & B: 72 Months (6 Years) | Cat C & D: 60 Months (5 Years)'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: 'Strictly ₹25 Lakhs maximum sanction across all profiles (Min Loan: ₹1 Lakh)'
      }
    ],
    distinctive: 'KCC ≤ 15L has zero obligation. Gold loan only 1% obligation. Flat 18% for CC & App BT. 84M tenure for Super A.'
  },
  {
    name: 'Bandhan Bank',
    sheet: 'BANDHAN BANK',
    color: '#DC0028',
    type: 'Scheduled Commercial Bank',
    demographics: 'Age: 21–60 Yrs • Min Sal: Standard ₹25k (Category D requires ₹40k) • Exp: 2 Yrs • CIBIL: 650+',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Classifies into: Super A, Cat A, Cat B, Cat C, Cat D'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Salary Range + CIBIL Sub-Slab',
        color: '#fbbf24',
        logic: '50% to 70% FOIR across salary (>50k, 25k-50k, <25k) and CIBIL (>750, 700-749, 650-699)'
      },
      {
        metric: '3. Obligations',
        dependsOn: '⭐ 3% Credit Card Relief Rule',
        color: '#f87171',
        logic: '⭐ Only 3% CC Obligation! (If Salary < 3x CC POS ➔ Zero obligation). Non-BT EMIs deducted'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'Fixed 60-Month Repayment Room',
        color: '#a78bfa',
        logic: 'Net Permissible EMI reversed strictly across fixed 60-month term'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'CIBIL Score Sub-Slab + Salary Tier',
        color: '#f43f5e',
        logic: '>750 CIBIL: 10.50%–12.00% | 700–749: 11.50%–13.50% | 650–699: 13.00%–15.00%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: '⭐ Bank Policy (Fixed Window)',
        color: '#34d399',
        logic: '⭐ STRICT FLAT TENURE: Exactly 60 Months (5 Years) across all profiles!'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: 'Flat ₹25 Lakhs maximum sanction across all categories'
      }
    ],
    distinctive: 'Only 3% Credit Card obligation. Flat 60M tenure across all profiles. Category D requires ₹40k salary.'
  },
  {
    name: 'Cholamandalam Finance',
    sheet: 'CHOLA',
    color: '#F37021',
    type: 'Leading NBFC',
    demographics: 'Age: 21–60 Yrs (Age 21–23: Co-Applicant Mandatory) • Min Sal: Pvt ₹25k, Banks/NBFCs ₹30k • CIBIL: 700+',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Classifies into: Super A, Cat A, Cat B, Cat C, Cat D, Govt'
      },
      {
        metric: '2. FOIR & Multiplier',
        dependsOn: 'Category + Salary',
        color: '#fbbf24',
        logic: '⭐ Super A & Govt: 70% FOIR (35x Multiplier!) | Cat A & B: 70% FOIR (28x Multiplier) | Cat C & D: 65% FOIR (25x Multiplier)'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% of limit + running personal/auto loan EMIs'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'High Multiplier (25x to 35x) + FOIR',
        color: '#a78bfa',
        logic: 'Loan capacity driven by massive multipliers (up to 35x salary) combined with 70% FOIR'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Loan Amount + Salary',
        color: '#f43f5e',
        logic: '≥ ₹10L & Sal ≥ 75k: 13.75% | ≥ ₹7.5L & Sal ≥ 50k: 14.50% | ≥ ₹5L: 15.00% | Standard: 15.50%–18.00%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category',
        color: '#34d399',
        logic: 'Up to 84 Months (7 Years) across prime categories'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category + Salary + Co-App',
        color: '#2dd4bf',
        logic: 'Super A/A/Govt: ₹30 Lakhs (Requires Pvt Sal ≥ 1.5L / Govt ≥ 1L; Cat A > ₹20L requires Co-App) | Cat B/C/D: ₹20 Lakhs'
      }
    ],
    distinctive: 'Up to 35x multiplier. Age 21-23 requires co-applicant. Cat A > ₹20L requires co-applicant.'
  },
  {
    name: 'L&T Finance',
    sheet: 'LNT',
    color: '#004F9E',
    type: 'Leading NBFC',
    demographics: 'Age: 21–60 Yrs • Min Sal: ₹25,000 • Exp: 6 Months salary credit • CIBIL: 720+ Strictly (CC BT NOT ALLOWED)',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Maps to: Super A, Cat A, Cat B, Cat C, Cat D, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Salary Slab',
        color: '#fbbf24',
        logic: '50% to 70% FOIR across salary brackets'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards (NO CC BT allowed)',
        color: '#f87171',
        logic: 'Credit Card: 5% of limit. ⚠️ Credit Card BT strictly NOT ALLOWED'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'FOIR Net EMI Room',
        color: '#a78bfa',
        logic: 'Reversed from net disposable EMI into loan capacity'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Category + Loan Bracket + Housing',
        color: '#f43f5e',
        logic: '⭐ SPECIAL RATE: 10.99% for Super A/A with Owned House, ₹1.75L+ Sal & 775+ CIBIL! Standard: ₹20L–₹30L (11.50%–12.50%), ₹10L–₹20L (14%), < ₹10L (13%–15%)'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category',
        color: '#34d399',
        logic: 'Up to 72 Months (6 Years)'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category + Housing Accommodation',
        color: '#2dd4bf',
        logic: 'Standard Cap: ₹30 Lakhs | ⭐ RENTED CAP: Category D Rented accommodation strictly capped at ₹20 Lakhs (RENTED - 20LAC)'
      }
    ],
    distinctive: '10.99% rate for owned house + ₹1.75L+ sal. Zero CC BT allowed. Category D rented capped at ₹20L.'
  },
  {
    name: 'Piramal Finance',
    sheet: 'PIRAMAL',
    color: '#1F4E78',
    type: 'Leading NBFC',
    demographics: 'Age: Pvt 21–60 Yrs, Govt 63 Yrs • Min Sal: ₹22,000 (PF deduction mandatory) • Exp: 2 Yrs • CIBIL: 700+',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Maps to: Super A, Cat A, Cat B, Cat C, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Ventile Score',
        color: '#fbbf24',
        logic: 'Low FOIR: 45% | Medium FOIR: 55% | High FOIR: 65%'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% of limit + active personal/commercial loan installments'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'Ventile-Adjusted Cashflow',
        color: '#a78bfa',
        logic: 'Calculates loan capacity from net permissible EMI room'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: '⭐ Ventile Risk Score',
        color: '#f43f5e',
        logic: '11.99% to 28.00% p.a. strictly determined by proprietary bureau ventile scoring'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category + Sector',
        color: '#34d399',
        logic: 'Up to 72 Months (6 Years). Govt employees eligible up to age 63'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category + Salary + CIBIL',
        color: '#2dd4bf',
        logic: 'Super A & A ₹50L Cap requires Net Salary ≥ ₹2 Lakhs AND CIBIL ≥ 750 | Govt: ₹30 Lakhs | Cat B/C/D: Case-to-Case'
      }
    ],
    distinctive: 'Rates driven by proprietary Ventile Score. ₹50L cap requires ₹2L salary and 750 CIBIL. Govt age up to 63 yrs.'
  },
  {
    name: 'SMFG India Credit',
    sheet: 'SMFG',
    color: '#002D62',
    type: 'Leading NBFC',
    demographics: 'Age: Pvt 21–60 Yrs, Govt/Pensioner 65 Yrs • Min Sal: ₹25,000 (0 deduction) • Exp: 24 Months current company • CIBIL: 700+ • CC BT: Max 2 Cards',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Classifies into: Super A, Cat A, Cat B, Cat C, Cat D, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: '8 Salary Brackets',
        color: '#fbbf24',
        logic: '40k-50k (70%), 35k-40k (65%), 30k-35k (65%), 25k-30k (60%), <25k (50%)'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards (Max 2 CC BT)',
        color: '#f87171',
        logic: 'Credit Card: 5% on non-BT cards. ⚠️ Maximum 2 Credit Cards allowed for BT'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'Multiplier (12x to 30x) + FOIR',
        color: '#a78bfa',
        logic: 'Derives loan capacity from granular salary bands and company multipliers'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Salary Band Matrix',
        color: '#f43f5e',
        logic: 'Sal > 1L: 17.00% | 75k-1L: 18.50% | 50k-75k: 18.50% | 40k-50k: 19.00% | 35k-40k: 19.50% | 30k-35k: 21.50% | 25k-30k: 23.00% | < 25k: 24.00%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category + Profile Age',
        color: '#34d399',
        logic: 'Flat up to 60 Months (5 Years). Pensioners up to age 65'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: 'Flat ₹30 Lakhs maximum sanction across all categories'
      }
    ],
    distinctive: 'Maximum 2 Credit Cards allowed for BT. Current vintage requires 24 months. Flat ₹30 Lakhs cap.'
  },
  {
    name: 'AU Small Finance Bank',
    sheet: 'AU BANK',
    color: '#6F2C91',
    type: 'Scheduled Commercial Bank',
    demographics: 'Age: Pvt 21–57 Yrs, Govt 21–59 Yrs • Min Sal: Listed ₹20k, Unlisted ₹25k, NTC ₹30k • CIBIL: 650+ / NTC',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Classifies into: Super A, Cat A, Cat B, Cat D, Unlisted'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Salary Band',
        color: '#fbbf24',
        logic: 'Super A, A, B, D: 60%, 65%, 70%, 75% across salary tiers'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% of limit + all external personal/consumer loan installments'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'FOIR Net EMI Room',
        color: '#a78bfa',
        logic: 'Net EMI capacity reversed into loan amount'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: '⭐ 18-Row Matrix: CIBIL × Salary × Loan Tier',
        color: '#f43f5e',
        logic: 'Segmented by CIBIL (≥750, <750, NTC) × Salary (>1.5L, 50k-1.5L, <50k) × Loan Tier (≥2L vs <2L). Rates: 13.00% to 24.00%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Sector + Age',
        color: '#34d399',
        logic: 'Up to 60 Months (5 Years). Private employee max age: 57 yrs'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'CIBIL Score Type',
        color: '#2dd4bf',
        logic: 'Standard: ₹15 Lakhs | ⭐ SPECIAL NTC RULE: CIBIL -1 capped strictly to ₹3 Lakhs!'
      }
    ],
    distinctive: '18-row CIBIL & ticket matrix. CIBIL -1 capped to ₹3 Lakhs. Private age boundary is 57 yrs.'
  },
  {
    name: 'IDFC First Bank',
    sheet: 'IDFC',
    color: '#8B1538',
    type: 'Private Bank',
    demographics: 'Age: 23–60 Yrs • Min Sal: ₹20,000 • Exp: 2 Yrs • CIBIL: 700+',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Maps to: Super A, Cat A, Cat B, Cat C, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Salary',
        color: '#fbbf24',
        logic: '50% to 70% based on salary and banking relationship'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% limit + full non-BT EMI deduction'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'Dual Engine: MIN(FOIR Loan, Multiplier Loan)',
        color: '#a78bfa',
        logic: 'Evaluates FOIR capacity vs Multiplier (15x to 25x), takes lower'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Category + Salary + CIBIL',
        color: '#f43f5e',
        logic: '10.25% to 15.00% across corporate categories'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category',
        color: '#34d399',
        logic: 'Up to 84 Months (7 Years)'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: 'Up to ₹1 Crore (100L) for corporate prime'
      }
    ],
    distinctive: 'Massive ₹1 Crore cap for corporate prime. Extended 84M tenure. Starts at age 23.'
  },
  {
    name: 'Aditya Birla Finance (ABFL)',
    sheet: 'ABFL',
    color: '#A6192E',
    type: 'Leading NBFC',
    demographics: 'Age: 21–60 Yrs • Min Sal: Tier 1 ₹40k, Tier 2 ₹35k, Tier 3 ₹25k, Tier 4 ₹20k • CIBIL: 700+ • KCC: NOT OBLIGATED',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Employer Name',
        color: '#38bdf8',
        logic: 'Classifies into: Super A, Cat A, Cat B, Cat C, Govt'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Category + Salary + City Tier',
        color: '#fbbf24',
        logic: '50% to 70% FOIR across salary brackets. ⭐ KCC loan is NOT obligated!'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards (Max 5 CC BT)',
        color: '#f87171',
        logic: 'Credit Card: 5% limit. Max 5 CC BT (6x salary). KCC exempt from deduction'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'FOIR Net EMI + Multiplier (up to 25x)',
        color: '#a78bfa',
        logic: 'Net EMI room reversed to loan with multipliers up to 25x'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Loan Amount Bracket',
        color: '#f43f5e',
        logic: '≥ ₹15 Lakhs: 11.50%–13.00% | < ₹15 Lakhs: 12.50%–14.00%'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Category',
        color: '#34d399',
        logic: 'Up to 84 Months (7 Years)'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Category',
        color: '#2dd4bf',
        logic: '₹50 Lakhs maximum sanction'
      }
    ],
    distinctive: 'KCC is not obligated. City-tier salary floors (Tier 1 is 40k). 84M tenure.'
  },
  {
    name: 'Finnable Finance',
    sheet: 'FINNABLE',
    color: '#10B981',
    type: 'Fintech NBFC',
    demographics: 'Age: 21–58 Yrs • Min Sal: Tier 1 ₹20k, Tier 2 ₹15k • Min Loan: ₹50,000 • CIBIL: 650+ / NTC',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Whitelist Employer Verification',
        color: '#38bdf8',
        logic: 'Evaluates employer against fintech database'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Salary Tier',
        color: '#fbbf24',
        logic: '50% to 65% FOIR as per digital algorithm'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Bank EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% of limit + running bank statement EMIs'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'Digital Cashflow Capacity',
        color: '#a78bfa',
        logic: 'Permissible monthly installment reversed to loan amount'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Fintech Risk Scorecard',
        color: '#f43f5e',
        logic: '22.00% to 28.00% p.a. based on digital credit score'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'CIBIL Score Type',
        color: '#34d399',
        logic: 'Standard: 60 Months | ⭐ SPECIAL NTC RULE: CIBIL -1 capped strictly to 36 Months!'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'CIBIL Score Type',
        color: '#2dd4bf',
        logic: 'Standard: ₹10 Lakhs | ⭐ SPECIAL NTC RULE: CIBIL -1 capped strictly to ₹4 Lakhs! (Min: ₹50,000)'
      }
    ],
    distinctive: 'CIBIL -1 capped to 36 Months and ₹4 Lakhs. Min loan starts at ₹50,000. 100% digital app disbursal.'
  },
  {
    name: 'InCred Finance',
    sheet: 'INCRED',
    color: '#F37023',
    type: 'Fintech NBFC',
    demographics: 'Age: 21–60 Yrs • Min Sal: ₹20,000 • Exp: 1 Yr • CIBIL: 675+',
    dependencies: [
      {
        metric: '1. Company Category',
        dependsOn: 'Corporate vs Emerging Tier',
        color: '#38bdf8',
        logic: 'Grades company into corporate vs emerging category'
      },
      {
        metric: '2. FOIR %',
        dependsOn: 'Salary Tier',
        color: '#fbbf24',
        logic: '40% to 70% FOIR as per salary brackets'
      },
      {
        metric: '3. Obligations',
        dependsOn: 'Credit Cards + Active EMIs',
        color: '#f87171',
        logic: 'Credit Card: 5% limit + active loan EMIs'
      },
      {
        metric: '4. Loan Amount',
        dependsOn: 'Net Cashflow + Multiplier (15x-20x)',
        color: '#a78bfa',
        logic: 'Permissible EMI reversed to loan with 15x to 20x multipliers'
      },
      {
        metric: '5. ROI (Interest Rate)',
        dependsOn: 'Bureau Risk Tier',
        color: '#f43f5e',
        logic: '13.49% to 22.00% based on bureau risk tier'
      },
      {
        metric: '6. Max Tenure',
        dependsOn: 'Risk Grade',
        color: '#34d399',
        logic: 'Up to 60 Months (5 Years)'
      },
      {
        metric: '7. Max Loan Cap',
        dependsOn: 'Fixed Product Cap',
        color: '#2dd4bf',
        logic: 'Maximum Sanction: ₹15 Lakhs (Min Loan: ₹50,000)'
      }
    ],
    distinctive: 'Accessible CIBIL starts at 675. Fast digital underwriting. Maximum ₹15 Lakhs sanction.'
  }
];

function generateHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bank Policy Factor Dependency Flowcharts</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
      background: #ffffff;
      color: #000000;
      line-height: 1.3;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 100%;
      height: 297mm;
      max-height: 297mm;
      padding: 16px 20px;
      page-break-after: always;
      position: relative;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* COVER PAGE - MINIMALIST MONOCHROME */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 30px;
      background: #ffffff;
    }

    .cover-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
    }

    .brand-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .brand-sub {
      font-size: 10px;
      font-weight: 600;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .cover-badge-mono {
      font-size: 9px;
      font-weight: 700;
      border: 1.5px solid #000;
      padding: 3px 8px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .cover-center {
      margin: 18px 0;
    }

    .cover-heading {
      font-size: 26px;
      font-weight: 800;
      line-height: 1.25;
      text-transform: uppercase;
      margin-bottom: 10px;
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
    }

    .cover-desc {
      font-size: 11px;
      line-height: 1.5;
      color: #222;
      margin-bottom: 16px;
    }

    .master-formula-box {
      border: 1.5px solid #000;
      padding: 12px 14px;
      background: #fafafa;
      margin-bottom: 16px;
    }

    .master-formula-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid #000;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }

    .master-formula-row {
      display: grid;
      grid-template-columns: 160px 24px 220px 20px 1fr;
      align-items: center;
      padding: 4px 0;
      font-size: 10px;
      border-bottom: 1px dashed #ddd;
    }

    .master-formula-row:last-child {
      border-bottom: none;
    }

    .formula-badge {
      font-weight: 800;
      border: 1px solid #000;
      padding: 1px 5px;
      background: #fff;
    }

    .cover-index-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      border: 1px solid #000;
      padding: 8px 12px;
      font-size: 9.5px;
      background: #fff;
    }

    .cover-footer {
      border-top: 1.5px solid #000;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      font-weight: 600;
      color: #333;
    }

    /* BANK FLOWCHART PAGE STYLES */
    .bank-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }

    .bank-title-area h2 {
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000000;
    }

    .bank-title-area span {
      font-size: 9.5px;
      font-weight: 600;
      color: #333333;
    }

    .bank-type-pill {
      font-size: 8.5px;
      font-weight: 800;
      border: 1.5px solid #000000;
      padding: 2px 7px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* FLOW BOXES */
    .flow-box {
      border: 1.5px solid #000000;
      border-radius: 3px;
      padding: 5px 8px;
      background: #ffffff;
    }

    .gatekeeper-box {
      background: #f9f9f9;
      border: 1.5px solid #000000;
      padding: 5px 8px;
      font-size: 9px;
    }

    .gatekeeper-title {
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .gatekeeper-content {
      font-size: 8.8px;
      color: #111111;
      font-weight: 600;
    }

    /* CONNECTORS */
    .connector-line-vert {
      text-align: center;
      font-size: 8.5px;
      font-weight: 700;
      line-height: 1.1;
      margin: 1px 0;
      color: #000000;
    }

    .connector-fork {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 8px;
      font-weight: 700;
      margin: 1px 0;
      padding: 0 4px;
      color: #000000;
    }

    .connector-fork .fork-line {
      flex: 1;
      border-top: 1px dashed #000000;
      margin: 0 6px;
    }

    /* STEP 1 ROOT NODE */
    .step1-title {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 2px;
      margin-bottom: 3px;
      display: flex;
      justify-content: space-between;
    }

    .dep-pill {
      font-size: 8.8px;
      font-weight: 800;
      border: 1px solid #000000;
      padding: 1px 5px;
      background: #f4f4f4;
      display: inline-block;
      margin-bottom: 2px;
    }

    .step-rule {
      font-size: 8.6px;
      color: #111111;
      line-height: 1.32;
    }

    /* 2-STREAM GRID */
    .stream-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
    }

    .stream-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stream-header-bar {
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1.5px solid #000000;
      padding: 2.5px 6px;
      background: #f0f0f0;
      display: flex;
      justify-content: space-between;
    }

    .stream-card {
      border: 1.5px solid #000000;
      border-radius: 3px;
      padding: 4px 7px;
      background: #ffffff;
    }

    .stream-card.highlight-card {
      border: 2px solid #000000;
      background: #fafafa;
    }

    .card-title-row {
      font-size: 8.8px;
      font-weight: 800;
      text-transform: uppercase;
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }

    .arrow-down-label {
      text-align: center;
      font-size: 7.8px;
      font-weight: 700;
      color: #333333;
      margin: -2px 0;
    }

    /* DISTINCTIVE BOX */
    .distinctive-box {
      border: 1.5px solid #000000;
      border-radius: 3px;
      padding: 5px 8px;
      font-size: 8.6px;
      background: #fcfcfc;
      color: #000000;
    }

    .distinctive-box strong {
      text-transform: uppercase;
      font-weight: 800;
    }

    /* COMPARISON TABLE & MATRIX STYLES */
    .comp-intro-bar {
      border: 1.5px solid #000000;
      background: #f9f9f9;
      padding: 5px 8px;
      font-size: 8.5px;
      margin-bottom: 6px;
      line-height: 1.35;
    }

    .comp-matrix-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 8px;
      line-height: 1.3;
      margin-bottom: 6px;
    }

    .comp-matrix-table th {
      background: #f0f0f0;
      border: 1.5px solid #000000;
      padding: 4px 6px;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 8.2px;
      text-align: left;
    }

    .comp-matrix-table td {
      border: 1px solid #000000;
      padding: 4px 6px;
      vertical-align: middle;
      word-wrap: break-word;
    }

    .comp-matrix-table tr:nth-child(even) {
      background: #fafafa;
    }

    .tag-mono {
      font-weight: 700;
      border: 1px solid #000000;
      padding: 1px 4px;
      border-radius: 2px;
      background: #ffffff;
      display: inline-block;
      font-size: 7.6px;
      line-height: 1.2;
    }

    /* ARCHITECTURAL TREE DIAGRAMS (PAGES 4 & 5) */
    .arch-panel-card {
      border: 1.5px solid #000000;
      border-radius: 3px;
      padding: 8px 10px;
      background: #ffffff;
      margin-bottom: 8px;
    }

    .arch-panel-title {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      border-bottom: 1.5px solid #000000;
      padding-bottom: 4px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }

    .tree-branch-block {
      margin-bottom: 6px;
      font-size: 8.5px;
      line-height: 1.35;
    }

    .tree-branch-block:last-child {
      margin-bottom: 0;
    }

    .tree-model-heading {
      font-weight: 800;
      color: #000000;
      margin-bottom: 2px;
    }

    .tree-bank-desc {
      padding-left: 14px;
      color: #222222;
      font-size: 8px;
    }

    .arch-takeaway-box {
      border: 1.5px solid #000000;
      background: #f9f9f9;
      padding: 6px 10px;
      font-size: 8.5px;
      line-height: 1.4;
      margin-top: 4px;
    }

    .page-footer-bar {
      border-top: 1px solid #000000;
      padding-top: 3px;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      font-weight: 600;
      color: #444444;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE (PAGE 1) -->
  <div class="page cover-page">
    <div class="cover-top">
      <div>
        <div class="brand-title">LaxmiCredit OmniEngine</div>
        <div class="brand-sub">Policy Engineering Blueprint</div>
      </div>
      <div class="cover-badge-mono">19 INSTITUTIONS • NO COLOR PALETTES • MINIMALIST</div>
    </div>

    <div class="cover-center">
      <h1 class="cover-heading">How Each Bank Engine Works<br>Factor Dependency Flowcharts</h1>
      <p class="cover-desc">
        This document specifies the exact sequential decision-making logic of each banking engine in a pure, color-free minimalist format. Every calculation follows a strict dependency chain where customer inputs dictate intermediate multipliers, rate slabs, and loan ceilings.
      </p>

      <div class="master-formula-box">
        <div class="master-formula-title">Universal Dependency Mapping Sequence</div>

        <div class="master-formula-row">
          <div><strong>1. Company Category</strong></div>
          <div style="text-align: center;">👈</div>
          <div><span class="formula-badge">[ Employer Name / Listing ]</span></div>
          <div style="text-align: center;">=</div>
          <div>Super A, Cat A, Cat B, Cat C, Govt, Unlisted</div>
        </div>

        <div class="master-formula-row">
          <div><strong>2. FOIR %</strong></div>
          <div style="text-align: center;">👈</div>
          <div><span class="formula-badge">[ Category + Net Salary ]</span></div>
          <div style="text-align: center;">=</div>
          <div>Determines debt-servicing ratio (45%–75%) + Housing/HL Bonus</div>
        </div>

        <div class="master-formula-row">
          <div><strong>3. Obligations Room</strong></div>
          <div style="text-align: center;">👈</div>
          <div><span class="formula-badge">[ CC (5%/3%) + Active EMIs ]</span></div>
          <div style="text-align: center;">=</div>
          <div>Net EMI Room = (Salary × FOIR%) - Existing Obligations</div>
        </div>

        <div class="master-formula-row">
          <div><strong>4. Loan Amount</strong></div>
          <div style="text-align: center;">👈</div>
          <div><span class="formula-badge">[ Net Room + Multiplier ]</span></div>
          <div style="text-align: center;">=</div>
          <div>Dual Engine: MIN(FOIR PV Loan, Salary Multiplier up to 36x)</div>
        </div>

        <div class="master-formula-row">
          <div><strong>5. ROI (Interest Rate)</strong></div>
          <div style="text-align: center;">👈</div>
          <div><span class="formula-badge">[ Category + Loan Amount ]</span></div>
          <div style="text-align: center;">=</div>
          <div>High tickets (≥10L, 15L, 20L, 35L) unlock prime discounted rates</div>
        </div>

        <div class="master-formula-row">
          <div><strong>6. Max Tenure</strong></div>
          <div style="text-align: center;">👈</div>
          <div><span class="formula-badge">[ Category + Age vs 60 ]</span></div>
          <div style="text-align: center;">=</div>
          <div>Cat A = 84M, Cat B/C = 72M (Maturity strictly ≤ Retirement Age)</div>
        </div>

        <div class="master-formula-row">
          <div><strong>7. Max Loan Cap</strong></div>
          <div style="text-align: center;">👈</div>
          <div><span class="formula-badge">[ Category + City Tier ]</span></div>
          <div style="text-align: center;">=</div>
          <div>Enforces institutional maximum exposure limits (₹10L to ₹1 Cr)</div>
        </div>
      </div>

      <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 6px;">Included Banking Institutions:</div>
      <div class="cover-index-grid">
        ${banks.map((b, i) => `<div>[${i + 1}] ${b.name} (${b.sheet})</div>`).join('')}
      </div>
    </div>

    <div class="cover-footer">
      <div>Source: Master Policy Workbook BANKS POLICYS.xlsx</div>
      <div>Architecture: Factor Dependency Workflow</div>
      <div>Output: Single Clean Monochrome PDF</div>
    </div>
  </div>

  <!-- PAGE 2: CROSS-BANK FACTOR DEPENDENCY COMPARISON (PART 1) -->
  <div class="page">
    <div class="bank-header">
      <div class="bank-title-area">
        <h2>CROSS-BANK FACTOR DEPENDENCY COMPARISON (PART 1)</h2>
        <span>Institutions 1 to 10: Commercial Banks &amp; Premier Lenders</span>
      </div>
      <div class="bank-type-pill">COMPARISON MATRIX</div>
    </div>

    <div class="comp-intro-bar">
      <strong>⚡ Factor Dependency Analysis:</strong> Different banks require distinct combinations of customer inputs. For instance, some calculate FOIR solely from <code>[Category + Salary]</code>, while others factor in <code>[Live Home Loan Bonus]</code> or <code>[Housing Status]</code>. For ROI, ticket-driven lenders look at <code>[Category + Loan Amount]</code>, whereas risk-based lenders evaluate <code>[Category + Salary + CIBIL]</code>.
    </div>

    <table class="comp-matrix-table">
      <thead>
        <tr>
          <th style="width: 100px;">Bank / NBFC</th>
          <th style="width: 140px;">FOIR % Input Factors</th>
          <th style="width: 130px;">Loan Sizing Engine</th>
          <th style="width: 155px;">ROI % Input Factors</th>
          <th style="width: 110px;">Tenure &amp; Cap Factors</th>
          <th>Special Dependency Edge</th>
        </tr>
      </thead>
      <tbody>
        ${banks.slice(0, 10).map(b => `
          <tr>
            <td><strong>${b.name}</strong><br><span style="color: #555; font-size: 7.2px;">${b.sheet}</span></td>
            <td><span class="tag-mono">[ ${b.dependencies[1].dependsOn} ]</span></td>
            <td><span class="tag-mono">[ ${b.dependencies[3].dependsOn} ]</span></td>
            <td><span class="tag-mono">[ ${b.dependencies[4].dependsOn} ]</span></td>
            <td><span class="tag-mono">[ ${b.dependencies[5].dependsOn} ]</span><br><span class="tag-mono" style="margin-top: 2px;">[ ${b.dependencies[6].dependsOn} ]</span></td>
            <td style="font-size: 7.5px; color: #111;">${b.distinctive}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="page-footer-bar">
      <span>LaxmiCredit OmniEngine &bull; Cross-Bank Factor Dependency Matrix (Part 1)</span>
      <span>Page 2 of ${banks.length + 5}</span>
    </div>
  </div>

  <!-- PAGE 3: CROSS-BANK FACTOR DEPENDENCY COMPARISON (PART 2) -->
  <div class="page">
    <div class="bank-header">
      <div class="bank-title-area">
        <h2>CROSS-BANK FACTOR DEPENDENCY COMPARISON (PART 2)</h2>
        <span>Institutions 11 to 19: Leading NBFCs &amp; Digital Fintech Lenders</span>
      </div>
      <div class="bank-type-pill">COMPARISON MATRIX</div>
    </div>

    <div class="comp-intro-bar">
      <strong>⚡ Underwriting Spectrum:</strong> NBFCs and fintechs offer flexible underwriting structures, such as pure FOIR capitalization (no salary multiplier caps), geographical city tier limits, and accessible credit score cutoffs.
    </div>

    <table class="comp-matrix-table">
      <thead>
        <tr>
          <th style="width: 100px;">Bank / NBFC</th>
          <th style="width: 140px;">FOIR % Input Factors</th>
          <th style="width: 130px;">Loan Sizing Engine</th>
          <th style="width: 155px;">ROI % Input Factors</th>
          <th style="width: 110px;">Tenure &amp; Cap Factors</th>
          <th>Special Dependency Edge</th>
        </tr>
      </thead>
      <tbody>
        ${banks.slice(10).map(b => `
          <tr>
            <td><strong>${b.name}</strong><br><span style="color: #555; font-size: 7.2px;">${b.sheet}</span></td>
            <td><span class="tag-mono">[ ${b.dependencies[1].dependsOn} ]</span></td>
            <td><span class="tag-mono">[ ${b.dependencies[3].dependsOn} ]</span></td>
            <td><span class="tag-mono">[ ${b.dependencies[4].dependsOn} ]</span></td>
            <td><span class="tag-mono">[ ${b.dependencies[5].dependsOn} ]</span><br><span class="tag-mono" style="margin-top: 2px;">[ ${b.dependencies[6].dependsOn} ]</span></td>
            <td style="font-size: 7.5px; color: #111;">${b.distinctive}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="page-footer-bar">
      <span>LaxmiCredit OmniEngine &bull; Cross-Bank Factor Dependency Matrix (Part 2)</span>
      <span>Page 3 of ${banks.length + 5}</span>
    </div>
  </div>

  <!-- PAGE 4: ARCHITECTURAL DECISION TREES (PART 1: CAPACITY & LOAN SIZING) -->
  <div class="page">
    <div class="bank-header">
      <div class="bank-title-area">
        <h2>FACTOR DEPENDENCY DECISION TREES (PART 1: CAPACITY &amp; SIZING)</h2>
        <span>Structural Breakdown of FOIR Calculation Models &amp; Loan Amount Engines</span>
      </div>
      <div class="bank-type-pill">DECISION TREES</div>
    </div>

    <!-- TREE 1: FOIR % -->
    <div class="arch-panel-card">
      <div class="arch-panel-title">
        <span>1. FOIR % FACTOR DEPENDENCY DECISION TREE</span>
        <span>DEBT CAPACITY MODELS</span>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── MODEL A: [ Category + Net Monthly Salary ] (Standard Matrix)</div>
        <div class="tree-bank-desc">
          &bull; Rule: FOIR scales solely by company category tier and net take-home salary bracket (50% to 75%).<br>
          &bull; Applied By: Axis Bank, HDFC Bank, Kotak Mahindra, Tata Capital, Bandhan Bank, SMFG India, Chola, L&amp;T Finance, Piramal, AU Small Finance, ABFL, Finnable.
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── MODEL B: [ Category + Salary + Live Home Loan (HL Running Bonus) ]</div>
        <div class="tree-bank-desc">
          &bull; Rule: Applicants with an active running Home Loan receive an instant boost to their allowable debt-to-income ratio!<br>
          &bull; Applied By: <strong>IndusInd Bank (FOIR jumps to 75%!)</strong> &bull; <strong>ICICI Bank (FOIR jumps to 70%!)</strong>.
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── MODEL C: [ Category + Salary + Housing Status (Owned vs Rented) ]</div>
        <div class="tree-bank-desc">
          &bull; Rule: Owned residence receives 5% to 10% higher FOIR headroom compared to rented applicants.<br>
          &bull; Applied By: IndusInd Bank (Owned 70% vs Rented 65%) &bull; Poonawalla Fincorp (Rented strictly capped to 65%).
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">└── MODEL D: [ Category + Salary + CIBIL Score Tier ]</div>
        <div class="tree-bank-desc">
          &bull; Rule: Higher credit scores permit a higher debt-servicing tolerance (+5% policy deviation).<br>
          &bull; Applied By: Poonawalla Fincorp, Bajaj Finance, InCred Financial.
        </div>
      </div>
    </div>

    <!-- TREE 2: LOAN SIZING -->
    <div class="arch-panel-card">
      <div class="arch-panel-title">
        <span>2. LOAN SIZING ENGINE ARCHITECTURE</span>
        <span>CAPITALIZATION MODELS</span>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── DUAL ENGINE: MIN(FOIR PV Loan, Category Multiplier)</div>
        <div class="tree-bank-desc">
          &bull; Rule: Dual underwriting checks both Net EMI capacity room and gross salary multiplier, selecting whichever is LOWER.<br>
          &bull; Multipliers: Super A (up to 36x for 40k+), Cat A/B (24x-30x), Cat C (18x-20x).<br>
          &bull; Applied By: Axis Bank, HDFC Bank, Kotak Mahindra, Tata Capital, Axis Finance.
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── PURE FOIR ENGINE: Net EMI Room ➔ PV Loan (Zero Multiplier Limits)</div>
        <div class="tree-bank-desc">
          &bull; Rule: Entire disposable income room is capitalized directly at interest rate without arbitrary salary multiplier limits.<br>
          &bull; Advantage: Maximizes loan sanction for high-earning individuals with minimal existing obligations.<br>
          &bull; Applied By: <strong>Poonawalla Fincorp</strong>, <strong>InCred Financial</strong>, <strong>Finnable</strong>.
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">└── MULTIPLIER PRIMARY ENGINE</div>
        <div class="tree-bank-desc">
          &bull; Rule: Gross salary multiplier acts as primary loan sizing vehicle, checked against FOIR ceiling.<br>
          &bull; Applied By: Bajaj Finance, Aditya Birla Finance (ABFL).
        </div>
      </div>
    </div>

    <!-- SUMMARY UNDERWRITING GUIDE -->
    <div class="arch-takeaway-box">
      <strong>🎯 Underwriter's Capacity Routing Rule:</strong>
      If applicant has an active Home Loan ➔ Route to <strong>IndusInd (75% FOIR)</strong> or <strong>ICICI (70% FOIR)</strong>.<br>
      If applicant has low obligations and needs maximum loan amount without multiplier capping ➔ Route to <strong>Poonawalla Fincorp (Pure FOIR)</strong>.
    </div>

    <div class="page-footer-bar">
      <span>LaxmiCredit OmniEngine &bull; Architectural Decision Trees (Part 1)</span>
      <span>Page 4 of ${banks.length + 5}</span>
    </div>
  </div>

  <!-- PAGE 5: ARCHITECTURAL DECISION TREES (PART 2: PRICING & CEILINGS) -->
  <div class="page">
    <div class="bank-header">
      <div class="bank-title-area">
        <h2>FACTOR DEPENDENCY DECISION TREES (PART 2: PRICING &amp; CEILINGS)</h2>
        <span>Structural Breakdown of ROI Pricing Matrices &amp; Repayment Duration Limits</span>
      </div>
      <div class="bank-type-pill">DECISION TREES</div>
    </div>

    <!-- TREE 3: ROI PRICING -->
    <div class="arch-panel-card">
      <div class="arch-panel-title">
        <span>3. RATE OF INTEREST (ROI) PRICING DECISION TREE</span>
        <span>INTEREST RATE ASSIGNMENT</span>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── MODEL A: [ Category + Loan Amount Bracket ] (Ticket-Driven Pricing)</div>
        <div class="tree-bank-desc">
          &bull; Rule: Loan amount acts as the primary rate decider. Higher tickets unlock steep interest rate discounts.<br>
          &bull; Slabs: Axis Bank (≥15L ➔ 10.35%) &bull; HDFC Bank (≥20L ➔ 9.99%) &bull; Kotak Bank (≥15L ➔ 9.95%) &bull; Tata Capital (≥15L ➔ 10.99%).
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── MODEL B: [ Category + Salary + CIBIL + Ticket Size ] (Multi-Variable Matrix)</div>
        <div class="tree-bank-desc">
          &bull; Rule: Multi-dimensional matrix combining company category, net monthly income, credit score, and requested loan size.<br>
          &bull; Applied By: <strong>ICICI Bank</strong> (CIBIL 775+ &amp; 75k+ Sal &amp; ≥20L ➔ 9.99%) &bull; <strong>Poonawalla Fincorp</strong> (5 Grids + CIBIL markups) &bull; Bandhan Bank &bull; InCred.
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── MODEL C: [ Category + CIBIL Score Tier ] (Pure Risk-Based Pricing)</div>
        <div class="tree-bank-desc">
          &bull; Rule: Rate matrix is directly tiered by credit score brackets (750+, 725-749, 700-724).<br>
          &bull; Applied By: Bajaj Finance, Chola, Piramal Capital, SMFG India Credit, AU Small Finance Bank.
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">└── MODEL D: [ Loan Amount + Insurance Mandate ]</div>
        <div class="tree-bank-desc">
          &bull; Rule: Preferential pricing (9.99%–10.49%) is bundled with a mandatory insurance policy requirement.<br>
          &bull; Applied By: <strong>IndusInd Bank</strong>.
        </div>
      </div>
    </div>

    <!-- TREE 4: TENURE & CAPPING -->
    <div class="arch-panel-card">
      <div class="arch-panel-title">
        <span>4. TENURE &amp; SANCTION CAPPING DECISION TREE</span>
        <span>DURATION &amp; EXPOSURE LIMITS</span>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── TENURE: Category A/Govt = 84 Months (7 Yrs) | Category B/C = 72 Months (6 Yrs)</div>
        <div class="tree-bank-desc">
          &bull; Rule: Up to 84 Months allowed for prime corporate/government profiles, capped at retirement age 60.<br>
          &bull; Applied By: Axis Bank, IndusInd Bank, HDFC Bank, Poonawalla Fincorp, AU Small Finance Bank.
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── TENURE: Flat 72 Months Across Categories (Max Age 60)</div>
        <div class="tree-bank-desc">
          &bull; Rule: Standard 6-year duration for all eligible employers; Cat D strictly capped at 60 Months (5 Years).<br>
          &bull; Applied By: ICICI Bank, Kotak Mahindra, Tata Capital, Bandhan Bank, L&amp;T Finance.
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">├── SPECIAL TENURE RULE: CIBIL -1 (NTC) Strictly Capped to 48 Months</div>
        <div class="tree-bank-desc">
          &bull; Rule: First-time borrowers (New To Credit) without active bureau history are capped to a maximum of 4 Years.<br>
          &bull; Applied By: <strong>IndusInd Bank</strong>.
        </div>
      </div>

      <div class="tree-branch-block">
        <div class="tree-model-heading">└── LOAN CAPPING: Pure Category Slabs vs Category + City Tier</div>
        <div class="tree-bank-desc">
          &bull; Pure Category: Axis (₹50L), HDFC (₹75L), Kotak (₹1 Cr), ICICI (₹1 Cr).<br>
          &bull; Category + City Tier: Poonawalla (Metro ₹60L, T1 ₹50L, T2 ₹40L, Rest ₹25L), Piramal, SMFG India Credit.
        </div>
      </div>
    </div>

    <!-- SUMMARY UNDERWRITING GUIDE -->
    <div class="arch-takeaway-box">
      <strong>🎯 Underwriter's Pricing Routing Rule:</strong>
      If applicant seeks large loan (≥15L/20L) at lowest interest rate ➔ Route to <strong>Kotak (9.95%)</strong>, <strong>HDFC (9.99%)</strong>, or <strong>Axis (10.35%)</strong>.<br>
      If applicant is New to Credit (CIBIL -1) ➔ Route to <strong>IndusInd Bank</strong> (note 48M tenure cap).
    </div>

    <div class="page-footer-bar">
      <span>LaxmiCredit OmniEngine &bull; Architectural Decision Trees (Part 2)</span>
      <span>Page 5 of ${banks.length + 5}</span>
    </div>
  </div>

  <!-- INDIVIDUAL BANK PAGES (PAGES 6 TO 24) -->
  ${banks.map((b, idx) => {
    const d1 = b.dependencies[0]; // Category
    const d2 = b.dependencies[1]; // FOIR
    const d3 = b.dependencies[2]; // Obligations
    const d4 = b.dependencies[3]; // Loan Amount
    const d5 = b.dependencies[4]; // ROI
    const d6 = b.dependencies[5]; // Tenure
    const d7 = b.dependencies[6]; // Max Cap

    return `
    <div class="page">
      <!-- HEADER -->
      <div class="bank-header">
        <div class="bank-title-area">
          <h2>${b.name}</h2>
          <span>${b.type} &bull; Excel Policy Sheet: [ ${b.sheet} ]</span>
        </div>
        <div class="bank-type-pill">
          FACTOR DEPENDENCY FLOWCHART
        </div>
      </div>

      <!-- GATEKEEPER / DEMOGRAPHIC FILTER BOX -->
      <div class="gatekeeper-box">
        <div class="gatekeeper-title">🛡️ GATEKEEPER / DEMOGRAPHIC FILTER</div>
        <div class="gatekeeper-content">${b.demographics}</div>
      </div>

      <!-- CONNECTOR 1 -->
      <div class="connector-line-vert">
        │ PASS<br>
        ▼
      </div>

      <!-- STEP 1: COMPANY CATEGORY RESOLUTION -->
      <div class="flow-box">
        <div class="step1-title">
          <span>[ STEP 1 ] COMPANY CATEGORY RESOLUTION</span>
          <span>MASTER DATABASE LOOKUP</span>
        </div>
        <div>
          <span class="dep-pill">👉 DEPENDS ON: [ ${d1.dependsOn.toUpperCase()} ]</span>
        </div>
        <div class="step-rule"><strong>Calculation &amp; Policy Rule:</strong> ${d1.logic}</div>
      </div>

      <!-- CONNECTOR FORK -->
      <div class="connector-fork">
        <span>▼ Passes Category Tier</span>
        <div class="fork-line"></div>
        <span>▼ Passes Category Tier</span>
      </div>

      <!-- 2-STREAM FLOWCHART GRID -->
      <div class="stream-grid">

        <!-- STREAM A: Capacity & Loan Calculation -->
        <div class="stream-col">
          <div class="stream-header-bar">
            <span>STREAM A: Capacity &amp; Loan Calculation</span>
            <span>Steps 2 ➔ 4</span>
          </div>

          <!-- STEP 2: FOIR % -->
          <div class="stream-card">
            <div class="card-title-row">
              <span>[ STEP 2 ] FOIR % (DEBT BURDEN RATIO)</span>
            </div>
            <div>
              <span class="dep-pill">👉 DEPENDS ON: [ ${d2.dependsOn.toUpperCase()} ]</span>
            </div>
            <div class="step-rule">${d2.logic}</div>
          </div>

          <div class="arrow-down-label">⬇️ Feeds FOIR %</div>

          <!-- STEP 3: OBLIGATIONS & NET ROOM -->
          <div class="stream-card">
            <div class="card-title-row">
              <span>[ STEP 3 ] OBLIGATIONS &amp; NET ROOM</span>
            </div>
            <div>
              <span class="dep-pill">👉 DEPENDS ON: [ ${d3.dependsOn.toUpperCase()} ]</span>
            </div>
            <div class="step-rule">${d3.logic}</div>
          </div>

          <div class="arrow-down-label">⬇️ Feeds Net EMI Capacity</div>

          <!-- STEP 4: LOAN AMOUNT ELIGIBILITY -->
          <div class="stream-card">
            <div class="card-title-row">
              <span>[ STEP 4 ] LOAN AMOUNT ELIGIBILITY</span>
            </div>
            <div>
              <span class="dep-pill">👉 DEPENDS ON: [ ${d4.dependsOn.toUpperCase()} ]</span>
            </div>
            <div class="step-rule">${d4.logic}</div>
          </div>

        </div>

        <!-- STREAM B: Pricing, Tenure & Capping -->
        <div class="stream-col">
          <div class="stream-header-bar">
            <span>STREAM B: Pricing, Tenure &amp; Capping</span>
            <span>Steps 5 ➔ 7</span>
          </div>

          <!-- STEP 5: RATE OF INTEREST (ROI %) -->
          <div class="stream-card highlight-card">
            <div class="card-title-row">
              <span>[ STEP 5 ⭐ ] RATE OF INTEREST (ROI %)</span>
            </div>
            <div>
              <span class="dep-pill">👉 DEPENDS ON: [ ${d5.dependsOn.toUpperCase()} ]</span>
            </div>
            <div class="step-rule"><strong>${d5.logic}</strong></div>
          </div>

          <div class="arrow-down-label">⬇️ Applies Duration &amp; Ceilings</div>

          <!-- STEP 6: MAX REPAYMENT TENURE -->
          <div class="stream-card">
            <div class="card-title-row">
              <span>[ STEP 6 ] MAX REPAYMENT TENURE</span>
            </div>
            <div>
              <span class="dep-pill">👉 DEPENDS ON: [ ${d6.dependsOn.toUpperCase()} ]</span>
            </div>
            <div class="step-rule">${d6.logic}</div>
          </div>

          <div class="arrow-down-label">⬇️ Sanction Limits</div>

          <!-- STEP 7: MAX SANCTION CEILING -->
          <div class="stream-card">
            <div class="card-title-row">
              <span>[ STEP 7 ] MAX SANCTION CEILING</span>
            </div>
            <div>
              <span class="dep-pill">👉 DEPENDS ON: [ ${d7.dependsOn.toUpperCase()} ]</span>
            </div>
            <div class="step-rule">${d7.logic}</div>
          </div>

        </div>

      </div>

      <!-- CONNECTOR 3 -->
      <div class="connector-line-vert">
        │<br>
        ▼
      </div>

      <!-- DISTINCTIVE POLICY FACTOR BOX -->
      <div class="distinctive-box">
        <strong>⭐ DISTINCTIVE POLICY FACTOR:</strong>
        <span>${b.distinctive}</span>
      </div>

      <!-- PAGE FOOTER -->
      <div class="page-footer-bar">
        <span>LaxmiCredit OmniEngine &bull; ${b.name} Factor Dependency Flowchart</span>
        <span>Page ${idx + 6} of ${banks.length + 5}</span>
      </div>
    </div>
  `}).join('')}

</body>
</html>`;
}

async function run() {
  console.log('Generating Factor Dependency HTML for 19 Banks...');
  const html = generateHTML();

  const outputPath1 = path.join(__dirname, 'Bank_Eligibility_Engine_Flowcharts.pdf');
  const outputPath2 = path.join(__dirname, 'public', 'Bank_Eligibility_Engine_Flowcharts.pdf');
  const outputPathRoot = path.join(__dirname, '..', '..', '..', 'Bank_Eligibility_Engine_Flowcharts.pdf');

  console.log('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  console.log('Rendering unified PDF with exact Factor Dependencies...');
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  await browser.close();

  fs.writeFileSync(outputPath1, pdfBuffer);
  console.log('Saved to:', outputPath1);

  try { fs.writeFileSync(outputPath2, pdfBuffer); } catch (e) {}
  try { fs.writeFileSync(outputPathRoot, pdfBuffer); } catch (e) {}

  console.log('Completed successfully! Total size:', (pdfBuffer.length / 1024 / 1024).toFixed(2), 'MB');
}

module.exports = { generateHTML, banks, run };

if (require.main === module) {
  run().catch(err => {
    console.error('Error generating PDF:', err);
    process.exit(1);
  });
}
