import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { appointmentsAPI, doctorsAPI, patientsAPI } from '../lib/api';

interface AppointmentManagerProps {
  onDataChange: () => void;
}

export function AppointmentManager({ onDataChange }: AppointmentManagerProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    status: 'scheduled'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = appointments.filter(apt => {
      const patient = patients.find(p => p.id === apt.patient_id);
      const doctor = doctors.find(d => d.id === apt.doctor_id);
      const searchLower = searchTerm.toLowerCase();

      return (
        patient?.name.toLowerCase().includes(searchLower) ||
        doctor?.name.toLowerCase().includes(searchLower) ||
        apt.appointment_date?.includes(searchTerm) ||
        apt.status.toLowerCase().includes(searchLower)
      );
    });
    setFilteredAppointments(filtered);
  }, [searchTerm, appointments, patients, doctors]);

  const loadData = async () => {
    try {
      const [allDoctors, allPatients, allAppointments] = await Promise.all([
        doctorsAPI.getAll(),
        patientsAPI.getAll(),
        appointmentsAPI.getAll()
      ]);

      setDoctors(allDoctors);
      setPatients(allPatients);
      setAppointments(allAppointments);
      setFilteredAppointments(allAppointments);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load appointments');
    }
  };

  const handleAdd = () => {
    setEditingAppointment(null);
    setFormData({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      reason: '',
      status: 'scheduled'
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id,
      date: appointment.appointment_date,
      time: appointment.appointment_time,
      reason: appointment.reason,
      status: appointment.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await appointmentsAPI.delete(appointmentId);
      loadData();
      onDataChange();
      toast.success('Appointment deleted successfully');
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAppointment) {
        // Edit existing appointment
        await appointmentsAPI.update(editingAppointment.id, {
          date: formData.date,
          time: formData.time,
          reason: formData.reason,
          status: formData.status
        });
        toast.success('Appointment updated successfully');
      } else {
        // Add new appointment
        await appointmentsAPI.create(formData);
        toast.success('Appointment created successfully');
      }

      setIsDialogOpen(false);
      loadData();
      onDataChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save appointment');
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      scheduled: 'default',
      completed: 'secondary',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Appointments Management</CardTitle>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Appointment
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient, doctor, date, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{getPatientName(appointment.patient_id)}</TableCell>
                <TableCell>{getDoctorName(appointment.doctor_id)}</TableCell>
                <TableCell>{appointment.appointment_date}</TableCell>
                <TableCell>{appointment.appointment_time}</TableCell>
                <TableCell>{appointment.reason}</TableCell>
                <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(appointment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(appointment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}</DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Update appointment details' : 'Create a new appointment'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value: string) => setFormData({ ...formData, patientId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor</Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(value: string) => setFormData({ ...formData, doctorId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Reason for visit"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAppointment ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
