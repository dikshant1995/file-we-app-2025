const fs = require('fs');
const code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');
const lines = code.split('\n');

// Track stack of open JSX elements and open { braces inside JSX
let stack = [];

// Simple tokenizer scanner or brace/bracket counter for JSX
// Let's use Babel to traverse and find unclosed structures or scan line by line

let curlyDepth = 0;
let lineDepths = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let opens = 0;
  let closes = 0;
  // Ignore comments or strings roughly, or just count { vs }
  for (let c of line) {
    if (c === '{') opens++;
    if (c === '}') closes++;
  }
  curlyDepth += (opens - closes);
  lineDepths.push({ lineNum: i + 1, depth: curlyDepth, line: line.trim() });
}

console.log('Final curly depth:', curlyDepth);
// If curly depth is not 0 at the end of component body (around 8331), let's find where depth went up and didn't come down.

// Let's also check active tab conditional sections!
// Search for activeTab === ... or tab checks
const tabs = [];
lines.forEach((l, idx) => {
  if (l.includes("activeTab ===") || l.includes("activeTab.toLowerCase()")) {
    tabs.push({ line: idx + 1, text: l.trim(), depth: lineDepths[idx].depth });
  }
});

console.log('\n--- Tab checks and depths ---');
tabs.forEach(t => console.log(`Line ${t.line} [Depth ${t.depth}]: ${t.text.substring(0, 80)}`));
