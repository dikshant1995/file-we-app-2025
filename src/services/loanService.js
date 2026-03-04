// Mock data for 14 banks with different rules
const BANK_RULES = [
  {
    id: 1,
    name: "Bank A",
    minCreditScore: 650,
    maxLoanTenure: 30,
    incomeMultiplier: 15,
    foirPercentage: 0.5,
    interestRate: 11.0,
    processingFee: 0.01,
    category: "A"
  },
  {
    id: 2,
    name: "Bank B",
    minCreditScore: 700,
    maxLoanTenure: 25,
    incomeMultiplier: 18,
    foirPercentage: 0.55,
    interestRate: 11.0,
    processingFee: 0.008,
    category: "A"
  },
  {
    id: 3,
    name: "Bank C",
    minCreditScore: 600,
    maxLoanTenure: 20,
    incomeMultiplier: 12,
    foirPercentage: 0.45,
    interestRate: 11.0,
    processingFee: 0.012,
    category: "B"
  },
  {
    id: 4,
    name: "Bank D",
    minCreditScore: 680,
    maxLoanTenure: 30,
    incomeMultiplier: 20,
    foirPercentage: 0.6,
    interestRate: 11.0,
    processingFee: 0.007,
    category: "A"
  },
  {
    id: 5,
    name: "Bank E",
    minCreditScore: 620,
    maxLoanTenure: 15,
    incomeMultiplier: 10,
    foirPercentage: 0.4,
    interestRate: 11.0,
    processingFee: 0.015,
    category: "C"
  },
  {
    id: 6,
    name: "Bank F",
    minCreditScore: 720,
    maxLoanTenure: 35,
    incomeMultiplier: 22,
    foirPercentage: 0.65,
    interestRate: 11.0,
    processingFee: 0.005,
    category: "A"
  },
  {
    id: 7,
    name: "Bank G",
    minCreditScore: 600,
    maxLoanTenure: 25,
    incomeMultiplier: 14,
    foirPercentage: 0.48,
    interestRate: 11.0,
    processingFee: 0.011,
    category: "B"
  },
  {
    id: 8,
    name: "Bank H",
    minCreditScore: 650,
    maxLoanTenure: 20,
    incomeMultiplier: 16,
    foirPercentage: 0.52,
    interestRate: 11.0,
    processingFee: 0.009,
    category: "B"
  },
  {
    id: 9,
    name: "Bank I",
    minCreditScore: 700,
    maxLoanTenure: 30,
    incomeMultiplier: 19,
    foirPercentage: 0.58,
    interestRate: 11.0,
    processingFee: 0.0075,
    category: "A"
  },
  {
    id: 10,
    name: "Bank J",
    minCreditScore: 630,
    maxLoanTenure: 15,
    incomeMultiplier: 11,
    foirPercentage: 0.42,
    interestRate: 11.0,
    processingFee: 0.013,
    category: "C"
  },
  {
    id: 11,
    name: "Bank K",
    minCreditScore: 680,
    maxLoanTenure: 25,
    incomeMultiplier: 17,
    foirPercentage: 0.54,
    interestRate: 11.0,
    processingFee: 0.0085,
    category: "B"
  },
  {
    id: 12,
    name: "Bank L",
    minCreditScore: 750,
    maxLoanTenure: 40,
    incomeMultiplier: 25,
    foirPercentage: 0.7,
    interestRate: 11.0,
    processingFee: 0.004,
    category: "A"
  },
  {
    id: 13,
    name: "Bank M",
    minCreditScore: 600,
    maxLoanTenure: 20,
    incomeMultiplier: 13,
    foirPercentage: 0.46,
    interestRate: 11.0,
    processingFee: 0.0125,
    category: "C"
  },
  {
    id: 14,
    name: "Bank N",
    minCreditScore: 660,
    maxLoanTenure: 30,
    incomeMultiplier: 18,
    foirPercentage: 0.55,
    interestRate: 11.0,
    processingFee: 0.0095,
    category: "B"
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
    maxLoanAmount: Math.round(maxLoanAmount),
    interestRate: bankRule.interestRate,
    monthlyEMI: Math.round(monthlyEMI),
    processingFee: Math.round(maxLoanAmount * bankRule.processingFee)
  };
};

import { bankCalculators } from '../banks/calculators.js';

// Function to calculate loan eligibility by calling bank-specific calculators
export const calculateLoanEligibility = async (userData) => {
  try {
    // PRE-PROCESSING: Calculate Balance Transfer totals if in BT mode
    const processedUserData = { ...userData };

    if (userData.wantsBT && userData.loansForBT && userData.loansForBT.length > 0) {
      console.log('🔄 loanService - Processing Balance Transfer Totals');

      const btTotalEMI = userData.loansForBT.reduce((sum, loan) =>
        sum + (parseFloat(loan.monthlyEMI) || 0), 0);

      const btTotalOutstanding = userData.loansForBT.reduce((sum, loan) =>
        sum + (parseFloat(loan.outstandingAmount) || parseFloat(loan.creditLimitUsed) || 0), 0);

      processedUserData.isBTMode = true;
      processedUserData.btTotalEMI = btTotalEMI;
      processedUserData.btTotalOutstanding = btTotalOutstanding;

      console.log('📊 BT Totals Calculated:', { btTotalEMI, btTotalOutstanding });
    }

    // Process each bank's calculation
    const results = bankCalculators.map(calculator => {
      return calculator(processedUserData);
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
