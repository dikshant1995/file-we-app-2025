import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

const FinancialReportTemplate = ({ results, abbData, proprietorName, sisterFirms, accountType }) => {
  // 1. Data Preparation
  const rawBalances = results?.dataset_1 || [];
  
  // Aggregate daily balances for the line chart (sampling every N days to keep chart clean)
  // Or just pass the raw balances if there are not too many. For PDF, let's take up to 60 points max.
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
  
  const PIE_COLORS = ['#10b981', '#ef4444']; // Emerald (Credit) and Red (Debit)

  return (
    <div 
      id="pdf-report-container" 
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        padding: '20mm', 
        backgroundColor: '#ffffff', 
        color: '#1a1a1a', 
        fontFamily: 'Inter, sans-serif',
        position: 'absolute',
        left: '-9999px', // Hide off-screen
        top: 0
      }}
    >
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#111827', fontWeight: 800 }}>Financial Summary Report</h1>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Laxmi Credit - Powered by ABB PRO</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Date Generated</p>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{format(new Date(), 'dd MMM yyyy, HH:mm')}</p>
        </div>
      </div>

      {/* Applicant Details */}
      <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '30px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#374151' }}>Applicant Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Proprietor / Entity Name</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{proprietorName || 'N/A'}</span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Sister Firms</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{sisterFirms || 'None'}</span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Account Type</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', textTransform: 'capitalize' }}>{accountType || 'Savings'}</span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Total Transactions</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{rawBalances.length}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px', height: '300px' }}>
        {/* Line Chart */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#374151', textAlign: 'center' }}>Balance Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => val.substring(5)} />
              <YAxis tick={{fontSize: 10}} width={60} tickFormatter={(val) => (val / 1000).toFixed(0) + 'k'} />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#374151', textAlign: 'center' }}>Cash Flow</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ABB Report Grid */}
      <div style={{ pageBreakInside: 'avoid' }}>
        <h2 style={{ fontSize: '20px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' }}>Institutional ABB Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {abbData && abbData.comparisons && abbData.comparisons.slice(0, 8).map((bank, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', backgroundColor: '#f9fafb' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#4f46e5', fontSize: '14px', fontWeight: 'bold' }}>{bank.name}</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  {bank.calculations.map((calc, j) => (
                    <tr key={j} style={{ borderBottom: j !== bank.calculations.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: '6px 0', color: '#6b7280' }}>{calc.timeframe} Days</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold', color: '#111827' }}>
                        ₹{calc.abb.toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        {abbData && abbData.comparisons && abbData.comparisons.length > 8 && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '15px' }}>
            * Showing top 8 institutions. Full detailed report available in Excel export.
          </p>
        )}
      </div>

    </div>
  );
};

export default FinancialReportTemplate;
