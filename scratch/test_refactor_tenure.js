import fs from 'fs';

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

lines.forEach((l, idx) => {
  if (l.toLowerCase().includes('finnable')) {
    console.log(`Line ${idx + 1}: ${l}`);
  }
});
