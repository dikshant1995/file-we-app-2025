import fs from 'fs';
import * as esbuild from 'esbuild';

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

// Check line by line or block by block for JSX parsing errors
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('`') && !line.includes('${')) {
    // Check if line contains backticks outside template literal interpolation
    console.log(`Line ${i + 1}: ${line}`);
  }
}
