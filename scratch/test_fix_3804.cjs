const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

console.log('Original Line 3804:', lines[3803]); // 0-indexed: 3803 is line 3804

// Let's remove line 3804
const fixedLines = lines.filter((_, idx) => idx !== 3803);
const fixedCode = fixedLines.join('\n');

try {
  parser.parse(fixedCode, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  console.log('\n🎉 SUCCESS! Removing line 3804 allows Babel to parse the file with ZERO errors!');
} catch (err) {
  console.error('\nParse error after removing line 3804:');
  console.error(err.message);
  console.error(`At line ${err.loc?.line}, column ${err.loc?.column}`);
}
