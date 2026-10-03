import fs from 'fs';
import * as esbuild from 'esbuild';

let code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

const cleanedLines = [];
for (let i = 0; i < lines.length; i++) {
  const current = lines[i].trim();
  const next = (lines[i + 1] || '').trim();
  const nextNext = (lines[i + 2] || '').trim();
  
  if (current.includes('{(activeConfigBank?.id ===') && (next === '' || current === nextNext) && current === (lines[i + 2] || '').trim()) {
    console.log(`Removing duplicate line ${i + 3}: ${lines[i + 2]}`);
    cleanedLines.push(lines[i]);
    if (lines[i + 1].trim() === '') i++;
    i++; // Skip duplicate
    continue;
  }
  cleanedLines.push(lines[i]);
}

const newCode = cleanedLines.join('\n');
fs.writeFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', newCode, 'utf8');

try {
  esbuild.transformSync(newCode, { loader: 'jsx', jsx: 'transform' });
  console.log('\n======================================================');
  console.log('🎉 SUCCESS! ESBUILD TRANSFORM PASSED WITH ZERO ERRORS!');
  console.log('======================================================\n');
} catch (err) {
  console.error('\nESBUILD RESULT:', err.message);
}
