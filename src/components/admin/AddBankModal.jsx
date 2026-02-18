import { useState } from 'react';
import './AddBankModal.css';
import { saveBankConfig } from '../../services/bankConfigService';

const AddBankModal = ({ onClose, onBankAdded }) => {
  const [bankName, setBankName] = useState('');
  const [bankLogo, setBankLogo] = useState('🏦');
  const [bankColor, setBankColor] = useState('#667eea');
  const [error, setError] = useState('');

  // Default configuration template for new banks - Using ALL REAL categories from existing banks
  // Covers: Super A, SUP-A, AA, A+, A, GOVT/Govt, B, C, D, UNLISTED
  const defaultBankConfig = {
    ageRules: {
      minAge: 21,
      maxAge: 60,
      retirementAge: { salaried: 60, selfEmployed: 65, government: 62 },
      maxAgeAtLoanEnd: 60
    },
    tenureRules: {
      minTenureMonths: 12,
      maxTenureMonths: 84,
      categoryBasedMaxTenure: { 
        'Super A': 72,
        'SUP-A': 72,
        'AA': 72,
        'A+': 72,
        'A': 72, 
        'GOVT': 72,
        'Govt': 72,
        'B': 72, 
        'C': 60,
        'D': 60,
        'UNLISTED': 60
      }
    },
    foirSettings: {
      categoryBasedFOIR: { 
        'Super A': 70,
        'SUP-A': 70,
        'AA': 70,
        'A+': 65,
        'A': 65, 
        'GOVT': 65,
        'Govt': 65,
        'B': 60, 
        'C': 55, 
        'D': 50,
        'UNLISTED': 50
      },
      creditCardObligationPercentage: 5,
      btModeFOIRAdjustment: 0
    },
    multiplierRules: {
      categoryBasedMultiplier: { 
        'Super A': 35,
        'SUP-A': 27,
        'AA': 31,
        'A+': 30,
        'A': 30, 
        'GOVT': 27,
        'Govt': 30,
        'B': 25, 
        'C': 18, 
        'D': 18,
        'UNLISTED': 15
      },
      employmentTypeMultiplier: { salaried: 1.0, selfEmployed: 0.8, government: 1.0 }
    },
    creditScoreRules: {
      minCreditScore: 650,
      recommendedScore: 700,
      premiumScore: 750,
      autoRejectionThreshold: 600
    },
    interestRates: {
      defaultRate: 11.0,
      categoryRates: { 
        'Super A': 11.0,
        'SUP-A': 11.0,
        'AA': 11.0,
        'A+': 11.0,
        'A': 11.0, 
        'GOVT': 11.0,
        'Govt': 11.0,
        'B': 11.0, 
        'C': 11.0, 
        'D': 11.0,
        'UNLISTED': 11.0
      },
      creditScoreRates: [
        { minScore: 750, rate: 10.5 },
        { minScore: 700, rate: 11.0 },
        { minScore: 650, rate: 11.5 }
      ]
    },
    loanCapping: {
      absoluteMaxLoan: 5000000,
      minLoanAmount: 100000,
      categoryBasedMax: { 
        'Super A': null,
        'SUP-A': null,
        'AA': null,
        'A+': null,
        'A': null, 
        'GOVT': null,
        'Govt': null,
        'B': 3000000, 
        'C': 2000000, 
        'D': 1000000,
        'UNLISTED': 1000000
      },
      employmentTypeMax: { salaried: null, selfEmployed: 3000000, government: null },
      bachelorCapping: { enabled: true, percentage: 50 }
    },
    employmentRules: {
      salariedMinSalary: 25000,
      selfEmployedMinIncome: 300000,
      governmentMinSalary: 25000,
      itrYearsRequired: 2
    },
    btConfiguration: {
      enabled: true,
      maxLoansForBT: 3,
      creditCardBTSupported: true,
      topUpAllowed: true,
      processingFeePercentage: 1.5,
      acceptsFintechLoans: false
    },
    feesAndCharges: {
      processingFeePercentage: 3.5,
      btChargesPercentage: 1.5,
      prepaymentChargesPercentage: 4
    },
    categories: {
      'Super A': {
        salaryRange: { min: 100000, max: null },
        foir: 70,
        multiplier: 35,
        maxTenureMonths: 72,
        maxLoanAmount: null,
        description: 'Super A - Premium Listed MNCs, Top PSUs (HDFC)'
      },
      'SUP-A': {
        salaryRange: { min: 25000, max: null },
        foir: 75,
        multiplier: 27,
        maxTenureMonths: 72,
        maxLoanAmount: null,
        description: 'SUP-A - Superior A Premium Companies (Tata Capital)'
      },
      'AA': {
        salaryRange: { min: 25000, max: null },
        foir: 70,
        multiplier: 31,
        maxTenureMonths: 72,
        maxLoanAmount: null,
        description: 'AA - Premium Category (Kotak)'
      },
      'A+': {
        salaryRange: { min: 25000, max: null },
        foir: 65,
        multiplier: 30,
        maxTenureMonths: 72,
        maxLoanAmount: null,
        description: 'A+ - Top-tier Listed Companies (IndusInd)'
      },
      'A': {
        salaryRange: { min: 25000, max: null },
        foir: 65,
        multiplier: 30,
        maxTenureMonths: 72,
        maxLoanAmount: null,
        description: 'A - Listed Companies, Established MNCs'
      },
      'GOVT': {
        salaryRange: { min: 25000, max: null },
        foir: 65,
        multiplier: 27,
        maxTenureMonths: 72,
        maxLoanAmount: null,
        description: 'GOVT - Government Employees (All Banks)'
      },
      'Govt': {
        salaryRange: { min: 25000, max: null },
        foir: 65,
        multiplier: 30,
        maxTenureMonths: 72,
        maxLoanAmount: null,
        description: 'Govt - Government Employees (HDFC format)'
      },
      'B': {
        salaryRange: { min: 25000, max: null },
        foir: 60,
        multiplier: 25,
        maxTenureMonths: 72,
        maxLoanAmount: 3000000,
        description: 'B - Mid-tier Companies, Good Corporates'
      },
      'C': {
        salaryRange: { min: 25000, max: null },
        foir: 55,
        multiplier: 18,
        maxTenureMonths: 60,
        maxLoanAmount: 2000000,
        description: 'C - Small Companies, Startups'
      },
      'D': {
        salaryRange: { min: 25000, max: null },
        foir: 50,
        multiplier: 18,
        maxTenureMonths: 60,
        maxLoanAmount: 1000000,
        description: 'D - Lower-tier Companies'
      },
      'UNLISTED': {
        salaryRange: { min: 40000, max: null },
        foir: 50,
        multiplier: 15,
        maxTenureMonths: 48,
        maxLoanAmount: 1000000,
        description: 'UNLISTED - Unlisted/Private Companies'
      }
    }
  };

  const handleAddBank = (e) => {
    e.preventDefault();
    
    if (!bankName.trim()) {
      setError('Bank name is required');
      return;
    }

    // Save all default configurations for the new bank
    const sections = [
      'ageRules', 'tenureRules', 'foirSettings', 'multiplierRules',
      'creditScoreRules', 'interestRates', 'loanCapping', 'employmentRules',
      'btConfiguration', 'feesAndCharges', 'categories'
    ];

    let allSaved = true;
    sections.forEach(section => {
      const success = saveBankConfig(bankName, section, defaultBankConfig[section]);
      if (!success) allSaved = false;
    });

    if (allSaved) {
      const newBank = {
        id: bankName.toLowerCase().replace(/\s+/g, '-'),
        name: bankName,
        logo: bankLogo,
        color: bankColor,
        enabled: true
      };
      
      onBankAdded(newBank);
      onClose();
    } else {
      setError('Failed to save bank configuration');
    }
  };

  const logoOptions = ['🏦', '🏛️', '💳', '💰', '🏢', '🏪', '💼', '📊'];

  return (
    <div className="add-bank-overlay">
      <div className="add-bank-modal">
        <div className="modal-header">
          <h2>➕ Add New Bank</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form className="add-bank-form" onSubmit={handleAddBank}>
          <div className="form-section">
            <label>Bank Name *</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g., Yes Bank"
              className="form-input"
              autoFocus
              required
            />
          </div>

          <div className="form-section">
            <label>Bank Logo (Emoji)</label>
            <div className="logo-selector">
              {logoOptions.map(logo => (
                <button
                  key={logo}
                  type="button"
                  className={`logo-option ${bankLogo === logo ? 'selected' : ''}`}
                  onClick={() => setBankLogo(logo)}
                >
                  {logo}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label>Brand Color</label>
            <div className="color-selector">
              <input
                type="color"
                value={bankColor}
                onChange={(e) => setBankColor(e.target.value)}
                className="color-input"
              />
              <span className="color-preview" style={{ background: bankColor }}>
                {bankLogo}
              </span>
            </div>
          </div>

          <div className="config-info">
            <h3>✅ Default Policies Included:</h3>
            <div className="policy-list">
              <div className="policy-item">✓ Age Rules (21-60 years)</div>
              <div className="policy-item">✓ Tenure Rules (12-84 months)</div>
              <div className="policy-item">✓ FOIR Settings (50-75%)</div>
              <div className="policy-item">✓ Multiplier Rules (15-35x)</div>
              <div className="policy-item">✓ Interest Rates (11%)</div>
              <div className="policy-item">✓ Loan Capping (₹50L max)</div>
              <div className="policy-item">✓ Credit Score Rules (650+)</div>
              <div className="policy-item">✓ Employment Rules (Salaried/Govt)</div>
              <div className="policy-item">✓ BT Configuration (3-6 loans)</div>
              <div className="policy-item">✓ Fees & Charges (3.5%)</div>
              <div className="policy-item">✓ <strong>11 Categories</strong>: Super A, SUP-A, AA, A+, A, GOVT, Govt, B, C, D, UNLISTED</div>
            </div>
            <p className="info-note">
              💡 All categories from existing banks included. GOVT category is present in ALL banks!
            </p>
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <div className="modal-actions">
            <button type="submit" className="btn-add">
              ✅ Add Bank
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBankModal;
