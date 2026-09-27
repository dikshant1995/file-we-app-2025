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
import { getExcelPolicyForBank, BANK_EXCEL_POLICIES } from '../../config/bankPolicyRegistry.js';
import { 
  loadBankDatabase, 
  setBankDatabaseInMemory, 
  saveBankDatabaseToCloud, 
  syncToUniversalDatabase, 
  getCompanySuggestions, 
  loadUniversalCompanies 
} from '../../services/companyDatabaseService.js';
import './UnifiedBankPolicyManager.css';

// Partner Lending Institutions (Banks & NBFCs) configured according to BANKS POLICYS.xlsx
const INITIAL_12_BANKS = [
  { id: 'kotak', name: 'Kotak Mahindra Bank', color: '#ED1C24', minRate: 9.95, maxLoan: 10000000, maxTenure: 72, enabled: true },
  { id: 'tata', name: 'Tata Capital', color: '#1F4E78', minRate: 10.99, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'poonawala', name: 'Poonawala Finance', color: '#005596', minRate: 11.99, maxLoan: 6000000, maxTenure: 84, enabled: true },
  { id: 'idfc', name: 'IDFC First Bank', color: '#8B1538', minRate: 10.25, maxLoan: 10000000, maxTenure: 84, enabled: true },
  { id: 'hdfc', name: 'HDFC Bank', color: '#004C8F', minRate: 9.99, maxLoan: 7500000, maxTenure: 84, enabled: true },
  { id: 'icici', name: 'ICICI Bank', color: '#ED1C24', minRate: 9.99, maxLoan: 10000000, maxTenure: 72, enabled: true },
  { id: 'bandhan', name: 'Bandhan Bank', color: '#DC0028', minRate: 10.50, maxLoan: 2500000, maxTenure: 60, enabled: true },
  { id: 'cholamandalam', name: 'Cholamandalam Finance', color: '#F37021', minRate: 13.75, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'axis-fin', name: 'Axis Finance', color: '#800000', minRate: 13.50, maxLoan: 2500000, maxTenure: 84, enabled: true },
  { id: 'indusind', name: 'IndusInd Bank', color: '#005596', minRate: 9.99, maxLoan: 7500000, maxTenure: 84, enabled: true },
  { id: 'shri-ram', name: 'Shri Ram Finance', color: '#1F4E78', minRate: 12.5, maxLoan: 2000000, maxTenure: 48, enabled: true },
  { id: 'piramal', name: 'Piramal Finance', color: '#1F4E78', minRate: 11.99, maxLoan: 5000000, maxTenure: 72, enabled: true },
  // Additional Banks & NBFCs from Master Policy
  { id: 'axis-bank', name: 'Axis Bank', color: '#97144D', minRate: 9.99, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'lnt', name: 'L&T Finance', color: '#004F9E', minRate: 10.99, maxLoan: 3000000, maxTenure: 72, enabled: true },
  { id: 'smfg', name: 'SMFG India Credit', color: '#002D62', minRate: 17.00, maxLoan: 4000000, maxTenure: 72, enabled: true },
  { id: 'bajaj', name: 'Bajaj Finance', color: '#0072BB', minRate: 10.0, maxLoan: 5000000, maxTenure: 96, enabled: true },
  { id: 'incred', name: 'Incred Finance', color: '#F37023', minRate: 13.49, maxLoan: 1500000, maxTenure: 60, enabled: true },
  { id: 'au-bank', name: 'AU Small Finance Bank', color: '#6F2C91', minRate: 11.5, maxLoan: 1500000, maxTenure: 60, enabled: true },
  { id: 'abfl', name: 'Aditya Birla Finance', color: '#A6192E', minRate: 11.50, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'finnable', name: 'Finnable Finance', color: '#10B981', minRate: 22.0, maxLoan: 1000000, maxTenure: 60, enabled: true }
];

const getBankDbKey = (bankId) => {
  const map = {
    'axis-fin': 'axis_fin',
    'cholamandalam': 'chola',
    'shri-ram': 'shri_ram',
    'axis-bank': 'axis_bank',
    'au-bank': 'au_bank'
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

const DEFAULT_DEMOGRAPHIC_RULES = {
  minAge: 21,
  maxAge: 60,
  retirementSalaried: 60,
  retirementGovt: 62,
  minSalary: 25000,
  minExperienceTotal: 12,
  minExperienceCurrent: 6,
  minCibilScore: 0, // Bypassed
  ccObligationPercent: 5,
  ccBtAllowedCount: 3
};

const DEFAULT_UNIFIED_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove15L: 10.25, roi10Lto15L: 10.50, roiBelow10L: 11.00, minRoi: 10.25, maxRoi: 11.00, defaultRoi: 10.50, minSalary: 100000 },
    { category: 'A', roiAbove15L: 10.50, roi10Lto15L: 10.75, roiBelow10L: 11.25, minRoi: 10.50, maxRoi: 11.25, defaultRoi: 10.75, minSalary: 50000 },
    { category: 'B', roiAbove15L: 11.00, roi10Lto15L: 11.50, roiBelow10L: 12.00, minRoi: 11.00, maxRoi: 12.00, defaultRoi: 11.50, minSalary: 35000 },
    { category: 'C', roiAbove15L: 12.00, roi10Lto15L: 12.50, roiBelow10L: 13.50, minRoi: 12.00, maxRoi: 13.50, defaultRoi: 12.50, minSalary: 25000 },
    { category: 'Govt', roiAbove15L: 10.35, roi10Lto15L: 10.50, roiBelow10L: 10.75, minRoi: 10.35, maxRoi: 10.75, defaultRoi: 10.50, minSalary: 20000 }
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
    { category: 'Super A', slab1Foir: 55, slab2Foir: 65, maxFoir: 70, multiplier: 28, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, slab2Foir: 60, maxFoir: 65, multiplier: 24, ccObligation: 5 },
    { category: 'B', slab1Foir: 50, slab2Foir: 55, maxFoir: 60, multiplier: 20, ccObligation: 5 },
    { category: 'C', slab1Foir: 45, slab2Foir: 50, maxFoir: 55, multiplier: 18, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 55, slab2Foir: 60, maxFoir: 65, multiplier: 25, ccObligation: 3 }
  ],
  demographics: DEFAULT_DEMOGRAPHIC_RULES,
  companies: INITIAL_COMPANY_DATABASE
};

