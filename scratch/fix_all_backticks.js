import fs from 'fs';
import * as esbuild from 'esbuild';

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

for (let i = 3750; i < 3800; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
