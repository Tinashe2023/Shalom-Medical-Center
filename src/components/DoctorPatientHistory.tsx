import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Search, Eye } from 'lucide-react';
import { appointmentsAPI, patientsAPI, medicalRecordsAPI } from '../lib/api';

interface DoctorPatientHistoryProps {
  doctorId: string;
}

export function DoctorPatientHistory({ doctorId }: DoctorPatientHistoryProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      const [appointments, allPatients, records] = await Promise.all([
        appointmentsAPI.getAll(),
        patientsAPI.getAll(),
        medicalRecordsAPI.getAll()
      ]);

      // Get unique patients who had appointments with this doctor
      const doctorAppointments = appointments.filter((apt: any) => apt.doctor_id === doctorId);
      const patientIds = [...new Set(doctorAppointments.map((apt: any) => apt.patient_id))];

      const patientsWithHistory = patientIds.map(patientId => {
        const patient = allPatients.find((u: any) => u.id === patientId);
        const patientAppointments = doctorAppointments.filter((apt: any) => apt.patient_id === patientId);
        const patientRecords = records.filter((rec: any) => rec.patient_id === patientId && rec.doctor_id === doctorId);

        return {
          ...patient,
          totalVisits: patientAppointments.filter((apt: any) => apt.status === 'completed').length,
          lastVisit: patientAppointments
            .filter((apt: any) => apt.status === 'completed')
            .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0]?.appointment_date || 'N/A',
          appointments: patientAppointments,
          records: patientRecords
        };
      }).filter(p => p);

      setPatients(patientsWithHistory);
      setFilteredPatients(patientsWithHistory);
    } catch (error) {
      console.error('Failed to load patient history:', error);
    }
  };

  const handleViewHistory = (patient: any) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Patient History</CardTitle>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
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
                <TableHead>Patient Name</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Total Visits</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.blood_group || '-'}</TableCell>
                  <TableCell>{patient.totalVisits}</TableCell>
                  <TableCell>{patient.lastVisit !== 'N/A' ? new Date(patient.lastVisit).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewHistory(patient)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Medical History</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6 py-4">
              {/* Patient Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="mb-3">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span> {selectedPatient.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span> {selectedPatient.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span> {selectedPatient.phone || '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blood Group:</span> {selectedPatient.blood_group || '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date of Birth:</span> {selectedPatient.date_of_birth || '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Visits:</span> {selectedPatient.totalVisits}
                  </div>
                </div>
              </div>

              {/* Medical Records */}
              <div>
                <h4 className="mb-3">Medical Records</h4>
                {selectedPatient.records && selectedPatient.records.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPatient.records
                      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record: any) => (
                        <div key={record.id} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Date: {record.date}</span>
                          </div>
                          {record.vitals && (
                            <div className="mb-3 text-sm">
                              <span className="text-muted-foreground">Vitals:</span>{' '}
                              {record.vitals.bloodPressure && `BP: ${record.vitals.bloodPressure} | `}
                              {record.vitals.heartRate && `HR: ${record.vitals.heartRate} bpm | `}
                              {record.vitals.temperature && `Temp: ${record.vitals.temperature}°F`}
                            </div>
                          )}
                          <div className="space-y-2">
                            <div>
                              <strong>Diagnosis:</strong>
                              <p>{record.diagnosis}</p>
                            </div>
                            <div>
                              <strong>Prescription:</strong>
                              <p>{record.prescription}</p>
                            </div>
                            {record.notes && (
                              <div>
                                <strong>Notes:</strong>
                                <p>{record.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No medical records found.</p>
                )}
              </div>

              {/* Appointment History */}
              <div>
                <h4 className="mb-3">Appointment History</h4>
                {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPatient.appointments
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((apt: any) => (
                          <TableRow key={apt.id}>
                            <TableCell>{apt.date}</TableCell>
                            <TableCell>{apt.time}</TableCell>
                            <TableCell>{apt.reason}</TableCell>
                            <TableCell>{apt.status}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No appointments found.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
