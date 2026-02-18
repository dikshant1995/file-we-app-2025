import { useState } from 'react';
import './AdminDashboard.css';
import BankList from './admin/BankList';
import BankConfigEditor from './admin/BankConfigEditor';
import Analytics from './admin/Analytics';
import ImportExport from './admin/ImportExport';
import AuditLog from './admin/AuditLog';
import AddBankModal from './admin/AddBankModal';

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('banks');
  const [selectedBank, setSelectedBank] = useState(null);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [customBanks, setCustomBanks] = useState([]);

  const menuItems = [
    { id: 'banks', icon: '🏦', label: 'Banks Overview', component: 'BankList' },
    { id: 'config', icon: '⚙️', label: 'Bank Configuration', component: 'BankConfigEditor' },
    { id: 'categories', icon: '📊', label: 'Categories (A/B/C/D)', component: 'BankConfigEditor', section: 'categories' },
    { id: 'interest', icon: '📈', label: 'Interest Rates', component: 'BankConfigEditor', section: 'interest' },
    { id: 'loan-capping', icon: '💰', label: 'Loan Amount Capping', component: 'BankConfigEditor', section: 'loanCapping' },
    { id: 'age-rules', icon: '🎂', label: 'Age-Based Rules', component: 'BankConfigEditor', section: 'ageRules' },
    { id: 'tenure', icon: '⏱️', label: 'Tenure Rules', component: 'BankConfigEditor', section: 'tenureRules' },
    { id: 'foir', icon: '📊', label: 'FOIR Settings', component: 'BankConfigEditor', section: 'foir' },
    { id: 'multiplier', icon: '🔢', label: 'Multiplier Rules', component: 'BankConfigEditor', section: 'multiplier' },
    { id: 'bt', icon: '🔄', label: 'Balance Transfer', component: 'BankConfigEditor', section: 'bt' },
    { id: 'credit-score', icon: '⭐', label: 'Credit Score Rules', component: 'BankConfigEditor', section: 'creditScore' },
    { id: 'employment', icon: '💼', label: 'Employment Rules', component: 'BankConfigEditor', section: 'employment' },
    { id: 'documents', icon: '📄', label: 'Document Requirements', component: 'BankConfigEditor', section: 'documents' },
    { id: 'special', icon: '🌟', label: 'Special Rules', component: 'BankConfigEditor', section: 'special' },
    { id: 'fees', icon: '💵', label: 'Fees & Charges', component: 'BankConfigEditor', section: 'fees' },
    { id: 'analytics', icon: '📊', label: 'Analytics & Reports', component: 'Analytics' },
    { id: 'import-export', icon: '📥', label: 'Import/Export', component: 'ImportExport' },
    { id: 'audit', icon: '📝', label: 'Audit Log', component: 'AuditLog' }
  ];

  const renderContent = () => {
    const activeItem = menuItems.find(item => item.id === activeMenu);
    
    switch(activeItem?.component) {
      case 'BankList':
        return <BankList 
          customBanks={customBanks}
          onSelectBank={(bank) => {
            setSelectedBank(bank);
            setActiveMenu('config');
          }} 
          onAddBank={() => setShowAddBankModal(true)}
        />;
      case 'BankConfigEditor':
        return <BankConfigEditor selectedBank={selectedBank} section={activeItem.section} />;
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
    alert(`✅ ${newBank.name} added successfully with all default policies!\n\nYou can now configure all settings for this bank.`);
  };

  return (
    <div className="admin-dashboard">
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
          <h1>🏦 Bank Configuration Dashboard</h1>
          <div className="header-actions">
            <button className="btn-save-all">💾 Save All Changes</button>
            <button className="btn-export">📤 Export Config</button>
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
