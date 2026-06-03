import { useState, useEffect } from 'react'
import './App.css'
import UserInputForm from './components/UserInputForm.jsx'
import ResultsDisplay from './components/ResultsDisplay.jsx'
import BTResultsDisplay from './components/BTResultsDisplay.jsx'
import DebugInfo from './components/DebugInfo.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import { calculateLoanEligibility } from './services/realLoanService.js'
import { calculateBTWithCreditCards } from './services/btLoanService.js'
import { aiPredictionService } from './services/aiPredictionService.js'

function App() {
  const [userData, setUserData] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [aiResult, setAiResult] = useState(null)

  // Initialize AI Brain
  useEffect(() => {
    aiPredictionService.initialize();
  }, []);

  const handleFormSubmit = async (data) => {
    setUserData(data);
    setLoading(true);
    setError(null);

    try {
      let loanResults;

      // Check if it's a BT calculation
      if (data.calculationType === 'bt') {
        // Prepare BT data
        const btData = {
          monthlyIncome: data.monthlyIncome ? parseFloat(data.monthlyIncome) : 0,
          loanTenure: data.loanTenure ? parseInt(data.loanTenure) : 5,
          category: data.category || 'A',
          companyName: data.companyName || '',
          creditScore: data.creditScore ? parseInt(data.creditScore) : 700,
          employmentType: data.employmentType || 'salaried',
          existingLoans: (data.existingLoans || []).map(loan => ({
            loanName: loan.loanName || '',
            emi: loan.emi ? parseFloat(loan.emi) : 0,
            pos: loan.pos ? parseFloat(loan.pos) : 0
          })),
          creditCards: (data.creditCards || []).map(card => ({
            cardName: card.cardName || '',
            outstandingAmount: card.outstandingAmount ? parseFloat(card.outstandingAmount) : 0
          }))
        };

        // DEBUG: Log the BT data
        console.log('🔍 BT CALCULATION DATA:');
        console.log('  Existing Loans:', btData.existingLoans);
        console.log('  Credit Cards:', btData.creditCards);
        console.log('  Total Loan POS:', btData.existingLoans.reduce((sum, l) => sum + l.pos, 0));
        console.log('  Total CC Outstanding:', btData.creditCards.reduce((sum, c) => sum + c.outstandingAmount, 0));
        console.log('  TOTAL DEBT:',
          btData.existingLoans.reduce((sum, l) => sum + l.pos, 0) +
          btData.creditCards.reduce((sum, c) => sum + c.outstandingAmount, 0)
        );

        loanResults = await calculateBTWithCreditCards(btData);
      } else {
        // Regular loan calculation
        loanResults = await calculateLoanEligibility(data);
      }

      setResults(loanResults);

      // --- 🧠 AI NEURAL PREDICTION ---
      if (data.calculationType !== 'bt') {
        const salary = parseFloat(data.basicSalary) || parseFloat(data.monthlyIncome) || 0;
        const score = parseInt(data.creditScore) || 700;
        const tenure = parseInt(data.loanTenure) || 5;
        
        const aiPrediction = aiPredictionService.predict(salary, score, tenure);
        console.log('🔮 AI Neural Prediction:', aiPrediction);
        setAiResult(aiPrediction);
      }
    } catch (err) {
      setError('Failed to calculate loan eligibility. Please try again. Error: ' + err.message);
      console.error('Error calculating loan eligibility:', err);
    } finally {
      setLoading(false);
    }
  }

  // Clear results when form is reset
  const handleReset = () => {
    setUserData(null)
    setResults([])
    setError(null)
  }

  return (
    <div className="App">
      {showAdminDashboard ? (
        <AdminDashboard />
      ) : (
        <>
          <header>
            <h1>🏦 Loan Eligibility Tool</h1>
            <p>Compare loan offers across 12 banks with real calculation rules</p>
            <p className="feature-highlight">✨ Now with Balance Transfer (BT) - Consolidate loans & get fresh funds!</p>
            <button
              onClick={() => setShowAdminDashboard(true)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ⚙️ Admin Dashboard
            </button>
          </header>

          <main>
            <UserInputForm onSubmit={handleFormSubmit} onReset={handleReset} />

            {loading && (
              <div className="loading">
                ⏳ Calculating {userData?.calculationType === 'bt' ? 'BT offers' : 'offers'} from 12 banks...
              </div>
            )}

            {error && <div className="error">{error}</div>}

            {results.length > 0 && (
              userData?.calculationType === 'bt' ? (
                <BTResultsDisplay results={results} onReset={handleReset} />
              ) : (
                <ResultsDisplay results={results} onReset={handleReset} aiResult={aiResult} />
              )
            )}

            {process.env.NODE_ENV === 'development' && (
              <DebugInfo userData={userData} results={results} />
            )}
          </main>
        </>
      )}
    </div>
  )
}

export default App