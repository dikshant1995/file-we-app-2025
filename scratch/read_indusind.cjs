const XLSX = require('xlsx');
const wb = XLSX.readFile('D:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/BANKS POLICYS.xlsx');
console.log('Sheets in workbook:', wb.SheetNames);
const indusindSheetName = wb.SheetNames.find(n => /indus/i.test(n));
console.log('Found IndusInd Sheet:', indusindSheetName);
if (indusindSheetName) {
  const ws = wb.Sheets[indusindSheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  console.log('Total rows:', data.length);
  data.forEach((row, i) => {
    if (row.some(cell => cell !== '')) {
      console.log(`Row ${i + 1}:`, JSON.stringify(row));
    }
  });
}
