# Alumni Job Portal

A full-stack web application for SGSITS alumni and students to connect for job opportunities.

## Features

- **Student Dashboard**: Browse jobs, apply, manage profile
- **Alumni Dashboard**: Post jobs, manage companies
- **Admin Dashboard**: Manage users, jobs, analytics
- **Authentication**: JWT-based login with role-based access
- **Job Portal**: Post internships/jobs, apply with resume
- **Profile Management**: Complete profiles for better matches

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL, Knex.js, JWT, bcrypt
- **Frontend**: React, Vite, Shadcn/UI, React Query
- **Database**: PostgreSQL

## Local Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL (running on localhost:5432)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/alumni-job-portal.git
cd alumni-job-portal
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials (DB_USER, DB_PASSWORD)
npm run migrate
npm run seed
npm start
```
Backend runs on `http://localhost:5004`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# VITE_API_URL is already set to http://localhost:5004/api
npm run dev
```
Frontend runs on `http://localhost:5173`

### 4. Database Setup
- Ensure PostgreSQL is running
- Create database: `alumniPortal`
- Migrations and seeds are run via npm scripts

## Available Scripts

### Backend
- `npm start`: Start server
- `npx knex migrate:latest`: Run migrations
- `npx knex seed:run`: Seed database

### Frontend
- `npm run dev`: Start dev server
- `npm run build`: Build for production

## Test Users

After seeding, use these accounts:

- **Admin**: `admin@sgsits.ac.in` / `admin123`
- **Student**: `student@sgsits.ac.in` / `password123`
- **Alumni**: `alumni@company.com` / `password123`

## API Documentation

Base URL: `http://localhost:5004/api`

### Auth Endpoints
- `POST /auth/login` - Login
- `POST /auth/register-student` - Register student
- `POST /auth/register-alumni` - Register alumni

### Student Endpoints
- `GET /student/profile` - Get profile
- `PUT /student/profile` - Update profile

### Job Endpoints
- `GET /job/get-all-jobs-student` - Get jobs
- `POST /job/apply` - Apply to job

## Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push and create PR

## License

