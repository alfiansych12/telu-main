const XLSX = require('xlsx');
const path = require('path');

const data = [
    ['No', 'Modul/Menu', 'Test Case', 'Langkah Testing', 'Expected Result', 'Status', 'Actual Result', 'Screenshot', 'Catatan'],
    // 1. AUTHENTICATION
    ['1', 'Login', 'Login dengan kredensial valid', '1. Buka URL aplikasi\n2. Input email valid\n3. Input password valid\n4. Klik tombol Login', 'User berhasil login dan masuk ke dashboard sesuai role', 'Done', 'Done', '', ''],
    ['2', 'Login', 'Login dengan kredensial invalid', '1. Buka URL aplikasi\n2. Input email/password salah\n3. Klik tombol Login', 'Muncul pesan error "Invalid credentials"', 'Done', 'Done', '', ''],
    ['3', 'Login', 'Logout', '1. Klik menu/tombol Logout\n2. Konfirmasi logout', 'User berhasil logout dan kembali ke halaman login', 'Done', 'Done', '', ''],

    // 2. ADMIN - MANAGEMENT DATA
    ['4', 'Admin - Management User', 'Create User Baru (Manual)', '1. Masuk ke menu Management Data\n2. Klik "Add User"\n3. Isi Nama, Email, Role, Unit\n4. Klik Simpan', 'Data user berhasil disimpan dan muncul di tabel', 'Done', 'Done', '', ''],
    ['5', 'Admin - Management User', 'Bulk Import User Excel', '1. Klik menu Import\n2. Pilih file Excel template\n3. Klik Upload', 'Sistem berhasil mengimpor banyak user sekaligus tanpa error', 'Done', 'Done', '', ''],
    ['6', 'Admin - Management User', 'Edit Data & Role User', '1. Pilih user, klik Edit\n2. Ubah Role (misal: Participant -> Supervisor)\n3. Klik Simpan', 'Data role berhasil diperbarui secara real-time', 'Done', 'Done', '', ''],
    ['7', 'Admin - Management User', 'Set Internship Period', '1. Edit user Participant\n2. Atur tanggal Start Magang & End Magang\n3. Klik Simpan', 'Periode magang tercatat dan membatasi akses fitur absensi sesuai tanggal', 'Done', 'Done', '', ''],
    ['8', 'Admin - Management User', 'Delete User ke Recycle Bin', '1. Klik tombol Hapus pada user\n2. Konfirmasi', 'User hilang dari tabel utama dan pindah ke Recycle Bin', 'Done', 'Done', '', ''],
    ['9', 'Admin - Recycle Bin', 'Restore User dari Recycle Bin', '1. Buka Recycle Bin\n2. Klik Restore pada user\n3. Cek tabel utama', 'User kembali muncul di tabel utama', 'Done', 'Done', '', ''],
    ['10', 'Admin - Recycle Bin', 'Delete Permanent User', '1. Buka Recycle Bin\n2. Klik Delete Permanent\n3. Konfirmasi', 'Data user dihapus total dari database', 'Done', 'Done', '', ''],

    // 3. ADMIN - UNITS MANAGEMENT
    ['11', 'Admin - Units Management', 'Create Unit Baru', '1. Buka Units Management\n2. Klik Add Unit\n3. Isi nama unit & kapasitas\n4. Klik Simpan', 'Unit baru muncul dalam daftar', 'Done', 'Done', '', ''],
    ['12', 'Admin - Units Management', 'Assign Supervisor ke Unit', '1. Edit Unit\n2. Pilih Supervisor dari dropdown\n3. Simpan', 'Supervisor terpilih menjadi penanggung jawab unit tersebut', 'Done', 'Done', '', ''],
    ['13', 'Admin - Units Management', 'Monitor Kapasitas Unit', '1. Lihat kolom "Capacity"\n2. Bandingkan dengan jumlah "Participant"', 'Sistem menunjukkan warning jika unit sudah penuh', 'Done', 'Done', '', ''],

    // 4. ADMIN - MAP SETTINGS
    ['14', 'Admin - Map Settings', 'Set Geofencing Radius', '1. Masuk Map Settings\n2. Pilih lokasi\n3. Ubah Radius (misal 50 ke 100 meter)\n4. Klik Save', 'Radius pada peta berubah dan validasi absensi mengikuti aturan baru', 'Done', 'Done', '', ''],
    ['15', 'Admin - Map Settings', 'Tambah Multiple Check-in Points', '1. Klik Add Point pada peta\n2. Tentukan koordinat & nama lokasi\n3. Simpan', 'Sistem mendukung lebih dari satu lokasi valid untuk absensi', 'Done', 'Done', '', ''],

    // 5. PARTICIPANT - ATTENDANCE
    ['16', 'Participant - Attendance', 'Check-in (Sesuai Geofence)', '1. Masuk Dashboard\n2. Input Deskripsi Aktivitas\n3. Klik Check-in', 'Tombol berubah jadi Check-out dan status jadi "Present"', 'Done', 'Done', '', ''],
    ['17', 'Participant - Attendance', 'Check-in (Gagal: Luar Area)', '1. Coba Check-in saat berada jauh dari titik koordinat\n2. Klik tombol', 'Muncul error "You are outside the required radius"', 'Done', 'Done', '', ''],
    ['18', 'Participant - Attendance', 'Late Check-in Detection', '1. Lakukan Check-in melewati jam shift pagi\n2. Klik tombol', 'Status absensi otomatis tercatat sebagai "Late"', 'Done', 'Done', '', ''],
    ['19', 'Participant - Attendance', 'Check-out Harian', '1. Klik tombol Check-out di sore hari', 'Waktu pulang tercatat dan durasi kerja terhitung otomatis', 'Done', 'Done', '', ''],

    // 6. PARTICIPANT - REQUESTS
    ['20', 'Participant - Location Request', 'Submit Request Luar Kantor (WFA)', '1. Pilih menu Location Request\n2. Input alasan & koordinat baru\n3. Klik Submit', 'Request terkirim ke Supervisor dengan status "Pending"', 'Done', 'Done', '', ''],
    ['21', 'Participant - Leave Request', 'Submit Izin / Sakit', '1. Pilih Leave Request\n2. Isi Form & Upload Bukti (Foto Surat Dokter)\n3. Submit', 'Data tersimpan dan supervisor menerima notifikasi', 'Done', 'Done', '', ''],

    // 7. SUPERVISOR - MONITORING & APPROVAL
    ['22', 'Supervisor - Monitoring', 'Approve/Reject Leave Request', '1. Buka Pending Requests\n2. Pilih Request\n3. Klik Approve atau Reject dengan Catatan', 'Status request terupdate dan partisipan menerima notifikasi', 'Done', 'Done', '', ''],
    ['23', 'Supervisor - Monitoring', 'Approval Location Request', '1. Lihat detail koordinat yang diajukan\n2. Klik Approve', 'Partisipan bisa Check-in dari lokasi khusus tersebut', 'Done', 'Done', '', ''],
    ['24', 'Supervisor - Monitoring', 'Lihat Team Map View', '1. Masuk menu Monitoring\n2. Klik tab Map View', 'Peta menampilkan titik lokasi terakhir seluruh anggota tim', 'Done', 'Done', '', ''],

    // 8. SUPERVISOR - ASSESSMENT
    ['25', 'Supervisor - Assessment', 'Input Penilaian Kompetensi', '1. Cari Partisipan\n2. Input nilai Soft Skill, Hard Skill, & Attitude\n3. Simpan', 'Nilai tersimpan dan rata-rata terhitung otomatis (0-100)', 'Done', 'Done', '', ''],
    ['26', 'Supervisor - Assessment', 'Edit Penilaian (Update)', '1. Klik Edit pada penilaian lama\n2. Ubah skor\n3. Simpan', 'Data penilaian terupdate dengan riwayat terbaru', 'Done', 'Done', '', ''],

    // 9. CERTIFICATE SCANNER (PUBLIC)
    ['27', 'Public - Cert Scanner', 'Scanner QR Code Sertifikat', '1. Buka URL Scanner\n2. Arahkan kamera ke QR Code Sertifikat\n3. Tunggu Proses', 'Sistem menampilkan detail keaslian: Nama, Unit, & Predikat', 'Done', 'Done', '', ''],
    ['28', 'Public - Cert Scanner', 'Verifikasi Manual Via No Sertifikat', '1. Masukkan kode unik sertifikat secara manual\n2. Klik Verify', 'Data validitas muncul jika kode sesuai database', 'Done', 'Done', '', ''],

    // 10. REPORTS & EXPORT
    ['29', 'Reports', 'Export PDF (Official Report)', '1. Pilih filter Tanggal & Unit\n2. Klik Download PDF', 'Muncul file PDF dengan kop resmi dan formatting profesional', 'Done', 'Done', '', ''],
    ['30', 'Reports', 'Export Excel (Data Raw)', '1. Klik Download Excel', 'File .xlsx berisi seluruh log absensi berhasil diunduh', 'Done', 'Done', '', ''],

    // 11. SYSTEM & UX
    ['31', 'System', 'Real-time Notifications', '1. Lakukan aksi Approval oleh Supervisor', 'Muncul notifikasi pop-up seketika di akun Partisipan', 'Done', 'Done', '', ''],
    ['32', 'System', 'Audit Log Tracking', '1. Buka menu Audit Log (Admin Only)\n2. Lihat riwayat aksi', 'Sistem mencatat siapa, melakukan apa, dan kapan secara detail', 'Done', 'Done', '', ''],
    ['33', 'System', 'Responsive Layout', '1. Buka aplikasi via Smartphone\n2. Cek menu samping & tabel', 'UI menyesuaikan ukuran layar tanpa fitur yang tertutup', 'Done', 'Done', '', '']
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);

// Formatting for better readability
const wscols = [
    { wch: 5 },  // No
    { wch: 25 }, // Modul/Menu
    { wch: 35 }, // Test Case
    { wch: 45 }, // Langkah Testing
    { wch: 45 }, // Expected Result
    { wch: 10 }, // Status
    { wch: 15 }, // Actual Result
    { wch: 15 }, // Screenshot
    { wch: 25 }  // Catatan
];
ws['!cols'] = wscols;

// Optional: Basic wrap text for multi-line cells
Object.keys(ws).forEach(key => {
    if (key[0] === '!') return;
    ws[key].s = {
        alignment: { wrapText: true, vertical: 'top' }
    };
});

XLSX.utils.book_append_sheet(wb, ws, 'Full UAT Table');

const filePath = path.join('c:', 'antigravity', 'Project-puti-main-1 - postgreSQL', 'docs', 'UAT_Puti_Internship_Management_LENGKAP.xlsx');
XLSX.writeFile(wb, filePath);

console.log('Comprehensive Excel UAT created at:', filePath);
