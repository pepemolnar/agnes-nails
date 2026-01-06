# Agnes Nails - Appointment Booking System

A full-stack appointment booking application for a nail salon, built with Next.js, NestJS, and PostgreSQL.

## Project Structure

```
agnes-nails/
├── frontend/              # Next.js frontend (TypeScript)
├── backend/               # NestJS backend API (TypeScript)
├── docker-compose.yml     # Production Docker configuration
├── docker-compose.dev.yml # Development Docker configuration
├── DOCKER.md             # Docker setup guide
└── README.md             # This file
```

## Technology Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **React 19** - UI library

### Backend
- **NestJS** - Node.js framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **Class Validator** - Request validation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Features

- Book appointments with service selection
- Date and time slot selection
- Customer information collection
- Email notifications (ready for integration)
- Appointment management (CRUD operations)
- Responsive design
- Form validation
- RESTful API

## Getting Started

You can run this application in two ways:

### Option 1: Using Docker (Recommended)

Run all services with a single command. See [DOCKER.md](./DOCKER.md) for detailed instructions.

```bash
# Production mode
docker-compose up -d

# Development mode with hot reload
docker-compose -f docker-compose.dev.yml up -d
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Create PostgreSQL database:
```bash
createdb agnes_nails
```

5. Start the backend:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

See [backend/SETUP.md](./backend/SETUP.md) for detailed instructions.

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Appointments

- `POST /appointments` - Create a new appointment
- `GET /appointments` - Get all appointments
- `GET /appointments/:id` - Get a specific appointment
- `PATCH /appointments/:id` - Update an appointment
- `DELETE /appointments/:id` - Delete an appointment

### Example Request

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

### Appointments Table

| Column    | Type      | Description                          |
|-----------|-----------|--------------------------------------|
| id        | integer   | Primary key (auto-generated)         |
| name      | string    | Customer name                        |
| email     | string    | Customer email                       |
| phone     | string    | Customer phone number                |
| date      | date      | Appointment date                     |
| time      | string    | Appointment time                     |
| service   | string    | Selected service                     |
| notes     | text      | Optional notes                       |
| status    | string    | Appointment status (default: pending)|
| createdAt | timestamp | Created timestamp                    |
| updatedAt | timestamp | Updated timestamp                    |

## Available Services

- Classic Manicure
- Gel Manicure
- Classic Pedicure
- Gel Pedicure
- Acrylic Nails
- Nail Art Design
- Spa Manicure
- Spa Pedicure

## Development

### Running Tests

Backend:
```bash
cd backend
npm run test
```

Frontend:
```bash
cd frontend
npm run test
```

### Linting

Backend:
```bash
cd backend
npm run lint
```

Frontend:
```bash
cd frontend
npm run lint
```

### Building for Production

Backend:
```bash
cd backend
npm run build
```

Frontend:
```bash
cd frontend
npm run build
```

## Environment Variables

### Backend (.env)

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=agnes_nails
PORT=3001
```

### Frontend

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Project Documentation

- [Docker Setup Guide](./DOCKER.md) - Complete Docker configuration guide
- [Backend Setup Guide](./backend/SETUP.md) - Backend-specific setup instructions

## Future Enhancements

- [ ] Email notifications for appointments
- [ ] SMS notifications
- [ ] Admin dashboard for managing appointments
- [ ] Calendar view for appointments
- [ ] Payment integration
- [ ] User authentication
- [ ] Appointment reminders
- [ ] Multi-location support
- [ ] Staff management
- [ ] Service duration and pricing

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
