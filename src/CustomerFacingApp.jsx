import React, { useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLoanForm from './components/CustomerLoanForm';
import CustomerResultsDisplay from './components/CustomerResultsDisplay';
import FuturisticLanding from './components/FuturisticLanding';
import AdminDashboard from './components/AdminDashboard';
import BlogHome from './components/BlogHome';
import BlogArticle from './components/BlogArticle';
import Navbar from './components/Navbar';
import { calculateLoanEligibility } from './services/realLoanService';
import { calculateBTWithCreditCards } from './services/btLoanService';
import { saveLead } from './services/leadService';
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
    setLoading(true);
    setError(null);
    setResults(null);
    // Store raw form data for lead capture
    if (rawFormData) lastFormDataRef.current = rawFormData;

    try {
      console.log('='.repeat(80));
      console.log('🚀 STARTING LOAN CALCULATION');
      console.log('='.repeat(80));
      console.log('📋 Input Data:', formData);
      console.log('⏱️  Start Time:', new Date().toLocaleTimeString());
      const startTime = performance.now();

      let calculationResults;

      const hasLoansForBT = formData.wantsBT && formData.loansForBT && formData.loansForBT.length > 0;
      const creditCardsInBT = hasLoansForBT ? formData.loansForBT.filter(loan => loan.type === 'Credit Card') : [];
      const personalLoansInBT = hasLoansForBT ? formData.loansForBT.filter(loan => loan.type !== 'Credit Card') : [];

      if (hasLoansForBT) {
        console.log('🔄 BT MODE DETECTED!');
        const existingLoans = personalLoansInBT.map(loan => ({
          loanName: loan.lender || 'Loan',
          emi: parseFloat(loan.monthlyEMI || 0),
          pos: parseFloat(loan.outstandingAmount || 0)
        }));
        const creditCards = creditCardsInBT.map(card => ({
          cardName: card.lender || 'Credit Card',
          outstandingAmount: parseFloat(card.creditLimitUsed || 0)
        }));
        const btData = {
          monthlyIncome: parseFloat(formData.monthlyIncome || 0),
          loanTenure: parseInt(formData.loanTenure || 5),
          category: formData.category || 'A',
          companyName: formData.companyName || '',
          creditScore: parseInt(formData.creditScore || 700),
          employmentType: formData.employmentType || 'salaried',
          existingLoans: existingLoans,
          creditCards: creditCards
        };
        calculationResults = await calculateBTWithCreditCards(btData);
      } else {
        console.log('💰 REGULAR LOAN CALCULATION');
        calculationResults = await calculateLoanEligibility(formData);
      }

      const endTime = performance.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`⏱️  TOTAL TIME TAKEN: ${timeTaken} seconds`);
      console.log('📊 Results from', calculationResults.length, 'banks');
      console.log('='.repeat(80));

      setResults(calculationResults);
      setMetadata(formData._metadata);

      // 🔴 Save lead to Google Sheets (silent, non-blocking)
      saveLead(lastFormDataRef.current || {}, formData);

      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } catch (err) {
      console.error('❌ ERROR:', err);
      setError('Failed to calculate loan eligibility. Please try again. Error: ' + err.message);
    } finally {
      setLoading(false);
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

  const handleHomeClick = () => {
    setShowForm(false);
    setResults(null);
    setMetadata(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showAdminDashboard) {
    return <AdminDashboard onBackToCustomer={handleBackToCustomer} />;
  }

  return (
    <div className="customer-facing-app">
      <Navbar onAdminClick={handleAdminClick} onHomeClick={handleHomeClick} />

      <Routes>
        <Route path="/" element={
          <>
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
          </>
        } />

        <Route path="/blog" element={<BlogHome />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
      </Routes>
    </div>
  );
}

export default CustomerFacingApp;

