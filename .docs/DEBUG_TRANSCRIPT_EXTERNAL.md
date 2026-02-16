# 🔍 DEBUG GUIDE: Transcript External Integration

## 📊 Logging yang Ditambahkan

Saya telah menambahkan **comprehensive logging** di 3 layer untuk membantu debug:

### 1. Client-Side Logging (BulkImportDialog.tsx)
```
Browser Console akan menampilkan:
✅ Successfully parsed transcript_external: [...]
📋 Participant [Name] has transcript_external: [...]
📊 Total participants parsed: X
📋 Participants with transcript_external: Y
🚀 Starting bulk import...
Sample transcript data: {...}
```

### 2. Server-Side Logging (import-participants.ts)
```
Server Console akan menampilkan:
📊 Processing transcript_external data...
Total newParticipants: X
✅ Found transcript_external for: [Institution Name]
   Criteria: [...]
📋 Total institutions with templates: Y
🔄 Creating template for: [Institution Name]
   Criteria count: Z
   Formatted criteria: {...}
💾 Executing N template upsert operations...
✅ Successfully synced N Assessment Templates
   - [Institution Name] (ID: xxx)
```

## 🧪 Step-by-Step Testing Guide

### STEP 1: Buka Browser Console
1. Buka aplikasi di browser (http://localhost:3001)
2. Tekan **F12** untuk buka Developer Tools
3. Pilih tab **Console**
4. **JANGAN TUTUP** console ini selama testing

### STEP 2: Download Template
1. Login sebagai Admin
2. Buka **Management Data** > Tab **Users**
3. Klik tombol **Bulk Import**
4. Pilih minimal 1 unit
5. Klik **DOWNLOAD TEMPLATE & CONTINUE**
6. File Excel akan terdownload

### STEP 3: Isi Template Excel
1. Buka file Excel yang baru didownload
2. Lihat **Sheet 1: 📋 Participant Data**
3. Isi data peserta dengan **WAJIB** mengisi kolom:
   - **Full Name**: Nama peserta
   - **Personal Gmail / Email**: Email pribadi
   - **Phone Number**: Nomor telepon
   - **Origin Institution**: **PENTING!** Nama institusi (contoh: "SMK Negeri 1")
   - **Units**: Nama unit (sudah terisi otomatis)
   - **Internship Start**: Tanggal mulai
   - **Internship End**: Tanggal selesai
   - **Transcript External Institution**: **INI YANG PENTING!**

### STEP### 4. Format Kolom Transcript External
**MUDAH!** Sekarang Anda cukup menulis text biasa. Satu kriteria per baris.

**Aturan Format:**
- ✅ Tulis kriteria secara langsung.
- ✅ Gunakan **Alt+Enter** di Excel untuk membuat baris baru.
- ✅ Setiap baris akan otomatis menjadi 1 kriteria penilaian.
- ✅ Sistem tetap mendukung format JSON lama sebagai cadangan.

**Contoh Format Baru (Rekomendasi):**
```
Siswa mampu membuat kode html
Siswa mampu menambahkan style css pada halaman web
Siswa mampu menambahkan javascript
```

**Contoh Format JSON (Masih Didukung):**
```json
["Kriteria 1", "Kriteria 2", "Kriteria 3"]
```

**Hasil di Sistem:**
Sistem akan memecah baris-baris tersebut menjadi kriteria penilaian yang terpisah secara otomatis.

### STEP 5: Save & Upload
1. **Save** file Excel.
2. Kembali ke browser.
3. Di Bulk Import Dialog, klik tab **2. IMPORT**.
4. Klik area upload atau drag & drop file Excel.
5. **PERHATIKAN CONSOLE!** Harus muncul:
   ```
   ✅ Successfully parsed transcript_external (plain text): [...]
   ```
6. Preview tabel akan menampilkan data yang di-parse.

### STEP 6: Preview Data
1. Setelah file diupload, akan muncul preview tabel.
2. **Cek console lagi**, harus ada:
   ```
   📊 Total participants parsed: X
   📋 Participants with transcript_external: Y
   ```

### STEP 7: Start Import
1. Klik tombol **START IMPORT**.
2. Tunggu proses selesai.
3. Sistem akan otomatis melakukan **UPSERT** pada tabel Assessment Templates di database.

### STEP 8: Check Server Logs
1. Buka **Terminal** tempat `npm run start` berjalan
2. Scroll ke bawah, cari log terbaru
3. **HARUS ADA** log seperti ini:
   ```
   📊 Processing transcript_external data...
   Total newParticipants: X
   ✅ Found transcript_external for: SMK Negeri 1
      Criteria: ["siswa mampu...", ...]
   📋 Total institutions with templates: 1
   🔄 Creating template for: SMK Negeri 1
      Criteria count: 3
      Formatted criteria: {...}
   💾 Executing 1 template upsert operations...
   ✅ Successfully synced 1 Assessment Templates
      - SMK Negeri 1 (ID: xxx-xxx-xxx)
   ```
4. **Jika tidak ada log ini**, berarti data tidak sampai ke server!

### STEP 9: Verify di Management Data
1. Buka **Management Data** > Tab **Assessment Templates**
2. Lihat **sidebar kiri**
3. Harus ada item baru: **SMK Negeri 1** (atau nama institusi yang Anda isi)
4. Klik item tersebut
5. Pilih tab **EXTERNAL EVALUATION**
6. Harus muncul kriteria yang Anda isi di Excel

## 🐛 Troubleshooting

### Problem 1: Console tidak menampilkan "Successfully parsed"
**Penyebab:** Format JSON salah di Excel
**Solusi:**
1. Cek ulang format di Excel
2. Copy-paste contoh yang benar
3. Pastikan tidak ada karakter aneh (smart quotes, dll)

### Problem 2: "Participants with transcript_external: 0"
**Penyebab:** 
- Format JSON tidak valid
- Kolom kosong
- Salah kolom (bukan kolom I)

**Solusi:**
1. Pastikan isi di kolom **I** (Transcript External Institution)
2. Cek format JSON lagi
3. Coba dengan data sederhana dulu: `["Test 1", "Test 2"]`

### Problem 3: Server log tidak muncul
**Penyebab:** Data tidak dikirim ke server
**Solusi:**
1. Cek browser console untuk error
2. Cek Network tab di Developer Tools
3. Pastikan tidak ada error saat klik "START IMPORT"

### Problem 4: Template tidak muncul di Management Data
**Penyebab:** 
- Database error
- Institution name tidak match
- Template creation failed

**Solusi:**
1. Cek server log untuk error
2. Pastikan nama institusi sama persis (case-sensitive)
3. Coba refresh halaman Management Data

## 📋 Checklist Debugging

Gunakan checklist ini untuk memastikan setiap step berhasil:

- [ ] Browser console terbuka
- [ ] Template Excel terdownload
- [ ] Kolom "Origin Institution" terisi
- [ ] Kolom "Transcript External Institution" terisi dengan format JSON valid
- [ ] File Excel tersave
- [ ] Upload file berhasil
- [ ] Console menampilkan "Successfully parsed transcript_external"
- [ ] Console menampilkan "Participants with transcript_external: > 0"
- [ ] Klik "START IMPORT" berhasil
- [ ] Server log menampilkan "Processing transcript_external data"
- [ ] Server log menampilkan "Successfully synced X Assessment Templates"
- [ ] Template muncul di Management Data sidebar
- [ ] Kriteria muncul di tab EXTERNAL EVALUATION

## 🔬 Advanced Debugging

Jika masih tidak berhasil, lakukan ini:

### 1. Test dengan Data Minimal
Buat file Excel dengan **1 peserta saja**:
```
Name: Test User
Email: test@gmail.com
Phone: 08123456789
Origin Institution: TEST INSTITUTION
Transcript External: ["Test Criteria 1", "Test Criteria 2"]
```

### 2. Check Database Directly
Jika Anda punya akses database:
```sql
SELECT * FROM assessment_templates 
WHERE institution_type = 'TEST INSTITUTION';
```

### 3. Screenshot & Share
Jika masih gagal, ambil screenshot:
1. Browser console (semua log)
2. Server terminal (semua log)
3. Excel file (kolom Transcript External)
4. Management Data page (sidebar)

## 📞 Report Format

Jika masih tidak berhasil, berikan info ini:

```
BROWSER CONSOLE LOG:
[paste semua log dari console]

SERVER TERMINAL LOG:
[paste semua log dari terminal]

EXCEL DATA:
Origin Institution: [isi]
Transcript External: [isi]

EXPECTED: Template muncul di Management Data
ACTUAL: [apa yang terjadi]
```

---

**PENTING:** Jangan skip step apapun! Setiap log sangat penting untuk debug.
