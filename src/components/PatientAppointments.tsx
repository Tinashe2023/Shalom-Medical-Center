import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { appointmentsAPI, doctorsAPI } from '../lib/api';

interface PatientAppointmentsProps {
  patientId: string;
  onDataChange: () => void;
}

export function PatientAppointments({ patientId, onDataChange }: PatientAppointmentsProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allAppointments, allDoctors] = await Promise.all([
        appointmentsAPI.getAll(),
        doctorsAPI.getAll()
      ]);

      const patientAppointments = allAppointments
        .filter((apt: any) => apt.patient_id === patientId)
        .sort((a: any, b: any) => {
          const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
          const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
          return dateB.getTime() - dateA.getTime();
        });

      setAppointments(patientAppointments);
      setDoctors(allDoctors);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load appointments');
    }
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown';
  };

  const getDoctorSpecialization = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.specialization : '';
  };

  const handleCancelClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;

    try {
      await appointmentsAPI.update(selectedAppointment.id, { status: 'cancelled' });
      toast.success('Appointment cancelled successfully');
      setCancelDialogOpen(false);
      loadData();
      onDataChange();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusBadge = (status: string, queuePosition?: number, autoAssigned?: boolean) => {
    const variants: any = {
      scheduled: { variant: 'default', className: 'bg-blue-600', label: 'Scheduled' },
      pending: { variant: 'default', className: 'bg-yellow-600', label: 'Pending' },
      queued: { variant: 'default', className: 'bg-amber-600', label: `Queued ${queuePosition ? `(#${queuePosition})` : ''}` },
      completed: { variant: 'default', className: 'bg-green-600', label: 'Completed' },
      cancelled: { variant: 'destructive', className: '', label: 'Cancelled' },
    };

    const config = variants[status] || variants.scheduled;

    return (
      <div className="flex flex-col gap-1">
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
        {autoAssigned && (
          <Badge variant="outline" className="text-xs bg-purple-50 border-purple-300">
            ✨ Auto-assigned
          </Badge>
        )}
      </div>
    );
  };

  const canCancel = (appointment: any) => {
    if (appointment.status !== 'scheduled') return false;
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    return appointmentDate > new Date();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No appointments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.appointment_date}</TableCell>
                    <TableCell>{appointment.appointment_time}</TableCell>
                    <TableCell>{getDoctorName(appointment.doctor_id)}</TableCell>
                    <TableCell>{getDoctorSpecialization(appointment.doctor_id)}</TableCell>
                    <TableCell>{appointment.reason}</TableCell>
                    <TableCell>{getStatusBadge(
                      appointment.status,
                      appointment.queue_position,
                      appointment.auto_assigned
                    )}</TableCell>
                    <TableCell>
                      {canCancel(appointment) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelClick(appointment)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm}>
              Yes, cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
