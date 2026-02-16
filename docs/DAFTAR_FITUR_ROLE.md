# 📋 Daftar Fitur Berdasarkan Role - Project Puti

Dokumen ini merangkum seluruh fitur yang tersedia untuk masing-masing role: **Admin**, **Supervisor**, dan **Participant** dalam sistem Puti Internship Management.

---

## 🏗️ 1. Role: ADMIN
Admin memiliki kendali penuh terhadap sistem dan manajemen data tingkat tinggi.

### 📊 Dashboard & Monitoring
- **Real-time Statistics**: Melihat total peserta, supervisor, unit, dan jumlah kehadiran hari ini.
- **Attendance Charts**: Grafik tren kehadiran bulanan.
- **Activity Timeline**: Memantau aktivitas terbaru seluruh pengguna.

### 👥 Management Data
- **User Management**: Menambah, mengedit, dan menghapus (soft delete) akun pengguna.
- **Bulk Import Excel**: Menambahkan ratusan peserta sekaligus melalui file Excel.
- **Role & Unit Assignment**: Mengatur jabatan dan menempatkan peserta ke dalam unit tertentu.
- **Internship Period**: Mengatur tanggal mulai dan selesai magang per peserta.
- **Recycle Bin**: Memulihkan data yang terhapus atau menghapusnya secara permanen.

### 🏢 Units & Map Management
- **Units Management**: Membuat unit baru dan menentukan kapasitas maksimal peserta.
- **Assign Manager**: Menentukan Supervisor yang bertanggung jawab atas suatu unit.
- **Geofencing Configuration**: Penentuan titik koordinat kantor dan pengaturan radius (jarak) aman untuk absensi di peta interaktif.

### 📜 Laporan & Keamanan
- **Global Reports**: Rekap laporan kehadiran seluruh peserta dengan filter lanjutan.
- **Audit Logs**: Melacak setiap tindakan penting yang dilakukan oleh seluruh pengguna (Log Security).
- **Certificate Scanner**: Pengaturan penandatangan sertifikat dan verifikasi keaslian via QR Code.

---

## 👨‍🏫 2. Role: SUPERVISOR
Supervisor berfokus pada pemantauan tim di bawah naungan unitnya.

### 📈 Dashboard Tim
- **Unit Statistics**: Melihat statistik khusus untuk partisipan yang berada di unit pimpinannya.
- **Approval Shortcut**: Akses cepat untuk permintaan izin yang belum diproses.

### 📍 Monitoring & Approval
- **Team Attendance**: Memantau siapa saja yang sudah absen atau terlambat hari ini secara real-time.
- **Leave Request Approval**: Menyetujui atau menolak izin/sakit peserta (dengan melihat bukti surat).
- **Location Request Approval**: Memberikan izin khusus bagi peserta untuk absen di luar area geofencing (misal: Tugas Lapangan).
- **Team Map View**: Melihat sebaran lokasi tim di peta saat mereka melakukan absensi.

### 📝 Evaluasi (Assessment)
- **Performance Input**: Memberikan nilai Soft Skill, Hard Skill, dan Attitude (skala 0-100).
- **Auto-Calculation**: Sistem otomatis menghitung rata-rata dan predikat nilai peserta.
- **Qualitative Feedback**: Memberikan catatan masukan/evaluasi untuk pengembangan peserta.

---

## 🎓 3. Role: PARTICIPANT
Participant menggunakan sistem untuk kegiatan harian dan pemantauan mandiri.

### 📱 Dashboard Harian
- **Smart Check-in/out**: Tombol presensi yang muncul otomatis sesuai jadwal.
- **Status Hari Ini**: Menampilkan waktu masuk, waktu pulang, dan total durasi kerja.
- **Personal Summary**: Ringkasan total kehadiran, terlambat, dan izin selama magang.

### 📍 Absensi & Lokasi
- **GPS-Based Absence**: Melakukan absen dengan validasi lokasi otomatis (Geofencing).
- **Activity Logging**: Menginput deskripsi singkat pekerjaan yang dilakukan setiap hari.
- **WFA/Location Request**: Mengajukan permohonan agar bisa absen di luar radius kantor untuk keperluan dinas.

### 📄 Izin & Penilaian
- **Leave Request**: Mengajukan izin/sakit dan mengunggah bukti/surat keterangan.
- **Track Status**: Memantau apakah permintaan izin sudah disetujui oleh Supervisor.
- **View Assessment**: Melihat hasil penilaian dan feedback dari Supervisor setelah periode magang berakhir.

---

**Terakhir Diperbarui:** 1 Februari 2026
