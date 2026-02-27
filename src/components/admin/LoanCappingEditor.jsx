import { useState, useEffect } from 'react';
import './ConfigEditor.css';
import { saveBankConfig, getBankConfig, getAllBankConfig } from '../../services/bankConfigService';

const LoanCappingEditor = ({ bank, onSave, activeLocation }) => {
  const [config, setConfig] = useState({
    absoluteMaxLoan: 5000000,
    categoryBasedMax: { A: null, B: 3000000, C: 2000000, D: 1000000 },
    employmentTypeMax: { salaried: null, selfEmployed: 3000000 },
    bachelorCapping: { enabled: true, percentage: 50 },
    minLoanAmount: 100000
  });
  const [locationOverrides, setLocationOverrides] = useState({});

  // Load saved config on mount or when bank/location prop changes
  useEffect(() => {
    // 1. Load full bank config to get available overrides
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.loanCapping || {});

    // 2. Load specific config based on activeLocation
    const context = {
      state: activeLocation ? activeLocation.state : null,
      city: activeLocation ? activeLocation.city : null
    };
    const savedConfig = getBankConfig(bank.name, 'loanCapping', context);

    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, [bank.name, activeLocation]);

  const handleSave = () => {
    const locationKey = activeLocation ? (activeLocation.city || activeLocation.state) : null;
    const success = saveBankConfig(bank.name, 'loanCapping', config, locationKey);
    if (success) {
      onSave && onSave(config);
      alert(`✅ Loan capping rules saved for ${bank.name} (${locationKey || 'All India'})!`);

      // Refresh overrides list if we added a new one
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: config });
      }
    } else {
      alert(`❌ Failed to save. Please try again.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>💰 Loan Amount Capping - {bank.name}</h2>
        <p>Configuring for: <strong>{activeLocation ? (activeLocation.city || activeLocation.state) : 'All India (National)'}</strong></p>
      </div>

      <div className="existing-overrides-badges">
        <span className="badge-label">Available Overrides (this section):</span>
        {Object.keys(locationOverrides).length > 0 ? (
          Object.keys(locationOverrides).map(loc => (
            <span key={loc} className={`loc-badge ${(activeLocation && (activeLocation.state === loc || activeLocation.city === loc)) ? 'active' : ''}`}>
              📍 {loc}
            </span>
          ))
        ) : (
          <span className="no-overrides">No location rules set yet. Use the top selector to add.</span>
        )}
      </div>

      {/* Absolute Max & Min */}
      <div className="config-section">
        <h3>🎯 Absolute Limits</h3>
        <div className="category-grid">
          <div className="input-group">
            <label>Absolute Maximum Loan (₹)</label>
            <input
              type="number"
              value={config.absoluteMaxLoan}
              onChange={(e) => setConfig({ ...config, absoluteMaxLoan: parseInt(e.target.value) })}
              className="config-input"
            />
            <span className="input-hint">No loan can exceed this amount</span>
          </div>

          <div className="input-group">
            <label>Minimum Loan Amount (₹)</label>
            <input
              type="number"
              value={config.minLoanAmount}
              onChange={(e) => setConfig({ ...config, minLoanAmount: parseInt(e.target.value) })}
              className="config-input"
            />
            <span className="input-hint">Reject loans below this amount</span>
          </div>
        </div>
      </div>

      {/* Category-Based Max */}
      <div className="config-section">
        <h3>📊 Category-Based Maximum</h3>
        <div className="category-grid">
          {Object.keys(config.categoryBasedMax).map(cat => (
            <div key={cat} className="input-group">
              <label>Category {cat} Max (₹)</label>
              <input
                type="number"
                value={config.categoryBasedMax[cat] || ''}
                onChange={(e) => setConfig({
                  ...config,
                  categoryBasedMax: {
                    ...config.categoryBasedMax,
                    [cat]: e.target.value === '' ? null : parseInt(e.target.value)
                  }
                })}
                className="config-input"
                placeholder="No limit"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Employment Type Max */}
      <div className="config-section">
        <h3>💼 Employment Type Limits</h3>
        <div className="category-grid">
          <div className="input-group">
            <label>Salaried Max (₹)</label>
            <input
              type="number"
              value={config.employmentTypeMax.salaried || ''}
              onChange={(e) => setConfig({
                ...config,
                employmentTypeMax: {
                  ...config.employmentTypeMax,
                  salaried: e.target.value === '' ? null : parseInt(e.target.value)
                }
              })}
              className="config-input"
              placeholder="No limit"
            />
          </div>

          <div className="input-group">
            <label>Self-Employed Max (₹)</label>
            <input
              type="number"
              value={config.employmentTypeMax.selfEmployed || ''}
              onChange={(e) => setConfig({
                ...config,
                employmentTypeMax: {
                  ...config.employmentTypeMax,
                  selfEmployed: e.target.value === '' ? null : parseInt(e.target.value)
                }
              })}
              className="config-input"
              placeholder="No limit"
            />
          </div>
        </div>
      </div>

      {/* Bachelor Capping */}
      <div className="config-section">
        <h3>👨 Bachelor/Unmarried Capping</h3>
        <div className="category-grid">
          <div className="input-group">
            <label>Enable Bachelor Capping</label>
            <select
              value={config.bachelorCapping.enabled}
              onChange={(e) => setConfig({
                ...config,
                bachelorCapping: {
                  ...config.bachelorCapping,
                  enabled: e.target.value === 'true'
                }
              })}
              className="config-input"
            >
              <option value="true">Yes - Apply Capping</option>
              <option value="false">No - No Capping</option>
            </select>
          </div>

          <div className="input-group">
            <label>Bachelor Capping %</label>
            <input
              type="number"
              value={config.bachelorCapping.percentage}
              onChange={(e) => setConfig({
                ...config,
                bachelorCapping: {
                  ...config.bachelorCapping,
                  percentage: parseInt(e.target.value)
                }
              })}
              className="config-input"
              disabled={!config.bachelorCapping.enabled}
            />
            <span className="input-hint">% of regular loan amount</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="config-preview">
        <h3>👀 Preview</h3>
        <div className="preview-grid">
          <div className="preview-card">
            <div className="preview-label">Absolute Max</div>
            <div className="preview-value">₹{(config.absoluteMaxLoan / 100000).toFixed(0)}L</div>
          </div>
          <div className="preview-card">
            <div className="preview-label">Minimum Loan</div>
            <div className="preview-value">₹{(config.minLoanAmount / 100000).toFixed(0)}L</div>
          </div>
          <div className="preview-card">
            <div className="preview-label">Bachelor Capping</div>
            <div className="preview-value">{config.bachelorCapping.enabled ? config.bachelorCapping.percentage + '%' : 'OFF'}</div>
          </div>
        </div>
      </div>

      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>💾 Save Changes</button>
        <button className="btn-reset" onClick={() => window.location.reload()}>🔄 Reset</button>
      </div>
    </div>
  );
};

export default LoanCappingEditor;
