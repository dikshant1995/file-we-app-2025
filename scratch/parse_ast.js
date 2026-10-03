import fs from 'fs';
import * as esbuild from 'esbuild';

const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

// Find smallest range of lines (start, end) whose deletion or modification makes esbuild succeed or changes the error line!
console.log('Original error:');
try {
  esbuild.transformSync(code, { loader: 'jsx', jsx: 'transform' });
} catch (e) {
  console.log(e.message);
}

// Narrow down by checking binary search on line deletion while replacing deleted block with empty <div></div> if JSX
for (let step = 1000; step >= 10; step = Math.floor(step / 2)) {
  for (let i = 0; i < lines.length; i += step) {
    const testLines = [...lines];
    testLines.splice(i, step, '{/* removed */}');
    try {
      esbuild.transformSync(testLines.join('\n'), { loader: 'jsx', jsx: 'transform' });
      console.log(`FOUND SOLUTION! Removing lines ${i + 1} to ${i + step} fixed the error completely!`);
    } catch (e) {
      if (!e.message.includes('3907')) {
        console.log(`Removing lines ${i + 1} to ${i + step} shifted error from 3907 to: ${e.message.split('\n')[0]}`);
      }
    }
  }
}
