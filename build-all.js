import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const blFrontendDir = path.join(rootDir, 'update bl', 'frontend');

function run(command, cwd) {
    console.log(`🚀 Running command: ${command} in ${cwd}`);
    execSync(command, { cwd, stdio: 'inherit' });
}

async function buildAll() {
    try {
        console.log('🏗️ Starting Multi-Platform Unified Build Process...');

        // 1. Build Main (Personal Loan) App
        console.log('\n📦 PHASE 1: Building Personal Loan App...');
        run('npm run build', rootDir);

        // 2. Build Business Loan App
        console.log('\n📦 PHASE 2: Building Business Loan App...');
        // First, verify if node_modules exist or install them
        if (!fs.existsSync(path.join(blFrontendDir, 'node_modules'))) {
            console.log('💡 Installing BL Frontend dependencies...');
            run('npm install', blFrontendDir);
        }
        
        run('npm run build', blFrontendDir);

        // 3. Move output to subfolder
        console.log('\n📦 PHASE 3: Structuring Artifacts...');
        const mainDist = path.join(rootDir, 'dist');
        const blDist = path.join(blFrontendDir, 'dist');
        const targetBlDist = path.join(mainDist, 'business-loan');

        if (fs.existsSync(targetBlDist)) {
            console.log('🧹 Cleaning old Business Loan build from output...');
            fs.rmSync(targetBlDist, { recursive: true, force: true });
        }

        console.log(`🚚 Copying ${blDist} to ${targetBlDist}...`);
        fs.cpSync(blDist, targetBlDist, { recursive: true });

        console.log('\n✅ ALL BUILDS COMPLETED SUCCESSFULLY!');
        console.log('📂 Final Structure:');
        console.log('   /           -> Personal Loan');
        console.log('   /business-loan/ -> Business Loan');

    } catch (err) {
        console.error('❌ CRITICAL BUILD FAILURE:', err);
        process.exit(1);
    }
}

buildAll();
