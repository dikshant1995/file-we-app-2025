const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

function checkParse(linesArray) {
  try {
    parser.parse(linesArray.join('\n'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    return true;
  } catch (e) {
    return false;
  }
}

// Find all lines that are just `)}` or `}` or `</div>`
const closingLineIndices = [];
lines.forEach((l, idx) => {
  const trimmed = l.trim();
  if (trimmed === ')}' || trimmed === '}' || trimmed === '</div>' || trimmed === '</div>)' || trimmed === '</div>}') {
    closingLineIndices.push(idx);
  }
});

console.log(`Found ${closingLineIndices.length} closing lines.`);

// Test removing pairs of closing lines
let fixFound = false;
for (let i = 0; i < closingLineIndices.length; i++) {
  for (let j = i; j < closingLineIndices.length; j++) {
    const idx1 = closingLineIndices[i];
    const idx2 = closingLineIndices[j];
    
    const testLines = lines.filter((_, idx) => idx !== idx1 && idx !== idx2);
    if (checkParse(testLines)) {
      console.log(`\n🎉 BINGO! Removing line ${idx1 + 1} ("${lines[idx1]}") AND line ${idx2 + 1} ("${lines[idx2]}") FIXES ALL PARSE ERRORS!`);
      fixFound = true;
      break;
    }
  }
  if (fixFound) break;
}

if (!fixFound) {
  console.log('Testing 3-line removal combinations...');
  // Try 3-line removal combinations if needed
}
