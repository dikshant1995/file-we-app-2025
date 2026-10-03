import fs from 'fs';
import * as esbuild from 'esbuild';

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');

try {
  esbuild.transformSync(code, { loader: 'jsx', jsx: 'transform' });
  console.log('ESBUILD TRANSFORM SUCCESS! NO ERRORS!');
} catch (e) {
  console.error('ESBUILD TRANSFORM FAILED:', e.message);
}
