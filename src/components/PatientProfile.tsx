import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { patientsAPI } from '../lib/api';

interface PatientProfileProps {
  patient: any;
  onDataChange: () => void;
}

export function PatientProfile({ patient, onDataChange }: PatientProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: patient.name || '',
    email: patient.email || '',
    phone: patient.phone || '',
    date_of_birth: patient.date_of_birth || '',
    blood_group: patient.blood_group || '',
    address: patient.address || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await patientsAPI.update(patient.id, formData);

      // Update current user in localStorage
      const updatedPatient = { ...patient, ...formData };
      localStorage.setItem('current_user', JSON.stringify(updatedPatient));

      toast.success('Profile updated successfully');
      setIsEditing(false);
      onDataChange();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      date_of_birth: patient.date_of_birth || '',
      blood_group: patient.blood_group || '',
      address: patient.address || ''
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>My Profile</CardTitle>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Input
                  id="blood_group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  placeholder="e.g., A+, O-, B+"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                <p>{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p>{patient.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                <p>{patient.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                <p>{patient.date_of_birth || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Blood Group</p>
                <p>{patient.blood_group || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Address</p>
              <p>{patient.address || 'Not provided'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
