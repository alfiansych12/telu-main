const XLSX = require('xlsx');

// Read the reference file to understand its structure
const refWb = XLSX.readFile('docs/UAT_Puti_ULTRA_COMPREHENSIVE.xlsx');
const refWs = refWb.Sheets[refWb.SheetNames[0]];
const refData = XLSX.utils.sheet_to_json(refWs, { header: 1, defval: '' });

console.log('Reference file structure:');
console.log('Headers (Row 3):', refData[2]);
console.log('\nSample data rows:');
console.log('Row 4:', refData[3]);
console.log('Row 5:', refData[4]);

// Now create comprehensive UAT based on this structure
const uatData = [];

// Title and Header Section
uatData.push(['USER ACCEPTANCE TESTING (UAT)']);
uatData.push(['Sistem Manajemen Magang & Monitoring Peserta - Version 2.0']);
uatData.push([]);

// Column Headers
uatData.push([
    'No',
    'Modul/Fitur',
    'Sub-Fitur',
    'Skenario Pengujian',
    'Langkah-langkah Detail',
    'Hasil yang Diharapkan',
    'Status',
    'Catatan/Bug'
]);

// Data rows
let no = 1;

// ========== AUTHENTICATION & SECURITY ==========
uatData.push([
    no++,
    'AUTHENTICATION & SECURITY',
    'Login SSO',
    'Login menggunakan SSO dengan kredensial valid',
    '1. Buka halaman login\n2. Klik tombol "Login with SSO"\n3. Masukkan kredensial SSO yang valid\n4. Klik Submit',
    'User berhasil login dan diarahkan ke dashboard sesuai role (Admin/Supervisor/Participant)',
    '',
    ''
]);

uatData.push([
    no++,
    'AUTHENTICATION & SECURITY',
    'Login Manual (Admin)',
    'Login Admin dengan password manual',
    '1. Buka halaman login\n2. Masukkan email admin\n3. Masukkan password yang benar\n4. Klik Login',
    'Admin berhasil login ke dashboard admin dengan akses penuh',
    '',
    ''
]);

uatData.push([
    no++,
    'AUTHENTICATION & SECURITY',
    'Login Failed',
    'Login dengan kredensial yang salah',
    '1. Buka halaman login\n2. Masukkan email/password yang salah\n3. Klik Login',
    'Muncul pesan error "Invalid credentials" dan tidak bisa masuk',
    '',
    ''
]);

uatData.push([
    no++,
    'AUTHENTICATION & SECURITY',
    'Session Management',
    'Akses halaman protected tanpa login',
    '1. Buka browser baru (incognito)\n2. Langsung akses URL dashboard (misal /admin atau /dashboard)\n3. Tanpa login terlebih dahulu',
    'User otomatis diarahkan ke halaman login, tidak bisa akses halaman protected',
    '',
    ''
]);

uatData.push([
    no++,
    'AUTHENTICATION & SECURITY',
    'Logout',
    'Logout dari sistem',
    '1. Login ke sistem\n2. Klik menu user di header (kanan atas)\n3. Klik tombol "Logout"',
    'User berhasil logout, session dihapus, dan kembali ke halaman login',
    '',
    ''
]);

uatData.push([
    no++,
    'AUTHENTICATION & SECURITY',
    'Role-Based Access',
    'Akses menu Admin sebagai Participant',
    '1. Login sebagai Participant\n2. Coba akses URL /admin atau /ManagementData secara manual\n3. Atau coba cari menu admin di navigasi',
    'Akses ditolak (403/redirect ke dashboard participant), menu admin tidak muncul di navigasi',
    '',
    ''
]);

uatData.push([
    no++,
    'AUTHENTICATION & SECURITY',
    'Password Policy',
    'Password hanya untuk Admin, null untuk SSO users',
    '1. Sebagai Admin, buat user baru dengan role Supervisor\n2. Cek database: password field harus null\n3. Coba login sebagai Supervisor dengan password -> harus gagal\n4. Login dengan SSO -> harus berhasil',
    'Supervisor/Participant hanya bisa login via SSO (password=null), Admin bisa login dengan password',
    '',
    ''
]);

// ========== DASHBOARD ==========
uatData.push([
    no++,
    'DASHBOARD',
    'Dashboard Admin',
    'Tampil statistik dan quick actions',
    '1. Login sebagai Admin\n2. Buka /admin atau dashboard admin\n3. Lihat card statistik (total users, units, participants, supervisors)\n4. Lihat tombol "Add User" dan "Add Unit"',
    'Statistik tampil dengan angka yang benar, tombol quick action berfungsi membuka dialog',
    '',
    ''
]);

uatData.push([
    no++,
    'DASHBOARD',
    'Dashboard Supervisor',
    'Lihat daftar peserta yang dibimbing',
    '1. Login sebagai Supervisor\n2. Buka /dashboardsuper\n3. Lihat tabel peserta\n4. Lihat ringkasan absensi hari ini',
    'Tampil hanya peserta yang di-assign ke supervisor tersebut, dengan info absensi terkini',
    '',
    ''
]);

uatData.push([
    no++,
    'DASHBOARD',
    'Dashboard Participant',
    'Info magang dan status absensi',
    '1. Login sebagai Participant\n2. Buka /dashboarduser\n3. Lihat info periode magang, supervisor, unit\n4. Lihat status absensi hari ini dan tombol check-in/out',
    'Tampil info lengkap dan status absensi real-time dengan tombol yang sesuai (check-in atau check-out)',
    '',
    ''
]);

