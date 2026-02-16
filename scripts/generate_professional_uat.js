const XLSX = require('xlsx');
const path = require('path');

console.log('Generating professional styled UAT file...\n');

// Helper to create cell with styling
function createCell(value, style = {}) {
    return {
        v: value,
        t: typeof value === 'number' ? 'n' : 's',
        s: style
    };
}

// Define styles
const styles = {
    header: {
        font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1F4E78' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
        }
    },
    phaseHeader: {
        font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: {
            top: { style: 'medium', color: { rgb: '000000' } },
            bottom: { style: 'medium', color: { rgb: '000000' } },
            left: { style: 'medium', color: { rgb: '000000' } },
            right: { style: 'medium', color: { rgb: '000000' } }
        }
    },
    tableCell: {
        font: { name: 'Calibri', sz: 11 },
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
        border: {
            top: { style: 'thin', color: { rgb: 'D0D0D0' } },
            bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
            left: { style: 'thin', color: { rgb: 'D0D0D0' } },
            right: { style: 'thin', color: { rgb: 'D0D0D0' } }
        }
    },
    tableCellCenter: {
        font: { name: 'Calibri', sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: 'D0D0D0' } },
            bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
            left: { style: 'thin', color: { rgb: 'D0D0D0' } },
            right: { style: 'thin', color: { rgb: 'D0D0D0' } }
        }
    },
    statusDone: {
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '006100' } },
        fill: { fgColor: { rgb: 'C6EFCE' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: 'D0D0D0' } },
            bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
            left: { style: 'thin', color: { rgb: 'D0D0D0' } },
            right: { style: 'thin', color: { rgb: 'D0D0D0' } }
        }
    },
    titleStyle: {
        font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: '1F4E78' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    },
    subtitleStyle: {
        font: { name: 'Calibri', sz: 12, color: { rgb: '1F4E78' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    }
};

// Create workbook with styled data
const wb = XLSX.utils.book_new();
const ws = {};

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
ws['!rows'] = [];

let currentRow = 0;

// Helper to add row
function addHeaderRow(text, styleName) {
    const row = currentRow++;
    ws['!rows'][row] = { hpt: 25 };
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = createCell(text, styles[styleName]);

    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: 8 } });
}

function addInfoRow(label, value) {
    const row = currentRow++;
    ws['!rows'][row] = { hpt: 18 };
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = createCell(label, { font: { bold: true } });
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = createCell(value, {});
}

function addEmptyRow() {
    ws['!rows'][currentRow] = { hpt: 10 };
    currentRow++;
}

function addTableHeader() {
    const row = currentRow++;
    ws['!rows'][row] = { hpt: 30 };

    const headers = ['No', 'Modul/Menu', 'Test Case', 'Langkah Testing', 'Expected Result', 'Status', 'Actual Result', 'Screenshot', 'Catatan'];
    headers.forEach((header, idx) => {
        ws[XLSX.utils.encode_cell({ r: row, c: idx })] = createCell(header, styles.header);
    });
}

function addPhaseRow(phaseText) {
    const row = currentRow++;
    ws['!rows'][row] = { hpt: 25 };
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = createCell(phaseText, styles.phaseHeader);

    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: 8 } });
}

function addTestCase(no, modul, testCase, langkah, expected, status, actual, screenshot, catatan) {
    const row = currentRow++;
    ws['!rows'][row] = { hpt: 60 }; // Taller rows for better readability

    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = createCell(no, styles.tableCellCenter);
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = createCell(modul, styles.tableCell);
    ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = createCell(testCase, styles.tableCell);
    ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = createCell(langkah, styles.tableCell);
    ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = createCell(expected, styles.tableCell);
    ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = createCell(status, status === 'Done' ? styles.statusDone : styles.tableCellCenter);
    ws[XLSX.utils.encode_cell({ r: row, c: 6 })] = createCell(actual, styles.tableCellCenter);
    ws[XLSX.utils.encode_cell({ r: row, c: 7 })] = createCell(screenshot, styles.tableCellCenter);
    ws[XLSX.utils.encode_cell({ r: row, c: 8 })] = createCell(catatan, styles.tableCell);
}

// === BUILD DOCUMENT ===

