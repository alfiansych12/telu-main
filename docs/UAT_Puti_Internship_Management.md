# User Acceptance Test (UAT) - Puti Internship Management System

## Overview
Dokumen ini berisi detail skenario pengujian untuk memastikan aplikasi **Puti Internship Management System** berjalan sesuai dengan spesifikasi fungsional yang telah ditetapkan.

---

### Tabel UAT (User Acceptance Test)

| No | Modul/Menu | Test Case | Langkah Testing | Expected Result | Status | Actual Result |
|:---:|:---|:---|:---|:---|:---:|:---:|
| **1** | **Login** | Login dengan kredensial valid | 1. Buka URL: http://localhost:3001/<br>2. Input email (akun valid)<br>3. Input password (akun valid)<br>4. Klik tombol Login | User berhasil login dan masuk ke dashboard utama sesuai role masing-masing (Admin/Super/Part) | Done | Done |
| **2** | **Login** | Login dengan kredensial invalid | 1. Masukkan email sembarang<br>2. Masukkan password salah<br>3. Klik tombol Login | Muncul pesan error "Invalid credentials" atau "User not found" | Done | Done |
| **3** | **Login** | Logout | 1. Klik menu/tombol Logout di sidebar<br>2. Konfirmasi logout jika diperlukan | User berhasil logout dan diarahkan kembali ke halaman login utama | Done | Done |
| **4** | **Management Data** | Create - Tambah user baru (Manual) | 1. Masuk ke menu Management Data<br>2. Klik tombol "Add User"<br>3. Isi lengkap form (Nama, Email, Role, Unit)<br>4. Klik Simpan | Data user tersimpan di database dan muncul di tabel daftar users secara otomatis | Done | Done |
| **5** | **Management Data** | Bulk Import - Upload via Excel | 1. Klik tombol "Import"<br>2. Pilih file Excel yang berisi ratusan data peserta<br>3. Klik Upload/Process | Sistem berhasil memproses seluruh data dari file Excel dan menambahkannya ke list user | Done | Done |
| **6** | **Management Data** | Update - Edit informasi user | 1. Cari user di tabel<br>2. Klik tombol Edit<br>3. Ubah Unit atau Role<br>4. Klik Simpan | Data user diperbarui dan perubahan langsung terlihat di tabel tanpa refresh manual | Done | Done |
| **7** | **Management Data** | Delete - Hapus user (Soft Delete) | 1. Klik ikon Hapus/Trash pada user tertentu<br>2. Konfirmasi penghapusan | Data user hilang dari tabel utama dan berpindah ke folder Recycle Bin | Done | Done |
| **8** | **Management Data** | Recycle Bin - Restore data | 1. Buka dialog Recycle Bin<br>2. Pilih user yang baru saja dihapus<br>3. Klik Restore | User kembali muncul di tabel utama Management Data dengan status aktif | Done | Done |
| **9** | **Units Management** | Create - Tambah Unit/Departemen | 1. Masuk menu Units Management<br>2. Klik Add Unit<br>3. Isi nama unit dan set kapasitas<br>4. Simpan | Unit baru terdaftar dalam sistem dan siap untuk di-assign ke supervisor/partisipan | Done | Done |
| **10** | **Map Settings** | Set Geofencing Point & Radius | 1. Masuk menu Map Settings<br>2. Tentukan titik lokasi di peta (pinpoint)<br>3. Atur radius (misal: 100 meter)<br>4. Klik Simpan | Lokasi valid untuk absensi diperbarui secara global untuk semua partisipan | Done | Done |
| **11** | **Attendance** | Check-in - Dalam radius (Valid) | 1. Buka Dashboard Partisipan<br>2. Input deskripsi kegiatan hari ini<br>3. Klik tombol Check-in (Pastikan GPS aktif) | Waktu masuk tercatat, tombol berubah menjadi Check-out, dan status "Present" | Done | Done |
| **12** | **Attendance** | Check-in - Luar radius (Invalid) | 1. Coba check-in saat posisi berada di luar radius kantor<br>2. Klik tombol Check-in | Muncul notifikasi error "You are outside the valid area" dan data tidak tersimpan | Done | Done |
| **13** | **Attendance** | Late Detection | 1. Lakukan check-in setelah batas waktu masuk (misal: lewat jam 08:30)<br>2. Klik Check-in | Sistem otomatis memberi label "LATE" pada catatan kehadiran hari tersebut | Done | Done |
| **14** | **Special Requests** | Submit Leave/Sick Request | 1. Isi form Leave (Sakit/Izin)<br>2. Upload dokumen bukti (Surat Dokter)<br>3. Klik Submit | Data tersimpan dan notifikasi dikirim ke supervisor untuk approval | Done | Done |
| **15** | **Monitoring** | Approval Workflow | 1. Masuk menu Monitoring<br>2. Pilih request (Leave/Location)<br>3. Klik Approve atau Reject dengan pesan | Status request berubah di sisi partisipan dan notifikasi real-time terkirim | Done | Done |
| **16** | **Assessment** | Input Penilaian Kompetensi | 1. Pilih Partisipan<br>2. Isi skor (Soft Skill, Hard Skill, Attitude)<br>3. Tambahkan catatan feedback<br>4. Simpan | Nilai tersimpan, skor rata-rata dihitung otomatis, dan terlihat di profil partisipan | Done | Done |
| **17** | **Reports** | Export Kehadiran ke PDF/Excel | 1. Filter data berdasarkan unit/tanggal<br>2. Klik export ke format pilihan (PDF/Excel) | File berhasil didownload dengan format laporan profesional (kop surat, tabel rapi) | Done | Done |
| **18** | **Cert Scanner** | Verifikasi Sertifikat via QR | 1. Buka fitur Scanner<br>2. Scan QR Code di sertifikat fisik/digital | Sistem menampilkan detail keaslian sertifikat: Nama, Predikat, dan Tanda Tangan | Done | Done |

---
**Last Updated:** 1 Februari 2026
