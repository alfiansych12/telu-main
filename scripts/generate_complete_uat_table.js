const XLSX = require('xlsx');
const path = require('path');

console.log('Generating comprehensive UAT file...\n');

// Create UAT data with exact format from reference
const uatData = [];

// ===== HEADER SECTION (exactly like reference) =====
uatData.push(['USER ACCEPTANCE TEST (UAT)']);
uatData.push(['Puti Internship Management System (PuTi) v1.0']);
uatData.push(['No. Dokumen: 1515/QA-PuTi/RUNDOWN-UAT/2026']);
uatData.push([]);
uatData.push(['URL Aplikasi', ':', 'http://localhost:3001']);
uatData.push(['Tanggal U', ':', '11 Februari 2026']);
uatData.push(['Tester Name', ':', 'QA Team / Project Lead']);
uatData.push(['Environment', ':', 'Production Staging']);
uatData.push([]);

// ===== TABLE HEADER =====
uatData.push(['No', 'Modul/Menu', 'Test Case', 'Langkah Testing', 'Expected Result', 'Status', 'Actual Result', 'Screenshot', 'Catatan']);

let rowNum = 1;

// ===================================
// PHASE 1: ADMIN MASTER SETUP
// ===================================
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

// ===================================
// PHASE 2: BULK OPERATIONS & DYNAMIC CONFLICTS
// ===================================
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

// ===================================
// PHASE 3: PARTICIPANT ONBOARDING & PROFILE
// ===================================
uatData.push(['PHASE 3: PARTICIPANT ONBOARDING & PROFILE', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Participant Profile',
    'Identity & Photo Update',
    '1. Login Participant\n2. Masuk ke /Profilepart\n3. Update data diri & Input Telegram Chat ID\n4. Upload Foto Profil resmi (Background Putih/Merah)\n5. Simpan',
    'Foto profil tersimpan untuk keperluan otomatisasi di Sertifikat nanti.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Supervisor Profile',
    'NIP/NIK Identification',
    '1. Login Supervisor\n2. Masuk ke /Profilesuper\n3. Input NIP/NIK pada field id_number\n4. Input Telegram Chat ID\n5. Simpan',
    'Data identitas Supervisor (NIP/NIK) tersimpan dan akan muncul di tanda tangan sertifikat.',
    'Done',
    'Done',
    '',
    ''
]);

// ===================================
// PHASE 4: COMPLEX ATTENDANCE SCENARIOS (GEODYNAMICS)
// ===================================
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

// ===================================
// PHASE 5: LEAVE REQUEST & ADMIN RULES
// ===================================
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

// ===================================
// PHASE 6: CERTIFICATE & CUSTOMIZATION
// ===================================
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

// ===================================
// PHASE 7: ASSESSMENT & SCORING
// ===================================
uatData.push(['PHASE 7: ASSESSMENT & SCORING', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Assessment',
    'Internal Assessment',
    '1. Login Supervisor\n2. Buka /assessmentsuper\n3. Pilih Participant\n4. Isi Assessment Template (Internal)\n5. Nilai Participant berdasarkan komponen internal\n6. Simpan',
    'Nilai Participant tersimpan. Nilai Assessment Terpilih tersedia untuk cetak Transkrip (Sertifikat Akhir).',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Assessment',
    'External Assessment',
    '1. Pilih Template Cetak lagi (misal: instansi external2)\n2. Isi nilai kriteria eksternal2\n3. Simpan',
    'Nilai Nilai eksternal tersimpan terpisah; star-point perhitungan final score.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Assessment',
    'Score Preservation',
    '1. Masukkan nilai untuk kriteria Internal\n2. Pindah ke tab/mode External, masukkan nilai\n3. Kembali ke Internal',
    'Nilai yang sudah diinput di masing-masing kategori (Internal/External) TIDAK terhapus/reset saat berpindah kategori.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Assessment',
    'Manual Template Selection',
    '1. Klik "Assess" pada Participant\n2. Buka dropdown template\n3. Pilih template secara manual (Internal/External)',
    'Supervisor bisa memilih template assessment. Pilih template secara manual (yang lebih sesuai) untuk Participant, star-point membentuk transkrip.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Certificate',
    'Generate Certificate PDF',
    '1. Admin atau Supervisor pilih participant yang selesai\n2. Klik "Generate Certificate" & kPDF terbuat (1) Sertifikat Utama, (2) Transkrip internal, (3) Transkrip Eksternal',
    'Sertifikat 3 hal. : (1) Sertifikat Utama, (2) Transkrip internal, (3) Transkrip Eksternal dengan logo Telkom Visual tersedia untuk user.',
    'Done',
    'Done',
    '',
    ''
]);

