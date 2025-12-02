import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, FileText, User, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PatientAppointments } from './PatientAppointments';
import { PatientBooking } from './PatientBooking';
import { PatientMedicalHistory } from './PatientMedicalHistory';
import { PatientProfile } from './PatientProfile';
import { Header } from './Header';
import { Footer } from './Footer';
import { AIAssistant } from './AIAssistant';
import { appointmentsAPI, medicalRecordsAPI } from '../lib/api';

interface PatientDashboardProps {
  user: any;
  onLogout: () => void;
}

export function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    medicalRecords: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const loadStats = async () => {
    try {
      const [appointments, records] = await Promise.all([
        appointmentsAPI.getAll(),
        medicalRecordsAPI.getAll()
      ]);

      const patientAppointments = appointments.filter((apt: any) => apt.patient_id === user.id);

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

      const upcoming = patientAppointments.filter((apt: any) => {
        if (apt.status !== 'scheduled') return false;

        // Extract date from appointment_date (handles both "YYYY-MM-DD" and ISO timestamp formats)
        const aptDate = new Date(apt.appointment_date);
        aptDate.setHours(0, 0, 0, 0); // Reset to start of day

        return aptDate >= today;
      });

      const completed = patientAppointments.filter((apt: any) => apt.status === 'completed');

      const patientRecords = records.filter((rec: any) => rec.patient_id === user.id);

      setStats({
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        medicalRecords: patientRecords.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBanner currentUser={user} onLogout={onLogout} />

      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.upcomingAppointments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Completed Visits</CardTitle>
              <FileText className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.completedAppointments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Medical Records</CardTitle>
              <FileText className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.medicalRecords}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="book" className="space-y-6">
          <TabsList>
            <TabsTrigger value="book">Book Appointment</TabsTrigger>
            <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <PatientBooking
              key={refreshKey}
              patientId={user.id}
              onDataChange={handleDataChange}
            />
          </TabsContent>

          <TabsContent value="appointments">
            <PatientAppointments
              key={refreshKey}
              patientId={user.id}
              onDataChange={handleDataChange}
            />
          </TabsContent>

          <TabsContent value="history">
            <PatientMedicalHistory patientId={user.id} />
          </TabsContent>

          <TabsContent value="profile">
            <PatientProfile
              key={refreshKey}
              patient={user}
              onDataChange={handleDataChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* AI Assistant */}
      <AIAssistant
        welcomeMessage="Ask me about your appointments, medical history, or how to book a doctor!"
      />
    </div>
  );
}
