// Finnable Finance Ltd Bank Configuration
import { 
  FINNABLE_BANK_EXCEL_POLICY,
  FINNABLE_NEGATIVE_PROFILES,
  FINNABLE_NEGATIVE_INDUSTRIES,
  FINNABLE_WEST_SOUTH_STATES,
  FINNABLE_TIER1_CITIES
} from '../../config/finnableBankPolicy.js';

export const finnableConfig = {
  id: 'finnable',
  name: 'Finnable Finance Ltd',
  color: '#10B981',
  logo: '/bank-logos/finnable.svg',
  
  // Overview & Eligibility
  minAge: 21,
  maxAgeLogin: 55,
  maxAgeMaturity: 60,
  minWorkExperienceMonths: 6,
  minSalaryTier1: 20000,
  minSalaryTier2: 15000,
  minSalary: 15000,
  minLoanAmount: 50000,
  maxLoanAmount: 1500000,
  ntcMaxLoanAmount: 400000,
  minTenureMonths: 6,
  maxTenureMonths: 60,
  ntcMaxTenureMonths: 36,
  
  // Pricing
  minRoi: 22.0,
  maxRoi: 36.0,
  defaultRoi: 22.0,
  minPf: 2.0,
  maxPf: 6.0,
  defaultPf: 2.5,
  
  // Obligations & Thresholds
  ccObligationPercent: 5,
  goldLoanObligationPercent: 5,
  kccObligationPercent: 5,
  form16Threshold: 500000,
  ntcFinnableScoreMin: 600,
  
  // Restrictions
  negativeProfiles: FINNABLE_NEGATIVE_PROFILES,
  negativeIndustries: FINNABLE_NEGATIVE_INDUSTRIES,
  solePropAllowedStates: FINNABLE_WEST_SOUTH_STATES,
  tier1Cities: FINNABLE_TIER1_CITIES,
  
  excelPolicy: FINNABLE_BANK_EXCEL_POLICY
};
