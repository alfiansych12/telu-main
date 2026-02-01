# Flowchart System (Project Puti)

Dokumen ini berisi logika alur sistem yang dapat digunakan pada **[CodeToFlow](https://codetoflow.com/)** (menggunakan format pseudo-code/JS) atau divisualisasikan langsung di Markdown menggunakan **Mermaid**.

## 1. Alur Presensi Harian (Check-in & Check-out)
Salin kode di bawah ini ke **CodeToFlow.com** untuk melihat flow yang interaktif.

```javascript
// Logic for codetoflow.com
function dailyAttendanceFlow() {
  start();
  openDashboard();
  
  if (isUserOnLeave()) {
    showStatus("Time to Rest");
    hideMap();
    return;
  }

  fetchGPSLocation();

  if (isAlreadyCheckedOut()) {
    showSummary("All Done");
    stop();
  } else if (!isAlreadyCheckedIn()) {
    if (userClicksCheckIn()) {
      calculateDistanceToUnit();
      
      if (isInRadius() || hasWFAApproval()) {
        saveCheckInToDatabase();
        updateUI("Checked-in State");
      } else {
        showAlert("Out of Area");
        offerWFARequest();
      }
    }
  } else {
    // Stage: Checked-in, Waiting for Check-out
    inputDailyActivity();
    uploadEvidencePhoto();
    
    if (userClicksCheckOut()) {
      updateAttendanceRecord();
      sendSuccessNotification();
      showWorkSummary();
    }
  }
  
  stop();
}
```

## 2. Mermaid Flowchart (Direct Markdown Support)
Diagram ini dapat langsung dirender oleh GitHub, VS Code (dengan plugin Mermaid), atau [Mermaid Live Editor](https://mermaid.live/).

### A. Alur Absensi & Geofencing
```mermaid
graph TD
    A[Mulai] --> B{Status Hari Ini?}
    B -- Sedang Izin --> C[Tampilkan 'Time to Rest']
    B -- Sudah Check-out --> D[Tampilkan Ringkasan Kerja]
    B -- Aktif --> E[Ambil Koordinat GPS]
    
    E --> F{Sudah Check-in?}
    F -- Belum --> G[Klik Tombol Check-in]
    G --> H{Dalam Radius / Ada Izin WFA?}
    H -- Ya --> I[Simpan Check-in & Update UI]
    H -- Tidak --> J[Tampilkan Error & Opsi WFA]
    
    F -- Sudah --> K[Input Aktivitas & Upload Foto]
    K --> L[Klik Tombol Check-out]
    L --> M[Update Data di PostgreSQL]
    M --> N[Kirim Notifikasi Berhasil]
    N --> D
    
    C --> O[Selesai]
    D --> O
    J --> O
```

### B. Alur Pengajuan Izin
```mermaid
graph LR
    A[Mulai] --> B[Input Form Izin & Bukti]
    B --> C[Simpan ke Database - Status PENDING]
    C --> D[Kirim Notifikasi ke Supervisor]
    D --> E{Keputusan Supervisor?}
    E -- Disetujui --> F[Update Database - APPROVED]
    E -- Ditolak --> G[Update Database - REJECTED]
    F --> H[Kirim Notifikasi ke Peserta]
    G --> H
    H --> I[Selesai]
```

## Referensi Converter & Tools
Jika Anda ingin menerjemahkan flowchart ke format lain, berikut referensi terbaik:

1.  **[Mermaid Live Editor](https://mermaid.live/)**: Standar industri untuk mengubah teks (Mermaid Syntax) menjadi diagram (SVG/PNG). Sangat direkomendasikan karena integrasi Markdown-nya sangat luas.
2.  **[CodeToFlow](https://codetoflow.com/)**: Sangat bagus jika Anda memiliki logika pemrograman (JavaScript/Java) dan ingin melihat alur logikanya secara otomatis.
3.  **[Draw.io (Integration)](https://app.diagrams.net/)**: Anda bisa mengimpor kode Mermaid/PlantUML ke dalam Draw.io untuk editing manual yang lebih fleksibel.
4.  **[PlantUML Online Server](https://www.plantuml.com/plantuml/)**: Fokus pada diagram teknis yang sangat detail (seperti yang ada di file PPL sebelumnya).
