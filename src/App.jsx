import React, { useState, useRef } from 'react';
import axios from 'axios';
import { calculateABB, extractEmiDeductions } from './utils/abbCalculator';
import { downloadExcel } from './utils/exportToExcel';
import AbbAnalyzer from './components/AbbAnalyzer';
import PolicyAdmin from './components/PolicyAdmin';
import EligibilityChecker from './components/EligibilityChecker';
import { Building2, ShieldCheck, Activity, ArrowLeft } from 'lucide-react';
import './index.css';

function App() {
  const [view, setView] = useState('checker'); // 'checker', 'analyzer', or 'admin'
  
  // ABB Analyzer States: Refactored to dynamic bank partitions
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, files: [], password: '', bank_name: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [abbData, setAbbData] = useState(null);
  const [proprietorName, setProprietorName] = useState('');
  const [sisterFirms, setSisterFirms] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [sanctionedLimit, setSanctionedLimit] = useState('');

  // Handlers for ABB Analyzer
  // Handlers moved/refactored for multi-account dynamic states
  const handleProcess = async () => {
    const activeAccounts = bankAccounts.filter(acc => acc.files && acc.files.length > 0);
    if (activeAccounts.length === 0) {
      setError("Please select at least one statement to begin.");
      return;
    }
    setLoading(true); setError('');
    const formData = new FormData();
    
    // Partition serialization: Pack each bank's files and specific password
    activeAccounts.forEach((acc, index) => {
      acc.files.forEach(f => {
        formData.append(`file_${index}`, f);
      });
      if (acc.password) {
        formData.append(`password_${index}`, acc.password);
      }
      if (acc.bank_name) {
        formData.append(`bank_name_${index}`, acc.bank_name);
      }
    });
    
    try {
      const apiBase = import.meta.env.VITE_API_URL || (window.location.origin.includes('localhost') ? 'http://localhost:8000' : '/api-bl');
      const response = await axios.post(`${apiBase}/api/upload-statement`, formData);
      if (response.data.status === 'success') {
        const { dataset_1, dataset_2, dataset_3, metadata, risk_assessment, accounts } = response.data.data;
        const config = { accountType, sanctionedLimit: parseFloat(sanctionedLimit || 0) };
        const calculated = calculateABB(dataset_1, config, accounts);
        setResults({ dataset_1, dataset_2, dataset_3, metadata, risk_assessment, config, accounts });
        setAbbData(calculated);
      } else { setError(response.data.message); }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="app-shell animate-fade-in">
      <nav className="navbar flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 p-4">
        <div className="flex w-full md:w-auto items-center justify-between gap-4">
          <div className="nav-brand flex items-center gap-2">
            <div className="nav-logo-box">
              <Building2 size={24} />
            </div>
            <span className="text-xl font-extrabold gradient-text">ABB PRO</span>
          </div>
          <a 
            href="/" 
            className="btn btn-ghost flex items-center gap-1 whitespace-nowrap"
            style={{ 
              padding: '0.2rem 0.5rem', 
              fontSize: '0.7rem', 
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textDecoration: 'none',
              opacity: 0.8
            }}
          >
            <ArrowLeft size={12} /> Exit
          </a>
        </div>

        <div className="nav-tabs flex w-full md:w-auto justify-between gap-2 overflow-x-auto">
          <button 
            onClick={() => setView('checker')}
            className={`nav-btn flex-1 md:flex-none justify-center whitespace-nowrap ${view === 'checker' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} /> <span className="text-xs sm:text-sm">Eligibility</span>
          </button>
          <button 
            onClick={() => setView('analyzer')}
            className={`nav-btn flex-1 md:flex-none justify-center whitespace-nowrap ${view === 'analyzer' ? 'active' : ''}`}
          >
            <Activity size={16} /> <span className="text-xs sm:text-sm">Analyzer</span>
          </button>
          <button 
            onClick={() => setView('admin')}
            className={`nav-btn flex-1 md:flex-none justify-center whitespace-nowrap ${view === 'admin' ? 'active' : ''}`}
          >
            <Building2 size={16} /> <span className="text-xs sm:text-sm">Admin</span>
          </button>
        </div>
      </nav>

      <main className="container p-8">
        {view === 'checker' && <EligibilityChecker />}
        {view === 'analyzer' && (
          <AbbAnalyzer 
            bankAccounts={bankAccounts} setBankAccounts={setBankAccounts} loading={loading} error={error}
            results={results} abbData={abbData} proprietorName={proprietorName}
            sisterFirms={sisterFirms} accountType={accountType}
            sanctionedLimit={sanctionedLimit} handleProcess={handleProcess} setProprietorName={setProprietorName}
            setSisterFirms={setSisterFirms} setAccountType={setAccountType}
            setSanctionedLimit={setSanctionedLimit} downloadExcel={downloadExcel}
          />
        )}
        {view === 'admin' && <PolicyAdmin />}
      </main>
    </div>
  );
}

export default App;

// App State Update Complete
