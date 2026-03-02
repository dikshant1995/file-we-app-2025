import React, { useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLoanForm from './components/CustomerLoanForm';
import CustomerResultsDisplay from './components/CustomerResultsDisplay';
import FuturisticLanding from './components/FuturisticLanding';
import AdminDashboard from './components/AdminDashboard';
import BlogHome from './components/BlogHome';
import BlogArticle from './components/BlogArticle';
import Navbar from './components/Navbar';
import {
  calculateLoanEligibility,
  saveLead
} from './services';
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
      console.log('🚀 INITIALIZING EXHAUSTIVE LOAN CALCULATION');
      console.log('='.repeat(80));

      const startTime = performance.now();

      // Calculation Engine (Standard and BT combined)
      const calculationResults = await calculateLoanEligibility(formData);

      const endTime = performance.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`⏱️  TOTAL ENGINE EXECUTION: ${timeTaken} seconds`);
      console.log('📊 Analyzed', calculationResults.length, 'bank results');
      console.log('='.repeat(80));

      setResults(calculationResults);
      setMetadata(formData._metadata);

      // Find max eligibility for lead capture
      const validResults = calculationResults.filter(r => r.isEligible && !r.error);
      const bestOffer = validResults.length > 0
        ? validResults.reduce((prev, current) => (prev.maxLoanAmount > current.maxLoanAmount) ? prev : current)
        : null;

      if (bestOffer) {
        formData.maxEligibility = bestOffer.maxLoanAmount;
        formData.bestBank = bestOffer.bankName;
      }

      // 🔴 Save lead to Google Sheets (silent, non-blocking via proxy)
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
                  userData={metadata}
                  onBack={handleNewCalculation}
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

