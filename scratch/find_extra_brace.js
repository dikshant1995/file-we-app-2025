import fs from 'fs';
import * as esbuild from 'esbuild';

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('}')) {
    const testLines = [...lines];
    // Remove one '}' from this line
    testLines[i] = testLines[i].replace('}', '');
    try {
      esbuild.transformSync(testLines.join('\n'), { loader: 'jsx', jsx: 'transform' });
      console.log(`\n======================================================`);
      console.log(`🎉🎉🎉 FOUND EXTRA BRACE AT LINE ${i + 1}! 🎉🎉🎉`);
      console.log(`Line ${i + 1}: ${lines[i]}`);
      console.log(`======================================================\n`);
      
      // Save fixed code!
      fs.writeFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', testLines.join('\n'), 'utf8');
      break;
    } catch (e) {
      //
    }
  }
}
