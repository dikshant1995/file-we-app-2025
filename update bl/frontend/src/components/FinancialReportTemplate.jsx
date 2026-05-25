import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { generateMonthlySummary } from '../utils/abbCalculator';

const FinancialReportTemplate = ({ results, abbData, proprietorName, sisterFirms, accountType }) => {
  // 1. Data Preparation
  const rawBalances = results?.dataset_1 || [];
  
  const chartData = [];
  if (rawBalances.length > 0) {
    const step = Math.ceil(rawBalances.length / 60);
    for (let i = 0; i < rawBalances.length; i += step) {
      if (rawBalances[i].Date && rawBalances[i].Balance !== undefined) {
        chartData.push({
          date: rawBalances[i].Date,
          balance: parseFloat(rawBalances[i].Balance)
        });
      }
    }
  }

  // Calculate totals for Pie Chart
  let totalCredit = 0;
  let totalDebit = 0;
  rawBalances.forEach(row => {
    if (row.Cr) totalCredit += parseFloat(row.Cr) || 0;
    if (row.Dr) totalDebit += parseFloat(row.Dr) || 0;
  });

  const pieData = [
    { name: 'Credits', value: totalCredit },
    { name: 'Debits', value: totalDebit }
  ];
  
  const PIE_COLORS = ['#10b981', '#ef4444'];

  // 2. Advanced Metrics (Using abbCalculator)
  const grandTotal = useMemo(() => {
    if (!results?.dataset_3) return null;
    try {
      const summary = generateMonthlySummary(results.dataset_3, abbData, proprietorName, sisterFirms);
      return summary.find(r => r.Month === "GRAND TOTAL") || null;
    } catch (e) {
      console.error("Error generating metrics for PDF", e);
      return null;
    }
  }, [results, abbData, proprietorName, sisterFirms]);

  return (
    <div 
      id="pdf-report-container" 
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        backgroundColor: '#f8fafc', 
        color: '#0f172a', 
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'absolute',
        left: '-9999px',
        top: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Header section (Premium Navy Blue) */}
      <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '25mm 20mm 15mm 20mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>FINANCIAL AUDIT REPORT</h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px', fontWeight: 500 }}>LAXMI CREDIT / ADVANCED ABB PRO</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Generated On</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{format(new Date(), 'dd MMM yyyy')}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>{format(new Date(), 'HH:mm:ss')}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20mm 20mm 20mm' }}>
        
        {/* Applicant Details Card - Floating over header slightly */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '24px', 
          marginTop: '-20px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '30px'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b', fontWeight: 700, borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Applicant Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Firm / Proprietor</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{proprietorName || 'N/A'}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Sister Firms</span>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#334155' }}>{sisterFirms || 'None'}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Account Type</span>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>{accountType || 'Savings'}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Analyzed Txns</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#3b82f6' }}>{rawBalances.length.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        {grandTotal && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', color: '#1e293b', fontWeight: 700, marginBottom: '16px' }}>Key Financial Metrics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Total BTO (Credits)</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>₹{parseFloat(grandTotal["Total BTO (₹)"] || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Inter-Firm Credits</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>₹{parseFloat(grandTotal["Inter Firm Credits (₹)"] || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)' }}>
                <div style={{ fontSize: '12px', color: '#3b82f6', marginBottom: '6px', fontWeight: 700 }}>Final Valid BTO</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1d4ed8' }}>₹{parseFloat(grandTotal["Final BTO (₹)"] || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Cheque Bounce Ratio</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{grandTotal["Inward Outward Chq Bounce Ratio"] || "0.00%"}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{grandTotal["Total Returns"] || 0} Total Returns</div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Analytics */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '35px', height: '260px' }}>
          {/* Line Chart */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>Daily Balance Trend</h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={(val) => val.substring(5)} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} width={50} tickFormatter={(val) => (val / 1000).toFixed(0) + 'k'} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Balance']} 
                />
                <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#1e293b', fontWeight: 600, textAlign: 'center' }}>Cash Flow Distribution</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ABB Report Grid */}
        <div style={{ pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '18px', color: '#1e293b', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
            Institutional ABB Comparisons
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {abbData && abbData.comparisons && abbData.comparisons.slice(0, 8).map((bank, i) => (
              <div key={i} style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                backgroundColor: '#ffffff',
                overflow: 'hidden'
              }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>{bank.name}</h4>
                </div>
                <div style={{ padding: '0 16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <tbody>
                      {bank.calculations.map((calc, j) => (
                        <tr key={j} style={{ borderBottom: j !== bank.calculations.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <td style={{ padding: '10px 0', color: '#64748b', fontWeight: 500 }}>{calc.timeframe} Days</td>
                          <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                            ₹{calc.abb.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          {abbData && abbData.comparisons && abbData.comparisons.length > 8 && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px', fontStyle: 'italic' }}>
              * Displaying top 8 institutions. Refer to the Excel export for the comprehensive analysis.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default FinancialReportTemplate;
