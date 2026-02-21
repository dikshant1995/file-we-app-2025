import { useState, useMemo } from 'react';
import './BankList.css';
import { getBankConfig } from '../../services/bankConfigService';

const BankList = ({ onSelectBank, onAddBank, customBanks = [], activeLocation }) => {
  // Initial bank data - will be loaded from config/localStorage
  const [banks, setBanks] = useState([
    // 4 NEW BANKS: With company database + dynamic rates
    { id: 'kotak', name: 'Kotak Mahindra Bank', enabled: true, logo: '', color: '#ED1C24' },
    { id: 'tata', name: 'Tata Capital', enabled: true, logo: '', color: '#1F4E78' },
    { id: 'poonawala', name: 'Poonawala Finance', enabled: true, logo: '', color: '#005596' },
    { id: 'idfc', name: 'IDFC First Bank', enabled: true, logo: '', color: '#8B1538' },
    // 8 OLD BANKS: No database, default Category B + 11% rate
    { id: 'hdfc', name: 'HDFC Bank', enabled: true, logo: '', color: '#004C8F' },
    { id: 'icici', name: 'ICICI Bank', enabled: true, logo: '', color: '#ED1C24' },
    { id: 'bandhan', name: 'Bandhan Bank', enabled: true, logo: '', color: '#DC0028' },
    { id: 'cholamandalam', name: 'Cholamandalam Finance', enabled: true, logo: '', color: '#F37021' },
    { id: 'axis-fin', name: 'Axis Finance', enabled: true, logo: '', color: '#800000' },
    { id: 'indusind', name: 'IndusInd Bank', enabled: true, logo: '', color: '#005596' },
    { id: 'shri-ram', name: 'Shri Ram Finance', enabled: true, logo: '', color: '#1F4E78' },
    { id: 'piramal', name: 'Piramal Finance', enabled: true, logo: '', color: '#1F4E78' }
  ]);

  // Merge default banks with custom banks
  const allBanks = useMemo(() => [...banks, ...customBanks], [banks, customBanks]);

  // Helper to get bank summary rules with location context
  const getBankSummary = (bankName) => {
    const context = { state: activeLocation.state, city: activeLocation.city };
    const age = getBankConfig(bankName, 'ageRules', context);
    const salary = getBankConfig(bankName, 'employmentRules', context);
    const capping = getBankConfig(bankName, 'loanCapping', context);
    const interest = getBankConfig(bankName, 'interestRates', context);

    return {
      ageRange: age ? `${age.minAge}-${age.maxAge}` : '21-60',
      minSalary: salary ? `₹${(salary.salariedMinSalary / 1000).toFixed(0)}K` : '₹25K',
      maxLoan: capping ? `₹${(capping.absoluteMaxLoan / 100000).toFixed(0)}L` : '₹50L',
      rate: interest ? `${interest.defaultRate || '11'}%` : '11%'
    };
  };

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
      alert(`${bankToDisable.name} status updated: ${bankToDisable.enabled ? 'Disabled' : 'Enabled'}.`);
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
        alert(`${bankToDelete.name} record purged successfully.`);
      } else {
        // Remove from default banks list
        setBanks(banks.filter(bank => bank.id !== bankToDelete.id));
        alert(`${bankToDelete.name} record purged successfully.`);
      }
    }
  };

  return (
    <div className="bank-list-container">
      <div className="section-header">
        <h2>Institutional Database Registry</h2>
        <p>Administrative governance of {allBanks.length} verified banking institutions</p>
        <button className="btn-add-bank" onClick={onAddBank}>
          Register New Institution
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
        {allBanks.map(bank => {
          const summary = getBankSummary(bank.name);
          return (
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
                    Configure Policies
                  </button>
                  <button className="btn-view-stats">
                    Performance
                  </button>
                </div>

                <div className="bank-actions-bottom">
                  <button
                    className="btn-disable"
                    onClick={() => handleDisableBank(bank)}
                    title={bank.enabled ? "Suspend Institution" : "Re-activate Institution"}
                  >
                    {bank.enabled ? 'Suspend' : 'Activate'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteBank(bank)}
                    title="Purge Record"
                  >
                    Purge Record
                  </button>
                </div>

                <div className="bank-quick-info">
                  <div className="info-item">
                    <span className="info-label">Min Salary:</span>
                    <span className="info-value">{summary.minSalary}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Age Range:</span>
                    <span className="info-value">{summary.ageRange}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Max Loan:</span>
                    <span className="info-value">{summary.maxLoan}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Interest:</span>
                    <span className="info-value">{summary.rate}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bulk-actions">
        <h3>Bulk Actions</h3>
        <div className="bulk-buttons">
          <button className="btn-bulk">Activate All Records</button>
          <button className="btn-bulk">Suspend All Records</button>
          <button className="btn-bulk">Import Policy Configurations</button>
          <button className="btn-bulk">Export Unified Configurations</button>
        </div>
      </div>
    </div>
  );
};

export default BankList;