// Header
addHeaderRow('USER ACCEPTANCE TEST (UAT) - NARRATIVE RUNDOWN', 'titleStyle');
addHeaderRow('Puti Internship Management System (PuTi) v1.0', 'subtitleStyle');
addHeaderRow('No. Dokumen: 1515/QA-PuTi/RUNDOWN-UAT/2026', 'subtitleStyle');
addEmptyRow();

// Info
addInfoRow('Test:', 'QA Team / Project Lead');
addInfoRow('Tgl:', '9 Februari 2026');
addInfoRow('Env:', 'http://localhost:3001 (Production Mode)');
addEmptyRow();

// Table header
addTableHeader();

let testNo = 1;

// PHASE 1
addPhaseRow('PHASE 1: ADMIN MASTER SETUP (Preparation)');
addTestCase(
    testNo++, 'Units Management', 'Initial Unit Creation',
    '1. Login Admin\n2. Akses /ManagementData -> Tab Units\n3. Klik "Add Unit"\n4. Isi Nama Unit (misal: "IT Department") & Kapasitas\n5. Klik Simpan',
    'Unit baru berhasil terdaftar dalam sistem.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Management Data', 'Manual Supervisor Assignment',
    '1. Akses /ManagementData\n2. Tab Users -> Add User\n3. Masukkan Detail, pilih Role "Supervisor"\n4. Assign ke unit "IT Department" yang baru dibuat\n5. Simpan',
    'Akun Supervisor dibuat dan ditugaskan sebagai pimpinan Unit tersebut.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Management Data', 'Manual Participant Creation',
    '1. Klik "Add User"\n2. Masukkan Detail, pilih Role "Participant"\n3. Assign Unit & Supervisor\n4. Simpan',
    'Partisipan manual berhasil dibuat dan terhubung ke unit & supervisor pimpinannya.',
    'Done', 'Done', '', ''
);

// PHASE 2
addPhaseRow('PHASE 2: BULK OPERATIONS & DYNAMIC CONFLICTS');
addTestCase(
    testNo++, 'Management Data', 'Bulk Import Logic',
    '1. Klik menu "Import"\n2. Masukkan file Excel berisi 1-4 akun baru\n3. Klik Upload',
    'Sistem memproses antrian data & mengonfirmasi jumlah data yang berhasil.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Management Data', 'Import History Tracking',
    '1. Klik tombol "Import History"\n2. Lihat log upload terbaru',
    'Menampilkan riwayat waktu, siapa yang mengimport, dan jumlah backer/gagal.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Management Data', 'Recycle Bin & Alert Dynamics',
    '1. Hapus salah satu atau Participant dari tabel utama\n2. Coba buka halaman lain yang SAMA (email sama) secara bersamaan',
    'Sistem memberi ALERT: "User masih ada di Recycle Bin, silakan restore atau hapus permanen".',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Recycle Bin', 'Restore Action',
    '1. Buka dialog Trash/Recycle Bin\n2. Cari user ladi\n3. Klik "Restore"',
    'User kembali muncul di daftar aktif tanpa kehilangan data riwayat.',
    'Done', 'Done', '', ''
);

// PHASE 3
addPhaseRow('PHASE 3: PARTICIPANT ONBOARDING & PROFILE');
addTestCase(
    testNo++, 'Participant Profile', 'Identity & Photo Update',
    '1. Login Participant\n2. Masuk ke /Profilepart\n3. Update data diri & Input Telegram Chat ID\n4. Upload Foto Profil resmi (Background Putih/Merah)\n5. Simpan',
    'Foto profil tersimpan untuk keperluan otomatisasi di Sertifikat nanti.',
    'Done', 'Done', '', ''
);

// PHASE 4
addPhaseRow('PHASE 4: COMPLEX ATTENDANCE SCENARIOS (GEODYNAMICS)');
addTestCase(
    testNo++, 'Attendance', 'Scenario A: In-Area Check-in',
    '1. Participant 1 berada di lokasi kantor (In Radius)\n2. Buka halaman /dashboarduser\n3. Klik "Check-in"',
    'Berhasil check-in seketika (Success Alert).',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Attendance', 'Scenario B: Out-of-Area Request',
    '1. Participant 2 berada diluar radius kantor\n2. Coba klik "Check-in"\n3. Isi Form (misal: Dinas Luar)',
    'Sistem mendeteksi deviasi lokasi & memunculkan form "Location Request Approval".',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Special Request', 'Submission Out-Area',
    '1. Participant 2 submit request\n2. Check status request',
    'Status absensi berubah menjadi "Waiting Supervisor Approval".',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Supervisor View', 'Real-time Approval Flow',
    '1. Login Supervisor\n2. Masuk ke /Monitoringsuper\n3. Lihat Pending Location Request\n4. Klik "Approve"',
    'Request Participant 2 diterima; Notifikasi terkirim ke partisipan.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Attendance', 'Finalized Check-in',
    '1. Participant 2 cek status\n2. Verifikasi check-in berhasil',
    'Berhasil Check-in berkat ijin Supervisor (Flow Completed).',
    'Done', 'Done', '', ''
);

