const path = require('path');
const { calculateRealLoanEligibility } = require(path.resolve('./src/services/realLoanService.js'));

const userProfile = {
  fullName: 'Test User',
  mobileNumber: '9876543210',
  state: 'Rajasthan',
  city: 'Jaipur',
  netSalary: 50000,
  monthlyIncome: 50000,
  pfDeduction: true,
  cibilScore: 750,
  age: 30,
  maritalStatus: 'Single',
  livingArrangement: 'Rented',
  employmentType: 'Private',
  companyName: 'Tata Consultancy Services',
  companyCategory: 'CAT A',
  workExperience: '> 2 Years',
  salaryPaymentMode: 'Bank Transfer',
  existingEmis: 0,
  desiredLoanAmount: 500000,
  tenureYears: 5
};

async function testAll() {
  const result = await calculateRealLoanEligibility(userProfile);
  console.log('=== ELIGIBILITY REPORT FOR USER ===');
  console.log('Monthly Net Salary: ₹50,000');
  console.log('Location: Jaipur, Rajasthan');
  console.log('CIBIL Score: 750');
  console.log('Employment: Private (Cat A Company)');
  console.log('-----------------------------------');
  console.log('Total Partner Banks Evaluated:', result.bankResults.length);
  console.log('Eligible Banks Count:', result.eligibleBanksCount);
  console.log('\n--- BANK BY BANK BREAKDOWN ---');
  
  result.bankResults.forEach((b, idx) => {
    if (b.eligible) {
      console.log(`${idx + 1}. ✅ ${b.bankName}:`);
      console.log(`   - Max Approved Loan: ₹${(b.loanAmount || 0).toLocaleString('en-IN')}`);
      console.log(`   - Interest Rate: ${b.interestRate}% p.a.`);
      console.log(`   - Estimated Monthly EMI: ₹${(b.monthlyEMI || 0).toLocaleString('en-IN')}`);
      console.log(`   - Tenure: ${b.loanTenureMonths || 60} months`);
    } else {
      console.log(`${idx + 1}. ❌ ${b.bankName}: Not Eligible (${b.rejectionReason || b.reason || 'Policy criteria not met'})`);
    }
  });
}

testAll().catch(err => console.error(err));