// ========== PROFILE MANAGEMENT ==========
uatData.push([
    no++,
    'PROFILE',
    'Profile Admin',
    'View dan edit profile admin',
    '1. Login sebagai Admin\n2. Buka /Profileadmin\n3. Lihat data profil (nama, email, telepon, dll)\n4. Edit nama atau telepon\n5. Input Telegram Chat ID\n6. Klik Save',
    'Data profil berhasil diupdate, Telegram ID tersimpan untuk menerima notifikasi',
    '',
    ''
]);

uatData.push([
    no++,
    'PROFILE',
    'Profile Supervisor',
    'Update profile dan Telegram ID',
    '1. Login sebagai Supervisor\n2. Buka /Profilesuper\n3. Edit data profil\n4. Input Telegram Chat ID\n5. Save',
    'Data tersimpan, notifikasi untuk supervisor akan dikirim ke Telegram ID yang diinput',
    '',
    ''
]);

uatData.push([
    no++,
    'PROFILE',
    'Profile Participant',
    'Update Telegram Username',
    '1. Login sebagai Participant\n2. Buka /Profilepart\n3. Input Telegram Chat ID di field yang tersedia\n4. Save',
    'Telegram ID tersimpan, participant akan menerima reminder dan notifikasi di Telegram',
    '',
    ''
]);

// ========== MANAGEMENT DATA: USERS ==========
uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Users - View List',
    'Lihat daftar semua users',
    '1. Login sebagai Admin\n2. Buka /ManagementData\n3. Pilih tab "Users"\n4. Filter berdasarkan role (All/Admin/Supervisor/Participant)',
    'Tampil tabel users dengan kolom nama, email, role, status, actions',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Users - Add Admin',
    'Tambah user baru dengan role Admin',
    '1. Di Management Data > Users\n2. Klik tombol "Add User"\n3. Isi form: nama, email, role=Admin, password\n4. Submit',
    'User admin baru berhasil ditambahkan dengan password yang di-hash',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Users - Add SSO User',
    'Tambah Supervisor/Participant (SSO only)',
    '1. Klik Add User\n2. Isi form dengan role Supervisor atau Participant\n3. Password field diabaikan (auto null)\n4. Submit',
    'User berhasil ditambahkan dengan password=null, hanya bisa login via SSO',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Users - Edit',
    'Edit data user existing',
    '1. Di tabel users, klik icon Edit pada user tertentu\n2. Ubah data (nama, email, role)\n3. Save',
    'Data user berhasil diupdate di database',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Users - Soft Delete',
    'Hapus user (soft delete)',
    '1. Di tabel users, klik icon Delete\n2. Konfirmasi dialog hapus\n3. Klik OK',
    'User dipindah ke status deleted (soft delete), tidak muncul di list aktif',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Users - View Deleted',
    'Lihat user yang sudah dihapus',
    '1. Di Users Management\n2. Klik tab atau tombol "Deleted Users"\n3. Lihat daftar user yang di-soft delete',
    'Tampil daftar user yang sudah dihapus dengan opsi Restore atau Permanent Delete',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Users - Restore',
    'Restore user yang dihapus',
    '1. Di Deleted Users\n2. Pilih user yang akan di-restore\n3. Klik tombol "Restore"',
    'User dikembalikan ke status aktif dan muncul kembali di list users',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Users - Permanent Delete',
    'Hapus user secara permanen',
    '1. Di Deleted Users\n2. Pilih user\n3. Klik "Permanent Delete"\n4. Konfirmasi',
    'User dihapus permanen dari database, tidak bisa di-restore lagi',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Users - Bulk Restore',
    'Restore multiple users sekaligus',
    '1. Di Deleted Users\n2. Select checkbox multiple users\n3. Klik "Bulk Restore"',
    'Semua user yang dipilih di-restore ke status aktif',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Users - Bulk Permanent Delete',
    'Hapus permanen multiple users',
    '1. Di Deleted Users\n2. Select multiple users\n3. Klik "Bulk Permanent Delete"\n4. Konfirmasi',
    'Semua user terpilih dihapus permanen dari database',
    '',
    ''
]);

// ========== MANAGEMENT DATA: UNITS ==========
uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Units - View List',
    'Lihat daftar unit/divisi',
    '1. Di Management Data\n2. Pilih tab "Units"\n3. Lihat tabel units',
    'Tampil daftar units dengan nama, deskripsi, jumlah peserta, actions',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Units - Add',
    'Tambah unit baru',
    '1. Klik tombol "Add Unit"\n2. Isi nama unit dan deskripsi\n3. Submit',
    'Unit baru berhasil ditambahkan dan muncul di list',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Units - Edit',
    'Edit data unit',
    '1. Klik Edit pada unit\n2. Ubah nama atau deskripsi\n3. Save',
    'Data unit berhasil diupdate',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Units - Delete',
    'Soft delete unit',
    '1. Klik Delete pada unit\n2. Konfirmasi',
    'Unit di-soft delete, pindah ke Deleted Units',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Units - Deleted Units',
    'Lihat unit yang dihapus',
    '1. Klik tab "Deleted Units"',
    'Tampil daftar units yang di-soft delete dengan opsi Restore/Permanent Delete',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Units - Restore/Permanent',
    'Restore atau hapus permanen unit',
    '1. Di Deleted Units, pilih unit\n2. Klik Restore atau Permanent Delete\n3. Juga bisa bulk operation untuk multiple units',
    'Unit di-restore atau dihapus permanen sesuai aksi',
    '',
    ''
]);

// ========== MANAGEMENT DATA: ASSESSMENT TEMPLATES ==========
uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Assessment Templates',
    'Lihat dan kelola template penilaian',
    '1. Di Management Data > Tab Assessment Templates\n2. Lihat daftar template (Internal & External)\n3. Klik Add Template untuk buat baru\n4. Isi tipe (Internal/External), kriteria penilaian\n5. Submit',
    'Template penilaian baru berhasil dibuat dan bisa dipilih saat assessment',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Templates - Edit/Delete',
    'Edit atau hapus template',
    '1. Klik Edit untuk ubah kriteria\n2. Atau klik Delete untuk hapus template',
    'Template berhasil diupdate atau dihapus',
    '',
    ''
]);

