import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, UserCheck, Calendar, LogOut, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AdminStats } from './AdminStats';
import { DoctorList } from './DoctorList';
import { PatientList } from './PatientList';
import { AppointmentManager } from './AppointmentManager';
import { Header } from './Header';
import { Footer } from './Footer';
import { AIAssistant } from './AIAssistant';
import { generateDoctorData, generatePatientData } from '../lib/data-init';
import { toast } from 'sonner';
import { doctorsAPI, patientsAPI, appointmentsAPI } from '../lib/api';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const loadStats = async () => {
    try {
      const [doctors, patients, appointments] = await Promise.all([
        doctorsAPI.getAll(),
        patientsAPI.getAll(),
        appointmentsAPI.getAll()
      ]);

      setStats({
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleGenerateDoctor = async () => {
    try {
      const newDoctor = generateDoctorData();
      await doctorsAPI.create(newDoctor);
      setRefreshKey(prev => prev + 1);
      toast.success(`Generated: ${newDoctor.name}`);
    } catch (error) {
      console.error('Failed to generate doctor:', error);
      toast.error('Failed to generate doctor');
    }
  };

  const handleGeneratePatient = async () => {
    try {
      const newPatient = generatePatientData();
      await patientsAPI.create(newPatient);
      setRefreshKey(prev => prev + 1);
      toast.success(`Generated: ${newPatient.name}`);
    } catch (error) {
      console.error('Failed to generate patient:', error);
      toast.error('Failed to generate patient');
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
              <CardTitle>Total Doctors</CardTitle>
              <UserCheck className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.totalDoctors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Total Patients</CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.totalPatients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Total Appointments</CardTitle>
              <Calendar className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.totalAppointments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminStats key={refreshKey} />
          </TabsContent>

          <TabsContent value="doctors">
            <DoctorList key={refreshKey} onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="patients">
            <PatientList key={refreshKey} onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentManager key={refreshKey} onDataChange={handleDataChange} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* AI Assistant */}
      <AIAssistant
        welcomeMessage="Ask me about system analytics, user management, or operational insights!"
      />
    </div>
  );
}
