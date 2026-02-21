import { useState, useEffect } from 'react';
import './ConfigEditor.css';
import { saveBankConfig, getBankConfig, getAllBankConfig } from '../../services/bankConfigService';

// Bank-specific category definitions
const bankCategoryDefaults = {
  'HDFC Bank': {
    'Super A': {
      salaryRange: { min: 100000, max: null },
      foir: 70,
      multiplier: 27,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'Super A - Premium Listed MNCs, Top PSUs'
    },
    'A': {
      salaryRange: { min: 25000, max: null },
      foir: 65,
      multiplier: 24,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'A - Listed Companies, Established MNCs'
    },
    'Govt': {
      salaryRange: { min: 25000, max: null },
      foir: 65,
      multiplier: 24,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'Govt - Government Employees'
    },
    'B': {
      salaryRange: { min: 25000, max: null },
      foir: 60,
      multiplier: 22,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'B - Mid-tier Companies'
    },
    'C': {
      salaryRange: { min: 35000, max: null },
      foir: 55,
      multiplier: 20,
      maxTenureMonths: 60,
      maxLoanAmount: null,
      description: 'C - Small Companies'
    }
  },
  'ICICI Bank': {
    'A': {
      salaryRange: { min: 30000, max: null },
      foir: 65,
      multiplier: 30,
      maxTenureMonths: 84,
      maxLoanAmount: null,
      description: 'A - Top Tier Companies'
    },
    'GOVT': {
      salaryRange: { min: 30000, max: null },
      foir: 65,
      multiplier: 30,
      maxTenureMonths: 84,
      maxLoanAmount: null,
      description: 'GOVT - Government Employees'
    },
    'B': {
      salaryRange: { min: 30000, max: null },
      foir: 60,
      multiplier: 25,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'B - Good Companies'
    },
    'C': {
      salaryRange: { min: 30000, max: null },
      foir: 55,
      multiplier: 20,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'C - Average Companies'
    },
    'D': {
      salaryRange: { min: 40000, max: null },
      foir: 50,
      multiplier: 18,
      maxTenureMonths: 60,
      maxLoanAmount: null,
      description: 'D - Lower Category'
    },
    'UNLISTED': {
      salaryRange: { min: 50000, max: null },
      foir: 50,
      multiplier: 15,
      maxTenureMonths: 60,
      maxLoanAmount: null,
      description: 'UNLISTED - Unlisted Companies'
    }
  },
  'IndusInd Bank': {
    'A+': {
      salaryRange: { min: 25000, max: null },
      foir: 65,
      multiplier: 30,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'A+ - Premium Category'
    },
    'A': {
      salaryRange: { min: 25000, max: null },
      foir: 65,
      multiplier: 30,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'A - Top Companies'
    },
    'GOVT': {
      salaryRange: { min: 25000, max: null },
      foir: 65,
      multiplier: 30,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'GOVT - Government Employees'
    },
    'B': {
      salaryRange: { min: 25000, max: null },
      foir: 60,
      multiplier: 25,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'B - Good Companies'
    },
    'C': {
      salaryRange: { min: 30000, max: null },
      foir: 55,
      multiplier: 21,
      maxTenureMonths: 48,
      maxLoanAmount: null,
      description: 'C - Standard Companies'
    },
    'D': {
      salaryRange: { min: 25000, max: null },
      foir: 50,
      multiplier: 18,
      maxTenureMonths: 48,
      maxLoanAmount: null,
      description: 'D - Lower Tier'
    },
    'UNLISTED': {
      salaryRange: { min: 25000, max: null },
      foir: 50,
      multiplier: 18,
      maxTenureMonths: 48,
      maxLoanAmount: null,
      description: 'UNLISTED - Unlisted Companies'
    }
  },
  'Tata Capital': {
    'SUP-A': {
      salaryRange: { min: 25000, max: null },
      foir: 75,
      multiplier: 27,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'SUP-A - Superior A Premium Companies'
    },
    'A': {
      salaryRange: { min: 25000, max: null },
      foir: 65,
      multiplier: 27,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'A - Top Tier Companies'
    },
    'GOVT': {
      salaryRange: { min: 25000, max: null },
      foir: 65,
      multiplier: 27,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'GOVT - Government Employees'
    },
    'B': {
      salaryRange: { min: 25000, max: null },
      foir: 60,
      multiplier: 25,
      maxTenureMonths: 60,
      maxLoanAmount: null,
      description: 'B - Good Companies'
    },
    'C': {
      salaryRange: { min: 25000, max: null },
      foir: 55,
      multiplier: 18,
      maxTenureMonths: 60,
      maxLoanAmount: null,
      description: 'C - Average Companies'
    },
    'D': {
      salaryRange: { min: 25000, max: null },
      foir: 50,
      multiplier: 18,
      maxTenureMonths: 48,
      maxLoanAmount: null,
      description: 'D - Lower Category'
    },
    'UNLISTED': {
      salaryRange: { min: 40000, max: null },
      foir: 50,
      multiplier: 15,
      maxTenureMonths: 48,
      maxLoanAmount: null,
      description: 'UNLISTED - Unlisted Companies'
    }
  },
  'Kotak Mahindra Bank': {
    'AA': {
      salaryRange: { min: 25000, max: null },
      foir: 70,
      multiplier: 31,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'AA - Premium Category'
    },
    'A': {
      salaryRange: { min: 25000, max: null },
      foir: 70,
      multiplier: 30,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'A - Top Companies'
    },
    'GOVT': {
      salaryRange: { min: 25000, max: null },
      foir: 70,
      multiplier: 30,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'GOVT - Government Employees'
    },
    'B': {
      salaryRange: { min: 25000, max: null },
      foir: 70,
      multiplier: 26,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'B - Good Companies'
    },
    'C': {
      salaryRange: { min: 25000, max: null },
      foir: 70,
      multiplier: 20,
      maxTenureMonths: 60,
      maxLoanAmount: null,
      description: 'C - Standard Companies'
    },
    'D': {
      salaryRange: { min: 35000, max: null },
      foir: 60,
      multiplier: 18,
      maxTenureMonths: 60,
      maxLoanAmount: null,
      description: 'D - Lower Category'
    }
  },
  // Default for other banks
  'Default': {
    'A': {
      salaryRange: { min: 25000, max: null },
      foir: 65,
      multiplier: 30,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'A - Top Companies'
    },
    'GOVT': {
      salaryRange: { min: 25000, max: null },
      foir: 65,
      multiplier: 30,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'GOVT - Government Employees'
    },
    'B': {
      salaryRange: { min: 25000, max: null },
      foir: 60,
      multiplier: 25,
      maxTenureMonths: 72,
      maxLoanAmount: null,
      description: 'B - Good Companies'
    },
    'C': {
      salaryRange: { min: 30000, max: null },
      foir: 55,
      multiplier: 20,
      maxTenureMonths: 60,
      maxLoanAmount: 2000000,
      description: 'C - Standard Companies'
    },
    'D': {
      salaryRange: { min: 25000, max: null },
      foir: 50,
      multiplier: 18,
      maxTenureMonths: 60,
      maxLoanAmount: 1000000,
      description: 'D - Lower Category'
    }
  }
};

