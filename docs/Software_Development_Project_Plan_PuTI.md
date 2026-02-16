# RENCANA PROYEK PENGEMBANGAN PERANGKAT LUNAK
# SOFTWARE DEVELOPMENT PROJECT PLAN

**DIREKTORAT PUSAT TEKNOLOGI INFORMASI**  
Kampus Telkom University Gedung D Lantai 2  
Telepon +62 22 7564108 Ekstensi 2433  
Email is@telkomuniversity.ac.id – Website http://is.telkomuniversity.ac.id

---

**Nomor Dokumen / Document ID**: 1515/APP-PuTI/PP-1.0/1.3/PuTI/2026  
**DOKUMEN RAHASIA**  
**No Revisi/Revision Number**: 000

---

## Versi 1.0
## Aplikasi Puti Internship Management System

**Dikembangkan untuk / Developed for:**  
Universitas Telkom

**Tanggal**: 9 Februari 2026

---

**Disetujui oleh:**

- **[Nama Kepala Urusan Riset TI]** (Kepala Urusan Riset TI)
- **[Nama Kepala Urusan Layanan Pengguna]** (Kepala Urusan Layanan Pengguna)
- **[Nama Kepala Bagian Riset dan Layanan TI]** (Kepala Bagian Riset dan Layanan TI)
- **[Nama Direktur Pusat Teknologi Informasi]** (Direktur Pusat Teknologi Informasi)

---

## DAFTAR PERUBAHAN
### Revision List

| Tanggal<br>Date | Versi<br>Version | No Revisi<br>Revision | Deskripsi Perubahan<br>Description of Changes | Pembuat<br>Author | Pemeriksa<br>Examiner |
|---|---|---|---|---|---|
| 9 Februari 2026 | 1.0 | 000 | Inisialisasi awal kebutuhan sistem manajemen magang | [Nama Developer] | [Nama System Analyst] |

---

_Dokumen Rahasia Hak Cipta ©2026 Direktorat Pusat Teknologi Informasi | 2_

---

## DAFTAR ISI
### Content List

