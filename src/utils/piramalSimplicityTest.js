// Piramal Finance - Ultra-Simple NTH-Based FOIR Test
// Testing the simplest lending system among all banks

import { piramalConfig } from '../banks/piramal/config.js';

console.log('\n================================================================');
console.log('PIRAMAL FINANCE - ULTRA-SIMPLE NTH-BASED FOIR SYSTEM');
console.log('================================================================\n');

console.log('Bank: Piramal Finance');
console.log('Calculation Method: FOIR-Only (No Multiplier)');
console.log('Unique Feature: Only TWO NTH bands - Simplest among ALL banks!\n');

// Display NTH FOIR Table
console.log('================================================================');
console.log('COMPLETE NTH-FOIR TABLE');
console.log('================================================================\n');

console.log('NTH Salary Band'.padEnd(25) + '| FOIR  | Description');
console.log('-'.repeat(70));

const nthBands = ['20000-35000', '35001+'];
nthBands.forEach(band => {
  const data = piramalConfig.nthFoirTable[band];
  const foir = (data.foir * 100).toFixed(0) + '%';
  console.log(`${band.padEnd(25)}| ${foir.padEnd(5)} | ${data.description}`);
});

console.log('\n');

// Key Insights
console.log('================================================================');
console.log('KEY INSIGHTS - ULTIMATE SIMPLICITY');
console.log('================================================================\n');

console.log('✅ 1. LOWEST MINIMUM AMONG ALL BANKS:');
console.log(`      ₹${piramalConfig.minNTH.toLocaleString()} NTH (vs ₹25K-50K at others)`);
console.log('      Most accessible entry point\n');

console.log('✅ 2. SIMPLEST FOIR SYSTEM:');
console.log('      Only TWO NTH bands (vs 3-5+ at other banks)');
console.log('      ₹20K-35K → 65% FOIR');
console.log('      >₹35K → 70% FOIR\n');

console.log('✅ 3. GENEROUS FOIR PERCENTAGES:');
console.log('      65% even for lowest NTH band');
console.log('      70% for higher earners');
console.log('      Among highest FOIRs in the market\n');

console.log('✅ 4. NO CATEGORY DISTINCTION:');
console.log('      No A/B/C/D/UNLISTED categories');
console.log('      Everyone treated equally');
console.log('      Income is the ONLY factor\n');

console.log('✅ 5. NTH-BASED (REALISTIC):');
console.log('      Uses Net Take-Home, not gross');
console.log('      More accurate repayment capacity assessment\n');

// Minimum NTH comparison
console.log('================================================================');
console.log('MINIMUM NTH COMPARISON - ALL BANKS');
console.log('================================================================\n');

console.log('Bank              | Minimum NTH | Notes');
console.log('------------------|-------------|-------------------------');
console.log('Piramal           | ₹20,000     | LOWEST (most accessible) 🏆');
console.log('Cholamandalam     | ₹20,000     | But varies by category');
console.log('Axis Finance      | ₹25,000     | Universal');
console.log('Tata Capital      | ₹25,000     | A-D categories');
console.log('Shri Ram          | ₹25,000     | Universal');
console.log('Kotak Mahindra    | ₹25,000     | A-C categories');
console.log('Poonawala         | ₹30,000     | Baseline for A-D');
console.log('HDFC Bank         | ₹25,000     | Most categories');
console.log('ICICI Bank        | ₹30,000     | Category A-C');
console.log('Bandhan Bank      | Varies      | Location-based');

console.log('\n🏆 Piramal TIES for lowest at ₹20,000!\n');

// FOIR comparison
console.log('================================================================');
console.log('FOIR COMPARISON AT DIFFERENT NTH LEVELS');
console.log('================================================================\n');

const testNTH1 = 30000;
const testNTH2 = 50000;

console.log(`Scenario 1: NTH = ₹${testNTH1.toLocaleString()}`);
console.log('-'.repeat(60));
console.log('Piramal Finance:');
console.log('  NTH Band: 20000-35000');
console.log('  FOIR: 65%');
console.log(`  Available EMI: ₹${(testNTH1 * 0.65).toLocaleString()}`);
console.log('\nOther Banks at ₹30K gross (approx):');
console.log('  Shri Ram: 50% FOIR (₹25K-35K band)');
console.log('  Axis (Cat A): No FOIR, uses multiplier');
console.log('  Poonawala: 60% FOIR (OTHERS band, Cat A)');
console.log('  → Piramal offers competitive/better FOIR\n');

console.log(`Scenario 2: NTH = ₹${testNTH2.toLocaleString()}`);
console.log('-'.repeat(60));
console.log('Piramal Finance:');
console.log('  NTH Band: 35001+');
console.log('  FOIR: 70%');
console.log(`  Available EMI: ₹${(testNTH2 * 0.70).toLocaleString()}`);
console.log('\nOther Banks at ₹50K gross (approx):');
console.log('  Shri Ram: 60% FOIR (₹35K-50K band)');
console.log('  Poonawala: 65% FOIR (PRIME band, Cat A)');
console.log('  Tata: 60% FOIR (₹25K-50K band)');
console.log('  → Piramal offers HIGHEST FOIR! 🏆\n');

// Practical examples
console.log('================================================================');
console.log('PRACTICAL EXAMPLES');
console.log('================================================================\n');

console.log('Example 1: Low-Income Applicant');
console.log('--------------------------------');
console.log('NTH Salary: ₹22,000/month');
console.log('Status: ✅ ELIGIBLE (above ₹20K minimum)');
console.log('NTH Band: 20000-35000');
console.log('FOIR: 65%');
console.log('Available EMI: ₹14,300');
console.log('\nWith 6-year tenure @ 11% interest:');
console.log('Approximate Loan: ₹7.5 lakhs');
console.log('\nOther Banks:');
console.log('  Most banks: ❌ NOT ELIGIBLE (below ₹25K minimum)');
console.log('  Only Piramal and Chola (some categories) accept ₹22K\n');