const CategoriesEditor = ({ bank, onSave, activeLocation }) => {
  // Get bank-specific default categories
  const getBankDefaults = () => {
    return bankCategoryDefaults[bank.name] || bankCategoryDefaults['Default'];
  };

  const [categories, setCategories] = useState(getBankDefaults());
  const [locationOverrides, setLocationOverrides] = useState({});

  // Load saved config when bank or activeLocation prop changes
  useEffect(() => {
    // 1. Load full bank config to get available overrides list
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.categories || {});

    // 2. Load specific categories based on activeLocation prop
    const context = { state: activeLocation.state, city: activeLocation.city };
    const savedConfig = getBankConfig(bank.name, 'categories', context);

    if (savedConfig) {
      setCategories(savedConfig);
    } else {
      setCategories(getBankDefaults());
    }
  }, [bank.name, activeLocation]);

  const updateCategory = (cat, field, value) => {
    setCategories({
      ...categories,
      [cat]: {
        ...categories[cat],
        [field]: value
      }
    });
  };

  const updateSalaryRange = (cat, type, value) => {
    setCategories({
      ...categories,
      [cat]: {
        ...categories[cat],
        salaryRange: {
          ...categories[cat].salaryRange,
          [type]: value === '' ? null : parseInt(value)
        }
      }
    });
  };

  const handleSave = () => {
    const locationKey = activeLocation.city || activeLocation.state || null;
    const success = saveBankConfig(bank.name, 'categories', categories, locationKey);
    if (success) {
      onSave && onSave(categories);
      alert(`✅ Category configuration saved for ${bank.name} (${locationKey || 'All India'})!`);

      // Refresh overrides list
      if (locationKey && !locationOverrides[locationKey]) {
        setLocationOverrides({ ...locationOverrides, [locationKey]: categories });
      }
    } else {
      alert(`❌ Failed to save. Please try again.`);
    }
  };

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>📊 Category Configuration - {bank.name}</h2>
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
          <span className="no-overrides">No location rules set yet. Use the top selector to add.</span>
        )}
      </div>

      {Object.keys(categories).map(cat => (
        <div key={cat} className="config-section">
          <h3>Category {cat}</h3>

          <div className="category-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {/* Salary Range */}
            <div className="input-group">
              <label>Minimum Salary (₹)</label>
              <input
                type="number"
                value={categories[cat].salaryRange.min || ''}
                onChange={(e) => updateSalaryRange(cat, 'min', e.target.value)}
                className="config-input"
                placeholder="e.g., 25000"
              />
            </div>

            <div className="input-group">
              <label>Maximum Salary (₹)</label>
              <input
                type="number"
                value={categories[cat].salaryRange.max || ''}
                onChange={(e) => updateSalaryRange(cat, 'max', e.target.value)}
                className="config-input"
                placeholder="No limit"
              />
              <span className="input-hint">Leave empty for no upper limit</span>
            </div>

            {/* FOIR */}
            <div className="input-group">
              <label>FOIR %</label>
              <input
                type="number"
                value={categories[cat].foir}
                onChange={(e) => updateCategory(cat, 'foir', parseInt(e.target.value))}
                className="config-input"
              />
              <span className="input-hint">Fixed Obligation to Income Ratio</span>
            </div>

            {/* Multiplier */}
            <div className="input-group">
              <label>Salary Multiplier</label>
              <input
                type="number"
                value={categories[cat].multiplier}
                onChange={(e) => updateCategory(cat, 'multiplier', parseInt(e.target.value))}
                className="config-input"
              />
              <span className="input-hint">Loan = Salary × Multiplier</span>
            </div>

            {/* Max Tenure */}
            <div className="input-group">
              <label>Max Tenure (Months)</label>
              <input
                type="number"
                value={categories[cat].maxTenureMonths}
                onChange={(e) => updateCategory(cat, 'maxTenureMonths', parseInt(e.target.value))}
                className="config-input"
              />
            </div>

            {/* Max Loan Amount */}
            <div className="input-group">
              <label>Max Loan Amount (₹)</label>
              <input
                type="number"
                value={categories[cat].maxLoanAmount || ''}
                onChange={(e) => updateCategory(cat, 'maxLoanAmount', e.target.value === '' ? null : parseInt(e.target.value))}
                className="config-input"
                placeholder="No limit"
              />
              <span className="input-hint">Leave empty for no limit</span>
            </div>
          </div>

          {/* Description */}
          <div className="input-group">
            <label>Category Description</label>
            <input
              type="text"
              value={categories[cat].description}
              onChange={(e) => updateCategory(cat, 'description', e.target.value)}
              className="config-input"
            />
          </div>
        </div>
      ))}

      {/* Preview */}
      <div className="config-preview">
        <h3>👀 Quick Preview</h3>
        <div className="preview-grid">
          {Object.keys(categories).map(cat => (
            <div key={cat} className="preview-card">
              <div className="preview-label">Category {cat}</div>
              <div className="preview-value" style={{ fontSize: '1.5em' }}>
                ₹{categories[cat].salaryRange.min?.toLocaleString('en-IN')}+
              </div>
              <div style={{ fontSize: '0.9em', marginTop: '10px' }}>
                FOIR: {categories[cat].foir}% | {categories[cat].multiplier}x
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>
          💾 Save Changes
        </button>
        <button className="btn-reset" onClick={() => window.location.reload()}>
          🔄 Reset to Default
        </button>
      </div>
    </div>
  );
};

export default CategoriesEditor;
