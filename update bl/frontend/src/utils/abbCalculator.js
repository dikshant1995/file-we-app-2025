import { parseISO, subDays, startOfMonth, subMonths, endOfMonth, format, isBefore, isAfter, endOfDay, isSameDay, getDaysInMonth, addDays, differenceInDays } from 'date-fns';
import { nbfcConfig } from './nbfcConfig';

/**
 * Normalizes dataset, groups by date, keeps last transaction balance per day.
 * Returns a filled dictionary of Date (YYYY-MM-DD) -> Balance.
 */
function fillDailyBalances(dataset_1, targetEndDate, options = {}) {
  const { accountType, sanctionedLimit = 0 } = options;
  const balanceMap = {}; // { 'YYYY-MM-DD': number }
  
  let earliestDateInTransactions = null;
  
  for (const row of dataset_1) {
    if (!row.Date || row.Balance === undefined) continue;
    try {
      let val = parseFloat(row.Balance);
      
      if (accountType === 'limit') {
        val = parseFloat(sanctionedLimit) + val;
      }

      balanceMap[row.Date] = val;
      
      const d = parseISO(row.Date);
      if (!earliestDateInTransactions || isBefore(d, earliestDateInTransactions)) {
        earliestDateInTransactions = d;
      }
    } catch (e) {
      console.error("Date parse error", e);
    }
  }

  if (!earliestDateInTransactions) return balanceMap;

  const fullyFilled = {};
  let currentBalance = 0;
  
  const earliestStr = format(earliestDateInTransactions, 'yyyy-MM-dd');
  currentBalance = balanceMap[earliestStr];

  let currDate = earliestDateInTransactions;
  while (!isAfter(currDate, targetEndDate)) {
    const k = format(currDate, 'yyyy-MM-dd');
    if (balanceMap[k] !== undefined) {
      currentBalance = balanceMap[k];
    }
    fullyFilled[k] = currentBalance;
    currDate = addDays(currDate, 1);
  }

  return fullyFilled;
}

/**
 * Calculates ABB for a specific set of dates over a target timeframe.
 */
