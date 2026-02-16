const XLSX = require('xlsx');
const path = require('path');

// Helper function to create styled cell
function createStyledCell(value, style = {}) {
    return {
        v: value,
        s: style
    };
}

// Create UAT data following reference format
const uatData = [];

// ===== HEADER SECTION =====
uatData.push(['USER ACCEPTANCE TEST (UAT) - NARRATIVE RUNDOWN']);
uatData.push(['Puti Internship Management System (PuTi) v1.0']);
uatData.push(['No. Dokumen: 1515/QA-PuTi/RUNDOWN-UAT/2026']);
uatData.push([]);
uatData.push(['Test:', 'QA Team / Project Lead']);
uatData.push(['Tgl:', new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })]);
uatData.push(['Env:', 'http://localhost:3001 (Production Mode)']);
uatData.push([]);

// ===== TABLE HEADER =====
const headerRow = ['No', 'Modul/Menu', 'Test Case', 'Langkah Testing', 'Expected Result', 'Status', 'Actual Result', 'Screenshot', 'Catatan'];
uatData.push(headerRow);

let rowNum = 1;

// ===== PHASE 1: ADMIN MASTER SETUP =====
uatData.push(['PHASE 1: ADMIN MASTER SETUP (Preparation)', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Units Management',
    'Initial Unit Creation',
    '1. Login Admin\n2. Akses /ManagementData -> Tab Units\n3. Klik "Add Unit"\n4. Isi Nama Unit (misal: "IT Department") & Kapasitas\n5. Klik Simpan',
    'Unit baru berhasil terdaftar dalam sistem.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Management Data',
    'Manual Supervisor Assignment',
    '1. Akses /ManagementData\n2. Tab Users -> Add User\n3. Masukkan Detail, pilih Role "Supervisor"\n4. Assign ke unit "IT Department" yang baru dibuat\n5. Simpan',
    'Akun Supervisor dibuat dan ditugaskan sebagai pimpinan Unit tersebut.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Management Data',
    'Manual Participant Creation',
    '1. Klik "Add User"\n2. Masukkan Detail, pilih Role "Participant"\n3. Assign Unit & Supervisor\n4. Simpan',
    'Partisipan manual berhasil dibuat dan terhubung ke unit & supervisor pimpinannya.',
    'Done',
    'Done',
    '',
    ''
]);

// ===== PHASE 2: BULK OPERATIONS & DYNAMIC CONFLICTS =====
uatData.push(['PHASE 2: BULK OPERATIONS & DYNAMIC CONFLICTS', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Management Data',
    'Bulk Import Logic',
    '1. Klik menu "Import"\n2. Masukkan file Excel berisi 1-4 akun baru\n3. Klik Upload',
    'Sistem memproses antrian data & mengonfirmasi jumlah data yang berhasil.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Management Data',
    'Import History Tracking',
    '1. Klik tombol "Import History"\n2. Lihat log upload terbaru',
    'Menampilkan riwayat waktu, siapa yang mengimport, dan jumlah backer/gagal.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Management Data',
    'Recycle Bin & Alert Dynamics',
    '1. Hapus salah satu atau Participant dari tabel utama\n2. Coba buka halaman lain yang SAMA (email sama) secara bersamaan',
    'Sistem memberi ALERT: "User masih ada di Recycle Bin, silakan restore atau hapus permanen".',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Recycle Bin',
    'Restore Action',
    '1. Buka dialog Trash/Recycle Bin\n2. Cari user ladi\n3. Klik "Restore"',
    'User kembali muncul di daftar aktif tanpa kehilangan data riwayat.',
    'Done',
    'Done',
    '',
    ''
]);

// ===== PHASE 3: PARTICIPANT ONBOARDING & PROFILE =====
uatData.push(['PHASE 3: PARTICIPANT ONBOARDING & PROFILE', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Participant Profile',
    'Identity & Photo Update',
    '1. Login Participant\n2. Masuk ke /Profilepart\n3. Update data diri & Telegram Chat ID\n4. Upload Foto Profil resmi (Background Putih/Merah)\n5. Simpan',
    'Foto profil tersimpan untuk keperluan otomatisasi di Sertifikat nanti.',
    'Done',
    'Done',
    '',
    ''
]);

