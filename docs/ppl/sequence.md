# Sequence Diagrams

## Proses Presensi (Check-in/out)
@startuml
autonumber
skinparam Style strictuml
skinparam SequenceMessageAlignment center
skinparam NoteBackgroundColor #FEFF9C

actor "Participant" as P
participant "Frontend (Dashboard)" as FE
participant "API Route (/api/attendances)" as API
database "PostgreSQL (Prisma)" as DB

== Proses Presensi Masuk (Check-in) ==

P -> FE: Klik Tombol "Check-in"
activate FE

FE -> FE: Get Current Geolocation (GPS)

alt Cek Lokasi (Geofencing)
    FE -> FE: Kalkulasi Jarak ke Unit
    else Di luar Jangkauan & Belum Ada Izin
        FE -> P: Tampilkan Alert "Luar Area" & Tombol Request
    else Lokasi Valid / Ada Izin WFA
        FE -> API: POST /api/attendances\n{coords, check_in_time}
        activate API
        API -> DB: Create Attendance Record\n(Detect status: present/late)
        DB --> API: Success
        API --> FE: HTTP 201 (Created)
        deactivate API
        FE -> FE: Update Dashboard State
        FE --> P: Notifikasi Berhasil
end
deactivate FE

== Proses Presensi Keluar (Check-out) ==

P -> FE: Input Deskripsi & Upload Foto Bukti
activate FE
P -> FE: Klik Tombol "Check-out"

FE -> API: PATCH /api/attendances/{id}\n{check_out_time, activity, photo}
activate API
API -> DB: Update Record (check_out_time, desc)
DB --> API: Success
API --> FE: HTTP 200 (Success)
deactivate API

FE --> P: Tampilkan Pesan "All Done"
deactivate FE
@enduml

## Pengajuan Izin
@startuml
autonumber
skinparam Style strictuml
skinparam SequenceMessageAlignment center
skinparam NoteBackgroundColor #FEFF9C

actor "Participant" as P
actor "Supervisor" as S
participant "Frontend UI" as FE
participant "Backend API" as API
database "Database" as DB

== Tahap 1: Pengajuan Izin ==
P -> FE: Input Form Izin (Sakit/Keperluan)\n& Upload Bukti (File)
activate FE
FE -> API: POST /api/leave-requests
activate API
API -> DB: Insert record (status: PENDING)
API -> DB: Create UserNotification (for Supervisor)
DB --> API: Success
API --> FE: Response Success (Pending)
deactivate API
FE --> P: Notifikasi: "Berhasil Diajukan"
deactivate FE

== Tahap 2: Verifikasi Supervisor ==
S -> FE: Buka Menu "Monitoring Supervisor"
activate FE
FE -> API: GET /api/leave-requests?status=pending
activate API
API -> DB: Fetch list permohonan
DB --> API: Data JSON
API --> FE: Tampilkan List Izin Pending
deactivate API

S -> FE: Klik Tombol "Approve/Reject"
FE -> API: PATCH /api/leave-requests/{id}
activate API
API -> DB: Update record (status: APPROVED)
API -> DB: Create UserNotification (for Participant)
DB --> API: Success
API --> FE: Update Status UI
deactivate API
FE --> S: Tampilkan Pesan Berhasil
deactivate FE
@enduml