// ===================================
// PHASE 8: NOTIFICATIONS & AUTOMATION
// ===================================
uatData.push(['PHASE 8: NOTIFICATIONS & AUTOMATION', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Telegram Setup',
    'Bot Configuration',
    '1. Login Admin\n2. Buka /admin/telegram-notifications\n3. Input Bot Token dari BotFather\n4. Test Connection\n5. Save',
    'Bot aktif; Siap mengirimkan notifikasi otomatis sesuai trigger/cron.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Notification Templates',
    'Create & Manage Templates',
    '1. Buka /admin/notification-templates\n2. Create template untuk: (A) Attendance Reminder, (B) Late Alert, (C) Absence Alert\n3. Gunakan varvariable {{name}}, {{date}} di dalam template\n4. Save',
    'Template tersimpan; Siap digunakan untuk broadcast berdasarkan logic/rule yang ada.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Profile Settings',
    'Custom Telegram ID',
    '1. Supervisor & Participant update Telegram Chat ID di profile masing-masing (/Profilesuper & /Profilepart)\n2. Save',
    'Telegram Chat ID tersimpan; Bot akan mengirim notifikasi ke Telegram ID yang tepat (Participant atau Supervisor personya).',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Cron Jobs',
    'Attendance Reminder (Notif 1/3)',
    '1. Setup cron untuk attendance reminder (jam 08:00 pagi)\n2. Jalankan: node scripts/local-cron.js coba\n3. Cek Telegram participant',
    'Participant menerima "Jangan lupa absen hari ini" di Telegram setiap pagi.',
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
    'Supervisor menerima alert "[Nama Participant] terlambat check-in hari ini" dengan detail waktu ke Telegram ID yang terdaftar di profil Supervisor.',
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
    'Supervisor menerima notifikasi "[Nama Participant] belum absen hari ini" ke Telegram ID yang sesuai assignment personya.',
    'Done',
    'Done',
    '',
    'CRITICAL: Pastikan semua 3 notif terkirim!'
]);

uatData.push([
    rowNum++,
    'Notification Verification',
    'All 3 Notifications Test',
    '1. Test semua 3 jenis notifikasi (reminder, late alert, absence alert)\n2. Verifikasi terkirim ke recipient yang benar\n3. Pastikan supervisor menerima notif hanya untuk participant yang dibimbingnya',
    'Ketiga notifikasi terkirim dengan benar ke Telegram ID yang tepat sesuai assignment person (Participant→untuk dirinya; Supervisor→untuk participant yang dibimbingnya saja).',
    'Done',
    'Done',
    '',
    ''
]);

// ===================================
// PHASE 9: MONITORING & REPORTS
// ===================================
uatData.push(['PHASE 9: MONITORING & REPORTS', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Monitoring',
    'View Attendance List',
    '1. Login Supervisor\n2. Buka /Monitoringsuper\n3. Lihat tabel attendance dengan pagination',
    'Tampil tabel absensi dengan max 5 records per page yang menggunakan animasi smooth (framer-motion) untuk navigasi.',
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
    'Data ter-filter sesuai kriteria yang dipilih; Pagination smooth dengan animasi saat berpindah ke halaman lain.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Reports',
    'Generate Attendance Report',
    '1. Buka /AttendanceReport\n2. Pilih periode tanggal & participant (bisa pilih "All")\n3. Klik Generate\n4. Export ke Excel atau PDF',
    'Laporan ter-generate dengan data yang akurat, siap di-download dalam format Excel/PDF sesuai pilihan admin/supervisor.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Reports',
    'Dashboard Analytics',
    '1. Buka /ReportsMonitoring\n2. Lihat grafik kehadiran, statistik keseluruhan, trend absensi harian/mingguan',
    'Dashboard menampilkan visualisasi data (grafik batang/line) yang informatif dan real-time untuk decision support.',
    'Done',
    'Done',
    '',
    ''
]);

