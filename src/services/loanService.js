// Mock data for 14 banks with different rules
const BANK_RULES = [
  {
    id: 1,
    name: "Bank A",
    minCreditScore: 650,
    maxLoanTenure: 30,
    incomeMultiplier: 15,
    foirPercentage: 0.5,
    interestRate: 8.5,
    processingFee: 0.01,
    companyCategory: "A"
  },
  {
    id: 2,
    name: "Bank B",
    minCreditScore: 700,
    maxLoanTenure: 25,
    incomeMultiplier: 18,
    foirPercentage: 0.55,
    interestRate: 8.2,
    processingFee: 0.008,
    companyCategory: "A"
  },
  {
    id: 3,
    name: "Bank C",
    minCreditScore: 600,
    maxLoanTenure: 20,
    incomeMultiplier: 12,
    foirPercentage: 0.45,
    interestRate: 9.0,
    processingFee: 0.012,
    companyCategory: "B"
  },
  {
    id: 4,
    name: "Bank D",
    minCreditScore: 680,
    maxLoanTenure: 30,
    incomeMultiplier: 20,
    foirPercentage: 0.6,
    interestRate: 8.0,
    processingFee: 0.007,
    companyCategory: "A"
  },
  {
    id: 5,
    name: "Bank E",
    minCreditScore: 620,
    maxLoanTenure: 15,
    incomeMultiplier: 10,
    foirPercentage: 0.4,
    interestRate: 9.5,
    processingFee: 0.015,
    companyCategory: "C"
  },
  {
    id: 6,
    name: "Bank F",
    minCreditScore: 720,
    maxLoanTenure: 35,
    incomeMultiplier: 22,
    foirPercentage: 0.65,
    interestRate: 7.8,
    processingFee: 0.005,
    companyCategory: "A"
  },
  {
    id: 7,
    name: "Bank G",
    minCreditScore: 600,
    maxLoanTenure: 25,
    incomeMultiplier: 14,
    foirPercentage: 0.48,
    interestRate: 8.8,
    processingFee: 0.011,
    companyCategory: "B"
  },
  {
    id: 8,
    name: "Bank H",
    minCreditScore: 650,
    maxLoanTenure: 20,
    incomeMultiplier: 16,
    foirPercentage: 0.52,
    interestRate: 8.6,
    processingFee: 0.009,
    companyCategory: "B"
  },
  {
    id: 9,
    name: "Bank I",
    minCreditScore: 700,
    maxLoanTenure: 30,
    incomeMultiplier: 19,
    foirPercentage: 0.58,
    interestRate: 8.1,
    processingFee: 0.0075,
    companyCategory: "A"
  },
  {
    id: 10,
    name: "Bank J",
    minCreditScore: 630,
    maxLoanTenure: 15,
    incomeMultiplier: 11,
    foirPercentage: 0.42,
    interestRate: 9.3,
    processingFee: 0.013,
    companyCategory: "C"
  },
  {
    id: 11,
    name: "Bank K",
    minCreditScore: 680,
    maxLoanTenure: 25,
    incomeMultiplier: 17,
    foirPercentage: 0.54,
    interestRate: 8.3,
    processingFee: 0.0085,
    companyCategory: "B"
  },
  {
    id: 12,
    name: "Bank L",
    minCreditScore: 750,
    maxLoanTenure: 40,
    incomeMultiplier: 25,
    foirPercentage: 0.7,
    interestRate: 7.5,
    processingFee: 0.004,
    companyCategory: "A"
  },
  {
    id: 13,
    name: "Bank M",
    minCreditScore: 600,
    maxLoanTenure: 20,
    incomeMultiplier: 13,
    foirPercentage: 0.46,
    interestRate: 8.9,
    processingFee: 0.0125,
    companyCategory: "C"
  },
  {
    id: 14,
    name: "Bank N",
    minCreditScore: 660,
    maxLoanTenure: 30,
    incomeMultiplier: 18,
    foirPercentage: 0.55,
    interestRate: 8.4,
    processingFee: 0.0095,
    companyCategory: "B"
  }
];

// Mock company data categorized by tiers
const COMPANY_CATEGORIES = {
  "A": [
    "Google", "Microsoft", "Apple", "Amazon", "Facebook", 
    "Netflix", "Tesla", "Walmart", "JPMorgan", "Bank of America"
  ],
  "B": [
    "Infosys", "TCS", "Wipro", "HCL", "Tech Mahindra",
    "Accenture", "Cognizant", "IBM", "Oracle", "SAP"
  ],
  "C": [
    "Local IT Firm", "Regional Bank", "Small Manufacturing",
    "Local Retail", "Startup Company", "Consulting Firm",
    "Marketing Agency", "Logistics Company", "Real Estate Firm"
  ]
};

