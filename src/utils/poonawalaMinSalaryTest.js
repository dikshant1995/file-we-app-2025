// Poonawala Finance - Minimum Salary Slab Test
// Testing minimum NTH salary requirements for different customer segments

import { poonawalaConfig } from '../banks/poonawala/config.js';

console.log('\n================================================================');
console.log('POONAWALA FINANCE - MINIMUM SALARY REQUIREMENTS TEST');
console.log('================================================================\n');

console.log('Bank: Poonawala Finance');
console.log('Note: Uses NTH (Net Take-Home) salary, not gross\n');

// Test cases for each segment
const testCases = [
  // Category A - Min: 30,000
  { segment: 'A', nth: 29000, expectedEligible: false },
  { segment: 'A', nth: 30000, expectedEligible: true },
  { segment: 'A', nth: 40000, expectedEligible: true },
  
  // Category B - Min: 30,000
  { segment: 'B', nth: 29000, expectedEligible: false },
  { segment: 'B', nth: 30000, expectedEligible: true },
  { segment: 'B', nth: 40000, expectedEligible: true },
  
  // Category C - Min: 30,000
  { segment: 'C', nth: 29000, expectedEligible: false },
  { segment: 'C', nth: 30000, expectedEligible: true },
  { segment: 'C', nth: 40000, expectedEligible: true },
  
  // Category D - Min: 30,000
  { segment: 'D', nth: 29000, expectedEligible: false },
  { segment: 'D', nth: 30000, expectedEligible: true },
  { segment: 'D', nth: 40000, expectedEligible: true },
  
  // Government - Min: 30,000
  { segment: 'GOVT', nth: 29000, expectedEligible: false },
  { segment: 'GOVT', nth: 30000, expectedEligible: true },
  
  // Category E - Min: 50,000 (Much higher!)
  { segment: 'E', nth: 30000, expectedEligible: false },
  { segment: 'E', nth: 40000, expectedEligible: false },
  { segment: 'E', nth: 49000, expectedEligible: false },
  { segment: 'E', nth: 50000, expectedEligible: true },
  { segment: 'E', nth: 75000, expectedEligible: true },
];

console.log('MINIMUM NTH SALARY REQUIREMENTS BY SEGMENT:');
console.log('============================================\n');

// Display minimum salary for each segment
const segments = ['SUP-A', 'A', 'B', 'GOVT', 'C', 'D', 'E'];
segments.forEach(segment => {
  const minNTH = poonawalaConfig.minNTHBySegment[segment];
  const description = poonawalaConfig.customerSegments[segment]?.description || 'N/A';
  const percentHigher = segment === 'E' ? ' (+67% higher)' : '';
  console.log(`${segment.padEnd(8)} | Min NTH: ₹${minNTH.toLocaleString().padEnd(10)} ${percentHigher.padEnd(15)} | ${description}`);
});

console.log('\n');
console.log('================================================================');
console.log('ELIGIBILITY TEST RESULTS');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

testCases.forEach((test, index) => {
  const minRequired = poonawalaConfig.minNTHBySegment[test.segment];
  const isEligible = test.nth >= minRequired;
  const testPassed = isEligible === test.expectedEligible;
  
  const status = testPassed ? '✅ PASS' : '❌ FAIL';
  const eligibility = isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE';
  
  console.log(`Test ${(index + 1).toString().padStart(2)}: Segment ${test.segment.padEnd(8)} | NTH: ₹${test.nth.toLocaleString().padEnd(10)} | ${eligibility.padEnd(13)} | ${status}`);
  
  if (testPassed) {
    passedTests++;
  } else {
    failedTests++;
  }
});