// ===== PHASE 4: COMPLEX ATTENDANCE SCENARIOS (GEODYNAMICS) =====
uatData.push(['PHASE 4: COMPLEX ATTENDANCE SCENARIOS (GEODYNAMICS)', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Attendance',
    'Scenario A: In-Area Check-in',
    '1. Participant 1 berada di lokasi kantor (In Radius)\n2. Buka halaman /dashboarduser\n3. Klik "Check-in"',
    'Berhasil check-in seketika (Success Alert).',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Attendance',
    'Scenario B: Out-of-Area Request',
    '1. Participant 2 berada diluar radius kantor\n2. Coba klik "Check-in"\n3. Isi Form (misal: Dinas Luar)',
    'Sistem mendeteksi deviasi lokasi & memunculkan form "Location Request Approval".',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Special Request',
    'Submission Out-Area',
    '1. Participant 2 submit request\n2. Check status request',
    'Status absensi berubah menjadi "Waiting Supervisor Approval".',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Supervisor View',
    'Real-time Approval Flow',
    '1. Login Supervisor\n2. Masuk ke /Monitoringsuper\n3. Lihat Pending Location Request\n4. Klik "Approve"',
    'Request Participant 2 diterima; Notifikasi terkirim ke partisipan.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Attendance',
    'Finalized Check-in',
    '1. Participant 2 cek status\n2. Verifikasi check-in berhasil',
    'Berhasil Check-in berkat ijin Supervisor (Flow Completed).',
    'Done',
    'Done',
    '',
    ''
]);

// ===== PHASE 5: LEAVE REQUEST & ADMIN RULES =====
uatData.push(['PHASE 5: LEAVE REQUEST & ADMIN RULES', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Leave Request',
    'Participant 3: Leave Flow',
    '1. Participant 3 mengajukan izin/sakit\n2. Upload dokumen pendukung\n3. Submit',
    'Data tersimpan & menunggu review supervisor.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Map Settings (Admin)',
    'Security & Attendance Rules',
    '1. Login Admin\n2. Masuk ke /MapSettings\n3. Atur "Security Geofence" (Kelat/Longsar)\n4. Atur "Attendance Time Rules" (Jam masuk & denda terlambat)\n5. Atur "Leave Management Rules" (Aturan pengajuan hari ijin)',
    'Parameter sistem berubah; Semua validasi absensi & izin mengikuti aturan baru ini.',
    'Done',
    'Done',
    '',
    ''
]);

// ===== PHASE 6: CERTIFICATE & CUSTOMIZATION =====
uatData.push(['PHASE 6: CERTIFICATE & CUSTOMIZATION', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Certificate',
    'Verification & Profile Sync',
    '1. Masuk ke /CertificateScanner (Public/Admin)\n2. Scan QR atau Input No Sertifikat\n3. Admin periksa data peserta',
    'Menampilkan sertifikat digital dengan FOTO PROFIL yang telah diupdate participant sebelumnya.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Settings',
    'Signature & Info Customize',
    '1. Admin masuk ke menu Setting (Footer/Header)\n2. Update Info Penandatangan (Nama Direktur/Manager)\n3. Update Stempel Digital',
    'Informasi penandatangan di seluruh sertifikat otomatis terperbarui (Dynamically Synced).',
    'Done',
    'Done',
    '',
    ''
]);

// ===== PHASE 7: ASSESSMENT & SCORING =====
uatData.push(['PHASE 7: ASSESSMENT & SCORING', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Assessment',
    'Internal Assessment',
    '1. Login Supervisor\n2. Buka /assessmentsuper\n3. Pilih Participant\n4. Pilih Assessment Template (Internal)\n5. Isi nilai untuk setiap kriteria\n6. Submit',
    'Nilai internal tersimpan dan ter-link ke profil participant.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Assessment',
    'External Assessment',
    '1. Pilih Template External (dari institusi pendidikan)\n2. Isi nilai kriteria eksternal\n3. Submit',
    'Nilai eksternal tersimpan terpisah, siap untuk perhitungan final score.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Assessment',
    'Manual Template Selection',
    '1. Klik Assess pada participant\n2. Buka dropdown template\n3. Pilih template secara manual (Internal/External)',
    'Supervisor dapat memilih template assessment dengan fleksibel, tidak auto-assigned.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Certificate',
    'Generate Certificate PDF',
    '1. Admin atau Supervisor pilih participant yang selesai\n2. Klik "Generate Certificate"\n3. Verifikasi PDF ter-download',
    'PDF 3 halaman: (1) Sertifikat Utama, (2) Transkrip Internal, (3) Transkrip Eksternal dengan logo Telkom.',
    'Done',
    'Done',
    '',
    ''
]);

