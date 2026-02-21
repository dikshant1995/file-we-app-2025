import { useState, useEffect } from 'react';
import './ConfigEditor.css';
import { saveBankConfig, getBankConfig, getAllBankConfig } from '../../services/bankConfigService';
import LocationOverrideManager from './LocationOverrideManager';

const InterestRateEditor = ({ bank, onSave }) => {
  // Get loan capping to determine max slabs
  const loanCapping = getBankConfig(bank.name, 'loanCapping') || { absoluteMaxLoan: 5000000 };
  const maxLoan = loanCapping.absoluteMaxLoan;

  const [activeLocation, setActiveLocation] = useState(null); // null = Global
  const [locationOverrides, setLocationOverrides] = useState({});

  // Generate default loan slabs based on capping (in rupees)
  const generateSlabs = (maxLoanAmount) => {
    const slabs = [
      { min: 100000, max: 500000, label: '₹100000-500000' },
      { min: 500001, max: 1000000, label: '₹500001-1000000' },
      { min: 1000001, max: 1500000, label: '₹1000001-1500000' },
      { min: 1500001, max: 2000000, label: '₹1500001-2000000' },
      { min: 2000001, max: 2500000, label: '₹2000001-2500000' },
      { min: 2500001, max: 3000000, label: '₹2500001-3000000' },
      { min: 3000001, max: 4000000, label: '₹3000001-4000000' },
      { min: 4000001, max: 5000000, label: '₹4000001-5000000' }
    ];

    // Filter slabs based on max loan capping
    return slabs.filter(slab => slab.min <= maxLoanAmount);
  };

  const slabs = generateSlabs(maxLoan);

  // Initialize default rates for all categories and slabs
  const initializeCategoryRates = () => {
    const categories = ['SUPER-A', 'A', 'B', 'C', 'D', 'GOVT'];
    const rates = {};

    categories.forEach(cat => {
      rates[cat] = {};
      slabs.forEach(slab => {
        rates[cat][slab.label] = 11.0; // default rate
      });
    });

    return rates;
  };

  const [config, setConfig] = useState({
    categorySlabRates: initializeCategoryRates()
  });

  // Load saved config on mount or when bank/location changes
  useEffect(() => {
    // 1. Load full bank config to get available overrides
    const fullConfig = getAllBankConfig(bank.name);
    setLocationOverrides(fullConfig.locationOverrides?.interestRates || {});

    // 2. Load specific rates based on activeLocation
    const savedConfig = getBankConfig(bank.name, 'interestRates', {
      state: activeLocation,
      city: activeLocation
    });

    if (savedConfig && savedConfig.categorySlabRates) {
      setConfig(savedConfig);
    } else {
      setConfig({ categorySlabRates: initializeCategoryRates() });
    }
  }, [bank.name, activeLocation]);

  const handleRateChange = (category, slabLabel, value) => {
    setConfig({
      ...config,
      categorySlabRates: {
        ...config.categorySlabRates,
        [category]: {
          ...config.categorySlabRates[category],
          [slabLabel]: parseFloat(value) || 0
        }
      }
    });
  };

  const handleSave = () => {
    const success = saveBankConfig(bank.name, 'interestRates', config, activeLocation);
    if (success) {
      onSave && onSave(config);
      alert(`✅ Interest rates saved for ${bank.name} (${activeLocation || 'Global'})!`);

      // Refresh overrides list if we added a new one
      if (activeLocation && !locationOverrides[activeLocation]) {
        setLocationOverrides({ ...locationOverrides, [activeLocation]: config });
      }
    } else {
      alert(`❌ Failed to save. Please try again.`);
    }
  };

  const handleAddLocation = (loc) => setActiveLocation(loc);

  const handleRemoveLocation = (loc) => {
    if (removeBankOverride(bank.name, 'interestRates', loc)) {
      const newOverrides = { ...locationOverrides };
      delete newOverrides[loc];
      setLocationOverrides(newOverrides);
      if (activeLocation === loc) setActiveLocation(null);
    }
  };

  const categories = ['SUPER-A', 'A', 'B', 'C', 'D', 'GOVT'];

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>📈 Interest Rate Matrix - {bank.name}</h2>
        <p>Configure interest rates by category and loan amount slabs with Pan-India location overrides</p>
      </div>

      <LocationOverrideManager
        overrides={locationOverrides}
        activeLocation={activeLocation}
        onSelectLocation={setActiveLocation}
        onAddLocation={handleAddLocation}
        onRemoveLocation={handleRemoveLocation}
      />

      {/* Rate Matrix by Category */}
      {categories.map(category => (
        <div key={category} className="config-section" style={{ marginBottom: '30px' }}>
          <h3>🏷️ Category {category}</h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Loan Amount</th>
                  {slabs.map(slab => (
                    <th key={slab.label} style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>
                      {slab.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '15px', fontWeight: '600', borderBottom: '1px solid #e0e0e0' }}>Interest Rate (%)</td>
                  {slabs.map(slab => (
                    <td key={slab.label} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={config.categorySlabRates[category]?.[slab.label] || 11.0}
                        onChange={(e) => handleRateChange(category, slab.label, e.target.value)}
                        style={{
                          width: '80px',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>
          💾 Save All Rates
        </button>
        <button className="btn-reset" onClick={() => window.location.reload()}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default InterestRateEditor;