// PHASE 5
addPhaseRow('PHASE 5: LEAVE REQUEST & ADMIN RULES');
addTestCase(
    testNo++, 'Leave Request', 'Participant 3: Leave Flow',
    '1. Participant 3 mengajukan izin/sakit\n2. Upload dokumen pendukung\n3. Submit',
    'Data tersimpan & menunggu review supervisor.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Map Settings (Admin)', 'Security & Attendance Rules',
    '1. Login Admin\n2. Masuk ke /MapSettings\n3. Atur "Security Geofence" (Kelat/Longsar)\n4. Atur "Attendance Time Rules" (Jam masuk & denda terlambat)\n5. Atur "Leave Management Rules" (Aturan pengajuan hari ijin)',
    'Parameter sistem berubah; Semua validasi absensi & izin mengikuti aturan baru ini.',
    'Done', 'Done', '', ''
);

// PHASE 6
addPhaseRow('PHASE 6: CERTIFICATE & CUSTOMIZATION');
addTestCase(
    testNo++, 'Certificate', 'Verification & Profile Sync',
    '1. Masuk ke /CertificateScanner (Public/Admin)\n2. Scan QR atau Input No Sertifikat\n3. Admin periksa data peserta',
    'Menampilkan sertifikat digital dengan FOTO PROFIL yang telah diupdate participant sebelumnya.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Settings', 'Signature & Info Customize',
    '1. Admin masuk ke menu Setting (Footer/Header)\n2. Update Info Penandatangan (Nama Direktur/Manager)\n3. Update Stempel Digital',
    'Informasi penandatangan di seluruh sertifikat otomatis terperbarui (Dynamically Synced).',
    'Done', 'Done', '', ''
);

// PHASE 7
addPhaseRow('PHASE 7: ASSESSMENT & SCORING');
addTestCase(
    testNo++, 'Assessment', 'Internal Assessment',
    '1. Login Supervisor\n2. Buka /assessmentsuper\n3. Pilih Participant\n4. Isi Assessment Template (Internal)\n5. Nilai Participant berdasarkan komponen internal\n6. Simpan',
    'Nilai Participant tersimpan. Nilai Assessment Terpilih tersedia untuk cetak Transkrip (Sertifikat Akhir).',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Assessment', 'External Assessment',
    '1. Pilih Template Cetak lagi (misal: instansi external2)\n2. Isi nilai kriteria eksternal2\n3. Simpan',
    'Nilai eksternal tersimpan terpisah; star-point perhitungan final score.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Assessment', 'Manual Template Selection',
    '1. Klik "Assess" pada Participant\n2. Buka dropdown template\n3. Pilih template secara manual (Internal/External)',
    'Supervisor bisa memilih template assessment. Pilih template secara manual (yang lebih sesuai) untuk Participant.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Certificate', 'Generate Certificate PDF',
    '1. Admin atau Supervisor pilih participant yang selesai\n2. Klik "Generate Certificate"\n3. Verifikasi PDF ter-download dengan 3 halaman',
    'PDF 3 halaman: (1) Sertifikat Utama, (2) Transkrip Internal, (3) Transkrip Eksternal dengan logo Telkom.',
    'Done', 'Done', '', ''
);