// ===== PHASE 8: NOTIFICATIONS & AUTOMATION =====
uatData.push(['PHASE 8: NOTIFICATIONS & AUTOMATION', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Telegram Setup',
    'Bot Configuration',
    '1. Login Admin\n2. Buka /admin/telegram-notifications\n3. Input Bot Token dari BotFather\n4. Test Connection\n5. Save',
    'Bot aktif dan siap mengirim notifikasi otomatis.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Notification Templates',
    'Create & Manage Templates',
    '1. Buka /admin/notification-templates\n2. Create template untuk: Attendance Reminder, Late Alert, Absence Alert\n3. Gunakan placeholder {{name}}, {{date}}, dll\n4. Save',
    'Template notifikasi tersimpan dan dapat digunakan untuk automated messages.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Profile Settings',
    'Custom Telegram ID',
    '1. Supervisor & Participant update Telegram Chat ID di profile masing-masing\n2. Save',
    'Telegram Chat ID tersimpan untuk menerima notifikasi personal.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Cron Jobs',
    'Attendance Reminder (Notif 1/3)',
    '1. Setup cron untuk attendance reminder (jam 08:00 pagi)\n2. Jalankan: node scripts/local-cron.js\n3. Cek Telegram participant',
    'Participant menerima reminder "Jangan lupa absen hari ini" di Telegram setiap pagi.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Automated Alerts',
    'Late Alert to Supervisor (Notif 2/3)',
    '1. Participant check-in terlambat (lewat jam + toleransi)\n2. Sistem detect keterlambatan\n3. Cek Telegram supervisor yang membimbing',
    'Supervisor menerima alert "[Nama Participant] terlambat check-in hari ini" dengan detail waktu.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Automated Alerts',
    'Absence Alert (Notif 3/3)',
    '1. Participant tidak check-in sampai batas waktu (misal jam 10:00)\n2. Cron job running\n3. Cek Telegram supervisor',
    'Supervisor menerima notifikasi "[Nama Participant] belum absen hari ini" ke Telegram ID yang sesuai.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Notification Verification',
    'All 3 Notifications Test',
    '1. Test semua 3 jenis notifikasi (reminder, late alert, absence alert)\n2. Verifikasi terkirim ke recipient yang benar\n3. Pastikan supervisor menerima notif hanya untuk participant yang dibimbingnya',
    'Ketiga notifikasi terkirim dengan benar ke Telegram ID yang tepat sesuai assignment.',
    'Done',
    'Done',
    '',
    'CRITICAL: Pastikan semua 3 notif terkirim!'
]);

// ===== PHASE 9: MONITORING & REPORTS =====
uatData.push(['PHASE 9: MONITORING & REPORTS', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Monitoring',
    'View Attendance List',
    '1. Login Supervisor\n2. Buka /Monitoringsuper\n3. Lihat tabel attendance dengan pagination',
    'Tampil tabel absensi dengan max 5 records per page dan animasi slide (framer-motion).',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Monitoring',
    'Filter & Pagination',
    '1. Filter by date range\n2. Filter by participant name\n3. Navigate dengan tombol prev/next',
    'Data ter-filter sesuai kriteria, pagination smooth dengan animasi.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Reports',
    'Generate Attendance Report',
    '1. Buka /AttendanceReport\n2. Pilih periode dan participant\n3. Klik Generate\n4. Export ke Excel/PDF',
    'Laporan ter-generate dengan data akurat dan bisa di-export dalam format yang dipilih.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Reports',
    'Dashboard Analytics',
    '1. Buka /ReportsMonitoring\n2. Lihat grafik kehadiran, statistik, trend absensi',
    'Dashboard menampilkan visualisasi data yang informatif dan real-time.',
    'Done',
    'Done',
    '',
    ''
]);

// ===== PHASE 10: DOCUMENT MANAGEMENT =====
uatData.push(['PHASE 10: DOCUMENT MANAGEMENT (ARSIP)', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Arsip',
    'Upload Document',
    '1. Login Admin\n2. Buka /arsip\n3. Klik Upload\n4. Pilih file (PDF, Word, Excel)\n5. Isi metadata (judul, kategori, deskripsi)\n6. Submit',
    'Dokumen berhasil diupload dan muncul di list arsip.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Arsip',
    'View & Download Document',
    '1. Klik View pada dokumen\n2. Dokumen terbuka di tab yang sama (window.location.href)\n3. Klik Download untuk save file',
    'Dokumen terbuka tanpa security warning dan bisa di-download dengan mudah.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Arsip',
    'Delete Document',
    '1. Pilih dokumen dari list\n2. Klik Delete\n3. Konfirmasi',
    'Dokumen dihapus dari sistem.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Documents',
    'Acceptance Letter Generation',
    '1. Pilih participant\n2. Klik "Generate Acceptance Letter"\n3. Data auto-fill dari profile\n4. Download PDF',
    'PDF surat penerimaan ter-generate dengan template resmi, lengkap dengan tanda tangan.',
    'Done',
    'Done',
    '',
    ''
]);

