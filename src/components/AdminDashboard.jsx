import { useState, useEffect } from 'react';
import './AdminDashboard.css';
import BankList from './admin/BankList';
import BankConfigEditor from './admin/BankConfigEditor';
import Analytics from './admin/Analytics';
import ImportExport from './admin/ImportExport';
import AuditLog from './admin/AuditLog';
import AddBankModal from './admin/AddBankModal';
import BlogManager from './admin/BlogManager';
import LocationOverrideManager from './admin/LocationOverrideManager';
import ExperienceManager from './admin/ExperienceManager';
import LeadManager from './admin/LeadManager';
import UserManager from './admin/UserManager';
import AdminLogin from './admin/AdminLogin';
import { indianStates, stateCityData } from '../data/locationData';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAllBankConfig } from '../services/bankConfigService';
import { LogOut, User, Layout, FileText, MapPin, Settings, BarChart2, Database, ShieldCheck, Zap, UserPlus } from 'lucide-react';

const AdminDashboard = ({ onBackToCustomer }) => {
  const [activeMenu, setActiveMenu] = useState('region-setup');
  const [selectedBank, setSelectedBank] = useState(null);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [customBanks, setCustomBanks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState(null); // {state, city} or null for global
  const [isLocationLocked, setIsLocationLocked] = useState(false);
  const [tempState, setTempState] = useState('');
  const [tempCity, setTempCity] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  const menuItems = [
    { id: 'region-setup', icon: <MapPin size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'Region Setup', component: 'RegionSetup' },
    { id: 'user-management', icon: <UserPlus size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'Nexus Control (Users)', component: 'UserManager' },
    { id: 'leads', icon: <Layout size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'Customer Lead Pipeline', component: 'LeadManager' },
    { id: 'banks', icon: <Database size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'Institutional Overview', component: 'BankList' },
    { id: 'locations', icon: <MapPin size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'City-Wise Overrides', component: 'LocationOverrideManager' },
    { id: 'blog', icon: <FileText size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'Neural Hub (Blogs)', component: 'BlogManager' },
    { id: 'experience', icon: <Zap size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'Experience Protocol', component: 'ExperienceManager' },
    { id: 'config', icon: <Settings size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'Generic Configuration', component: 'BankConfigEditor' },
    { id: 'categories', icon: '', label: 'Categorization Models', component: 'BankConfigEditor', section: 'categories' },
    { id: 'interest', icon: '', label: 'Rate Structures', component: 'BankConfigEditor', section: 'interest' },
    { id: 'loan-capping', icon: '', label: 'Capital Capping', component: 'BankConfigEditor', section: 'loanCapping' },
    { id: 'age-rules', icon: '', label: 'Demographic Rules', component: 'BankConfigEditor', section: 'ageRules' },
    { id: 'tenure', icon: '', label: 'Tenure Optimization', component: 'BankConfigEditor', section: 'tenureRules' },
    { id: 'foir', icon: '', label: 'FOIR Parameters', component: 'BankConfigEditor', section: 'foir' },
    { id: 'multiplier', icon: '', label: 'Multiplier Logic', component: 'BankConfigEditor', section: 'multiplier' },
    { id: 'bt', icon: '', label: 'Liability Consolidation', component: 'BankConfigEditor', section: 'bt' },
    { id: 'credit-score', icon: '', label: 'Risk Assessment', component: 'BankConfigEditor', section: 'creditScore' },
    { id: 'employment', icon: '', label: 'Employment Credentialing', component: 'BankConfigEditor', section: 'employment' },
    { id: 'documents', icon: '', label: 'Documentation Protocol', component: 'BankConfigEditor', section: 'documents' },
    { id: 'special', icon: '', label: 'Exceptional Policies', component: 'BankConfigEditor', section: 'special' },
    { id: 'fees', icon: '', label: 'Fee Schedules', component: 'BankConfigEditor', section: 'fees' },
    { id: 'analytics', icon: <BarChart2 size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'Strategic Analytics', component: 'Analytics' },
    { id: 'import-export', icon: <ShieldCheck size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'Data Governance', component: 'ImportExport' },
    { id: 'audit', icon: <ShieldCheck size={18} stroke="#00d4ff" strokeWidth={2.5} />, label: 'Governance Logs', component: 'AuditLog' }
  ];

  const renderContent = () => {
    const activeItem = menuItems.find(item => item.id === activeMenu);

    // Level 0 Dashboard: Region Setup
    if (activeItem?.id === 'region-setup') {
      return (
        <div className="region-setup-container">
          <div className="gateway-card glass-morphism integrated">
            <div className="gateway-header">
              <MapPin className="gateway-icon animate-pulse" />
              <h2>Neural Gateway: Regional Audit</h2>
              <p>Initialize operating region to activate institutional policies</p>
            </div>

            <div className="gateway-form">
              <div className="input-group">
                <label>Target State</label>
                <select
                  value={tempState}
                  onChange={(e) => { setTempState(e.target.value); setTempCity(''); }}
                  className="gateway-input"
                >
                  <option value="">Select State...</option>
                  <option value="Global">🌐 All India (National Default)</option>
                  {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {tempState && tempState !== 'Global' && stateCityData[tempState] && (
                <div className="input-group">
                  <label>Target City (Optional)</label>
                  <select
                    value={tempCity}
                    onChange={(e) => setTempCity(e.target.value)}
                    className="gateway-input"
                  >
                    <option value="">Specific City (Optional)...</option>
                    {stateCityData[tempState].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              <button
                className="btn-gateway-go"
                disabled={!tempState}
                onClick={() => {
                  if (tempState === 'Global') {
                    setActiveLocation(null);
                  } else {
                    setActiveLocation({ state: tempState, city: tempCity });
                  }
                  setIsLocationLocked(true);
                  setActiveMenu('banks'); // BOOM: Unlock banks
                }}
              >
                Lock Operating Region & Go →
              </button>
            </div>

            <div className="gateway-footer">
              <ShieldCheck size={14} />
              <span>Secure Session: RSA-256 Encrypted Audit</span>
            </div>
          </div>
        </div>
      );
    }

    switch (activeItem?.component) {
      case 'BankList':
        return <BankList
          customBanks={customBanks}
          activeLocation={activeLocation || {}}
          onSelectBank={(bank) => {
            setSelectedBank(bank);
            setActiveMenu('config');
          }}
          onAddBank={() => setShowAddBankModal(true)}
        />;
      case 'LeadManager':
        return <LeadManager userRole={user?.role} />;
      case 'UserManager':
        return <UserManager />;
      case 'BlogManager':
        return <BlogManager />;
      case 'ExperienceManager':
        return <ExperienceManager />;
      case 'LocationOverrideManager':
        if (!selectedBank) {
          return (
            <div className="no-bank-selected">
              <div className="empty-state">
                <div className="empty-icon">🏦</div>
                <h3>Institutional Mandate Required</h3>
                <p>Please select a specific Bank from the Institutional Overview to manage its regional overrides.</p>
                <button className="btn-select-bank" onClick={() => setActiveMenu('banks')}>
                  Go to Banks Overview
                </button>
              </div>
            </div>
          );
        }

        const bankConfig = getAllBankConfig(selectedBank.name);
        const allLocationNames = new Set();
        if (bankConfig.locationOverrides) {
          Object.values(bankConfig.locationOverrides).forEach(sectionOverrides => {
            Object.keys(sectionOverrides).forEach(locName => allLocationNames.add(locName));
          });
        }

        const overridesObj = {};
        allLocationNames.forEach(name => overridesObj[name] = true);

        return <LocationOverrideManager
          overrides={overridesObj}
          activeLocation={activeLocation ? (activeLocation.city || activeLocation.state) : null}
          onSelectLocation={(loc) => {
            if (!loc) setActiveLocation(null);
            else {
              setActiveLocation({ state: loc, city: loc });
            }
          }}
          onAddLocation={(loc) => {
            setActiveLocation({ state: loc, city: loc });
            alert(`Location override for "${loc}" initialized.\n\nPlease navigate to the specific Policy sections (Multiplier, BT, etc.) to define local parameters.`);
          }}
          onRemoveLocation={(loc) => {
            if (activeLocation?.city === loc || activeLocation?.state === loc) {
              setActiveLocation(null);
            }
            alert(`Location override for "${loc}" removed from the active session.`);
          }}
        />;
      case 'BankConfigEditor':
        return <BankConfigEditor
          selectedBank={selectedBank}
          section={activeItem.section}
          activeLocation={activeLocation || {}}
          onNavigate={(id) => setActiveMenu(id)}
        />;
      case 'Analytics':
        return <Analytics />;
      case 'ImportExport':
        return <ImportExport />;
      case 'AuditLog':
        return <AuditLog />;
      default:
        return <div>Select a menu item</div>;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader"></div>
        <p>Syncing Neural Networks...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const handleBankAdded = (newBank) => {
    setCustomBanks([...customBanks, newBank]);
    alert(`Institution "${newBank.name}" initialized successfully with standard regulatory frameworks.`);
  };

  return (
    <div className="admin-dashboard professional-grid-bg">
      {showAddBankModal && (
        <AddBankModal
          onClose={() => setShowAddBankModal(false)}
          onBankAdded={handleBankAdded}
        />
      )}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="btn-back-portal" onClick={onBackToCustomer}>
              ← Back to Portal
            </button>
            <h1>{menuItems.find(i => i.id === activeMenu)?.label || "Bank Governance"}</h1>
          </div>
          <div className="header-right header-user-info">
            <div className="user-badge">
              <User size={16} stroke="#00d4ff" strokeWidth={2.5} />
              <span>{user.displayName || user.email}</span>
              <span className="role-tag">{user.role?.toUpperCase()}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Sign Out">
              <LogOut size={18} stroke="#ff4444" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <div className="sidebar-content">
            <h3>Navigation</h3>
            <nav className="sidebar-menu">
              {menuItems.map(item => {
                if (user.role === 'employee' && item.id !== 'leads') return null;
                if (item.id === 'user-management' && user.role !== 'ceo') return null;

                // --- TRIPLE-LOCK VISIBILITY LOGIC ---

                // Level 0: Always show (Leads, Blogs, Region Setup)
                const isLevel0 = ['leads', 'blog', 'region-setup', 'analytics', 'import-export', 'audit'].includes(item.id);

                // Level 1: Institutional Overview (Unlock after Region Lock)
                const isLevel1 = item.id === 'banks' || item.id === 'locations';

                // Level 2: Policy Editors (Unlock after Bank Selection)
                const isLevel2 = item.component === 'BankConfigEditor' || item.id === 'experience';

                if (isLevel1 && !isLocationLocked) return null;
                if (isLevel2 && !selectedBank) return null;

                return (
                  <button
                    key={item.id}
                    className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                    onClick={() => setActiveMenu(item.id)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="dashboard-main">
          {isLocationLocked && (
            <div className="operating-region-banner">
              <div className="region-info">
                <MapPin size={14} />
                <span>Region: <strong>{activeLocation ? (activeLocation.city || activeLocation.state) : 'All India (National)'}</strong></span>
              </div>
              <div className="region-actions">
                {selectedBank && activeMenu !== 'banks' && activeMenu !== 'analytics' && activeMenu !== 'import-export' && activeMenu !== 'audit' && (
                  <>
                    <span className="editing-tag">| Editing: <strong>{selectedBank.name}</strong></span>
                    <button className="btn-banner-action" onClick={() => setActiveMenu('banks')}>Change Bank</button>
                  </>
                )}
                <button className="btn-banner-action reset" onClick={() => { setIsLocationLocked(false); setSelectedBank(null); }}>
                  Change Region
                </button>
              </div>
            </div>
          )}

          <div className="content-area">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
