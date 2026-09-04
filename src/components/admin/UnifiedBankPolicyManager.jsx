import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Building2, Settings, AlertTriangle, Trash2, CheckCircle2, 
  ArrowLeft, Search, Plus, Save, RefreshCw, Layers, TrendingUp, 
  Zap, Shield, User, DollarSign, Calendar, MapPin, SlidersHorizontal, 
  PowerOff, Play, Check, X, Download, Upload, FileSpreadsheet,
  ChevronLeft, ChevronRight, CheckCircle, HelpCircle, FileText, ArrowRight
} from 'lucide-react';
import { getBankConfig, saveBankConfig } from '../../services/bankConfigService.js';
import { 
  loadBankDatabase, 
  setBankDatabaseInMemory, 
  saveBankDatabaseToCloud, 
  syncToUniversalDatabase, 
  getCompanySuggestions, 
  loadUniversalCompanies 
} from '../../services/companyDatabaseService.js';
import './UnifiedBankPolicyManager.css';

// 12 Standard Partner Banks
const INITIAL_12_BANKS = [
  { id: 'kotak', name: 'Kotak Mahindra Bank', color: '#ED1C24', minRate: 10.5, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'tata', name: 'Tata Capital', color: '#1F4E78', minRate: 10.99, maxLoan: 4000000, maxTenure: 72, enabled: true },
  { id: 'poonawala', name: 'Poonawala Finance', color: '#005596', minRate: 11.25, maxLoan: 3500000, maxTenure: 60, enabled: true },
  { id: 'idfc', name: 'IDFC First Bank', color: '#8B1538', minRate: 10.49, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'hdfc', name: 'HDFC Bank', color: '#004C8F', minRate: 10.5, maxLoan: 7500000, maxTenure: 84, enabled: true },
  { id: 'icici', name: 'ICICI Bank', color: '#ED1C24', minRate: 10.75, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'bandhan', name: 'Bandhan Bank', color: '#DC0028', minRate: 11.5, maxLoan: 2500000, maxTenure: 60, enabled: true },
  { id: 'cholamandalam', name: 'Cholamandalam Finance', color: '#F37021', minRate: 12.0, maxLoan: 3000000, maxTenure: 60, enabled: true },
  { id: 'axis-fin', name: 'Axis Finance', color: '#800000', minRate: 10.75, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'indusind', name: 'IndusInd Bank', color: '#005596', minRate: 10.49, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'shri-ram', name: 'Shri Ram Finance', color: '#1F4E78', minRate: 12.5, maxLoan: 2000000, maxTenure: 48, enabled: true },
  { id: 'piramal', name: 'Piramal Finance', color: '#1F4E78', minRate: 11.75, maxLoan: 3000000, maxTenure: 60, enabled: true }
];

const getBankDbKey = (bankId) => {
  const map = {
    'axis-fin': 'axis_fin',
    'cholamandalam': 'chola',
    'shri-ram': 'shri_ram'
  };
  return map[bankId] || bankId;
};

const formatCategoryDisplay = (cat) => {
  if (!cat) return 'Category B (Default)';
  const upper = String(cat).toUpperCase().trim();
  if (upper === 'SCATA' || upper === 'SUPER A' || upper === 'A+') return 'Super A';
  if (upper === 'CATGA' || upper === 'A' || upper === 'CAT A' || upper === 'CATEGORY A') return 'Category A';
  if (upper === 'CATGB' || upper === 'B' || upper === 'CAT B' || upper === 'CATEGORY B') return 'Category B';
  if (upper === 'CATGC' || upper === 'C' || upper === 'CAT C' || upper === 'CATEGORY C') return 'Category C';
  if (upper === 'CATGD' || upper === 'D' || upper === 'CAT D' || upper === 'CATEGORY D') return 'Category D';
  if (upper === 'GOVT' || upper === 'PSU') return 'Govt / PSU';
  if (upper === 'UNLISTED') return 'Unlisted';
  return cat;
};

const getCategoryBadgeClass = (cat) => {
  const upper = String(cat || '').toUpperCase().trim();
  if (upper.includes('SUPER') || upper === 'SCATA' || upper === 'A+' || upper.includes('PLATINUM') || upper.includes('DIAMOND') || upper.includes('TIER 1')) return 'cat-badge-super-a';
  if (upper === 'CATGA' || upper === 'A' || upper.includes('CATEGORY A') || upper.includes('GOLD') || upper.includes('TIER 2')) return 'cat-badge-a';
  if (upper === 'CATGB' || upper === 'B' || upper.includes('CATEGORY B') || upper.includes('SILVER') || upper.includes('TIER 3')) return 'cat-badge-b';
  if (upper === 'CATGC' || upper === 'C' || upper.includes('CATEGORY C') || upper.includes('BRONZE') || upper.includes('TIER 4')) return 'cat-badge-c';
  if (upper === 'CATGD' || upper === 'D' || upper.includes('CATEGORY D')) return 'cat-badge-d';
  if (upper.includes('GOVT') || upper.includes('PSU')) return 'cat-badge-govt';
  return 'cat-badge-unlisted';
};

