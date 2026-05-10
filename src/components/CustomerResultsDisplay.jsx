import React, { useState } from 'react';
import './CustomerResultsDisplay.css';
import { saveSelectedBanks } from '../services/leadService.js';

const CustomerResultsDisplay = ({ results, metadata, aiResult, aiInsight, onNewCalculation }) => {
  const [sortBy, setSortBy] = useState('loanAmount');
  const [filterEligible, setFilterEligible] = useState('all');
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'
  const [expandedBank, setExpandedBank] = useState(null);

  if (!results || results.length === 0) {
    return (
      <div className="no-results-state">
        <h2>No Results to Display</h2>
        <p>Please re-run the calculation with valid data.</p>
        <button onClick={onNewCalculation} className="btn-primary">Try Again</button>
      </div>
    );
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
              <div className="company-info-header" style={{ marginTop: '10px' }}>
                <span className="company-pill" style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '5px 12px', borderRadius: '15px', color: '#00d2ff', fontSize: '0.9rem', marginRight: '10px' }}>
                  🏢 {metadata.companyName || 'Corporate Entity'}
                </span>
                <span className="category-pill" style={{ background: 'rgba(121, 40, 202, 0.1)', padding: '5px 12px', borderRadius: '15px', color: '#ae63e4', fontSize: '0.9rem' }}>
                  Category: <strong>{results.find(r => r.category)?.category || metadata.category || 'Standard'}</strong>
                </span>
              </div>
            )}
            <p style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '10px' }}>Verified assessment results across {results.length} banking institutions</p>
          </div>
        </div>
      </div>

      {/* 🧠 NEURAL PREDICTION BANNER */}
      {aiResult && (
        <div className="neural-prediction-banner">
          <div className="neural-icon">🧠</div>
          <div className="neural-content">
            <h3>Neural AI Prediction</h3>
            <p className="neural-desc">Our brain has analyzed 3 Crore historical patterns for your profile.</p>
            <div className="neural-stats">
              <div className="neural-stat">
                <span className="stat-label">AI Estimated Sanction:</span>
                <span className="stat-value">₹{aiResult.predictedAmount.toLocaleString()}</span>
              </div>
              <div className="neural-stat">
                <span className="stat-label">Neural Confidence:</span>
                <div className="confidence-container">
                  <div className="confidence-bar" style={{ width: `${aiResult.confidence}%` }}></div>
                  <span className="confidence-text">{aiResult.confidence}%</span>
                </div>
              </div>
            </div>
            <p className="neural-insight">
              {aiResult.predictedAmount > (stats?.avgLoanAmount || 0) 
                ? "✨ Insight: Our AI detects hidden eligibility beyond standard rules."
                : "🔍 Insight: Your profile matches standard high-approval patterns."}
            </p>
          </div>
        </div>
      )}

      {/* 🗣️ LINGUISTIC AI INSIGHT (Human Voice) */}
      {aiInsight && (
        <div className={`ai-insight-bubble ${aiInsight.tone}`}>
          <div className="advisor-header">
            <span className="advisor-label">Personal Financial Advisor</span>
            <div className="pulse-indicator"></div>
          </div>
          <div className="insight-text">
            {aiInsight.message.split('**').map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </div>
        </div>
      )}

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
              <div className="calculation-method" style={{ textAlign: 'right', marginTop: '10px', opacity: 0.6 }}>
                <small>Method: {bestOffer.calculationMethod}</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="controls-bar" style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
        <div className="filter-group">
          <label style={{ marginRight: '10px' }}>Show:</label>
          <select 
            value={filterEligible} 
            onChange={(e) => setFilterEligible(e.target.value)}
            style={{ padding: '5px 10px', borderRadius: '5px', background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
          >
            <option value="all">All Banks ({results.length})</option>
            <option value="eligible">Approved Only ({eligibleBanks.length})</option>
            <option value="rejected">Rejected Only ({rejectedBanks.length})</option>
          </select>
        </div>

        {filterEligible !== 'rejected' && (
          <div className="sort-group">
            <label style={{ marginRight: '10px' }}>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '5px 10px', borderRadius: '5px', background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
            >
              <option value="loanAmount">Highest Loan Amount</option>
              <option value="emi">Lowest EMI</option>
              <option value="bank">Bank Name (A-Z)</option>
            </select>
          </div>
        )}
      </div>

      {/* All Bank Results */}
      <div className="all-banks-results">
        <h3 style={{ marginBottom: '20px' }}>Verified Institutional Assessments</h3>

        <div className="banks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {(filterEligible === 'eligible' ? sortedEligibleBanks :
            filterEligible === 'rejected' ? rejectedBanks :
              [...sortedEligibleBanks, ...rejectedBanks]).map((bank, index) => (
                <div
                  key={index}
                  className={`bank-card ${bank.eligible ? 'eligible' : 'rejected'} ${bank === bestOffer ? 'best' : ''}`}
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: bank.eligible ? '1px solid rgba(0, 210, 255, 0.2)' : '1px solid rgba(255, 0, 0, 0.1)',
                    borderRadius: '16px',
                    padding: '20px',
                    position: 'relative',
                    transition: 'transform 0.2s',
                    boxShadow: bank === bestOffer ? '0 0 20px rgba(0, 210, 255, 0.2)' : 'none',
                    cursor: bank.eligible ? 'pointer' : 'default',
                    overflow: 'visible' // Allow badge to pop out
                  }}
                  onClick={() => bank.eligible && handleBankSelect(bank.bankName, true)}
                >
                  {bank === bestOffer && (
                    <div className="best-badge" style={{ position: 'absolute', top: '-10px', right: '10px', background: '#00d2ff', color: '#000', padding: '2px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      OPTIMAL
                    </div>
                  )}

                  <div className="bank-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {bank.eligible && (
                        <div 
                          className={`selection-checkbox ${selectedBanks.includes(bank.bankName) ? 'selected' : ''}`}
                          style={{
                            width: '24px',
                            height: '24px',
                            minWidth: '24px',
                            borderRadius: '6px',
                            border: `2px solid ${selectedBanks.includes(bank.bankName) ? '#00ffa3' : 'rgba(255,255,255,0.4)'}`,
                            background: selectedBanks.includes(bank.bankName) ? '#00ffa3' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: selectedBanks.includes(bank.bankName) ? '0 0 10px rgba(0, 255, 163, 0.3)' : 'none'
                          }}
                        >
                          {selectedBanks.includes(bank.bankName) && <span style={{ color: '#000', fontSize: '16px', fontWeight: 'bold' }}>✓</span>}
                        </div>
                      )}
                      <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{bank.bankName}</h4>
                    </div>
                    <div className={`status-badge ${bank.eligible ? 'approved' : 'rejected'}`} style={{ fontSize: '0.8rem', color: bank.eligible ? '#00ffa3' : '#ff4d4d' }}>
                      {bank.eligible ? '✓ Approved' : '✕ Rejected'}
                    </div>
                  </div>

                  <div className="bank-card-body">
                    {bank.eligible ? (
                      <>
                        {/* CAPPING ALERTS */}
                        {(bank.loanCappedByBank || bank.bachelorCapped) && (
                          <div className="capping-alert-box" style={{ 
                            background: 'rgba(174, 99, 228, 0.1)', 
                            border: '1px solid rgba(174, 99, 228, 0.3)', 
                            padding: '12px', 
                            borderRadius: '10px', 
                            marginBottom: '15px' 
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ae63e4', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                              <span style={{ fontSize: '1.1rem' }}>⚠️</span> 
                              {bank.bachelorCapped ? 'BACHELOR LIMIT APPLIED' : 'BANK MAXIMUM CAP APPLIED'}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                              Total Eligibility: <span style={{ textDecoration: 'line-through' }}>{formatCurrency(bank.calculatedLoanBeforeCap || bank.regularMaxLoan)}</span>
                            </div>
                            {bank.bachelorCapped && bank.bachelorCapReason && (
                              <div style={{ fontSize: '0.7rem', marginTop: '4px', fontStyle: 'italic' }}>
                                Reason: {bank.bachelorCapReason}
                              </div>
                            )}
                          </div>
                        )}

                        {/* BT MODE DISPLAY */}
                        {(bank.isBTMode || bank.btType?.includes('BT') || bank.calculationMethod?.includes('BT')) ? (
                          <div className="bt-mode-display" style={{ background: 'rgba(0, 255, 163, 0.05)', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                            <div className="bt-badge" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#00ffa3', marginBottom: '10px', textTransform: 'uppercase' }}>Liability Consolidation</div>
                            <div className="bt-breakdown" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <div className="bt-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span className="bt-label">Total Loan Amount</span>
                                <span className="bt-value" style={{ fontWeight: 'bold' }}>{formatCurrency(bank.loanAmount)}</span>
                              </div>
                              <div className="bt-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#ff4d4d' }}>
                                <span className="bt-label">Existing Liabilities Clear</span>
                                <span className="bt-value">- {formatCurrency(bank.totalDebtCleared || bank.btTotalOutstanding)}</span>
                              </div>
                              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '5px 0' }}></div>
                              <div className="bt-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#00ffa3', fontWeight: 'bold' }}>
                                <span className="bt-label">Net Disbursement</span>
                                <span className="bt-value">{formatCurrency(bank.freshAmountDisbursed)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="main-amount" style={{ marginBottom: '15px' }}>
                            <span className="label" style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>Approved Loan Amount</span>
                            <span className="amount" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#00d2ff' }}>{formatCurrency(bank.loanAmount)}</span>
                          </div>
                        )}

                        {/* DETAILED ANALYSIS SECTION */}
                        <div className="detailed-analysis-section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                          <button 
                            className="toggle-details-btn"
                            onClick={(e) => {
                              e.stopPropagation(); // Don't toggle selection when toggling details
                              setExpandedBank(expandedBank === bank.bankName ? null : bank.bankName);
                            }}
                            style={{ background: 'none', border: 'none', color: '#00d2ff', fontSize: '0.8rem', cursor: 'pointer', padding: 0, marginBottom: '10px' }}
                          >
                            {expandedBank === bank.bankName ? 'Hide Calculation Details ▲' : 'Show Calculation Details ▼'}
                          </button>

                          {expandedBank === bank.bankName && (
                            <div className="details-expanded-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0, 210, 255, 0.05)', padding: '10px', borderRadius: '8px' }}>
                              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span className="d-label" style={{ opacity: 0.7 }}>Company Tier</span>
                                <span className="d-value" style={{ fontWeight: '600' }}>Category {bank.category || 'A'}</span>
                              </div>
                              
                              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span className="d-label" style={{ opacity: 0.7 }}>FOIR Cap</span>
                                <span className="d-value">{bank.details?.foirPercentage || '60%'}</span>
                              </div>

                              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span className="d-label" style={{ opacity: 0.7 }}>Multiplier</span>
                                <span className="d-value">{bank.details?.multiplier || '18x'}</span>
                              </div>

                              {(bank.incentiveConsidered > 0 || bank.details?.incentiveConsidered > 0) && (
                                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#00ffa3' }}>
                                  <span className="d-label">Incentive Credit</span>
                                  <span className="d-value">+{formatNumber(bank.incentiveConsidered || bank.details.incentiveConsidered)}</span>
                                </div>
                              )}

                              {(bank.ccObligation > 0 || bank.details?.creditCardObligation > 0) && (
                                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ff4d4d' }}>
                                  <span className="d-label">CC Obligation Deduction</span>
                                  <span className="d-value">-{formatNumber(bank.ccObligation || bank.details.creditCardObligation)}</span>
                                </div>
                              )}

                              {bank.nonSelectedEMI > 0 && (
                                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ff4d4d' }}>
                                  <span className="d-label">External EMI Adjustment</span>
                                  <span className="d-value">-{formatNumber(bank.nonSelectedEMI)}</span>
                                </div>
                              )}
                              
                              {bank.details?.limitingFactor && (
                                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '5px', marginTop: '5px' }}>
                                  <span className="d-label" style={{ opacity: 0.7 }}>Limiting Parameter</span>
                                  <span className="d-value" style={{ color: '#ae63e4' }}>{bank.details.limitingFactor}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="rejected-body" style={{ background: 'rgba(255, 77, 77, 0.05)', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                        <div className="rejection-reason" style={{ fontSize: '0.85rem', color: '#ff4d4d' }}>
                          <span style={{ fontWeight: 'bold' }}>Exclusion:</span> {bank.reason || 'Criteria mismatch'}
                        </div>
                        {bank.category && (
                          <div className="rejected-meta" style={{ marginTop: '10px', opacity: 0.6, fontSize: '0.75rem' }}>
                            Identified Profile: Category {bank.category}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="detail">
                      <span className="detail-label" style={{ display: 'block', fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase' }}>Monthly EMI</span>
                      <span className="detail-value" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{formatNumber(bank.monthlyEMI)}</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label" style={{ display: 'block', fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase' }}>ROI</span>
                      <span className="detail-value" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{bank.interestRate}%</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label" style={{ display: 'block', fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase' }}>Tenure</span>
                      <span className="detail-value" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{bank.loanTenure}Y</span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Floating Submit Bar */}
      {eligibleBanks.length > 0 && (
        <div className="selection-submit-bar" style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(90%, 800px)',
          background: 'rgba(13, 22, 38, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 210, 255, 0.3)',
          borderRadius: '20px',
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 1000,
          animation: 'slideUp 0.5s ease'
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 'bold' }}>
              {selectedBanks.length} Bank{selectedBanks.length !== 1 ? 's' : ''} Selected
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
              Select the banks you prefer to proceed with
            </div>
          </div>

          <button 
            onClick={handleSubmitSelection}
            disabled={selectedBanks.length === 0 || submitting}
            className="table-submit-btn"
            style={{ margin: 0 }}
          >
            {submitting ? 'Processing...' : 'Proceed with Selected Banks'}
          </button>
        </div>
      )}

      {/* Submission Status Overlay */}
      {submitStatus && (
        <div className="status-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#0d1626',
            border: `1px solid ${submitStatus === 'success' ? '#00ffa3' : '#ff4d4d'}`,
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
              {submitStatus === 'success' ? '✅' : '❌'}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
              {submitStatus === 'success' ? 'Application Received!' : 'Submission Failed'}
            </h3>
            <p style={{ opacity: 0.8, marginBottom: '30px' }}>
              {submitStatus === 'success' 
                ? 'Your preferred banks have been notified. Our customer support team will contact you shortly to process your application.'
                : 'There was an error communicating with our server. Please try again or contact support.'}
            </p>
            <button 
              onClick={() => setSubmitStatus(null)}
              className="btn-primary"
              style={{ padding: '10px 30px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerResultsDisplay;