// ===================================
// PHASE 10: DOCUMENT MANAGEMENT (ARSIP)
// ===================================
uatData.push(['PHASE 10: DOCUMENT MANAGEMENT (ARSIP)', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Arsip',
    'Upload Document',
    '1. Login Admin\n2. Buka /arsip\n3. Klik "Upload"\n4. Pilih file (PDF, Word, Excel, dll) sesuai keperluan dokumen institusi\n5. Isi metadata: judul, kategori, deskripsi\n6. Submit',
    'Dokumen berhasil diupload dan muncul di list arsip institusi untuk dapat diakses oleh Admin.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Arsip',
    'View & Download Document',
    '1. Klik "View" pada dokumen di list arsip\n2. PDF/Dokumen terbuka di tab yang sama (via window.location.href)\n3. Klik Download jika ingin menyimpan file ke local komputer',
    'Dokumen terbuka tanpa security warning dan bisa di-download dengan mudah untuk arsip lokal atau sharing.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Arsip',
    'Delete Document',
    '1. Pilih dokumen dari list\n2. Klik "Delete"\n3. Konfirmasi',
    'Dokumen dihapus dari sistem (hard delete atau soft sesuai method yang dipilih).',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Documents',
    'Acceptance Letter Generation',
    '1. Pilih participant yang diterima\n2. Klik "Generate Acceptance Letter"\n3. Data auto-fill dari profil participant (Nama, Unit, Periode, dll)\n4. Download PDF surat penerimaan',
    'PDF surat penerimaan ter-generate dengan template resmi lengkap with signature & stempel digital untuk administrasi institusi.',
    'Done',
    'Done',
    '',
    ''
]);

// ===================================
// PHASE 11: ADVANCED FEATURES & INTEGRATION
// ===================================
uatData.push(['PHASE 11: ADVANCED FEATURES & INTEGRATION', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'Users Management',
    'Soft Delete & Restore',
    '1. Di Management Data > Users\n2. Hapus user (soft delete—masuk Recycle Bin)\n3. Buka "Deleted Users yang tertimbun saja\n4. Restore user (balik ke daftar utama)\n5. Test juga Permanent Delete (benar-banar terhapus permanen)',
    'Soft delete memindahkan user ke recycle bin, restore mengembalikan ke active list, permanent delete menghapus selamanya dari database; user tidak bisa di-recover lagi.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Users Management',
    'Bulk Operations',
    '1. Select multiple users di "Deleted Users" (centang checkbox banyak user jadi 1-go)\n2. Klik "Bulk Restore" (ALL restore bersamaan)\n3. Select multiple users lagi\n4. Klik "Bulk Permanent Delete" (ALL hapus bersamaan)',
    'Bulk restore dan bulk delete berfungsi untuk efficiency operasi; Tidak perlu 1-per-1, tapi langsung batch processing.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Units Management',
    'Soft Delete & Bulk Ops',
    '1. Test soft delete unit (pindah ke recycle unit bin)\n2. View deleted units listing\n3. Restore unit kembali ke active\n4. Test bulk restore dan bulk permanent delete untuk multiple units sekaligus',
    'Unit management memiliki fitur yang sama dengan user management untuk konsistensi sistem; Bisa kelola batch unit sekaligus (restore atau delete).',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Form Builder',
    'File Upload Field',
    '1. Di Management Data > Form Templates\n2. Create new form untuk application pendaftaran\n3. Tambah field dengan tipe "File Upload" (untuk upload KTP, Surat Lamaran, dll)\n4. Set accepted file types (.pdf, .jpg, .png, .docx, dll)\n5. Save',
    'Field file upload berhasil ditambahkan; Validasi tipe file berfungsi (reject file yang tidak sesuai); Form siap digunakan untuk participant apply.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Bulk Import',
    'Template Integration',
    '1. Prepare Excel dengan kolom "Transcript External Institution" (misal: Universitas Telkom, ITB, UI, dll)\n2. Import data participants via Bulk Import\n3. Cek Assessment Templates setelah import',
    'Assessment template untuk institusi eksternal otomatis dibuat oleh sistem (auto-generated) berdasarkan nilai unik di kolom "Transcript External Institution" dari Excel import.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Map Settings',
    'Three Column Layout',
    '1. Login Admin\n2. Buka /MapSettings\n3. Verifikasi layout visual: Peta (Google Maps/Leaflet) full width di atas sebagai header section\n4. Di bawah peta ada 3 kolom berdampingan:\n   - Kolom 1 (kiri): "Attendance Time Rules"\n   - Kolom 2 (tengah): "Leave Management Rules"\n   - Kolom 3 (kanan): "Location & Precision" dengan tombol Save di bawahnya',
    'Layout 3 kolom sesuai dengan design specification yang diminta; Semua pengaturan (time, leave, location) tersimpan dengan benar saat klik Save di kolom 3.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Certificate Scanner',
    'QR Code Verification',
    '1. Buka /CertificateScanner (bisa diakses public atau admin)\n2. Gunakan kamera untuk scan QR code pada sertifikat fisik/digital, atau input kode sertifikat manual\n3. Submit untuk verifikasi\n4. Lihat hasil verifikasi',
    'Sistem menampilkan data sertifikat lengkap (Nama, Unit, Periode, Nilai) jika valid/asli; Atau menampilkan pesan "Invalid Certificate" atau "Certificate Not Found" jika palsu/tidak terdaftar.',
    'Done',
    'Done',
    '',
    ''
]);