// ========== MANAGEMENT DATA: APPLICATION FORMS ==========
uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Form Templates',
    'Lihat template form pendaftaran',
    '1. Di Management Data > Form Templates\n2. Lihat daftar form template',
    'Tampil daftar form yang sudah dibuat',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Form Builder',
    'Buat form pendaftaran dengan form builder',
    '1. Klik "Create Form"\n2. Gunakan form builder: tambah field Text, Select, Textarea, File Upload\n3. Untuk File Upload: set accepted file types (.pdf, .jpg, dll)\n4. Save form',
    'Form template baru berhasil dibuat dengan semua field termasuk file upload',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Form - Edit',
    'Edit form template existing',
    '1. Klik Edit pada form\n2. Ubah fields atau tambah field baru\n3. Save',
    'Form template berhasil diupdate',
    '',
    ''
]);

// ========== MANAGEMENT DATA: BULK IMPORT ==========
uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Bulk Import',
    'Import data peserta dari Excel',
    '1. Di Management Data\n2. Klik "Bulk Import" atau "Import Participants"\n3. Upload file Excel dengan data peserta (nama, email, unit, institusi eksternal, dll)\n4. Submit',
    'Data peserta berhasil di-import ke database, assessment template otomatis dibuat jika ada institusi eksternal baru',
    '',
    ''
]);

uatData.push([
    no++,
    'MANAGEMENT DATA',
    'Template Integration',
    'Template assessment otomatis dari Excel',
    '1. Excel berisi kolom "Transcript External Institution"\n2. Import data\n3. Cek Assessment Templates',
    'Assessment template untuk institusi eksternal otomatis dibuat',
    '',
    ''
]);

// ========== MONITORING & ATTENDANCE ==========
uatData.push([
    no++,
    'MONITORING',
    'View Attendance List',
    'Lihat daftar absensi peserta (Supervisor)',
    '1. Login sebagai Supervisor\n2. Buka /Monitoringsuper\n3. Lihat tabel "Monitoring Attendance"',
    'Tampil tabel absensi peserta yang dibimbing dengan pagination 5 records/page',
    '',
    ''
]);

uatData.push([
    no++,
    'MONITORING',
    'Pagination',
    'Navigasi halaman dengan animasi',
    '1. Di tabel Monitoring Attendance\n2. Klik tombol Previous/Next\n3. Atau klik nomor halaman',
    'Pagination berfungsi dengan smooth slide animation (framer-motion), max 5 records per halaman',
    '',
    ''
]);

uatData.push([
    no++,
    'MONITORING',
    'Filter Attendance',
    'Filter berdasarkan tanggal dan peserta',
    '1. Pilih date range atau tanggal spesifik\n2. Atau pilih nama peserta dari dropdown\n3. Klik Filter',
    'Data absensi ter-filter sesuai kriteria yang dipilih',
    '',
    ''
]);

uatData.push([
    no++,
    'MONITORING',
    'View Detail',
    'Lihat detail absensi',
    '1. Klik pada row absensi\n2. Lihat detail lengkap',
    'Tampil info: waktu check-in/out, lokasi GPS, foto selfie, catatan, status (hadir/terlambat)',
    '',
    ''
]);

uatData.push([
    no++,
    'ATTENDANCE',
    'Check-in',
    'Absen masuk (Participant)',
    '1. Login sebagai Participant\n2. Di dashboard, klik tombol "Check-in"\n3. Izinkan akses lokasi GPS\n4. Ambil foto selfie\n5. Submit',
    'Absensi masuk tercatat dengan timestamp, koordinat GPS, dan foto',
    '',
    ''
]);

uatData.push([
    no++,
    'ATTENDANCE',
    'Check-out',
    'Absen pulang',
    '1. Setelah check-in, klik "Check-out"\n2. Ambil foto\n3. Isi catatan kegiatan (optional)\n4. Submit',
    'Absensi keluar tercatat dengan durasi kerja dihitung otomatis',
    '',
    ''
]);

uatData.push([
    no++,
    'ATTENDANCE',
    'Validasi Lokasi',
    'Check-in di luar radius yang ditentukan',
    '1. Coba check-in saat berada di luar radius lokasi kantor/unit\n2. Submit',
    'Muncul warning "Di luar jangkauan lokasi" atau absensi ditandai sebagai "Lokasi Invalid"',
    '',
    ''
]);

uatData.push([
    no++,
    'ATTENDANCE',
    'Validasi Waktu',
    'Check-in di luar jam kerja',
    '1. Coba check-in sebelum jam kerja dimulai atau setelah jam kerja berakhir\n2. Submit',
    'Status absensi ditandai "Terlambat" atau "Di luar jam kerja" sesuai aturan yang ditetapkan',
    '',
    ''
]);

uatData.push([
    no++,
    'REPORTS',
    'Attendance Report',
    'Generate laporan absensi',
    '1. Login sebagai Admin/Supervisor\n2. Buka /AttendanceReport\n3. Pilih periode (tanggal awal - akhir)\n4. Pilih peserta (specific atau all)\n5. Klik Generate',
    'Tampil laporan absensi dalam bentuk tabel/grafik dengan summary kehadiran',
    '',
    ''
]);

uatData.push([
    no++,
    'REPORTS',
    'Export Report',
    'Export laporan ke Excel/PDF',
    '1. Di halaman report\n2. Klik tombol "Export"\n3. Pilih format (Excel atau PDF)',
    'File report ter-download sesuai format yang dipilih',
    '',
    ''
]);

