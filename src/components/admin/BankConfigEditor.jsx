import { useState } from 'react';
import { getAllBankConfig, getBankConfig } from '../../services/bankConfigService';
import './BankConfigEditor.css';
import InterestRateEditor from './InterestRateEditor';
import CategoriesEditor from './CategoriesEditor';
import LoanCappingEditor from './LoanCappingEditor';
import { AgeRulesEditor, TenureRulesEditor, FoirEditor, MultiplierEditor, BTEditor, CreditScoreEditor, EmploymentEditor, FeesEditor, DocumentsEditor, SpecialRulesEditor } from './AllEditors';

const BankConfigEditor = ({ selectedBank, section, activeLocation }) => {
  if (!selectedBank) {
    return (
      <div className="no-bank-selected">
        <div className="empty-state">
          <div className="empty-icon">🏦</div>
          <h3>No Bank Selected</h3>
          <p>Please select a bank from the Banks Overview to configure its settings</p>
          <button className="btn-select-bank">Go to Banks Overview</button>
        </div>
      </div>
    );
  }

  // Bank configuration will be loaded here
  const renderSection = () => {
    switch (section) {
      case 'categories':
        return <CategoriesSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'interest':
        return <InterestSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'loanCapping':
        return <LoanCappingSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'ageRules':
        return <AgeRulesSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'tenureRules':
        return <TenureRulesSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'foir':
        return <FoirSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'multiplier':
        return <MultiplierSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'bt':
        return <BTSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'creditScore':
        return <CreditScoreSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'employment':
        return <EmploymentSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'documents':
        return <DocumentsSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'special':
        return <SpecialRulesSection bank={selectedBank} activeLocation={activeLocation} />;
      case 'fees':
        return <FeesSection bank={selectedBank} activeLocation={activeLocation} />;
      default:
        return <AllConfigSection bank={selectedBank} activeLocation={activeLocation} />;
    }
  };

  return (
    <div className="bank-config-editor">
      {renderSection()}
    </div>
  );
};



