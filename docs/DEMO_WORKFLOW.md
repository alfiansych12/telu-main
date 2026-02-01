# 🎯 DEMO WORKFLOW - Puti Internship Management System

**Versi:** 1.0  
**Tanggal:** 26 Januari 2026  
**Tujuan:** Panduan lengkap untuk demo aplikasi dari awal sampai akhir (pengecekan sertifikat)

---

## 📋 Daftar Isi

1. [Persiapan Demo](#1-persiapan-demo)
2. [Alur Demo Lengkap](#2-alur-demo-lengkap)
3. [Skenario A: Admin Flow](#3-skenario-a-admin-flow)
4. [Skenario B: Supervisor Flow](#4-skenario-b-supervisor-flow)
5. [Skenario C: Participant Flow](#5-skenario-c-participant-flow)
6. [Skenario D: End-to-End Certificate Verification](#6-skenario-d-end-to-end-certificate-verification)
7. [Tips Presentasi](#7-tips-presentasi)

---

## 1. Persiapan Demo

### 1.1 Checklist Sebelum Demo

**Environment Setup:**
- [ ] Server development berjalan di `http://localhost:3001`
- [ ] Database PostgreSQL terkoneksi dengan baik
- [ ] Seed data sudah dijalankan (minimal 3 users per role)
- [ ] Browser dalam mode incognito/private (untuk multiple login)
- [ ] Koneksi internet stabil (untuk OAuth Telkom University)

**Data yang Diperlukan:**
```
Admin Account:
- Email: admin@telkomuniversity.ac.id
- Password: [sesuai seed data]

Supervisor Account:
- Email: supervisor@telkomuniversity.ac.id
- Password: [sesuai seed data]

Participant Account:
- Email: participant@telkomuniversity.ac.id
- Password: [sesuai seed data]
```

**Persiapan Browser:**
- Tab 1: Admin Dashboard
- Tab 2: Supervisor Dashboard
- Tab 3: Participant Dashboard
- Tab 4: Certificate Scanner (untuk demo akhir)

---

## 2. Alur Demo Lengkap

### 2.1 Timeline Demo (30-45 Menit)

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: Setup & Onboarding (5 menit)                        │
│ - Login sebagai Admin                                        │
│ - Overview Dashboard Admin                                   │
│ - Setup Unit & Import Participants                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 2: Participant Daily Activities (10 menit)             │
│ - Login sebagai Participant                                  │
│ - Check-in dengan geolocation                               │
│ - Input aktivitas harian                                     │
│ - Submit monitoring location request                         │
│ - Submit leave request (izin/sakit)                         │
│ - Check-out                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 3: Supervisor Monitoring & Evaluation (10 menit)       │
│ - Login sebagai Supervisor                                   │
│ - Review pending requests (monitoring & leave)              │
│ - Approve/Reject requests                                    │
│ - Monitor team attendance                                    │
│ - Input assessment/penilaian                                 │
│ - Export attendance report (PDF/Excel/Word)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 4: Admin Reporting & Certificate (10 menit)            │
│ - Login sebagai Admin                                        │
│ - Review system-wide reports                                │
│ - Configure certificate settings                            │
│ - Generate certificate untuk participant                     │
│ - Scan & verify certificate                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 5: Q&A & Closing (5 menit)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Skenario A: Admin Flow

### 3.1 Login & Dashboard Overview

**Langkah 1: Login sebagai Admin**
```
URL: http://localhost:3001/
Aksi:
1. Klik tombol "Login with Telkom University"
2. Masukkan kredensial admin
3. Redirect ke /dashboard
```

**Langkah 2: Explore Dashboard Admin**
```
Tampilkan:
✓ Total Participants (card statistik)
✓ Total Supervisors (card statistik)
✓ Total Units (card statistik)
✓ Today's Attendance (card statistik)
✓ Grafik kehadiran bulanan (Chart.js)
✓ Recent activities timeline
```

**Highlight Points:**
- "Dashboard ini memberikan overview real-time dari seluruh sistem"
- "Admin dapat melihat statistik lengkap dalam satu layar"
- "Grafik menunjukkan trend kehadiran untuk analisis"

---

### 3.2 Management Data - User Management

**Langkah 3: Kelola User**
```
URL: /ManagementData
Aksi:
1. Klik menu "Management Data" di sidebar
2. Tampilkan tabel users dengan filter role
3. Demo Create User:
   - Klik "Add New User"
   - Isi form:
     * Name: "John Doe"
     * Email: "john.doe@telkomuniversity.ac.id"
     * Role: "Participant"
     * Unit: [Pilih unit]
     * Internship Period: [Set tanggal]
   - Klik "Save"
4. Demo Edit User:
   - Klik icon edit pada user
   - Ubah data (misal: ganti unit)
   - Save changes
5. Demo Bulk Import:
   - Klik "Import Users"
   - Upload Excel template
   - Preview data
   - Confirm import
```

**Highlight Points:**
- "Sistem mendukung CRUD lengkap untuk user management"
- "Bulk import memudahkan onboarding ratusan peserta sekaligus"
- "Setiap perubahan tercatat di audit log untuk keamanan"

---

### 3.3 Management Data - Units Management

**Langkah 4: Kelola Unit/Departemen**
```
URL: /UnitsManagement
Aksi:
1. Klik "Units Management" di sidebar
2. Tampilkan list units dengan statistik
3. Demo Create Unit:
   - Klik "Add New Unit"
   - Isi form:
     * Name: "IT Development"
     * Department: "Technology"
     * Manager: [Pilih supervisor]
     * Capacity: 20
   - Save
4. View Unit Details:
   - Klik pada unit card
   - Tampilkan:
     * Jumlah participants
     * Manager info
     * Capacity utilization
```

**Highlight Points:**
- "Setiap unit memiliki manager (supervisor) yang bertanggung jawab"
- "Capacity tracking membantu distribusi peserta yang merata"
- "Unit dapat dikategorikan berdasarkan departemen"

---

### 3.4 Reports Monitoring

**Langkah 5: Monitoring & Reporting**
```
URL: /ReportsMonitoring
Aksi:
1. Klik "Reports Monitoring"
2. Filter laporan:
   - Date range: [Pilih minggu ini]
   - Unit: [All units]
   - Status: [All status]
3. Tampilkan tabel attendance dengan:
   - Participant name
   - Unit
   - Check-in/out time
   - Status (present/late/absent)
   - Activity description
4. Export report:
   - Klik "Export to CSV"
   - Download file
```

**Highlight Points:**
- "Admin dapat memonitor kehadiran seluruh peserta"
- "Filter fleksibel untuk analisis spesifik"
- "Export untuk reporting ke stakeholder"

---

### 3.5 Map Settings

**Langkah 6: Konfigurasi Geofencing**
```
URL: /MapSettings
Aksi:
1. Klik "Map Settings"
2. Tampilkan peta interaktif (Leaflet)
3. Set allowed locations:
   - Klik pada peta untuk add location
   - Set radius (misal: 100 meter)
   - Beri nama lokasi
   - Save
4. View existing locations:
   - Tampilkan marker di peta
   - Edit radius jika perlu
```

**Highlight Points:**
- "Geofencing memastikan check-in hanya dari lokasi valid"
- "Radius dapat disesuaikan per lokasi"
- "Visualisasi peta memudahkan konfigurasi"

---

### 3.6 Certificate Scanner

**Langkah 7: Scanner & Certificate Settings**
```
URL: /CertificateScanner
Aksi:
1. Klik "Certificate Scanner"
2. Tab "Scanner":
   - Input nomor sertifikat (misal: CERT-2026-001)
   - Klik "Verify"
   - Tampilkan hasil:
     * Participant name
     * Unit
     * Internship period
     * Assessment scores
     * Certificate status (Valid/Invalid)
3. Tab "Settings":
   - Configure pejabat penandatangan:
     * Nama: "Dr. Budi Santoso"
     * Jabatan: "Kepala SDM"
     * Kota: "Bandung"
   - Preview signature
   - Save settings
```

**Highlight Points:**
- "Setiap sertifikat memiliki nomor unik untuk verifikasi"
- "Scanner dapat diakses publik untuk validasi keaslian"
- "Pengaturan pejabat dapat diubah secara dinamis"

---

## 4. Skenario B: Supervisor Flow

### 4.1 Login & Dashboard Supervisor

**Langkah 1: Login sebagai Supervisor**
```
URL: http://localhost:3001/
Aksi:
1. Logout dari admin (atau buka tab baru)
2. Login dengan kredensial supervisor
3. Redirect ke /dashboardsuper
```

**Langkah 2: Explore Dashboard Supervisor**
```
Tampilkan:
✓ My Unit Statistics
  - Total participants in unit
  - Today's attendance rate
  - Pending requests count
✓ Team Attendance Chart
✓ Recent Activities
✓ Quick Actions:
  - Approve Requests
  - View Team
  - Create Assessment
```

**Highlight Points:**
- "Supervisor hanya melihat data unit mereka"
- "Dashboard fokus pada monitoring tim"
- "Quick actions untuk efisiensi kerja"

---

### 4.2 Monitoring - Attendance Tracking

**Langkah 3: Monitor Kehadiran Tim**
```
URL: /Monitoringsuper
Aksi:
1. Klik "Monitoring" di sidebar
2. Tab "Attendance Today":
   - Tampilkan list participants
   - Status: Present/Absent/Late
   - Check-in time
   - Activity description
3. Tab "Pending Requests":
   - Monitoring Location Requests
   - Leave Requests (Izin/Sakit)
4. Review & Approve:
   - Klik pada request
   - Lihat detail:
     * Participant info
     * Request reason
     * Evidence (jika ada)
   - Pilih "Approve" atau "Reject"
   - Tambahkan notes
   - Submit
```

**Highlight Points:**
- "Real-time monitoring kehadiran tim"
- "Supervisor dapat approve/reject request dengan notes"
- "Notifikasi otomatis ke participant setelah approval"

---

### 4.3 Assessment - Penilaian Performa

**Langkah 4: Input Penilaian**
```
URL: /assessmentsuper
Aksi:
1. Klik "Rekap Penilaian"
2. Pilih participant untuk dinilai
3. Klik "Create Assessment"
4. Isi form penilaian:
   - Soft Skill: 85
   - Hard Skill: 90
   - Attitude: 88
   - Remarks: "Sangat proaktif dan cepat belajar"
   - Period: "Januari 2026"
5. Save
6. View hasil:
   - Average Score: 87.67
   - Kategori: "Sangat Baik"
```

**Highlight Points:**
- "Penilaian terstruktur dengan 3 aspek utama"
- "Sistem otomatis menghitung rata-rata dan kategori"
- "Remarks memberikan feedback kualitatif"

---

### 4.4 Attendance Report - Export Laporan

**Langkah 5: Generate & Export Report**
```
URL: /AttendanceReport
Aksi:
1. Klik "Rekap Kehadiran"
2. Set filter:
   - Date range: [Bulan ini]
   - Participant: [All atau specific]
3. Preview report:
   - Tabel kehadiran lengkap
   - Summary statistics
4. Export options:
   - PDF: Klik "Export PDF"
     * Desain profesional dengan header
     * Tabel terformat rapi
     * Signature section
   - Excel: Klik "Export Excel"
     * Multiple sheets
     * Formulas untuk summary
   - Word: Klik "Export Word"
     * Template formal
     * Ready untuk edit
```

**Highlight Points:**
- "3 format export untuk berbagai kebutuhan"
- "PDF untuk presentasi formal"
- "Excel untuk analisis lebih lanjut"
- "Word untuk customization"

---

## 5. Skenario C: Participant Flow

### 5.1 Login & Dashboard Participant

**Langkah 1: Login sebagai Participant**
```
URL: http://localhost:3001/
Aksi:
1. Logout dari supervisor (atau buka tab baru)
2. Login dengan kredensial participant
3. Redirect ke /dashboarduser
```

**Langkah 2: Explore Dashboard Participant**
```
Tampilkan:
✓ Check-in/Check-out Buttons (prominent)
✓ Today's Status
✓ Attendance Summary:
  - Total days present
  - Total days late
  - Total days absent
✓ Recent Activities
✓ Notifications
```

**Highlight Points:**
- "Interface sederhana dan user-friendly"
- "Focus pada daily tasks (check-in/out)"
- "Summary membantu self-monitoring"

---

### 5.2 Check-in Process

**Langkah 3: Melakukan Check-in**
```
Aksi:
1. Klik tombol "Check-in"
2. Browser request GPS permission:
   - Allow location access
3. Sistem validasi:
   - Cek koordinat GPS
   - Validasi geofencing
   - Cek apakah sudah check-in hari ini
4. Jika valid:
   - Tampilkan dialog "Activity Description"
   - Input aktivitas: "Rapat koordinasi proyek X"
   - Klik "Submit"
5. Success:
   - Notifikasi: "Check-in berhasil!"
   - Button berubah jadi "Check-out"
   - Tampilkan check-in time
```

**Skenario Alternatif - Luar Area:**
```
Jika koordinat di luar radius:
1. Tampilkan error: "Anda di luar area yang diizinkan"
2. Opsi: "Request Monitoring Location"
3. Klik untuk submit request ke supervisor
```

**Highlight Points:**
- "Geolocation otomatis untuk akurasi"
- "Validasi real-time mencegah fraud"
- "Request system untuk fleksibilitas"

---

### 5.3 Submit Monitoring Location Request

**Langkah 4: Request Lokasi Khusus**
```
URL: /dashboarduser (section: Requests)
Aksi:
1. Scroll ke "Monitoring Requests"
2. Klik "New Request"
3. Isi form:
   - Location Name: "Client Office - PT ABC"
   - Date: [Pilih tanggal]
   - Reason: "Meeting dengan klien untuk presentasi"
   - Coordinates: [Auto-detect atau manual input]
4. Submit
5. Status: "Pending Approval"
```

**Highlight Points:**
- "Participant dapat request lokasi di luar kantor"
- "Supervisor akan review dan approve"
- "Transparansi dengan reason yang jelas"

---

### 5.4 Submit Leave Request

**Langkah 5: Pengajuan Izin/Sakit**
```
URL: /dashboarduser (section: Leave Requests)
Aksi:
1. Klik "Request Leave"
2. Isi form:
   - Type: "Sick" atau "Permit"
   - Start Date: [Tanggal mulai]
   - End Date: [Tanggal selesai]
   - Reason: "Sakit demam"
   - Evidence: [Upload surat dokter]
3. Submit
4. Status: "Pending"
5. Notifikasi: "Request submitted successfully"
```

**Highlight Points:**
- "Upload bukti untuk validasi"
- "Sistem otomatis notifikasi supervisor"
- "Tracking status real-time"

---

### 5.5 Check-out Process

**Langkah 6: Melakukan Check-out**
```
Aksi:
1. Klik tombol "Check-out"
2. Tampilkan dialog:
   - Check-in time: 08:00
   - Current time: 17:00
   - Duration: 9 hours
   - Activity summary (dari check-in)
3. Opsi: Update activity description
4. Klik "Confirm Check-out"
5. Success:
   - Notifikasi: "Check-out berhasil!"
   - Tampilkan total hours worked
   - Button reset untuk besok
```

**Highlight Points:**
- "Automatic duration calculation"
- "Activity tracking untuk accountability"
- "Simple dan cepat"

---

### 5.6 View Profile & Assessment

**Langkah 7: Lihat Profil & Penilaian**
```
URL: /Profilepart
Aksi:
1. Klik "Profile" di sidebar
2. Tab "Personal Info":
   - Name, Email, Unit
   - Internship Period
   - Supervisor name
3. Tab "Assessment":
   - View penilaian dari supervisor
   - Soft Skill: 85
   - Hard Skill: 90
   - Attitude: 88
   - Average: 87.67
   - Remarks: [Feedback dari supervisor]
4. Tab "Attendance Summary":
   - Total days: 20
   - Present: 18
   - Late: 2
   - Absent: 0
   - Attendance Rate: 90%
```

**Highlight Points:**
- "Participant dapat melihat penilaian mereka"
- "Transparansi untuk motivasi"
- "Self-monitoring attendance"

---

## 6. Skenario D: End-to-End Certificate Verification

### 6.1 Complete Journey - From Onboarding to Certificate

**Timeline: Simulasi 1 Bulan Magang**

```
┌─────────────────────────────────────────────────────────────┐
│ WEEK 1: Onboarding                                           │
├─────────────────────────────────────────────────────────────┤
│ [Admin]                                                      │
│ 1. Create participant account                               │
│ 2. Assign to unit                                            │
│ 3. Set internship period (1 Feb - 28 Feb 2026)             │
│                                                              │
│ [Participant]                                                │
│ 4. First login                                               │
│ 5. Complete profile                                          │
│ 6. First check-in                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WEEK 2-3: Daily Activities                                  │
├─────────────────────────────────────────────────────────────┤
│ [Participant]                                                │
│ 1. Daily check-in/out (20 hari kerja)                       │
│ 2. Submit 2 monitoring requests (approved)                  │
│ 3. Submit 1 leave request (approved)                        │
│                                                              │
│ [Supervisor]                                                 │
│ 4. Monitor daily attendance                                  │
│ 5. Approve requests                                          │
│ 6. Weekly check-in dengan participant                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WEEK 4: Evaluation                                          │
├─────────────────────────────────────────────────────────────┤
│ [Supervisor]                                                 │
│ 1. Review participant performance                           │
│ 2. Input assessment:                                         │
│    - Soft Skill: 88                                          │
│    - Hard Skill: 92                                          │
│    - Attitude: 90                                            │
│    - Average: 90.00 (Excellent)                             │
│ 3. Write remarks                                             │
│ 4. Generate attendance report                                │
│                                                              │
│ [Admin]                                                      │
│ 5. Review final reports                                      │
│ 6. Approve certificate generation                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FINAL: Certificate Generation & Verification                │
└─────────────────────────────────────────────────────────────┘
```

---

### 6.2 Certificate Generation (Admin)

**Langkah 1: Configure Certificate Settings**
```
URL: /CertificateScanner (Tab: Settings)
Aksi:
1. Login sebagai Admin
2. Navigate to Certificate Scanner
3. Klik tab "Certificate Settings"
4. Configure:
   - Pejabat Penandatangan:
     * Nama: "Dr. Ir. Budi Santoso, M.M."
     * Jabatan: "Kepala Divisi SDM"
     * Kota: "Bandung"
   - Template Settings:
     * Logo: [Upload logo Telkom]
     * Header color: #E30613 (Telkom red)
5. Preview certificate template
6. Save settings
```

**Langkah 2: Generate Certificate**
```
URL: /ManagementData (User Detail)
Aksi:
1. Cari participant yang sudah selesai magang
2. Klik "View Details"
3. Tab "Certificate":
   - Verify completion:
     ✓ Internship period completed
     ✓ Assessment available (Score: 90.00)
     ✓ Attendance rate: 95%
   - Klik "Generate Certificate"
4. System generates:
   - Certificate Number: CERT-2026-02-001
   - QR Code: [Unique QR untuk verification]
   - PDF Certificate dengan:
     * Participant name
     * Unit
     * Period
     * Assessment score & predicate
     * Signature (pejabat SDM)
     * QR code
5. Download PDF
6. Send to participant (email/download link)
```

**Highlight Points:**
- "Nomor sertifikat unik untuk setiap participant"
- "QR code untuk quick verification"
- "Desain profesional sesuai branding Telkom"

---

### 6.3 Certificate Verification (Public)

**Langkah 3: Scan & Verify Certificate**
```
URL: /CertificateScanner (Tab: Scanner)
Aksi:
1. Buka halaman scanner (bisa tanpa login)
2. Input method:
   Option A: Scan QR Code
   - Klik "Scan QR"
   - Allow camera access
   - Arahkan ke QR code di sertifikat
   - Auto-detect dan verify
   
   Option B: Manual Input
   - Input certificate number: CERT-2026-02-001
   - Klik "Verify"

3. Hasil Verification:
   ┌─────────────────────────────────────────┐
   │ ✓ CERTIFICATE VALID                     │
   ├─────────────────────────────────────────┤
   │ Participant: John Doe                   │
   │ Unit: IT Development                    │
   │ Period: 1 Feb - 28 Feb 2026            │
   │ Assessment Score: 90.00 (Excellent)     │
   │ Soft Skill: 88                          │
   │ Hard Skill: 92                          │
   │ Attitude: 90                            │
   │ Attendance Rate: 95%                    │
   │                                         │
   │ Issued by: Dr. Ir. Budi Santoso, M.M.  │
   │ Position: Kepala Divisi SDM             │
   │ Date: 28 Feb 2026                       │
   │                                         │
   │ Status: ✓ VERIFIED                      │
   └─────────────────────────────────────────┘

4. Additional Info:
   - Scan history (untuk admin)
   - Verification timestamp
   - IP address (security)
```

**Skenario Invalid Certificate:**
```
Input: CERT-FAKE-999
Result:
┌─────────────────────────────────────────┐
│ ✗ CERTIFICATE INVALID                   │
├─────────────────────────────────────────┤
│ Certificate number not found in system  │
│ This certificate may be fake or expired │
│                                         │
│ Please contact:                         │
│ sdm@telkomuniversity.ac.id             │
└─────────────────────────────────────────┘
```

**Highlight Points:**
- "Verifikasi instant untuk validasi keaslian"
- "QR code scan untuk kemudahan"
- "Public access tanpa login"
- "Audit trail untuk security"

---

## 7. Tips Presentasi

### 7.1 Persiapan Teknis

**Sebelum Demo:**
1. **Clear browser cache** untuk performa optimal
2. **Zoom browser** ke 100% untuk tampilan konsisten
3. **Disable notifications** untuk menghindari gangguan
4. **Prepare backup data** jika ada error
5. **Test all flows** minimal 1x sebelum demo

**Selama Demo:**
1. **Narasi jelas** untuk setiap aksi
2. **Highlight key features** dengan pointer/cursor
3. **Explain business value** bukan hanya fitur teknis
4. **Show error handling** untuk kredibilitas
5. **Interactive** - ajak audience bertanya

---

### 7.2 Key Talking Points

**Untuk Stakeholder Bisnis:**
- ✅ "Sistem ini menghemat 70% waktu administrasi manual"
- ✅ "Real-time monitoring meningkatkan accountability"
- ✅ "Automated reporting mengurangi human error"
- ✅ "Certificate verification mencegah pemalsuan"

**Untuk Stakeholder Teknis:**
- ✅ "Built with Next.js 14 untuk performa optimal"
- ✅ "PostgreSQL dengan Prisma ORM untuk data integrity"
- ✅ "Row Level Security untuk multi-tenant isolation"
- ✅ "Responsive design untuk mobile & desktop"

**Untuk End Users:**
- ✅ "Interface intuitif, mudah digunakan"
- ✅ "Mobile-friendly untuk check-in di lapangan"
- ✅ "Notifikasi real-time untuk update status"
- ✅ "Self-service untuk mengurangi ketergantungan admin"

---

### 7.3 Handling Q&A

**Pertanyaan Umum:**

**Q: "Bagaimana jika participant lupa check-out?"**
A: "Sistem akan auto-reminder via notifikasi. Admin juga bisa manual update jika diperlukan."

**Q: "Apakah bisa check-in tanpa GPS?"**
A: "Untuk keamanan, GPS wajib. Tapi participant bisa request monitoring location untuk lokasi khusus."

**Q: "Bagaimana mencegah pemalsuan sertifikat?"**
A: "Setiap sertifikat punya nomor unik + QR code. Verifikasi langsung ke database, tidak bisa dipalsukan."

**Q: "Apakah data aman?"**
A: "Ya, menggunakan PostgreSQL dengan Row Level Security, HTTPS, dan audit logging."

**Q: "Bisa integrasi dengan sistem HR yang ada?"**
A: "Ya, kami menyediakan REST API untuk integrasi. Export Excel juga bisa diimport ke sistem lain."

---

### 7.4 Demo Script Template

**Opening (1 menit):**
```
"Selamat pagi/siang. Hari ini saya akan demo Puti Internship Management System,
solusi digital untuk mengelola program magang di Telkom University.

Sistem ini melayani 3 role utama:
- Admin: untuk manajemen sistem
- Supervisor: untuk monitoring tim
- Participant: untuk daily activities

Mari kita mulai dari journey seorang participant..."
```

**Transition antar Skenario:**
```
"Sekarang kita sudah lihat dari sisi participant. 
Selanjutnya, mari kita lihat bagaimana supervisor memonitor dan mengevaluasi..."
```

**Closing (1 menit):**
```
"Jadi, dari demo tadi kita sudah lihat complete journey:
1. Admin setup system & users
2. Participant daily check-in/out
3. Supervisor monitoring & assessment
4. Certificate generation & verification

Sistem ini tidak hanya digitalisasi, tapi juga meningkatkan:
- Efisiensi: 70% lebih cepat
- Akurasi: Real-time data
- Transparansi: Semua terekam
- Security: Certificate verification

Apakah ada pertanyaan?"
```

---

## 8. Troubleshooting Demo

### 8.1 Common Issues

**Issue: Login gagal**
```
Solusi:
1. Cek koneksi internet
2. Verify OAuth credentials
3. Clear cookies & retry
4. Gunakan backup account
```

**Issue: GPS tidak terdeteksi**
```
Solusi:
1. Allow location permission di browser
2. Gunakan HTTPS (localhost ok)
3. Fallback: manual input coordinates
```

**Issue: Export PDF error**
```
Solusi:
1. Cek browser compatibility (Chrome recommended)
2. Disable popup blocker
3. Fallback: export Excel
```

**Issue: Database connection error**
```
Solusi:
1. Cek PostgreSQL service running
2. Verify DATABASE_URL env variable
3. Restart dev server
4. Gunakan backup database
```

---

## 9. Post-Demo Checklist

**Setelah Demo:**
- [ ] Collect feedback dari audience
- [ ] Note down questions yang belum terjawab
- [ ] Share demo recording (jika direkam)
- [ ] Send follow-up email dengan:
  - Demo summary
  - Documentation links
  - Next steps
- [ ] Update demo script berdasarkan feedback

**Metrics to Track:**
- Jumlah pertanyaan (engagement indicator)
- Feature requests
- Concerns/blockers
- Overall sentiment (positive/neutral/negative)

---

## 10. Appendix

### 10.1 Sample Data for Demo

**Admin Account:**
```json
{
  "email": "admin@telkomuniversity.ac.id",
  "name": "Admin Puti",
  "role": "admin"
}
```

**Supervisor Account:**
```json
{
  "email": "supervisor@telkomuniversity.ac.id",
  "name": "Budi Supervisor",
  "role": "supervisor",
  "unit": "IT Development"
}
```

**Participant Account:**
```json
{
  "email": "participant@telkomuniversity.ac.id",
  "name": "John Doe",
  "role": "participant",
  "unit": "IT Development",
  "internship_start": "2026-02-01",
  "internship_end": "2026-02-28"
}
```

---

### 10.2 Quick Reference - URLs

| Role | Dashboard URL | Key Features |
|------|---------------|--------------|
| **Admin** | `/dashboard` | User mgmt, Units, Reports, Scanner |
| **Supervisor** | `/dashboardsuper` | Monitoring, Assessment, Export |
| **Participant** | `/dashboarduser` | Check-in/out, Requests, Profile |

---

### 10.3 Feature Checklist

**Admin Features:**
- [x] Dashboard analytics
- [x] User CRUD
- [x] Bulk import users
- [x] Unit management
- [x] Reports monitoring
- [x] Map settings (geofencing)
- [x] Certificate scanner
- [x] Certificate settings
- [x] Audit logs

**Supervisor Features:**
- [x] Unit dashboard
- [x] Attendance monitoring
- [x] Approve/reject monitoring requests
- [x] Approve/reject leave requests
- [x] Assessment/penilaian
- [x] Export reports (PDF/Excel/Word)
- [x] Team map view

**Participant Features:**
- [x] Personal dashboard
- [x] Check-in/check-out
- [x] Activity description
- [x] Monitoring location request
- [x] Leave request (sick/permit)
- [x] View assessment
- [x] Attendance history
- [x] Profile management

---

## 🎬 Ready to Demo!

**Final Checklist:**
- [ ] Server running ✓
- [ ] Database connected ✓
- [ ] Test accounts ready ✓
- [ ] Browser tabs prepared ✓
- [ ] Demo script reviewed ✓
- [ ] Backup plan ready ✓

**Good luck with your demo! 🚀**

---

**Document Version:** 1.0  
**Last Updated:** 26 Januari 2026  
**Maintained by:** Development Team  
**Contact:** dev@telkomuniversity.ac.id