function calculateSpecificABB(dailyBalances, targetEndDate, daysToCalculate, datesToCheck) {
  const startDate = subDays(targetEndDate, daysToCalculate - 1);
  const values = [];
  
  let curr = startDate;
  while (!isAfter(curr, targetEndDate)) {
    const k = format(curr, 'yyyy-MM-dd');
    const bal = dailyBalances[k] || 0;
    
    const dayOfMonth = curr.getDate();
    const maxDaysInMonth = getDaysInMonth(curr);
    
    let isIncluded = datesToCheck.includes(dayOfMonth);
    
    if (datesToCheck.includes(30) && dayOfMonth === maxDaysInMonth && maxDaysInMonth < 30) {
      isIncluded = true;
    }
    if (datesToCheck.includes(31) && dayOfMonth === maxDaysInMonth && maxDaysInMonth < 31) {
      isIncluded = true;
    }

    if (isIncluded) {
      values.push(bal);
    }
    curr = addDays(curr, 1);
  }

  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

/**
 * Calculates true daily average for a timeframe.
 */
function calculateDailyAverage(dailyBalances, targetEndDate, daysToCalculate) {
  const startDate = subDays(targetEndDate, daysToCalculate - 1);
  let sum = 0;
  let count = 0;
  
  let curr = startDate;
  while (!isAfter(curr, targetEndDate)) {
    const k = format(curr, 'yyyy-MM-dd');
    sum += (dailyBalances[k] || 0);
    count++;
    curr = addDays(curr, 1);
  }
  return count ? sum / count : 0;
}

/**
 * Comparative engine to calculate ABBs for all institutions in nbfcConfig.
 * Only calculates 180 and 365 days.
 */
export function getInstitutionalComparison(dailyBalances, targetEndDate) {
  return nbfcConfig.map(nbfc => {
    const results = {
      name: nbfc.name,
      minDays: nbfc.minDays,
      note: nbfc.note,
      calculations: []
    };

    const timeframes = [180, 365];

    timeframes.forEach(tf => {
      if (nbfc.variants) {
        nbfc.variants.forEach(variant => {
          results.calculations.push({
            timeframe: tf,
            label: variant.label,
            dates: variant.dates,
            abb: calculateSpecificABB(dailyBalances, targetEndDate, tf, variant.dates)
          });
        });
      } else if (nbfc.dates) {
        results.calculations.push({
          timeframe: tf,
          label: "Standard",
          dates: nbfc.dates,
          abb: calculateSpecificABB(dailyBalances, targetEndDate, tf, nbfc.dates)
        });
      } else {
        results.calculations.push({
          timeframe: tf,
          label: "Daily Average",
          dates: "Daily",
          abb: calculateDailyAverage(dailyBalances, targetEndDate, tf)
        });
      }
    });

    return results;
  });
}

/**
 * Engine to calculate the ABBs based on strict Rules
 */
export function calculateABB(dataset_1, options = {}) {
  let latestDate = null;
  let earliestDate = null;
  
  for (const row of dataset_1) {
    if (!row.Date) continue;
    const d = parseISO(row.Date);
    
    if (!latestDate || isAfter(d, latestDate)) {
      latestDate = d;
    }
    if (!earliestDate || isBefore(d, earliestDate)) {
      earliestDate = d;
    }
  }
  
  if (!latestDate || !earliestDate) {
    return { error: "No valid transaction dates found in statement" };
  }

  // Calculate total history span in days
  const historySpanInDays = differenceInDays(latestDate, earliestDate);
  const hasMinimumHistory = historySpanInDays >= 180;

  const receivedDate = latestDate;
  
  // Target end Date is the last day of the previous month.
  let targetEndDate = endOfMonth(subMonths(receivedDate, 1));
  
  if (isBefore(targetEndDate, earliestDate)) {
    targetEndDate = receivedDate;
  }
  
  const dailyBalances = fillDailyBalances(dataset_1, targetEndDate, options);
  const comparisons = getInstitutionalComparison(dailyBalances, targetEndDate);
  
  const calculateForDays = (daysToCalculate) => {
    const startDate = subDays(targetEndDate, daysToCalculate - 1); 
    
    let sum = 0;
    let count = 0;
    
    const p1 = [], p2 = [], p3 = [], p4 = [];
    const matrix1 = {}, matrix2 = {}, matrix3 = {}, matrix4 = {};

    const abb1_dates = [5, 10, 15, 20, 25];
    const abb2_dates = [5, 10, 15, 25];
    const abb3_dates = [2, 10, 20, 30];
    const abb4_dates = [1, 5, 10, 15, 20, 25];
    const sanctionedLimit = parseFloat(options.sanctionedLimit || 0);
    const isLimitAccount = options.accountType === 'limit' && sanctionedLimit > 0;
    let utilisationSum = 0;
    let peakUtilisation = 0;

    let curr = startDate;
    while (!isAfter(curr, targetEndDate)) {
      const k = format(curr, 'yyyy-MM-dd');
      const bal = dailyBalances[k] || 0;
      
      sum += bal;
      count++;
      
      // Calculate daily utilisation % for limit accounts
      if (isLimitAccount) {
        // bal is 'Available Headroom'. Used amount = Limit - Headroom
        const usedAmount = Math.max(0, sanctionedLimit - bal);
        const dailyUtil = (usedAmount / sanctionedLimit) * 100;
        utilisationSum += dailyUtil;
        if (dailyUtil > peakUtilisation) peakUtilisation = dailyUtil;
      }
      
      const dayOfMonth = curr.getDate();
      const maxDaysInMonth = getDaysInMonth(curr);
      const monthKey = format(curr, 'MMM yyyy').toUpperCase();
      
      if (!matrix1[monthKey]) matrix1[monthKey] = { "Month": monthKey };
      if (!matrix2[monthKey]) matrix2[monthKey] = { "Month": monthKey };
      if (!matrix3[monthKey]) matrix3[monthKey] = { "Month": monthKey };
      if (!matrix4[monthKey]) matrix4[monthKey] = { "Month": monthKey };
      
      if (abb1_dates.includes(dayOfMonth)) {
        p1.push(bal);
        matrix1[monthKey][String(dayOfMonth)] = bal;
      }
      
      if (abb2_dates.includes(dayOfMonth)) {
        p2.push(bal);
        matrix2[monthKey][String(dayOfMonth)] = bal;
      }
      
      let isAbb3 = abb3_dates.includes(dayOfMonth);
      let dayKey3 = String(dayOfMonth);
      if (dayOfMonth === maxDaysInMonth && maxDaysInMonth < 30) {
        isAbb3 = true;
        dayKey3 = "30";
      }
      if (isAbb3) {
        p3.push(bal);
        matrix3[monthKey][dayKey3] = bal;
      }
      if (abb4_dates.includes(dayOfMonth)) {
        p4.push(bal);
        matrix4[monthKey][String(dayOfMonth)] = bal;
      }

      curr = addDays(curr, 1);
    }

    const calcAvg = (arr) => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0;

    return {
      averageBalance: count ? sum / count : 0,
      averageUtilisation: (isLimitAccount && count) ? (utilisationSum / count) : 0,
      peakUtilisation: (isLimitAccount) ? peakUtilisation : 0,
      abb1: calcAvg(p1),
      abb2: calcAvg(p2),
      abb3: calcAvg(p3),
      abb4: calcAvg(p4),
      matrices: {
        abb1: Object.values(matrix1),
        abb2: Object.values(matrix2),
        abb3: Object.values(matrix3),
        abb4: Object.values(matrix4)
      }
    };
  };

  const c180 = calculateForDays(180);
  const c365 = calculateForDays(365);
  
  const longestValid = !c365.error ? c365 : c180;

  return {
    calc180: c180,
    calc365: c365,
    historySpanInDays,
    hasMinimumHistory,
    comparisons,
    targetEndDate: format(targetEndDate, 'yyyy-MM-dd'),
    matrices: longestValid.matrices,
    averageUtilisation: longestValid.averageUtilisation,
    peakUtilisation: longestValid.peakUtilisation
  };
}

export function extractEmiDeductions(dataset_3) {
  if (!dataset_3) return [];
  
  // Broad & Precise EMI & Lender detection pattern for debit transactions
  const emiPattern = /(?:^|[^A-Z])(EMI|ACH|ACHD|NACH|ECS|SI|STANDING INSTRUCTION|SI MATCH|AUTO DEBIT|AUTO DEB|LOAN|DR INW|DRINW|ADITYA BIRLA|HERO FIN|BAJAJ FIN|BAJAJ SERV|L&T FIN|L \& T|LANDT|PIRAMAL|TATA CAP|CHOLA|POONAWALA|UGRO|CLIX|LENDINGKART|FLEXILOAN|INCRED|SMFG|FULLERTON|MUTHOOT|FINCORP|FINSERV|CAPITAL|CREDIT)(?:[^A-Z]|$)/;

  return dataset_3.filter(row => {
    if (!row.Dr || row.Dr <= 0) return false;
    const narration = String(row.Narration || "").toUpperCase();
    return emiPattern.test(narration);
  });
}

export function generateMonthlySummary(dataset_3, abbData, proprietorName = "", sisterFirmName = "") {
  if (!dataset_3 || !abbData) return [];
  
  // Decide lookup timeframe based on successful logic blocks
  let days = 30;
  if (abbData.calc365 && !abbData.calc365.error) days = 365;
  else if (abbData.calc180 && !abbData.calc180.error) days = 180;
  
  const endDString = abbData.targetEndDate;
  if (!endDString) return [];
  const endDate = parseISO(endDString);
  const startDate = subDays(endDate, days - 1);
  
  // Bound transactions strictly within the ABB Calculation mapping
  const validTxns = dataset_3.filter(row => {
    if (!row.Date) return false;
    const d = parseISO(row.Date);
    if (isBefore(d, startDate) || isAfter(d, endDate)) return false;
    return true;
  });

  const grouped = {};
  
  validTxns.forEach(row => {
    const dateObj = new Date(row.Date);
    const monthKey = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        Month: monthKey,
        Total_Cash: 0,
        Cash_Count: 0,
        Cr_Count: 0,
        Total_Credit_Amount: 0,
        Inter_Firm_Credits: 0,
        Final_BTO: 0,
        Dr_Count: 0,
        Inward_Returns: 0,
        Outward_Returns: 0
      };
    }
    
    const isDr = row.Dr && parseFloat(row.Dr) > 0;
    const isCr = row.Cr && parseFloat(row.Cr) > 0;
    
    if (isDr) grouped[monthKey].Dr_Count += 1;
    if (isCr) {
      grouped[monthKey].Cr_Count += 1;
      grouped[monthKey].Total_Credit_Amount += parseFloat(row.Cr);
      
      const narrC = String(row.Narration || "").toUpperCase();
      // Strict regex matching physical cash deposits
      const isCash = /(?:^|[^A-Z])(CASHDEP|BY CASH|CASH DEPOSIT|CASH RECEIPT|CSH DEP)/.test(narrC) || 
                     (/(?:^|[^A-Z])CASH(?:[^A-Z]|$)/.test(narrC));

      if (isCash) {
        grouped[monthKey].Cash_Count += 1;
        grouped[monthKey].Total_Cash += parseFloat(row.Cr);
      }
      
      // Sister Firm & Inter-Firm Logic
      let matchedInterFirm = false;
      const narrNoSpace = narrC.replace(/\s+/g, '');
      
      if (proprietorName && proprietorName.trim() !== "") {
        const propRegex = new RegExp(proprietorName.trim(), 'i');
        const propRegexNoSpace = new RegExp(proprietorName.replace(/\s+/g, ''), 'i');
        if (propRegex.test(narrC) || propRegexNoSpace.test(narrNoSpace)) matchedInterFirm = true;
      }
      
      if (!matchedInterFirm && sisterFirmName && sisterFirmName.trim() !== "") {
        const sisterRegex = new RegExp(sisterFirmName.trim(), 'i');
        const sisterRegexNoSpace = new RegExp(sisterFirmName.replace(/\s+/g, ''), 'i');
        if (sisterRegex.test(narrC) || sisterRegexNoSpace.test(narrNoSpace)) matchedInterFirm = true;
      }

      if (matchedInterFirm) {
        grouped[monthKey].Inter_Firm_Credits += parseFloat(row.Cr);
      }
      
      // Calculate Final BTO (Total Credit - Inter Firm Credits)
      grouped[monthKey].Final_BTO = grouped[monthKey].Total_Credit_Amount - grouped[monthKey].Inter_Firm_Credits;
    }
    
    // Process Check Bounces (Returns) independent of Dr/Cr status
    const narr = String(row.Narration || "").toUpperCase();
    if (/(?:I\/W|INWARD|I-W)\s*(?:CHQ|CHEQ|CHEQUE|CLG)?\s*(?:RTN|RETURN|RET)/i.test(narr)) {
      grouped[monthKey].Inward_Returns += 1;
    }
    else if (/(?:O\/W|OUTWARD|O-W)\s*(?:CHQ|CHEQ|CHEQUE|CLG)?\s*(?:RTN|RETURN|RET)/i.test(narr)) {
      grouped[monthKey].Outward_Returns += 1;
    }
  });

  const finalSummary = [];
  let gCashAmt = 0, gCashCount = 0, gCr = 0, gDr = 0;
  let gCrAmt = 0;
  let gInterFirm = 0;
  let gIw = 0, gOw = 0;
  
  for (const [month, obj] of Object.entries(grouped)) {
    const totalReturns = obj.Inward_Returns + obj.Outward_Returns;
    const totalTxns = obj.Cr_Count + obj.Dr_Count;
    const ratioStr = totalTxns > 0 ? ((totalReturns / totalTxns) * 100).toFixed(2) + "%" : "0.00%";
    const netBTO = obj.Total_Credit_Amount - obj.Total_Cash;
    
    finalSummary.push({
      "Month": obj.Month,
      "Total BTO (₹)": obj.Total_Credit_Amount.toFixed(2),
      "Inter Firm Credits (₹)": obj.Inter_Firm_Credits.toFixed(2),
      "Final BTO (₹)": obj.Final_BTO.toFixed(2),
      "Net BTO (Excl. Cash) (₹)": netBTO.toFixed(2),
      "Total Cash Deposit (₹)": obj.Total_Cash.toFixed(2),
      "Cash Deposit Count": obj.Cash_Count,
      "Total Credit Entries": obj.Cr_Count,
      "Total Debit Entries": obj.Dr_Count,
      "Inward Chq Returns": obj.Inward_Returns,
      "Outward Chq Returns": obj.Outward_Returns,
      "Total Returns": totalReturns,
      "Inward Outward Chq Bounce Ratio": ratioStr
    });
    
    gCashAmt += obj.Total_Cash;
    gCashCount += obj.Cash_Count;
    gCr += obj.Cr_Count;
    gCrAmt += obj.Total_Credit_Amount;
    gInterFirm += obj.Inter_Firm_Credits;
    gDr += obj.Dr_Count;
    gIw += obj.Inward_Returns;
    gOw += obj.Outward_Returns;
  }
  
  if (finalSummary.length > 0) {
    const gTotalReturns = gIw + gOw;
    const gTotalTxns = gCr + gDr;
    const gRatioStr = gTotalTxns > 0 ? ((gTotalReturns / gTotalTxns) * 100).toFixed(2) + "%" : "0.00%";
    const gNetBTO = gCrAmt - gCashAmt;
    const gFinalBTO = gCrAmt - gInterFirm;
    
    finalSummary.push({}); // Visual space
    finalSummary.push({
      "Month": "GRAND TOTAL",
      "Total BTO (₹)": gCrAmt.toFixed(2),
      "Inter Firm Credits (₹)": gInterFirm.toFixed(2),
      "Final BTO (₹)": gFinalBTO.toFixed(2),
      "Net BTO (Excl. Cash) (₹)": gNetBTO.toFixed(2),
      "Total Cash Deposit (₹)": gCashAmt.toFixed(2),
      "Cash Deposit Count": gCashCount,
      "Total Credit Entries": gCr,
      "Total Debit Entries": gDr,
      "Inward Chq Returns": gIw,
      "Outward Chq Returns": gOw,
      "Total Returns": gTotalReturns,
      "Inward Outward Chq Bounce Ratio": gRatioStr
    });
  }
  
  return finalSummary;
}

