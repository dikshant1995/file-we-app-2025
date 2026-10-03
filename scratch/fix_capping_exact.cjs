const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

function checkParse(testLines) {
  try {
    parser.parse(testLines.join('\n'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    return true;
  } catch (e) {
    return false;
  }
}

console.log('Testing single line removals inside capping tab (3131-3539)...');
let singleFix = false;
for (let i = 3130; i < 3539; i++) {
  const testLines = lines.filter((_, idx) => idx !== i);
  if (checkParse(testLines)) {
    console.log(`\n🎉 REMOVING LINE ${i + 1} ("${lines[i]}") FIXES THE PARSE ERROR PERFECTLY!`);
    singleFix = true;
    break;
  }
}

if (!singleFix) {
  console.log('Single line removal did not fix it. Testing pairs of lines in capping tab...');
  for (let i = 3130; i < 3539; i++) {
    for (let j = i + 1; j < 3539; j++) {
      const testLines = lines.filter((_, idx) => idx !== i && idx !== j);
      if (checkParse(testLines)) {
        console.log(`\n🎉 REMOVING LINE ${i + 1} ("${lines[i]}") AND LINE ${j + 1} ("${lines[j]}") FIXES THE BUILD!`);
        singleFix = true;
        break;
      }
    }
    if (singleFix) break;
  }
}
