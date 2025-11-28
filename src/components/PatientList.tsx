import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Search, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { patientsAPI, appointmentsAPI, medicalRecordsAPI } from '../lib/api';

interface PatientListProps {
  onDataChange: () => void;
}

export function PatientList({ onDataChange }: PatientListProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [viewingPatient, setViewingPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    blood_group: '',
    address: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      const patientsList = await patientsAPI.getAll();
      setPatients(patientsList);
      setFilteredPatients(patientsList);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone || '',
      date_of_birth: patient.date_of_birth || '',
      blood_group: patient.blood_group || '',
      address: patient.address || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleView = async (patient: any) => {
    try {
      const [appointments, records] = await Promise.all([
        appointmentsAPI.getAll(),
        medicalRecordsAPI.getAll()
      ]);

      patient.appointments = appointments.filter((apt: any) => apt.patient_id === patient.id);
      patient.records = records.filter((rec: any) => rec.patient_id === patient.id);

      setViewingPatient(patient);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Failed to load patient details:', error);
      toast.error('Failed to load patient details');
    }
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This will also delete all their appointments and records.')) return;

    try {
      await patientsAPI.delete(patientId);
      loadPatients();
      onDataChange();
      toast.success('Patient deleted successfully');
    } catch (error) {
      console.error('Failed to delete patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await patientsAPI.update(editingPatient.id, formData);
      toast.success('Patient updated successfully');

      setIsEditDialogOpen(false);
      loadPatients();
      onDataChange();
    } catch (error) {
      console.error('Failed to update patient:', error);
      toast.error('Failed to update patient');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients Management</CardTitle>
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone || 'N/A'}</TableCell>
                <TableCell>{patient.blood_group || 'N/A'}</TableCell>
                <TableCell>{patient.date_of_birth || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(patient)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(patient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(patient.id)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update patient information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Input
                  id="blood_group"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          {viewingPatient && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p>{viewingPatient.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p>{viewingPatient.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p>{viewingPatient.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Blood Group</p>
                  <p>{viewingPatient.blood_group || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p>{viewingPatient.date_of_birth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p>{viewingPatient.address || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-2">Appointment History</h4>
                <p className="text-muted-foreground">
                  Total Appointments: {viewingPatient.appointments?.length || 0}
                </p>
              </div>

              <div>
                <h4 className="mb-2">Medical Records</h4>
                <p className="text-muted-foreground">
                  Total Records: {viewingPatient.records?.length || 0}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
