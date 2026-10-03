const fs = require('fs');

const filePath = 'src/components/admin/UnifiedBankPolicyManager.jsx';
const code = fs.readFileSync(filePath, 'utf8');
const lines = code.split('\n');

// 1. In line 3464 (index 3463), replace `)}` with `</div></div>\n)}`
// 2. Remove line 3804 (index 3803)

const updatedLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i === 3803) {
    // Skip line 3804 extra `)}`
    continue;
  }
  if (i === 3463) {
    // Add missing closing divs before `)}` on line 3464
    updatedLines.push('                  </div>');
    updatedLines.push('                </div>');
    updatedLines.push('              )}');
    continue;
  }
  updatedLines.push(lines[i]);
}

fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');
console.log('Successfully updated UnifiedBankPolicyManager.jsx!');
