import fs from 'fs';

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

for (let i = 7265; i < 7305; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
