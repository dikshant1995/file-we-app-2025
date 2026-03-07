import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '..');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

walk(srcDir, (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // Fix imports starting with ./ or ../ that don't have an extension
        // Look for: from './path/to/module' or from '../path/to/module'
        const updatedContent = content.replace(/(import .* from\s+['"])(\.\.?\/[^'"]+)(['"])/g, (match, p1, p2, p3) => {
            // If it doesn't have an extension (no dot in the last segment)
            const lastSegment = p2.split('/').pop();
            if (!lastSegment.includes('.')) {
                changed = true;
                return `${p1}${p2}.js${p3}`;
            }
            return match;
        });

        if (changed) {
            console.log(`✅ Fixed imports in: ${filePath}`);
            fs.writeFileSync(filePath, updatedContent);
        }
    }
});
