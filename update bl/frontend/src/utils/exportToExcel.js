import * as XLSX from 'xlsx';
import { extractEmiDeductions, generateMonthlySummary, generateRecurringTransactions, generateEmiBounceExtraction, generateNeftRtgsSummary } from './abbCalculator';

function buildEmiSheetData(results) {
  const emiData = extractEmiDeductions(results.dataset_3);

  if (emiData.length === 0) {
    return [{ "Message": "No EMI Deductions Found in this Statement" }];
  }

  const grouped = {};
  emiData.forEach(row => {
    const dateObj = new Date(row.Date);
    const monthKey = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
    
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(row);
  });

  const finalStructuredData = [];

  for (const [month, rows] of Object.entries(grouped)) {
    let monthTotal = 0;
    
    rows.forEach(r => {
      finalStructuredData.push({
        "Date": r.Date,
        "Lender / Narration": r.Narration,
        "EMI Amount": parseFloat(r.Dr).toFixed(2),
        "Resulting Balance": parseFloat(r.Balance).toFixed(2)
      });
      monthTotal += parseFloat(r.Dr || 0);
    });

    finalStructuredData.push({
        "Date": `TOTAL FOR ${month}`,
        "Lender / Narration": "",
        "EMI Amount": monthTotal.toFixed(2),
        "Resulting Balance": ""
    });

    finalStructuredData.push({});
  }

  return finalStructuredData;
}

const formatCalc = (calcObj, timeframe) => {
  if (calcObj.error) {
    return {
      "Timeframe": timeframe,
      "True Daily ABB": "N/A",
      "ABB 1 (5,10,15,20,25)": "N/A",
      "ABB 2 (5,10,15,25)": "N/A",
      "ABB 3 (2,10,20,30)": "N/A",
      "ABB 4 (1,5,10,15,20,25)": "N/A"
    };
  }
  return {
    "Timeframe": timeframe,
    "True Daily ABB": calcObj.averageBalance.toFixed(2),
    "Average Utilisation (%)": calcObj.averageUtilisation ? calcObj.averageUtilisation.toFixed(2) + "%" : "N/A",
    "ABB 1 (5,10,15,20,25)": calcObj.abb1.toFixed(2),
    "ABB 2 (5,10,15,25)": calcObj.abb2.toFixed(2),
    "ABB 3 (2,10,20,30)": calcObj.abb3.toFixed(2),
    "ABB 4 (1,5,10,15,20,25)": calcObj.abb4.toFixed(2)
  };
};

function buildInstitutionalSummary(comparisons) {
  const rows = [];
  comparisons.forEach(comp => {
    // Each institution might have multiple variants (e.g. Magma)
    // We group them by institution name
    comp.calculations.forEach(calc => {
      rows.push({
        "Institution Name": comp.name,
        "ABB Series": calc.label === "Standard" ? "Primary" : calc.label,
        "Timeframe": `${calc.timeframe} Days`,
        "Calculated ABB (₹)": calc.abb.toFixed(2),
        "Rule (Dates Checked)": Array.isArray(calc.dates) ? calc.dates.join(', ') : calc.dates,
        "Mandatory Threshold": comp.minDays > 30 ? `${comp.minDays} Days` : "Standard",
        "Notes": comp.note || ""
      });
    });
    rows.push({}); // Visual Spacer
  });
  return rows;
}

