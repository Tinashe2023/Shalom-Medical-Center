import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText } from 'lucide-react';
import { medicalRecordsAPI, doctorsAPI } from '../lib/api';

interface PatientMedicalHistoryProps {
  patientId: string;
}

export function PatientMedicalHistory({ patientId }: PatientMedicalHistoryProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allRecords, allDoctors] = await Promise.all([
        medicalRecordsAPI.getAll(),
        doctorsAPI.getAll()
      ]);

      const patientRecords = allRecords
        .filter((rec: any) => rec.patient_id === patientId)
        .sort((a: any, b: any) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime());

      setRecords(patientRecords);
      setDoctors(allDoctors);
    } catch (error) {
      console.error('Failed to load medical records:', error);
    }
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const getDoctorSpecialization = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.specialization : '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical History & Records</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No medical records found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your medical records will appear here after doctor visits
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((record) => (
              <div key={record.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="mb-1">{getDoctorName(record.doctor_id)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getDoctorSpecialization(record.doctor_id)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{record.record_date}</p>
                  </div>
                </div>

                {(record.blood_pressure || record.heart_rate || record.temperature) && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h5 className="mb-2">Vitals</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {record.blood_pressure && (
                        <div>
                          <span className="text-muted-foreground">Blood Pressure:</span>
                          <p>{record.blood_pressure}</p>
                        </div>
                      )}
                      {record.heart_rate && (
                        <div>
                          <span className="text-muted-foreground">Heart Rate:</span>
                          <p>{record.heart_rate} bpm</p>
                        </div>
                      )}
                      {record.temperature && (
                        <div>
                          <span className="text-muted-foreground">Temperature:</span>
                          <p>{record.temperature}°F</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h5 className="mb-2">Diagnosis</h5>
                    <p className="text-muted-foreground">{record.diagnosis}</p>
                  </div>

                  <div>
                    <h5 className="mb-2">Prescription</h5>
                    <p className="text-muted-foreground">{record.prescription}</p>
                  </div>

                  {record.notes && (
                    <div>
                      <h5 className="mb-2">Additional Notes</h5>
                      <p className="text-muted-foreground">{record.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
