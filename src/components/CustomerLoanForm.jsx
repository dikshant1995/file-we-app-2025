import { useState, useEffect } from 'react';
import './CustomerLoanForm.css';
import { loadUniversalCompanies, getCompanySuggestions, initializeBankDatabases } from '../services/companyDatabaseService.js';
import { indianStates, stateCityData } from '../data/locationData.js';

const CustomerLoanForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    basicSalary: '',
    // Changed: Instead of single averageIncentive, track last 3 months
    incentiveMonth1: '', // Most recent month
    incentiveMonth2: '', // 2 months ago
    incentiveMonth3: '', // 3 months ago
    age: '', // AGE is required for banks to decide tenure capping
    category: 'B', // Default to Category B
    employmentType: 'salaried',
    salaryMode: 'bank', // Default to bank transfer
    companyName: '',
    hasExistingLoans: false,
    existingLoans: [],
    // NEW: Balance Transfer options
    wantsBT: false, // Does customer want to do BT?
    selectedLoansForBT: [], // Array of loan IDs selected for BT
    state: '',
    city: '',
    maritalStatus: '',
    livingStatus: ''
  });

  const [companySuggestions, setCompanySuggestions] = useState([]);

  // Load company databases on mount
  useEffect(() => {
    const loadDatabases = async () => {
      await loadUniversalCompanies();
      await initializeBankDatabases();
      console.log('✅ Company databases ready');
    };
    loadDatabases();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Debug logging for salary input
    if (name === 'basicSalary') {
      console.log('💰 Salary Input Changed:', {
        rawValue: value,
        type: typeof value,
        parsed: parseFloat(value)
      });
    }

    // Handle company name autocomplete
    if (name === 'companyName') {
      const suggestions = getCompanySuggestions(value);
      console.log('🔍 Autocomplete for:', value, '| Suggestions:', suggestions);
      setCompanySuggestions(suggestions);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddLoan = () => {
    setFormData(prev => ({
      ...prev,
      existingLoans: [
        ...prev.existingLoans,
        {
          id: Date.now(),
          type: 'Personal Loan',
          outstandingAmount: '',
          monthlyEMI: '',
          lender: '',
          // Credit Card specific fields
          creditLimit: '',
          creditLimitUsed: ''
        }
      ]
    }));
  };

  const handleRemoveLoan = (id) => {
    setFormData(prev => ({
      ...prev,
      existingLoans: prev.existingLoans.filter(loan => loan.id !== id)
    }));
  };

  const handleLoanChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      existingLoans: prev.existingLoans.map(loan => {
        if (loan.id === id) {
          // If changing loan type to Credit Card, clear EMI and set credit card fields
          if (field === 'type' && value === 'Credit Card') {
            return {
              ...loan,
              [field]: value,
              monthlyEMI: '',
              outstandingAmount: '', // Will use creditLimitUsed instead
              creditLimit: loan.creditLimit || '',
              creditLimitUsed: loan.creditLimitUsed || ''
            };
          }
          // If changing FROM Credit Card to another type, clear credit card fields
          if (field === 'type' && loan.type === 'Credit Card' && value !== 'Credit Card') {
            return {
              ...loan,
              [field]: value,
              creditLimit: '',
              creditLimitUsed: '',
              outstandingAmount: loan.outstandingAmount || ''
            };
          }
          return { ...loan, [field]: value };
        }
        return loan;
      })
    }));
  };

  const handleBTToggle = (loanId) => {
    setFormData(prev => {
      const isSelected = prev.selectedLoansForBT.includes(loanId);
      return {
        ...prev,
        selectedLoansForBT: isSelected
          ? prev.selectedLoansForBT.filter(id => id !== loanId)
          : [...prev.selectedLoansForBT, loanId]
      };
    });
  };

  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // ── Guard: Name & Mobile required ──────────────────────────────────────
    if (!formData.customerName.trim()) {
      setValidationError('Please enter your full name to continue.');
      document.getElementById('customerName')?.focus();
      return;
    }
    const mobileRegex = /^[6-9][0-9]{9}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      setValidationError('Please enter a valid 10-digit mobile number to continue.');
      document.getElementById('mobileNumber')?.focus();
      return;
    }
    // ───────────────────────────────────────────────────────────────────────

    // Parse data EXACTLY as backend expects
    const basicSalary = parseFloat(formData.basicSalary) || 0;

    // Calculate average incentive from last 3 months
    const incentiveMonth1 = parseFloat(formData.incentiveMonth1) || 0;
    const incentiveMonth2 = parseFloat(formData.incentiveMonth2) || 0;
    const incentiveMonth3 = parseFloat(formData.incentiveMonth3) || 0;
    const averageIncentive = (incentiveMonth1 + incentiveMonth2 + incentiveMonth3) / 3;

    // Total monthly income = basic + incentive (frontend provides total, banks apply their %)
    const totalMonthlyIncome = basicSalary + averageIncentive;

    // Calculate total existing EMI (excluding credit cards)
    const totalExistingEMI = formData.existingLoans.reduce((sum, loan) => {
      // Credit cards don't have fixed EMI, skip them
      if (loan.type === 'Credit Card') return sum;
      return sum + (parseFloat(loan.monthlyEMI) || 0);
    }, 0);

    // Calculate total credit card obligation (5% of used amount for non-BT credit cards)
    const totalCreditCardObligation = formData.existingLoans.reduce((sum, loan) => {
      if (loan.type !== 'Credit Card') return sum;
      // If credit card is selected for BT, don't count it as obligation
      if (formData.wantsBT && formData.selectedLoansForBT.includes(loan.id)) return sum;
      // Otherwise, add 5% of credit limit used as monthly obligation
      const creditLimitUsed = parseFloat(loan.creditLimitUsed) || 0;
      return sum + (creditLimitUsed * 0.05);
    }, 0);

    // Extract existing loan bank names (for checking if customer already has loan from same bank)
    const existingLoanBanks = formData.existingLoans
      .filter(loan =>
        loan.type === 'Personal Loan' &&
        loan.lender &&
        loan.lender.trim() !== '' &&
        loan.lender !== 'other' // Exclude "Other Bank (Not Listed)"
      )
      .map(loan => loan.lender.trim().toLowerCase());

    // Extract actual loan objects for Balance Transfer
    const loansForBT = formData.wantsBT 
      ? formData.existingLoans.filter(loan => formData.selectedLoansForBT.includes(loan.id))
      : [];

    // DEBUG: Log extracted bank names
    console.log('='.repeat(80));
    console.log('🔍 EXISTING LOAN BANKS CHECK:');
    console.log('Total existing loans:', formData.existingLoans.length);
    console.log('Loans selected for BT:', loansForBT.length);
    console.log('Existing loans data:', formData.existingLoans);
    console.log('Filtered Personal Loan banks:', existingLoanBanks);
    console.log('='.repeat(80));

    // Prepare data EXACTLY as realLoanService expects
    const submissionData = {
      basicSalary: basicSalary, // NEW: Pass basic salary separately
      averageIncentive: averageIncentive, // NEW: Pass average incentive separately
      monthlyIncome: totalMonthlyIncome, // Total income (for backward compatibility)
      age: parseInt(formData.age), // AGE required for tenure capping
      category: formData.employmentType === 'government' ? 'GOVT' : formData.category, // Auto-select GOVT for govt employees
      employmentType: formData.employmentType,
      companyName: formData.companyName,
      existingEMI: totalExistingEMI,
      creditCardObligation: totalCreditCardObligation, // NEW: 5% of non-BT credit card balances
      existingLoanBanks: existingLoanBanks, // NEW: List of banks where customer has existing personal loans
      // NEW: Balance Transfer data
      wantsBT: formData.wantsBT,
      selectedLoansForBT: formData.wantsBT ? formData.selectedLoansForBT : [],
      loansForBT: loansForBT, // NEW: Full loan objects for calculation
      creditScore: formData.creditScore ? parseInt(formData.creditScore) : 700,
      state: formData.state,
      city: formData.city,
      salaryMode: formData.salaryMode || 'bank',
      maritalStatus: formData.maritalStatus,
      livingStatus: formData.livingStatus,
      // loanTenure will default to 5 years in backend, banks will cap based on age
      // desiredLoanAmount not provided - banks calculate maximum
      // creditScore will default to 700 in backend (used by some banks internally)

      // Additional data for display purposes (not used in calculation)
      _metadata: {
        customerName: formData.customerName,
        mobileNumber: formData.mobileNumber,
        basicSalary: basicSalary,
        averageIncentive: averageIncentive,
        incentiveMonth1: incentiveMonth1,
        incentiveMonth2: incentiveMonth2,
        incentiveMonth3: incentiveMonth3,
        existingLoans: formData.existingLoans,
        wantsBT: formData.wantsBT,
        selectedLoansForBT: formData.selectedLoansForBT,
        state: formData.state,
        city: formData.city,
        salaryMode: formData.salaryMode, // Add salaryMode to metadata
        maritalStatus: formData.maritalStatus,
        livingStatus: formData.livingStatus
      }
    };

    // Pass submissionData to loan engine AND raw formData to lead service
    onSubmit(submissionData, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="customer-loan-form professional-grid-bg">
      <div className="form-header">
        <h2>Financial Analysis Engine</h2>
        <p>Comprehensive eligibility assessment across institutional databases</p>
      </div>

      {/* Personal Details */}
      <div className="form-section">
        <h3>Personal Identification</h3>
        <div className="form-row-two">
          <div className="form-group">
            <label htmlFor="customerName">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="mobileNumber">
              Mobile Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              placeholder="10-digit mobile number"
              required
              maxLength={10}
              pattern="[6-9][0-9]{9}"
              title="Enter a valid 10-digit Indian mobile number"
              inputMode="numeric"
              style={
                formData.mobileNumber.length > 0 && formData.mobileNumber.length < 10
                  ? { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.2)' }
                  : {}
              }
            />
            {/* Live validation feedback */}
            {formData.mobileNumber.length > 0 && formData.mobileNumber.length < 10 && (
              <small style={{ color: '#f87171', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                ⚠️ Mobile number must be exactly 10 digits ({10 - formData.mobileNumber.length} more needed)
              </small>
            )}
            {formData.mobileNumber.length === 10 && (
              <small className="help-text" style={{ color: '#00ff88', fontWeight: '600' }}>
                ✓ Valid mobile number
              </small>
            )}
          </div>
        </div>

        <div className="form-row-two" style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label htmlFor="state">
              State <span className="required">*</span>
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={(e) => {
                const newState = e.target.value;
                setFormData(prev => ({ ...prev, state: newState, city: '' }));
              }}
              required
            >
              <option value="">-- Select State --</option>
              {indianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="city">
              City <span className="required">*</span>
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              disabled={!formData.state}
            >
              <option value="">-- Select City --</option>
              {formData.state && stateCityData[formData.state]?.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div style={{
          width: '100%',
          padding: '14px 18px',
          marginBottom: '8px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderLeft: '3px solid #ef4444',
          borderRadius: '8px',
          color: '#fca5a5',
          fontSize: '0.92rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          Attention: {validationError}
        </div>
      )}

      {/* Salary Information */}
      <div className="form-section">
        <h3>Financial Compensation</h3>

        <div className="form-group">
          <label htmlFor="basicSalary">
            Monthly Basic Salary <span className="required">*</span>
          </label>
          <input
            type="number"
            id="basicSalary"
            name="basicSalary"
            value={formData.basicSalary}
            onChange={handleInputChange}
            placeholder="₹ 50,000"
            required
            min="0"
            step="1"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          {formData.basicSalary && (
            <small className="help-text" style={{ color: '#27ae60', fontWeight: '600' }}>
              Value stored: ₹{parseFloat(formData.basicSalary).toLocaleString('en-IN')}
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="averageIncentive">
            Monthly Incentive Details <span className="optional">(optional)</span>
          </label>
          <small className="help-text" style={{ display: 'block', marginBottom: '10px' }}>
            Enter your incentive/variable pay for the last 3 months. Different banks consider different percentages (25%, 50%, or 100%).
          </small>

          <div className="incentive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div>
              <label htmlFor="incentiveMonth1" style={{ fontSize: '0.9em', fontWeight: '600', color: '#555' }}>
                Current Month
              </label>
              <input
                type="number"
                id="incentiveMonth1"
                name="incentiveMonth1"
                value={formData.incentiveMonth1}
                onChange={handleInputChange}
                placeholder="₹ 0"
                min="0"
                step="1"
                style={{ marginTop: '5px' }}
              />
            </div>

            <div>
              <label htmlFor="incentiveMonth2" style={{ fontSize: '0.9em', fontWeight: '600', color: '#555' }}>
                Last Month
              </label>
              <input
                type="number"
                id="incentiveMonth2"
                name="incentiveMonth2"
                value={formData.incentiveMonth2}
                onChange={handleInputChange}
                placeholder="₹ 0"
                min="0"
                step="1"
                style={{ marginTop: '5px' }}
              />
            </div>

            <div>
              <label htmlFor="incentiveMonth3" style={{ fontSize: '0.9em', fontWeight: '600', color: '#555' }}>
                2 Months Ago
              </label>
              <input
                type="number"
                id="incentiveMonth3"
                name="incentiveMonth3"
                value={formData.incentiveMonth3}
                onChange={handleInputChange}
                placeholder="₹ 0"
                min="0"
                step="1"
                style={{ marginTop: '5px' }}
              />
            </div>
          </div>
        </div>

        {(formData.incentiveMonth1 || formData.incentiveMonth2 || formData.incentiveMonth3) && (
          <div className="incentive-summary" style={{
            marginTop: '15px',
            padding: '15px',
            background: '#f0f7ff',
            borderRadius: '8px',
            borderLeft: '4px solid #2196f3'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Incentive Summary:</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.9em' }}>
              <div>
                <span style={{ color: '#666' }}>Total (3 months):</span>
                <strong style={{ marginLeft: '8px' }}>
                  ₹{((parseFloat(formData.incentiveMonth1) || 0) +
                    (parseFloat(formData.incentiveMonth2) || 0) +
                    (parseFloat(formData.incentiveMonth3) || 0)).toLocaleString('en-IN')}
                </strong>
              </div>
              <div>
                <span style={{ color: '#666' }}>Average per month:</span>
                <strong style={{ marginLeft: '8px' }}>
                  ₹{(((parseFloat(formData.incentiveMonth1) || 0) +
                    (parseFloat(formData.incentiveMonth2) || 0) +
                    (parseFloat(formData.incentiveMonth3) || 0)) / 3).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </strong>
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.85em', fontStyle: 'italic', color: '#555' }}>
              Note: Banks will apply their own percentage (25%-100%) to this average based on their policies.
            </div>
          </div>
        )}

        {(formData.basicSalary || formData.incentiveMonth1 || formData.incentiveMonth2 || formData.incentiveMonth3) && (
          <div className="total-income-display">
            <strong>Total Monthly Income (Basic + Avg Incentive):</strong> ₹{(
              (parseFloat(formData.basicSalary) || 0) +
              ((parseFloat(formData.incentiveMonth1) || 0) +
                (parseFloat(formData.incentiveMonth2) || 0) +
                (parseFloat(formData.incentiveMonth3) || 0)) / 3
            ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        )}
      </div>

      {/* Personal & Employment Details */}
      <div className="form-section">
        <h3>Employment & Personal Profile</h3>

        <div className="form-group">
          <label htmlFor="age">
            Current Age <span className="required">*</span>
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="30"
            required
            min="21"
            max="65"
            step="1"
          />
          <small className="help-text">
            Banks use age to decide maximum loan tenure (retirement age limit)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="maritalStatus">
            Marital Status <span className="required">*</span>
          </label>
          <select
            id="maritalStatus"
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={(e) => {
              // Reset living status when marital status changes to force re-selection
              setFormData(prev => ({ ...prev, maritalStatus: e.target.value, livingStatus: '' }));
            }}
            required
          >
            <option value="">-- Select Status --</option>
            <option value="single">Single / Unmarried</option>
            <option value="married">Married</option>
          </select>
        </div>

        {formData.maritalStatus && (
          <div className="form-group" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <label htmlFor="livingStatus">
              Current Living Arrangement <span className="required">*</span>
            </label>
            <select
              id="livingStatus"
              name="livingStatus"
              value={formData.livingStatus}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select Living Arrangement --</option>
              <option value="bachelor">Living Alone / With Flatmates (Bachelor)</option>
              <option value="family">Living with Family (Parents/Spouse/Children)</option>
              <option value="self_owned">Living in Self-Owned Property</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="employmentType">
            Employment Type <span className="required">*</span>
          </label>
          <select
            id="employmentType"
            name="employmentType"
            value={formData.employmentType}
            onChange={handleInputChange}
            required
          >
            <option value="salaried">Private</option>
            <option value="government">Government Employee</option>
          </select>
        </div>

        {formData.employmentType === 'salaried' && (
          <div className="form-group">
            <label htmlFor="companyName">
              Company Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Start typing company name..."
              required={formData.employmentType === 'salaried'}
              autoComplete="off"
            />
            {companySuggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {companySuggestions.map((company, idx) => (
                  <div
                    key={idx}
                    className="autocomplete-item"
                    onMouseDown={() => {
                      console.log('🏢 Company Selected:', company);
                      setFormData(prev => ({ ...prev, companyName: company }));
                      setCompanySuggestions([]);
                    }}
                  >
                    {company}
                  </div>
                ))}
              </div>
            )}
            <small className="help-text">
              Type your company name. We'll check each bank's database for your category.
            </small>
          </div>
        )}

        {/* String 8: Salary Mode Selection */}
        <div className="form-group">
          <label htmlFor="salaryMode">
            Salary Received In <span className="required">*</span>
          </label>
          <select
            id="salaryMode"
            name="salaryMode"
            value={formData.salaryMode || 'bank'}
            onChange={handleInputChange}
            required
            className="salary-mode-select"
          >
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
          </select>
          <small className="help-text" style={{ display: 'block', marginTop: '5px', fontSize: '0.85em', color: '#666' }}>
            Most institutional banks strictly required a "Bank Transfer" salary.
          </small>
        </div>
      </div>

      {/* Existing Loans */}
      <div className="form-section">
        <h3>Financial Commitments</h3>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="hasExistingLoans"
              checked={formData.hasExistingLoans}
              onChange={handleInputChange}
            />
            I have existing loans
          </label>
          <small className="help-text" style={{ display: 'block', marginTop: '5px', marginLeft: '24px' }}>
            Add all your existing loans below (personal loans, car loans, credit cards, etc.)
          </small>
        </div>

        {formData.hasExistingLoans && (
          <div className="existing-loans-section">
            {formData.existingLoans.map((loan, index) => (
              <div key={loan.id} className="loan-item">
                <div className="loan-item-header">
                  <h4>Loan {index + 1}</h4>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveLoan(loan.id)}
                  >
                    ✕ Remove
                  </button>
                </div>

                <div className="loan-fields">
                  <div className="form-group">
                    <label>Loan Type</label>
                    <select
                      value={loan.type}
                      onChange={(e) => handleLoanChange(loan.id, 'type', e.target.value)}
                    >
                      <option value="Personal Loan">Personal Loan</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Car Loan">Car Loan</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Credit Card: Show Credit Limit and Credit Limit Used */}
                  {loan.type === 'Credit Card' ? (
                    <>
                      <div className="form-group">
                        <label>Credit Limit (₹)</label>
                        <input
                          type="number"
                          value={loan.creditLimit}
                          onChange={(e) => handleLoanChange(loan.id, 'creditLimit', e.target.value)}
                          placeholder="₹ 2,00,000"
                          min="0"
                          step="1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Credit Limit Used / Outstanding (₹)</label>
                        <input
                          type="number"
                          value={loan.creditLimitUsed}
                          onChange={(e) => handleLoanChange(loan.id, 'creditLimitUsed', e.target.value)}
                          placeholder="₹ 50,000"
                          min="0"
                          step="1"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Other Loan Types: Show Outstanding Amount and EMI */}
                      <div className="form-group">
                        <label>Outstanding Amount (₹)</label>
                        <input
                          type="number"
                          value={loan.outstandingAmount}
                          onChange={(e) => handleLoanChange(loan.id, 'outstandingAmount', e.target.value)}
                          placeholder="₹ 5,00,000"
                          min="0"
                          step="1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Current Monthly EMI (₹)</label>
                        <input
                          type="number"
                          value={loan.monthlyEMI}
                          onChange={(e) => handleLoanChange(loan.id, 'monthlyEMI', e.target.value)}
                          placeholder="₹ 15,000"
                          min="0"
                          step="1"
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>Current Lender <span className="required">*</span></label>
                    <select
                      value={loan.lender}
                      onChange={(e) => handleLoanChange(loan.id, 'lender', e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #e0e0e0' }}
                    >
                      <option value="">-- Select Bank --</option>
                      <option value="kotak mahindra bank">Kotak Mahindra Bank</option>
                      <option value="hdfc bank">HDFC Bank</option>
                      <option value="icici bank">ICICI Bank</option>
                      <option value="bandhan bank">Bandhan Bank</option>
                      <option value="cholamandalam finance">Cholamandalam Finance</option>
                      <option value="tata capital">Tata Capital</option>
                      <option value="poonawala finance">Poonawala Finance</option>
                      <option value="axis finance">Axis Finance</option>
                      <option value="indusind bank">IndusInd Bank</option>
                      <option value="idfc bank">IDFC Bank</option>
                      <option value="shri ram finance">Shri Ram Finance</option>
                      <option value="piramal finance">Piramal Finance</option>
                      <option value="other">Other Bank (Not Listed)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn-add-loan"
              onClick={handleAddLoan}
            >
              + Add Another Loan
            </button>

            {formData.existingLoans.length > 0 && (
              <div className="loans-summary">
                <strong>Total Existing EMI:</strong> ₹{formData.existingLoans.reduce((sum, loan) =>
                  sum + (parseFloat(loan.monthlyEMI) || 0), 0
                ).toLocaleString('en-IN')}

                {/* Show which banks will be excluded */}
                {formData.existingLoans.some(loan =>
                  loan.type === 'Personal Loan' &&
                  loan.lender &&
                  loan.lender.trim() !== '' &&
                  loan.lender !== 'other'
                ) && (
                    <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '5px', borderLeft: '4px solid #ffc107' }}>
                      <strong>Bank Exclusions Detected:</strong>
                      <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                        {formData.existingLoans
                          .filter(loan =>
                            loan.type === 'Personal Loan' &&
                            loan.lender &&
                            loan.lender.trim() !== '' &&
                            loan.lender !== 'other'
                          )
                          .map((loan, idx) => (
                            <div key={idx} style={{ color: '#856404' }}>
                              Exclusion: <strong style={{ textTransform: 'capitalize' }}>{loan.lender}</strong> - Active personal loan detected with this institution
                            </div>
                          ))
                        }
                        <div style={{ marginTop: '5px', fontSize: '0.85em', fontStyle: 'italic', color: '#666' }}>
                          These banks will not appear in your eligibility results.
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Balance Transfer Section */}
      {
        formData.hasExistingLoans && formData.existingLoans.length > 0 && (
          <div className="form-section" style={{ background: '#f0f7ff', borderLeft: '4px solid #2196f3' }}>
            <h3>Balance Transfer Optimization</h3>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="wantsBT"
                  checked={formData.wantsBT}
                  onChange={handleInputChange}
                />
                <strong>Yes, I want to do Balance Transfer</strong>
              </label>
              <small className="help-text" style={{ display: 'block', marginTop: '5px', marginLeft: '24px' }}>
                Select which specific loans you want to transfer to a new bank with better rates
              </small>
            </div>

            {formData.wantsBT && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '15px', color: '#1976d2' }}>Select Loans for Balance Transfer:</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.existingLoans.map((loan, index) => (
                    <div
                      key={loan.id}
                      style={{
                        padding: '15px',
                        background: 'white',
                        borderRadius: '8px',
                        border: formData.selectedLoansForBT.includes(loan.id) ? '2px solid #2196f3' : '2px solid #e0e0e0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleBTToggle(loan.id)}
                    >
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={formData.selectedLoansForBT.includes(loan.id)}
                          onChange={() => handleBTToggle(loan.id)}
                          style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '1.05em', marginBottom: '8px', color: '#333' }}>
                            Loan {index + 1}: {loan.type}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.9em', color: '#666' }}>
                            <div>🏦 <strong>Bank:</strong> <span style={{ textTransform: 'capitalize' }}>{loan.lender || 'Not specified'}</span></div>
                            {loan.type === 'Credit Card' ? (
                              <>
                                <div>💳 <strong>Credit Limit:</strong> ₹{loan.creditLimit ? parseFloat(loan.creditLimit).toLocaleString('en-IN') : '0'}</div>
                                <div>💵 <strong>Used:</strong> ₹{loan.creditLimitUsed ? parseFloat(loan.creditLimitUsed).toLocaleString('en-IN') : '0'}</div>
                              </>
                            ) : (
                              <>
                                <div>💵 <strong>Outstanding:</strong> ₹{loan.outstandingAmount ? parseFloat(loan.outstandingAmount).toLocaleString('en-IN') : '0'}</div>
                                <div>💳 <strong>EMI:</strong> ₹{loan.monthlyEMI ? parseFloat(loan.monthlyEMI).toLocaleString('en-IN') : '0'}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                {formData.selectedLoansForBT.length > 0 && (
                  <div style={{ marginTop: '15px', padding: '15px', background: '#e8f5e9', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                    <strong>✅ Selected for BT:</strong> {formData.selectedLoansForBT.length} loan(s)
                    <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                      <strong>Total EMI to Transfer:</strong> ₹{formData.existingLoans
                        .filter(loan => formData.selectedLoansForBT.includes(loan.id))
                        .reduce((sum, loan) => sum + (parseFloat(loan.monthlyEMI) || 0), 0)
                        .toLocaleString('en-IN')}
                    </div>
                    <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                      <strong>Total Outstanding to Transfer:</strong> ₹{formData.existingLoans
                        .filter(loan => formData.selectedLoansForBT.includes(loan.id))
                        .reduce((sum, loan) => sum + (parseFloat(loan.outstandingAmount) || 0), 0)
                        .toLocaleString('en-IN')}
                    </div>
                  </div>
                )}

                {formData.selectedLoansForBT.length === 0 && (
                  <div style={{ marginTop: '15px', padding: '12px', background: '#fff3cd', borderRadius: '6px', fontSize: '0.9em', color: '#856404' }}>
                    ⚠️ Please select at least one loan for Balance Transfer
                  </div>
                )}
              </div>
            )}
          </div>
        )
      }

      {/* Submit Button */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Processing Analysis...' : 'Generate Eligibility Report'}
        </button>
      </div>

      {/* Information Note */}
      <div className="form-note">
        <p><strong>Note:</strong></p>
        <ul>
          <li>Fixed 11% interest rate calculation across all institutions</li>
          <li>Optimized loan tenure based on specific banking algorithms</li>
          <li>Maximum eligibility limit assessment in real-time</li>
          <li>Comprehensive multi-bank comparison reports</li>
        </ul>
      </div>
    </form>
  );
};

export default CustomerLoanForm;
