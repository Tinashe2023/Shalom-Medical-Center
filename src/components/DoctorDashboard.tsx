import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Clock, Users, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DoctorAppointments } from './DoctorAppointments';
import { DoctorSchedule } from './DoctorSchedule';
import { DoctorPatientHistory } from './DoctorPatientHistory';
import { Header } from './Header';
import { Footer } from './Footer';
import { AIAssistant } from './AIAssistant';
import { appointmentsAPI } from '../lib/api';

interface DoctorDashboardProps {
  user: any;
  onLogout: () => void;
}

export function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const loadStats = async () => {
    try {
      const appointments = await appointmentsAPI.getAll();
      const doctorAppointments = appointments.filter(
        (apt: any) => apt.doctor_id === user.id && apt.status === 'scheduled'
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0]; // "2025-12-01"

      const todayAppointments = doctorAppointments.filter((apt: any) => {
        // Extract date from appointment_date (handles ISO timestamp format)
        const aptDateStr = apt.appointment_date.split('T')[0];
        return aptDateStr === todayStr;
      });

      const upcomingAppointments = doctorAppointments.filter((apt: any) => {
        // Extract date from appointment_date
        const aptDateStr = apt.appointment_date.split('T')[0];
        return aptDateStr >= todayStr;
      });

      // Count unique patients
      const uniquePatients = new Set(doctorAppointments.map((apt: any) => apt.patient_id));

      setStats({
        upcomingAppointments: upcomingAppointments.length,
        todayAppointments: todayAppointments.length,
        totalPatients: uniquePatients.size
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
              <CardTitle>Today's Appointments</CardTitle>
              <Clock className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.todayAppointments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Calendar className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.upcomingAppointments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Total Patients</CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.totalPatients}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="schedule">My Schedule</TabsTrigger>
            <TabsTrigger value="patients">Patient History</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <DoctorAppointments
              key={refreshKey}
              doctorId={user.id}
              onDataChange={handleDataChange}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <DoctorSchedule
              key={refreshKey}
              doctorId={user.id}
              onDataChange={handleDataChange}
            />
          </TabsContent>

          <TabsContent value="patients">
            <DoctorPatientHistory doctorId={user.id} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* AI Assistant */}
      <AIAssistant
        welcomeMessage="Ask me about your schedule, patient information, or appointment statistics!"
      />
    </div>
  );
}
