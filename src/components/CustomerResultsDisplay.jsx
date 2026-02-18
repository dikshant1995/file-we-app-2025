import { useState } from 'react';
import './CustomerResultsDisplay.css';

const CustomerResultsDisplay = ({ results, metadata }) => {
  const [sortBy, setSortBy] = useState('loanAmount'); // loanAmount, emi, bank
  const [filterEligible, setFilterEligible] = useState('all'); // all, eligible, rejected
  const [selectedBanks, setSelectedBanks] = useState([]); // Array of selected bank names

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

  // Handle submit
  const handleSubmitSelection = () => {
    if (selectedBanks.length === 0) {
      alert('Please select at least one bank to proceed!');
      return;
    }
    
    const bankList = selectedBanks.join(', ');
    alert('Your application will be processed with: ' + bankList + '. We will contact you shortly!');
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
    <div className="customer-results-display">
      {/* Results Header */}
      <div className="results-header">
        <h2>🎉 Your Loan Eligibility Results</h2>
        <p>Based on your profile, here are offers from 12 banks</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-value">{stats.eligibleCount}/{stats.totalBanks}</div>
          <div className="stat-label">Banks Approved</div>
        </div>

        {bestOffer && (
          <>
            <div className="stat-card highlight">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{formatCurrency(bestOffer.loanAmount)}</div>
              <div className="stat-label">Best Offer ({bestOffer.bankName})</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💳</div>
              <div className="stat-value">{formatNumber(bestOffer.monthlyEMI)}</div>
              <div className="stat-label">Best Offer EMI</div>
            </div>
          </>
        )}

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{formatCurrency(stats.avgLoanAmount)}</div>
          <div className="stat-label">Average Loan Amount</div>
        </div>
      </div>

      {/* Best Offer Highlight */}
      {bestOffer && (
        <div className="best-offer-card">
          <div className="best-offer-badge">🏆 BEST OFFER</div>
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
        <h3>📋 All Bank Offers</h3>
        
        <div className="banks-grid">
          {(filterEligible === 'eligible' ? sortedEligibleBanks : 
            filterEligible === 'rejected' ? rejectedBanks : 
            [...sortedEligibleBanks, ...rejectedBanks]).map((bank, index) => (
            <div 
              key={index} 
              className={`bank-card ${bank.eligible ? 'eligible' : 'rejected'} ${bank === bestOffer ? 'best' : ''}`}
            >
              {bank === bestOffer && <div className="best-badge">🏆 Best</div>}
              
              <div className="bank-card-header">
                <h4>{bank.bankName}</h4>
                <div className={`status-badge ${bank.eligible ? 'approved' : 'rejected'}`}>
                  {bank.eligible ? '✅ Approved' : '❌ Rejected'}
                </div>
              </div>

              {bank.eligible ? (
                <div className="bank-card-body">
                  {/* BALANCE TRANSFER MODE - SPECIAL DISPLAY */}
                  {(bank.isBTMode || bank.btType === 'BT_WITH_CREDIT_CARDS' || bank.btType === 'BT_WITH_CC_OBLIGATION') ? (
                    <div className="bt-mode-display">
                      <div className="bt-badge">🔄 Balance Transfer Mode</div>
                      
                      <div className="bt-breakdown">
                        <div className="bt-item highlight">
                          <span className="bt-label">🏛️ Max Loan Amount</span>
                          <span className="bt-value">{formatCurrency(bank.loanAmount)}</span>
                          <span className="bt-subtitle">Total loan bank can offer</span>
                        </div>
                        
                        <div className="bt-divider">-</div>
                        
                        <div className="bt-item">
                          <span className="bt-label">💸 BT Outstanding Amount</span>
                          <span className="bt-value danger">{formatCurrency(bank.totalDebtCleared || bank.btTotalOutstanding)}</span>
                          <span className="bt-subtitle">
                            Goes to clear your {bank.loansConsolidated || bank.numberOfLoansConsolidated || 0} loan{(bank.loansConsolidated || bank.numberOfLoansConsolidated) > 1 ? 's' : ''}
                            {bank.numberOfCreditCardsCleared > 0 && ` + ${bank.numberOfCreditCardsCleared} credit card${bank.numberOfCreditCardsCleared > 1 ? 's' : ''}`}
                          </span>
                        </div>
                        
                        <div className="bt-divider">=</div>
                        
                        <div className="bt-item highlight-green">
                          <span className="bt-label">💵 Fresh Amount (Cash in Hand)</span>
                          <span className="bt-value success">{formatCurrency(bank.freshAmountDisbursed)}</span>
                          <span className="bt-subtitle">✅ Actual cash you receive!</span>
                        </div>
                      </div>

                      {/* BT Income Adjustment Info */}
                      <div className="bt-income-info">
                        <div className="bt-income-item">
                          <span>📊 Original Income:</span>
                          <strong>{formatNumber(bank.originalIncome)}</strong>
                        </div>
                        {bank.nonBTLoansEMI > 0 && (
                          <>
                            <div className="bt-income-item">
                              <span>⚠️ Non-BT Loans EMI:</span>
                              <strong className="danger">-{formatNumber(bank.nonBTLoansEMI)}</strong>
                            </div>
                            <div className="bt-income-item">
                              <span>🟢 Adjusted Income for BT:</span>
                              <strong className="success">{formatNumber(bank.adjustedIncome)}</strong>
                            </div>
                          </>
                        )}
                        {/* CREDIT CARD OBLIGATION DISPLAY */}
                        {bank.creditCardObligation > 0 && (
                          <div className="bt-credit-card-section" style={{ 
                            marginTop: '15px', 
                            padding: '12px', 
                            background: '#fff3cd', 
                            borderRadius: '6px',
                            border: '2px solid #ffc107'
                          }}>
                            <div style={{ fontSize: '0.9em', fontWeight: '600', marginBottom: '8px', color: '#856404' }}>
                              💳 Credit Card Obligation
                            </div>
                            <div className="bt-income-item">
                              <span>Credit Card Outstanding:</span>
                              <strong className="danger">{formatNumber(bank.creditCardOutstanding || (bank.creditCardObligation / 0.05))}</strong>
                            </div>
                            <div className="bt-income-item">
                              <span>Monthly Obligation (5%):</span>
                              <strong className="danger">-{formatNumber(bank.creditCardObligation)}</strong>
                            </div>
                            {bank.creditCardObligationNote && (
                              <div style={{ fontSize: '0.85em', color: '#856404', marginTop: '6px', fontStyle: 'italic' }}>
                                ℹ️ {bank.creditCardObligationNote}
                              </div>
                            )}
                          </div>
                        )}
                        {bank.creditCardObligation === 0 && (bank.isBTMode || bank.btType === 'BT_WITH_CREDIT_CARDS') && bank.numberOfCreditCardsCleared > 0 && (
                          <div className="bt-credit-card-section" style={{ 
                            marginTop: '15px', 
                            padding: '12px', 
                            background: '#d4edda', 
                            borderRadius: '6px',
                            border: '2px solid #28a745'
                          }}>
                            <div style={{ fontSize: '0.9em', fontWeight: '600', marginBottom: '8px', color: '#155724' }}>
                              💳 Credit Cards Cleared
                            </div>
                            <div className="bt-income-item">
                              <span>✅ Cards Included in BT:</span>
                              <strong className="success">{bank.numberOfCreditCardsCleared} card(s)</strong>
                            </div>
                            <div className="bt-income-item">
                              <span>✅ Total CC Outstanding Cleared:</span>
                              <strong className="success">{formatNumber(bank.totalCreditCardCleared || 0)}</strong>
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#155724', marginTop: '6px', fontStyle: 'italic' }}>
                              ✅ All selected credit card debts will be fully cleared
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CREDIT CARD BT CALCULATION BREAKDOWN */}
                      {bank.numberOfCreditCardsCleared > 0 && bank.totalCreditCardOutstanding > 0 && (
                        <div className="credit-card-calculation-breakdown" style={{
                          marginTop: '20px',
                          padding: '16px',
                          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                          borderRadius: '8px',
                          border: '2px solid #667eea'
                        }}>
                          <h6 style={{ color: '#4c51bf', marginBottom: '12px', fontSize: '1em', fontWeight: '600' }}>
                            💳 Credit Card Balance Transfer Calculation
                          </h6>
                          
                          <div style={{ background: 'white', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
                            <div style={{ fontSize: '0.85em', color: '#4a5568', marginBottom: '10px', fontWeight: '600' }}>
                              📊 How Your Credit Card Debt is Consolidated:
                            </div>
                            
                            {/* Step 1: Current Situation */}
                            <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.85em', color: '#2d3748', marginBottom: '6px', fontWeight: '600' }}>
                                1️⃣ Current Credit Card Debt:
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px' }}>
                                <span className="step-label">Outstanding Amount:</span>
                                <span className="step-value"><strong style={{ color: '#e53e3e' }}>{formatNumber(bank.totalCreditCardOutstanding)}</strong></span>
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px' }}>
                                <span className="step-label">Current Interest Rate:</span>
                                <span className="step-value"><strong style={{ color: '#e53e3e' }}>42% p.a.</strong></span>
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px' }}>
                                <span className="step-label">Monthly Interest (42%/12):</span>
                                <span className="step-value"><strong style={{ color: '#e53e3e' }}>{formatNumber(Math.round(bank.totalCreditCardOutstanding * 0.42 / 12))}</strong></span>
                              </div>
                              <div style={{ marginLeft: '20px', fontSize: '0.8em', color: '#c53030', marginTop: '4px', fontStyle: 'italic' }}>
                                ⚠️ At 42% interest, you're paying ₹{Math.round(bank.totalCreditCardOutstanding * 0.42 / 12).toLocaleString()}/month just in interest!
                              </div>
                            </div>

                            {/* Step 2: BT Solution */}
                            <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.85em', color: '#2d3748', marginBottom: '6px', fontWeight: '600' }}>
                                2️⃣ Balance Transfer Solution:
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px' }}>
                                <span className="step-label">Transfer to Personal Loan:</span>
                                <span className="step-value"><strong style={{ color: '#38a169' }}>{formatNumber(bank.totalCreditCardOutstanding)}</strong></span>
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px' }}>
                                <span className="step-label">New Interest Rate:</span>
                                <span className="step-value"><strong style={{ color: '#38a169' }}>11% p.a.</strong></span>
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px' }}>
                                <span className="step-label">Monthly Interest (11%/12):</span>
                                <span className="step-value"><strong style={{ color: '#38a169' }}>{formatNumber(Math.round(bank.totalCreditCardOutstanding * 0.11 / 12))}</strong></span>
                              </div>
                              <div style={{ marginLeft: '20px', fontSize: '0.8em', color: '#22543d', marginTop: '4px', fontStyle: 'italic' }}>
                                ✅ New monthly interest reduced to just ₹{Math.round(bank.totalCreditCardOutstanding * 0.11 / 12).toLocaleString()}!
                              </div>
                            </div>

                            {/* Step 3: Monthly Savings */}
                            <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.85em', color: '#2d3748', marginBottom: '6px', fontWeight: '600' }}>
                                3️⃣ Interest Savings:
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px' }}>
                                <span className="step-label">Old Monthly Interest (42%):</span>
                                <span className="step-value"><strong style={{ color: '#e53e3e' }}>{formatNumber(Math.round(bank.totalCreditCardOutstanding * 0.42 / 12))}</strong></span>
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px' }}>
                                <span className="step-label">New Monthly Interest (11%):</span>
                                <span className="step-value"><strong style={{ color: '#38a169' }}>{formatNumber(Math.round(bank.totalCreditCardOutstanding * 0.11 / 12))}</strong></span>
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px', background: '#f0fff4', padding: '8px', borderRadius: '4px', border: '2px solid #38a169' }}>
                                <span className="step-label">💰 Monthly Interest Saved:</span>
                                <span className="step-value"><strong style={{ color: '#22543d', fontSize: '1.1em' }}>{formatNumber(Math.round(bank.totalCreditCardOutstanding * 0.42 / 12 - bank.totalCreditCardOutstanding * 0.11 / 12))}</strong></span>
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px', background: '#f0fff4', padding: '8px', borderRadius: '4px', border: '2px solid #38a169' }}>
                                <span className="step-label">📅 Annual Interest Saved:</span>
                                <span className="step-value"><strong style={{ color: '#22543d', fontSize: '1.1em' }}>{formatNumber(Math.round((bank.totalCreditCardOutstanding * 0.42 / 12 - bank.totalCreditCardOutstanding * 0.11 / 12) * 12))}</strong></span>
                              </div>
                            </div>

                            {/* Step 4: Total Calculation */}
                            <div style={{ background: '#edf2f7', padding: '12px', borderRadius: '6px' }}>
                              <div style={{ fontSize: '0.85em', color: '#2d3748', marginBottom: '6px', fontWeight: '600' }}>
                                4️⃣ Total Debt Consolidated:
                              </div>
                              {bank.totalPersonalLoanPOS > 0 && (
                                <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px' }}>
                                  <span className="step-label">Personal Loans Outstanding:</span>
                                  <span className="step-value"><strong>{formatNumber(bank.totalPersonalLoanPOS)}</strong></span>
                                </div>
                              )}
                              <div className="calc-step" style={{ marginLeft: '20px', marginBottom: '4px' }}>
                                <span className="step-label">+ Credit Card Outstanding:</span>
                                <span className="step-value"><strong>{formatNumber(bank.totalCreditCardOutstanding)}</strong></span>
                              </div>
                              <div className="calc-step" style={{ marginLeft: '20px', marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #4c51bf' }}>
                                <span className="step-label" style={{ fontSize: '1.05em' }}>= Total Debt Cleared:</span>
                                <span className="step-value"><strong style={{ color: '#4c51bf', fontSize: '1.2em' }}>{formatNumber(bank.totalDebtCleared)}</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Key Benefits Summary */}
                          <div style={{ background: '#f0fff4', padding: '12px', borderRadius: '6px', border: '1px solid #38a169' }}>
                            <div style={{ fontSize: '0.9em', fontWeight: '600', color: '#22543d', marginBottom: '8px' }}>
                              🎯 Key Benefits of Credit Card BT:
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#22543d', lineHeight: '1.6' }}>
                              ✅ Interest rate reduced from <strong>42%</strong> to <strong>11%</strong> (31% savings!)<br/>
                              ✅ Save <strong>{formatNumber(Math.round((bank.totalCreditCardOutstanding * 0.42 / 12 - bank.totalCreditCardOutstanding * 0.11 / 12) * 12))}</strong> per year in interest<br/>
                              ✅ Fixed EMI of <strong>{formatNumber(bank.newSingleEMI || bank.monthlyEMI)}</strong> for {bank.loanTenure} years<br/>
                              ✅ Clear all {bank.numberOfCreditCardsCleared} credit card{bank.numberOfCreditCardsCleared > 1 ? 's' : ''} completely<br/>
                              ✅ Single EMI instead of multiple credit card payments
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="main-amount">
                      <span className="label">Loan Amount</span>
                      <span className="amount">{formatCurrency(bank.loanAmount)}</span>
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
                      <h5>📊 Calculation Method: <strong>{bank.calculationMethod}</strong></h5>
                      
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
                              <span className="step-value"><strong>₹{metadata.averageIncentive ? parseFloat(metadata.averageIncentive).toLocaleString('en-IN', {maximumFractionDigits: 0}) : '0'}</strong></span>
                            </div>
                            <div className="calc-step result" style={{ background: bank.incentivePercentage > 0 ? '#e8f5e9' : '#ffebee' }}>
                              <span className="step-label">Bank's Incentive Policy:</span>
                              <span className="step-value"><strong style={{ color: bank.incentivePercentage > 0 ? '#2e7d32' : '#c62828' }}>{((bank.incentivePercentage || 0) * 100).toFixed(0)}%</strong></span>
                            </div>
                            <div className="calc-step result">
                              <span className="step-label">Incentive Amount Considered:</span>
                              <span className="step-value"><strong>₹{metadata.averageIncentive ? (parseFloat(metadata.averageIncentive) * (bank.incentivePercentage || 0)).toLocaleString('en-IN', {maximumFractionDigits: 0}) : '0'}</strong></span>
                            </div>
                            
                            {/* SALARY BREAKDOWN */}
                            <div style={{ marginTop: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                              <div style={{ fontSize: '0.9em', fontWeight: '600', marginBottom: '8px', color: '#495057' }}>📊 Salary Breakdown:</div>
                              <div className="calc-step" style={{ marginBottom: '4px' }}>
                                <span className="step-label">Basic Salary (Old):</span>
                                <span className="step-value"><strong>₹{metadata.basicSalary ? parseFloat(metadata.basicSalary).toLocaleString('en-IN', {maximumFractionDigits: 0}) : '0'}</strong></span>
                              </div>
                              <div className="calc-step" style={{ marginBottom: '4px', color: '#28a745' }}>
                                <span className="step-label">+ Incentive Added ({((bank.incentivePercentage || 0) * 100).toFixed(0)}% of ₹{metadata.averageIncentive ? parseFloat(metadata.averageIncentive).toLocaleString('en-IN', {maximumFractionDigits: 0}) : '0'}):</span>
                                <span className="step-value"><strong style={{ color: '#28a745' }}>+₹{metadata.averageIncentive ? (parseFloat(metadata.averageIncentive) * (bank.incentivePercentage || 0)).toLocaleString('en-IN', {maximumFractionDigits: 0}) : '0'}</strong></span>
                              </div>
                              <div className="calc-step highlight" style={{ borderTop: '2px solid #28a745', paddingTop: '8px', marginTop: '8px' }}>
                                <span className="step-label">Effective Salary (New):</span>
                                <span className="step-value"><strong style={{ fontSize: '1.1em', color: '#155724' }}>₹{metadata.basicSalary ? (parseFloat(metadata.basicSalary) + (parseFloat(metadata.averageIncentive || 0) * (bank.incentivePercentage || 0))).toLocaleString('en-IN', {maximumFractionDigits: 0}) : '0'}</strong></span>
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

                  {/* BALANCE TRANSFER INFO */}
                  {bank.btConfig && (
                    <div className="bt-info">
                      <h5>🔄 Balance Transfer Support:</h5>
                      <div className="bt-details">
                        {bank.btConfig.isAvailable ? (
                          <>
                            <div className="bt-available">✅ BT Available</div>
                            <div>✓ Max loans for BT: <strong>{bank.btConfig.maxLoansForBT}</strong></div>
                            <div>✓ Accepts Fintech loans: <strong>{bank.btConfig.acceptsFintechLoans ? 'Yes' : 'No'}</strong></div>
                            {bank.btConfig.description && (
                              <div className="bt-desc">{bank.btConfig.description}</div>
                            )}
                          </>
                        ) : (
                          <div className="bt-not-available">❌ BT Not Available</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CATEGORY & EMPLOYMENT INFO */}
                  {bank.category && (
                    <div className="category-info">
                      <h5>📋 Applicant Classification:</h5>
                      <div className="category-details">
                        <div>✓ Category: <strong>{bank.category}</strong></div>
                        {bank.employmentType && (
                          <div>✓ Employment: <strong>{bank.employmentType}</strong></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bank-card-body rejected-body">
                  <div className="rejection-reason">
                    <span className="reason-icon">ℹ️</span>
                    <span className="reason-text">{bank.reason || 'Not eligible'}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {eligibleBanks.length > 0 && (
        <div className="comparison-section">
          <h3>📊 Quick Comparison Table</h3>
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
                      {bank === bestOffer && '🏆 '}
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
                  <>🎯 <strong>{selectedBanks.length}</strong> bank{selectedBanks.length > 1 ? 's' : ''} selected</>
                ) : (
                  <>ℹ️ Please select at least one bank from the table above</>
                )}
              </span>
            </div>
            <button 
              className="table-submit-btn"
              onClick={handleSubmitSelection}
              disabled={selectedBanks.length === 0}
            >
              🚀 Proceed with Selected Banks ({selectedBanks.length})
            </button>
          </div>
        </div>
      )}

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
