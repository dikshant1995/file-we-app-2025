import React, { useState, useRef } from 'react';
import axios from 'axios';
import { calculateABB, extractEmiDeductions } from './utils/abbCalculator';
import { downloadExcel } from './utils/exportToExcel';
import AbbAnalyzer from './components/AbbAnalyzer';
import PolicyAdmin from './components/PolicyAdmin';
import EligibilityChecker from './components/EligibilityChecker';
import AdminLogin from './components/AdminLogin';
import { Building2, ShieldCheck, Activity, ArrowLeft } from 'lucide-react';
import './index.css';

function App() {
  const [view, setView] = useState('checker'); // 'checker', 'analyzer', or 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  // ABB Analyzer States
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [abbData, setAbbData] = useState(null);
  const [proprietorName, setProprietorName] = useState('');
  const [sisterFirms, setSisterFirms] = useState('');
  const [pdfPassword, setPdfPassword] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [sanctionedLimit, setSanctionedLimit] = useState('');
  const fileInputRef = useRef(null);

  // Handlers for ABB Analyzer
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); };
  const handleChange = (e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); };
  
  const handleProcess = async () => {
    if (!file) return;
    setLoading(true); setError('');
    const formData = new FormData();
    formData.append('file', file);
    if (pdfPassword) formData.append('password', pdfPassword);
    
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
        <div className="flex items-center gap-4">
          <a href="/" className="nav-btn flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity mr-4 border border-white/10 rounded-md px-3 py-1 text-xs" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Exit
          </a>
          <div className="nav-brand flex items-center gap-2">
            <div className="nav-logo-box">
              <Building2 size={24} />
            </div>
            <span className="text-xl font-extrabold gradient-text">LAXMI BUSINESS PRO</span>
          </div>
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
            file={file} dragActive={dragActive} loading={loading} error={error}
            results={results} abbData={abbData} proprietorName={proprietorName}
            sisterFirms={sisterFirms} pdfPassword={pdfPassword} accountType={accountType}
            sanctionedLimit={sanctionedLimit} handleDrag={handleDrag} handleDrop={handleDrop}
            handleChange={handleChange} handleProcess={handleProcess} setProprietorName={setProprietorName}
            setPdfPassword={setPdfPassword} setSisterFirms={setSisterFirms} setAccountType={setAccountType}
            setSanctionedLimit={setSanctionedLimit} fileInputRef={fileInputRef} downloadExcel={downloadExcel}
          />
        )}
        {view === 'admin' && (
          isAdminAuthenticated 
            ? <PolicyAdmin onLogout={() => setIsAdminAuthenticated(false)} /> 
            : <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} />
        )}
      </main>
    </div>
  );
}

export default App;
