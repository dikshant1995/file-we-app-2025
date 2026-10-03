import fs from 'fs';
import * as esbuild from 'esbuild';

let code = fs.readFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', 'utf8');

// Fix capping tab leftover
const capOld = `              {!(activeConfigBank?.id === 'finnable' || activeConfigBank?.name?.toLowerCase().includes('finnable') || activeConfigBank?.id === 'abfl' || activeConfigBank?.name?.toLowerCase().includes('birla') || activeConfigBank?.name?.toLowerCase().includes('abfl')) && (
                </div>
              ) : (
                <div className="table-responsive">`;

const capNew = `              {!(activeConfigBank?.id === 'finnable' || activeConfigBank?.name?.toLowerCase().includes('finnable') || activeConfigBank?.id === 'abfl' || activeConfigBank?.name?.toLowerCase().includes('birla') || activeConfigBank?.name?.toLowerCase().includes('abfl')) && (
                <div className="table-responsive">`;

code = code.replace(capOld, capNew);

// Fix tenure tab leftover
const tenOld = `              {!(activeConfigBank?.id === 'finnable' || activeConfigBank?.name?.toLowerCase().includes('finnable') || activeConfigBank?.id === 'abfl' || activeConfigBank?.name?.toLowerCase().includes('birla') || activeConfigBank?.name?.toLowerCase().includes('abfl')) && (
                    </div>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">`;

const tenNew = `              {!(activeConfigBank?.id === 'finnable' || activeConfigBank?.name?.toLowerCase().includes('finnable') || activeConfigBank?.id === 'abfl' || activeConfigBank?.name?.toLowerCase().includes('birla') || activeConfigBank?.name?.toLowerCase().includes('abfl')) && (
                <div className="table-responsive">`;

code = code.replace(tenOld, tenNew);

fs.writeFileSync('src/components/admin/UnifiedBankPolicyManager.jsx', code, 'utf8');

try {
  esbuild.transformSync(code, { loader: 'jsx', jsx: 'transform' });
  console.log('\n======================================================');
  console.log('🎉🎉🎉 SUCCESS! ESBUILD TRANSFORM PASSED WITH 0 ERRORS! 🎉🎉🎉');
  console.log('======================================================\n');
} catch (err) {
  console.error('\nESBUILD ERROR:', err.message);
}
