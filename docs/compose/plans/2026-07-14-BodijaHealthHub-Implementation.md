# Bodija Health Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack healthcare website with React frontend, Node.js/Express backend, and SQLite database for Bodija Health Hub, a Nigerian healthcare clinic.

**Architecture:** Monorepo with shared TypeScript types, Prisma ORM for SQLite, React + Vite + Tailwind frontend, Express + TypeScript backend. JWT httpOnly cookie authentication with RBAC. Request-based appointment booking workflow.

**Tech Stack:** TypeScript, React, Vite, Tailwind CSS, Node.js, Express, Prisma, SQLite, JWT, bcrypt, TipTap (rich text editor), Chart.js/Recharts, Paystack (for donations).

## Global Constraints
- TypeScript throughout the monorepo (client, server, shared)
- npm workspaces monorepo structure
- Prisma ORM with SQLite database
- Tailwind CSS for styling (mobile-first responsive design)
- JWT httpOnly cookie authentication with refresh token rotation
- RESTful API design
- Nigerian healthcare clinic context (Bodija, Ibadan)
- Mobile-first responsive design critical for Nigerian market
- Companion apps (HearMenders/LiveCare) are pre-existing — Download section is informational only
- Admin panel is for clinic staff, not patients
- Blog requires rich text editing (TipTap) for non-technical staff
- Donation page needs Paystack integration for Nigeria

---

## Phase 1: Core Scaffolding + Authentication

### Task 1: Project Setup and Monorepo Configuration

**Covers:** S1 (Project Structure)

**Files:**
- Create: `package.json` (root workspace config)
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`
- Create: `.env.example`

**Interfaces:**
- Consumes: None
- Produces: Monorepo structure with client, server, shared packages

- [ ] **Step 1: Initialize root package.json**

```json
{
  "name": "bodija-health-hub",
  "private": true,
  "workspaces": [
    "client",
    "server",
    "shared"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "npm run build --workspaces",
    "start": "cd server && npm start",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "jest"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 2: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
dist/
.env
*.log
.DS_Store
coverage/
```

- [ ] **Step 4: Create client/package.json**

```json
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext .ts,.tsx",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "axios": "^1.6.5",
    "react-hook-form": "^7.49.3",
    "@tiptap/react": "^2.1.13",
    "@tiptap/starter-kit": "^2.1.13",
    "@tiptap/extension-image": "^2.1.13",
    "@tiptap/extension-link": "^2.1.13",
    "@tiptap/extension-placeholder": "^2.1.13",
    "@tiptap/extension-text-align": "^2.1.13",
    "@tiptap/extension-underline": "^2.1.13",
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^3.3.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0"
  }
}
```

- [ ] **Step 5: Create client/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 6: Create client/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 7: Create client/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 8: Create client/tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 9: Create client/postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 10: Create server/package.json**

```json
{
  "name": "server",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint . --ext .ts",
    "test": "jest",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.8.1",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.2",
    "nodemailer": "^6.9.8",
    "paystack": "^3.0.0",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cookie-parser": "^1.4.6",
    "@types/multer": "^1.4.11",
    "@types/nodemailer": "^6.4.14",
    "prisma": "^5.8.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.11",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0"
  }
}
```

- [ ] **Step 11: Create server/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 12: Create shared/package.json**

```json
{
  "name": "shared",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 13: Create shared/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 14: Create .env.example**

```
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV=development

# Client
VITE_API_URL=http://localhost:4000/api

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_your-paystack-secret-key"
PAYSTACK_PUBLIC_KEY="pk_test_your-paystack-public-key"

# File Upload
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880
```

- [ ] **Step 15: Install dependencies and verify setup**

Run: `npm install`
Expected: Dependencies installed in all workspaces

Run: `cd client && npm run dev`
Expected: Vite dev server starts on port 3000

Run: `cd server && npm run dev`
Expected: TypeScript compiles and server starts on port 4000

- [ ] **Step 16: Commit**

```bash
git init
git add .
git commit -m "feat: initialize monorepo structure with client, server, shared packages"
```

### Task 2: Database Schema and Prisma Setup

**Covers:** S2 (Database Design)

**Files:**
- Create: `server/prisma/schema.prisma`
- Create: `server/src/lib/prisma.ts`
- Create: `server/src/types/index.ts` (shared types)

**Interfaces:**
- Consumes: Task 1 (monorepo setup)
- Produces: Prisma client, database schema, shared TypeScript types

- [ ] **Step 1: Create Prisma schema**

```prisma
// server/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  role          String    @default("staff") // admin, doctor, staff
  firstName     String
  lastName      String
  phone         String?
  avatar        String?
  isActive      Boolean   @default(true)
  lastLogin     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  appointments  Appointment[]
  blogPosts     BlogPost[]
  messages      Message[]
  newsletterSubscribers NewsletterSubscriber[]
  refreshTokens RefreshToken[]
}

model Patient {
  id            String    @id @default(cuid())
  firstName     String
  lastName      String
  email         String?   @unique
  phone         String
  dateOfBirth   DateTime?
  gender        String?
  address       String?
  emergencyContact String?
  medicalHistory String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  appointments  Appointment[]
}

model Doctor {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  specialty     String
  bio           String?
  qualifications String?
  experience    String?
  schedule      String? // JSON string for availability
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  appointments  Appointment[]
  services      Service[]
}

model Service {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String
  shortDescription String?
  icon          String?
  image         String?
  category      String?
  price         Float?
  isActive      Boolean   @default(true)
  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  doctors       Doctor[]
  appointments  Appointment[]
}

model Appointment {
  id            String    @id @default(cuid())
  patientId     String
  patient       Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  doctorId      String?
  doctor        Doctor?   @relation(fields: [doctorId], references: [id], onDelete: SetNull)
  serviceId     String?
  service       Service?  @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  userId        String?   // staff who booked it
  user          User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  status        String    @default("pending") // pending, confirmed, cancelled, completed
  appointmentDate DateTime
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model BlogPost {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  content       String    // Rich text HTML from TipTap
  excerpt       String?
  coverImage    String?
  authorId      String
  author        User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  category      String?
  tags          String? // JSON array of tags
  isPublished   Boolean   @default(false)
  publishedAt   DateTime?
  views         Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Event {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  description   String
  shortDescription String?
  image         String?
  location      String?
  startDate     DateTime
  endDate       DateTime?
  isPublished   Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model GalleryItem {
  id            String    @id @default(cuid())
  title         String?
  description   String?
  image         String
  category      String?
  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Testimonial {
  id            String    @id @default(cuid())
  patientName   String
  content       String
  rating        Int?
  isApproved    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model ContactMessage {
  id            String    @id @default(cuid())
  name          String
  email         String
  phone         String?
  subject       String
  message       String
  isRead        Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Message {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  subject       String
  content       String
  isRead        Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model NewsletterSubscriber {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  isActive      Boolean   @default(true)
  userId        String?   // if subscribed by staff
  user          User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model RefreshToken {
  id            String    @id @default(cuid())
  token         String    @unique
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt     DateTime
  createdAt     DateTime  @default(now())
}

model Analytics {
  id            String    @id @default(cuid())
  page          String
  action        String
  metadata      String? // JSON string
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime  @default(now())
}

model Setting {
  id            String    @id @default(cuid())
  key           String    @unique
  value         String
  description   String?
  updatedAt     DateTime  @updatedAt
}
```

- [ ] **Step 2: Create Prisma client instance**

```typescript
// server/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
```

- [ ] **Step 3: Create shared types**

```typescript
// shared/src/index.ts
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'staff';
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  userId: string;
  user?: User;
  specialty: string;
  bio?: string;
  qualifications?: string;
  experience?: string;
  schedule?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  icon?: string;
  image?: string;
  category?: string;
  price?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  doctorId?: string;
  doctor?: Doctor;
  serviceId?: string;
  service?: Service;
  userId?: string;
  user?: User;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  appointmentDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  authorId: string;
  author?: User;
  category?: string;
  tags?: string[];
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  image?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  image: string;
  category?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  patientName: string;
  content: string;
  rating?: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  userId: string;
  user?: User;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  userId?: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

- [ ] **Step 4: Generate Prisma client and push schema**

Run: `cd server && npm run db:generate`
Expected: Prisma client generated

Run: `cd server && npm run db:push`
Expected: SQLite database created with schema

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add database schema with Prisma and shared types"
```

### Task 3: Authentication System

**Covers:** S3 (Authentication)

**Files:**
- Create: `server/src/middleware/auth.ts`
- Create: `server/src/routes/auth.ts`
- Create: `server/src/controllers/authController.ts`
- Create: `server/src/utils/jwt.ts`
- Create: `server/src/utils/password.ts`
- Create: `client/src/contexts/AuthContext.tsx`
- Create: `client/src/hooks/useAuth.ts`
- Create: `client/src/components/auth/LoginForm.tsx`
- Create: `client/src/components/auth/RegisterForm.tsx`
- Create: `client/src/components/auth/ProtectedRoute.tsx`

**Interfaces:**
- Consumes: Task 2 (database schema, types)
- Produces: JWT authentication, login/logout/register endpoints, auth context

- [ ] **Step 1: Create JWT utilities**

```typescript
// server/src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { User } from '@bodija-health-hub/shared';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

export const generateRefreshToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
};
```

- [ ] **Step 2: Create password utilities**

```typescript
// server/src/utils/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

- [ ] **Step 3: Create auth middleware**

```typescript
// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const payload = verifyAccessToken(token);
    
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true },
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

