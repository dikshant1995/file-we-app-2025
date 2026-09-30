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
  { id: 'cholamandalam', name: 'Cholamandalam Finance', color: '#F37021', minRate: 13.75, maxLoan: 3000000, maxTenure: 84, enabled: true },
  { id: 'axis-fin', name: 'Axis Finance', color: '#800000', minRate: 13.50, maxLoan: 2500000, maxTenure: 84, enabled: true },
  { id: 'indusind', name: 'IndusInd Bank', color: '#005596', minRate: 9.99, maxLoan: 7500000, maxTenure: 84, enabled: true },
  { id: 'shri-ram', name: 'Shri Ram Finance', color: '#1F4E78', minRate: 12.5, maxLoan: 2000000, maxTenure: 48, enabled: true },
  { id: 'piramal', name: 'Piramal Finance', color: '#1F4E78', minRate: 11.99, maxLoan: 5000000, maxTenure: 72, enabled: true },
  // Additional Banks & NBFCs from Master Policy
  { id: 'axis-bank', name: 'Axis Bank', color: '#97144D', minRate: 9.99, maxLoan: 5000000, maxTenure: 84, enabled: true },
  { id: 'lnt', name: 'L&T Finance', color: '#004F9E', minRate: 10.99, maxLoan: 3000000, maxTenure: 72, enabled: true },
  { id: 'smfg', name: 'SMFG India Credit', color: '#002D62', minRate: 17.00, maxLoan: 3000000, maxTenure: 60, enabled: true },
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
    { category: 'Super A', slab1Foir: 55, mult1: 24, slab2Foir: 65, mult2: 30, maxFoir: 75, mult3: 36, multiplier: 36, ccObligation: 4 },
    { category: 'A', slab1Foir: 55, mult1: 24, slab2Foir: 65, mult2: 30, maxFoir: 75, mult3: 36, multiplier: 36, ccObligation: 4 },
    { category: 'B', slab1Foir: 55, mult1: 24, slab2Foir: 60, mult2: 26, maxFoir: 75, mult3: 30, multiplier: 30, ccObligation: 4 },
    { category: 'C', slab1Foir: 50, mult1: 18, slab2Foir: 55, mult2: 20, maxFoir: 60, mult3: 20, multiplier: 20, ccObligation: 4 },
    { category: 'Govt', slab1Foir: 55, mult1: 24, slab2Foir: 65, mult2: 30, maxFoir: 75, mult3: 36, multiplier: 36, ccObligation: 4 }
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
    etcCustomerSlabs: Array.isArray(raw.etcCustomerSlabs) && raw.etcCustomerSlabs.length > 0
      ? raw.etcCustomerSlabs
      : (raw.etcCustomerSlabs || [
          { nmiSlab: 'INR 20K - <50K', minIncome: 20000, maxIncome: 49999, foirP1: 60, multP1: 18, capP1: 5.0, foirP0: 50, multP0: 11, capP0: 5.0 },
          { nmiSlab: 'INR 50K - <75K', minIncome: 50000, maxIncome: 74999, foirP1: 65, multP1: 20, capP1: 15.0, foirP0: 60, multP0: 15, capP0: 7.5 },
          { nmiSlab: 'INR 75K - <100K', minIncome: 75000, maxIncome: 99999, foirP1: 70, multP1: 22, capP1: 15.0, foirP0: 65, multP0: 18, capP0: 10.0 },
          { nmiSlab: '>= INR 100K', minIncome: 100000, maxIncome: Infinity, foirP1: 75, multP1: 24, capP1: 15.0, foirP0: 70, multP0: 20, capP0: 10.0 }
        ]),
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
          const isPiramalBank = bank.id === 'piramal' || bank.name?.toLowerCase().includes('piramal');
          const isFreshPiramal = isPiramalBank && Array.isArray(parsed.interestRates) && parsed.interestRates.some(r => r.minRoi === 11.99 && r.maxRoi === 28.00);
          const isSmfgBank = bank.id === 'smfg' || bank.name?.toLowerCase().includes('smfg');
          const isFreshSmfg = isSmfgBank && 
            Array.isArray(parsed.loanCapping) && 
            parsed.loanCapping.some(r => r.maxLoan === 3000000) &&
            Array.isArray(parsed.interestRates) && 
            parsed.interestRates.some(r => r.roi25kTo30k !== undefined || r.roiBelow25k !== undefined) &&
            parsed.demographics?.retirementSalaried === 65 &&
            parsed.demographics?.minExperienceCurrent === 24;
          const isCholaBank = bank.id === 'cholamandalam' || bank.id === 'chola' || bank.name?.toLowerCase().includes('chola');
          const isFreshChola = isCholaBank &&
            Array.isArray(parsed.loanCapping) &&
            parsed.loanCapping.some(r => (r.tier === 'Super A' || r.category === 'Super A') && r.maxLoan === 3000000) &&
            parsed.demographics?.coAppAgeLimit === 23 &&
            parsed.demographics?.minSalaryBankNbfc === 30000;

          const isKotakBank = bank.id === 'kotak' || bank.name?.toLowerCase().includes('kotak');
          const isFreshKotak = isKotakBank &&
            Array.isArray(parsed.loanCapping) &&
            parsed.loanCapping.some(r => (r.tier === 'Super A' || r.category === 'Super A') && r.maxLoan === 10000000) &&
            Array.isArray(parsed.loanCapping) &&
            parsed.loanCapping.some(r => (r.tier === 'B' || r.category === 'B') && r.maxLoan === 10000000) &&
            parsed.demographics?.allowCcBt === false;

          const isBandhanBank = bank.id === 'bandhan' || bank.name?.toLowerCase().includes('bandhan');
          const isFreshBandhan = isBandhanBank &&
            parsed.demographics?.minSalaryCatD === 40000 &&
            parsed.demographics?.ccObligationPercent === 3 &&
            Array.isArray(parsed.interestRates) &&
            parsed.interestRates.some(r => r.roiAbove50k_750 !== undefined);

          const isBajajBank = bank.id === 'bajaj' || bank.name?.toLowerCase().includes('bajaj');
          const isFreshBajaj = isBajajBank &&
            parsed.demographics?.minAge === 23 &&
            parsed.demographics?.minSalary === 27000 &&
            Array.isArray(parsed.foirMultiplier) &&
            parsed.foirMultiplier.some(r => r.multBelow50k !== undefined);

          const isAuBank = bank.id === 'au-bank' || bank.id === 'au' || bank.name?.toLowerCase().includes('au ');
          const isFreshAu = isAuBank &&
            parsed.demographics?.minAge === 21 &&
            parsed.demographics?.maxAge === 57 &&
            parsed.demographics?.minSalary === 20000 &&
            Array.isArray(parsed.roiMatrixDetailed) &&
            parsed.roiMatrixDetailed.length === 18;

          const isTataBank = bank.id === 'tata' || bank.name?.toLowerCase().includes('tata');
          const isFreshTata = isTataBank &&
            parsed.demographics?.maxAgeGovt === 60 &&
            parsed.demographics?.maxAgePvt === 58 &&
            parsed.demographics?.minLoanAmount === 75000;

          const isAxisFinBank = bank.id === 'axis-fin' || bank.id === 'axis' || bank.id === 'axis_fin' || (bank.name?.toLowerCase().includes('axis') && bank.name?.toLowerCase().includes('fin'));
          const isFreshAxisFin = isAxisFinBank &&
            parsed.demographics?.minTotalExperienceMonths === 6 &&
            parsed.demographics?.minLoanAmount === 100000;

          const isPoonawalaBank = bank.id === 'poonawala' || bank.name?.toLowerCase().includes('poonawala') || bank.name?.toLowerCase().includes('poonawalla');
          const isFreshPoonawala = isPoonawalaBank &&
            parsed.isFoirOnly === true &&
            parsed.demographics?.minTotalExperienceMonths === 24 &&
            parsed.demographics?.minLoanAmount === 100000;

          const isAbflBank = bank.id === 'abfl' || bank.name?.toLowerCase().includes('abfl') || bank.name?.toLowerCase().includes('aditya');
          const isFreshAbfl = isAbflBank &&
            parsed.demographics?.minLoanAmount === 100000 &&
            parsed.demographics?.minSalaryTier1 === 40000 &&
            parsed.demographics?.maxTenureMonths === 84;

          const isFinnableBank = bank.id === 'finnable' || bank.name?.toLowerCase().includes('finnable');
          const isFreshFinnable = isFinnableBank &&
            parsed.demographics?.minLoanAmount === 50000 &&
            parsed.demographics?.minSalaryTier1 === 20000 &&
            parsed.demographics?.maxTenureMonths === 60;

          const isValidRates = Array.isArray(parsed.interestRates) && parsed.interestRates.length > 0 && parsed.interestRates.every(r => r && typeof r === 'object');
          const isValidCapping = !parsed.loanCapping || (Array.isArray(parsed.loanCapping) && parsed.loanCapping.every(r => r && typeof r === 'object'));

          if (hasMatchingCategories && (!isLntBank || isFreshLnt) && (!isPiramalBank || isFreshPiramal) && (!isSmfgBank || isFreshSmfg) && (!isCholaBank || isFreshChola) && (!isKotakBank || isFreshKotak) && (!isBandhanBank || isFreshBandhan) && (!isBajajBank || isFreshBajaj) && (!isAuBank || isFreshAu) && (!isTataBank || isFreshTata) && (!isAxisFinBank || isFreshAxisFin) && (!isPoonawalaBank || isFreshPoonawala) && (!isAbflBank || isFreshAbfl) && (!isFinnableBank || isFreshFinnable) && isValidRates && isValidCapping) {
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
            const isPiramal = bankId === 'piramal' || activeConfigBank?.name?.toLowerCase().includes('piramal');
            const isPoonawala = bankId === 'poonawala' || activeConfigBank?.name?.toLowerCase().includes('poonawala');
            const isIcici = bankId === 'icici' || activeConfigBank?.name?.toLowerCase().includes('icici');
            const isAbfl = bankId === 'abfl' || activeConfigBank?.name?.toLowerCase().includes('birla') || activeConfigBank?.name?.toLowerCase().includes('abfl');
            const isSmfg = bankId === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg');
            const isAu = bankId === 'au-bank' || bankId === 'au' || activeConfigBank?.name?.toLowerCase().includes('au ');

            const rawRates = policyData?.interestRates || [];
            // Banks that don't have Cat D in ROI: HDFC, IndusInd, Axis, Tata
            const displayRates = (isHdfc || isIndusind || isAxis || isTata)
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
                      <p>Kotak Master Policy Slabs (Sheet: KOTAK): <strong>≥ ₹15 Lakh</strong> (9.95%), <strong>₹10L – ₹15L</strong> (10.50%), and <strong>&lt; ₹10 Lakh</strong> (10.99% / Cat C 12.00% / Cat D 13.00%).</p>
                    )}
                    {isTata && (
                      <p>Tata Capital Master Policy Slabs: <strong>₹50 Lakh Special</strong> (10.99%), <strong>₹20L – ₹50L</strong> (12.00%), and <strong>&lt; ₹20 Lakh</strong> (14.00%).</p>
                    )}
                    {isBajaj && (
                      <p>Bajaj Finance Master Policy Slabs: <strong>≥ ₹10 Lakh</strong> (10.00% Cat A/B), <strong>₹1L – ₹12L Sal Lite</strong> (16.00%), and <strong>Default ROI</strong> (14.00%).</p>
                    )}
                    {isBandhan && (
                      <p>Bandhan Bank Master Policy (Sheet: BANDHAN BANK - Section 5): Slabs structured by <strong>Net Monthly Income (&gt; ₹50k, ₹25k – ₹50k, &lt; ₹25k)</strong> and <strong>QC / CIBIL Score (&gt; 750, 700–749, 650–699)</strong>. Rates span <strong>12.15% to 16.90% p.a.</strong> across categories.</p>
                    )}
                    {isChola && (
                      <p>Cholamandalam Finance Master Policy Slabs (Excel Sheet: CHOLA): <strong>≥ ₹10L & 75K+ Sal</strong> (13.75%), <strong>≥ ₹7.50L & 50K+ Sal</strong> (14.50%), <strong>≥ ₹5L Loan Cases / Cat B</strong> (14.50% – 15.00%), and <strong>Standard / Cat C & D</strong> (15.00%).</p>
                    )}
                    {isAxisFin && (
                      <p>Axis Finance Master Policy Slabs: <strong>₹5L – ₹25L Loan Cases</strong> (13.50% – 16.00%), and <strong>Credit Card BT / App BT</strong> (18.00%).</p>
                    )}
                    {isLnt && (
                      <p>L&T Finance Master Policy Slabs: <strong>₹20L – ₹30L</strong> (11.50% – 12.50%), <strong>₹10L – ₹20L</strong> (14.00%), and <strong>&lt; ₹10L</strong> (13.00% – 15.00%). Special Rate: <strong>10.99%</strong> for Super A & A with Owned House, ₹1.75L+ Salary & 775+ CIBIL.</p>
                    )}
                    {isPiramal && (
                      <p>Piramal Finance Master Policy Slabs (from Excel: BANKS POLICYS.xlsx): <strong>11.99% to 28.00% p.a.</strong> across all categories (Super A, A, B, C, D, Govt) — <strong>AS PER VENTILE SCORE</strong>.</p>
                    )}
                    {isPoonawala && (
                      <p>Poonawalla Fincorp Master Policy (from Excel: Sheet POONAWALA): New Rate Grid effective starting 1st Aug 2026 across <strong>Super CAT / CAT A / Govt Ratna</strong> (11.99% – 15.00%), <strong>Govt / Cat B / CAT EDU / Defence</strong> (13.50% – 15.50%), <strong>Cat C</strong> (14.00% – 16.00%), <strong>Cat D</strong> (14.74% – 17.24%), and <strong>Cat E</strong> (16.75% – 19.75%).</p>
                    )}
                    {isIcici && (
                      <p>ICICI Bank Master Policy (from Excel): <strong>CIBIL 775+ & ₹75k+ Sal (≥₹20L)</strong> (9.99%), <strong>CIBIL 750–774 & ₹75k+ Sal</strong> (10.30%), and <strong>Standard ROI</strong> (12.00% to 9.99% / Open Market: 11.00% to 12.80%). Min Ticket in Rajasthan: <strong>₹6.10 Lakhs</strong>.</p>
                    )}
                    {isAbfl && (
                      <p>ABFL Master Policy Slabs: <strong>≥ ₹15 Lakh</strong> (11.50% – 13.00%), and <strong>&lt; ₹15 Lakh</strong> (12.50% – 14.00%).</p>
                    )}
                    {isSmfg && (
                      <p>SMFG India Credit Master Policy Slabs (Excel Sheet: SMFG): <strong>Net Sal &gt; ₹1 Lakh</strong> (17.00% – 30.00%), <strong>₹75k – ₹1L</strong> (18.50% – 30.00%), <strong>₹50k – ₹75k</strong> (18.50% – 30.00%), <strong>₹40k – ₹50k</strong> (19.00% – 30.00%), <strong>₹35k – ₹40k</strong> (19.50% – 30.00%), <strong>₹30k – ₹35k</strong> (21.50% – 30.00%), <strong>₹25k – ₹30k</strong> (23.00% – 30.00%), and <strong>&lt; ₹25k (25001)</strong> (24.00% – 30.00%).</p>
                    )}
                    {isAu && (
                      <p>AU Small Finance Bank Master Policy Slabs (Sheet: AU BANK - Section 5): Structured by <strong>CIBIL Score (&ge;750, &lt;750, NTC)</strong>, <strong>Loan Bracket (&gt;₹1.50L, ₹50k–₹1.50L, &lt;₹50k)</strong> and Segment (&ge;₹2L vs &lt;₹2L). Rates span <strong>13.00% to 24.00% p.a.</strong> across Super A, A, B, C, D &amp; Others.</p>
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
                    {!isKotak && !isTata && !isBajaj && !isBandhan && !isChola && !isAxisFin && !isLnt && !isPiramal && !isPoonawala && !isIcici && !isAbfl && !isSmfg && !isHdfc && !isIndusind && !isAxis && !isAu && (
                      <p>Define minimum ROI strictly according to employer category and loan amount brackets.</p>
                    )}
                  </div>
                </div>

                {isAu ? (
                  <div className="table-responsive">
                    <table className="policy-table">
                      <thead>
                        <tr>
                          <th style={{ minWidth: '220px', color: '#c084fc' }}>Segment (CIBIL &amp; Loan Amount)</th>
                          <th style={{ minWidth: '150px', color: '#38bdf8' }}>Salary Slab</th>
                          <th style={{ color: '#34d399' }}>SUPER A (%)</th>
                          <th style={{ color: '#38bdf8' }}>CAT A (%)</th>
                          <th style={{ color: '#fbbf24' }}>CAT B (%)</th>
                          <th style={{ color: '#f87171' }}>CAT C (%)</th>
                          <th style={{ color: '#a78bfa' }}>CAT D / GOVT (%)</th>
                          <th style={{ color: '#ec4899' }}>OTHER (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {((policyData?.roiMatrixDetailed && policyData.roiMatrixDetailed.length === 18) 
                          ? policyData.roiMatrixDetailed 
                          : (BANK_EXCEL_POLICIES['au-bank']?.roiMatrixDetailed || [])
                        ).map((row, rIdx) => (
                          <tr key={rIdx} style={row.salarySlab === '> 1,50K' ? { borderTop: '2px solid rgba(192, 132, 252, 0.3)' } : {}}>
                            <td>
                              <strong style={{ color: '#f1f5f9', fontSize: '0.82rem' }}>
                                {row.segmentLabel || row.segment}
                              </strong>
                            </td>
                            <td>
                              <span style={{ 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                background: row.salarySlab === '> 1,50K' ? 'rgba(34, 197, 94, 0.15)' : (row.salarySlab === '< 50K' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)'),
                                color: row.salarySlab === '> 1,50K' ? '#4ade80' : (row.salarySlab === '< 50K' ? '#fca5a5' : '#38bdf8'),
                                fontWeight: 600,
                                fontSize: '0.8rem'
                              }}>
                                {row.salaryLabel || row.salarySlab}
                              </span>
                            </td>
                            {['superA', 'catA', 'catB', 'catC', 'catD', 'other'].map(catKey => {
                              const val = row.rates?.[catKey] ?? 17;
                              return (
                                <td key={catKey}>
                                  <div className="table-input-cell highlight">
                                    <input 
                                      type="number" step="0.01"
                                      value={val}
                                      onChange={(e) => {
                                        const newVal = Number(e.target.value);
                                        const currentList = (policyData?.roiMatrixDetailed && policyData.roiMatrixDetailed.length === 18) 
                                          ? [...policyData.roiMatrixDetailed] 
                                          : [...(BANK_EXCEL_POLICIES['au-bank']?.roiMatrixDetailed || [])];
                                        const updatedRates = { ...currentList[rIdx].rates, [catKey]: newVal };
                                        if (catKey === 'superA') updatedRates['Super A'] = newVal;
                                        if (catKey === 'catA') updatedRates['A'] = newVal;
                                        if (catKey === 'catB') updatedRates['B'] = newVal;
                                        if (catKey === 'catC') updatedRates['C'] = newVal;
                                        if (catKey === 'catD') { updatedRates['D'] = newVal; updatedRates['Govt'] = newVal; }
                                        if (catKey === 'other') updatedRates['Other'] = newVal;
                                        currentList[rIdx] = { ...currentList[rIdx], rates: updatedRates };
                                        setPolicyData({ ...policyData, roiMatrixDetailed: currentList });
                                      }}
                                    />
                                    <span>%</span>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
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
                            <th>10L to 15L Cases (% p.a.)</th>
                            <th>Below 10L Cases (% p.a.)</th>
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
                            <th style={{ color: '#38bdf8' }}>&gt; ₹50K (&gt;750)</th>
                            <th style={{ color: '#38bdf8' }}>&gt; ₹50K (700-749)</th>
                            <th style={{ color: '#38bdf8' }}>&gt; ₹50K (650-699)</th>
                            <th style={{ color: '#4ade80' }}>25K–50K (&gt;750)</th>
                            <th style={{ color: '#4ade80' }}>25K–50K (700-749)</th>
                            <th style={{ color: '#4ade80' }}>25K–50K (650-699)</th>
                            <th style={{ color: '#f59e0b' }}>&lt; 25K (&gt;750)</th>
                            <th style={{ color: '#f59e0b' }}>&lt; 25K (700-749)</th>
                            <th style={{ color: '#f59e0b' }}>&lt; 25K (650-699)</th>
                          </>
                        )}
                        {isChola && (
                          <>
                            <th>≥ ₹10L & 75K+ Sal (% p.a.)</th>
                            <th>≥ ₹7.50L & 50K+ Sal (% p.a.)</th>
                            <th>≥ ₹5L Loan Cases (% p.a.)</th>
                            <th>Standard / Default ROI (% p.a.)</th>
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
                            <th style={{ color: '#38bdf8' }}>&lt; ₹25K (Row 16 / 25001)</th>
                            <th style={{ color: '#38bdf8' }}>₹25K – ₹30K (% p.a.)</th>
                            <th style={{ color: '#38bdf8' }}>₹30K – ₹35K (% p.a.)</th>
                            <th style={{ color: '#38bdf8' }}>₹35K – ₹40K (% p.a.)</th>
                            <th style={{ color: '#38bdf8' }}>₹40K – ₹50K (% p.a.)</th>
                            <th style={{ color: '#38bdf8' }}>₹50K – ₹75K (% p.a.)</th>
                            <th style={{ color: '#38bdf8' }}>₹75K – ₹100K (% p.a.)</th>
                            <th style={{ color: '#38bdf8' }}>≥ ₹100K (% p.a.)</th>
                          </>
                        )}
                        {isPiramal && (
                          <>
                            <th>Minimum ROI (% p.a.)</th>
                            <th>Maximum ROI (% p.a.)</th>
                            <th>Applied / Default ROI (% p.a.)</th>
                            <th>Pricing Structure (Excel)</th>
                          </>
                        )}
                        {!isHdfc && !isIndusind && !isAxis && !isKotak && !isTata && !isBajaj && !isBandhan && !isChola && !isAxisFin && !isLnt && !isPiramal && !isPoonawala && !isIcici && !isAbfl && !isSmfg && !isAu && (
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
                                    value={row.roiAbove20L ?? (row.category === 'C' || row.category === 'D' ? 10.25 : 9.99)}
                                    onChange={(e) => updateRate(row.category, 'roiAbove20L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi15Lto20L ?? (row.category === 'C' || row.category === 'D' ? 10.50 : 10.15)}
                                    onChange={(e) => updateRate(row.category, 'roi15Lto20L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi10Lto15L ?? (row.category === 'C' || row.category === 'D' ? 11.00 : 10.50)}
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
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow10L ?? (row.category === 'C' ? 11.25 : (row.category === 'B' || row.category === 'Govt' ? 10.75 : 10.49))}
                                    onChange={(e) => updateRate(row.category, 'roiBelow10L', Number(e.target.value))}
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
                                    value={row.roiAbove15L ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'B' || row.category === 'Govt' ? 9.95 : (row.category === 'C' ? 11.00 : 12.00))}
                                    onChange={(e) => updateRate(row.category, 'roiAbove15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi10Lto15L ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'B' || row.category === 'Govt' ? 10.50 : (row.category === 'C' ? 11.50 : 12.50))}
                                    onChange={(e) => updateRate(row.category, 'roi10Lto15L', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow10L ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'B' || row.category === 'Govt' ? 10.99 : (row.category === 'C' ? 12.00 : 13.00))}
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
                                    value={row.roiAbove50k_750 ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 12.15 : (row.category === 'B' ? 12.25 : (row.category === 'C' ? 13.49 : 13.69)))}
                                    onChange={(e) => updateRate(row.category, 'roiAbove50k_750', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove50k_700 ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 12.25 : (row.category === 'B' ? 12.49 : (row.category === 'C' ? 14.49 : 14.49)))}
                                    onChange={(e) => updateRate(row.category, 'roiAbove50k_700', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove50k_650 ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 13.49 : (row.category === 'B' ? 14.49 : (row.category === 'C' ? 15.99 : 16.00)))}
                                    onChange={(e) => updateRate(row.category, 'roiAbove50k_650', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>

                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi25kTo50k_750 ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 13.25 : (row.category === 'B' ? 13.49 : (row.category === 'C' ? 14.49 : 15.49)))}
                                    onChange={(e) => updateRate(row.category, 'roi25kTo50k_750', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi25kTo50k_700 ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 13.99 : (row.category === 'B' ? 14.49 : (row.category === 'C' ? 15.99 : 15.99)))}
                                    onChange={(e) => updateRate(row.category, 'roi25kTo50k_700', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi25kTo50k_650 ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 14.99 : (row.category === 'B' ? 15.99 : (row.category === 'C' ? 16.49 : 16.90)))}
                                    onChange={(e) => updateRate(row.category, 'roi25kTo50k_650', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>

                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow25k_750 ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 13.99 : (row.category === 'B' ? 14.25 : (row.category === 'C' ? 15.99 : 16.49)))}
                                    onChange={(e) => updateRate(row.category, 'roiBelow25k_750', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow25k_700 ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 14.99 : (row.category === 'B' ? 14.99 : (row.category === 'C' ? 16.49 : 16.90)))}
                                    onChange={(e) => updateRate(row.category, 'roiBelow25k_700', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow25k_650 ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 15.49 : (row.category === 'B' ? 15.99 : (row.category === 'C' ? 16.90 : 16.90)))}
                                    onChange={(e) => updateRate(row.category, 'roiBelow25k_650', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isChola && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove10L75kSal ?? row.roiAbove10L ?? 13.75}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      updateRate(row.category, 'roiAbove10L75kSal', val);
                                      updateRate(row.category, 'roiAbove10L', val);
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove75L50kSal ?? row.roi7_5Lto10L ?? 14.50}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      updateRate(row.category, 'roiAbove75L50kSal', val);
                                      updateRate(row.category, 'roi7_5Lto10L', val);
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove5L ?? row.roi5Lto7_5L ?? 15.00}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      updateRate(row.category, 'roiAbove5L', val);
                                      updateRate(row.category, 'roi5Lto7_5L', val);
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.defaultRoi ?? row.roiBelow5L ?? 15.00}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      updateRate(row.category, 'defaultRoi', val);
                                      updateRate(row.category, 'roiBelow5L', val);
                                    }}
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
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiBelow25k ?? row.roi25001 ?? 24.00}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      updateRate(row.category, 'roiBelow25k', val);
                                      updateRate(row.category, 'roi25001', val);
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi25kTo30k ?? 23.00}
                                    onChange={(e) => updateRate(row.category, 'roi25kTo30k', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi30kTo35k ?? 21.50}
                                    onChange={(e) => updateRate(row.category, 'roi30kTo35k', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi35kTo40k ?? 19.50}
                                    onChange={(e) => updateRate(row.category, 'roi35kTo40k', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi40kTo50k ?? 19.00}
                                    onChange={(e) => updateRate(row.category, 'roi40kTo50k', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi50kTo75k ?? 18.50}
                                    onChange={(e) => updateRate(row.category, 'roi50kTo75k', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roi75kTo100k ?? 18.50}
                                    onChange={(e) => updateRate(row.category, 'roi75kTo100k', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.roiAbove100k ?? 17.00}
                                    onChange={(e) => updateRate(row.category, 'roiAbove100k', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                            </>
                          )}

                          {isPiramal && (
                            <>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.minRoi ?? 11.99}
                                    onChange={(e) => updateRate(row.category, 'minRoi', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.maxRoi ?? 28.00}
                                    onChange={(e) => updateRate(row.category, 'maxRoi', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number" step="0.01"
                                    value={row.defaultRoi ?? 11.99}
                                    onChange={(e) => updateRate(row.category, 'defaultRoi', Number(e.target.value))}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <span style={{ fontSize: '0.84rem', color: '#38bdf8', fontWeight: 600 }}>
                                  AS PER VENTILE SCORE
                                </span>
                              </td>
                            </>
                          )}

                          {!isHdfc && !isIndusind && !isAxis && !isKotak && !isTata && !isBajaj && !isBandhan && !isChola && !isAxisFin && !isLnt && !isPiramal && !isPoonawala && !isIcici && !isAbfl && !isSmfg && !isAu && (
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
                )}

                {isPoonawala && (
                  <div style={{
                    marginTop: '24px',
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                    border: '1.5px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '10px',
                    padding: '18px 20px',
                    color: '#e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={20} color="#38bdf8" />
                        <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1.05rem', fontWeight: 700 }}>
                          Poonawalla Fincorp Complete Rate Grids (Excel Sheet: POONAWALA — Effective 1st Aug 2026)
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        Pure FOIR Institution • 100% Digital
                      </span>
                    </div>

                    {/* Grids 1 & 2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      {/* Grid 1 */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.88rem', marginBottom: '8px' }}>
                          📊 Super CAT / CAT A / Govt Ratna
                        </div>
                        <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}>
                              <th style={{ padding: '6px 8px' }}>Salary / Ticket Slab</th>
                              <th style={{ padding: '6px 8px', color: '#f87171' }}>≥ 700</th>
                              <th style={{ padding: '6px 8px', color: '#fbbf24' }}>≥ 730</th>
                              <th style={{ padding: '6px 8px', color: '#4ade80' }}>≥ 780</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 8px' }}>NTH up to 50K</td><td style={{ padding: '6px 8px' }}>15.00%</td><td style={{ padding: '6px 8px' }}>14.74%</td><td style={{ padding: '6px 8px', fontWeight: 600, color: '#4ade80' }}>13.75%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 8px' }}>NTH &gt;50K–75K</td><td style={{ padding: '6px 8px' }}>14.74%</td><td style={{ padding: '6px 8px' }}>14.50%</td><td style={{ padding: '6px 8px', fontWeight: 600, color: '#4ade80' }}>13.50%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 8px' }}>NTH &gt;75K</td><td style={{ padding: '6px 8px' }}>14.00%</td><td style={{ padding: '6px 8px' }}>13.50%</td><td style={{ padding: '6px 8px', fontWeight: 600, color: '#4ade80' }}>12.50%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 8px' }}>NTH &gt;100K &amp; LA ≥ 20L</td><td style={{ padding: '6px 8px' }}>13.75%</td><td style={{ padding: '6px 8px' }}>13.25%</td><td style={{ padding: '6px 8px', fontWeight: 600, color: '#4ade80' }}>12.25%</td></tr>
                            <tr><td style={{ padding: '6px 8px' }}>NTH &gt;100K &amp; LA ≥ 35L</td><td style={{ padding: '6px 8px' }}>13.00%</td><td style={{ padding: '6px 8px' }}>12.50%</td><td style={{ padding: '6px 8px', fontWeight: 700, color: '#38bdf8' }}>11.99%</td></tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Grid 2 */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.88rem', marginBottom: '8px' }}>
                          📊 Govt / Cat B / CAT EDU / Defence
                        </div>
                        <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}>
                              <th style={{ padding: '6px 8px' }}>Salary / Ticket Slab</th>
                              <th style={{ padding: '6px 8px', color: '#f87171' }}>≥ 700</th>
                              <th style={{ padding: '6px 8px', color: '#fbbf24' }}>≥ 730</th>
                              <th style={{ padding: '6px 8px', color: '#a78bfa' }}>≥ 750</th>
                              <th style={{ padding: '6px 8px', color: '#4ade80' }}>≥ 780</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 8px' }}>NTH up to 50K</td><td style={{ padding: '6px 8px' }}>15.50%</td><td style={{ padding: '6px 8px' }}>15.24%</td><td style={{ padding: '6px 8px' }}>15.00%</td><td style={{ padding: '6px 8px', fontWeight: 600, color: '#4ade80' }}>14.25%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 8px' }}>NTH &gt;50K–75K</td><td style={{ padding: '6px 8px' }}>15.24%</td><td style={{ padding: '6px 8px' }}>15.00%</td><td style={{ padding: '6px 8px' }}>14.75%</td><td style={{ padding: '6px 8px', fontWeight: 600, color: '#4ade80' }}>14.00%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 8px' }}>NTH &gt;75K</td><td style={{ padding: '6px 8px' }}>15.00%</td><td style={{ padding: '6px 8px' }}>14.75%</td><td style={{ padding: '6px 8px' }}>14.50%</td><td style={{ padding: '6px 8px', fontWeight: 600, color: '#4ade80' }}>13.75%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 8px' }}>NTH &gt;100K &amp; LA ≥ 20L</td><td style={{ padding: '6px 8px' }}>14.75%</td><td style={{ padding: '6px 8px' }}>14.50%</td><td style={{ padding: '6px 8px' }}>14.25%</td><td style={{ padding: '6px 8px', fontWeight: 600, color: '#4ade80' }}>13.50%</td></tr>
                            <tr><td style={{ padding: '6px 8px' }}>NTH &gt;100K &amp; LA ≥ 35L</td><td style={{ padding: '6px 8px', color: '#94a3b8' }}>NA</td><td style={{ padding: '6px 8px', color: '#94a3b8' }}>NA</td><td style={{ padding: '6px 8px', color: '#94a3b8' }}>NA</td><td style={{ padding: '6px 8px', color: '#94a3b8' }}>NA</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Grids 3, 4, 5 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      {/* Grid 3 - Cat C */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.88rem', marginBottom: '8px' }}>
                          📊 Category C Rate Grid
                        </div>
                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}>
                              <th style={{ padding: '5px' }}>Salary Slab</th>
                              <th style={{ padding: '5px' }}>≥700</th>
                              <th style={{ padding: '5px' }}>≥730</th>
                              <th style={{ padding: '5px' }}>≥750</th>
                              <th style={{ padding: '5px' }}>≥780</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '5px' }}>≤ 50K</td><td>16.00%</td><td>15.75%</td><td>15.50%</td><td style={{ color: '#4ade80' }}>15.24%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '5px' }}>&gt;50K–75K</td><td>15.50%</td><td>15.25%</td><td>15.00%</td><td style={{ color: '#4ade80' }}>14.50%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '5px' }}>&gt;75K</td><td>15.25%</td><td>15.00%</td><td>14.50%</td><td style={{ color: '#4ade80' }}>14.00%</td></tr>
                            <tr><td style={{ padding: '5px' }}>&gt;100K &amp; LA≥20L</td><td>14.74%</td><td>14.50%</td><td>14.25%</td><td style={{ color: '#4ade80' }}>14.00%</td></tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Grid 4 - Cat D */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.88rem', marginBottom: '8px' }}>
                          📊 Category D Rate Grid
                        </div>
                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}>
                              <th style={{ padding: '5px' }}>Salary Slab</th>
                              <th style={{ padding: '5px' }}>≥700</th>
                              <th style={{ padding: '5px' }}>≥730</th>
                              <th style={{ padding: '5px' }}>≥750</th>
                              <th style={{ padding: '5px' }}>≥780</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '5px' }}>≤ 50K</td><td>17.24%</td><td>16.24%</td><td>15.75%</td><td style={{ color: '#4ade80' }}>15.50%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '5px' }}>&gt;50K–75K</td><td>16.24%</td><td>15.75%</td><td>15.50%</td><td style={{ color: '#4ade80' }}>15.24%</td></tr>
                            <tr><td style={{ padding: '5px' }}>&gt;75K</td><td>15.75%</td><td>15.24%</td><td>15.00%</td><td style={{ color: '#4ade80' }}>14.74%</td></tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Grid 5 - Cat E */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(192, 132, 252, 0.2)', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#c084fc', fontSize: '0.88rem', marginBottom: '8px' }}>
                          📊 Category E Rate Grid
                        </div>
                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}>
                              <th style={{ padding: '5px' }}>Salary Slab</th>
                              <th style={{ padding: '5px' }}>≥700</th>
                              <th style={{ padding: '5px' }}>≥730</th>
                              <th style={{ padding: '5px' }}>≥750</th>
                              <th style={{ padding: '5px' }}>≥780</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '5px' }}>≤ 50K</td><td>19.75%</td><td>18.74%</td><td>18.50%</td><td style={{ color: '#4ade80' }}>18.25%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '5px' }}>&gt;50K–75K</td><td>18.24%</td><td>17.74%</td><td>17.50%</td><td style={{ color: '#4ade80' }}>17.25%</td></tr>
                            <tr><td style={{ padding: '5px' }}>&gt;75K</td><td>17.74%</td><td>17.24%</td><td>17.00%</td><td style={{ color: '#4ade80' }}>16.75%</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Additional ROI & PF Deviations Matrix */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <span>📌 Additional ROI, PF &amp; Minimum Insurance Matrix (Excel Rows 54–68)</span>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Minimum ROI not applicable for PFL Staff</span>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}>
                              <th style={{ padding: '7px 10px' }}>Deviation / Risk Scenario</th>
                              <th style={{ padding: '7px 10px', color: '#38bdf8' }}>Additional ROI</th>
                              <th style={{ padding: '7px 10px', color: '#fbbf24' }}>Additional PF</th>
                              <th style={{ padding: '7px 10px', color: '#f87171' }}>Minimum ROI Floor</th>
                              <th style={{ padding: '7px 10px', color: '#34d399' }}>Minimum Insurance</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 10px' }}>Eligibility as per 5 years with 70% FOIR &amp; Tenure 6 or 7 year</td><td>+0.00%</td><td>+0.00%</td><td>—</td><td style={{ color: '#34d399' }}>1.75%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 10px' }}>Eligibility as per 6-year FOIR (up to 70%)</td><td>+0.25%</td><td>+0.25%</td><td>—</td><td style={{ color: '#34d399' }}>1.75%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 10px' }}>Eligibility as per 7-year FOIR (up to 70%)</td><td>+0.50%</td><td>+0.25%</td><td>—</td><td style={{ color: '#34d399' }}>2.00%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 10px' }}>For FOIR deviation up to 5%</td><td>+0.25%</td><td>+0.25%</td><td>—</td><td style={{ color: '#34d399' }}>1.75%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 10px' }}>For FOIR deviation &gt; 5%</td><td>+0.50%</td><td>+0.50%</td><td style={{ color: '#f87171', fontWeight: 600 }}>13.49%</td><td style={{ color: '#34d399' }}>2.00%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 10px' }}>For FOIR &gt; 70% (If &gt; 2 CC or App loan BT)</td><td>+1.00%</td><td>+0.50%</td><td>—</td><td style={{ color: '#34d399' }}>1.75%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 10px' }}>For CIBIL 0 and -1 (NTC)</td><td>+1.00%</td><td>+1.00%</td><td style={{ color: '#f87171', fontWeight: 600 }}>14.50%</td><td style={{ color: '#34d399' }}>2.50%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 10px' }}>For CC / App Loan BT up to 2</td><td>+1.25%</td><td>+0.50%</td><td style={{ color: '#f87171', fontWeight: 600 }}>15.00%</td><td style={{ color: '#34d399' }}>2.25%</td></tr>
                            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}><td style={{ padding: '6px 10px' }}>For CC / App Loan BT from 3 card to 4 card</td><td>+2.25%</td><td>+1.00%</td><td style={{ color: '#f87171', fontWeight: 600 }}>16.25%</td><td style={{ color: '#34d399' }}>2.50%</td></tr>
                            <tr><td style={{ padding: '6px 10px' }}>For CC / App Loan BT &gt; 4 card</td><td>+3.35%</td><td>+1.50%</td><td style={{ color: '#f87171', fontWeight: 600 }}>17.25%</td><td style={{ color: '#34d399' }}>3.00%</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
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

              {(activeConfigBank?.id === 'poonawala' || activeConfigBank?.name?.toLowerCase().includes('poonawala')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 85, 150, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)',
                  border: '1.5px solid rgba(0, 85, 150, 0.4)',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.98rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Poonawalla Fincorp Loan Capping Matrix (Excel Sheet: POONAWALA — Section 3 &amp; 5)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', fontSize: '0.85rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Category-wise Loan Capping (Min: ₹1 Lakh):</strong>
                      <div style={{ marginTop: '6px' }}>• Super A &amp; Category A: <strong>₹1 Lakh to ₹60 Lakhs</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category B &amp; Govt: <strong>₹1 Lakh to ₹40 Lakhs</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category C: <strong>₹1 Lakh to ₹30 Lakhs</strong></div>
                      <div style={{ marginTop: '3px' }}>• Category D: <strong>₹1 Lakh to ₹10 Lakhs</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <strong style={{ color: '#34d399', fontSize: '0.88rem' }}>📌 City-wise Loan Capping (Excel Rows 86–87):</strong>
                      <div style={{ marginTop: '6px' }}>• Metro Cities: <strong>₹60 Lakhs Maximum</strong></div>
                      <div style={{ marginTop: '3px' }}>• Tier 1 Cities: <strong>₹50 Lakhs Maximum</strong></div>
                      <div style={{ marginTop: '3px' }}>• Tier 2 Cities: <strong>₹40 Lakhs Maximum</strong></div>
                      <div style={{ marginTop: '3px' }}>• Other Locations / Cities: <strong>₹25 Lakhs Maximum</strong></div>
                    </div>
                  </div>
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

              {(activeConfigBank?.id === 'piramal' || activeConfigBank?.name?.toLowerCase().includes('piramal')) && (
                <div style={{
                  background: 'rgba(31, 78, 120, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.35)',
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
                  <span><strong>Piramal Finance Master Policy (from Excel: Sheet PIRAMAL):</strong> Super A & Category A maximum sanction is <strong>₹50 Lakhs</strong> (Requires ₹2 Lakhs monthly salary & 750+ CIBIL score). Govt Category is capped at <strong>₹30 Lakhs</strong>. Category B, C, and D are evaluated on a <strong>CASE TO CASE</strong> basis (Min loan: ₹1 Lakh across all).</span>
                </div>
              )}

              {(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) && (
                <div style={{
                  background: 'rgba(0, 45, 98, 0.15)',
                  border: '1.5px solid rgba(56, 189, 248, 0.35)',
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
                  <span><strong>SMFG India Credit Policy (from Excel: BANKS POLICYS.xlsx - Sheet: SMFG):</strong> Maximum loan amount is strictly capped at <strong>₹30 Lakhs</strong> across all categories (Super A, A, B, C, D, Govt). Minimum loan amount is <strong>₹1 Lakh</strong> (1LAC).</span>
                </div>
              )}

              {(activeConfigBank?.id === 'cholamandalam' || activeConfigBank?.id === 'chola' || activeConfigBank?.name?.toLowerCase().includes('chola')) && (
                <div style={{
                  background: 'rgba(243, 112, 33, 0.12)',
                  border: '1.5px solid rgba(243, 112, 33, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#fdba74',
                  fontSize: '0.88rem'
                }}>
                  <AlertTriangle size={18} />
                  <span><strong>Cholamandalam Finance Policy (Excel Sheet: CHOLA):</strong> Maximum loan amount is <strong>₹30 Lakhs</strong> for Super A, A, Govt (Pvt ₹1.5L+ / Govt ₹1L+ salary; <strong>Co-app required above ₹20 Lakhs</strong> for Cat A), and <strong>₹20 Lakhs</strong> for Category B, C, D. Minimum loan amount is <strong>₹1 Lakh</strong> (1 LAC).</span>
                </div>
              )}

              {(activeConfigBank?.id === 'kotak' || activeConfigBank?.name?.toLowerCase().includes('kotak')) && (
                <div style={{
                  background: 'rgba(237, 28, 36, 0.10)',
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
                  <span><strong>Kotak Mahindra Bank Policy (Excel Sheet: KOTAK):</strong> Maximum loan amount is <strong>₹1 Crore (1 Cr)</strong> for Super A, A, B, and Govt; <strong>₹35 Lakhs</strong> for Category C; and <strong>₹20 Lakhs</strong> for Category D. Minimum loan amount is <strong>₹1 Lakh</strong>.</span>
                </div>
              )}

              {(activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan')) && (
                <div style={{
                  background: 'rgba(220, 0, 40, 0.10)',
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
                  <AlertTriangle size={18} />
                  <span><strong>Bandhan Bank Policy (Excel Sheet: BANDHAN BANK):</strong> Flat maximum loan sanction limit of <strong>₹25 Lakhs (25LAC)</strong> across all company categories (Super A, A, B, C, D, Govt). Minimum loan amount is <strong>₹1 Lakh</strong> (1LAC).</span>
                </div>
              )}

              {(activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) && (
                <div style={{
                  background: 'rgba(0, 114, 187, 0.10)',
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
                  <AlertTriangle size={18} />
                  <span><strong>Bajaj Finance Policy (Excel Sheet: BAJAJ - Section 5):</strong> Absolute maximum loan sanction is <strong>₹50 Lakhs (50LAC)</strong> across all categories (Super A, A, B, C, D, Govt; Min loan ₹1 Lakh). <strong>Unlisted Company Cap:</strong> Strictly capped at <strong>₹28 Lakhs</strong> (<code>UNLISTED M 28LAC</code>). <strong>Sal Lite Program:</strong> Maximum loan capped at <strong>₹14 Lakhs</strong> (<code>SAL LITE 14LAC</code>).</span>
                </div>
              )}

              {(activeConfigBank?.id === 'au-bank' || activeConfigBank?.id === 'au' || activeConfigBank?.name?.toLowerCase().includes('au ')) && (
                <div style={{
                  background: 'rgba(111, 44, 145, 0.12)',
                  border: '1.5px solid rgba(192, 132, 252, 0.35)',
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
                  <span><strong>AU Small Finance Bank Policy (Excel Sheet: AU BANK - Section 3 & Row 36):</strong> Overall maximum loan capping is <strong>₹15 Lakhs (15LAC)</strong> across all categories (Super A, A, B, C, D, Govt; Min loan ₹50,000). <strong>Special Capping Limits:</strong> NTC (-1 CIBIL): <strong>₹3 Lakhs</strong> | Thin CIBIL Cat C/Others: <strong>₹7.50 Lakhs</strong> | Bachelor Capping: <strong>Removed (No Restriction)</strong>.</span>
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
                          <span className="cat-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.78rem' }}>
                            No Restriction
                          </span>
                        </td>
                        <td>
                          <span className="tag-lakhs">
                            Up to ₹{(row.maxLoan / 100000).toFixed(1)} Lakhs
                            {row.condition ? ` (${row.condition})` : ''}
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

              {(activeConfigBank?.id === 'piramal' || activeConfigBank?.name?.toLowerCase().includes('piramal')) && (
                <div style={{
                  background: 'rgba(31, 78, 120, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.35)',
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
                  <span><strong>Piramal Finance Tenure Windows (from Excel: BANKS POLICYS.xlsx):</strong> Standard Personal Loan tenure is <strong>12 to 72 Months (Up to 6 Years)</strong> across all categories. <strong>OD Program:</strong> Max tenure extends to <strong>84 Months (7 Years)</strong>. For Super A & A with &gt;₹1 Lakh Net Monthly Salary under OD+, tenure extends up to <strong>96 Months (8 Years)</strong>!</span>
                </div>
              )}

              {(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) && (
                <div style={{
                  background: 'rgba(0, 45, 98, 0.15)',
                  border: '1.5px solid rgba(56, 189, 248, 0.35)',
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
                  <span><strong>SMFG India Credit Tenure Windows (from Excel Sheet: SMFG):</strong> Repayment tenure is flat <strong>12 to 60 Months (Up to 5 Years)</strong> across all categories (Super A, A, B, C, D, Govt).</span>
                </div>
              )}

              {(activeConfigBank?.id === 'cholamandalam' || activeConfigBank?.id === 'chola' || activeConfigBank?.name?.toLowerCase().includes('chola')) && (
                <div style={{
                  background: 'rgba(243, 112, 33, 0.12)',
                  border: '1.5px solid rgba(243, 112, 33, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#fdba74',
                  fontSize: '0.88rem'
                }}>
                  <CheckCircle2 size={18} />
                  <span><strong>Cholamandalam Finance Tenure Windows (Excel Sheet: CHOLA):</strong> Repayment tenure is <strong>12 to 84 Months (Up to 7 Years)</strong> for Super A, A, B, and Govt. Category C & D are capped to <strong>12 to 60 Months (Up to 5 Years)</strong>.</span>
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

              {(activeConfigBank?.id === 'poonawala' || activeConfigBank?.name?.toLowerCase().includes('poonawala')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 85, 150, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)',
                  border: '1.5px solid rgba(0, 85, 150, 0.4)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#93c5fd',
                  fontSize: '0.88rem'
                }}>
                  <CheckCircle2 size={18} />
                  <span><strong>Poonawalla Fincorp Master Tenure Policy (from Excel: Sheet POONAWALA):</strong> Super A, Category A, and Govt qualify for up to <strong>84 Months (7 Years)</strong> (`CAT A 84 MONTH`). Category B, C, and D are capped at <strong>72 Months (6 Years)</strong> (`CAT B,C,D 72 MONTH`). Minimum tenure is <strong>12 Months</strong> across all categories. Maximum applicant age at loan maturity / retirement is <strong>60 Years</strong>.</span>
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

              {(activeConfigBank?.id === 'cholamandalam' || activeConfigBank?.id === 'chola' || activeConfigBank?.name?.toLowerCase().includes('chola')) && (
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
                    <span>Cholamandalam Finance Policy Rules (Excel Sheet: CHOLA)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(243, 112, 33, 0.2)' }}>
                      <strong style={{ color: '#fb923c', fontSize: '0.88rem' }}>📌 Multipliers & FOIR Slabs:</strong>
                      <div style={{ marginTop: '5px' }}>• <strong>30k+ Salary:</strong> Super A & Govt: <strong>70% FOIR (35x)</strong> | Cat A & B: <strong>70% (28x)</strong> | Cat C & D: <strong>65% (25x)</strong></div>
                      <div style={{ marginTop: '3px' }}>• <strong>25k–30k Salary:</strong> Super A & Govt: <strong>65% FOIR (30x)</strong> | Cat A & B: <strong>65% (24x)</strong> | Cat C & D: <strong>55% (20x)</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Credit Card BT & Capping:</strong>
                      <div style={{ marginTop: '5px' }}>• Max Cards Allowed: <strong>Up to 6 Credit Cards</strong> (`6 CCBT ALLOW`)</div>
                      <div style={{ marginTop: '3px' }}>• Outstanding POS Cap: <strong>≤ 6x Net Monthly Salary</strong> (`6 TIME NOT ALLOW FOR BT`)</div>
                      <div style={{ marginTop: '3px' }}>• CC Obligation: <strong>5% of Outstanding</strong> (`5% OBLIGATION`)</div>
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

              {(activeConfigBank?.id === 'piramal' || activeConfigBank?.name?.toLowerCase().includes('piramal')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(31, 78, 120, 0.18) 0%, rgba(14, 165, 233, 0.12) 100%)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.98rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Piramal Finance CIBIL Score & Ventile Band Policy (Editable Master Tables)</span>
                  </div>

                  {/* Table 1: FOIR Matrix by CIBIL Score Range */}
                  <div>
                    <div style={{ color: '#38bdf8', fontSize: '0.88rem', marginBottom: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} />
                      <span>Table 1: Piramal FOIR Matrix by CIBIL Score Range (Editable)</span>
                    </div>
                    <div className="table-responsive">
                      <table className="policy-table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr>
                            <th>CIBIL Score Range</th>
                            <th>Ventile Band</th>
                            <th style={{ color: '#38bdf8' }}>Low FOIR %</th>
                            <th style={{ color: '#38bdf8' }}>Medium FOIR %</th>
                            <th style={{ color: '#4ade80' }}>High FOIR % (Max)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(policyData?.cibilVentileBands || [
                            { cibilRange: '< 700 / NTC', ventileBand: 'NTC / V4-V5', lowFoir: 40, medFoir: 50, highFoir: 55, eliteMult: 7.5, catBCMult: 6, govtHighNmiMult: 5, govtLowNmiMult: 5, btGovtHighNmiMult: 5, othersMult: 5 },
                            { cibilRange: '700 – 729', ventileBand: 'V6-V7', lowFoir: 40, medFoir: 55, highFoir: 60, eliteMult: 9, catBCMult: 7.5, govtHighNmiMult: 6, govtLowNmiMult: 6, btGovtHighNmiMult: 7, othersMult: 6 },
                            { cibilRange: '730 – 749', ventileBand: 'V8-V9', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 15, catBCMult: 10, govtHighNmiMult: 8, govtLowNmiMult: 8, btGovtHighNmiMult: 10, othersMult: 8 },
                            { cibilRange: '750 – 774', ventileBand: 'V10-V12', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 24, catBCMult: 15, govtHighNmiMult: 15, govtLowNmiMult: 12, btGovtHighNmiMult: 18, othersMult: 12 },
                            { cibilRange: '775 – 800+', ventileBand: 'V13-V20', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 30, catBCMult: 22, govtHighNmiMult: 20, govtLowNmiMult: 15, btGovtHighNmiMult: 24, othersMult: 18 }
                          ]).map((band, idx) => (
                            <tr key={idx}>
                              <td><strong style={{ color: '#fbbf24' }}>{band.cibilRange}</strong></td>
                              <td><strong style={{ color: '#38bdf8' }}>{band.ventileBand}</strong></td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number"
                                    value={band.lowFoir}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const bands = [...(policyData?.cibilVentileBands || [
                                        { cibilRange: '< 700 / NTC', ventileBand: 'NTC / V4-V5', lowFoir: 40, medFoir: 50, highFoir: 55, eliteMult: 7.5, catBCMult: 6, govtHighNmiMult: 5, govtLowNmiMult: 5, btGovtHighNmiMult: 5, othersMult: 5 },
                                        { cibilRange: '700 – 729', ventileBand: 'V6-V7', lowFoir: 40, medFoir: 55, highFoir: 60, eliteMult: 9, catBCMult: 7.5, govtHighNmiMult: 6, govtLowNmiMult: 6, btGovtHighNmiMult: 7, othersMult: 6 },
                                        { cibilRange: '730 – 749', ventileBand: 'V8-V9', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 15, catBCMult: 10, govtHighNmiMult: 8, govtLowNmiMult: 8, btGovtHighNmiMult: 10, othersMult: 8 },
                                        { cibilRange: '750 – 774', ventileBand: 'V10-V12', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 24, catBCMult: 15, govtHighNmiMult: 15, govtLowNmiMult: 12, btGovtHighNmiMult: 18, othersMult: 12 },
                                        { cibilRange: '775 – 800+', ventileBand: 'V13-V20', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 30, catBCMult: 22, govtHighNmiMult: 20, govtLowNmiMult: 15, btGovtHighNmiMult: 24, othersMult: 18 }
                                      ])];
                                      bands[idx] = { ...bands[idx], lowFoir: val };
                                      setPolicyData({ ...policyData, cibilVentileBands: bands });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell">
                                  <input 
                                    type="number"
                                    value={band.medFoir}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const bands = [...(policyData?.cibilVentileBands || [
                                        { cibilRange: '< 700 / NTC', ventileBand: 'NTC / V4-V5', lowFoir: 40, medFoir: 50, highFoir: 55, eliteMult: 7.5, catBCMult: 6, govtHighNmiMult: 5, govtLowNmiMult: 5, btGovtHighNmiMult: 5, othersMult: 5 },
                                        { cibilRange: '700 – 729', ventileBand: 'V6-V7', lowFoir: 40, medFoir: 55, highFoir: 60, eliteMult: 9, catBCMult: 7.5, govtHighNmiMult: 6, govtLowNmiMult: 6, btGovtHighNmiMult: 7, othersMult: 6 },
                                        { cibilRange: '730 – 749', ventileBand: 'V8-V9', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 15, catBCMult: 10, govtHighNmiMult: 8, govtLowNmiMult: 8, btGovtHighNmiMult: 10, othersMult: 8 },
                                        { cibilRange: '750 – 774', ventileBand: 'V10-V12', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 24, catBCMult: 15, govtHighNmiMult: 15, govtLowNmiMult: 12, btGovtHighNmiMult: 18, othersMult: 12 },
                                        { cibilRange: '775 – 800+', ventileBand: 'V13-V20', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 30, catBCMult: 22, govtHighNmiMult: 20, govtLowNmiMult: 15, btGovtHighNmiMult: 24, othersMult: 18 }
                                      ])];
                                      bands[idx] = { ...bands[idx], medFoir: val };
                                      setPolicyData({ ...policyData, cibilVentileBands: bands });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number"
                                    value={band.highFoir}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const bands = [...(policyData?.cibilVentileBands || [
                                        { cibilRange: '< 700 / NTC', ventileBand: 'NTC / V4-V5', lowFoir: 40, medFoir: 50, highFoir: 55, eliteMult: 7.5, catBCMult: 6, govtHighNmiMult: 5, govtLowNmiMult: 5, btGovtHighNmiMult: 5, othersMult: 5 },
                                        { cibilRange: '700 – 729', ventileBand: 'V6-V7', lowFoir: 40, medFoir: 55, highFoir: 60, eliteMult: 9, catBCMult: 7.5, govtHighNmiMult: 6, govtLowNmiMult: 6, btGovtHighNmiMult: 7, othersMult: 6 },
                                        { cibilRange: '730 – 749', ventileBand: 'V8-V9', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 15, catBCMult: 10, govtHighNmiMult: 8, govtLowNmiMult: 8, btGovtHighNmiMult: 10, othersMult: 8 },
                                        { cibilRange: '750 – 774', ventileBand: 'V10-V12', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 24, catBCMult: 15, govtHighNmiMult: 15, govtLowNmiMult: 12, btGovtHighNmiMult: 18, othersMult: 12 },
                                        { cibilRange: '775 – 800+', ventileBand: 'V13-V20', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 30, catBCMult: 22, govtHighNmiMult: 20, govtLowNmiMult: 15, btGovtHighNmiMult: 24, othersMult: 18 }
                                      ])];
                                      bands[idx] = { ...bands[idx], highFoir: val };
                                      setPolicyData({ ...policyData, cibilVentileBands: bands });
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

                  {/* Table 2: Salary Multipliers Matrix by CIBIL Score Range & Profile */}
                  <div>
                    <div style={{ color: '#fdba74', fontSize: '0.88rem', marginBottom: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} />
                      <span>Table 2: Piramal Salary Multipliers Matrix by CIBIL Score Range & Profile (Editable)</span>
                    </div>
                    <div className="table-responsive">
                      <table className="policy-table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr>
                            <th>CIBIL Score Range</th>
                            <th>Ventile Band</th>
                            <th style={{ color: '#f59e0b' }}>Elite / Cat A Mult</th>
                            <th style={{ color: '#fbba74' }}>Cat B/C Mult</th>
                            <th style={{ color: '#38bdf8' }}>Govt (≥ 60K)</th>
                            <th style={{ color: '#38bdf8' }}>Govt (&lt; 60K)</th>
                            <th style={{ color: '#86efac' }}>BT Govt (≥ 60K)</th>
                            <th>Others Mult</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(policyData?.cibilVentileBands || [
                            { cibilRange: '< 700 / NTC', ventileBand: 'NTC / V4-V5', lowFoir: 40, medFoir: 50, highFoir: 55, eliteMult: 7.5, catBCMult: 6, govtHighNmiMult: 5, govtLowNmiMult: 5, btGovtHighNmiMult: 5, othersMult: 5 },
                            { cibilRange: '700 – 729', ventileBand: 'V6-V7', lowFoir: 40, medFoir: 55, highFoir: 60, eliteMult: 9, catBCMult: 7.5, govtHighNmiMult: 6, govtLowNmiMult: 6, btGovtHighNmiMult: 7, othersMult: 6 },
                            { cibilRange: '730 – 749', ventileBand: 'V8-V9', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 15, catBCMult: 10, govtHighNmiMult: 8, govtLowNmiMult: 8, btGovtHighNmiMult: 10, othersMult: 8 },
                            { cibilRange: '750 – 774', ventileBand: 'V10-V12', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 24, catBCMult: 15, govtHighNmiMult: 15, govtLowNmiMult: 12, btGovtHighNmiMult: 18, othersMult: 12 },
                            { cibilRange: '775 – 800+', ventileBand: 'V13-V20', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 30, catBCMult: 22, govtHighNmiMult: 20, govtLowNmiMult: 15, btGovtHighNmiMult: 24, othersMult: 18 }
                          ]).map((band, idx) => (
                            <tr key={idx}>
                              <td><strong style={{ color: '#fbbf24' }}>{band.cibilRange}</strong></td>
                              <td><strong style={{ color: '#38bdf8' }}>{band.ventileBand}</strong></td>
                              {['eliteMult', 'catBCMult', 'govtHighNmiMult', 'govtLowNmiMult', 'btGovtHighNmiMult', 'othersMult'].map((fieldKey) => (
                                <td key={fieldKey}>
                                  <div className="table-input-cell">
                                    <input 
                                      type="number"
                                      step="0.5"
                                      value={band[fieldKey]}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const bands = [...(policyData?.cibilVentileBands || [
                                          { cibilRange: '< 700 / NTC', ventileBand: 'NTC / V4-V5', lowFoir: 40, medFoir: 50, highFoir: 55, eliteMult: 7.5, catBCMult: 6, govtHighNmiMult: 5, govtLowNmiMult: 5, btGovtHighNmiMult: 5, othersMult: 5 },
                                          { cibilRange: '700 – 729', ventileBand: 'V6-V7', lowFoir: 40, medFoir: 55, highFoir: 60, eliteMult: 9, catBCMult: 7.5, govtHighNmiMult: 6, govtLowNmiMult: 6, btGovtHighNmiMult: 7, othersMult: 6 },
                                          { cibilRange: '730 – 749', ventileBand: 'V8-V9', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 15, catBCMult: 10, govtHighNmiMult: 8, govtLowNmiMult: 8, btGovtHighNmiMult: 10, othersMult: 8 },
                                          { cibilRange: '750 – 774', ventileBand: 'V10-V12', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 24, catBCMult: 15, govtHighNmiMult: 15, govtLowNmiMult: 12, btGovtHighNmiMult: 18, othersMult: 12 },
                                          { cibilRange: '775 – 800+', ventileBand: 'V13-V20', lowFoir: 50, medFoir: 65, highFoir: 70, eliteMult: 30, catBCMult: 22, govtHighNmiMult: 20, govtLowNmiMult: 15, btGovtHighNmiMult: 24, othersMult: 18 }
                                        ])];
                                        bands[idx] = { ...bands[idx], [fieldKey]: val };
                                        setPolicyData({ ...policyData, cibilVentileBands: bands });
                                      }}
                                    />
                                    <span>x</span>
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 45, 98, 0.20) 0%, rgba(14, 165, 233, 0.15) 100%)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.98rem' }}>
                    <CheckCircle2 size={18} />
                    <span>SMFG India Credit Master FOIR & Multiplier Policy (Excel Sheet: SMFG)</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#93c5fd' }}>
                    📌 Policy Rule: FOIR & Multipliers for SMFG India Credit depend <strong>STRICTLY ON SALARY SLABS</strong> (Category Independent).
                  </div>

                  <div className="table-responsive">
                    <table className="policy-table" style={{ fontSize: '0.82rem', width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Salary Band (Monthly Net Income)</th>
                          <th style={{ color: '#38bdf8' }}>Max FOIR %</th>
                          <th style={{ color: '#fbba74' }}>Multiplier</th>
                          <th>Special Rules / Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { band: 'Income Less Than 25K', foir: 'Not Eligible (0%)', mult: 'N/A', note: 'Min ₹25K+ Salary required with 0 deduction', isEligible: false },
                          { band: '25K-30K', foir: '60%', mult: '12 TO 13', note: 'AS PER COM CAT AND PROFILE BASE', isEligible: true },
                          { band: '30K-35K', foir: '65%', mult: '15 TO 16', note: 'AS PER COM CAT AND PROFILE BASE', isEligible: true },
                          { band: '35K-40K', foir: '70%', mult: '16 TO 18', note: 'COM TYPE PROP/PART/LLP FIRM MAX FOIR 55%', isEligible: true },
                          { band: '40K-50K', foir: '70%', mult: '18 TO 20', note: 'Standard 70% Max FOIR', isEligible: true },
                          { band: '50K-75K', foir: '70%', mult: '22 TO 25', note: 'Standard 70% Max FOIR', isEligible: true },
                          { band: '75K-100K', foir: '70%', mult: '23 TO 30', note: 'Standard 70% Max FOIR', isEligible: true },
                          { band: '100K and Above', foir: '70%', mult: '23 TO 30', note: 'Max Multiplier up to 30x', isEligible: true }
                        ].map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td><strong style={{ color: row.isEligible ? '#fbbf24' : '#f87171' }}>{row.band}</strong></td>
                            <td><strong style={{ color: row.isEligible ? '#38bdf8' : '#f87171' }}>{row.foir}</strong></td>
                            <td><span style={{ color: '#f59e0b', fontWeight: 700 }}>{row.mult}</span></td>
                            <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0', marginTop: '6px' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                      <strong style={{ color: '#fca5a5', fontSize: '0.88rem' }}>📌 Special Firm FOIR Restriction:</strong>
                      <div style={{ marginTop: '5px' }}>• <strong>PROP / PART / LLP FIRM:</strong> Max FOIR strictly capped at <strong>55%</strong> (`COM TYPE PROP/PART/LLP FIRM MAX FOIR 55%`)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                      <strong style={{ color: '#86efac', fontSize: '0.88rem' }}>📌 Credit Card Obligation & BT Rules:</strong>
                      <div style={{ marginTop: '5px' }}>• <strong>Credit Card Obligation:</strong> <strong>5%</strong> of Limit</div>
                      <div style={{ marginTop: '3px' }}>• <strong>Balance Transfer (BT):</strong> Maximum <strong>2 Credit Card BTs</strong> allowed (`MAX 2 CC BT`)</div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(14, 165, 233, 0.12) 100%)',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.98rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Bandhan Bank Master Policy: Net Salary FOIR & Tenure Multiplier Matrix (Excel Sheet: BANDHAN BANK)</span>
                  </div>

                  {/* Section 2: FOIR Slabs Table (Editable by Salary Range - Excel Screenshot 3) */}
                  <div>
                    <div style={{ color: '#38bdf8', fontSize: '0.88rem', marginBottom: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} />
                      <span>Section 2: Bandhan Bank FOIR Slabs by Monthly Net Income (Editable - Excel Policy)</span>
                    </div>
                    <div className="table-responsive">
                      <table className="policy-table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr>
                            <th>Monthly Net Income Range</th>
                            <th style={{ color: '#38bdf8' }}>FOIR %</th>
                            <th>Policy Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(policyData?.salaryFoirSlabs || [
                            { incomeSlab: '<= 30000', foir: 50, note: '50% FOIR' },
                            { incomeSlab: '30001 to 50000', foir: 60, note: '60% FOIR' },
                            { incomeSlab: '50001 to 75000', foir: 65, note: '65% FOIR' },
                            { incomeSlab: '>= 75001', foir: 70, note: '70% FOIR' }
                          ]).map((slab, sIdx) => (
                            <tr key={sIdx}>
                              <td><strong style={{ color: '#fbbf24' }}>{slab.incomeSlab}</strong></td>
                              <td>
                                <div className="table-input-cell highlight">
                                  <input 
                                    type="number"
                                    value={slab.foir}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const slabs = [...(policyData?.salaryFoirSlabs || [
                                        { incomeSlab: '<= 30000', foir: 50, note: '50% FOIR' },
                                        { incomeSlab: '30001 to 50000', foir: 60, note: '60% FOIR' },
                                        { incomeSlab: '50001 to 75000', foir: 65, note: '65% FOIR' },
                                        { incomeSlab: '>= 75001', foir: 70, note: '70% FOIR' }
                                      ])];
                                      slabs[sIdx] = { ...slabs[sIdx], foir: val };
                                      setPolicyData({ ...policyData, salaryFoirSlabs: slabs });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                              </td>
                              <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{slab.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 6: Multiplier based Eligibility Tables (Editable per Category, Salary & Tenure) */}
                  <div>
                    <div style={{ color: '#93c5fd', fontSize: '0.88rem', marginBottom: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} />
                      <span>Section 6: Multiplier-Based Eligibility Matrix by Salary & Tenure (Editable)</span>
                    </div>
                    
                    <div className="table-responsive" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* Table 1: Super A, A, B, Govt */}
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                          Table 1: CAT A & CAT B - Salaried (Super A, A, B, Govt)
                        </div>
                        <table className="policy-table" style={{ fontSize: '0.80rem' }}>
                          <thead>
                            <tr>
                              <th>Monthly Net Income</th>
                              <th>12M</th>
                              <th>13-24M</th>
                              <th>25-36M</th>
                              <th>37-48M</th>
                              <th style={{ color: '#4ade80' }}>49-60M</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { key: '<=30000', label: '< 30,000', defaults: { '12m': 6, '24m': 10, '36m': 14, '48m': 17, '60m': 20 } },
                              { key: '30001-50000', label: '30,001 to 50,000', defaults: { '12m': 7, '24m': 13, '36m': 15, '48m': 21, '60m': 22 } },
                              { key: '50001-75000', label: '50,001 to 75,000', defaults: { '12m': 8, '24m': 13, '36m': 16, '48m': 22, '60m': 24 } },
                              { key: '>75000', label: '>= 75,001', defaults: { '12m': 9, '24m': 14, '36m': 18, '48m': 23, '60m': 25 } }
                            ].map((rowDef) => (
                              <tr key={rowDef.key}>
                                <td><strong style={{ color: '#fbbf24' }}>{rowDef.label}</strong></td>
                                {['12m', '24m', '36m', '48m', '60m'].map((tKey) => (
                                  <td key={tKey}>
                                    <div className="table-input-cell">
                                      <input 
                                        type="number"
                                        value={policyData?.multiplierMatrix?.['AB_GOVT']?.[rowDef.key]?.[tKey] ?? rowDef.defaults[tKey]}
                                        onChange={(e) => {
                                          const val = e.target.value === '' ? null : Number(e.target.value);
                                          const matrix = JSON.parse(JSON.stringify(policyData?.multiplierMatrix || {
                                            'AB_GOVT': {
                                              '<=30000': { '12m': 6, '24m': 10, '36m': 14, '48m': 17, '60m': 20 },
                                              '30001-50000': { '12m': 7, '24m': 13, '36m': 15, '48m': 21, '60m': 22 },
                                              '50001-75000': { '12m': 8, '24m': 13, '36m': 16, '48m': 22, '60m': 24 },
                                              '>75000': { '12m': 9, '24m': 14, '36m': 18, '48m': 23, '60m': 25 }
                                            },
                                            'C': {
                                              '<=30000': { '12m': 5, '24m': 7, '36m': 10, '48m': 12, '60m': null },
                                              '30001-50000': { '12m': 7, '24m': 9, '36m': 12, '48m': 14, '60m': null },
                                              '50001-75000': { '12m': 7, '24m': 10, '36m': 16, '48m': 17, '60m': 18 },
                                              '>75000': { '12m': 9, '24m': 11, '36m': 17, '48m': 18, '60m': 22 }
                                            },
                                            'D': {
                                              '<=30000': { '12m': 5, '24m': 7, '36m': 10, '48m': 12, '60m': null },
                                              '30001-50000': { '12m': 7, '24m': 9, '36m': 12, '48m': 14, '60m': null },
                                              '50001-75000': { '12m': 7, '24m': 10, '36m': 16, '48m': 17, '60m': null },
                                              '>75000': { '12m': 9, '24m': 11, '36m': 17, '48m': 18, '60m': null }
                                            }
                                          }));
                                          if (!matrix['AB_GOVT']) matrix['AB_GOVT'] = {};
                                          if (!matrix['AB_GOVT'][rowDef.key]) matrix['AB_GOVT'][rowDef.key] = {};
                                          matrix['AB_GOVT'][rowDef.key][tKey] = val;
                                          setPolicyData({ ...policyData, multiplierMatrix: matrix });
                                        }}
                                      />
                                      <span>x</span>
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Table 2: Cat C */}
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', marginBottom: '6px' }}>
                          Table 2: Cat C - Salaried (≤50k Salary max tenure 48 Months)
                        </div>
                        <table className="policy-table" style={{ fontSize: '0.80rem' }}>
                          <thead>
                            <tr>
                              <th>Monthly Net Income</th>
                              <th>12M</th>
                              <th>13-24M</th>
                              <th>25-36M</th>
                              <th>37-48M</th>
                              <th>49-60M</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { key: '<=30000', label: '< 30,000', defaults: { '12m': 5, '24m': 7, '36m': 10, '48m': 12, '60m': null } },
                              { key: '30001-50000', label: '30,001 to 50,000', defaults: { '12m': 7, '24m': 9, '36m': 12, '48m': 14, '60m': null } },
                              { key: '50001-75000', label: '50,001 to 75,000', defaults: { '12m': 7, '24m': 10, '36m': 16, '48m': 17, '60m': 18 } },
                              { key: '>75000', label: '>= 75,001', defaults: { '12m': 9, '24m': 11, '36m': 17, '48m': 18, '60m': 22 } }
                            ].map((rowDef) => (
                              <tr key={rowDef.key}>
                                <td><strong style={{ color: '#fbbf24' }}>{rowDef.label}</strong></td>
                                {['12m', '24m', '36m', '48m', '60m'].map((tKey) => (
                                  <td key={tKey}>
                                    <div className="table-input-cell">
                                      <input 
                                        type="number"
                                        value={policyData?.multiplierMatrix?.['C']?.[rowDef.key]?.[tKey] ?? (rowDef.defaults[tKey] ?? '')}
                                        placeholder="NA"
                                        onChange={(e) => {
                                          const val = e.target.value === '' ? null : Number(e.target.value);
                                          const matrix = JSON.parse(JSON.stringify(policyData?.multiplierMatrix || {
                                            'AB_GOVT': {
                                              '<=30000': { '12m': 6, '24m': 10, '36m': 14, '48m': 17, '60m': 20 },
                                              '30001-50000': { '12m': 7, '24m': 13, '36m': 15, '48m': 21, '60m': 22 },
                                              '50001-75000': { '12m': 8, '24m': 13, '36m': 16, '48m': 22, '60m': 24 },
                                              '>75000': { '12m': 9, '24m': 14, '36m': 18, '48m': 23, '60m': 25 }
                                            },
                                            'C': {
                                              '<=30000': { '12m': 5, '24m': 7, '36m': 10, '48m': 12, '60m': null },
                                              '30001-50000': { '12m': 7, '24m': 9, '36m': 12, '48m': 14, '60m': null },
                                              '50001-75000': { '12m': 7, '24m': 10, '36m': 16, '48m': 17, '60m': 18 },
                                              '>75000': { '12m': 9, '24m': 11, '36m': 17, '48m': 18, '60m': 22 }
                                            },
                                            'D': {
                                              '<=30000': { '12m': 5, '24m': 7, '36m': 10, '48m': 12, '60m': null },
                                              '30001-50000': { '12m': 7, '24m': 9, '36m': 12, '48m': 14, '60m': null },
                                              '50001-75000': { '12m': 7, '24m': 10, '36m': 16, '48m': 17, '60m': null },
                                              '>75000': { '12m': 9, '24m': 11, '36m': 17, '48m': 18, '60m': null }
                                            }
                                          }));
                                          if (!matrix['C']) matrix['C'] = {};
                                          if (!matrix['C'][rowDef.key]) matrix['C'][rowDef.key] = {};
                                          matrix['C'][rowDef.key][tKey] = val;
                                          setPolicyData({ ...policyData, multiplierMatrix: matrix });
                                        }}
                                      />
                                      <span>x</span>
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Table 3: Cat D */}
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>
                          Table 3: CAT D - Salaried (Maximum Tenure Strictly 48 Months)
                        </div>
                        <table className="policy-table" style={{ fontSize: '0.80rem' }}>
                          <thead>
                            <tr>
                              <th>Monthly Net Income</th>
                              <th>12M</th>
                              <th>13-24M</th>
                              <th>25-36M</th>
                              <th>37-48M</th>
                              <th>49-60M</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { key: '<=30000', label: '< 30,000 (Min ₹40k)', defaults: { '12m': 5, '24m': 7, '36m': 10, '48m': 12, '60m': null } },
                              { key: '30001-50000', label: '30,001 to 50,000', defaults: { '12m': 7, '24m': 9, '36m': 12, '48m': 14, '60m': null } },
                              { key: '50001-75000', label: '50,001 to 75,000', defaults: { '12m': 7, '24m': 10, '36m': 16, '48m': 17, '60m': null } },
                              { key: '>75000', label: '>= 75,001', defaults: { '12m': 9, '24m': 11, '36m': 17, '48m': 18, '60m': null } }
                            ].map((rowDef) => (
                              <tr key={rowDef.key}>
                                <td><strong style={{ color: '#f87171' }}>{rowDef.label}</strong></td>
                                {['12m', '24m', '36m', '48m', '60m'].map((tKey) => (
                                  <td key={tKey}>
                                    <div className="table-input-cell">
                                      <input 
                                        type="number"
                                        value={policyData?.multiplierMatrix?.['D']?.[rowDef.key]?.[tKey] ?? (rowDef.defaults[tKey] ?? '')}
                                        placeholder="NA"
                                        onChange={(e) => {
                                          const val = e.target.value === '' ? null : Number(e.target.value);
                                          const matrix = JSON.parse(JSON.stringify(policyData?.multiplierMatrix || {
                                            'AB_GOVT': {
                                              '<=30000': { '12m': 6, '24m': 10, '36m': 14, '48m': 17, '60m': 20 },
                                              '30001-50000': { '12m': 7, '24m': 13, '36m': 15, '48m': 21, '60m': 22 },
                                              '50001-75000': { '12m': 8, '24m': 13, '36m': 16, '48m': 22, '60m': 24 },
                                              '>75000': { '12m': 9, '24m': 14, '36m': 18, '48m': 23, '60m': 25 }
                                            },
                                            'C': {
                                              '<=30000': { '12m': 5, '24m': 7, '36m': 10, '48m': 12, '60m': null },
                                              '30001-50000': { '12m': 7, '24m': 9, '36m': 12, '48m': 14, '60m': null },
                                              '50001-75000': { '12m': 7, '24m': 10, '36m': 16, '48m': 17, '60m': 18 },
                                              '>75000': { '12m': 9, '24m': 11, '36m': 17, '48m': 18, '60m': 22 }
                                            },
                                            'D': {
                                              '<=30000': { '12m': 5, '24m': 7, '36m': 10, '48m': 12, '60m': null },
                                              '30001-50000': { '12m': 7, '24m': 9, '36m': 12, '48m': 14, '60m': null },
                                              '50001-75000': { '12m': 7, '24m': 10, '36m': 16, '48m': 17, '60m': null },
                                              '>75000': { '12m': 9, '24m': 11, '36m': 17, '48m': 18, '60m': null }
                                            }
                                          }));
                                          if (!matrix['D']) matrix['D'] = {};
                                          if (!matrix['D'][rowDef.key]) matrix['D'][rowDef.key] = {};
                                          matrix['D'][rowDef.key][tKey] = val;
                                          setPolicyData({ ...policyData, multiplierMatrix: matrix });
                                        }}
                                      />
                                      <span>x</span>
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {(activeConfigBank?.id === 'poonawala' || activeConfigBank?.name?.toLowerCase().includes('poonawala')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 85, 150, 0.18) 0%, rgba(16, 185, 129, 0.15) 100%)',
                  border: '1.5px solid rgba(0, 85, 150, 0.45)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '1rem' }}>
                      <CheckCircle2 size={20} />
                      <span>Poonawalla Fincorp Master FOIR &amp; Obligation Policy (Excel Sheet: POONAWALA)</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      Pure FOIR Model (No Multiplier Restrictions)
                    </span>
                  </div>

                  {/* FOIR Matrix Table from Excel */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem', marginBottom: '8px' }}>
                      📌 FOIR Matrix across Salary Slabs (Excel Section 5 Rows 76–82):
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}>
                            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Salary Bracket (NTH)</th>
                            <th style={{ padding: '6px 10px', color: '#38bdf8' }}>CAT A</th>
                            <th style={{ padding: '6px 10px', color: '#34d399' }}>CAT B / GOVT</th>
                            <th style={{ padding: '6px 10px', color: '#fbbf24' }}>CAT C</th>
                            <th style={{ padding: '6px 10px', color: '#f87171' }}>CAT D</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                            <td style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>₹30K – ₹50K</td>
                            <td style={{ padding: '6px 10px', color: '#38bdf8', fontWeight: 600 }}>60%</td>
                            <td style={{ padding: '6px 10px' }}>50%</td>
                            <td style={{ padding: '6px 10px' }}>50%</td>
                            <td style={{ padding: '6px 10px' }}>50%</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                            <td style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>&gt; ₹50K – ₹75K</td>
                            <td style={{ padding: '6px 10px', color: '#38bdf8', fontWeight: 600 }}>65%</td>
                            <td style={{ padding: '6px 10px' }}>60%</td>
                            <td style={{ padding: '6px 10px' }}>55%</td>
                            <td style={{ padding: '6px 10px' }}>55%</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                            <td style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>&gt; ₹75K – ₹1.50 Lakh</td>
                            <td style={{ padding: '6px 10px', color: '#38bdf8', fontWeight: 600 }}>70%</td>
                            <td style={{ padding: '6px 10px' }}>65%</td>
                            <td style={{ padding: '6px 10px' }}>55%</td>
                            <td style={{ padding: '6px 10px' }}>55%</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                            <td style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>&gt; ₹1.50L – ₹2.50 Lakh</td>
                            <td style={{ padding: '6px 10px', color: '#38bdf8', fontWeight: 600 }}>75%</td>
                            <td style={{ padding: '6px 10px' }}>70%</td>
                            <td style={{ padding: '6px 10px' }}>60%</td>
                            <td style={{ padding: '6px 10px' }}>60%</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>&gt; ₹2.50 Lakh</td>
                            <td style={{ padding: '6px 10px', color: '#38bdf8', fontWeight: 700 }}>75%</td>
                            <td style={{ padding: '6px 10px', color: '#34d399', fontWeight: 700 }}>70%</td>
                            <td style={{ padding: '6px 10px', color: '#fbbf24', fontWeight: 700 }}>65%</td>
                            <td style={{ padding: '6px 10px', color: '#f87171', fontWeight: 700 }}>65%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Policy Guidelines Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Credit Card &amp; Specialized Obligations:</strong>
                      <div style={{ marginTop: '5px' }}>• Credit Card Obligation: <strong>5% of Outstanding POS / Limit</strong></div>
                      <div style={{ marginTop: '3px', color: '#f87171' }}>• CC POS Rule: <strong>POS &gt; 4 times monthly salary NOT allowed</strong></div>
                      <div style={{ marginTop: '3px' }}>• Specialized Deductions: <strong>1 KCC Obligate</strong>, <strong>1 Gold Loan (GL) Obligate</strong></div>
                    </div>

                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <strong style={{ color: '#34d399', fontSize: '0.88rem' }}>📌 Balance Transfer (BT) Limits (Max 8 Total):</strong>
                      <div style={{ marginTop: '5px' }}>• Total BTs Allowed: <strong>Maximum 8 Loans/Cards</strong></div>
                      <div style={{ marginTop: '3px' }}>• Permitted Combination: <strong>Max 3 App Loans + 3 Credit Cards + 2 PL/OD</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• FOIR Deviation: <strong>5% Deviation allowed on case-to-case basis</strong></div>
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

              {(activeConfigBank?.id === 'au-bank' || activeConfigBank?.id === 'au' || activeConfigBank?.name?.toLowerCase().includes('au ')) && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(111, 44, 145, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
                    border: '1.5px solid rgba(192, 132, 252, 0.35)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 700, fontSize: '0.98rem' }}>
                      <CheckCircle2 size={18} />
                      <span>ETC Customer FOIR, Multipliers &amp; Exposure Capping Matrix — AU Small Finance Bank</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      • <strong>Priority 1:</strong> Super Cat A, Cat A, Cat B, Cat D (Govt)<br />
                      • <strong>Priority 0:</strong> Cat C, Others, Unlisted
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="policy-table">
                      <thead>
                        <tr>
                          <th style={{ background: 'rgba(111, 44, 145, 0.8)', color: '#fff', textTransform: 'uppercase', textAlign: 'center', fontSize: '1rem', letterSpacing: '0.5px' }} colSpan={7}>
                            ETC Customer Policy Matrix
                          </th>
                        </tr>
                        <tr>
                          <th style={{ color: '#38bdf8', minWidth: '150px' }}>Net Monthly Income (NMI)</th>
                          <th style={{ color: '#c084fc' }}>FOIR % - Priority 1</th>
                          <th style={{ color: '#c084fc' }}>Multiplier on NTH - Priority 1</th>
                          <th style={{ color: '#c084fc' }}>Exposure Cap (Lakhs) - Priority 1</th>
                          <th style={{ color: '#f472b6' }}>FOIR % - Priority 0</th>
                          <th style={{ color: '#f472b6' }}>Multiplier on NTH - Priority 0</th>
                          <th style={{ color: '#f472b6' }}>Exposure Cap (Lakhs) - Priority 0</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(policyData?.etcCustomerSlabs || [
                          { nmiSlab: 'INR 20K - <50K', minIncome: 20000, maxIncome: 49999, foirP1: 60, multP1: 18, capP1: 5.0, foirP0: 50, multP0: 11, capP0: 5.0 },
                          { nmiSlab: 'INR 50K - <75K', minIncome: 50000, maxIncome: 74999, foirP1: 65, multP1: 20, capP1: 15.0, foirP0: 60, multP0: 15, capP0: 7.5 },
                          { nmiSlab: 'INR 75K - <100K', minIncome: 75000, maxIncome: 99999, foirP1: 70, multP1: 22, capP1: 15.0, foirP0: 65, multP0: 18, capP0: 10.0 },
                          { nmiSlab: '>= INR 100K', minIncome: 100000, maxIncome: Infinity, foirP1: 75, multP1: 24, capP1: 15.0, foirP0: 70, multP0: 20, capP0: 10.0 }
                        ]).map((row, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong style={{ color: '#38bdf8' }}>{row.nmiSlab}</strong>
                            </td>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.foirP1}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...(policyData.etcCustomerSlabs || [])];
                                    updated[idx] = { ...updated[idx], foirP1: val };
                                    setPolicyData({ ...policyData, etcCustomerSlabs: updated });
                                  }}
                                />
                                <span>%</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={row.multP1}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...(policyData.etcCustomerSlabs || [])];
                                    updated[idx] = { ...updated[idx], multP1: val };
                                    setPolicyData({ ...policyData, etcCustomerSlabs: updated });
                                  }}
                                />
                                <span>x</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell">
                                <span>₹</span>
                                <input 
                                  type="number"
                                  value={row.capP1}
                                  step="0.5"
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...(policyData.etcCustomerSlabs || [])];
                                    updated[idx] = { ...updated[idx], capP1: val };
                                    setPolicyData({ ...policyData, etcCustomerSlabs: updated });
                                  }}
                                />
                                <span>Lakhs</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.foirP0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...(policyData.etcCustomerSlabs || [])];
                                    updated[idx] = { ...updated[idx], foirP0: val };
                                    setPolicyData({ ...policyData, etcCustomerSlabs: updated });
                                  }}
                                />
                                <span>%</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={row.multP0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...(policyData.etcCustomerSlabs || [])];
                                    updated[idx] = { ...updated[idx], multP0: val };
                                    setPolicyData({ ...policyData, etcCustomerSlabs: updated });
                                  }}
                                />
                                <span>x</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell">
                                <span>₹</span>
                                <input 
                                  type="number"
                                  value={row.capP0}
                                  step="0.5"
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...(policyData.etcCustomerSlabs || [])];
                                    updated[idx] = { ...updated[idx], capP0: val };
                                    setPolicyData({ ...policyData, etcCustomerSlabs: updated });
                                  }}
                                />
                                <span>Lakhs</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg') || activeConfigBank?.id === 'piramal' || activeConfigBank?.name?.toLowerCase().includes('piramal') || activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan')) && (
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
                      ) : (activeConfigBank?.id === 'piramal' || activeConfigBank?.name?.toLowerCase().includes('piramal')) ? (
                        <>
                          <th style={{ color: '#38bdf8' }}>Low FOIR %</th>
                          <th style={{ color: '#38bdf8' }}>Medium FOIR %</th>
                          <th style={{ color: '#38bdf8' }}>High FOIR % (Max)</th>
                          <th style={{ color: '#38bdf8' }}>Profile Multiplier</th>
                          <th>Credit Card Obligation</th>
                        </>
                      ) : (activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) ? (
                        <>
                          <th style={{ color: '#38bdf8' }}>₹25k–₹30k (60% FOIR)</th>
                          <th style={{ color: '#38bdf8' }}>₹30k–₹35k (65% FOIR)</th>
                          <th style={{ color: '#38bdf8' }}>₹35k+ (70% Max FOIR)</th>
                          <th style={{ color: '#38bdf8' }}>Profile Multiplier (12x to 30x)</th>
                          <th>Credit Card Obligation (Max 2 CC BT)</th>
                        </>
                      ) : (activeConfigBank?.id === 'cholamandalam' || activeConfigBank?.id === 'chola' || activeConfigBank?.name?.toLowerCase().includes('chola')) ? (
                        <>
                          <th style={{ color: '#fb923c' }}>₹25k–₹30k (FOIR %)</th>
                          <th style={{ color: '#fb923c' }}>₹30k+ (Max FOIR %)</th>
                          <th style={{ color: '#fb923c' }}>25k–30k Multiplier</th>
                          <th style={{ color: '#fb923c' }}>30k+ Multiplier (25x–35x)</th>
                          <th>Credit Card Obligation (Max 6 CC BT)</th>
                        </>
                      ) : (activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) ? (
                        <>
                          <th style={{ color: '#38bdf8' }}>Company Grade</th>
                          <th style={{ color: '#38bdf8' }}>&lt; ₹50K Mult</th>
                          <th style={{ color: '#38bdf8' }}>₹50K – ₹75K Mult</th>
                          <th style={{ color: '#38bdf8' }}>₹75K – ₹2L Mult</th>
                          <th style={{ color: '#38bdf8' }}>&ge; ₹2L Mult</th>
                          <th style={{ color: '#38bdf8' }}>FOIR (&lt;50k / &ge;50k)</th>
                          <th>CC Obligation (Max 6x Sal)</th>
                        </>
                      ) : (activeConfigBank?.id === 'au-bank' || activeConfigBank?.id === 'au' || activeConfigBank?.name?.toLowerCase().includes('au ')) ? (
                        <>
                          <th style={{ color: '#c084fc' }}>₹20k – &lt;₹50k (FOIR / Mult)</th>
                          <th style={{ color: '#c084fc' }}>₹50k – &lt;₹75k (FOIR / Mult)</th>
                          <th style={{ color: '#c084fc' }}>₹75k – &lt;₹100k (FOIR / Mult)</th>
                          <th style={{ color: '#c084fc' }}>&ge; ₹100k (FOIR / Mult)</th>
                          <th>Credit Card Obligation (ONLY PL BT)</th>
                        </>
                      ) : (activeConfigBank?.id === 'hdfc' || activeConfigBank?.name?.toLowerCase().includes('hdfc')) ? (
                        <>
                          <th style={{ color: '#38bdf8', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(56, 189, 248, 0.5)' }}>₹25K–₹35K (FOIR % / Mult)</th>
                          <th style={{ color: '#38bdf8', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(56, 189, 248, 0.5)' }}>₹35K–₹50K (FOIR % / Mult)</th>
                          <th style={{ color: '#38bdf8', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(56, 189, 248, 0.5)' }}>₹50K–₹75K (FOIR % / Mult)</th>
                          <th style={{ color: '#38bdf8', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(56, 189, 248, 0.5)' }}>≥ ₹75K Max (FOIR % / Mult)</th>
                          <th>Credit Card Obligation (5%)</th>
                        </>
                      ) : (activeConfigBank?.id === 'axis-bank' || activeConfigBank?.id === 'axis' || (activeConfigBank?.name?.toLowerCase().includes('axis') && !activeConfigBank?.name?.toLowerCase().includes('fin'))) ? (
                        <>
                          <th style={{ color: '#38bdf8', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(56, 189, 248, 0.5)' }}>₹25K–₹35K (FOIR % / Mult)</th>
                          <th style={{ color: '#38bdf8', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(56, 189, 248, 0.5)' }}>₹35K–₹40K (FOIR % / Mult)</th>
                          <th style={{ color: '#38bdf8', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(56, 189, 248, 0.5)' }}>≥ ₹40K Max (FOIR % / Mult)</th>
                          <th>Credit Card Obligation (4%)</th>
                        </>
                      ) : (activeConfigBank?.id === 'icici' || activeConfigBank?.name?.toLowerCase().includes('icici')) ? (
                        <>
                          <th style={{ color: '#38bdf8' }}>CIBIL &amp; Salary Criteria (Excel)</th>
                          <th style={{ color: '#38bdf8' }}>Standard Base FOIR (%)</th>
                          <th style={{ color: '#38bdf8' }}>Standard Max FOIR (%)</th>
                          <th style={{ color: '#34d399' }}>HL Running Bonus FOIR (+5%)</th>
                          <th>Credit Card Obligation (5%)</th>
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
                        ) : (activeConfigBank?.id === 'piramal' || activeConfigBank?.name?.toLowerCase().includes('piramal')) ? (
                          <>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.slab1Foir ?? 40}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].slab1Foir = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>%</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.slab2Foir ?? 50}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].slab2Foir = val;
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
                                  value={row.maxFoir ?? 70}
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
                                  value={row.multiplier ?? 24}
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
                                  value={row.ccObligation ?? 5}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].ccObligation = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% (2 CC BT w/ 1 PL)</span>
                              </div>
                            </td>
                          </>
                        ) : (activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) ? (
                          <>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.slab1Foir ?? 60}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].slab1Foir = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% (60%)</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.slab2Foir ?? 65}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].slab2Foir = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% (65%)</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={row.maxFoir ?? 70}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].maxFoir = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% (70%)</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={row.multiplier ?? (row.category === 'Super A' || row.category === 'A' || row.category === 'Govt' ? 30 : (row.category === 'B' ? 25 : (row.category === 'C' ? 22 : 18)))}
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
                                  value={row.ccObligation ?? 5}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].ccObligation = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% (Max 2 CC BT)</span>
                              </div>
                            </td>
                          </>
                        ) : (activeConfigBank?.id === 'cholamandalam' || activeConfigBank?.id === 'chola' || activeConfigBank?.name?.toLowerCase().includes('chola')) ? (
                          <>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.slab1Foir ?? ((row.category === 'C' || row.category === 'D') ? 55 : 65)}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].slab1Foir = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% (25k-30k)</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={row.slab2Foir ?? row.maxFoir ?? ((row.category === 'C' || row.category === 'D') ? 65 : 70)}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].slab2Foir = val;
                                    updated[idx].maxFoir = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% (30k+)</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.multiplierSlab1 ?? ((row.category === 'C' || row.category === 'D') ? 20 : (row.category === 'Super A' || row.category === 'Govt' ? 30 : 24))}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].multiplierSlab1 = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>x (25k-30k)</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={row.multiplier ?? ((row.category === 'C' || row.category === 'D') ? 25 : (row.category === 'Super A' || row.category === 'Govt' ? 35 : 28))}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].multiplier = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>x (30k+)</span>
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
                                <span>% (Max 6 CC BT)</span>
                              </div>
                            </td>
                          </>
                        ) : (activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) ? (
                          <>
                            <td>
                              <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                                {row.grade || 'GREEN'}
                              </span>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={row.multBelow50k ?? 16}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].multBelow50k = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>x</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={row.mult50kTo75k ?? 16}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].mult50kTo75k = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>x</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={row.mult75kTo2L ?? 22}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].mult75kTo2L = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>x</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell highlight">
                                <input 
                                  type="number"
                                  value={row.multAbove2L ?? 24}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].multAbove2L = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>x</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <div className="table-input-cell" style={{ width: '60px' }}>
                                  <input 
                                    type="number"
                                    value={row.slab1Foir ?? 60}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab1Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <span style={{ color: '#64748b' }}>/</span>
                                <div className="table-input-cell" style={{ width: '60px' }}>
                                  <input 
                                    type="number"
                                    value={row.slab2Foir ?? 65}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab2Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
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
                                <span>% (Max 6x Sal)</span>
                              </div>
                            </td>
                          </>
                        ) : (activeConfigBank?.id === 'au-bank' || activeConfigBank?.id === 'au' || activeConfigBank?.name?.toLowerCase().includes('au ')) ? (
                          <>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div className="table-input-cell" style={{ width: '80px' }}>
                                  <input 
                                    type="number"
                                    value={row.slab1Foir ?? (row.priority === 0 ? 50 : 60)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab1Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '70px' }}>
                                  <input 
                                    type="number"
                                    value={row.multiplierBelow50k ?? (row.priority === 0 ? 11 : 18)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].multiplierBelow50k = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>x</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div className="table-input-cell" style={{ width: '80px' }}>
                                  <input 
                                    type="number"
                                    value={row.slab2Foir ?? (row.priority === 0 ? 60 : 65)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab2Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '70px' }}>
                                  <input 
                                    type="number"
                                    value={row.multiplier50kTo75k ?? (row.priority === 0 ? 15 : 20)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].multiplier50kTo75k = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>x</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div className="table-input-cell" style={{ width: '80px' }}>
                                  <input 
                                    type="number"
                                    value={row.slab3Foir ?? (row.priority === 0 ? 65 : 70)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab3Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '70px' }}>
                                  <input 
                                    type="number"
                                    value={row.multiplier75kTo100k ?? (row.priority === 0 ? 18 : 22)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].multiplier75kTo100k = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>x</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div className="table-input-cell highlight" style={{ width: '80px' }}>
                                  <input 
                                    type="number"
                                    value={row.maxFoir ?? (row.priority === 0 ? 70 : 75)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].maxFoir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell highlight" style={{ width: '70px' }}>
                                  <input 
                                    type="number"
                                    value={row.multiplierAbove100k ?? (row.priority === 0 ? 20 : 24)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].multiplierAbove100k = val;
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
                                <span>% (ONLY PL BT)</span>
                              </div>
                            </td>
                          </>
                        ) : (activeConfigBank?.id === 'hdfc' || activeConfigBank?.name?.toLowerCase().includes('hdfc')) ? (
                          <>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div className="table-input-cell" style={{ width: '85px' }}>
                                  <input 
                                    type="number"
                                    value={row.slab1Foir ?? ((row.category === 'C' || row.category === 'D') ? 40 : 50)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab1Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '75px', background: '#0b1329', border: '1.5px solid rgba(56, 189, 248, 0.45)' }}>
                                  <input 
                                    type="number"
                                    style={{ color: '#38bdf8', fontWeight: 800 }}
                                    value={row.mult1 ?? ((row.category === 'C' || row.category === 'D') ? 12 : (row.category === 'B' ? 15 : 19))}
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
                                    value={row.slab1Foir ?? ((row.category === 'C' || row.category === 'D') ? 40 : 50)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab1Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '75px', background: '#0b1329', border: '1.5px solid rgba(56, 189, 248, 0.45)' }}>
                                  <input 
                                    type="number"
                                    style={{ color: '#38bdf8', fontWeight: 800 }}
                                    value={row.mult1_35k ?? ((row.category === 'C' || row.category === 'D') ? 15 : (row.category === 'B' ? 18 : 22))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].mult1_35k = val;
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
                                    value={row.slab2Foir ?? ((row.category === 'C' || row.category === 'D') ? 45 : (row.category === 'B' ? 55 : 60))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab2Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '75px', background: '#0b1329', border: '1.5px solid rgba(56, 189, 248, 0.45)' }}>
                                  <input 
                                    type="number"
                                    style={{ color: '#38bdf8', fontWeight: 800 }}
                                    value={row.mult2 ?? ((row.category === 'C' || row.category === 'D') ? 18 : (row.category === 'B' ? 22 : 25))}
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
                                <div className="table-input-cell highlight" style={{ width: '85px' }}>
                                  <input 
                                    type="number"
                                    value={row.maxFoir ?? ((row.category === 'C' || row.category === 'D') ? 50 : (row.category === 'B' ? 65 : 70))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].maxFoir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '75px', background: '#0b1329', border: '1.5px solid rgba(56, 189, 248, 0.45)' }}>
                                  <input 
                                    type="number"
                                    style={{ color: '#38bdf8', fontWeight: 800 }}
                                    value={row.mult3 ?? row.multiplier ?? ((row.category === 'C' || row.category === 'D') ? 20 : (row.category === 'B' ? 25 : 27))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].mult3 = val;
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
                                <span>% (5%)</span>
                              </div>
                            </td>
                          </>
                        ) : (activeConfigBank?.id === 'axis-bank' || activeConfigBank?.id === 'axis' || (activeConfigBank?.name?.toLowerCase().includes('axis') && !activeConfigBank?.name?.toLowerCase().includes('fin'))) ? (
                          <>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div className="table-input-cell" style={{ width: '85px' }}>
                                  <input 
                                    type="number"
                                    value={row.slab1Foir ?? (row.category === 'C' ? 50 : 55)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab1Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '75px', background: '#0b1329', border: '1.5px solid rgba(56, 189, 248, 0.45)' }}>
                                  <input 
                                    type="number"
                                    style={{ color: '#38bdf8', fontWeight: 800 }}
                                    value={row.mult1 ?? (row.category === 'C' ? 18 : 24)}
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
                                    value={row.slab2Foir ?? (row.category === 'C' ? 55 : (row.category === 'B' ? 60 : 65))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].slab2Foir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '75px', background: '#0b1329', border: '1.5px solid rgba(56, 189, 248, 0.45)' }}>
                                  <input 
                                    type="number"
                                    style={{ color: '#38bdf8', fontWeight: 800 }}
                                    value={row.mult2 ?? (row.category === 'C' ? 20 : (row.category === 'B' ? 26 : 30))}
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
                                <div className="table-input-cell highlight" style={{ width: '85px' }}>
                                  <input 
                                    type="number"
                                    value={row.maxFoir ?? (row.category === 'C' ? 60 : 75)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].maxFoir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <div className="table-input-cell" style={{ width: '75px', background: '#0b1329', border: '1.5px solid rgba(56, 189, 248, 0.45)' }}>
                                  <input 
                                    type="number"
                                    style={{ color: '#38bdf8', fontWeight: 800 }}
                                    value={row.mult3 ?? row.multiplier ?? (row.category === 'C' ? 20 : (row.category === 'B' ? 30 : 36))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].mult3 = val;
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
                                  value={row.ccObligation ?? 4}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].ccObligation = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% (4%)</span>
                              </div>
                            </td>
                          </>
                        ) : (activeConfigBank?.id === 'icici' || activeConfigBank?.name?.toLowerCase().includes('icici')) ? (
                          <>
                            <td>
                              <span style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}>
                                {row.criteria || (row.category === 'Govt' ? 'CIBIL 725-775 + 25K+ Sal' : (row.category === 'Open Market' ? 'CIBIL 750+ + 50K+ Sal' : 'CIBIL 725-775 + 30K+ Sal'))}
                              </span>
                            </td>
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
                                <span>% (45%)</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-input-cell">
                                <input 
                                  type="number"
                                  value={row.maxFoir ?? (row.category === 'Open Market' ? 55 : 65)}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...policyData.foirMultiplier];
                                    updated[idx].maxFoir = val;
                                    setPolicyData({ ...policyData, foirMultiplier: updated });
                                  }}
                                />
                                <span>% ({row.category === 'Open Market' ? '55%' : '65%'})</span>
                              </div>
                            </td>
                            <td>
                              {row.category === 'Open Market' ? (
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, padding: '6px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                                  N/A (Excluded)
                                </span>
                              ) : (
                                <div className="table-input-cell highlight" style={{ border: '1.5px solid rgba(52, 211, 153, 0.5)' }}>
                                  <input 
                                    type="number"
                                    style={{ color: '#34d399', fontWeight: 700 }}
                                    value={row.hlFoir ?? 70}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = [...policyData.foirMultiplier];
                                      updated[idx].hlFoir = val;
                                      setPolicyData({ ...policyData, foirMultiplier: updated });
                                    }}
                                  />
                                  <span>% (70%)</span>
                                </div>
                              )}
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
                                <span>% (5%)</span>
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
              )}
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

              {(activeConfigBank?.id === 'poonawala' || activeConfigBank?.name?.toLowerCase().includes('poonawala')) && (
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
                    <span>Poonawalla Fincorp Demographics &amp; Eligibility Criteria (from Excel: Sheet POONAWALA)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Age &amp; Experience Parameters:</strong>
                      <div style={{ marginTop: '5px' }}>• Minimum Applicant Age: <strong>21 Years</strong> (`MIN 21 YRS`)</div>
                      <div style={{ marginTop: '3px' }}>• Maximum Age at Loan Time: <strong>60 Years</strong> (`MAX 60 YRS`)</div>
                      <div style={{ marginTop: '3px' }}>• Retirement Age: <strong>60 Years</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Total Work Experience: <strong>Minimum 2 Years</strong> (`MINI WORK EXPRINCE 2YEARS`)</div>
                      <div style={{ marginTop: '3px', color: '#38bdf8' }}>• Minimum Salary (NTH): <strong>₹30,000 (30K)</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <strong style={{ color: '#34d399', fontSize: '0.88rem' }}>📌 CIBIL, Operation &amp; Foreclosure Norms:</strong>
                      <div style={{ marginTop: '5px' }}>• Minimum CIBIL TU Score: <strong>700 Minimum</strong></div>
                      <div style={{ marginTop: '3px', color: '#fde047' }}>• NTC / CIBIL 0 &amp; -1: <strong>Allowed in Tier 1 &amp; Tier 2 cities, and Category A</strong></div>
                      <div style={{ marginTop: '3px', color: '#f87171' }}>• CIBIL USL Enquiries: <strong>Max 6 in last 90 days</strong> (Up to 9 with deviation)</div>
                      <div style={{ marginTop: '3px' }}>• Process Mode &amp; Geo Limit: <strong>100% Digital</strong> | <strong>80 KM from Branch</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Foreclosure Charges: <strong>NIL after 12 EMIs from own funds</strong>, else as per grid</div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'piramal' || activeConfigBank?.name?.toLowerCase().includes('piramal')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(31, 78, 120, 0.15) 0%, rgba(14, 165, 233, 0.12) 100%)',
                  border: '1.5px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Piramal Finance Demographics & Eligibility Criteria (from Master Excel: Sheet PIRAMAL)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Age & Experience Requirements:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Applicant Age: <strong>21 Years</strong> (`21 YEARS`)</div>
                      <div style={{ marginTop: '3px' }}>• Max Age at Loan Time: <strong>63 Years</strong> (`63 YEARS`)</div>
                      <div style={{ marginTop: '3px' }}>• Retirement Age: <strong>60 Years (Salaried) / 63 Years (Govt)</strong> (`60 YEARS AND GOVT 63`)</div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Work Experience: <strong>1 Year</strong> (`MINI WORK EXPRINCE: 1 YEARS`)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
                      <strong style={{ color: '#fdba74', fontSize: '0.88rem' }}>📌 Financial & Credit Criteria:</strong>
                      <div style={{ marginTop: '5px' }}>• Minimum Net Monthly Salary: <strong>₹22,000 + Mandatory PF/PPF Deduction</strong> (Excel: <code>22+PF DEDUCT REQ</code> — PPF Toggle active in application form)</div>
                      <div style={{ marginTop: '3px', color: '#38bdf8' }}>• Credit Card Obligation: <strong>5% of Total CC Limit</strong> (`0.05`)</div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Balance Transfer (BT): <strong>1 PL BT Allowed with up to 2 CC BT</strong> (`2 CC BT ALLOW WITH 1 PL BT`)</div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 45, 98, 0.18) 0%, rgba(14, 165, 233, 0.12) 100%)',
                  border: '1.5px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>SMFG India Credit Demographics & Eligibility Criteria (from Master Excel: Sheet SMFG)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Age & Experience Requirements:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Applicant Age: <strong>21 Years</strong> (`21`)</div>
                      <div style={{ marginTop: '3px' }}>• Max Age at Loan Time: <strong>Private: 60 Years / Govt: 65 Years (Pensioner Profile)</strong> (`PVT 60 AND GOVT 65(PENSIONER PROFILE)`)</div>
                      <div style={{ marginTop: '3px' }}>• Retirement Age: <strong>65 Years</strong> (`65`)</div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Work Experience: <strong>Current Company 2 Years</strong> (`CURRENT COM 2 YEARS`)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
                      <strong style={{ color: '#fdba74', fontSize: '0.88rem' }}>📌 Financial & Credit Criteria:</strong>
                      <div style={{ marginTop: '5px' }}>• Minimum Net Monthly Salary: <strong>₹25,000+ with 0 Deduction</strong> (`25K+ SALARY WITH 0 DEDUCTION`)</div>
                      <div style={{ marginTop: '3px', color: '#38bdf8' }}>• Credit Card Obligation: <strong>5% of Outstanding</strong> (`0.05`)</div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Balance Transfer (BT): <strong>Max 2 Credit Cards BT Allowed</strong> (`2 CC BT`)</div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'cholamandalam' || activeConfigBank?.id === 'chola' || activeConfigBank?.name?.toLowerCase().includes('chola')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(243, 112, 33, 0.18) 0%, rgba(59, 130, 246, 0.12) 100%)',
                  border: '1.5px solid rgba(243, 112, 33, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fb923c', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Cholamandalam Finance Demographics & Eligibility Criteria (Excel Sheet: CHOLA)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(243, 112, 33, 0.25)' }}>
                      <strong style={{ color: '#fb923c', fontSize: '0.88rem' }}>📌 Age & Experience Requirements:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Applicant Age: <strong>21 Years</strong> | Co-Applicant Age: <strong>23 Years</strong></div>
                      <div style={{ marginTop: '3px' }}>• Max Age at Loan Time: <strong>60 Years</strong> | Retirement Age: <strong>60 Years</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Work Experience: <strong>Total 1 Year (12M) &amp; Current Company 6 Months</strong></div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Financial & Credit Card Rules:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Salary: <strong>₹25,000 for Non-Cat / ₹30,000 for Bank &amp; NBFC Company</strong></div>
                      <div style={{ marginTop: '3px' }}>• Credit Card BT: <strong>Up to 6 Credit Cards Allowed</strong> (POS Cap ≤ 6x salary)</div>
                      <div style={{ marginTop: '3px', color: '#fca5a5' }}>• Co-applicant: <strong>Mandatory above ₹20 Lakhs loan for Category A</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'kotak' || activeConfigBank?.name?.toLowerCase().includes('kotak')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(237, 28, 36, 0.16) 0%, rgba(59, 130, 246, 0.12) 100%)',
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
                    <span>Kotak Mahindra Bank Demographics &amp; Eligibility Criteria (Excel Sheet: KOTAK)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(237, 28, 36, 0.25)' }}>
                      <strong style={{ color: '#f87171', fontSize: '0.88rem' }}>📌 Age &amp; Experience Requirements:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Applicant Age: <strong>21 Years</strong> | Max Age at Loan Maturity: <strong>60 Years</strong></div>
                      <div style={{ marginTop: '3px' }}>• Retirement Age: <strong>60 Years</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Work Experience: <strong>1 Month in Current Company</strong> (`1 Month`)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Financial &amp; Credit Card Rules:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Net Salary: <strong>₹25,000</strong> (Category C &amp; D: <strong>₹35,000</strong>)</div>
                      <div style={{ marginTop: '3px' }}>• Credit Card Obligation: <strong>5% of Outstanding Balance as per CIBIL</strong></div>
                      <div style={{ marginTop: '3px', color: '#fca5a5' }}>• Balance Transfer (BT): <strong>Credit Card BT Strictly NOT ALLOWED</strong> (`CC BT NOT ALLOW`)</div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(220, 0, 40, 0.16) 0%, rgba(245, 158, 11, 0.12) 100%)',
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
                    <span>Bandhan Bank Demographics &amp; Eligibility Criteria (Excel Sheet: BANDHAN BANK)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(220, 0, 40, 0.25)' }}>
                      <strong style={{ color: '#f87171', fontSize: '0.88rem' }}>📌 Age &amp; Experience Requirements:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Applicant Age: <strong>21 Years</strong> | Max Age at Loan Maturity: <strong>60 Years</strong></div>
                      <div style={{ marginTop: '3px' }}>• Retirement Age: <strong>60 Years</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Work Experience: <strong>1 Month in Current Company &amp; Overall 1 Year</strong> (`1 MONTHS CURRENT COM AND OVERALL 1YEARS`)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                      <strong style={{ color: '#f59e0b', fontSize: '0.88rem' }}>📌 Financial &amp; Special Obligation Rules:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Net Salary: <strong>₹25,000</strong> (Category D: <strong>₹40,000</strong> — `25K / CATD 40K`)</div>
                      <div style={{ marginTop: '3px', color: '#fde047' }}>• <strong>CC Zero-Obligation Rule:</strong> If CC limit &lt; 3x monthly salary, <strong>0% Obligation</strong>! Else 3% (`SALARY KA BELOW 3 TIME NO OBLIGATION`).</div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• <strong>Exemptions:</strong> Gold Loan (GL) &amp; KCC are <strong>NOT obligated</strong> (`GL AND KCC NOT OBLIGATE`).</div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 114, 187, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)',
                  border: '1.5px solid rgba(0, 114, 187, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Bajaj Finance Demographics &amp; Eligibility Criteria (from Master Excel: Sheet BAJAJ)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(0, 114, 187, 0.25)' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>📌 Age &amp; Experience Requirements:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Applicant Age: <strong>23 Years</strong> (<code>MINIMUM APLICANT AGE: 23 YEARS</code>)</div>
                      <div style={{ marginTop: '3px' }}>• Max Age at Loan Time: <strong>59 Years</strong> (<code>MAXIMUM AGE AT LOAN TIME: 59 YEARS</code>)</div>
                      <div style={{ marginTop: '3px' }}>• Retirement Age: <strong>Retirement proof req for 65 Years</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Work Experience: <strong>NO REQUIRED</strong> (0 Months)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <strong style={{ color: '#34d399', fontSize: '0.88rem' }}>📌 Financial &amp; CC Criteria:</strong>
                      <div style={{ marginTop: '5px' }}>• Minimum Net Salary: <strong>Listed ₹27,000 / Unlisted ₹30,000</strong> (<code>LISTED 27K AND UNLISTED 30K</code>)</div>
                      <div style={{ marginTop: '3px', color: '#38bdf8' }}>• Credit Card Obligation: <strong>5% of Outstanding</strong></div>
                      <div style={{ marginTop: '3px', color: '#fde047' }}>• CC BT / POS Rule: <strong>More than 6x monthly salary NOT allowed</strong> (<code>5% OBLIGATE AND MORE THEN 6 TIME NOT ALLOW</code>)</div>
                      <div style={{ marginTop: '3px' }}>• Address Proof: <strong>NOT REQUIRED</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {(activeConfigBank?.id === 'au-bank' || activeConfigBank?.id === 'au' || activeConfigBank?.name?.toLowerCase().includes('au ')) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(111, 44, 145, 0.18) 0%, rgba(245, 158, 11, 0.12) 100%)',
                  border: '1.5px solid rgba(111, 44, 145, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} />
                    <span>AU Small Finance Bank Demographics &amp; Eligibility Criteria (from Master Excel: Sheet AU BANK)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(111, 44, 145, 0.25)' }}>
                      <strong style={{ color: '#c084fc', fontSize: '0.88rem' }}>📌 Age &amp; Experience Requirements:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Applicant Age: <strong>21 Years (Salaried) / 23 Years (Self-Employed)</strong></div>
                      <div style={{ marginTop: '3px' }}>• Max Age at Loan Maturity: <strong>Private: 57 Years / Govt: 59 Years</strong> (<code>GOVT 59YEARS/PVT 57YEARS</code>)</div>
                      <div style={{ marginTop: '3px' }}>• Retirement Age: <strong>60 Years</strong></div>
                      <div style={{ marginTop: '3px', color: '#86efac' }}>• Work Experience: <strong>Minimum 1 Year (12 Months)</strong> (<code>MINI WORK EXPRINCE: 1YEARS</code>)</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                      <strong style={{ color: '#f59e0b', fontSize: '0.88rem' }}>📌 Financial, NMI &amp; Salary Criteria:</strong>
                      <div style={{ marginTop: '5px' }}>• Min Salary Slabs: <strong>Listed ₹20,000 / Unlisted ₹25,000 / NTC ₹30,000</strong> (Listed &amp; Govt only)</div>
                      <div style={{ marginTop: '3px', color: '#38bdf8' }}>• Priority 1 NMI (Super A, A, B, D Govt): <strong>Metro: ₹30,000 | Non-Metro: ₹20,000</strong></div>
                      <div style={{ marginTop: '3px', color: '#fb923c' }}>• Priority 0 NMI (Cat C / Others / Unlisted): <strong>Metro: ₹35,000 | Non-Metro: ₹25,000</strong></div>
                      <div style={{ marginTop: '3px', color: '#f472b6' }}>• NTC (-1, 0 CIBIL): <strong>₹30,000 both Metro &amp; Non-Metro</strong> (Allowed ONLY for Super A, Cat A, Cat B &amp; Cat D Govt)</div>
                      <div style={{ marginTop: '3px', color: '#fca5a5' }}>• Cash Salary: <strong>NOT considered</strong>. Variable pay (Incentives, bonus, 1-time allowances) to be deducted</div>
                      <div style={{ marginTop: '3px', color: '#f87171' }}>• Balance Transfer (BT): <strong>ONLY Personal Loan BT</strong> (Credit Card BT strictly NOT allowed)</div>
                      <div style={{ marginTop: '3px', color: '#4ade80' }}>• Bachelor Capping: <strong>Removed (No Restriction as per policy)</strong></div>
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
                      <td>{(activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) ? '23 Years' : '21 Years'}</td>
                      <td>{(activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) ? 'Excel Policy: MINIMUM APLICANT AGE: 23 YEARS' : 'Minimum age required at loan application stage'}</td>
                    </tr>
                    <tr>
                      <td><strong>Maximum Age at Loan Maturity (Private)</strong></td>
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
                      <td>
                        {(activeConfigBank?.id === 'au-bank' || activeConfigBank?.name?.toLowerCase().includes('au '))
                          ? 'Excel Policy: PVT 57YEARS (Private employer max age at maturity)'
                          : (activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj'))
                            ? 'Excel Policy: MAXIMUM AGE AT LOAN TIME: 59 YEARS'
                            : (activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg'))
                              ? 'Excel Policy: PVT 60 (Private employee cutoff at loan time)'
                              : 'Borrower must finish repayment before reaching this age'}
                      </td>
                    </tr>
                    {(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg') || activeConfigBank?.id === 'au-bank' || activeConfigBank?.name?.toLowerCase().includes('au ')) && (
                      <tr style={{ background: 'rgba(56, 189, 248, 0.05)' }}>
                        <td><strong style={{ color: '#38bdf8' }}>Maximum Age at Loan Time (Govt / Pensioner)</strong></td>
                        <td>
                          <div className="table-input-cell highlight">
                            <input 
                              type="number"
                              value={policyData?.demographics?.maxAgeGovt ?? ((activeConfigBank?.id === 'au-bank' || activeConfigBank?.name?.toLowerCase().includes('au ')) ? 59 : 65)}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPolicyData(prev => ({
                                  ...prev,
                                  demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), maxAgeGovt: val }
                                }));
                              }}
                            />
                            <span>Years</span>
                          </div>
                        </td>
                        <td style={{ color: '#38bdf8', fontWeight: 600 }}>{(activeConfigBank?.id === 'au-bank' || activeConfigBank?.name?.toLowerCase().includes('au ')) ? '59 Years' : '65 Years'}</td>
                        <td>{(activeConfigBank?.id === 'au-bank' || activeConfigBank?.name?.toLowerCase().includes('au ')) ? 'Excel Policy: GOVT 59YEARS (Govt personnel eligible up to 59 years maturity)' : 'Excel Policy: GOVT 65 (PENSIONER PROFILE) — Govt employees and pensioners eligible up to 65 years'}</td>
                      </tr>
                    )}
                    <tr>
                      <td><strong>Retirement Age (Salaried / Private)</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData?.demographics?.retirementSalaried ?? ((activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) ? 65 : ((activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) ? 59 : 60))}
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
                      <td>
                        {(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) 
                          ? '65 Years' 
                          : (activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) 
                            ? '59 Years' 
                            : '60 Years'}
                      </td>
                      <td>
                        {(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) 
                          ? 'Excel Policy: RETIREMENT AGE: 65 for SMFG India Credit' 
                          : (activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) 
                            ? 'Excel Policy: 59 Years (Retirement proof req for 65 years)' 
                            : 'Superannuation age considered for private corporate employees'}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Retirement Age (Government / Defense)</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData?.demographics?.retirementGovt ?? ((activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) ? 65 : ((activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) ? 65 : ((activeConfigBank?.id === 'au-bank' || activeConfigBank?.name?.toLowerCase().includes('au ')) ? 59 : 62)))}
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
                      <td>
                        {(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) 
                          ? '65 Years' 
                          : (activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) 
                            ? '65 Years (Proof)' 
                            : (activeConfigBank?.id === 'au-bank' || activeConfigBank?.name?.toLowerCase().includes('au ')) 
                              ? '59 Years' 
                              : '62 Years'}
                      </td>
                      <td>
                        {(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) 
                          ? 'Excel Policy: RETIREMENT AGE: 65 for SMFG India Credit' 
                          : (activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) 
                            ? 'Excel Policy: RETIREMENT PROOF REQ FOR 65 YEARS' 
                            : (activeConfigBank?.id === 'au-bank' || activeConfigBank?.name?.toLowerCase().includes('au ')) 
                              ? 'Excel Policy: GOVT 59YEARS' 
                              : 'Standard retirement threshold for state / central govt personnel'}
                      </td>
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
                      <td>
                        {(activeConfigBank?.id === 'icici' || activeConfigBank?.name?.toLowerCase().includes('icici'))
                          ? 'Govt: ₹25K | Pvt: ₹30K | Open Mkt: ₹75K'
                          : (activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) 
                            ? '₹27,000 (Listed)' 
                            : (activeConfigBank?.id === 'au-bank' || activeConfigBank?.id === 'au' || activeConfigBank?.name?.toLowerCase().includes('au ')) 
                              ? '₹20,000 (Listed)' 
                              : '₹25,000'}
                      </td>
                      <td>
                        {(activeConfigBank?.id === 'icici' || activeConfigBank?.name?.toLowerCase().includes('icici'))
                          ? 'Excel Policy: GOVT ₹25,000 | PVT (Super Prime/Preferred/Elite/Army) ₹30,000 | OPEN MARKET ₹75,000'
                          : (activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj'))
                            ? 'Excel Policy: LISTED 27K AND UNLISTED 30K'
                            : (activeConfigBank?.id === 'au-bank' || activeConfigBank?.id === 'au' || activeConfigBank?.name?.toLowerCase().includes('au '))
                              ? 'Excel Policy: LISTED 20K / UNLISTED 25K / -1 CIBIL 30K'
                              : (activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg'))
                                ? 'Excel Policy: 25K+ SALARY WITH 0 DEDUCTION'
                                : 'Minimum verifiable monthly salary required for qualification'}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>{(activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) ? 'Minimum Work Experience (Current Company)' : ((activeConfigBank?.id === 'kotak' || activeConfigBank?.name?.toLowerCase().includes('kotak')) ? 'Minimum Work Experience (Current Company)' : ((activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan')) ? 'Minimum Total Work Experience (Overall)' : 'Minimum Total Work Experience'))}</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={(activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj'))
                              ? (policyData?.demographics?.minExperienceTotal ?? 0)
                              : ((activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg'))
                                ? (policyData?.demographics?.minExperienceCurrent ?? 24)
                                : ((activeConfigBank?.id === 'kotak' || activeConfigBank?.name?.toLowerCase().includes('kotak'))
                                  ? (policyData?.demographics?.minExperienceCurrent ?? 1)
                                  : ((activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan'))
                                    ? (policyData?.demographics?.minExperienceTotal ?? 12)
                                    : (policyData?.demographics?.minExperienceTotal ?? 12))))}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPolicyData(prev => ({
                                ...prev,
                                demographics: { 
                                  ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), 
                                  minExperienceTotal: val,
                                  minExperienceCurrent: val
                                }
                              }));
                            }}
                          />
                          <span>Months</span>
                        </div>
                      </td>
                      <td>
                        {(activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj'))
                          ? 'Excel Policy: MINI WORK EXPRINCE: NO REQUIRED'
                          : (activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg'))
                            ? 'Excel Policy: CURRENT COM 2 YEARS (Minimum 2 years experience in current employer)'
                            : (activeConfigBank?.id === 'au-bank' || activeConfigBank?.name?.toLowerCase().includes('au ') || activeConfigBank?.id === 'au')
                              ? 'Excel Policy: MINI WORK EXPRINCE: 1YEARS'
                              : (activeConfigBank?.id === 'kotak' || activeConfigBank?.name?.toLowerCase().includes('kotak'))
                                ? 'Excel Policy: 1 Month current company experience'
                                : (activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan'))
                                  ? 'Excel Policy: 1 MONTHS CURRENT COM AND OVERALL 1YEARS'
                                  : 'Cumulative work experience across previous employers'}
                      </td>
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
                            value={policyData?.demographics?.ccObligationPercent ?? ((activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan')) ? 3 : 5)}
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
                      <td>{(activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan')) ? '3%' : '5%'}</td>
                      <td>{(activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan')) ? 'Excel Policy: CC OBLIGATION: 3%' : 'Standard monthly obligation percentage applied against credit card outstanding balance'}</td>
                    </tr>
                    <tr>
                      <td><strong>Max Credit Card BT Allowed</strong></td>
                      <td>
                        <div className="table-input-cell">
                          <input 
                            type="number"
                            value={policyData?.demographics?.ccBtAllowedCount ?? ((activeConfigBank?.id === 'kotak' || activeConfigBank?.id === 'bandhan' || activeConfigBank?.id === 'au-bank' || activeConfigBank?.id === 'au' || activeConfigBank?.name?.toLowerCase().includes('kotak') || activeConfigBank?.name?.toLowerCase().includes('bandhan') || activeConfigBank?.name?.toLowerCase().includes('au ')) ? 0 : ((activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) ? 2 : ((activeConfigBank?.id === 'cholamandalam' || activeConfigBank?.id === 'chola' || activeConfigBank?.name?.toLowerCase().includes('chola')) ? 6 : 3)))}
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
                      <td>{(activeConfigBank?.id === 'au-bank' || activeConfigBank?.id === 'au' || activeConfigBank?.name?.toLowerCase().includes('au ')) ? '0 (Not Allowed)' : ((activeConfigBank?.id === 'kotak' || activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('kotak') || activeConfigBank?.name?.toLowerCase().includes('bandhan')) ? '0 (Not Allowed)' : ((activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj')) ? 'POS <= 6x Salary' : ((activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg')) ? '2 Cards' : ((activeConfigBank?.id === 'cholamandalam' || activeConfigBank?.id === 'chola' || activeConfigBank?.name?.toLowerCase().includes('chola')) ? '6 Cards' : '3 to 5 Cards'))))}</td>
                      <td>
                        {(activeConfigBank?.id === 'au-bank' || activeConfigBank?.id === 'au' || activeConfigBank?.name?.toLowerCase().includes('au '))
                          ? 'Excel Policy: ONLY PL BT (Credit Card Balance Transfer is strictly prohibited)'
                          : (activeConfigBank?.id === 'kotak' || activeConfigBank?.name?.toLowerCase().includes('kotak'))
                            ? 'Excel Policy: CC BT NOT ALLOW (Credit Card Balance Transfer is strictly prohibited)'
                            : (activeConfigBank?.id === 'bandhan' || activeConfigBank?.name?.toLowerCase().includes('bandhan'))
                              ? 'Excel Policy: Credit Card Balance Transfer is not permitted'
                              : (activeConfigBank?.id === 'bajaj' || activeConfigBank?.name?.toLowerCase().includes('bajaj'))
                                ? 'Excel Policy: MORE THEN 6 TIME NOT ALLOW (CC POS > 6x monthly salary not allowed, 5% obligation)'
                                : (activeConfigBank?.id === 'smfg' || activeConfigBank?.name?.toLowerCase().includes('smfg'))
                                  ? 'Excel Policy: MAX CC BT: 2 CC BT'
                                  : (activeConfigBank?.id === 'cholamandalam' || activeConfigBank?.id === 'chola' || activeConfigBank?.name?.toLowerCase().includes('chola'))
                                    ? 'Excel Policy: 6 CCBT ALLOW (Up to 6 credit cards allowed for Balance Transfer, POS capped to 6x salary)'
                                    : 'Maximum number of credit cards permitted for Balance Transfer'}
                      </td>
                    </tr>
                    {(activeConfigBank?.id === 'cholamandalam' || activeConfigBank?.id === 'chola' || activeConfigBank?.name?.toLowerCase().includes('chola')) && (
                      <tr>
                        <td><strong>Minimum Co-Applicant Age</strong></td>
                        <td>
                          <div className="table-input-cell highlight">
                            <input 
                              type="number"
                              value={policyData?.demographics?.minCoApplicantAge ?? 23}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPolicyData(prev => ({
                                  ...prev,
                                  demographics: { ...(prev?.demographics || DEFAULT_DEMOGRAPHIC_RULES), minCoApplicantAge: val }
                                }));
                              }}
                            />
                            <span>Years</span>
                          </div>
                        </td>
                        <td style={{ color: '#fb923c', fontWeight: 600 }}>23 Years</td>
                        <td>Excel Policy: CO APPLICANT AGE: 23 (Mandatory for loans above ₹20 Lakhs in Cat A)</td>
                      </tr>
                    )}
                    {(activeConfigBank?.id === 'finnable' || activeConfigBank?.name?.toLowerCase().includes('finnable')) && (
                      <>
                        <tr>
                          <td><strong>Tier 1 Cities Minimum Salary</strong></td>
                          <td>
                            <div className="table-input-cell highlight">
                              <span>₹</span>
                              <input 
                                type="number"
                                value={policyData?.demographics?.minSalaryTier1 ?? 20000}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPolicyData(prev => ({
                                    ...prev,
                                    demographics: { ...(prev?.demographics || {}), minSalaryTier1: val }
                                  }));
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ color: '#10B981', fontWeight: 600 }}>₹20,000</td>
                          <td>Excel Row 24: Delhi NCR, Mumbai MMR, Bangalore, Chennai, Hyderabad</td>
                        </tr>
                        <tr>
                          <td><strong>Tier 2 / Other Cities Minimum Salary</strong></td>
                          <td>
                            <div className="table-input-cell highlight">
                              <span>₹</span>
                              <input 
                                type="number"
                                value={policyData?.demographics?.minSalaryTier2 ?? 15000}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPolicyData(prev => ({
                                    ...prev,
                                    demographics: { ...(prev?.demographics || {}), minSalaryTier2: val }
                                  }));
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ color: '#10B981', fontWeight: 600 }}>₹15,000</td>
                          <td>Excel Row 24: All other locations outside Tier 1 list</td>
                        </tr>
                        <tr>
                          <td><strong>New to Credit (NTC -1) Maximum Loan Cap</strong></td>
                          <td>
                            <div className="table-input-cell highlight">
                              <span>₹</span>
                              <input 
                                type="number"
                                value={policyData?.demographics?.ntcMaxLoan ?? 400000}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPolicyData(prev => ({
                                    ...prev,
                                    demographics: { ...(prev?.demographics || {}), ntcMaxLoan: val }
                                  }));
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ color: '#10B981', fontWeight: 600 }}>₹4,00,000</td>
                          <td>Excel Row 19: NTC score cases capped to ₹4 Lakhs</td>
                        </tr>
                        <tr>
                          <td><strong>New to Credit (NTC -1) Maximum Tenure</strong></td>
                          <td>
                            <div className="table-input-cell highlight">
                              <input 
                                type="number"
                                value={policyData?.demographics?.ntcMaxTenure ?? 36}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPolicyData(prev => ({
                                    ...prev,
                                    demographics: { ...(prev?.demographics || {}), ntcMaxTenure: val }
                                  }));
                                }}
                              />
                              <span>Months</span>
                            </div>
                          </td>
                          <td style={{ color: '#10B981', fontWeight: 600 }}>36 Months</td>
                          <td>Excel Row 21: NTC score cases capped to 36 Months</td>
                        </tr>
                        <tr>
                          <td><strong>Gold Loan & KCC Obligation Factor</strong></td>
                          <td>
                            <div className="table-input-cell">
                              <input 
                                type="number"
                                value={policyData?.demographics?.goldLoanObligationPercent ?? 5}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPolicyData(prev => ({
                                    ...prev,
                                    demographics: { ...(prev?.demographics || {}), goldLoanObligationPercent: val, kccObligationPercent: val }
                                  }));
                                }}
                              />
                              <span>%</span>
                            </div>
                          </td>
                          <td style={{ color: '#10B981', fontWeight: 600 }}>5%</td>
                          <td>Excel Row 11: CC - 5% / GOLD LOAN - 5% / KCC - 5%</td>
                        </tr>
                        <tr>
                          <td><strong>Form 16 Mandate Threshold</strong></td>
                          <td>
                            <div className="table-input-cell highlight">
                              <span>₹</span>
                              <input 
                                type="number"
                                value={policyData?.demographics?.form16Threshold ?? 500000}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPolicyData(prev => ({
                                    ...prev,
                                    demographics: { ...(prev?.demographics || {}), form16Threshold: val }
                                  }));
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ color: '#10B981', fontWeight: 600 }}>₹5,00,000</td>
                          <td>Excel Row 26: If loan amount ≥ ₹5 Lakhs, Form 16 verification is mandatory</td>
                        </tr>
                        <tr>
                          <td><strong>Processing Fee (PF) Range</strong></td>
                          <td>
                            <div className="table-input-cell">
                              <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600 }}>2% to 6%</span>
                            </div>
                          </td>
                          <td style={{ color: '#10B981', fontWeight: 600 }}>2% – 6%</td>
                          <td>Excel Row 7: PF 2% To 6%</td>
                        </tr>
                      </>
                    )}
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
