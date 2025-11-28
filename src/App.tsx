import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { PatientRegistration } from './components/PatientRegistration';
import { EmailVerification } from './components/EmailVerification';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { AdminDashboard } from './components/AdminDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { PatientDashboard } from './components/PatientDashboard';
import { LandingPage } from './components/LandingPage';
import { Toaster } from './components/ui/sonner';
import { getAuthToken, removeAuthToken } from './lib/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for auth token and restore user session
    const token = getAuthToken();
    const savedUser = localStorage.getItem('current_user');

    if (token && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to restore user session:', error);
        removeAuthToken();
      }
    }

    setLoading(false);
  }, []);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    removeAuthToken();
  };

  const handleRegistrationSuccess = (user: any) => {
    setShowRegistration(false);
    setShowLogin(false);
    // Don't auto-login after registration - user needs to verify email
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Toaster />
        <Routes>
          {/* Public routes */}
          <Route
            path="/verify-email"
            element={<EmailVerification />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* Auth routes */}
          {!currentUser ? (
            <>
              <Route
                path="/"
                element={
                  showRegistration ? (
                    <PatientRegistration
                      onSuccess={handleRegistrationSuccess}
                      onBackToLogin={() => setShowRegistration(false)}
                      onBackToHome={() => {
                        setShowRegistration(false);
                        setShowLogin(false);
                      }}
                    />
                  ) : showLogin ? (
                    <Login
                      onLogin={handleLogin}
                      onRegister={() => {
                        setShowLogin(false);
                        setShowRegistration(true);
                      }}
                      onBackToHome={() => setShowLogin(false)}
                    />
                  ) : (
                    <LandingPage
                      onLogin={() => setShowLogin(true)}
                      onRegister={() => setShowRegistration(true)}
                    />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              {/* Dashboard routes based on role */}
              <Route
                path="/"
                element={
                  currentUser.role === 'admin' ? (
                    <AdminDashboard user={currentUser} onLogout={handleLogout} />
                  ) : currentUser.role === 'doctor' ? (
                    <DoctorDashboard user={currentUser} onLogout={handleLogout} />
                  ) : (
                    <PatientDashboard user={currentUser} onLogout={handleLogout} />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}