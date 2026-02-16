# 📁 SISTEM ARSIP INSTITUSI

## 🎯 OVERVIEW

Sistem Arsip Institusi adalah fitur untuk menyimpan dan mengelola dokumen kerjasama serta histori periode magang dari berbagai institusi. Arsip dapat dibuat secara **manual** (upload dokumen) atau **otomatis** (dari approval pendaftaran).

---

## 📊 JENIS ARSIP

### 1. **Arsip Manual** (Upload Dokumen)
- Admin upload dokumen PDF secara manual
- Digunakan untuk dokumen kerjasama, MoU, surat resmi, dll
- File disimpan sebagai base64 di database
- Dapat diedit dan dihapus

### 2. **Arsip Otomatis** (Dari Pendaftaran)
- Dibuat otomatis saat admin approve aplikasi pendaftaran
- Berisi metadata peserta (nama, email, NIM, dll)
- Ditandai dengan badge **"Auto"** berwarna hijau
- Tidak memiliki file PDF fisik, hanya metadata

---

## 🔄 ALUR ARSIP OTOMATIS

```
1. PESERTA SUBMIT FORM PENDAFTARAN
   └─> Data masuk dengan status PENDING

2. ADMIN APPROVE APLIKASI
   └─> /admin/registration/applications
       └─> Klik "Approve & Create Account"

3. SISTEM OTOMATIS MEMBUAT:
   ├─ ✅ User Account (participant)
   ├─ 🔐 Password random
   └─ 📁 ARSIP ENTRY dengan metadata:
       ├─ institution_name: dari form
       ├─ internship_period_start: dari form atau default
       ├─ internship_period_end: dari form atau default
       ├─ document_name: "Registration_[Institusi]_[Nama]_[Timestamp].pdf"
       └─ document_url: JSON metadata
           {
             "source": "registration_form",
             "form_id": "xxx",
             "submission_id": "xxx",
             "participant_name": "John Doe",
             "participant_email": "john@example.com",
             "participant_id_number": "123456",
             "approved_at": "2026-02-16T...",
             "note": "Auto-generated from registration form approval"
           }

4. ARSIP MUNCUL DI HALAMAN ARSIP
   └─> /arsip
       └─> Dengan badge "Auto" berwarna hijau
```

---

## 🎨 TAMPILAN DI HALAMAN ARSIP

### Tabel Arsip

| Institusi | Periode Magang | Berkas Kerjasama | Terdaftar | Aksi |
|-----------|---------------|------------------|-----------|------|
| Universitas ABC | 16 Feb 2026 - 16 May 2026 | Registration_Univ_ABC_John_Doe.pdf **[Auto]** | 16/02/2026 | 👁️ ✏️ 🗑️ |
| PT XYZ | 01 Jan 2026 - 01 Apr 2026 | MoU_PT_XYZ.pdf | 10/01/2026 | 👁️ ✏️ 🗑️ |

**Keterangan:**
- Badge **"Auto"** = Arsip dari pendaftaran online
- Tanpa badge = Arsip manual (upload dokumen)

---

## 👁️ MELIHAT ARSIP

### Arsip Manual (dengan PDF)
```
1. Klik tombol dokumen di kolom "Berkas Kerjasama"
2. PDF akan terbuka di tab baru
3. Dapat didownload atau dicetak
```

### Arsip Otomatis (dari Pendaftaran)
```
1. Klik tombol dokumen dengan badge "Auto"
2. Dialog muncul menampilkan:
   
   ┌─────────────────────────────────────┐
   │ Detail Arsip Pendaftaran            │
   ├─────────────────────────────────────┤
   │ 📋 Sumber: Formulir Pendaftaran     │
   │ 👤 Nama: John Doe                   │
   │ 📧 Email: john@example.com          │
   │ 🆔 NIM/ID: 123456789                │
   │ ✅ Disetujui: 16/02/2026 14:30      │
   │ 📝 Catatan: Auto-generated...       │
   │                                     │
   │ ℹ️ Untuk detail lengkap, cek menu   │
   │    "Registration Applications"      │
   └─────────────────────────────────────┘
```

---

## ➕ MENAMBAH ARSIP MANUAL

### Langkah-langkah:

1. **Buka Halaman Arsip**
   ```
   http://localhost:3001/arsip
   ```

2. **Klik "Tambah Arsip Baru"**
   - Dialog form akan muncul

