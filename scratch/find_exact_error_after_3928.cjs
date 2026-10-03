const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

// First remove line 3804 (index 3803)
const linesNo3804 = lines.filter((_, idx) => idx !== 3803);

function checkParse(linesArray) {
  try {
    parser.parse(linesArray.join('\n'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    return true;
  } catch (e) {
    return false;
  }
}

console.log('Testing line chunk removal after line 3804...');

// Test 50-line chunks from line 3900 to end
let foundFix = false;
for (let i = 3900; i < linesNo3804.length; i += 50) {
  const end = Math.min(i + 50, linesNo3804.length);
  const testLines = [...linesNo3804];
  for (let j = i; j < end; j++) testLines[j] = ' ';
  if (checkParse(testLines)) {
    console.log(`\n🎉 REMOVING LINES ${i + 1} to ${end} (along with line 3804) FIXES THE PARSE ERROR!`);
    
    // Narrow down exact lines in this chunk
    for (let j = i; j < end; j++) {
      const singleTest = [...linesNo3804];
      singleTest[j] = ' ';
      if (checkParse(singleTest)) {
        console.log(`\n🎉🎉 EXACT MATCH! Removing line ${j + 1} (in modified file) fixes the build!`);
        console.log(`Line content: "${linesNo3804[j]}"`);
        foundFix = true;
        break;
      }
    }
    if (!foundFix) {
      console.log(`Chunk ${i+1}-${end} contains multi-line error.`);
    }
    break;
  }
}
