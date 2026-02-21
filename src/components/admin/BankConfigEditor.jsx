import { useState } from 'react';
import './BankConfigEditor.css';
import InterestRateEditor from './InterestRateEditor';
import CategoriesEditor from './CategoriesEditor';
import LoanCappingEditor from './LoanCappingEditor';
import { AgeRulesEditor, TenureRulesEditor, FoirEditor, MultiplierEditor, BTEditor, CreditScoreEditor, EmploymentEditor, FeesEditor, DocumentsEditor, SpecialRulesEditor } from './AllEditors';

const BankConfigEditor = ({ selectedBank, section }) => {
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
        return <CategoriesSection bank={selectedBank} />;
      case 'interest':
        return <InterestSection bank={selectedBank} />;
      case 'loanCapping':
        return <LoanCappingSection bank={selectedBank} />;
      case 'ageRules':
        return <AgeRulesSection bank={selectedBank} />;
      case 'tenureRules':
        return <TenureRulesSection bank={selectedBank} />;
      case 'foir':
        return <FoirSection bank={selectedBank} />;
      case 'multiplier':
        return <MultiplierSection bank={selectedBank} />;
      case 'bt':
        return <BTSection bank={selectedBank} />;
      case 'creditScore':
        return <CreditScoreSection bank={selectedBank} />;
      case 'employment':
        return <EmploymentSection bank={selectedBank} />;
      case 'documents':
        return <DocumentsSection bank={selectedBank} />;
      case 'special':
        return <SpecialRulesSection bank={selectedBank} />;
      case 'fees':
        return <FeesSection bank={selectedBank} />;
      default:
        return <AllConfigSection bank={selectedBank} />;
    }
  };

  return (
    <div className="bank-config-editor">
      {renderSection()}
    </div>
  );
};

import { getAllBankConfig } from '../../services/bankConfigService';

// Updated AllConfigSection to show actual values
const AllConfigSection = ({ bank }) => {
  const config = getAllBankConfig(bank.name);

  const getDisplayValue = (section, key, subKey = null) => {
    if (!config[section]) return 'Not Configured';
    let val = config[section][key];
    if (subKey && val) val = val[subKey];
    return val !== undefined ? val : 'N/A';
  };

  return (
    <div className="config-section">
      <div className="section-header-summary">
        <h2>Unified Policy Framework: {bank.name}</h2>
        <p>Comprehensive governance overview of active institutional parameters</p>
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

const CategoriesSection = ({ bank }) => <CategoriesEditor bank={bank} onSave={(config) => console.log('Categories saved:', config)} />;

const InterestSection = ({ bank }) => <InterestRateEditor bank={bank} onSave={(config) => console.log('Saved:', config)} />;

const LoanCappingSection = ({ bank }) => <LoanCappingEditor bank={bank} onSave={(config) => console.log('Capping saved:', config)} />;

const AgeRulesSection = ({ bank }) => <AgeRulesEditor bank={bank} onSave={(config) => console.log('Age rules saved:', config)} />;

const TenureRulesSection = ({ bank }) => <TenureRulesEditor bank={bank} onSave={(config) => console.log('Tenure saved:', config)} />;

const FoirSection = ({ bank }) => <FoirEditor bank={bank} onSave={(config) => console.log('FOIR saved:', config)} />;

const MultiplierSection = ({ bank }) => <MultiplierEditor bank={bank} onSave={(config) => console.log('Multiplier saved:', config)} />;

const BTSection = ({ bank }) => <BTEditor bank={bank} onSave={(config) => console.log('BT saved:', config)} />;

const CreditScoreSection = ({ bank }) => <CreditScoreEditor bank={bank} onSave={(config) => console.log('Credit score saved:', config)} />;

const EmploymentSection = ({ bank }) => <EmploymentEditor bank={bank} onSave={(config) => console.log('Employment saved:', config)} />;

const DocumentsSection = ({ bank }) => <DocumentsEditor bank={bank} onSave={(config) => console.log('Documents saved:', config)} />;

const SpecialRulesSection = ({ bank }) => <SpecialRulesEditor bank={bank} onSave={(config) => console.log('Special rules saved:', config)} />;

const FeesSection = ({ bank }) => <FeesEditor bank={bank} onSave={(config) => console.log('Fees saved:', config)} />;

export default BankConfigEditor;