// Function to determine company category
const getCompanyCategory = (companyName) => {
  for (const [category, companies] of Object.entries(COMPANY_CATEGORIES)) {
    if (companies.some(company => 
      companyName.toLowerCase().includes(company.toLowerCase()) ||
      company.toLowerCase().includes(companyName.toLowerCase())
    )) {
      return category;
    }
  }
  // Default to category C if not found
  return "C";
};

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

// Function to check eligibility for a specific bank
const checkBankEligibility = (userData, bankRule) => {
  const {
    desiredLoanAmount,
    loanTenure,
    monthlyIncome,
    existingEMI,
    companyName,
    creditScore
  } = userData;
  
  // Check credit score
  if (creditScore && creditScore < bankRule.minCreditScore) {
    return {
      eligible: false,
      reason: `Minimum credit score required is ${bankRule.minCreditScore}`
    };
  }
  
  // Check loan tenure
  if (loanTenure > bankRule.maxLoanTenure) {
    return {
      eligible: false,
      reason: `Maximum loan tenure is ${bankRule.maxLoanTenure} years`
    };
  }
  
  // Check company category
  const userCompanyCategory = getCompanyCategory(companyName);
  if (userCompanyCategory !== bankRule.companyCategory && bankRule.companyCategory !== "A") {
    // If bank requires specific category and user doesn't match (except for A category banks which are more inclusive)
    // For simplicity, we'll allow all for A category banks
  }
  
  // Calculate FOIR-based loan amount
  const netMonthlyIncome = monthlyIncome - (existingEMI || 0);
  const eligibleEMI = netMonthlyIncome * bankRule.foirPercentage;
  
  // Calculate multiplier-based loan amount
  const multiplierLoanAmount = monthlyIncome * bankRule.incomeMultiplier;
  
  // Take the minimum of the two calculations
  const maxLoanAmount = Math.min(
    desiredLoanAmount || Infinity,
    multiplierLoanAmount
  );
  
  // Calculate EMI for the loan amount
  const monthlyEMI = calculateEMI(maxLoanAmount, bankRule.interestRate, loanTenure);
  
  // Check if EMI is within FOIR limits
  if (monthlyEMI > eligibleEMI) {
    return {
      eligible: false,
      reason: `EMI of ₹${monthlyEMI.toLocaleString()} exceeds FOIR limit of ₹${eligibleEMI.toLocaleString()}`
    };
  }
  
  return {
    eligible: true,
    loanAmount: Math.round(maxLoanAmount),
    interestRate: bankRule.interestRate,
    monthlyEMI: Math.round(monthlyEMI),
    processingFee: Math.round(maxLoanAmount * bankRule.processingFee)
  };
};

import { bankCalculators } from '../banks/calculators.js';

// Function to calculate loan eligibility by calling bank-specific calculators
export const calculateLoanEligibility = async (userData) => {
  try {
    // In a real implementation, this would call the backend API
    // For now, we'll simulate the calculation using our bank calculators
    
    // Process each bank's calculation
    const results = bankCalculators.map(calculator => {
      return calculator(userData);
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return results;
  } catch (error) {
    console.error('Error calculating loan eligibility:', error);
    throw error;
  }
};

// Function to get bank data
export const getBanks = async () => {
  try {
    // In a real implementation, this would fetch from the backend
    // For now, we'll simulate the response
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return [
      { id: 1, name: "Kotak Mahindra Bank" },
      { id: 2, name: "HDFC Bank" },
      { id: 3, name: "ICICI Bank" },
      { id: 4, name: "Bandhan Bank" },
      { id: 5, name: "Cholamandalam Finance" },
      { id: 6, name: "Tata Capital" },
      { id: 7, name: "Poonawala Finance" },
      { id: 8, name: "Axis Finance" },
      { id: 9, name: "Shri Ram Finance" },
      { id: 10, name: "Piramal Finance" },
      { id: 11, name: "IndusInd Bank" },
      { id: 12, name: "IDFC First Bank" },
      { id: 13, name: "Bajaj Finance" },
      { id: 14, name: "L&T Finance" }
    ];
  } catch (error) {
    console.error('Error fetching banks:', error);
    throw error;
  }
};

// Function to get company categories
export const getCompanyCategories = async () => {
  try {
    // In a real implementation, this would fetch from the backend
    // For now, we'll simulate the response
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return {
      "AA": ["Google", "Microsoft", "Apple", "Amazon"],
      "A": ["TCS", "Infosys", "Wipro", "HCL"],
      "B": ["Tech Mahindra", "Mindtree", "Hexaware"],
      "C": ["Local IT Firm", "Regional Bank", "Small Manufacturing"],
      "D": ["Startups", "Small Businesses"]
    };
  } catch (error) {
    console.error('Error fetching company categories:', error);
    throw error;
  }
};
