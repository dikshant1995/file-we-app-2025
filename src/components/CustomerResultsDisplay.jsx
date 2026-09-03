import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <div className="customer-results-display">
      {/* Results Header */}
      <div className="results-header">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{
            fontFamily: 'Outfit, "Plus Jakarta Sans", Inter, sans-serif',
            fontStyle: 'normal',
            fontWeight: 750,
            color: 'rgb(66, 66, 66)',
            fontSize: '43px',
            lineHeight: '54px',
            margin: '0 0 6px 0'
          }}>
            Institutional <span style={{ color: '#F58220' }}>Eligibility Analysis</span>
          </h2>
          <div style={{ width: '42px', height: '3.5px', backgroundColor: '#F58220', borderRadius: '2px', margin: '0 auto 12px' }} />

          {metadata && (
            <div className="company-info-header">
              <span className="company-pill">
                🏢 {metadata.companyName || 'Corporate Entity'}
              </span>
              <span className="category-pill">
                Category: <strong>{results.find(r => r.category)?.category || metadata.category || 'Standard'}</strong>
              </span>
            </div>
          )}
          <p style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: '1.02rem',
            color: 'rgb(66, 66, 66)',
            lineHeight: '1.6',
            maxWidth: '680px',
            margin: '12px auto 0',
            fontWeight: 500
          }}>
            Verified assessment results across {results.length} banking institutions with zero impact on CIBIL score.
          </p>
          <button 
            className="btn-download-pdf" 
            onClick={() => window.print()}
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
              fontStyle: 'normal',
              fontWeight: 750,
              color: 'rgb(255, 255, 255)',
              fontSize: '18px',
              lineHeight: 'normal',
              background: 'rgb(245, 130, 32)',
              border: 'none',
              borderRadius: '50px',
              padding: '14px 36px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(245, 130, 32, 0.35)',
              transition: 'all 0.25s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '20px'
            }}
          >
            Download your eligibility report
          </button>
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

      {/* 📊 VISUAL ANALYTICS SUITE (Pie/Bars Comparison) */}
      {eligibleBanks.length > 0 && (
        <div className="visual-analytics-container">
          {/* Bar Comparison Chart */}
          <div className="chart-card">
            <h4>Top Eligible Offer Comparison</h4>
            <div className="bar-chart-wrapper">
              {sortedEligibleBanks.slice(0, 5).map((bank, i) => {
                const maxPossibleInView = sortedEligibleBanks[0].loanAmount || 1;
                const percentage = ((bank.loanAmount || 0) / maxPossibleInView) * 100;
                return (
                  <div key={i} className="comparison-bar-row">
                    <div className="bar-info">
                      <span className="bar-bank-name">{bank.bankName}</span>
                      <span className="bar-amount">{formatCurrency(bank.loanAmount)}</span>
                    </div>
                    <div className="bar-track">
                      <motion.div 
                        className="bar-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Success Pie Gauge */}
          <div className="chart-card">
            <h4>Approval Success Rate</h4>
            <div className="gauge-flex">
              <div className="gauge-svg-container">
                <svg className="gauge-svg" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradientGauge" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E40AF" />
                      <stop offset="50%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#F58220" />
                    </linearGradient>
                  </defs>
                  {/* Background Ring */}
                  <circle className="gauge-bg" cx="50" cy="50" r="40" />
                  {/* Filled Ring */}
                  <motion.circle 
                    className="gauge-fill" 
                    cx="50" cy="50" r="40"
                    initial={{ strokeDasharray: "0, 251.2" }}
                    whileInView={{ strokeDasharray: `${(Math.round((stats.eligibleCount / stats.totalBanks) * 100) / 100) * 251.2}, 251.2` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                  />
                </svg>
                <div className="gauge-content-center">
                  <div className="gauge-percentage" style={{ color: '#1E40AF' }}>
                    {Math.round((stats.eligibleCount / stats.totalBanks) * 100)}%
                  </div>
                  <div className="gauge-label" style={{ color: 'rgb(66, 66, 66)' }}>Approved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', padding: '22px 18px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div className="stat-value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#1E40AF', marginBottom: '8px' }}>
            {stats.eligibleCount}/{stats.totalBanks}
          </div>
          <div className="stat-label" style={{ fontSize: '0.82rem', color: 'rgb(66, 66, 66)', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 1, display: 'block' }}>
            Institutions Evaluated
          </div>
        </div>

        {bestOffer && (
          <>
            <div className="stat-card highlight" style={{ background: '#FFF4EC', border: '2px solid #f58220', padding: '22px 18px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 6px 20px rgba(245, 130, 32, 0.12)' }}>
              <div className="stat-value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#f58220', marginBottom: '8px' }}>
                {formatCurrency(bestOffer.loanAmount)}
              </div>
              <div className="stat-label" style={{ fontSize: '0.82rem', color: '#f58220', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 1, display: 'block' }}>
                Maximum Opportunity ({bestOffer.bankName})
              </div>
            </div>

            <div className="stat-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', padding: '22px 18px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div className="stat-value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#1E40AF', marginBottom: '8px' }}>
                {formatNumber(bestOffer.monthlyEMI)}
              </div>
              <div className="stat-label" style={{ fontSize: '0.82rem', color: 'rgb(66, 66, 66)', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 1, display: 'block' }}>
                Optimal Monthly Obligation
              </div>
            </div>
          </>
        )}

        <div className="stat-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', padding: '22px 18px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div className="stat-value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#1E40AF', marginBottom: '8px' }}>
            {formatCurrency(stats.avgLoanAmount)}
          </div>
          <div className="stat-label" style={{ fontSize: '0.82rem', color: 'rgb(66, 66, 66)', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 1, display: 'block' }}>
            Mean Approval Value
          </div>
        </div>
      </div>

      {/* Best Offer Highlight */}
      {bestOffer && (
        <div className="best-offer-card" style={{ background: '#FFF4EC', border: '2px solid #f58220', borderRadius: '20px', padding: '32px', marginBottom: '36px', boxShadow: '0 10px 30px rgba(245, 130, 32, 0.12)' }}>
          <div className="best-offer-badge" style={{ background: '#f58220', color: '#ffffff', padding: '5px 14px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 750, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '16px' }}>OPTIMAL SELECTION</div>
          <div className="best-offer-content">
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 750, color: 'rgb(66, 66, 66)', margin: '0 0 24px 0' }}>{bestOffer.bankName}</h3>
            <div className="best-offer-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
              <div className="detail-item">
                <span className="label" style={{ fontSize: '0.8rem', color: 'rgb(66, 66, 66)', marginBottom: '4px', fontWeight: 650, textTransform: 'uppercase', display: 'block' }}>Loan Amount</span>
                <span className="value large" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#f58220', display: 'block' }}>{formatCurrency(bestOffer.loanAmount)}</span>
              </div>
              <div className="detail-item">
                <span className="label" style={{ fontSize: '0.8rem', color: 'rgb(66, 66, 66)', marginBottom: '4px', fontWeight: 650, textTransform: 'uppercase', display: 'block' }}>Monthly EMI</span>
                <span className="value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#1E40AF', display: 'block' }}>{formatNumber(bestOffer.monthlyEMI)}</span>
              </div>
              <div className="detail-item">
                <span className="label" style={{ fontSize: '0.8rem', color: 'rgb(66, 66, 66)', marginBottom: '4px', fontWeight: 650, textTransform: 'uppercase', display: 'block' }}>Interest Rate</span>
                <span className="value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#f58220', display: 'block' }}>{bestOffer.interestRate}%</span>
              </div>
              <div className="detail-item">
                <span className="label" style={{ fontSize: '0.8rem', color: 'rgb(66, 66, 66)', marginBottom: '4px', fontWeight: 650, textTransform: 'uppercase', display: 'block' }}>Loan Tenure</span>
                <span className="value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#1E40AF', display: 'block' }}>{bestOffer.loanTenure} years</span>
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
      <div className="controls-bar">
        <div className="filter-group">
          <label>Show:</label>
          <select 
            value={filterEligible} 
            onChange={(e) => setFilterEligible(e.target.value)}
          >
            <option value="all">All Banks ({results.length})</option>
            <option value="eligible">Approved Only ({eligibleBanks.length})</option>
            <option value="rejected">Rejected Only ({rejectedBanks.length})</option>
          </select>
        </div>

        {filterEligible !== 'rejected' && (
          <div className="sort-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
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
        <h3 style={{ fontFamily: 'Outfit, "Plus Jakarta Sans", Inter, sans-serif', fontWeight: 750, color: 'rgb(66, 66, 66)', fontSize: '1.5rem', marginBottom: '20px' }}>
          Your Pre-Approved <span style={{ color: '#F58220' }}>Loan Amount Options</span>
        </h3>

        <div className="banks-grid">
          {(filterEligible === 'eligible' ? sortedEligibleBanks :
            filterEligible === 'rejected' ? rejectedBanks :
              [...sortedEligibleBanks, ...rejectedBanks]).map((bank, index) => (
                <div
                  key={index}
                  className={`bank-card ${bank.eligible ? 'eligible' : 'rejected'} ${bank === bestOffer ? 'best' : ''}`}
                  onClick={() => bank.eligible && handleBankSelect(bank.bankName, true)}
                >
                  <div className="bank-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {bank.eligible && (
                        <div 
                          className={`selection-checkbox ${selectedBanks.includes(bank.bankName) ? 'selected' : ''}`}
                          style={{
                            width: '22px',
                            height: '22px',
                            minWidth: '22px',
                            borderRadius: '6px',
                            border: selectedBanks.includes(bank.bankName) ? '2px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.7)',
                            background: selectedBanks.includes(bank.bankName) ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: selectedBanks.includes(bank.bankName) ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none'
                          }}
                        >
                          {selectedBanks.includes(bank.bankName) && <span style={{ color: '#1E40AF', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                        </div>
                      )}
                      <h4>{bank.bankName}</h4>
                    </div>

                    {!bank.eligible && (
                      <div className="status-badge rejected">
                        ✕ Ineligible
                      </div>
                    )}
                  </div>

                  <div className="bank-card-body">
                    {bank.eligible ? (
                      <>
                        {/* CAPPING ALERTS */}
                        {(bank.loanCappedByBank || bank.bachelorCapped) && (
                          <div className="capping-alert-box" style={{ 
                            background: '#FFF4EC', 
                            border: '1px solid #FED7AA', 
                            padding: '12px', 
                            borderRadius: '10px', 
                            marginBottom: '15px' 
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F58220', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                              <span style={{ fontSize: '1.1rem' }}>⚠️</span> 
                              {bank.bachelorCapped ? 'BACHELOR LIMIT APPLIED' : 'BANK MAXIMUM CAP APPLIED'}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'rgb(66, 66, 66)' }}>
                              Total Eligibility: <span style={{ textDecoration: 'line-through' }}>{formatCurrency(bank.calculatedLoanBeforeCap || bank.regularMaxLoan)}</span>
                            </div>
                            {bank.bachelorCapped && bank.bachelorCapReason && (
                              <div style={{ fontSize: '0.72rem', marginTop: '4px', fontStyle: 'italic', color: 'rgb(66, 66, 66)' }}>
                                Reason: {bank.bachelorCapReason}
                              </div>
                            )}
                          </div>
                        )}

                        {/* BT MODE DISPLAY */}
                        {(bank.isBTMode || bank.btType?.includes('BT') || bank.calculationMethod?.includes('BT')) ? (
                          <div className="bt-mode-display" style={{ background: '#EEF3FA', border: '1px solid #BFDBFE', padding: '14px 16px', borderRadius: '10px', marginBottom: '16px' }}>
                            <div className="bt-badge" style={{ fontSize: '0.75rem', fontWeight: 750, color: '#1E40AF', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Liability Consolidation</div>
                            <div className="bt-breakdown" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div className="bt-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                <span className="bt-label" style={{ color: 'rgb(66, 66, 66)', fontWeight: 500 }}>Total Loan Amount</span>
                                <span className="bt-value" style={{ fontWeight: 750, color: '#1E40AF' }}>{formatCurrency(bank.loanAmount)}</span>
                              </div>
                              <div className="bt-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'rgb(66, 66, 66)' }}>
                                <span className="bt-label" style={{ fontWeight: 500 }}>Existing Liabilities Clear</span>
                                <span className="bt-value" style={{ fontWeight: 750 }}>- {formatCurrency(bank.totalDebtCleared || bank.btTotalOutstanding)}</span>
                              </div>
                              <div style={{ height: '1px', background: '#BFDBFE', margin: '4px 0' }}></div>
                              <div className="bt-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', color: '#1E40AF', fontWeight: 800 }}>
                                <span className="bt-label">Net Disbursement</span>
                                <span className="bt-value">{formatCurrency(bank.freshAmountDisbursed)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="main-amount">
                            <span className="label">Approved Loan Amount</span>
                            <span className="amount">{formatCurrency(bank.loanAmount)}</span>
                          </div>
                        )}

                        {/* DETAILED ANALYSIS SECTION */}
                        <div className="detailed-analysis-section" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          {(() => {
                            const method = (bank.calculationMethod || '').toLowerCase();
                            const isCombined = method.includes('combined') || method.includes('dual') || method.includes('both');
                            const isFoir = method.includes('foir');
                            const isMultiplier = method.includes('multiplier');
                            
                            const showFoir = isCombined || isFoir || (!isMultiplier);
                            const showMultiplier = isCombined || isMultiplier || (!isFoir);
                            
                            return (
                              <div className="details-expanded-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '10px' }}>
                                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                  <span className="d-label" style={{ color: 'rgb(66, 66, 66)', fontWeight: 500 }}>Company Tier</span>
                                  <span className="d-value" style={{ fontWeight: 700, color: 'rgb(66, 66, 66)' }}>Category {bank.category || 'A'}</span>
                                </div>
                                
                                {showFoir && bank.details?.foirPercentage && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span className="d-label" style={{ color: 'rgb(66, 66, 66)', fontWeight: 500 }}>FOIR Cap</span>
                                    <span className="d-value" style={{ fontWeight: 700, color: '#1E40AF' }}>{bank.details.foirPercentage}</span>
                                  </div>
                                )}

                                {showMultiplier && bank.details?.multiplier && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span className="d-label" style={{ color: 'rgb(66, 66, 66)', fontWeight: 500 }}>Multiplier</span>
                                    <span className="d-value" style={{ fontWeight: 700, color: '#1E40AF' }}>{bank.details.multiplier}</span>
                                  </div>
                                )}

                                {(bank.incentiveConsidered > 0 || bank.details?.incentiveConsidered > 0) && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#1E40AF' }}>
                                    <span className="d-label" style={{ fontWeight: 500 }}>Incentive Credit</span>
                                    <span className="d-value" style={{ fontWeight: 750 }}>+{formatNumber(bank.incentiveConsidered || bank.details.incentiveConsidered)}</span>
                                  </div>
                                )}

                                {(bank.ccObligation > 0 || bank.details?.creditCardObligation > 0) && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgb(66, 66, 66)' }}>
                                    <span className="d-label" style={{ fontWeight: 500 }}>CC Obligation Deduction</span>
                                    <span className="d-value" style={{ fontWeight: 750 }}>-{formatNumber(bank.ccObligation || bank.details.creditCardObligation)}</span>
                                  </div>
                                )}

                                {bank.nonSelectedEMI > 0 && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgb(66, 66, 66)' }}>
                                    <span className="d-label" style={{ fontWeight: 500 }}>External EMI Adjustment</span>
                                    <span className="d-value" style={{ fontWeight: 750 }}>-{formatNumber(bank.nonSelectedEMI)}</span>
                                  </div>
                                )}
                                
                                {bank.details?.limitingFactor && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                                    <span className="d-label" style={{ color: 'rgb(66, 66, 66)', fontWeight: 500 }}>Limiting Parameter</span>
                                    <span className="d-value" style={{ color: '#F58220', fontWeight: 700 }}>{bank.details.limitingFactor}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </>
                    ) : (
                      <div className="rejected-body">
                        <div className="rejection-reason">
                          <span style={{ fontWeight: 'bold' }}>Exclusion:</span> {bank.reason || 'Criteria mismatch'}
                        </div>
                        {bank.category && (
                          <div className="rejected-meta" style={{ marginTop: '8px', color: 'rgb(66, 66, 66)', fontSize: '0.78rem' }}>
                            Identified Profile: Category {bank.category}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="details-grid">
                    <div className="detail">
                      <span className="detail-label">Monthly EMI</span>
                      <span className="detail-value" style={{ color: '#1E40AF' }}>{formatNumber(bank.monthlyEMI)}</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">ROI</span>
                      <span className="detail-value" style={{ color: '#F58220' }}>{bank.interestRate}%</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">Tenure</span>
                      <span className="detail-value" style={{ color: 'rgb(66, 66, 66)' }}>{bank.loanTenure}Y</span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Floating Submit Bar */}
      {eligibleBanks.length > 0 && (
        <div className="selection-submit-bar">
          <div>
            <div style={{ color: '#111827', fontWeight: 750, fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
              {selectedBanks.length} Bank{selectedBanks.length !== 1 ? 's' : ''} Selected
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
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
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            border: `2px solid ${submitStatus === 'success' ? '#16a34a' : '#ef4444'}`,
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '500px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            color: '#111827'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
              {submitStatus === 'success' ? '✅' : '❌'}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#111827', fontFamily: 'Outfit, sans-serif', fontWeight: 750 }}>
              {submitStatus === 'success' ? 'Application Received!' : 'Submission Failed'}
            </h3>
            <p style={{ color: '#4b5563', marginBottom: '30px', fontSize: '0.95rem' }}>
              {submitStatus === 'success' 
                ? 'Your preferred banks have been notified. Our customer support team will contact you shortly to process your application.'
                : 'There was an error communicating with our server. Please try again or contact support.'}
            </p>
            <button 
              onClick={() => setSubmitStatus(null)}
              style={{
                background: '#F58220',
                color: '#ffffff',
                border: 'none',
                padding: '12px 36px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
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
