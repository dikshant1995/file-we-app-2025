import { useState, useEffect } from 'react';

const DebugInfo = ({ userData, results }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  if (!isVisible) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        backgroundColor: '#ffeb3b', 
        padding: '5px 10px', 
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 1000
      }} onClick={() => setIsVisible(true)}>
        Show Debug Info
      </div>
    );
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      backgroundColor: '#f5f5f5', 
      border: '1px solid #ccc',
      padding: '15px', 
      borderRadius: '5px',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 1000,
      fontSize: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Debug Information</h3>
        <button onClick={() => setIsVisible(false)} style={{ 
          background: '#ff5722', 
          color: 'white', 
          border: 'none', 
          padding: '5px 10px', 
          borderRadius: '3px',
          cursor: 'pointer'
        }}>
          Hide
        </button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '10px 0 5px 0' }}>User Input Data:</h4>
        <pre style={{ 
          backgroundColor: '#eee', 
          padding: '10px', 
          borderRadius: '3px',
          fontSize: '11px',
          maxHeight: '150px',
          overflow: 'auto'
        }}>
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '10px 0 5px 0' }}>Results Summary:</h4>
        <div>Total Banks: {results?.length || 0}</div>
        <div>Eligible Banks: {results?.filter(r => r.eligible).length || 0}</div>
        <div>Ineligible Banks: {results?.filter(r => !r.eligible).length || 0}</div>
      </div>
      
      <div>
        <h4 style={{ margin: '10px 0 5px 0' }}>Bank Results:</h4>
        <div style={{ 
          maxHeight: '200px', 
          overflow: 'auto',
          border: '1px solid #ddd',
          borderRadius: '3px'
        }}>
          {results?.map((result, index) => (
            <div key={index} style={{ 
              padding: '5px 10px', 
              borderBottom: '1px solid #eee',
              backgroundColor: result.eligible ? '#e8f5e8' : '#ffebee'
            }}>
              <strong>{result.bankName}:</strong> {result.eligible ? 'Eligible' : 'Not Eligible'}
              {result.eligible && (
                <div style={{ fontSize: '11px', marginLeft: '10px' }}>
                  Loan Amount: ₹{result.loanAmount?.toLocaleString()}
                  {result.monthlyEMI && <div>EMI: ₹{result.monthlyEMI?.toLocaleString()}</div>}
                </div>
              )}
              {!result.eligible && result.reason && (
                <div style={{ fontSize: '11px', marginLeft: '10px', color: '#d32f2f' }}>
                  Reason: {result.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '11px', color: '#666' }}>
        <p><strong>Note:</strong> This debug panel helps identify data flow issues.</p>
        <p>Check if user input data is correctly formatted and if results contain expected values.</p>
      </div>
    </div>
  );
};

export default DebugInfo;