uatData.push([
    no++,
    'REPORTS',
    'Reports Monitoring',
    'Dashboard laporan keseluruhan',
    '1. Buka /ReportsMonitoring\n2. Lihat berbagai metrik dan grafik',
    'Tampil dashboard dengan grafik kehadiran, statistik, trend absensi',
    '',
    ''
]);

// ========== ASSESSMENT ==========
uatData.push([
    no++,
    'ASSESSMENT',
    'View Participant List',
    'Lihat peserta untuk dinilai',
    '1. Login sebagai Supervisor\n2. Buka /assessmentsuper\n3. Lihat daftar peserta',
    'Tampil daftar peserta yang dibimbing dengan tombol "Assess"',
    '',
    ''
]);

uatData.push([
    no++,
    'ASSESSMENT',
    'Manual Template Selection',
    'Pilih template penilaian secara manual',
    '1. Klik tombol "Assess" pada peserta\n2. Muncul dialog dengan dropdown template\n3. Pilih template (Internal atau External) dari dropdown\n4. Form penilaian muncul sesuai template',
    'Supervisor bisa memilih template assessment secara manual, tidak auto-assigned',
    '',
    ''
]);

uatData.push([
    no++,
    'ASSESSMENT',
    'Fill Internal Assessment',
    'Isi penilaian internal',
    '1. Pilih template Internal\n2. Isi nilai untuk setiap kriteria (1-100 atau sesuai skala)\n3. Tambah catatan (optional)\n4. Submit',
    'Nilai internal tersimpan di database dan ter-link ke peserta',
    '',
    ''
]);

uatData.push([
    no++,
    'ASSESSMENT',
    'Fill External Assessment',
    'Isi penilaian eksternal (dari institusi pendidikan)',
    '1. Pilih template External\n2. Isi nilai kriteria eksternal\n3. Submit',
    'Nilai eksternal tersimpan terpisah dari internal',
    '',
    ''
]);

uatData.push([
    no++,
    'ASSESSMENT',
    'Score Calculation',
    'Perhitungan nilai rata-rata',
    '1. Setelah submit assessment (internal & external)\n2. Sistem kalkulasi otomatis\n3. Cek di detail peserta',
    'Nilai rata-rata internal dan eksternal dihitung dengan benar, final score akurat',
    '',
    ''
]);

uatData.push([
    no++,
    'ASSESSMENT',
    'View History',
    'Lihat riwayat penilaian',
    '1. Di halaman assessment\n2. Klik "View History" pada peserta',
    'Tampil semua penilaian yang pernah diberikan (internal & external) dengan tanggal dan nilai',
    '',
    ''
]);

uatData.push([
    no++,
    'ASSESSMENT',
    'Edit Assessment',
    'Edit penilaian existing',
    '1. Di history assessment, klik Edit\n2. Ubah nilai\n3. Save',
    'Nilai berhasil diupdate, final score ter-recalculate',
    '',
    ''
]);

// ========== CERTIFICATE & DOCUMENTS ==========
uatData.push([
    no++,
    'CERTIFICATE',
    'Generate Certificate',
    'Buat sertifikat untuk peserta',
    '1. Login sebagai Admin/Supervisor\n2. Pilih peserta yang sudah selesai magang\n3. Klik "Generate Certificate"',
    'PDF sertifikat ter-generate dengan data peserta, periode, unit, dan nilai',
    '',
    ''
]);

uatData.push([
    no++,
    'CERTIFICATE',
    'PDF 3 Halaman',
    'Verifikasi struktur PDF sertifikat',
    '1. Buka PDF sertifikat yang di-generate\n2. Cek halaman 1: Sertifikat utama\n3. Cek halaman 2: Transkrip nilai internal (dengan template)\n4. Cek halaman 3: Transkrip nilai eksternal (plain background + logo Telkom)',
    'PDF memiliki 3 halaman sesuai spesifikasi',
    '',
    ''
]);

uatData.push([
    no++,
    'CERTIFICATE',
    'Signature Display',
    'Verifikasi tanda tangan di sertifikat',
    '1. Lihat bagian bawah sertifikat (halaman 1)\n2. Cek keberadaan tanda tangan digital atau nama pemberi sertifikat',
    'Tanda tangan tampil dengan jelas',
    '',
    ''
]);

uatData.push([
    no++,
    'CERTIFICATE',
    'Score Accuracy',
    'Validasi nilai di sertifikat',
    '1. Bandingkan nilai di PDF dengan database\n2. Cek rumus perhitungan (custom internal & external)\n3. Verifikasi final score',
    'Nilai di sertifikat akurat sesuai assessment dan perhitungan yang benar',
    '',
    ''
]);

uatData.push([
    no++,
    'CERTIFICATE',
    'Certificate Scanner',
    'Scan dan verifikasi sertifikat',
    '1. Buka /CertificateScanner\n2. Scan QR code dari sertifikat (atau input kode manual)\n3. Lihat hasil verifikasi',
    'Sistem menampilkan data sertifikat yang valid atau pesan "Invalid" jika palsu',
    '',
    ''
]);

uatData.push([
    no++,
    'DOCUMENTS',
    'Arsip - View List',
    'Lihat daftar dokumen arsip',
    '1. Login sebagai Admin\n2. Buka /arsip\n3. Lihat daftar dokumen institusi',
    'Tampil tabel dokumen dengan nama, kategori, tanggal upload, actions',
    '',
    ''
]);

uatData.push([
    no++,
    'DOCUMENTS',
    'Arsip - Upload',
    'Upload dokumen baru',
    '1. Di halaman Arsip, klik "Upload"\n2. Pilih file (PDF, Word, Excel, dll)\n3. Isi metadata: judul, kategori, deskripsi\n4. Submit',
    'Dokumen berhasil diupload dan muncul di list',
    '',
    ''
]);