3. **Isi Form:**
   - **Nama Institusi**: Nama institusi/perusahaan
   - **Tanggal Mulai**: Periode magang dimulai
   - **Tanggal Selesai**: Periode magang berakhir
   - **Upload Dokumen**: Pilih file PDF (MoU, surat kerjasama, dll)

4. **Simpan**
   - Arsip akan muncul di tabel
   - File PDF tersimpan sebagai base64

---

## ✏️ MENGEDIT ARSIP

### Arsip Manual:
```
1. Klik icon ✏️ (Edit) di kolom Aksi
2. Dialog edit muncul dengan data existing
3. Ubah data yang diperlukan
4. Upload dokumen baru (opsional)
5. Simpan
```

### Arsip Otomatis:
```
⚠️ Arsip otomatis dari pendaftaran dapat diedit,
   tetapi metadata asli akan hilang dan diganti
   dengan dokumen manual.
   
   Pertimbangkan untuk tidak mengedit arsip otomatis
   agar tetap traceable ke aplikasi pendaftaran asli.
```

---

## 🗑️ MENGHAPUS ARSIP

```
1. Klik icon 🗑️ (Trash) di kolom Aksi
2. Konfirmasi dialog muncul
3. Klik "Ya, Hapus"
4. Arsip terhapus permanen
```

**⚠️ Peringatan:**
- Penghapusan bersifat permanen
- Data tidak dapat dikembalikan
- Hati-hati saat menghapus arsip otomatis karena akan hilang link ke aplikasi pendaftaran

---

## 🔍 PERBEDAAN ARSIP MANUAL VS OTOMATIS

| Aspek | Arsip Manual | Arsip Otomatis |
|-------|-------------|----------------|
| **Sumber** | Upload manual oleh admin | Auto-generated dari approval |
| **File PDF** | ✅ Ada (base64) | ❌ Tidak ada (hanya metadata) |
| **Badge** | - | ✅ Badge "Auto" hijau |
| **Konten** | Dokumen kerjasama, MoU, dll | Metadata peserta |
| **View** | Buka PDF di tab baru | Dialog dengan detail peserta |
| **Edit** | ✅ Bisa diedit | ⚠️ Bisa, tapi tidak disarankan |
| **Delete** | ✅ Aman dihapus | ⚠️ Hati-hati, link ke aplikasi hilang |
| **Traceable** | - | ✅ Terhubung ke submission_id |

---

## 📋 METADATA ARSIP OTOMATIS

Struktur JSON yang disimpan di `document_url`:

```json
{
  "source": "registration_form",
  "form_id": "uuid-form-id",
  "submission_id": "uuid-submission-id",
  "participant_name": "John Doe",
  "participant_email": "john@example.com",
  "participant_id_number": "123456789",
  "approved_at": "2026-02-16T10:30:00.000Z",
  "note": "Auto-generated from registration form approval"
}
```

**Kegunaan Metadata:**
- **Traceable**: Bisa dilacak kembali ke aplikasi pendaftaran asli
- **Audit Trail**: Tahu kapan dan siapa yang diapprove
- **Data Integrity**: Informasi peserta tersimpan di arsip
- **Reporting**: Bisa generate laporan berdasarkan metadata

---

## 🔧 TECHNICAL DETAILS

### Database Schema

```prisma
model InstitutionArchive {
  id                       String   @id @default(uuid())
  institution_name         String
  internship_period_start  DateTime
  internship_period_end    DateTime
  document_name            String
  document_url             String   // Base64 PDF atau JSON metadata
  created_at               DateTime @default(now())
  updated_at               DateTime @updatedAt
}
```

### API Endpoints

```
GET    /api/arsip           - Fetch all archives
POST   /api/arsip           - Create new archive (manual)
PUT    /api/arsip/:id       - Update archive
DELETE /api/arsip/:id       - Delete archive
```

### File Storage

**Arsip Manual:**
- File PDF di-convert ke base64
- Disimpan langsung di database (kolom `document_url`)
- Format: `data:application/pdf;base64,JVBERi0xLjQKJ...`

**Arsip Otomatis:**
- Tidak ada file PDF
- `document_url` berisi JSON string metadata
- Lebih ringan dan cepat

---

## 📊 USE CASES

### 1. **Tracking Kerjasama Institusi**
```
Admin ingin tahu institusi mana saja yang sudah bekerjasama:
→ Buka /arsip
→ Lihat daftar institusi
→ Filter berdasarkan periode
```

