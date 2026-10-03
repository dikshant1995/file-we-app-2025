import fs from 'fs';
import path from 'path';

const rawData = fs.readFileSync(path.resolve('./public/data/kotak_companies.json'), 'utf-8');
const kotakDb = JSON.parse(rawData);

console.log('✅ Kotak Database Loaded into Memory:');
printInfo('Total Companies:', kotakDb.length.toLocaleString('en-IN'));

function printInfo(label, val) {
  console.log(`  - ${label}: ${val}`);
}

function findCompany(query) {
  const norm = query.trim().toUpperCase();
  const match = kotakDb.find(c => c.companyName.trim().toUpperCase() === norm);
  return match;
}

const testCompanies = [
  '24/7 CUSTOMER PRIVATE LIMITED',
  '3F INDUSTRIES LIMITED',
  '3M ELECTRO AND COMMUNICATION INDIA PRIVATE LIMITED',
  'A K CAPITAL SERVICES LIMITED',
  'TATA CONSULTANCY SERVICES LIMITED',
  'INFOSYS LIMITED',
  'WIPRO LIMITED'
];

console.log('\n--- SAMPLE CATEGORY LOOKUPS ---');
testCompanies.forEach(comp => {
  const match = findCompany(comp);
  if (match) {
    console.log(`✅ FOUND: '${comp}' -> Category: ${match.category} | Industry: ${match.industry || 'N/A'}`);
  } else {
    console.log(`❌ NOT FOUND: '${comp}'`);
  }
});