export function generateRecurringTransactions(dataset_3, abbData) {
  if (!dataset_3 || !abbData) return [];
  
  // Decide lookup timeframe based on active calculation metrics
  let days = 30;
  if (abbData.calc365 && !abbData.calc365.error) days = 365;
  else if (abbData.calc180 && !abbData.calc180.error) days = 180;
  
  const endDString = abbData.targetEndDate;
  if (!endDString) return [];
  const endDate = parseISO(endDString);
  const startDate = subDays(endDate, days - 1);
  
  const validTxns = dataset_3.filter(row => {
    if (!row.Date) return false;
    const d = parseISO(row.Date);
    if (isBefore(d, startDate) || isAfter(d, endDate)) return false;
    return true;
  });

  const distinctMonthsSet = new Set();
  let totalNetBto = 0; // Pure non-cash revenue

  validTxns.forEach(row => {
    const dObj = new Date(row.Date);
    distinctMonthsSet.add(dObj.getFullYear() + '-' + dObj.getMonth());
    
    if (row.Cr && parseFloat(row.Cr) > 0) {
      const narr = String(row.Narration || "").toUpperCase();
      const isCash = /(?:^|[^A-Z])(CASHDEP|BY CASH|CASH DEPOSIT|CASH RECEIPT|CSH DEP)/.test(narr) || 
                     (/(?:^|[^A-Z])CASH(?:[^A-Z]|$)/.test(narr));
      if (!isCash) {
        totalNetBto += parseFloat(row.Cr);
      }
    }
  });

  const totalActiveMonths = distinctMonthsSet.size;
  // Rigorous Threshold: Entity must visibly appear in nearly every single active month
  const minThreshold = Math.max(2, totalActiveMonths - 1);

  // Deep structural string cleaning to expose base transaction signatures
  const extractEntityName = (narration) => {
    let n = String(narration || "").toUpperCase();
    
    // Snag clean UPI handles immediately
    const upiMatch = n.match(/[A-Z0-9.\-_]+@[A-Z]+/);
    if (upiMatch) return upiMatch[0];
    
    n = n.replace(/\b\d+\b/g, ' '); // Strip bare digits (Reference numbers)
    n = n.replace(/\b\d{2}[/-]\d{2}[/-]\d{2,4}\b/g, ' '); // Strip internal dates
    n = n.replace(/\b(?:IMPS|NEFT|RTGS|UPI|ACH|NACH|FT|INF|INB|REV|REF|MOB|NETBANK|IB|MB)\b/g, ' '); // Strip tech prefixes
    n = n.replace(/[^A-Z]/g, ' ').replace(/\s+/g, ' ').trim(); // Leave clean alphabetical structure
    
    const words = n.split(' ').slice(0, 3).join(' '); // Capture 3-word primary classification fingerprint
    if (!words || words.length < 3) return "GENERIC_TRANSACTION";
    return words;
  };

  const entities = {};

  validTxns.forEach(row => {
    const isDr = row.Dr && parseFloat(row.Dr) > 0;
    const isCr = row.Cr && parseFloat(row.Cr) > 0;
    if (!isDr && !isCr) return;

    const rawNarr = String(row.Narration || "").toUpperCase();
    
    // Explicitly exclude any auto-debits, NACH, ACH, or Loans so they do not overpower standard vendors
    const emiExclusion = /(?:^|[^A-Z])(EMI|ACH|ACHD|NACH|STANDING INSTRUCTION|SI MATCH|AUTO DEBIT|LOAN)(?:[^A-Z]|$)/;
    if (emiExclusion.test(rawNarr)) return;

    const sig = extractEntityName(row.Narration);
    if (sig === "GENERIC_TRANSACTION") return;
    
    const typeKey = isDr ? 'Debit' : 'Credit';
    const compositeKey = sig + '_' + typeKey;

    const dObj = new Date(row.Date);
    // Bind to abstract absolute month maps
    const mKey = dObj.getFullYear() + '-' + dObj.getMonth();
    
    if (!entities[compositeKey]) {
      entities[compositeKey] = {
        Signature: sig,
        Type: typeKey,
        MonthsActive: new Set(),
        TotalCount: 0,
        TotalAmount: 0
      };
    }
    
    entities[compositeKey].MonthsActive.add(mKey);
    entities[compositeKey].TotalCount += 1;
    entities[compositeKey].TotalAmount += isDr ? parseFloat(row.Dr) : parseFloat(row.Cr);
  });

  const recurringData = [];
  
  Object.values(entities).forEach(ent => {
    if (ent.MonthsActive.size >= minThreshold) {
      const ratio = totalNetBto > 0 ? ((ent.TotalAmount / totalNetBto) * 100).toFixed(2) + "%" : "0.00%";
      recurringData.push({
        "Trx Type": ent.Type,
        "Entity Signature": ent.Signature,
        "Active Months Present": ent.MonthsActive.size + " / " + totalActiveMonths,
        "Total Trx Count": ent.TotalCount,
        "Total Amount (₹)": ent.TotalAmount.toFixed(2),
        "% against Net BTO": ratio
      });
    }
  });

  // Presentation Logic: Credits layered first, then vertically sorted by heaviest mathematical weight 
  recurringData.sort((a, b) => {
    if (a["Trx Type"] !== b["Trx Type"]) return a["Trx Type"] === 'Credit' ? -1 : 1;
    return parseFloat(b["Total Amount (₹)"]) - parseFloat(a["Total Amount (₹)"]);
  });

  return recurringData;
}

