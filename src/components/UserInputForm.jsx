import { useState, useEffect } from 'react'
import './UserInputForm.css'
import { getBankConfig } from '../services/bankConfigService.js'

const UserInputForm = ({ onSubmit, onReset }) => {
  const [calculationType, setCalculationType] = useState('regular'); // 'regular' or 'bt'
  const [existingLoans, setExistingLoans] = useState([]);
  const [creditCards, setCreditCards] = useState([]);

  const [formData, setFormData] = useState({
    desiredLoanAmount: '',
    loanTenure: '',
    monthlyIncome: '',
    existingEMI: '',
    companyName: '',
    employmentType: 'salaried',
    category: 'A',
    creditScore: '',
    interestRate: '8.2',
    // BT-specific fields
    calculationType: 'regular',
    existingLoans: [],
    creditCards: []
  })

  const [categoryLabels, setCategoryLabels] = useState({});

  useEffect(() => {
    const hdfcConfig = getBankConfig('HDFC Bank', 'categories') || {};
    const labels = {};
    Object.keys(hdfcConfig).forEach(key => {
      if (hdfcConfig[key].displayLabel) {
        labels[key] = hdfcConfig[key].displayLabel;
      }
    });
    setCategoryLabels(labels);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target

    // Auto-select GOVT category when government employment type is selected
    if (name === 'employmentType' && value === 'government') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        category: 'GOVT'
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleCalculationTypeChange = (type) => {
    setCalculationType(type);
    setFormData(prev => ({
      ...prev,
      calculationType: type,
      existingLoans: type === 'bt' ? existingLoans : [],
      creditCards: type === 'bt' ? creditCards : []
    }));
  }

  const addExistingLoan = () => {
    const newLoan = { loanName: '', emi: '', pos: '' };
    const updatedLoans = [...existingLoans, newLoan];
    setExistingLoans(updatedLoans);
    setFormData(prev => ({ ...prev, existingLoans: updatedLoans }));
  }

  const removeExistingLoan = (index) => {
    const updatedLoans = existingLoans.filter((_, i) => i !== index);
    setExistingLoans(updatedLoans);
    setFormData(prev => ({ ...prev, existingLoans: updatedLoans }));
  }

  const updateExistingLoan = (index, field, value) => {
    const updatedLoans = [...existingLoans];
    updatedLoans[index] = { ...updatedLoans[index], [field]: value };
    setExistingLoans(updatedLoans);
    setFormData(prev => ({ ...prev, existingLoans: updatedLoans }));
  }

  const addCreditCard = () => {
    const newCard = { cardName: '', outstandingAmount: '' };
    const updatedCards = [...creditCards, newCard];
    setCreditCards(updatedCards);
    setFormData(prev => ({ ...prev, creditCards: updatedCards }));
  }

  const removeCreditCard = (index) => {
    const updatedCards = creditCards.filter((_, i) => i !== index);
    setCreditCards(updatedCards);
    setFormData(prev => ({ ...prev, creditCards: updatedCards }));
  }

  const updateCreditCard = (index, field, value) => {
    const updatedCards = [...creditCards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setCreditCards(updatedCards);
    setFormData(prev => ({ ...prev, creditCards: updatedCards }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure all required fields are properly formatted before submission
    const formattedData = {
      ...formData,
      desiredLoanAmount: formData.desiredLoanAmount || '',
      loanTenure: formData.loanTenure || '',
      monthlyIncome: formData.monthlyIncome || '',
      existingEMI: formData.existingEMI || '',
      creditScore: formData.creditScore || '',
      interestRate: formData.interestRate || '8.2',
      existingLoans: existingLoans.map(loan => ({
        ...loan,
        emi: loan.emi || '',
        pos: loan.pos || ''
      })),
      creditCards: creditCards.map(card => ({
        ...card,
        outstandingAmount: card.outstandingAmount || ''
      }))
    };
    onSubmit(formattedData);
  }

  const handleReset = (e) => {
    e.preventDefault()
    setCalculationType('regular');
    setExistingLoans([]);
    setCreditCards([]);
    setFormData({
      desiredLoanAmount: '',
      loanTenure: '',
      monthlyIncome: '',
      existingEMI: '',
      companyName: '',
      employmentType: 'salaried',
      category: 'A',
      creditScore: '',
      interestRate: '8.2',
      calculationType: 'regular',
      existingLoans: [],
      creditCards: []
    })
    if (onReset) onReset()
  }

  return (
    <div className="user-input-form">
      <h2>Loan Eligibility Calculator</h2>

      {/* Calculation Type Selector */}
      <div className="calculation-type-selector">
        <button
          type="button"
          className={`type-btn ${calculationType === 'regular' ? 'active' : ''}`}
          onClick={() => handleCalculationTypeChange('regular')}
        >
          💰 Regular Loan
        </button>
        <button
          type="button"
          className={`type-btn ${calculationType === 'bt' ? 'active' : ''}`}
          onClick={() => handleCalculationTypeChange('bt')}
        >
          🔄 Balance Transfer (BT)
        </button>
      </div>

      {calculationType === 'bt' && (
        <div className="bt-info-banner">
          <strong>💡 Balance Transfer:</strong> Consolidate existing loans & credit cards into one loan while getting fresh funds!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="desiredLoanAmount">Desired Loan Amount (₹)</label>
          <input
            type="number"
            id="desiredLoanAmount"
            name="desiredLoanAmount"
            value={formData.desiredLoanAmount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="loanTenure">Loan Tenure (years)</label>
          <input
            type="number"
            id="loanTenure"
            name="loanTenure"
            value={formData.loanTenure}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="monthlyIncome">Monthly Income (₹)</label>
          <input
            type="number"
            id="monthlyIncome"
            name="monthlyIncome"
            value={formData.monthlyIncome}
            onChange={handleChange}
            required
          />
        </div>

        {calculationType === 'regular' && (
          <div className="form-group">
            <label htmlFor="existingEMI">Existing EMIs (₹)</label>
            <input
              type="number"
              id="existingEMI"
              name="existingEMI"
              value={formData.existingEMI}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="employmentType">Employment Type</label>
          <select
            id="employmentType"
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
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
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="SUPER-A">{categoryLabels['SUPER-A'] || 'Super A'} - Premium Companies</option>
            <option value="A">{categoryLabels['A'] || 'Category A'} - Top Tier Companies</option>
            <option value="B">{categoryLabels['B'] || 'Category B'} - Good Companies</option>
            <option value="C">{categoryLabels['C'] || 'Category C'} - Standard Companies</option>
            <option value="D">{categoryLabels['D'] || 'Category D'} - Lower Tier Companies</option>
            <option value="GOVT">{categoryLabels['GOVT'] || 'Government Employee'}</option>
            <option value="UNLISTED">{categoryLabels['UNLISTED'] || 'Unlisted Company'}</option>
          </select>
          <small className="form-hint">
            Select your company category. Premium categories (SUPER-A, A+, A) get better rates.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="creditScore">Credit Score</label>
          <input
            type="number"
            id="creditScore"
            name="creditScore"
            value={formData.creditScore}
            onChange={handleChange}
            min="300"
            max="900"
          />
        </div>

        {/* Balance Transfer Specific Fields */}
        {calculationType === 'bt' && (
          <>
            <div className="bt-section">
              <h3>📋 Existing Personal Loans (to transfer)</h3>
              <p className="section-hint">Add loans you want to consolidate into the new BT loan</p>

              {existingLoans.map((loan, index) => (
                <div key={index} className="loan-card">
                  <div className="loan-card-header">
                    <span>Loan #{index + 1}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeExistingLoan(index)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <div className="loan-inputs">
                    <input
                      type="text"
                      placeholder="Loan Name (e.g., HDFC Personal)"
                      value={loan.loanName}
                      onChange={(e) => updateExistingLoan(index, 'loanName', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Monthly EMI (₹)"
                      value={loan.emi}
                      onChange={(e) => updateExistingLoan(index, 'emi', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Outstanding Balance (₹)"
                      value={loan.pos}
                      onChange={(e) => updateExistingLoan(index, 'pos', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}

              <button type="button" className="add-btn" onClick={addExistingLoan}>
                + Add Existing Loan
              </button>
            </div>

            <div className="bt-section">
              <h3>💳 Credit Cards (optional - for BT)</h3>
              <p className="section-hint">Add credit cards with outstanding balance to consolidate</p>

              {creditCards.map((card, index) => (
                <div key={index} className="loan-card">
                  <div className="loan-card-header">
                    <span>Card #{index + 1}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeCreditCard(index)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <div className="loan-inputs">
                    <input
                      type="text"
                      placeholder="Card Name (e.g., HDFC Regalia)"
                      value={card.cardName}
                      onChange={(e) => updateCreditCard(index, 'cardName', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Outstanding Amount (₹)"
                      value={card.outstandingAmount}
                      onChange={(e) => updateCreditCard(index, 'outstandingAmount', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}

              <button type="button" className="add-btn" onClick={addCreditCard}>
                + Add Credit Card
              </button>
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {calculationType === 'bt' ? '🔄 Calculate BT Offers' : '💰 Calculate Loan Eligibility'}
          </button>
          <button type="button" className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserInputForm