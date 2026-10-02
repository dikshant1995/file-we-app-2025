import { AXIS_BANK_EXCEL_POLICY } from '../../config/axisBankPolicy.js';

export const axisBankConfig = {
  id: 'axis-bank',
  name: 'Axis Bank',
  color: '#9E1B43',
  logo: '/bank-logos/axis.svg',
  
  // Demographics
  minAge: 21,
  maxAge: 60,
  retirementAge: 60,
  minSalary: 25000,
  minExperienceTotalMonths: 12,
  minExperienceCurrentMonths: 6,
  minCibilScore: 700,
  
  // Obligations & Cappings
  ccObligationPercent: 4,
  minLoanAmount: 50000,
  maxLoanAmount: 5000000,
  maxTenureMonths: 84,

  // Table Dependencies
  excelPolicy: AXIS_BANK_EXCEL_POLICY
};
