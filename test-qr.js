// Test QR Code Generation
import QRCode from 'qrcode';

const testCertificateData = {
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

const qrData = JSON.stringify(testCertificateData);

QRCode.toDataURL(qrData, {
    margin: 2,
    width: 256,
    errorCorrectionLevel: 'H',
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    }
}).then(url => {
    console.log('QR Code Generated Successfully!');
    console.log('Data:', qrData);
    console.log('QR URL length:', url.length);
}).catch(err => {
    console.error('QR Generation Error:', err);
});
