import { useState } from 'react';
import './AdminDashboard.css';
import BankList from './admin/BankList';
import BankConfigEditor from './admin/BankConfigEditor';
import Analytics from './admin/Analytics';
import ImportExport from './admin/ImportExport';
import AuditLog from './admin/AuditLog';
import AddBankModal from './admin/AddBankModal';
import LeadManager from './admin/LeadManager';
import AdminLocationSelector from './admin/AdminLocationSelector';

const AdminDashboard = ({ onBackToCustomer }) => {
  const [activeMenu, setActiveMenu] = useState('leads');
  const [selectedBank, setSelectedBank] = useState(null);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [customBanks, setCustomBanks] = useState([]);
  const [activeLocation, setActiveLocation] = useState({ state: '', city: '' });

  const menuItems = [
    { id: 'leads', icon: '', label: 'Customer Lead Pipeline', component: 'LeadManager' },
    { id: 'banks', icon: '', label: 'Institutional Overview', component: 'BankList' },
    { id: 'config', icon: '', label: 'Policy Configuration', component: 'BankConfigEditor' },
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
    { id: 'analytics', icon: '', label: 'Performance Analytics', component: 'Analytics' },
    { id: 'import-export', icon: '', label: 'Data Migration', component: 'ImportExport' },
    { id: 'audit', icon: '', label: 'Governance Logs', component: 'AuditLog' }
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
