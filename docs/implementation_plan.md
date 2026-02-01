# Rencana Strategis & Roadmap Audit Proyek

Dokumen ini merangkum temuan dari audit seluruh proyek dan mengusulkan roadmap untuk meningkatkan kualitas kode ke standar "Premium", dengan fokus pada stabilitas, kemudahan pemeliharaan, dan fitur-fitur canggih.

## 1. Temuan Audit Teknis

### 🏗️ Arsitektur & Pemeliharaan
- **Komponen Terlalu Besar**: File seperti [ManagementData.tsx](file:///c:/antigravity/Project-puti-main-1%20-%20postgreSQL/src/views/other/Admin/ManagementData.tsx) dan view serupa bersifat monolitik (1200+ baris).
    > [!WARNING]
    > Beban teknis (technical debt) yang tinggi. Perlu dipecah menjadi komponen yang lebih kecil seperti `UserTable.tsx`, `UnitDialog.tsx`, dll.
- **Keamanan Server Actions**: Beberapa Server Actions belum memiliki pengecekan `getServerSession` yang eksplisit.
    > [!CAUTION]
    > Potensi risiko keamanan. Aksi yang hanya untuk Admin harus memverifikasi role di sisi server.
- **Keamanan Tipe (Type Safety)**: Penggunaan `as any` yang sering di utilitas API.
    > [!IMPORTANT]
    > Perlu penegakan interface yang ketat untuk mencegah crash saat runtime.

### 🐞 Masalah Potensial
- **Konsistensi Tanggal**: Risiko perbedaan timezone antara frontend (lokal) dan backend (UTC) pada modul Absensi dan Pengajuan Izin.
- **Error Boundaries**: Kurangnya penanganan error global untuk kegagalan panggilan API selain log konsol sederhana.

---

## 2. Roadmap Fitur yang Diusulkan

### 💎 Peningkatan "Premium"
1.  **Audit Log Aktivitas**: (Selesai ✅) Mengimplementasikan sistem untuk melacak semua perubahan administratif (Siapa, Apa, Kapan).
    - Database schema `audit_logs` ditambahkan.
    - Utilitas `logAudit` terintegrasi di User, Unit, Leave, Monitoring, dan Settings API.
    - API `getAuditLogs` tersedia untuk dashboard Admin.
2.  **Analitik Lanjutan**: Mengubah Dashboard dengan visualisasi Chart.js yang interaktif untuk tren absensi dan performa unit.
3.  **Notifikasi Real-time**: Pusat notifikasi terintegrasi untuk pembaruan pengajuan izin dan pengingat penilaian.
4.  **Manajemen Bukti (Evidence)**: Memperluas penggunaan `react-dropzone` khusus untuk mengunggah bukti fisik izin dan foto profil.

### 🛠️ Tugas Optimasi
1.  **Form Validation**: Memastikan `Formik` + `Yup` diterapkan secara konsisten pada semua form untuk validasi sisi klien yang kuat.
2.  **Status Loading Global**: Menstandarisasi layar "Skeleton" atau loader premium selama proses pengambilan data.
3.  **Polesan Mobile**: Menyesuaikan perilaku responsif tabel yang kompleks untuk pengalaman mobile yang mulus.

---

## 3. Tahap Implementasi

### Tahap 1: Fondasi & Keamanan (Selesai ✅)
- [x] Implementasi pengecekan `getServerSession` di semua Server Actions & API.
- [x] Refaktor [ManagementData.tsx](file:///c:/antigravity/Project-puti-main-1%20-%20postgreSQL/src/views/other/Admin/ManagementData.tsx) menjadi komponen yang terkategorisasi.
- [x] Lanjutkan refaktor view monolitik lainnya (Assessment, Attendance, Dashboard).
- [x] Standarisasi tipe respons API di `src/types/api.ts` dan audit penggunaan `any`.
- [x] Implementasi **Centralized API Error Handling** (Toast global untuk 401, 500, dll).
- [x] Resolusi **SSR Context & Hydration Errors** (Next.js 14 infrastructure stabilization).

### Tahap 2: Ekspansi Fitur & Pembersihan (Sedang Berjalan 🏃‍♂️)
- [x] Membuat tabel `AuditLog` and middleware untuk logging aktivitas sensitif.
- [x] Implementasi alur Upload Bukti untuk Pengajuan Izin (Integrasi `react-dropzone`).
- [x] Perbaikan **Consistency Tanggal**: Migrasi ke `date-fns-tz` untuk memastikan sinkronisasi timezone WIB (Asia/Jakarta).
- [x] Meningkatkan Dashboard dengan grafik detail (Chart.js / Recharts).
- [x] Standarisasi **Form Validation** menggunakan `Formik` + `Yup` secara menyeluruh.

### Tahap 3: Penyempurnaan & Faktor "Wow" (Jangka Panjang)
- [ ] Fitur pencarian global di seluruh platform.
- [ ] Optimasi Dark Mode.
- [ ] Opsi Ekspor tingkat lanjut (PDF dengan watermark/branding).

## Rencana Verifikasi

### Tes Otomatis
- Jalankan `npm run lint` untuk mengidentifikasi masalah sintaks/gaya yang tersembunyi.
- Gunakan Playwright untuk menguji alur kritis (Login -> Edit Profile -> Simpan).

### Verifikasi Manual
- Verifikasi akses berdasarkan role dengan login sebagai pengguna yang berbeda.
- Uji responsivitas dengan mengubah ukuran browser ke dimensi mobile.