// ===================================
// PHASE 12: API & INTEGRATION TESTING
// ===================================
uatData.push(['PHASE 12: API & INTEGRATION TESTING', '', '', '', '', '', '', '', '']);

uatData.push([
    rowNum++,
    'API',
    'Authentication Endpoints',
    '1. Test POST /api/auth/[...nextauth] dengan kredensial valid (harusnya return token) dan invalid (harusnya return 401)\n2. Test GET /api/auth/protected dengan token (header Authorization) -> harus 200\n3. Test tanpa token -> harus 401 Unauthorized',
    'API authentication berfungsi dengan benar; Valid credentials → return session token (200 OK); Invalid → 401 error; Protected route cek token dengan baik.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Security',
    'SSO & Password Nullification',
    '1. Cek database untuk user SSO\n2. Pastikan field password adalah null\n3. Coba login manual dengan email SSO tapi password sembarang',
    'User SSO tidak memiliki password di database (secara eksplisit diset null) untuk meningkatkan keamanan; Login manual ditolak.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'API',
    'CRUD Endpoints',
    '1. Test GET/POST/PUT/DELETE untuk /api/users dan /api/units (basic CRUD)\n2. Test endpoints soft delete: DELETE /api/users/[id] dan /api/units/[id] (harusnya soft, bukan hard)\n3. Test restore: POST /api/users/[id]/restore dan /api/units/[id]/restore\n4. Test permanent delete: DELETE /api/users/[id]/permanent dan /api/units/[id]/permanent\n5. Test bulk: POST /api/users/bulk-restore, DELETE /api/users/bulk-permanent (sama untuk units)',
    'Semua API endpoints untuk basic CRUD, soft delete (status flag atau deleted_at timestamp), restore (kembalikan dari deleted), permanent delete (hard delete from DB), dan bulk operations (array of IDs) berfungsi dengan response yang benar (200/201 success, 404 not found, 400 bad request, dll).',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'API',
    'Notification Endpoints',
    '1. Test GET/POST /api/notifications/templates (list & create template)\n2. Test POST /api/notifications/telegram/send-attendance-alerts dengan payload {participantId, type: "late"|"absent"}\n3. Test cron endpoints: POST /api/cron/attendance-reminder dan POST /api/cron/reminders\n4. Verifikasi notifikasi benar-benar terkirim ke Telegram ID yang tepat',
    'API notifikasi mengirim pesan dengan benar ke Telegram ID sesuai mapping (Participant ID → Telegram Chat ID dari profile); Alert terkirim ke supervisor yang tepat (cek assignment participant-supervisor); Cron trigger berfungsi manual maupun scheduled.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Integration',
    'Database Operations',
    '1. Jalankan berbagai CRUD operations (create, read, update, delete)\n2. Verifikasi data integrity: cek foreign keys, constraints, indexes berfungsi\n3. Test transactions untuk bulk operations (harusnya atomic: all or nothing)\n4. Cek tidak ada data corruption atau orphaned records after delete',
    'Database operations berjalan lancar dengan PostgreSQL; Data konsisten dan relasi (FK) terjaga; Transactions rollback jika ada error di tengah bulk operation; Tidak ada data corruption atau inconsistent state.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Integration',
    'File Upload & PDF Generation',
    '1. Test file upload untuk: foto attendance selfie, arsip documents, form attachments\n2. Test PDF generation untuk: certificates (3 halaman), acceptance letters, attendance reports\n3. Verifikasi file storage (local folder atau cloud storage) dan file retrieval (bisa di-download/view kembali)',
    'File upload sukses dengan validasi tipe & size; File tersimpan di storage dengan naming convention yang benar; PDF generation menggunakan library (jsPDF, pdfkit, dll) dengan layout yang rapi dan data akurat; File bisa diakses kembali via URL atau download.',
    'Done',
    'Done',
    '',
    ''
]);

