import fs from 'fs';

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

for (let i = 8300; i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
