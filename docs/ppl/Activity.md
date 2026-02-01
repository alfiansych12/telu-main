# Activity Diagrams

## Alur Absensi Harian
@startuml
skinparam conditionStyle diamond
skinparam monochrome false

title Activity Diagram: Alur Absensi Harian

|Participant|
start
:Buka Dashboard;
if (Status Hari Ini?) then (Sudah Check-out)
  :Tampilkan Ringkasan "All Done";
  stop
else if (Sedang Izin/Sakit?) then (Ya)
  :Tampilkan Status "Time to Rest";
  :Map Disembunyikan;
  stop
else (Aktif)
  :Sistem Mengambil Koordinat GPS;
  if (Sudah Check-in?) then (Belum)
    |Participant|
    :Klik Tombol Check-in;
    |System API|
    if (Dalam Radius Unit / Ada Izin WFA?) then (Ya)
      :Simpan Record Check-in;
      :Update UI ke State "Checked-in";
    else (Tidak)
      :Tampilkan Opsi Pengajuan Lokasi (WFA);
      stop
    endif
  else (Ya)
  endif
endif

|Participant|
:Input Aktivitas Harian;
:Upload Foto Bukti;
:Klik Tombol Check-out;

|System API|
:Update Tabel Attendance\n(check_out_time & description);
:Kirim Notifikasi Berhasil;

|Participant|
:Tampilkan Ringkasan & Waktu Kerja;
stop
@enduml

## Alur Penilaian Performa
@startuml
skinparam conditionStyle diamond

title Activity Diagram: Alur Penilaian Performa

|Supervisor|
start
:Buka Menu Rekap Penilaian;
:Pilih Peserta Magang;
:Klik "Berikan Penilaian";

|System|
:Tampilkan Form (Soft Skill, Hard Skill, Attitude);

|Supervisor|
:Input Skor (0-100);
:Tulis Catatan/Feedback;
:Klik Submit;

|System|
:Hitung Rata-rata Nilai;
:Simpan ke Tabel Assessments;
:Kirim Notifikasi via WebSocket/Database;

|Participant|
:Terima Notifikasi;
:Buka Dashboard;
:Lihat Hasil Evaluasi;

stop
@enduml
