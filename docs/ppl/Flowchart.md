# 🌊 Final Flowchart Logic - Project Puti (Base on Code)

Dokumen ini adalah referensi final untuk alur kerja sistem **PuTI**, yang disusun berdasarkan logika kode aktual (API, Role, dan Database).

---

### 🎨 Teks Kode Mermaid.js (Final)
Gunakan kode di bawah ini pada [Mermaid Live Editor](https://mermaid.live/) untuk menghasilkan diagram alir.

```mermaid
graph TD
    %% Styling
    classDef admin fill:#f96,stroke:#333,stroke-width:2px;
    classDef super fill:#bbf,stroke:#333,stroke-width:2px;
    classDef part fill:#bfb,stroke:#333,stroke-width:2px;

    Start((Mulai)) --> Login[Halaman Login]
    Login --> Auth{Validasi Role?}
    
    %% Alur Admin
    Auth -- Admin --> AdminDB[Dashboard Admin]
    AdminDB --> SetupUnit[Buat Unit & Kapasitas]
    SetupUnit --> AssignSuper[Assign Supervisor ke Unit]
    AssignSuper --> ImportData[Bulk Import Peserta .xlsx]
    ImportData --> AdminRule[Setting Geofence & Jam Kerja]
    
    %% Alur Participant
    Auth -- Participant --> PartDB[Dashboard User]
    PartDB --> Profile[Update Foto & Profil]
    Profile --> Attend{Klik Check-in}
    Attend -- Luar Radius --> ReqLoc[Ajukan Request Lokasi]
    Attend -- Dalam Radius --> Success[Absensi Berhasil]
    
    %% Alur Supervisor
    Auth -- Supervisor --> SuperDB[Dashboard Supervisor]
    SuperDB --> Monitor[Monitoring Kehadiran Tim]
    Monitor --> Approval{Review Request?}
    Approval -- Izin/Luar Area --> Accept[Approved]
    Accept --> Notify[Notifikasi ke Partisipan]
    
    %% Akhir
    AdminRule --> End((Selesai))
    Success --> End
    Notify --> End

    class AdminDB,SetupUnit,AssignSuper,ImportData,AdminRule admin;
    class SuperDB,Monitor,Approval,Accept super;
    class PartDB,Profile,Attend,ReqLoc,Success part;
```

---

### 📖 Penjelasan Logika (Base on Code)

1.  **Otentikasi & Authorization**:
    *   Sistem memvalidasi kredensial (Telkom SSO/Manual) dan membaca `UserRole` dari database untuk menentukan rute dashboard yang dituju.
2.  **Manajemen Data (Admin)**:
    *   Logika pembuatan unit (`Unit` model) wajib dilakukan sebelum *assignment*. 
    *   Penggunaan *Bulk Import* memvalidasi data excel agar sesuai dengan skema tabel `users`.
3.  **Presensi & Geofencing (Participant)**:
    *   `Check-in` melibatkan deteksi koordinat GPS yang dibandingkan dengan `MapSettings` (API validation).
    *   Jika koordinat di luar radius, sistem memicu pembuatan record pada tabel `monitoring_locations` (Request Loc).
4.  **Monitoring & Evaluasi (Supervisor)**:
    *   Supervisor mengakses record dari `monitoring_locations` dan `leave_requests` untuk melakukan aksi `updateStatus` (Approved/Rejected).
    *   Data penilaian disimpan dalam model `Assessment`.

---
**Status Dokumen:** Final & Verified Based on Source Code.