uatData.push([
    no++,
    'DOCUMENTS',
    'Arsip - View Document',
    'Buka dan lihat dokumen',
    '1. Klik tombol "View" pada dokumen\n2. Dokumen terbuka',
    'Dokumen terbuka di tab yang sama (window.location.href) tanpa security warning',
    '',
    ''
]);

uatData.push([
    no++,
    'DOCUMENTS',
    'Arsip - Download',
    'Download dokumen arsip',
    '1. Klik tombol "Download"\n2. File ter-download',
    'File berhasil di-download ke komputer',
    '',
    ''
]);

uatData.push([
    no++,
    'DOCUMENTS',
    'Arsip - Delete',
    'Hapus dokumen dari arsip',
    '1. Klik Delete\n2. Konfirmasi',
    'Dokumen dihapus dari sistem',
    '',
    ''
]);

uatData.push([
    no++,
    'DOCUMENTS',
    'Acceptance Letter',
    'Generate surat penerimaan magang',
    '1. Pilih peserta\n2. Klik "Generate Acceptance Letter"\n3. Data auto-fill dari profile peserta',
    'PDF surat penerimaan ter-generate dengan template resmi, lengkap dengan nama, periode, unit, tanda tangan',
    '',
    ''
]);

// ========== SYSTEM SETTINGS ==========
uatData.push([
    no++,
    'SETTINGS',
    'Map Settings - Layout',
    'Lihat pengaturan peta dengan layout 3 kolom',
    '1. Login sebagai Admin\n2. Buka /MapSettings\n3. Verifikasi layout: Peta full width di atas, 3 kolom di bawah',
    'Layout sesuai: Peta di atas (full), kolom 1 (Time Rules), kolom 2 (Leave Rules), kolom 3 (Location & Save)',
    '',
    ''
]);

uatData.push([
    no++,
    'SETTINGS',
    'Map - Set Location',
    'Atur lokasi pusat dan marker',
    '1. Klik pada peta atau input koordinat\n2. Set marker lokasi kantor\n3. Save',
    'Lokasi pusat berhasil diatur dan tersimpan',
    '',
    ''
]);

uatData.push([
    no++,
    'SETTINGS',
    'Attendance Time Rules',
    'Atur jam kerja (Kolom 1)',
    '1. Di kolom pertama\n2. Set jam check-in (misal 08:00)\n3. Set jam check-out (misal 17:00)\n4. Set toleransi keterlambatan (misal 15 menit)\n5. Save',
    'Aturan waktu absensi tersimpan dan diterapkan pada check-in/out',
    '',
    ''
]);

uatData.push([
    no++,
    'SETTINGS',
    'Leave Management Rules',
    'Atur aturan cuti/izin (Kolom 2)',
    '1. Di kolom kedua\n2. Set kuota cuti tahunan\n3. Set approval flow\n4. Save',
    'Aturan cuti/izin tersimpan',
    '',
    ''
]);

uatData.push([
    no++,
    'SETTINGS',
    'Location & Precision',
    'Atur radius dan akurasi GPS (Kolom 3)',
    '1. Di kolom ketiga\n2. Set radius dalam meter (misal 100m)\n3. Set precision GPS\n4. Klik tombol Save (di kolom 3)',
    'Pengaturan radius dan akurasi GPS tersimpan, validasi lokasi check-in menggunakan nilai ini',
    '',
    ''
]);

uatData.push([
    no++,
    'SETTINGS',
    'Units Management Page',
    'Halaman khusus units management',
    '1. Buka /UnitsManagement\n2. Lihat daftar units dengan opsi CRUD',
    'Tampil daftar units dengan tombol Add, Edit, Delete, Settings',
    '',
    ''
]);

uatData.push([
    no++,
    'SETTINGS',
    'Unit Settings',
    'Pengaturan per unit',
    '1. Di Units Management, klik "Settings" pada unit\n2. Buka /UnitsManagement/settings/[id]\n3. Atur lokasi spesifik unit, aturan khusus',
    'Tampil halaman pengaturan khusus unit dengan opsi kustomisasi',
    '',
    ''
]);

// ========== NOTIFICATIONS ==========
uatData.push([
    no++,
    'NOTIFICATIONS',
    'Telegram Bot Setup',
    'Konfigurasi Telegram Bot',
    '1. Login sebagai Admin\n2. Buka /admin/telegram-notifications\n3. Input Bot Token dari BotFather\n4. Save',
    'Bot token tersimpan dan bot aktif untuk kirim notifikasi',
    '',
    ''
]);

uatData.push([
    no++,
    'NOTIFICATIONS',
    'Test Connection',
    'Test koneksi Telegram Bot',
    '1. Di halaman telegram settings\n2. Klik tombol "Test Connection"',
    'Muncul pesan sukses jika bot terhubung, atau error message jika gagal',
    '',
    ''
]);

uatData.push([
    no++,
    'NOTIFICATIONS',
    'Notification Templates',
    'Kelola template notifikasi',
    '1. Buka /admin/notification-templates\n2. Lihat daftar template\n3. Klik Create untuk buat template baru\n4. Isi judul, konten (dengan placeholder {{name}}, {{date}}, dll)\n5. Save',
    'Template notifikasi berhasil dibuat dan bisa digunakan untuk send notification',
    '',
    ''
]);

uatData.push([
    no++,
    'NOTIFICATIONS',
    'Edit/Delete Template',
    'Ubah atau hapus template',
    '1. Klik Edit untuk ubah konten\n2. Atau klik Delete untuk hapus',
    'Template berhasil diupdate atau dihapus',
    '',
    ''
]);

