# Project Puti Documentation

## Use Case Diagram
@startuml
skinparam actorStyle awesome
left to right direction
skinparam packageStyle rectangle
skinparam roundcorner 10
skinparam Shadowing true
skinparam usecase {
    BackgroundColor White
    BorderColor DarkSlateGray
    ArrowColor Black
}

' -- Aktor di Sisi Kiri --
actor "Admin" as A
actor "Supervisor" as S

' -- Aktor di Sisi Kanan --
actor "Participant" as P

package "Internship Management System (Project Puti)" {
    
    ' -- Modul Bersama --
    usecase "Autentikasi (Login/Logout)" as UC_Auth
    usecase "Mengelola Profil" as UC_Profile
    usecase "Menerima Notifikasi" as UC_Notify

    ' -- Modul Administrasi (Admin) --
    package "Modul Administrasi" {
        usecase "Manajemen User (CRUD)" as UC_UserMgmt
        usecase "Operasi Recycle Bin" as UC_Recycle
        usecase "Import Peserta Massal" as UC_Import
        usecase "Manajemen Unit" as UC_UnitMgmt
        usecase "Konfigurasi Map" as UC_MapSet
        usecase "Audit Logs" as UC_Audit
        usecase "Verify QR Scanner" as UC_Scanner
    }

    ' -- Modul Monitoring (Supervisor) --
    package "Modul Monitoring & Evaluasi" {
        usecase "Verifikasi Izin/Sakit" as UC_LeaveReview
        usecase "Approve Lokasi WFA" as UC_AreaReview
        usecase "Penilaian Profesional" as UC_Evaluate
        usecase "Rekap & Export Laporan" as UC_Report
        usecase "Monitoring Map Tim" as UC_TeamMap
    }

    ' -- Modul Peserta (Participant) --
    package "Modul Peserta" {
        usecase "Presensi (Check-in/out)" as UC_Attend
        usecase "Input Aktivitas Harian" as UC_Activity
        usecase "Pengajuan Izin/Sakit" as UC_LeaveSub
        usecase "Pengajuan Lokasi Monitoring" as UC_AreaSub
        usecase "Statistik & Poin Performa" as UC_Stats
    }

    ' -- Hubungan Internal --
    UC_Attend <.. UC_Activity : <<include>>
    UC_UserMgmt <.. UC_Recycle : <<extend>>
    UC_UserMgmt <.. UC_Import : <<extend>>
}

' -- Koneksi Admin (Dari KIRI) --
A --> UC_Auth
A --> UC_UserMgmt
A --> UC_UnitMgmt
A --> UC_MapSet
A --> UC_Audit
A --> UC_Scanner
A --> UC_Report

' -- Koneksi Supervisor (Dari KIRI) --
S --> UC_Auth
S --> UC_Profile
S --> UC_LeaveReview
S --> UC_AreaReview
S --> UC_Evaluate
S --> UC_Report
S --> UC_TeamMap

' -- Koneksi Participant (Dari KANAN) --
UC_Auth <-- P
UC_Profile <-- P
UC_Attend <-- P
UC_LeaveSub <-- P
UC_AreaSub <-- P
UC_Stats <-- P
UC_Notify <-- P

@enduml

## Technical Documentation
Silakan lihat detail diagram teknis dan alur sistem pada tautan di bawah ini:

*   📊 **[Flowchart & Logika Sistem](./ppl/Flowchart.md)** (Dapat digunakan untuk CodeToFlow)
*   🔄 **[Sequence Diagram](./ppl/sequence.md)** (Alur interaksi API)
*   🏗️ **[Class Diagram](./ppl/ClassDiagram.md)** (Struktur Database)
*   📈 **[Activity Diagram](./ppl/Activity.md)** (Alur aktivitas user)
