const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log('Babel successfully parsed the file!');
} catch (err) {
  console.error('Babel Parse Error:');
  console.error(err.message);
  console.error(`At line ${err.loc?.line}, column ${err.loc?.column}`);
  
  if (err.loc?.line) {
    const lines = code.split('\n');
    const startLine = Math.max(0, err.loc.line - 10);
    const endLine = Math.min(lines.length, err.loc.line + 10);
    console.error('\n--- Context ---');
    for (let i = startLine; i < endLine; i++) {
      const prefix = i + 1 === err.loc.line ? '>>> ' : '    ';
      console.error(`${prefix}${i + 1}: ${lines[i]}`);
    }
  }
}
