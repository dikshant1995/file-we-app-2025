// Poonawala Finance - FOIR Matrix Test
// Testing two-dimensional FOIR matrix: Customer Segment × NTH Salary

import { poonawalaConfig } from '../banks/poonawala/config.js';

console.log('\n================================================================');
console.log('POONAWALA FINANCE - TWO-DIMENSIONAL FOIR MATRIX');
console.log('================================================================\n');

console.log('Bank: Poonawala Finance');
console.log('Calculation Method: FOIR-Only (No Multiplier)');
console.log('Approach: Two-Dimensional Matrix (Segment × NTH Salary)');
console.log('NTH = Net Take-Home (Post-tax disposable income)\n');

// Display FOIR Matrix
console.log('================================================================');
console.log('COMPLETE FOIR MATRIX');
console.log('================================================================\n');

const segments = ['SUP-A', 'A', 'B', 'GOVT', 'C', 'D', 'E'];
const nthBands = ['SUP-HNI', 'HNI', 'AFFLUENT', 'PRIME', 'OTHERS'];

// Header row
console.log('Segment'.padEnd(12) + '| ' + 
  'SUP-HNI (>2.5L)'.padEnd(18) + '| ' +
  'HNI (1.5L-2.5L)'.padEnd(18) + '| ' +
  'AFFLUENT (75K-1.5L)'.padEnd(22) + '| ' +
  'PRIME (50K-75K)'.padEnd(18) + '| ' +
  'OTHERS (30K-50K)'
);
console.log('-'.repeat(130));

// Data rows
segments.forEach(segment => {
  const row = segment.padEnd(12) + '| ';
  const foirData = poonawalaConfig.foirMatrix[segment];
  
  let rowData = row;
  nthBands.forEach((band, index) => {
    const foir = foirData[band].foir;
    const foirDisplay = foir === null ? 'NA' : (foir * 100).toFixed(0) + '%';
    const padding = index === 0 ? 18 : index === 1 ? 18 : index === 2 ? 22 : 18;
    rowData += foirDisplay.padEnd(padding) + '| ';
  });
  
  console.log(rowData);
});

console.log('\n');

// Key Insights
console.log('================================================================');
console.log('KEY INSIGHTS FROM FOIR MATRIX');
console.log('================================================================\n');

console.log('1. HIGHEST FOIR (75%):');
console.log('   • Segment SUP-A or A');
console.log('   • NTH Salary: >₹1.5L (SUP-HNI or HNI)');
console.log('   • These are premium customers with strong repayment capacity\n');

console.log('2. LOWEST FOIR (50%):');
console.log('   • Multiple combinations:');
console.log('     - Segment B/GOVT with OTHERS NTH (₹30K-50K)');
console.log('     - Segment C/D with OTHERS NTH (₹30K-50K)');
console.log('     - Segment E with AFFLUENT NTH (₹75K-1.5L)\n');

console.log('3. NOT ELIGIBLE (NA):');
console.log('   • Segment E with PRIME NTH (₹50K-75K)');
console.log('   • Segment E with OTHERS NTH (₹30K-50K)');
console.log('   • Risk threshold: Lowest segment + lower income = ineligible\n');

console.log('4. SEGMENT COMPARISON (for same NTH):');
console.log('   • At ₹40K NTH (OTHERS band):');
console.log('     - SUP-A/A: 60% FOIR');
console.log('     - B/GOVT: 50% FOIR (-10%)');
console.log('     - C/D: 50% FOIR (-10%)');
console.log('     - E: NA (Not Eligible)\n');

console.log('5. NTH BAND IMPACT (for same Segment):');
console.log('   • For Segment A:');
console.log('     - SUP-HNI (>₹2.5L): 75% FOIR');
console.log('     - HNI (₹1.5L-2.5L): 75% FOIR');
console.log('     - AFFLUENT (₹75K-1.5L): 70% FOIR (-5%)');
console.log('     - PRIME (₹50K-75K): 65% FOIR (-10%)');
console.log('     - OTHERS (₹30K-50K): 60% FOIR (-15%)\n');

// Test scenarios
console.log('================================================================');
console.log('TEST SCENARIOS');
console.log('================================================================\n');

