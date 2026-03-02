import { useState } from 'react';
import { compareBTResults, generateComparisonMessage } from '../services/btComparisonService';
import './BTResultsDisplay.css';

const BTResultsDisplay = ({ results, onReset }) => {
  const [showDetailedComparison, setShowDetailedComparison] = useState(false);

  // Get comprehensive comparison
  const comparison = compareBTResults(results);
  const message = generateComparisonMessage(comparison);

  // Check if credit cards were consolidated
  const bestBank = results.filter(r => r.isEligible).sort((a, b) => b.freshAmountDisbursed - a.freshAmountDisbursed)[0];
  const hasCreditCards = bestBank && bestBank.numberOfCreditCardsCleared > 0;
  const creditCardOutstanding = hasCreditCards ? bestBank.totalCreditCardOutstanding : 0;

  if (!comparison.hasEligibleBanks) {
    return (
      <div className="bt-results-display">
        <div className="no-results">
          <h2>❌ {message.title}</h2>
          <p className="error-message">{message.message}</p>

          <div className="suggestions">
            <h3>💡 Suggestions to Improve Eligibility:</h3>
            <ul>
              {message.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          <div className="rejection-details">
            <h3>Rejection Reasons by Bank:</h3>
            {comparison.rejectionReasons.map((rejection, index) => (
              <div key={index} className="rejection-item">
                <strong>{rejection.bankName}:</strong> {rejection.reason}
              </div>
            ))}
          </div>

          <button className="reset-btn" onClick={onReset}>Try Again</button>
        </div>
      </div>
    );
  }

  const { recommendations, savingsComparison, bankRankings, eligibleCount, totalBanks } = comparison;

  return (
    <div className="bt-results-display">
      {/* Header */}
      <div className="results-header">
        <h2>🏆 Balance Transfer Comparison Results</h2>
        <p className="subtitle">{eligibleCount} of {totalBanks} banks eligible • Smart recommendations based on your priorities</p>
        <button className="reset-btn" onClick={onReset}>New Calculation</button>
      </div>

      {/* Credit Card Savings Banner - NEW! */}
      {hasCreditCards && creditCardOutstanding > 0 && (
        <div className="credit-card-savings-banner">
          <div className="cc-banner-header">
            <h3>💳 CREDIT CARD DEBT CONSOLIDATION - MASSIVE SAVINGS!</h3>
            <p className="cc-tagline">You're breaking free from the 42% interest trap!</p>
          </div>

          <div className="cc-savings-grid">
            {/* Before */}
            <div className="cc-before">
              <h4>❌ BEFORE (Credit Card Trap)</h4>
              <div className="cc-stat">
                <span className="cc-label">Total CC Debt:</span>
                <span className="cc-value danger">₹{creditCardOutstanding.toLocaleString()}</span>
              </div>
              <div className="cc-stat">
                <span className="cc-label">Interest Rate:</span>
                <span className="cc-value danger">42% per year</span>
              </div>
              <div className="cc-stat">
                <span className="cc-label">Monthly Interest:</span>
                <span className="cc-value danger">₹{Math.round((creditCardOutstanding * 42) / 1200).toLocaleString()}</span>
              </div>
              <div className="cc-stat">
                <span className="cc-label">Cards Cleared:</span>
                <span className="cc-value">{bestBank.numberOfCreditCardsCleared} card(s)</span>
              </div>
              <p className="cc-warning">⚠️ Minimum payment trap - could take 20-50 years to clear!</p>
            </div>

            {/* Arrow */}
            <div className="cc-arrow">
              <div className="arrow-symbol">→</div>
              <div className="arrow-text">CONVERTED TO</div>
            </div>

            {/* After */}
            <div className="cc-after">
              <h4>✅ AFTER (Personal Loan Freedom)</h4>
              <div className="cc-stat">
                <span className="cc-label">Same Debt:</span>
                <span className="cc-value success">₹{creditCardOutstanding.toLocaleString()}</span>
              </div>
              <div className="cc-stat">
                <span className="cc-label">New Interest Rate:</span>
                <span className="cc-value success">11% per year</span>
              </div>
              <div className="cc-stat">
                <span className="cc-label">Monthly Interest:</span>
                <span className="cc-value success">₹{Math.round((creditCardOutstanding * 11) / 1200).toLocaleString()}</span>
              </div>
              <div className="cc-stat">
                <span className="cc-label">Debt Freedom:</span>
                <span className="cc-value success">Fixed timeline!</span>
              </div>
              <p className="cc-success">✅ Clear path to debt freedom with fixed EMI!</p>
            </div>
          </div>

          {/* Savings Highlight */}
          <div className="cc-total-savings">
            <div className="savings-row">
              <span className="savings-label">💰 Interest Reduction:</span>
              <span className="savings-value">73% (42% → 11%)</span>
            </div>
            <div className="savings-row">
              <span className="savings-label">💵 Monthly Interest Saved:</span>
              <span className="savings-value">₹{Math.round(((creditCardOutstanding * 42) / 1200) - ((creditCardOutstanding * 11) / 1200)).toLocaleString()}</span>
            </div>
            <div className="savings-row mega">
              <span className="savings-label">🎉 YEARLY SAVINGS:</span>
              <span className="savings-value">₹{Math.round((((creditCardOutstanding * 42) / 1200) - ((creditCardOutstanding * 11) / 1200)) * 12).toLocaleString()}</span>
            </div>
          </div>

          <p className="cc-footer">🏆 <strong>YOU'RE FREE FROM THE CREDIT CARD TRAP!</strong> No more minimum payment cycles. Fixed repayment schedule. Clear debt freedom timeline.</p>
        </div>
      )}

      {/* Top Recommendations */}
      <div className="top-recommendations">
        <h3>🎯 Top Recommendations</h3>

        {/* Best Overall */}
        <div className="recommendation-card overall-best">
          <div className="card-header" style={{ backgroundColor: recommendations.bestOverall.badgeColor }}>
            <span className="medal">👑</span>
            <h4>{recommendations.bestOverall.metric}</h4>
            <span className="score">Score: {Math.round(recommendations.bestOverall.score)}/100</span>
          </div>
          <div className="card-body">
            <h5 className="bank-name">{recommendations.bestOverall.bank.bankName}</h5>
            <div className="metric-value">{recommendations.bestOverall.value}</div>
            <p className="advantage">✓ {recommendations.bestOverall.advantage}</p>
            <p className="why-text">{recommendations.bestOverall.why}</p>

            {recommendations.bestOverall.scoreBreakdown && (
              <div className="score-breakdown">
                <div className="score-item">
                  <span>Fresh Funds</span>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${recommendations.bestOverall.scoreBreakdown.freshScore}%` }}></div>
                  </div>
                  <span>{recommendations.bestOverall.scoreBreakdown.freshScore}/100</span>
                </div>
                <div className="score-item">
                  <span>Low EMI</span>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${recommendations.bestOverall.scoreBreakdown.emiScore}%` }}></div>
                  </div>
                  <span>{recommendations.bestOverall.scoreBreakdown.emiScore}/100</span>
                </div>
                <div className="score-item">
                  <span>Interest Rate</span>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${recommendations.bestOverall.scoreBreakdown.rateScore}%` }}></div>
                  </div>
                  <span>{recommendations.bestOverall.scoreBreakdown.rateScore}/100</span>
                </div>
              </div>
            )}

            <div className="bank-details">
              <div className="detail-item">
                <span className="label">Fresh Funds</span>
                <span className="value">₹{recommendations.bestOverall.bank.freshAmountDisbursed.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Monthly EMI</span>
                <span className="value">₹{(recommendations.bestOverall.bank.newSingleEMI || recommendations.bestOverall.bank.newBTLoanEMI).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Interest Rate</span>
                <span className="value">{recommendations.bestOverall.bank.interestRate}%</span>
              </div>

              {/* Credit Card & Loan Breakdown - NEW! */}
              {(recommendations.bestOverall.bank.totalPersonalLoanPOS > 0 || recommendations.bestOverall.bank.totalCreditCardOutstanding > 0) && (
                <>
                  <div className="detail-item breakdown-header">
                    <span className="label" style={{ fontWeight: 'bold', color: '#007bff' }}>💰 Debt Breakdown:</span>
                    <span className="value" style={{ fontWeight: 'bold', color: '#007bff' }}>₹{(recommendations.bestOverall.bank.totalDebtCleared || (recommendations.bestOverall.bank.totalPersonalLoanPOS + recommendations.bestOverall.bank.totalCreditCardOutstanding)).toLocaleString()}</span>
                  </div>
                  {recommendations.bestOverall.bank.totalPersonalLoanPOS > 0 && (
                    <div className="detail-item sub-item">
                      <span className="label">  └ Personal Loans POS</span>
                      <span className="value">₹{recommendations.bestOverall.bank.totalPersonalLoanPOS.toLocaleString()}</span>
                    </div>
                  )}
                  {recommendations.bestOverall.bank.totalCreditCardOutstanding > 0 && (
                    <div className="detail-item sub-item">
                      <span className="label">  └ Credit Cards Debt</span>
                      <span className="value" style={{ color: '#ff6b6b' }}>₹{recommendations.bestOverall.bank.totalCreditCardOutstanding.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Other Top Picks */}
        <div className="other-recommendations">
          {/* Best for Fresh Funds */}
          <div className="recommendation-card">
            <div className="card-header" style={{ backgroundColor: recommendations.bestForFreshFunds.badgeColor }}>
              <span className="medal">💰</span>
              <h4>{recommendations.bestForFreshFunds.metric}</h4>
            </div>
            <div className="card-body">
              <h5 className="bank-name">{recommendations.bestForFreshFunds.bank.bankName}</h5>
              <div className="metric-value">{recommendations.bestForFreshFunds.value}</div>
              <p className="advantage">✓ {recommendations.bestForFreshFunds.advantage}</p>
              <p className="why-text-small">{recommendations.bestForFreshFunds.why.substring(0, 150)}...</p>
            </div>
          </div>

          {/* Best for Low EMI */}
          <div className="recommendation-card">
            <div className="card-header" style={{ backgroundColor: recommendations.bestForLowEMI.badgeColor }}>
              <span className="medal">📉</span>
              <h4>{recommendations.bestForLowEMI.metric}</h4>
            </div>
            <div className="card-body">
              <h5 className="bank-name">{recommendations.bestForLowEMI.bank.bankName}</h5>
              <div className="metric-value">{recommendations.bestForLowEMI.value}</div>
              <p className="advantage">✓ {recommendations.bestForLowEMI.advantage}</p>
              <p className="why-text-small">{recommendations.bestForLowEMI.why.substring(0, 150)}...</p>
            </div>
          </div>

          {/* Best for Low Interest */}
          <div className="recommendation-card">
            <div className="card-header" style={{ backgroundColor: recommendations.bestForLowInterest.badgeColor }}>
              <span className="medal">📊</span>
              <h4>{recommendations.bestForLowInterest.metric}</h4>
            </div>
            <div className="card-body">
              <h5 className="bank-name">{recommendations.bestForLowInterest.bank.bankName}</h5>
              <div className="metric-value">{recommendations.bestForLowInterest.value}</div>
              <p className="advantage">✓ {recommendations.bestForLowInterest.advantage}</p>
              <p className="why-text-small">{recommendations.bestForLowInterest.why.substring(0, 150)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Rankings */}
      <div className="bank-rankings">
        <h3>🏅 Bank Rankings</h3>
        <div className="rankings-grid">
          {/* By Fresh Funds */}
          <div className="ranking-column">
            <h4>💰 By Fresh Funds</h4>
            <ol>
              {bankRankings.byFreshFunds.slice(0, 5).map((item) => (
                <li key={item.bankName}>
                  <span className="rank-medal">{item.medal}</span>
                  <span className="rank-bank">{item.bankName}</span>
                  <span className="rank-value">{item.value}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* By EMI */}
          <div className="ranking-column">
            <h4>📉 By Lowest EMI</h4>
            <ol>
              {bankRankings.byEMI.slice(0, 5).map((item) => (
                <li key={item.bankName}>
                  <span className="rank-medal">{item.medal}</span>
                  <span className="rank-bank">{item.bankName}</span>
                  <span className="rank-value">{item.value}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Note about Interest Rate */}
          <div className="ranking-column">
            <h4>📊 Interest Rate</h4>
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              <p style={{ fontSize: '32px', marginBottom: '10px' }}>11%</p>
              <p style={{ fontSize: '14px' }}>All banks use the same 11% interest rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Toggle */}
      <div className="detailed-comparison-toggle">
        <button
          className="toggle-btn"
          onClick={() => setShowDetailedComparison(!showDetailedComparison)}
        >
          {showDetailedComparison ? '▼ Hide' : '▶ Show'} Detailed Comparison Table
        </button>
      </div>

      {/* Detailed Comparison Table */}
      {showDetailedComparison && (
        <div className="detailed-comparison">
          <h3>📊 Detailed Bank Comparison</h3>

          {/* Add debt breakdown summary if credit cards present */}
          {hasCreditCards && creditCardOutstanding > 0 && (
            <div className="debt-summary-box" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>💼 Total Debt Cleared</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{(bestBank.totalDebtCleared || (bestBank.totalPersonalLoanPOS + bestBank.totalCreditCardOutstanding)).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>📊 Personal Loans POS</div>
                <div style={{ fontSize: '20px', fontWeight: '600' }}>₹{bestBank.totalPersonalLoanPOS.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>💳 Credit Cards Debt</div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#ffd43b' }}>₹{bestBank.totalCreditCardOutstanding.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>🎯 Cards Consolidated</div>
                <div style={{ fontSize: '20px', fontWeight: '600' }}>{bestBank.numberOfCreditCardsCleared} cards</div>
              </div>
            </div>
          )}

          <div className="comparison-table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Bank Name</th>
                  <th>Fresh Funds (₹)</th>
                  <th>Monthly EMI (₹)</th>
                  <th>Interest Rate (%)</th>
                  <th>Total Interest (₹)</th>
                  <th>Total Payment (₹)</th>
                </tr>
              </thead>
              <tbody>
                {savingsComparison.allBanks
                  .sort((a, b) => b.freshFunds - a.freshFunds)
                  .map((bank, index) => (
                    <tr key={bank.bankName} className={index === 0 ? 'highlight-row' : ''}>
                      <td>{index + 1}</td>
                      <td><strong>{bank.bankName}</strong></td>
                      <td className="amount-cell">₹{bank.freshFunds.toLocaleString()}</td>
                      <td>₹{bank.emi.toLocaleString()}</td>
                      <td>{bank.interestRate}%</td>
                      <td className="interest-cell">₹{bank.totalInterest.toLocaleString()}</td>
                      <td>₹{bank.totalPayment.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Savings Insight */}
          <div className="savings-insight">
            <h4>💡 Interest Cost Insight</h4>
            <p>
              <strong>{savingsComparison.lowestInterestCost.bankName}</strong> has the lowest total interest cost of
              <strong> ₹{savingsComparison.lowestInterestCost.totalInterest.toLocaleString()}</strong>, while
              <strong> {savingsComparison.highestInterestCost.bankName}</strong> has the highest at
              <strong> ₹{savingsComparison.highestInterestCost.totalInterest.toLocaleString()}</strong>.
            </p>
            <p className="savings-amount">
              Potential Savings: <strong>₹{savingsComparison.interestDifference.toLocaleString()}</strong> by choosing the right bank!
            </p>
          </div>
        </div>
      )}

      {/* Rejected Banks (if any) */}
      {comparison.rejectedBanks.length > 0 && (
        <div className="rejected-banks">
          <h3>❌ Banks That Rejected ({comparison.rejectedBanks.length})</h3>
          <div className="rejected-grid">
            {comparison.rejectedBanks.map((rejection, index) => (
              <div key={index} className="rejected-item">
                <strong>{rejection.bankName}</strong>
                <p>{rejection.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BTResultsDisplay;