- [ ] **Step 4: Create auth controller**

```typescript
// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'staff', // Default role
      },
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    
    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }
    
    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Delete refresh token from database
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }
    
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }
    
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    
    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Check if refresh token is expired
    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      return res.status(401).json({ error: 'Refresh token expired' });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Delete old refresh token and store new one
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    // Set cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

- [ ] **Step 5: Create auth routes**

```typescript
// server/src/routes/auth.ts
import { Router } from 'express';
import { register, login, logout, refreshToken, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('phone').optional().trim(),
  validate,
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
], login);

router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticate, getMe);

export default router;
```

- [ ] **Step 6: Create validation middleware**

```typescript
// server/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  
  next();
};
```

- [ ] **Step 7: Create AuthContext for React**

```typescript
// client/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '@bodija-health-hub/shared';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me', { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    setUser(response.data.user);
  };

  const register = async (data: RegisterData) => {
    const response = await axios.post('/api/auth/register', data, { withCredentials: true });
    setUser(response.data.user);
  };

  const logout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

- [ ] **Step 8: Create LoginForm component**

```typescript
// client/src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface LoginFormInputs {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setError('');
      setIsLoading(true);
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-500">
          Register
        </Link>
      </p>
    </div>
  );
};
```

- [ ] **Step 9: Create RegisterForm component**

```typescript
// client/src/components/auth/RegisterForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface RegisterFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>();
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      setError('');
      setIsLoading(true);
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              {...register('firstName', { required: 'First name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              {...register('lastName', { required: 'Last name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone (optional)
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-500">
          Login
        </Link>
      </p>
    </div>
  );
};
```

- [ ] **Step 10: Create ProtectedRoute component**

```typescript
// client/src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />;
};
```

- [ ] **Step 11: Set up main server with routes**

```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

- [ ] **Step 12: Test authentication flow**

Run: `cd server && npm run dev`
Run: `cd client && npm run dev`

Test:
1. Register a new user via POST /api/auth/register
2. Login via POST /api/auth/login
3. Access protected route GET /api/auth/me
4. Logout via POST /api/auth/logout

- [ ] **Step 13: Commit**

```bash
git add .
git commit -m "feat: implement JWT authentication with login, register, logout"
```

---

## Phase 2: Public Pages

### Task 4: Layout and Navigation

**Covers:** S4 (Public Layout)

**Files:**
- Create: `client/src/components/layout/Header.tsx`
- Create: `client/src/components/layout/Footer.tsx`
- Create: `client/src/components/layout/Layout.tsx`
- Create: `client/src/App.tsx`
- Create: `client/src/main.tsx`
- Create: `client/index.html`
- Create: `client/src/index.css`

**Interfaces:**
- Consumes: Task 1 (client setup)
- Produces: Responsive layout with header, footer, and main content area

- [ ] **Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Bodija Health Hub - Your trusted healthcare partner in Ibadan, Nigeria" />
    <title>Bodija Health Hub</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-secondary-600 text-white px-4 py-2 rounded-md hover:bg-secondary-700 transition-colors;
  }
  
  .btn-outline {
    @apply border-2 border-primary-600 text-primary-600 px-4 py-2 rounded-md hover:bg-primary-50 transition-colors;
  }
}
```

- [ ] **Step 3: Create main.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Create Header component**