// PHASE 8
addPhaseRow('PHASE 8: NOTIFICATIONS & AUTOMATION');
addTestCase(
    testNo++, 'Telegram Setup', 'Bot Configuration',
    '1. Login Admin\n2. Buka /admin/telegram-notifications\n3. Input Bot Token dari BotFather\n4. Test Connection\n5. Save',
    'Bot aktif; Siap mengirimkan notifikasi otomatis sesuai trigger/cron.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Notification Templates', 'Create & Manage Templates',
    '1. Buka /admin/notification-templates\n2. Create template untuk: (A) Attendance Reminder, (B) Late Alert, (C) Absence Alert\n3. Gunakan variable {{name}}, {{date}} di dalam template\n4. Save',
    'Template tersimpan; Siap digunakan untuk broadcast berdasarkan logic/rule yang ada.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Profile Settings', 'Custom Telegram ID',
    '1. Supervisor & Participant update Telegram Chat ID di profile masing-masing\n2. Save',
    'Telegram Chat ID tersimpan; Bot akan mengirim notifikasi ke Telegram ID yang tepat.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Cron Jobs', 'Attendance Reminder (Notif 1/3)',
    '1. Setup cron untuk attendance reminder (jam 08:00 pagi)\n2. Jalankan: node scripts/local-cron.js\n3. Cek Telegram participant',
    'Participant menerima "Jangan lupa absen hari ini" di Telegram setiap pagi.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Automated Alerts', 'Late Alert to Supervisor (Notif 2/3)',
    '1. Participant check-in terlambat (lewat jam + toleransi)\n2. Sistem detect keterlambatan\n3. Cek Telegram supervisor yang membimbing',
    'Supervisor menerima alert "[Nama Participant] terlambat check-in hari ini" dengan detail waktu.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Automated Alerts', 'Absence Alert (Notif 3/3)',
    '1. Participant tidak check-in sampai batas waktu (misal jam 10:00)\n2. Cron job running\n3. Cek Telegram supervisor',
    'Supervisor menerima notifikasi "[Nama Participant] belum absen hari ini" ke Telegram ID yang sesuai.',
    'Done', 'Done', '', 'CRITICAL: Pastikan semua 3 notif terkirim!'
);
addTestCase(
    testNo++, 'Notification Verification', 'All 3 Notifications Test',
    '1. Test semua 3 jenis notifikasi (reminder, late alert, absence alert)\n2. Verifikasi terkirim ke recipient yang benar\n3. Pastikan supervisor menerima notif hanya untuk participant yang dibimbingnya',
    'Ketiga notifikasi terkirim dengan benar ke Telegram ID yang tepat sesuai assignment.',
    'Done', 'Done', '', ''
);

// PHASE 9
addPhaseRow('PHASE 9: MONITORING & REPORTS');
addTestCase(
    testNo++, 'Monitoring', 'View Attendance List',
    '1. Login Supervisor\n2. Buka /Monitoringsuper\n3. Lihat tabel attendance dengan pagination',
    'Tampil tabel absensi dengan max 5 records per page yang menggunakan animasi smooth (framer-motion).',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Monitoring', 'Filter & Pagination',
    '1. Filter by date range\n2. Filter by participant name\n3. Navigate dengan tombol prev/next',
    'Data ter-filter sesuai kriteria; Pagination smooth dengan animasi saat berpindah halaman.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Reports', 'Generate Attendance Report',
    '1. Buka /AttendanceReport\n2. Pilih periode tanggal & participant (bisa pilih "All")\n3. Klik Generate\n4. Export ke Excel atau PDF',
    'Laporan ter-generate dengan data yang akurat, siap di-download dalam format Excel/PDF.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Reports', 'Dashboard Analytics',
    '1. Buka /ReportsMonitoring\n2. Lihat grafik kehadiran, statistik keseluruhan, trend absensi',
    'Dashboard menampilkan visualisasi data (grafik batang/line) yang informatif dan real-time.',
    'Done', 'Done', '', ''
);

// PHASE 10
addPhaseRow('PHASE 10: DOCUMENT MANAGEMENT (ARSIP)');
addTestCase(
    testNo++, 'Arsip', 'Upload Document',
    '1. Login Admin\n2. Buka /arsip\n3. Klik "Upload"\n4. Pilih file (PDF, Word, Excel, dll)\n5. Isi metadata: judul, kategori, deskripsi\n6. Submit',
    'Dokumen berhasil diupload dan muncul di list arsip institusi.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Arsip', 'View & Download Document',
    '1. Klik "View" pada dokumen di list arsip\n2. PDF/Dokumen terbuka di tab yang sama (via window.location.href)\n3. Klik Download jika ingin menyimpan file',
    'Dokumen terbuka tanpa security warning dan bisa di-download dengan mudah.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Arsip', 'Delete Document',
    '1. Pilih dokumen dari list\n2. Klik "Delete"\n3. Konfirmasi',
    'Dokumen dihapus dari sistem (hard delete atau soft sesuai method).',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Documents', 'Acceptance Letter Generation',
    '1. Pilih participant yang diterima\n2. Klik "Generate Acceptance Letter"\n3. Data auto-fill dari profil participant\n4. Download PDF surat penerimaan',
    'PDF surat penerimaan ter-generate dengan template resmi lengkap dengan signature & stempel digital.',
    'Done', 'Done', '', ''
);

