import React, { useState, useEffect } from 'react';
import { 
  Building2, Settings, AlertTriangle, Trash2, CheckCircle2, 
  ArrowLeft, Search, Plus, Save, RefreshCw, Layers, TrendingUp, 
  Zap, Shield, User, DollarSign, Calendar, MapPin, SlidersHorizontal, 
  PowerOff, Play, Check, X
} from 'lucide-react';
import { getBankConfig, saveBankConfig } from '../../services/bankConfigService.js';
import './UnifiedBankPolicyManager.css';

// 12 Standard Partner Banks
const INITIAL_12_BANKS = [
  { id: 'kotak', name: 'Kotak Mahindra Bank', color: '#ED1C24', minRate: 10.5, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'tata', name: 'Tata Capital', color: '#1F4E78', minRate: 10.99, maxLoan: 4000000, maxTenure: 72, enabled: true },
  { id: 'poonawala', name: 'Poonawala Finance', color: '#005596', minRate: 11.25, maxLoan: 3500000, maxTenure: 60, enabled: true },
  { id: 'idfc', name: 'IDFC First Bank', color: '#8B1538', minRate: 10.49, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'hdfc', name: 'HDFC Bank', color: '#004C8F', minRate: 10.5, maxLoan: 7500000, maxTenure: 84, enabled: true },
  { id: 'icici', name: 'ICICI Bank', color: '#ED1C24', minRate: 10.75, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'bandhan', name: 'Bandhan Bank', color: '#DC0028', minRate: 11.5, maxLoan: 2500000, maxTenure: 60, enabled: true },
  { id: 'cholamandalam', name: 'Cholamandalam Finance', color: '#F37021', minRate: 12.0, maxLoan: 3000000, maxTenure: 60, enabled: true },
  { id: 'axis-fin', name: 'Axis Finance', color: '#800000', minRate: 10.75, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'indusind', name: 'IndusInd Bank', color: '#005596', minRate: 10.49, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'shri-ram', name: 'Shri Ram Finance', color: '#1F4E78', minRate: 12.5, maxLoan: 2000000, maxTenure: 48, enabled: true },
  { id: 'piramal', name: 'Piramal Finance', color: '#1F4E78', minRate: 11.75, maxLoan: 3000000, maxTenure: 60, enabled: true }
];

