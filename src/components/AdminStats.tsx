import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { doctorsAPI, appointmentsAPI } from '../lib/api';

export function AdminStats() {
  const [appointmentData, setAppointmentData] = useState<any[]>([]);
  const [specializationData, setSpecializationData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const [doctors, appointments] = await Promise.all([
        doctorsAPI.getAll(),
        appointmentsAPI.getAll()
      ]);

      // Appointments by Doctor
      const appointmentsByDoctor = doctors.map((doc: any) => {
        const docAppointments = appointments.filter((apt: any) => apt.doctor_id === doc.id);
        return {
          name: doc.name.split(' ').slice(-1)[0],
          appointments: docAppointments.length
        };
      }).slice(0, 5);

      setAppointmentData(appointmentsByDoctor);

      // Specialization Distribution
      const specializations: any = {};
      doctors.forEach((doc: any) => {
        specializations[doc.specialization] = (specializations[doc.specialization] || 0) + 1;
      });

      const specData = Object.entries(specializations).map(([name, value]) => ({
        name,
        value
      }));

      setSpecializationData(specData);

      // Appointment Status Distribution
      const statusCounts: any = {
        scheduled: 0,
        completed: 0,
        cancelled: 0
      };

      appointments.forEach((apt: any) => {
        statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1;
      });

      const statData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));

      setStatusData(statData);

      // Weekly Appointments Trend
      const today = new Date();
      const weekData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayAppointments = appointments.filter((apt: any) => apt.appointment_date === dateStr);

        weekData.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          appointments: dayAppointments.length
        });
      }

      setWeeklyData(weekData);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Doctor */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments by Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Specialization Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={specializationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {specializationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Appointments Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Appointments Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
