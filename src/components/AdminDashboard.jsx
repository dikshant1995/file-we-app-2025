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
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LogOut, User, Layout, FileText, MapPin, Settings, BarChart2, Database, ShieldCheck, Zap } from 'lucide-react';

const AdminDashboard = ({ onBackToCustomer }) => {
  const [activeMenu, setActiveMenu] = useState('leads');
  const [selectedBank, setSelectedBank] = useState(null);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [customBanks, setCustomBanks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState(null); // {state, city} or null for global

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
    { id: 'leads', icon: <Layout size={18} />, label: 'Customer Lead Pipeline', component: 'LeadManager' },
    { id: 'banks', icon: <Database size={18} />, label: 'Institutional Overview', component: 'BankList' },
    { id: 'locations', icon: <MapPin size={18} />, label: 'City-Wise Overrides', component: 'LocationOverrideManager' },
    { id: 'blog', icon: <FileText size={18} />, label: 'Neural Hub (Blogs)', component: 'BlogManager' },
    { id: 'experience', icon: <Zap size={18} />, label: 'Experience Protocol', component: 'ExperienceManager' },
    { id: 'config', icon: <Settings size={18} />, label: 'Generic Configuration', component: 'BankConfigEditor' },
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
    { id: 'analytics', icon: <BarChart2 size={18} />, label: 'Strategic Analytics', component: 'Analytics' },
    { id: 'import-export', icon: <ShieldCheck size={18} />, label: 'Data Governance', component: 'ImportExport' },
    { id: 'audit', icon: <ShieldCheck size={18} />, label: 'Governance Logs', component: 'AuditLog' }
  ];

  const renderContent = () => {
    const activeItem = menuItems.find(item => item.id === activeMenu);

    switch (activeItem?.component) {
      case 'BankList':
        return <BankList
          customBanks={customBanks}
          onSelectBank={(bank) => {
            setSelectedBank(bank);
            setActiveMenu('config');
          }}
          onAddBank={() => setShowAddBankModal(true)}
        />;
      case 'LeadManager':
        return <LeadManager userRole={user?.role} />;
      case 'BlogManager':
        return <BlogManager />;
      case 'ExperienceManager':
        return <ExperienceManager />;
      case 'LocationOverrideManager':
        return <LocationOverrideManager
          overrides={{}} // Future: integrate with Firestore
          activeLocation={activeLocation ? (activeLocation.city || activeLocation.state) : null}
          onSelectLocation={(loc) => {
            // loc is string from LocationOverrideManager
            if (!loc) setActiveLocation(null);
            else {
              // Basic heuristic: check if it's a state or city
              // For now, simpler to just pass it as an object
              setActiveLocation({ state: loc, city: loc });
            }
          }}
        />;
      case 'BankConfigEditor':
        return <BankConfigEditor
          selectedBank={selectedBank}
          section={activeItem.section}
          activeLocation={activeLocation || {}} // Ensure it's an object
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
    alert(`Institution "${newBank.name}" initialized successfully with standard regulatory frameworks.\n\nYou may now proceed with granular policy configuration.`);
  };

  return (
    <div className="admin-dashboard professional-grid-bg">
      {/* Add Bank Modal */}
      {showAddBankModal && (
        <AddBankModal
          onClose={() => setShowAddBankModal(false)}
          onBankAdded={handleBankAdded}
        />
      )}
      {/* Top Header */}
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
              <User size={16} />
              <span>{user.displayName || user.email}</span>
              <span className="role-tag">{user.role?.toUpperCase()}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-content">
            <h3>Navigation</h3>
            <nav className="sidebar-menu">
              {menuItems.map(item => {
                // Future: Role-based filtering of menu items
                if (user.role === 'employee' && item.id !== 'leads') return null;

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

        {/* Main Content Area */}
        <main className="dashboard-main">
          {selectedBank && activeMenu !== 'banks' && activeMenu !== 'analytics' && activeMenu !== 'import-export' && activeMenu !== 'audit' && (
            <div className="selected-bank-banner">
              <span>Editing: <strong>{selectedBank.name}</strong></span>
              <button className="btn-change-bank" onClick={() => setActiveMenu('banks')}>
                Change Bank
              </button>
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
