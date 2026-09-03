import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerLoanForm from './components/CustomerLoanForm.jsx';
import CustomerResultsDisplay from './components/CustomerResultsDisplay.jsx';
import FuturisticLanding from './components/FuturisticLanding.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
// import NeuralChatBot from './components/NeuralChatBot.jsx';
import { calculateLoanEligibility } from './services/realLoanService.js';
import { calculateBTWithCreditCards } from './services/btLoanService.js';
import { saveLead } from './services/leadService.js';
import { aiPredictionService } from './services/aiPredictionService.js';
import { neuralExplainerService } from './services/neuralExplainerService.js';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import BlogHome from './components/BlogHome.jsx';
import BlogArticle from './components/BlogArticle.jsx';
import MainMasterPortal from './components/MainMasterPortal.jsx';
import './CustomerFacingApp.css';
import { useLocation } from 'react-router-dom';

function CustomerFacingApp() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);

  // Initialize AI Brain
  React.useEffect(() => {
    aiPredictionService.initialize();
  }, []);
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
          basicSalary: parseFloat(formData.basicSalary || 0),
          averageIncentive: parseFloat(formData.averageIncentive || 0),
          monthlyIncome: parseFloat(formData.monthlyIncome || 0),
          loanTenure: parseInt(formData.loanTenure || 5),
          category: formData.category || 'A',
          companyName: formData.companyName || '',
          creditScore: parseInt(formData.creditScore || 700),
          employmentType: formData.employmentType || 'salaried',
          existingEMI: parseFloat(formData.existingEMI || 0),
          creditCardObligation: parseFloat(formData.creditCardObligation || 0),
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

      // --- 🧠 AI NEURAL PREDICTION (SAFE WRAPPER) ---
      try {
        if (!hasLoansForBT) {
          const salary = parseFloat(formData.basicSalary) || parseFloat(formData.monthlyIncome) || 0;
          const score = parseInt(formData.creditScore) || 700;
          const tenure = parseInt(formData.loanTenure) || 5;
          
          const aiPrediction = aiPredictionService.predict(salary, score, tenure);
          if (aiPrediction) {
            setAiResult(aiPrediction);
            const insight = neuralExplainerService.generateInsight(aiPrediction, calculationResults, formData);
            setAiInsight(insight);
            console.log('🔮 AI Neural Insights generated successfully.');
          }
        }
      } catch (aiErr) {
        console.warn('⚠️ AI Prediction failed, but calculator is fine:', aiErr);
      }

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
    setAiResult(null);
    setAiInsight(null);
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

  const handleHomeClick = () => {
    setShowForm(false);
    setResults(null);
    setMetadata(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCustomer = () => {
    setShowAdminDashboard(false);
  };

  const location = useLocation();
  const navigate = useNavigate();
  const isMasterPortal = location.pathname === '/';

  // Automatically open application form directly when visiting /personal-loan
  React.useEffect(() => {
    if (location.pathname === '/personal-loan') {
      setShowForm(true);
    } else if (location.pathname === '/') {
      setShowForm(false);
      setResults(null);
    }
  }, [location.pathname]);

  if (showAdminDashboard) {
    return <AdminDashboard onBackToCustomer={handleBackToCustomer} />;
  }

  return (
    <div className="customer-facing-app">
      {!isMasterPortal && <Navbar onAdminClick={handleAdminClick} onHomeClick={handleHomeClick} />}
      {/* <NeuralChatBot aiResult={aiResult} aiInsight={aiInsight} userData={lastFormDataRef.current} /> */}

      <Routes>
        <Route path="/" element={<MainMasterPortal onAdminClick={handleAdminClick} />} />
        <Route path="/personal-loan" element={
          <>
      {/* PAGE 1: Application Form — direct page replacement without intermediate landing */}
      {(showForm || !results) && !results && (
        <div
          className="form-page"
          style={{ animation: 'formFadeIn 0.35s ease-out forwards' }}
        >


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
                  aiResult={aiResult}
                  aiInsight={aiInsight}
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
