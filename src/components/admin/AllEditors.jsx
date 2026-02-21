import { useState, useEffect } from 'react';
import './ConfigEditor.css';
import { saveBankConfig, getBankConfig, getAllBankConfig } from '../../services/bankConfigService';

// Age Rules Editor
export const AgeRulesEditor = ({ bank, onSave, activeLocation }) => {
  const [config, setConfig] = useState({
    minAge: 21,
    maxAge: 60,
    retirementAge: 60
  });
  const [locationOverrides, setLocationOverrides] = useState({});

  useEffect(() => {
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.ageRules || {});

    const savedConfig = getBankConfig(bank.name, 'ageRules', { state: activeLocation.state, city: activeLocation.city });
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, activeLocation]);

  const handleSave = () => {
    const locationKey = activeLocation.city || activeLocation.state || null;
    if (saveBankConfig(bank.name, 'ageRules', config, locationKey)) {
      onSave && onSave(config);
      alert(`✅ Age rules saved for ${bank.name} (${locationKey || 'All India'})!`);
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: config });
      }
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Demographic Eligibility Rules - {bank.name}</h2>
        <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
      </div>

      <div className="existing-overrides-badges">
        <span className="badge-label">Available Overrides:</span>
        {Object.keys(locationOverrides).length > 0 ? (
          Object.keys(locationOverrides).map(loc => (
            <span key={loc} className={`loc-badge ${(activeLocation.state === loc || activeLocation.city === loc) ? 'active' : ''}`}>
              📍 {loc}
            </span>
          ))
        ) : (
          <span className="no-overrides">No location rules set yet.</span>
        )}
      </div>

      <div className="config-section">
        <div className="category-grid">
          <div className="input-group">
            <label>Minimum Age</label>
            <input type="number" value={config.minAge} onChange={(e) => setConfig({ ...config, minAge: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Maximum Age</label>
            <input type="number" value={config.maxAge} onChange={(e) => setConfig({ ...config, maxAge: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Retirement Age</label>
            <input type="number" value={config.retirementAge} onChange={(e) => setConfig({ ...config, retirementAge: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Max Age at Loan End</label>
            <input type="number" value={config.maxAgeAtLoanEnd} onChange={(e) => setConfig({ ...config, maxAgeAtLoanEnd: parseInt(e.target.value) })} className="config-input" />
          </div>
        </div>
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>Commit Changes</button>
      </div>
    </div>
  );
};

// Tenure Rules Editor
export const TenureRulesEditor = ({ bank, onSave, activeLocation }) => {
  const [config, setConfig] = useState({
    minTenureMonths: 12,
    maxTenureMonths: 84,
    categoryBasedMaxTenure: { A: 84, B: 84, C: 72, D: 60 }
  });
  const [locationOverrides, setLocationOverrides] = useState({});

  useEffect(() => {
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.tenureRules || {});

    const savedConfig = getBankConfig(bank.name, 'tenureRules', { state: activeLocation.state, city: activeLocation.city });
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, activeLocation]);

  const handleSave = () => {
    const locationKey = activeLocation.city || activeLocation.state || null;
    if (saveBankConfig(bank.name, 'tenureRules', config, locationKey)) {
      onSave && onSave(config);
      alert(`✅ Tenure rules saved for ${bank.name} (${locationKey || 'All India'})!`);
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: config });
      }
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Tenure Optimization Logic - {bank.name}</h2>
        <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
      </div>

      <div className="existing-overrides-badges">
        <span className="badge-label">Available Overrides:</span>
        {Object.keys(locationOverrides).length > 0 ? (
          Object.keys(locationOverrides).map(loc => (
            <span key={loc} className={`loc-badge ${(activeLocation.state === loc || activeLocation.city === loc) ? 'active' : ''}`}>
              📍 {loc}
            </span>
          ))
        ) : (
          <span className="no-overrides">No location rules set yet.</span>
        )}
      </div>

      <div className="config-section">
        <div className="category-grid">
          <div className="input-group">
            <label>Min Tenure (Months)</label>
            <input type="number" value={config.minTenureMonths} onChange={(e) => setConfig({ ...config, minTenureMonths: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Max Tenure (Months)</label>
            <input type="number" value={config.maxTenureMonths} onChange={(e) => setConfig({ ...config, maxTenureMonths: parseInt(e.target.value) })} className="config-input" />
          </div>
          {Object.keys(config.categoryBasedMaxTenure).map(cat => (
            <div key={cat} className="input-group">
              <label>Category {cat} Max (Months)</label>
              <input type="number" value={config.categoryBasedMaxTenure[cat]} onChange={(e) => setConfig({ ...config, categoryBasedMaxTenure: { ...config.categoryBasedMaxTenure, [cat]: parseInt(e.target.value) } })} className="config-input" />
            </div>
          ))}
        </div>
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>Commit Changes</button>
      </div>
    </div>
  );
};

// FOIR Editor
export const FoirEditor = ({ bank, onSave, activeLocation }) => {
  const [config, setConfig] = useState({
    minSalary: 25000,
    foirPercentage: 50,
    rentCorrection: 0
  });
  const [locationOverrides, setLocationOverrides] = useState({});

  useEffect(() => {
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.foir || {});

    const savedConfig = getBankConfig(bank.name, 'foir', { state: activeLocation.state, city: activeLocation.city });
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, activeLocation]);

  const handleSave = () => {
    const locationKey = activeLocation.city || activeLocation.state || null;
    if (saveBankConfig(bank.name, 'foir', config, locationKey)) {
      onSave && onSave(config);
      alert(`✅ FOIR rules saved for ${bank.name} (${locationKey || 'All India'})!`);
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: config });
      }
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>FOIR & Obligation Parameters - {bank.name}</h2>
        <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
      </div>

      <div className="existing-overrides-badges">
        <span className="badge-label">Available Overrides:</span>
        {Object.keys(locationOverrides).length > 0 ? (
          Object.keys(locationOverrides).map(loc => (
            <span key={loc} className={`loc-badge ${(activeLocation.state === loc || activeLocation.city === loc) ? 'active' : ''}`}>
              📍 {loc}
            </span>
          ))
        ) : (
          <span className="no-overrides">No location rules set yet.</span>
        )}
      </div>

      <div className="config-section">
        <div className="category-grid">
          <div className="input-group">
            <label>Minimum Salary</label>
            <input type="number" value={config.minSalary} onChange={(e) => setConfig({ ...config, minSalary: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>FOIR Percentage</label>
            <input type="number" value={config.foirPercentage} onChange={(e) => setConfig({ ...config, foirPercentage: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Rent Correction</label>
            <input type="number" value={config.rentCorrection} onChange={(e) => setConfig({ ...config, rentCorrection: parseInt(e.target.value) })} className="config-input" />
          </div>
        </div>
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>Commit Changes</button>
      </div>
    </div>
  );
};

// Multiplier Editor
export const MultiplierEditor = ({ bank, onSave, activeLocation }) => {
  const [config, setConfig] = useState({
    multiplierValue: 10,
    maxMultiplier: 25
  });
  const [locationOverrides, setLocationOverrides] = useState({});

  useEffect(() => {
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.multiplier || {});

    const savedConfig = getBankConfig(bank.name, 'multiplier', { state: activeLocation.state, city: activeLocation.city });
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, activeLocation]);

  const handleSave = () => {
    const locationKey = activeLocation.city || activeLocation.state || null;
    if (saveBankConfig(bank.name, 'multiplier', config, locationKey)) {
      onSave && onSave(config);
      alert(`✅ Multiplier rules saved for ${bank.name} (${locationKey || 'All India'})!`);
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: config });
      }
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Multiplier & Yield Logic - {bank.name}</h2>
        <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
      </div>

      <div className="existing-overrides-badges">
        <span className="badge-label">Available Overrides:</span>
        {Object.keys(locationOverrides).length > 0 ? (
          Object.keys(locationOverrides).map(loc => (
            <span key={loc} className={`loc-badge ${(activeLocation.state === loc || activeLocation.city === loc) ? 'active' : ''}`}>
              📍 {loc}
            </span>
          ))
        ) : (
          <span className="no-overrides">No location rules set yet.</span>
        )}
      </div>

      <div className="config-section">
        <div className="category-grid">
          <div className="input-group">
            <label>Multiplier Value</label>
            <input type="number" value={config.multiplierValue} onChange={(e) => setConfig({ ...config, multiplierValue: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Max Multiplier</label>
            <input type="number" value={config.maxMultiplier} onChange={(e) => setConfig({ ...config, maxMultiplier: parseInt(e.target.value) })} className="config-input" />
          </div>
        </div>
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>Commit Changes</button>
      </div>
    </div>
  );
};

// BT Configuration Editor
export const BTEditor = ({ bank, onSave, activeLocation }) => {
  const [config, setConfig] = useState({
    enabled: true,
    maxLoansForBT: 3,
    creditCardBTSupported: true,
    topUpAllowed: true,
    processingFeePercentage: 1.5
  });
  const [locationOverrides, setLocationOverrides] = useState({});

  useEffect(() => {
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.btConfiguration || {});

    const savedConfig = getBankConfig(bank.name, 'btConfiguration', { state: activeLocation.state, city: activeLocation.city });
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, activeLocation]);

  const handleSave = () => {
    const locationKey = activeLocation.city || activeLocation.state || null;
    if (saveBankConfig(bank.name, 'btConfiguration', config, locationKey)) {
      onSave && onSave(config);
      alert(`✅ BT configuration saved for ${bank.name} (${locationKey || 'All India'})!`);
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: config });
      }
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Liability Consolidation Protocol - {bank.name}</h2>
        <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
      </div>

      <div className="existing-overrides-badges">
        <span className="badge-label">Available Overrides:</span>
        {Object.keys(locationOverrides).length > 0 ? (
          Object.keys(locationOverrides).map(loc => (
            <span key={loc} className={`loc-badge ${(activeLocation.state === loc || activeLocation.city === loc) ? 'active' : ''}`}>
              📍 {loc}
            </span>
          ))
        ) : (
          <span className="no-overrides">No location rules set yet.</span>
        )}
      </div>

      <div className="config-section">
        <div className="category-grid">
          <div className="input-group">
            <label>Enable BT</label>
            <select value={config.enabled} onChange={(e) => setConfig({ ...config, enabled: e.target.value === 'true' })} className="config-input">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="input-group">
            <label>Max Loans for BT</label>
            <input type="number" value={config.maxLoansForBT} onChange={(e) => setConfig({ ...config, maxLoansForBT: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Credit Card BT</label>
            <select value={config.creditCardBTSupported} onChange={(e) => setConfig({ ...config, creditCardBTSupported: e.target.value === 'true' })} className="config-input">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="input-group">
            <label>Processing Fee %</label>
            <input type="number" step="0.1" value={config.processingFeePercentage} onChange={(e) => setConfig({ ...config, processingFeePercentage: parseFloat(e.target.value) })} className="config-input" />
          </div>
        </div>
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>Commit Changes</button>
      </div>
    </div>
  );
};

// Credit Score Editor
export const CreditScoreEditor = ({ bank, onSave, activeLocation }) => {
  const [config, setConfig] = useState({
    minCreditScore: 650,
    recommendedScore: 700,
    premiumScore: 750,
    autoRejectionThreshold: 600
  });
  const [locationOverrides, setLocationOverrides] = useState({});

  useEffect(() => {
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.creditScoreRules || {});

    const savedConfig = getBankConfig(bank.name, 'creditScoreRules', { state: activeLocation.state, city: activeLocation.city });
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, activeLocation]);

  const handleSave = () => {
    const locationKey = activeLocation.city || activeLocation.state || null;
    if (saveBankConfig(bank.name, 'creditScoreRules', config, locationKey)) {
      onSave && onSave(config);
      alert(`✅ Credit score rules saved for ${bank.name} (${locationKey || 'All India'})!`);
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: config });
      }
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Risk Assessment Framework - {bank.name}</h2>
        <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
      </div>

      <div className="existing-overrides-badges">
        <span className="badge-label">Available Overrides:</span>
        {Object.keys(locationOverrides).length > 0 ? (
          Object.keys(locationOverrides).map(loc => (
            <span key={loc} className={`loc-badge ${(activeLocation.state === loc || activeLocation.city === loc) ? 'active' : ''}`}>
              📍 {loc}
            </span>
          ))
        ) : (
          <span className="no-overrides">No location rules set yet.</span>
        )}
      </div>

      <div className="config-section">
        <div className="category-grid">
          <div className="input-group">
            <label>Minimum Score</label>
            <input type="number" value={config.minCreditScore} onChange={(e) => setConfig({ ...config, minCreditScore: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Recommended Score</label>
            <input type="number" value={config.recommendedScore} onChange={(e) => setConfig({ ...config, recommendedScore: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Premium Score</label>
            <input type="number" value={config.premiumScore} onChange={(e) => setConfig({ ...config, premiumScore: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Auto-Reject Below</label>
            <input type="number" value={config.autoRejectionThreshold} onChange={(e) => setConfig({ ...config, autoRejectionThreshold: parseInt(e.target.value) })} className="config-input" />
          </div>
        </div>
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>Commit Changes</button>
      </div>
    </div>
  );
};

// Employment Editor
export const EmploymentEditor = ({ bank, onSave, activeLocation }) => {
  const [config, setConfig] = useState({
    salariedMinSalary: 25000,
    selfEmployedMinIncome: 300000,
    itrYearsRequired: 2
  });
  const [locationOverrides, setLocationOverrides] = useState({});

  useEffect(() => {
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.employmentRules || {});

    const savedConfig = getBankConfig(bank.name, 'employmentRules', { state: activeLocation.state, city: activeLocation.city });
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, activeLocation]);

  const handleSave = () => {
    const locationKey = activeLocation.city || activeLocation.state || null;
    if (saveBankConfig(bank.name, 'employmentRules', config, locationKey)) {
      onSave && onSave(config);
      alert(`✅ Employment rules saved for ${bank.name} (${locationKey || 'All India'})!`);
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: config });
      }
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Employment Parameters - {bank.name}</h2>
        <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
      </div>

      <div className="existing-overrides-badges">
        <span className="badge-label">Available Overrides:</span>
        {Object.keys(locationOverrides).length > 0 ? (
          Object.keys(locationOverrides).map(loc => (
            <span key={loc} className={`loc-badge ${(activeLocation.state === loc || activeLocation.city === loc) ? 'active' : ''}`}>
              📍 {loc}
            </span>
          ))
        ) : (
          <span className="no-overrides">No location rules set yet.</span>
        )}
      </div>

      <div className="config-section">
        <div className="category-grid">
          <div className="input-group">
            <label>Min Salary (Salaried)</label>
            <input type="number" value={config.salariedMinSalary} onChange={(e) => setConfig({ ...config, salariedMinSalary: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Min Income (Self-Employed)</label>
            <input type="number" value={config.selfEmployedMinIncome} onChange={(e) => setConfig({ ...config, selfEmployedMinIncome: parseInt(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>ITR Years Required</label>
            <input type="number" value={config.itrYearsRequired} onChange={(e) => setConfig({ ...config, itrYearsRequired: parseInt(e.target.value) })} className="config-input" />
          </div>
        </div>
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>Commit Changes</button>
      </div>
    </div>
  );
};

// Fees Editor
export const FeesEditor = ({ bank, onSave, activeLocation }) => {
  const [config, setConfig] = useState({
    processingFeePercentage: 3.5,
    btChargesPercentage: 1.5,
    prepaymentChargesPercentage: 4
  });
  const [locationOverrides, setLocationOverrides] = useState({});

  useEffect(() => {
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.feesAndCharges || {});

    const savedConfig = getBankConfig(bank.name, 'feesAndCharges', { state: activeLocation.state, city: activeLocation.city });
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, activeLocation]);

  const handleSave = () => {
    const locationKey = activeLocation.city || activeLocation.state || null;
    if (saveBankConfig(bank.name, 'feesAndCharges', config, locationKey)) {
      onSave && onSave(config);
      alert(`✅ Fees saved for ${bank.name} (${locationKey || 'All India'})!`);
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: config });
      }
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Institutional Fee Schedules - {bank.name}</h2>
        <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
      </div>

      <div className="existing-overrides-badges">
        <span className="badge-label">Available Overrides:</span>
        {Object.keys(locationOverrides).length > 0 ? (
          Object.keys(locationOverrides).map(loc => (
            <span key={loc} className={`loc-badge ${(activeLocation.state === loc || activeLocation.city === loc) ? 'active' : ''}`}>
              📍 {loc}
            </span>
          ))
        ) : (
          <span className="no-overrides">No location rules set yet.</span>
        )}
      </div>

      <div className="config-section">
        <div className="category-grid">
          <div className="input-group">
            <label>Processing Fee %</label>
            <input type="number" step="0.1" value={config.processingFeePercentage} onChange={(e) => setConfig({ ...config, processingFeePercentage: parseFloat(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>BT Charges %</label>
            <input type="number" step="0.1" value={config.btChargesPercentage} onChange={(e) => setConfig({ ...config, btChargesPercentage: parseFloat(e.target.value) })} className="config-input" />
          </div>
          <div className="input-group">
            <label>Prepayment Charges %</label>
            <input type="number" step="0.1" value={config.prepaymentChargesPercentage} onChange={(e) => setConfig({ ...config, prepaymentChargesPercentage: parseFloat(e.target.value) })} className="config-input" />
          </div>
        </div>
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>Commit Changes</button>
      </div>
    </div>
  );
};

export const DocumentsEditor = ({ bank, onSave, activeLocation }) => (
  <div className="config-editor">
    <div className="editor-header">
      <h2>Documentation Compliance Protocol - {bank.name}</h2>
      <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
    </div>
    <div className="config-section">
      <p>Document configuration interface coming soon. Currently using default requirements.</p>
    </div>
  </div>
);

export const SpecialRulesEditor = ({ bank, onSave, activeLocation }) => (
  <div className="config-editor">
    <div className="editor-header">
      <h2>Exceptional Policy Framework - {bank.name}</h2>
      <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
    </div>
    <div className="config-section">
      <p>Special rules interface coming soon. Currently using default rules.</p>
    </div>
  </div>
);
