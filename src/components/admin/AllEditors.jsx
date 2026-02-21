import { useState, useEffect } from 'react';
import './ConfigEditor.css';
import { saveBankConfig, getBankConfig, getAllBankConfig } from '../../services/bankConfigService';

// Generic wrapper for simple numeric config editors
const GenericNumericEditor = ({ bank, sectionName, title, fields, onSave, activeLocation }) => {
  const [config, setConfig] = useState({});
  const [locationOverrides, setLocationOverrides] = useState({});

  useEffect(() => {
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.[sectionName] || {});

    const context = { state: activeLocation.state, city: activeLocation.city };
    const savedConfig = getBankConfig(bank.name, sectionName, context);
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, activeLocation, sectionName]);

  const handleSave = () => {
    const locationKey = activeLocation.city || activeLocation.state || null;
    const success = saveBankConfig(bank.name, sectionName, config, locationKey);
    if (success) {
      onSave && onSave(config);
      alert(`✅ ${title} saved for ${bank.name} (${locationKey || 'All India'})!`);
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: config });
      }
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>{title} - {bank.name}</h2>
        <p>Configuring for: <strong>{activeLocation.city || activeLocation.state || 'All India (National)'}</strong></p>
      </div>

      <div className="existing-overrides-badges">
        <span className="badge-label">Available Overrides (this section):</span>
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
          {fields.map(field => (
            <div key={field.key} className="input-group">
              <label>{field.label}</label>
              <input
                type={field.type || "number"}
                value={config[field.key] || ''}
                onChange={(e) => setConfig({ ...config, [field.key]: field.type === "text" ? e.target.value : parseInt(e.target.value) })}
                className="config-input"
              />
              {field.hint && <span className="input-hint">{field.hint}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>💾 Save Changes</button>
      </div>
    </div>
  );
};

// Specialized editors
export const AgeRulesEditor = (props) => (
  <GenericNumericEditor
    {...props}
    sectionName="ageRules"
    title="🎂 Age & Retirement Rules"
    fields={[
      { key: 'minAge', label: 'Minimum Entry Age' },
      { key: 'maxAge', label: 'Maximum Entry Age' },
      { key: 'maxAgeAtLoanEnd', label: 'Max Age at Loan Maturity' }
    ]}
  />
);

export const TenureRulesEditor = (props) => (
  <GenericNumericEditor
    {...props}
    sectionName="tenureRules"
    title="📅 Tenure Parameters"
    fields={[
      { key: 'minTenureMonths', label: 'Minimum Tenure (Months)' },
      { key: 'maxTenureMonths', label: 'Maximum Tenure (Months)' }
    ]}
  />
);

export const FoirEditor = (props) => (
  <GenericNumericEditor
    {...props}
    sectionName="foir"
    title="💳 FOIR Settings"
    fields={[
      { key: 'creditCardObligationPercentage', label: 'CC Obligation %', hint: 'Percentage of CC limit used as EMI' }
    ]}
  />
);

export const MultiplierEditor = (props) => (
  <GenericNumericEditor
    {...props}
    sectionName="multiplier"
    title="📈 Salary Multipliers"
    fields={[
      { key: 'defaultMultiplier', label: 'Default Multiplier' }
    ]}
  />
);

export const BTEditor = (props) => (
  <div className="config-editor">
    <h2>BT Configuration - Placeholder</h2>
    <p>Balance Transfer logic coming soon...</p>
  </div>
);

export const CreditScoreEditor = (props) => (
  <GenericNumericEditor
    {...props}
    sectionName="creditScore"
    title="🛡️ Risk Assessment (Credit Score)"
    fields={[
      { key: 'minCreditScore', label: 'Minimum Acceptable Score' },
      { key: 'autoRejectionThreshold', label: 'Auto-Reject Threshold' }
    ]}
  />
);

export const EmploymentEditor = (props) => (
  <GenericNumericEditor
    {...props}
    sectionName="employment"
    title="💼 Employment Credentialing"
    fields={[
      { key: 'salariedMinSalary', label: 'Min Salaried Monthly Income' },
      { key: 'itrYearsRequired', label: 'ITR Record (Years)' }
    ]}
  />
);

export const FeesEditor = (props) => (
  <GenericNumericEditor
    {...props}
    sectionName="fees"
    title="💰 Fee Schedules"
    fields={[
      { key: 'processingFeePercentage', label: 'Processing Fee %' },
      { key: 'prepaymentChargesPercentage', label: 'Prepayment Penalty %' }
    ]}
  />
);

export const DocumentsEditor = (props) => (
  <div className="config-editor">
    <h2>Documents - Placeholder</h2>
    <p>Document checklist configuration coming soon...</p>
  </div>
);

export const SpecialRulesEditor = (props) => (
  <div className="config-editor">
    <h2>Special Rules - Placeholder</h2>
    <p>Exceptional policy rules coming soon...</p>
  </div>
);
