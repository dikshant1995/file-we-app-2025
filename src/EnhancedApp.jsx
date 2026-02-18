import { useState } from 'react';
import './App.css';
import EnhancedUserInputForm from './components/EnhancedUserInputForm';
import EnhancedResultsDisplay from './components/EnhancedResultsDisplay';
import { calculateAllScenarios } from './services/enhancedLoanService';

function EnhancedApp() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const calculationResults = await calculateAllScenarios(formData);
      setResults(calculationResults);
    } catch (err) {
      setError('Failed to calculate loan scenarios. Please try again. Error: ' + err.message);
      console.error('Error calculating loan scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear results when form is reset
  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="App">
      <header>
        <h1>🏦 Comprehensive Loan Eligibility Tool</h1>
        <p>Compare Fresh Loans, Full BT, and Partial BT scenarios in one place</p>
      </header>
      
      <main>
        {!results ? (
          <>
            <EnhancedUserInputForm onSubmit={handleFormSubmit} onReset={handleReset} />
            
            {loading && (
              <div className="loading">
                ⏳ Calculating all loan scenarios from 12 banks...
              </div>
            )}
            
            {error && (
              <div className="error">
                {error}
              </div>
            )}
          </>
        ) : (
          <EnhancedResultsDisplay results={results} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}

export default EnhancedApp;