// PHASE 11
addPhaseRow('PHASE 11: ADVANCED FEATURES & INTEGRATION');
addTestCase(
    testNo++, 'Users Management', 'Soft Delete & Restore',
    '1. Di Management Data > Users\n2. Hapus user (soft delete—masuk Recycle Bin)\n3. Buka "Deleted Users"\n4. Restore user (balik ke daftar utama)\n5. Test juga Permanent Delete',
    'Soft delete memindahkan user ke recycle bin, restore mengembalikan, permanent delete menghapus selamanya.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Users Management', 'Bulk Operations',
    '1. Select multiple users di "Deleted Users"\n2. Klik "Bulk Restore" (ALL restore bersamaan)\n3. Select multiple users lagi\n4. Klik "Bulk Permanent Delete"',
    'Bulk restore dan bulk delete berfungsi untuk efficiency operasi; batch processing.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Units Management', 'Soft Delete & Bulk Ops',
    '1. Test soft delete unit (pindah ke recycle unit bin)\n2. View deleted units listing\n3. Restore unit kembali ke active\n4. Test bulk restore dan bulk permanent delete untuk multiple units',
    'Unit management memiliki fitur yang sama dengan user management untuk konsistensi sistem.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Form Builder', 'File Upload Field',
    '1. Di Management Data > Form Templates\n2. Create new form untuk application\n3. Tambah field dengan tipe "File Upload"\n4. Set accepted file types (.pdf, .jpg, .png, .docx, dll)\n5. Save',
    'Field file upload berhasil ditambahkan; Validasi tipe file berfungsi; Form siap digunakan.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Bulk Import', 'Template Integration',
    '1. Prepare Excel dengan kolom "Transcript External Institution"\n2. Import data participants via Bulk Import\n3. Cek Assessment Templates setelah import',
    'Assessment template untuk institusi eksternal otomatis dibuat oleh sistem (auto-generated).',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Map Settings', 'Three Column Layout',
    '1. Login Admin\n2. Buka /MapSettings\n3. Verifikasi layout: Peta full width di atas\n4. Di bawah peta ada 3 kolom: (1) Attendance Time Rules, (2) Leave Management Rules, (3) Location & Precision + Save button',
    'Layout 3 kolom sesuai design specification; Semua pengaturan tersimpan dengan benar.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Certificate Scanner', 'QR Code Verification',
    '1. Buka /CertificateScanner (bisa diakses public atau admin)\n2. Gunakan kamera untuk scan QR code atau input kode manual\n3. Submit untuk verifikasi\n4. Lihat hasil verifikasi',
    'Sistem menampilkan data sertifikat lengkap jika valid; Atau "Invalid Certificate" jika palsu.',
    'Done', 'Done', '', ''
);