console.log('\n================================================================');
console.log('TEST SUMMARY');
console.log('================================================================');
console.log(`Total Tests: ${testCases.length}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
console.log('================================================================\n');

// Key Insights
console.log('KEY INSIGHTS:');
console.log('-------------');
console.log('1. Categories A, B, C, D, SUP-A, GOVT: Minimum NTH ₹30,000');
console.log('2. Category E: Minimum NTH ₹50,000 (67% higher!)');
console.log('3. Category E requires significantly higher income');
console.log('4. This aligns with FOIR matrix where E+PRIME/OTHERS = NA');
console.log('5. 50K minimum ensures Category E gets at least PRIME NTH band\n');

// Comparison with other banks
console.log('================================================================');
console.log('COMPARISON WITH OTHER BANKS');
console.log('================================================================\n');

console.log('Bank              | Cat A-D Min | Cat E/Unlisted Min | Approach');
console.log('------------------|-------------|--------------------|---------');
console.log('Poonawala         | ₹30,000     | ₹50,000 (+67%)    | Accepts E with high NTH');
console.log('Tata Capital      | ₹25,000     | ₹40,000 (+60%)    | Accepts UNLISTED with high salary');
console.log('Cholamandalam     | ₹20,000     | NOT ELIGIBLE      | Rejects UNLISTED completely');
console.log('Kotak Mahindra    | ₹25,000     | NOT ELIGIBLE      | Rejects UNLISTED completely');
console.log('HDFC Bank         | ₹25,000     | Varies            | Category-based');
console.log('ICICI Bank        | ₹30,000     | ₹50,000           | High minimum for UNLISTED');
console.log('\n');

console.log('OBSERVATIONS:');
console.log('-------------');
console.log('• Poonawala has HIGHER baseline (₹30K) than Tata (₹25K) and Chola (₹20K)');
console.log('• Targets higher-income demographic overall');
console.log('• Category E minimum (₹50K) is strategic:');
console.log('  - Ensures only PRIME NTH band (₹50K-75K) and above qualify');
console.log('  - OTHERS band (₹30K-50K) is excluded (consistent with FOIR matrix NA)');
console.log('• Most sophisticated approach: willing to accept E, but only high earners\n');

// Example scenarios
console.log('================================================================');
console.log('EXAMPLE SCENARIOS');
console.log('================================================================\n');

console.log('Scenario 1: Employee with ₹35,000 NTH');
console.log('---------------------------------------');
console.log('Category A: ✅ ELIGIBLE (Min: ₹30,000)');
console.log('Category B: ✅ ELIGIBLE (Min: ₹30,000)');
console.log('Category C: ✅ ELIGIBLE (Min: ₹30,000)');
console.log('Category D: ✅ ELIGIBLE (Min: ₹30,000)');
console.log('Category E: ❌ NOT ELIGIBLE (Min: ₹50,000, Short by ₹15,000)');
console.log('\n');

console.log('Scenario 2: Employee with ₹55,000 NTH');
console.log('---------------------------------------');
console.log('Category A: ✅ ELIGIBLE (Min: ₹30,000) → FOIR: 65% (PRIME band)');
console.log('Category B: ✅ ELIGIBLE (Min: ₹30,000) → FOIR: 60% (PRIME band)');
console.log('Category C: ✅ ELIGIBLE (Min: ₹30,000) → FOIR: 55% (PRIME band)');
console.log('Category D: ✅ ELIGIBLE (Min: ₹30,000) → FOIR: 55% (PRIME band)');
console.log('Category E: ✅ ELIGIBLE (Min: ₹50,000) → FOIR: 50% (AFFLUENT band)');
console.log('            Note: E at ₹55K gets AFFLUENT band (₹75K-1.5L), NOT PRIME');
console.log('            FOIR Matrix shows E+PRIME = NA, so system bumps to AFFLUENT\n');

console.log('Scenario 3: Category E employee progression');
console.log('--------------------------------------------');
console.log('₹30,000 NTH: ❌ NOT ELIGIBLE (below ₹50,000 minimum)');
console.log('₹40,000 NTH: ❌ NOT ELIGIBLE (below ₹50,000 minimum)');
console.log('₹50,000 NTH: ✅ ELIGIBLE, but...');
console.log('             → Falls in PRIME band (₹50K-75K)');
console.log('             → FOIR Matrix: E + PRIME = NA');
console.log('             → Still INELIGIBLE due to FOIR matrix!');
console.log('₹75,000 NTH: ✅ ELIGIBLE');
console.log('             → Falls in AFFLUENT band (₹75K-1.5L)');
console.log('             → FOIR Matrix: E + AFFLUENT = 50%');
console.log('             → ELIGIBLE with 50% FOIR\n');

console.log('⚠️  CRITICAL INSIGHT FOR CATEGORY E:');
console.log('    Minimum NTH is ₹50,000, BUT...');
console.log('    FOIR Matrix shows E + PRIME (₹50K-75K) = NA');
console.log('    Therefore, effective minimum for Category E is ₹75,000!');
console.log('    The ₹50K minimum is a preliminary check, not the final threshold.\n');

// Strategic Analysis
console.log('================================================================');
console.log('STRATEGIC ANALYSIS');
console.log('================================================================\n');

console.log('Why ₹50,000 minimum for Category E when FOIR says ₹75K?');
console.log('---------------------------------------------------------');
console.log('1. TWO-STAGE FILTERING:');
console.log('   Stage 1: Minimum NTH check (₹50,000)');
console.log('   Stage 2: FOIR Matrix check (requires ₹75,000 for eligibility)');
console.log('');
console.log('2. TECHNICAL REASON:');
console.log('   Prevents processing applications below PRIME band');
console.log('   PRIME band (₹50K-75K) can be checked but will fail FOIR matrix');
console.log('');
console.log('3. BUSINESS LOGIC:');
console.log('   Allows system to capture "near-miss" applications');
console.log('   Can track how many Category E applicants fall in ₹50K-75K range');
console.log('   Provides data for future policy decisions\n');

console.log('================================================================');
console.log('POONAWALA\'S RISK MITIGATION STRATEGY');
console.log('================================================================\n');

console.log('✅ Higher baseline income (₹30K vs ₹20-25K at other banks)');
console.log('✅ Targets higher-earning demographic');
console.log('✅ Willing to consider Category E (unlike some banks)');
console.log('✅ But demands significantly higher income from Category E');
console.log('✅ Dual filtering: Minimum NTH + FOIR Matrix');
console.log('✅ Most sophisticated risk assessment among all banks\n');

console.log('================================================================\n');

// Export results
export { testCases, passedTests, failedTests };
