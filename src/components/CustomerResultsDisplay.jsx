import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Building2, TrendingUp, Info, AlertCircle,
  Copy, Download, Share2, ArrowRight, CheckCircle2,
  Calendar, Wallet, Percent, Banknote, Briefcase, Zap, Star
} from 'lucide-react';
import './CustomerResultsDisplay.css';

const CustomerResultsDisplay = ({ results, metadata, onNewCalculation }) => {
  const [selectedBank, setSelectedBank] = useState(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Grouping banks by categories
  const recommendedBanks = results.filter(r => r.isEligible && r.maxLoanAmount >= 500000);
  const otherEligibleBanks = results.filter(r => r.isEligible && r.maxLoanAmount < 500000);
  const nonEligibleBanks = results.filter(r => !r.isEligible);

  const handleCopySummary = () => {
    const eligibleCount = results.filter(r => r.isEligible).length;
    const bestAmount = Math.max(...results.map(r => r.maxLoanAmount), 0);

    const text = `
LaxmiCredit Eligibility Report
----------------------------
Customer: ${metadata?.customerName || metadata?.name || 'Customer'}
Employment: ${metadata?.companyName || metadata?.employer || 'Not specified'}
Company Category: ${results.find(r => r.isEligible)?.category || 'N/A'}
Monthly Income: ₹${metadata?.monthlyIncome?.toLocaleString() || '0'}

SUMMARY:
• Banks Qualified: ${eligibleCount}
• Maximum Possible Loan: ₹${bestAmount.toLocaleString()}

Scan for detailed breakdowns at LaxmiCredit.
        `.trim();

    navigator.clipboard.writeText(text);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  return (
    <div className="results-container">
      {/* Header Section */}
      <motion.header
        className="results-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-status">
          <motion.div
            className="status-pulse"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>NEURAL VERIFICATION COMPLETE</span>
        </div>
        <h1>Analysis Results</h1>
        <p>Calculated across {results.length} institutional policies for {metadata?.customerName || metadata?.name || 'Customer'}</p>
      </motion.header>

      {/* Disclosure Alert - NEW PREMIUM STYLE */}
      <motion.div
        className="premium-disclosure-box"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="disclosure-glass-overlay" />
        <div className="disclosure-content">
          <div className="disclosure-top">
            <div className="disclosure-icon-wrap">
              <Info size={22} className="info-pulse" />
            </div>
            <h3>Policy Calculation Disclosure</h3>
          </div>
          <p>
            These results are derived from your salary, employer profile, and internal bank calculation logics.
            <strong> Note:</strong> If credit history (CIBIL) is low, it may significantly impact the final approval
            or loan terms at the bank's discretion.
          </p>
        </div>
      </motion.div>

      {/* Main Stats Summary */}
      <div className="summary-grid">
        <motion.div
          className="summary-stat-card glass"
          whileHover={{ scale: 1.02 }}
        >
          <div className="stat-icon amount"><Banknote /></div>
          <div className="stat-info">
            <span className="stat-label">Max Eligibility</span>
            <span className="stat-value">₹{Math.max(...results.map(r => r.maxLoanAmount), 0).toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div
          className="summary-stat-card glass"
          whileHover={{ scale: 1.02 }}
        >
          <div className="stat-icon count"><Building2 /></div>
          <div className="stat-info">
            <span className="stat-label">Banks Found</span>
            <span className="stat-value">{results.filter(r => r.isEligible).length} Eligible</span>
          </div>
        </motion.div>
      </div>

      {/* Eligible Banks Grid */}
      <section className="banks-section">
        <div className="section-title">
          <Percent size={18} />
          <h2>Eligible Loan Offers</h2>
        </div>

        <div className="banks-grid">
          {results.filter(r => r.isEligible).sort((a, b) => (b.maxLoanAmount || b.loanAmount || 0) - (a.maxLoanAmount || a.loanAmount || 0)).map((bank, index) => (
            <motion.div
              key={bank.bankName || bank.name}
              className={`bank-card glass ${selectedBank === (bank.bankName || bank.name) ? 'active' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setSelectedBank(selectedBank === (bank.bankName || bank.name) ? null : (bank.bankName || bank.name))}
            >
              <div className="bank-card-main">
                <div className="bank-brand">
                  <div className="bank-logo-sim">
                    {(bank.bankName || bank.name)?.charAt(0)}
                  </div>
                  <div className="bank-info">
                    <h3 className="bank-name">{bank.bankName || bank.name}</h3>
                    <span className="bank-type">Personal Loan</span>
                  </div>
                </div>

                <div className="loan-amount-box">
                  <span className="amount-label">MAX AMOUNT</span>
                  <span className="amount-value">₹{(bank.maxLoanAmount || bank.loanAmount || 0).toLocaleString()}</span>
                </div>

                <div className="bank-card-footer">
                  <div className="tenure-badge">
                    <Calendar size={14} /> 60 Months
                  </div>
                  <div className="view-details-trigger">
                    {selectedBank === (bank.bankName || bank.name) ? 'Hide Policy' : 'View Policy'}
                    <ChevronDown size={14} style={{ transform: selectedBank === (bank.bankName || bank.name) ? 'rotate(180deg)' : 'none' }} />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {selectedBank === (bank.bankName || bank.name) && (
                  <motion.div
                    className="bank-policy-drawer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="policy-grid">
                      <div className="policy-item">
                        <span className="p-label">Company Category</span>
                        <span className="p-badge-cat">{bank.category || 'B'}</span>
                      </div>
                      <div className="policy-item">
                        <span className="p-label">Min Interest</span>
                        <span className="p-value">{bank.interestRate}% </span>
                      </div>
                      <div className="policy-item">
                        <span className="p-label">Processing Fee</span>
                        <span className="p-value">0.5% - 1%</span>
                      </div>
                      <div className="policy-item">
                        <span className="p-label">Pre-payment</span>
                        <span className="p-value">Allowed after 12 EMIs</span>
                      </div>
                    </div>

                    <div className="calculation-breakdown">
                      <h4>Institutional Logic Breakdown</h4>
                      <div className="calc-steps">
                        <div className="calc-step">
                          <span>Multiplier Method</span>
                          <span>{bank.multiplier}x Gross Income</span>
                        </div>
                        <div className="calc-step">
                          <span>EMI Capping (FOIR)</span>
                          <span>{bank.foirPercentage * 100}% of Net</span>
                        </div>
                        <div className="calc-step total">
                          <span>Policy Limit Applied</span>
                          <span>₹{(bank.maxLoanAmount || bank.loanAmount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <button className="apply-btn-bank" onClick={(e) => {
                      e.stopPropagation();
                      alert(`Initiating application for ${bank.bankName || bank.name}...`);
                    }}>
                      Apply with {bank.bankName || bank.name} <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Non-Eligible Banks */}
      {nonEligibleBanks.length > 0 && (
        <section className="non-eligible-section">
          <div className="section-title gray">
            <AlertCircle size={18} />
            <h2>Did not meet criteria for</h2>
          </div>
          <div className="non-eligible-grid">
            {nonEligibleBanks.map(bank => (
              <div key={bank.bankName || bank.name} className="non-eligible-card glass">
                <span className="ne-name">{bank.bankName || bank.name}</span>
                <span className="ne-reason">Policy mismatch: {bank.rejectionReason || bank.reason || 'Criteria not met'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer Actions */}
      <div className="results-footer-actions">
        <motion.button
          className="btn-secondary"
          onClick={onNewCalculation}
          whileHover={{ x: -5 }}
        >
          Edit Data
        </motion.button>

        <div className="main-actions-group">
          <button className="btn-icon-label" onClick={handleCopySummary}>
            {showCopySuccess ? (
              <><CheckCircle2 size={18} color="#00ff88" /> Copied!</>
            ) : (
              <><Copy size={18} /> Copy Table</>
            )}
          </button>

          <button className="btn-primary-action" onClick={() => window.print()}>
            <Download size={20} />
            Download PDF report
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple ChevronDown for the trigger
const ChevronDown = ({ size, style }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.3s ease', ...style }}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default CustomerResultsDisplay;
