import './Analytics.css';

const Analytics = () => {
  return (
    <div className="analytics-container">
      <h2>Institutional Analytics & Reporting</h2>
      <p>Comprehensive performance metrics for registered entities</p>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Applications</h3>
          <div className="big-number">1,234</div>
        </div>
        <div className="analytics-card">
          <h3>Approved</h3>
          <div className="big-number success">856</div>
        </div>
        <div className="analytics-card">
          <h3>Rejected</h3>
          <div className="big-number danger">378</div>
        </div>
        <div className="analytics-card">
          <h3>Approval Rate</h3>
          <div className="big-number">69.4%</div>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '30px', background: '#f8f9fa', borderRadius: '12px' }}>
        <h3>Bank-wise Performance</h3>
        <p style={{ color: '#7f8c8d' }}>Detailed analytics will be implemented here</p>
      </div>
    </div>
  );
};

export default Analytics;
