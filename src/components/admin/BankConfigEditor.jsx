import { AgeRulesEditor, TenureRulesEditor, FoirEditor, MultiplierEditor, BTEditor, CreditScoreEditor, EmploymentEditor, FeesEditor, DocumentsEditor, SpecialRulesEditor } from './AllEditors';
import { getEffectiveConfig } from '../../utils/policyUtils';

// Import all bank configs for registry
import { kotakConfig } from '../../banks/kotak/config';
import { hdfcConfig } from '../../banks/hdfc/config';
import { iciciConfig } from '../../banks/icici/config';
import { axisFinConfig } from '../../banks/axis-fin/config';
import { indusindConfig } from '../../banks/indusind/config';
import { idfcConfig } from '../../banks/idfc/config';
import { tataConfig } from '../../banks/tata/config';
import { poonawalaConfig } from '../../banks/poonawala/config';

const bankConfigs = {
  'Kotak Mahindra Bank': kotakConfig,
  'HDFC Bank': hdfcConfig,
  'ICICI Bank': iciciConfig,
  'Axis Bank': axisFinConfig,
  'IndusInd Bank': indusindConfig,
  'IDFC First Bank': idfcConfig,
  'Tata Capital': tataConfig,
  'Poonawala Finance': poonawalaConfig
};

const BankConfigEditor = ({ selectedBank, section, onNavigate }) => {
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

  // Load effective config for preview
  const baseConfig = bankConfigs[selectedBank.name] || {};
  const effectiveConfig = getEffectiveConfig(selectedBank.name, baseConfig);

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
        return <AllConfigSection bank={selectedBank} config={effectiveConfig} onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="bank-config-editor">
      {renderSection()}
    </div>
  );
};

// Placeholder sections - will be fully implemented
const AllConfigSection = ({ bank, config, onNavigate }) => {
  // Extract summary metrics
  const minSalary = config.minSalary?.['A'] || config.employmentRules?.salariedMinSalary || 25000;
  const ageRange = `${config.minAge || config.ageRules?.minAge || 21}-${config.maxAge || config.ageRules?.maxAge || 60}`;
  const maxLoan = config.maxLoanAmount || config.loanCapping?.absoluteMaxLoan || 5000000;

  return (
    <div className="config-section">
      <h2>Unified Policy Framework: {bank.name}</h2>
      <p>System-wide governance and granular policy control</p>

      <div className="config-overview">
        <div className="overview-card" onClick={() => onNavigate('categories')}>
          <div className="card-title">Categorization Models</div>
          <div className="card-value">Min Salary: ₹{minSalary.toLocaleString()}</div>
          <div className="card-status">Standard Tier Loaded</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('interest')}>
          <div className="card-title">Rate Structures</div>
          <div className="card-value">Base Rate: {config.interestRate || config.interestRates?.defaultRate || 11}%</div>
          <div className="card-status">Dynamic Pricing Active</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('loanCapping')}>
          <div className="card-title">Capital Capping</div>
          <div className="card-value">Max: ₹{(maxLoan / 100000).toFixed(0)} Lakhs</div>
          <div className="card-status">Risk Limits Enforced</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('ageRules')}>
          <div className="card-title">Demographic Rules</div>
          <div className="card-value">Age: {ageRange} Years</div>
          <div className="card-status">Compliance Verified</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('tenureRules')}>
          <div className="card-title">Tenure Optimization</div>
          <div className="card-value">Max: {config.tenureRules?.maxTenureMonths || 72} Months</div>
          <div className="card-status">Term Extension Enabled</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('foir')}>
          <div className="card-title">FOIR Parameters</div>
          <div className="card-value">Threshold: {config.foirSettings?.categoryBasedFOIR?.['A'] || 65}%</div>
          <div className="card-status">Income-Debt Balancing</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('multiplier')}>
          <div className="card-title">Multiplier Logic</div>
          <div className="card-value">Model: Standard × {config.multiplierRules?.categoryBasedMultiplier?.['A'] || 27}</div>
          <div className="card-status">Salary Scaling Engine</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('bt')}>
          <div className="card-title">Liability Consolidation</div>
          <div className="card-value">Consolidation: Enabled</div>
          <div className="card-status">Transfer Protocol Ready</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('creditScore')}>
          <div className="card-title">Risk Assessment</div>
          <div className="card-value">Min Score: {config.creditScoreRules?.minCreditScore || 650}</div>
          <div className="card-status">Bureau Integration Active</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('employment')}>
          <div className="card-title">Employment Credentialing</div>
          <div className="card-value">ITR Req: {config.employmentRules?.itrYearsRequired || 2} Years</div>
          <div className="card-status">KYC Workflow Validated</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('documents')}>
          <div className="card-title">Documentation Protocol</div>
          <div className="card-value">E-KYC Enabled</div>
          <div className="card-status">Legal Review Pending</div>
        </div>

        <div className="overview-card" onClick={() => onNavigate('special')}>
          <div className="card-title">Exceptional Policies</div>
          <div className="card-value">None Overridden</div>
          <div className="card-status">Priority Segments Ready</div>
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
