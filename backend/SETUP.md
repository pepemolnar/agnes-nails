# Agnes Nails Backend Setup

This is the backend API for the Agnes Nails appointment booking system, built with NestJS and PostgreSQL.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Database Setup

1. Install PostgreSQL if you haven't already
2. Create a new database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE agnes_nails;

# Exit psql
\q
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=agnes_nails
PORT=3001
```

## Running the Application

### Development mode

```bash
npm run start:dev
```

### Production mode

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Appointments

- `POST /appointments` - Create a new appointment
- `GET /appointments` - Get all appointments
- `GET /appointments/:id` - Get a specific appointment
- `PATCH /appointments/:id` - Update an appointment
- `DELETE /appointments/:id` - Delete an appointment

### Example Request

Create an appointment:

```bash
curl -X POST http://localhost:3001/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "date": "2024-01-15",
    "time": "10:00 AM",
    "service": "Gel Manicure",
    "notes": "First time visit"
  }'
```

## Database Schema

The `appointments` table includes:

- `id` - Auto-generated primary key
- `name` - Customer name
- `email` - Customer email
- `phone` - Customer phone number
- `date` - Appointment date
- `time` - Appointment time
- `service` - Selected service
- `notes` - Optional notes
- `status` - Appointment status (default: 'pending')
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Notes

- TypeORM is configured with `synchronize: true` for development, which automatically creates/updates database tables based on entities. Set this to `false` in production.
- CORS is enabled for `http://localhost:3000` and `http://localhost:3001` by default.
