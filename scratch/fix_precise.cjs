const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

// 0-indexed: line 3804 is 3803, line 3928 is 3927
const testIndices = [3803, 3927];

console.log('Line 3804 content:', lines[3803]);
console.log('Line 3928 content:', lines[3927]);

const testLines = lines.filter((_, idx) => !testIndices.includes(idx));
const testCode = testLines.join('\n');

try {
  parser.parse(testCode, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  console.log('\n🎉 SUCCESS! Removing line 3804 AND line 3928 FIXED ALL PARSE ERRORS PERFECTLY!');
  
  // Also verify with esbuild
  require('esbuild').transformSync(testCode, { loader: 'jsx' });
  console.log('🎉 ESBUILD TRANSFORM ALSO PASSED 100%!');
} catch (err) {
  console.error('\nParse error:');
  console.error(err.message);
  console.error(`At line ${err.loc?.line}, column ${err.loc?.column}`);
}
