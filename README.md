<div align="center">
  <img src="public/media/Shalom.png" alt="Shalom Medical Center Logo" width="600"/>
</div>

# 🏥 Shalom Medical Center - Appointment Management System

A comprehensive healthcare management system built with React, TypeScript, and Node.js. This application streamlines appointment scheduling, patient management, and medical record keeping for healthcare facilities.

## ✨ Features

### For Patients
- 📅 **Online Appointment Booking** - Schedule appointments with available doctors
- 📋 **Medical History** - View and track personal medical records
- 💊 **Prescription Management** - Access and download prescriptions
- 👤 **Profile Management** - Update personal information and medical details
- 🔔 **Appointment Notifications** - Receive email confirmations and reminders

### For Doctors
- 📊 **Patient Dashboard** - View and manage patient appointments
- 🩺 **Patient History** - Access comprehensive patient medical records
- 💉 **Prescription Writing** - Create and send digital prescriptions
- ⏰ **Schedule Management** - Set availability and manage time slots
- 📈 **Analytics** - Track appointments and patient statistics

### For Administrators
- 👥 **User Management** - Manage doctors, patients, and staff accounts
- 📊 **System Analytics** - Monitor system usage and performance
- 🏥 **Department Management** - Organize doctors by specialization
- 📝 **Appointment Oversight** - View and manage all appointments
- 🔐 **Security Controls** - Manage access and permissions

### 🤖 AI Assistant (NEW!)
- 💬 **Intelligent Chat Interface** - Ask questions in natural language
- 🔍 **Database-Aware Responses** - Get real-time information from your system
- 👤 **Role-Based Context** - Personalized assistance for patients, doctors, and admins
- 🏠 **Local Processing** - All AI runs locally via LMStudio for complete privacy
- 📊 **Smart Insights** - Get analytics, statistics, and operational recommendations

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service integration
- **LMStudio SDK** - Local AI integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tinashe2023/Shalom-Medical-Center.git
   cd Shalom-Medical-Center
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd src/backend
   npm install
   ```

4. **Set up the database**
   - Create a PostgreSQL database
   - Run the SQL scripts to set up tables:
     ```bash
     psql -U your_username -d your_database -f hospital.sql
     ```

5. **Configure environment variables**
   
   Create a `.env` file in `src/backend/` with the following:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   PORT=5000
   ```

6. **Seed the database (optional)**
   ```bash
   cd src/backend
   npm run seed
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd src/backend
   npm start
   # or for development with auto-reload
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   # In the root directory
   npm run dev
   ```

3. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

### Setting Up AI Assistant (Optional)

To enable the AI assistant feature:

1. **Install LMStudio** from [https://lmstudio.ai](https://lmstudio.ai)
2. **Download the AI model**: `qwen/qwen3-4b-2507` (approximately 4GB)
3. **Start LMStudio server** on port 1234
4. **Restart your backend** - it will automatically connect to LMStudio

For detailed setup instructions, see [AI_SETUP.md](AI_SETUP.md)

> **Note**: The AI assistant requires at least 8GB RAM and runs completely locally for privacy.

## 📁 Project Structure

```
Shalom-Medical-Center/
├── src/
│   ├── components/          # React components
│   │   ├── Login.tsx
│   │   ├── PatientDashboard.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── ...
│   ├── backend/            # Node.js backend
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication middleware
│   │   ├── server.js       # Express server
│   │   ├── db.js          # Database configuration
│   │   └── email-service.js # Email functionality
│   ├── main.tsx           # Application entry point
│   └── custom.css         # Custom styles
├── public/                # Static assets
├── .gitignore            # Git ignore rules
├── package.json          # Frontend dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── README.md             # This file
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt encryption for user passwords
- **Email Verification** - Verify user accounts via email
- **Role-Based Access Control** - Different permissions for patients, doctors, and admins
- **Secure Password Reset** - Email-based password recovery

## 📧 Email Integration

The system uses Nodemailer to send:
- Account verification emails
- Appointment confirmations
- Prescription notifications
- Password reset links
- Appointment reminders

## 🧪 Testing

```bash
# Run tests (when available)
npm test
```

## 🏗️ Building for Production

```bash
# Build the frontend
npm run build

# The built files will be in the dist/ directory
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tinashe Hando**

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for healthcare efficiency
- Focused on user experience and accessibility

---

**Note**: This is a medical management system. Ensure compliance with healthcare regulations (HIPAA, GDPR, etc.) before deploying in a production environment.