### 2. **Audit Trail Pendaftaran**
```
Admin ingin cek siapa yang diapprove dari Universitas ABC:
→ Buka /arsip
→ Cari "Universitas ABC"
→ Klik dokumen dengan badge "Auto"
→ Lihat detail peserta yang diapprove
```

### 3. **Generate Laporan Periode**
```
Admin ingin laporan institusi periode Feb-May 2026:
→ Buka /arsip
→ Filter periode Feb-May 2026
→ Export data (future feature)
```

### 4. **Menyimpan Dokumen Kerjasama**
```
Admin terima MoU dari PT XYZ:
→ Buka /arsip
→ Klik "Tambah Arsip Baru"
→ Isi data institusi
→ Upload file MoU.pdf
→ Simpan
```

---

## 🚀 FUTURE IMPROVEMENTS

### 1. **Generate PDF Otomatis**
```typescript
// Saat approval, generate PDF dengan data peserta
const pdfBuffer = await generateRegistrationPDF({
  participant: createdUser,
  institution: application.institution_name,
  approvedBy: session.user.name,
  approvedAt: new Date()
});

// Save to file system atau cloud storage
const pdfUrl = await uploadToStorage(pdfBuffer);

// Save URL to archive
await prisma.institutionArchive.create({
  data: {
    ...archiveData,
    document_url: pdfUrl
  }
});
```

### 2. **File Upload Support di Registration Form**
```typescript
// Tambah field type "file" di form builder
// Peserta upload dokumen saat pendaftaran
// File tersimpan dan otomatis masuk ke arsip saat approval
```

### 3. **Cloud Storage Integration**
```typescript
// Gunakan AWS S3, Google Cloud Storage, atau Azure Blob
// Untuk menyimpan file PDF
// Lebih scalable dan efficient
```

### 4. **Advanced Search & Filter**
```typescript
// Filter by:
// - Institution name
// - Date range
// - Archive type (manual/auto)
// - Participant name (for auto archives)
```

### 5. **Bulk Operations**
```typescript
// Select multiple archives
// Bulk delete
// Bulk export to ZIP
```

### 6. **Archive Statistics Dashboard**
```typescript
// Total archives
// Archives by institution
// Archives by period
// Auto vs Manual ratio
```

---

## ⚠️ BEST PRACTICES

### 1. **Jangan Hapus Arsip Otomatis Sembarangan**
- Arsip otomatis adalah audit trail
- Hapus hanya jika benar-benar salah/duplikat
- Pertimbangkan untuk soft delete

### 2. **Gunakan Naming Convention yang Jelas**
```
✅ Good:
- MoU_Universitas_ABC_2026.pdf
- Surat_Kerjasama_PT_XYZ_Feb2026.pdf

❌ Bad:
- dokumen1.pdf
- file.pdf
```

### 3. **Backup Dokumen Penting**
- Export arsip secara berkala
- Simpan backup di tempat terpisah
- Gunakan cloud storage untuk redundancy

### 4. **Review Arsip Secara Berkala**
```
- Hapus arsip yang sudah kadaluarsa
- Update dokumen yang diperpanjang
- Arsipkan periode lama ke storage terpisah
```

---

## 🆘 TROUBLESHOOTING

### Problem: "Dummy PDF file" muncul saat klik dokumen

**Penyebab:**
- Arsip lama yang dibuat sebelum update sistem
- `document_url` masih berisi "dummy-url.com"

**Solusi:**
1. Edit arsip tersebut
2. Upload dokumen PDF yang sebenarnya
3. Atau hapus dan buat ulang

### Problem: Badge "Auto" tidak muncul

**Penyebab:**
- Arsip dibuat sebelum fitur auto-badge
- `document_url` bukan JSON metadata

**Solusi:**
- Normal, arsip manual memang tidak ada badge
- Hanya arsip dari pendaftaran yang ada badge

### Problem: Dialog metadata tidak muncul

**Penyebab:**
- `document_url` bukan JSON valid
- Browser cache

**Solusi:**
1. Clear browser cache
2. Refresh halaman
3. Check console untuk error

---

## 📞 SUPPORT

Untuk pertanyaan atau masalah terkait Arsip Institusi:
1. Check dokumentasi ini
2. Check console browser/server untuk error
3. Verify data di database (Prisma Studio)
4. Contact developer team

---

**Last Updated:** 2026-02-16  
**Version:** 2.0.0  
**Author:** System Development Team
