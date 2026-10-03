import { calculateLoanEligibility } from '../src/services/realLoanService.js';

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
  const bankResults = await calculateLoanEligibility(userProfile);
  console.log('\n=============================================================');
  console.log('🏛️  INSTANT PRE-APPROVED LOAN OFFERS FOR FORM APPLICANT');
  console.log('=============================================================');
  console.log('Applicant Details:');
  console.log('- Net Monthly Salary: ₹50,000');
  console.log('- City/State: Jaipur, Rajasthan');
  console.log('- Credit Profile: CIBIL 750');
  console.log('- Employment: Private Sector (Tata Consultancy Services - Cat A)');
  console.log('- Experience: > 2 Years | Age: 30');
  console.log('- Existing Monthly EMIs: ₹0');
  console.log('-------------------------------------------------------------');
  
  const eligibleBanks = bankResults.filter(b => b.eligible);
  console.log(`Summary: ${eligibleBanks.length} out of ${bankResults.length} Partner Banks Approved Loan Offers!\n`);
  
  bankResults.forEach((b, idx) => {
    if (b.eligible) {
      console.log(`${idx + 1}. ✅ ${b.bankName}:`);
      console.log(`   - Approved Max Loan Limit: ₹${(b.loanAmount || 0).toLocaleString('en-IN')}`);
      console.log(`   - Interest Rate: ${b.interestRate}% p.a.`);
      console.log(`   - Monthly EMI: ₹${(b.monthlyEMI || 0).toLocaleString('en-IN')} (for 5 Years)`);
      if (b.processingFee) console.log(`   - Processing Fee: ${b.processingFee}%`);
      console.log(`   - Category/Slab: ${b.details?.appliedRoiSlab || b.category || 'N/A'}`);
    } else {
      console.log(`${idx + 1}. ❌ ${b.bankName}: Not Eligible (${b.reason || b.rejectionReason || 'Policy criteria not met'})`);
    }
  });
}

testAll().catch(err => console.error(err));
