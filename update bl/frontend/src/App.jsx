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
    { id: 1, files: [], password: '' }
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
    });
    
    try {
      const apiBase = import.meta.env.VITE_API_URL || (window.location.origin.includes('localhost') ? 'http://localhost:8000' : '/api-bl');
      const response = await axios.post(`${apiBase}/api/upload-statement`, formData);
      if (response.data.status === 'success') {
        const { dataset_1, dataset_2, dataset_3, metadata } = response.data.data;
        const config = { accountType, sanctionedLimit: parseFloat(sanctionedLimit || 0) };
        const calculated = calculateABB(dataset_1, config);
        setResults({ dataset_1, dataset_2, dataset_3, metadata, config });
        setAbbData(calculated);
      } else { setError(response.data.message); }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="app-shell animate-fade-in">
      <nav className="navbar flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="nav-brand">
            <div className="nav-logo-box">
              <Building2 size={24} />
            </div>
            <span className="text-xl font-extrabold gradient-text">ABB PRO</span>
          </div>
          <a 
            href="/" 
            className="btn btn-ghost flex items-center gap-2"
            style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.75rem', 
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Hub</span>
          </a>
        </div>

        <div className="nav-tabs flex">
          <button 
            onClick={() => setView('checker')}
            className={`nav-btn ${view === 'checker' ? 'active' : ''}`}
          >
            <ShieldCheck size={18} /> Eligibility
          </button>
          <button 
            onClick={() => setView('analyzer')}
            className={`nav-btn ${view === 'analyzer' ? 'active' : ''}`}
          >
            <Activity size={18} /> Analyzer
          </button>
          <button 
            onClick={() => setView('admin')}
            className={`nav-btn ${view === 'admin' ? 'active' : ''}`}
          >
            <Building2 size={18} /> Admin
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
