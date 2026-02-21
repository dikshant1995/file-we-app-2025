const AuditLog = () => {
  const mockLogs = [
    { id: 1, user: 'Admin', action: 'Updated HDFC Interest Rate', time: '2025-10-27 10:30', details: 'Changed from 11% to 10.5%' },
    { id: 2, user: 'Admin', action: 'Modified ICICI Category A FOIR', time: '2025-10-27 09:15', details: 'Changed from 65% to 70%' },
    { id: 3, user: 'Admin', action: 'Enabled Axis Finance', time: '2025-10-26 15:45', details: 'Bank activated' }
  ];

  return (
    <div className="audit-log-container">
      <h2>System Governance Audit Logs</h2>
      <p>Chronological record of verified institutional policy modifications</p>

      <div style={{ marginTop: '30px', background: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(0,0,0,0.4)' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--border-glow)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identity</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--border-glow)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--border-glow)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--border-glow)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metric Changes</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map(log => (
              <tr key={log.id}>
                <td style={{ padding: '15px', borderBottom: '1px solid var(--border-glow)', color: 'var(--text-secondary)' }}>{log.user}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid var(--border-glow)', fontWeight: '700', color: '#fff' }}>{log.action}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid var(--border-glow)', color: 'var(--text-muted)' }}>{log.time}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid var(--border-glow)', fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
