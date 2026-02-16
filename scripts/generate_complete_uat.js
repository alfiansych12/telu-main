const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Data UAT Komprehensif untuk Sistem Manajemen Magang
const uatData = {
    // Sheet 1: Informasi Umum
    "Info": [
        ["DOKUMEN UAT (USER ACCEPTANCE TESTING)"],
        ["Sistem Manajemen Magang & Monitoring Peserta"],
        [""],
        ["Tanggal Pembuatan:", new Date().toLocaleDateString('id-ID')],
        ["Versi:", "2.0 - Complete"],
        ["Status:", "Updated dengan Fitur Terbaru"],
        [""],
        ["Deskripsi:", "Dokumen ini berisi seluruh skenario pengujian untuk sistem manajemen magang"],
        ["", "yang mencakup pendaftaran, monitoring, penilaian, dan pelaporan"],
    ],

    // Sheet 2: Modul Autentikasi & Keamanan
    "Auth & Security": [
        ["No", "Modul", "Fitur", "Skenario Pengujian", "Langkah-langkah", "Hasil yang Diharapkan", "Status", "Catatan"],
        [1, "Authentication", "Login", "Login dengan SSO valid", "1. Buka halaman login\n2. Klik tombol SSO\n3. Masukkan kredensial SSO yang valid", "User berhasil login dan diarahkan ke dashboard sesuai role", "", ""],
        [2, "Authentication", "Login", "Login dengan password manual (Admin)", "1. Buka halaman login\n2. Masukkan email admin\n3. Masukkan password yang benar\n4. Klik Login", "Admin berhasil login ke dashboard admin", "", ""],
        [3, "Authentication", "Login", "Login dengan kredensial salah", "1. Buka halaman login\n2. Masukkan kredensial yang salah\n3. Klik Login", "Muncul pesan error \"Invalid credentials\"", "", ""],
        [4, "Authentication", "Logout", "Logout dari sistem", "1. Login ke sistem\n2. Klik menu user di header\n3. Klik Logout", "User berhasil logout dan kembali ke halaman login", "", ""],
        [5, "Authentication", "Session Management", "Akses halaman tanpa login", "1. Buka URL dashboard tanpa login\n2. Coba akses halaman protected", "User diarahkan ke halaman login", "", ""],
        [6, "Authorization", "Role-Based Access", "Akses menu Admin sebagai Participant", "1. Login sebagai Participant\n2. Coba akses /admin atau /ManagementData", "Akses ditolak atau diarahkan ke dashboard sesuai role", "", ""],
        [7, "Authorization", "Role-Based Access", "Akses menu Supervisor", "1. Login sebagai Supervisor\n2. Verifikasi menu yang tersedia", "Hanya menu untuk supervisor yang tampil (monitoring, assessment)", "", ""],
    ],

    // Sheet 3: Dashboard & Profil
    "Dashboard & Profile": [
        ["No", "Modul", "Fitur", "Skenario Pengujian", "Langkah-langkah", "Hasil yang Diharapkan", "Status", "Catatan"],
        [1, "Dashboard Admin", "Statistik", "Tampil statistik keseluruhan", "1. Login sebagai Admin\n2. Buka dashboard admin", "Tampil card dengan total users, units, participants, supervisors", "", ""],
        [2, "Dashboard Admin", "Quick Actions", "Tombol Add User", "1. Di dashboard admin\n2. Klik tombol \"Add User\"", "Muncul dialog untuk menambah user baru", "", ""],
        [3, "Dashboard Admin", "Quick Actions", "Tombol Add Unit", "1. Di dashboard admin\n2. Klik tombol \"Add Unit\"", "Muncul dialog untuk menambah unit baru", "", ""],
        [4, "Dashboard Supervisor", "Daftar Peserta", "Tampil daftar peserta yang dibimbing", "1. Login sebagai Supervisor\n2. Buka dashboard supervisor", "Tampil tabel peserta yang di-assign ke supervisor tersebut", "", ""],
        [5, "Dashboard Supervisor", "Monitoring Cepat", "Lihat status absensi hari ini", "1. Di dashboard supervisor\n2. Lihat section monitoring", "Tampil ringkasan absensi peserta hari ini", "", ""],
        [6, "Dashboard Participant", "Info Magang", "Tampil info magang pribadi", "1. Login sebagai Participant\n2. Buka dashboard participant", "Tampil info periode magang, supervisor, unit, progress", "", ""],
        [7, "Dashboard Participant", "Absensi Hari Ini", "Lihat status absensi", "1. Di dashboard participant\n2. Cek section absensi", "Tampil status absensi (sudah/belum) dan tombol check-in/out", "", ""],
        [8, "Profile Admin", "View Profile", "Lihat profil admin", "1. Login sebagai Admin\n2. Klik menu Profile atau /Profileadmin", "Tampil data profil admin (nama, email, role, dll)", "", ""],
        [9, "Profile Admin", "Edit Profile", "Update data profil", "1. Di halaman profile admin\n2. Edit data (nama, telepon, dll)\n3. Klik Save", "Data profil berhasil diupdate", "", ""],
        [10, "Profile Admin", "Telegram ID", "Input Telegram ID", "1. Di halaman profile\n2. Masukkan Telegram Chat ID\n3. Klik Save", "Telegram ID tersimpan untuk notifikasi", "", ""],
        [11, "Profile Supervisor", "View Profile", "Lihat profil supervisor", "1. Login sebagai Supervisor\n2. Buka /Profilesuper", "Tampil data profil supervisor", "", ""],
        [12, "Profile Supervisor", "Edit Profile", "Update data & Telegram ID", "1. Di profile supervisor\n2. Edit data dan Telegram ID\n3. Save", "Data berhasil diupdate dan notifikasi akan dikirim ke Telegram ID tersebut", "", ""],
        [13, "Profile Participant", "View Profile", "Lihat profil participant", "1. Login sebagai Participant\n2. Buka /Profilepart", "Tampil data profil participant", "", ""],
        [14, "Profile Participant", "Edit Profile", "Update Telegram Username", "1. Di profile participant\n2. Input Telegram Chat ID\n3. Save", "Telegram ID tersimpan untuk menerima notifikasi", "", ""],
    ],

    // Sheet 4: Manajemen Data
    "Management Data": [
        ["No", "Modul", "Fitur", "Skenario Pengujian", "Langkah-langkah", "Hasil yang Diharapkan", "Status", "Catatan"],
        [1, "Users Management", "View Users List", "Lihat daftar semua users", "1. Login sebagai Admin\n2. Buka Management Data\n3. Pilih tab Users", "Tampil tabel users dengan filter role (Admin, Supervisor, Participant)", "", ""],
        [2, "Users Management", "Add User", "Tambah user baru (Admin)", "1. Di Management Data > Users\n2. Klik Add User\n3. Isi form (nama, email, role=Admin, password)\n4. Submit", "User admin baru berhasil ditambahkan dengan password", "", ""],
        [3, "Users Management", "Add User", "Tambah user SSO (Supervisor/Participant)", "1. Klik Add User\n2. Isi form dengan role Supervisor/Participant\n3. Password otomatis null (SSO only)\n4. Submit", "User berhasil ditambahkan dan hanya bisa login via SSO", "", ""],
        [4, "Users Management", "Edit User", "Edit data user", "1. Di tabel users, klik Edit\n2. Ubah data user\n3. Save", "Data user berhasil diupdate", "", ""],
        [5, "Users Management", "Delete User", "Soft delete user", "1. Di tabel users, klik Delete\n2. Konfirmasi delete", "User dipindah ke status deleted (soft delete)", "", ""],
        [6, "Users Management", "Deleted Users", "Lihat user yang dihapus", "1. Di Users Management\n2. Klik tab/tombol \"Deleted Users\"", "Tampil daftar user yang sudah di-soft delete", "", ""],
        [7, "Users Management", "Restore User", "Restore user yang dihapus", "1. Di Deleted Users\n2. Pilih user\n3. Klik Restore", "User dikembalikan ke status aktif", "", ""],
        [8, "Users Management", "Permanent Delete", "Hapus user permanen", "1. Di Deleted Users\n2. Pilih user\n3. Klik Permanent Delete", "User dihapus permanen dari database", "", ""],
        [9, "Users Management", "Bulk Operations", "Restore multiple users", "1. Di Deleted Users\n2. Select multiple users\n3. Klik Bulk Restore", "Semua user terpilih di-restore", "", ""],
        [10, "Users Management", "Bulk Operations", "Hapus permanen multiple users", "1. Di Deleted Users\n2. Select multiple users\n3. Klik Bulk Permanent Delete", "Semua user terpilih dihapus permanen", "", ""],
        [11, "Units Management", "View Units", "Lihat daftar unit kerja", "1. Di Management Data\n2. Pilih tab Units", "Tampil tabel units/divisi", "", ""],
        [12, "Units Management", "Add Unit", "Tambah unit baru", "1. Klik Add Unit\n2. Isi nama unit, deskripsi\n3. Submit", "Unit baru berhasil ditambahkan", "", ""],
        [13, "Units Management", "Edit Unit", "Edit data unit", "1. Di tabel units, klik Edit\n2. Ubah data\n3. Save", "Data unit berhasil diupdate", "", ""],
        [14, "Units Management", "Delete Unit", "Soft delete unit", "1. Klik Delete pada unit\n2. Konfirmasi", "Unit di-soft delete", "", ""],
        [15, "Units Management", "Deleted Units", "Lihat unit yang dihapus", "1. Klik tab Deleted Units", "Tampil daftar unit yang di-soft delete", "", ""],
        [16, "Units Management", "Restore/Permanent Delete", "Operasi pada deleted units", "1. Di Deleted Units\n2. Restore atau Permanent Delete\n3. Juga bisa bulk operation", "Unit di-restore atau dihapus permanen sesuai aksi", "", ""],
        [17, "Assessment Templates", "View Templates", "Lihat template penilaian", "1. Di Management Data\n2. Tab Assessment Templates", "Tampil daftar template penilaian (internal & eksternal)", "", ""],
        [18, "Assessment Templates", "Add Template", "Tambah template penilaian", "1. Klik Add Template\n2. Pilih tipe (Internal/External)\n3. Isi kriteria penilaian\n4. Submit", "Template baru berhasil dibuat", "", ""],
        [19, "Assessment Templates", "Edit Template", "Edit template penilaian", "1. Klik Edit pada template\n2. Ubah kriteria\n3. Save", "Template berhasil diupdate", "", ""],
        [20, "Assessment Templates", "Delete Template", "Hapus template", "1. Klik Delete\n2. Konfirmasi", "Template dihapus", "", ""],
        [21, "Application Forms", "View Form Templates", "Lihat template form pendaftaran", "1. Di Management Data\n2. Tab Form Templates", "Tampil daftar form template", "", ""],
        [22, "Application Forms", "Create Form", "Buat form pendaftaran baru", "1. Klik Create Form\n2. Gunakan form builder\n3. Tambah fields (text, select, file upload, dll)\n4. Save", "Form template baru berhasil dibuat", "", ""],
        [23, "Application Forms", "Form Builder", "Tambah field File Upload", "1. Dalam form builder\n2. Pilih tipe \"File Upload\"\n3. Set accepted file types\n4. Save", "Field file upload berhasil ditambahkan dengan validasi tipe file", "", ""],
        [24, "Application Forms", "Edit Form", "Edit form template", "1. Klik Edit pada form\n2. Ubah fields\n3. Save", "Form template berhasil diupdate", "", ""],
        [25, "Bulk Import", "Import Participants", "Import data peserta dari Excel", "1. Di Management Data\n2. Klik Import/Bulk Upload\n3. Upload file Excel dengan data peserta\n4. Submit", "Data peserta berhasil di-import ke database", "", ""],
        [26, "Bulk Import", "Template Integration", "Import dengan assessment template", "1. Excel berisi kolom \"Transcript External Institution\"\n2. Import data\n3. Template assessment dibuat otomatis", "Assessment template dibuat sesuai institusi eksternal", "", ""],
    ],

    // Sheet 5: Monitoring & Absensi
    "Monitoring & Attendance": [
        ["No", "Modul", "Fitur", "Skenario Pengujian", "Langkah-langkah", "Hasil yang Diharapkan", "Status", "Catatan"],
        [1, "Attendance Monitoring", "View Attendance List", "Lihat daftar absensi (Supervisor)", "1. Login sebagai Supervisor\n2. Buka /Monitoringsuper", "Tampil tabel absensi peserta yang dibimbing", "", ""],
        [2, "Attendance Monitoring", "Pagination", "Navigasi antar halaman", "1. Di tabel Monitoring Attendance\n2. Gunakan tombol previous/next\n3. Max 5 records per halaman", "Pagination berfungsi dengan animasi slide (framer-motion)", "", ""],
        [3, "Attendance Monitoring", "Filter by Date", "Filter absensi berdasarkan tanggal", "1. Di halaman monitoring\n2. Pilih date range\n3. Klik Filter", "Tampil data absensi sesuai tanggal yang dipilih", "", ""],
        [4, "Attendance Monitoring", "Filter by Participant", "Filter berdasarkan peserta", "1. Pilih nama peserta dari dropdown\n2. Klik Filter", "Tampil hanya absensi peserta tersebut", "", ""],
        [5, "Attendance Monitoring", "View Detail", "Lihat detail absensi", "1. Klik pada row absensi\n2. Lihat detail", "Tampil info lengkap: waktu check-in/out, lokasi, foto, catatan", "", ""],
        [6, "Check-in/Check-out", "Check-in (Participant)", "Absen masuk", "1. Login sebagai Participant\n2. Klik tombol Check-in\n3. Izinkan akses lokasi\n4. Ambil foto\n5. Submit", "Absensi masuk tercatat dengan timestamp, lokasi GPS, dan foto", "", ""],
        [7, "Check-in/Check-out", "Check-out (Participant)", "Absen pulang", "1. Setelah check-in\n2. Klik tombol Check-out\n3. Ambil foto\n4. Isi catatan (optional)\n5. Submit", "Absensi keluar tercatat", "", ""],
        [8, "Check-in/Check-out", "Validasi Lokasi", "Check-in di luar radius", "1. Coba check-in di luar radius yang ditentukan", "Muncul warning atau error \"Di luar jangkauan lokasi\"", "", ""],
        [9, "Check-in/Check-out", "Validasi Waktu", "Check-in di luar jam kerja", "1. Coba check-in sebelum/sesudah jam kerja", "Muncul warning atau status \"Terlambat\"/\"Di luar jam kerja\"", "", ""],
        [10, "Attendance Report", "Generate Report", "Buat laporan absensi", "1. Login sebagai Admin/Supervisor\n2. Buka /AttendanceReport\n3. Pilih periode dan peserta\n4. Klik Generate", "Tampil laporan absensi dalam bentuk tabel/grafik", "", ""],
        [11, "Attendance Report", "Export Report", "Export ke Excel/PDF", "1. Di halaman report\n2. Klik tombol Export\n3. Pilih format (Excel/PDF)", "File report ter-download sesuai format", "", ""],
        [12, "Reports Monitoring", "View All Reports", "Lihat laporan keseluruhan", "1. Buka /ReportsMonitoring\n2. Lihat berbagai jenis laporan", "Tampil dashboard dengan berbagai metrik dan grafik", "", ""],
    ],

    // Sheet 6: Penilaian (Assessment)
    "Assessment": [
        ["No", "Modul", "Fitur", "Skenario Pengujian", "Langkah-langkah", "Hasil yang Diharapkan", "Status", "Catatan"],
        [1, "Assessment", "View Participant List", "Lihat daftar peserta untuk dinilai", "1. Login sebagai Supervisor\n2. Buka /assessmentsuper", "Tampil daftar peserta yang dibimbing", "", ""],
        [2, "Assessment", "Open Assessment Form", "Buka form penilaian", "1. Klik tombol Assess pada peserta\n2. Pilih template assessment", "Muncul dialog dengan dropdown template dan form penilaian", "", ""],
        [3, "Assessment", "Select Template", "Pilih template manual", "1. Di dialog assessment\n2. Buka dropdown template\n3. Pilih template (Internal/External)", "Template terpilih dan form penilaian sesuai template tampil", "", ""],
        [4, "Assessment", "Fill Internal Assessment", "Isi penilaian internal", "1. Pilih template Internal\n2. Isi nilai untuk setiap kriteria\n3. Submit", "Nilai internal tersimpan", "", ""],
        [5, "Assessment", "Fill External Assessment", "Isi penilaian eksternal (institusi)", "1. Pilih template External\n2. Isi nilai kriteria eksternal\n3. Submit", "Nilai eksternal tersimpan", "", ""],
        [6, "Assessment", "Calculate Score", "Hitung nilai rata-rata", "1. Setelah submit assessment\n2. Sistem menghitung otomatis", "Nilai rata-rata internal dan eksternal dihitung dengan benar", "", ""],
        [7, "Assessment", "View Assessment History", "Lihat riwayat penilaian", "1. Di halaman assessment\n2. Klik View History pada peserta", "Tampil semua penilaian yang pernah diberikan (internal & eksternal)", "", ""],
        [8, "Assessment", "Edit Assessment", "Edit penilaian yang sudah ada", "1. Di history, klik Edit\n2. Ubah nilai\n3. Save", "Nilai berhasil diupdate", "", ""],
    ],

    // Sheet 7: Sertifikat & Dokumen
    "Certificate & Documents": [
        ["No", "Modul", "Fitur", "Skenario Pengujian", "Langkah-langkah", "Hasil yang Diharapkan", "Status", "Catatan"],
        [1, "Certificate Generation", "Generate Certificate", "Buat sertifikat peserta", "1. Login sebagai Admin/Supervisor\n2. Pilih peserta yang sudah selesai\n3. Klik Generate Certificate", "Sertifikat PDF ter-generate dengan data peserta dan nilai", "", ""],
        [2, "Certificate PDF", "Halaman 1: Sertifikat", "Cek halaman pertama", "1. Buka PDF sertifikat\n2. Lihat halaman 1", "Tampil sertifikat utama dengan nama, period, unit", "", ""],
        [3, "Certificate PDF", "Halaman 2: Transkrip Internal", "Cek transkrip internal", "1. Lihat halaman 2 PDF", "Tampil detail penilaian internal dengan template yang digunakan dan nilai rata-rata", "", ""],
        [4, "Certificate PDF", "Halaman 3: Transkrip Eksternal", "Cek transkrip eksternal", "1. Lihat halaman 3 PDF", "Tampil penilaian eksternal dengan background plain dan logo Telkom", "", ""],
        [5, "Certificate PDF", "Signature Display", "Verifikasi tanda tangan", "1. Cek bagian bawah sertifikat", "Tampil tanda tangan digital atau nama pemberi sertifikat", "", ""],
        [6, "Certificate PDF", "Score Calculation", "Validasi perhitungan nilai", "1. Bandingkan nilai di PDF dengan database\n2. Cek rumus perhitungan", "Nilai final sesuai dengan custom internal & external assessment", "", ""],
        [7, "Certificate Scanner", "Scan Certificate QR", "Scan QR code sertifikat", "1. Buka /CertificateScanner\n2. Scan QR code dari sertifikat\n3. Atau input kode manual", "Tampil data sertifikat yang valid", "", ""],
        [8, "Certificate Scanner", "Verify Certificate", "Validasi keaslian sertifikat", "1. Setelah scan\n2. Lihat status verifikasi", "Tampil status \"Valid\" atau \"Invalid\" dan detail sertifikat", "", ""],
        [9, "Arsip (Archive)", "View Archive List", "Lihat daftar dokumen arsip", "1. Login sebagai Admin\n2. Buka /arsip", "Tampil daftar dokumen institusi yang diarsipkan", "", ""],
        [10, "Arsip", "Upload Document", "Upload dokumen baru", "1. Di halaman Arsip\n2. Klik Upload\n3. Pilih file\n4. Isi metadata (judul, kategori)\n5. Submit", "Dokumen berhasil diupload dan muncul di list", "", ""],
        [11, "Arsip", "View Document", "Buka dokumen", "1. Klik View pada dokumen\n2. PDF/file terbuka", "Dokumen terbuka di tab yang sama (window.location.href)", "", ""],
        [12, "Arsip", "Download Document", "Download file arsip", "1. Klik Download\n2. File ter-download", "File berhasil di-download", "", ""],
        [13, "Arsip", "Delete Document", "Hapus dokumen dari arsip", "1. Klik Delete\n2. Konfirmasi", "Dokumen dihapus dari sistem", "", ""],
        [14, "Acceptance Letter", "Generate Letter", "Buat surat penerimaan", "1. Pilih peserta\n2. Klik Generate Acceptance Letter\n3. Data auto-fill dari profile", "PDF surat penerimaan ter-generate dengan template resmi", "", ""],
        [15, "Acceptance Letter", "Letter Content", "Validasi isi surat", "1. Buka PDF surat\n2. Cek konten", "Tampil nama peserta, periode, unit, tanggal, dan tanda tangan", "", ""],
    ],

    // Sheet 8: Pengaturan Sistem
    "System Settings": [
        ["No", "Modul", "Fitur", "Skenario Pengujian", "Langkah-langkah", "Hasil yang Diharapkan", "Status", "Catatan"],
        [1, "Map Settings", "View Settings Page", "Buka halaman pengaturan peta", "1. Login sebagai Admin\n2. Buka /MapSettings", "Tampil halaman dengan peta di atas (full width), 3 kolom di bawah", "", ""],
        [2, "Map Settings", "Map Display", "Lihat peta lokasi", "1. Di halaman Map Settings\n2. Lihat section peta", "Tampil peta dengan marker lokasi kantor/institusi", "", ""],
        [3, "Map Settings", "Set Location", "Atur lokasi pusat", "1. Klik pada peta atau input koordinat\n2. Set marker\n3. Save", "Lokasi pusat berhasil diatur", "", ""],
        [4, "Map Settings", "Attendance Time Rules", "Atur jam kerja (Kolom 1)", "1. Di kolom pertama\n2. Set jam check-in dan check-out\n3. Set toleransi keterlambatan\n4. Save", "Aturan waktu absensi tersimpan", "", ""],
        [5, "Map Settings", "Leave Management Rules", "Atur aturan cuti (Kolom 2)", "1. Di kolom kedua\n2. Set kuota cuti, approval flow\n3. Save", "Aturan cuti/izin tersimpan", "", ""],
        [6, "Map Settings", "Location & Precision", "Atur jari-jari lokasi (Kolom 3)", "1. Di kolom ketiga\n2. Set radius dalam meter\n3. Set precision GPS\n4. Klik Save button", "Pengaturan lokasi dan akurasi tersimpan", "", ""],
        [7, "Map Settings", "Save All Settings", "Simpan semua pengaturan", "1. Setelah edit semua setting\n2. Klik tombol Save (di kolom 3)", "Semua pengaturan peta tersimpan", "", ""],
        [8, "Units Management Page", "View Units", "Halaman khusus units", "1. Buka /UnitsManagement", "Tampil daftar units dengan opsi CRUD", "", ""],
        [9, "Units Settings", "Configure Unit", "Pengaturan per unit", "1. Di Units Management\n2. Klik Settings pada unit\n3. Buka /UnitsManagement/settings/[id]", "Tampil halaman pengaturan khusus unit (lokasi, aturan)", "", ""],
    ],

    // Sheet 9: Notifikasi
    "Notifications": [
        ["No", "Modul", "Fitur", "Skenario Pengujian", "Langkah-langkah", "Hasil yang Diharapkan", "Status", "Catatan"],
        [1, "Telegram Notifications", "Setup Bot", "Konfigurasi Telegram Bot", "1. Login sebagai Admin\n2. Buka /admin/telegram-notifications\n3. Input Bot Token\n4. Save", "Bot token tersimpan dan bot aktif", "", ""],
        [2, "Telegram Notifications", "Test Connection", "Test koneksi bot", "1. Di halaman telegram settings\n2. Klik Test Connection", "Muncul pesan sukses jika bot terhubung", "", ""],
        [3, "Notification Templates", "View Templates", "Lihat template notifikasi", "1. Buka /admin/notification-templates", "Tampil daftar template pesan (attendance reminder, approval, dll)", "", ""],
        [4, "Notification Templates", "Create Template", "Buat template baru", "1. Klik Create Template\n2. Isi judul, isi pesan (dengan placeholder)\n3. Save", "Template baru berhasil dibuat", "", ""],
        [5, "Notification Templates", "Edit Template", "Edit template", "1. Klik Edit pada template\n2. Ubah konten\n3. Save", "Template berhasil diupdate", "", ""],
        [6, "Notification Templates", "Delete Template", "Hapus template", "1. Klik Delete\n2. Konfirmasi", "Template dihapus", "", ""],
        [7, "Send Notifications", "Manual Send", "Kirim notifikasi manual", "1. Di halaman notifications\n2. Pilih penerima (Supervisor/Participant)\n3. Pilih template\n4. Klik Send", "Notifikasi terkirim ke Telegram ID yang terdaftar", "", ""],
        [8, "Attendance Reminder", "Auto Reminder", "Reminder otomatis absensi", "1. Tunggu jadwal cron (pagi hari)\n2. Cek Telegram", "Peserta menerima reminder untuk absen di Telegram", "", ""],
        [9, "Attendance Alerts", "Late Alert to Supervisor", "Notif peserta terlambat", "1. Peserta check-in terlambat\n2. Cek Telegram supervisor", "Supervisor menerima alert bahwa pesertanya terlambat", "", ""],
        [10, "Attendance Alerts", "Absence Alert", "Notif tidak absen", "1. Peserta tidak check-in sampai batas waktu\n2. Cron job running\n3. Cek Telegram supervisor", "Supervisor menerima notif peserta tidak hadir", "", ""],
        [11, "Notification Recipients", "Custom Recipients", "Notifikasi ke Telegram ID custom", "1. Supervisor/Participant set Telegram ID di profile\n2. Trigger notifikasi\n3. Cek Telegram", "Notifikasi diterima di Telegram ID yang diinput user", "", ""],
        [12, "Notification Logic", "Multiple Notifications", "3 jenis notifikasi otomatis", "1. Setup reminder cron\n2. Setup attendance alert\n3. Setup absence alert\n4. Test masing-masing", "Semua 3 tipe notifikasi terkirim dengan benar sesuai kondisi", "", "Pastikan semua notif terkirim"],
    ],

    // Sheet 10: Cron Jobs & Automation
    "Cron & Automation": [
        ["No", "Modul", "Fitur", "Skenario Pengujian", "Langkah-langkah", "Hasil yang Diharapkan", "Status", "Catatan"],
        [1, "Cron Setup", "Local Cron Script", "Jalankan local cron", "1. Buka terminal\n2. Jalankan: node scripts/local-cron.js\n3. Verifikasi output", "Cron job berjalan dan log tampil di console", "", ""],
        [2, "Attendance Reminder Cron", "Schedule Check", "Cek jadwal reminder", "1. Verifikasi konfigurasi cron\n2. Lihat waktu eksekusi", "Cron berjalan sesuai jadwal (misal setiap pagi jam 8)", "", ""],
        [3, "Attendance Reminder Cron", "Execute Reminder", "Eksekusi reminder", "1. Trigger cron atau tunggu jadwal\n2. Cek log\n3. Cek Telegram peserta", "Reminder terkirim ke semua peserta aktif yang belum absen", "", ""],
        [4, "Reminders Cron", "General Reminders", "Reminder umum lainnya", "1. Trigger /api/cron/reminders\n2. Cek berbagai tipe reminder", "Semua reminder terjadwal terkirim", "", ""],
        [5, "Cron Monitoring", "View Cron Logs", "Lihat log eksekusi cron", "1. Cek file log atau database\n2. Lihat history eksekusi", "Tampil log dengan timestamp, status, dan hasil setiap cron job", "", ""],
        [6, "Error Handling", "Cron Failure", "Handle cron error", "1. Simulasi error (misal Telegram bot offline)\n2. Jalankan cron\n3. Cek error log", "Error ter-log dengan detail, sistem tetap stabil", "", ""],
    ],

    // Sheet 11: API Endpoints
    "API Testing": [
        ["No", "Endpoint", "Method", "Skenario Pengujian", "Payload", "Expected Response", "Status", "Catatan"],
        [1, "/api/auth/[...nextauth]", "POST", "Login via NextAuth", "{email, password} atau SSO callback", "Session token & user data", "", ""],
        [2, "/api/auth/protected", "GET", "Akses protected route", "Authorization header dengan token", "200 OK jika valid, 401 jika tidak", "", ""],
        [3, "/api/admin/telegram-settings", "GET/POST", "Get/Update Telegram settings", "{botToken, chatId}", "Bot config tersimpan/ditampilkan", "", ""],
        [4, "/api/arsip", "GET/POST", "List/Upload dokumen arsip", "{file, metadata} untuk POST", "List arsip atau upload success", "", ""],
        [5, "/api/arsip/[id]", "GET/DELETE", "Get/Delete dokumen by ID", "ID dalam URL", "Dokumen detail atau delete success", "", ""],
        [6, "/api/cron/attendance-reminder", "POST", "Trigger attendance reminder", "{}", "Reminder terkirim ke peserta aktif", "", ""],
        [7, "/api/cron/reminders", "POST", "Trigger general reminders", "{}", "Reminders terkirim", "", ""],
        [8, "/api/dashboard/stats", "GET", "Get dashboard statistics", "Query params: role", "Stats sesuai role (admin/supervisor/participant)", "", ""],
        [9, "/api/login", "POST", "Manual login (legacy?)", "{email, password}", "Token atau error message", "", ""],
        [10, "/api/notifications/telegram/send-attendance-alerts", "POST", "Kirim alert absensi", "{participantId, type: 'late'|'absent'}", "Alert terkirim ke supervisor", "", ""],
        [11, "/api/notifications/templates", "GET/POST", "List/Create template notif", "{title, content} untuk POST", "List templates atau create success", "", ""],
        [12, "/api/notifications/templates/[id]", "GET/PUT/DELETE", "CRUD template by ID", "{title, content} untuk PUT", "Template detail/update/delete success", "", ""],
        [13, "/api/profile/overview", "GET", "Get user profile", "User ID dari session", "User profile data lengkap", "", ""],
        [14, "/api/units", "GET/POST", "List/Create units", "{name, description} untuk POST", "Units list atau create success", "", ""],
        [15, "/api/units/[id]", "GET/PUT/DELETE", "CRUD unit by ID", "{name, description} untuk PUT", "Unit detail/update/delete (soft)", "", ""],
        [16, "/api/units/[id]/restore", "POST", "Restore deleted unit", "{}", "Unit di-restore ke status aktif", "", ""],
        [17, "/api/units/[id]/permanent", "DELETE", "Permanent delete unit", "{}", "Unit dihapus permanen", "", ""],
        [18, "/api/units/deleted", "GET", "List deleted units", "", "List semua units yang di-soft delete", "", ""],
        [19, "/api/units/bulk-restore", "POST", "Bulk restore units", "{ids: []}", "Semua units di-restore", "", ""],
        [20, "/api/units/bulk-permanent", "DELETE", "Bulk permanent delete", "{ids: []}", "Semua units dihapus permanen", "", ""],
        [21, "/api/users", "GET/POST", "List/Create users", "{name, email, role, password} untuk POST", "Users list atau create success", "", "Password null untuk SSO"],
        [22, "/api/users/[id]", "GET/PUT/DELETE", "CRUD user by ID", "{...userData} untuk PUT", "User detail/update/delete (soft)", "", ""],
        [23, "/api/users/[id]/restore", "POST", "Restore deleted user", "{}", "User di-restore", "", ""],
        [24, "/api/users/[id]/permanent", "DELETE", "Permanent delete user", "{}", "User dihapus permanen", "", ""],
        [25, "/api/users/deleted", "GET", "List deleted users", "", "List semua users yang di-soft delete", "", ""],
        [26, "/api/users/bulk-restore", "POST", "Bulk restore users", "{ids: []}", "Semua users di-restore", "", ""],
        [27, "/api/users/bulk-permanent", "DELETE", "Bulk permanent delete users", "{ids: []}", "Semua users dihapus permanen", "", ""],
    ],

    // Sheet 12: Checklist Final Testing
    "Final Checklist": [
        ["No", "Kategori", "Item Pengujian", "Status", "Catatan"],
        [1, "Keamanan", "Password policy untuk Admin", "", ""],
        [2, "Keamanan", "SSO-only untuk Supervisor & Participant", "", ""],
        [3, "Keamanan", "Role-based access control", "", ""],
        [4, "Keamanan", "Session management & logout", "", ""],
        [5, "Fungsional", "Semua CRUD operations (Users, Units)", "", ""],
        [6, "Fungsional", "Soft delete & restore functionality", "", ""],
        [7, "Fungsional", "Bulk operations (restore, delete)", "", ""],
        [8, "Fungsional", "Form builder dengan file upload", "", ""],
        [9, "Fungsional", "Bulk import dari Excel", "", ""],
        [10, "Fungsional", "Assessment template integration", "", ""],
        [11, "Monitoring", "Attendance check-in/out dengan GPS", "", ""],
        [12, "Monitoring", "Location validation (radius)", "", ""],
        [13, "Monitoring", "Time validation (jam kerja)", "", ""],
        [14, "Monitoring", "Pagination dengan animasi", "", ""],
        [15, "Penilaian", "Manual template selection", "", ""],
        [16, "Penilaian", "Internal & external assessment", "", ""],
        [17, "Penilaian", "Score calculation accuracy", "", ""],
        [18, "Dokumen", "Certificate PDF generation (3 halaman)", "", ""],
        [19, "Dokumen", "Signature display", "", ""],
        [20, "Dokumen", "Certificate scanner & verification", "", ""],
        [21, "Dokumen", "Acceptance letter generation", "", ""],
        [22, "Dokumen", "Arsip document management", "", ""],
        [23, "Notifikasi", "Telegram bot integration", "", ""],
        [24, "Notifikasi", "Custom Telegram ID per user", "", ""],
        [25, "Notifikasi", "Attendance reminder otomatis", "", ""],
        [26, "Notifikasi", "Late attendance alert", "", ""],
        [27, "Notifikasi", "Absence alert", "", ""],
        [28, "Notifikasi", "Notifikasi terkirim ke supervisor yang benar", "", ""],
        [29, "Pengaturan", "Map settings (3 kolom layout)", "", ""],
        [30, "Pengaturan", "Attendance time rules", "", ""],
        [31, "Pengaturan", "Leave management rules", "", ""],
        [32, "Pengaturan", "Location & precision settings", "", ""],
        [33, "Cron Jobs", "Local cron script running", "", ""],
        [34, "Cron Jobs", "Attendance reminder cron", "", ""],
        [35, "Cron Jobs", "General reminders cron", "", ""],
        [36, "Cron Jobs", "Error handling & logging", "", ""],
        [37, "UI/UX", "Responsive design", "", ""],
        [38, "UI/UX", "Loading states", "", ""],
        [39, "UI/UX", "Error messages", "", ""],
        [40, "UI/UX", "Success notifications", "", ""],
        [41, "Performance", "Page load time", "", ""],
        [42, "Performance", "API response time", "", ""],
        [43, "Performance", "Large data handling (pagination)", "", ""],
        [44, "Integrasi", "NextAuth integration", "", ""],
        [45, "Integrasi", "Database operations (PostgreSQL)", "", ""],
        [46, "Integrasi", "File upload & storage", "", ""],
        [47, "Integrasi", "PDF generation", "", ""],
        [48, "Integrasi", "Excel import/export", "", ""],
    ],
};

