import fs from 'fs';
import * as esbuild from 'esbuild';

let code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(') : (') && (lines[i - 1]?.includes('</div>') || lines[i - 2]?.includes('</div>'))) {
    console.log(`Removing leftover ternary branch line ${i + 1}: ${lines[i]}`);
    lines[i] = '';
    if (lines[i - 1].includes('</div>')) lines[i - 1] = '';
  }
}

const newCode = lines.filter(l => l !== 'REMOVE_LINE').join('\n');
fs.writeFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', newCode, 'utf8');

// Test esbuild
try {
  esbuild.transformSync(newCode, { loader: 'jsx', jsx: 'transform' });
  console.log('\n======================================================');
  console.log('🎉🎉🎉 SUCCESS! ESBUILD TRANSFORM PASSED WITH 0 ERRORS! 🎉🎉🎉');
  console.log('======================================================\n');
} catch (err) {
  console.error('\nESBUILD ERROR:', err.message);
}