// PHASE 12
addPhaseRow('PHASE 12: API & INTEGRATION TESTING');
addTestCase(
    testNo++, 'API', 'Authentication Endpoints',
    '1. Test POST /api/auth/[...nextauth] dengan kredensial valid dan invalid\n2. Test GET /api/auth/protected dengan token -> harus 200\n3. Test tanpa token -> harus 401 Unauthorized',
    'API authentication berfungsi dengan benar; Valid credentials → return token (200 OK); Invalid → 401 error.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'API', 'CRUD Endpoints',
    '1. Test GET/POST/PUT/DELETE untuk /api/users dan /api/units (basic CRUD)\n2. Test endpoints soft delete: DELETE /api/users/[id] dan /api/units/[id]\n3. Test restore: POST /api/users/[id]/restore dan /api/units/[id]/restore\n4. Test permanent delete: DELETE /api/users/[id]/permanent\n5. Test bulk: POST /api/users/bulk-restore, DELETE /api/users/bulk-permanent',
    'Semua API endpoints untuk CRUD, soft delete, restore, permanent delete, dan bulk operations berfungsi dengan response yang benar (200/201 success, 404 not found, 400 bad request).',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'API', 'Notification Endpoints',
    '1. Test GET/POST /api/notifications/templates (list & create template)\n2. Test POST /api/notifications/telegram/send-attendance-alerts\n3. Test cron endpoints: POST /api/cron/attendance-reminder\n4. Verifikasi notifikasi benar-benar terkirim ke Telegram ID yang tepat',
    'API notifikasi mengirim pesan dengan benar ke Telegram ID sesuai mapping; Alert terkirim ke supervisor yang tepat.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Integration', 'Database Operations',
    '1. Jalankan berbagai CRUD operations (create, read, update, delete)\n2. Verifikasi data integrity: cek foreign keys, constraints, indexes\n3. Test transactions untuk bulk operations (harusnya atomic)\n4. Cek tidak ada data corruption',
    'Database operations berjalan lancar dengan PostgreSQL; Data konsisten dan relasi (FK) terjaga; Transactions rollback jika ada error.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Integration', 'File Upload & PDF Generation',
    '1. Test file upload untuk: foto attendance selfie, arsip documents, form attachments\n2. Test PDF generation untuk: certificates (3 halaman), acceptance letters, attendance reports\n3. Verifikasi file storage dan file retrieval',
    'File upload sukses dengan validasi tipe & size; PDF generation dengan layout yang rapi dan data akurat; File bisa diakses kembali.',
    'Done', 'Done', '', ''
);
addTestCase(
    testNo++, 'Integration', 'Excel Import/Export',
    '1. Test bulk import participants dari Excel file (.xlsx): upload file, parse data, insert to DB\n2. Test export attendance report ke Excel: query data, format ke Excel, download file\n3. Verifikasi data accuracy: data di Excel = data di DB\n4. Test edge cases: empty cells, special characters, large datasets',
    'Excel import berfungsi: data ter-parse dengan benar; Export berfungsi: data dari DB -> Excel file dengan format rapi; Data accurate dan complete (no data loss); Edge cases handled.',
    'Done', 'Done', '', ''
);

// Footer
addEmptyRow();
const legendRow = currentRow++;
ws[XLSX.utils.encode_cell({ r: legendRow, c: 0 })] = createCell('LEGEND / PETUNJUK:', { font: { bold: true, sz: 12 } });
ws[XLSX.utils.encode_cell({ r: currentRow++, c: 0 })] = createCell('Done: Test telah dilakukan', {});
ws[XLSX.utils.encode_cell({ r: currentRow++, c: 0 })] = createCell('Ack: Hasil dinyatakan', {});
ws[XLSX.utils.encode_cell({ r: currentRow++, c: 0 })] = createCell('Src: Bukti Visual', {});

addEmptyRow();
const signRow = currentRow++;
ws[XLSX.utils.encode_cell({ r: signRow, c: 0 })] = createCell('TANDA TANGAN PENGESAHAN', { font: { bold: true, sz: 12 } });
ws[XLSX.utils.encode_cell({ r: currentRow++, c: 0 })] = createCell('Test: .......................', {});
ws[XLSX.utils.encode_cell({ r: currentRow++, c: 0 })] = createCell('Sup: .......................', {});
ws[XLSX.utils.encode_cell({ r: currentRow++, c: 0 })] = createCell('Stat: .......................', {});

// Set ref range
ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: currentRow - 1, c: 8 } });

// Add to workbook
XLSX.utils.book_append_sheet(wb, ws, 'UAT_Puti');

// Save file
const outputPath = path.join(__dirname, '..', 'docs', 'UAT_Puti_Professional_2026.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ File UAT profesional dengan styling berhasil dibuat!');
console.log('📁 Lokasi:', outputPath);
console.log(`📊 Total Test Cases: ${testNo - 1}`);
console.log('\n🎨 Styling Features:');
console.log('  ✓ Borders pada semua cells (thin borders dengan warna abu-abu)');
console.log('  ✓ Header tabel dengan background biru gelap & text putih bold');
console.log('  ✓ Phase headers dengan background biru & text putih');
console.log('  ✓ Status "Done" dengan background hijau & text hijau gelap');
console.log('  ✓ Text wrapping untuk cell panjang');
console.log('  ✓ Text alignment (center untuk no/status, left untuk deskripsi)');
console.log('  ✓ Row heights disesuaikan untuk readability');
console.log('\n📋 Format sesuai UAT_Puti_ULTRA_COMPREHENSIVE.xlsx dengan STYLING PROFESIONAL!');
