# 🔧 Technical Specifications - Puti Internship Management System

**Document Version:** 1.0  
**Last Updated:** 5 Januari 2026  
**Target Audience:** Developers, Technical Team

---

## 📑 Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack Details](#technology-stack-details)
3. [Project Structure](#project-structure)
4. [Database Specifications](#database-specifications)
5. [API Specifications](#api-specifications)
6. [Authentication Flow](#authentication-flow)
7. [State Management](#state-management)
8. [Component Architecture](#component-architecture)
9. [Routing & Navigation](#routing--navigation)
10. [Build & Deployment](#build--deployment)
11. [Development Workflow](#development-workflow)
12. [Code Standards](#code-standards)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Browser (Chrome, Firefox, Safari, Edge)               │ │
│  │  - React 18.2.0                                        │ │
│  │  - TypeScript 5.5.4                                    │ │
│  │  - Material-UI 5.15.1                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js 14.2.17 (App Router)                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ Server       │  │ API Routes   │  │ Middleware  │ │ │
│  │  │ Components   │  │              │  │             │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌─────────────────┐
│ NextAuth.js  │  │ Supabase Client  │  │ External APIs   │
│ (Auth)       │  │ (Database)       │  │ (Telkom OAuth)  │
└──────────────┘  └──────────────────┘  └─────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Supabase (PostgreSQL)                                │ │
│  │  - Row Level Security                                 │ │
│  │  - Real-time Subscriptions                           │ │
│  │  - Automatic Backups                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Request Flow

```
User Action
    ↓
Route Guard Check (Authentication + Authorization)
    ↓
Component Render (Server/Client Component)
    ↓
Data Fetching (TanStack Query / SWR)
    ↓
API Route / Supabase Client
    ↓
Database Query (with RLS)
    ↓
Response Processing
    ↓
UI Update (React State)
    ↓
User Feedback (Success/Error)
```

---

## 2. Technology Stack Details

### 2.1 Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.17",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.5.4",
    "@mui/material": "^5.15.1",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "tailwindcss": "^3.4.13",
    "@supabase/supabase-js": "^2.89.0",
    "@supabase/ssr": "^0.8.0",
    "next-auth": "^4.24.5",
    "@tanstack/react-query": "^5.62.7",
    "swr": "^2.2.4",
    "axios": "^1.6.2",
    "formik": "^2.4.5",
    "yup": "^1.3.3",
    "chart.js": "^4.5.1",
    "react-chartjs-2": "^5.3.1",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "framer-motion": "^10.16.16",
    "notistack": "^3.0.1"
  }
}
```

### 2.2 Development Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.47.2",
    "@types/node": "20.11.4",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.4",
    "prettier": "^3.1.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47"
  }
}
```

### 2.3 Runtime Environment

- **Node.js:** 20.9+
- **npm:** 10.x
- **Browser Support:**
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

---

## 3. Project Structure

### 3.1 Directory Tree

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth group routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/             # Dashboard group routes
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── dashboardsuper/      # Supervisor dashboard
│   │   ├── dashboarduser/       # Participant dashboard
│   │   ├── ManagementData/      # User management
│   │   ├── UnitsManagement/     # Unit management
│   │   ├── Monitoringsuper/     # Monitoring page
│   │   ├── ReportsMonitoring/   # Reports page
│   │   ├── MapSettings/         # Map configuration
│   │   ├── Profileadmin/        # Admin profile
│   │   ├── Profilesuper/        # Supervisor profile
│   │   └── Profilepart/         # Participant profile
│   ├── (blank)/                 # Blank layout routes
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── users/
│   │   ├── attendances/
│   │   └── monitoring/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   └── error.tsx                # Error boundary
│
├── components/                   # Reusable components (59 files)
│   ├── @extended/               # Extended MUI components
│   ├── cards/                   # Card components
│   ├── third-party/             # Third-party integrations
│   └── ...
│
├── layout/                       # Layout components (26 files)
│   ├── Dashboard/
│   ├── Drawer/
│   ├── Header/
│   └── ...
│
├── sections/                     # Page sections (8 files)
│   ├── dashboard/
│   ├── auth/
│   └── ...
│
├── views/                        # View components
│   ├── other/
│   │   ├── Admin/               # Admin views (6 files)
│   │   ├── Supervisors/         # Supervisor views (3 files)
│   │   └── Participant/         # Participant views (2 files)
│   ├── authentication/
│   └── maintenance/
│
├── utils/                        # Utility functions
│   ├── api/                     # API functions (6 modules)
│   │   ├── users.ts
│   │   ├── attendances.ts
│   │   ├── monitoring.ts
│   │   ├── units.ts
│   │   ├── dashboard.ts
│   │   └── settings.ts
│   ├── route-guard/             # Route protection
│   ├── locales/                 # Internationalization
│   ├── axios.ts                 # Axios config
│   └── authOptions.ts           # NextAuth config
│
├── types/                        # TypeScript types (25 files)
│   ├── auth.ts
│   ├── user.ts
│   ├── attendance.ts
│   ├── menu.ts
│   └── ...
│
├── themes/                       # MUI theme (65 files)
│   ├── palette.ts
│   ├── typography.ts
│   ├── overrides/
│   └── ...
│
├── hooks/                        # Custom hooks (5 files)
│   ├── useAuth.ts
│   ├── useConfig.ts
│   └── ...
│
├── contexts/                     # React contexts
│   └── ConfigContext.tsx
│
├── lib/                          # Libraries
│   └── supabase/
│       ├── client.ts
│       └── server.ts
│
├── menu-items/                   # Navigation menus
│   ├── index.tsx
│   ├── all-page.tsx
│   └── participant-menu.tsx
│
└── config.ts                     # App configuration
```

### 3.2 File Naming Conventions

- **Components:** PascalCase (e.g., `UserCard.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **Types:** PascalCase (e.g., `User.ts`)
- **API Routes:** kebab-case (e.g., `user-profile.ts`)
- **Pages:** kebab-case folders, `page.tsx` file

---

## 4. Database Specifications

### 4.1 Schema Definition

#### Table: users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'participant' 
        CHECK (role IN ('admin', 'supervisor', 'participant')),
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive')),
    internship_start DATE,
    internship_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_unit_id ON users(unit_id);
CREATE INDEX idx_users_status ON users(status);
```

#### Table: units
```sql
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_department ON units(department);
```

#### Table: attendances
```sql
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    activity_description TEXT,
    status VARCHAR(50) DEFAULT 'present' 
        CHECK (status IN ('present', 'absent', 'late', 'excused')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_attendances_user_id ON attendances(user_id);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_attendances_status ON attendances(status);
```

#### Table: monitoring_locations
```sql
CREATE TABLE monitoring_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    request_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_monitoring_user_id ON monitoring_locations(user_id);
CREATE INDEX idx_monitoring_status ON monitoring_locations(status);
CREATE INDEX idx_monitoring_request_date ON monitoring_locations(request_date);
```

### 4.2 Row Level Security Policies

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_locations ENABLE ROW LEVEL SECURITY;

-- Admin policies (full access)
CREATE POLICY "Admins have full access to users"
ON users FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Supervisor policies (unit-level access)
CREATE POLICY "Supervisors can view users in their unit"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'supervisor'
        AND u.unit_id = users.unit_id
    )
);

-- Participant policies (self access only)
CREATE POLICY "Participants can view own data"
ON users FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Participants can update own data"
ON users FOR UPDATE
USING (id = auth.uid());
```

---

## 5. API Specifications

### 5.1 API Modules

#### users.ts
```typescript
// Get all users (admin only)
export async function getUsers(): Promise<User[]>

// Get user by ID
export async function getUserById(id: string): Promise<User | null>

// Create new user
export async function createUser(data: CreateUserDto): Promise<User>

// Update user
export async function updateUser(id: string, data: UpdateUserDto): Promise<User>

// Delete user
export async function deleteUser(id: string): Promise<void>

// Get users by unit
export async function getUsersByUnit(unitId: string): Promise<User[]>
```

#### attendances.ts
```typescript
// Get attendances with filters
export async function getAttendances(
  filters?: AttendanceFilters
): Promise<Attendance[]>

// Create attendance (check-in)
export async function createAttendance(
  data: CreateAttendanceDto
): Promise<Attendance>

// Update attendance (check-out)
export async function updateAttendance(
  id: string, 
  data: UpdateAttendanceDto
): Promise<Attendance>

// Get attendance statistics
export async function getAttendanceStats(): Promise<AttendanceStats>
```

#### monitoring.ts
```typescript
// Get monitoring requests
export async function getMonitoringRequests(
  filters?: MonitoringFilters
): Promise<MonitoringLocation[]>

// Create monitoring request
export async function createMonitoringRequest(
  data: CreateMonitoringDto
): Promise<MonitoringLocation>

// Update monitoring request (approve/reject)
export async function updateMonitoringRequest(
  id: string,
  data: UpdateMonitoringDto
): Promise<MonitoringLocation>
```

### 5.2 Data Transfer Objects (DTOs)

```typescript
// User DTOs
interface CreateUserDto {
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'participant';
  unit_id?: string;
  internship_start?: string;
  internship_end?: string;
}

interface UpdateUserDto {
  name?: string;
  role?: 'admin' | 'supervisor' | 'participant';
  unit_id?: string;
  status?: 'active' | 'inactive';
  internship_start?: string;
  internship_end?: string;
}

// Attendance DTOs
interface CreateAttendanceDto {
  user_id: string;
  date: string;
  check_in_time: string;
  activity_description?: string;
}

interface UpdateAttendanceDto {
  check_out_time?: string;
  activity_description?: string;
  status?: 'present' | 'late' | 'absent' | 'excused';
}

// Monitoring DTOs
interface CreateMonitoringDto {
  user_id: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  request_date: string;
  reason?: string;
}

interface UpdateMonitoringDto {
  status: 'approved' | 'rejected';
  notes?: string;
}
```

---

## 6. Authentication Flow

### 6.1 NextAuth Configuration

```typescript
// src/utils/authOptions.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Telkom University',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Call Telkom University OAuth API
        const response = await axios.post(
          process.env.NEXT_APP_API_URL_LOGIN!,
          credentials
        );
        
        if (response.data.success) {
          return {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            role: response.data.user.role
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXT_APP_JWT_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/error',
  }
};
```

### 6.2 Route Guard Implementation

```typescript
// src/utils/route-guard/AuthGuard.tsx
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return null;
}
```

---

## 7. State Management

### 7.1 TanStack Query Setup

```typescript
// app/ProviderWrapper.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function ProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 7.2 Usage Example

```typescript
// Example: Fetching users
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/utils/api/users';

function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <UserTable users={data} />;
}
```

---

## 8. Component Architecture

### 8.1 Component Types

1. **Server Components** (default in App Router)
2. **Client Components** (with 'use client' directive)
3. **Layout Components**
4. **Page Components**
5. **Reusable UI Components**

### 8.2 Component Example

```typescript
// components/cards/UserCard.tsx
'use client';

import { Card, CardContent, Typography, Avatar } from '@mui/material';
import { User } from '@/types/user';

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  return (
    <Card onClick={onClick} sx={{ cursor: 'pointer' }}>
      <CardContent>
        <Avatar src={user.avatar} alt={user.name} />
        <Typography variant="h6">{user.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user.email}
        </Typography>
        <Typography variant="caption">{user.role}</Typography>
      </CardContent>
    </Card>
  );
}
```

---

## 9. Routing & Navigation

### 9.1 Route Groups

```
app/
├── (auth)/          # Public routes
│   ├── login/
│   └── register/
├── (dashboard)/     # Protected routes
│   ├── dashboard/
│   └── ...
└── (blank)/         # Blank layout routes
```

### 9.2 Dynamic Menu

```typescript
// menu-items/index.tsx
const getMenuByRole = (role: string) => {
  if (role === 'admin') return { items: [adminMenu] };
  if (role === 'supervisor') return { items: [supervisorMenu] };
  if (role === 'participant') return { items: [userMenu] };
  return { items: [userMenu] };
};
```

---

## 10. Build & Deployment

### 10.1 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Format
npm run prettier
```

### 10.2 Environment Variables

```env
# Required for all environments
NEXTAUTH_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_APP_JWT_SECRET=
NEXTAUTH_SECRET_KEY=

# Development only
NEXT_PUBLIC_ENV=development

# Production only
NEXT_PUBLIC_ENV=production
```

### 10.3 Vercel Deployment

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

---

## 11. Development Workflow

### 11.1 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
# Code review
# Merge to main
```

### 11.2 Commit Convention

```
feat: New feature
fix: Bug fix
docs: Documentation
style: Code style
refactor: Code refactoring
test: Testing
chore: Maintenance
```

---

## 12. Code Standards

### 12.1 TypeScript

- ✅ Strict mode enabled
- ✅ No `any` types (use `unknown` if needed)
- ✅ Explicit return types for functions
- ✅ Interface over type for objects

### 12.2 React

- ✅ Functional components only
- ✅ Hooks for state management
- ✅ Props destructuring
- ✅ Proper key props in lists

### 12.3 Naming

- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case` or `PascalCase`

### 12.4 ESLint & Prettier

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

---

**Document End**

*For questions or clarifications, contact: mhilmy.aziz05@gmail.com*