```typescript
// client/src/components/layout/Header.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ChevronDown } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { 
    name: 'Services', 
    href: '/services',
    children: [
      { name: 'All Services', href: '/services' },
      { name: 'General Consultation', href: '/services/general-consultation' },
      { name: 'Dental Care', href: '/services/dental-care' },
      { name: 'Eye Care', href: '/services/eye-care' },
      { name: 'Pediatrics', href: '/services/pediatrics' },
      { name: 'Maternity', href: '/services/maternity' },
      { name: 'Laboratory', href: '/services/laboratory' },
      { name: 'Pharmacy', href: '/services/pharmacy' },
      { name: 'Radiology', href: '/services/radiology' },
      { name: 'Surgery', href: '/services/surgery' },
      { name: 'Emergency Care', href: '/services/emergency-care' },
      { name: 'Cardiology', href: '/services/cardiology' },
      { name: 'Dermatology', href: '/services/dermatology' },
      { name: 'ENT', href: '/services/ent' },
      { name: 'Orthopedics', href: '/services/orthopedics' },
      { name: 'Gynecology', href: '/services/gynecology' },
      { name: 'Urology', href: '/services/urology' },
    ],
  },
  { name: 'Doctors', href: '/doctors' },
  { name: 'Blog', href: '/blog' },
  { name: 'Events', href: '/events' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const isActive = (href: string) => location.pathname === href;
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Bodija</span>
              <span className="text-2xl font-bold text-secondary-600 ml-1">Health Hub</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    isActive(item.href)
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                  {item.children && (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </Link>
                
                {/* Dropdown */}
                {item.children && activeDropdown === item.name && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`block px-4 py-2 text-sm ${
                          isActive(child.href)
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.firstName}
                </span>
                {user?.role === 'admin' || user?.role === 'staff' ? (
                  <Link to="/admin" className="btn-primary">
                    Admin Panel
                  </Link>
                ) : null}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-500 hover:text-gray-700">
                  Login
                </Link>
                <Link to="/book-appointment" className="btn-primary">
                  Book Appointment
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-4 py-2 text-base font-medium text-gray-700">
                  Welcome, {user?.firstName}
                </div>
                {user?.role === 'admin' || user?.role === 'staff' ? (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/book-appointment"
                  className="block px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
```

- [ ] **Step 5: Create Footer component**

```typescript
// client/src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const footerLinks = {
  services: [
    { name: 'General Consultation', href: '/services/general-consultation' },
    { name: 'Dental Care', href: '/services/dental-care' },
    { name: 'Eye Care', href: '/services/eye-care' },
    { name: 'Pediatrics', href: '/services/pediatrics' },
    { name: 'Maternity', href: '/services/maternity' },
    { name: 'Laboratory', href: '/services/laboratory' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Doctors', href: '/doctors' },
    { name: 'Blog', href: '/blog' },
    { name: 'Events', href: '/events' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'Book Appointment', href: '/book-appointment' },
    { name: 'Download Apps', href: '/download-apps' },
    { name: 'Donate', href: '/donate' },
    { name: 'Partner With Us', href: '/partner' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-primary-400">Bodija</span>
              <span className="text-2xl font-bold text-secondary-400 ml-1">Health Hub</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Your trusted healthcare partner in Ibadan, Nigeria. Providing quality medical services with compassion and excellence.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Bodija, Ibadan, Oyo State, Nigeria</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-2" />
                <span>+234 801 234 5678</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 mr-2" />
                <span>info@bodijahealthhub.com</span>
              </div>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Social Links */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Bodija Health Hub. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
```

- [ ] **Step 6: Create Layout component**

```typescript
// client/src/components/layout/Layout.tsx
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};
```

- [ ] **Step 7: Create App.tsx with routes**

```typescript
// client/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import Doctors from '@/pages/Doctors';
import BookAppointment from '@/pages/BookAppointment';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Events from '@/pages/Events';
import Gallery from '@/pages/Gallery';
import Testimonials from '@/pages/Testimonials';
import Contact from '@/pages/Contact';
import DownloadApps from '@/pages/DownloadApps';
import Donate from '@/pages/Donate';
import Partner from '@/pages/Partner';
import Admin from '@/pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/services/:slug" element={<Layout><ServiceDetail /></Layout>} />
          <Route path="/doctors" element={<Layout><Doctors /></Layout>} />
          <Route path="/book-appointment" element={<Layout><BookAppointment /></Layout>} />
          <Route path="/blog" element={<Layout><Blog /></Layout>} />
          <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
          <Route path="/events" element={<Layout><Events /></Layout>} />
          <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
          <Route path="/testimonials" element={<Layout><Testimonials /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/download-apps" element={<Layout><DownloadApps /></Layout>} />
          <Route path="/donate" element={<Layout><Donate /></Layout>} />
          <Route path="/partner" element={<Layout><Partner /></Layout>} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Layout><LoginForm /></Layout>} />
          <Route path="/register" element={<Layout><RegisterForm /></Layout>} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
            <Route path="/admin/*" element={<Admin />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 8: Create placeholder pages**

Create basic placeholder pages for all routes:

```typescript
// client/src/pages/Home.tsx
export default function Home() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to Bodija Health Hub</h1>
        <p className="text-center text-gray-600">Your trusted healthcare partner in Ibadan, Nigeria.</p>
      </div>
    </div>
  );
}
```

Similar for other pages.

- [ ] **Step 9: Test layout and navigation**

Run: `cd client && npm run dev`
Test: All routes render correctly, header and footer display properly, navigation works.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: implement responsive layout with header, footer, and navigation"
```

---

## Phase 3: Admin Panel

### Task 5: Admin Dashboard and Layout

**Covers:** S5 (Admin Panel)

**Files:**
- Create: `client/src/pages/admin/Dashboard.tsx`
- Create: `client/src/components/admin/AdminLayout.tsx`
- Create: `client/src/components/admin/Sidebar.tsx`
- Create: `client/src/components/admin/TopBar.tsx`
- Create: `client/src/pages/admin/Patients.tsx`
- Create: `client/src/pages/admin/Appointments.tsx`
- Create: `client/src/pages/admin/Doctors.tsx`
- Create: `client/src/pages/admin/Services.tsx`
- Create: `client/src/pages/admin/Blog.tsx`
- Create: `client/src/pages/admin/Events.tsx`
- Create: `client/src/pages/admin/Gallery.tsx`
- Create: `client/src/pages/admin/Messages.tsx`
- Create: `client/src/pages/admin/Newsletter.tsx`
- Create: `client/src/pages/admin/Analytics.tsx`
- Create: `client/src/pages/admin/Users.tsx`
- Create: `client/src/pages/admin/Settings.tsx`

**Interfaces:**
- Consumes: Task 3 (authentication), Task 4 (layout)
- Produces: Admin dashboard with sidebar navigation and management pages

- [ ] **Step 1: Create AdminLayout component**

```typescript
// client/src/components/admin/AdminLayout.tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create Sidebar component**

```typescript
// client/src/components/admin/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Stethoscope, 
  Service, FileText, Event, Image, MessageSquare,
  Mail, BarChart3, UserCog, Settings, ChevronLeft
} from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Patients', href: '/admin/patients', icon: Users },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
  { name: 'Services', href: '/admin/services', icon: Service },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Events', href: '/admin/events', icon: Event },
  { name: 'Gallery', href: '/admin/gallery', icon: Image },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: UserCog },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };
  
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <Link to="/admin" className="flex items-center">
              <span className="text-xl font-bold text-primary-600">Bodija</span>
              <span className="text-xl font-bold text-secondary-600 ml-1">Admin</span>
            </Link>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <Link to="/" className="group flex w-full items-center">
            <ChevronLeft className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
              Back to Website
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Create TopBar component**

```typescript
// client/src/components/admin/TopBar.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Menu } from 'lucide-react';

export const TopBar = () => {
  const { user } = useAuth();
  
  return (
    <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white">
      <button
        type="button"
        className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1"></div>
        <div className="ml-4 flex items-center gap-x-4">
          <button
            type="button"
            className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-400 text-white text-xs font-bold">
              3
            </span>
          </button>
          
          <div className="flex items-center gap-x-4">
            <div className="hidden lg:block lg:flex lg:items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs font-medium text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Create Dashboard page**

```typescript
// client/src/pages/admin/Dashboard.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, Calendar, Stethoscope, FileText,
  TrendingUp, TrendingDown, ArrowUpRight
} from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  totalDoctors: number;
  totalBlogPosts: number;
  appointmentsThisMonth: number;
  appointmentsLastMonth: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard', { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  const statCards = [
    {
      name: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: Users,
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Appointments This Month',
      value: stats?.appointmentsThisMonth || 0,
      icon: Calendar,
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: 'Active Doctors',
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
      change: '+2%',
      changeType: 'increase',
    },
    {
      name: 'Blog Posts',
      value: stats?.totalBlogPosts || 0,
      icon: FileText,
      change: '+5%',
      changeType: 'increase',
    },
  ];
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-primary-500 p-3">
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {card.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {card.changeType === 'increase' ? (
                  <TrendingUp className="h-5 w-5 flex-shrink-0 self-center text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 flex-shrink-0 self-center text-red-500" />
                )}
                <span className="sr-only">
                  {card.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                </span>
                {card.change}
              </p>
              <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    View all
                  </a>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </div>
      
      {/* Recent Appointments */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Appointments</h2>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <p className="text-gray-500">No recent appointments to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create placeholder admin pages**

Create basic placeholder pages for all admin routes.

- [ ] **Step 6: Update App.tsx with admin routes**

```typescript
// client/src/App.tsx (update)
import { AdminLayout } from '@/components/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import Patients from '@/pages/admin/Patients';
import Appointments from '@/pages/admin/Appointments';
import Doctors from '@/pages/admin/Doctors';
import Services from '@/pages/admin/Services';
import Blog from '@/pages/admin/Blog';
import Events from '@/pages/admin/Events';
import Gallery from '@/pages/admin/Gallery';
import Messages from '@/pages/admin/Messages';
import Newsletter from '@/pages/admin/Newsletter';
import Analytics from '@/pages/admin/Analytics';
import Users from '@/pages/admin/Users';
import Settings from '@/pages/admin/Settings';

// Add to Routes
<Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="patients" element={<Patients />} />
    <Route path="appointments" element={<Appointments />} />
    <Route path="doctors" element={<Doctors />} />
    <Route path="services" element={<Services />} />
    <Route path="blog" element={<Blog />} />
    <Route path="events" element={<Events />} />
    <Route path="gallery" element={<Gallery />} />
    <Route path="messages" element={<Messages />} />
    <Route path="newsletter" element={<Newsletter />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="users" element={<Users />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Route>
```

- [ ] **Step 7: Test admin panel**

Run: `cd client && npm run dev`
Test: Login as admin, access /admin, verify sidebar navigation works.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: implement admin dashboard with sidebar navigation"
```

---

## Phase 4: Advanced Features

### Task 6: Blog System with Rich Text Editor

**Covers:** S6 (Blog Management)

**Files:**
- Create: `server/src/routes/blog.ts`
- Create: `server/src/controllers/blogController.ts`
- Create: `client/src/components/admin/BlogEditor.tsx`
- Create: `client/src/pages/admin/BlogManage.tsx`
- Create: `client/src/pages/Blog.tsx`
- Create: `client/src/pages/BlogPost.tsx`

**Interfaces:**
- Consumes: Task 2 (database), Task 3 (authentication)
- Produces: Blog CRUD with TipTap rich text editor

- [ ] **Step 1: Create blog controller**

```typescript
// server/src/controllers/blogController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import slugify from 'slugify';

export const getBlogPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { isPublished: true };
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { content: { contains: search as string } },
      ];
    }
    
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.blogPost.count({ where }),
    ]);
    
    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBlogPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Increment views
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
    
    res.json({ post });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBlogPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, isPublished } = req.body;
    
    const slug = slugify(title, { lower: true, strict: true });
    
    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });
    
    if (existingPost) {
      return res.status(400).json({ error: 'A post with this title already exists' });
    }
    
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        authorId: req.user!.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    
    res.status(201).json({ post });
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBlogPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, coverImage, category, tags, isPublished } = req.body;
    
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });
    
    if (!existingPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    let slug = existingPost.slug;
    if (title && title !== existingPost.title) {
      slug = slugify(title, { lower: true, strict: true });
      
      // Check if new slug already exists
      const slugExists = await prisma.blogPost.findFirst({
        where: { slug, id: { not: id } },
      });
      
      if (slugExists) {
        return res.status(400).json({ error: 'A post with this title already exists' });
      }
    }
    
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        category,
        tags: tags ? JSON.stringify(tags) : undefined,
        isPublished,
        publishedAt: isPublished && !existingPost.publishedAt ? new Date() : existingPost.publishedAt,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    
    res.json({ post });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBlogPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.blogPost.findUnique({
      where: { id },
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    await prisma.blogPost.delete({
      where: { id },
    });
    
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

- [ ] **Step 2: Create blog routes**

```typescript
// server/src/routes/blog.ts
import { Router } from 'express';
import { 
  getBlogPosts, 
  getBlogPostBySlug, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost 
} from '../controllers/blogController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// Public routes
router.get('/', getBlogPosts);
router.get('/:slug', getBlogPostBySlug);

// Protected routes (admin/staff only)
router.post('/', authenticate, authorize('admin', 'staff'), [
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
  body('excerpt').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional().isArray(),
  body('isPublished').optional().isBoolean(),
  validate,
], createBlogPost);

router.put('/:id', authenticate, authorize('admin', 'staff'), [
  body('title').optional().trim().notEmpty(),
  body('content').optional().trim().notEmpty(),
  body('excerpt').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional().isArray(),
  body('isPublished').optional().isBoolean(),
  validate,
], updateBlogPost);

router.delete('/:id', authenticate, authorize('admin', 'staff'), deleteBlogPost);

export default router;
```

- [ ] **Step 3: Create BlogEditor component with TipTap**

```typescript
// client/src/components/admin/BlogEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Link as LinkIcon, Code, Quote
} from 'lucide-react';

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const BlogEditor = ({ content, onChange }: BlogEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your blog post...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  
  if (!editor) {
    return null;
  }
  
  const addImage = () => {
    const url = window.prompt('Enter the URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };
  
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter the URL:', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };
  
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('underline') ? 'bg-gray-200' : ''
          }`}
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('strike') ? 'bg-gray-200' : ''
          }`}
        >
          <Strikethrough className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
          }`}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          }`}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
          }`}
        >
          <Heading3 className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
          }`}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
          }`}
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
          }`}
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''
          }`}
        >
          <AlignJustify className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('link') ? 'bg-gray-200' : ''
          }`}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('code') ? 'bg-gray-200' : ''
          }`}
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('blockquote') ? 'bg-gray-200' : ''
          }`}
        >
          <Quote className="h-4 w-4" />
        </button>
      </div>
      
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-4 min-h-[400px] focus:outline-none"
      />
    </div>
  );
};
```

- [ ] **Step 4: Create blog management page for admin**

```typescript
// client/src/pages/admin/BlogManage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { BlogEditor } from '@/components/admin/BlogEditor';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

