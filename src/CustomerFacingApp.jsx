import React, { useState } from 'react';
import CustomerLoanForm from './components/CustomerLoanForm';
import CustomerResultsDisplay from './components/CustomerResultsDisplay';
import FuturisticLanding from './components/FuturisticLanding';
import AdminDashboard from './components/AdminDashboard';
import { calculateLoanEligibility } from './services/realLoanService';
import { calculateBTWithCreditCards } from './services/btLoanService';
import './CustomerFacingApp.css';

function CustomerFacingApp() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('='.repeat(80));
      console.log('🚀 STARTING LOAN CALCULATION');
      console.log('='.repeat(80));
      console.log('📋 Input Data:', formData);
      console.log('⏱️  Start Time:', new Date().toLocaleTimeString());
      const startTime = performance.now();
      
      let calculationResults;
      
      // Check if this is a BT calculation
      const hasLoansForBT = formData.wantsBT && formData.loansForBT && formData.loansForBT.length > 0;
      
      // Check for credit cards in BT
      const creditCardsInBT = hasLoansForBT ? formData.loansForBT.filter(loan => loan.type === 'Credit Card') : [];
      const personalLoansInBT = hasLoansForBT ? formData.loansForBT.filter(loan => loan.type !== 'Credit Card') : [];
      
      if (hasLoansForBT) {
        console.log('🔄 BT MODE DETECTED!');
        console.log('  - Total Loans for BT:', formData.loansForBT.length);
        console.log('  - Personal Loans:', personalLoansInBT.length);
        console.log('  - Credit Cards:', creditCardsInBT.length);
        
        // Prepare BT data
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
        
        console.log('📊 BT CALCULATION DATA:');
        console.log('  Existing Loans:', existingLoans);
        console.log('  Credit Cards:', creditCards);
        console.log('  Total Loan POS:', existingLoans.reduce((sum, l) => sum + l.pos, 0));
        console.log('  Total CC Outstanding:', creditCards.reduce((sum, c) => sum + c.outstandingAmount, 0));
        console.log('  TOTAL DEBT:', existingLoans.reduce((sum, l) => sum + l.pos, 0) + creditCards.reduce((sum, c) => sum + c.outstandingAmount, 0));
        
        // Call BT calculation with credit cards
        calculationResults = await calculateBTWithCreditCards(btData);
      } else {
        console.log('💰 REGULAR LOAN CALCULATION');
        // Call regular loan calculation
        calculationResults = await calculateLoanEligibility(formData);
      }
      
      const endTime = performance.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log('⏱️  End Time:', new Date().toLocaleTimeString());
      console.log(`⏱️  TOTAL TIME TAKEN: ${timeTaken} seconds`);
      console.log('📊 Results from', calculationResults.length, 'banks');
      console.log('✅ Eligible:', calculationResults.filter(r => r.eligible).length);
      console.log('❌ Rejected:', calculationResults.filter(r => !r.eligible).length);
      console.log('='.repeat(80));
      
      // Store results and metadata
      setResults(calculationResults);
      setMetadata(formData._metadata);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } catch (err) {
      console.error('❌ ERROR:', err);
      console.error('❌ ERROR STACK:', err.stack);
      console.error('❌ ERROR MESSAGE:', err.message);
      setError('Failed to calculate loan eligibility. Please try again. Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCalculation = () => {
    setResults(null);
    setMetadata(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    // Scroll to form section
    const formSection = document.querySelector('.form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAdminClick = () => {
    setShowAdminDashboard(true);
  };

  const handleBackToCustomer = () => {
    setShowAdminDashboard(false);
  };

  // If admin dashboard is active, show only that
  if (showAdminDashboard) {
    return <AdminDashboard onBackToCustomer={handleBackToCustomer} />;
  }

  return (
    <div className="customer-facing-app">
      {/* Landing Page - Always Visible */}
      {!results && (
        <FuturisticLanding onGetStarted={handleGetStarted} onAdminClick={handleAdminClick} />
      )}

      {/* Main Content */}
      <main className="app-main">
        {/* Form Section */}
        {!results && (
          <>
            <section className="form-section">
              <CustomerLoanForm onSubmit={handleFormSubmit} loading={loading} />
            </section>
            
            {/* Hero Section - Moved below form */}
            <section className="hero-section">
              <div className="hero-content">
                <div className="instant-badge">⚡ Instant Approval</div>
                <h1>Get The Best Personal Loan</h1>
                <p className="hero-subtitle">Compare offers from 12+ leading banks in seconds</p>
                
                <div className="feature-cards">
                  <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <div className="feature-text">
                      <div className="feature-title">Instant</div>
                      <div className="feature-desc">Results</div>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">💰</div>
                    <div className="feature-text">
                      <div className="feature-title">11% Fixed</div>
                      <div className="feature-desc">Interest Rate</div>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🏦</div>
                    <div className="feature-text">
                      <div className="feature-title">12+ Banks</div>
                      <div className="feature-desc">Compared</div>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🔄</div>
                    <div className="feature-text">
                      <div className="feature-title">Balance</div>
                      <div className="feature-desc">Transfer</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Error Display */}
        {error && (
          <section className="error-section">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button onClick={handleNewCalculation} className="btn-retry">
                Try Again
              </button>
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <section className="loading-section">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <h3>🔄 Calculating Your Eligibility...</h3>
              <p>Checking with all 12 banks. This will take just a moment.</p>
              <div className="loading-progress">
                <div className="progress-bar"></div>
              </div>
            </div>
          </section>
        )}

        {/* Results Section */}
        {results && !loading && (
          <section id="results-section" className="results-section">
            <CustomerResultsDisplay results={results} metadata={metadata} />
            
            <div className="new-calculation-section">
              <button onClick={handleNewCalculation} className="btn-new-calculation">
                🔄 Calculate Again
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>🔒 Your data is secure and used only for loan calculation</p>
          <p>💡 All interest rates are fixed at 11% as per policy</p>
          <p>📞 For assistance, contact your nearest bank branch</p>
        </div>
      </footer>
    </div>
  );
}

export default CustomerFacingApp;
