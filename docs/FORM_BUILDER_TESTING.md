# Form Builder - Testing Checklist

## Cara Testing Manual

Buka: `http://localhost:3001/admin/registration/forms`

### Test 1: Plain Text
1. ✅ Klik "Add New Question"
2. ✅ Label: "Nama Lengkap"
3. ✅ Type: **Plain Text**
4. ✅ Toggle "Required" ON
5. ✅ Klik "Preview"
6. ✅ **Expected**: Muncul TextField biasa

### Test 2: Paragraph (Textarea)
1. ✅ Add New Question
2. ✅ Label: "Deskripsi Diri"
3. ✅ Type: **Paragraph**
4. ✅ Klik "Preview"
5. ✅ **Expected**: Muncul TextField multiline (3 rows)

### Test 3: Numbers
1. ✅ Add New Question
2. ✅ Label: "Umur"
3. ✅ Type: **Numbers**
4. ✅ Klik "Preview"
5. ✅ **Expected**: Muncul TextField type="number"

### Test 4: Dropdown (Select)
1. ✅ Add New Question
2. ✅ Label: "Jenis Kelamin"
3. ✅ Type: **Dropdown**
4. ✅ **PENTING**: Field "Options" harus muncul otomatis
5. ✅ Isi Options: `Laki-laki, Perempuan`
6. ✅ Klik "Preview"
7. ✅ **Expected**: Muncul Select dropdown dengan 2 pilihan

### Test 5: Checkboxes
1. ✅ Add New Question
2. ✅ Label: "Keahlian"
3. ✅ Type: **Checkboxes**
4. ✅ **PENTING**: Field "Options" harus muncul otomatis
5. ✅ Isi Options: `JavaScript, Python, Java, C++`
6. ✅ Klik "Preview"
7. ✅ **Expected**: Muncul 4 Switch dengan label masing-masing

### Test 6: Date Picker
1. ✅ Add New Question
2. ✅ Label: "Tanggal Lahir"
3. ✅ Type: **Date Picker**
4. ✅ Klik "Preview"
5. ✅ **Expected**: Muncul TextField type="date" dengan calendar picker

### Test 7: Timestamp (Time)
1. ✅ Add New Question
2. ✅ Label: "Jam Mulai"
3. ✅ Type: **Timestamp**
4. ✅ Klik "Preview"
5. ✅ **Expected**: Muncul TextField type="time" dengan time picker

### Test 8: File Upload
1. ✅ Add New Question
2. ✅ Label: "Upload CV"
3. ✅ Type: **File Upload**
4. ✅ Klik "Preview"
5. ✅ **Expected**: Muncul box dengan icon upload dan text "Click to upload file"

---

## Potential Issues to Check

### Issue 1: Options Field Tidak Muncul
**Symptom**: Ketika pilih Dropdown/Checkboxes, field "Options" tidak muncul

**Solution**: Cek line 236-249 di FormBuilder.tsx
```tsx
{(field.type === 'select' || field.type === 'checkbox') && (
    <Grid item xs={12}>
        <Box sx={{ mt: 1, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="caption">Options (Comma separated):</Typography>
            <TextField ... />
        </Box>
    </Grid>
)}
```

### Issue 2: Preview Tidak Menampilkan Field
**Symptom**: Preview dialog kosong atau field tidak muncul

**Solution**: Pastikan field.type sesuai dengan salah satu dari 8 tipe yang valid

### Issue 3: Checkbox Menampilkan Switch (Bukan Checkbox Asli)
**Note**: Ini BUKAN bug. Saya sengaja menggunakan Switch karena:
- Lebih modern dan user-friendly
- Konsisten dengan design system Material-UI
- Lebih mudah di-tap di mobile

Jika Anda ingin checkbox asli, ganti di line 311:
```tsx
// Dari:
control={<Switch size="small" />}

// Menjadi:
control={<Checkbox size="small" />}
```

---

## Screenshot Checklist

Silakan ambil screenshot untuk setiap test dan kirim ke saya jika ada yang tidak berfungsi:

1. [ ] Screenshot dropdown "Type" menunjukkan 8 pilihan
2. [ ] Screenshot field dengan type "Checkboxes" + Options terisi
3. [ ] Screenshot Preview dialog dengan checkbox field
4. [ ] Screenshot Preview dialog dengan dropdown field
5. [ ] Screenshot Preview dialog dengan file upload field

---

## Code Verification

Jika Anda menemukan type yang TIDAK berfungsi, cek:

1. **Type Definition** (line 42):
   ```tsx
   type FieldType = 'text' | 'number' | 'date' | 'time' | 'select' | 'checkbox' | 'file' | 'textarea';
   ```

2. **Dropdown Menu** (line 210-217):
   Semua 8 MenuItem harus ada

3. **Preview Rendering** (line 296-322):
   Semua 8 conditional render harus ada

Jika ada yang missing, berarti ada error saat saya edit file.
