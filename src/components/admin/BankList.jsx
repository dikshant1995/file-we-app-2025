import { useState } from 'react';
import './BankList.css';

const BankList = ({ onSelectBank, onAddBank, customBanks = [] }) => {
  // Initial bank data - will be loaded from config/localStorage
  const [banks, setBanks] = useState([
    // 4 NEW BANKS: With company database + dynamic rates
    { id: 'kotak', name: 'Kotak Mahindra Bank', enabled: true, logo: '🏦', color: '#ED1C24' },
    { id: 'tata', name: 'Tata Capital', enabled: true, logo: '🏦', color: '#1F4E78' },
    { id: 'poonawala', name: 'Poonawala Finance', enabled: true, logo: '🏦', color: '#005596' },
    { id: 'idfc', name: 'IDFC First Bank', enabled: true, logo: '🏦', color: '#8B1538' },
    // 8 OLD BANKS: No database, default Category B + 11% rate
    { id: 'hdfc', name: 'HDFC Bank', enabled: true, logo: '🏦', color: '#004C8F' },
    { id: 'icici', name: 'ICICI Bank', enabled: true, logo: '🏦', color: '#ED1C24' },
    { id: 'bandhan', name: 'Bandhan Bank', enabled: true, logo: '🏦', color: '#DC0028' },
    { id: 'cholamandalam', name: 'Cholamandalam Finance', enabled: true, logo: '🏦', color: '#F37021' },
    { id: 'axis-fin', name: 'Axis Finance', enabled: true, logo: '🏦', color: '#800000' },
    { id: 'indusind', name: 'IndusInd Bank', enabled: true, logo: '🏦', color: '#005596' },
    { id: 'shri-ram', name: 'Shri Ram Finance', enabled: true, logo: '🏦', color: '#1F4E78' },
    { id: 'piramal', name: 'Piramal Finance', enabled: true, logo: '🏦', color: '#1F4E78' }
  ]);

  // Merge default banks with custom banks
  const allBanks = [...banks, ...customBanks];

  const toggleBankStatus = (bankId) => {
    setBanks(banks.map(bank => 
      bank.id === bankId ? { ...bank, enabled: !bank.enabled } : bank
    ));
  };

  const handleDisableBank = (bankToDisable) => {
    if (window.confirm(`Are you sure you want to ${bankToDisable.enabled ? 'disable' : 'enable'} ${bankToDisable.name}?\n\nThis will ${bankToDisable.enabled ? 'stop' : 'allow'} customers from seeing this bank in loan calculations.`)) {
      setBanks(banks.map(bank => 
        bank.id === bankToDisable.id ? { ...bank, enabled: !bank.enabled } : bank
      ));
      alert(`✅ ${bankToDisable.name} has been ${bankToDisable.enabled ? 'disabled' : 'enabled'}!`);
    }
  };

  const handleDeleteBank = (bankToDelete) => {
    if (window.confirm(`⚠️ PERMANENT DELETE WARNING

Are you sure you want to DELETE ${bankToDelete.name}?

This will:
• Remove the bank completely
• Delete ALL configurations
• Cannot be undone

Click OK to permanently delete.`)) {
      // Remove from custom banks if it's a custom bank
      if (customBanks.some(b => b.id === bankToDelete.id)) {
        // This will be handled by parent component
        alert(`✅ ${bankToDelete.name} deleted permanently!`);
      } else {
        // Remove from default banks list
        setBanks(banks.filter(bank => bank.id !== bankToDelete.id));
        alert(`✅ ${bankToDelete.name} deleted successfully!`);
      }
    }
  };

  return (
    <div className="bank-list-container">
      <div className="section-header">
        <h2>🏦 All Banks Overview</h2>
        <p>Manage all {allBanks.length} banks and their configurations</p>
        <button className="btn-add-bank" onClick={onAddBank}>
          ➕ Add New Bank
        </button>
      </div>

      <div className="banks-stats">
        <div className="stat-card">
          <div className="stat-value">{allBanks.length}</div>
          <div className="stat-label">Total Banks</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{allBanks.filter(b => b.enabled).length}</div>
          <div className="stat-label">Active Banks</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{allBanks.filter(b => !b.enabled).length}</div>
          <div className="stat-label">Disabled Banks</div>
        </div>
      </div>

      <div className="banks-grid">
        {allBanks.map(bank => (
          <div 
            key={bank.id} 
            className={`bank-card ${!bank.enabled ? 'disabled' : ''}`}
          >
            <div className="bank-card-header" style={{ background: bank.color }}>
              <div className="bank-logo">{bank.logo}</div>
              <div className="bank-status">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={bank.enabled}
                    onChange={() => toggleBankStatus(bank.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="bank-card-body">
              <h3>{bank.name}</h3>
              <div className="bank-id">ID: {bank.id}</div>
              
              <div className="bank-actions">
                <button 
                  className="btn-configure"
                  onClick={() => onSelectBank(bank)}
                  disabled={!bank.enabled}
                >
                  ⚙️ Configure
                </button>
                <button className="btn-view-stats">
                  📊 Stats
                </button>
              </div>

              <div className="bank-actions-bottom">
                <button 
                  className="btn-disable"
                  onClick={() => handleDisableBank(bank)}
                  title={bank.enabled ? "Disable Bank" : "Enable Bank"}
                >
                  {bank.enabled ? '⛔ Disable' : '✅ Enable'}
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteBank(bank)}
                  title="Delete Bank Permanently"
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="bank-quick-info">
                <div className="info-item">
                  <span className="info-label">Categories:</span>
                  <span className="info-value">A, B, C, D</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Interest Rate:</span>
                  <span className="info-value">11%</span>
                </div>
                <div className="info-item">
                  <span className="info-label">BT Support:</span>
                  <span className="info-value">✅ Yes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bulk-actions">
        <h3>Bulk Actions</h3>
        <div className="bulk-buttons">
          <button className="btn-bulk">✅ Enable All Banks</button>
          <button className="btn-bulk">❌ Disable All Banks</button>
          <button className="btn-bulk">📥 Import Bank Config</button>
          <button className="btn-bulk">📤 Export All Configs</button>
        </div>
      </div>
    </div>
  );
};

export default BankList;
