# Transcript External Institution - Feature Documentation

## 📋 Overview
Fitur **Transcript External Institution** memungkinkan admin untuk mendefinisikan kriteria penilaian eksternal yang spesifik untuk setiap institusi asal peserta magang melalui proses Bulk Import.

## 🎯 Tujuan
1. **Standardisasi Penilaian**: Setiap institusi dapat memiliki standar penilaian eksternal yang unik sesuai kurikulum mereka
2. **Otomatisasi**: Template penilaian dibuat/diperbarui secara otomatis saat import peserta
3. **Integrasi Penuh**: Template langsung tersedia di Management Data > Assessment Templates
4. **Fleksibilitas**: Supervisor dapat memilih template yang sesuai saat melakukan penilaian

## 🔄 Alur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Admin Pilih Unit & Download Template                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Pilih unit di Bulk Import Dialog                       │  │
│  │ • Download template Excel dengan kolom baru:             │  │
│  │   "Transcript External Institution"                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Admin Isi Data di Excel                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Contoh isi kolom Transcript External:                    │  │
│  │                                                           │  │
│  │ ["Siswa mampu membuat database",                         │  │
│  │  "Siswa mampu mengoperasikan Microsoft Office",          │  │
│  │  "Siswa mampu bekerja dalam tim",                        │  │
│  │  "Siswa menunjukkan kedisiplinan yang baik"]             │  │
│  │                                                           │  │
│  │ Format: JSON Array dengan string                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Upload & Sistem Parsing                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Sistem membaca file Excel                              │  │
│  │ • Validasi format JSON untuk kolom transcript_external   │  │
│  │ • Preview data sebelum import                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Sinkronisasi Assessment Templates                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Sistem mengelompokkan data per institusi               │  │
│  │ • Untuk setiap institusi dengan transcript_external:     │  │
│  │   - Cek apakah template sudah ada                        │  │
│  │   - Jika ada: UPDATE template dengan kriteria baru       │  │
│  │   - Jika tidak: CREATE template baru                     │  │
│  │ • Simpan ke tabel assessment_templates                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Import Peserta                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Buat akun peserta baru                                 │  │
│  │ • Assign ke unit & supervisor                            │  │
│  │ • Set institution_name sesuai data Excel                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: Template Tersedia di Management Data                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Admin dapat melihat & mengelola template di:             │  │
│  │ Management Data > Assessment Templates                   │  │
│  │                                                           │  │
│  │ Setiap template berisi:                                  │  │
│  │ • institution_type: Nama institusi                       │  │
│  │ • criteria: Array kriteria penilaian                     │  │
│  │ • description: Keterangan auto-generated                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: Supervisor Gunakan Template                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Saat melakukan penilaian eksternal:                      │  │
│  │ • Supervisor pilih peserta                               │  │
│  │ • Sistem otomatis suggest template sesuai institusi      │  │
│  │ • Supervisor dapat memilih template yang sesuai          │  │
│  │ • Isi nilai untuk setiap kriteria                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: Integrasi dengan Transkrip & Sertifikat               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Hasil penilaian tersimpan di database                  │  │
│  │ • Nilai terintegrasi dengan transkrip PDF                │  │
│  │ • Tampil di sertifikat peserta                           │  │
│  │ • Dapat diverifikasi melalui QR code                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📝 Format Data

### Excel Column Format
```
Transcript External Institution (Column I)
Format: JSON Array of Strings

Contoh Valid:
["Kriteria 1", "Kriteria 2", "Kriteria 3"]

Contoh Invalid:
- Kriteria 1, Kriteria 2  ❌ (bukan JSON)
- ['Kriteria 1']          ❌ (gunakan double quotes)
- "Kriteria 1"            ❌ (harus array)
```

### Database Schema
```typescript
model AssessmentTemplate {
  id               String    @id @default(uuid())
  institution_type String    @unique        // Nama institusi
  criteria         Json                     // Array kriteria penilaian
  description      String?                  // Deskripsi template
  created_at       DateTime? @default(now())
  updated_at       DateTime? @default(now())
}
```

## 🔧 Technical Implementation

### File Changes
1. **BulkImportDialog.tsx**
   - Added column "Transcript External Institution" to Excel template
   - Added info sheet explaining the feature
   - Updated parsing logic to read JSON array

2. **import-participants.ts**
   - Added `transcript_external` field to participant interface
   - Implemented template sync logic
   - Added upsert operation for AssessmentTemplate

3. **Excel Template**
   - Sheet 1: Participant Data (with new column)
   - Sheet 2: Unit Info
   - Sheet 3: Transcript Info (NEW - documentation)

### API Flow
```typescript
bulkImportParticipants(unitIds, participants) {
  // 1. Validate & deduplicate participants
  // 2. Check unit capacity
  // 3. Process transcript_external data
  //    - Group by institution
  //    - Upsert AssessmentTemplate for each institution
  // 4. Create participant accounts
  // 5. Return success with template sync info
}
```

## ⚠️ Important Notes

1. **Optional Field**: Kolom transcript_external bersifat opsional. Jika tidak diisi, sistem menggunakan template default.

2. **JSON Validation**: Format harus valid JSON array. Sistem akan skip jika format salah.

3. **Overwrite Behavior**: Jika institusi sudah memiliki template, data baru akan menimpa template lama.

4. **Case Sensitivity**: Nama institusi case-sensitive. "SMK Negeri 1" ≠ "smk negeri 1"

5. **Deduplication**: Sistem otomatis deduplikasi berdasarkan institution_name (lowercase comparison).

## 📊 Success Metrics

Setelah import berhasil, sistem akan menampilkan:
- ✅ Jumlah peserta yang berhasil diimport
- 📋 Jumlah Assessment Templates yang tersinkronisasi
- ⚠️ Peserta yang dilewati (sudah terdaftar/di recycle bin)
- 📊 Peserta yang gagal (kuota penuh)

## 🔗 Integration Points

1. **Management Data Page**: Template dapat dilihat dan diedit manual
2. **Assessment Dialog**: Supervisor dapat memilih template saat penilaian
3. **Transcript Generator**: Kriteria muncul di transkrip PDF
4. **Certificate Generator**: Nilai terintegrasi dengan sertifikat

## 🚀 Future Enhancements

1. Template versioning (track perubahan template)
2. Bulk edit templates via Excel
3. Template approval workflow
4. Template sharing antar institusi
5. Analytics dashboard untuk template usage
