import { useState } from 'react';
import './EnhancedResultsDisplay.css';

const EnhancedResultsDisplay = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState('fresh'); // 'fresh', 'full', 'partial'

  // Extract results for each scenario
  const freshLoanResults = results.freshLoan || [];
  const fullBTResults = results.fullBT || [];
  const partialBTResults = results.partialBT || [];

  // Find best offers for each scenario
  const getBestOffer = (results) => {
    const eligibleResults = results.filter(r => r.isEligible);
    if (eligibleResults.length === 0) return null;
    return eligibleResults.reduce((best, current) =>
      (current.maxLoanAmount || current.freshAmountDisbursed) > (best.maxLoanAmount || best.freshAmountDisbursed) ? current : best
    );
  };

  const bestFreshOffer = getBestOffer(freshLoanResults);
  const bestFullBTOffer = getBestOffer(fullBTResults);
  const bestPartialBTOffer = getBestOffer(partialBTResults);

  // Calculate totals for partial BT
  const selectedLiabilities = results.selectedLiabilities || [];
  const selectedOutstandingTotal = selectedLiabilities.reduce((sum, liability) =>
    sum + (parseFloat(liability.outstandingAmount) || 0), 0);

  const renderScenarioCard = (title, subtitle, results, bestOffer, icon) => {
    const eligibleCount = results.filter(r => r.isEligible).length;
    const totalCount = results.length;

    return (
      <div className="scenario-card">
        <div className="card-header">
          <div className="header-icon">{icon}</div>
          <div className="header-text">
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>

        {bestOffer ? (
          <div className="best-offer">
            <div className="bank-info">
              <h4>{bestOffer.bankName}</h4>
              <div className="offer-details">
                {bestOffer.maxLoanAmount ? (
                  <>
                    <div className="detail-item">
                      <span>Loan Amount:</span>
                      <strong>₹{bestOffer.maxLoanAmount.toLocaleString()}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Monthly EMI:</span>
                      <strong>₹{bestOffer.monthlyEMI.toLocaleString()}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="detail-item">
                      <span>Fresh Funds:</span>
                      <strong>₹{bestOffer.freshAmountDisbursed.toLocaleString()}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Total Loan:</span>
                      <strong>₹{(bestOffer.maxLoanAmount || 0).toLocaleString()}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Monthly EMI:</span>
                      <strong>₹{(bestOffer.newSingleEMI || bestOffer.newBTLoanEMI).toLocaleString()}</strong>
                    </div>
                  </>
                )}
                <div className="detail-item">
                  <span>Interest Rate:</span>
                  <strong>{bestOffer.interestRate}%</strong>
                </div>
              </div>
            </div>

            <div className="eligibility-summary">
              <span className="eligible-badge">✓ {eligibleCount} of {totalCount} banks eligible</span>
            </div>
          </div>
        ) : (
          <div className="no-offers">
            <p>No eligible offers found for this scenario</p>
          </div>
        )}

        <div className="view-details">
          <button
            className="details-btn"
            onClick={() => setActiveTab(title.toLowerCase().includes('fresh') ? 'fresh' :
              title.toLowerCase().includes('full') ? 'full' : 'partial')}
          >
            View Detailed Comparison
          </button>
        </div>
      </div>
    );
  };

  const renderDetailedTable = (results, title) => {
    const eligibleResults = results.filter(r => r.isEligible);

    if (eligibleResults.length === 0) {
      return (
        <div className="no-results-table">
          <p>No eligible banks for {title}</p>
        </div>
      );
    }

    return (
      <div className="detailed-table-container">
        <h3>📊 Detailed {title} Comparison</h3>
        <table className="detailed-results-table">
          <thead>
            <tr>
              <th>Bank</th>
              {title.includes('Fresh') ? (
                <>
                  <th>Loan Amount (₹)</th>
                  <th>Monthly EMI (₹)</th>
                </>
              ) : (
                <>
                  <th>Fresh Funds (₹)</th>
                  <th>Total Loan (₹)</th>
                  <th>Monthly EMI (₹)</th>
                </>
              )}
              <th>Interest Rate (%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {eligibleResults.map((result, index) => (
              <tr key={index}>
                <td><strong>{result.bankName}</strong></td>
                {title.includes('Fresh') ? (
                  <>
                    <td className="amount-cell">₹{result.maxLoanAmount?.toLocaleString() || 'N/A'}</td>
                    <td>₹{result.monthlyEMI?.toLocaleString() || 'N/A'}</td>
                  </>
                ) : (
                  <>
                    <td className="amount-cell">₹{result.freshAmountDisbursed?.toLocaleString() || 'N/A'}</td>
                    <td>₹{result.maxLoanAmount?.toLocaleString() || 'N/A'}</td>
                    <td>₹{(result.newSingleEMI || result.newBTLoanEMI)?.toLocaleString() || 'N/A'}</td>
                  </>
                )}
                <td>{result.interestRate || '11'}%</td>
                <td>
                  <span className="status-badge eligible">Eligible</span>
                </td>
              </tr>
            ))}
            {results.filter(r => !r.isEligible).map((result, index) => (
              <tr key={`ineligible-${index}`} className="ineligible-row">
                <td><strong>{result.bankName}</strong></td>
                <td colSpan={title.includes('Fresh') ? 3 : 4}>Not Eligible</td>
                <td>
                  <span className="status-badge not-eligible">Not Eligible</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="enhanced-results-display">
      <div className="results-header">
        <h2>📈 Loan Comparison Results</h2>
        <p>Compare all loan scenarios to find the best option for your needs</p>
        <button className="reset-btn" onClick={onReset}>New Calculation</button>
      </div>

      {/* Summary Cards for All Scenarios */}
      <div className="scenarios-summary">
        {renderScenarioCard(
          "Fresh Loan Eligibility",
          "Get a new loan without transferring existing debts",
          freshLoanResults,
          bestFreshOffer,
          "💰"
        )}

        {renderScenarioCard(
          "Full Balance Transfer",
          "Consolidate ALL existing loans & credit cards",
          fullBTResults,
          bestFullBTOffer,
          "🔄"
        )}

        {renderScenarioCard(
          "Partial Balance Transfer",
          `Consolidate selected loans (${selectedLiabilities.length} items, ₹${selectedOutstandingTotal.toLocaleString()} total)`,
          partialBTResults,
          bestPartialBTOffer,
          "☑️"
        )}
      </div>

      {/* Detailed Comparison Section */}
      <div className="detailed-comparison-section">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'fresh' ? 'active' : ''}`}
            onClick={() => setActiveTab('fresh')}
          >
            💰 Fresh Loan
          </button>
          <button
            className={`tab-btn ${activeTab === 'full' ? 'active' : ''}`}
            onClick={() => setActiveTab('full')}
          >
            🔄 Full BT
          </button>
          <button
            className={`tab-btn ${activeTab === 'partial' ? 'active' : ''}`}
            onClick={() => setActiveTab('partial')}
          >
            ☑️ Partial BT
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'fresh' && renderDetailedTable(freshLoanResults, "Fresh Loan")}
          {activeTab === 'full' && renderDetailedTable(fullBTResults, "Full Balance Transfer")}
          {activeTab === 'partial' && renderDetailedTable(partialBTResults, "Partial Balance Transfer")}
        </div>
      </div>

      {/* Savings Comparison */}
      <div className="savings-comparison">
        <h3>💡 Potential Savings</h3>
        <div className="savings-cards">
          {bestFreshOffer && (
            <div className="savings-card">
              <h4>Fresh Loan</h4>
              <p>Loan Amount: <strong>₹{bestFreshOffer.maxLoanAmount?.toLocaleString()}</strong></p>
              <p>Monthly EMI: <strong>₹{bestFreshOffer.monthlyEMI?.toLocaleString()}</strong></p>
            </div>
          )}

          {bestFullBTOffer && (
            <div className="savings-card highlight">
              <h4>Full BT (Consolidation)</h4>
              <p>Fresh Funds: <strong>₹{bestFullBTOffer.freshAmountDisbursed?.toLocaleString()}</strong></p>
              <p>Single EMI: <strong>₹{(bestFullBTOffer.newSingleEMI || bestFullBTOffer.newBTLoanEMI)?.toLocaleString()}</strong></p>
              <p className="savings-note">
                Consolidate all debts into one payment
              </p>
            </div>
          )}

          {bestPartialBTOffer && (
            <div className="savings-card">
              <h4>Partial BT</h4>
              <p>Fresh Funds: <strong>₹{bestPartialBTOffer.freshAmountDisbursed?.toLocaleString()}</strong></p>
              <p>Single EMI: <strong>₹{(bestPartialBTOffer.newSingleEMI || bestPartialBTOffer.newBTLoanEMI)?.toLocaleString()}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedResultsDisplay;