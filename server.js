import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 🛡️ IMPORT 5-LAYER PROCESSING FEE GUARD
import { protectAgainstProcessingFee } from './src/utils/processingFeeGuard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Import bank configurations
import { allBankConfigs } from './src/banks/index.js';

// Function to calculate EMI
const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfMonths = tenureInYears * 12;
  
  if (monthlyInterestRate === 0) {
    return principal / numberOfMonths;
  }
  
  const emi = principal * monthlyInterestRate * 
    (Math.pow(1 + monthlyInterestRate, numberOfMonths)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
    
  return Math.round(emi);
};

// Function to determine salary band for multiplier table
const getMultiplierSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 35000) return '25000-35000';
  if (salary >= 35001 && salary <= 49999) return '35001-49999';
  if (salary >= 50000 && salary <= 74999) return '50000-74999';
  if (salary >= 75000) return '75000+';
  return null;
};

// Function to determine salary band for FOIR table
const getFoirSalaryBand = (salary) => {
  if (salary >= 25000 && salary <= 34999) return '25000-34999';
  if (salary >= 35000 && salary <= 49999) return '35000-49999';
  if (salary >= 50000) return '50000+';
  return null;
};

// Function to determine company category
const getCompanyCategory = (companyName, employmentType, bankConfig) => {
  // Special handling for Kotak Mahindra Bank
  if (bankConfig.id === 'kotak') {
    // Government employees are always classified as Category A
    if (employmentType === 'government') {
      return 'GOVT';
    }
    
    // For this implementation, we'll use a simplified approach
    // In a real application, this would be based on an actual company database
    const company = companyName.toLowerCase();
    
    // Example categorization - in reality this would come from a database
    if (company.includes('google') || company.includes('microsoft') || company.includes('amazon')) {
      return 'AA';
    } else if (company.includes('tcs') || company.includes('infosys') || company.includes('wipro')) {
      return 'A';
    } else if (company.includes('hcl') || company.includes('tech mahindra')) {
      return 'B';
    } else if (company.includes('local') || company.includes('regional')) {
      return 'C';
    } else if (company.includes('startup') || company.includes('small')) {
      return 'D';
    }
    
    // Return null for unlisted companies (ineligible)
    return null;
  }
  
  // Generic category determination for other banks
  // This would be replaced with actual bank-specific logic
  let companyCategory = Object.keys(bankConfig.companyCategories)[Object.keys(bankConfig.companyCategories).length - 1]; // Default to last category
  for (const [category, criteria] of Object.entries(bankConfig.companyCategories)) {
    if (monthlyIncome >= criteria.minIncome) {
      companyCategory = category;
      break;
    }
  }
  return companyCategory;
};

// Function to get multiplier based on salary and category for Kotak
const getKotakMultiplier = (salary, category, bankConfig) => {
  const salaryBand = getMultiplierSalaryBand(salary);
  if (!salaryBand) return null;
  
  return bankConfig.multiplierTable[salaryBand][category] || null;
};

// Function to get FOIR percentage based on salary and category for Kotak
const getKotakFoirPercentage = (salary, category, bankConfig) => {
  const salaryBand = getFoirSalaryBand(salary);
  if (!salaryBand) return null;
  
  return bankConfig.foirTable[salaryBand][category] || null;
};