uatData.push([
    no++,
    'NOTIFICATIONS',
    'Manual Send',
    'Kirim notifikasi manual',
    '1. Di halaman notifications\n2. Pilih penerima (Supervisor/Participant specific atau all)\n3. Pilih template\n4. Klik Send',
    'Notifikasi terkirim ke Telegram ID yang terdaftar di profile user',
    '',
    ''
]);

uatData.push([
    no++,
    'NOTIFICATIONS',
    'Custom Telegram ID',
    'Notifikasi ke custom Telegram ID per user',
    '1. Supervisor/Participant set Telegram Chat ID di profile masing-masing\n2. Trigger notifikasi (manual atau otomatis)\n3. Cek Telegram',
    'Notifikasi diterima di Telegram ID yang diinput user, bukan Telegram username lama',
    '',
    ''
]);

uatData.push([
    no++,
    'NOTIFICATIONS',
    'Attendance Reminder Auto',
    'Reminder otomatis untuk absensi (Notif 1 dari 3)',
    '1. Setup cron job untuk attendance reminder\n2. Tunggu jadwal (misal setiap pagi jam 08:00)\n3. Cek Telegram participant',
    'Participant menerima reminder "Jangan lupa absen hari ini" di Telegram',
    '',
    ''
]);

uatData.push([
    no++,
    'NOTIFICATIONS',
    'Late Alert to Supervisor',
    'Alert ke supervisor jika peserta terlambat (Notif 2 dari 3)',
    '1. Participant check-in terlambat (lewat jam + toleransi)\n2. Sistem detect keterlambatan\n3. Cek Telegram supervisor',
    'Supervisor menerima alert "[Nama Participant] terlambat check-in hari ini" dengan detail waktu',
    '',
    ''
]);

uatData.push([
    no++,
    'NOTIFICATIONS',
    'Absence Alert',
    'Alert jika peserta tidak absen (Notif 3 dari 3)',
    '1. Participant tidak check-in sampai batas waktu tertentu (misal jam 10:00)\n2. Cron job running\n3. Cek Telegram supervisor',
    'Supervisor menerima notifikasi "[Nama Participant] belum absen hari ini"',
    '',
    ''
]);

uatData.push([
    no++,
    'NOTIFICATIONS',
    'Three Notifications Complete',
    'Verifikasi 3 jenis notifikasi otomatis terkirim',
    '1. Test reminder pagi\n2. Test late alert\n3. Test absence alert\n4. Pastikan semua terkirim dengan benar',
    'Ketiga jenis notifikasi (reminder, late alert, absence alert) terkirim ke recipient yang benar (participant atau supervisor sesuai jenis notif)',
    '',
    'FIX BUG: Pastikan semua 3 notif terkirim, tidak hanya 2'
]);

uatData.push([
    no++,
    'NOTIFICATIONS',
    'Correct Supervisor Recipient',
    'Notifikasi terkirim ke supervisor yang benar',
    '1. Participant A dibimbing oleh Supervisor X\n2. Participant A terlambat atau tidak absen\n3. Cek Telegram Supervisor X (bukan supervisor lain)',
    'Notifikasi hanya terkirim ke Supervisor X yang membimbing Participant A, tidak ke supervisor lain',
    '',
    ''
]);

// ========== CRON JOBS ==========
uatData.push([
    no++,
    'CRON',
    'Local Cron Script',
    'Jalankan cron jobs lokal',
    '1. Buka terminal\n2. Jalankan: node scripts/local-cron.js\n3. Verifikasi output log',
    'Cron job berjalan dan menampilkan log eksekusi di console',
    '',
    ''
]);

uatData.push([
    no++,
    'CRON',
    'Attendance Reminder Cron',
    'Cron untuk reminder absensi',
    '1. Verifikasi konfigurasi jadwal cron (misal cron expression "0 8 * * *" untuk jam 8 pagi)\n2. Tunggu jadwal atau trigger manual\n3. Cek log dan Telegram',
    'Reminder terkirim ke semua participant aktif pada jadwal yang ditentukan',
    '',
    ''
]);

uatData.push([
    no++,
    'CRON',
    'General Reminders Cron',
    'Cron untuk reminder umum lainnya',
    '1. Trigger endpoint /api/cron/reminders\n2. Cek log dan notifikasi',
    'Semua reminder terjadwal terkirim sesuai konfigurasi',
    '',
    ''
]);

uatData.push([
    no++,
    'CRON',
    'Cron Logs',
    'Monitoring log eksekusi cron',
    '1. Cek file log atau database cron_logs\n2. Lihat history eksekusi',
    'Tampil log dengan timestamp, status (success/failed), dan hasil/error message',
    '',
    ''
]);

uatData.push([
    no++,
    'CRON',
    'Error Handling',
    'Handle error saat cron gagal',
    '1. Simulasi error (misal Telegram bot offline atau API down)\n2. Jalankan cron\n3. Cek error log',
    'Error ter-log dengan detail, sistem tetap stabil dan cron berikutnya tetap bisa jalan',
    '',
    ''
]);