export function generateEmiBounceExtraction(dataset_3, abbData) {
  if (!dataset_3 || !abbData) return [];
  
  let days = 30;
  if (abbData.calc365 && !abbData.calc365.error) days = 365;
  else if (abbData.calc180 && !abbData.calc180.error) days = 180;
  
  const endDString = abbData.targetEndDate;
  if (!endDString) return [];
  const endDate = parseISO(endDString);
  const startDate = subDays(endDate, days - 1);
  
  const validTxns = dataset_3.filter(row => {
    if (!row.Date) return false;
    const d = parseISO(row.Date);
    if (isBefore(d, startDate) || isAfter(d, endDate)) return false;
    return true;
  });

  const regexParts = [
    "\\b(?:NACH|ECS|ACH|SI|AUTO DEB(?:IT)?|EMI|LOAN)[^a-zA-Z]*(?:RET(?:URN)?|REV|BOUNCE|REJECT|FAIL)\\b",
    "\\b(?:RET(?:URN)?|REV|BOUNCE|REJECT|FAIL)[^a-zA-Z]*(?:NACH|ECS|ACH|SI|AUTO DEB(?:IT)?|EMI|LOAN)\\b",
    "\\b(?:BOUNCE|RET(?:URN)?|INSUFF(?:ICIENT)? (?:FUNDS|BAL(?:ANCE)?))[^a-zA-Z]*(?:CHG|CHARGES?|FEE|FEES)\\b",
    "\\b(?:E?MI|LOAN)[^a-zA-Z]*BOUNCE\\b"
  ];
  const bounceRegex = new RegExp(regexParts.join("|"), "i");

  const bounceTxns = validTxns.filter(row => {
    const narr = String(row.Narration || "");
    return bounceRegex.test(narr);
  });

  if (bounceTxns.length === 0) {
    return [{ "Message": "No EMI or Auto-Debit Bounces Found in the calculation timeframe" }];
  }

  const grouped = {};
  bounceTxns.forEach(row => {
    const dateObj = new Date(row.Date);
    const monthKey = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(row);
  });

  const finalStructuredData = [];
  
  for (const [month, rows] of Object.entries(grouped)) {
    let monthTotal = 0;
    
    rows.forEach(r => {
      const isDebit = r.Dr && parseFloat(r.Dr) > 0;
      const amt = isDebit ? parseFloat(r.Dr) : parseFloat(r.Cr || 0);
      finalStructuredData.push({
        "Date": r.Date,
        "Narration": r.Narration,
        "Transaction Type": isDebit ? "Debit (Charge/Reversal)" : "Credit (Refund/Reversal)",
        "Amount (₹)": amt.toFixed(2),
        "Resulting Balance": parseFloat(r.Balance).toFixed(2)
      });
      monthTotal += amt;
    });

    finalStructuredData.push({
        "Date": `TOTAL FOR ${month}`,
        "Narration": `Count: ${rows.length} bouncing incidents`,
        "Transaction Type": "",
        "Amount (₹)": monthTotal.toFixed(2),
        "Resulting Balance": ""
    });

    finalStructuredData.push({});
  }

  return finalStructuredData;
}