export default function BlogManage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/blog?isPublished=all', { withCredentials: true });
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/blog/${id}`, { withCredentials: true });
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <button
          onClick={() => {
            setEditingPost(null);
            setShowEditor(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </button>
      </div>
      
      {showEditor ? (
        <BlogEditorModal
          post={editingPost}
          onClose={() => {
            setShowEditor(false);
            setEditingPost(null);
          }}
          onSave={() => {
            setShowEditor(false);
            setEditingPost(null);
            fetchPosts();
          }}
        />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500">{post.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {post.author.firstName} {post.author.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingPost(post);
                        setShowEditor(true);
                      }}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-gray-600 hover:text-gray-900 mr-4"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BlogEditorModal({ 
  post, 
  onClose, 
  onSave 
}: { 
  post: BlogPost | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [category, setCategory] = useState(post?.category || '');
  const [isPublished, setIsPublished] = useState(post?.isPublished || false);
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      const data = {
        title,
        content,
        excerpt,
        category,
        isPublished,
      };
      
      if (post) {
        await axios.put(`/api/blog/${post.id}`, data, { withCredentials: true });
      } else {
        await axios.post('/api/blog', data, { withCredentials: true });
      }
      
      onSave();
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto border w-full max-w-4xl shadow-xl rounded-lg bg-white">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {post ? 'Edit Post' : 'New Post'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter post title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <BlogEditor content={content} onChange={setContent} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Brief summary of the post"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select category</option>
                <option value="health-tips">Health Tips</option>
                <option value="news">News</option>
                <option value="events">Events</option>
                <option value="announcements">Announcements</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
              Publish immediately
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title || !content}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create public blog pages**

```typescript
// client/src/pages/Blog.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  publishedAt?: string;
  author: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/blog');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Health Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest health tips, news, and updates from Bodija Health Hub.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                {post.category && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full mb-2">
                    {post.category}
                  </span>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  <Link to={`/blog/${post.slug}`} className="hover:text-primary-600">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    {post.author.firstName} {post.author.lastName}
                  </div>
                  {post.publishedAt && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center mt-4 text-primary-600 hover:text-primary-700"
                >
                  Read more
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Add blog routes to server**

Update `server/src/index.ts` to include blog routes.

- [ ] **Step 7: Test blog functionality**

Run: `cd server && npm run dev`
Run: `cd client && npm run dev`

Test:
1. Create a blog post via admin panel
2. View blog post on public site
3. Edit and delete blog posts

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: implement blog system with TipTap rich text editor"
```

### Task 7: Gallery and Events Management

**Covers:** S7 (Gallery, Events)

**Files:**
- Create: `server/src/routes/gallery.ts`
- Create: `server/src/routes/events.ts`
- Create: `server/src/controllers/galleryController.ts`
- Create: `server/src/controllers/eventController.ts`
- Create: `client/src/pages/admin/GalleryManage.tsx`
- Create: `client/src/pages/admin/EventsManage.tsx`
- Create: `client/src/pages/Gallery.tsx`
- Create: `client/src/pages/Events.tsx`

**Interfaces:**
- Consumes: Task 2 (database), Task 3 (authentication)
- Produces: Gallery and events CRUD with image upload

- [ ] **Step 1: Create gallery controller**

```typescript
// server/src/controllers/galleryController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
});