// State & City Data
const STATE_CITY_MAPPING = {
  'All India': ['All Cities (National Default)'],
  'Delhi NCR': ['New Delhi', 'Central Delhi', 'South Delhi', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala']
};

// Initial Corporate Directory for Company Categorization
const INITIAL_COMPANY_DATABASE = [
  { id: 'c1', name: 'Tata Consultancy Services', category: 'Super A', type: 'MNC / IT Leader', minSalary: 25000 },
  { id: 'c2', name: 'Infosys Limited', category: 'Super A', type: 'MNC / IT Leader', minSalary: 25000 },
  { id: 'c3', name: 'Reliance Industries Limited', category: 'Super A', type: 'Conglomerate', minSalary: 25000 },
  { id: 'c4', name: 'HDFC Bank Limited', category: 'Super A', type: 'Banking & Financial', minSalary: 25000 },
  { id: 'c5', name: 'Wipro Limited', category: 'A', type: 'Listed IT', minSalary: 30000 },
  { id: 'c6', name: 'Larsen & Toubro Limited', category: 'Super A', type: 'Infrastructure', minSalary: 25000 },
  { id: 'c7', name: 'Google India Pvt Ltd', category: 'Super A', type: 'Global Tech MNC', minSalary: 35000 },
  { id: 'c8', name: 'Microsoft India', category: 'Super A', type: 'Global Tech MNC', minSalary: 35000 },
  { id: 'c9', name: 'Amazon Development Centre', category: 'A', type: 'Global E-Commerce', minSalary: 30000 },
  { id: 'c10', name: 'ICICI Bank Limited', category: 'Super A', type: 'Banking & Financial', minSalary: 25000 },
  { id: 'c11', name: 'Central Government Employee', category: 'Govt', type: 'Public Sector / Defense', minSalary: 20000 },
  { id: 'c12', name: 'State Government Employee', category: 'Govt', type: 'State Public Sector', minSalary: 20000 },
  { id: 'c13', name: 'Tech Mahindra Limited', category: 'A', type: 'Listed Tech', minSalary: 30000 },
  { id: 'c14', name: 'HCL Technologies', category: 'A', type: 'Listed IT', minSalary: 30000 },
  { id: 'c15', name: 'Mahindra & Mahindra', category: 'A', type: 'Automobile Conglomerate', minSalary: 30000 },
  { id: 'c16', name: 'Bajaj Finserv Limited', category: 'A', type: 'Non-Banking Financial', minSalary: 30000 },
  { id: 'c17', name: 'Swiggy (Bundl Technologies)', category: 'B', type: 'Unlisted Growth Unicorn', minSalary: 40000 },
  { id: 'c18', name: 'Zomato Limited', category: 'B', type: 'Listed Consumer Tech', minSalary: 35000 },
  { id: 'c19', name: 'Local Private Enterprise', category: 'C', type: 'Unlisted Private Limited', minSalary: 45000 },
  { id: 'c20', name: 'Proprietorship / Small Firm', category: 'C', type: 'SME / Micro Business', minSalary: 50000 }
];

const UnifiedBankPolicyManager = () => {
  // Location Selection State
  const [selectedState, setSelectedState] = useState('All India');
  const [selectedCity, setSelectedCity] = useState('All Cities (National Default)');

  // 12 Banks State (stored in localStorage for persistence)
  const [banks, setBanks] = useState(() => {
    try {
      const stored = localStorage.getItem('laxmi_admin_12_banks');
      return stored ? JSON.parse(stored) : INITIAL_12_BANKS;
    } catch {
      return INITIAL_12_BANKS;
    }
  });

  // Config Modal / View State
  const [activeConfigBank, setActiveConfigBank] = useState(null);
  const [activeConfigTab, setActiveConfigTab] = useState('rates'); // rates, capping, tenure, foir, demographics, companies
  const [saveAlert, setSaveAlert] = useState('');

  // Editable Policy State for Active Bank
  const [policyData, setPolicyData] = useState({
    interestRates: [
      { category: 'Super A', minRoi: 10.25, maxRoi: 12.00, defaultRoi: 10.50, minSalary: 100000 },
      { category: 'A', minRoi: 10.75, maxRoi: 13.50, defaultRoi: 11.00, minSalary: 50000 },
      { category: 'B', minRoi: 11.50, maxRoi: 15.00, defaultRoi: 12.00, minSalary: 35000 },
      { category: 'C', minRoi: 12.50, maxRoi: 18.00, defaultRoi: 13.50, minSalary: 25000 },
      { category: 'Govt', minRoi: 10.50, maxRoi: 12.50, defaultRoi: 10.75, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 7500000, bachelorCap: 3000000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 5000000, bachelorCap: 2500000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 3500000, bachelorCap: 1500000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 2000000, bachelorCap: 1000000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, bachelorCap: 3000000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years' },
      { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 70, multiplier: 28, ccObligation: 5 },
      { category: 'A', maxFoir: 65, multiplier: 24, ccObligation: 5 },
      { category: 'B', maxFoir: 60, multiplier: 20, ccObligation: 5 },
      { category: 'C', maxFoir: 55, multiplier: 18, ccObligation: 5 },
      { category: 'Govt', maxFoir: 65, multiplier: 25, ccObligation: 3 }
    ],
    demographics: {
      minAge: 21,
      maxAge: 60,
      retirementSalaried: 60,
      retirementGovt: 62,
      minSalary: 25000,
      minExperienceTotal: 12,
      minExperienceCurrent: 6,
      minCibilScore: 650
    },
    companies: INITIAL_COMPANY_DATABASE
  });

  // Search in Company Category List
  const [companySearch, setCompanySearch] = useState('');
  const [companyCategoryFilter, setCompanyCategoryFilter] = useState('all');
  const [newCompany, setNewCompany] = useState({ name: '', category: 'A', type: 'Private Enterprise', minSalary: 30000 });

  // Update cities whenever state changes
  useEffect(() => {
    const availableCities = STATE_CITY_MAPPING[selectedState] || ['All Cities'];
    setSelectedCity(availableCities[0]);
  }, [selectedState]);

  // Sync banks to localStorage
  const persistBanks = (updatedBanks) => {
    setBanks(updatedBanks);
    try {
      localStorage.setItem('laxmi_admin_12_banks', JSON.stringify(updatedBanks));
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Suspend / Activate Bank Policy
  const handleToggleSuspendBank = (bank) => {
    const newStatus = !bank.enabled;
    const action = newStatus ? 'Activate' : 'Suspend';
    if (window.confirm(`Are you sure you want to ${action} ${bank.name}?\n\n${newStatus ? 'Customers will now see pre-approved offers from this bank.' : 'This will temporarily stop this bank from being shown in customer loan calculations.'}`)) {
      const updated = banks.map(b => b.id === bank.id ? { ...b, enabled: newStatus } : b);
      persistBanks(updated);
    }
  };

  // 2. Delete Bank Policy
  const handleDeleteBank = (bank) => {
    if (window.confirm(`⚠️ PERMANENT DELETE WARNING\n\nAre you sure you want to delete policy configuration for ${bank.name} in ${selectedCity}, ${selectedState}?\n\nThis will reset or remove custom parameters for this institution.`)) {
      const updated = banks.map(b => b.id === bank.id ? { ...b, enabled: false, minRate: 12.0, maxLoan: 2500000 } : b);
      persistBanks(updated);
      alert(`Policy record for ${bank.name} has been reset / purged successfully.`);
    }
  };

  // 3. Open Config Policy
  const handleOpenConfig = (bank) => {
    setActiveConfigBank(bank);
    setActiveConfigTab('rates');
    setSaveAlert('');

    // Load any existing custom config from localStorage or service
    const locationKey = `${selectedState}-${selectedCity}`;
    const stored = localStorage.getItem(`policy_config_${bank.id}_${locationKey}`);
    if (stored) {
      try {
        setPolicyData(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Save All Policy Changes
  const handleSavePolicy = () => {
    if (!activeConfigBank) return;
    const locationKey = `${selectedState}-${selectedCity}`;
    try {
      localStorage.setItem(`policy_config_${activeConfigBank.id}_${locationKey}`, JSON.stringify(policyData));
      
      // Also update bankConfigService
      saveBankConfig(activeConfigBank.name, 'unifiedPolicy', policyData, locationKey);

      // Update quick highlights on the bank card
      const updatedBanks = banks.map(b => {
        if (b.id === activeConfigBank.id) {
          const minRate = policyData.interestRates?.[0]?.minRoi || b.minRate;
          const maxLoan = policyData.loanCapping?.[0]?.maxLoan || b.maxLoan;
          const maxTenure = policyData.tenureRules?.[0]?.maxMonths || b.maxTenure;
          return { ...b, minRate, maxLoan, maxTenure };
        }
        return b;
      });
      persistBanks(updatedBanks);

      setSaveAlert(`All policy tables for ${activeConfigBank.name} committed successfully for ${selectedCity}, ${selectedState}!`);
      setTimeout(() => setSaveAlert(''), 4000);
    } catch (e) {
      alert('Failed to save policy changes: ' + e.message);
    }
  };

  // Add Company to Category List
  const handleAddCompany = (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) {
      alert('Please enter a valid company name.');
      return;
    }
    const created = {
      id: 'c_' + Date.now(),
      name: newCompany.name.trim(),
      category: newCompany.category,
      type: newCompany.type,
      minSalary: Number(newCompany.minSalary) || 25000
    };
    setPolicyData(prev => ({
      ...prev,
      companies: [created, ...prev.companies]
    }));
    setNewCompany({ name: '', category: 'A', type: 'Private Enterprise', minSalary: 30000 });
  };

  // Delete Company from Category List
  const handleDeleteCompany = (id) => {
    setPolicyData(prev => ({
      ...prev,
      companies: prev.companies.filter(c => c.id !== id)
    }));
  };

  // Filtered Company List
  const filteredCompanies = policyData.companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(companySearch.toLowerCase());
    const matchesCategory = companyCategoryFilter === 'all' || c.category === companyCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="unified-policy-manager">
      {/* ======================================================== */}
      {/* 1. STATE & CITY LOCATION SELECTOR BAR                   */}
      {/* ======================================================== */}
      <div className="policy-location-selector-bar">
        <div className="selector-bar-left">
          <div className="selector-title-group">
            <MapPin size={20} className="pin-icon" />
            <div>
              <span className="selector-heading">Operating Location Hierarchy</span>
              <p className="selector-subheading">Select State & City to view or configure specific institutional policies</p>
            </div>
          </div>
        </div>

        <div className="selector-bar-right">
          <div className="select-box-wrapper">
            <label>STATE / TERRITORY</label>
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
              className="location-select"
            >
              {Object.keys(STATE_CITY_MAPPING).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="select-box-wrapper">
            <label>CITY / REGION</label>
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="location-select"
            >
              {(STATE_CITY_MAPPING[selectedState] || []).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="location-context-pill">
            <span className="dot"></span>
            <span>{selectedCity}, {selectedState}</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. 12 BANK CARDS GRID VIEW                              */}
      {/* ======================================================== */}
      {!activeConfigBank ? (
        <div className="bank-cards-section">
          <div className="cards-section-header">
            <div>
              <h2>Institutional Partner Banks ({banks.length})</h2>
              <p>Manage rule calculations, sanction limits, and operational status for all partner lending institutions.</p>
            </div>
            <div className="cards-stats-pills">
              <span className="stat-pill active">
                🟢 Active: {banks.filter(b => b.enabled).length}
              </span>
              <span className="stat-pill suspended">
                🔴 Suspended: {banks.filter(b => !b.enabled).length}
              </span>
            </div>
          </div>

          <div className="bank-cards-grid">
            {banks.map(bank => (
              <div 
                key={bank.id} 
                className={`bank-action-card ${bank.enabled ? 'is-active' : 'is-suspended'}`}
              >
                <div className="card-top-strip" style={{ backgroundColor: bank.color }}></div>

                <div className="card-main-content">
                  <div className="card-header-row">
                    <div className="bank-brand-block">
                      <div className="bank-avatar" style={{ backgroundColor: bank.color }}>
                        {bank.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="bank-title-block">
                        <h3 className="bank-name">{bank.name}</h3>
                        <span className="location-tag">{selectedCity}</span>
                      </div>
                    </div>

                    <div className="card-status-badge">
                      {bank.enabled ? (
                        <span className="status-badge active"><Check size={12} /> Active</span>
                      ) : (
                        <span className="status-badge suspended"><PowerOff size={12} /> Suspended</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Metrics */}
                  <div className="card-quick-metrics">
                    <div className="metric-cell">
                      <span className="metric-label">Min Interest</span>
                      <span className="metric-val">{bank.minRate}% p.a.</span>
                    </div>
                    <div className="metric-cell">
                      <span className="metric-label">Max Sanction</span>
                      <span className="metric-val">₹{(bank.maxLoan / 100000).toFixed(0)} Lakhs</span>
                    </div>
                    <div className="metric-cell">
                      <span className="metric-label">Max Tenure</span>
                      <span className="metric-val">{bank.maxTenure} Mos</span>
                    </div>
                  </div>

                  {/* 3 Dedicated Action Buttons */}
                  <div className="card-actions-row">
                    <button 
                      className="btn-card-action btn-config"
                      onClick={() => handleOpenConfig(bank)}
                      title="Open All-in-One Policy Configuration Editor"
                    >
                      <Settings size={15} />
                      <span>Config Policy</span>
                    </button>

                    <button 
                      className={`btn-card-action btn-suspend ${bank.enabled ? 'btn-warn' : 'btn-success'}`}
                      onClick={() => handleToggleSuspendBank(bank)}
                      title={bank.enabled ? "Suspend Bank Policy" : "Activate Bank Policy"}
                    >
                      {bank.enabled ? <PowerOff size={15} /> : <Play size={15} />}
                      <span>{bank.enabled ? 'Suspend' : 'Activate'}</span>
                    </button>

                    <button 
                      className="btn-card-action btn-delete"
                      onClick={() => handleDeleteBank(bank)}
                      title="Reset or Delete Bank Policy"
                    >
                      <Trash2 size={15} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 3. ALL-IN-ONE TABULAR POLICY VIEWER & EDITOR             */
        /* ======================================================== */
        <div className="unified-config-view">
          {/* Top Return & Save Header */}
          <div className="config-view-header">
            <div className="config-header-left">
              <button 
                className="btn-back-to-cards"
                onClick={() => { setActiveConfigBank(null); setSaveAlert(''); }}
              >
                <ArrowLeft size={16} />
                <span>Back to 12 Bank Cards</span>
              </button>
              
              <div className="config-bank-ident">
                <div className="ident-avatar" style={{ backgroundColor: activeConfigBank.color }}>
                  {activeConfigBank.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="ident-name">{activeConfigBank.name}</h1>
                  <span className="ident-sub">
                    Policy Framework • 📍 {selectedCity}, {selectedState}
                  </span>
                </div>
              </div>
            </div>

            <div className="config-header-right">
              <button 
                className="btn-save-all-policy"
                onClick={handleSavePolicy}
              >
                <Save size={16} />
                <span>Save Policy Changes</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {saveAlert && (
            <div className="save-alert-banner">
              <CheckCircle2 size={18} />
              <span>{saveAlert}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="config-tabs-nav">
            <button 
              className={`config-tab-btn ${activeConfigTab === 'rates' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('rates')}
            >
              <TrendingUp size={16} />
              <span>Interest Rates</span>
            </button>
            <button 
              className={`config-tab-btn ${activeConfigTab === 'capping' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('capping')}
            >
              <Zap size={16} />
              <span>Capital Capping</span>
            </button>
            <button 
              className={`config-tab-btn ${activeConfigTab === 'tenure' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('tenure')}
            >
              <Calendar size={16} />
              <span>Tenure Optimization</span>
            </button>
            <button 
              className={`config-tab-btn ${activeConfigTab === 'foir' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('foir')}
            >
              <Shield size={16} />
              <span>FOIR & Multipliers</span>
            </button>
            <button 
              className={`config-tab-btn ${activeConfigTab === 'demographics' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('demographics')}
            >
              <User size={16} />
              <span>Demographic & Age Rules</span>
            </button>
            <button 
              className={`config-tab-btn ${activeConfigTab === 'companies' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('companies')}
            >
              <Building2 size={16} />
              <span>Company Category List</span>
            </button>
          </div>

          {/* TAB 1: INTEREST RATES TABULAR VIEW */}
          {activeConfigTab === 'rates' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>Interest Rate Structures & Slabs</h3>
                  <p>Define minimum, maximum, and default ROI percentage per employer category.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Category Tier</th>
                      <th>Minimum Net Salary</th>
                      <th>Min ROI (% p.a.)</th>
                      <th>Max ROI (% p.a.)</th>
                      <th>Default Offered ROI (% p.a.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyData.interestRates.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${row.category.toLowerCase().replace(/\s+/g, '-')}`}>
                            {row.category}
                          </span>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <span>₹</span>
                            <input 
                              type="number"
                              value={row.minSalary}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.interestRates];
                                updated[idx].minSalary = val;
                                setPolicyData({ ...policyData, interestRates: updated });
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <input 
                              type="number"
                              step="0.05"
                              value={row.minRoi}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.interestRates];
                                updated[idx].minRoi = val;
                                setPolicyData({ ...policyData, interestRates: updated });
                              }}
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <input 
                              type="number"
                              step="0.05"
                              value={row.maxRoi}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.interestRates];
                                updated[idx].maxRoi = val;
                                setPolicyData({ ...policyData, interestRates: updated });
                              }}
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell highlight">
                            <input 
                              type="number"
                              step="0.05"
                              value={row.defaultRoi}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.interestRates];
                                updated[idx].defaultRoi = val;
                                setPolicyData({ ...policyData, interestRates: updated });
                              }}
                            />
                            <span>%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CAPITAL / LOAN CAPPING TABULAR VIEW */}
          {activeConfigTab === 'capping' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>Capital & Sanction Capping Matrix</h3>
                  <p>Specify minimum and maximum loan limits, along with bachelor residence restrictions.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Category Tier</th>
                      <th>Minimum Loan Amount (₹)</th>
                      <th>Absolute Maximum Sanction (₹)</th>
                      <th>Bachelor Capping Limit (₹)</th>
                      <th>Sanction In Lakhs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyData.loanCapping.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${row.tier.toLowerCase().replace(/\s+/g, '-')}`}>
                            {row.tier}
                          </span>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <span>₹</span>
                            <input 
                              type="number"
                              value={row.minLoan}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.loanCapping];
                                updated[idx].minLoan = val;
                                setPolicyData({ ...policyData, loanCapping: updated });
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell highlight">
                            <span>₹</span>
                            <input 
                              type="number"
                              value={row.maxLoan}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.loanCapping];
                                updated[idx].maxLoan = val;
                                setPolicyData({ ...policyData, loanCapping: updated });
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <span>₹</span>
                            <input 
                              type="number"
                              value={row.bachelorCap}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.loanCapping];
                                updated[idx].bachelorCap = val;
                                setPolicyData({ ...policyData, loanCapping: updated });
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <span className="tag-lakhs">
                            Up to ₹{(row.maxLoan / 100000).toFixed(1)} Lakhs
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TENURE OPTIMIZATION TABULAR VIEW */}
          {activeConfigTab === 'tenure' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>Tenure Optimization & Repayment Windows</h3>
                  <p>Configure permitted loan repayment periods (12 to 84 months) by company tier.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Category Tier</th>
                      <th>Min Tenure (Months)</th>
                      <th>Max Tenure (Months)</th>
                      <th>Max Tenure (Years)</th>
                      <th>Policy Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyData.tenureRules.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${row.category.toLowerCase().replace(/\s+/g, '-')}`}>
                            {row.category}
                          </span>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <input 
                              type="number"
                              value={row.minMonths}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.tenureRules];
                                updated[idx].minMonths = val;
                                setPolicyData({ ...policyData, tenureRules: updated });
                              }}
                            />
                            <span>Mos</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell highlight">
                            <input 
                              type="number"
                              value={row.maxMonths}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.tenureRules];
                                updated[idx].maxMonths = val;
                                updated[idx].description = `Up to ${(val / 12).toFixed(1)} Years`;
                                setPolicyData({ ...policyData, tenureRules: updated });
                              }}
                            />
                            <span>Mos</span>
                          </div>
                        </td>
                        <td>
                          <span className="tag-years">
                            {(row.maxMonths / 12).toFixed(1)} Years
                          </span>
                        </td>
                        <td>
                          <span className="text-muted-sm">{row.description}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FOIR & MULTIPLIER TABULAR VIEW */}
          {activeConfigTab === 'foir' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>FOIR (Fixed Obligation to Income Ratio) & Income Multipliers</h3>
                  <p>Determine borrower obligation tolerance and salary multiplier factors.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Category Tier</th>
                      <th>Max Permitted FOIR (%)</th>
                      <th>Net Salary Multiplier (x)</th>
                      <th>Credit Card Obligation Factor (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyData.foirMultiplier.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${row.category.toLowerCase().replace(/\s+/g, '-')}`}>
                            {row.category}
                          </span>
                        </td>
                        <td>
                          <div className="table-input-cell highlight">
                            <input 
                              type="number"
                              value={row.maxFoir}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.foirMultiplier];
                                updated[idx].maxFoir = val;
                                setPolicyData({ ...policyData, foirMultiplier: updated });
                              }}
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell highlight">
                            <input 
                              type="number"
                              value={row.multiplier}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.foirMultiplier];
                                updated[idx].multiplier = val;
                                setPolicyData({ ...policyData, foirMultiplier: updated });
                              }}
                            />
                            <span>x Salary</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <input 
                              type="number"
                              value={row.ccObligation}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.foirMultiplier];
                                updated[idx].ccObligation = val;
                                setPolicyData({ ...policyData, foirMultiplier: updated });
                              }}
                            />
                            <span>% CC Limit</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DEMOGRAPHIC & AGE RULES TABULAR VIEW */}
          {activeConfigTab === 'demographics' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>Demographic & Age Eligibility Criteria</h3>
                  <p>Configure age boundaries, retirement thresholds, and minimum stability requirements.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Eligibility Parameter</th>
                      <th>Configured Threshold</th>
                      <th>Standard Norm</th>
                      <th>Rule Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Minimum Applicant Age</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData.demographics.minAge}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, minAge: Number(e.target.value) }
                            })}
                          />
                          <span>Years</span>
                        </div>
                      </td>
                      <td>21 Years</td>
                      <td>Minimum age required at loan application stage</td>
                    </tr>
                    <tr>
                      <td><strong>Maximum Age at Loan Maturity</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData.demographics.maxAge}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, maxAge: Number(e.target.value) }
                            })}
                          />
                          <span>Years</span>
                        </div>
                      </td>
                      <td>60 Years</td>
                      <td>Borrower must finish repayment before reaching this age</td>
                    </tr>
                    <tr>
                      <td><strong>Retirement Age (Salaried / Private)</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData.demographics.retirementSalaried}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, retirementSalaried: Number(e.target.value) }
                            })}
                          />
                          <span>Years</span>
                        </div>
                      </td>
                      <td>60 Years</td>
                      <td>Superannuation age considered for private corporate employees</td>
                    </tr>
                    <tr>
                      <td><strong>Retirement Age (Government / Defense)</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData.demographics.retirementGovt}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, retirementGovt: Number(e.target.value) }
                            })}
                          />
                          <span>Years</span>
                        </div>
                      </td>
                      <td>62 Years</td>
                      <td>Standard retirement threshold for state / central govt personnel</td>
                    </tr>
                    <tr>
                      <td><strong>Minimum Monthly Salary Threshold</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <span>₹</span>
                          <input 
                            type="number"
                            value={policyData.demographics.minSalary}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, minSalary: Number(e.target.value) }
                            })}
                          />
                        </div>
                      </td>
                      <td>₹25,000</td>
                      <td>Minimum verifiable monthly salary required for qualification</td>
                    </tr>
                    <tr>
                      <td><strong>Minimum Total Work Experience</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData.demographics.minExperienceTotal}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, minExperienceTotal: Number(e.target.value) }
                            })}
                          />
                          <span>Months</span>
                        </div>
                      </td>
                      <td>12 Months</td>
                      <td>Cumulative work experience across previous employers</td>
                    </tr>
                    <tr>
                      <td><strong>Minimum CIBIL Score Cutoff</strong></td>
                      <td>
                        <div className="table-input-cell highlight">
                          <input 
                            type="number"
                            value={policyData.demographics.minCibilScore}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, minCibilScore: Number(e.target.value) }
                            })}
                          />
                        </div>
                      </td>
                      <td>650</td>
                      <td>Bureau credit score below which applications are rejected</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: COMPANY CATEGORY LIST (VIEW & EDIT) */}
          {activeConfigTab === 'companies' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>Company Category Database ({filteredCompanies.length})</h3>
                  <p>View, search, assign, or add corporate employers and their category tier for {activeConfigBank.name}.</p>
                </div>
              </div>

              {/* Add New Company Form */}
              <form onSubmit={handleAddCompany} className="add-company-inline-form">
                <div className="form-input-box">
                  <label>Company Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Adobe India, Cognizant..."
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-input-box" style={{ maxWidth: '160px' }}>
                  <label>Assign Category</label>
                  <select 
                    value={newCompany.category}
                    onChange={(e) => setNewCompany({ ...newCompany, category: e.target.value })}
                  >
                    <option value="Super A">Super A</option>
                    <option value="A">Category A</option>
                    <option value="B">Category B</option>
                    <option value="C">Category C</option>
                    <option value="Govt">Govt / PSU</option>
                  </select>
                </div>
                <div className="form-input-box" style={{ maxWidth: '180px' }}>
                  <label>Company Type</label>
                  <input 
                    type="text"
                    placeholder="e.g. Listed MNC"
                    value={newCompany.type}
                    onChange={(e) => setNewCompany({ ...newCompany, type: e.target.value })}
                  />
                </div>
                <div className="form-input-box" style={{ maxWidth: '160px' }}>
                  <label>Min Salary (₹)</label>
                  <input 
                    type="number"
                    value={newCompany.minSalary}
                    onChange={(e) => setNewCompany({ ...newCompany, minSalary: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-add-company">
                  <Plus size={16} />
                  <span>Add Company</span>
                </button>
              </form>

              {/* Controls: Search & Category Filter */}
              <div className="company-table-controls">
                <div className="search-input-group">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text"
                    placeholder="Search employer by name..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                  />
                </div>

                <div className="cat-filter-group">
                  <span>Filter:</span>
                  {['all', 'Super A', 'A', 'B', 'C', 'Govt'].map(cat => (
                    <button 
                      key={cat}
                      className={`filter-btn ${companyCategoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setCompanyCategoryFilter(cat)}
                    >
                      {cat === 'all' ? 'All Tiers' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company List Table */}
              <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Employer / Company Name</th>
                      <th>Category Tier</th>
                      <th>Industry / Classification</th>
                      <th>Min Verifiable Salary</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.map(comp => (
                        <tr key={comp.id}>
                          <td>
                            <strong>{comp.name}</strong>
                          </td>
                          <td>
                            {/* Inline Category Editor Dropdown */}
                            <select 
                              className={`cat-select-inline cat-${comp.category.toLowerCase().replace(/\s+/g, '-')}`}
                              value={comp.category}
                              onChange={(e) => {
                                const newCat = e.target.value;
                                setPolicyData(prev => ({
                                  ...prev,
                                  companies: prev.companies.map(c => c.id === comp.id ? { ...c, category: newCat } : c)
                                }));
                              }}
                            >
                              <option value="Super A">Super A</option>
                              <option value="A">Category A</option>
                              <option value="B">Category B</option>
                              <option value="C">Category C</option>
                              <option value="Govt">Govt / PSU</option>
                            </select>
                          </td>
                          <td>
                            <span className="type-badge">{comp.type}</span>
                          </td>
                          <td>₹{Number(comp.minSalary || 25000).toLocaleString('en-IN')}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              className="btn-delete-company-row"
                              onClick={() => handleDeleteCompany(comp.id)}
                              title="Delete company from category mapping"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                          No companies match the search term "{companySearch}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedBankPolicyManager;
