# 📘 USER MANUAL: INTERNSHIP MANAGEMENT SYSTEM (PUTI-IMS)
## Special Edition for Service Desk & Administrators

Versi: 1.0  
Tanggal: 10 Februari 2026

---

## 📑 Daftar Isi
1. [Pendahuluan](#1-pendahuluan)
2. [Akses & Login](#2-akses--login)
3. [Manajemen Pengguna (User Management)](#3-manajemen-pengguna)
4. [Monitoring Kehadiran & GPS](#4-monitoring-kehadiran--gps)
5. [Manajemen Penilaian (Assessment)](#5-manajemen-penilaian)
6. [Arsip Institusi & Dokumen](#6-arsip-institusi)
7. [Konfigurasi Sistem (Settings)](#7-konfigurasi-sistem)
8. [Troubleshooting Dasar](#8-troubleshooting-dasar)

---

## 1. Pendahuluan
Sistem Manajemen Magang Puti (PUTI-IMS) adalah platform terintegrasi untuk mengelola siklus hidup peserta magang, mulai dari pendaftaran, absensi berbasis lokasi (GPS), penilaian, hingga penerbitan sertifikat digital. Sebagai **Service Desk**, tugas utama Anda adalah memastikan data master akurat dan membantu user jika terjadi kendala teknis.

---

## 2. Akses & Login
Halaman ini adalah pintu utama masuk ke sistem.

> **![SS_LOGIN_PAGE]**  
> *Keterangan Screenshot: Tampilan halaman login dengan input Email dan Password.*

**Langkah-langkah:**
1. Buka URL sistem di browser Anda.
2. Masukkan **Alamat Email** dan **Password** yang telah terdaftar.
3. Jika menggunakan Single Sign-On (SSO), klik tombol **Login with SSO**.
4. Klik **Login**. Jika lupa password, hubungi tim IT Infrastructure untuk reset manual di database.

---

## 3. Manajemen Pengguna (User Management)
Menu ini digunakan untuk mengelola data akun Peserta, Supervisor, dan Admin.

### 3.1 Menambah User Secara Manual
> **![SS_ADD_USER_MODAL]**  
> *Keterangan Screenshot: Modal form input untuk menambah user baru.*

1. Masuk ke menu **Management Data** > **Users**.
2. Klik tombol **Add User**.
3. Isi data wajib: Nama Lengkap, Email, Role (Admin/Supervisor/Participant), dan Unit Kerja.
4. Klik **Save**.

### 3.2 Bulk Import User (Excel)
> **![SS_IMPORT_EXCEL]**  
> *Keterangan Screenshot: Tombol Import dan dialog upload file Excel.*

1. Gunakan fitur ini jika ada banyak peserta magang baru (batch baru).
2. Download template Excel yang disediakan.
3. Upload kembali file yang sudah diisi. Sistem akan otomatis membuat akun untuk semua daftar di Excel tersebut.

---

## 4. Monitoring Kehadiran & GPS
Salah satu fitur paling krusial untuk memantau kedisiplinan.

### 4.1 Live Tracking Map
> **![SS_MONITORING_MAP]**  
> *Keterangan Screenshot: Peta besar dengan banyak marker foto peserta.*

Sebagai Service Desk, Anda bisa melihat sebaran peserta magang:
- **Marker Hijau:** Peserta berada di dalam radius kantor.
- **Marker Merah:** Peserta berada di luar radius yang ditentukan.
- Klik pada marker untuk melihat detail jam masuk dan foto logbook.

### 4.2 Verifikasi Izin/Cuti
> **![SS_LEAVE_APPROVAL]**  
> *Keterangan Screenshot: List tabel pengajuan izin yang berstatus 'Pending'.*

Jika peserta mengirim komplain bahwa izinnya belum diproses, Anda bisa mengecek di menu ini dan mengarahkan Supervisor terkait untuk melakukan **Approve/Reject**.

---

## 5. Manajemen Penilaian (Assessment)
Mengelola kriteria nilai sebelum sertifikat dicetak.

### 5.1 Mengatur Template Penilaian
> **![SS_ASSESSMENT_TEMPLATE]**  
> *Keterangan Screenshot: Pengaturan bobot nilai Soft Skill, Hard Skill, dan Attitude.*

1. Masuk ke **Management Data** > **Assessment Templates**.
2. Pilih tipe institusi (misal: Universitas atau SMK).
3. Atur kriteria penilaian sesuai kebijakan unit terkait. Pastikan total bobot adalah 100%.

### 5.2 Entry Nilai Eksternal
> **![SS_EXTERNAL_ASSESSMENT]**  
> *Keterangan Screenshot: Form input nilai dari pihak kampus/sekolah.*

Sistem memfasilitasi input nilai dari pembimbing lapangan luar. Pastikan nilai ditranskrip dengan benar agar muncul di halaman ke-2 sertifikat.

---

## 6. Arsip Institusi & Sertifikat
Tempat penyimpanan dokumen resmi.

### 6.1 Generate Sertifikat
> **![SS_CERTIFICATE_PREVIEW]**  
> *Keterangan Screenshot: Preview sertifikat PDF 3 halaman.*

1. Cari nama peserta yang telah menyelesaikan magang.
2. Pastikan nilai sudah terisi lengkap.
3. Klik tombol **Generate Certificate**.
4. Sistem akan menghasilkan 3 halaman PDF: Sertifikat Utama, Transkrip Internal, dan Transkrip Eksternal.

---

## 7. Konfigurasi Sistem (Settings)
Pengaturan teknis yang mempengaruhi seluruh aplikasi.

### 7.1 Map & Geofencing Settings
> **![SS_MAP_SETTINGS]**  
> *Keterangan Screenshot: Pengaturan titik koordinat pusat dan radius absen.*

- **Latitude/Longitude:** Lokasi titik tengah kantor.
- **Radius (Meter):** Jarak maksimal peserta boleh melakukan absen (default: 100m).
- *Hati-hati: Perubahan di sini akan langsung berdampak pada seluruh peserta.*

### 7.2 Notification Template
> **![SS_NOTIFICATION_SETTINGS]**  
> *Keterangan Screenshot: Editor template pesan Telegram.*

Anda bisa mengubah isi pesan otomatis yang dikirim ke Telegram peserta, seperti pengingat absen pagi atau ucapan selamat magang selesai.

---

## 8. Troubleshooting Dasar
Daftar solusi untuk kendala yang sering dilaporkan ke Service Desk:

| Masalah | Solusi |
|---------|--------|
| **Tidak bisa Absen (Lokasi tidak akurat)** | Pastikan GPS HP Peserta aktif dan izin browser untuk lokasi sudah "Allow". Coba refresh halaman atau pindah ke area terbuka. |
| **Telegram tidak masuk** | Pastikan peserta sudah mengisi **Chat ID/Username Telegram** di menu Profile Settings. |
| **Nilai tidak muncul di sertifikat** | Cek apakah template penilaian sudah dibuat untuk institusi peserta tersebut. Pastikan Supervisor sudah menekan tombol "Submit" nilai. |
| **Lupa Password** | Sebagai Admin, Anda bisa mengedit profil user tersebut dan memasukkan password baru secara manual. |

---
*Dokumen ini dibuat secara otomatis oleh Puti IMS Support Team.*
