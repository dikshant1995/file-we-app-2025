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
    switch(section) {
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

// Placeholder sections - will be fully implemented
const AllConfigSection = ({ bank }) => (
  <div className="config-section">
    <h2>⚙️ Complete Configuration for {bank.name}</h2>
    <p>View and edit all configuration settings for this bank</p>
    <div className="config-overview">
      <div className="overview-card">📊 Categories (A/B/C/D)</div>
      <div className="overview-card">📈 Interest Rates</div>
      <div className="overview-card">💰 Loan Capping</div>
      <div className="overview-card">🎂 Age Rules</div>
      <div className="overview-card">⏱️ Tenure Rules</div>
      <div className="overview-card">📊 FOIR Settings</div>
      <div className="overview-card">🔢 Multipliers</div>
      <div className="overview-card">🔄 Balance Transfer</div>
      <div className="overview-card">⭐ Credit Score</div>
      <div className="overview-card">💼 Employment Rules</div>
      <div className="overview-card">📄 Documents</div>
      <div className="overview-card">🌟 Special Rules</div>
    </div>
  </div>
);

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
