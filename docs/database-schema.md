# Database Schema Documentation

## Current Schema (Phase 1)

### User Model
```prisma
model User {
  id          String       @id @default(cuid())
  email       String       @unique
  name        String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  scanResults ScanResult[]
}
```

### ScanResult Model
```prisma
model ScanResult {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type       String   // "EMAIL_PRIVACY_AUDIT"
  resultJson String   // Full ScanReport serialized
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
  @@index([createdAt])
}
```

## Planned Schema Extensions

### Phase 2: Add File Metadata Tracking
```prisma
model ScanResult {
  // ... existing fields
  fileName        String?   // Original uploaded file name
  fileType        String?   // MIME type
  fileSize        Int?      // Bytes
  hasMetadata     Boolean   @default(false)
}
```

### Phase 3: Add Profile Text Tracking
```prisma
model ScanResult {
  // ... existing fields
  hasBioText      Boolean   @default(false)
  hasScreenshot   Boolean   @default(false)
  piiFindingsCount Int      @default(0)
}
```

### Future: Scheduled Scans (Out of Scope)
```prisma
model ScheduledScan {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  email       String
  frequency   String   // "daily", "weekly", "monthly"
  isActive    Boolean  @default(true)
  lastRun     DateTime?
  nextRun     DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Migration Strategy

| Phase | Migration | Command |
|-------|-----------|---------|
| 2 | Add file tracking fields | `npx prisma migrate dev --name add_file_tracking` |
| 3 | Add profile text fields | `npx prisma migrate dev --name add_profile_text_tracking` |

## Prisma Client Singleton Pattern

**File:** `lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Reasoning:** Prevents connection exhaustion during Next.js hot reload in development.