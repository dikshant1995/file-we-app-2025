import { useState } from 'react';
import './BankConfigEditor.css';
import InterestRateEditor from './InterestRateEditor.jsx';
import CategoriesEditor from './CategoriesEditor.jsx';
import LoanCappingEditor from './LoanCappingEditor.jsx';
import CompanyListEditor from './CompanyListEditor.jsx';
import { AgeRulesEditor, TenureRulesEditor, FoirEditor, MultiplierEditor, BTEditor, CreditScoreEditor, EmploymentEditor, FeesEditor, DocumentsEditor, SpecialRulesEditor, GovtPolicyEditor } from './AllEditors.jsx';

const BankConfigEditor = ({ selectedBank, section, activeLocation }) => {
  if (!selectedBank) {
    return (
      <div className="no-bank-selected">
        <div className="empty-state">
          <div className="empty-icon">🏦</div>
          <h3>No Bank Selected</h3>
          <p>Please select a bank from the Institutional Overview to configure its settings</p>
          <button className="btn-select-bank">Go to Institutional Overview</button>
        </div>
      </div>
    );
  }

  const locationString = activeLocation ? `${activeLocation.city}, ${activeLocation.state}` : null;

  // Bank configuration will be loaded here
  const renderSection = () => {
    const props = { bank: selectedBank, location: locationString };

    switch (section) {
      case 'categories':
        return <CategoriesSection {...props} />;
      case 'interest':
        return <InterestSection {...props} />;
      case 'loanCapping':
        return <LoanCappingSection {...props} />;
      case 'ageRules':
        return <AgeRulesSection {...props} />;
      case 'tenureRules':
        return <TenureRulesSection {...props} />;
      case 'foir':
        return <FoirSection {...props} />;
      case 'multiplier':
        return <MultiplierSection {...props} />;
      case 'bt':
        return <BTSection {...props} />;
      case 'creditScore':
        return <CreditScoreSection {...props} />;
      case 'employment':
        return <EmploymentSection {...props} />;
      case 'govt-policy':
        return <GovtPolicySection {...props} />;
      case 'documents':
        return <DocumentsSection {...props} />;
      case 'special':
        return <SpecialRulesSection {...props} />;
      case 'fees':
        return <FeesSection {...props} />;
      case 'company-db':
        return <CompanyListSection {...props} />;
      default:
        return <AllConfigSection {...props} />;
    }
  };

  return (
    <div className="bank-config-editor">
      <div className="location-context-bar glass-panel mb-4">
        📍 Operating Context: <strong>{locationString || "Global Default"}</strong>
      </div>
      {renderSection()}
    </div>
  );
};

// Placeholder sections - will be fully implemented
const AllConfigSection = ({ bank }) => (
  <div className="config-section">
    <h2>Unified Policy Framework: {bank.name}</h2>
    <p>View and edit all configuration settings for this bank</p>
    <div className="config-overview">
      <div className="overview-card">Categorization Models</div>
      <div className="overview-card">Rate Structures</div>
      <div className="overview-card">Capital Capping</div>
      <div className="overview-card">Demographic Rules</div>
      <div className="overview-card">Tenure Optimization</div>
      <div className="overview-card">FOIR Parameters</div>
      <div className="overview-card">Multiplier Logic</div>
      <div className="overview-card">Liability Consolidation</div>
      <div className="overview-card">Risk Assessment</div>
      <div className="overview-card">Employment Credentialing</div>
      <div className="overview-card">Documentation Protocol</div>
      <div className="overview-card">Exceptional Policies</div>
    </div>
  </div>
);

const CategoriesSection = ({ bank, location }) => <CategoriesEditor bank={bank} location={location} onSave={(config) => console.log('Categories saved:', config)} />;

const InterestSection = ({ bank, location }) => <InterestRateEditor bank={bank} location={location} onSave={(config) => console.log('Saved:', config)} />;

const LoanCappingSection = ({ bank, location }) => <LoanCappingEditor bank={bank} location={location} onSave={(config) => console.log('Capping saved:', config)} />;

const AgeRulesSection = ({ bank, location }) => <AgeRulesEditor bank={bank} location={location} onSave={(config) => console.log('Age rules saved:', config)} />;

const TenureRulesSection = ({ bank, location }) => <TenureRulesEditor bank={bank} location={location} onSave={(config) => console.log('Tenure saved:', config)} />;

const FoirSection = ({ bank, location }) => <FoirEditor bank={bank} location={location} onSave={(config) => console.log('FOIR saved:', config)} />;

const MultiplierSection = ({ bank, location }) => <MultiplierEditor bank={bank} location={location} onSave={(config) => console.log('Multiplier saved:', config)} />;

const BTSection = ({ bank, location }) => <BTEditor bank={bank} location={location} onSave={(config) => console.log('BT saved:', config)} />;

const CreditScoreSection = ({ bank, location }) => <CreditScoreEditor bank={bank} location={location} onSave={(config) => console.log('Credit score saved:', config)} />;

const EmploymentSection = ({ bank, location }) => <EmploymentEditor bank={bank} location={location} onSave={(config) => console.log('Employment saved:', config)} />;

const GovtPolicySection = ({ bank, location }) => <GovtPolicyEditor bank={bank} location={location} onSave={(config) => console.log('Govt Policy saved:', config)} />;

const DocumentsSection = ({ bank, location }) => <DocumentsEditor bank={bank} location={location} onSave={(config) => console.log('Documents saved:', config)} />;

const SpecialRulesSection = ({ bank, location }) => <SpecialRulesEditor bank={bank} location={location} onSave={(config) => console.log('Special rules saved:', config)} />;

const FeesSection = ({ bank, location }) => <FeesEditor bank={bank} location={location} onSave={(config) => console.log('Fees saved:', config)} />;

const CompanyListSection = ({ bank }) => <CompanyListEditor bank={bank} />;

export default BankConfigEditor;
