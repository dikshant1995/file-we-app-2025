import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerLoanForm from './components/CustomerLoanForm.jsx';
import CustomerResultsDisplay from './components/CustomerResultsDisplay.jsx';
import FuturisticLanding from './components/FuturisticLanding.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import { calculateLoanEligibility } from './services/realLoanService.js';
import { calculateBTWithCreditCards } from './services/btLoanService.js';
import { saveLead } from './services/leadService.js';
import './CustomerFacingApp.css';

function CustomerFacingApp() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // Store raw formData so saveLead can access name/mobile/loans
  const lastFormDataRef = useRef(null);

  const handleFormSubmit = async (formData, rawFormData) => {
    // TRACE 1: ENTER
    console.log('🏁 ENTRY: handleFormSubmit');
    setLoading(true);
    setError(null);
    setResults(null);
    if (rawFormData) lastFormDataRef.current = rawFormData;

    try {
      console.log('📋 Submission Payload:', formData);
      const hasLoansForBT = formData.wantsBT && formData.loansForBT && formData.loansForBT.length > 0;

      let calculationResults;

      if (hasLoansForBT) {
        console.log('🔄 BT PATH START');
        const personalLoansInBT = formData.loansForBT.filter(loan => loan.type !== 'Credit Card');
        const creditCardsInBT = formData.loansForBT.filter(loan => loan.type === 'Credit Card');

        const btData = {
          ...formData, // Spread to preserve all fields
          monthlyIncome: parseFloat(formData.monthlyIncome || 0),
          loanTenure: parseInt(formData.loanTenure || 5),
          existingLoans: personalLoansInBT.map(loan => ({
            loanName: loan.lender || 'Loan',
            emi: parseFloat(loan.monthlyEMI || 0),
            pos: parseFloat(loan.outstandingAmount || 0)
          })),
          creditCards: creditCardsInBT.map(card => ({
            cardName: card.lender || 'Credit Card',
            outstandingAmount: parseFloat(card.creditLimitUsed || 0)
          }))
        };

        console.log('⚙️ Calling calculateBTWithCreditCards...');
        calculationResults = await calculateBTWithCreditCards(btData);
        console.log('✅ BT PATH SUCCESS:', calculationResults.length, 'results');
      } else {
        console.log('💰 REGULAR PATH START');
        calculationResults = await calculateLoanEligibility(formData);
        console.log('✅ REGULAR PATH SUCCESS:', calculationResults.length, 'results');
      }

      if (!calculationResults || calculationResults.length === 0) {
        throw new Error('No results were returned from the analysis engine.');
      }

      setResults(calculationResults);
      setMetadata(formData._metadata);

      // Silent Lead Save
      saveLead(lastFormDataRef.current || {}, formData);

      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);

    } catch (err) {
      console.error('❌ SUBMISSION CRASH:', err);
      setError(err.message || 'An unexpected error occurred during analysis.');
      // SHOW ALERT FOR FROZEN FIX
      window.alert('Analysis Failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
      console.log('🏁 EXIT: handleFormSubmit');
    }
  };

  const handleNewCalculation = () => {
    setResults(null);
    setMetadata(null);
    setError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    setShowForm(true);
    // Scroll to top so the form page starts from the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminClick = () => {
    setShowAdminDashboard(true);
  };

  const handleBackToCustomer = () => {
    setShowAdminDashboard(false);
  };

  if (showAdminDashboard) {
    return <AdminDashboard onBackToCustomer={handleBackToCustomer} />;
  }

  return (
    <div className="customer-facing-app">

      {/* PAGE 1: Landing — shown when form not yet opened and no results */}
      {!showForm && !results && (
        <FuturisticLanding onGetStarted={handleGetStarted} onAdminClick={handleAdminClick} />
      )}

      {/* PAGE 2: Application Form — full page replacement */}
      {showForm && !results && (
        <div
          className="form-page"
          style={{ animation: 'formFadeIn 0.35s ease-out forwards' }}
        >
          {/* Form Page Navbar */}
          <nav className="form-page-nav">
            <button className="form-back-btn" onClick={() => { setShowForm(false); window.scrollTo({ top: 0 }); }}>
              ← Back
            </button>
            <div className="form-nav-brand">
              <span className="text-glow">LoanAI Model</span>
              <span className="ai-badge">MODEL v2</span>
            </div>
            <div className="form-nav-status">
              <span className="dot"></span> AI Engine Active
            </div>
          </nav>



          {/* Header */}
          <div className="form-section-header">
            <div className="form-section-badge">
              <span className="dot"></span>
              Analyzing 12+ Banks
            </div>
            <h2 className="form-section-title">
              Personal Loan <span className="gradient-text-ai">Eligibility Check</span>
            </h2>
            <h3 className="form-section-subtitle-new" style={{ color: '#00d2ff', marginTop: '10px', fontSize: '1.2rem', fontWeight: '600' }}>
              Institutional Eligibility Analysis
            </h3>
            <p className="form-section-subtitle">
              Fill in your details — our AI will calculate your best offers instantly
            </p>
          </div>

          {/* Form wrapped in glass */}
          <div className="form-glass-wrapper">
            <CustomerLoanForm onSubmit={handleFormSubmit} loading={loading} />
          </div>

          {/* Error */}
          {error && (
            <div className="error-container">
              <div className="error-message">⚠️ {error}</div>
              <button onClick={() => setError(null)} className="btn-retry">Try Again</button>
            </div>
          )}
        </div>
      )}

      {/* PAGE 3: Results */}
      {results && (
        <div id="results-section">
          <CustomerResultsDisplay
            results={results}
            metadata={metadata}
            onNewCalculation={handleNewCalculation}
          />
        </div>
      )}
    </div>
  );
}

export default CustomerFacingApp;
