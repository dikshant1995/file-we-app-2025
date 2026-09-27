import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCRcHH37y5rLy34xSW1OdSy5MklnSnuO6o",
    authDomain: "laxmi-credit.firebaseapp.com",
    projectId: "laxmi-credit",
    storageBucket: "laxmi-credit.firebasestorage.app",
    messagingSenderId: "439589007843",
    appId: "1:439589007843:web:63d32a89b258686144f0d6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getBankDocId = (bankName) => {
  return String(bankName || '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

const defaultConfigs = {
  'HDFC Bank': {
    interestRates: { defaultRate: 10.5, categoryRates: { 'Super A': 10.25, 'A': 10.75, 'B': 11.5, 'C': 12.5, 'Govt': 10.5 } },
    loanCapping: { absoluteMaxLoan: 7500000, minLoanAmount: 100000, bachelorCap: 3000000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 70, 'A': 65, 'B': 60, 'C': 55, 'Govt': 65 } }
  },
  'ICICI Bank': {
    interestRates: { defaultRate: 9.99, categoryRates: { 'Super Prime': 9.99, 'Preferred': 9.99, 'Elite': 10.5, 'Open Market': 11.5, 'Govt': 9.99, 'Army Profile': 10.5, 'NRI Case': 11.0 } },
    loanCapping: { absoluteMaxLoan: 10000000, minLoanAmount: 610000, bachelorCap: null },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 72 },
    foirSettings: { categoryBasedFOIR: { 'Super Prime': 65, 'Preferred': 65, 'Elite': 65, 'Open Market': 55, 'Govt': 65, 'Army Profile': 65, 'NRI Case': 60 } }
  },
  'Kotak Mahindra Bank': {
    interestRates: { defaultRate: 10.5, categoryRates: { 'Super A': 10.5, 'A': 11.0, 'B': 12.0, 'C': 13.5, 'Govt': 10.5 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCap: 2500000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 70, 'A': 65, 'B': 60, 'C': 55, 'Govt': 65 } }
  },
  'Tata Capital': {
    interestRates: { defaultRate: 10.99, categoryRates: { 'Super A': 10.99, 'A': 11.5, 'B': 12.5, 'C': 14.0, 'Govt': 11.0 } },
    loanCapping: { absoluteMaxLoan: 4000000, minLoanAmount: 100000, bachelorCap: 2000000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 72 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 65, 'A': 60, 'B': 55, 'C': 50, 'Govt': 60 } }
  },
  'IDFC First Bank': {
    interestRates: { defaultRate: 10.49, categoryRates: { 'Super A': 10.49, 'A': 10.99, 'B': 11.99, 'C': 13.49, 'Govt': 10.49 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCap: 2500000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 70, 'A': 65, 'B': 60, 'C': 55, 'Govt': 65 } }
  },
  'Poonawala Finance': {
    interestRates: { defaultRate: 11.25, categoryRates: { 'Super A': 11.25, 'A': 11.75, 'B': 12.5, 'C': 14.5, 'Govt': 11.25 } },
    loanCapping: { absoluteMaxLoan: 3500000, minLoanAmount: 100000, bachelorCap: 1500000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 60 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 65, 'A': 60, 'B': 55, 'C': 50, 'Govt': 60 } }
  },
  'IndusInd Bank': {
    interestRates: { defaultRate: 10.49, categoryRates: { 'Super A': 10.49, 'A': 11.0, 'B': 12.0, 'C': 13.5, 'Govt': 10.75 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCap: 2500000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 70, 'A': 65, 'B': 60, 'C': 55, 'Govt': 65 } }
  },
  'Cholamandalam Finance': {
    interestRates: { defaultRate: 12.0, categoryRates: { 'Super A': 12.0, 'A': 12.5, 'B': 13.5, 'C': 15.5, 'Govt': 12.0 } },
    loanCapping: { absoluteMaxLoan: 3000000, minLoanAmount: 100000, bachelorCap: 1500000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 60 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 60, 'A': 55, 'B': 50, 'C': 45, 'Govt': 55 } }
  },
  'Axis Finance': {
    interestRates: { defaultRate: 10.75, categoryRates: { 'Super A': 10.75, 'A': 11.25, 'B': 12.25, 'C': 13.75, 'Govt': 10.75 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCap: 2500000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 70, 'A': 65, 'B': 60, 'C': 55, 'Govt': 65 } }
  },
  'Bandhan Bank': {
    interestRates: { defaultRate: 11.5, categoryRates: { 'Super A': 11.5, 'A': 12.0, 'B': 13.0, 'C': 14.5, 'Govt': 11.5 } },
    loanCapping: { absoluteMaxLoan: 2500000, minLoanAmount: 100000, bachelorCap: 1000000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 60 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 60, 'A': 55, 'B': 50, 'C': 45, 'Govt': 55 } }
  },
  'Shri Ram Finance': {
    interestRates: { defaultRate: 12.5, categoryRates: { 'Super A': 12.5, 'A': 13.0, 'B': 14.0, 'C': 16.0, 'Govt': 12.5 } },
    loanCapping: { absoluteMaxLoan: 2000000, minLoanAmount: 100000, bachelorCap: 1000000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 48 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 55, 'A': 50, 'B': 45, 'C': 40, 'Govt': 50 } }
  },
  'Piramal Finance': {
    interestRates: { defaultRate: 11.75, categoryRates: { 'Super A': 11.75, 'A': 12.25, 'B': 13.25, 'C': 15.0, 'Govt': 11.75 } },
    loanCapping: { absoluteMaxLoan: 3000000, minLoanAmount: 100000, bachelorCap: 1500000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 60 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 60, 'A': 55, 'B': 50, 'C': 45, 'Govt': 55 } }
  },
  'Axis Bank': {
    interestRates: { defaultRate: 9.99, categoryRates: { 'Super A': 9.99, 'A': 9.99, 'B': 10.39, 'C': 10.59, 'Govt': 10.39 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 50000, bachelorCap: 2500000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 84 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 75, 'A': 75, 'B': 75, 'C': 75, 'Govt': 75 } }
  },
  'L&T Finance': {
    interestRates: { defaultRate: 12.50, categoryRates: { 'Super A': 11.50, 'A': 11.50, 'B': 11.50, 'C': 13.50, 'D': 14.50, 'Govt': 11.50 } },
    loanCapping: { absoluteMaxLoan: 3000000, minLoanAmount: 100000, bachelorCap: null, rentedCap: 2000000 },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 72 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 80, 'A': 80, 'B': 80, 'C': 75, 'D': 70, 'Govt': 80 } },
    multiplierRules: { categoryBasedMultiplier: { 'Super A': 24, 'A': 24, 'B': 24, 'C': 20, 'D': 16, 'Govt': 24 } },
    creditScoreRules: { minCreditScore: 720, recommendedScore: 750, premiumScore: 775, autoRejectionThreshold: 720 },
    demographics: { minAge: 21, maxAge: 60, retirementAge: 60, minSalary: 25000, minWorkExperience: 6, ccObligation: 5, allowCcBt: false }
  },
  'Piramal Finance': {
    interestRates: { defaultRate: 11.99, minRoi: 11.99, maxRoi: 28.00, categoryRates: { 'Super A': 11.99, 'A': 11.99, 'B': 12.99, 'C': 13.99, 'D': 14.99, 'Govt': 11.99 } },
    loanCapping: { absoluteMaxLoan: 5000000, minLoanAmount: 100000, bachelorCap: null },
    tenureRules: { minTenureMonths: 12, maxTenureMonths: 72, maxTenureOdMonths: 84, maxTenureHighIncomeOdMonths: 96 },
    foirSettings: { categoryBasedFOIR: { 'Super A': 70, 'A': 70, 'B': 65, 'C': 60, 'D': 55, 'Govt': 70 } },
    multiplierRules: { categoryBasedMultiplier: { 'Super A': 30, 'A': 24, 'B': 22, 'C': 18, 'D': 15, 'Govt': 24 } },
    creditScoreRules: { minCreditScore: 680, recommendedScore: 750, premiumScore: 750 },
    demographics: { minAge: 21, maxAge: 63, retirementAge: 60, retirementAgeGovt: 63, minSalary: 22000, pfMandatory: true, minWorkExperience: 12, ccObligation: 5, allowCcBt: true, ccBtAllowedCount: 2 }
  }
};

async function seed() {
  console.log("🚀 Seeding bank_configurations into Firebase Firestore...");
  for (const [bankName, config] of Object.entries(defaultConfigs)) {
    const docId = getBankDocId(bankName);
    const docRef = doc(db, "bank_configurations", docId);
    await setDoc(docRef, {
      bankName,
      config,
      seededAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    console.log(`✅ Uploaded: ${bankName} -> bank_configurations/${docId}`);
  }
  console.log("🎉 All 12 bank configurations successfully seeded to Firestore!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
