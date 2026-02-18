import { useState } from 'react';
import './UserInputForm.css';

const EnhancedUserInputForm = ({ onSubmit, onReset }) => {
  const [customerInfo, setCustomerInfo] = useState({
    desiredLoanAmount: '',
    monthlyIncome: '',
    loanTenure: '',
    companyName: '',
    employmentType: 'salaried',
    category: 'A',
    creditScore: ''
  });

  const [existingLiabilities, setExistingLiabilities] = useState([]);
  const [selectedLiabilities, setSelectedLiabilities] = useState([]);

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-select GOVT category when government employment type is selected
    if (name === 'employmentType' && value === 'government') {
      setCustomerInfo(prev => ({
        ...prev,
        [name]: value,
        category: 'GOVT'
      }));
    } else {
      setCustomerInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addLiability = () => {
    const newLiability = {
      id: Date.now(),
      type: 'Personal Loan',
      name: '',
      outstandingAmount: '',
      monthlyPayment: '',
      selected: true
    };
    const updatedLiabilities = [...existingLiabilities, newLiability];
    setExistingLiabilities(updatedLiabilities);
    
    // Automatically select new liability
    setSelectedLiabilities(prev => [...prev, newLiability.id]);
  };

  const removeLiability = (id) => {
    const updatedLiabilities = existingLiabilities.filter(liability => liability.id !== id);
    setExistingLiabilities(updatedLiabilities);
    
    // Remove from selected liabilities if it was selected
    setSelectedLiabilities(prev => prev.filter(selectedId => selectedId !== id));
  };

  const updateLiability = (id, field, value) => {
    const updatedLiabilities = existingLiabilities.map(liability => 
      liability.id === id ? { ...liability, [field]: value } : liability
    );
    setExistingLiabilities(updatedLiabilities);
  };

  const toggleLiabilitySelection = (id) => {
    setSelectedLiabilities(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for all three scenarios
    const formData = {
      customerInfo: {
        ...customerInfo,
        desiredLoanAmount: customerInfo.desiredLoanAmount || '',
        monthlyIncome: customerInfo.monthlyIncome || '',
        loanTenure: customerInfo.loanTenure || '',
        creditScore: customerInfo.creditScore || ''
      },
      existingLiabilities: existingLiabilities.map(liability => ({
        ...liability,
        outstandingAmount: liability.outstandingAmount || '',
        monthlyPayment: liability.monthlyPayment || ''
      })),
      selectedLiabilities: selectedLiabilities
    };
    
    onSubmit(formData);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setCustomerInfo({
      desiredLoanAmount: '',
      monthlyIncome: '',
      loanTenure: '',
      companyName: '',
      employmentType: 'salaried',
      category: 'A',
      creditScore: ''
    });
    setExistingLiabilities([]);
    setSelectedLiabilities([]);
    if (onReset) onReset();
  };

  // Calculate totals for display
  const totalOutstandingAmount = existingLiabilities.reduce((sum, liability) => 
    sum + (parseFloat(liability.outstandingAmount) || 0), 0);
    
  const totalMonthlyPayment = existingLiabilities.reduce((sum, liability) => 
    sum + (parseFloat(liability.monthlyPayment) || 0), 0);
    
  const selectedOutstandingAmount = existingLiabilities
    .filter(liability => selectedLiabilities.includes(liability.id))
    .reduce((sum, liability) => sum + (parseFloat(liability.outstandingAmount) || 0), 0);

  return (
    <div className="user-input-form">
      <h2>🏦 Comprehensive Loan Calculator</h2>
      <p className="subtitle">Calculate all loan scenarios in one place</p>
      
      <form onSubmit={handleSubmit}>
        {/* Component 1: Customer Information & Financials */}
        <div className="form-section">
          <h3>👤 Customer Information & Financials</h3>
          
          <div className="form-group">
            <label htmlFor="desiredLoanAmount">Desired Loan Amount (₹)</label>
            <input
              type="number"
              id="desiredLoanAmount"
              name="desiredLoanAmount"
              value={customerInfo.desiredLoanAmount}
              onChange={handleCustomerInfoChange}
              placeholder="Enter desired loan amount"
            />
          </div>

          <div className="form-group">
            <label htmlFor="monthlyIncome">Monthly Income (₹)</label>
            <input
              type="number"
              id="monthlyIncome"
              name="monthlyIncome"
              value={customerInfo.monthlyIncome}
              onChange={handleCustomerInfoChange}
              required
              placeholder="Enter your monthly income"
            />
          </div>

          <div className="form-group">
            <label htmlFor="loanTenure">Loan Tenure (years)</label>
            <input
              type="number"
              id="loanTenure"
              name="loanTenure"
              value={customerInfo.loanTenure}
              onChange={handleCustomerInfoChange}
              required
              placeholder="Enter loan tenure"
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={customerInfo.companyName}
              onChange={handleCustomerInfoChange}
              required
              placeholder="Enter your company name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="employmentType">Employment Type</label>
            <select
              id="employmentType"
              name="employmentType"
              value={customerInfo.employmentType}
              onChange={handleCustomerInfoChange}
              required
            >
              <option value="salaried">Salaried</option>
              <option value="self-employed">Self Employed</option>
              <option value="government">Government Employee</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Company Category</label>
            <select
              id="category"
              name="category"
              value={customerInfo.category}
              onChange={handleCustomerInfoChange}
              required
            >
              <option value="SUPER-A">Super A - Premium Companies</option>
              <option value="A+">A+ - Premium Tier</option>
              <option value="A">Category A - Top Tier Companies</option>
              <option value="B">Category B - Good Companies</option>
              <option value="C">Category C - Standard Companies</option>
              <option value="D">Category D - Lower Tier Companies</option>
              <option value="GOVT">Government Employee</option>
              <option value="UNLISTED">Unlisted Company</option>
            </select>
            <small className="form-hint">
              Select your company category. Premium categories (SUPER-A, A+, A) get better rates.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="creditScore">Credit Score (Optional)</label>
            <input
              type="number"
              id="creditScore"
              name="creditScore"
              value={customerInfo.creditScore}
              onChange={handleCustomerInfoChange}
              min="300"
              max="900"
              placeholder="Enter credit score (300-900)"
            />
          </div>
        </div>

        {/* Component 2: Existing Loans & Credit Cards (For BT) */}
        <div className="form-section">
          <h3>📋 Existing Loans & Credit Cards (For BT)</h3>
          <p className="section-hint">Add all your existing financial obligations that are eligible for Balance Transfer</p>
          
          <div className="totals-summary">
            <div className="total-item">
              <span>Total Outstanding:</span>
              <strong>₹{totalOutstandingAmount.toLocaleString()}</strong>
            </div>
            <div className="total-item">
              <span>Total Monthly Payments:</span>
              <strong>₹{totalMonthlyPayment.toLocaleString()}</strong>
            </div>
            <div className="total-item">
              <span>Selected for Partial BT:</span>
              <strong>₹{selectedOutstandingAmount.toLocaleString()}</strong>
            </div>
          </div>

          {existingLiabilities.map((liability) => (
            <div key={liability.id} className="liability-card">
              <div className="liability-header">
                <div className="selection-control">
                  <input
                    type="checkbox"
                    id={`select-${liability.id}`}
                    checked={selectedLiabilities.includes(liability.id)}
                    onChange={() => toggleLiabilitySelection(liability.id)}
                  />
                  <label htmlFor={`select-${liability.id}`}>Include in Partial BT</label>
                </div>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeLiability(liability.id)}
                >
                  ✕ Remove
                </button>
              </div>
              
              <div className="liability-inputs">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={liability.type}
                    onChange={(e) => updateLiability(liability.id, 'type', e.target.value)}
                  >
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Car Loan">Car Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Name/Description</label>
                  <input
                    type="text"
                    value={liability.name}
                    onChange={(e) => updateLiability(liability.id, 'name', e.target.value)}
                    placeholder={`e.g., ${liability.type} with Bank Name`}
                  />
                </div>
                
                <div className="form-group">
                  <label>Outstanding Amount (₹)</label>
                  <input
                    type="number"
                    value={liability.outstandingAmount}
                    onChange={(e) => updateLiability(liability.id, 'outstandingAmount', e.target.value)}
                    placeholder="Current balance"
                  />
                </div>
                
                <div className="form-group">
                  <label>Monthly Payment (₹)</label>
                  <input
                    type="number"
                    value={liability.monthlyPayment}
                    onChange={(e) => updateLiability(liability.id, 'monthlyPayment', e.target.value)}
                    placeholder="Current monthly payment"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button type="button" className="add-btn" onClick={addLiability}>
            + Add Loan or Credit Card
          </button>
        </div>

        {/* Component 3: Action Buttons */}
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            🧮 Calculate All Loan Scenarios
          </button>
          <button type="button" className="reset-btn" onClick={handleReset}>
            🔄 Reset All
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedUserInputForm;