# Panduan Restrukturisasi Folder

## 📋 Ringkasan Perubahan

Proyek ini telah direstrukturisasi untuk mengikuti best practices Next.js 14+ dengan App Router.

## 📁 Struktur Folder Baru (Rekomendasi)

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group routes
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/              # Dashboard group routes (protected)
│   │   ├── admin/                # Admin routes
│   │   │   ├── dashboard/
│   │   │   ├── management-data/
│   │   │   ├── units-management/
│   │   │   ├── reports-monitoring/
│   │   │   └── profile/
│   │   │
│   │   ├── supervisor/           # Supervisor routes
│   │   │   ├── dashboard/
│   │   │   ├── monitoring/
│   │   │   └── profile/
│   │   │
│   │   ├── participant/          # Participant routes
│   │   │   ├── dashboard/
│   │   │   └── profile/
│   │   │
│   │   ├── layout.tsx            # Dashboard layout wrapper
│   │   └── template.tsx
│   │
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── users/
│   │   ├── units/
│   │   ├── attendances/
│   │   └── monitoring/
│   │
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # Reusable components
│   ├── ui/                       # UI components (buttons, cards, etc)
│   ├── forms/                    # Form components
│   ├── tables/                   # Table components
│   └── charts/                   # Chart components
│
├── features/                     # Feature-based modules (NEW)
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   │
│   ├── users/
│   ├── units/
│   ├── attendances/
│   └── monitoring/
│
├── lib/                          # External library configurations
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── database.types.ts
│   │
│   └── react-query/
│       └── provider.tsx
│
├── hooks/                        # Global custom hooks
│   ├── use-user.ts
│   ├── use-auth.ts
│   └── use-media-query.ts
│
├── utils/                        # Utility functions
│   ├── api/                      # API client functions
│   │   ├── users.ts
│   │   ├── units.ts
│   │   ├── attendances.ts
│   │   ├── monitoring.ts
│   │   └── dashboard.ts
│   │
│   ├── helpers/                  # Helper functions
│   └── validators/               # Validation schemas
│
├── types/                        # TypeScript type definitions
│   ├── database.ts
│   ├── api.ts
│   └── common.ts
│
├── contexts/                     # React contexts
│   └── auth-context.tsx
│
├── config/                       # App configuration
│   ├── site.ts
│   └── constants.ts
│
└── styles/                       # Global styles
    └── globals.css
```

## 🔄 Perubahan yang Perlu Dilakukan

### 1. Reorganisasi Routes Dashboard

**Dari:**
```
(dashboard)/
├── dashboard/
├── dashboardsuper/
├── dashboarduser/
├── Profileadmin/
├── Profilesuper/
├── Profilepart/
├── ManagementData/
├── UnitsManagement/
├── ReportsMonitoring/
└── Monitoringsuper/
```

**Menjadi:**
```
(dashboard)/
├── admin/
│   ├── dashboard/
│   ├── management-data/
│   ├── units-management/
│   ├── reports-monitoring/
│   └── profile/
├── supervisor/
│   ├── dashboard/
│   ├── monitoring/
│   └── profile/
└── participant/
    ├── dashboard/
    └── profile/
```

### 2. Hapus Folder `views/other`

Pindahkan semua komponen dari `src/views/other/` ke dalam route pages yang sesuai:

- `views/other/Admin/DashboardPage.tsx` → `app/(dashboard)/admin/dashboard/page.tsx`
- `views/other/Admin/ManagementData.tsx` → `app/(dashboard)/admin/management-data/page.tsx`
- `views/other/Admin/Profile.tsx` → `app/(dashboard)/admin/profile/page.tsx`
- Dan seterusnya...

### 3. Konsolidasi API Routes

Pastikan semua API routes mengikuti struktur RESTful:

```
api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── session/route.ts
├── users/
│   ├── route.ts              # GET /api/users, POST /api/users
│   └── [id]/route.ts         # GET, PUT, DELETE /api/users/:id
├── units/
│   ├── route.ts
│   └── [id]/route.ts
├── attendances/
│   ├── route.ts
│   └── [id]/route.ts
└── monitoring/
    ├── route.ts
    └── [id]/route.ts
```

## 🎯 Keuntungan Struktur Baru

1. **Lebih Terorganisir**: Setiap role (admin, supervisor, participant) memiliki folder sendiri
2. **Mudah Maintenance**: Lebih mudah menemukan dan mengupdate kode
3. **Scalable**: Mudah menambah fitur baru
4. **Best Practice**: Mengikuti konvensi Next.js 14+ App Router
5. **Type Safety**: Struktur yang jelas memudahkan TypeScript inference

## ⚠️ Catatan Penting

- Gunakan kebab-case untuk nama folder routes (contoh: `management-data`, bukan `ManagementData`)
- Gunakan PascalCase untuk nama komponen React
- Pisahkan business logic dari UI components
- Gunakan Server Components sebisa mungkin untuk performa optimal
