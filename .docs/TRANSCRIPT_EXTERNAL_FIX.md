# Update: Transcript External Integration Fix

## 🔧 Masalah yang Diperbaiki

### Issue
Template yang dibuat melalui Bulk Import **tidak muncul** di halaman Management Data > Assessment Templates.

### Root Cause
Format data yang disimpan tidak sesuai dengan struktur yang diharapkan oleh UI Assessment Settings:

**Format Lama (dari Excel):**
```json
["Kriteria 1", "Kriteria 2", "Kriteria 3"]
```

**Format yang Diharapkan:**
```json
{
  "internal": [
    {
      "key": "soft_skill",
      "label": "Soft Skill",
      "description": "Kemampuan interpersonal",
      "type": "number"
    }
  ],
  "external": [
    {
      "key": "external_1",
      "label": "Kriteria 1",
      "description": "Kriteria penilaian: Kriteria 1",
      "type": "number"
    }
  ]
}
```

## ✅ Solusi yang Diimplementasikan

### 1. Converter Function
Menambahkan logic di `import-participants.ts` untuk mengkonversi array string menjadi struktur `AssessmentCriteria` yang lengkap:

```typescript
const formattedCriteria = {
    internal: [
        {
            key: 'soft_skill',
            label: 'Soft Skill',
            description: 'Kemampuan interpersonal dan komunikasi',
            type: 'number'
        },
        {
            key: 'hard_skill',
            label: 'Hard Skill',
            description: 'Kemampuan teknis dan profesional',
            type: 'number'
        },
        {
            key: 'attitude',
            label: 'Attitude',
            description: 'Sikap dan etika kerja',
            type: 'number'
        }
    ],
    external: criteriaArray.map((criteriaText, index) => ({
        key: `external_${index + 1}`,
        label: criteriaText,
        description: `Kriteria penilaian: ${criteriaText}`,
        type: 'number'
    }))
};
```

### 2. Mapping Logic
- **Internal Criteria**: Menggunakan 3 kriteria default (Soft Skill, Hard Skill, Attitude)
- **External Criteria**: Mengkonversi setiap string dari Excel menjadi object dengan:
  - `key`: `external_1`, `external_2`, dst
  - `label`: Teks kriteria dari Excel
  - `description`: Auto-generated description
  - `type`: `number` (untuk scoring 0-100)

## 🎯 Hasil Setelah Perbaikan

### Before (❌ Tidak Muncul)
```
Management Data > Assessment Templates
┌──────────────────────────┐
│ Global Default           │
└──────────────────────────┘
```

### After (✅ Muncul)
```
Management Data > Assessment Templates
┌──────────────────────────┐
│ Global Default           │
│ SMK Negeri 1            │
│ Universitas Telkom      │
│ [Institusi lainnya...]  │
└──────────────────────────┘
```

## 📋 Contoh Data Flow

### Step 1: Excel Input
```
| Origin Institution | Transcript External Institution                                    |
|--------------------|-------------------------------------------------------------------|
| SMK Negeri 1       | ["Siswa mampu membuat database", "Siswa mampu bekerja dalam tim"] |
```

### Step 2: Parsing
```typescript
transcript_external: ["Siswa mampu membuat database", "Siswa mampu bekerja dalam tim"]
```

### Step 3: Conversion
```json
{
  "internal": [
    { "key": "soft_skill", "label": "Soft Skill", ... },
    { "key": "hard_skill", "label": "Hard Skill", ... },
    { "key": "attitude", "label": "Attitude", ... }
  ],
  "external": [
    {
      "key": "external_1",
      "label": "Siswa mampu membuat database",
      "description": "Kriteria penilaian: Siswa mampu membuat database",
      "type": "number"
    },
    {
      "key": "external_2",
      "label": "Siswa mampu bekerja dalam tim",
      "description": "Kriteria penilaian: Siswa mampu bekerja dalam tim",
      "type": "number"
    }
  ]
}
```

### Step 4: Database Storage
```sql
INSERT INTO assessment_templates (
  institution_type,
  criteria,
  description
) VALUES (
  'SMK Negeri 1',
  '{"internal":[...],"external":[...]}',
  'Auto-generated from bulk import for SMK Negeri 1'
);
```

### Step 5: UI Display
Template sekarang muncul di sidebar Assessment Templates dan dapat diedit seperti template lainnya.

## 🔍 Verifikasi

### Cara Test:
1. **Download Template** dari Bulk Import
2. **Isi kolom** "Transcript External Institution" dengan format:
   ```json
   ["Kriteria 1", "Kriteria 2", "Kriteria 3"]
   ```
3. **Upload & Import** file Excel
4. **Buka** Management Data > Assessment Templates
5. **Verifikasi** template institusi muncul di sidebar
6. **Klik** template untuk melihat kriteria internal & external

### Expected Result:
- ✅ Template muncul di sidebar dengan nama institusi
- ✅ Tab "INTERNAL EVALUATION" menampilkan 3 kriteria default
- ✅ Tab "EXTERNAL EVALUATION" menampilkan kriteria dari Excel
- ✅ Setiap kriteria dapat diedit dan disimpan
- ✅ Template dapat dihapus jika tidak diperlukan

## 📊 Impact

### Sebelum Fix:
- Template tidak muncul di UI
- Data tersimpan tapi tidak accessible
- Admin tidak bisa mengelola template dari bulk import

### Setelah Fix:
- ✅ Template langsung muncul setelah import
- ✅ Fully editable melalui UI
- ✅ Terintegrasi dengan assessment flow
- ✅ Dapat digunakan supervisor untuk penilaian

## 🚀 Next Steps

1. **Test Import**: Lakukan bulk import dengan data transcript external
2. **Verify Display**: Pastikan template muncul di Management Data
3. **Test Assessment**: Gunakan template untuk penilaian peserta
4. **Verify Certificate**: Pastikan kriteria muncul di transkrip PDF

## 📝 Notes

- Format internal criteria (Soft Skill, Hard Skill, Attitude) adalah **fixed** untuk konsistensi
- Format external criteria **dinamis** sesuai input dari Excel
- Jika institusi sudah ada, template akan **di-update** (overwrite)
- Template dapat **diedit manual** setelah dibuat via bulk import
