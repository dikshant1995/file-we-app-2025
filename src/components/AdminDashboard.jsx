import { useState } from 'react';
import './AdminDashboard.css';
import BankList from './admin/BankList';
import BankConfigEditor from './admin/BankConfigEditor';
import Analytics from './admin/Analytics';
import ImportExport from './admin/ImportExport';
import AuditLog from './admin/AuditLog';
import AddBankModal from './admin/AddBankModal';
import LeadManager from './admin/LeadManager';
import BlogManager from './admin/BlogManager';
import AdminLocationSelector from './admin/AdminLocationSelector';
import AdminLogin from './admin/AdminLogin';
import {
  Users,
  Database,
  Settings,
  Layers,
  TrendingUp,
  Lock,
  Clock,
  ShieldCheck,
  FileText,
  Percent,
  Repeat,
  UserCheck,
  Briefcase,
  FileSignature,
  Zap,
  BarChart3,
  ArrowLeftRight,
  History,
  Target,
  Mail,
  Share2,
  Search,
  MessageCircle,
  Download
} from 'lucide-react';

const AdminDashboard = ({ onBackToCustomer }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [activeMenu, setActiveMenu] = useState('leads');
  const [selectedBank, setSelectedBank] = useState(null);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [customBanks, setCustomBanks] = useState([]);
  const [activeLocation, setActiveLocation] = useState({ state: '', city: '' });

  const menuItems = [
    { id: 'leads', icon: <Users size={18} />, label: 'Customer Lead Pipeline', component: 'LeadManager' },
    { id: 'banks', icon: <Database size={18} />, label: 'Institutional Overview', component: 'BankList' },
    { id: 'config', icon: <Settings size={18} />, label: 'Policy Configuration', component: 'BankConfigEditor' },
    { id: 'categories', icon: <Layers size={18} />, label: 'Categorization Models', component: 'BankConfigEditor', section: 'categories' },
    { id: 'interest', icon: <Percent size={18} />, label: 'Rate Structures', component: 'BankConfigEditor', section: 'interest' },
    { id: 'loan-capping', icon: <Lock size={18} />, label: 'Capital Capping', component: 'BankConfigEditor', section: 'loanCapping' },
    { id: 'age-rules', icon: <UserCheck size={18} />, label: 'Demographic Rules', component: 'BankConfigEditor', section: 'ageRules' },
    { id: 'tenure', icon: <Clock size={18} />, label: 'Tenure Optimization', component: 'BankConfigEditor', section: 'tenureRules' },
    { id: 'foir', icon: <Target size={18} />, label: 'FOIR Parameters', component: 'BankConfigEditor', section: 'foir' },
    { id: 'multiplier', icon: <Zap size={18} />, label: 'Multiplier Logic', component: 'BankConfigEditor', section: 'multiplier' },
    { id: 'bt', icon: <ArrowLeftRight size={18} />, label: 'Liability Consolidation', component: 'BankConfigEditor', section: 'bt' },
    { id: 'credit-score', icon: <ShieldCheck size={18} />, label: 'Risk Assessment', component: 'BankConfigEditor', section: 'creditScore' },
    { id: 'employment', icon: <Briefcase size={18} />, label: 'Employment Credentialing', component: 'BankConfigEditor', section: 'employment' },
    { id: 'documents', icon: <FileSignature size={18} />, label: 'Documentation Protocol', component: 'BankConfigEditor', section: 'documents' },
    { id: 'special', icon: <FileText size={18} />, label: 'Exceptional Policies', component: 'BankConfigEditor', section: 'special' },
    { id: 'fees', icon: <Percent size={18} />, label: 'Fee Schedules', component: 'BankConfigEditor', section: 'fees' },
    { id: 'analytics', icon: <BarChart3 size={18} />, label: 'Performance Analytics', component: 'Analytics' },
    { id: 'import-export', icon: <ArrowLeftRight size={18} />, label: 'Data Migration', component: 'ImportExport' },
    { id: 'blogs', icon: <FileText size={18} />, label: 'Financial Hub (Blogs)', component: 'BlogManager' },
    { id: 'audit', icon: <History size={18} />, label: 'Governance Logs', component: 'AuditLog' }
  ];

  const renderContent = () => {
    const activeItem = menuItems.find(item => item.id === activeMenu);

    switch (activeItem?.component) {
      case 'BankList':
        return <BankList
          customBanks={customBanks}
          activeLocation={activeLocation}
          onSelectBank={(bank) => {
            setSelectedBank(bank);
            setActiveMenu('config');
          }}
          onAddBank={() => setShowAddBankModal(true)}
        />;
      case 'LeadManager':
        return <LeadManager />;
      case 'BankConfigEditor':
        return <BankConfigEditor
          selectedBank={selectedBank}
          section={activeItem.section}
          activeLocation={activeLocation}
          onNavigate={(id) => setActiveMenu(id)}
        />;
      case 'Analytics':
        return <Analytics />;
      case 'ImportExport':
        return <ImportExport />;
      case 'BlogManager':
        return <BlogManager />;
      case 'AuditLog':
        return <AuditLog />;
      default:
        return <div>Select a menu item</div>;
    }
  };

  const handleBankAdded = (newBank) => {
    setCustomBanks([...customBanks, newBank]);
    alert(`Institution "${newBank.name}" initialized successfully with standard regulatory frameworks.\n\nYou may now proceed with granular policy configuration.`);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('admin_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

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
            <h1>Bank Governance & Policy Control</h1>
          </div>
          <div className="header-actions">
            <button className="btn-logout" onClick={handleLogout}>
              Secure Logout
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
              {menuItems.map(item => (
                <button
                  key={item.id}
                  className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main">
          <AdminLocationSelector
            activeLocation={activeLocation}
            onLocationChange={setActiveLocation}
          />

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
