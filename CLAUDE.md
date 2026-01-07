# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agnes Nails is a full-stack appointment booking system for a nail salon with a Next.js frontend and NestJS backend, connected to PostgreSQL via TypeORM.

## Development Commands

### Docker Development (Recommended)
```bash
# Start all services with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f [service-name]
```

### Backend (NestJS)
```bash
cd backend

# Development with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Run tests
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# Lint and format
npm run lint
npm run format

# Build for production
npm run build
npm run start:prod

# Seed database with admin user
npm run seed
```

### Frontend (Next.js)
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build
npm start

# Lint
npm run lint
```

## Architecture

### Backend Structure (NestJS + TypeORM)

The backend follows NestJS modular architecture with these main modules:

- **AppointmentsModule**: CRUD operations for customer appointments
- **BlockedDatesModule**: Manage dates when salon is closed
- **OpenHoursModule**: Configure business hours for each day of week
- **AuthModule**: JWT-based authentication for admin users

**Database**: TypeORM with `synchronize: true` (auto-creates/updates schema). All entities are auto-discovered via `entities: [__dirname + '/**/*.entity{.ts,.js}']`.

**Authentication**:
- JWT tokens with Passport strategy
- Default admin user auto-created on startup: `username: admin, password: admin123`
- Protected routes use `@UseGuards(JwtAuthGuard)` decorator
- Seed script available: `npm run seed`

**Validation**: Global ValidationPipe with class-validator decorators in DTOs.

**CORS**: Enabled for `http://localhost:3000` and `http://localhost:3001`.

### Frontend Structure (Next.js App Router)

Uses Next.js 16 App Router with TypeScript:

**Main Routes**:
- `/` - Landing page
- `/services` - Service listings
- `/booking` - Appointment booking form
- `/admin/login` - Admin authentication
- `/admin` - Admin dashboard with tabbed interface:
  - **Appointments tab**: View/filter/manage appointments, update status, delete
  - **Settings tab**:
    - Blocked dates management (add/remove dates when salon is closed)
    - Business hours configuration (set open/close times per weekday)

**State Management**: React useState with useEffect for data fetching. No global state library.

**API Communication**:
- Uses `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:3001`)
- JWT tokens stored in localStorage as `authToken`
- Admin routes check for token and redirect to `/admin/login` if missing

**Styling**: CSS Modules with component-specific `.css` files (e.g., `Admin.css`, `Booking.css`).

### Key Data Models

**Appointment** (appointments table):
- Customer info: name, email, phone
- Booking details: date, time, service
- Status: pending/confirmed/completed/cancelled
- Optional notes field

**BlockedDate** (blocked_dates table):
- date (unique)
- reason
- Used to prevent bookings on holidays/closures

**OpenHour** (open_hours table):
- dayOfWeek (0-6, Sunday-Saturday)
- isOpen (boolean)
- openTime, closeTime (HH:MM format)
- Auto-initialized with Mon-Fri 9:00-17:00, weekends closed

**User** (users table):
- username (unique)
- password (bcrypt hashed)
- Used for admin authentication

## Common Workflows

### Adding a New Backend Feature Module

1. Generate module: `nest g module feature-name`
2. Generate service: `nest g service feature-name`
3. Generate controller: `nest g controller feature-name`
4. Create entity in `feature-name/entities/feature.entity.ts`
5. Create DTOs in `feature-name/dto/`
6. Import `TypeOrmModule.forFeature([FeatureEntity])` in module
7. Add module to `app.module.ts` imports

### Admin Dashboard Modifications

The admin dashboard (`/admin/page.tsx`) uses a tab-based layout. Both tabs share the same error/success message state from settings. When adding new sections:

- Add state variables at component top
- Create fetch/update functions before the return statement
- Add UI in appropriate tab section
- Update CSS in `Admin.css`
- Consider adding initialization logic to `useEffect` on mount

### Database Changes

TypeORM synchronize is enabled, so entity changes auto-update schema. For production, disable synchronize and use migrations.

## Environment Configuration

**Backend** (`.env` in backend/):
```
DATABASE_HOST=postgres  # or localhost for local dev
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=agnes_nails
PORT=3001
JWT_SECRET=your-secret-key  # Add if not present
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here  # Get from https://www.google.com/recaptcha/admin
```

**Frontend** (`.env.local` in frontend/):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here  # Get from https://www.google.com/recaptcha/admin
```

**Docker**: Environment variables are set in `docker-compose.dev.yml` - modify there for Docker development.

## API Endpoints

All admin-protected endpoints require `Authorization: Bearer <token>` header.

**Health**: `GET /health` - Health check endpoint (returns status, timestamp, uptime)
**Appointments**: `/appointments` (GET public, POST/PATCH/DELETE protected)
**Blocked Dates**: `/blocked-dates` (GET public, POST/PATCH/DELETE protected)
**Open Hours**: `/open-hours` (GET public, POST/PATCH/DELETE protected)
  - `POST /open-hours/initialize` - Initialize default hours (Mon-Fri 9-5)
  - `POST /open-hours/reset` - Reset to defaults (clears existing)
**Auth**: `POST /auth/login` - Returns JWT token

## Production Deployment

### Production Docker Setup

Production deployment uses separate Dockerfiles and configuration:

**Files**:
- `docker-compose.prod.yml` - Production Docker Compose configuration
- `backend/Dockerfile.prod` - Multi-stage production build for backend
- `frontend/Dockerfile.prod` - Optimized Next.js production build
- `nginx/nginx.conf` - Reverse proxy with SSL support
- `.env.production` - Production environment variables (not in git)

**Deployment Stack**:
- Nginx reverse proxy for SSL/TLS and routing
- Certbot for Let's Encrypt SSL certificates
- PostgreSQL with persistent volumes
- Backend and frontend as containerized services
- Automated SSL certificate renewal

**Key Features**:
- Multi-stage Docker builds for smaller images
- Non-root users for security
- Health checks for all services
- Automatic restart policies
- Database backups via `scripts/backup.sh`

**Documentation**:
- `DEPLOYMENT.md` - Comprehensive step-by-step VPS deployment guide
- `DEPLOYMENT-QUICK-REFERENCE.md` - Quick command reference for operations
- `scripts/README.md` - Backup script documentation

**Health Check Endpoint**:
- `GET /health` - Returns application status (used by Docker healthcheck)

### Quick Production Deploy

```bash
# On VPS
git clone <repo>
cd agnes-nails
cp .env.production.example .env.production
# Edit .env.production with secure values
docker compose -f docker-compose.prod.yml up -d --build
```

See `DEPLOYMENT.md` for complete instructions including SSL setup.

## Important Notes

- **TypeORM Synchronize**: Currently `true` - schema changes auto-apply. Disable for production.
- **Default Admin Credentials**: `admin/admin123` - created automatically on backend startup.
- **Open Hours**: Auto-initialize on first admin settings page visit if empty.
- **Client-side Auth**: Uses localStorage - tokens persist across browser sessions.
- **Hot Reload**: Docker dev mode mounts source directories for live updates.
- **Indexing**: Do NOT index node_modules folder
- **Production Security**: Change default admin password, use strong JWT_SECRET, enable HTTPS
- **reCAPTCHA Setup**:
  1. Get site key and secret key from https://www.google.com/recaptcha/admin (select reCAPTCHA v2)
  2. Add `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` to `frontend/.env.local`
  3. Add `RECAPTCHA_SECRET_KEY` to `backend/.env`
  4. Booking form validates reCAPTCHA token on backend before creating appointments
  5. If secret key not configured, backend allows submissions (development mode)