export function generateNeftRtgsSummary(dataset_3, abbData) {
  if (!dataset_3 || !abbData) return [];
  
  let days = 30;
  if (abbData.calc365 && !abbData.calc365.error) {
    days = 365;
  } else if (abbData.calc180 && !abbData.calc180.error) {
    days = 180;
  }
  
  const endDString = abbData.targetEndDate;
  if (!endDString) return [];
  const endDate = parseISO(endDString);
  const startDate = subDays(endDate, days - 1);
  
  const validTxns = dataset_3.filter(row => {
    if (!row.Date) return false;
    const d = parseISO(row.Date);
    return !isBefore(d, startDate) && !isAfter(d, endDate);
  });

  const neftRtgsRegex = /\b(NEFT|RTGS)\b/i;

  const neftRtgsTxns = validTxns.filter(row => {
    const narr = String(row.Narration || "");
    return neftRtgsRegex.test(narr);
  });

  if (neftRtgsTxns.length === 0) return [];

  const grouped = {};
  
  neftRtgsTxns.forEach(row => {
    const dateObj = new Date(row.Date);
    const monthKey = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
    
    const isDr = row.Dr && parseFloat(row.Dr) > 0;
    const typeKey = isDr ? 'Debit' : 'Credit';
    const compositeKey = monthKey + "_" + typeKey;

    if (!grouped[compositeKey]) {
      grouped[compositeKey] = {
        Month: monthKey,
        Type: typeKey,
        Narrations: [],
        TotalCount: 0,
        TotalAmount: 0
      };
    }
    
    grouped[compositeKey].Narrations.push(row.Narration);
    grouped[compositeKey].TotalCount += 1;
    grouped[compositeKey].TotalAmount += isDr ? parseFloat(row.Dr) : parseFloat(row.Cr);
  });

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const monthA = a.split('_')[0];
    const monthB = b.split('_')[0];
    const typeA = a.split('_')[1];
    
    const dateA = new Date(monthA);
    const dateB = new Date(monthB);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    return typeA === 'Credit' ? -1 : 1;
  });

  return sortedKeys.map(k => {
    const entry = grouped[k];
    return {
      "Trx Type": "NEFT/RTGS " + entry.Type,
      "Entity Signature": entry.Narrations.join(" | "),
      "Active Months Present": entry.Month,
      "Total Trx Count": entry.TotalCount,
      "Total Amount (₹)": entry.TotalAmount.toFixed(2),
      "% against Net BTO": "N/A"
    };
  });
}