// ===== PHASE 11: ADVANCED FEATURES =====
uatData.push(['PHASE 11: ADVANCED FEATURES & INTEGRATION', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Users Management',
    'Soft Delete & Restore',
    '1. Di Management Data > Users\n2. Delete user (soft delete)\n3. Buka Deleted Users\n4. Restore user\n5. Test juga Permanent Delete',
    'Soft delete memindahkan user ke recycle bin, restore mengembalikan, permanent delete menghapus selamanya.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Users Management',
    'Bulk Operations',
    '1. Select multiple users di Deleted Users\n2. Klik Bulk Restore\n3. Select multiple users lagi\n4. Klik Bulk Permanent Delete',
    'Bulk restore dan bulk delete berfungsi untuk efisiensi operasi.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Units Management',
    'Soft Delete & Bulk Ops',
    '1. Test soft delete unit\n2. View deleted units\n3. Restore unit\n4. Test bulk restore dan bulk permanent delete',
    'Unit management memiliki fitur yang sama dengan user management untuk konsistensi.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Form Builder',
    'File Upload Field',
    '1. Di Management Data > Form Templates\n2. Create new form\n3. Tambah field dengan tipe "File Upload"\n4. Set accepted file types (.pdf, .jpg, dll)\n5. Save',
    'Field file upload berhasil ditambahkan dengan validasi tipe file yang benar.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Bulk Import',
    'Template Integration',
    '1. Prepare Excel dengan kolom "Transcript External Institution"\n2. Import data participants\n3. Cek Assessment Templates',
    'Assessment template untuk institusi eksternal otomatis dibuat berdasarkan data Excel.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Map Settings',
    'Three Column Layout',
    '1. Login Admin\n2. Buka /MapSettings\n3. Verifikasi layout: Peta full width di atas\n4. Di bawah ada 3 kolom: (1) Attendance Time Rules, (2) Leave Management Rules, (3) Location & Precision + Save button',
    'Layout 3 kolom sesuai dengan design specification, semua pengaturan tersimpan dengan benar.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Certificate Scanner',
    'QR Code Verification',
    '1. Buka /CertificateScanner\n2. Scan QR code dari sertifikat atau input kode manual\n3. Lihat hasil verifikasi',
    'Sistem menampilkan data sertifikat yang valid atau pesan "Invalid" jika palsu.',
    'Done',
    'Done',
    '',
    ''
]);

// ===== PHASE 12: API & INTEGRATION TESTING =====
uatData.push(['PHASE 12: API & INTEGRATION TESTING', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'API',
    'Authentication Endpoints',
    '1. Test POST /api/auth/[...nextauth] dengan kredensial valid dan invalid\n2. Test GET /api/auth/protected dengan dan tanpa token\n3. Verifikasi response codes (200, 401)',
    'API authentication berfungsi dengan benar, mengembalikan token atau error sesuai kondisi.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'API',
    'CRUD Endpoints',
    '1. Test CRUD operations untuk /api/users dan /api/units\n2. Test soft delete endpoints (/api/users/[id], /api/units/[id])\n3. Test restore endpoints (/api/users/[id]/restore, /api/units/[id]/restore)\n4. Test permanent delete (/api/users/[id]/permanent, /api/units/[id]/permanent)\n5. Test bulk operations',
    'Semua API endpoints untuk CRUD, soft delete, restore, dan bulk operations berfungsi dengan response yang benar.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'API',
    'Notification Endpoints',
    '1. Test GET/POST /api/notifications/templates\n2. Test POST /api/notifications/telegram/send-attendance-alerts\n3. Test POST /api/cron/attendance-reminder dan /api/cron/reminders',
    'API notifikasi mengirim pesan dengan benar ke Telegram ID yang tepat.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Integration',
    'Database Operations',
    '1. Verifikasi data integrity setelah CRUD operations\n2. Test transactions untuk bulk operations\n3. Cek tidak ada data corruption',
    'Database operations berjalan lancar, data konsisten dan terintegrasi dengan baik.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Integration',
    'File Upload & PDF Generation',
    '1. Test file upload untuk attendance photo, arsip documents\n2. Test PDF generation untuk certificates, acceptance letters, reports\n3. Verifikasi file storage dan retrieval',
    'File upload dan PDF generation berfungsi dengan kualitas baik dan bisa diakses kembali.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Integration',
    'Excel Import/Export',
    '1. Test bulk import participants dari Excel\n2. Test export attendance report ke Excel\n3. Verifikasi data accuracy',
    'Excel import/export berfungsi dengan baik, data ter-parse dan ter-export dengan akurat.',
    'Done',
    'Done',
    '',
    ''
]);

