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

const STATE_CITY_MAPPING = {
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

const getBankDocId = (bankName) => {
  return String(bankName || '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

const defaultPolicies = {
  'HDFC Bank': {
    minRate: 10.5,
    maxLoan: 7500000,
    maxTenure: 84,
    interestRates: [
      { category: 'Super A', minRoi: 10.25, maxRoi: 12.00, defaultRoi: 10.50, minSalary: 100000 },
      { category: 'A', minRoi: 10.75, maxRoi: 13.50, defaultRoi: 11.00, minSalary: 50000 },
      { category: 'B', minRoi: 11.50, maxRoi: 15.00, defaultRoi: 12.00, minSalary: 35000 },
      { category: 'C', minRoi: 12.50, maxRoi: 18.00, defaultRoi: 13.50, minSalary: 25000 },
      { category: 'Govt', minRoi: 10.50, maxRoi: 12.50, defaultRoi: 10.75, minSalary: 20000 }
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
      { category: 'Super A', maxFoir: 70, multiplier: 28, ccObligation: 5 },
      { category: 'A', maxFoir: 65, multiplier: 24, ccObligation: 5 },
      { category: 'B', maxFoir: 60, multiplier: 20, ccObligation: 5 },
      { category: 'C', maxFoir: 55, multiplier: 18, ccObligation: 5 },
      { category: 'Govt', maxFoir: 65, multiplier: 25, ccObligation: 3 }
    ]
  },
  'ICICI Bank': {
    minRate: 10.75,
    maxLoan: 5000000,
    maxTenure: 84,
    interestRates: [
      { category: 'Super A', minRoi: 10.50, maxRoi: 12.50, defaultRoi: 10.75, minSalary: 100000 },
      { category: 'A', minRoi: 11.00, maxRoi: 13.50, defaultRoi: 11.25, minSalary: 50000 },
      { category: 'B', minRoi: 12.00, maxRoi: 15.50, defaultRoi: 12.50, minSalary: 35000 },
      { category: 'C', minRoi: 13.50, maxRoi: 18.00, defaultRoi: 14.00, minSalary: 25000 },
      { category: 'Govt', minRoi: 10.75, maxRoi: 12.75, defaultRoi: 11.00, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: 2500000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2000000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 3000000, bachelorCap: 1500000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1500000, bachelorCap: 800000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2500000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years' },
      { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 70, multiplier: 28, ccObligation: 5 },
      { category: 'A', maxFoir: 65, multiplier: 24, ccObligation: 5 },
      { category: 'B', maxFoir: 60, multiplier: 20, ccObligation: 5 },
      { category: 'C', maxFoir: 55, multiplier: 18, ccObligation: 5 },
      { category: 'Govt', maxFoir: 65, multiplier: 25, ccObligation: 3 }
    ]
  },
  'Kotak Mahindra Bank': {
    minRate: 10.5,
    maxLoan: 5000000,
    maxTenure: 84,
    interestRates: [
      { category: 'Super A', minRoi: 10.50, maxRoi: 12.00, defaultRoi: 10.75, minSalary: 100000 },
      { category: 'A', minRoi: 11.00, maxRoi: 13.00, defaultRoi: 11.25, minSalary: 50000 },
      { category: 'B', minRoi: 12.00, maxRoi: 15.00, defaultRoi: 12.25, minSalary: 35000 },
      { category: 'C', minRoi: 13.50, maxRoi: 17.50, defaultRoi: 13.75, minSalary: 25000 },
      { category: 'Govt', minRoi: 10.50, maxRoi: 12.50, defaultRoi: 10.75, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: 2500000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2000000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 3000000, bachelorCap: 1500000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1500000, bachelorCap: 800000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2500000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years' },
      { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 70, multiplier: 28, ccObligation: 5 },
      { category: 'A', maxFoir: 65, multiplier: 24, ccObligation: 5 },
      { category: 'B', maxFoir: 60, multiplier: 20, ccObligation: 5 },
      { category: 'C', maxFoir: 55, multiplier: 18, ccObligation: 5 },
      { category: 'Govt', maxFoir: 65, multiplier: 25, ccObligation: 3 }
    ]
  },
  'Tata Capital': {
    minRate: 10.99,
    maxLoan: 4000000,
    maxTenure: 72,
    interestRates: [
      { category: 'Super A', minRoi: 10.99, maxRoi: 12.50, defaultRoi: 11.25, minSalary: 100000 },
      { category: 'A', minRoi: 11.50, maxRoi: 14.00, defaultRoi: 11.75, minSalary: 50000 },
      { category: 'B', minRoi: 12.50, maxRoi: 16.00, defaultRoi: 13.00, minSalary: 35000 },
      { category: 'C', minRoi: 14.00, maxRoi: 18.50, defaultRoi: 14.50, minSalary: 25000 },
      { category: 'Govt', minRoi: 11.00, maxRoi: 13.00, defaultRoi: 11.50, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2000000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 3500000, bachelorCap: 1800000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 2500000, bachelorCap: 1200000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1500000, bachelorCap: 750000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 3500000, bachelorCap: 2000000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years' },
      { category: 'A', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years' },
      { category: 'B', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'C', minMonths: 12, maxMonths: 48, description: 'Up to 4 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 65, multiplier: 26, ccObligation: 5 },
      { category: 'A', maxFoir: 60, multiplier: 22, ccObligation: 5 },
      { category: 'B', maxFoir: 55, multiplier: 18, ccObligation: 5 },
      { category: 'C', maxFoir: 50, multiplier: 16, ccObligation: 5 },
      { category: 'Govt', maxFoir: 60, multiplier: 24, ccObligation: 3 }
    ]
  },
  'IDFC First Bank': {
    minRate: 10.49,
    maxLoan: 5000000,
    maxTenure: 84,
    interestRates: [
      { category: 'Super A', minRoi: 10.49, maxRoi: 12.00, defaultRoi: 10.75, minSalary: 100000 },
      { category: 'A', minRoi: 10.99, maxRoi: 13.50, defaultRoi: 11.25, minSalary: 50000 },
      { category: 'B', minRoi: 11.99, maxRoi: 15.00, defaultRoi: 12.25, minSalary: 35000 },
      { category: 'C', minRoi: 13.49, maxRoi: 17.50, defaultRoi: 13.75, minSalary: 25000 },
      { category: 'Govt', minRoi: 10.49, maxRoi: 12.50, defaultRoi: 10.75, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: 2500000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2000000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 3000000, bachelorCap: 1500000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1500000, bachelorCap: 800000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2500000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years' },
      { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 70, multiplier: 28, ccObligation: 5 },
      { category: 'A', maxFoir: 65, multiplier: 24, ccObligation: 5 },
      { category: 'B', maxFoir: 60, multiplier: 20, ccObligation: 5 },
      { category: 'C', maxFoir: 55, multiplier: 18, ccObligation: 5 },
      { category: 'Govt', maxFoir: 65, multiplier: 25, ccObligation: 3 }
    ]
  },
  'Poonawala Finance': {
    minRate: 11.25,
    maxLoan: 3500000,
    maxTenure: 60,
    interestRates: [
      { category: 'Super A', minRoi: 11.25, maxRoi: 13.00, defaultRoi: 11.50, minSalary: 100000 },
      { category: 'A', minRoi: 11.75, maxRoi: 14.50, defaultRoi: 12.25, minSalary: 50000 },
      { category: 'B', minRoi: 12.50, maxRoi: 16.00, defaultRoi: 13.00, minSalary: 35000 },
      { category: 'C', minRoi: 14.50, maxRoi: 19.00, defaultRoi: 15.00, minSalary: 25000 },
      { category: 'Govt', minRoi: 11.25, maxRoi: 13.50, defaultRoi: 11.75, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 3500000, bachelorCap: 1500000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 3000000, bachelorCap: 1500000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 2000000, bachelorCap: 1000000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1200000, bachelorCap: 600000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 3000000, bachelorCap: 1500000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'B', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'C', minMonths: 12, maxMonths: 48, description: 'Up to 4 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 65, multiplier: 25, ccObligation: 5 },
      { category: 'A', maxFoir: 60, multiplier: 22, ccObligation: 5 },
      { category: 'B', maxFoir: 55, multiplier: 18, ccObligation: 5 },
      { category: 'C', maxFoir: 50, multiplier: 15, ccObligation: 5 },
      { category: 'Govt', maxFoir: 60, multiplier: 22, ccObligation: 3 }
    ]
  },
  'IndusInd Bank': {
    minRate: 10.49,
    maxLoan: 5000000,
    maxTenure: 84,
    interestRates: [
      { category: 'Super A', minRoi: 10.49, maxRoi: 12.00, defaultRoi: 10.75, minSalary: 100000 },
      { category: 'A', minRoi: 11.00, maxRoi: 13.50, defaultRoi: 11.25, minSalary: 50000 },
      { category: 'B', minRoi: 12.00, maxRoi: 15.00, defaultRoi: 12.50, minSalary: 35000 },
      { category: 'C', minRoi: 13.50, maxRoi: 17.50, defaultRoi: 14.00, minSalary: 25000 },
      { category: 'Govt', minRoi: 10.75, maxRoi: 12.75, defaultRoi: 11.00, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: 2500000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2000000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 3000000, bachelorCap: 1500000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1500000, bachelorCap: 800000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2500000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years' },
      { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 70, multiplier: 28, ccObligation: 5 },
      { category: 'A', maxFoir: 65, multiplier: 24, ccObligation: 5 },
      { category: 'B', maxFoir: 60, multiplier: 20, ccObligation: 5 },
      { category: 'C', maxFoir: 55, multiplier: 18, ccObligation: 5 },
      { category: 'Govt', maxFoir: 65, multiplier: 25, ccObligation: 3 }
    ]
  },
  'Cholamandalam Finance': {
    minRate: 12.0,
    maxLoan: 3000000,
    maxTenure: 60,
    interestRates: [
      { category: 'Super A', minRoi: 12.00, maxRoi: 13.50, defaultRoi: 12.25, minSalary: 100000 },
      { category: 'A', minRoi: 12.50, maxRoi: 15.00, defaultRoi: 13.00, minSalary: 50000 },
      { category: 'B', minRoi: 13.50, maxRoi: 17.00, defaultRoi: 14.00, minSalary: 35000 },
      { category: 'C', minRoi: 15.50, maxRoi: 20.00, defaultRoi: 16.00, minSalary: 25000 },
      { category: 'Govt', minRoi: 12.00, maxRoi: 14.00, defaultRoi: 12.50, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 3000000, bachelorCap: 1500000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 2500000, bachelorCap: 1200000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 2000000, bachelorCap: 1000000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1000000, bachelorCap: 500000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 2500000, bachelorCap: 1500000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'B', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'C', minMonths: 12, maxMonths: 48, description: 'Up to 4 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 60, multiplier: 24, ccObligation: 5 },
      { category: 'A', maxFoir: 55, multiplier: 20, ccObligation: 5 },
      { category: 'B', maxFoir: 50, multiplier: 18, ccObligation: 5 },
      { category: 'C', maxFoir: 45, multiplier: 15, ccObligation: 5 },
      { category: 'Govt', maxFoir: 55, multiplier: 22, ccObligation: 3 }
    ]
  },
  'Axis Finance': {
    minRate: 10.75,
    maxLoan: 5000000,
    maxTenure: 84,
    interestRates: [
      { category: 'Super A', minRoi: 10.75, maxRoi: 12.50, defaultRoi: 11.00, minSalary: 100000 },
      { category: 'A', minRoi: 11.25, maxRoi: 13.50, defaultRoi: 11.50, minSalary: 50000 },
      { category: 'B', minRoi: 12.25, maxRoi: 15.50, defaultRoi: 12.50, minSalary: 35000 },
      { category: 'C', minRoi: 13.75, maxRoi: 18.00, defaultRoi: 14.00, minSalary: 25000 },
      { category: 'Govt', minRoi: 10.75, maxRoi: 12.75, defaultRoi: 11.00, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 5000000, bachelorCap: 2500000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2000000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 3000000, bachelorCap: 1500000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1500000, bachelorCap: 800000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 4000000, bachelorCap: 2500000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'A', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' },
      { category: 'B', minMonths: 12, maxMonths: 72, description: 'Up to 6 Years' },
      { category: 'C', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 84, description: 'Up to 7 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 70, multiplier: 28, ccObligation: 5 },
      { category: 'A', maxFoir: 65, multiplier: 24, ccObligation: 5 },
      { category: 'B', maxFoir: 60, multiplier: 20, ccObligation: 5 },
      { category: 'C', maxFoir: 55, multiplier: 18, ccObligation: 5 },
      { category: 'Govt', maxFoir: 65, multiplier: 25, ccObligation: 3 }
    ]
  },
  'Bandhan Bank': {
    minRate: 11.5,
    maxLoan: 2500000,
    maxTenure: 60,
    interestRates: [
      { category: 'Super A', minRoi: 11.50, maxRoi: 13.00, defaultRoi: 11.75, minSalary: 100000 },
      { category: 'A', minRoi: 12.00, maxRoi: 14.50, defaultRoi: 12.50, minSalary: 50000 },
      { category: 'B', minRoi: 13.00, maxRoi: 16.50, defaultRoi: 13.50, minSalary: 35000 },
      { category: 'C', minRoi: 14.50, maxRoi: 19.00, defaultRoi: 15.00, minSalary: 25000 },
      { category: 'Govt', minRoi: 11.50, maxRoi: 13.50, defaultRoi: 12.00, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 2500000, bachelorCap: 1000000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 2000000, bachelorCap: 1000000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 1500000, bachelorCap: 800000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1000000, bachelorCap: 500000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 2000000, bachelorCap: 1000000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'B', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'C', minMonths: 12, maxMonths: 48, description: 'Up to 4 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 60, multiplier: 24, ccObligation: 5 },
      { category: 'A', maxFoir: 55, multiplier: 20, ccObligation: 5 },
      { category: 'B', maxFoir: 50, multiplier: 18, ccObligation: 5 },
      { category: 'C', maxFoir: 45, multiplier: 15, ccObligation: 5 },
      { category: 'Govt', maxFoir: 55, multiplier: 20, ccObligation: 3 }
    ]
  },
  'Shri Ram Finance': {
    minRate: 12.5,
    maxLoan: 2000000,
    maxTenure: 48,
    interestRates: [
      { category: 'Super A', minRoi: 12.50, maxRoi: 14.50, defaultRoi: 12.75, minSalary: 100000 },
      { category: 'A', minRoi: 13.00, maxRoi: 15.50, defaultRoi: 13.50, minSalary: 50000 },
      { category: 'B', minRoi: 14.00, maxRoi: 17.50, defaultRoi: 14.50, minSalary: 35000 },
      { category: 'C', minRoi: 16.00, maxRoi: 21.00, defaultRoi: 17.00, minSalary: 25000 },
      { category: 'Govt', minRoi: 12.50, maxRoi: 14.50, defaultRoi: 13.00, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 2000000, bachelorCap: 1000000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 1800000, bachelorCap: 1000000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 1500000, bachelorCap: 750000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1000000, bachelorCap: 500000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 1800000, bachelorCap: 1000000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 48, description: 'Up to 4 Years' },
      { category: 'A', minMonths: 12, maxMonths: 48, description: 'Up to 4 Years' },
      { category: 'B', minMonths: 12, maxMonths: 48, description: 'Up to 4 Years' },
      { category: 'C', minMonths: 12, maxMonths: 36, description: 'Up to 3 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 48, description: 'Up to 4 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 55, multiplier: 22, ccObligation: 5 },
      { category: 'A', maxFoir: 50, multiplier: 18, ccObligation: 5 },
      { category: 'B', maxFoir: 45, multiplier: 16, ccObligation: 5 },
      { category: 'C', maxFoir: 40, multiplier: 14, ccObligation: 5 },
      { category: 'Govt', maxFoir: 50, multiplier: 20, ccObligation: 3 }
    ]
  },
  'Piramal Finance': {
    minRate: 11.75,
    maxLoan: 3000000,
    maxTenure: 60,
    interestRates: [
      { category: 'Super A', minRoi: 11.75, maxRoi: 13.50, defaultRoi: 12.00, minSalary: 100000 },
      { category: 'A', minRoi: 12.25, maxRoi: 14.50, defaultRoi: 12.75, minSalary: 50000 },
      { category: 'B', minRoi: 13.25, maxRoi: 16.50, defaultRoi: 13.75, minSalary: 35000 },
      { category: 'C', minRoi: 15.00, maxRoi: 19.50, defaultRoi: 15.50, minSalary: 25000 },
      { category: 'Govt', minRoi: 11.75, maxRoi: 14.00, defaultRoi: 12.25, minSalary: 20000 }
    ],
    loanCapping: [
      { tier: 'Super A', minLoan: 100000, maxLoan: 3000000, bachelorCap: 1500000, minSalary: 100000 },
      { tier: 'A', minLoan: 100000, maxLoan: 2500000, bachelorCap: 1200000, minSalary: 50000 },
      { tier: 'B', minLoan: 100000, maxLoan: 1800000, bachelorCap: 1000000, minSalary: 35000 },
      { tier: 'C', minLoan: 100000, maxLoan: 1000000, bachelorCap: 500000, minSalary: 25000 },
      { tier: 'Govt', minLoan: 100000, maxLoan: 2500000, bachelorCap: 1500000, minSalary: 20000 }
    ],
    tenureRules: [
      { category: 'Super A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'A', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'B', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' },
      { category: 'C', minMonths: 12, maxMonths: 48, description: 'Up to 4 Years' },
      { category: 'Govt', minMonths: 12, maxMonths: 60, description: 'Up to 5 Years' }
    ],
    foirMultiplier: [
      { category: 'Super A', maxFoir: 60, multiplier: 24, ccObligation: 5 },
      { category: 'A', maxFoir: 55, multiplier: 20, ccObligation: 5 },
      { category: 'B', maxFoir: 50, multiplier: 18, ccObligation: 5 },
      { category: 'C', maxFoir: 45, multiplier: 15, ccObligation: 5 },
      { category: 'Govt', maxFoir: 55, multiplier: 20, ccObligation: 3 }
    ]
  }
};

async function seedAllCities() {
  console.log("🚀 Pre-populating ALL 58 cities into Firebase Firestore for 12 banks...");

  // Build the cityOverrides object containing all 58 cities
  for (const [bankName, policy] of Object.entries(defaultPolicies)) {
    const docId = getBankDocId(bankName);
    const docRef = doc(db, "bank_configurations", docId);

    const cityOverrides = {};
    for (const [state, cities] of Object.entries(STATE_CITY_MAPPING)) {
      for (const city of cities) {
        const locationKey = `${state}-${city}`;
        cityOverrides[locationKey] = {
          unifiedPolicy: {
            interestRates: policy.interestRates,
            loanCapping: policy.loanCapping,
            tenureRules: policy.tenureRules,
            foirMultiplier: policy.foirMultiplier
          }
        };
      }
    }

    await setDoc(docRef, {
      bankName,
      lastUpdated: new Date().toISOString(),
      config: {
        interestRates: { defaultRate: policy.minRate, categoryRates: { 'Super A': policy.minRate, 'A': policy.minRate + 0.5, 'B': policy.minRate + 1.25, 'C': policy.minRate + 2.5 } },
        loanCapping: { absoluteMaxLoan: policy.maxLoan, minLoanAmount: 100000 },
        tenureRules: { minTenureMonths: 12, maxTenureMonths: policy.maxTenure },
        unifiedPolicy: {
          interestRates: policy.interestRates,
          loanCapping: policy.loanCapping,
          tenureRules: policy.tenureRules,
          foirMultiplier: policy.foirMultiplier
        },
        cityOverrides
      }
    }, { merge: true });

    console.log(`✅ Saved 58 cities for ${bankName} -> bank_configurations/${docId}`);
  }

  console.log("🎉 All 58 cities successfully populated across all 12 banks in Firebase Firestore!");
  process.exit(0);
}

seedAllCities().catch(err => {
  console.error("❌ City seeding failed:", err);
  process.exit(1);
});
