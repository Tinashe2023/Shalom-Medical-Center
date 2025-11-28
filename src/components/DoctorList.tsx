import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { doctorsAPI } from '../lib/api';

interface DoctorListProps {
  onDataChange: () => void;
}

export function DoctorList({ onDataChange }: DoctorListProps) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    phone: '',
    experience: ''
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  const loadDoctors = async () => {
    try {
      const doctorsList = await doctorsAPI.getAll();
      setDoctors(doctorsList);
      setFilteredDoctors(doctorsList);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      toast.error('Failed to load doctors');
    }
  };

  const handleAdd = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      email: '',
      password: 'doctor123',
      specialization: '',
      phone: '',
      experience: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      password: doctor.password,
      specialization: doctor.specialization,
      phone: doctor.phone,
      experience: doctor.experience
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (doctorId: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
      await doctorsAPI.delete(doctorId);
      loadDoctors();
      onDataChange();
      toast.success('Doctor deleted successfully');
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      toast.error('Failed to delete doctor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDoctor) {
        // Edit existing doctor
        await doctorsAPI.update(editingDoctor.id, formData);
        toast.success('Doctor updated successfully');
      } else {
        // Add new doctor
        const newDoctor = {
          ...formData,
          availability: generateDefaultAvailability()
        };
        await doctorsAPI.create(newDoctor);
        toast.success('Doctor added successfully');
      }

      setIsDialogOpen(false);
      loadDoctors();
      onDataChange();
    } catch (error) {
      console.error('Failed to save doctor:', error);
      toast.error('Failed to save doctor');
    }
  };

  const generateDefaultAvailability = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      available: day !== 'Sunday',
      slots: day !== 'Sunday' ? [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' }
      ] : []
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Doctors Management</CardTitle>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialization, or email..."
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
              <TableHead>Specialization</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>{doctor.name}</TableCell>
                <TableCell>{doctor.email}</TableCell>
                <TableCell>{doctor.specialization}</TableCell>
                <TableCell>{doctor.phone}</TableCell>
                <TableCell>{doctor.experience}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(doctor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doctor.id)}
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
            <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
            <DialogDescription>
              {editingDoctor ? 'Update doctor information' : 'Add a new doctor to the system'}
            </DialogDescription>
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
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
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
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g., 10 years"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingDoctor ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
