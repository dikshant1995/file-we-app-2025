import { useState, useEffect } from 'react';
import './ConfigEditor.css';
import { saveBankConfig, getBankConfig } from '../../services/bankConfigService.js';

// Age Rules Editor
export const AgeRulesEditor = ({ bank, onSave, location }) => {
  const [config, setConfig] = useState({
    minAge: 21,
    maxAge: 60,
    retirementAge: { salaried: 60, selfEmployed: 65, government: 62 },
    maxAgeAtLoanEnd: 60
  });

  // Load saved config on mount
  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'ageRules', location);
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, [bank.name, location]);

  const handleSave = () => {
    const success = saveBankConfig(bank.name, 'ageRules', config, location);
    if (success) {
      onSave && onSave(config);
      alert(`Demographic parameters successfully committed for ${bank.name}${location ? ` in ${location}` : ''}.`);
    } else {
      alert(`System Error: Transaction failed. Please retry.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Demographic Eligibility Parameters - {bank.name}</h2>
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
            <label>Retirement Age (Salaried)</label>
            <input type="number" value={config.retirementAge.salaried} onChange={(e) => setConfig({ ...config, retirementAge: { ...config.retirementAge, salaried: parseInt(e.target.value) } })} className="config-input" />
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
export const TenureRulesEditor = ({ bank, onSave, location }) => {
  const [config, setConfig] = useState({
    minTenureMonths: 12,
    maxTenureMonths: 84,
    categoryBasedMaxTenure: { 'SUPER-A': 84, A: 84, B: 84, C: 72, D: 60, GOVT: 84 }
  });

  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'tenureRules', location);
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, location]);

  const handleSave = () => {
    if (saveBankConfig(bank.name, 'tenureRules', config, location)) {
      onSave && onSave(config);
      alert(`Tenure structural logic successfully committed for ${bank.name}.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Tenure Optimization Logic - {bank.name}</h2>
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
export const FoirEditor = ({ bank, onSave, location }) => {
  const [config, setConfig] = useState({
    categoryBasedFOIR: { 'SUPER-A': 75, A: 65, B: 60, C: 55, D: 50, GOVT: 70 },
    creditCardObligationPercentage: 5,
    btModeFOIRAdjustment: 0
  });

  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'foirSettings', location);
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, location]);

  const handleSave = () => {
    if (saveBankConfig(bank.name, 'foirSettings', config, location)) {
      onSave && onSave(config);
      alert(`FOIR thresholds successfully committed for ${bank.name}.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>FOIR Assessment Parameters - {bank.name}</h2>
      </div>
      <div className="config-section">
        <div className="category-grid">
          {Object.keys(config.categoryBasedFOIR).map(cat => (
            <div key={cat} className="input-group">
              <label>Category {cat} FOIR %</label>
              <input type="number" value={config.categoryBasedFOIR[cat]} onChange={(e) => setConfig({ ...config, categoryBasedFOIR: { ...config.categoryBasedFOIR, [cat]: parseInt(e.target.value) } })} className="config-input" />
            </div>
          ))}
          <div className="input-group">
            <label>CC Obligation %</label>
            <input type="number" value={config.creditCardObligationPercentage} onChange={(e) => setConfig({ ...config, creditCardObligationPercentage: parseInt(e.target.value) })} className="config-input" />
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
export const MultiplierEditor = ({ bank, onSave, location }) => {
  const [config, setConfig] = useState({
    categoryBasedMultiplier: { 'SUPER-A': 40, A: 35, B: 30, C: 25, D: 20, GOVT: 35 },
    employmentTypeMultiplier: { salaried: 1.0, selfEmployed: 0.8 }
  });

  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'multiplierRules', location);
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, location]);

  const handleSave = () => {
    if (saveBankConfig(bank.name, 'multiplierRules', config, location)) {
      onSave && onSave(config);
      alert(`Multiplier algorithms successfully committed for ${bank.name}.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Operational Multiplier Logic - {bank.name}</h2>
      </div>
      <div className="config-section">
        <div className="category-grid">
          {Object.keys(config.categoryBasedMultiplier).map(cat => (
            <div key={cat} className="input-group">
              <label>Category {cat} Multiplier</label>
              <input type="number" value={config.categoryBasedMultiplier[cat]} onChange={(e) => setConfig({ ...config, categoryBasedMultiplier: { ...config.categoryBasedMultiplier, [cat]: parseInt(e.target.value) } })} className="config-input" />
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

// BT Configuration Editor
export const BTEditor = ({ bank, onSave, location }) => {
  const [config, setConfig] = useState({
    enabled: true,
    maxLoansForBT: 3,
    creditCardBTSupported: true,
    topUpAllowed: true,
    processingFeePercentage: 1.5
  });

  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'btConfiguration', location);
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, location]);

  const handleSave = () => {
    if (saveBankConfig(bank.name, 'btConfiguration', config, location)) {
      onSave && onSave(config);
      alert(`Liability consolidation framework successfully committed for ${bank.name}.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Liability Consolidation Protocol - {bank.name}</h2>
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
export const CreditScoreEditor = ({ bank, onSave, location }) => {
  const [config, setConfig] = useState({
    minCreditScore: 650,
    recommendedScore: 700,
    premiumScore: 750,
    autoRejectionThreshold: 600
  });

  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'creditScoreRules', location);
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, location]);

  const handleSave = () => {
    if (saveBankConfig(bank.name, 'creditScoreRules', config, location)) {
      onSave && onSave(config);
      alert(`Risk assessment thresholds successfully committed for ${bank.name}.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Risk Assessment Framework - {bank.name}</h2>
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

// Employment & Fees Combined
export const EmploymentEditor = ({ bank, onSave, location }) => {
  const [config, setConfig] = useState({
    salariedMinSalary: 25000,
    selfEmployedMinIncome: 300000,
    itrYearsRequired: 2,
    allowCashSalary: false,
    allowChequeSalary: false
  });

  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'employmentRules', location);
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, location]);

  const handleSave = () => {
    if (saveBankConfig(bank.name, 'employmentRules', config, location)) {
      onSave && onSave(config);
      alert(`Employment credentialing logic successfully committed for ${bank.name}.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Employment Credentialing Parameters - {bank.name}</h2>
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
          <div className="input-group">
            <label>Allow Cash Salary?</label>
            <select value={config.allowCashSalary} onChange={(e) => setConfig({ ...config, allowCashSalary: e.target.value === 'true' })} className="config-input">
              <option value="false">No (Rejected)</option>
              <option value="true">Yes (Enabled)</option>
            </select>
          </div>
          <div className="input-group">
            <label>Allow Cheque Salary?</label>
            <select value={config.allowChequeSalary} onChange={(e) => setConfig({ ...config, allowChequeSalary: e.target.value === 'true' })} className="config-input">
              <option value="false">No (Rejected)</option>
              <option value="true">Yes (Enabled)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>Commit Changes</button>
      </div>
    </div>
  );
};

export const FeesEditor = ({ bank, onSave, location }) => {
  const [config, setConfig] = useState({
    processingFeePercentage: 3.5,
    btChargesPercentage: 1.5,
    prepaymentChargesPercentage: 4
  });

  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'feesAndCharges', location);
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, location]);

  const handleSave = () => {
    if (saveBankConfig(bank.name, 'feesAndCharges', config, location)) {
      onSave && onSave(config);
      alert(`Fee schedules and capital charges successfully committed for ${bank.name}.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Institutional Fee Schedules - {bank.name}</h2>
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

export const DocumentsEditor = ({ bank, onSave }) => (
  <div className="config-editor">
    <div className="editor-header">
      <h2>Documentation Compliance Protocol - {bank.name}</h2>
      <p>Standardized documentation framework implementation</p>
    </div>
    <div className="config-section">
      <p>Document configuration interface coming soon. Currently using default requirements.</p>
    </div>
  </div>
);

export const SpecialRulesEditor = ({ bank, onSave }) => (
  <div className="config-editor">
    <div className="editor-header">
      <h2>Exceptional Policy Framework - {bank.name}</h2>
      <p>Management of priority segments and promotional waivers</p>
    </div>
    <div className="config-section">
      <p>Special rules interface coming soon. Currently using default rules.</p>
    </div>
  </div>
);

// Government Policy Editor
export const GovtPolicyEditor = ({ bank, onSave, location }) => {
  const [config, setConfig] = useState({
    minSalary: 25000,
    roi: 10.5,
    foir: 65,
    multiplier: 40,
    maxTenureMonths: 84
  });

  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'govtPolicy', location);
    if (savedConfig) setConfig(savedConfig);
  }, [bank.name, location]);

  const handleSave = () => {
    const success = saveBankConfig(bank.name, 'govtPolicy', config, location);
    if (success) {
      onSave && onSave(config);
      alert(`Government institutional policies successfully committed for ${bank.name}${location ? ` in ${location}` : ''}.`);
    } else {
      alert(`System Error: Transaction failed. Please retry.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>Government Institutional Policies - {bank.name}</h2>
        <p>Specific overrides for verified government employees</p>
      </div>
      <div className="config-section">
        <div className="category-grid">
          <div className="input-group">
            <label>Minimum Salary (Govt)</label>
            <input type="number" value={config.minSalary} onChange={(e) => setConfig({ ...config, minSalary: parseInt(e.target.value) })} className="config-input" placeholder="₹ 25,000" />
          </div>
          <div className="input-group">
            <label>Govt Interest Rate (ROI %)</label>
            <input type="number" step="0.01" value={config.roi} onChange={(e) => setConfig({ ...config, roi: parseFloat(e.target.value) })} className="config-input" placeholder="10.5%" />
          </div>
          <div className="input-group">
            <label>Govt FOIR (%)</label>
            <input type="number" value={config.foir} onChange={(e) => setConfig({ ...config, foir: parseInt(e.target.value) })} className="config-input" placeholder="65%" />
          </div>
          <div className="input-group">
            <label>Govt Multiplier (X)</label>
            <input type="number" value={config.multiplier} onChange={(e) => setConfig({ ...config, multiplier: parseInt(e.target.value) })} className="config-input" placeholder="40" />
          </div>
          <div className="input-group">
            <label>Govt Max Tenure (Months)</label>
            <input type="number" value={config.maxTenureMonths} onChange={(e) => setConfig({ ...config, maxTenureMonths: parseInt(e.target.value) })} className="config-input" placeholder="84" />
          </div>
        </div>
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>Commit Govt Policies</button>
      </div>
    </div>
  );
};
