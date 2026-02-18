const AuditLog = () => {
  const mockLogs = [
    { id: 1, user: 'Admin', action: 'Updated HDFC Interest Rate', time: '2025-10-27 10:30', details: 'Changed from 11% to 10.5%' },
    { id: 2, user: 'Admin', action: 'Modified ICICI Category A FOIR', time: '2025-10-27 09:15', details: 'Changed from 65% to 70%' },
    { id: 3, user: 'Admin', action: 'Enabled Axis Finance', time: '2025-10-26 15:45', details: 'Bank activated' }
  ];

  return (
    <div className="audit-log-container">
      <h2>📝 Audit Log</h2>
      <p>Track all configuration changes</p>

      <div style={{marginTop: '30px', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead style={{background: '#f8f9fa'}}>
            <tr>
              <th style={{padding: '15px', textAlign: 'left', borderBottom: '2px solid #e0e0e0'}}>User</th>
              <th style={{padding: '15px', textAlign: 'left', borderBottom: '2px solid #e0e0e0'}}>Action</th>
              <th style={{padding: '15px', textAlign: 'left', borderBottom: '2px solid #e0e0e0'}}>Time</th>
              <th style={{padding: '15px', textAlign: 'left', borderBottom: '2px solid #e0e0e0'}}>Details</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map(log => (
              <tr key={log.id}>
                <td style={{padding: '15px', borderBottom: '1px solid #f0f0f0'}}>{log.user}</td>
                <td style={{padding: '15px', borderBottom: '1px solid #f0f0f0', fontWeight: '600'}}>{log.action}</td>
                <td style={{padding: '15px', borderBottom: '1px solid #f0f0f0', color: '#7f8c8d'}}>{log.time}</td>
                <td style={{padding: '15px', borderBottom: '1px solid #f0f0f0', fontSize: '0.9em', color: '#95a5a6'}}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