// Exact Master Policy Configuration for AXIS BANK from Excel
export const AXIS_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove15L: 9.99, roi10Lto15L: 10.35, roiBelow10L: 10.49, minRoi: 9.99, maxRoi: 10.35, defaultRoi: 9.99 },
    { category: 'A', roiAbove15L: 9.99, roi10Lto15L: 10.35, roiBelow10L: 10.49, minRoi: 9.99, maxRoi: 10.35, defaultRoi: 9.99 },
    { category: 'B', roiAbove15L: 10.39, roi10Lto15L: 10.45, roiBelow10L: 10.75, minRoi: 10.39, maxRoi: 10.45, defaultRoi: 10.39 },
    { category: 'C', roiAbove15L: 10.59, roi10Lto15L: 10.75, roiBelow10L: 11.25, minRoi: 10.59, maxRoi: 10.75, defaultRoi: 10.59 },
    { category: 'Govt', roiAbove15L: 10.39, roi10Lto15L: 10.45, roiBelow10L: 10.75, minRoi: 10.39, maxRoi: 10.45, defaultRoi: 10.39 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 50000, maxLoan: 5000000, bachelorCap: null, minSalary: 175000 },
    { tier: 'A', minLoan: 50000, maxLoan: 5000000, bachelorCap: null, minSalary: 175000 },
    { tier: 'B', minLoan: 50000, maxLoan: 5000000, bachelorCap: null, minSalary: 175000 },
    { tier: 'C', minLoan: 50000, maxLoan: 5000000, bachelorCap: null, minSalary: 175000 },
    { tier: 'Govt', minLoan: 50000, maxLoan: 5000000, bachelorCap: null, minSalary: 175000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
    { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
    { category: 'B', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
    { category: 'C', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 55, slab2Foir: 65, maxFoir: 75, multiplier: 36, ccObligation: 4 },
    { category: 'A', slab1Foir: 55, slab2Foir: 65, maxFoir: 75, multiplier: 36, ccObligation: 4 },
    { category: 'B', slab1Foir: 55, slab2Foir: 65, maxFoir: 75, multiplier: 36, ccObligation: 4 },
    { category: 'C', slab1Foir: 55, slab2Foir: 65, maxFoir: 75, multiplier: 36, ccObligation: 4 },
    { category: 'Govt', slab1Foir: 55, slab2Foir: 65, maxFoir: 75, multiplier: 36, ccObligation: 4 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minExperienceTotal: 12,
    minExperienceCurrent: 6,
    minCibilScore: 0,
    ccObligationPercent: 4,
    ccBtAllowedCount: 5
  },
  companies: INITIAL_COMPANY_DATABASE
};

// Exact Master Policy Configuration for INDUSIND BANK LTD from Excel
export const INDUSIND_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove15L: 9.99, roi10Lto15L: 9.99, roiBelow10L: 12.00, minRoi: 9.99, maxRoi: 12.00, defaultRoi: 9.99 },
    { category: 'A', roiAbove15L: 9.99, roi10Lto15L: 9.99, roiBelow10L: 12.00, minRoi: 9.99, maxRoi: 12.00, defaultRoi: 9.99 },
    { category: 'B', roiAbove15L: 9.99, roi10Lto15L: 9.99, roiBelow10L: 12.00, minRoi: 9.99, maxRoi: 12.00, defaultRoi: 9.99 },
    { category: 'C', roiAbove15L: 10.60, roi10Lto15L: 13.00, roiBelow10L: 13.00, minRoi: 10.60, maxRoi: 13.00, defaultRoi: 10.60 },
    { category: 'Govt', roiAbove15L: 9.99, roi10Lto15L: 9.99, roiBelow10L: 12.00, minRoi: 9.99, maxRoi: 12.00, defaultRoi: 9.99 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 1500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (CIBIL -1 capped to 48M)' },
    { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (CIBIL -1 capped to 48M)' },
    { category: 'B', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (CIBIL -1 capped to 48M)' },
    { category: 'C', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (CIBIL -1 capped to 48M)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (CIBIL -1 capped to 48M)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplierBelow75k: 20, multiplier75kTo125k: 25, multiplierAbove125k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplierBelow75k: 20, multiplier75kTo125k: 25, multiplierAbove125k: 30, multiplier: 30, ccObligation: 5 },
    { category: 'B', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplierBelow75k: 20, multiplier75kTo125k: 25, multiplierAbove125k: 30, multiplier: 25, ccObligation: 5 },
    { category: 'C', slab1Foir: 50, slab2Foir: 60, maxFoir: 60, multiplierBelow75k: 21, multiplier75kTo125k: 21, multiplierAbove125k: 21, multiplier: 21, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplierBelow75k: 20, multiplier75kTo125k: 25, multiplierAbove125k: 30, multiplier: 30, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minExperienceTotal: 12,
    minExperienceCurrent: 0,
    minCibilScore: 0,
    ccObligationPercent: 5,
    ccBtAllowedCount: 0,
    allowCcBt: false
  },
  companies: INITIAL_COMPANY_DATABASE
};

// Exact Master Policy Configuration for HDFC BANK from Excel
export const HDFC_BANK_EXCEL_POLICY = {
  interestRates: [
    { category: 'Super A', roiAbove20L: 9.99, roi15Lto20L: 10.15, roi10Lto15L: 10.50, roi5Lto10L: 11.50, roiAbove15L: 10.15, roiBelow10L: 11.50, minRoi: 9.99, maxRoi: 11.50, defaultRoi: 9.99 },
    { category: 'A', roiAbove20L: 9.99, roi15Lto20L: 10.15, roi10Lto15L: 10.50, roi5Lto10L: 11.50, roiAbove15L: 10.15, roiBelow10L: 11.50, minRoi: 9.99, maxRoi: 11.50, defaultRoi: 9.99 },
    { category: 'B', roiAbove20L: 9.99, roi15Lto20L: 10.15, roi10Lto15L: 10.50, roi5Lto10L: 11.50, roiAbove15L: 10.15, roiBelow10L: 11.50, minRoi: 9.99, maxRoi: 11.50, defaultRoi: 9.99 },
    { category: 'C', roiAbove20L: 10.25, roi15Lto20L: 10.50, roi10Lto15L: 11.00, roi5Lto10L: 11.50, roiAbove15L: 10.50, roiBelow10L: 11.50, minRoi: 10.25, maxRoi: 11.50, defaultRoi: 10.25 },
    { category: 'D', roiAbove20L: 10.25, roi15Lto20L: 10.50, roi10Lto15L: 11.00, roi5Lto10L: 11.50, roiAbove15L: 10.50, roiBelow10L: 11.50, minRoi: 10.25, maxRoi: 11.50, defaultRoi: 10.25 },
    { category: 'Govt', roiAbove20L: 9.99, roi15Lto20L: 10.15, roi10Lto15L: 10.50, roi5Lto10L: 11.50, roiAbove15L: 10.15, roiBelow10L: 11.50, minRoi: 9.99, maxRoi: 11.50, defaultRoi: 9.99 }
  ],
  loanCapping: [
    { tier: 'Super A', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'A', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'B', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'C', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'D', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 },
    { tier: 'Govt', minLoan: 100000, maxLoan: 7500000, bachelorCap: null, minSalary: 25000 }
  ],
  tenureRules: [
    { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'B', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' },
    { category: 'C', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years (72 Months)' },
    { category: 'D', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years (60 Months)' },
    { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years (84 Months)' }
  ],
  foirMultiplier: [
    { category: 'Super A', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplier: 27, ccObligation: 5 },
    { category: 'A', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplier: 27, ccObligation: 5 },
    { category: 'B', slab1Foir: 50, slab2Foir: 55, maxFoir: 65, multiplier: 25, ccObligation: 5 },
    { category: 'C', slab1Foir: 40, slab2Foir: 45, maxFoir: 50, multiplier: 20, ccObligation: 5 },
    { category: 'D', slab1Foir: 40, slab2Foir: 45, maxFoir: 50, multiplier: 20, ccObligation: 5 },
    { category: 'Govt', slab1Foir: 50, slab2Foir: 60, maxFoir: 70, multiplier: 27, ccObligation: 5 }
  ],
  demographics: {
    minAge: 21,
    maxAge: 60,
    retirementSalaried: 60,
    retirementGovt: 60,
    minSalary: 25000,
    minExperienceTotal: 12,
    minExperienceCurrent: 0,
    minCibilScore: 0,
    ccObligationPercent: 5,
    ccBtAllowedCount: 0,
    allowCcBt: false
  },
  companies: INITIAL_COMPANY_DATABASE
};

const getSafeCatClass = (cat) => {
  if (!cat) return 'standard';
  return String(cat).toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

const sanitizePolicyData = (raw) => {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_UNIFIED_POLICY };
  return {
    ...DEFAULT_UNIFIED_POLICY,
    ...raw,
    interestRates: Array.isArray(raw.interestRates) && raw.interestRates.length > 0 
      ? raw.interestRates.map(row => ({
          ...row,
          category: String(row.category || row.tier || 'Standard').trim(),
          tier: String(row.tier || row.category || 'Standard').trim(),
          roiAbove15L: row.roiAbove15L ?? row.minRoi ?? 9.99,
          roi10Lto15L: row.roi10Lto15L ?? row.maxRoi ?? 10.35,
          roiBelow10L: row.roiBelow10L ?? row.defaultRoi ?? 10.75,
          minRoi: row.minRoi ?? row.roiAbove15L ?? 9.99,
          maxRoi: row.maxRoi ?? row.roi10Lto15L ?? 10.35,
          defaultRoi: row.defaultRoi ?? row.roiBelow10L ?? 10.75,
          minSalary: row.minSalary ?? 25000
        }))
      : DEFAULT_UNIFIED_POLICY.interestRates,
    loanCapping: Array.isArray(raw.loanCapping) && raw.loanCapping.length > 0 
      ? raw.loanCapping.map(row => ({
          ...row,
          tier: String(row.tier || row.category || 'Standard').trim(),
          category: String(row.category || row.tier || 'Standard').trim(),
          minLoan: row.minLoan ?? 100000,
          maxLoan: row.maxLoan ?? 5000000,
          bachelorCap: row.bachelorCap ?? null
        }))
      : DEFAULT_UNIFIED_POLICY.loanCapping,
    tenureRules: Array.isArray(raw.tenureRules) && raw.tenureRules.length > 0 
      ? raw.tenureRules.map(row => ({
          ...row,
          category: String(row.category || row.tier || 'Standard').trim(),
          tier: String(row.tier || row.category || 'Standard').trim(),
          minMonths: row.minMonths ?? 12,
          maxMonths: row.maxMonths ?? 84,
          description: row.description || `Up to ${((row.maxMonths ?? 84) / 12).toFixed(1)} Years`
        }))
      : DEFAULT_UNIFIED_POLICY.tenureRules,
    foirMultiplier: Array.isArray(raw.foirMultiplier) && raw.foirMultiplier.length > 0 
      ? raw.foirMultiplier.map(row => ({
          ...row,
          category: String(row.category || row.tier || 'Standard').trim(),
          tier: String(row.tier || row.category || 'Standard').trim(),
          slab1Foir: row.slab1Foir ?? (row.maxFoir ? Math.max(40, row.maxFoir - 20) : 55),
          slab2Foir: row.slab2Foir ?? (row.maxFoir ? Math.max(50, row.maxFoir - 10) : 65),
          maxFoir: row.maxFoir ?? 75,
          multiplierBelow75k: row.multiplierBelow75k ?? (row.category === 'C' ? 21 : 20),
          multiplier75kTo125k: row.multiplier75kTo125k ?? (row.category === 'C' ? 21 : 25),
          multiplierAbove125k: row.multiplierAbove125k ?? (row.category === 'C' ? 21 : 30),
          multiplier: row.multiplier ?? 30,
          ccObligation: row.ccObligation ?? 5
        }))
      : DEFAULT_UNIFIED_POLICY.foirMultiplier,
    demographics: {
      ...DEFAULT_DEMOGRAPHIC_RULES,
      ...(raw.demographics || {})
    },
    companies: Array.isArray(raw.companies) && raw.companies.length > 0 
      ? raw.companies 
      : DEFAULT_UNIFIED_POLICY.companies
  };
};

const UnifiedBankPolicyManager = () => {
  // Location Selection State
  const [selectedState, setSelectedState] = useState('All India');
  const [selectedCity, setSelectedCity] = useState('All Cities (National Default)');

  // Institutional Banks State (stored in localStorage with auto-sync for newly updated master policies)
  const [banks, setBanks] = useState(() => {
    try {
      const stored = localStorage.getItem('laxmi_admin_12_banks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge latest master parameters from INITIAL_12_BANKS (e.g. ICICI minRate 9.99, maxLoan 1 Cr, maxTenure 72)
          const updatedList = INITIAL_12_BANKS.map(initBank => {
            const existing = parsed.find(b => b.id === initBank.id);
            if (existing) {
              return {
                ...initBank,
                enabled: existing.enabled !== undefined ? existing.enabled : initBank.enabled,
                minRate: initBank.minRate,
                maxLoan: initBank.maxLoan,
                maxTenure: initBank.maxTenure
              };
            }
            return initBank;
          });
          const initIds = new Set(INITIAL_12_BANKS.map(b => b.id));
          const customBanks = parsed.filter(b => !initIds.has(b.id));
          const finalBanks = [...updatedList, ...customBanks];
          try {
            localStorage.setItem('laxmi_admin_12_banks', JSON.stringify(finalBanks));
          } catch (e) {}
          return finalBanks;
        }
      }
      return INITIAL_12_BANKS;
    } catch {
      return INITIAL_12_BANKS;
    }
  });

  // Config Modal / View State
  const [activeConfigBank, setActiveConfigBank] = useState(null);
  const [activeConfigTab, setActiveConfigTab] = useState('rates'); // rates, capping, tenure, foir, demographics, companies
  const [saveAlert, setSaveAlert] = useState('');

  // Editable Policy State for Active Bank (Fully sanitized with demographics)
  const [policyData, setPolicyData] = useState(() => sanitizePolicyData(null));

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

  // Native Browser Back/Forward navigation between 12 Bank Cards and Bank Config Editor
  useEffect(() => {
    // Initial check if opened with a specific bank hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash.startsWith('bank-policy-')) {
      const targetBankId = initialHash.replace('bank-policy-', '');
      const foundBank = banks.find(b => b.id === targetBankId);
      if (foundBank) {
        handleOpenConfig(foundBank, false);
      }
    }

    const handlePopState = (event) => {
      const currentHash = window.location.hash.replace('#', '');
      const targetBankId = event.state?.bankId || (currentHash.startsWith('bank-policy-') ? currentHash.replace('bank-policy-', '') : null);

      if (targetBankId) {
        const foundBank = banks.find(b => b.id === targetBankId);
        if (foundBank) {
          handleOpenConfig(foundBank, false);
          return;
        }
      }

      // No bank ID found: user clicked browser Back (<-) to return to 12 Bank Cards
      setActiveConfigBank(null);
      setSaveAlert('');
      setIsReplaceModalOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [banks]);

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
  const handleOpenConfig = (bank, pushHistory = true) => {
    setActiveConfigBank(bank);
    setActiveConfigTab('rates');
    setSaveAlert('');

    if (pushHistory) {
      window.history.pushState(
        { tab: 'bank-policy', bankId: bank.id },
        '',
        `#bank-policy-${bank.id}`
      );
    }

    // Load any existing custom config from localStorage or cloud-synced service
    const locationKey = `${selectedState}-${selectedCity}`;
    const stored = localStorage.getItem(`policy_config_${bank.id}_${locationKey}`) || localStorage.getItem(`policy_config_${bank.id}`);

    // Direct Master Policy from Excel for ALL institutions (registered in bankPolicyRegistry.js)
    const masterBase = getExcelPolicyForBank(bank.id, bank.name);
    if (masterBase) {
      let merged = { ...masterBase };
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const isIciciBank = bank.id === 'icici' || bank.name?.toLowerCase().includes('icici');
          const hasMatchingCategories = isIciciBank
            ? Array.isArray(parsed.interestRates) && parsed.interestRates.some(r => r.category === 'Super Prime' || r.category === 'Army Profile')
            : true;
          const isLntBank = bank.id === 'lnt' || bank.name?.toLowerCase().includes('lnt') || bank.name?.toLowerCase().includes('l&t');
          const isFreshLnt = isLntBank && Array.isArray(parsed.interestRates) && parsed.interestRates.some(r => r.specialRate === 10.99);

          const isValidRates = Array.isArray(parsed.interestRates) && parsed.interestRates.length > 0 && parsed.interestRates.every(r => r && typeof r === 'object');
          const isValidCapping = !parsed.loanCapping || (Array.isArray(parsed.loanCapping) && parsed.loanCapping.every(r => r && typeof r === 'object'));

          if (hasMatchingCategories && (!isLntBank || isFreshLnt) && isValidRates && isValidCapping) {
            merged = { ...merged, ...parsed };
          } else {
            // Stale cache contains old categories or corrupted data - purge it so user sees pure Bank Policy Excel
            try {
              localStorage.removeItem(`policy_config_${bank.id}_${locationKey}`);
              localStorage.removeItem(`policy_config_${bank.id}`);
            } catch (err) {}
          }
        } catch (e) {
          try {
            localStorage.removeItem(`policy_config_${bank.id}_${locationKey}`);
            localStorage.removeItem(`policy_config_${bank.id}`);
          } catch (err) {}
        }
      }
      setPolicyData(sanitizePolicyData(merged));
      return;
    }

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPolicyData(sanitizePolicyData(parsed));
        return;
      } catch (e) {
        console.error('Error parsing stored policy:', e);
      }
    }

    // Cloud Firestore Fallback: check bankConfigService (synced from Firestore)
    const cloudPolicy = getBankConfig(bank.name, 'unifiedPolicy', locationKey) || getBankConfig(bank.name, 'unifiedPolicy');
    if (cloudPolicy) {
      setPolicyData(sanitizePolicyData(cloudPolicy));
    } else {
      setPolicyData(sanitizePolicyData({
        interestRates: [
          { category: 'Super A', roiAbove15L: bank.minRate || 10.25, roi10Lto15L: (bank.minRate || 10.25) + 0.25, roiBelow10L: (bank.minRate || 10.25) + 0.50, minRoi: bank.minRate || 10.25, maxRoi: (bank.minRate || 10.25) + 0.25, defaultRoi: (bank.minRate || 10.25) + 0.50, minSalary: 100000 },
          { category: 'A', roiAbove15L: bank.minRate || 10.50, roi10Lto15L: (bank.minRate || 10.50) + 0.25, roiBelow10L: (bank.minRate || 10.50) + 0.75, minRoi: bank.minRate || 10.50, maxRoi: (bank.minRate || 10.50) + 0.25, defaultRoi: (bank.minRate || 10.50) + 0.75, minSalary: 50000 },
          { category: 'B', roiAbove15L: (bank.minRate || 10.50) + 0.5, roi10Lto15L: (bank.minRate || 10.50) + 0.75, roiBelow10L: (bank.minRate || 10.50) + 1.25, minRoi: (bank.minRate || 10.50) + 0.5, maxRoi: (bank.minRate || 10.50) + 0.75, defaultRoi: (bank.minRate || 10.50) + 1.25, minSalary: 35000 },
          { category: 'C', roiAbove15L: (bank.minRate || 10.50) + 1.0, roi10Lto15L: (bank.minRate || 10.50) + 1.5, roiBelow10L: (bank.minRate || 10.50) + 2.0, minRoi: (bank.minRate || 10.50) + 1.0, maxRoi: (bank.minRate || 10.50) + 1.5, defaultRoi: (bank.minRate || 10.50) + 2.0, minSalary: 25000 },
          { category: 'Govt', roiAbove15L: bank.minRate || 10.25, roi10Lto15L: (bank.minRate || 10.25) + 0.25, roiBelow10L: (bank.minRate || 10.25) + 0.50, minRoi: bank.minRate || 10.25, maxRoi: (bank.minRate || 10.25) + 0.25, defaultRoi: (bank.minRate || 10.25) + 0.50, minSalary: 20000 }
        ]
      }));
    }
  };

  // Save All Policy Changes
  const handleSavePolicy = () => {
    if (!activeConfigBank) return;
    const locationKey = `${selectedState}-${selectedCity}`;
    try {
      localStorage.setItem(`policy_config_${activeConfigBank.id}_${locationKey}`, JSON.stringify(policyData));
      localStorage.setItem(`policy_config_${activeConfigBank.id}`, JSON.stringify(policyData));
      
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
              roiAbove15L: 10.25 + idx * 0.5,
              roi10Lto15L: 10.50 + idx * 0.5,
              roiBelow10L: 11.00 + idx * 0.5,
              minRoi: 10.25 + idx * 0.5,
              maxRoi: 10.50 + idx * 0.5,
              defaultRoi: 11.00 + idx * 0.5,
              minSalary: Math.max(20000, 100000 - idx * 20000)
            };
          return {
            category: catName,
            roiAbove15L: baseline.roiAbove15L ?? baseline.minRoi ?? (10.25 + idx * 0.5),
            roi10Lto15L: baseline.roi10Lto15L ?? baseline.maxRoi ?? (10.50 + idx * 0.5),
            roiBelow10L: baseline.roiBelow10L ?? baseline.defaultRoi ?? (11.00 + idx * 0.5),
            minRoi: baseline.roiAbove15L ?? baseline.minRoi ?? (10.25 + idx * 0.5),
            maxRoi: baseline.roi10Lto15L ?? baseline.maxRoi ?? (10.50 + idx * 0.5),
            defaultRoi: baseline.roiBelow10L ?? baseline.defaultRoi ?? (11.00 + idx * 0.5),
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
              slab1Foir: Math.max(40, 55 - idx * 5),
              slab2Foir: Math.max(50, 65 - idx * 5),
              maxFoir: Math.max(55, 75 - idx * 5),
              multiplier: Math.max(12, 36 - idx * 4),
              ccObligation: 4
            };
          return {
            category: catName,
            slab1Foir: baseline.slab1Foir ?? 55,
            slab2Foir: baseline.slab2Foir ?? 65,
            maxFoir: baseline.maxFoir ?? 75,
            multiplierBelow75k: baseline.multiplierBelow75k ?? (catName === 'C' ? 21 : 20),
            multiplier75kTo125k: baseline.multiplier75kTo125k ?? (catName === 'C' ? 21 : 25),
            multiplierAbove125k: baseline.multiplierAbove125k ?? (catName === 'C' ? 21 : 30),
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
          {activeConfigTab === 'rates' && (() => {
            const bankId = activeConfigBank?.id || '';
            const isHdfc = bankId === 'hdfc' || activeConfigBank?.name?.toLowerCase().includes('hdfc');
            const isIndusind = bankId === 'indusind' || activeConfigBank?.name?.toLowerCase().includes('indusind');
            const isAxis = bankId === 'axis-bank' || (activeConfigBank?.name?.toLowerCase().includes('axis') && !bankId.includes('fin'));
            const isKotak = bankId === 'kotak' || activeConfigBank?.name?.toLowerCase().includes('kotak');
            const isTata = bankId === 'tata' || activeConfigBank?.name?.toLowerCase().includes('tata');
            const isBajaj = bankId === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj');
            const isBandhan = bankId === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan');
            const isChola = bankId === 'cholamandalam' || activeConfigBank?.name?.toLowerCase().includes('chola');
            const isAxisFin = bankId === 'axis-fin' || activeConfigBank?.name?.toLowerCase().includes('axis fin');
            const isLnt = bankId === 'lnt' || activeConfigBank?.name?.toLowerCase().includes('l&t') || activeConfigBank?.name?.toLowerCase().includes('lnt');
            const isPoonawala = bankId === 'poonawala' || activeConfigBank?.name?.toLowerCase().includes('poonawala');
            const isIcici = bankId === 'icici' || activeConfigBank?.name?.toLowerCase().includes('icici');
            const isAbfl = bankId === 'abfl' || activeConfigBank?.name?.toLowerCase().includes('birla') || activeConfigBank?.name?.toLowerCase().includes('abfl');
            const isSmfg = bankId === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg');

            const rawRates = policyData?.interestRates || [];
            // Banks that don't have Cat D in ROI: HDFC, IndusInd, Axis, Bandhan, Tata
            const displayRates = (isHdfc || isIndusind || isAxis || isBandhan || isTata)
              ? rawRates.filter(r => r.category !== 'D')
              : rawRates;

            const updateRate = (cat, field, val) => {
              const updated = [...policyData.interestRates];
              const realIdx = updated.findIndex(r => r.category === cat);
              if (realIdx >= 0) {
                updated[realIdx][field] = val;
                if (field === 'roiAbove15L' || field === 'roiAbove20L' || field === 'roi50L' || field === 'roiAbove35L' || field === 'roiAbove10L') {
                  updated[realIdx].minRoi = val;
                }
                if (field === 'roiBelow10L' || field === 'roiBelow20L' || field === 'roiBelow5L') {
                  updated[realIdx].defaultRoi = val;
                }
                setPolicyData({ ...policyData, interestRates: updated });
              }
            };

            return (
              <div className="tabular-policy-card">
                <div className="table-card-header">
                  <div>
                    <h3>Interest Rate Structures & Slabs (By Loan Amount)</h3>
                    {isKotak && (
                      <p>Kotak Master Policy Slabs: <strong>≥ ₹15 Lakh</strong> (9.95%), <strong>₹10L – ₹15L</strong> (10.50%), and <strong>&lt; ₹10 Lakh</strong> (11.00% – 12.00%).</p>
                    )}
                    {isTata && (
                      <p>Tata Capital Master Policy Slabs: <strong>₹50 Lakh Special</strong> (10.99%), <strong>₹20L – ₹50L</strong> (12.00%), and <strong>&lt; ₹20 Lakh</strong> (14.00%).</p>
                    )}
                    {isBajaj && (
                      <p>Bajaj Finance Master Policy Slabs: <strong>≥ ₹10 Lakh</strong> (10.00% Cat A/B), <strong>₹1L – ₹12L Sal Lite</strong> (16.00%), and <strong>Default ROI</strong> (14.00%).</p>
                    )}
                    {isBandhan && (
                      <p>Bandhan Bank Master Policy: <strong>Flat 10.50% p.a.</strong> across all loan brackets up to ₹25 Lakhs sanction limit.</p>
                    )}
                    {isChola && (
                      <p>Cholamandalam Master Policy Slabs: <strong>≥ ₹10L (₹75k+ Sal)</strong> (13.75%), <strong>₹7.5L – ₹10L (₹50k+ Sal)</strong> (14.50%), <strong>₹5L+ Cases</strong> (15.00%), and <strong>&lt; ₹5L Cases</strong> (16.00%).</p>
                    )}
                    {isAxisFin && (
                      <p>Axis Finance Master Policy Slabs: <strong>₹5L – ₹25L Loan Cases</strong> (13.50% – 16.00%), and <strong>Credit Card BT / App BT</strong> (18.00%).</p>
                    )}
                    {isLnt && (
                      <p>L&T Finance Master Policy Slabs: <strong>₹20L – ₹30L</strong> (11.50% – 12.50%), <strong>₹10L – ₹20L</strong> (14.00%), and <strong>&lt; ₹10L</strong> (13.00% – 15.00%). Special Rate: <strong>10.99%</strong> for Super A & A with Owned House, ₹1.75L+ Salary & 775+ CIBIL.</p>
                    )}
                    {isPoonawala && (
                      <p>Poonawala Master Policy Slabs: <strong>≥ ₹35 Lakh</strong> (11.99%), <strong>₹20L – ₹35L</strong> (12.25%), and <strong>&lt; ₹20 Lakh</strong> (12.50% – 14.25%).</p>
                    )}
                    {isIcici && (
                      <p>ICICI Bank Master Policy (from Excel): <strong>CIBIL 775+ & ₹75k+ Sal (≥₹20L)</strong> (9.99%), <strong>CIBIL 750–774 & ₹75k+ Sal</strong> (10.30%), and <strong>Standard ROI</strong> (12.00% to 9.99% / Open Market: 11.00% to 12.80%). Min Ticket in Rajasthan: <strong>₹6.10 Lakhs</strong>.</p>
                    )}
                    {isAbfl && (
                      <p>ABFL Master Policy Slabs: <strong>≥ ₹15 Lakh</strong> (11.50% – 13.00%), and <strong>&lt; ₹15 Lakh</strong> (12.50% – 14.00%).</p>
                    )}
                    {isSmfg && (
                      <p>SMFG India Credit Slabs: <strong>Net Sal &gt; ₹1 Lakh</strong> (17.00%), <strong>Net Sal ₹50k – ₹1L</strong> (18.00%), and <strong>Net Sal &lt; ₹50k</strong> (21.00% – 28.00%).</p>
                    )}
                    {isHdfc && (
                      <p>HDFC Master Policy Slabs: <strong>20 LAKH +</strong> (9.99%), <strong>15 LAKH+</strong> (10.15%), <strong>10-15 LAKH</strong> (10.50%), and <strong>5-10 LAKH</strong> (11.50%).</p>
                    )}
                    {isIndusind && (
                      <p>IndusInd Master Policy Slabs: <strong>10L ABOVE CASES (Insurance Mandate)</strong> (9.99%) and <strong>5L ABOVE CASES</strong> (12.00%).</p>
                    )}
                    {isAxis && (
                      <p>Axis Bank Master Policy Slabs: <strong>10L ABOVE CASES</strong> (Super A/A: 10.35%, B: 10.45%, C: 10.75%, Govt: 10.45%).</p>
                    )}
                    {!isKotak && !isTata && !isBajaj && !isBandhan && !isChola && !isAxisFin && !isLnt && !isPoonawala && !isIcici && !isAbfl && !isSmfg && !isHdfc && !isIndusind && !isAxis && (
                      <p>Define minimum ROI strictly according to employer category and loan amount brackets.</p>
                    )}
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="policy-table">
                    <thead>
                      <tr>
                        <th>Category Tier</th>
                        {isHdfc && (
                          <>
                            <th>20 LAKH + (% p.a.)</th>
                            <th>15 LAKH+ (% p.a.)</th>
                            <th>10-15 LAKH (% p.a.)</th>
                            <th>5-10 LAKH (% p.a.)</th>
                          </>
                        )}
                        {isIndusind && (
                          <>
                            <th>10L Above Cases (Insurance Mandate) (% p.a.)</th>
                            <th>5L Above Cases (% p.a.)</th>
                          </>
                        )}
                        {isAxis && (
                          <>
                            <th>15L Above Cases (% p.a.)</th>
                            <th>10L Above Cases (% p.a.)</th>
                          </>
                        )}
                        {isKotak && (
                          <>
                            <th>≥ ₹15 Lakh Loan ROI (% p.a.)</th>
                            <th>₹10L – ₹15L Loan ROI (% p.a.)</th>
                            <th>&lt; ₹10 Lakh Loan ROI (% p.a.)</th>
                          </>
                        )}
                        {isTata && (
                          <>
                            <th>₹50 Lakh Special Slabs (% p.a.)</th>
                            <th>₹20L – ₹50L Cases (% p.a.)</th>
                            <th>&lt; ₹20 Lakh Cases (% p.a.)</th>
                          </>
                        )}
                        {isBajaj && (
                          <>
                            <th>≥ ₹10 Lakh ROI (% p.a.)</th>
                            <th>₹1L – ₹12L Sal Lite (% p.a.)</th>
                            <th>Default Standard ROI (% p.a.)</th>
                          </>
                        )}
                        {isBandhan && (
                          <>
                            <th>All Loan Slabs (Flat ROI % p.a.)</th>
                            <th>Min Salary Requirement</th>
                            <th>Max Sanction Limit</th>
                          </>
                        )}
                        {isChola && (
                          <>
                            <th>≥ ₹10L & 75K+ Sal (% p.a.)</th>
                            <th>₹7.5L–₹10L & 50K+ Sal (% p.a.)</th>
                            <th>₹5L+ Cases (% p.a.)</th>
                            <th>&lt; ₹5L Cases (% p.a.)</th>
                          </>
                        )}
                        {isAxisFin && (
                          <>
                            <th>₹5L – ₹25L Loan Cases (% p.a.)</th>
                            <th>Credit Card BT / App BT (% p.a.)</th>
                          </>
                        )}
                        {isLnt && (
                          <>
                            <th>₹20L – ₹30L Slabs (% p.a.)</th>
                            <th>₹10L – ₹20L Slabs (% p.a.)</th>
                            <th>₹1L – ₹10L Slabs (% p.a.)</th>
                            <th style={{ color: '#38bdf8' }}>Special Rate (Owned + ₹1.75L+ Sal + 775 CIBIL)</th>
                            <th>Default ROI (% p.a.)</th>
                          </>
                        )}
                        {isPoonawala && (
                          <>
                            <th>≥ ₹35 Lakh ROI (% p.a.)</th>
                            <th>₹20L to &lt; ₹35L ROI (% p.a.)</th>
                            <th>&lt; ₹20 Lakh ROI (% p.a.)</th>
                          </>
                        )}
                        {isIcici && (
                          <>
                            <th>CIBIL & Salary Criteria (Excel)</th>
                            <th>CIBIL 775+ & ₹75k+ (≥20L) (%)</th>
                            <th>CIBIL 750–774 & ₹75k+ (≥20L) (%)</th>
                            <th>Standard ROI (Min – Max)</th>
                            <th>Default Applied ROI</th>
                          </>
                        )}
                        {isAbfl && (
                          <>
                            <th>≥ ₹15 Lakh Loan ROI (% p.a.)</th>
                            <th>&lt; ₹15 Lakh Loan ROI (% p.a.)</th>
                          </>
                        )}
                        {isSmfg && (
                          <>
                            <th>Net Sal &gt; ₹1 Lakh (% p.a.)</th>
                            <th>Net Sal ₹50k – ₹1L (% p.a.)</th>
                            <th>Net Sal &lt; ₹50k (% p.a.)</th>
                          </>
                        )}
                        {!isHdfc && !isIndusind && !isAxis && !isKotak && !isTata && !isBajaj && !isBandhan && !isChola && !isAxisFin && !isLnt && !isPoonawala && !isIcici && !isAbfl && !isSmfg && (
                          <>
                            <th>≥ ₹15 Lakh Loan ROI (% p.a.)</th>
                            <th>₹10L to &lt; ₹15L Loan ROI (% p.a.)</th>
                            <th>&lt; ₹10 Lakh Loan ROI (% p.a.)</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {displayRates.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className={`cat-pill cat-${getSafeCatClass(row.category || row.tier)}`}>
                              {row.category || row.tier || 'Standard'}
                            </span>
                          </td>

                          {isHdfc && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove20L ?? (row.category === 'C' ? 10.25 : 9.99)}
                                    onChange={(e) => updateRate(row.category, 'roiAbove20L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi15Lto20L ?? (row.category === 'C' ? 10.50 : 10.15)}
                                    onChange={(e) => updateRate(row.category, 'roi15Lto20L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi10Lto15L ?? (row.category === 'C' ? 11.00 : 10.50)}
                                    onChange={(e) => updateRate(row.category, 'roi10Lto15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi5Lto10L ?? 11.50}
                                    onChange={(e) => updateRate(row.category, 'roi5Lto10L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isIndusind && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove15L ?? (row.category === 'C' ? 10.60 : 9.99)}
                                    onChange={(e) => updateRate(row.category, 'roiAbove15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow10L ?? (row.category === 'C' ? 13.00 : 12.00)}
                                    onChange={(e) => updateRate(row.category, 'roiBelow10L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isAxis && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove15L ?? (row.category === 'C' ? 10.59 : (row.category === 'B' || row.category === 'Govt' ? 10.39 : 9.99))}
                                    onChange={(e) => updateRate(row.category, 'roiAbove15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi10Lto15L ?? (row.category === 'C' ? 10.75 : (row.category === 'B' || row.category === 'Govt' ? 10.45 : 10.35))}
                                    onChange={(e) => updateRate(row.category, 'roi10Lto15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isKotak && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove15L ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 9.95 : (row.category === 'B' ? 10.05 : 10.35))}
                                    onChange={(e) => updateRate(row.category, 'roiAbove15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi10Lto15L ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 10.50 : 10.75)}
                                    onChange={(e) => updateRate(row.category, 'roi10Lto15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow10L ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 11.00 : 11.25)}
                                    onChange={(e) => updateRate(row.category, 'roiBelow10L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isTata && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi50L ?? 10.99}
                                    onChange={(e) => updateRate(row.category, 'roi50L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi20Lto50L ?? (row.category === 'Cat 3' || row.category === 'C' ? 12.50 : 12.00)}
                                    onChange={(e) => updateRate(row.category, 'roi20Lto50L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow20L ?? (row.category === 'Cat 3' || row.category === 'C' ? 14.50 : 14.00)}
                                    onChange={(e) => updateRate(row.category, 'roiBelow20L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isBajaj && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove10L ?? (row.category === 'C' ? 11.00 : 10.00)}
                                    onChange={(e) => updateRate(row.category, 'roiAbove10L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiSalLite ?? 16.00}
                                    onChange={(e) => updateRate(row.category, 'roiSalLite', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.defaultRoi ?? 14.00}
                                    onChange={(e) => updateRate(row.category, 'defaultRoi', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isBandhan && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.defaultRoi ?? 10.50}
                                    onChange={(e) => updateRate(row.category, 'defaultRoi', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <span className="cat-pill" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                                  ₹{row.minSalary ? row.minSalary.toLocaleString() : '25,000'}
                                </span>
                              </td>
                              <td>
                                <span className="tag-lakhs">Up to ₹25.0 Lakhs</span>
                              </td>
                            </>
                          )}

                          {isChola && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove10L ?? 13.75}
                                    onChange={(e) => updateRate(row.category, 'roiAbove10L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi7_5Lto10L ?? 14.50}
                                    onChange={(e) => updateRate(row.category, 'roi7_5Lto10L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi5Lto7_5L ?? 15.00}
                                    onChange={(e) => updateRate(row.category, 'roi5Lto7_5L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow5L ?? (row.category === 'C' || row.category === 'D' ? 17.50 : 16.00)}
                                    onChange={(e) => updateRate(row.category, 'roiBelow5L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isAxisFin && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi5Lto25L ?? (row.category === 'Super A' || row.category === 'Govt' ? 13.50 : 14.50)}
                                    onChange={(e) => updateRate(row.category, 'roi5Lto25L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiCcBt ?? 18.00}
                                    onChange={(e) => updateRate(row.category, 'roiCcBt', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isLnt && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi20Lto30L ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'B' || row.category === 'Govt' ? 11.50 : 13.50)}
                                    onChange={(e) => updateRate(row.category, 'roi20Lto30L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi10Lto20L ?? 14.00}
                                    onChange={(e) => updateRate(row.category, 'roi10Lto20L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi1Lto10L ?? row.roiBelow10L ?? (row.category === 'Super A' || row.category === 'A' ? 13.00 : (row.category === 'B' || row.category === 'Govt' ? 13.50 : (row.category === 'C' ? 14.00 : 15.00)))}
                                    onChange={(e) => {
                                      updateRate(row.category, 'roi1Lto10L', Number(e.target.value));
                                      updateRate(row.category, 'roiBelow10L', Number(e.target.value));
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                {(row.category === 'Super A' || row.category === 'A') ? (
                                  <div className="table-input-cell highlight" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                                    <input 
                                      type="number" step="0.01"
                                      value={row.specialRate ?? 10.99}
                                      onChange={(e) => updateRate(row.category, 'specialRate', Number(e.target.value))}
                                      style={{ color: '#34d399', fontWeight: 800 }}
                                    />
                                    <span style={{ color: '#34d399' }}>% (10.99%)</span>
                                  </div>
                                ) : (
                                  <span className="cat-pill" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.2)', fontSize: '0.78rem' }}>
                                    Standard Matrix
                                  </span>
                                )}
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.defaultRoi ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 12.50 : (row.category === 'B' ? 13.00 : (row.category === 'C' ? 14.00 : 14.50)))}
                                    onChange={(e) => updateRate(row.category, 'defaultRoi', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isPoonawala && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove35L ?? 11.99}
                                    onChange={(e) => updateRate(row.category, 'roiAbove35L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi20Lto35L ?? 12.25}
                                    onChange={(e) => updateRate(row.category, 'roi20Lto35L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow20L ?? (row.category === 'Super A' || row.category === 'A' ? 12.50 : 13.50)}
                                    onChange={(e) => updateRate(row.category, 'roiBelow20L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isIcici && (
                            <>
                              <td>
                                <span className="cat-pill" style={{ background: 'rgba(237, 28, 36, 0.12)', color: '#fca5a5', border: '1px solid rgba(237, 28, 36, 0.3)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                  {row.criteria || (row.category === 'Open Market' ? 'CIBIL 750 + Sal 50k+' : (row.category === 'Govt' ? 'CIBIL 725-775 + Sal 25k+' : (row.category === 'NRI Case' ? 'CIBIL 725+ + Sal 2L+' : 'CIBIL 725-775 + Sal 30k+')))}
                                </span>
                              </td>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiCibil775 ?? 9.99}
                                    onChange={(e) => updateRate(row.category, 'roiCibil775', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiCibil750 ?? 10.30}
                                    onChange={(e) => updateRate(row.category, 'roiCibil750', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <div className="table-input-cell" style={{ minWidth: '70px' }}>
                                    <input 
                                      type="number" step="0.01"
                                      value={row.minRoi ?? (row.category === 'Open Market' ? 11.00 : 9.99)}
                                      onChange={(e) => updateRate(row.category, 'minRoi', Number(e.target.value))}
                                    />
                                    <span>%</span>
                                  </div>
                                  <span style={{ color: '#94a3b8' }}>–</span>
                                  <div className="table-input-cell" style={{ minWidth: '70px' }}>
                                    <input 
                                      type="number" step="0.01"
                                      value={row.maxRoi ?? (row.category === 'Open Market' ? 12.80 : 12.00)}
                                      onChange={(e) => updateRate(row.category, 'maxRoi', Number(e.target.value))}
                                    />
                                    <span>%</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.defaultRoi ?? (row.category === 'Open Market' ? 11.50 : 9.99)}
                                    onChange={(e) => updateRate(row.category, 'defaultRoi', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isAbfl && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove15L ?? (row.category === 'Super A' || row.category === 'A' ? 11.50 : 12.00)}
                                    onChange={(e) => updateRate(row.category, 'roiAbove15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow15L ?? (row.category === 'Super A' || row.category === 'A' ? 12.50 : 13.00)}
                                    onChange={(e) => updateRate(row.category, 'roiBelow15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isSmfg && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiNetAbove1L ?? 17.00}
                                    onChange={(e) => updateRate(row.category, 'roiNetAbove1L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiNet50kTo1L ?? 18.00}
                                    onChange={(e) => updateRate(row.category, 'roiNet50kTo1L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiNetBelow50k ?? (row.category === 'Super A' || row.category === 'A' ? 21.00 : 24.00)}
                                    onChange={(e) => updateRate(row.category, 'roiNetBelow50k', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {!isHdfc && !isIndusind && !isAxis && !isKotak && !isTata && !isBajaj && !isBandhan && !isChola && !isAxisFin && !isLnt && !isPoonawala && !isIcici && !isAbfl && !isSmfg && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove15L ?? row.minRoi ?? ''}
                                    onChange={(e) => updateRate(row.category, 'roiAbove15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi10Lto15L ?? row.maxRoi ?? ''}
                                    onChange={(e) => updateRate(row.category, 'roi10Lto15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow10L ?? row.defaultRoi ?? ''}
                                    onChange={(e) => updateRate(row.category, 'roiBelow10L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* TAB 2: CAPITAL / LOAN CAPPING TABULAR VIEW */}
          {activeConfigTab === 'capping' && (
            <div className="tabular-policy-card">
              <div className="table-card-header">
                <div>
                  <h3>Capital & Sanction Capping Matrix</h3>
                  <p>Specify minimum and maximum loan limits, along with bachelor residence restrictions.</p>
                </div>
              </div>

              {(activeConfigBank?.id === 'icici' || activeConfigBank?.name?.toLowerCase().includes('icici')) && (
                <div style={{
                  background: 'rgba(237, 28, 36, 0.08)',
                  border: '1.5px solid rgba(237, 28, 36, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#fca5a5',
                  fontSize: '0.88rem'
                }}>
                  <AlertTriangle size={18} />
                  <span><strong>ICICI Bank Master Policy (from Excel):</strong> In Rajasthan, minimum loan amount is strictly <strong>₹6.10 Lakhs</strong> across all domestic categories (`IN RAJASTHAN 6.10 LAC`). Standard minimum ticket in other states is ₹1 Lakh. NRI Cases require minimum <strong>₹6 Lakhs</strong>. Maximum loan is <strong>₹1 Crore</strong> (Open Market: ₹15 Lakhs, Army & NRI: ₹10 Lakhs).</span>
                </div>
              )}

              {(activeConfigBank?.id === 'lnt' || activeConfigBank?.name?.toLowerCase().includes('l&t') || activeConfigBank?.name?.toLowerCase().includes('lnt')) && (
                <div style={{
                  background: 'rgba(0, 79, 158, 0.08)',
                  border: '1.5px solid rgba(0, 79, 158, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#93c5fd',
                  fontSize: '0.88rem'
                }}>
                  <AlertTriangle size={18} />
                  <span><strong>L&T Finance Policy (from Bank Policy Excel: BANKS POLICYS.xlsx):</strong> Maximum loan amount is <strong>₹30 Lakhs</strong> across all tiers (Min: ₹1 Lakh). <strong>Category D Rented Limit:</strong> If residing in rented accommodation, Category D is strictly capped at <strong>₹20 Lakhs</strong> (`30LAC/ RENTED -20LAC`).</span>
                </div>
              )}

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
                    {(policyData?.loanCapping || []).map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${getSafeCatClass(row.tier || row.category)}`}>
                            {row.tier || row.category || 'Standard'}
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
                          {(activeConfigBank?.id === 'au-bank' || activeConfigBank?.name?.toLowerCase().includes('au ')) ? (
                            <div className="table-input-cell">
                              <span>₹</span>
                              <input 
                                type="number"
                                value={row.bachelorCap ?? 500000}
                                placeholder="₹5,00,000"
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : Number(e.target.value);
                                  const updated = [...policyData.loanCapping];
                                  updated[idx].bachelorCap = val;
                                  setPolicyData({ ...policyData, loanCapping: updated });
                                }}
                              />
                            </div>
                          ) : (
                            <span className="cat-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.78rem' }}>
                              No Restriction
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="tag-lakhs">
                            Up to ₹{(row.maxLoan / 100000).toFixed(1)} Lakhs
                            {row.rentedCap ? ` (Rented: ₹${(row.rentedCap / 100000).toFixed(0)}L)` : ''}
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

              {activeConfigBank?.id === 'indusind' && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1.5px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#f87171',
                  fontSize: '0.88rem'
                }}>
                  <AlertTriangle size={18} />
                  <span><strong>IndusInd Master Policy (from Excel):</strong> CIBIL -1 H TO 48 TENURE — New-to-credit applicants with CIBIL score -1 are strictly capped to <strong>48 Months (4 Years)</strong>. Standard maximum tenure is <strong>84 Months (7 Years)</strong>.</span>
                </div>
              )}

              {activeConfigBank?.id === 'bandhan' && (
                <div style={{
                  background: 'rgba(220, 0, 40, 0.08)',
                  border: '1.5px solid rgba(220, 0, 40, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#f87171',
                  fontSize: '0.88rem'
                }}>
                  <CheckCircle2 size={18} />
                  <span><strong>Bandhan Bank Master Policy (from Excel):</strong> Strictly <strong>60 Months (5 Years)</strong> flat tenure across all employment categories. Maximum sanction limit is <strong>₹25 Lakhs</strong>.</span>
                </div>
              )}

              {(activeConfigBank?.id === 'lnt' || activeConfigBank?.name?.toLowerCase().includes('l&t') || activeConfigBank?.name?.toLowerCase().includes('lnt')) && (
                <div style={{
                  background: 'rgba(0, 79, 158, 0.08)',
                  border: '1.5px solid rgba(0, 79, 158, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#93c5fd',
                  fontSize: '0.88rem'
                }}>
                  <CheckCircle2 size={18} />
                  <span><strong>L&T Finance Policy (from Bank Policy Excel: BANKS POLICYS.xlsx):</strong> Repayment tenure is flat <strong>12 to 72 Months (Up to 6 Years)</strong> across all categories (Super A, A, B, C, D, and Govt).</span>
                </div>
              )}

              {activeConfigBank?.id === 'kotak' && (
                <div style={{
                  background: 'rgba(237, 28, 36, 0.08)',
                  border: '1.5px solid rgba(237, 28, 36, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#f87171',
                  fontSize: '0.88rem'
                }}>
                  <CheckCircle2 size={18} />
                  <span><strong>Kotak Master Policy (from Excel):</strong> Up to <strong>72 Months (6 Years)</strong> for Super A, A, B, C & Govt. Category D is capped to <strong>60 Months (5 Years)</strong>.</span>
                </div>
              )}

              {activeConfigBank?.id === 'bajaj' && (
                <div style={{
                  background: 'rgba(0, 114, 187, 0.08)',
                  border: '1.5px solid rgba(0, 114, 187, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#38bdf8',
                  fontSize: '0.88rem'
                }}>
                  <CheckCircle2 size={18} />
                  <span><strong>Bajaj Finance Master Policy (from Excel):</strong> Up to <strong>96 Months (8 Years)</strong> standard tenure. High-income applicants (Net salary ≥ ₹1 Lakh) qualify for extended <strong>108 Months (9 Years)</strong> tenure.</span>
                </div>
              )}

              {activeConfigBank?.id === 'au-bank' && (
                <div style={{
                  background: 'rgba(111, 44, 145, 0.08)',
                  border: '1.5px solid rgba(111, 44, 145, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#c084fc',
                  fontSize: '0.88rem'
                }}>
                  <AlertTriangle size={18} />
                  <span><strong>AU Bank Master Policy (from Excel):</strong> Maximum tenure is <strong>60 Months (5 Years)</strong>. NTC applicants (CIBIL score -1) require minimum ₹30,000 salary and are capped to <strong>₹3 Lakhs</strong>.</span>
                </div>
              )}

              {activeConfigBank?.id === 'finnable' && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1.5px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#34d399',
                  fontSize: '0.88rem'
                }}>
                  <AlertTriangle size={18} />
                  <span><strong>Finnable Master Policy (from Excel):</strong> Standard tenure up to <strong>60 Months</strong>. CIBIL -1 (NTC) cases are capped to <strong>36 Months</strong> and ₹4 Lakhs maximum sanction.</span>
                </div>
              )}

              {(activeConfigBank?.id === 'icici' || activeConfigBank?.name?.toLowerCase().includes('icici')) && (
                <div style={{
                  background: 'rgba(237, 28, 36, 0.08)',
                  border: '1.5px solid rgba(237, 28, 36, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#fca5a5',
                  fontSize: '0.88rem'
                }}>
                  <CheckCircle2 size={18} />
                  <span><strong>ICICI Bank Master Policy (from Excel):</strong> Permitted tenure is up to <strong>72 Months (6 Years)</strong> flat across all categories (`TENURE UPTO 6 YEARS`). Minimum tenure is <strong>12 Months</strong>. Maximum age at loan time is <strong>60 Years</strong> (Pensioner: <strong>65 Years</strong>).</span>
                </div>
              )}

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
                    {(policyData?.tenureRules || []).map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${getSafeCatClass(row.category || row.tier)}`}>
                            {row.category || row.tier || 'Standard'}
                          </span>
                        </td>
                        <td>
                          <div className="table-input-cell">
                            <input 
                              type="number"
                              value={row.minMonths}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...(policyData?.tenureRules || [])];
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
                                const updated = [...(policyData?.tenureRules || [])];
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
                          {activeConfigBank?.id === 'indusind' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="cat-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                CIBIL -1 H TO 48 TENURE
                              </span>
                              <span className="text-muted-sm">Up to 84M</span>
                            </div>
                          ) : (
                            <span className="text-muted-sm">{row.description}</span>
                          )}
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
                  <p>Configure permitted FOIR percentages across net monthly salary slabs and income multiplier limits.</p>
                </div>
              </div>

              {activeConfigBank?.id === 'indusind' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
                  border: '1.5px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>IndusInd Bank Master Policy Rules (from Excel)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 FOIR Salary Slabs (Cat A, B, Govt):</strong>
                      <div style={{ marginTop: '5px' }}>• ₹20K – ₹35K Salary: <strong>50% FOIR</strong></div>
                      <div style={{ marginTop: '3px' }}>• ₹35K – ₹50K Salary: <strong>60% FOIR</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• <strong>₹50K to ₹80K+ (Owned House)</strong>: <strong>70% FOIR</strong></div>
                      <div style={{ marginTop: '3px', color: '#fde047' }}>• <strong>₹50K to ₹80K+ (Rented House)</strong>: <strong>65% FOIR</strong></div>
                      <div style={{ marginTop: '3px', color: '#f472b6' }}>• <strong>Customer HL / LAP Running</strong>: <strong>Up to 75% FOIR</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <strong style={{ color: '#f59e0b', fontSize: '0.88rem' }}>📌 Multipliers & Special Policies:</strong>
                      <div style={{ marginTop: '5px' }}>• Multiplier &lt; ₹75K: <strong>20x</strong> | ₹75K–₹1.25L: <strong>25x</strong> | ≥ ₹1.25L: <strong>30x</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category C: <strong>21x Multiplier</strong> | ₹35K–₹80K: <strong>60% FOIR</strong> (Cap: ₹15L)</div>
                      <div style={{ marginTop: '3px', color: '#fca5a5' }}>• <strong>CIBIL -1 Policy</strong>: Max tenure strictly capped to <strong>48 Months</strong></div>
                      <div style={{ marginTop: '3px', color: '#fdba74' }}>• CC Obligation: <strong>5% of limit</strong> (CC BT Not Allowed)</div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigBank?.id === 'hdfc' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 76, 143, 0.12) 0%, rgba(14, 165, 233, 0.12) 100%)',
                  border: '1.5px solid rgba(0, 76, 143, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>HDFC Bank Master Policy Rules (from Excel)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 FOIR & Multipliers (₹75K+ Salary):</strong>
                      <div style={{ marginTop: '5px' }}>• Super A, A, Govt: <strong>70% Max FOIR</strong> | <strong>27x Multiplier</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category B: <strong>65% Max FOIR</strong> | <strong>25x Multiplier</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category C & D: <strong>50% Max FOIR</strong> | <strong>20x Multiplier</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• CC Obligation: <strong>5% of the usage</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <strong style={{ color: '#f59e0b', fontSize: '0.88rem' }}>📌 Loan & Tenure Capping:</strong>
                      <div style={{ marginTop: '5px' }}>• Max Loan Sanction: <strong>₹75 Lakhs</strong> (Min: ₹1 Lakh, all tiers)</div>
                      <div style={{ marginTop: '3px' }}>• Super A, A, B, Govt: <strong>84 Months (7 Years)</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category C: <strong>72 Months (6 Years)</strong> | Category D: <strong>60 Months (5 Years)</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Bachelor Capping: <strong>No Restriction (Disabled)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigBank?.id === 'bandhan' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(220, 0, 40, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%)',
                  border: '1.5px solid rgba(220, 0, 40, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Bandhan Bank Master Policy Rules (from Excel)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <strong style={{ color: '#f87171', fontSize: '0.88rem' }}>📌 Net Salary FOIR Slabs:</strong>
                      <div style={{ marginTop: '5px' }}>• ≤ ₹30,000 Salary: <strong>50% FOIR</strong></div>
                      <div style={{ marginTop: '3px' }}>• ₹30,000 – ₹50,000: <strong>60% FOIR</strong></div>
                      <div style={{ marginTop: '3px' }}>• ₹50,000 – ₹75,000: <strong>65% FOIR</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• &gt; ₹75,000 Salary: <strong>70% Max FOIR</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <strong style={{ color: '#f59e0b', fontSize: '0.88rem' }}>📌 Special CC & Capping Rules:</strong>
                      <div style={{ marginTop: '5px', color: '#fde047' }}>• <strong>CC Zero-Obligation Rule:</strong> If active CC POS is ≤ 3x Net Salary, <strong>OBLIGATION IS ₹0</strong>! Otherwise 3%.</div>
                      <div style={{ marginTop: '3px' }}>• Maximum Sanction: <strong>₹25 Lakhs flat cap</strong></div>
                      <div style={{ marginTop: '3px' }}>• Tenure: Strictly <strong>60 Months (5 Years)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigBank?.id === 'kotak' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(237, 28, 36, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
                  border: '1.5px solid rgba(237, 28, 36, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Kotak Mahindra Bank Master Policy Rules (from Excel)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <strong style={{ color: '#f87171', fontSize: '0.88rem' }}>📌 FOIR & HL Bonus:</strong>
                      <div style={{ marginTop: '5px' }}>• Standard FOIR: <strong>70% Max FOIR</strong> across categories</div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• <strong>Live HL &gt;= ₹10L:</strong> <strong>+5% Bonus FOIR (Up to 75%)</strong></div>
                      <div style={{ marginTop: '3px', color: '#fca5a5' }}>• Balance Transfer: <strong>Credit Card BT NOT ALLOWED</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Net Salary Multipliers:</strong>
                      <div style={{ marginTop: '5px' }}>• Super A: <strong>31x</strong> | Cat A & Govt: <strong>27x</strong></div>
                      <div style={{ marginTop: '3px' }}>• Cat B: <strong>25x</strong> | Cat C: <strong>20x</strong> | Cat D: <strong>18x</strong></div>
                      <div style={{ marginTop: '3px' }}>• Max Tenure: <strong>72 Months</strong> (Cat D: 60 Months)</div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigBank?.id === 'tata' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(31, 78, 120, 0.15) 0%, rgba(14, 165, 233, 0.12) 100%)',
                  border: '1.5px solid rgba(31, 78, 120, 0.4)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Tata Capital Master Policy Rules (from Excel)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Multipliers (By Net Salary Slab):</strong>
                      <div style={{ marginTop: '5px' }}>• &gt; ₹75K Salary: <strong>27x (Cat 1) / 25x (Cat 2) / 18x (Cat 3)</strong></div>
                      <div style={{ marginTop: '3px' }}>• ₹50K–₹75K: <strong>24x (Cat 1) / 22x (Cat 2) / 18x (Cat 3)</strong></div>
                      <div style={{ marginTop: '3px' }}>• &lt; ₹50K Salary: <strong>20x (Cat 1) / 19x (Cat 2) / 15x (Cat 3)</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <strong style={{ color: '#f59e0b', fontSize: '0.88rem' }}>📌 Sanction & BT Rules:</strong>
                      <div style={{ marginTop: '5px' }}>• Special ₹50L Slab: <strong>10.99% flat ROI</strong></div>
                      <div style={{ marginTop: '3px' }}>• Balance Transfer: <strong>Up to 5 Credit Cards allowed</strong></div>
                      <div style={{ marginTop: '3px' }}>• Tenure: <strong>Up to 84 Months (8 Years)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigBank?.id === 'bajaj' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 114, 187, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)',
                  border: '1.5px solid rgba(0, 114, 187, 0.4)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Bajaj Finance Master Policy Rules (from Excel)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 FOIR & HL Bonus Slabs:</strong>
                      <div style={{ marginTop: '5px' }}>• &lt; ₹50K Salary: <strong>60% FOIR</strong> (+10% if HL live: <strong>70%</strong>)</div>
                      <div style={{ marginTop: '3px' }}>• ≥ ₹50K Salary: <strong>65% FOIR</strong> (+5% if HL live: <strong>70%</strong>)</div>
                      <div style={{ marginTop: '3px' }}>• Multipliers: <strong>20x to 28x Net Salary</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <strong style={{ color: '#34d399', fontSize: '0.88rem' }}>📌 High Sanction & CC BT:</strong>
                      <div style={{ marginTop: '5px' }}>• ₹10L+ Loan ROI: <strong>10.00% (Cat A/B)</strong></div>
                      <div style={{ marginTop: '3px' }}>• CC BT Allowed: <strong>Max 6x Net Monthly Salary</strong></div>
                      <div style={{ marginTop: '3px' }}>• Max Tenure: <strong>96M</strong> (108M for ₹1L+ salary)</div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigBank?.id === 'au-bank' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(111, 44, 145, 0.15) 0%, rgba(245, 158, 11, 0.12) 100%)',
                  border: '1.5px solid rgba(111, 44, 145, 0.4)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>AU Small Finance Bank Master Policy Rules (from Excel)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
                      <strong style={{ color: '#c084fc', fontSize: '0.88rem' }}>📌 Capping & Restrictions:</strong>
                      <div style={{ marginTop: '5px' }}>• Max Sanction: <strong>₹15 Lakhs flat cap</strong></div>
                      <div style={{ marginTop: '3px' }}>• NTC (CIBIL -1): <strong>Max ₹3 Lakhs cap</strong>, Min ₹30k Salary required</div>
                      <div style={{ marginTop: '3px', color: '#fde047' }}>• PG / Rented Bachelor: <strong>Strictly capped to ₹5 Lakhs</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <strong style={{ color: '#f59e0b', fontSize: '0.88rem' }}>📌 FOIR & Balance Transfer:</strong>
                      <div style={{ marginTop: '5px' }}>• Permitted FOIR: <strong>50% to 65%</strong> based on income</div>
                      <div style={{ marginTop: '3px', color: '#fca5a5' }}>• Balance Transfer: <strong>ONLY PL BT ALLOWED</strong> (CC BT Not Allowed)</div>
                      <div style={{ marginTop: '3px' }}>• Tenure: Strictly <strong>60 Months (5 Years)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigBank?.id === 'axis-fin' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(128, 0, 0, 0.15) 0%, rgba(245, 158, 11, 0.12) 100%)',
                  border: '1.5px solid rgba(128, 0, 0, 0.4)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Axis Finance Master Policy Rules (from Excel)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <strong style={{ color: '#fca5a5', fontSize: '0.88rem' }}>📌 Specialized Loan Obligations:</strong>
                      <div style={{ marginTop: '5px' }}>• Gold Loan: <strong>1% obligation</strong> (standard is full EMI)</div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• KCC Loan ≤ ₹15 Lakhs: <strong>0% Obligation (Zero deduction)</strong></div>
                      <div style={{ marginTop: '3px' }}>• CC BT / App BT ROI: <strong>18.00%</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Tenure by Category:</strong>
                      <div style={{ marginTop: '5px' }}>• Super A & Govt: <strong>84 Months (7 Years)</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category A & B: <strong>72 Months (6 Years)</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category C & D: <strong>60 Months (5 Years)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigBank?.id === 'cholamandalam' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(243, 112, 33, 0.15) 0%, rgba(59, 130, 246, 0.12) 100%)',
                  border: '1.5px solid rgba(243, 112, 33, 0.4)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fb923c', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Cholamandalam Master Policy Rules (from Excel)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(243, 112, 33, 0.2)' }}>
                      <strong style={{ color: '#fb923c', fontSize: '0.88rem' }}>📌 Multipliers:</strong>
                      <div style={{ marginTop: '5px' }}>• Super A & Govt: <strong>35x Net Salary</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category A & B: <strong>28x Net Salary</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category C & D: <strong>25x Net Salary</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Credit Card BT:</strong>
                      <div style={{ marginTop: '5px' }}>• Max Cards Allowed: <strong>Up to 6 Credit Cards</strong></div>
                      <div style={{ marginTop: '3px' }}>• Outstanding POS Cap: <strong>≤ 6x Net Monthly Salary</strong></div>
                      <div style={{ marginTop: '3px' }}>• Max Tenure: <strong>84 Months (7 Years)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'lnt' || activeConfigBank?.name?.toLowerCase().includes('l&t') || activeConfigBank?.name?.toLowerCase().includes('lnt')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 79, 158, 0.15) 0%, rgba(239, 68, 68, 0.12) 100%)',
                  border: '1.5px solid rgba(0, 79, 158, 0.4)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>L&T Finance Policy Rules (from Bank Policy Excel: BANKS POLICYS.xlsx - Sheet: LNT)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 FOIR & Multipliers by Salary Tier (CIBIL 720+):</strong>
                      <div style={{ marginTop: '5px' }}>• <strong>≥ ₹2L Sal:</strong> Super A/A/B/Govt: <strong>80% FOIR (24x)</strong> | C: <strong>75% (20x)</strong> | D: <strong>70% (16x)</strong></div>
                      <div style={{ marginTop: '3px' }}>• <strong>₹1L–₹2L:</strong> Super A/A/B/Govt: <strong>75% FOIR (24x)</strong> | C: <strong>70% (20x)</strong> | D: <strong>65% (16x)</strong></div>
                      <div style={{ marginTop: '3px' }}>• <strong>₹50K–₹1L:</strong> Super A/A/B/Govt: <strong>70% FOIR (20x)</strong> | C: <strong>60% (18x)</strong> | D: <strong>55% (15x)</strong></div>
                      <div style={{ marginTop: '3px' }}>• <strong>₹25K–₹50K:</strong> Super A/A/B/Govt: <strong>55% FOIR (18x)</strong> | C: <strong>50% (16x)</strong> | D: <strong>50% (14x)</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <strong style={{ color: '#f87171', fontSize: '0.88rem' }}>📌 Eligibility, ROI & Capping:</strong>
                      <div style={{ marginTop: '5px', color: '#86efac' }}>• <strong>Special 10.99% ROI:</strong> Super A / A with Owned House, ₹1.75L+ Sal & 775+ CIBIL</div>
                      <div style={{ marginTop: '3px' }}>• <strong>CIBIL & Work Exp:</strong> <strong>720+ CIBIL</strong> | Min <strong>6 Months</strong> Salary Credit</div>
                      <div style={{ marginTop: '3px' }}>• <strong>Loan Capping:</strong> ₹1L to ₹30L (<strong>Category D Rented Capped at ₹20L</strong>)</div>
                      <div style={{ marginTop: '3px', color: '#fca5a5' }}>• <strong>BT Restriction:</strong> Credit Card BT <strong>STRICTLY NOT ALLOWED</strong> (5% CC Obligation)</div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigBank?.id === 'poonawala' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 85, 150, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)',
                  border: '1.5px solid rgba(0, 85, 150, 0.4)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Poonawala Finance Master Policy Rules (from Excel)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Sanction & Rates:</strong>
                      <div style={{ marginTop: '5px' }}>• Maximum Sanction: <strong>₹60 Lakhs</strong></div>
                      <div style={{ marginTop: '3px' }}>• ≥ ₹35 Lakh: <strong>11.99%</strong> | ≥ ₹20L: <strong>12.25%</strong></div>
                      <div style={{ marginTop: '3px' }}>• Max Tenure: <strong>84 Months (Cat A/B)</strong> | 72M (Cat C)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <strong style={{ color: '#34d399', fontSize: '0.88rem' }}>📌 Credit Card BT Policy:</strong>
                      <div style={{ marginTop: '5px' }}>• Max CC BT Allowed: <strong>Up to 6 Credit Cards</strong></div>
                      <div style={{ marginTop: '3px' }}>• CC POS Cap: <strong>≤ 4x Net Monthly Salary</strong></div>
                      <div style={{ marginTop: '3px' }}>• FOIR: <strong>60% to 70%</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'icici' || activeConfigBank?.name?.toLowerCase().includes('icici')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(237, 28, 36, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
                  border: '1.5px solid rgba(237, 28, 36, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>ICICI Bank Master Policy Rules (from Excel — ICICI Sheet)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(237, 28, 36, 0.25)' }}>
                      <strong style={{ color: '#fca5a5', fontSize: '0.88rem' }}>📌 FOIR & Live Home Loan Bonus:</strong>
                      <div style={{ marginTop: '5px' }}>• Standard FOIR: <strong>45% to 65%</strong> based on salary</div>
                      <div style={{ marginTop: '3px', color: '#4ade80' }}>• <strong>Live Home Loan Running</strong>: FOIR extends to <strong>70%</strong> (`HL RUNING - 70%`)</div>
                      <div style={{ marginTop: '3px' }}>• Open Market FOIR: <strong>45% to 55%</strong></div>
                      <div style={{ marginTop: '3px', color: '#38bdf8' }}>• Credit Card Obligation: <strong>5% of limit</strong> (`5% CC OBLIGATE`)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
                      <strong style={{ color: '#fdba74', fontSize: '0.88rem' }}>📌 Minimum Salary Thresholds:</strong>
                      <div style={{ marginTop: '5px' }}>• <strong>Government Employees</strong>: <strong>₹25,000</strong> (`GOVT - 25K`)</div>
                      <div style={{ marginTop: '3px' }}>• <strong>Private Employees</strong>: <strong>₹30,000</strong> (`PVT - 30K`)</div>
                      <div style={{ marginTop: '3px' }}>• <strong>Open Market</strong>: <strong>₹75,000</strong> (`OPEN MARKET - 75K`)</div>
                      <div style={{ marginTop: '3px', color: '#fca5a5' }}>• <strong>NRI Case</strong>: <strong>₹2,00,000 (2 Lacs)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Category Tier</th>
                      {(activeConfigBank?.id === 'lnt' || activeConfigBank?.name?.toLowerCase().includes('l&t') || activeConfigBank?.name?.toLowerCase().includes('lnt')) ? (
                        <>
                          <th style={{ color: '#38bdf8' }}>₹25K – ₹50K (FOIR / Mult)</th>
                          <th style={{ color: '#38bdf8' }}>₹50K – ₹1L (FOIR / Mult)</th>
                          <th style={{ color: '#38bdf8' }}>₹1L – ₹2L (FOIR / Mult)</th>
                          <th style={{ color: '#38bdf8' }}>≥ ₹2 Lakhs (FOIR / Mult)</th>
                          <th>Credit Card Obligation</th>
                        </>
                      ) : (
                        <>
                          <th>{activeConfigBank?.id === 'icici' ? 'Standard Base FOIR (45%)' : (activeConfigBank?.id === 'indusind' ? '₹20K – ₹35K FOIR' : (activeConfigBank?.id === 'bandhan' ? '≤ ₹30K Salary FOIR' : '₹25K – ₹35K Salary FOIR'))}</th>
                          <th>{activeConfigBank?.id === 'icici' ? 'Standard Max FOIR (55%–65%)' : (activeConfigBank?.id === 'indusind' ? '₹35K – ₹50K FOIR' : (activeConfigBank?.id === 'bandhan' ? '₹30K – ₹50K FOIR' : '₹35K – ₹40K Salary FOIR'))}</th>
                          <th>{activeConfigBank?.id === 'icici' ? 'HL Running FOIR (70%)' : (activeConfigBank?.id === 'indusind' ? '≥ ₹50K Max FOIR (Owned/HL)' : (activeConfigBank?.id === 'bandhan' ? '> ₹75K Max FOIR' : '₹40K+ Salary Max FOIR'))}</th>
                          {activeConfigBank?.id === 'indusind' ? (
                            <>
                              <th style={{ color: '#38bdf8', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(56, 189, 248, 0.5)' }}>&lt; ₹75K Multiplier</th>
                              <th style={{ color: '#38bdf8', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(56, 189, 248, 0.5)' }}>₹75K–₹1.25L Multiplier</th>
                              <th style={{ color: '#38bdf8', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(56, 189, 248, 0.5)' }}>≥ ₹1.25L Multiplier</th>
                            </>
                          ) : (
                            <th>Net Salary Multiplier</th>
                          )}
                          <th>Credit Card Obligation</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(policyData?.foirMultiplier || []).map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`cat-pill cat-${getSafeCatClass(row.category || row.tier)}`}>
                            {row.category || row.tier || 'Standard'}
                          </span>
                        </td>
                        {(activeConfigBank?.id === 'lnt' || activeConfigBank?.name?.toLowerCase().includes('l&t') || activeConfigBank?.name?.toLowerCase().includes('lnt')) ? (
                          <>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div className="table-input-cell" style={{ width: '85px' }}>
                                  <input 
                                    type="number"
                                    value={row.slab1Foir ?? (row.category === 'C' || row.category === 'D' ? 50 : 55)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab1Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '75px' }}>
                                  <input 
                                    type="number"
                                    value={row.mult1 ?? (row.category === 'D' ? 14 : (row.category === 'C' ? 16 : 18))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].mult1 = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>x</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div className="table-input-cell" style={{ width: '85px' }}>
                                  <input 
                                    type="number"
                                    value={row.slab2Foir ?? (row.category === 'D' ? 55 : (row.category === 'C' ? 60 : 70))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab2Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '75px' }}>
                                  <input 
                                    type="number"
                                    value={row.mult2 ?? (row.category === 'D' ? 15 : (row.category === 'C' ? 18 : 20))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].mult2 = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>x</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div className="table-input-cell" style={{ width: '85px' }}>
                                  <input 
                                    type="number"
                                    value={row.slab3Foir ?? (row.category === 'D' ? 65 : (row.category === 'C' ? 70 : 75))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab3Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '75px' }}>
                                  <input 
                                    type="number"
                                    value={row.mult3 ?? (row.category === 'D' ? 16 : (row.category === 'C' ? 20 : 24))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].mult3 = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>x</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div className="table-input-cell highlight" style={{ width: '85px' }}>
                                  <input 
                                    type="number"
                                    value={row.maxFoir ?? (row.category === 'D' ? 70 : (row.category === 'C' ? 75 : 80))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].maxFoir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell highlight" style={{ width: '75px' }}>
                                  <input 
                                    type="number"
                                    value={row.mult4 ?? row.multiplier ?? (row.category === 'D' ? 16 : (row.category === 'C' ? 20 : 24))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].mult4 = val;
                                      updated[idx].multiplier = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>x</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.ccObligation ?? 5}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].ccObligation = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% (BT Not Allowed)</span>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.slab1Foir ?? 45}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].slab1Foir = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% {activeConfigBank?.id === 'icici' ? '(45%)' : (activeConfigBank?.id === 'indusind' ? '(50%)' : '(50–55%)')}</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.slab2Foir ?? (activeConfigBank?.id === 'icici' ? (row.category === 'Open Market' ? 50 : 55) : (row.maxFoir ?? 60))}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].slab2Foir = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% {activeConfigBank?.id === 'icici' ? '(50–55%)' : (activeConfigBank?.id === 'indusind' ? '(60%)' : '(55–65%)')}</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={activeConfigBank?.id === 'icici' ? (row.hlFoir ?? 70) : (row.maxFoir ?? (activeConfigBank?.id === 'indusind' ? (row.category === 'C' ? 60 : 70) : 75))}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    if (activeConfigBank?.id === 'icici') {
                                      updated[idx].hlFoir = val;
                                    } else {
                                      updated[idx].maxFoir = val;
                                    }
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% {activeConfigBank?.id === 'icici' ? '(HL: 70%)' : (activeConfigBank?.id === 'indusind' ? '(70–75%)' : '(Up to 75%)')}</span>
                              </div>
                            </td>
                            {activeConfigBank?.id === 'indusind' ? (
                              <>
                                <td>
                                  <div className="table-input-cell" style={{ background: '#0b1329', border: '1.5px solid rgba(56, 189, 248, 0.45)', minWidth: '95px' }}>
                                    <input 
                                      type="number"
                                      style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.92rem' }}
                                      value={row.multiplierBelow75k ?? (row.category === 'C' ? 21 : 20)}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const updated = [...policyData.foirMultiplier];
                                        updated[idx].multiplierBelow75k = val;
                                        setPolicyData({ ...policyData, foirMultiplier: updated });
                                      }}
                                    />
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>x (&lt;75K)</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="table-input-cell" style={{ background: '#0b1329', border: '1.5px solid rgba(56, 189, 248, 0.45)', minWidth: '105px' }}>
                                    <input 
                                      type="number"
                                      style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.92rem' }}
                                      value={row.multiplier75kTo125k ?? (row.category === 'C' ? 21 : 25)}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const updated = [...policyData.foirMultiplier];
                                        updated[idx].multiplier75kTo125k = val;
                                        setPolicyData({ ...policyData, foirMultiplier: updated });
                                      }}
                                    />
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>x (75-1.25L)</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="table-input-cell" style={{ background: '#0b1329', border: '1.5px solid rgba(56, 189, 248, 0.45)', minWidth: '100px' }}>
                                    <input 
                                      type="number"
                                      style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.92rem' }}
                                      value={row.multiplierAbove125k ?? (row.category === 'C' ? 21 : 30)}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const updated = [...policyData.foirMultiplier];
                                        updated[idx].multiplierAbove125k = val;
                                        updated[idx].multiplier = val;
                                        setPolicyData({ ...policyData, foirMultiplier: updated });
                                      }}
                                    />
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>x (≥1.25L)</span>
                                  </div>
                                </td>
                              </>
                            ) : (
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
                            )}
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
                                <span>% {activeConfigBank?.id === 'bandhan' ? '(3% or 0%)' : (activeConfigBank?.id === 'axis-bank' ? '(4%)' : 'CC Limit')}</span>
                              </div>
                            </td>
                          </>
                        )}
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

              {(activeConfigBank?.id === 'icici' || activeConfigBank?.name?.toLowerCase().includes('icici')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(237, 28, 36, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
                  border: '1.5px solid rgba(237, 28, 36, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>ICICI Bank Demographics & Eligibility Criteria (from Excel — ICICI Sheet)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(237, 28, 36, 0.25)' }}>
                      <strong style={{ color: '#fca5a5', fontSize: '0.88rem' }}>📌 Age & Credit Profile:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Applicant Age: <strong>21 Years</strong> (`21 YEAR`)</div>
                      <div style={{ marginTop: '3px' }}>• Max Age at Loan Time: <strong>60 Years</strong> (Pensioner: <strong>65 Years</strong>)</div>
                      <div style={{ marginTop: '3px' }}>• Retirement Age: <strong>60 Years</strong></div>
                      <div style={{ marginTop: '3px', color: '#4ade80' }}>• Required CIBIL: <strong>725+</strong> | <strong>CIBIL -1 is DOABLE</strong> (NTC)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
                      <strong style={{ color: '#fdba74', fontSize: '0.88rem' }}>📌 Minimum Salary by Profile:</strong>
                      <div style={{ marginTop: '5px' }}>• <strong>Govt Employees</strong>: <strong>₹25,000</strong> (`GOVT - 25K`)</div>
                      <div style={{ marginTop: '3px' }}>• <strong>Private Employees</strong>: <strong>₹30,000</strong> (`PVT - 30K`)</div>
                      <div style={{ marginTop: '3px' }}>• <strong>Open Market</strong>: <strong>₹75,000</strong> (`OPEN MARKET - 75K`)</div>
                      <div style={{ marginTop: '3px', color: '#fca5a5' }}>• <strong>NRI Profile</strong>: <strong>₹2,00,000</strong> (`NRI CASE - 2LAC`)</div>
                      <div style={{ marginTop: '3px', color: '#38bdf8' }}>• Credit Card Obligation: <strong>5% of limit</strong> (`5% CC OBLIGATE`)</div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'lnt' || activeConfigBank?.name?.toLowerCase().includes('l&t') || activeConfigBank?.name?.toLowerCase().includes('lnt')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 79, 158, 0.12) 0%, rgba(14, 165, 233, 0.12) 100%)',
                  border: '1.5px solid rgba(0, 79, 158, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>L&T Finance Demographics & Eligibility Criteria (from Bank Policy Excel: BANKS POLICYS.xlsx)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Age & Experience Requirements:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Applicant Age: <strong>21 Years</strong> (`21 YEARS`)</div>
                      <div style={{ marginTop: '3px' }}>• Max Age at Loan Maturity: <strong>60 Years</strong> (`60 YEARS`)</div>
                      <div style={{ marginTop: '3px' }}>• Retirement Age: <strong>60 Years</strong> (`60 YEARS`)</div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Work Experience: <strong>6 Months</strong> Salary Credit Required (`MINI WORK EXPRINCE`)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
                      <strong style={{ color: '#fdba74', fontSize: '0.88rem' }}>📌 Financial & Credit Criteria:</strong>
                      <div style={{ marginTop: '5px' }}>• Minimum Net Monthly Salary: <strong>₹25,000</strong> (`25K SALARY`)</div>
                      <div style={{ marginTop: '3px', color: '#f87171' }}>• Minimum CIBIL Score: <strong>720+ Strictly Required</strong> (`CIBIL 720PLUS`)</div>
                      <div style={{ marginTop: '3px', color: '#fca5a5' }}>• Credit Card BT: <strong>Strictly NOT ALLOWED</strong> (`CC BT NOT ALLOW`)</div>
                      <div style={{ marginTop: '3px', color: '#38bdf8' }}>• Credit Card Obligation: <strong>5%</strong> (`0.05`)</div>
                    </div>
                  </div>
                </div>
              )}

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
                            value={policyData?.demographics?.minAge ?? 21}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPolicyData(prev => ({
                                ...prev,
                                demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), minAge: val }
                              }));
                            }}
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
                            value={policyData?.demographics?.maxAge ?? 60}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPolicyData(prev => ({
                                ...prev,
                                demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), maxAge: val }
                              }));
                            }}
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
                            value={policyData?.demographics?.retirementSalaried ?? 60}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPolicyData(prev => ({
                                ...prev,
                                demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), retirementSalaried: val }
                              }));
                            }}
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
                            value={policyData?.demographics?.retirementGovt ?? 62}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPolicyData(prev => ({
                                ...prev,
                                demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), retirementGovt: val }
                              }));
                            }}
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
                            value={policyData?.demographics?.minSalary ?? 25000}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPolicyData(prev => ({
                                ...prev,
                                demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), minSalary: val }
                              }));
                            }}
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
                            value={policyData?.demographics?.minExperienceTotal ?? 12}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPolicyData(prev => ({
                                ...prev,
                                demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), minExperienceTotal: val }
                              }));
                            }}
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
                            value={policyData?.demographics?.minCibilScore ?? 650}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPolicyData(prev => ({
                                ...prev,
                                demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), minCibilScore: val }
                              }));
                            }}
                          />
                        </div>
                      </td>
                      <td>650</td>
                      <td>Bureau credit score below which applications are rejected</td>
                    </tr>
                    <tr>
                      <td><strong>Credit Card Obligation Factor</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData?.demographics?.ccObligationPercent ?? 5}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPolicyData(prev => ({
                                ...prev,
                                demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), ccObligationPercent: val }
                              }));
                            }}
                          />
                          <span>%</span>
                        </div>
                      </td>
                      <td>4% – 5%</td>
                      <td>Percentage of credit card outstanding counted towards monthly obligations (Axis Bank: 4%)</td>
                    </tr>
                    <tr>
                      <td><strong>Max Credit Card BT Allowed</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData?.demographics?.ccBtAllowedCount ?? 3}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPolicyData(prev => ({
                                ...prev,
                                demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), ccBtAllowedCount: val }
                              }));
                            }}
                          />
                          <span>Cards</span>
                        </div>
                      </td>
                      <td>3 to 5 Cards</td>
                      <td>Maximum number of credit cards permitted for Balance Transfer (Axis Bank: 5 cards)</td>
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