console.log('Example 2: Mid-Income Applicant');
console.log('--------------------------------');
console.log('NTH Salary: ₹40,000/month');
console.log('Status: ✅ ELIGIBLE');
console.log('NTH Band: 35001+');
console.log('FOIR: 70%');
console.log('Available EMI: ₹28,000');
console.log('\nWith 6-year tenure @ 11% interest:');
console.log('Approximate Loan: ₹14.7 lakhs');
console.log('\nComparison:');
console.log('  Shri Ram (₹40K): 60% FOIR = ₹24,000 EMI (₹4K less)');
console.log('  Piramal advantage: ₹4,000 more EMI capacity\n');

console.log('Example 3: High-Income Applicant');
console.log('--------------------------------');
console.log('NTH Salary: ₹80,000/month');
console.log('Status: ✅ ELIGIBLE');
console.log('NTH Band: 35001+');
console.log('FOIR: 70%');
console.log('Available EMI: ₹56,000');
console.log('\nWith 6-year tenure @ 11% interest:');
console.log('Approximate Loan: ₹29.4 lakhs');
console.log('\nNote: Same 70% FOIR regardless of how high income goes');
console.log('      Simple, predictable, no complex bands\n');

// Simplicity analysis
console.log('================================================================');
console.log('SIMPLICITY ANALYSIS - DECISION TREE');
console.log('================================================================\n');

console.log('Piramal Finance Decision Tree:');
console.log('------------------------------');
console.log('1. Is NTH ≥ ₹20,000?');
console.log('   ├─ NO → ❌ REJECT');
console.log('   └─ YES → Continue to step 2');
console.log('');
console.log('2. Calculate FOIR:');
console.log('   ├─ If NTH ₹20K-35K → FOIR = 65%');
console.log('   └─ If NTH >₹35K → FOIR = 70%');
console.log('');
console.log('3. Calculate Available EMI:');
console.log('   Available EMI = NTH × FOIR');
console.log('');
console.log('4. Check loan eligibility against Available EMI');
console.log('');
console.log('DONE! ✅ Only 4 steps!\n');

console.log('Compare to other banks:');
console.log('-----------------------');
console.log('Poonawala: 7 segments × 5 NTH bands = 35 combinations');
console.log('Tata: 6 categories × 3 salary bands (FOIR) + multiplier');
console.log('Axis: 5 categories × 3 salary bands (multiplier only)');
console.log('Piramal: 1 check + 2 FOIR values = SIMPLEST! 🏆\n');

// Strategic positioning
console.log('================================================================');
console.log('STRATEGIC POSITIONING');
console.log('================================================================\n');

console.log('🎯 TARGET MARKET:');
console.log('   • Lower-income segment (₹20K-35K NTH)');
console.log('   • Mass market accessibility');
console.log('   • Quick decision seekers');
console.log('   • Customers valuing simplicity\n');

console.log('🎯 COMPETITIVE ADVANTAGES:');
console.log('   • Lowest entry barrier (₹20K)');
console.log('   • Simplest application process');
console.log('   • Fastest decision-making');
console.log('   • No complex category verification');
console.log('   • Transparent and predictable\n');

console.log('🎯 RISK APPROACH:');
console.log('   • Generous FOIR (65%-70%)');
console.log('   • Trust in NTH-based assessment');
console.log('   • Minimal bureaucracy');
console.log('   • Focus on repayment capacity, not employer\n');

console.log('🎯 CUSTOMER EXPERIENCE:');
console.log('   • "Am I eligible?" → Check if NTH ≥ ₹20K');
console.log('   • "How much EMI?" → NTH × (65% or 70%)');
console.log('   • That\'s it! No complex calculations\n');

// Advantages for different segments
console.log('================================================================');
console.log('WHO BENEFITS MOST FROM PIRAMAL?');
console.log('================================================================\n');

console.log('✅ BEST FOR:');
console.log('   1. Lower-income earners (₹20K-25K NTH)');
console.log('      → Only bank (with Chola) that accepts them');
console.log('');
console.log('   2. Applicants with irregular income documentation');
console.log('      → No complex employer category verification');
console.log('');
console.log('   3. Self-employed/freelancers');
console.log('      → NTH-based, not employer-based');
console.log('');
console.log('   4. Time-sensitive applications');
console.log('      → Fastest processing due to simplicity');
console.log('');
console.log('   5. First-time borrowers');
console.log('      → Easy to understand terms\n');

console.log('⚠️  LESS COMPETITIVE FOR:');
console.log('   • Very high earners in premium categories');
console.log('     (Banks with multipliers might offer more)');
console.log('   • Category A employees at top companies');
console.log('     (Might get better terms with category-based banks)\n');

console.log('================================================================');
console.log('SUMMARY');
console.log('================================================================\n');

console.log('Piramal Finance Positioning:');
console.log('• SIMPLEST system among all 8 configured banks');
console.log('• MOST ACCESSIBLE with ₹20K minimum');
console.log('• GENEROUS FOIR at 65%-70%');
console.log('• NO CATEGORY discrimination');
console.log('• FASTEST decision-making');
console.log('• Focus on INCOME, not employer quality');
console.log('• Ideal for MASS MARKET and lower-income segments\n');

console.log('🏆 Awards:');
console.log('• 🥇 Simplest lending system');
console.log('• 🥇 Joint-lowest minimum (with Cholamandalam)');
console.log('• 🥇 Fastest processing (due to simplicity)');
console.log('• 🥇 Most transparent terms\n');

console.log('================================================================\n');

export { nthBands };