export const getGalleryItems = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    const where: any = {};
    if (category) {
      where.category = category;
    }
    
    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    
    res.json({ items });
  } catch (error) {
    console.error('Get gallery items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    // Process image with sharp
    const processedFilename = `processed-${file.filename}`;
    await sharp(file.path)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(path.join(process.env.UPLOAD_DIR || 'uploads', processedFilename));
    
    // Get max sort order
    const maxOrder = await prisma.galleryItem.aggregate({
      _max: { sortOrder: true },
    });
    
    const item = await prisma.galleryItem.create({
      data: {
        title,
        description,
        image: `/uploads/${processedFilename}`,
        category,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });
    
    res.status(201).json({ item });
  } catch (error) {
    console.error('Create gallery item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category, sortOrder } = req.body;
    
    const item = await prisma.galleryItem.findUnique({
      where: { id },
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    
    const updatedItem = await prisma.galleryItem.update({
      where: { id },
      data: {
        title,
        description,
        category,
        sortOrder,
      },
    });
    
    res.json({ item: updatedItem });
  } catch (error) {
    console.error('Update gallery item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.galleryItem.findUnique({
      where: { id },
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    
    // Delete image file
    const fs = require('fs');
    const imagePath = path.join(process.cwd(), item.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    await prisma.galleryItem.delete({
      where: { id },
    });
    
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

- [ ] **Step 2: Create gallery routes**

```typescript
// server/src/routes/gallery.ts
import { Router } from 'express';
import { 
  getGalleryItems, 
  createGalleryItem, 
  updateGalleryItem, 
  deleteGalleryItem,
  upload
} from '../controllers/galleryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public route
router.get('/', getGalleryItems);

// Protected routes (admin/staff only)
router.post('/', authenticate, authorize('admin', 'staff'), upload.single('image'), createGalleryItem);
router.put('/:id', authenticate, authorize('admin', 'staff'), updateGalleryItem);
router.delete('/:id', authenticate, authorize('admin', 'staff'), deleteGalleryItem);

export default router;
```

- [ ] **Step 3: Create events controller**

```typescript
// server/src/controllers/eventController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import slugify from 'slugify';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, upcoming } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { isPublished: true };
    
    if (upcoming === 'true') {
      where.startDate = { gte: new Date() };
    }
    
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.event.count({ where }),
    ]);
    
    res.json({
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { slug },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, shortDescription, image, location, startDate, endDate, isPublished } = req.body;
    
    const slug = slugify(title, { lower: true, strict: true });
    
    // Check if slug already exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug },
    });
    
    if (existingEvent) {
      return res.status(400).json({ error: 'An event with this title already exists' });
    }
    
    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        shortDescription,
        image,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isPublished,
      },
    });
    
    res.status(201).json({ event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, shortDescription, image, location, startDate, endDate, isPublished } = req.body;
    
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    let slug = existingEvent.slug;
    if (title && title !== existingEvent.title) {
      slug = slugify(title, { lower: true, strict: true });
      
      // Check if new slug already exists
      const slugExists = await prisma.event.findFirst({
        where: { slug, id: { not: id } },
      });
      
      if (slugExists) {
        return res.status(400).json({ error: 'An event with this title already exists' });
      }
    }
    
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        shortDescription,
        image,
        location,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isPublished,
      },
    });
    
    res.json({ event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    await prisma.event.delete({
      where: { id },
    });
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

- [ ] **Step 4: Create events routes**

```typescript
// server/src/routes/events.ts
import { Router } from 'express';
import { 
  getEvents, 
  getEventBySlug, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// Public routes
router.get('/', getEvents);
router.get('/:slug', getEventBySlug);

// Protected routes (admin/staff only)
router.post('/', authenticate, authorize('admin', 'staff'), [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601(),
  validate,
], createEvent);

router.put('/:id', authenticate, authorize('admin', 'staff'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  validate,
], updateEvent);

router.delete('/:id', authenticate, authorize('admin', 'staff'), deleteEvent);

export default router;
```

- [ ] **Step 5: Create gallery and events management pages for admin**

Create similar components as blog management for gallery and events.

- [ ] **Step 6: Create public gallery and events pages**

Create public-facing pages for gallery and events.

- [ ] **Step 7: Add routes to server**

Update `server/src/index.ts` to include gallery and events routes.

- [ ] **Step 8: Test gallery and events functionality**

Run and test CRUD operations for gallery and events.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: implement gallery and events management with image upload"
```

---

## Phase 5: Payment Integration

### Task 8: Donation System with Paystack

**Covers:** S8 (Donations)

**Files:**
- Create: `server/src/routes/donations.ts`
- Create: `server/src/controllers/donationController.ts`
- Create: `client/src/pages/Donate.tsx`
- Create: `client/src/components/donation/DonationForm.tsx`

**Interfaces:**
- Consumes: Task 2 (database), Task 3 (authentication)
- Produces: Donation page with Paystack integration

- [ ] **Step 1: Create donation controller**

```typescript
// server/src/controllers/donationController.ts
import { Request, Response } from 'express';
import Paystack from 'paystack';
import prisma from '../lib/prisma';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { amount, email, name, phone, purpose } = req.body;
    
    // Initialize Paystack transaction
    const response = await paystack.transaction.initialize({
      email,
      amount: amount * 100, // Paystack expects amount in kobo
      currency: 'NGN',
      metadata: {
        name,
        phone,
        purpose,
        custom_fields: [
          {
            display_name: 'Donor Name',
            variable_name: 'donor_name',
            value: name,
          },
          {
            display_name: 'Phone Number',
            variable_name: 'phone_number',
            value: phone,
          },
          {
            display_name: 'Purpose',
            variable_name: 'purpose',
            value: purpose,
          },
        ],
      },
    });
    
    res.json({
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    
    // Verify transaction with Paystack
    const response = await paystack.transaction.verify(reference);
    
    if (response.data.status === 'success') {
      // Save donation to database
      const donation = await prisma.donation.create({
        data: {
          reference,
          amount: response.data.amount / 100, // Convert from kobo to naira
          email: response.data.customer.email,
          name: response.data.metadata.name,
          phone: response.data.metadata.phone,
          purpose: response.data.metadata.purpose,
          status: 'completed',
        },
      });
      
      res.json({ success: true, donation });
    } else {
      res.json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

export const getDonations = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.donation.count(),
    ]);
    
    res.json({
      donations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

- [ ] **Step 2: Add Donation model to Prisma schema**

Update `server/prisma/schema.prisma` to include Donation model:

```prisma
model Donation {
  id            String    @id @default(cuid())
  reference     String    @unique
  amount        Float
  email         String
  name          String?
  phone         String?
  purpose       String?
  status        String    @default("pending") // pending, completed, failed
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

- [ ] **Step 3: Create donation routes**

```typescript
// server/src/routes/donations.ts
import { Router } from 'express';
import { initializePayment, verifyPayment, getDonations } from '../controllers/donationController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// Public routes
router.post('/initialize', [
  body('amount').isNumeric().isFloat({ min: 100 }), // Minimum 100 naira
  body('email').isEmail().normalizeEmail(),
  body('name').optional().trim(),
  body('phone').optional().trim(),
  body('purpose').optional().trim(),
  validate,
], initializePayment);

router.get('/verify/:reference', verifyPayment);

// Protected routes (admin only)
router.get('/', authenticate, authorize('admin'), getDonations);

export default router;
```

- [ ] **Step 4: Create DonationForm component**

```typescript
// client/src/components/donation/DonationForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Heart, CreditCard, CheckCircle } from 'lucide-react';

interface DonationFormInputs {
  amount: number;
  name: string;
  email: string;
  phone?: string;
  purpose?: string;
}

const presetAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

export const DonationForm = () => {
  const [customAmount, setCustomAmount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<DonationFormInputs>({
    defaultValues: {
      amount: 1000,
    },
  });
  
  const selectedAmount = watch('amount');
  
  const onSubmit = async (data: DonationFormInputs) => {
    try {
      setIsProcessing(true);
      
      const response = await axios.post('/api/donations/initialize', data);
      
      // Redirect to Paystack payment page
      window.location.href = response.data.authorization_url;
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600">Your donation has been received successfully.</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Amount (₦)
        </label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setValue('amount', amount);
                setCustomAmount(false);
              }}
              className={`py-2 px-4 border rounded-md transition-colors ${
                selectedAmount === amount && !customAmount
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              ₦{amount.toLocaleString()}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setCustomAmount(true)}
            className={`w-full py-2 px-4 border rounded-md transition-colors ${
              customAmount
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Custom Amount
          </button>
          {customAmount && (
            <div className="mt-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                <input
                  type="number"
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 100, message: 'Minimum donation is ₦100' }
                  })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter amount"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Personal Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your phone number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose (Optional)
          </label>
          <select
            {...register('purpose')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select purpose</option>
            <option value="general">General Donation</option>
            <option value="equipment">Medical Equipment</option>
            <option value="outreach">Community Outreach</option>
            <option value="scholarship">Medical Scholarship</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Donate Now
          </>
        )}
      </button>
      
      <p className="text-center text-sm text-gray-500 mt-4">
        <Heart className="h-4 w-4 inline mr-1" />
        Your donation helps us provide quality healthcare to the community.
      </p>
    </form>
  );
};
```

- [ ] **Step 5: Create Donate page**

```typescript
// client/src/pages/Donate.tsx
import { DonationForm } from '@/components/donation/DonationForm';
import { Heart, Shield, Users, Award } from 'lucide-react';

export default function Donate() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Our Mission</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your donation helps us provide quality healthcare to individuals and families in need.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>
            <DonationForm />
          </div>
          
          {/* Impact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Impact</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Heart className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Provide Care</h3>
                  <p className="text-gray-600">
                    Help us provide medical care to those who cannot afford it.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Upgrade Equipment</h3>
                  <p className="text-gray-600">
                    Help us acquire modern medical equipment for better diagnosis and treatment.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Community Outreach</h3>
                  <p className="text-gray-600">
                    Support our health outreach programs in underserved communities.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Award className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Medical Training</h3>
                  <p className="text-gray-600">
                    Fund scholarships for aspiring healthcare professionals.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-primary-50 rounded-lg">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                Tax Deductible
              </h3>
              <p className="text-primary-700">
                All donations are tax deductible. You will receive a receipt for your records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Add donation routes to server**

Update `server/src/index.ts` to include donation routes.

- [ ] **Step 7: Add Donation model to Prisma schema**

Run: `cd server && npm run db:push`

- [ ] **Step 8: Test donation flow**

Test:
1. Fill out donation form
2. Redirect to Paystack
3. Complete payment
4. Verify payment and save to database

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: implement donation system with Paystack integration"
```

---

## Phase 6: Polish & Deployment

### Task 9: Email System and Newsletter

**Covers:** S9 (Email, Newsletter)

**Files:**
- Create: `server/src/utils/email.ts`
- Create: `server/src/routes/newsletter.ts`
- Create: `server/src/controllers/newsletterController.ts`
- Create: `client/src/components/common/NewsletterSignup.tsx`

**Interfaces:**
- Consumes: Task 2 (database), Task 3 (authentication)
- Produces: Email sending, newsletter subscription

- [ ] **Step 1: Create email utility**

```typescript
// server/src/utils/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const mailOptions = {
    from: `"Bodija Health Hub" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };
  
  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (name: string, email: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">Welcome to Bodija Health Hub!</h1>
      <p>Dear ${name},</p>
      <p>Thank you for subscribing to our newsletter. We're excited to share health tips, news, and updates with you.</p>
      <p>If you have any questions, feel free to contact us.</p>
      <p>Best regards,<br>Bodija Health Hub Team</p>
    </div>
  `;
  
  await sendEmail({
    to: email,
    subject: 'Welcome to Bodija Health Hub Newsletter',
    html,
  });
};

export const sendNewsletterEmail = async (
  subscribers: { email: string; name?: string }[],
  subject: string,
  content: string
): Promise<void> => {
  for (const subscriber of subscribers) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">${subject}</h1>
        <p>Dear ${subscriber.name || 'Subscriber'},</p>
        ${content}
        <p>Best regards,<br>Bodija Health Hub Team</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          You received this email because you subscribed to our newsletter.
          <a href="#">Unsubscribe</a>
        </p>
      </div>
    `;
    
    await sendEmail({
      to: subscriber.email,
      subject,
      html,
    });
  }
};
```

- [ ] **Step 2: Create newsletter controller**

```typescript
// server/src/controllers/newsletterController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { sendWelcomeEmail } from '../utils/email';

export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    
    // Check if already subscribed
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({ error: 'Email is already subscribed' });
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true },
        });
        
        return res.json({ message: 'Subscription reactivated successfully' });
      }
    }
    
    // Create new subscription
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        name,
      },
    });
    
    // Send welcome email
    await sendWelcomeEmail(name || 'Subscriber', email);
    
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }
    
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false },
    });
    
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubscribers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);
    
    res.json({
      subscribers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendNewsletter = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, content } = req.body;
    
    // Get all active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: {
        email: true,
        name: true,
      },
    });
    
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers' });
    }
    
    // Send newsletter
    const { sendNewsletterEmail } = await import('../utils/email');
    await sendNewsletterEmail(subscribers, subject, content);
    
    res.json({ message: `Newsletter sent to ${subscribers.length} subscribers` });
  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

