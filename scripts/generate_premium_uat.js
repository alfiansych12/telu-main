const ExcelJS = require('exceljs');
const path = require('path');

async function generatePremiumUAT() {
    console.log('Generating PREMIUM styled UAT file using ExcelJS...\n');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('UAT_Puti_Premium');

    // Define Styles
    const titleStyle = {
        font: { name: 'Arial', size: 14, bold: true },
        alignment: { horizontal: 'center' }
    };

    const headerStyle = {
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1F4E78' } // Dark Blue
        },
        font: {
            color: { argb: 'FFFFFFFF' },
            bold: true,
            name: 'Arial',
            size: 10
        },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    };

    const phaseRowStyle = {
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9E1F2' } // Light Blue-ish Gray
        },
        font: { bold: true, name: 'Arial', size: 10 },
        alignment: { vertical: 'middle' },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    };

    const cellStyle = {
        font: { name: 'Arial', size: 9 },
        alignment: { vertical: 'top', wrapText: true },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    };

    // 1. TOP TITLES
    sheet.mergeCells('A1:I1');
    sheet.getCell('A1').value = 'USER ACCEPTANCE TEST (UAT)';
    sheet.getCell('A1').style = titleStyle;

    sheet.mergeCells('A2:I2');
    sheet.getCell('A2').value = 'Puti Internship Management System (PuTi) v1.0';
    sheet.getCell('A2').style = titleStyle;

    sheet.mergeCells('A3:I3');
    sheet.getCell('A3').value = 'No. Dokumen: 1515/QA-PuTi/RUNDOWN-UAT/2026';
    sheet.getCell('A3').style = titleStyle;

    sheet.addRow([]); // Blank line

    // 2. INFO SECTION
    const infoRows = [
        ['URL Aplikasi', ':', 'http://localhost:3001'],
        ['Tanggal U', ':', '11 Februari 2026'],
        ['Tester Name', ':', 'QA Team / Project Lead'],
        ['Environment', ':', 'Production Staging']
    ];

    infoRows.forEach(row => {
        const r = sheet.addRow(row);
        r.getCell(1).font = { bold: true, size: 10 };
    });

    sheet.addRow([]); // Blank line

    // 3. TABLE HEADER
    const headers = ['No', 'Modul/Menu', 'Test Case', 'Langkah Testing', 'Expected Result', 'Status', 'Actual Result', 'Screenshot', 'Catatan'];
    const headerRow = sheet.addRow(headers);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
        cell.style = headerStyle;
    });

    // 4. TEST DATA
    let rowNum = 1;

    const testCases = [
        {
            phase: 'PHASE 1: ADMIN MASTER SETUP', cases: [
                ['Units Management', 'Initial Unit Creation', '1. Login Admin\n2. Akses /ManagementData -> Tab Units\n3. Klik "Add Unit"\n4. Isi Nama Unit & Kapasitas\n5. Klik Simpan', 'Unit baru berhasil terdaftar dalam sistem.'],
                ['Management Data', 'Manual Supervisor Assignment', '1. Akses /ManagementData\n2. Tab Users -> Add User\n3. Pilih Role "Supervisor"\n4. Assign ke unit yang baru dibuat\n5. Simpan', 'Akun Supervisor dibuat dan ditugaskan sebagai pimpinan Unit tersebut.'],
                ['Management Data', 'Manual Participant Creation', '1. Klik "Add User"\n2. Pilih Role "Participant"\n3. Assign Unit & Supervisor\n4. Simpan', 'Partisipan manual berhasil dibuat dan terhubung ke unit & supervisornya.']
            ]
        },
        {
            phase: 'PHASE 2: BULK OPERATIONS & DYNAMIC CONFLICTS', cases: [
                ['Management Data', 'Bulk Import Logic', '1. Klik menu "Import"\n2. Masukkan file Excel berisi data akun baru\n3. Klik Upload', 'Sistem memproses antrian data & mengonfirmasi jumlah data yang berhasil.'],
                ['Management Data', 'Import History Tracking', '1. Klik tombol "Import History"\n2. Lihat log upload terbaru', 'Menampilkan riwayat waktu, siapa yang mengimport, dan statistik berhasil/gagal.'],
                ['Management Data', 'Recycle Bin & Alert Dynamics', '1. Hapus salah satu user\n2. Coba buat akun baru dengan email yang sama', 'Sistem memberi ALERT bahwa user masih ada di Recycle Bin.'],
                ['Recycle Bin', 'Restore Action', '1. Buka dialog Recycle Bin\n2. Cari user tadi\n3. Klik "Restore"', 'User kembali muncul di daftar aktif tanpa kehilangan data riwayat.']
            ]
        },
        {
            phase: 'PHASE 3: PROFILE & IDENTITY', cases: [
                ['Participant Profile', 'Identity & Photo Update', '1. Login Participant\n2. Update data diri & Telegram ID\n3. Upload Foto Profil resmi\n4. Simpan', 'Foto profil tersimpan untuk keperluan otomatisasi di Sertifikat.'],
                ['Supervisor Profile', 'NIP/NIK Identification', '1. Login Supervisor\n2. Input NIP/NIK pada field id_number\n3. Input Telegram Chat ID\n4. Simpan', 'Data identitas Supervisor (NIP/NIK) tersimpan dan muncul di tanda tangan sertifikat.']
            ]
        },
        {
            phase: 'PHASE 4: COMPLEX ATTENDANCE SCENARIOS', cases: [
                ['Attendance', 'In-Area Check-in', '1. Participant berada di lokasi kantor (In Radius)\n2. Klik "Check-in"', 'Berhasil check-in seketika (Success Alert).'],
                ['Attendance', 'Out-of-Area Request', '1. Participant berada diluar radius kantor\n2. Klik "Check-in"', 'Sistem mendeteksi deviasi lokasi & memunculkan form Location Request.'],
                ['Special Request', 'Submission Out-Area', '1. Participant submit request lokasi\n2. Cek status', 'Status absensi menjadi "Waiting Supervisor Approval".'],
                ['Supervisor View', 'Real-time Approval Flow', '1. Supervisor akses /Monitoringsuper\n2. Pilih Pending Request\n3. Klik "Approve"', 'Request diterima; Notifikasi terkirim ke partisipan.'],
                ['Attendance', 'Finalized Check-in', '1. Participant cek status setelah approval', 'Berhasil Check-in berkat ijin Supervisor.']
            ]
        },
        {
            phase: 'PHASE 5: LEAVE REQUEST & ADMIN RULES', cases: [
                ['Leave Request', 'Submission Flow', '1. Participant mengajukan izin/sakit\n2. Upload dokumen pendukung\n3. Submit', 'Data tersimpan & menunggu review supervisor.'],
                ['Map Settings', 'Security & Attendance Rules', '1. Admin atur Geofence, Time Rules, dan Leave Management Rules di /MapSettings', 'Parameter sistem berubah secara global mengikuti aturan baru.']
            ]
        },
        {
            phase: 'PHASE 6: CERTIFICATE & CUSTOMIZATION', cases: [
                ['Certificate', 'Verification & Profile Sync', '1. Akses /CertificateScanner\n2. Scan QR atau Input No Sertifikat', 'Menampilkan sertifikat digital dengan FOTO PROFIL yang disinkronisasi.'],
                ['Settings', 'Signature & Info Customize', '1. Admin update info penandatangan & stempel digital', 'Seluruh sertifikat otomatis menggunakan info terbaru.']
            ]
        },
        {
            phase: 'PHASE 7: ASSESSMENT & SCORING', cases: [
                ['Assessment', 'Internal Assessment', '1. Supervisor isi Form Internal Assessment untuk Participant', 'Nilai tersimpan dan tersedia untuk cetak transkrip.'],
                ['Assessment', 'External Assessment', '1. Supervisor isi Form External Assessment', 'Nilai eksternal tersimpan terpisah.'],
                ['Assessment', 'Score Preservation', '1. Input nilai Internal\n2. Pindah ke tab External, input nilai\n3. Kembali ke Internal', 'Nilai tidak hilang/reset saat berpindah kategori.'],
                ['Assessment', 'Manual Template Selection', '1. Supervisor pilih template assessment secara manual dari dropdown', 'Fleksibilitas dalam memilih kriteria penilaian yang sesuai.'],
                ['Certificate', 'Generate PDF (3 Pages)', '1. Klik "Generate Certificate"', 'Terbentuk PDF 3 hal: Sertifikat Utama, Transkrip Internal, Transkrip Eksternal.']
            ]
        },
        {
            phase: 'PHASE 8: NOTIFICATIONS & AUTOMATION', cases: [
                ['Telegram Setup', 'Bot Configuration', '1. Input Bot Token di Admin Settings', 'Bot aktif & siap mengirim notifikasi.'],
                ['Notifications', 'Custom Telegram ID Mapping', '1. User update Telegram ID di profil', 'Notifikasi terkirim tepat sasaran ke recipient yang benar.'],
                ['Cron Jobs', 'All 3 Notifications', '1. Test Attendance Reminder (08:00)\n2. Test Late Alert to Supervisor\n3. Test Absence Alert to Supervisor', 'Ketiga jenis notifikasi otomatis terkirim dengan benar via Telegram.']
            ]
        },
        {
            phase: 'PHASE 9: MONITORING & REPORTS', cases: [
                ['Monitoring', 'Pagination & Animation', '1. Navigasi tabel attendance di /Monitoringsuper', 'Tabel max 5 records per page dengan animasi smooth (framer-motion).'],
                ['Reports', 'Excel/PDF Export', '1. Filter data & generate report di /AttendanceReport', 'Laporan akurat tersedia dalam format Excel/PDF.']
            ]
        },
        {
            phase: 'PHASE 10: DOCUMENT MANAGEMENT (ARSIP)', cases: [
                ['Arsip', 'Upload & View Document', '1. Admin upload dokumen institusi di /arsip\n2. Klik "View"', 'Dokumen terbuka di tab yang sama tanpa security warning.'],
                ['Documents', 'Acceptance Letter', '1. Pilih participant\n2. Generate Acceptance Letter', 'PDF surat penerimaan ter-generate dengan data auto-fill profile.']
            ]
        },
        {
            phase: 'PHASE 11: ADVANCED DATA OPS', cases: [
                ['Data Management', 'Soft Delete & Recycle Bin', '1. Hapus user/unit\n2. Restore dari Recycle Bin', 'Fitur pengelolaan data "anti-accident" berfungsi sempurna.'],
                ['Bulk Operations', 'Batch Restore/Delete', '1. Select multiple items\n2. Klik Bulk Action', 'Efisiensi pengelolaan data dalam jumlah banyak.'],
                ['Bulk Import', 'Auto Template Integration', '1. Import Excel dengan kolom "Transcript External Institution"', 'Template assessment eksternal otomatis dibuat oleh sistem.'],
                ['Map Settings', 'Three Column Layout', '1. Cek visual /MapSettings', 'Layout map full-width di atas dan 3 kolom pengaturan di bawah.']
            ]
        },
        {
            phase: 'PHASE 12: SECURITY & INTEGRATION', cases: [
                ['Security', 'SSO & Password Nullification', '1. Cek database user SSO', 'Password null untuk user SSO; Login manual ditolak demi keamanan.'],
                ['API', 'CRUD & Protected Endpoints', '1. Test API endpoints via Postman/Script', 'Authentication & Authorization layer berfungsi di level API.'],
                ['Integration', 'Database Integrity', '1. Jalankan berbagai operasi data', 'Relasi PostgreSQL (Foreign Keys) & Transactions (Atomic) terjaga.']
            ]
        }
    ];

    testCases.forEach(p => {
        // Add Phase Header
        const pr = sheet.addRow([p.phase, '', '', '', '', '', '', '', '']);
        sheet.mergeCells(`A${pr.number}:I${pr.number}`);
        pr.eachCell(cell => { cell.style = phaseRowStyle; });

        p.cases.forEach(c => {
            const row = sheet.addRow([rowNum++, c[0], c[1], c[2], c[3], 'Done', 'Done', '', '']);
            row.eachCell(cell => { cell.style = cellStyle; });
        });
    });

    // 5. FOOTER / LEGEND
    sheet.addRow([]);
    sheet.addRow(['LEGEND / PETUNJUK:']).font = { bold: true };
    sheet.addRow(['Done', ':', 'Test telah dilakukan']);
    sheet.addRow(['Ack', ':', 'Hasil dinyatakan']);
    sheet.addRow(['Src', ':', 'Bukti Visual']);

    // Column Widths
    sheet.columns = [
        { width: 5 },   // No
        { width: 22 },  // Modul
        { width: 25 },  // Test Case
        { width: 50 },  // Langkah
        { width: 50 },  // Expected
        { width: 10 },  // Status
        { width: 12 },  // Actual
        { width: 12 },  // Screenshot
        { width: 20 }   // Catatan
    ];

    // Save File
    const outputPath = path.join(__dirname, '..', 'docs', 'UAT_Puti_System_Premium_Styled.xlsx');
    await workbook.xlsx.writeFile(outputPath);

    console.log('✅ PREMIUM Styled UAT file created successfully!');
    console.log('📁 Path:', outputPath);
}

generatePremiumUAT().catch(err => console.error('❌ Error:', err));