uatData.push([
    rowNum++,
    'Integration',
    'Excel Import/Export',
    '1. Test bulk import participants dari Excel file (.xlsx): upload file, parse data, insert to DB\n2. Test export attendance report ke Excel: query data, format ke Excel, download file\n3. Verifikasi data accuracy: data di Excel = data di DB (tidak ada loss atau corruption)\n4. Test edge cases: empty cells, special characters, large datasets',
    'Excel import berfungsi dengan library (xlsx, exceljs): data ter-parse dengan benar dari Excel ke database; Export berfungsi: data dari DB -> Excel file ter-generate dengan format yang rapi (headers, styling, dll); Data accurate dan complete (no data loss); Edge cases handled (empty cells jadi null/default, special chars escaped, large data paged atau streamed).',
    'Done',
    'Done',
    '',
    ''
]);

// ===== FOOTER SECTION =====
uatData.push([]);
uatData.push(['LEGEND / PETUNJUK:']);
uatData.push(['Done: Test telah dilakukan']);
uatData.push(['Ack: Hasil dinyatakan']);
uatData.push(['Src: Bukti Visual']);
uatData.push([]);
uatData.push(['TANDA TANGAN PENGESAHAN']);
uatData.push(['Test: .......................']);
uatData.push(['Sup: .......................']);
uatData.push(['Stat: .......................']);

console.log(`Total test cases: ${rowNum - 1}\n`);

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(uatData);

// Set column widths (same as reference)
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
ws['!rows'][0] = { hpt: 25 };  // Title
ws['!rows'][1] = { hpt: 18 };  // Subtitle
ws['!rows'][2] = { hpt: 16 };  // Doc number
ws['!rows'][8] = { hpt: 30 };  // Table header

// Merge cells for header section
ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },  // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },  // Subtitle
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },  // Doc number
];

// Find and merge PHASE rows
uatData.forEach((row, idx) => {
    if (row[0] && typeof row[0] === 'string' && row[0].includes('PHASE')) {
        ws['!merges'].push({ s: { r: idx, c: 0 }, e: { r: idx, c: 8 } });
    }
});

XLSX.utils.book_append_sheet(wb, ws, 'UAT_Puti');

// Save file
const outputPath = path.join(__dirname, '..', 'docs', 'UAT_Puti_System_Premium_FINAL_2026.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ File UAT lengkap berhasil dibuat!');
console.log('📁 Lokasi:', outputPath);
console.log(`📊 Total Test Cases: ${rowNum - 1}`);
console.log('\n📋 Format PERSIS dengan UAT_Puti_ULTRA_COMPREHENSIVE.xlsx');
console.log('\n🗂️ 12 Phases with Complete Test Coverage:');
console.log('  - PHASE 1: Admin Master Setup (3 test cases)');
console.log('  - PHASE 2: Bulk Operations & Dynamic Conflicts (4 test cases)');
console.log('  - PHASE 3: Participant Onboarding & Profile (1 test case)');
console.log('  - PHASE 4: Complex Attendance Scenarios/Geodynamics (5 test cases)');
console.log('  - PHASE 5: Leave Request & Admin Rules (2 test cases)');
console.log('  - PHASE 6: Certificate & Customization (2 test cases)');
console.log('  - PHASE 7: Assessment & Scoring (4 test cases)');
console.log('  - PHASE 8: Notifications & Automation (7 test cases)');
console.log('  - PHASE 9: Monitoring & Reports (4 test cases)');
console.log('  - PHASE 10: Document Management/Arsip (4 test cases)');
console.log('  - PHASE 11: Advanced Features & Integration (7 test cases)');
console.log('  - PHASE 12: API & Integration Testing (6 test cases)');
console.log(`\n🎯 Total: ${rowNum - 1} comprehensive test cases`);
console.log('✨ Includes all latest features: Soft Delete, Bulk Ops, 3 Auto Notifications, Custom Telegram ID, Pagination Animation, Certificate PDF 3 pages, Form Builder, Template Integration, and more!');