- [ ] **Step 3: Create newsletter routes**

```typescript
// server/src/routes/newsletter.ts
import { Router } from 'express';
import { subscribe, unsubscribe, getSubscribers, sendNewsletter } from '../controllers/newsletterController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// Public routes
router.post('/subscribe', [
  body('email').isEmail().normalizeEmail(),
  body('name').optional().trim(),
  validate,
], subscribe);

router.get('/unsubscribe/:email', unsubscribe);

// Protected routes (admin only)
router.get('/subscribers', authenticate, authorize('admin'), getSubscribers);
router.post('/send', authenticate, authorize('admin'), [
  body('subject').trim().notEmpty(),
  body('content').trim().notEmpty(),
  validate,
], sendNewsletter);

export default router;
```

- [ ] **Step 4: Create NewsletterSignup component**

```typescript
// client/src/components/common/NewsletterSignup.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Mail, CheckCircle } from 'lucide-react';

interface NewsletterFormInputs {
  email: string;
  name?: string;
}

export const NewsletterSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<NewsletterFormInputs>();
  
  const onSubmit = async (data: NewsletterFormInputs) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      await axios.post('/api/newsletter/subscribe', data);
      
      setSuccess(true);
      reset();
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to subscribe');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-primary-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Mail className="h-12 w-12 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-primary-100 mb-6">
            Stay updated with health tips, news, and events from Bodija Health Hub.
          </p>
          
          {success ? (
            <div className="flex items-center justify-center text-white">
              <CheckCircle className="h-5 w-5 mr-2" />
              Thank you for subscribing!
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                  })}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-primary-600 px-6 py-3 rounded-md font-semibold hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-primary-100">{errors.email.message}</p>
              )}
              {error && (
                <p className="mt-2 text-sm text-primary-100">{error}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 5: Add routes to server**

Update `server/src/index.ts` to include newsletter routes.

- [ ] **Step 6: Test email and newsletter**

Test:
1. Subscribe to newsletter
2. Receive welcome email
3. Send newsletter from admin panel

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: implement email system and newsletter subscription"
```

