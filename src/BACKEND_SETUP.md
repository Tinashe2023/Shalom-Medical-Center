# Hospital Management System - Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

---

## Step 1: Database Setup

### 1.1 Create the Database

```bash
# Connect to PostgreSQL
psql -U Tinashe

# Create database
CREATE DATABASE hospital_management;

# Connect to the database
\c hospital_management

# Exit psql
\q
```

### 1.2 Run the Schema

Run all the SQL queries from `DATABASE_SCHEMA.md` to create tables and triggers.

```bash
# From the project root
psql -U Tinashe -d hospital_management -f schema.sql
```

Or manually copy and paste the queries from `DATABASE_SCHEMA.md` into psql.

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `pg` - PostgreSQL client
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Enable CORS
- `dotenv` - Environment variables
- `nodemon` - Development server (dev dependency)

### 2.3 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp ../.env.example .env
```

The `.env` file should contain:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_management
DB_USER=Tinashe
DB_PASSWORD=Kairostribe2025
JWT_SECRET=097b2fbb5945a9b2ee2ad5be0102c84c0d8c418792c58fb31511a6656672e2f22355989d6666b2597ada638f04f0e8221011d49347d6459f412e7f53db2b5892
NODE_ENV=development
```

### 2.4 Seed the Database (Optional)

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- 1 Admin user
- 5 Doctors with schedules
- 3 Patients
- 3 Sample appointments
- 2 Medical records

---

## Step 3: Start the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:8080`

---

## Step 4: Test the API

### Health Check

```bash
curl http://localhost:8080/api/health
```

### Login (Get JWT Token)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-1",
    "email": "admin@hospital.com",
    "role": "admin",
    "name": "System Admin"
  }
}
```

### Use the Token for Authenticated Requests

```bash
# Get all doctors
curl http://localhost:8080/api/doctors \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new patient

### Users
- `GET /api/users/me` - Get current user info
- `GET /api/users` - Get all users (Admin only)

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/:id/availability` - Get doctor's schedule
- `POST /api/doctors` - Create doctor (Admin only)
- `PUT /api/doctors/:id` - Update doctor (Admin only)
- `PUT /api/doctors/:id/availability` - Update doctor schedule
- `DELETE /api/doctors/:id` - Delete doctor (Admin only)

### Patients
- `GET /api/patients` - Get all patients (Admin/Doctor)
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (Admin only)

### Appointments
- `GET /api/appointments` - Get appointments (filtered by role)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment (Admin only)

### Medical Records
- `GET /api/medical-records` - Get medical records (filtered by role)
- `GET /api/medical-records/:id` - Get record by ID
- `POST /api/medical-records` - Create record (Doctor/Admin)
- `PUT /api/medical-records/:id` - Update record (Doctor/Admin)
- `DELETE /api/medical-records/:id` - Delete record (Admin only)

### Statistics
- `GET /api/stats/admin` - Get admin dashboard stats
- `GET /api/stats/doctor/:doctorId` - Get doctor stats
- `GET /api/stats/patient/:patientId` - Get patient stats

---

## Default Test Credentials

After running the seed script:

**Admin:**
- Email: `admin@hospital.com`
- Password: `admin123`

**Doctor:**
- Email: `dr.smith@hospital.com`
- Password: `doctor123`

**Patient:**
- Email: `john.doe@email.com`
- Password: `patient123`

---

## Project Structure

```
backend/
├── db.js                     # Database connection
├── server.js                 # Express server setup
├── seed.js                   # Database seeding script
├── package.json              # Dependencies
├── .env                      # Environment variables
├── middleware/
│   └── auth.js              # JWT authentication middleware
└── routes/
    ├── auth.js              # Authentication routes
    ├── users.js             # User routes
    ├── doctors.js           # Doctor routes
    ├── patients.js          # Patient routes
    ├── appointments.js      # Appointment routes
    ├── medical-records.js   # Medical record routes
    └── stats.js             # Statistics routes
```

---

## Troubleshooting

### Database Connection Error

If you get "connection refused":
1. Make sure PostgreSQL is running: `sudo service postgresql status`
2. Check credentials in `.env`
3. Verify database exists: `psql -U Tinashe -l`

### Port Already in Use

If port 8080 is taken, change `PORT` in `.env`:
```env
PORT=3001
```

### JWT Token Errors

Make sure you're including the token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### CORS Issues

The backend allows all origins in development. For production, modify `server.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

---

## Production Deployment

### Security Enhancements

1. **Hash Passwords**: Update `routes/auth.js` to use bcrypt:
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

2. **Use HTTPS**: Always use HTTPS in production

3. **Environment Variables**: Never commit `.env` files

4. **Rate Limiting**: Add rate limiting to prevent abuse

5. **Input Validation**: Add validation middleware (e.g., express-validator)

### Database Migration

For production, use a migration tool like `node-pg-migrate` or `knex.js`.

---

## Support

For issues or questions, check:
1. Server logs in console
2. PostgreSQL logs: `/var/log/postgresql/`
3. Network tab in browser dev tools

---

## Next Steps

1. Update the frontend to use these API endpoints instead of localStorage
2. Add password hashing with bcrypt
3. Implement email/SMS notifications
4. Add file upload for medical documents
5. Implement audit logging