// ========== API ENDPOINTS ==========
uatData.push([
    no++,
    'API',
    'POST /api/auth/[...nextauth]',
    'Login via NextAuth',
    '1. POST request dengan {email, password} atau SSO callback\n2. Cek response',
    'Return session token dan user data jika sukses, error 401 jika gagal',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET /api/auth/protected',
    'Akses protected endpoint',
    '1. GET request dengan Authorization header (Bearer token)\n2. Cek response',
    '200 OK dengan data jika token valid, 401 Unauthorized jika tidak',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET/POST /api/admin/telegram-settings',
    'Get/Update Telegram settings',
    '1. GET untuk lihat config\n2. POST dengan {botToken, chatId} untuk update',
    'Bot config tersimpan atau ditampilkan sesuai method',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET/POST /api/arsip',
    'List/Upload dokumen arsip',
    '1. GET untuk list\n2. POST dengan {file, metadata} untuk upload',
    'Return list arsip atau upload success message',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET/DELETE /api/arsip/[id]',
    'Get/Delete dokumen by ID',
    '1. GET /api/arsip/123 untuk detail\n2. DELETE untuk hapus',
    'Return dokumen detail atau delete success',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'POST /api/cron/attendance-reminder',
    'Trigger attendance reminder',
    '1. POST /api/cron/attendance-reminder dengan payload {}\n2. Cek response dan Telegram',
    'Reminder terkirim ke semua participant aktif, return {success: true, sent: [count]}',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'POST /api/cron/reminders',
    'Trigger general reminders',
    '1. POST /api/cron/reminders\n2. Cek response',
    'Reminders terkirim, return success status',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET /api/dashboard/stats',
    'Get dashboard statistics',
    '1. GET /api/dashboard/stats?role=admin\n2. Cek response',
    'Return stats sesuai role: {totalUsers, totalUnits, totalParticipants, totalSupervisors, dll}',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'POST /api/notifications/telegram/send-attendance-alerts',
    'Kirim attendance alerts',
    '1. POST dengan {participantId, type: "late" | "absent"}\n2. Cek Telegram supervisor',
    'Alert terkirim ke supervisor yang membimbing participant tersebut',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET/POST /api/notifications/templates',
    'List/Create notification templates',
    '1. GET untuk list\n2. POST dengan {title, content} untuk create',
    'Return list templates atau create success',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET/PUT/DELETE /api/notifications/templates/[id]',
    'CRUD template by ID',
    '1. GET untuk detail\n2. PUT untuk update\n3. DELETE untuk hapus',
    'Template detail ditampilkan/diupdate/dihapus sesuai method',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET /api/profile/overview',
    'Get user profile',
    '1. GET /api/profile/overview (user dari session)\n2. Cek response',
    'Return user profile data lengkap: {id, name, email, role, telegramId, dll}',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET/POST /api/units',
    'List/Create units',
    '1. GET untuk list\n2. POST dengan {name, description}',
    'Return units list atau create success dengan unit ID',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET/PUT/DELETE /api/units/[id]',
    'CRUD unit by ID',
    '1. GET /api/units/123\n2. PUT dengan {name, description}\n3. DELETE (soft delete)',
    'Unit detail/update/soft delete success',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'POST /api/units/[id]/restore',
    'Restore deleted unit',
    '1. POST /api/units/123/restore',
    'Unit di-restore ke status aktif, return {success: true}',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'DELETE /api/units/[id]/permanent',
    'Permanent delete unit',
    '1. DELETE /api/units/123/permanent',
    'Unit dihapus permanen dari database',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET /api/units/deleted',
    'List deleted units',
    '1. GET /api/units/deleted',
    'Return list semua units yang di-soft delete',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'POST /api/units/bulk-restore',
    'Bulk restore units',
    '1. POST dengan {ids: [1, 2, 3]}',
    'Semua units di-restore, return {success: true, restored: 3}',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'DELETE /api/units/bulk-permanent',
    'Bulk permanent delete units',
    '1. DELETE dengan {ids: [1, 2, 3]}',
    'Semua units dihapus permanen',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET/POST /api/users',
    'List/Create users',
    '1. GET untuk list users\n2. POST dengan {name, email, role, password} untuk create\nNote: password=null untuk Supervisor/Participant (SSO only)',
    'Return users list atau create success. Password di-hash untuk Admin, null untuk SSO users',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET/PUT/DELETE /api/users/[id]',
    'CRUD user by ID',
    '1. GET /api/users/123\n2. PUT untuk update\n3. DELETE untuk soft delete',
    'User detail/update/soft delete success',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'POST /api/users/[id]/restore',
    'Restore deleted user',
    '1. POST /api/users/123/restore',
    'User di-restore ke status aktif',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'DELETE /api/users/[id]/permanent',
    'Permanent delete user',
    '1. DELETE /api/users/123/permanent',
    'User dihapus permanen',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'GET /api/users/deleted',
    'List deleted users',
    '1. GET /api/users/deleted',
    'Return list users yang di-soft delete',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'POST /api/users/bulk-restore',
    'Bulk restore users',
    '1. POST dengan {ids: [1, 2, 3]}',
    'Semua users di-restore',
    '',
    ''
]);

uatData.push([
    no++,
    'API',
    'DELETE /api/users/bulk-permanent',
    'Bulk permanent delete users',
    '1. DELETE dengan {ids: [1, 2, 3]}',
    'Semua users dihapus permanen',
    '',
    ''
]);

// ========== UI/UX & PERFORMANCE ==========
uatData.push([
    no++,
    'UI/UX',
    'Responsive Design',
    'Test responsiveness di berbagai device',
    '1. Buka aplikasi di desktop (1920x1080)\n2. Buka di tablet (768x1024)\n3. Buka di mobile (375x667)\n4. Cek semua halaman',
    'Layout menyesuaikan dengan baik di semua ukuran layar, tidak ada overflow atau element tertutup',
    '',
    ''
]);

uatData.push([
    no++,
    'UI/UX',
    'Loading States',
    'Verifikasi loading indicator',
    '1. Trigger action yang membutuhkan waktu (fetch data, submit form)\n2. Lihat loading indicator (spinner, skeleton, dll)',
    'Loading state tampil saat proses berjalan, hilang saat selesai',
    '',
    ''
]);

uatData.push([
    no++,
    'UI/UX',
    'Error Messages',
    'User-friendly error messages',
    '1. Trigger error (misal submit form dengan data invalid, network error)\n2. Lihat error message',
    'Error message jelas, informatif, dan membantu user understand apa yang salah',
    '',
    ''
]);

