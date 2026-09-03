import { useState, useEffect } from 'react';
import './AdminDashboard.css';
import BankList from './admin/BankList.jsx';
import BankConfigEditor from './admin/BankConfigEditor.jsx';
import Analytics from './admin/Analytics.jsx';
import ImportExport from './admin/ImportExport.jsx';
import AuditLog from './admin/AuditLog.jsx';
import AddBankModal from './admin/AddBankModal.jsx';
import BlogManager from './admin/BlogManager.jsx';
import LeadManager from './admin/LeadManager.jsx';
import UserManager from './admin/UserManager.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import AdminLocationSelector from './admin/AdminLocationSelector.jsx';
import ProfileSecurity from './admin/ProfileSecurity.jsx';
import { auth, db } from '../config/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LogOut, User, Layout, FileText, MapPin, Settings, BarChart2, Database, ShieldCheck, Zap, UserPlus, TrendingUp, Shield, Layers, Users, FileMinus } from 'lucide-react';

const AdminDashboard = ({ onBackToCustomer }) => {
  const [activeMenu, setActiveMenu] = useState('leads'); // Default to leads for employees
  const [selectedLocation, setSelectedLocation] = useState({ state: '', city: '' });
  const [selectedBank, setSelectedBank] = useState(null);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [customBanks, setCustomBanks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persistence of custom banks (if any)
  useEffect(() => {
    const stored = localStorage.getItem('laxmi_custom_banks');
    if (stored) setCustomBanks(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Start load cycle
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
          } else {
            // User exists in Auth but not in database, treat as logged out to prompt again
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth Loading Error:", err);
        setUser(null);
      } finally {
        setLoading(false); // Guarantee unlocking logic
      }
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
    { id: 'leads', icon: <Users size={18} stroke="#00d4ff" />, label: 'Lead Management', component: 'LeadManager' },
    { id: 'blog', icon: <FileText size={18} stroke="#00d4ff" />, label: 'Blogger Section', component: 'BlogManager' },
    { id: 'banks', icon: <Database size={18} stroke="#00d4ff" />, label: 'Institutional Overview', component: 'BankList' },
    { id: 'config', icon: <Settings size={18} stroke="#00d4ff" />, label: 'Generic Configuration', component: 'BankConfigEditor' },
    { id: 'categories', icon: <Layers size={18} stroke="#00d4ff" />, label: 'Categorization Models', component: 'BankConfigEditor', section: 'categories' },
    { id: 'interest', icon: <TrendingUp size={18} stroke="#00d4ff" />, label: 'Rate Structures', component: 'BankConfigEditor', section: 'interest' },
    { id: 'loan-capping', icon: <Zap size={18} stroke="#00d4ff" />, label: 'Capital Capping', component: 'BankConfigEditor', section: 'loanCapping' },
    { id: 'age-rules', icon: <User size={18} stroke="#00d4ff" />, label: 'Demographic Rules', component: 'BankConfigEditor', section: 'ageRules' },
    { id: 'tenure', icon: <Zap size={18} stroke="#00d4ff" />, label: 'Tenure Optimization', component: 'BankConfigEditor', section: 'tenureRules' },
    { id: 'foir', icon: <Shield size={18} stroke="#00d4ff" />, label: 'FOIR Parameters', component: 'BankConfigEditor', section: 'foir' },
    { id: 'multiplier', icon: <Zap size={18} stroke="#00d4ff" />, label: 'Multiplier Logic', component: 'BankConfigEditor', section: 'multiplier' },
    { id: 'bt', icon: <Zap size={18} stroke="#00d4ff" />, label: 'Liability Consolidation', component: 'BankConfigEditor', section: 'bt' },
    { id: 'credit-score', icon: <Shield size={18} stroke="#00d4ff" />, label: 'Risk Assessment', component: 'BankConfigEditor', section: 'creditScore' },
    { id: 'employment', icon: <Zap size={18} stroke="#00d4ff" />, label: 'Employment Credentialing', component: 'BankConfigEditor', section: 'employment' },
    { id: 'govt-policy', icon: <ShieldCheck size={18} stroke="#00d4ff" />, label: 'Government Policies', component: 'BankConfigEditor', section: 'govt-policy' },
    { id: 'incentive-policy', icon: <TrendingUp size={18} stroke="#00ff88" />, label: 'Incentive Master Stroke', component: 'BankConfigEditor', section: 'incentive-policy' },
    { id: 'documents', icon: <FileText size={18} stroke="#00d4ff" />, label: 'Documentation Protocol', component: 'BankConfigEditor', section: 'documents' },
    { id: 'special', icon: <Zap size={18} stroke="#00d4ff" />, label: 'Exceptional Policies', component: 'BankConfigEditor', section: 'special' },
    { id: 'fees', icon: <Zap size={18} stroke="#00d4ff" />, label: 'Fee Schedules', component: 'BankConfigEditor', section: 'fees' },
    { id: 'company-db', icon: <Database size={18} stroke="#00ff88" />, label: 'Company Database', component: 'BankConfigEditor', section: 'company-db' },

    { id: 'user-management', icon: <UserPlus size={18} stroke="#00d4ff" />, label: 'Nexus Control', component: 'UserManager' },
    { id: 'profile-security', icon: <Settings size={18} stroke="#00d4ff" />, label: 'Profile & Security', component: 'ProfileSecurity' },
    { id: 'analytics', icon: <BarChart2 size={18} stroke="#00d4ff" />, label: 'Strategic Analytics', component: 'Analytics' },
    { id: 'import-export', icon: <ShieldCheck size={18} stroke="#00d4ff" />, label: 'Data Migration', component: 'ImportExport' },
    { id: 'audit', icon: <ShieldCheck size={18} stroke="#00d4ff" />, label: 'Governance Logs', component: 'AuditLog' }
  ];

  const renderContent = () => {
    // Level 0 Dashboard: Global/Lead Management (No Hierarchy Required)
    if (activeMenu === 'leads') return <LeadManager userRole={user.role} />;
    if (activeMenu === 'blog') return <BlogManager />;
    if (activeMenu === 'user-management') return <UserManager />;
    if (activeMenu === 'profile-security') return <ProfileSecurity />;
    if (activeMenu === 'analytics') return <Analytics />;
    if (activeMenu === 'import-export') return <ImportExport />;
    if (activeMenu === 'audit') return <AuditLog />;

    // 🛡️ HIERARCHY GATE 1: Location Selection (For all policy/bank menus)
    if (!selectedLocation.state || !selectedLocation.city) {
      return (
        <div className="hierarchy-placeholder">
          <div className="neural-card glass-panel">
            <div className="pulse-icon-container">
              <MapPin size={48} className="animate-pulse" color="#00d4ff" />
            </div>
            <h2>Geographical Context Required</h2>
            <p className="subtitle">Please select a State and City to activate local policy layers.</p>
            <div className="selector-wrapper mt-8">
              <AdminLocationSelector
                activeLocation={selectedLocation}
                onLocationChange={(loc) => setSelectedLocation(loc)}
              />
            </div>
            <div className="neural-handshake-status mt-6">
              <span className="dot"></span> Waiting for Location Lock...
            </div>
          </div>
        </div>
      );
    }

    // 🛡️ HIERARCHY GATE 2: Bank Selection (For granular editors)
    const isGranularEditor = ['config', 'categories', 'interest', 'loan-capping', 'age-rules', 'tenure', 'foir', 'multiplier', 'bt', 'credit-score', 'employment', 'govt-policy', 'incentive-policy', 'documents', 'special', 'fees', 'company-db'].includes(activeMenu);

    if (isGranularEditor && !selectedBank) {
      return (
        <div className="hierarchy-placeholder">
          <div className="neural-card glass-panel">
            <div className="pulse-icon-container">
              <Database size={48} className="animate-pulse" color="#00ff88" />
            </div>
            <h2>Institutional Target Required</h2>
            <p className="subtitle">Location Context: <strong>{selectedLocation.city}, {selectedLocation.state}</strong></p>
            <p className="hint">Initialize bank selection from the Institutional Overview to access policy editors.</p>
            <button className="btn-save mt-8" onClick={() => setActiveMenu('banks')}>
              Proceed to Institutional Overview
            </button>
          </div>
        </div>
      );
    }

    const activeItem = menuItems.find(item => item.id === activeMenu);

    // Filter custom banks based on current location
    const currentLocationString = selectedLocation.state ? `${selectedLocation.state}-${selectedLocation.city}` : 'Global';
    const filteredCustomBanks = customBanks.filter(bank => 
      !bank.location || bank.location === 'Global' || bank.location === currentLocationString
    );

    switch (activeItem?.component) {
      case 'BankList':
        return <BankList
          customBanks={filteredCustomBanks}
          onSelectBank={(bank) => {
            setSelectedBank(bank);
            setActiveMenu('config');
          }}
          onAddBank={() => setShowAddBankModal(true)}
          onDeleteCustomBank={(bankId) => {
            const updated = customBanks.filter(b => b.id !== bankId);
            setCustomBanks(updated);
            localStorage.setItem('laxmi_custom_banks', JSON.stringify(updated));
          }}
        />;
      case 'BankConfigEditor':
        return <BankConfigEditor
          selectedBank={selectedBank}
          section={activeItem.section}
          activeLocation={selectedLocation}
        />;
      default:
        return <div>Component under development</div>;
    }
  };

  if (loading) return <div className="neural-loading">Syncing Neural Networks...</div>;
  if (!user) return <AdminLogin onLoginSuccess={(u) => setUser(u)} onBack={onBackToCustomer} />;

  return (
    <div className="admin-dashboard professional-grid-bg">
      {showAddBankModal && (
        <AddBankModal
          onClose={() => setShowAddBankModal(false)}
          activeLocation={selectedLocation}
          onBankAdded={(newBank) => {
            const updated = [...customBanks, newBank];
            setCustomBanks(updated);
            localStorage.setItem('laxmi_custom_banks', JSON.stringify(updated));
          }}
        />
      )}

      <header className="dashboard-header glass-panel">
        <div className="header-content">
          <div className="header-left">
            <button className="btn-back-portal" onClick={onBackToCustomer}>← Return to Portal</button>
            <div className="neural-brand">LAXMI NEURAL CORE v2.0</div>
          </div>
          <div className="header-right">
            <div className="presence-metadata">
              {selectedLocation.state && (
                <div className="loc-badge">📍 {selectedLocation.city}, {selectedLocation.state}</div>
              )}
              <div className="user-entity-badge">
                <div className="entity-icon">👤</div>
                <div className="entity-info">
                  <span className="entity-name">{user.displayName || 'System Admin'}</span>
                  <span className={`entity-role ${user.role}`}>{user.role?.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <button className="btn-logout-neural" onClick={handleLogout} title="Sever Connection">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="dashboard-sidebar glass-panel">
          <div className="sidebar-scrollable">
            <div className="sidebar-group-label">PRIMARY CONTROL</div>
            <nav className="sidebar-menu">
              {menuItems.map(item => {
                // Role-based filtering
                if (user.role === 'employee' && !['leads', 'blog'].includes(item.id)) return null;
                if (item.id === 'user-management' && user.role !== 'ceo') return null;

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
            {selectedLocation.state && (
              <div className="sidebar-footer-action">
                <button className="btn-reset-context" onClick={() => { setSelectedLocation({ state: '', city: '' }); setSelectedBank(null); }}>
                  🔄 Reset Context
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="dashboard-main">
          {selectedBank && ['config', 'categories', 'interest', 'loan-capping', 'age-rules', 'tenure', 'foir', 'multiplier', 'bt', 'credit-score', 'employment', 'govt-policy', 'incentive-policy', 'documents', 'special', 'fees'].includes(activeMenu) && (
            <div className="active-context-banner glass-panel">
              <div className="context-visual">
                <span className="ctx-item">🏦 {selectedBank.name}</span>
                <span className="ctx-divider">|</span>
                <span className="ctx-item">📍 {selectedLocation.city}, {selectedLocation.state}</span>
              </div>
              <button className="btn-change-bank-small" onClick={() => setActiveMenu('banks')}>Change Institution</button>
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
