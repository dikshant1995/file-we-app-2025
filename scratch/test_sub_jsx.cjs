const fs = require('fs');
const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');

// Let's use simple stack-based JSX tokenizer or Babel scanner
// Let's find all top-level sections in the return statement of UnifiedBankPolicyManager

const lines = code.split('\n');

// Find where the main return statement starts: `return (`
let returnLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return (') || lines[i].includes('return(')) {
    returnLine = i;
  }
}

console.log('Main return starts around line:', returnLine + 1);

// Let's analyze the lines from returnLine to end
let stack = [];
for (let i = returnLine; i < lines.length; i++) {
  const line = lines[i];
  for (let col = 0; col < line.length; col++) {
    const char = line[col];
    if (char === '{') {
      stack.push({ char: '{', line: i + 1, col: col + 1, snippet: line.trim().substring(0, 40) });
    } else if (char === '}') {
      if (stack.length === 0) {
        console.log(`EXTRA CLOSING BRACE '}' at Line ${i + 1}:${col + 1} -> ${line.trim()}`);
      } else {
        const popped = stack.pop();
        if (popped.char !== '{') {
          console.log(`MISMATCH at Line ${i + 1}:${col + 1}! Popped ${popped.char} from line ${popped.line}`);
        }
      }
    }
  }
}

console.log(`Remaining unclosed '{' braces at end: ${stack.length}`);
if (stack.length > 0) {
  console.log('Top unclosed braces:');
  stack.slice(-10).forEach(b => {
    console.log(`  Line ${b.line}:${b.col} -> ${b.snippet}`);
  });
}
