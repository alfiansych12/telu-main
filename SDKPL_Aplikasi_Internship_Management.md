# Software Requirement Specification and Design (SRSD)
## Aplikasi Internship Management (Project Puti)

### 2. Aktor dan Pengguna

Penerapan sistem ini melibatkan beberapa aktor utama yang memiliki hak akses dan fungsionalitas berbeda sesuai dengan peran masing-masing dalam siklus manajemen magang.

**Tabel 1 Aktor dan Pengguna**

| No | Aktor | Deskripsi |
| :--- | :--- | :--- |
| 1. | **Service Desk (Admin)** | a. Melihat Beranda Dashboard Utama<br>b. Manajemen User (Tambah, Edit, Hapus, Recycle Bin)<br>c. Bulk Import Data Peserta via Excel<br>d. Konfigurasi Sistem (Geofencing, Radius, & Map Settings)<br>e. Manajemen Unit Kerja & Institusi<br>f. Melihat Audit Logs & Aktivitas Sistem<br>g. Monitoring Laporan Kehadiran Global |
| 2. | **Eksekutor (Supervisor)** | a. Melihat Beranda Dashboard Monitoring<br>b. Verifikasi Pengajuan Izin, Sakit, & Lokasi WFA<br>c. Monitoring Map & Lokasi Real-time Peserta Bimbingan<br>d. Melakukan Input Penilaian (Soft Skill, Hard Skill, & Attitude)<br>e. Melihat Rekap & Export Laporan Performa Tim |
| 3. | **User (Participant)** | a. Melihat Beranda Status & Statistik Personal<br>b. Melakukan Presensi In/Out (GPS Based)<br>c. Input Logbook / Aktivitas Harian<br>d. Mengajukan Izin, Sakit, atau Lokasi Monitoring<br>e. Melihat Nilai & Point Performa |

---

### 3. Deskripsi dan Prioritas

Bagian ini merinci fungsi utama sistem yang dikategorikan berdasarkan kebutuhan bisnis dan prioritas implementasi.

**Tabel 2 Deskripsi Usecase**
**Primary Usecase Report**

| Nama Kebutuhan | Nomor Kebutuhan | Aktor |
| :--- | :--- | :--- |
| **Manajemen Presensi & Monitoring**<br>- Presensi berbasis GPS/Geofencing<br>- Live Tracking Map Peserta<br>- Verifikasi Izin & Sakit<br>- Laporan Kehadiran Harian | REQ - UC01 | Service Desk, Eksekutor, User |
| **Manajemen Data & Administrasi**<br>- Manajemen Akun & Role<br>- Import Data Massal<br>- Pengaturan Lokasi Kantor (Polygon/Radius)<br>- Manajemen Unit Kerja | REQ - UC02 | Service Desk |
| **Evaluasi & Sertifikasi**<br>- Pengisian Nilai oleh Supervisor<br>- Manajemen Template Penilaian Institusi<br>- Kalkulasi Nilai Otomatis<br>- Generate Sertifikat Digital (3 Halaman) | REQ - UC03 | Service Desk, Eksekutor |

---
*Dokumen ini merupakan representasi Markdown dari spesifikasi fungsional Aplikasi Internship Management.*
