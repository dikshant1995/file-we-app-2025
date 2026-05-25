import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { 
  generateMonthlySummary, 
  calculateABB, 
  extractEmiDeductions, 
  generateEmiBounceExtraction 
} from '../utils/abbCalculator';

const FinancialReportTemplate = ({ results, abbData, proprietorName, sisterFirms, accountType }) => {
  // 1. Data Preparation
  const rawBalances = results?.dataset_1 || results?.dataset_3 || [];
  const transactions = results?.dataset_3 || results?.dataset_1 || [];
  
  // Calculate or use passed ABB data
  const calculatedAbbData = useMemo(() => {
    if (abbData && !abbData.error) return abbData;
    if (rawBalances.length === 0) return null;
    try {
      return calculateABB(rawBalances, { accountType: accountType || 'savings' });
    } catch (e) {
      console.error("Error calculating ABB internally for PDF", e);
      return null;
    }
  }, [abbData, rawBalances, accountType]);

  // Generate monthly summary
  const monthlySummary = useMemo(() => {
    if (!transactions.length || !calculatedAbbData) return [];
    try {
      return generateMonthlySummary(transactions, calculatedAbbData, proprietorName, sisterFirms);
    } catch (e) {
      console.error("Error generating monthly summary for PDF", e);
      return [];
    }
  }, [transactions, calculatedAbbData, proprietorName, sisterFirms]);

  const grandTotal = useMemo(() => {
    if (!monthlySummary.length) return null;
    return monthlySummary.find(r => r.Month === "GRAND TOTAL") || null;
  }, [monthlySummary]);

  // Calculate Net BTO, Cash Deposit & Inter-Firm Metrics
  const metrics = useMemo(() => {
    if (!grandTotal) {
      return {
        totalBTO: 0,
        interFirm: 0,
        finalBTO: 0,
        netBTO: 0,
        cashDeposit: 0,
        cashCount: 0,
        cashRatio: '0.00%',
        bounceRatio: '0.00%',
        totalReturns: 0
      };
    }

    const totalBTO = parseFloat(grandTotal["Total BTO (₹)"] || 0);
    const interFirm = parseFloat(grandTotal["Inter Firm Credits (₹)"] || 0);
    const finalBTO = parseFloat(grandTotal["Final BTO (₹)"] || 0);
    const netBTO = parseFloat(grandTotal["Net BTO (Excl. Cash) (₹)"] || 0);
    const cashDeposit = parseFloat(grandTotal["Total Cash Deposit (₹)"] || 0);
    const cashCount = parseInt(grandTotal["Cash Deposit Count"] || 0);
    const cashRatio = totalBTO > 0 ? ((cashDeposit / totalBTO) * 100).toFixed(2) + '%' : '0.00%';
    const bounceRatio = grandTotal["Inward Outward Chq Bounce Ratio"] || "0.00%";
    const totalReturns = parseInt(grandTotal["Total Returns"] || 0);

    return {
      totalBTO,
      interFirm,
      finalBTO,
      netBTO,
      cashDeposit,
      cashCount,
      cashRatio,
      bounceRatio,
      totalReturns
    };
  }, [grandTotal]);

  // Daily Chart Data
  const chartData = useMemo(() => {
    const data = [];
    if (rawBalances.length > 0) {
      const step = Math.ceil(rawBalances.length / 60);
      for (let i = 0; i < rawBalances.length; i += step) {
        if (rawBalances[i].Date && rawBalances[i].Balance !== undefined) {
          data.push({
            date: rawBalances[i].Date,
            balance: parseFloat(rawBalances[i].Balance)
          });
        }
      }
    }
    return data;
  }, [rawBalances]);

  // Pie Chart Data
  const pieData = useMemo(() => {
    let totalCredit = 0;
    let totalDebit = 0;
    rawBalances.forEach(row => {
      if (row.Cr) totalCredit += parseFloat(row.Cr) || 0;
      if (row.Dr) totalDebit += parseFloat(row.Dr) || 0;
    });
    return [
      { name: 'Credits (Inflow)', value: totalCredit },
      { name: 'Debits (Outflow)', value: totalDebit }
    ];
  }, [rawBalances]);

  const pieAnalysis = useMemo(() => {
    const totalCredit = pieData[0].value;
    const totalDebit = pieData[1].value;
    const total = totalCredit + totalDebit;
    const creditPercent = total > 0 ? ((totalCredit / total) * 100).toFixed(1) + '%' : '0.0%';
    const debitPercent = total > 0 ? ((totalDebit / total) * 100).toFixed(1) + '%' : '0.0%';
    return {
      totalCredit,
      totalDebit,
      creditPercent,
      debitPercent
    };
  }, [pieData]);

  const PIE_COLORS = ['#10b981', '#ef4444'];

  // EMI Analysis & Obligations Estimation
  const emiAnalysis = useMemo(() => {
    if (!transactions.length) {
      return { totalEmi: 0, emiRatio: '0.00%', list: [] };
    }
    try {
      const emiTxns = extractEmiDeductions(transactions);
      if (emiTxns.length === 0) {
        return { totalEmi: 0, emiRatio: '0.00%', list: [] };
      }

      // Group EMIs by month to estimate current monthly EMI obligations
      const monthlyEmi = {};
      emiTxns.forEach(row => {
        if (!row.Date || !row.Dr) return;
        const d = parseISO(row.Date);
        const mKey = format(d, 'MMM yyyy').toUpperCase();
        if (!monthlyEmi[mKey]) monthlyEmi[mKey] = 0;
        monthlyEmi[mKey] += parseFloat(row.Dr) || 0;
      });

      const months = Object.keys(monthlyEmi);
      const avgEmi = months.length > 0 ? (Object.values(monthlyEmi).reduce((a, b) => a + b, 0) / months.length) : 0;
      
      const averageMonthlyNetBto = metrics.netBTO / (months.length || 6);
      const emiRatio = averageMonthlyNetBto > 0 ? ((avgEmi / averageMonthlyNetBto) * 100).toFixed(2) + '%' : '0.00%';

      return {
        totalEmi: avgEmi,
        emiRatio,
        list: emiTxns
      };
    } catch (e) {
      console.error("Error analyzing EMIs for PDF", e);
      return { totalEmi: 0, emiRatio: '0.00%', list: [] };
    }
  }, [transactions, metrics]);

  // Bounce / Reversals Extraction
  const bounceAnalysis = useMemo(() => {
    if (!transactions.length || !calculatedAbbData) {
      return { list: [], count: 0 };
    }
    try {
      const bounceTxns = generateEmiBounceExtraction(transactions, calculatedAbbData);
      
      // Filter out empty rows and summaries, leaving exact bouncing narratives
      const actualBounces = bounceTxns.filter(r => r.Date && !r.Date.startsWith('TOTAL') && Object.keys(r).length > 1);
      return {
        list: actualBounces,
        count: actualBounces.length
      };
    } catch (e) {
      console.error("Error analyzing bounces for PDF", e);
      return { list: [], count: 0 };
    }
  }, [transactions, calculatedAbbData]);

  // Clean dates check utility
  const formatDatesCheck = (dates) => {
    if (Array.isArray(dates)) return dates.join(', ');
    return dates || 'N/A';
  };

  const todayStr = format(new Date(), 'dd MMM yyyy');
  const timeStr = format(new Date(), 'HH:mm:ss');
  const uniqueReportId = useMemo(() => {
    return 'LC-' + Math.floor(100000 + Math.random() * 900000);
  }, []);

  return (
    <div 
      id="pdf-report-container" 
      style={{ 
        width: '210mm', 
        backgroundColor: '#f1f5f9', 
        position: 'absolute',
        left: '-9999px',
        top: 0,
        boxSizing: 'border-box',
        zIndex: -999
      }}
    >
      {/* ==================== PAGE 1: EXECUTIVE SUMMARY ==================== */}
      <div 
        className="pdf-page"
        style={{
          width: '210mm',
          height: '297mm',
          padding: '16mm 16mm 12mm 16mm',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div>
          {/* Header block (Premium Deep Indigo Gradient) */}
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
            color: '#ffffff', 
            padding: '16px 20px', 
            borderRadius: '10px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                  FINANCIAL AUDIT STATEMENT
                </h1>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  LAXMI CREDIT | Advanced Solvency Engine
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Report ID & Timestamp
                </p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#3b82f6' }}>{uniqueReportId}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#cbd5e1' }}>{todayStr} @ {timeStr}</p>
              </div>
            </div>
          </div>

          {/* Section 1: Assessment Metadata */}
          <div style={{ 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px', 
            padding: '14px 18px', 
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Applicant & Profile Metadata
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Proprietor / Firm</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {proprietorName || 'Loan Applicant'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Sister Concerns</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sisterFirms || 'None Registered'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Account Type</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'capitalize' }}>
                  {accountType || 'Savings/Current'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Ledger History</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
                  {rawBalances.length.toLocaleString()} Ledger Txns
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Executive Solvency KPIs */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Primary Solvency & Revenue Indicators
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {/* Final Valid BTO */}
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px', fontWeight: 600, uppercase: 'true' }}>Final Valid BTO</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e40af' }}>
                  ₹{metrics.finalBTO.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </div>
                <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>Excl. Sister Firm Credits</div>
              </div>

              {/* Net Digital BTO */}
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px', fontWeight: 600, uppercase: 'true' }}>Net BTO (Excl. Cash)</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#065f46' }}>
                  ₹{metrics.netBTO.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </div>
                <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>Pure Digital Volume</div>
              </div>

              {/* Total Cash Deposits */}
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px', fontWeight: 600, uppercase: 'true' }}>Total Cash Deposits</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#5b21b6' }}>
                  ₹{metrics.cashDeposit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </div>
                <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>Count: {metrics.cashCount} Deposits</div>
              </div>

              {/* Cash Ratio */}
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px', fontWeight: 600, uppercase: 'true' }}>Cash Deposit Ratio</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#92400e' }}>
                  {metrics.cashRatio}
                </div>
                <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>% of Total Credited Volume</div>
              </div>
            </div>
          </div>

          {/* Section 3: Charts Visualizations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '15px', marginBottom: '20px' }}>
            {/* Daily Balance chart */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', height: '215px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#334155', fontWeight: 700, textTransform: 'uppercase' }}>
                Daily Ledger Balance Trend
              </h4>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#64748b'}} tickFormatter={(val) => val.substring(5)} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#64748b'}} width={40} tickFormatter={(val) => (val / 1000).toFixed(0) + 'k'} />
                    <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '11px' }}>
                  Insufficient data history to compile trend
                </div>
              )}
            </div>

            {/* Inflow vs Outflow Pie Chart */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', height: '215px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#334155', fontWeight: 700, textTransform: 'uppercase', width: '100%' }}>
                Cashflow Distribution
              </h4>
              <div style={{ width: '100%', height: '60%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="48%"
                      innerRadius={28}
                      outerRadius={42}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={15} iconType="circle" iconSize={5} wrapperStyle={{ fontSize: '7.5px', paddingTop: '2px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '8px' }}>
                  <span style={{ color: '#059669', fontWeight: 700 }}>Credits (Inflow):</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>
                    ₹{Math.round(pieAnalysis.totalCredit).toLocaleString()} ({pieAnalysis.creditPercent})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px' }}>
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>Debits (Outflow):</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>
                    ₹{Math.round(pieAnalysis.totalDebit).toLocaleString()} ({pieAnalysis.debitPercent})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Highlights & Summary Overview */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', backgroundColor: '#fafafa' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#334155', fontWeight: 700, textTransform: 'uppercase' }}>
              System Risk Advisory Summary
            </h4>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '10px', color: '#475569', lineHeight: '1.4' }}>
              <li style={{ marginBottom: '4px' }}>
                <strong>Cash vs Digital Balance:</strong> Cash deposit ratio is <strong>{metrics.cashRatio}</strong>. Higher digital percentage indicates superior audit transparency and corporate health.
              </li>
              <li style={{ marginBottom: '4px' }}>
                <strong>Inter-Firm Cleanliness:</strong> Detected inter-firm sister transactions amount to <strong>₹{metrics.interFirm.toLocaleString()}</strong>. The final valid BTO stands adjusted at <strong>₹{metrics.finalBTO.toLocaleString()}</strong>.
              </li>
              <li>
                <strong>Transaction Density:</strong> Evaluated a comprehensive density of <strong>{rawBalances.length} distinct transaction lines</strong> spanning across the historical statements under review.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '8px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontSize: '8px', 
          color: '#64748b' 
        }}>
          <span>LAXMI CREDIT SYSTEM AUTOMATION | CONFIDENTIAL FINANCIAL EVALUATION REPORT</span>
          <span style={{ fontWeight: 700 }}>Page 1 of 3</span>
        </div>
      </div>

      {/* ==================== PAGE 2: DEBT OBLIGATIONS & BOUNCING ==================== */}
      <div 
        className="pdf-page"
        style={{
          width: '210mm',
          height: '297mm',
          padding: '16mm 16mm 12mm 16mm',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div>
          {/* Section Header */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '6px', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>
              DEBT OBLIGATIONS & SOLVENCY EVALUATION
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#64748b', fontWeight: 500 }}>
              Audit of current monthly EMI obligations, leverage ratios, and cheque/auto-debit returns
            </p>
          </div>

          {/* Key Metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '18px' }}>
            {/* Monthly EMI */}
            <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '8px', border: '1px solid #ffedd5', borderLeft: '4px solid #f97316' }}>
              <div style={{ fontSize: '9px', color: '#c2410c', marginBottom: '4px', fontWeight: 700, uppercase: 'true' }}>
                Est. Monthly EMI Obligation
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#7c2d12' }}>
                ₹{Math.round(emiAnalysis.totalEmi).toLocaleString()}
              </div>
              <div style={{ fontSize: '8px', color: '#9a3412', marginTop: '2px' }}>
                Computed from statement narrates
              </div>
            </div>

            {/* Debt to Net BTO Ratio */}
            <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '9px', color: '#1d4ed8', marginBottom: '4px', fontWeight: 700, uppercase: 'true' }}>
                EMI to Net BTO Leverage
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a' }}>
                {emiAnalysis.emiRatio}
              </div>
              <div style={{ fontSize: '8px', color: '#1e40af', marginTop: '2px' }}>
                Monthly Obligation / Net BTO
              </div>
            </div>

            {/* Bounce Ratio */}
            <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fee2e2', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '9px', color: '#b91c1c', marginBottom: '4px', fontWeight: 700, uppercase: 'true' }}>
                Total Bounce Ratio
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#7f1d1d' }}>
                {metrics.bounceRatio}
              </div>
              <div style={{ fontSize: '8px', color: '#991b1b', marginTop: '2px' }}>
                Total Returns: {metrics.totalReturns} Incidents
              </div>
            </div>
          </div>

          {/* Section 1: Detailed EMI Deductions Table */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#1e293b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              EMI / Auto-Debit Deductions Ledger (Top Obligations)
            </h3>
            {emiAnalysis.list.length > 0 ? (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '6px 10px' }}>Date</th>
                      <th style={{ padding: '6px 10px' }}>Lender Narration</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right' }}>Amount (₹)</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right' }}>Resulting Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emiAnalysis.list.slice(0, 8).map((emi, idx) => (
                      <tr key={idx} style={{ borderBottom: idx !== emiAnalysis.list.slice(0, 8).length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ padding: '6px 10px', color: '#475569' }}>{emi.Date}</td>
                        <td style={{ padding: '6px 10px', fontWeight: 500, color: '#0f172a', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {emi.Narration}
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#ea580c' }}>
                          ₹{parseFloat(emi.Dr || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', color: '#334155' }}>
                          ₹{parseFloat(emi.Balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ border: '1px dotted #cbd5e1', borderRadius: '6px', padding: '20px', textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
                No active monthly auto-debit or EMI deductions detected in this statement timeframe.
              </div>
            )}
            {emiAnalysis.list.length > 8 && (
              <p style={{ margin: '4px 0 0 0', fontSize: '8px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'right' }}>
                * Displaying top 8 obligations. Complete listing available in the spreadsheet export.
              </p>
            )}
          </div>

          {/* Section 2: Cheque & Auto-Debit Bouncing Incidents */}
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Cheque & Auto-Debit Bounces / Reversals Audit ({bounceAnalysis.count} Incidents)
            </h3>
            {bounceAnalysis.list.length > 0 ? (
              <div style={{ border: '1px solid #fee2e2', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fef2f2', borderBottom: '1px solid #fee2e2', color: '#991b1b', fontWeight: 700 }}>
                      <th style={{ padding: '6px 10px' }}>Date</th>
                      <th style={{ padding: '6px 10px' }}>Bounce Narration</th>
                      <th style={{ padding: '6px 10px' }}>Transaction Type</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right' }}>Bounce Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bounceAnalysis.list.slice(0, 6).map((bounce, idx) => (
                      <tr key={idx} style={{ borderBottom: idx !== bounceAnalysis.list.slice(0, 6).length - 1 ? '1px solid #fee2e2' : 'none' }}>
                        <td style={{ padding: '6px 10px', color: '#b91c1c' }}>{bounce.Date}</td>
                        <td style={{ padding: '6px 10px', color: '#7f1d1d', fontWeight: 500, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {bounce.Narration}
                        </td>
                        <td style={{ padding: '6px 10px', color: '#991b1b', fontSize: '8px' }}>
                          {bounce["Transaction Type"] || "Debit Reversal"}
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                          ₹{parseFloat(bounce["Amount (₹)"] || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ border: '1px dotted #b91c1c', borderRadius: '6px', padding: '20px', textAlign: 'center', fontSize: '10px', color: '#b91c1c', backgroundColor: '#fdf2f2' }}>
                Excellent Account Health! No auto-debit, ECS, NACH, or Cheque bouncing incidents detected.
              </div>
            )}
            {bounceAnalysis.list.length > 6 && (
              <p style={{ margin: '4px 0 0 0', fontSize: '8px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'right' }}>
                * Displaying top 6 bounce items. Refer to the Excel report for comprehensive audit sheets.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '8px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontSize: '8px', 
          color: '#64748b' 
        }}>
          <span>LAXMI CREDIT SYSTEM AUTOMATION | CONFIDENTIAL FINANCIAL EVALUATION REPORT</span>
          <span style={{ fontWeight: 700 }}>Page 2 of 3</span>
        </div>
      </div>

      {/* ==================== PAGE 3: MONTHLY LEDGER & ABB COMPARISON ==================== */}
      <div 
        className="pdf-page"
        style={{
          width: '210mm',
          height: '297mm',
          padding: '16mm 16mm 12mm 16mm',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div>
          {/* Section Header */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '6px', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>
              MONTHLY REVENUE LEDGER & ABB BENCHMARKING
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#64748b', fontWeight: 500 }}>
              Audit matrices, monthly BTO flows, and comparative average bank balances
            </p>
          </div>

          {/* Section 1: Monthly Cash Flow Ledger */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#1e293b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Consolidated Monthly Turnover (BTO) & Cash Flow
            </h3>
            {monthlySummary.length > 0 ? (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '5px 8px' }}>Month</th>
                      <th style={{ padding: '5px 8px', textAlign: 'right' }}>Total BTO (₹)</th>
                      <th style={{ padding: '5px 8px', textAlign: 'right' }}>Inter-Firm (₹)</th>
                      <th style={{ padding: '5px 8px', textAlign: 'right' }}>Final BTO (₹)</th>
                      <th style={{ padding: '5px 8px', textAlign: 'right' }}>Net BTO (Excl. Cash)</th>
                      <th style={{ padding: '5px 8px', textAlign: 'right' }}>Cash Deposits (₹)</th>
                      <th style={{ padding: '5px 8px', textAlign: 'center' }}>Returns</th>
                      <th style={{ padding: '5px 8px', textAlign: 'right' }}>Bounce Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySummary.map((row, idx) => {
                      if (!row.Month) return null; // Spacer rows
                      const isGrand = row.Month === "GRAND TOTAL";
                      return (
                        <tr 
                          key={idx} 
                          style={{ 
                            borderBottom: idx !== monthlySummary.length - 1 ? '1px solid #f1f5f9' : 'none',
                            backgroundColor: isGrand ? '#f8fafc' : 'transparent',
                            fontWeight: isGrand ? 700 : 'normal'
                          }}
                        >
                          <td style={{ padding: '5px 8px', color: isGrand ? '#0f172a' : '#475569' }}>{row.Month}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'right' }}>
                            ₹{parseFloat(row["Total BTO (₹)"] || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', color: '#ef4444' }}>
                            ₹{parseFloat(row["Inter Firm Credits (₹)"] || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', color: '#1d4ed8' }}>
                            ₹{parseFloat(row["Final BTO (₹)"] || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', color: '#065f46' }}>
                            ₹{parseFloat(row["Net BTO (Excl. Cash) (₹)"] || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', color: '#7c3aed' }}>
                            ₹{parseFloat(row["Total Cash Deposit (₹)"] || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'center' }}>{row["Total Returns"] || 0}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', color: parseFloat(row["Inward Outward Chq Bounce Ratio"]) > 5 ? '#dc2626' : '#1e293b' }}>
                            {row["Inward Outward Chq Bounce Ratio"] || "0.00%"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ border: '1px dotted #cbd5e1', borderRadius: '6px', padding: '20px', textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
                No active monthly summary data could be processed.
              </div>
            )}
          </div>

          {/* Section 2: Institutional Comparisons */}
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#1e293b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Institutional ABB Comparisons (Top NBFC Matches)
            </h3>
            {calculatedAbbData && calculatedAbbData.comparisons ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {calculatedAbbData.comparisons.slice(0, 6).map((bank, i) => (
                  <div key={i} style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px', 
                    backgroundColor: '#ffffff',
                    overflow: 'hidden'
                  }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '6px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#0f172a', fontSize: '9px', fontWeight: 700 }}>{bank.name}</h4>
                      {bank.note && <span style={{ fontSize: '7px', color: '#64748b', fontStyle: 'italic' }}>{bank.note}</span>}
                    </div>
                    <div style={{ padding: '4px 10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
                        <tbody>
                          {bank.calculations.map((calc, j) => (
                            <tr key={j} style={{ borderBottom: j !== bank.calculations.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                              <td style={{ padding: '4px 0', color: '#64748b', fontWeight: 500 }}>
                                {calc.timeframe} Days ({calc.label === "Standard" ? "Primary" : calc.label})
                              </td>
                              <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                                ₹{Math.round(calc.abb).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ border: '1px dotted #cbd5e1', borderRadius: '6px', padding: '15px', textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
                No comparisons computed. Ensure valid transactions are parsed.
              </div>
            )}
            {calculatedAbbData?.comparisons?.length > 6 && (
              <p style={{ margin: '4px 0 0 0', fontSize: '7px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'right' }}>
                * Displaying top 6 NBFC policies. Refer to the Excel workbook for full institutional comparison sheets.
              </p>
            )}
          </div>

          {/* Section 3: Legal Disclaimers & Notes */}
          <div style={{ 
            backgroundColor: '#fafafa', 
            border: '1px dashed #cbd5e1', 
            borderRadius: '6px', 
            padding: '10px',
            fontSize: '7.5px',
            color: '#64748b',
            lineHeight: '1.4'
          }}>
            <strong>REGULATORY COMPLIANCE & LEGAL NOTICE:</strong>
            <p style={{ margin: '3px 0 0 0' }}>
              This audit evaluation report is generated automatically by the Laxmi Credit Advanced Risk Underwriting Engine based on standard transaction narrates extracted securely from PDF bank statements uploaded by the applicant. This document represents a numerical estimate of banking volumes (BTO), cash ratios, monthly debt servicing obligations (EMIs), and average bank balances (ABB) calculated strictly under NBFC criteria. It is confidential, proprietary, and issued solely for credit underwriting, verification, and loan processing. These numbers are non-binding estimates and are subject to detailed human underwriting, verification of original sources, and final approval by the lending institutions. Ratios are compiled dynamically in INR.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '8px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontSize: '8px', 
          color: '#64748b' 
        }}>
          <span>LAXMI CREDIT SYSTEM AUTOMATION | CONFIDENTIAL FINANCIAL EVALUATION REPORT</span>
          <span style={{ fontWeight: 700 }}>Page 3 of 3</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialReportTemplate;
