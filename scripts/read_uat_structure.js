const XLSX = require('xlsx');
const path = require('path');

// Read reference file to get exact structure
console.log('Reading reference file...');
const refWb = XLSX.readFile('docs/UAT_Puti_ULTRA_COMPREHENSIVE.xlsx');
const refWs = refWb.Sheets[refWb.SheetNames[0]];
const refData = XLSX.utils.sheet_to_json(refWs, { header: 1, defval: '', raw: false });

console.log('Reference file has', refData.length, 'rows');
console.log('First 20 rows structure:');
refData.slice(0, 20).forEach((row, i) => {
    if (row.some(cell => cell)) {
        console.log(`Row ${i + 1}:`, row.filter(cell => cell).join(' | '));
    }
});
