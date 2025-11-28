# Hospital Management System

A comprehensive healthcare management application with role-based access for Admins, Doctors, and Patients. Built with React, Node.js, Express, and PostgreSQL.

## Features

### Admin Features
- Dashboard with statistics and charts
- Manage doctors (add, edit, delete, auto-generate)
- Manage patients (view, edit, delete, auto-generate)
- Manage all appointments
- Search and filter capabilities
- View analytics and reports

### Doctor Features
- View upcoming and today's appointments
- Add treatment details (diagnosis, prescription, notes, vitals)
- Manage weekly availability schedule
- View patient medical history
- Access patient information during appointments

### Patient Features
- Register and login
- Browse and search doctors by name/specialization
- Book appointments (with real-time slot availability)
- Cancel upcoming appointments
- View appointment history
- Access medical records and prescriptions
- Update profile information

### Additional Features
- Double-booking prevention
- JWT-based authentication
- Role-based authorization
- Responsive design
- Real-time data updates
- Secure password storage (ready for bcrypt)

---

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS
- Shadcn/ui components
- Recharts for data visualization
- Lucide React for icons

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT for authentication
- CORS enabled

---

## Quick Start

### Prerequisites
- Node.js v14+
- PostgreSQL v12+
- npm or yarn

### 1. Database Setup

```bash
# Connect to PostgreSQL
psql -U Tinashe

# Create and setup database
CREATE DATABASE hospital_management;
\c hospital_management
\q

# Run schema
psql -U Tinashe -d hospital_management -f schema.sql
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp ../.env.example .env
# Edit .env with your database credentials

# Seed database with sample data
npm run seed

# Start server
npm run dev
```

Backend will run on http://localhost:8080

### 3. Frontend Setup

```bash
# From project root (frontend already setup)
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:5173 (or similar)

---

## Default Login Credentials

After seeding the database:

**Admin Account:**
- Email: `admin@hospital.com`
- Password: `admin123`

**Doctor Account:**
- Email: `dr.smith@hospital.com`
- Password: `doctor123`

**Patient Account:**
- Email: `john.doe@email.com`
- Password: `patient123`

---

## Project Structure

```
hospital-management/
├── backend/                    # Node.js backend
│   ├── routes/                # API routes
│   │   ├── auth.js           # Authentication
│   │   ├── doctors.js        # Doctor management
│   │   ├── patients.js       # Patient management
│   │   ├── appointments.js   # Appointment management
│   │   ├── medical-records.js # Medical records
│   │   └── stats.js          # Statistics
│   ├── middleware/           # Custom middleware
│   │   └── auth.js          # JWT authentication
│   ├── db.js                # Database connection
│   ├── server.js            # Express server
│   ├── seed.js              # Database seeder
│   └── package.json         # Backend dependencies
├── src/                       # React frontend
│   ├── components/           # React components
│   │   ├── Login.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── PatientDashboard.tsx
│   │   └── ...
│   ├── lib/                 # Utilities
│   └── App.tsx             # Main app component
├── schema.sql               # Database schema
├── DATABASE_SCHEMA.md       # Schema documentation
├── BACKEND_SETUP.md         # Backend setup guide
└── README.md               # This file
```

---

## API Documentation

### Authentication Endpoints

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Register (Patient)**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "555-1234",
  "dateOfBirth": "1990-01-01",
  "bloodGroup": "A+",
  "address": "123 Main St"
}
```

### Protected Endpoints

All other endpoints require JWT token in header:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

See `BACKEND_SETUP.md` for complete API documentation.

---

## Database Schema

### Tables
- `users` - All user accounts (admin, doctor, patient)
- `doctors` - Doctor-specific information
- `patients` - Patient-specific information
- `doctor_availability` - Doctor weekly schedules
- `time_slots` - Available time slots for each day
- `appointments` - All appointments
- `medical_records` - Patient medical history

See `DATABASE_SCHEMA.md` for detailed schema and queries.

---

## Environment Variables

Create `.env` file in backend directory:

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

⚠️ **Never commit .env files to version control!**

---

## Development

### Running Backend in Development Mode

```bash
cd backend
npm run dev
```

Uses nodemon for auto-reload on file changes.

### Running Frontend in Development Mode

```bash
npm run dev
```

### Database Management

**Reset Database:**
```bash
psql -U Tinashe -d hospital_management -f schema.sql
cd backend && npm run seed
```

**View Tables:**
```bash
psql -U Tinashe -d hospital_management
\dt
SELECT * FROM users;
```

---

## Production Deployment

### Security Checklist

1. ✅ Change all default passwords
2. ✅ Use strong JWT_SECRET
3. ✅ Enable password hashing (bcrypt)
4. ✅ Use HTTPS only
5. ✅ Set NODE_ENV=production
6. ✅ Enable CORS for specific domains only
7. ✅ Add rate limiting
8. ✅ Implement input validation
9. ✅ Enable database backups
10. ✅ Use environment variables for all secrets

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
npm run build
# Serve the dist folder with a web server
```

---

## Troubleshooting

### Common Issues

**Database Connection Error**
- Check PostgreSQL is running: `sudo service postgresql status`
- Verify credentials in `.env`
- Ensure database exists: `psql -U Tinashe -l`

**Port Already in Use**
- Change PORT in `.env` file
- Kill existing process: `lsof -ti:8080 | xargs kill -9`

**CORS Errors**
- Backend CORS is configured for all origins in development
- For production, update `server.js` with specific frontend URL

**JWT Token Errors**
- Ensure token is included in Authorization header
- Token format: `Bearer YOUR_TOKEN_HERE`
- Check token hasn't expired (24h validity)

---

## Future Enhancements

- [ ] Email/SMS appointment reminders
- [ ] File upload for medical documents
- [ ] Video consultation integration
- [ ] Prescription printing
- [ ] Payment processing
- [ ] Insurance integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Audit logging
- [ ] Multi-language support

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

This project is for educational purposes.

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review `BACKEND_SETUP.md`
3. Check server logs
4. Review PostgreSQL logs

---

## Credits

Built with:
- React
- Node.js / Express
- PostgreSQL
- Shadcn/ui
- Tailwind CSS
- Recharts

---

## Security Notice

⚠️ **Important:** This application is designed for educational purposes. For production use with real patient data:

1. Implement proper password hashing
2. Add comprehensive input validation
3. Enable audit logging
4. Comply with HIPAA/GDPR regulations
5. Conduct security audits
6. Implement rate limiting
7. Use secure session management
8. Enable database encryption
9. Implement proper backup strategies
10. Add monitoring and alerting

**Never store real patient data without proper security measures!**