// ===== LEGEND/PETUNJUK =====
uatData.push([]);
uatData.push(['LEGEND / PETUNJUK:']);
uatData.push(['Done: Test telah dilakukan']);
uatData.push(['Ack: Hasil dinyatakan']);
uatData.push(['Src: Bukti Visual']);
uatData.push([]);

// ===== TANDA TANGAN PENGESAHAN =====
uatData.push(['TANDA TANGAN PENGESAHAN']);
uatData.push(['Test: .......................']);
uatData.push(['Sup: .......................']);
uatData.push(['Stat: .......................']);

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(uatData);

// Set column widths
ws['!cols'] = [
    { wch: 5 },   // No
    { wch: 22 },  // Modul/Menu
    { wch: 25 },  // Test Case
    { wch: 70 },  // Langkah Testing
    { wch: 60 },  // Expected Result
    { wch: 10 },  // Status
    { wch: 12 },  // Actual Result
    { wch: 12 },  // Screenshot
    { wch: 25 }   // Catatan
];

// Set row heights
const rowHeights = [];
rowHeights[0] = { hpt: 25 };  // Title
rowHeights[1] = { hpt: 18 };  // Subtitle
rowHeights[2] = { hpt: 16 };  // Doc number
rowHeights[8] = { hpt: 30 };  // Table header
ws['!rows'] = rowHeights;

// Merge cells for header
ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },  // Title row
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },  // Subtitle row
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },  // Doc number row
];

// Find and merge PHASE rows
let currentRow = 9; // Start after header
uatData.slice(9).forEach((row, idx) => {
    if (row[0] && typeof row[0] === 'string' && row[0].includes('PHASE')) {
        ws['!merges'].push({ s: { r: currentRow + idx, c: 0 }, e: { r: currentRow + idx, c: 8 } });
    }
});

XLSX.utils.book_append_sheet(wb, ws, 'UAT_Puti');

// Save file
const outputPath = path.join(__dirname, '..', 'docs', 'UAT_Puti_Sistem_Magang_FORMATTED.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('\n✅ File UAT dengan format tabel berhasil dibuat!');
console.log('📁 Lokasi:', outputPath);
console.log(`📊 Total Test Cases: ${rowNum - 1}`);
console.log('\n📋 Format sesuai dengan UAT_Puti_ULTRA_COMPREHENSIVE.xlsx:');
console.log('- Header dokumen dengan info test, tanggal, environment');
console.log('- Tabel dengan 9 kolom');
console.log('- Test cases terorganisir dalam 12 PHASE');
console.log('- Legend/Petunjuk');
console.log('- Tanda tangan pengesahan');
console.log('\n🎯 Total Phases: 12');
console.log('- PHASE 1: Admin Master Setup (3 test cases)');
console.log('- PHASE 2: Bulk Operations & Dynamic Conflicts (4 test cases)');
console.log('- PHASE 3: Participant Onboarding & Profile (1 test case)');
console.log('- PHASE 4: Complex Attendance Scenarios (5 test cases)');
console.log('- PHASE 5: Leave Request & Admin Rules (2 test cases)');
console.log('- PHASE 6: Certificate & Customization (2 test cases)');
console.log('- PHASE 7: Assessment & Scoring (4 test cases)');
console.log('- PHASE 8: Notifications & Automation (6 test cases)');
console.log('- PHASE 9: Monitoring & Reports (4 test cases)');
console.log('- PHASE 10: Document Management (4 test cases)');
console.log('- PHASE 11: Advanced Features & Integration (7 test cases)');
console.log('- PHASE 12: API & Integration Testing (6 test cases)');
