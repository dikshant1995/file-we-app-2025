const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

// Line 3404 is index 3403
// Line 3464 is index 3463
// Line 3804 is index 3803

const removeIndices = [3403, 3463, 3803];

console.log('Testing removal of candidate stray lines:');
removeIndices.forEach(idx => console.log(`Line ${idx + 1}: "${lines[idx]}"`));

const testLines = lines.filter((_, idx) => !removeIndices.includes(idx));
const testCode = testLines.join('\n');

try {
  parser.parse(testCode, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  console.log('\n🎉🎉🎉 UNBELIEVABLE SUCCESS! Babel parsed the entire file with ZERO errors!');
  
  require('esbuild').transformSync(testCode, { loader: 'jsx' });
  console.log('🎉🎉🎉 ESBUILD BUILD VERIFIED 100% CLEAN!');
} catch (err) {
  console.error('\nParse error after removing candidate lines:');
  console.error(err.message);
  console.error(`At line ${err.loc?.line}, column ${err.loc?.column}`);
}