### Task 10: Analytics and Settings

**Covers:** S10 (Analytics, Settings)

**Files:**
- Create: `server/src/routes/analytics.ts`
- Create: `server/src/controllers/analyticsController.ts`
- Create: `server/src/routes/settings.ts`
- Create: `server/src/controllers/settingsController.ts`
- Create: `client/src/pages/admin/AnalyticsPage.tsx`
- Create: `client/src/pages/admin/SettingsPage.tsx`

**Interfaces:**
- Consumes: Task 2 (database), Task 3 (authentication)
- Produces: Analytics tracking, admin settings management

- [ ] **Step 1: Create analytics controller**

```typescript
// server/src/controllers/analyticsController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const trackPageView = async (req: Request, res: Response) => {
  try {
    const { page, metadata } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    await prisma.analytics.create({
      data: {
        page,
        action: 'page_view',
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent,
      },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Track page view error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const [
      totalPatients,
      totalDoctors,
      totalBlogPosts,
      appointmentsThisMonth,
      appointmentsLastMonth,
      recentAppointments,
      popularServices,
      patientDemographics,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count({ where: { isActive: true } }),
      prisma.blogPost.count({ where: { isPublished: true } }),
      prisma.appointment.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.appointment.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: true,
          doctor: true,
          service: true,
        },
      }),
      prisma.appointment.groupBy({
        by: ['serviceId'],
        _count: true,
        orderBy: { _count: { serviceId: 'desc' } },
        take: 5,
      }),
      prisma.patient.groupBy({
        by: ['gender'],
        _count: true,
      }),
    ]);
    
    // Calculate appointment trends (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const appointmentTrends = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    });
    
    res.json({
      totalPatients,
      totalDoctors,
      totalBlogPosts,
      appointmentsThisMonth,
      appointmentsLastMonth,
      recentAppointments,
      popularServices,
      patientDemographics,
      appointmentTrends,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, page } = req.query;
    
    const where: any = {};
    
    if (startDate) {
      where.createdAt = { gte: new Date(startDate as string) };
    }
    
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };
    }
    
    if (page) {
      where.page = page;
    }
    
    const [analytics, total] = await Promise.all([
      prisma.analytics.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.analytics.count({ where }),
    ]);
    
    // Group by page
    const pageViews = await prisma.analytics.groupBy({
      by: ['page'],
      _count: true,
      orderBy: { _count: { page: 'desc' } },
      take: 10,
    });
    
    res.json({
      analytics,
      total,
      pageViews,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

- [ ] **Step 2: Create analytics routes**

```typescript
// server/src/routes/analytics.ts
import { Router } from 'express';
import { trackPageView, getDashboardStats, getAnalytics } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public route
router.post('/track', trackPageView);

// Protected routes (admin only)
router.get('/dashboard', authenticate, authorize('admin', 'staff'), getDashboardStats);
router.get('/', authenticate, authorize('admin'), getAnalytics);

export default router;
```

- [ ] **Step 3: Create settings controller**

```typescript
// server/src/controllers/settingsController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();
    
    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    
    res.json({ settings: settingsObject });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { settings } = req.body;
    
    // Update or create each setting
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value as string },
        create: { key, value: value as string },
      });
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPublicSettings = async (req: Request, res: Response) => {
  try {
    // Only return public settings
    const publicKeys = ['site_name', 'site_description', 'contact_email', 'contact_phone', 'address'];
    
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: publicKeys },
      },
    });
    
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    
    res.json({ settings: settingsObject });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

- [ ] **Step 4: Create settings routes**

```typescript
// server/src/routes/settings.ts
import { Router } from 'express';
import { getSettings, updateSettings, getPublicSettings } from '../controllers/settingsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public route
router.get('/public', getPublicSettings);

// Protected routes (admin only)
router.get('/', authenticate, authorize('admin'), getSettings);
router.put('/', authenticate, authorize('admin'), updateSettings);

export default router;
```

- [ ] **Step 5: Create AnalyticsPage component**

