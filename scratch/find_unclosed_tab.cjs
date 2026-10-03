const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

const tabs = [
  { name: 'rates', start: 1507, end: 3130 },
  { name: 'capping', start: 3131, end: 3539 },
  { name: 'tenure', start: 3540, end: 3930 },
  { name: 'foir', start: 3931, end: 6866 },
  { name: 'demographics', start: 6867, end: 7836 },
  { name: 'companies', start: 7837, end: 8062 }
];

function checkParse(testLines) {
  try {
    parser.parse(testLines.join('\n'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    return true;
  } catch (e) {
    return false;
  }
}

console.log('Testing blanking each TAB section...');

tabs.forEach(t => {
  const testLines = [...lines];
  for (let i = t.start - 1; i < t.end; i++) testLines[i] = ' ';
  const ok = checkParse(testLines);
  console.log(`Tab '${t.name}' (lines ${t.start}-${t.end}): ${ok ? '✅ BLANKING THIS TAB FIXES THE BUILD!' : '❌ Still broken'}`);
});
