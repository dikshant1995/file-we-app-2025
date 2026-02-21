// Test data for development and testing purposes

export const sampleUserData = {
  desiredLoanAmount: 5000000,
  loanTenure: 20,
  monthlyIncome: 100000,
  existingEMI: 20000,
  companyName: "Google",
  employmentType: "salaried",
  creditScore: 750
};

export const sampleBankResults = [
  {
    bankId: 1,
    bankName: "Bank A",
    eligible: true,
    loanAmount: 4500000,
    interestRate: 8.5,
    monthlyEMI: 38678,
    processingFee: 45000
  },
  {
    bankId: 2,
    bankName: "Bank B",
    eligible: true,
    loanAmount: 5000000,
    interestRate: 8.2,
    monthlyEMI: 42356,
    processingFee: 40000
  },
  {
    bankId: 3,
    bankName: "Bank C",
    eligible: false,
    reason: "Minimum credit score required is 650"
  },
  {
    bankId: 4,
    bankName: "Bank D",
    eligible: true,
    loanAmount: 4800000,
    interestRate: 8.0,
    monthlyEMI: 40234,
    processingFee: 38000
  }
];