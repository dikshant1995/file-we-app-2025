import './ResultsDisplay.css'

const ResultsDisplay = ({ results, onReset }) => {
  // Filter eligible and not eligible results
  const eligibleResults = results.filter(r => r.eligible);
  const notEligibleResults = results.filter(r => !r.eligible);
  
  // Find the best offer
  const bestOffer = eligibleResults.length > 0 
    ? eligibleResults.reduce((best, current) => 
        current.loanAmount > best.loanAmount ? current : best
      )
    : null;

  return (
    <div className="results-display">
      <div className="results-header">
        <h2>Loan Offers from 12 Banks</h2>
        <button className="reset-btn" onClick={onReset}>New Calculation</button>
      </div>
      
      {bestOffer && (
        <div className="best-offer">
          <h3>🏆 Best Offer</h3>
          <p>
            <strong>{bestOffer.bankName}</strong> offers <strong>₹{bestOffer.loanAmount.toLocaleString()}</strong>
          </p>
          <p className="offer-details">
            Interest Rate: <strong>{bestOffer.interestRate}%</strong> | 
            Monthly EMI: <strong>₹{bestOffer.monthlyEMI.toLocaleString()}</strong>
            {bestOffer.calculationMethod && (
              <span> | Method: {bestOffer.calculationMethod}</span>
            )}
          </p>
        </div>
      )}
      
      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Bank Name</th>
              <th>Status</th>
              <th>Approved Amount (₹)</th>
              <th>Max Eligible (₹)</th>
              <th>Interest Rate (%)</th>
              <th>Monthly EMI (₹)</th>
              <th>Method / Reason</th>
            </tr>
          </thead>
          <tbody>
            {results.map((bankResult, index) => (
              <tr key={index} className={bankResult.eligible ? 'eligible' : 'not-eligible'}>
                <td><strong>{bankResult.bankName}</strong></td>
                <td className={bankResult.eligible ? 'status-eligible' : 'status-not-eligible'}>
                  {bankResult.eligible ? '✅ Eligible' : '❌ Not Eligible'}
                </td>
                <td className="amount-cell">
                  {bankResult.eligible ? (
                    <span className="approved-amount">₹{bankResult.loanAmount.toLocaleString()}</span>
                  ) : (
                    <span className="not-available">N/A</span>
                  )}
                </td>
                <td className="amount-cell">
                  {bankResult.eligible ? (
                    <span className="max-amount">
                      {bankResult.maxLoanAmount ? 
                        `₹${bankResult.maxLoanAmount.toLocaleString()}` : 
                        `₹${bankResult.loanAmount.toLocaleString()}`}
                    </span>
                  ) : (
                    <span className="not-available">N/A</span>
                  )}
                </td>
                <td>
                  {bankResult.eligible ? (
                    <span>{bankResult.interestRate}%</span>
                  ) : (
                    <span className="not-available">N/A</span>
                  )}
                </td>
                <td>
                  {bankResult.eligible ? (
                    <span>₹{bankResult.monthlyEMI.toLocaleString()}</span>
                  ) : (
                    <span className="not-available">N/A</span>
                  )}
                </td>
                <td className="method-cell">
                  {bankResult.eligible ? (
                    <span className="method-badge">
                      {bankResult.calculationMethod || 'Standard'}
                    </span>
                  ) : (
                    <span className="rejection-reason" title={bankResult.reason}>
                      {bankResult.reason || 'Not eligible'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Rejection Reasons Section */}
      {notEligibleResults.length > 0 && (
        <div className="rejection-details">
          <h3>❌ Rejection Reasons ({notEligibleResults.length} banks)</h3>
          <div className="rejection-list">
            {notEligibleResults.map((bank, index) => (
              <div key={index} className="rejection-item">
                <strong>{bank.bankName}:</strong> {bank.reason || 'Not eligible'}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="summary">
        <h3>Summary</h3>
        <p>
          You are eligible for loans from <strong>{eligibleResults.length}</strong> out of {results.length} banks.
        </p>
        {notEligibleResults.length > 0 && (
          <p className="rejection-summary">
            <strong>{notEligibleResults.length}</strong> banks rejected your application.
          </p>
        )}
        {bestOffer && (
          <p>
            Best offer: <strong>₹{bestOffer.loanAmount.toLocaleString()}</strong> from {bestOffer.bankName}
          </p>
        )}
      </div>
    </div>
  )
}

export default ResultsDisplay