1. [PENDAHULUAN](#1-pendahuluan)
   - 1.1. Tujuan
   - 1.2. Cakupan
   - 1.3. Batasan
   - 1.4. Asumsi
   - 1.5. Definisi, Akronim dan Singkatan

2. [TINJAUAN PROYEK](#2-tinjauan-proyek)
   - 2.1. Ruang Lingkup Pengembangan Proyek
   - 2.2. Deliverables Proyek
   - 2.3. Rencana Anggaran

3. [KEBUTUHAN PENGEMBANGAN PERANGKAT LUNAK DAN PERANGKAT KERAS](#3-kebutuhan-pengembangan-perangkat-lunak-dan-perangkat-keras)
   - 3.1. Analisis Rencana Implementasi
   - 3.2. Serah Terima
   - 3.3. Rencana Pengujian
   - 3.4. Kriteria Penerimaan
   - 3.5. Perencanaan Jumlah Kapasitas User

4. [ORGANISASI PROYEK](#4-organisasi-proyek)
   - 4.1. Struktur Organisasi
   - 4.2. Peran Dan Tanggung Jawab
   - 4.3. Mekanisme Komunikasi

5. [PROSES MANAJEMEN](#5-proses-manajemen)
   - 5.1. Timeline Proyek
   - 5.2. Rencana Pengelolaan Risiko
   - 5.3. Risiko
   - 5.4. Ketergantungan Dengan Layanan Lain

---

_Dokumen Rahasia Hak Cipta ©2026 Direktorat Pusat Teknologi Informasi | 3_

---

## 1. PENDAHULUAN
### Introduction

Dalam pengelolaan program magang, proses administrasi yang manual dan tidak terintegrasi dapat menyebabkan ketidakefisienan dalam monitoring kehadiran, penilaian kinerja peserta, dan dokumentasi program magang. Aplikasi Puti Internship Management System ini diharapkan berfungsi untuk mengelola seluruh siklus program magang secara digital, terstruktur, terdokumentasi, dan terukur.

Aplikasi Puti Internship Management System dikembangkan untuk mendukung proses manajemen magang mulai dari pendaftaran peserta, monitoring kehadiran dengan GPS, penilaian (assessment), hingga penerbitan sertifikat secara otomatis.

### 1.1. TUJUAN
#### Purpose

Tujuan dari pembuatan aplikasi Puti Internship Management System yaitu:

1. Meningkatkan efisiensi dalam pendataan dan pengelolaan program magang
2. Mendukung monitoring kehadiran real-time dengan validasi GPS
3. Mempercepat proses penilaian dan penerbitan sertifikat
4. Meningkatkan transparansi dan akuntabilitas program magang
5. Memfasilitasi komunikasi antara peserta magang, supervisor, dan admin melalui notifikasi otomatis

### 1.2. CAKUPAN
#### Scope

Ruang lingkup Aplikasi Puti Internship Management System mencakup:

1. **Manajemen Pengguna** (Users Management)
   - Admin, Supervisor, dan Participant dengan role-based access control
   - Soft delete dan restore untuk users
   - Bulk operations untuk efisiensi pengelolaan

2. **Manajemen Unit** (Units Management)
   - Pengelolaan unit/divisi tempat magang
   - Soft delete dan restore untuk units
   - Assignment supervisor ke unit

3. **Manajemen Kehadiran** (Attendance Management)
   - Check-in/check-out dengan GPS validation
   - Foto selfie saat absensi
   - Location request approval untuk absensi di luar area
   - Pagination dengan animasi (5 records per page)

4. **Manajemen Cuti/Izin** (Leave Management)
   - Pengajuan izin/sakit dengan upload dokumen
   - Approval workflow oleh supervisor
   - Rules dan kebijakan cuti yang dapat dikonfigurasi

5. **Manajemen Penilaian** (Assessment Management)
   - Assessment template (internal dan eksternal)
   - Manual template selection oleh supervisor
   - Penilaian berdasarkan kriteria yang telah ditentukan

6. **Manajemen Sertifikat** (Certificate Management)
   - Generate certificate PDF 3 halaman (Sertifikat, Transkrip Internal, Transkrip Eksternal)
   - QR Code scanner untuk verifikasi sertifikat
   - Acceptance letter generation

7. **Manajemen Dokumen** (Document Management / Arsip)
   - Upload, view, download, dan delete dokumen institusi
   - Storage management untuk file dokumen

8. **Sistem Notifikasi** (Notification System)
   - Telegram bot integration
   - 3 jenis notifikasi otomatis: Attendance Reminder, Late Alert, Absence Alert
   - Custom Telegram ID per user
   - Notification templates dengan variables

9. **Laporan dan Monitoring** (Reports & Monitoring)
   - Dashboard analytics dengan visualisasi grafik
   - Generate attendance report (Excel/PDF export)
   - Real-time monitoring kehadiran

10. **Pengaturan Sistem** (System Settings)
    - Map settings dengan layout 3 kolom
    - Attendance time rules
    - Leave management rules
    - Location & precision settings

11. **Form Builder**
    - Dynamic form creation
    - File upload field support
    - Bulk import participants dari Excel

### 1.3. BATASAN
#### Limitation

Batasan dalam pengembangan Aplikasi Puti Internship Management System yaitu:

1. Ada pembatasan akses berdasarkan peran dan tanggung jawab masing-masing pengguna. Dalam pengembangan Aplikasi Puti Internship Management System, hanya pengguna dengan role tertentu (Admin, Supervisor, Participant) yang dapat mengakses fitur-fitur spesifik.

2. Fitur GPS validation untuk check-in/check-out memerlukan permission lokasi dari device pengguna dan koneksi internet yang stabil.

3. Notifikasi Telegram memerlukan user untuk melakukan setup Telegram Chat ID di profile mereka terlebih dahulu.

4. Aplikasi Puti Internship Management System menggunakan NextAuth untuk authentication dan terbatas pada metode login SSO untuk Supervisor dan Participant, serta password-based untuk Admin.

5. Concurrent user atau jumlah user yang mengakses aplikasi secara bersamaan dibatasi berdasarkan kapasitas server yang tersedia.

---

_Dokumen Rahasia Hak Cipta ©2026 Direktorat Pusat Teknologi Informasi | 4_

---

### 1.4. ASUMSI
#### Assumption

Adapun asumsi-asumsi terkait dengan pengembangan Aplikasi Puti Internship Management System, yaitu:

1. Aplikasi Puti Internship Management System dikembangkan sesuai dengan jadwal yang telah disepakati. Perubahan persyaratan yang signifikan di luar kesepakatan dapat mempengaruhi jadwal penyelesaian proyek.

2. Para stakeholder (Admin, Supervisor, Participant) telah memahami alur dan peran mereka masing-masing dalam sistem.

3. Infrastruktur server dan database (PostgreSQL) telah tersedia dan siap digunakan.

4. Peserta magang memiliki smartphone dengan GPS dan kamera untuk fitur attendance.

5. Supervisor memiliki akun Telegram untuk menerima notifikasi otomatis.

### 1.5. DEFINISI, AKRONIM DAN SINGKATAN
#### Definition, Acronym and Abbreviation

Berikut merupakan list definisi, akronim, dan singkatan yang digunakan pada Aplikasi Puti Internship Management System.

**Table 1 Definisi, Akronim, dan Singkatan**

| Istilah | Definisi, Akronim dan Singkatan |
|---|---|
| **PuTI** | Puti Internship Management System - Sistem Manajemen Magang Puti |
| **Admin** | Administrator yang memiliki full access ke semua fitur sistem |
| **Supervisor** | Pembimbing magang yang memonitor dan menilai peserta |
| **Participant** | Peserta magang yang menggunakan sistem untuk absensi dan reporting |
| **Unit** | Divisi atau departemen tempat peserta magang ditempatkan |
| **Check-in** | Proses absensi masuk dengan GPS validation dan foto selfie |
| **Check-out** | Proses absensi keluar dengan durasi kerja yang tercatat |
| **GPS Validation** | Validasi lokasi menggunakan koordinat GPS dengan radius check |
| **Soft Delete** | Penghapusan data yang bersifat sementara (bisa di-restore) |
| **Permanent Delete** | Penghapusan data secara permanen dari database |
| **Bulk Operations** | Operasi yang dilakukan terhadap multiple records sekaligus |
| **Assessment Template** | Template penilaian dengan kriteria yang telah ditentukan |
| **Internal Assessment** | Penilaian yang dilakukan oleh supervisor internal |
| **External Assessment** | Penilaian yang dilakukan berdasarkan kriteria institusi eksternal |
| **Telegram Bot** | Automated messaging system untuk notifikasi via Telegram |
| **Telegram Chat ID** | Unique identifier untuk user Telegram sebagai penerima notifikasi |
| **Cron Job** | Scheduled task yang berjalan otomatis pada waktu tertentu |
| **Attendance Reminder** | Notifikasi otomatis di pagi hari mengingatkan untuk absen |
| **Late Alert** | Notifikasi ke supervisor jika participant terlambat check-in |
| **Absence Alert** | Notifikasi ke supervisor jika participant tidak check-in |
| **QR Code** | Quick Response code untuk verifikasi keaslian sertifikat |
| **Certificate Scanner** | Fitur untuk scan dan verify QR code pada sertifikat |
| **Acceptance Letter** | Surat penerimaan magang yang di-generate otomatis |
| **Arsip** | Document management system untuk file institusi |
| **Form Builder** | Tool untuk membuat dynamic forms dengan various field types |
| **SSO** | Single Sign-On untuk authentication Supervisor dan Participant |
| **NextAuth** | Authentication library yang digunakan dalam aplikasi |
| **PostgreSQL** | Database management system yang digunakan |
| **API Endpoint** | RESTful API untuk komunikasi antara frontend dan backend |
| **UAT** | User Acceptance Test - pengujian oleh end user |

---

_Dokumen Rahasia Hak Cipta ©2026 Direktorat Pusat Teknologi Informasi | 5_

---

## 2. TINJAUAN PROYEK
### Project Overview

### 2.1. RUANG LINGKUP PENGEMBANGAN PROYEK
#### Analysis Business Process / Business Scope

Aplikasi Puti Internship Management System yang akan dibangun mencakup beberapa fungsionalitas dengan beberapa role user yang berbeda, diantaranya yaitu:

#### A. **Role-Based Access Control**

1. **Admin**
   - Full access ke semua fitur sistem
   - Dapat mengelola users (create, edit, delete, restore)
   - Dapat mengelola units (create, edit, delete, restore)
   - Dapat melakukan bulk operations
   - Dapat mengkonfigurasi system settings (Map Settings, Notification Templates, Bot Configuration)
   - Dapat mengakses semua data dan laporan
   - Dapat upload dan manage dokumen arsip

2. **Supervisor**
   - Dapat memonitor attendance peserta yang dibimbingnya
   - Dapat approve/reject location request dan leave request
   - Dapat melakukan assessment (internal dan external)
   - Dapat memilih assessment template secara manual
   - Dapat generate certificate untuk peserta
   - Dapat melihat reports dan analytics untuk peserta yang dibimbingnya
   - Menerima notifikasi otomatis (Late Alert, Absence Alert)

3. **Participant**
   - Dapat melakukan check-in/check-out dengan GPS validation
   - Dapat upload foto selfie saat attendance
   - Dapat mengajukan leave request dengan upload dokumen
   - Dapat melihat attendance history dan statistics
   - Dapat update profile termasuk Telegram Chat ID
   - Dapat download acceptance letter dan certificate
   - Menerima notifikasi Attendance Reminder

#### B. **Functional Modules**

1. **Authentication & Profile Management**
   - Login dengan SSO (Supervisor & Participant) dan password (Admin)
   - Profile update dengan custom Telegram Chat ID
   - Photo profile upload untuk certificate

2. **Attendance Management**
   - Check-in dengan GPS validation dan foto selfie
   - Check-out dengan durasi kerja yang tercatat
   - Location request approval untuk absensi di luar radius
   - Real-time monitoring dengan pagination 5 records dan smooth animation
   - Filter by date range dan participant name

3. **Leave Management**
   - Pengajuan izin/sakit dengan upload dokumen pendukung
   - Approval workflow oleh supervisor
   - Configurable rules (attendance time, leave policies)

4. **Assessment & Certificate**
   - Internal dan external assessment dengan template
   - Manual template selection oleh supervisor
   - Auto-calculation of scores
   - Generate certificate PDF 3 halaman (Sertifikat, Transkrip Internal, Transkrip Eksternal)
   - QR Code untuk verifikasi keaslian
   - Certificate Scanner untuk public verification

5. **Notification & Automation**
   - Telegram Bot integration
   - Notification templates dengan variables {{name}}, {{date}}
   - 3 notifikasi otomatis:
     - Attendance Reminder (jam 08:00 pagi ke participant)
     - Late Alert (ke supervisor jika participant terlambat)
     - Absence Alert (ke supervisor jika participant tidak absen)
   - Cron jobs untuk automation (`node scripts/local-cron.js`)

6. **Reports & Monitoring**
   - Dashboard analytics dengan visualisasi grafik
   - Attendance reports dengan export ke Excel/PDF
   - Real-time attendance monitoring
   - Statistics dan trend analysis

7. **Document Management (Arsip)**
   - Upload dokumen institusi (PDF, Word, Excel)
   - View & download documents
   - Delete documents (hard/soft delete)
   - Searchable document repository

8. **System Settings**
   - Map Settings dengan layout 3 kolom:
     - Kolom 1: Attendance Time Rules
     - Kolom 2: Leave Management Rules
     - Kolom 3: Location & Precision + Save button
   - Security Geofence (Latitude/Longitude + radius)

9. **Advanced Features**
   - Soft delete & restore untuk Users dan Units
   - Bulk operations (bulk restore, bulk permanent delete)
   - Form Builder dengan file upload field
   - Bulk import participants dari Excel dengan auto-create assessment templates
   - Template integration dari kolom "Transcript External Institution"

10. **API Integration**
    - RESTful API endpoints untuk all CRUD operations
    - Soft delete, restore, permanent delete endpoints
    - Bulk operations endpoints
    - Notification endpoints
    - Authentication endpoints (NextAuth)

### 2.2. DELIVERABLES PROYEK
#### Project Deliverables

Proyek yang akan diserahkan kepada Direktorat Telkom University berupa aplikasi Puti Internship Management System beserta dokumen pendukung seperti:

1. **Aplikasi Web** - Deployed dan running di server production
2. **BAST** (Berita Acara Serah Terima)
3. **Formulir Pengajuan Layanan**
4. **SDKPL** (Spesifikasi dan Desain Kebutuhan Perangkat Lunak)
5. **Form UAT** (User Acceptance Test) - 49 test cases dalam 12 phases
6. **User Manual** - Panduan penggunaan untuk setiap role (Admin, Supervisor, Participant)
7. **Technical Documentation** - API documentation, database schema, deployment guide
8. **Source Code** - Repository dengan version control (Git)

### 2.3. RENCANA ANGGARAN
#### Budget Plan

Proyek pengembangan aplikasi Puti Internship Management System ini termasuk ke dalam skema **in-house development**, sehingga tidak ada anggaran yang dikeluarkan oleh client (user) yang merupakan masih bagian dari unit internal Universitas Telkom.

---

_Dokumen Rahasia Hak Cipta ©2026 Direktorat Pusat Teknologi Informasi | 6_

---

## 3. KEBUTUHAN PENGEMBANGAN PERANGKAT LUNAK DAN PERANGKAT KERAS
### Software Development Requirement

### 3.1. ANALISIS RENCANA IMPLEMENTASI
#### Analysis Implementation Plan

Rencana implementasi aplikasi Puti Internship Management System meliputi rencana implementasi coding, rencana kebutuhan perangkat lunak dan perangkat keras, rencana implementasi testing, serta rencana instalasi.

**Teknologi yang Digunakan:**

Coding dilakukan menggunakan teknologi web modern:

**Frontend:**
- Next.js (React framework)
- TypeScript
- TailwindCSS / Material-UI (Chakra UI)
- Framer Motion (untuk animasi pagination)

**Backend:**
- Next.js API Routes
- TypeScript
- PostgreSQL (database)
- NextAuth (authentication)

**Integration:**
- Telegram Bot API
- GPS/Geolocation API
- PDF Generation Library (jsPDF / pdfkit)
- Excel Processing (xlsx / exceljs)
- QR Code Generator

**Kebutuhan sistem perangkat lunak meliputi:**

1. Visual Studio Code / IDE
2. Node.js (v18+)
3. PostgreSQL Database
4. Git / GitHub
5. Postman (for API testing)
6. Figma (for UI/UX design)
7. Telegram Bot (BotFather)

**Kebutuhan sistem perangkat keras meliputi:**

**Development:**
1. PC/Laptop dengan minimum spec:
   - Processor: Intel Core i5 atau AMD Ryzen 5
   - Memory: 8 GB RAM (minimum), 16 GB (recommended)
   - Storage: SSD 256 GB minimum, 512 GB recommended
   - Internet connection untuk testing API dan Telegram integration

**Production Server:**
1. Server dengan spec:
   - CPU: 4 vCore
   - RAM: 8 GB
   - Storage: 100 GB SSD
   - Bandwidth: Unlimited
   - OS: Linux (Ubuntu Server 20.04+)

**Client (End User):**
1. Smartphone dengan GPS dan kamera (untuk Participant)
2. Browser modern (Chrome, Firefox, Safari, Edge)
3. Internet connection
4. Telegram app (untuk notifikasi)

### 3.2. SERAH TERIMA
#### Acceptance

Serah terima aplikasi Puti Internship Management System akan dilakukan antara pihak tim Riset TI dengan pihak tim Urusan Layanan Pengguna. Kegiatan serah terima aplikasi dikukuhkan dengan penandatanganan dokumen **UAT (User Acceptance Test)** yang mencakup **49 test cases** dalam **12 phases** dengan hasil testing yang success.

### 3.3. RENCANA PENGUJIAN
#### Testing Plan

Pengujian dilakukan oleh Quality Assurance Direktorat Pusat Teknologi Informasi melalui scenario testing yang dibuat sesuai fungsionalitas yang tertera pada SDKPL.

**Jenis Testing:**

1. **Unit Testing** - Testing untuk setiap function/component
2. **Integration Testing** - Testing untuk API endpoints dan database operations
3. **User Acceptance Testing (UAT)** - Testing oleh end user dengan 49 test cases:
   - PHASE 1: Admin Master Setup (3 test cases)
   - PHASE 2: Bulk Operations & Dynamic Conflicts (4 test cases)
   - PHASE 3: Participant Onboarding & Profile (1 test case)
   - PHASE 4: Complex Attendance Scenarios (5 test cases)
   - PHASE 5: Leave Request & Admin Rules (2 test cases)
   - PHASE 6: Certificate & Customization (2 test cases)
   - PHASE 7: Assessment & Scoring (4 test cases)
   - PHASE 8: Notifications & Automation (7 test cases)
   - PHASE 9: Monitoring & Reports (4 test cases)
   - PHASE 10: Document Management (4 test cases)
   - PHASE 11: Advanced Features & Integration (7 test cases)
   - PHASE 12: API & Integration Testing (6 test cases)

4. **Performance Testing** - Testing untuk load dan response time
5. **Security Testing** - Testing untuk authentication, authorization, dan data protection

Setiap periode testing akan dibuatkan laporan pengujiannya melalui scenario testing. Testing dikatakan sudah selesai jika fungsionalitas yang tertera scenario testing mendapati hasilnya **success**.

### 3.4. KRITERIA PENERIMAAN
#### Acceptance Criteria

Aplikasi Puti Internship Management System Universitas Telkom dikatakan layak diterima apabila memenuhi kriteria sebagai berikut:

1. Aplikasi sudah sesuai dengan dokumen project plan dan SDKPL.
2. Semua fitur dan fungsionalitas dapat berjalan sebagaimana mestinya tanpa critical bug.
3. Data yang ditampilkan oleh aplikasi sudah akurat dan sesuai dengan database.
4. **49 test cases UAT** semuanya mendapatkan status **PASS**.
5. **3 jenis notifikasi otomatis** semuanya terkirim dengan benar:
   - Attendance Reminder terkirim ke participant
   - Late Alert terkirim ke supervisor yang tepat
   - Absence Alert terkirim ke supervisor yang tepat
6. GPS validation berfungsi dengan akurat (radius check).
7. Certificate PDF 3 halaman ter-generate dengan layout yang benar.
8. QR Code scanner dapat verify sertifikat dengan akurat.
9. Soft delete, restore, dan bulk operations berfungsi dengan baik.
10. Performance memenuhi standar:
    - Page load time < 3 seconds (First Contentful Paint)
    - API response time < 1 second (GET), < 2 seconds (POST)
11. Security requirements terpenuhi (SSL, authentication, authorization).

### 3.5. PERENCANAAN JUMLAH KAPASITAS USER
#### User Capacity Planning

**Concurrent User:**

Berdasarkan estimasi jumlah peserta magang dan supervisor di Telkom University:

- **Participant**: ~200-300 active users
- **Supervisor**: ~50-100 users
- **Admin**: ~5-10 users

**Total Concurrent Users** yang diperkirakan mengakses aplikasi secara bersamaan: **kurang dari 100 users** pada peak time (jam 08:00-09:00 untuk attendance).

**Storage Estimation:**

- Database: ~5 GB untuk operational data
- File Storage (photos, documents, certificates): ~50 GB per tahun
- Backup: 2x storage capacity

---

_Dokumen Rahasia Hak Cipta ©2026 Direktorat Pusat Teknologi Informasi | 7_

---

## 4. ORGANISASI PROYEK
### Project Organization

### 4.1. STRUKTUR ORGANISASI
#### Organization Structure

Berikut adalah struktur organisasi dari pengerjaan pengembangan proyek aplikasi Puti Internship Management System Universitas Telkom:

**Tim Pengembangan:**

- **System Analyst**: [Nama System Analyst]
- **Frontend Engineer**: [Nama Frontend Engineer]
- **Backend Engineer**: [Nama Backend Engineer]
- **Full Stack Developer**: [Nama Developer] (jika applicable)
- **Data Management**: [Nama Data Management]
- **Data Center**: [Nama Data Center]
- **Quality Assurance**: [Nama QA]
- **UI/UX Designer**: [Nama UI/UX Designer]
- **Technical Writer**: [Nama Technical Writer]

### 4.2. PERAN DAN TANGGUNG JAWAB
#### Roles and Responsibilities

Peran dan tanggung jawab dalam pengembangan proyek aplikasi Puti Internship Management System adalah sebagai berikut:

**Table 2 Peran dan Tanggung Jawab Pengembangan Proyek**

| Peran | Tanggung Jawab |
|---|---|
| **System Analyst** | Menganalisis kebutuhan bisnis sistem manajemen magang dan menerjemahkannya menjadi spesifikasi sistem. Membuat SDKPL, use case diagram, dan business process flow. |
| **Frontend Engineer** | Mengembangkan tampilan dan interaksi antarmuka pengguna aplikasi menggunakan Next.js, TypeScript, dan TailwindCSS. Implementasi responsive design dan animasi (framer-motion). |
| **Backend Engineer** | Mengelola logika bisnis, API endpoints, koneksi ke database PostgreSQL. Implementasi NextAuth untuk authentication, Telegram Bot integration, dan cron jobs. |
| **Data Management** | Mengatur kualitas, keamanan, dan konsistensi data. Mengelola database schema, migrations, dan data validation. |
| **Data Center** | Mengelola infrastruktur server, jaringan, dan ketersediaan sistem. Setup production environment dan monitoring. |
| **Quality Assurance** | Memastikan kualitas aplikasi melalui proses pengujian (unit test, integration test, UAT). Membuat UAT document dengan 49 test cases dan melakukan verification. |
| **UI/UX Designer** | Mendesain pengalaman dan antarmuka pengguna yang mudah digunakan. Membuat mockup di Figma untuk dashboard, attendance, assessment, dan certificate pages. |
| **Technical Writer** | Menyusun dokumentasi teknis yang jelas dan terstruktur. Membuat user manual untuk setiap role (Admin, Supervisor, Participant) dan API documentation. |

### 4.3. MEKANISME KOMUNIKASI
#### Mechanism Communication

Mekanisme komunikasi yang terjadi selama pengembangan proyek aplikasi Puti Internship Management System dengan beberapa cara, diantaranya adalah:

1. **Meeting Berkala**
   - Sprint Planning Meeting (setiap awal sprint)
   - Daily Standup Meeting (optional, untuk tim development)
   - Sprint Review Meeting (setiap akhir sprint)
   - Sprint Retrospective (evaluasi proses)
   - User Meeting (dengan stakeholder untuk requirement gathering dan demo)

2. **Komunikasi Harian**
   - Menggunakan aplikasi pesan **Telegram** sebagai media komunikasi harian
   - Group chat untuk tim development
   - Channel untuk announcement dan updates

3. **Dokumentasi**
   - Shared drive untuk dokumen (Google Drive / OneDrive)
   - Git repository untuk source code dan version control
   - Issue tracking untuk bug dan feature requests

4. **Reporting**
   - Weekly progress report ke stakeholder
   - Sprint report dengan burndown chart
   - UAT report setelah testing phase

---

_Dokumen Rahasia Hak Cipta ©2026 Direktorat Pusat Teknologi Informasi | 8_

---

## 5. PROSES MANAJEMEN
### Process Management

### 5.1. TIMELINE PROYEK
#### Project Timeline

Berikut adalah timeline selama pengerjaan pengembangan aplikasi Puti Internship Management System:

**Table 3 Timeline Proyek Aplikasi Puti Internship Management System**

| Periode | Fase | Aktivitas Utama |
|---|---|---|
| **Desember 2025** | Inisiasi | Project kickoff dan planning, requirement analysis |
| **Januari 2026** | Analisis Kebutuhan | Requirement gathering, analisis proses bisnis manajemen magang, identifikasi stakeholders dan roles |
| **Januari 2026** | Perancangan Sistem | Perancangan arsitektur sistem, database schema design, API design |
| **Februari 2026** | Persiapan (Sprint 0) | Desain UI/UX di Figma, penyiapan environment (development & staging), setup framework (Next.js), setup database PostgreSQL, setup Telegram Bot |
| **Februari 2026** | Pengembangan – Sprint 1 | Implementasi fitur Authentication & Profile Management, Users Management (CRUD, soft delete, restore), Units Management (CRUD, soft delete, restore) |
| **Maret 2026** | Pengembangan – Sprint 2 | Implementasi Attendance Management (check-in/check-out, GPS validation, photo upload), Leave Management (request & approval workflow), Map Settings |
| **April 2026** | Pengembangan – Sprint 3 | Implementasi Assessment Management (templates, scoring), Certificate Generation (PDF 3 halaman, QR Code), Telegram Bot integration, Notification templates |
| **Mei 2026** | Pengembangan – Sprint 4 | Implementasi Reports & Monitoring (dashboard analytics, export Excel/PDF), Document Management (Arsip), Form Builder, Bulk operations, 3 automated notifications (Attendance Reminder, Late Alert, Absence Alert) |
| **Juni 2026** | Testing | Pengujian integrasi sistem, pengujian performa & keamanan, bug fixing, verification 3 automated notifications |
| **Juli 2026** | Deployment & Closure | User Acceptance Test (UAT) dengan 49 test cases dalam 12 phases, deployment ke production server, training untuk end users, dokumentasi final, BAST |

**Total Development Time**: ~7 bulan (Desember 2025 - Juli 2026)

### 5.2. RENCANA PENGELOLAAN RISIKO
#### Risk Management Plan

Risiko merupakan konsekuensi yang terjadi dalam pengembangan perangkat lunak. Rencana pengelolaan risiko pada pengembangan aplikasi Puti Internship Management System yang akan dikembangkan adalah sebagai berikut:

**1. Identifikasi Risiko**

Pada tahap ini dilakukan identifikasi/mengenali risiko apa yang mungkin akan terjadi dari pengembangan aplikasi Puti Internship Management System, seperti:

a. **Risiko Teknis**
   - GPS validation tidak akurat di certain locations
   - Telegram Bot API down atau rate limited
   - Database performance issues dengan large dataset
   - PDF generation gagal untuk certain formats
   - Browser compatibility issues

b. **Risiko Sumber Daya Manusia**
   - Developer dengan pengalaman Next.js/TypeScript yang masih terbatas
   - Kurangnya pelatihan untuk tim QA dalam testing automated notifications
   - Kurangnya komunikasi dan koordinasi antara frontend dan backend team

c. **Risiko Kebutuhan**
   - Adanya permintaan fitur tambahan di tengah development
   - Perubahan business process dari stakeholder
   - Perubahan requirement untuk assessment templates

d. **Risiko Integrasi**
   - Kesulitan dalam integrasi Telegram Bot API
   - Issue dalam setup cron jobs di production server
   - Challenge dalam implement GPS validation dengan akurasi tinggi

**2. Analisis Risiko**

Setiap risiko dianalisis berdasarkan:
- **Probability** (Low / Medium / High)
- **Impact** (Low / Medium / High)
- **Priority** = Probability × Impact

**3. Perencanaan Respon Risiko**

Strategi mitigasi untuk risiko yang teridentifikasi:

a. **Untuk Risiko Teknis:**
   - Melakukan proof of concept (POC) untuk fitur critical seperti GPS validation dan Telegram integration di awal sprint
   - Setup monitoring dan logging untuk detect issues early
   - Implement fallback mechanism (e.g., manual approval jika GPS gagal)

b. **Untuk Risiko SDM:**
   - Melakukan knowledge sharing session antar team members
   - Pair programming untuk transfer knowledge
   - Code review mandatory untuk ensure quality

c. **Untuk Risiko Kebutuhan:**
   - Melakukan presentasi aplikasi secara berkala pada saat sprint development (demo setiap akhir sprint)
   - Change request harus melalui approval dan impact analysis
   - Maintain backlog prioritization dengan stakeholder

d. **Untuk Risiko Integrasi:**
   - Allocate buffer time untuk integration testing
   - Setup sandbox environment untuk testing integration
   - Document integration procedures clearly

**4. Monitoring Risiko**

- Weekly risk review dalam sprint meeting
- Update risk register jika ada risiko baru yang teridentifikasi
- Escalation ke stakeholder jika ada risiko high priority yang tidak bisa di-mitigate oleh tim

### 5.3. RISIKO
#### Risk Analysis

Risiko yang mungkin terjadi dalam pengembangan proyek aplikasi Puti Internship Management System ini di antaranya yaitu:

**1. Risiko Internal**

a. **Human Error**
   - Kesalahan dalam pengisian data pada aplikasi sehingga data tidak akurat
   - Kesalahan konfigurasi Telegram Chat ID sehingga notifikasi tidak terkirim
   - Kesalahan dalam input GPS coordinates untuk location settings

b. **Security Risk**
   - Adanya malware atau cyberattack yang menyerang aplikasi
   - Unauthorized access attempts ke admin panel
   - Data breach untuk sensitive data (personal info, assessment scores)

c. **Technical Issues**
   - Bug atau error yang muncul di production
   - Performance degradation saat peak time (attendance check-in jam 08:00)
   - Database corruption atau data loss
   - Server downtime

d. **Process Risk**
   - Delayed deployment karena UAT tidak pass semua test cases
   - Issue dalam 3 automated notifications (tidak semua terkirim)
   - Certificate PDF generation error

**2. Risiko Eksternal**

a. **Force Majeure**
   - Bencana alam yang mengganggu operasional
   - Pandemic yang mempengaruhi program magang

b. **Kebijakan**
   - Perubahan kebijakan institusi terkait program magang
   - Perubahan regulasi privacy dan data protection
   - Perubahan requirement dari Telegram Bot API

c. **Infrastructure**
   - Internet connection issues yang mempengaruhi GPS validation
   - Server provider issues atau maintenance
   - Third-party service down (Telegram API, SMS gateway)

**Strategi Mitigasi Risiko:**

1. **Untuk Human Error**: Training yang comprehensive untuk end users, validation pada data input
2. **Untuk Security**: Implement SSL, authentication & authorization, regular security audit
3. **Untuk Technical Issues**: Monitoring & alerting, regular backup, disaster recovery plan
4. **Untuk External Risks**: Maintenance mode feature, flexible configuration, alternative solutions (e.g., manual notification jika Telegram down)

### 5.4. KETERGANTUNGAN DENGAN LAYANAN LAIN
#### Dependence with Other Services

Aplikasi Puti Internship Management System memiliki ketergantungan dengan beberapa layanan eksternal dan internal:

**1. Layanan Eksternal:**

a. **Telegram Bot API**
   - Untuk mengirim 3 jenis notifikasi otomatis (Attendance Reminder, Late Alert, Absence Alert)
   - Critical dependency untuk notification feature

b. **GPS/Geolocation Service**
   - Untuk validasi lokasi saat check-in/check-out attendance
   - Browser Geolocation API atau Google Maps API

c. **Email Service** (optional)
   - Untuk backup notification mechanism jika Telegram down
   - Untuk send acceptance letter atau certificate

**2. Layanan Internal:**

a. **Database Server (PostgreSQL)**
   - Core dependency untuk semua data operations
   - Memerlukan regular backup dan high availability

b. **File Storage**
   - Untuk menyimpan photos (attendance selfies, profile pictures)
   - Untuk menyimpan documents (arsip institusi)
   - Untuk menyimpan generated PDFs (certificates, reports)

c. **Authentication Service (NextAuth)**
   - Untuk SSO integration (Supervisor dan Participant)
   - Untuk session management

d. **Cron Job Service**
   - Untuk menjalankan automated notifications schedule
   - Running script: `node scripts/local-cron.js`

**3. Integration Point:**

Tidak ada direct integration dengan sistem lain seperti Service Desk atau HR System saat ini. Namun, sistem dirancang dengan API endpoints yang dapat di-integrate dengan sistem lain di masa depan jika diperlukan.

**Contingency Plan:**

- Jika Telegram API down: Implement fallback ke email notification
- Jika GPS tidak available: Manual approval mechanism oleh supervisor
- Jika database down: Automatic failover ke backup server atau maintenance mode

---

_Dokumen Rahasia Hak Cipta ©2026 Direktorat Pusat Teknologi Informasi | 9_

---

## PENUTUP

Dokumen Software Development Project Plan ini merupakan panduan resmi dalam pengembangan Aplikasi Puti Internship Management System. Dokumen ini akan di-review dan di-update secara berkala sesuai dengan progress dan perubahan requirement yang terjadi selama development lifecycle.

Semua stakeholders diharapkan untuk mengikuti guideline dan timeline yang telah ditetapkan dalam dokumen ini untuk memastikan kesuksesan proyek.

---

**Dokumen ini telah disetujui oleh:**

- Kepala Urusan Riset TI: _________________________
- Kepala Urusan Layanan Pengguna: _________________________
- Kepala Bagian Riset dan Layanan TI: _________________________
- Direktur Pusat Teknologi Informasi: _________________________

**Tanggal Persetujuan**: 9 Februari 2026

---

_Dokumen Rahasia Hak Cipta ©2026 Direktorat Pusat Teknologi Informasi | 10_
