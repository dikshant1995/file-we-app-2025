import fs from 'fs';

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');

let openCount = 0;
let closeCount = 0;

const lines = code.split('\n');
lines.forEach((line, idx) => {
  // Ignore string contents or simple comments if possible
  const opens = (line.match(/\{/g) || []).length;
  const closes = (line.match(/\}/g) || []).length;
  openCount += opens;
  closeCount += closes;
  if (opens !== closes) {
    // line has brace imbalance
  }
});

console.log(`Total '{' = ${openCount}, Total '}' = ${closeCount}`);
console.log(`Brace Difference = ${openCount - closeCount}`);
