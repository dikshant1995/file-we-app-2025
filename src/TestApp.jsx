import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50', fontSize: '3em' }}>✅ React App is Working!</h1>
      <p style={{ fontSize: '1.5em', color: '#7f8c8d' }}>The server and React are loading correctly.</p>
      <p style={{ fontSize: '1.2em', color: '#27ae60' }}>Port: 3003</p>
      <p style={{ marginTop: '30px', color: '#e74c3c' }}>
        If you see this message, the issue is with CustomerFacingApp component.
      </p>
    </div>
  );
}

export default TestApp;