// Updated AllConfigSection to show actual values based on location
const AllConfigSection = ({ bank, activeLocation }) => {
  const context = {
    state: activeLocation ? activeLocation.state : null,
    city: activeLocation ? activeLocation.city : null
  };

  const getDisplayValue = (section, key, subKey = null) => {
    const sectionConfig = getBankConfig(bank.name, section, context);
    if (!sectionConfig) return 'Not Configured';
    let val = sectionConfig[key];
    if (subKey && val) val = val[subKey];
    return val !== undefined ? val : 'N/A';
  };

  const config = {
    multiplierRules: getBankConfig(bank.name, 'multiplierRules', context),
    foirSettings: getBankConfig(bank.name, 'foirSettings', context),
    btConfiguration: getBankConfig(bank.name, 'btConfiguration', context),
  };

  return (
    <div className="config-section">
      <div className="section-header-summary">
        <h2>Unified Policy Framework: {bank.name}</h2>
        <p>Viewing parameters for: <strong>{activeLocation ? (activeLocation.city || activeLocation.state) : 'All India (National)'}</strong></p>
      </div>

      <div className="config-overview">
        <div className="overview-card">
          <div className="card-title">Demographic Rules</div>
          <div className="card-detail">Age: {getDisplayValue('ageRules', 'minAge')} - {getDisplayValue('ageRules', 'maxAge')}</div>
          <div className="card-detail">Retirement: {getDisplayValue('ageRules', 'retirementAge', 'salaried')} (S)</div>
        </div>

        <div className="overview-card">
          <div className="card-title">Capital Capping</div>
          <div className="card-detail">Absolute Max: ₹{(getDisplayValue('loanCapping', 'absoluteMaxLoan') / 100000).toFixed(0)}L</div>
          <div className="card-detail">Min Loan: ₹{(getDisplayValue('loanCapping', 'minLoanAmount') / 1000).toFixed(0)}K</div>
        </div>

        <div className="overview-card">
          <div className="card-title">Employment Parameters</div>
          <div className="card-detail">Min Sal: ₹{(getDisplayValue('employmentRules', 'salariedMinSalary') / 1000).toFixed(0)}K</div>
          <div className="card-detail">ITR: {getDisplayValue('employmentRules', 'itrYearsRequired')} Years</div>
        </div>

        <div className="overview-card">
          <div className="card-title">Rate Structures</div>
          <div className="card-detail">Default: {getDisplayValue('interestRates', 'defaultRate')}%</div>
          <div className="card-detail">Type: Slab-Based</div>
        </div>

        <div className="overview-card">
          <div className="card-title">Multiplier Logic</div>
          <div className="card-detail">Cat A: {config.multiplierRules?.categoryBasedMultiplier?.A || 'N/A'}x</div>
          <div className="card-detail">Cat B: {config.multiplierRules?.categoryBasedMultiplier?.B || 'N/A'}x</div>
        </div>

        <div className="overview-card">
          <div className="card-title">FOIR Parameters</div>
          <div className="card-detail">Cat A: {config.foirSettings?.categoryBasedFOIR?.A || 'N/A'}%</div>
          <div className="card-detail">CC Obl: {getDisplayValue('foirSettings', 'creditCardObligationPercentage')}%</div>
        </div>

        <div className="overview-card">
          <div className="card-title">Liability Consolidation</div>
          <div className="card-detail">Status: {config.btConfiguration?.enabled ? 'Active' : 'Inactive'}</div>
          <div className="card-detail">Max Loans: {getDisplayValue('btConfiguration', 'maxLoansForBT')}</div>
        </div>

        <div className="overview-card">
          <div className="card-title">Risk Assessment</div>
          <div className="card-detail">Min Score: {getDisplayValue('creditScoreRules', 'minCreditScore')}</div>
          <div className="card-detail">Reject: {'<'}{getDisplayValue('creditScoreRules', 'autoRejectionThreshold')}</div>
        </div>

        <div className="overview-card">
          <div className="card-title">Fee Schedules</div>
          <div className="card-detail">Proc: {getDisplayValue('feesAndCharges', 'processingFeePercentage')}%</div>
          <div className="card-detail">Prepay: {getDisplayValue('feesAndCharges', 'prepaymentChargesPercentage')}%</div>
        </div>
      </div>
    </div>
  );
};

const CategoriesSection = ({ bank, activeLocation }) => <CategoriesEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Categories saved:', config)} />;

const InterestSection = ({ bank, activeLocation }) => <InterestRateEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Saved:', config)} />;

const LoanCappingSection = ({ bank, activeLocation }) => <LoanCappingEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Capping saved:', config)} />;

const AgeRulesSection = ({ bank, activeLocation }) => <AgeRulesEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Age rules saved:', config)} />;

const TenureRulesSection = ({ bank, activeLocation }) => <TenureRulesEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Tenure saved:', config)} />;

const FoirSection = ({ bank, activeLocation }) => <FoirEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('FOIR saved:', config)} />;

const MultiplierSection = ({ bank, activeLocation }) => <MultiplierEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Multiplier saved:', config)} />;

const BTSection = ({ bank, activeLocation }) => <BTEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('BT saved:', config)} />;

const CreditScoreSection = ({ bank, activeLocation }) => <CreditScoreEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Credit score saved:', config)} />;

const EmploymentSection = ({ bank, activeLocation }) => <EmploymentEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Employment saved:', config)} />;

const DocumentsSection = ({ bank, activeLocation }) => <DocumentsEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Documents saved:', config)} />;

const SpecialRulesSection = ({ bank, activeLocation }) => <SpecialRulesEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Special rules saved:', config)} />;

const FeesSection = ({ bank, activeLocation }) => <FeesEditor bank={bank} activeLocation={activeLocation} onSave={(config) => console.log('Fees saved:', config)} />;

export default BankConfigEditor;
