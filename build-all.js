import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;

function run(command, cwd) {
    console.log(`🚀 Running command: ${command} in ${cwd}`);
    execSync(command, { cwd, stdio: 'inherit' });
}

async function buildAll() {
    try {
        console.log('🏗️ Starting Personal Loan Platform Build Process...');

        // 1. Build Personal Loan App
        console.log('\n📦 Building Personal Loan App...');
        run('npm run build', rootDir);

        console.log('\n✅ PERSONAL LOAN BUILD COMPLETED SUCCESSFULLY!');
        console.log('📂 Final Output Directory: /dist');

    } catch (err) {
        console.error('❌ CRITICAL BUILD FAILURE:', err);
        process.exit(1);
    }
}

buildAll();

