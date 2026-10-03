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

// Binary search to find minimal range of lines whose removal fixes the error
function findBrokenRange(start, end) {
  if (start >= end) return;
  
  // Test if removing [start, end) fixes the build
  const copy = [...lines];
  for (let i = start; i < end; i++) copy[i] = ' ';
  if (checkParse(copy.join('\n'))) {
    console.log(`Range [${start + 1}, ${end}] removal fixes the build! (Size: ${end - start})`);
    if (end - start <= 10) {
      console.log('\n--- BROKEN LINES CANDIDATE ---');
      for (let i = start; i < end; i++) {
        console.log(`Line ${i + 1}: ${lines[i]}`);
      }
      return;
    }
    const mid = Math.floor((start + end) / 2);
    // Check left half
    const copyLeft = [...lines];
    for (let i = start; i < mid; i++) copyLeft[i] = ' ';
    if (checkParse(copyLeft.join('\n'))) {
      findBrokenRange(start, mid);
    } else {
      findBrokenRange(mid, end);
    }
  }
}

// Split entire file into 50-line chunks and test each
console.log('Testing 50-line chunks...');
for (let i = 0; i < lines.length; i += 50) {
  const end = Math.min(i + 50, lines.length);
  const copy = [...lines];
  for (let j = i; j < end; j++) copy[j] = ' ';
  if (checkParse(copy.join('\n'))) {
    console.log(`Bingo! Deleting lines ${i + 1} to ${end} fixes the parse error.`);
    findBrokenRange(i, end);
    break;
  }
}
