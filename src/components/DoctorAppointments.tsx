import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { appointmentsAPI, patientsAPI, medicalRecordsAPI } from '../lib/api';

interface DoctorAppointmentsProps {
  doctorId: string;
  onDataChange: () => void;
}

export function DoctorAppointments({ doctorId, onDataChange }: DoctorAppointmentsProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [treatmentData, setTreatmentData] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
    bloodPressure: '',
    heartRate: '',
    temperature: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allAppointments, allPatients] = await Promise.all([
        appointmentsAPI.getAll(),
        patientsAPI.getAll()
      ]);

      // Get doctor's appointments sorted by date
      const doctorAppointments = allAppointments
        .filter((apt: any) => apt.doctor_id === doctorId)
        .sort((a: any, b: any) => {
          const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
          const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
          return dateB.getTime() - dateA.getTime();
        });

      setAppointments(doctorAppointments);
      setPatients(allPatients);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load appointments');
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown';
  };

  const getPatient = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const handleAddTreatment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setTreatmentData({
      diagnosis: appointment.diagnosis || '',
      prescription: appointment.prescription || '',
      notes: appointment.notes || '',
      bloodPressure: '',
      heartRate: '',
      temperature: ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmitTreatment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update appointment with treatment details
      await appointmentsAPI.update(selectedAppointment.id, {
        status: 'completed',
        diagnosis: treatmentData.diagnosis,
        prescription: treatmentData.prescription,
        notes: treatmentData.notes
      });

      // Add to medical records
      const newRecord = {
        patientId: selectedAppointment.patient_id,
        doctorId: doctorId,
        appointmentId: selectedAppointment.id,
        date: selectedAppointment.appointment_date,
        diagnosis: treatmentData.diagnosis,
        prescription: treatmentData.prescription,
        notes: treatmentData.notes,
        bloodPressure: treatmentData.bloodPressure,
        heartRate: treatmentData.heartRate,
        temperature: treatmentData.temperature
      };

      await medicalRecordsAPI.create(newRecord);

      toast.success('Treatment details saved successfully');
      setIsDialogOpen(false);
      loadData();
      onDataChange();
    } catch (error) {
      console.error('Failed to save treatment:', error);
      toast.error('Failed to save treatment details');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      scheduled: 'default',
      completed: 'secondary',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const isUpcoming = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime >= new Date();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Patient</TableHead>
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
                  <TableCell>{getPatientName(appointment.patient_id)}</TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    {appointment.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTreatment(appointment)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Add Details
                      </Button>
                    )}
                    {appointment.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTreatment(appointment)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Treatment Details</DialogTitle>
            <DialogDescription>
              Patient: {selectedAppointment && getPatientName(selectedAppointment.patient_id)}
              <br />
              Date: {selectedAppointment?.appointment_date} at {selectedAppointment?.appointment_time}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTreatment}>
            <div className="space-y-4 py-4">
              {/* Patient Info */}
              {selectedAppointment && getPatient(selectedAppointment.patient_id) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="mb-2">Patient Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Blood Group:</span>{' '}
                      {getPatient(selectedAppointment.patient_id)?.blood_group || 'N/A'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">DOB:</span>{' '}
                      {getPatient(selectedAppointment.patient_id)?.date_of_birth || 'N/A'}
                    </div>
                  </div>
                </div>
              )}

              {/* Vitals */}
              <div>
                <h4 className="mb-2">Vitals</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodPressure">Blood Pressure</Label>
                    <Input
                      id="bloodPressure"
                      placeholder="120/80"
                      value={treatmentData.bloodPressure}
                      onChange={(e) => setTreatmentData({ ...treatmentData, bloodPressure: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heartRate">Heart Rate</Label>
                    <Input
                      id="heartRate"
                      placeholder="72"
                      value={treatmentData.heartRate}
                      onChange={(e) => setTreatmentData({ ...treatmentData, heartRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <Input
                      id="temperature"
                      placeholder="98.6"
                      value={treatmentData.temperature}
                      onChange={(e) => setTreatmentData({ ...treatmentData, temperature: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis..."
                  value={treatmentData.diagnosis}
                  onChange={(e) => setTreatmentData({ ...treatmentData, diagnosis: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prescription">Prescription *</Label>
                <Textarea
                  id="prescription"
                  placeholder="Enter prescription details..."
                  value={treatmentData.prescription}
                  onChange={(e) => setTreatmentData({ ...treatmentData, prescription: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={treatmentData.notes}
                  onChange={(e) => setTreatmentData({ ...treatmentData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              {selectedAppointment?.status !== 'completed' && (
                <Button type="submit">Save & Mark Complete</Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
