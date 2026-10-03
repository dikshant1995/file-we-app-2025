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

console.log('Bisecting lines 3131 to 3539 in capping tab...');

// Test 5-line chunks inside capping tab
for (let i = 3130; i < 3539; i += 5) {
  const end = Math.min(i + 5, 3539);
  const testLines = [...lines];
  for (let j = i; j < end; j++) testLines[j] = ' ';
  if (checkParse(testLines)) {
    console.log(`\n🎉 REMOVING LINES ${i + 1} to ${end} FIXES THE BUILD!`);
    
    // Check line by line in this 5-line chunk
    for (let j = i; j < end; j++) {
      const singleTest = [...lines];
      singleTest[j] = ' ';
      if (checkParse(singleTest)) {
        console.log(`\n🎉🎉 EXACT SINGLE LINE FIX! Removing line ${j + 1} fixes the build!`);
        console.log(`Line ${j + 1} content: "${lines[j]}"`);
      }
    }
  }
}