```typescript
// client/src/pages/admin/AnalyticsPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  totalPatients: number;
  totalDoctors: number;
  totalBlogPosts: number;
  appointmentsThisMonth: number;
  appointmentsLastMonth: number;
  pageViews: { page: string; _count: number }[];
  patientDemographics: { gender: string | null; _count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard', { withCredentials: true });
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!data) {
    return <div className="text-center py-12">Failed to load analytics data</div>;
  }
  
  // Chart data
  const pageViewsData = {
    labels: data.pageViews.map(pv => pv.page),
    datasets: [
      {
        label: 'Page Views',
        data: data.pageViews.map(pv => pv._count),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const demographicsData = {
    labels: data.patientDemographics.map(pd => pd.gender || 'Unknown'),
    datasets: [
      {
        data: data.patientDemographics.map(pd => pd._count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(107, 114, 128, 0.5)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-md flex items-center justify-center">
                  <span className="text-primary-600 text-xl font-bold">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                  <dd className="text-lg font-semibold text-gray-900">{data.totalPatients}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-secondary-100 rounded-md flex items-center justify-center">
                  <span className="text-secondary-600 text-xl font-bold">👨‍⚕️</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Doctors</dt>
                  <dd className="text-lg font-semibold text-gray-900">{data.totalDoctors}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
                  <span className="text-green-600 text-xl font-bold">📅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Appointments (Month)</dt>
                  <dd className="text-lg font-semibold text-gray-900">{data.appointmentsThisMonth}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-md flex items-center justify-center">
                  <span className="text-yellow-600 text-xl font-bold">📝</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Blog Posts</dt>
                  <dd className="text-lg font-semibold text-gray-900">{data.totalBlogPosts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Page Views</h3>
          <div className="h-64">
            <Bar data={pageViewsData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Demographics</h3>
          <div className="h-64">
            <Pie data={demographicsData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create SettingsPage component**

```typescript
// client/src/pages/admin/SettingsPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

interface Settings {
  [key: string]: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings', { withCredentials: true });
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put('/api/settings', { settings }, { withCredentials: true });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.site_name || ''}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Description
                </label>
                <input
                  type="text"
                  value={settings.site_description || ''}
                  onChange={(e) => handleChange('site_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={settings.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={settings.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={settings.facebook_url || ''}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={settings.twitter_url || ''}
                  onChange={(e) => handleChange('twitter_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={settings.instagram_url || ''}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={settings.youtube_url || ''}
                  onChange={(e) => handleChange('youtube_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Add routes to server**

Update `server/src/index.ts` to include analytics and settings routes.

- [ ] **Step 8: Test analytics and settings**

Test:
1. Track page views
2. View analytics dashboard
3. Update settings

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: implement analytics tracking and admin settings"
```

### Task 11: Final Polish and Deployment Preparation

**Covers:** S11 (Polish, Deployment)

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`
- Create: `README.md`
- Create: `scripts/deploy.sh`

**Interfaces:**
- Consumes: All previous tasks
- Produces: Production-ready deployment configuration

- [ ] **Step 1: Create Dockerfile**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build shared package
RUN npm run build --workspace=shared

# Build client
RUN npm run build --workspace=client

# Build server
RUN npm run build --workspace=server

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built files
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server/prisma ./server/prisma

# Create uploads directory
RUN mkdir -p uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Start server
CMD ["node", "server/dist/index.js"]
```

- [ ] **Step 2: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    volumes:
      - ./uploads:/app/uploads
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/prod.db
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY}
      - PAYSTACK_PUBLIC_KEY=${PAYSTACK_PUBLIC_KEY}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    restart: unless-stopped

volumes:
  data:
  uploads:
```

- [ ] **Step 3: Create .dockerignore**

```
node_modules
.git
.env
*.log
dist
build
coverage
```

- [ ] **Step 4: Create README.md**

```markdown
# Bodija Health Hub

A full-stack healthcare website for Bodija Health Hub, a Nigerian healthcare clinic.

## Features

- Public pages (Home, About, Services, Doctors, Blog, Events, Gallery, Contact)
- Online appointment booking
- Admin panel with dashboard, patient management, appointment management
- Blog with rich text editor (TipTap)
- Gallery and events management
- Newsletter subscription
- Donation system with Paystack integration
- Analytics tracking
- Responsive design (mobile-first)

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite with Prisma ORM
- **Authentication:** JWT with httpOnly cookies
- **Rich Text Editor:** TipTap
- **Payment:** Paystack
- **Email:** Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bodija-health-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   cd server
   npm run db:generate
   npm run db:push
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

The client will be available at http://localhost:3000 and the server at http://localhost:4000.

## Deployment

### Docker

1. Build and run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set up environment variables for production.

3. Start the server:
   ```bash
   cd server
   npm start
   ```

## Project Structure

```
bodija-health-hub/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript types
├── docs/            # Documentation
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh-token
- GET /api/auth/me

### Blog
- GET /api/blog
- GET /api/blog/:slug
- POST /api/blog
- PUT /api/blog/:id
- DELETE /api/blog/:id

### Gallery
- GET /api/gallery
- POST /api/gallery
- PUT /api/gallery/:id
- DELETE /api/gallery/:id

### Events
- GET /api/events
- GET /api/events/:slug
- POST /api/events
- PUT /api/events/:id
- DELETE /api/events/:id

### Donations
- POST /api/donations/initialize
- GET /api/donations/verify/:reference
- GET /api/donations

### Newsletter
- POST /api/newsletter/subscribe
- GET /api/newsletter/unsubscribe/:email
- GET /api/newsletter/subscribers
- POST /api/newsletter/send

### Analytics
- POST /api/analytics/track
- GET /api/analytics/dashboard
- GET /api/analytics

### Settings
- GET /api/settings/public
- GET /api/settings
- PUT /api/settings

## License

MIT
```

- [ ] **Step 5: Create deploy script**

```bash
#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Run database migrations
echo "Running database migrations..."
cd server
npm run db:generate
npm run db:push

# Start the server
echo "Starting the server..."
npm start
```

- [ ] **Step 6: Final testing**

Test the entire application:
1. All public pages render correctly
2. Authentication works
3. Admin panel functions properly
4. Blog, gallery, events CRUD operations work
5. Donation flow works
6. Newsletter subscription works
7. Analytics tracking works
8. Settings can be updated

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add deployment configuration and documentation"
```

---

## Summary

This plan implements the Bodija Health Hub healthcare website with:

1. **Core Scaffolding + Authentication** (Tasks 1-3)
2. **Public Pages** (Task 4)
3. **Admin Panel** (Task 5)
4. **Advanced Features** (Tasks 6-7)
5. **Payment Integration** (Task 8)
6. **Polish & Deployment** (Tasks 9-11)

Each task follows TDD principles with complete code examples, testing steps, and commit messages. The plan covers all requirements from the specification including:
- React frontend with Tailwind CSS
- Node.js/Express backend with TypeScript
- SQLite database with Prisma ORM
- JWT authentication with httpOnly cookies
- Admin panel with dashboard and management pages
- Blog with TipTap rich text editor
- Gallery and events management
- Donation system with Paystack
- Newsletter subscription
- Analytics tracking
- Responsive mobile-first design
- Deployment configuration with Docker

The implementation is decomposed into manageable tasks that can be executed sequentially or in parallel where dependencies allow.
