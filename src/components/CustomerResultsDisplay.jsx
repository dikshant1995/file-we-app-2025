import { useState } from 'react';
import './CustomerResultsDisplay.css';
import { saveSelectedBanks } from '../services/leadService';

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

  // Filter banks based on selection
  const displayBanks = filterEligible === 'all' ? results :
    filterEligible === 'eligible' ? eligibleBanks : rejectedBanks;

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
      {/* Disclosure Note */}
      <div className="results-disclosure">
        <p>
          This result shows results based on your salary, company name and bank calculation logics.
          <br />
          <span className="note-highlight">Note:</span> if someone's CIBIL is low that might impact the result on bank's hand.
        </p>
      </div>

      {/* Results Header */}
      <div className="results-header">
        <button className="btn-back-results" onClick={onNewCalculation}>
          ← Start New Analysis
        </button>
        <h2>Institutional Eligibility Analysis</h2>
        <p>Verified assessment results across 12 banking institutions</p>
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

                  {bank.eligible ? (
                    <div className="bank-card-body">
                      {/* LOAN AMOUNT DISPLAY — clean for all modes */}
                      {(bank.isBTMode || bank.btType === 'BT_WITH_CREDIT_CARDS' || bank.btType === 'BT_WITH_CC_OBLIGATION') ? (
                        <div className="bt-mode-display">
                          <div className="bt-badge">Liability Consolidation</div>
                          <div className="bt-breakdown">
                            <div className="bt-item highlight">
                              <span className="bt-label">🏛️ Total Loan Amount</span>
                              <span className="bt-value">{formatCurrency(bank.loanAmount)}</span>
                            </div>
                            <div className="bt-divider">-</div>
                            <div className="bt-item">
                              <span className="bt-label">💸 Amount to Clear Existing Loans</span>
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
                      <span className="detail-value">{bank.loanTenure} years ({bank.loanTenureMonths} months)</span>
                    </div>
                  </div>

                  {/* DETAILED CALCULATION BREAKDOWN */}
                  {bank.calculationMethod && (
                    <div className="calculation-details">
                      <h5>Assessment Methodology: <strong>{bank.calculationMethod}</strong></h5>

                      {/* INCENTIVE BREAKDOWN - ALWAYS SHOW IF METADATA HAS INCENTIVE */}
                      {metadata && (metadata.averageIncentive > 0 || metadata.incentiveMonth1 || metadata.incentiveMonth2 || metadata.incentiveMonth3) && (
                        <div className="calc-section incentive-section" style={{ background: 'linear-gradient(135deg, #fff9e6 0%, #ffe6b3 100%)', border: '2px solid #ffa500' }}>
                          <h6>💰 Incentive Consideration:</h6>
                          <div className="calc-steps">
                            <div className="calc-step">
                              <span className="step-label">Your Last 3 Months Incentive:</span>
                              <span className="step-value">
                                <strong>
                                  {metadata.incentiveMonth1 ? `₹${parseFloat(metadata.incentiveMonth1).toLocaleString('en-IN')}` : '₹0'} +
                                  {metadata.incentiveMonth2 ? `₹${parseFloat(metadata.incentiveMonth2).toLocaleString('en-IN')}` : '₹0'} +
                                  {metadata.incentiveMonth3 ? `₹${parseFloat(metadata.incentiveMonth3).toLocaleString('en-IN')}` : '₹0'}
                                </strong>
                              </span>
                            </div>
                            <div className="calc-step">
                              <span className="step-label">Average Monthly Incentive:</span>
                              <span className="step-value"><strong>₹{metadata.averageIncentive ? parseFloat(metadata.averageIncentive).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}</strong></span>
                            </div>
                            <div className="calc-step result" style={{ background: bank.incentivePercentage > 0 ? '#e8f5e9' : '#ffebee' }}>
                              <span className="step-label">Bank's Incentive Policy:</span>
                              <span className="step-value"><strong style={{ color: bank.incentivePercentage > 0 ? '#2e7d32' : '#c62828' }}>{((bank.incentivePercentage || 0) * 100).toFixed(0)}%</strong></span>
                            </div>
                            <div className="calc-step result">
                              <span className="step-label">Incentive Amount Considered:</span>
                              <span className="step-value"><strong>₹{metadata.averageIncentive ? (parseFloat(metadata.averageIncentive) * (bank.incentivePercentage || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}</strong></span>
                            </div>

                            {/* SALARY BREAKDOWN */}
                            <div style={{ marginTop: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                              <div style={{ fontSize: '0.9em', fontWeight: '600', marginBottom: '8px', color: '#495057' }}>📊 Salary Breakdown:</div>
                              <div className="calc-step" style={{ marginBottom: '4px' }}>
                                <span className="step-label">Basic Salary (Old):</span>
                                <span className="step-value"><strong>₹{metadata.basicSalary ? parseFloat(metadata.basicSalary).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}</strong></span>
                              </div>
                              <div className="calc-step" style={{ marginBottom: '4px', color: '#28a745' }}>
                                <span className="step-label">+ Incentive Added ({((bank.incentivePercentage || 0) * 100).toFixed(0)}% of ₹{metadata.averageIncentive ? parseFloat(metadata.averageIncentive).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}):</span>
                                <span className="step-value"><strong style={{ color: '#28a745' }}>+₹{metadata.averageIncentive ? (parseFloat(metadata.averageIncentive) * (bank.incentivePercentage || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}</strong></span>
                              </div>
                              <div className="calc-step highlight" style={{ borderTop: '2px solid #28a745', paddingTop: '8px', marginTop: '8px' }}>
                                <span className="step-label">Effective Salary (New):</span>
                                <span className="step-value"><strong style={{ fontSize: '1.1em', color: '#155724' }}>₹{metadata.basicSalary ? (parseFloat(metadata.basicSalary) + (parseFloat(metadata.averageIncentive || 0) * (bank.incentivePercentage || 0))).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}</strong></span>
                              </div>
                            </div>
                            {bank.incentivePercentage === 0 && (
                              <div style={{ marginTop: '8px', padding: '8px', background: '#fff3cd', borderRadius: '4px', fontSize: '0.85em', color: '#856404' }}>
                                ⚠️ This bank does not consider incentive income for loan calculation.
                              </div>
                            )}
                            {bank.incentivePercentage >= 1 && (
                              <div style={{ marginTop: '8px', padding: '8px', background: '#d4edda', borderRadius: '4px', fontSize: '0.85em', color: '#155724' }}>
                                ✅ This bank considers 100% of your incentive income!
                              </div>
                            )}
                            {bank.incentivePercentage > 0 && bank.incentivePercentage < 1 && (
                              <div style={{ marginTop: '8px', padding: '8px', background: '#d1ecf1', borderRadius: '4px', fontSize: '0.85em', color: '#0c5460' }}>
                                ℹ️ This bank considers {((bank.incentivePercentage || 0) * 100).toFixed(0)}% of your average incentive.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* FOIR-based or Combined Method */}
                      {(bank.details?.foirCap || bank.details?.availableEMI || bank.details?.foirLoanAmount || bank.details?.maxLoanFromFOIR) && (
                        <div className="calc-section foir-section">
                          <h6>💵 FOIR Calculation:</h6>
                          <div className="calc-steps">
                            {bank.foirPercentage && (
                              <div className="calc-step">
                                <span className="step-label">1. FOIR Percentage:</span>
                                <span className="step-value"><strong>{typeof bank.foirPercentage === 'string' ? bank.foirPercentage : (bank.foirPercentage * 100).toFixed(0) + '%'}</strong></span>
                              </div>
                            )}
                            {bank.details?.salaryBand && (
                              <div className="calc-step">
                                <span className="step-label">2. Your Salary Band:</span>
                                <span className="step-value"><strong>{bank.details.salaryBand}</strong></span>
                              </div>
                            )}
                            {bank.details?.foirCap && (
                              <div className="calc-step">
                                <span className="step-label">3. FOIR Cap (Salary × FOIR%):</span>
                                <span className="step-value"><strong>{formatNumber(bank.details.foirCap)}</strong></span>
                              </div>
                            )}
                            {/* EXISTING OBLIGATIONS BREAKDOWN */}
                            {(bank.details?.existingEMI > 0 || bank.details?.creditCardObligation > 0) && (
                              <div style={{ marginTop: '12px', padding: '10px', background: '#fff3cd', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.9em', fontWeight: '600', marginBottom: '6px', color: '#856404' }}>
                                  📋 Existing Obligations:
                                </div>
                                {bank.details.existingEMI > 0 && (
                                  <div className="calc-step" style={{ marginBottom: '4px' }}>
                                    <span className="step-label">Loan EMIs:</span>
                                    <span className="step-value"><strong className="danger">{formatNumber(bank.details.existingEMI)}</strong></span>
                                  </div>
                                )}
                                {bank.details?.creditCardObligation > 0 && (
                                  <div className="calc-step" style={{ marginBottom: '4px' }}>
                                    <span className="step-label">💳 Credit Card (5%):</span>
                                    <span className="step-value"><strong className="danger">{formatNumber(bank.details.creditCardObligation)}</strong></span>
                                  </div>
                                )}
                                {bank.details?.totalObligations > 0 && (
                                  <div className="calc-step" style={{ borderTop: '1px solid #ffc107', paddingTop: '6px', marginTop: '6px' }}>
                                    <span className="step-label">Total Obligations:</span>
                                    <span className="step-value"><strong className="danger">{formatNumber(bank.details.totalObligations)}</strong></span>
                                  </div>
                                )}
                                {bank.details?.creditCardObligationNote && (
                                  <div style={{ fontSize: '0.8em', color: '#856404', marginTop: '6px', fontStyle: 'italic' }}>
                                    ℹ️ {bank.details.creditCardObligationNote}
                                  </div>
                                )}
                              </div>
                            )}
                            {bank.details?.availableEMI !== undefined && (
                              <div className="calc-step">
                                <span className="step-label">4. Available EMI (FOIR Cap - Total Obligations):</span>
                                <span className="step-value"><strong>{formatNumber(bank.details.availableEMI)}</strong></span>
                              </div>
                            )}
                            {(bank.details?.foirLoanAmount || bank.details?.maxLoanFromFOIR) && (
                              <div className="calc-step result">
                                <span className="step-label">5. Max Loan from FOIR:</span>
                                <span className="step-value"><strong>{formatCurrency(bank.details.foirLoanAmount || bank.details.maxLoanFromFOIR)}</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Multiplier-based Calculation */}
                      {(bank.multiplier || bank.details?.multiplierLoanAmount || bank.maxLoanByMultiplier) && (
                        <div className="calc-section multiplier-section">
                          <h6>✖️ Multiplier Calculation:</h6>
                          <div className="calc-steps">
                            {bank.multiplier && (
                              <div className="calc-step">
                                <span className="step-label">1. Multiplier Applied:</span>
                                <span className="step-value"><strong>{bank.multiplier}x</strong></span>
                              </div>
                            )}
                            {bank.salaryBand && (
                              <div className="calc-step">
                                <span className="step-label">2. Your Salary Band:</span>
                                <span className="step-value"><strong>{bank.salaryBand}</strong></span>
                              </div>
                            )}
                            {bank.category && (
                              <div className="calc-step">
                                <span className="step-label">3. Your Category:</span>
                                <span className="step-value"><strong>{bank.category}</strong></span>
                              </div>
                            )}
                            {/* AVAILABLE SALARY CALCULATION */}
                            {(bank.details?.existingEMI > 0 || bank.details?.creditCardObligation > 0 || bank.details?.availableSalaryAfterObligations) && (
                              <div style={{ marginTop: '12px', padding: '10px', background: '#e3f2fd', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.9em', fontWeight: '600', marginBottom: '6px', color: '#1976d2' }}>
                                  📊 Available Salary for Multiplier:
                                </div>
                                <div className="calc-step" style={{ marginBottom: '4px' }}>
                                  <span className="step-label">Monthly Income:</span>
                                  <span className="step-value"><strong>{formatNumber(bank.details?.monthlyIncome || metadata?.basicSalary || 0)}</strong></span>
                                </div>
                                {bank.details?.existingEMI > 0 && (
                                  <div className="calc-step" style={{ marginBottom: '4px' }}>
                                    <span className="step-label">- Loan EMIs:</span>
                                    <span className="step-value"><strong className="danger">-{formatNumber(bank.details.existingEMI)}</strong></span>
                                  </div>
                                )}
                                {bank.details?.creditCardObligation > 0 && (
                                  <div className="calc-step" style={{ marginBottom: '4px' }}>
                                    <span className="step-label">- 💳 Credit Card (5%):</span>
                                    <span className="step-value"><strong className="danger">-{formatNumber(bank.details.creditCardObligation)}</strong></span>
                                  </div>
                                )}
                                {bank.details?.availableSalaryAfterObligations && (
                                  <div className="calc-step" style={{ borderTop: '1px solid #2196f3', paddingTop: '6px', marginTop: '6px' }}>
                                    <span className="step-label">= Available Salary:</span>
                                    <span className="step-value"><strong className="success">{formatNumber(bank.details.availableSalaryAfterObligations)}</strong></span>
                                  </div>
                                )}
                                {bank.details?.creditCardObligationNote && (
                                  <div style={{ fontSize: '0.8em', color: '#1976d2', marginTop: '6px', fontStyle: 'italic' }}>
                                    ℹ️ {bank.details.creditCardObligationNote}
                                  </div>
                                )}
                              </div>
                            )}
                            {(bank.details?.multiplierLoanAmount || bank.maxLoanByMultiplier) && (
                              <div className="calc-step result">
                                <span className="step-label">4. Max Loan from Multiplier (Available Salary × {bank.multiplier}x):</span>
                                <span className="step-value"><strong>{formatCurrency(bank.details?.multiplierLoanAmount || bank.maxLoanByMultiplier)}</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Final Limiting Factor */}
                      {bank.details?.limitingFactor && (
                        <div className="calc-section final-section">
                          <h6>🎯 Final Decision:</h6>
                          <div className="calc-step highlight">
                            <span className="step-label">Limiting Factor:</span>
                            <span className="step-value"><strong>{bank.details.limitingFactor}</strong></span>
                          </div>
                          <div className="calc-step highlight">
                            <span className="step-label">Final Loan Amount:</span>
                            <span className="step-value"><strong>{formatCurrency(bank.loanAmount)}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TENURE CAPPING DETAILS */}
                  {bank.tenureCapped && (
                    <div className="capping-info warning">
                      <h5>⚠️ Tenure Capped:</h5>
                      <div className="capping-details">
                        <div>✓ You requested: <strong>{bank.requestedTenure} years ({bank.requestedTenureMonths} months)</strong></div>
                        <div>✓ Bank's max for your category: <strong>{bank.maxTenureForCategory} months</strong></div>
                        <div>✓ Actual tenure applied: <strong>{bank.loanTenure} years ({bank.loanTenureMonths} months)</strong></div>
                        {bank.tenureCapReason && (
                          <div className="reason">📋 Reason: {bank.tenureCapReason}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* LOAN AMOUNT CAPPING */}
                  {bank.loanCappedByBank && (
                    <div className="capping-info warning">
                      <h5>⚠️ Loan Amount Capped:</h5>
                      <div className="capping-details">
                        <div>✓ Calculated loan: <strong>{formatCurrency(bank.calculatedLoanBeforeCap)}</strong></div>
                        <div>✓ Bank's maximum cap: <strong>{formatCurrency(bank.maxLoanCap)}</strong></div>
                        <div>✓ Final loan amount: <strong>{formatCurrency(bank.loanAmount)}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* BACHELOR CAPPING */}
                  {bank.bachelorCapped && (
                    <div className="capping-info info">
                      <h5>👤 Bachelor/Unmarried Limit Applied:</h5>
                      <div className="capping-details">
                        <div>✓ Regular max loan: <strong>{formatCurrency(bank.regularMaxLoan)}</strong></div>
                        <div>✓ Bachelor max loan: <strong>{formatCurrency(bank.bachelorMaxLoanAmount)}</strong></div>
                        <div>✓ Applied limit: <strong>{formatCurrency(bank.loanAmount)}</strong></div>
                        <div className="reason">📋 Reason: Unmarried individuals have lower loan limits</div>
                      </div>
                    </div>
                  )}

                  {/* AGE-BASED TENURE CAPPING */}
                  {bank.ageTenureCapped && (
                    <div className="capping-info info">
                      <h5>🎂 Age-Based Tenure Adjustment:</h5>
                      <div className="capping-details">
                        <div>✓ Your current age: <strong>{bank.currentAge} years</strong></div>
                        <div>✓ Retirement age: <strong>{bank.retirementAge} years</strong></div>
                        <div>✓ Max tenure by age: <strong>{bank.maxTenureByAge} years</strong></div>
                        <div>✓ Actual tenure: <strong>{bank.loanTenure} years</strong></div>
                      </div>
                    </div>
                  )}



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

