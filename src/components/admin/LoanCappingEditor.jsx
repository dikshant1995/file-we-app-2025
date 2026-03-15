import { useState, useEffect } from 'react';
import './ConfigEditor.css';
import { saveBankConfig, getBankConfig } from '../../services/bankConfigService.js';

const LoanCappingEditor = ({ bank, onSave, location }) => {
  const [config, setConfig] = useState({
    absoluteMaxLoan: 5000000,
    categoryBasedMax: {
      A: null,
      B: 3000000,
      C: 2000000,
      D: 1000000
    },
    employmentTypeMax: {
      salaried: null,
      selfEmployed: 3000000
    },
    bachelorCapping: {
      enabled: true,
      limits: {
        rented_bachelor: null
      }
    },
    minLoanAmount: 100000
  });

  // Load saved config on mount or when location changes
  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'loanCapping', location);
    if (savedConfig) {
      // SAFE MERGE: Ensure we don't lose the structure if saved data is incomplete
      setConfig(prev => ({
        ...prev,
        ...savedConfig,
        categoryBasedMax: { ...prev.categoryBasedMax, ...(savedConfig.categoryBasedMax || {}) },
        employmentTypeMax: { ...prev.employmentTypeMax, ...(savedConfig.employmentTypeMax || {}) },
        bachelorCapping: {
          ...prev.bachelorCapping,
          ...(savedConfig.bachelorCapping || {}),
          limits: {
            ...prev.bachelorCapping.limits,
            ...(savedConfig.bachelorCapping?.limits || {})
          }
        }
      }));
    }
  }, [bank.name, location]);

  const handleSave = () => {
    const success = saveBankConfig(bank.name, 'loanCapping', config, location);
    if (success) {
      onSave && onSave(config);
      alert(`✅ Loan capping thresholds successfully committed for ${bank.name}${location ? ` in ${location}` : ' (Global)'}.`);
    } else {
      alert(`❌ Transaction Error: Neural synchronization failed.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>💰 Loan Amount Capping - {bank.name}</h2>
        <p>Configure maximum and minimum loan amounts for different scenarios</p>
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

      <div className="config-section">
        <h3>📊 Category-Based Maximum</h3>
        <div className="category-grid">
          {Object.keys(config.categoryBasedMax || {}).map(cat => (
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
              value={(config.employmentTypeMax && config.employmentTypeMax.salaried) || ''}
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
              value={(config.employmentTypeMax && config.employmentTypeMax.selfEmployed) || ''}
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
        <h3>👨 Dynamic Bachelor Capping</h3>
        <p className="input-hint" style={{ marginBottom: '15px' }}>Leave fields empty (or delete value) to fallback to bank's global capping rule.</p>
        
        <div className="category-grid">
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>Enable Dynamic Capping</label>
            <select
              value={(config.bachelorCapping && config.bachelorCapping.enabled) || false}
              onChange={(e) => setConfig({
                ...config,
                bachelorCapping: {
                  ...config.bachelorCapping,
                  enabled: e.target.value === 'true'
                }
              })}
              className="config-input"
            >
              <option value="true">Yes - Apply Custom Limits</option>
              <option value="false">No - Standard Capping</option>
            </select>
          </div>

          <div className="input-group">
            <label>Rented / Living Alone Bachelor (₹)</label>
            <input
              type="number"
              value={config.bachelorCapping?.limits?.rented_bachelor || ''}
              onChange={(e) => setConfig({
                ...config,
                bachelorCapping: {
                  ...config.bachelorCapping,
                  limits: { ...config.bachelorCapping.limits, rented_bachelor: e.target.value === '' ? null : parseInt(e.target.value) }
                }
              })}
              className="config-input"
              placeholder="e.g. 2000000"
              disabled={!(config.bachelorCapping && config.bachelorCapping.enabled)}
            />
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
            <div className="preview-value">{(config.bachelorCapping && config.bachelorCapping.enabled) ? 'Dynamic Tiered' : 'Global Only'}</div>
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