// Generate Excel
const wb = XLSX.utils.book_new();

// Add each sheet
Object.keys(uatData).forEach(sheetName => {
    const ws = XLSX.utils.aoa_to_sheet(uatData[sheetName]);

    // Set column widths
    const colWidths = [
        { wch: 5 },   // No
        { wch: 20 },  // Modul/Kategori
        { wch: 25 },  // Fitur
        { wch: 30 },  // Skenario
        { wch: 50 },  // Langkah/Payload
        { wch: 40 },  // Expected Result
        { wch: 12 },  // Status
        { wch: 20 }   // Catatan
    ];
    ws['!cols'] = colWidths;

    // Set row heights for header
    ws['!rows'] = [{ hpt: 25 }];

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
});

// Save file
const outputPath = path.join(__dirname, '..', 'docs', 'UAT_LENGKAP_2024.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ File UAT berhasil dibuat!');
console.log('📁 Lokasi:', outputPath);
console.log('📊 Total Sheets:', Object.keys(uatData).length);
console.log('\nRingkasan:');
console.log('- Sheet 1: Info Umum');
console.log('- Sheet 2: Authentication & Security (7 test cases)');
console.log('- Sheet 3: Dashboard & Profile (14 test cases)');
console.log('- Sheet 4: Management Data (26 test cases)');
console.log('- Sheet 5: Monitoring & Attendance (12 test cases)');
console.log('- Sheet 6: Assessment (8 test cases)');
console.log('- Sheet 7: Certificate & Documents (15 test cases)');
console.log('- Sheet 8: System Settings (9 test cases)');
console.log('- Sheet 9: Notifications (12 test cases)');
console.log('- Sheet 10: Cron & Automation (6 test cases)');
console.log('- Sheet 11: API Testing (27 endpoints)');
console.log('- Sheet 12: Final Checklist (48 items)');
console.log('\n🎯 Total test cases: 136+');
