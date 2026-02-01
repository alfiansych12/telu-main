## Custom Alert System

Sistem alert kustom ini menggantikan `window.alert()`, `window.confirm()`, dan notifikasi standar browser dengan komponen yang lebih menarik dan konsisten dengan desain aplikasi.

### Komponen Utama

1. **CustomAlert Component** (`src/components/@extended/CustomAlert.tsx`)
   - Dialog modal dengan animasi Zoom
   - Glassmorphism effect (backdrop blur)
   - Icon dinamis berdasarkan variant (success, error, warning, info)
   - Support untuk single button (OK) atau dual button (OK + Cancel)
   - Warna dan shadow yang menyesuaikan dengan variant

2. **Alert State Management** (`src/api/alert.ts`)
   - Menggunakan SWR untuk global state management
   - Functions: `openAlert()`, `closeAlert()`, `useGetAlert()`
   - Konsisten dengan pattern yang sudah ada di aplikasi (seperti snackbar)

3. **Alert Types** (`src/types/alert.ts`)
   - Definisi TypeScript untuk type safety
   - Support 4 variant: success, error, warning, info

### Cara Penggunaan

#### 1. Simple Alert (Informasi)
```typescript
import { openAlert } from 'api/alert';

openAlert({
  title: 'Success!',
  message: 'Data berhasil disimpan.',
  variant: 'success'
});
```

#### 2. Alert dengan Konfirmasi
```typescript
import { openAlert } from 'api/alert';

openAlert({
  title: 'Konfirmasi Hapus',
  message: 'Apakah Anda yakin ingin menghapus data ini?',
  variant: 'warning',
  showCancel: true,
  confirmText: 'Ya, Hapus',
  cancelText: 'Batal',
  onConfirm: () => {
    // Lakukan aksi hapus
    deleteData();
  },
  onCancel: () => {
    // Optional: aksi saat cancel
    console.log('Cancelled');
  }
});
```

#### 3. Error Alert
```typescript
openAlert({
  title: 'Error',
  message: 'Terjadi kesalahan saat memproses data.',
  variant: 'error'
});
```

#### 4. Warning Alert
```typescript
openAlert({
  title: 'Peringatan',
  message: 'Pastikan semua field sudah terisi dengan benar.',
  variant: 'warning'
});
```

#### 5. Info Alert
```typescript
openAlert({
  title: 'Informasi',
  message: 'Fitur ini akan segera hadir.',
  variant: 'info'
});
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | - | Judul alert (optional) |
| `message` | string | **required** | Pesan yang ditampilkan |
| `variant` | 'success' \| 'error' \| 'warning' \| 'info' | **required** | Tipe alert |
| `showCancel` | boolean | false | Tampilkan tombol cancel |
| `confirmText` | string | 'OK' | Text tombol konfirmasi |
| `cancelText` | string | 'Cancel' | Text tombol cancel |
| `onConfirm` | function | - | Callback saat confirm |
| `onCancel` | function | - | Callback saat cancel |

### Styling & Design

- **Icons**: Menggunakan Iconsax React dengan variant "Bulk"
- **Colors**: 
  - Success: #2ecc71 (green)
  - Error: #e74c3c (red)
  - Warning: #f1c40f (yellow)
  - Info: #3498db (blue)
- **Animation**: Zoom transition dari Material-UI
- **Background**: Glassmorphism dengan backdrop blur
- **Shadow**: Dynamic shadow berdasarkan variant

### Implementasi di Aplikasi

Sudah diimplementasikan di:
- ✅ Map Settings (Admin) - success & error alerts
- ✅ Participant Dashboard - check-in & check-out alerts

### Migrasi dari Alert Standar

**Sebelum:**
```typescript
alert('Data berhasil disimpan!');
```

**Sesudah:**
```typescript
openAlert({
  message: 'Data berhasil disimpan!',
  variant: 'success'
});
```

**Sebelum (Confirm):**
```typescript
if (window.confirm('Yakin ingin menghapus?')) {
  deleteData();
}
```

**Sesudah:**
```typescript
openAlert({
  message: 'Yakin ingin menghapus?',
  variant: 'warning',
  showCancel: true,
  onConfirm: () => deleteData()
});
```