// Generic bank eligibility calculation function
const checkBankEligibility = (userData, bankConfig) => {
  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI,
    companyName,
    creditScore,
    employmentType
  } = userData;
  
  // Check employment type if specified in bank config
  if (bankConfig.employmentTypes && !bankConfig.employmentTypes.includes(employmentType)) {
    return {
      eligible: false,
      reason: `Employment type ${employmentType} not supported by this bank`
    };
  }
  
  // Check credit score
  if (creditScore && creditScore < bankConfig.minCreditScore) {
    return {
      eligible: false,
      reason: `Minimum credit score required is ${bankConfig.minCreditScore}`
    };
  }
  
  // Check loan tenure
  if (loanTenure > bankConfig.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${bankConfig.maxLoanTenure} years`
    };
  }
  
  // Special handling for Kotak Mahindra Bank
  if (bankConfig.id === 'kotak') {
    // Determine company category
    const companyCategory = getCompanyCategory(companyName, employmentType, bankConfig);
    
    // Check if company is unlisted (ineligible)
    if (companyCategory === null) {
      return {
        eligible: false,
        reason: 'Kotak Mahindra Bank does not provide loans to employees of unlisted companies'
      };
    }
    
    // Check minimum salary requirement based on category
    const minSalary = companyCategory === 'D' ? 
      bankConfig.minSalary['D'] : 
      bankConfig.minSalary['A']; // A, B, C categories have same minimum
    
    if (monthlyIncome < minSalary) {
      return {
        eligible: false,
        reason: `Minimum monthly income required is ₹${minSalary.toLocaleString()} for Category ${companyCategory}`
      };
    }
    
    // Calculate using Multiplier method
    const multiplier = getKotakMultiplier(monthlyIncome, companyCategory, bankConfig);
    if (!multiplier) {
      return {
        eligible: false,
        reason: 'Unable to determine multiplier for the provided salary and category'
      };
    }
    
    const multiplierLoanAmount = monthlyIncome * multiplier;
    
    // Calculate using FOIR method
    const foirPercentage = getKotakFoirPercentage(monthlyIncome, companyCategory, bankConfig);
    if (!foirPercentage) {
      return {
        eligible: false,
        reason: 'Unable to determine FOIR percentage for the provided salary and category'
      };
    }
    
    const foirCap = monthlyIncome * foirPercentage;
    const availableEMI = foirCap - (existingEMI || 0);
    
    // Calculate loan amount based on available EMI
    // For simplicity, we'll use a fixed tenure to calculate the FOIR loan amount
    const foirLoanAmount = availableEMI * loanTenure * 12; // Simplified calculation
    
    // Take the minimum of the two calculations
    const maxLoanAmount = Math.min(
      desiredLoanAmount || Infinity,
      multiplierLoanAmount,
      foirLoanAmount
    );
    
    // Calculate final EMI for the loan amount
    const monthlyEMI = calculateEMI(maxLoanAmount, bankConfig.interestRate, loanTenure);
    
    return {
      eligible: true,
      bankId: bankConfig.id,
      bankName: bankConfig.name,
      loanAmount: Math.round(maxLoanAmount),
      interestRate: bankConfig.interestRate,
      monthlyEMI: Math.round(monthlyEMI),
      processingFee: Math.round(maxLoanAmount * bankConfig.processingFee),
      companyCategory: companyCategory,
      calculationMethod: 'Combined (Multiplier and FOIR)',
      multiplier: multiplier,
      foirPercentage: foirPercentage,
      details: {
        multiplierLoanAmount: Math.round(multiplierLoanAmount),
        foirLoanAmount: Math.round(foirLoanAmount),
        foirCap: Math.round(foirCap),
        availableEMI: Math.round(availableEMI)
      }
    };
  }
  
  // Generic calculation for other banks
  // Determine company category based on bank-specific criteria
  let companyCategory = getCompanyCategory(companyName, employmentType, bankConfig);
  
  // Get multiplier based on company category
  const categoryMultiplier = bankConfig.companyCategories[companyCategory]?.multiplier || bankConfig.incomeMultiplier;
  
  // Calculate FOIR-based loan amount
  const netMonthlyIncome = monthlyIncome - (existingEMI || 0);
  const eligibleEMI = netMonthlyIncome * bankConfig.foirPercentage;
  
  // Calculate multiplier-based loan amount
  const multiplierLoanAmount = monthlyIncome * categoryMultiplier;
  
  // Take the minimum of the two calculations
  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount
  );
  
  // Calculate EMI for the loan amount
  const monthlyEMI = calculateEMI(maxLoanAmount, bankConfig.interestRate, loanTenure);
  
  // Check if EMI is within FOIR limits
  if (monthlyEMI > eligibleEMI) {
    return {
      eligible: false,
      reason: `EMI of ₹${monthlyEMI.toLocaleString()} exceeds FOIR limit of ₹${eligibleEMI.toLocaleString()}`
    };
  }
  
  return {
    eligible: true,
    bankId: bankConfig.id,
    bankName: bankConfig.name,
    loanAmount: Math.round(maxLoanAmount),
    interestRate: bankConfig.interestRate,
    monthlyEMI: Math.round(monthlyEMI),
    processingFee: Math.round(maxLoanAmount * bankConfig.processingFee),
    companyCategory: companyCategory
  };
};

// API Routes
app.get('/api/banks', (req, res) => {
  const bankList = allBankConfigs.map(bank => ({
    id: bank.id,
    name: bank.name
  }));
  res.json(bankList);
});

app.get('/api/companies/categories', (req, res) => {
  // This would typically come from a database
  res.json({
    "A": ["Google", "Microsoft", "Apple", "Amazon"],
    "B": ["Infosys", "TCS", "Wipro", "HCL"],
    "C": ["Local IT Firm", "Regional Bank", "Small Manufacturing"]
  });
});

app.post('/api/loan-eligibility', (req, res) => {
  const userData = req.body;
  
  // Process each bank's rules
  const results = allBankConfigs.map(bankConfig => {
    return checkBankEligibility(userData, bankConfig);
  });
  
  // 🛡️ APPLY 5-LAYER PROTECTION AGAINST PROCESSING FEES (temporarily disabled for debugging)
  // const protectedResults = protectAgainstProcessingFee(results, 'server-api');
  // res.json(protectedResults);
  
  res.json(results);
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});