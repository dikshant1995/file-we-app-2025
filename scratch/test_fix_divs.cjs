const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

// 1. In line 3464 (index 3463), replace `)}` with `</div></div>\n)}`
// 2. Remove line 3804 (index 3803)

const testLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i === 3803) {
    // Skip line 3804 extra `)}`
    continue;
  }
  if (i === 3463) {
    // Add missing closing divs before `)}` on line 3464
    testLines.push('</div></div>');
    testLines.push(')}');
    continue;
  }
  testLines.push(lines[i]);
}

const testCode = testLines.join('\n');

try {
  parser.parse(testCode, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  console.log('\n🎉🎉🎉 EUREKA! BABEL PARSED THE FILE PERFECTLY WITH ZERO ERRORS!');
  
  require('esbuild').transformSync(testCode, { loader: 'jsx' });
  console.log('🎉🎉🎉 ESBUILD BUILD VERIFIED 100% CLEAN!');
} catch (err) {
  console.error('\nParse error:');
  console.error(err.message);
  console.error(`At line ${err.loc?.line}, column ${err.loc?.column}`);
}
