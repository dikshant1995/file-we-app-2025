const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

function checkParse(codeStr) {
  try {
    parser.parse(codeStr, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    return true;
  } catch (e) {
    return false;
  }
}

console.log('Testing line-by-line deletion to find single-line syntax errors...');

let foundFix = false;
for (let i = 0; i < lines.length; i++) {
  // Try commenting out or deleting line i
  const copy = [...lines];
  copy[i] = ' ';
  if (checkParse(copy.join('\n'))) {
    console.log(`\n🎉 REMOVING LINE ${i + 1} FIXES THE PARSE ERROR!`);
    console.log(`Line ${i + 1} content: "${lines[i]}"`);
    foundFix = true;
  }
}

if (!foundFix) {
  console.log('Single line deletion did not fix it. Testing 2 to 10 line range deletions...');
  
  // Try chunk deletions of size 2, 3, 5, 10
  for (let chunkSize of [2, 3, 4, 5, 10, 20]) {
    for (let i = 0; i < lines.length - chunkSize; i += chunkSize) {
      const copy = [...lines];
      for (let j = 0; j < chunkSize; j++) copy[i + j] = ' ';
      if (checkParse(copy.join('\n'))) {
        console.log(`\n🎉 REMOVING LINES ${i + 1} to ${i + chunkSize} FIXES THE PARSE ERROR!`);
        for (let j = 0; j < chunkSize; j++) {
          console.log(`  Line ${i + 1 + j}: "${lines[i + j]}"`);
        }
        foundFix = true;
        break;
      }
    }
    if (foundFix) break;
  }
}
