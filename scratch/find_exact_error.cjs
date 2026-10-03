const fs = require('fs');
const fileContent = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = fileContent.split('\n');

let start = 0;
let end = lines.length;

function testRange(blankStart, blankEnd) {
  const testLines = [...lines];
  for (let i = blankStart; i < blankEnd; i++) {
    testLines[i] = '';
  }
  const code = testLines.join('\n');
  try {
    require('esbuild').transformSync(code, { loader: 'jsx' });
    return true; // transform succeeded when this range was blanked!
  } catch (e) {
    return false;
  }
}

console.log('Testing full file standard...');
try {
  require('esbuild').transformSync(fileContent, { loader: 'jsx' });
  console.log('File is valid!');
} catch (e) {
  console.log('File is invalid, finding broken range...');
}

// Binary search over line ranges (chunk size 100 lines)
const chunkSize = 100;
for (let i = 0; i < lines.length; i += chunkSize) {
  const chunkEnd = Math.min(i + chunkSize, lines.length);
  if (testRange(i, chunkEnd)) {
    console.log(`Removing lines ${i+1} to ${chunkEnd} fixes the error! Error is in this block.`);
  }
}