const scenarios = [
  { segment: 'SUP-A', nth: 300000, band: 'SUP-HNI', description: 'Premium company, very high earner' },
  { segment: 'A', nth: 200000, band: 'HNI', description: 'Top company, high earner' },
  { segment: 'B', nth: 100000, band: 'AFFLUENT', description: 'Good company, affluent earner' },
  { segment: 'GOVT', nth: 60000, band: 'PRIME', description: 'Government employee, mid-earner' },
  { segment: 'C', nth: 40000, band: 'OTHERS', description: 'Average company, lower earner' },
  { segment: 'D', nth: 80000, band: 'AFFLUENT', description: 'Standard company, affluent earner' },
  { segment: 'E', nth: 180000, band: 'HNI', description: 'Lower company, high earner' },
  { segment: 'E', nth: 90000, band: 'AFFLUENT', description: 'Lower company, affluent earner' },
  { segment: 'E', nth: 60000, band: 'PRIME', description: 'Lower company, mid earner - INELIGIBLE' },
  { segment: 'E', nth: 40000, band: 'OTHERS', description: 'Lower company, lower earner - INELIGIBLE' }
];

scenarios.forEach((scenario, index) => {
  console.log(`Scenario ${index + 1}: ${scenario.description}`);
  console.log('-'.repeat(70));
  console.log(`Customer Segment: ${scenario.segment}`);
  console.log(`NTH Salary: ₹${scenario.nth.toLocaleString()}`);
  console.log(`NTH Band: ${scenario.band} (${poonawalaConfig.nthBands[scenario.band].description})`);
  
  const foirData = poonawalaConfig.foirMatrix[scenario.segment][scenario.band];
  const foir = foirData.foir;
  
  if (foir === null) {
    console.log('FOIR: NA');
    console.log('Status: ❌ NOT ELIGIBLE');
    console.log('Reason: Segment E with PRIME/OTHERS NTH is below minimum risk threshold');
  } else {
    const foirPercentage = (foir * 100).toFixed(0);
    const availableEMI = scenario.nth * foir;
    console.log(`FOIR: ${foirPercentage}%`);
    console.log(`Available EMI Capacity: ₹${availableEMI.toLocaleString()}`);
    console.log('Status: ✅ ELIGIBLE');
  }
  
  console.log('\n');
});

// Minimum NTH Requirements
console.log('================================================================');
console.log('MINIMUM NTH REQUIREMENTS BY SEGMENT');
console.log('================================================================\n');

segments.forEach(segment => {
  const minNTH = poonawalaConfig.minNTHBySegment[segment];
  const description = poonawalaConfig.customerSegments[segment].description;
  console.log(`${segment.padEnd(8)} | Min NTH: ₹${minNTH.toLocaleString().padEnd(10)} | ${description}`);
});

console.log('\n');
console.log('⚠️  Note: Segment E requires minimum ₹75,000 NTH (AFFLUENT level)');
console.log('    All other segments require minimum ₹30,000 NTH\n');

// Strengths of Poonawala's Approach
console.log('================================================================');
console.log('STRENGTHS OF POONAWALA\'S APPROACH');
console.log('================================================================\n');

console.log('✅ 1. GRANULAR RISK ASSESSMENT:');
console.log('      Combines two critical dimensions - customer profile & income\n');

console.log('✅ 2. REALISTIC INCOME MEASURE:');
console.log('      Uses NTH (Net Take-Home) instead of gross salary');
console.log('      More accurate for assessing actual repayment capacity\n');

console.log('✅ 3. RISK MITIGATION:');
console.log('      Clear ineligibility criteria (Segment E + low NTH = NA)');
console.log('      Prevents high-risk lending combinations\n');

console.log('✅ 4. TAILORED LENDING:');
console.log('      Highly customized FOIR based on specific customer profile');
console.log('      Better risk management and competitive offers\n');

console.log('✅ 5. PROGRESSIVE FOIR:');
console.log('      Higher earners in premium segments get up to 75% FOIR');
console.log('      Reflects confidence in their repayment capacity\n');

// Comparison table
console.log('================================================================');
console.log('FOIR RANGE COMPARISON');
console.log('================================================================\n');

console.log('Segment    | Minimum FOIR | Maximum FOIR | Range');
console.log('-----------|--------------|--------------|-------');
console.log('SUP-A/A    | 60%          | 75%          | 15%');
console.log('B/GOVT     | 50%          | 70%          | 20%');
console.log('C/D        | 50%          | 65%          | 15%');
console.log('E          | 50%          | 60%          | 10% (limited)');

console.log('\n================================================================\n');

export { scenarios };
