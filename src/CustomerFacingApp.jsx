import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerLoanForm from './components/CustomerLoanForm.jsx';
import CustomerResultsDisplay from './components/CustomerResultsDisplay.jsx';
import FuturisticLanding from './components/FuturisticLanding.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
// import NeuralChatBot from './components/NeuralChatBot.jsx';
import { calculateLoanEligibility } from './services/realLoanService.js';
import { calculateBTWithCreditCards } from './services/btLoanService.js';
import { saveLead } from './services/leadService.js';
import { aiPredictionService } from './services/aiPredictionService.js';
import { neuralExplainerService } from './services/neuralExplainerService.js';
import { syncAllBankConfigsFromCloud } from './services/bankConfigService.js';
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
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('laxmi_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [savedFormData, setSavedFormData] = useState(() => {
    try {
      const cached = localStorage.getItem('laxmi_last_form_data');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Initialize AI Brain & Sync Bank Policies from Cloud Firestore
  React.useEffect(() => {
    aiPredictionService.initialize();
    syncAllBankConfigsFromCloud();
  }, []);
  // Store raw formData so saveLead can access name/mobile/loans
  const lastFormDataRef = useRef(null);

  const handleFormSubmit = async (submissionData, rawFormData) => {
    setLoading(true);
    setError(null);
    setResults(null);

    // Form unified reliable customer data object
    const combinedData = {
      ...(rawFormData || {}),
      ...(submissionData || {}),
      ...(submissionData?._metadata || {}),
      customerName: rawFormData?.customerName || submissionData?.customerName || submissionData?._metadata?.customerName || 'Customer',
      mobileNumber: rawFormData?.mobileNumber || submissionData?.mobileNumber || submissionData?._metadata?.mobileNumber || '',
      companyName: rawFormData?.companyName || submissionData?.companyName || submissionData?._metadata?.companyName || 'LaxmiCredit',
      category: rawFormData?.category || submissionData?.category || submissionData?._metadata?.category || 'B',
      basicSalary: rawFormData?.basicSalary || submissionData?.basicSalary || 0,
      age: rawFormData?.age || submissionData?.age || '',
      city: rawFormData?.city || submissionData?.city || '',
      state: rawFormData?.state || submissionData?.state || '',
      maritalStatus: rawFormData?.maritalStatus || submissionData?.maritalStatus || '',
      livingStatus: rawFormData?.livingStatus || submissionData?.livingStatus || '',
      salaryMode: rawFormData?.salaryMode || submissionData?.salaryMode || 'bank',
      existingLoans: rawFormData?.existingLoans || submissionData?.existingLoans || submissionData?._metadata?.existingLoans || []
    };

    setSavedFormData(combinedData);
    lastFormDataRef.current = combinedData;
    try {
      localStorage.setItem('laxmi_last_form_data', JSON.stringify(combinedData));
    } catch (e) {}

    // Save lead into database immediately on "Check Eligibility"
    try {
      await saveLead(combinedData, submissionData);
    } catch (saveErr) {
      console.warn('Non-blocking lead save notice:', saveErr);
    }

    try {
      console.log('='.repeat(80));
      console.log('🚀 STARTING LOAN CALCULATION');
      console.log('='.repeat(80));
      console.log('📋 Input Data:', submissionData);
      console.log('⏱️  Start Time:', new Date().toLocaleTimeString());
      const startTime = performance.now();

      let calculationResults;

      const hasLoansForBT = submissionData.wantsBT && submissionData.loansForBT && submissionData.loansForBT.length > 0;
      const creditCardsInBT = hasLoansForBT ? submissionData.loansForBT.filter(loan => loan.type === 'Credit Card') : [];
      const personalLoansInBT = hasLoansForBT ? submissionData.loansForBT.filter(loan => loan.type !== 'Credit Card') : [];

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
          basicSalary: parseFloat(submissionData.basicSalary || 0),
          averageIncentive: parseFloat(submissionData.averageIncentive || 0),
          monthlyIncome: parseFloat(submissionData.monthlyIncome || 0),
          loanTenure: parseInt(submissionData.loanTenure || 5),
          category: submissionData.category || 'A',
          companyName: submissionData.companyName || '',
          creditScore: parseInt(submissionData.creditScore || 700),
          employmentType: submissionData.employmentType || 'salaried',
          existingEMI: parseFloat(submissionData.existingEMI || 0),
          creditCardObligation: parseFloat(submissionData.creditCardObligation || 0),
          existingLoans: existingLoans,
          creditCards: creditCards
        };
        calculationResults = await calculateBTWithCreditCards(btData);
      } else {
        console.log('💰 REGULAR LOAN CALCULATION');
        calculationResults = await calculateLoanEligibility(submissionData);
      }

      const endTime = performance.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`⏱️  TOTAL TIME TAKEN: ${timeTaken} seconds`);
      console.log('📊 Results from', calculationResults.length, 'banks');
      console.log('='.repeat(80));

      setResults(calculationResults);
      setMetadata(combinedData);
      try {
        window.history.pushState({ view: 'results' }, '', window.location.href);
      } catch (e) {}

      // --- 🧠 AI NEURAL PREDICTION (SAFE WRAPPER) ---
      try {
        if (!hasLoansForBT) {
          const salary = parseFloat(submissionData.basicSalary) || parseFloat(submissionData.monthlyIncome) || 0;
          const score = parseInt(submissionData.creditScore) || 700;
          const tenure = parseInt(submissionData.loanTenure) || 5;
          
          const aiPrediction = aiPredictionService.predict(salary, score, tenure);
          if (aiPrediction) {
            setAiResult(aiPrediction);
            const insight = neuralExplainerService.generateInsight(aiPrediction, calculationResults, submissionData);
            setAiInsight(insight);
            console.log('🔮 AI Neural Insights generated successfully.');
          }
        }
      } catch (aiErr) {
        console.warn('⚠️ AI Prediction failed, but calculator is fine:', aiErr);
      }

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
    if (adminUser) {
      window.history.pushState({ view: 'admin' }, '', window.location.pathname);
      setShowAdminDashboard(true);
    } else {
      setShowAdminLoginModal(true);
    }
  };

  const handleAdminLoginSuccess = (userProfile) => {
    setAdminUser(userProfile);
    try {
      localStorage.setItem('laxmi_admin_user', JSON.stringify(userProfile));
    } catch (e) {}
    setShowAdminLoginModal(false);
    window.history.pushState({ view: 'admin' }, '', window.location.pathname);
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
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const location = useLocation();
  const navigate = useNavigate();
  const isMasterPortal = location.pathname === '/';

  // Automatically scroll to top and open application form directly when visiting /personal-loan
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (location.pathname === '/personal-loan') {
      setShowForm(true);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 50);
    } else if (location.pathname === '/') {
      setShowForm(false);
      setResults(null);
    }
  }, [location.pathname]);

  // Handle browser BACK button (from Admin Dashboard to Home, or from Results to Form)
  React.useEffect(() => {
    const handlePopState = () => {
      if (showAdminDashboard) {
        setShowAdminDashboard(false);
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (results) {
        setResults(null);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showAdminDashboard, results, navigate]);

  if (showAdminDashboard) {
    return <AdminDashboard initialUser={adminUser} onBackToCustomer={handleBackToCustomer} />;
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


          {/* Unified Single Platform Form */}
          <CustomerLoanForm 
            onSubmit={handleFormSubmit} 
            loading={loading} 
            initialData={savedFormData}
            onBackToHome={() => { setShowForm(false); setResults(null); navigate('/'); window.scrollTo({ top: 0 }); }} 
          />

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

      {/* Admin Login Modal (Website remains visible in background) */}
      {showAdminLoginModal && (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onBack={() => setShowAdminLoginModal(false)}
        />
      )}
    </div>
  );
}

export default CustomerFacingApp;