export function downloadExcel(results, abbData, proprietorName = "", sisterFirms = "") {
  const wb = XLSX.utils.book_new();

  // 1. Institutional ABB Summary (Primary comparative data)
  let institutionalData = buildInstitutionalSummary(abbData.comparisons);
  
  if (results.config?.accountType === 'limit') {
    const historyDays = abbData.historySpanInDays || 0;
    const sufficiencyNote = historyDays >= 180 ? "COMPLETE (6+ Months)" : `INCOMPLETE (${historyDays} Days)`;
    
    const executiveRows = [
      { "Institution Name": "EXECUTIVE SUMMARY: NATURE OF CUSTOMER CREDIT PROFILE", "ABB Series": "", "Timeframe": "", "Calculated ABB (₹)": "", "Rule (Dates Checked)": "", "Mandatory Threshold": "", "Notes": "" },
      { "Institution Name": "AVERAGE LIMIT UTILISATION (%)", "ABB Series": (abbData.averageUtilisation || 0).toFixed(2) + "%", "Timeframe": "", "Calculated ABB (₹)": "", "Rule (Dates Checked)": "", "Mandatory Threshold": "", "Notes": "" },
      { "Institution Name": "PEAK LIMIT UTILISATION (%)", "ABB Series": (abbData.peakUtilisation || 0).toFixed(2) + "%", "Timeframe": "", "Calculated ABB (₹)": "", "Rule (Dates Checked)": "", "Mandatory Threshold": "", "Notes": "" },
      { "Institution Name": "DATA HISTORY SUFFICIENCY", "ABB Series": sufficiencyNote, "Timeframe": "", "Calculated ABB (₹)": "", "Rule (Dates Checked)": "", "Mandatory Threshold": "", "Notes": "" },
      {}, // Spacer
      { "Institution Name": "--- INSTITUTIONAL COMPARATIVE ANALYSIS ---", "ABB Series": "", "Timeframe": "", "Calculated ABB (₹)": "", "Rule (Dates Checked)": "", "Mandatory Threshold": "", "Notes": "" },
    ];
    institutionalData = [...executiveRows, ...institutionalData];
  }

  const wsInst = XLSX.utils.json_to_sheet(institutionalData);
  XLSX.utils.book_append_sheet(wb, wsInst, "Institutional_ABB_Summary");

  // 2. Dataset 1
  let ds1 = results.dataset_1;
  if (results.config?.accountType === 'limit') {
    const limit = parseFloat(results.config?.sanctionedLimit || 0);
    ds1 = ds1.map(row => {
      const bal = parseFloat(row.Balance || 0);
      const headroom = limit + bal;
      const used = Math.max(0, limit - headroom);
      const util = limit > 0 ? (used / limit) * 100 : 0;
      return {
        ...row,
        "Final Balance (Headroom)": headroom.toFixed(2),
        "Utilisation (%)": util.toFixed(2) + "%"
      };
    });
  }
  const ws1 = XLSX.utils.json_to_sheet(ds1);
  XLSX.utils.book_append_sheet(wb, ws1, "Dataset1_Math");

  // 3. Dataset 2
  const ws2 = XLSX.utils.json_to_sheet(results.dataset_2);
  XLSX.utils.book_append_sheet(wb, ws2, "Dataset2_Narrations");

  // 4. Dataset 3
  let ds3 = results.dataset_3;
  if (results.config?.accountType === 'limit') {
    const limit = parseFloat(results.config?.sanctionedLimit || 0);
    ds3 = ds3.map(row => {
      const bal = parseFloat(row.Balance || 0);
      const headroom = limit + bal;
      const used = Math.max(0, limit - headroom);
      const util = limit > 0 ? (used / limit) * 100 : 0;
      return {
        ...row,
        "Final Balance (Headroom)": headroom.toFixed(2),
        "Utilisation (%)": util.toFixed(2) + "%"
      };
    });
  }
  const ws3 = XLSX.utils.json_to_sheet(ds3);
  XLSX.utils.book_append_sheet(wb, ws3, "Dataset3_Merged");

  // 5. Audit Matrices
  if (abbData && abbData.matrices) {
    const wsM1 = XLSX.utils.json_to_sheet(abbData.matrices.abb1);
    XLSX.utils.book_append_sheet(wb, wsM1, "Grid_ABB1");

    const wsM2 = XLSX.utils.json_to_sheet(abbData.matrices.abb2);
    XLSX.utils.book_append_sheet(wb, wsM2, "Grid_ABB2");

    const wsM3 = XLSX.utils.json_to_sheet(abbData.matrices.abb3);
    XLSX.utils.book_append_sheet(wb, wsM3, "Grid_ABB3");

    const wsM4 = XLSX.utils.json_to_sheet(abbData.matrices.abb4);
    XLSX.utils.book_append_sheet(wb, wsM4, "Grid_ABB4");
  }

  // 6. ABB results
  const abbRows = [
    formatCalc(abbData.calc180, "180 Days"),
    formatCalc(abbData.calc365, "365 Days")
  ];
  const wsAbb = XLSX.utils.json_to_sheet(abbRows);
  XLSX.utils.book_append_sheet(wb, wsAbb, "ABB_Results");

  // 7. Inject EMI Deductions sheet
  const structuredEmiData = buildEmiSheetData(results);
  const wsEmi = XLSX.utils.json_to_sheet(structuredEmiData);
  XLSX.utils.book_append_sheet(wb, wsEmi, "EMI_Deductions");

  // 8. Inject Monthly Summary
  const monthlySummary = generateMonthlySummary(results.dataset_3, abbData, proprietorName, sisterFirms);
  if (monthlySummary && monthlySummary.length > 0) {
    const wsSummary = XLSX.utils.json_to_sheet(monthlySummary);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Transaction_Summary");
  }

  // 9. Inject Financial Responsibility
  const recurringSummary = generateRecurringTransactions(results.dataset_3, abbData);
  const neftRtgsSummary = generateNeftRtgsSummary(results.dataset_3, abbData);

  if (recurringSummary && recurringSummary.length > 0) {
    recurringSummary.push({}); 
    recurringSummary.push({
        "Trx Type": "--- NEFT / RTGS MONTHLY SUMMARY ---",
        "Entity Signature": neftRtgsSummary.length === 0 ? "No NEFT/RTGS detected" : "",
        "Active Months Present": "",
        "Total Trx Count": "",
        "Total Amount (₹)": "",
        "% against Net BTO": ""
    });
    if (neftRtgsSummary && neftRtgsSummary.length > 0) {
        recurringSummary.push(...neftRtgsSummary);
    }
    const wsRecurring = XLSX.utils.json_to_sheet(recurringSummary);
    XLSX.utils.book_append_sheet(wb, wsRecurring, "Financial_Responsibility");
  }

  // 10. Inject EMI Bouncing
  const emiBounceSummary = generateEmiBounceExtraction(results.dataset_3, abbData);
  if (emiBounceSummary && emiBounceSummary.length > 0) {
    const wsBounce = XLSX.utils.json_to_sheet(emiBounceSummary);
    XLSX.utils.book_append_sheet(wb, wsBounce, "EMI_Bouncing");
  }

  // 11. Inject Risk Assessment
  if (results.risk_assessment) {
    const riskSummary = results.risk_assessment.summary;
    const flaggedTxns = results.risk_assessment.flagged_transactions;
    
    const riskData = [
      { "Date": "--- RISK ASSESSMENT SUMMARY ---", "Narration": "", "Amount": "", "Risk Category": "" },
      { "Date": "Total Cash Withdrawals", "Narration": `₹${riskSummary.total_cash_withdrawals.toFixed(2)} (${riskSummary.cash_withdrawal_percentage.toFixed(2)}% of total debits)`, "Amount": riskSummary.excessive_cash_withdrawals ? "FLAG: EXCESSIVE" : "NORMAL", "Risk Category": "" },
      { "Date": "Crypto Exposure", "Narration": riskSummary.crypto_exposure ? "YES" : "NO", "Amount": "", "Risk Category": "" },
      { "Date": "Gambling/Betting Exposure", "Narration": riskSummary.gambling_exposure ? "YES" : "NO", "Amount": "", "Risk Category": "" },
      { "Date": "", "Narration": "", "Amount": "", "Risk Category": "" },
      { "Date": "--- FLAGGED TRANSACTIONS ---", "Narration": "", "Amount": "", "Risk Category": "" },
      { "Date": "Date", "Narration": "Narration", "Amount": "Amount", "Risk Category": "Risk Category" },
    ];
    
    if (flaggedTxns && flaggedTxns.length > 0) {
      flaggedTxns.forEach(t => {
        riskData.push({
          "Date": t.Date || "",
          "Narration": t.Narration || "",
          "Amount": t.Dr ? parseFloat(t.Dr).toFixed(2) : (t.Cr ? parseFloat(t.Cr).toFixed(2) : "0.00"),
          "Risk Category": t['Risk Category'] || ""
        });
      });
    } else {
      riskData.push({
        "Date": "No high-risk transactions detected.",
        "Narration": "",
        "Amount": "",
        "Risk Category": ""
      });
    }
    
    const wsRisk = XLSX.utils.json_to_sheet(riskData, { skipHeader: true });
    XLSX.utils.book_append_sheet(wb, wsRisk, "Risk_Assessment");
  }

  // 12. Inject High Value Transactions
  if (results.dataset_3 && results.dataset_3.length > 0) {
    const credits = [...results.dataset_3]
      .filter(t => parseFloat(t.Cr || 0) > 0)
      .sort((a, b) => parseFloat(b.Cr || 0) - parseFloat(a.Cr || 0))
      .slice(0, 10);
      
    const debits = [...results.dataset_3]
      .filter(t => parseFloat(t.Dr || 0) > 0)
      .sort((a, b) => parseFloat(b.Dr || 0) - parseFloat(a.Dr || 0))
      .slice(0, 10);

    const hvData = [];
    
    hvData.push({ "Type": "--- TOP 10 HIGHEST CREDITS ---", "Date": "", "Narration": "", "Amount (₹)": "" });
    credits.forEach(c => {
      hvData.push({
        "Type": "Credit",
        "Date": c.Date || "",
        "Narration": c.Narration || "",
        "Amount (₹)": parseFloat(c.Cr || 0).toFixed(2)
      });
    });

    hvData.push({});
    hvData.push({ "Type": "--- TOP 10 HIGHEST DEBITS ---", "Date": "", "Narration": "", "Amount (₹)": "" });
    debits.forEach(d => {
      hvData.push({
        "Type": "Debit",
        "Date": d.Date || "",
        "Narration": d.Narration || "",
        "Amount (₹)": parseFloat(d.Dr || 0).toFixed(2)
      });
    });

    const wsHV = XLSX.utils.json_to_sheet(hvData);
    XLSX.utils.book_append_sheet(wb, wsHV, "High_Value_Transactions");
  }

  const fileName = results.config?.targetNbfc 
    ? `ABB_Report_${results.config?.targetNbfc}_${results.metadata.account_name.replace(/\s+/g, '_')}.xlsx`
    : "ABB_Calculator_Results.xlsx";

  XLSX.writeFile(wb, fileName);
}

export function downloadEmiExcel(results) {
  const wb = XLSX.utils.book_new();
  const structuredData = buildEmiSheetData(results);
  const wsEmi = XLSX.utils.json_to_sheet(structuredData);
  XLSX.utils.book_append_sheet(wb, wsEmi, "EMI_Deductions");
  XLSX.writeFile(wb, "EMI_Deductions_Report.xlsx");
}
