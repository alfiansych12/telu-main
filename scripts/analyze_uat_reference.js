const XLSX = require('xlsx');

// Read the reference file
const wb = XLSX.readFile('docs/UAT_Puti_ULTRA_COMPREHENSIVE.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

console.log('Total rows:', data.length);
console.log('\nFirst 15 rows:');
data.slice(0, 15).forEach((row, i) => {
    console.log(`\nRow ${i + 1}:`);
    row.forEach((cell, j) => {
        if (cell) console.log(`  Col ${j + 1}: ${cell}`);
    });
});