// State & City Data
const STATE_CITY_MAPPING = {
  'All India': ['All Cities (National Default)'],
  'Delhi NCR': ['New Delhi', 'Central Delhi', 'South Delhi', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala']
};

// Initial Corporate Directory for Company Categorization
const INITIAL_COMPANY_DATABASE = [
  { id: 'c1', name: 'Tata Consultancy Services', category: 'Super A', type: 'MNC / IT Leader', minSalary: 25000 },
  { id: 'c2', name: 'Infosys Limited', category: 'Super A', type: 'MNC / IT Leader', minSalary: 25000 },
  { id: 'c3', name: 'Reliance Industries Limited', category: 'Super A', type: 'Conglomerate', minSalary: 25000 },
  { id: 'c4', name: 'HDFC Bank Limited', category: 'Super A', type: 'Banking & Financial', minSalary: 25000 },
  { id: 'c5', name: 'Wipro Limited', category: 'A', type: 'Listed IT', minSalary: 30000 },
  { id: 'c6', name: 'Larsen & Toubro Limited', category: 'Super A', type: 'Infrastructure', minSalary: 25000 },
  { id: 'c7', name: 'Google India Pvt Ltd', category: 'Super A', type: 'Global Tech MNC', minSalary: 35000 },
  { id: 'c8', name: 'Microsoft India', category: 'Super A', type: 'Global Tech MNC', minSalary: 35000 },
  { id: 'c9', name: 'Amazon Development Centre', category: 'A', type: 'Global E-Commerce', minSalary: 30000 },
  { id: 'c10', name: 'ICICI Bank Limited', category: 'Super A', type: 'Banking & Financial', minSalary: 25000 },
  { id: 'c11', name: 'Central Government Employee', category: 'Govt', type: 'Public Sector / Defense', minSalary: 20000 },
  { id: 'c12', name: 'State Government Employee', category: 'Govt', type: 'State Public Sector', minSalary: 20000 },
  { id: 'c13', name: 'Tech Mahindra Limited', category: 'A', type: 'Listed Tech', minSalary: 30000 },
  { id: 'c14', name: 'HCL Technologies', category: 'A', type: 'Listed IT', minSalary: 30000 },
  { id: 'c15', name: 'Mahindra & Mahindra', category: 'A', type: 'Automobile Conglomerate', minSalary: 30000 },
  { id: 'c16', name: 'Bajaj Finserv Limited', category: 'A', type: 'Non-Banking Financial', minSalary: 30000 },
  { id: 'c17', name: 'Swiggy (Bundl Technologies)', category: 'B', type: 'Unlisted Growth Unicorn', minSalary: 40000 },
  { id: 'c18', name: 'Zomato Limited', category: 'B', type: 'Listed Consumer Tech', minSalary: 35000 },
  { id: 'c19', name: 'Local Private Enterprise', category: 'C', type: 'Unlisted Private Limited', minSalary: 45000 },
  { id: 'c20', name: 'Proprietorship / Small Firm', category: 'C', type: 'SME / Micro Business', minSalary: 50000 }
];

const UnifiedBankPolicyManager = () => {
  // Location Selection State
  const [selectedState, setSelectedState] = useState('All India');
  const [selectedCity, setSelectedCity] = useState('All Cities (National Default)');

  // 12 Banks State (stored in localStorage for persistence)
  const [banks, setBanks] = useState(() => {
    try {
      const stored = localStorage.getItem('laxmi_admin_12_banks');
      return stored ? JSON.parse(stored) : INITIAL_12_BANKS;
    } catch {
      return INITIAL_12_BANKS;
    }
  });

  // Config Modal / View State
  const [activeConfigBank, setActiveConfigBank] = useState(null);
  const [activeConfigTab, setActiveConfigTab] = useState('rates'); // rates, capping, tenure, foir, demographics, companies
  const [saveAlert, setSaveAlert] = useState('');

  // Editable Policy State for Active Bank
  const [policyData, setPolicyData] = useState({
    interestRates: [
      { category: 'Super A', minRoi: 10.25, maxRoi: 12.00, defaultRoi: 10.50, minSalary: 100000 },
      { category: 'A', minRoi: 10.75, maxRoi: 13.50, defaultRoi: 11.00, minSalary: 50000 },
      { category: 'B', minRoi: 11.50, maxRoi: 15.00, defaultRoi: 12.00, minSalary: 35000 },
      { category: 'C', minRoi: 12.50, maxRoi: 18.00, defaultRoi: 13.50, minSalary: 25000 },
      { category: 'Govt', minRoi: 10.50, maxRoi: 12.50, defaultRoi: 10.75, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 7500000, bachelorCap: 3000000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 5000000, bachelorCap: 2500000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 3500000, bachelorCap: 1500000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 2000000, bachelorCap: 1000000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 5000000, bachelorCap: 3000000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years' },
      { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 70, multiplier: 28, ccObligation: 5 },
      { category: 'A', maxFoir: 65, multiplier: 24, ccObligation: 5 },
      { category: 'B', maxFoir: 60, multiplier: 20, ccObligation: 5 },
      { category: 'C', maxFoir: 55, multiplier: 18, ccObligation: 5 },
      { category: 'Govt', maxFoir: 65, multiplier: 25, ccObligation: 3 }
    ],
    demographics: {
      minAge: 21,
      maxAge: 60,
      retirementSalaried: 60,
      retirementGovt: 62,
      minSalary: 25000,
      minExperienceTotal: 12,
      minExperienceCurrent: 6,
      minCibilScore: 650
    },
    companies: INITIAL_COMPANY_DATABASE
  });

  // Bank Specific Company Database State
  const [bankCompanies, setBankCompanies] = useState([]);
  const [bankFileMetadata, setBankFileMetadata] = useState({
    fileName: '',
    totalCount: 0,
    lastUpdated: ''
  });
  const [isLoadingBankCompanies, setIsLoadingBankCompanies] = useState(false);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');

  // Replace Excel Modal & Drag & Drop Staging State
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isOuterDragActive, setIsOuterDragActive] = useState(false);
  const [isParsingStagedFile, setIsParsingStagedFile] = useState(false);
  const [isSavingReplacement, setIsSavingReplacement] = useState(false);
  const [stagedFile, setStagedFile] = useState(null);
  const modalFileInputRef = useRef(null);

  // Manual Company Category Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [selectedLookupCompany, setSelectedLookupCompany] = useState('');
  const [lookupSuggestions, setLookupSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Table Controls & Pagination
  const [tableSearch, setTableSearch] = useState('');
  const [tableCatFilter, setTableCatFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fallback Add Single Company Form
  const [newCompany, setNewCompany] = useState({ name: '', category: 'A', type: 'Private Enterprise', minSalary: 30000 });

  // Update cities whenever state changes
  useEffect(() => {
    const availableCities = STATE_CITY_MAPPING[selectedState] || ['All Cities'];
    setSelectedCity(availableCities[0]);
  }, [selectedState]);

  // Sync banks to localStorage
  const persistBanks = (updatedBanks) => {
    setBanks(updatedBanks);
    try {
      localStorage.setItem('laxmi_admin_12_banks', JSON.stringify(updatedBanks));
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Suspend / Activate Bank Policy
  const handleToggleSuspendBank = (bank) => {
    const newStatus = !bank.enabled;
    const action = newStatus ? 'Activate' : 'Suspend';
    if (window.confirm(`Are you sure you want to ${action} ${bank.name}?\n\n${newStatus ? 'Customers will now see pre-approved offers from this bank.' : 'This will temporarily stop this bank from being shown in customer loan calculations.'}`)) {
      const updated = banks.map(b => b.id === bank.id ? { ...b, enabled: newStatus } : b);
      persistBanks(updated);
    }
  };

  // 2. Delete Bank Policy
  const handleDeleteBank = (bank) => {
    if (window.confirm(`⚠️ PERMANENT DELETE WARNING\n\nAre you sure you want to delete policy configuration for ${bank.name} in ${selectedCity}, ${selectedState}?\n\nThis will reset or remove custom parameters for this institution.`)) {
      const updated = banks.map(b => b.id === bank.id ? { ...b, enabled: false, minRate: 12.0, maxLoan: 2500000 } : b);
      persistBanks(updated);
      alert(`Policy record for ${bank.name} has been reset / purged successfully.`);
    }
  };

  // 3. Open Config Policy
  const handleOpenConfig = (bank) => {
    setActiveConfigBank(bank);
    setActiveConfigTab('rates');
    setSaveAlert('');

    // Load any existing custom config from localStorage or cloud-synced service
    const locationKey = `${selectedState}-${selectedCity}`;
    const stored = localStorage.getItem(`policy_config_${bank.id}_${locationKey}`);
    if (stored) {
      try {
        setPolicyData(JSON.parse(stored));
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Cloud Firestore Fallback: check bankConfigService (synced from Firestore)
    const cloudPolicy = getBankConfig(bank.name, 'unifiedPolicy', locationKey) || getBankConfig(bank.name, 'unifiedPolicy');
    if (cloudPolicy && cloudPolicy.interestRates) {
      setPolicyData(cloudPolicy);
    }
  };

  // Save All Policy Changes
  const handleSavePolicy = () => {
    if (!activeConfigBank) return;
    const locationKey = `${selectedState}-${selectedCity}`;
    try {
      localStorage.setItem(`policy_config_${activeConfigBank.id}_${locationKey}`, JSON.stringify(policyData));
      
      // Also update bankConfigService (which automatically writes to Firebase Firestore)
      saveBankConfig(activeConfigBank.name, 'unifiedPolicy', policyData, locationKey);

      // Update quick highlights on the bank card
      const updatedBanks = banks.map(b => {
        if (b.id === activeConfigBank.id) {
          const minRate = policyData.interestRates?.[0]?.minRoi || b.minRate;
          const maxLoan = policyData.loanCapping?.[0]?.maxLoan || b.maxLoan;
          const maxTenure = policyData.tenureRules?.[0]?.maxMonths || b.maxTenure;
          return { ...b, minRate, maxLoan, maxTenure };
        }
        return b;
      });
      persistBanks(updatedBanks);

      setSaveAlert(`All policy tables for ${activeConfigBank.name} committed successfully & synced to Firebase Firestore Cloud ☁️!`);
      setTimeout(() => setSaveAlert(''), 4500);
    } catch (e) {
      alert('Failed to save policy changes: ' + e.message);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load active bank's company database whenever activeConfigBank changes
  useEffect(() => {
    if (activeConfigBank) {
      const bankKey = getBankDbKey(activeConfigBank.id);
      setIsLoadingBankCompanies(true);
      setUploadSuccessMessage('');
      setUploadErrorMessage('');
      setLookupResult(null);
      setLookupQuery('');
      setSelectedLookupCompany('');
      setIsDropdownOpen(false);
      setTableSearch('');
      setTableCatFilter('all');
      setCurrentPage(1);

      loadBankDatabase(bankKey).then(data => {
        if (data && data.length > 0) {
          setBankCompanies(data);
          setBankFileMetadata({
            fileName: `${activeConfigBank.name.replace(/[^a-zA-Z0-9]/g, '_')}_company_category_master.xlsx`,
            totalCount: data.length,
            lastUpdated: 'Live Active System'
          });
        } else {
          const fallbackData = INITIAL_COMPANY_DATABASE.map((c, i) => ({
            id: 'c_' + i,
            companyName: c.name,
            category: c.category
          }));
          setBankCompanies(fallbackData);
          setBankFileMetadata({
            fileName: `${activeConfigBank.name.replace(/[^a-zA-Z0-9]/g, '_')}_default_master.xlsx`,
            totalCount: fallbackData.length,
            lastUpdated: 'Default Template'
          });
        }
        setIsLoadingBankCompanies(false);
      }).catch(err => {
        console.warn('Bank company loading notice:', err);
        const fallbackData = INITIAL_COMPANY_DATABASE.map((c, i) => ({
          id: 'c_' + i,
          companyName: c.name,
          category: c.category
        }));
        setBankCompanies(fallbackData);
        setIsLoadingBankCompanies(false);
      });

      // Pre-load universal companies in background for autocomplete
      loadUniversalCompanies().catch(() => {});
    }
  }, [activeConfigBank]);

  // 1. Download Current Excel (.xlsx)
  const handleDownloadExcel = () => {
    if (!bankCompanies || bankCompanies.length === 0) {
      alert(`No company records found for ${activeConfigBank.name} to download.`);
      return;
    }

    setIsDownloadingExcel(true);

    setTimeout(() => {
      try {
        const exportRows = bankCompanies.map((c, idx) => ({
          "S.No": idx + 1,
          "Company Name": c.companyName || c.name || "",
          "Category Tier": c.category || "B",
          "Partner Bank": activeConfigBank.name
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Company Categories");
        
        const cleanBankName = activeConfigBank.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${cleanBankName}_Company_Category_List.xlsx`;
        XLSX.writeFile(workbook, fileName);
      } catch (err) {
        console.error("Excel generation error:", err);
        alert("Failed to export Excel file: " + err.message);
      } finally {
        setIsDownloadingExcel(false);
      }
    }, 60);
  };

  // 2. Replace Excel File - Safe Staging & Modal Handlers
  const handleOpenReplaceModal = () => {
    setIsReplaceModalOpen(true);
    setStagedFile(null);
    setUploadErrorMessage('');
    setIsDragActive(false);
  };

  const handleCloseReplaceModal = () => {
    if (isSavingReplacement) return;
    setIsReplaceModalOpen(false);
    setStagedFile(null);
    setIsParsingStagedFile(false);
    setIsDragActive(false);
    setUploadErrorMessage('');
  };

  // Stage & Parse Excel File (Preview Mode - Does NOT Overwrite yet!)
  const stageExcelFile = (file) => {
    if (!file) return;

    // Validate file extension
    const validExts = ['.xlsx', '.xls', '.csv'];
    const fileNameLower = (file.name || '').toLowerCase();
    const isValid = validExts.some(ext => fileNameLower.endsWith(ext));
    if (!isValid) {
      setUploadErrorMessage('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setIsParsingStagedFile(true);
    setUploadErrorMessage('');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('The uploaded spreadsheet contains no data rows.');
        }

        // Auto-detect company name and category columns
        const sampleRow = rawRows[0];
        const keys = Object.keys(sampleRow);
        
        const compKey = keys.find(k => 
          /company|employer|firm|corporate|organization|name/i.test(k)
        ) || keys[0];

        const catKey = keys.find(k => 
          /category|cat|tier|grade|classification/i.test(k)
        ) || (keys[1] || keys[0]);

        const parsedCompanies = [];
        const seen = new Set();

        rawRows.forEach((row, idx) => {
          const rawName = row[compKey];
          if (!rawName) return;
          const name = String(rawName).trim();
          if (!name || seen.has(name.toUpperCase())) return;
          seen.add(name.toUpperCase());

          const rawCat = row[catKey];
          const category = rawCat ? String(rawCat).trim() : 'B';

          parsedCompanies.push({
            id: 'comp_' + idx,
            companyName: name,
            category: category
          });
        });

        if (parsedCompanies.length === 0) {
          throw new Error('Could not identify valid company records in the uploaded spreadsheet.');
        }

        const distinctCategories = Array.from(new Set(parsedCompanies.map(c => c.category).filter(Boolean)));
        const currentPolicyCats = (policyData.interestRates || []).map(r => String(r.category || '').toUpperCase().trim());
        const hasNewCategories = distinctCategories.length > 0 && distinctCategories.some(
          c => !currentPolicyCats.includes(String(c).toUpperCase().trim())
        );

        const fileSizeFormatted = file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

        setStagedFile({
          file,
          fileName: file.name,
          fileSize: fileSizeFormatted,
          totalCount: parsedCompanies.length,
          parsedCompanies,
          distinctCategories,
          hasNewCategories,
          sampleRows: parsedCompanies.slice(0, 5)
        });
      } catch (err) {
        console.error('Spreadsheet staging error:', err);
        setUploadErrorMessage(err.message || 'Failed to parse Excel file. Please ensure columns include Company Name and Category.');
      } finally {
        setIsParsingStagedFile(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit and Save Replacement (Final Commit upon user clicking Submit & Save)
  const handleCommitReplacement = async () => {
    if (!stagedFile || !stagedFile.parsedCompanies || stagedFile.parsedCompanies.length === 0) {
      alert('No staged file to save. Please choose a valid file first.');
      return;
    }

    setIsSavingReplacement(true);
    setUploadSuccessMessage('');
    setUploadErrorMessage('');

    try {
      const bankKey = getBankDbKey(activeConfigBank.id);
      const parsedCompanies = stagedFile.parsedCompanies;
      const distinctCategories = stagedFile.distinctCategories;

      // 1. Update state
      setBankCompanies(parsedCompanies);
      setBankFileMetadata({
        fileName: stagedFile.fileName,
        totalCount: parsedCompanies.length,
        lastUpdated: new Date().toLocaleDateString('en-IN', { 
          day: 'numeric', month: 'short', year: 'numeric', 
          hour: '2-digit', minute: '2-digit' 
        })
      });

      // 2. Update in-memory database
      setBankDatabaseInMemory(bankKey, parsedCompanies);

      // 3. Async sync to Cloud Firestore & Universal Database
      try {
        await saveBankDatabaseToCloud(bankKey, parsedCompanies);
        await syncToUniversalDatabase(parsedCompanies);
      } catch (cloudErr) {
        console.warn('Could not sync to cloud, stored locally:', cloudErr);
      }

      // 4. Solution 2: Automatic Policy Table Transformation if categories changed
      let policyTransformed = false;
      if (stagedFile.hasNewCategories) {
        console.log(`🔄 Automatic policy transformation triggered for ${stagedFile.fileName}:`, distinctCategories);

        const newInterestRates = distinctCategories.map((catName, idx) => {
          const baseline = (policyData.interestRates && policyData.interestRates[idx]) || 
            (policyData.interestRates && policyData.interestRates[policyData.interestRates.length - 1]) || {
              minRoi: 10.5 + idx * 0.75,
              maxRoi: 12.0 + idx * 1.5,
              defaultRoi: 10.75 + idx * 0.75,
              minSalary: Math.max(20000, 100000 - idx * 20000)
            };
          return {
            category: catName,
            minRoi: baseline.minRoi,
            maxRoi: baseline.maxRoi,
            defaultRoi: baseline.defaultRoi,
            minSalary: baseline.minSalary
          };
        });

        const newLoanCapping = distinctCategories.map((catName, idx) => {
          const baseline = (policyData.loanCapping && policyData.loanCapping[idx]) || 
            (policyData.loanCapping && policyData.loanCapping[policyData.loanCapping.length - 1]) || {
              minLoan: 100000,
              maxLoan: Math.max(1000000, 7500000 - idx * 1250000),
              bachelorCap: Math.max(1000000, 3000000 - idx * 500000),
              minSalary: Math.max(20000, 100000 - idx * 20000)
            };
          return {
            tier: catName,
            minLoan: baseline.minLoan,
            maxLoan: baseline.maxLoan,
            bachelorCap: baseline.bachelorCap,
            minSalary: baseline.minSalary
          };
        });

        const newTenureRules = distinctCategories.map((catName, idx) => {
          const baseline = (policyData.tenureRules && policyData.tenureRules[idx]) || 
            (policyData.tenureRules && policyData.tenureRules[policyData.tenureRules.length - 1]) || {
              minMonths: 12,
              maxMonths: Math.max(36, 84 - idx * 12),
              description: `Up to ${Math.round(Math.max(36, 84 - idx * 12) / 12)} Years`
            };
          return {
            category: catName,
            minMonths: baseline.minMonths,
            maxMonths: baseline.maxMonths,
            description: baseline.description
          };
        });

        const newFoirMultiplier = distinctCategories.map((catName, idx) => {
          const baseline = (policyData.foirMultiplier && policyData.foirMultiplier[idx]) || 
            (policyData.foirMultiplier && policyData.foirMultiplier[policyData.foirMultiplier.length - 1]) || {
              maxFoir: Math.max(45, 70 - idx * 5),
              multiplier: Math.max(12, 28 - idx * 3),
              ccObligation: 5
            };
          return {
            category: catName,
            maxFoir: baseline.maxFoir,
            multiplier: baseline.multiplier,
            ccObligation: baseline.ccObligation
          };
        });

        const transformedPolicy = {
          ...policyData,
          interestRates: newInterestRates,
          loanCapping: newLoanCapping,
          tenureRules: newTenureRules,
          foirMultiplier: newFoirMultiplier
        };

        setPolicyData(transformedPolicy);

        const locationKey = `${selectedState}-${selectedCity}`;
        try {
          localStorage.setItem(`policy_config_${activeConfigBank.id}_${locationKey}`, JSON.stringify(transformedPolicy));
          saveBankConfig(activeConfigBank.name, 'unifiedPolicy', transformedPolicy, locationKey);
        } catch (storageErr) {
          console.warn('Local policy cache warning:', storageErr);
        }
        policyTransformed = true;
      }

      const msg = policyTransformed 
        ? `✅ Success! Replaced ${activeConfigBank.name} database with ${parsedCompanies.length.toLocaleString('en-IN')} companies from ${stagedFile.fileName}. 🔄 Policy tables were automatically transformed for new categories [${distinctCategories.join(', ')}]. Review rates and click "Save Policy Changes" to fine-tune.`
        : `✅ Success! Replaced ${activeConfigBank.name} database with ${parsedCompanies.length.toLocaleString('en-IN')} companies from ${stagedFile.fileName}!`;

      setUploadSuccessMessage(msg);
      setCurrentPage(1);
      setIsReplaceModalOpen(false);
      setStagedFile(null);
    } catch (err) {
      console.error('Commit replacement error:', err);
      setUploadErrorMessage('Failed to save replacement: ' + err.message);
    } finally {
      setIsSavingReplacement(false);
    }
  };

  // 3. Search & Autocomplete Lookup
  const handleLookupInputChange = (e) => {
    const value = e.target.value;
    setLookupQuery(value);
    setSelectedLookupCompany(value);
    setLookupResult(null);

    if (value.trim().length >= 2) {
      const q = value.toLowerCase().trim();
      // Filter from active bank companies
      const bankMatches = bankCompanies
        .filter(c => (c.companyName || c.name || '').toLowerCase().includes(q))
        .map(c => c.companyName || c.name);

      // Also get suggestions from universal database
      const universalMatches = getCompanySuggestions(value) || [];

      // Deduplicate and combine (bank matches prioritized)
      const combined = Array.from(new Set([...bankMatches, ...universalMatches])).slice(0, 12);
      setLookupSuggestions(combined);
      setIsDropdownOpen(combined.length > 0);
    } else {
      setLookupSuggestions([]);
      setIsDropdownOpen(false);
    }
  };

  const handleSelectSuggestion = (companyName) => {
    setLookupQuery(companyName);
    setSelectedLookupCompany(companyName);
    setIsDropdownOpen(false);
    executeFindCategory(companyName);
  };

  const executeFindCategory = (companyNameToSearch) => {
    const target = (companyNameToSearch || lookupQuery || '').trim();
    if (!target) {
      alert('Please enter or select a company name to find its category.');
      return;
    }

    setIsDropdownOpen(false);
    const normalizedTarget = target.toUpperCase();
    
    // Look in active bankCompanies
    const exactMatch = bankCompanies.find(c => 
      (c.companyName || c.name || '').trim().toUpperCase() === normalizedTarget
    );

    if (exactMatch) {
      setLookupResult({
        companyName: exactMatch.companyName || exactMatch.name,
        category: exactMatch.category,
        displayCategory: formatCategoryDisplay(exactMatch.category),
        isListed: true,
        bankName: activeConfigBank.name
      });
      return;
    }

    // If no exact match, try partial match
    const partialMatch = bankCompanies.find(c => 
      (c.companyName || c.name || '').trim().toUpperCase().includes(normalizedTarget)
    );

    if (partialMatch) {
      setLookupResult({
        companyName: partialMatch.companyName || partialMatch.name,
        searchQuery: target,
        category: partialMatch.category,
        displayCategory: formatCategoryDisplay(partialMatch.category),
        isListed: true,
        isPartial: true,
        bankName: activeConfigBank.name
      });
      return;
    }

    // If unlisted in this bank
    setLookupResult({
      companyName: target,
      category: 'UNLISTED',
      displayCategory: 'Unlisted (Default Category B)',
      isListed: false,
      bankName: activeConfigBank.name
    });
  };

  // Inline Category Change in Table
  const handleInlineCategoryChange = (indexOrId, newCategory) => {
    setBankCompanies(prev => {
      const updated = [...prev];
      if (typeof indexOrId === 'number') {
        updated[indexOrId] = { ...updated[indexOrId], category: newCategory };
      } else {
        const idx = updated.findIndex(c => c.id === indexOrId);
        if (idx !== -1) updated[idx] = { ...updated[idx], category: newCategory };
      }
      const bankKey = getBankDbKey(activeConfigBank.id);
      setBankDatabaseInMemory(bankKey, updated);
      return updated;
    });
  };

  // Delete Company from Active Bank List
  const handleDeleteBankCompany = (compToDelete) => {
    const targetName = compToDelete.companyName || compToDelete.name;
    if (window.confirm(`Remove "${targetName}" from ${activeConfigBank.name}'s database?`)) {
      setBankCompanies(prev => {
        const updated = prev.filter(c => (c.companyName || c.name) !== targetName);
        const bankKey = getBankDbKey(activeConfigBank.id);
        setBankDatabaseInMemory(bankKey, updated);
        return updated;
      });
    }
  };

  // Add Company to Category List
  const handleAddCompany = (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) {
      alert('Please enter a valid company name.');
      return;
    }
    const created = {
      id: 'c_' + Date.now(),
      companyName: newCompany.name.trim(),
      category: newCompany.category,
      type: newCompany.type,
      minSalary: Number(newCompany.minSalary) || 25000
    };
    const updated = [created, ...bankCompanies];
    setBankCompanies(updated);
    const bankKey = getBankDbKey(activeConfigBank.id);
    setBankDatabaseInMemory(bankKey, updated);
    setNewCompany({ name: '', category: 'A', type: 'Private Enterprise', minSalary: 30000 });
  };

  // Filtered Company List for Table
  const filteredBankCompanies = bankCompanies.filter(comp => {
    const name = (comp.companyName || comp.name || '').toLowerCase();
    const matchesSearch = !tableSearch || name.includes(tableSearch.toLowerCase().trim());
    if (!matchesSearch) return false;
    if (tableCatFilter === 'all') return true;
    const cat = String(comp.category || '').toUpperCase();
    if (tableCatFilter === 'SUPER_A') return cat.includes('SUPER') || cat === 'SCATA' || cat === 'A+';
    if (tableCatFilter === 'A') return cat === 'CATGA' || cat === 'A' || cat.includes('CATEGORY A');
    if (tableCatFilter === 'B') return cat === 'CATGB' || cat === 'B' || cat.includes('CATEGORY B');
    if (tableCatFilter === 'C') return cat === 'CATGC' || cat === 'C' || cat.includes('CATEGORY C');
    if (tableCatFilter === 'D') return cat === 'CATGD' || cat === 'D' || cat.includes('CATEGORY D');
    if (tableCatFilter === 'GOVT') return cat.includes('GOVT') || cat.includes('PSU');
    if (tableCatFilter === 'UNLISTED') return cat.includes('UNLISTED');
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBankCompanies.length / pageSize));
  const paginatedCompanies = filteredBankCompanies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="unified-policy-manager">
      {/* ======================================================== */}
      {/* 1. STATE & CITY LOCATION SELECTOR BAR                   */}
      {/* ======================================================== */}
      <div className="policy-location-selector-bar">
        <div className="selector-bar-left">
          <div className="selector-title-group">
            <MapPin size={20} className="pin-icon" />
            <div>
              <span className="selector-heading">Operating Location Hierarchy</span>
              <p className="selector-subheading">Select State & City to view or configure specific institutional policies</p>
            </div>
          </div>
        </div>

        <div className="selector-bar-right">
          <div className="select-box-wrapper">
            <label>STATE / TERRITORY</label>
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
              className="location-select"
            >
              {Object.keys(STATE_CITY_MAPPING).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="select-box-wrapper">
            <label>CITY / REGION</label>
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="location-select"
            >
              {(STATE_CITY_MAPPING[selectedState] || []).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="location-context-pill">
            <span className="dot"></span>
            <span>{selectedCity}, {selectedState}</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. 12 BANK CARDS GRID VIEW                              */}
      {/* ======================================================== */}
      {!activeConfigBank ? (
        <div className="bank-cards-section">
          <div className="cards-section-header">
            <div>
              <h2>Institutional Partner Banks ({banks.length})</h2>
              <p>Manage rule calculations, sanction limits, and operational status for all partner lending institutions.</p>
            </div>
            <div className="cards-stats-pills">
              <span className="stat-pill active">
                🟢 Active: {banks.filter(b => b.enabled).length}
              </span>
              <span className="stat-pill suspended">
                🔴 Suspended: {banks.filter(b => !b.enabled).length}
              </span>
            </div>
          </div>

          <div className="bank-cards-grid">
            {banks.map(bank => (
              <div 
                key={bank.id} 
                className={`bank-action-card ${bank.enabled ? 'is-active' : 'is-suspended'}`}
              >
                <div className="card-top-strip" style={{ backgroundColor: bank.color }}></div>

                <div className="card-main-content">
                  <div className="card-header-row">
                    <div className="bank-brand-block">
                      <div className="bank-avatar" style={{ backgroundColor: bank.color }}>
                        {bank.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="bank-title-block">
                        <h3 className="bank-name">{bank.name}</h3>
                        <span className="location-tag">{selectedCity}</span>
                      </div>
                    </div>

                    <div className="card-status-badge">
                      {bank.enabled ? (
                        <span className="status-badge active"><Check size={12} /> Active</span>
                      ) : (
                        <span className="status-badge suspended"><PowerOff size={12} /> Suspended</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Metrics */}
                  <div className="card-quick-metrics">
                    <div className="metric-cell">
                      <span className="metric-label">Min Interest</span>
                      <span className="metric-val">{bank.minRate}% p.a.</span>
                    </div>
                    <div className="metric-cell">
                      <span className="metric-label">Max Sanction</span>
                      <span className="metric-val">₹{(bank.maxLoan / 100000).toFixed(0)} Lakhs</span>
                    </div>
                    <div className="metric-cell">
                      <span className="metric-label">Max Tenure</span>
                      <span className="metric-val">{bank.maxTenure} Mos</span>
                    </div>
                  </div>

                  {/* 3 Dedicated Action Buttons */}
                  <div className="card-actions-row">
                    <button 
                      className="btn-card-action btn-config"
                      onClick={() => handleOpenConfig(bank)}
                      title="Open All-in-One Policy Configuration Editor"
                    >
                      <Settings size={15} />
                      <span>Config Policy</span>
                    </button>

                    <button 
                      className={`btn-card-action btn-suspend ${bank.enabled ? 'btn-warn' : 'btn-success'}`}
                      onClick={() => handleToggleSuspendBank(bank)}
                      title={bank.enabled ? "Suspend Bank Policy" : "Activate Bank Policy"}
                    >
                      {bank.enabled ? <PowerOff size={15} /> : <Play size={15} />}
                      <span>{bank.enabled ? 'Suspend' : 'Activate'}</span>
                    </button>

                    <button 
                      className="btn-card-action btn-delete"
                      onClick={() => handleDeleteBank(bank)}
                      title="Reset or Delete Bank Policy"
                    >
                      <Trash2 size={15} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 3. ALL-IN-ONE TABULAR POLICY VIEWER & EDITOR             */
        /* ======================================================== */
        <div className="unified-config-view">
          {/* Top Return & Save Header */}
          <div className="config-view-header">
            <div className="config-header-left">
              <button 
                className="btn-back-to-cards"
                onClick={() => { setActiveConfigBank(null); setSaveAlert(''); }}
              >
                <ArrowLeft size={16} />
                <span>Back to 12 Bank Cards</span>
              </button>
              
              <div className="config-bank-ident">
                <div className="ident-avatar" style={{ backgroundColor: activeConfigBank.color }}>
                  {activeConfigBank.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="ident-name">{activeConfigBank.name}</h1>
                  <span className="ident-sub">
                    Policy Framework • 📍 {selectedCity}, {selectedState}
                  </span>
                </div>
              </div>
            </div>

            <div className="config-header-right">
              <button 
                className="btn-save-all-policy"
                onClick={handleSavePolicy}
              >
                <Save size={16} />
                <span>Save Policy Changes</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {saveAlert && (
            <div className="save-alert-banner">
              <CheckCircle2 size={18} />
              <span>{saveAlert}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="config-tabs-nav">
            <button 
              className={`config-tab-btn ${activeConfigTab === 'rates' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('rates')}
            >
              <TrendingUp size={16} />
              <span>Interest Rates</span>
            </button>
            <button 
              className={`config-tab-btn ${activeConfigTab === 'capping' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('capping')}
            >
              <Zap size={16} />
              <span>Capital Capping</span>
            </button>
            <button 
              className={`config-tab-btn ${activeConfigTab === 'tenure' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('tenure')}
            >
              <Calendar size={16} />
              <span>Tenure Optimization</span>
            </button>
            <button 
              className={`config-tab-btn ${activeConfigTab === 'foir' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('foir')}
            >
              <Shield size={16} />
              <span>FOIR & Multipliers</span>
            </button>
            <button 
              className={`config-tab-btn ${activeConfigTab === 'demographics' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('demographics')}
            >
              <User size={16} />
              <span>Demographic & Age Rules</span>
            </button>
            <button 
              className={`config-tab-btn ${activeConfigTab === 'companies' ? 'active' : ''}`}
              onClick={() => setActiveConfigTab('companies')}
            >
              <Building2 size={16} />
              <span>Company Category List</span>
            </button>
          </div>

          {/* TAB 1: INTEREST RATES TABULAR VIEW */}
          {activeConfigTab === 'rates' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>Interest Rate Structures & Slabs</h3>
                  <p>Define minimum, maximum, and default ROI percentage per employer category.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Category Tier</th>
                      <th>Minimum Net Salary</th>
                      <th>Min ROI (% p.a.)</th>
                      <th>Max ROI (% p.a.)</th>
                      <th>Default Offered ROI (% p.a.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyData.interestRates.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${row.category.toLowerCase().replace(/\s+/g, '-')}`}>
                            {row.category}
                          </span>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <span>₹</span>
                            <input 
                              type="number"
                              value={row.minSalary}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.interestRates];
                                updated[idx].minSalary = val;
                                setPolicyData({ ...policyData, interestRates: updated });
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <input 
                              type="number"
                              step="0.05"
                              value={row.minRoi}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.interestRates];
                                updated[idx].minRoi = val;
                                setPolicyData({ ...policyData, interestRates: updated });
                              }}
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <input 
                              type="number"
                              step="0.05"
                              value={row.maxRoi}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.interestRates];
                                updated[idx].maxRoi = val;
                                setPolicyData({ ...policyData, interestRates: updated });
                              }}
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell highlight">
                            <input 
                              type="number"
                              step="0.05"
                              value={row.defaultRoi}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.interestRates];
                                updated[idx].defaultRoi = val;
                                setPolicyData({ ...policyData, interestRates: updated });
                              }}
                            />
                            <span>%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CAPITAL / LOAN CAPPING TABULAR VIEW */}
          {activeConfigTab === 'capping' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>Capital & Sanction Capping Matrix</h3>
                  <p>Specify minimum and maximum loan limits, along with bachelor residence restrictions.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Category Tier</th>
                      <th>Minimum Loan Amount (₹)</th>
                      <th>Absolute Maximum Sanction (₹)</th>
                      <th>Bachelor Capping Limit (₹)</th>
                      <th>Sanction In Lakhs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyData.loanCapping.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${row.tier.toLowerCase().replace(/\s+/g, '-')}`}>
                            {row.tier}
                          </span>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <span>₹</span>
                            <input 
                              type="number"
                              value={row.minLoan}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.loanCapping];
                                updated[idx].minLoan = val;
                                setPolicyData({ ...policyData, loanCapping: updated });
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell highlight">
                            <span>₹</span>
                            <input 
                              type="number"
                              value={row.maxLoan}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.loanCapping];
                                updated[idx].maxLoan = val;
                                setPolicyData({ ...policyData, loanCapping: updated });
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <span>₹</span>
                            <input 
                              type="number"
                              value={row.bachelorCap}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.loanCapping];
                                updated[idx].bachelorCap = val;
                                setPolicyData({ ...policyData, loanCapping: updated });
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <span className="tag-lakhs">
                            Up to ₹{(row.maxLoan / 100000).toFixed(1)} Lakhs
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TENURE OPTIMIZATION TABULAR VIEW */}
          {activeConfigTab === 'tenure' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>Tenure Optimization & Repayment Windows</h3>
                  <p>Configure permitted loan repayment periods (12 to 84 months) by company tier.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Category Tier</th>
                      <th>Min Tenure (Months)</th>
                      <th>Max Tenure (Months)</th>
                      <th>Max Tenure (Years)</th>
                      <th>Policy Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyData.tenureRules.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${row.category.toLowerCase().replace(/\s+/g, '-')}`}>
                            {row.category}
                          </span>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <input 
                              type="number"
                              value={row.minMonths}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.tenureRules];
                                updated[idx].minMonths = val;
                                setPolicyData({ ...policyData, tenureRules: updated });
                              }}
                            />
                            <span>Mos</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell highlight">
                            <input 
                              type="number"
                              value={row.maxMonths}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.tenureRules];
                                updated[idx].maxMonths = val;
                                updated[idx].description = `Up to ${(val / 12).toFixed(1)} Years`;
                                setPolicyData({ ...policyData, tenureRules: updated });
                              }}
                            />
                            <span>Mos</span>
                          </div>
                        </td>
                        <td>
                          <span className="tag-years">
                            {(row.maxMonths / 12).toFixed(1)} Years
                          </span>
                        </td>
                        <td>
                          <span className="text-muted-sm">{row.description}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FOIR & MULTIPLIER TABULAR VIEW */}
          {activeConfigTab === 'foir' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>FOIR (Fixed Obligation to Income Ratio) & Income Multipliers</h3>
                  <p>Determine borrower obligation tolerance and salary multiplier factors.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Category Tier</th>
                      <th>Max Permitted FOIR (%)</th>
                      <th>Net Salary Multiplier (x)</th>
                      <th>Credit Card Obligation Factor (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyData.foirMultiplier.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${row.category.toLowerCase().replace(/\s+/g, '-')}`}>
                            {row.category}
                          </span>
                        </td>
                        <td>
                          <div className="table-input-cell highlight">
                            <input 
                              type="number"
                              value={row.maxFoir}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.foirMultiplier];
                                updated[idx].maxFoir = val;
                                setPolicyData({ ...policyData, foirMultiplier: updated });
                              }}
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell highlight">
                            <input 
                              type="number"
                              value={row.multiplier}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.foirMultiplier];
                                updated[idx].multiplier = val;
                                setPolicyData({ ...policyData, foirMultiplier: updated });
                              }}
                            />
                            <span>x Salary</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <input 
                              type="number"
                              value={row.ccObligation}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...policyData.foirMultiplier];
                                updated[idx].ccObligation = val;
                                setPolicyData({ ...policyData, foirMultiplier: updated });
                              }}
                            />
                            <span>% CC Limit</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DEMOGRAPHIC & AGE RULES TABULAR VIEW */}
          {activeConfigTab === 'demographics' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>Demographic & Age Eligibility Criteria</h3>
                  <p>Configure age boundaries, retirement thresholds, and minimum stability requirements.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Eligibility Parameter</th>
                      <th>Configured Threshold</th>
                      <th>Standard Norm</th>
                      <th>Rule Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Minimum Applicant Age</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData.demographics.minAge}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, minAge: Number(e.target.value) }
                            })}
                          />
                          <span>Years</span>
                        </div>
                      </td>
                      <td>21 Years</td>
                      <td>Minimum age required at loan application stage</td>
                    </tr>
                    <tr>
                      <td><strong>Maximum Age at Loan Maturity</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData.demographics.maxAge}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, maxAge: Number(e.target.value) }
                            })}
                          />
                          <span>Years</span>
                        </div>
                      </td>
                      <td>60 Years</td>
                      <td>Borrower must finish repayment before reaching this age</td>
                    </tr>
                    <tr>
                      <td><strong>Retirement Age (Salaried / Private)</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData.demographics.retirementSalaried}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, retirementSalaried: Number(e.target.value) }
                            })}
                          />
                          <span>Years</span>
                        </div>
                      </td>
                      <td>60 Years</td>
                      <td>Superannuation age considered for private corporate employees</td>
                    </tr>
                    <tr>
                      <td><strong>Retirement Age (Government / Defense)</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData.demographics.retirementGovt}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, retirementGovt: Number(e.target.value) }
                            })}
                          />
                          <span>Years</span>
                        </div>
                      </td>
                      <td>62 Years</td>
                      <td>Standard retirement threshold for state / central govt personnel</td>
                    </tr>
                    <tr>
                      <td><strong>Minimum Monthly Salary Threshold</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <span>₹</span>
                          <input 
                            type="number"
                            value={policyData.demographics.minSalary}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, minSalary: Number(e.target.value) }
                            })}
                          />
                        </div>
                      </td>
                      <td>₹25,000</td>
                      <td>Minimum verifiable monthly salary required for qualification</td>
                    </tr>
                    <tr>
                      <td><strong>Minimum Total Work Experience</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData.demographics.minExperienceTotal}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, minExperienceTotal: Number(e.target.value) }
                            })}
                          />
                          <span>Months</span>
                        </div>
                      </td>
                      <td>12 Months</td>
                      <td>Cumulative work experience across previous employers</td>
                    </tr>
                    <tr>
                      <td><strong>Minimum CIBIL Score Cutoff</strong></td>
                      <td>
                        <div className="table-input-cell highlight">
                          <input 
                            type="number"
                            value={policyData.demographics.minCibilScore}
                            onChange={(e) => setPolicyData({
                              ...policyData,
                              demographics: { ...policyData.demographics, minCibilScore: Number(e.target.value) }
                            })}
                          />
                        </div>
                      </td>
                      <td>650</td>
                      <td>Bureau credit score below which applications are rejected</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: COMPANY CATEGORY DATABASE & EXCEL MANAGER */}
          {activeConfigTab === 'companies' && (
            <div className="tabular-policy-card company-category-overhaul-card">
              {/* Header */}
              <div className="table-card-header company-category-top-header">
                <div>
                  <div className="card-badge-pill">
                    <FileSpreadsheet size={14} />
                    <span>INSTITUTIONAL CORPORATE MASTER</span>
                  </div>
                  <h3>Company Category Master — {activeConfigBank.name}</h3>
                  <p>Manage the active employer database for {activeConfigBank.name}. Download or replace the spreadsheet, or manually lookup company category tiers.</p>
                </div>
              </div>

              {/* Upload Alert Banners */}
              {uploadSuccessMessage && (
                <div className="excel-alert-banner success">
                  <CheckCircle size={18} />
                  <span>{uploadSuccessMessage}</span>
                  <button onClick={() => setUploadSuccessMessage('')} className="alert-dismiss-btn"><X size={14} /></button>
                </div>
              )}
              {uploadErrorMessage && (
                <div className="excel-alert-banner error">
                  <AlertTriangle size={18} />
                  <span>{uploadErrorMessage}</span>
                  <button onClick={() => setUploadErrorMessage('')} className="alert-dismiss-btn"><X size={14} /></button>
                </div>
              )}

              {/* 1. Current Excel Dataset Card & Operations */}
              <div 
                className={`excel-management-panel ${isOuterDragActive ? 'panel-drag-active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsOuterDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsOuterDragActive(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsOuterDragActive(false);
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) {
                    handleOpenReplaceModal();
                    stageExcelFile(dropped);
                  }
                }}
              >
                <div className="excel-meta-box">
                  <div className="excel-file-icon-wrap">
                    <FileSpreadsheet size={28} className="excel-icon" />
                  </div>
                  <div className="excel-file-info">
                    <div className="excel-file-name-row">
                      <span className="file-name">{bankFileMetadata.fileName || `${activeConfigBank.name}_Company_Master.xlsx`}</span>
                      <span className="status-badge-live">Active Database</span>
                    </div>
                    <div className="excel-stats-row">
                      <span className="stat-pill">
                        <strong>{(bankFileMetadata.totalCount || bankCompanies.length).toLocaleString('en-IN')}</strong> Companies Indexed
                      </span>
                      <span className="stat-separator">•</span>
                      <span className="stat-pill text-muted">
                        Status: {bankFileMetadata.lastUpdated || 'Synchronized'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="excel-action-buttons">
                  <button 
                    type="button" 
                    className="btn-download-excel"
                    onClick={handleDownloadExcel}
                    title="Download active database as formatted Excel spreadsheet"
                    disabled={isLoadingBankCompanies || isDownloadingExcel}
                  >
                    {isDownloadingExcel ? (
                      <>
                        <RefreshCw size={16} className="spin-animate" />
                        <span>Generating Excel ({(bankFileMetadata.totalCount || bankCompanies.length).toLocaleString('en-IN')} rows)...</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        <span>Download Current Excel</span>
                      </>
                    )}
                  </button>

                  <button 
                    type="button" 
                    className="btn-replace-excel" 
                    onClick={handleOpenReplaceModal}
                    title="Upload or Drag & Drop new .xlsx, .xls, or .csv file to replace database"
                  >
                    <Upload size={16} />
                    <span>Replace Excel File</span>
                  </button>
                </div>
              </div>

              {/* 2. Manual Company Category Lookup Tool */}
              <div className="company-lookup-section">
                <div className="lookup-section-header">
                  <div className="lookup-title-group">
                    <Search size={18} className="lookup-icon" />
                    <div>
                      <h4>Manual Company Category Lookup</h4>
                      <p>Type a company name (e.g. <em>bikaji</em>) and select from the dropdown to verify its exact tier in {activeConfigBank.name}.</p>
                    </div>
                  </div>
                </div>

                <div className="company-lookup-bar-wrapper" ref={dropdownRef}>
                  <div className="lookup-input-container">
                    <Search size={18} className="inner-search-icon" />
                    <input 
                      type="text"
                      className="lookup-text-input"
                      placeholder="Type company name here (e.g. Bikaji, Tata, Infosys)..."
                      value={lookupQuery}
                      onChange={handleLookupInputChange}
                      onFocus={() => {
                        if (lookupSuggestions.length > 0) setIsDropdownOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          executeFindCategory();
                        }
                      }}
                    />
                    {lookupQuery && (
                      <button 
                        type="button" 
                        className="btn-clear-lookup"
                        onClick={() => {
                          setLookupQuery('');
                          setSelectedLookupCompany('');
                          setLookupSuggestions([]);
                          setIsDropdownOpen(false);
                          setLookupResult(null);
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}

                    {/* Auto-suggest dropdown popover */}
                    {isDropdownOpen && lookupSuggestions.length > 0 && (
                      <div className="autocomplete-dropdown">
                        <div className="dropdown-header">
                          <span>Matching Companies ({lookupSuggestions.length})</span>
                          <small>Click to select & verify</small>
                        </div>
                        <ul className="dropdown-list">
                          {lookupSuggestions.map((suggestion, sIdx) => (
                            <li 
                              key={sIdx} 
                              className="dropdown-item"
                              onClick={() => handleSelectSuggestion(suggestion)}
                            >
                              <Building2 size={14} className="dropdown-item-icon" />
                              <span className="dropdown-item-name">{suggestion}</span>
                              <span className="dropdown-item-action">Select <ArrowRight size={12} /></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button 
                    type="button"
                    className="btn-find-category"
                    onClick={() => executeFindCategory()}
                  >
                    <Search size={16} />
                    <span>Find Category</span>
                  </button>
                </div>

                {/* Lookup Result Card */}
                {lookupResult && (
                  <div className={`lookup-result-card ${lookupResult.isListed ? 'found' : 'fallback'}`}>
                    <div className="result-card-left">
                      <div className={`category-display-badge ${getCategoryBadgeClass(lookupResult.category)}`}>
                        <span className="badge-tier-label">ASSIGNED TIER</span>
                        <span className="badge-tier-value">{lookupResult.displayCategory}</span>
                      </div>
                      <div className="result-company-details">
                        <h4 className="result-company-name">{lookupResult.companyName}</h4>
                        <p className="result-bank-statement">
                          This company belongs to <strong>{lookupResult.displayCategory}</strong> in <strong>{lookupResult.bankName}</strong>.
                        </p>
                        {lookupResult.isPartial && (
                          <span className="partial-match-note">
                            ℹ Matched via closest entity in {lookupResult.bankName} catalog.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="result-card-right">
                      {lookupResult.isListed ? (
                        <div className="status-indicator verified">
                          <CheckCircle2 size={18} />
                          <span>Mapped in {lookupResult.bankName} Database</span>
                        </div>
                      ) : (
                        <div className="status-indicator fallback">
                          <HelpCircle size={18} />
                          <span>Unlisted • System Uses Fallback Category B</span>
                        </div>
                      )}
                      <div className="policy-impact-pill">
                        <Zap size={14} />
                        <span>Calculation Rules: Multipliers & ROI apply for {lookupResult.displayCategory}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. REPLACE EXCEL FILE MODAL & STAGING DIALOG            */}
      {/* ======================================================== */}
      {isReplaceModalOpen && (
        <div 
          className="excel-replace-modal-backdrop" 
          onClick={(e) => { 
            if (e.target === e.currentTarget && !isSavingReplacement) handleCloseReplaceModal(); 
          }}
        >
          <div className="excel-replace-modal-container">
            {/* Modal Header */}
            <div className="excel-replace-modal-header">
              <div className="modal-title-wrap">
                <div className="modal-bank-badge" style={{ backgroundColor: activeConfigBank.color || '#F58220' }}>
                  <Building2 size={18} color="#fff" />
                </div>
                <div>
                  <h3 className="modal-heading">Replace Company Master Database</h3>
                  <p className="modal-subheading">Update company list & category tiers for <strong>{activeConfigBank.name}</strong></p>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={handleCloseReplaceModal}
                disabled={isSavingReplacement}
                title="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="excel-replace-modal-body">
              {uploadErrorMessage && (
                <div className="modal-error-banner">
                  <AlertTriangle size={18} />
                  <span>{uploadErrorMessage}</span>
                </div>
              )}

              {/* State 1: No file staged yet -> Prominent Drag & Drop Zone */}
              {!stagedFile && !isParsingStagedFile && (
                <div 
                  className={`excel-dropzone ${isDragActive ? 'drag-active' : ''}`}
                  onDragEnter={(e) => { e.preventDefault(); setIsDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) stageExcelFile(file);
                  }}
                  onClick={() => modalFileInputRef.current?.click()}
                >
                  <input 
                    ref={modalFileInputRef}
                    type="file" 
                    accept=".xlsx, .xls, .csv" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) stageExcelFile(file);
                      e.target.value = '';
                    }}
                    style={{ display: 'none' }}
                  />
                  <div className="dropzone-icon-circle">
                    <Upload size={34} />
                  </div>
                  <h4 className="dropzone-title">
                    {isDragActive ? 'Drop your spreadsheet here' : 'Drag & Drop your Excel or CSV file here'}
                  </h4>
                  <p className="dropzone-subtitle">or click anywhere inside to browse files (.xlsx, .xls, .csv)</p>
                  <div className="dropzone-badge-row">
                    <span className="dropzone-pill">Microsoft Excel (.xlsx, .xls)</span>
                    <span className="dropzone-pill">Comma-Separated Values (.csv)</span>
                  </div>
                  <div className="dropzone-security-note">
                    <Shield size={14} />
                    <span>Safe Preview: The active database will <strong>not</strong> be replaced until you review the staged summary and click <strong>Submit & Save</strong>.</span>
                  </div>
                </div>
              )}

              {/* State 2: Parsing in progress */}
              {isParsingStagedFile && (
                <div className="excel-parsing-state">
                  <RefreshCw size={36} className="spin-animate parsing-spinner" />
                  <h4>Validating & Parsing Spreadsheet...</h4>
                  <p>Detecting company names, reading category tiers, and checking formatting.</p>
                </div>
              )}

              {/* State 3: Staged File Preview & Review Card */}
              {stagedFile && !isParsingStagedFile && (
                <div className="staged-file-review">
                  {/* File Metadata Bar */}
                  <div className="staged-file-header">
                    <div className="staged-file-details">
                      <div className="staged-icon-wrap">
                        <FileSpreadsheet size={28} className="staged-excel-icon" />
                      </div>
                      <div>
                        <div className="staged-name-row">
                          <h4 className="staged-file-name">{stagedFile.fileName}</h4>
                          <span className="staged-badge-ready">Staged Preview</span>
                        </div>
                        <span className="staged-file-meta">{stagedFile.fileSize} • {stagedFile.totalCount.toLocaleString('en-IN')} valid companies identified</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-change-staged-file"
                      onClick={() => modalFileInputRef.current?.click()}
                      disabled={isSavingReplacement}
                    >
                      <Upload size={14} />
                      <span>Choose Different File</span>
                    </button>
                    <input 
                      ref={modalFileInputRef}
                      type="file" 
                      accept=".xlsx, .xls, .csv" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) stageExcelFile(file);
                        e.target.value = '';
                      }}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* Impact Comparison Cards */}
                  <div className="staged-metrics-grid">
                    <div className="staged-metric-box">
                      <span className="metric-label">Current Active Companies</span>
                      <span className="metric-value">{(bankFileMetadata.totalCount || bankCompanies.length).toLocaleString('en-IN')}</span>
                      <span className="metric-sub">{bankFileMetadata.fileName || 'Active Master Database'}</span>
                    </div>
                    <div className="staged-metric-box new-highlight">
                      <span className="metric-label">Staged New Companies</span>
                      <span className="metric-value">{stagedFile.totalCount.toLocaleString('en-IN')}</span>
                      <span className="metric-sub">{stagedFile.fileName}</span>
                    </div>
                    <div className="staged-metric-box diff-box">
                      <span className="metric-label">Net Database Impact</span>
                      <span className="metric-value">
                        {stagedFile.totalCount >= (bankFileMetadata.totalCount || bankCompanies.length) ? '+' : ''}
                        {(stagedFile.totalCount - (bankFileMetadata.totalCount || bankCompanies.length)).toLocaleString('en-IN')}
                      </span>
                      <span className="metric-sub">Company Difference</span>
                    </div>
                  </div>

                  {/* Detected Categories & Solution 2 Notice */}
                  <div className="staged-categories-section">
                    <div className="staged-cat-header">
                      <span className="staged-cat-title">Detected Category Tiers in File ({stagedFile.distinctCategories.length})</span>
                    </div>
                    <div className="staged-cat-badges">
                      {stagedFile.distinctCategories.map(cat => (
                        <span key={cat} className={`cat-pill ${getCategoryBadgeClass(cat)}`}>
                          {formatCategoryDisplay(cat)}
                        </span>
                      ))}
                    </div>

                    {stagedFile.hasNewCategories ? (
                      <div className="staged-transformation-notice">
                        <AlertTriangle size={20} className="notice-icon orange" />
                        <div>
                          <strong>Solution 2: Automatic Policy Table Transformation</strong>
                          <p>
                            This spreadsheet contains new category tiers: <strong>[{stagedFile.distinctCategories.join(', ')}]</strong>. 
                            When you click <strong>Submit & Save Replacement</strong> below, all 4 policy tables (Interest Rates, Loan Capping, Tenure Rules, and FOIR Multipliers) will be automatically transformed with draft baselines pre-filled.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="staged-standard-notice">
                        <CheckCircle2 size={20} className="notice-icon green" />
                        <div>
                          <strong>Standard Category Structure Verified</strong>
                          <p>All category tiers align with {activeConfigBank.name}'s current policy tables. Existing rate cards and capping limits will remain intact.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sample Preview Table */}
                  <div className="staged-preview-table-container">
                    <div className="preview-table-header">
                      <span className="preview-table-title">Sample Data Verification (First 5 Rows)</span>
                      <span className="preview-table-note">Columns mapped: Company Name & Category</span>
                    </div>
                    <table className="staged-preview-table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>#</th>
                          <th>Company / Employer Name</th>
                          <th style={{ width: '180px' }}>Detected Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stagedFile.sampleRows.map((r, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td className="comp-name-cell">{r.companyName}</td>
                            <td>
                              <span className={`cat-pill ${getCategoryBadgeClass(r.category)}`}>
                                {formatCategoryDisplay(r.category)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="excel-replace-modal-footer">
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={handleCloseReplaceModal}
                disabled={isSavingReplacement}
              >
                Discard & Cancel
              </button>

              {stagedFile ? (
                <button 
                  type="button" 
                  className="btn-modal-submit-save" 
                  onClick={handleCommitReplacement}
                  disabled={isSavingReplacement}
                >
                  {isSavingReplacement ? (
                    <>
                      <RefreshCw size={18} className="spin-animate" />
                      <span>Saving & Replacing ({stagedFile.totalCount.toLocaleString('en-IN')} rows)...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Submit & Save Replacement</span>
                    </>
                  )}
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn-modal-browse-trigger"
                  onClick={() => modalFileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  <span>Browse Excel File</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedBankPolicyManager;
