const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

// Remove line 3804 (index 3803)
const linesNo3804 = lines.filter((_, idx) => idx !== 3803);

function checkParse(linesArray) {
  try {
    parser.parse(linesArray.join('\n'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    return true;
  } catch (e) {
    return false;
  }
}

console.log('Testing 50-line chunks across the ENTIRE file...');

for (let i = 0; i < linesNo3804.length; i += 50) {
  const end = Math.min(i + 50, linesNo3804.length);
  const testLines = [...linesNo3804];
  for (let j = i; j < end; j++) testLines[j] = ' ';
  if (checkParse(testLines)) {
    console.log(`\n🎉 REMOVING LINES ${i + 1} to ${end} (along with line 3804) FIXES THE PARSE ERROR!`);
    
    // Test line by line in this chunk
    for (let j = i; j < end; j++) {
      const singleTest = [...linesNo3804];
      singleTest[j] = ' ';
      if (checkParse(singleTest)) {
        console.log(`\n🎉🎉 EXACT SINGLE LINE FIX! Removing line ${j + 1} (in modified file) fixes the build!`);
        console.log(`Line content: "${linesNo3804[j]}"`);
        break;
      }
    }
    break;
  }
}
