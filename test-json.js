// Manual QR Code Test
const testData = {
    cert_no: "No: 724627456/INTERN-PUTI/Tel-U/2026",
    name: "Test User",
    unit: "IT Services",
    department: "Universitas Telkom",
    period: "1 Januari 2026 - 31 Januari 2026",
    score: 95,
    grade: "A",
    evaluator: "Dr. Test Supervisor",
    issue_date: "14 Januari 2026",
    issued_at: new Date().toISOString()
};

const jsonString = JSON.stringify(testData);

console.log('Test Certificate Data:');
console.log('JSON String:', jsonString);
console.log('Length:', jsonString.length);
console.log('\nParsing test:');

try {
    const parsed = JSON.parse(jsonString);
    console.log('✅ Parsing successful!');
    console.log('Parsed data:', parsed);
    console.log('Has cert_no?', !!parsed.cert_no);
    console.log('Has name?', !!parsed.name);
    console.log('Has unit?', !!parsed.unit);
} catch (err) {
    console.error('❌ Parsing failed:', err);
}
