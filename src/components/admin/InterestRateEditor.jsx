import { useState, useEffect } from 'react';
import './ConfigEditor.css';
import { saveBankConfig, getBankConfig } from '../../services/bankConfigService.js';

const InterestRateEditor = ({ bank, onSave, location }) => {
  // Get loan capping to determine max slabs
  const loanCapping = getBankConfig(bank.name, 'loanCapping', location) || { absoluteMaxLoan: 5000000 };
  const maxLoan = loanCapping.absoluteMaxLoan;

  // Generate default loan slabs based on capping (in rupees)
  const generateSlabs = (maxLoanAmount) => {
    const slabs = [
      { min: 100000, max: 500000, label: '100000-500000' },
      { min: 500001, max: 1000000, label: '500001-1000000' },
      { min: 1000001, max: 1500000, label: '1000001-1500000' },
      { min: 1500001, max: 2000000, label: '1500001-2000000' },
      { min: 2000001, max: 2500000, label: '2000001-2500000' },
      { min: 2500001, max: 3000000, label: '2500001-3000000' },
      { min: 3000001, max: 4000000, label: '3000001-4000000' },
      { min: 4000001, max: 5000000, label: '4000001-5000000' }
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

  // Load saved config on mount or when location changes
  useEffect(() => {
    const savedConfig = getBankConfig(bank.name, 'interestRates', location);
    if (savedConfig && savedConfig.categorySlabRates) {
      setConfig(savedConfig);
    }
  }, [bank.name, location]);

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
    const success = saveBankConfig(bank.name, 'interestRates', config, location);
    if (success) {
      onSave && onSave(config);
      alert(`✅ Interest rates successfully committed for ${bank.name}${location ? ` in ${location}` : ' (Global)'}.`);
    } else {
      alert(`❌ Transaction Error: Synchronization failed.`);
    }
  };

  const categories = ['SUPER-A', 'A', 'B', 'C', 'D', 'GOVT'];

  return (
    <div className="config-editor">
      <div className="editor-header">
        <h2>📈 Interest Rate Matrix - {bank.name}</h2>
        <p>Configure interest rates by category and loan amount slabs (Max: ₹{(maxLoan / 100000).toFixed(0)}L)</p>
        {location && (
          <p className="location-indicator">📍 Current Override: <strong>{location}</strong></p>
        )}
      </div>

      {/* Rate Matrix by Category */}
      {categories.map(category => (
        <div key={category} className="config-section" style={{ marginBottom: '30px' }}>
          <h3>🏷️ Category {category}</h3>

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-glow)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(13, 22, 38, 0.6)', backdropFilter: 'blur(10px)' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 212, 255, 0.05)' }}>
                  <th style={{ padding: '20px 15px', textAlign: 'left', borderBottom: '1px solid var(--border-glow)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loan Amount</th>
                  {slabs.map(slab => (
                    <th key={slab.label} style={{ padding: '20px 15px', textAlign: 'center', borderBottom: '1px solid var(--border-glow)', color: '#fff', fontSize: '0.85rem', fontWeight: '700' }}>
                      ₹{slab.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '20px 15px', color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate (%)</td>
                  {slabs.map(slab => (
                    <td key={slab.label} style={{ padding: '15px', textAlign: 'center' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={config.categorySlabRates[category]?.[slab.label] || 11.0}
                        onChange={(e) => handleRateChange(category, slab.label, e.target.value)}
                        className="table-input"
                        style={{
                          width: '80px',
                          textAlign: 'center',
                          fontWeight: '700',
                          border: '1px solid var(--border-glow)',
                          background: 'rgba(0, 0, 0, 0.3)'
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
          🔄 Reset to Default
        </button>
      </div>
    </div>
  );
};

export default InterestRateEditor;
