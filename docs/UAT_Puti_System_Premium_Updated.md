# User Acceptance Test (UAT) - Puti Internship Management System (Premium Edition)

## Overview
Dokumen ini berisi detail skenario pengujian komprehensif untuk aplikasi **Puti Internship Management System (PuTi) v1.0**. Dokumen ini mencakup seluruh fitur terbaru hingga 11 Februari 2026.

**No. Dokumen:** 1515/QA-PuTi/RUNDOWN-UAT/2026  
**Tanggal:** 11 Februari 2026  
**Tim Penguji:** QA Team / Project Lead  
**Environment:** http://localhost:3001 (Production Mode)

---

### Tabel UAT (User Acceptance Test) - Narrative Rundown

| No | Modul/Menu | Test Case | Langkah Testing | Expected Result | Status | Actual Result |
|:---:|:---|:---|:---|:---|:---:|:---:|
| **PHASE 1** | **ADMIN MASTER SETUP** | | | | | |
| 1 | Units Management | Initial Unit Creation | 1. Login Admin<br>2. Akses /ManagementData -> Tab Units<br>3. Klik "Add Unit"<br>4. Isi Nama Unit & Kapasitas<br>5. Klik Simpan | Unit baru berhasil terdaftar dalam sistem. | Done | Done |
| 2 | Management Data | Manual Supervisor Assignment | 1. Akses /ManagementData<br>2. Tab Users -> Add User<br>3. Pilih Role "Supervisor"<br>4. Assign ke unit yang baru dibuat<br>5. Simpan | Akun Supervisor dibuat dan ditugaskan sebagai pimpinan Unit tersebut. | Done | Done |
| 3 | Management Data | Manual Participant Creation | 1. Klik "Add User"<br>2. Pilih Role "Participant"<br>3. Assign Unit & Supervisor<br>4. Simpan | Partisipan manual berhasil dibuat dan terhubung ke unit & supervisornya. | Done | Done |
| **PHASE 2** | **BULK OPERATIONS & DYNAMIC CONFLICTS** | | | | | |
| 4 | Management Data | Bulk Import Logic | 1. Klik menu "Import"<br>2. Masukkan file Excel berisi data akun baru<br>3. Klik Upload | Sistem memproses antrian data & mengonfirmasi jumlah data yang berhasil. | Done | Done |
| 5 | Management Data | Import History Tracking | 1. Klik tombol "Import History"<br>2. Lihat log upload terbaru | Menampilkan riwayat waktu, siapa yang mengimport, dan statistik berhasil/gagal. | Done | Done |
| 6 | Management Data | Recycle Bin & Alert Dynamics | 1. Hapus salah satu user<br>2. Coba buat akun baru dengan email yang sama | Sistem memberi ALERT bahwa user masih ada di Recycle Bin. | Done | Done |
| 7 | Recycle Bin | Restore Action | 1. Buka dialog Recycle Bin<br>2. Cari user tadi<br>3. Klik "Restore" | User kembali muncul di daftar aktif tanpa kehilangan data riwayat. | Done | Done |
| **PHASE 3** | **PROFILE & IDENTITY** | | | | | |
| 8 | Participant Profile | Identity & Photo Update | 1. Login Participant<br>2. Update data diri & Telegram ID<br>3. Upload Foto Profil resmi<br>4. Simpan | Foto profil tersimpan untuk keperluan otomatisasi di Sertifikat. | Done | Done |
| 9 | Supervisor Profile | NIP/NIK Identification | 1. Login Supervisor<br>2. Input NIP/NIK pada field id_number<br>3. Input Telegram Chat ID<br>4. Simpan | Data identitas Supervisor (NIP/NIK) tersimpan dan muncul di tanda tangan sertifikat. | Done | Done |
| **PHASE 4** | **COMPLEX ATTENDANCE SCENARIOS** | | | | | |
| 10 | Attendance | In-Area Check-in | 1. Participant berada di lokasi kantor (In Radius)<br>2. Klik "Check-in" | Berhasil check-in seketika (Success Alert). | Done | Done |
| 11 | Attendance | Out-of-Area Request | 1. Participant berada diluar radius kantor<br>2. Klik "Check-in" | Sistem mendeteksi deviasi lokasi & memunculkan form Location Request. | Done | Done |
| 12 | Special Request | Submission Out-Area | 1. Participant submit request lokasi<br>2. Cek status | Status absensi menjadi "Waiting Supervisor Approval". | Done | Done |
| 13 | Supervisor View | Real-time Approval Flow | 1. Supervisor akses /Monitoringsuper<br>2. Pilih Pending Request<br>3. Klik "Approve" | Request diterima; Notifikasi terkirim ke partisipan. | Done | Done |
| 14 | Attendance | Finalized Check-in | 1. Participant cek status setelah approval | Berhasil Check-in berkat ijin Supervisor. | Done | Done |
| **PHASE 5** | **LEAVE REQUEST & ADMIN RULES** | | | | | |
| 15 | Leave Request | Submission Flow | 1. Participant mengajukan izin/sakit<br>2. Upload dokumen pendukung<br>3. Submit | Data tersimpan & menunggu review supervisor. | Done | Done |
| 16 | Map Settings | Security & Attendance Rules | 1. Admin atur Geofence, Time Rules, dan Leave Management Rules di /MapSettings | Parameter sistem berubah secara global mengikuti aturan baru. | Done | Done |
| **PHASE 6** | **CERTIFICATE & CUSTOMIZATION** | | | | | |
| 17 | Certificate | Verification & Profile Sync | 1. Akses /CertificateScanner<br>2. Scan QR atau Input No Sertifikat | Menampilkan sertifikat digital dengan FOTO PROFIL yang disinkronisasi. | Done | Done |
| 18 | Settings | Signature & Info Customize | 1. Admin update info penandatangan & stempel digital | Seluruh sertifikat otomatis menggunakan info terbaru. | Done | Done |
| **PHASE 7** | **ASSESSMENT & SCORING** | | | | | |
| 19 | Assessment | Internal Assessment | 1. Supervisor isi Form Internal Assessment untuk Participant | Nilai tersimpan dan tersedia untuk cetak transkrip. | Done | Done |
| 20 | Assessment | External Assessment | 1. Supervisor isi Form External Assessment | Nilai eksternal tersimpan terpisah. | Done | Done |
| 21 | Assessment | Score Preservation | 1. Input nilai Internal<br>2. Pindah ke tab External, input nilai<br>3. Kembali ke Internal | Nilai tidak hilang/reset saat berpindah kategori. | Done | Done |
| 22 | Assessment | Manual Template Selection | 1. Supervisor pilih template assessment secara manual dari dropdown | Fleksibilitas dalam memilih kriteria penilaian yang sesuai. | Done | Done |
| 23 | Certificate | Generate PDF (3 Pages) | 1. Klik "Generate Certificate" | Terbentuk PDF 3 hal: Sertifikat Utama, Transkrip Internal, Transkrip Eksternal. | Done | Done |
| **PHASE 8** | **NOTIFICATIONS & AUTOMATION** | | | | | |
| 24 | Telegram Setup | Bot Configuration | 1. Input Bot Token di Admin Settings | Bot aktif & siap mengirim notifikasi. | Done | Done |
| 25 | Notifications | Custom Telegram ID Mapping | 1. User update Telegram ID di profil | Notifikasi terkirim tepat sasaran ke recipient yang benar. | Done | Done |
| 26 | Cron Jobs | All 3 Notifications | 1. Test Attendance Reminder (08:00)<br>2. Test Late Alert to Supervisor<br>3. Test Absence Alert to Supervisor | Ketiga jenis notifikasi otomatis terkirim dengan benar via Telegram. | Done | Done |
| **PHASE 9** | **MONITORING & REPORTS** | | | | | |
| 27 | Monitoring | Pagination & Animation | 1. Navigasi tabel attendance di /Monitoringsuper | Tabel max 5 records per page dengan animasi smooth (framer-motion). | Done | Done |
| 28 | Reports | Excel/PDF Export | 1. Filter data & generate report di /AttendanceReport | Laporan akurat tersedia dalam format Excel/PDF. | Done | Done |
| **PHASE 10** | **DOCUMENT MANAGEMENT (ARSIP)** | | | | | |
| 29 | Arsip | Upload & View Document | 1. Admin upload dokumen institusi di /arsip<br>2. Klik "View" | Dokumen terbuka di tab yang sama tanpa security warning. | Done | Done |
| 30 | Documents | Acceptance Letter | 1. Pilih participant<br>2. Generate Acceptance Letter | PDF surat penerimaan ter-generate dengan data auto-fill profile. | Done | Done |
| **PHASE 11** | **ADVANCED DATA OPS** | | | | | |
| 31 | Data Management | Soft Delete & Recycle Bin | 1. Hapus user/unit<br>2. Restore dari Recycle Bin | Fitur pengelolaan data "anti-accident" berfungsi sempurna. | Done | Done |
| 32 | Bulk Operations | Batch Restore/Delete | 1. Select multiple items<br>2. Klik Bulk Action | Efisiensi pengelolaan data dalam jumlah banyak. | Done | Done |
| 33 | Bulk Import | Auto Template Integration | 1. Import Excel dengan kolom "Transcript External Institution" | Template assessment eksternal otomatis dibuat oleh sistem. | Done | Done |
| 34 | Map Settings | Three Column Layout | 1. Cek visual /MapSettings | Layout map full-width di atas dan 3 kolom pengaturan di bawah. | Done | Done |
| **PHASE 12** | **SECURITY & INTEGRATION** | | | | | |
| 35 | Security | SSO & Password Nullification | 1. Cek database user SSO | Password null untuk user SSO; Login manual ditolak demi keamanan. | Done | Done |
| 36 | API | CRUD & Protected Endpoints | 1. Test API endpoints via Postman/Script | Authentication & Authorization layer berfungsi di level API. | Done | Done |
| 37 | Integration | Database Integrity | 1. Jalankan berbagai operasi data | Relasi PostgreSQL (Foreign Keys) & Transactions (Atomic) terjaga. | Done | Done |

---
**Last Updated:** 11 Februari 2026
**Version:** 1.0.2 (Premium Update)
