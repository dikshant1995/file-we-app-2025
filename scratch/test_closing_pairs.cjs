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

// Find all lines in lines 3131-3930 that end with `)}` or `}`
const candidates = [];
for (let i = 3130; i < 3930; i++) {
  const t = lines[i].trim();
  if (t === ')}' || t === '}' || t === '</div>' || t === '</div>)') {
    candidates.push(i);
  }
}

console.log(`Found ${candidates.length} closing line candidates in Capping & Tenure tabs.`);

let fixFound = false;
for (let i = 0; i < candidates.length; i++) {
  for (let j = i; j < candidates.length; j++) {
    const idx1 = candidates[i];
    const idx2 = candidates[j];
    
    const testLines = lines.filter((_, idx) => idx !== idx1 && idx !== idx2);
    if (checkParse(testLines)) {
      console.log(`\n🎉 BINGO! Removing line ${idx1 + 1} ("${lines[idx1]}") AND line ${idx2 + 1} ("${lines[idx2]}") FIXES THE BUILD!`);
      fixFound = true;
      break;
    }
  }
  if (fixFound) break;
}

if (!fixFound) {
  console.log('Testing 3-line combinations from candidate closing lines...');
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      for (let k = j + 1; k < candidates.length; k++) {
        const idx1 = candidates[i];
        const idx2 = candidates[j];
        const idx3 = candidates[k];
        
        const testLines = lines.filter((_, idx) => idx !== idx1 && idx !== idx2 && idx !== idx3);
        if (checkParse(testLines)) {
          console.log(`\n🎉 BINGO! Removing lines ${idx1 + 1}, ${idx2 + 1}, ${idx3 + 1} FIXES THE BUILD!`);
          console.log(`  Line ${idx1 + 1}: "${lines[idx1]}"`);
          console.log(`  Line ${idx2 + 1}: "${lines[idx2]}"`);
          console.log(`  Line ${idx3 + 1}: "${lines[idx3]}"`);
          fixFound = true;
          break;
        }
      }
      if (fixFound) break;
    }
    if (fixFound) break;
  }
}
