import { useState } from 'react';
import './CustomerResultsDisplay.css';
import { saveSelectedBanks } from '../services/leadService.js';

const CustomerResultsDisplay = ({ results, metadata, onNewCalculation }) => {
  const [sortBy, setSortBy] = useState('loanAmount');
  const [filterEligible, setFilterEligible] = useState('all');
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'

  if (!results || results.length === 0) {
    return null;
  }

  // Handle bank selection
  const handleBankSelect = (bankName, isEligible) => {
    if (!isEligible) return; // Don't allow selecting rejected banks

    if (selectedBanks.includes(bankName)) {
      setSelectedBanks(selectedBanks.filter(name => name !== bankName));
    } else {
      setSelectedBanks([...selectedBanks, bankName]);
    }
  };

  // Handle submit — sends selection to Google Sheets
  const handleSubmitSelection = async () => {
    if (selectedBanks.length === 0) {
      setSubmitStatus('noselect');
      return;
    }
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      await saveSelectedBanks(metadata, selectedBanks);
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Separate eligible and rejected banks
  const eligibleBanks = results.filter(r => r.eligible);
  const rejectedBanks = results.filter(r => !r.eligible);

  // Sort eligible banks
  const sortedEligibleBanks = [...eligibleBanks].sort((a, b) => {
    if (sortBy === 'loanAmount') {
      return (b.loanAmount || 0) - (a.loanAmount || 0);
    } else if (sortBy === 'emi') {
      return (a.monthlyEMI || 0) - (b.monthlyEMI || 0);
    } else {
      return a.bankName.localeCompare(b.bankName);
    }
  });

  // Get best offer
  const bestOffer = sortedEligibleBanks.length > 0 ? sortedEligibleBanks[0] : null;

  // Calculate statistics
  const stats = {
    totalBanks: results.length,
    eligibleCount: eligibleBanks.length,
    rejectedCount: rejectedBanks.length,
    avgLoanAmount: eligibleBanks.length > 0
      ? Math.round(eligibleBanks.reduce((sum, b) => sum + (b.loanAmount || 0), 0) / eligibleBanks.length)
      : 0
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    const lakhs = (amount / 100000).toFixed(2);
    return `₹${lakhs}L`;
  };

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="customer-results-display professional-grid-bg">
      {/* Results Header */}
      <div className="results-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={onNewCalculation}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Modify Data
          </button>
          <div style={{ flex: 1, textAlign: 'center', marginRight: '100px' }}>
            <h2>Institutional Eligibility Analysis</h2>
            <div className="logic-bridge-active-badge">
              <span className="dot pulse"></span>
              SYSTEM READY: NEURAL LOGIC ENGINE OPTIMIZED
            </div>
            {metadata && (
              <div className="company-info-header">
                <span className="company-pill">🏢 {metadata.companyName || 'Corporate Entity'}</span>
                <span className="category-pill">Category: <strong>{results[0]?.category || results.find(r => r.category)?.category || metadata.category || 'Standard'}</strong></span>
              </div>
            )}
            <p>Verified assessment results across 12 banking institutions</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.eligibleCount}/{stats.totalBanks}</div>
          <div className="stat-label">Institutions Evaluated</div>
        </div>

        {bestOffer && (
          <>
            <div className="stat-card highlight">
              <div className="stat-value">{formatCurrency(bestOffer.loanAmount)}</div>
              <div className="stat-label">Maximum Opportunity ({bestOffer.bankName})</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{formatNumber(bestOffer.monthlyEMI)}</div>
              <div className="stat-label">Optimal Monthly Obligation</div>
            </div>
          </>
        )}

        <div className="stat-card">
          <div className="stat-value">{formatCurrency(stats.avgLoanAmount)}</div>
          <div className="stat-label">Mean Approval Value</div>
        </div>
      </div>

      {/* Best Offer Highlight */}
      {bestOffer && (
        <div className="best-offer-card">
          <div className="best-offer-badge">OPTIMAL SELECTION</div>
          <div className="best-offer-content">
            <h3>{bestOffer.bankName}</h3>
            <div className="best-offer-details">
              <div className="detail-item">
                <span className="label">Loan Amount</span>
                <span className="value large">{formatCurrency(bestOffer.loanAmount)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Monthly EMI</span>
                <span className="value">{formatNumber(bestOffer.monthlyEMI)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Interest Rate</span>
                <span className="value">{bestOffer.interestRate}%</span>
              </div>
              <div className="detail-item">
                <span className="label">Loan Tenure</span>
                <span className="value">{bestOffer.loanTenure} years</span>
              </div>
            </div>
            {bestOffer.calculationMethod && (
              <div className="calculation-method">
                <small>Method: {bestOffer.calculationMethod}</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== COMPARISON TABLE — right below best offer ===== */}
      {eligibleBanks.length > 0 && (
        <div className="comparison-section">
          <h3>Consolidated Institutional Comparison</h3>
          <div className="table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="select-column">Select</th>
                  <th>Bank Name</th>
                  <th>Loan Amount</th>
                  <th>Monthly EMI</th>
                  <th>Interest Rate</th>
                  <th>Tenure</th>
                </tr>
              </thead>
              <tbody>
                {sortedEligibleBanks.map((bank, index) => (
                  <tr key={index} className={`${bank === bestOffer ? 'best-row' : ''} ${selectedBanks.includes(bank.bankName) ? 'selected-row' : ''}`}>
                    <td className="select-cell">
                      <input
                        type="checkbox"
                        id={`table-bank-select-${index}`}
                        checked={selectedBanks.includes(bank.bankName)}
                        onChange={() => handleBankSelect(bank.bankName, true)}
                        className="table-checkbox"
                      />
                      <label htmlFor={`table-bank-select-${index}`} className="checkbox-label"></label>
                    </td>
                    <td className="bank-name">
                      <strong>{bank.bankName}</strong>
                    </td>
                    <td className="amount">{formatCurrency(bank.loanAmount)}</td>
                    <td>{formatNumber(bank.monthlyEMI)}</td>
                    <td>{bank.interestRate}%</td>
                    <td>{bank.loanTenure} years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit Button Below Table */}
          <div className="table-submit-section">
            <div className="selection-summary-compact">
              <span className="selected-count">
                {selectedBanks.length > 0 ? (
                  <>Analysis Selection: <strong>{selectedBanks.length}</strong> {selectedBanks.length > 1 ? 'Institutions' : 'Institution'} detected for further verification</>
                ) : (
                  <>Identify institutions for secondary evaluation</>
                )}
              </span>
            </div>
            <button
              className="table-submit-btn"
              onClick={handleSubmitSelection}
              disabled={selectedBanks.length === 0 || submitting}
            >
              {submitting ? 'Initiating Transmission...' : 'Proceed with Selected Selection'}
            </button>

            {/* Status feedback */}
            {submitStatus === 'noselect' && (
              <div className="status-feedback error">
                Priority: Please select at least one institution to continue.
              </div>
            )}
            {submitStatus === 'success' && (
              <div className="status-feedback success">
                Selection Confirmed. Transmission successful.<br />
                <span className="subtitle">Batch: {selectedBanks.join(', ')}<br />Our analysis team will initiate contact protocol shortly.</span>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="status-feedback error">
                System error encountered. Please re-initiate or notify your administrative lead.
              </div>
            )}
          </div>
        </div>
      )}


      {/* Filter and Sort Controls */}
      <div className="controls-bar">
        <div className="filter-group">
          <label>Show:</label>
          <select value={filterEligible} onChange={(e) => setFilterEligible(e.target.value)}>
            <option value="all">All Banks ({results.length})</option>
            <option value="eligible">Approved Only ({eligibleBanks.length})</option>
            <option value="rejected">Rejected Only ({rejectedBanks.length})</option>
          </select>
        </div>

        {filterEligible !== 'rejected' && (
          <div className="sort-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="loanAmount">Highest Loan Amount</option>
              <option value="emi">Lowest EMI</option>
              <option value="bank">Bank Name (A-Z)</option>
            </select>
          </div>
        )}
      </div>

      {/* All Bank Results */}
      <div className="all-banks-results">
        <h3>Verified Institutional Assessments</h3>

        <div className="banks-grid">
          {(filterEligible === 'eligible' ? sortedEligibleBanks :
            filterEligible === 'rejected' ? rejectedBanks :
              [...sortedEligibleBanks, ...rejectedBanks]).map((bank, index) => (
                <div
                  key={index}
                  className={`bank-card ${bank.eligible ? 'eligible' : 'rejected'} ${bank === bestOffer ? 'best' : ''}`}
                >
                  {bank === bestOffer && <div className="best-badge">OPTIMAL</div>}

                  <div className="bank-card-header">
                    <h4>{bank.bankName}</h4>
                    <div className={`status-badge ${bank.eligible ? 'approved' : 'rejected'}`}>
                      {bank.eligible ? 'Approved' : 'Rejected'}
                    </div>
                  </div>

                  {bank.adminApplied && bank.eligible && (
                    <div className="admin-sync-tag">
                      <span className="icon">✓</span> Institutional Policies Applied
                    </div>
                  )}

                  {bank.eligible ? (
                    <div className="bank-card-body">
                      {/* LOAN AMOUNT DISPLAY — clean for all modes */}
                      {(bank.isBTMode || bank.btType === 'BT_WITH_PERSONAL_LOANS' || bank.btType === 'PARTIAL_BT' || bank.calculationMethod?.includes('BT')) ? (
                        <div className="bt-mode-display">
                          <div className="bt-badge">Liability Consolidation</div>
                          <div className="bt-breakdown">
                            <div className="bt-item highlight">
                              <span className="bt-label">🏛️ Total Loan Amount</span>
                              <span className="bt-value">{formatCurrency(bank.loanAmount)}</span>
                            </div>
                            <div className="bt-divider">-</div>
                            <div className="bt-item">
                              <span className="bt-label">💸 Amount to Clear Exisiting Loans</span>
                              <span className="bt-value danger">{formatCurrency(bank.totalDebtCleared || bank.btTotalOutstanding)}</span>
                            </div>
                            <div className="bt-divider">=</div>
                            <div className="bt-item highlight-green">
                              <span className="bt-label">Net Liquidity Disbursal</span>
                              <span className="bt-value success">{formatCurrency(bank.freshAmountDisbursed)}</span>
                              <span className="bt-subtitle">Verified net credit to account</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="main-amount">
                          <span className="label">Loan Amount</span>
                          <span className="amount">{formatCurrency(bank.loanAmount)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bank-card-body rejected-body">
                      <div className="rejection-reason">
                        <span className="reason-text">Exclusion Parameter: {bank.reason || 'Criteria mismatch'}</span>
                      </div>
                    </div>
                  )}

                  <div className="details-grid">
                    <div className="detail">
                      <span className="detail-label">Monthly EMI</span>
                      <span className="detail-value">{formatNumber(bank.monthlyEMI)}</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">Interest Rate</span>
                      <span className="detail-value">{bank.interestRate}%</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">Tenure</span>
                      <span className="detail-value">{bank.loanTenure} years</span>
                    </div>
                  </div>
                </div>
              ))}</div>
      </div>

      {/* No Results Message */}
      {eligibleBanks.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">😔</div>
          <h3>No Banks Approved</h3>
          <p>Unfortunately, none of the banks approved your application based on the provided information.</p>
          <div className="common-reasons">
            <h4>Common reasons for rejection:</h4>
            <ul>
              {rejectedBanks.slice(0, 3).map((bank, idx) => (
                <li key={idx}>{bank.reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerResultsDisplay;