uatData.push([
    no++,
    'UI/UX',
    'Success Notifications',
    'Success feedback untuk user actions',
    '1. Submit form berhasil\n2. Delete/Update data berhasil\n3. Lihat success notification (toast, alert)',
    'Success message tampil dengan jelas (toast/snackbar) dan auto-dismiss setelah beberapa detik',
    '',
    ''
]);

uatData.push([
    no++,
    'PERFORMANCE',
    'Page Load Time',
    'Waktu load halaman',
    '1. Buka berbagai halaman (dashboard, management data, monitoring)\n2. Ukur waktu load (Chrome DevTools Network tab)\n3. Target: < 3 detik untuk first contentful paint',
    'Halaman load dalam waktu yang wajar (FCP < 3s, LCP < 4s)',
    '',
    ''
]);

uatData.push([
    no++,
    'PERFORMANCE',
    'API Response Time',
    'Waktu response API',
    '1. Call berbagai API endpoints\n2. Ukur response time\n3. Target: < 1 detik untuk GET, < 2 detik untuk POST dengan proses',
    'API respond cepat sesuai target',
    '',
    ''
]);

uatData.push([
    no++,
    'PERFORMANCE',
    'Large Data Handling',
    'Handle data besar dengan pagination',
    '1. Test dengan dataset besar (>100 records)\n2. Verifikasi pagination berfungsi\n3. Cek tidak ada lag saat navigasi',
    'Pagination mengatasi data besar dengan baik, UI tetap smooth',
    '',
    ''
]);

// ========== INTEGRATION ==========
uatData.push([
    no++,
    'INTEGRATION',
    'NextAuth Integration',
    'Integrasi NextAuth untuk authentication',
    '1. Test login flow\n2. Verifikasi session management\n3. Test logout dan session expiry',
    'NextAuth bekerja dengan baik: login, session persist, logout berfungsi',
    '',
    ''
]);

uatData.push([
    no++,
    'INTEGRATION',
    'Database (PostgreSQL)',
    'Operasi database',
    '1. Test CRUD operations\n2. Verifikasi data integrity\n3. Test transactions (misal bulk operations)',
    'Database operations berjalan lancar, data konsisten, tidak ada data corruption',
    '',
    ''
]);

uatData.push([
    no++,
    'INTEGRATION',
    'File Upload & Storage',
    'Upload dan simpan file',
    '1. Upload foto untuk absensi\n2. Upload dokumen arsip\n3. Upload file di form builder\n4. Verifikasi file tersimpan dan bisa diakses',
    'File upload sukses, tersimpan di storage (local/cloud), dan bisa di-retrieve kembali',
    '',
    ''
]);

uatData.push([
    no++,
    'INTEGRATION',
    'PDF Generation',
    'Generate PDF (sertifikat, laporan)',
    '1. Generate certificate PDF\n2. Generate acceptance letter\n3. Export report to PDF\n4. Verifikasi kualitas dan struktur PDF',
    'PDF ter-generate dengan kualitas baik, layout sesuai, dan bisa dibuka di berbagai PDF reader',
    '',
    ''
]);

uatData.push([
    no++,
    'INTEGRATION',
    'Excel Import/Export',
    'Import dan export Excel',
    '1. Bulk import participants dari Excel\n2. Export attendance report to Excel\n3. Verifikasi data accuracy',
    'Excel import/export berfungsi, data ter-parse dan ter-export dengan benar',
    '',
    ''
]);

// Selesai! Total test cases
console.log(`Total test cases: ${no - 1}`);

// Create workbook dan write ke file
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(uatData);

// Set column widths
ws['!cols'] = [
    { wch: 5 },   // No
    { wch: 25 },  // Modul/Fitur
    { wch: 25 },  // Sub-Fitur
    { wch: 35 },  // Skenario Pengujian
    { wch: 60 },  // Langkah-langkah Detail
    { wch: 50 },  // Hasil yang Diharapkan
    { wch: 15 },  // Status
    { wch: 25 }   // Catatan/Bug
];

// Set row heights
const rowHeights = [];
rowHeights[0] = { hpt: 30 };  // Title row
rowHeights[1] = { hpt: 20 };  // Subtitle
rowHeights[3] = { hpt: 25 };  // Header row
ws['!rows'] = rowHeights;

XLSX.utils.book_append_sheet(wb, ws, 'UAT_Puti');

// Save file
const path = require('path');
const outputPath = path.join(__dirname, '..', 'docs', 'UAT_Puti_Sistem_Magang_FINAL.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('\n✅ File UAT berhasil dibuat!');
console.log('📁 Lokasi:', outputPath);
console.log(`📊 Total Test Cases: ${no - 1}`);
console.log('\n📋 Breakdown by Category:');
console.log('- Authentication & Security: 7 test cases');
console.log('- Dashboard: 3 test cases');
console.log('- Profile Management: 3 test cases');
console.log('- Management Data - Users: 10 test cases');
console.log('- Management Data - Units: 6 test cases');
console.log('- Management Data - Templates & Forms: 6 test cases');
console.log('- Monitoring & Attendance: 12 test cases');
console.log('- Assessment: 7 test cases');
console.log('- Certificate & Documents: 11 test cases');
console.log('- System Settings: 7 test cases');
console.log('- Notifications: 11 test cases');
console.log('- Cron Jobs: 5 test cases');
console.log('- API Endpoints: 27 test cases');
console.log('- UI/UX & Performance: 7 test cases');
console.log('- Integration: 5 test cases');
console.log('\n🎯 Format sesuai dengan referensi UAT_Puti_ULTRA_COMPREHENSIVE.xlsx');
