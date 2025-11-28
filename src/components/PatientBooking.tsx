import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { doctorsAPI, appointmentsAPI } from '../lib/api';
import { SpecializationSelector } from './SpecializationSelector';
import { DoctorLoadBadge } from './DoctorLoadBadge';
import { QueueConfirmationDialog } from './QueueConfirmationDialog';

interface PatientBookingProps {
  patientId: string;
  onDataChange: () => void;
}

export function PatientBooking({ patientId, onDataChange }: PatientBookingProps) {
  const [step, setStep] = useState<'specialization' | 'doctor' | 'booking'>('specialization');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    reason: ''
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [showQueueDialog, setShowQueueDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load doctors when specialization is selected
  useEffect(() => {
    if (selectedSpecialization && step === 'doctor') {
      loadDoctorsBySpecialization();
    }
  }, [selectedSpecialization, step]);

  // Generate available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && bookingData.date) {
      generateAvailableSlots();
    }
  }, [selectedDoctor, bookingData.date]);

  const loadDoctorsBySpecialization = async () => {
    setLoading(true);
    try {
      const targetDate = bookingData.date || new Date().toISOString().split('T')[0];
      const doctorsList = await doctorsAPI.getBySpecialization(selectedSpecialization, targetDate);
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableSlots = async () => {
    if (!selectedDoctor || !bookingData.date) return;

    const selectedDate = new Date(bookingData.date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    const dayAvailability = selectedDoctor.availability?.find((a: any) => a.day === dayName);

    // If no availability is set, use default business hours (9 AM - 5 PM)
    let slotsToGenerate: any[] = [];
    if (!dayAvailability || !dayAvailability.available || !dayAvailability.slots || dayAvailability.slots.length === 0) {
      // Default: 9 AM to 5 PM on weekdays only
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        setAvailableSlots([]);
        return;
      }
      slotsToGenerate = [{ start: '09:00', end: '17:00' }];
    } else {
      slotsToGenerate = dayAvailability.slots;
    }

    // Get existing appointments for this doctor on this date
    const existingAppointments = await appointmentsAPI.getAll();
    const bookedSlots = existingAppointments
      .filter((apt: any) =>
        apt.doctor_id === selectedDoctor.id &&
        apt.appointment_date === bookingData.date &&
        apt.status !== 'cancelled'
      )
      .map((apt: any) => apt.appointment_time);

    // Generate slots from availability
    const slots: string[] = [];
    slotsToGenerate.forEach((slot: any) => {
      const startTime = parseInt(slot.start.split(':')[0]);
      const endTime = parseInt(slot.end.split(':')[0]);

      for (let hour = startTime; hour < endTime; hour++) {
        const timeSlot = `${String(hour).padStart(2, '0')}:00`;
        if (!bookedSlots.includes(timeSlot)) {
          slots.push(timeSlot);
        }
      }
    });

    setAvailableSlots(slots);
  };

  const handleSpecializationSelect = (specialization: string) => {
    setSelectedSpecialization(specialization);
    setStep('doctor');
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setBookingData({ date: '', time: '', reason: '' });
    setAvailableSlots([]);
    setStep('booking');
  };

  const handleBack = () => {
    if (step === 'booking') {
      setStep('doctor');
      setSelectedDoctor(null);
      setBookingData({ date: '', time: '', reason: '' });
    } else if (step === 'doctor') {
      setStep('specialization');
      setSelectedSpecialization('');
      setDoctors([]);
    }
  };

  const handleBookAppointment = async (allowQueue: boolean = false) => {
    if (!selectedDoctor || !bookingData.date || !bookingData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    // If not allowing queue and no time slot selected
    if (!allowQueue && !bookingData.time) {
      toast.error('Please select a time slot');
      return;
    }

    setLoading(true);
    try {
      const response: any = await appointmentsAPI.create({
        patientId,
        doctorId: selectedDoctor.id,
        date: bookingData.date,
        time: bookingData.time,
        reason: bookingData.reason,
        allowQueue
      });

      if (response.status === 'queued') {
        toast.success(`${response.message || 'Added to waitlist'} - You'll receive an email when assigned!`);
      } else {
        toast.success('Appointment booked successfully!');
      }

      // Reset and go back to specialization selection
      setStep('specialization');
      setSelectedSpecialization('');
      setSelectedDoctor(null);
      setBookingData({ date: '', time: '', reason: '' });
      onDataChange();
    } catch (error: any) {
      // Check if doctor is full
      if (error.message?.includes('fully booked') || error.message?.includes('Doctor is fully booked')) {
        setShowQueueDialog(true);
      } else {
        toast.error(error.message || 'Failed to book appointment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = () => {
    setShowQueueDialog(false);
    handleBookAppointment(true);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Specialization Selection */}
      {step === 'specialization' && (
        <SpecializationSelector
          onSelect={handleSpecializationSelect}
          selectedSpecialization={selectedSpecialization}
        />
      )}

      {/* Step 2: Doctor Selection */}
      {step === 'doctor' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <CardTitle>Available Doctors - {selectedSpecialization}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No doctors available for this specialization
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{doctor.name}</h4>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      </div>
                      <Badge>{doctor.experience}</Badge>
                    </div>
                    <DoctorLoadBadge
                      loadStatus={doctor.loadstatus || 'available'}
                      appointmentCount={doctor.appointmentcount || 0}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Booking Form */}
      {step === 'booking' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <CardTitle>Book Appointment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Selected Doctor Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-1">{selectedDoctor.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{selectedDoctor.specialization}</p>
                <DoctorLoadBadge
                  loadStatus={selectedDoctor.loadstatus || 'available'}
                  appointmentCount={selectedDoctor.appointmentcount || 0}
                />
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={getMinDate()}
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value, time: '' })}
                  />
                </div>

                {bookingData.date && (
                  <div className="space-y-2">
                    <Label htmlFor="time">Select Time Slot</Label>
                    {availableSlots.length > 0 ? (
                      <Select
                        value={bookingData.time}
                        onValueChange={(value) => setBookingData({ ...bookingData, time: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No available slots for this date. Doctor may be fully booked.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit *</Label>
                  <Input
                    id="reason"
                    placeholder="e.g., Regular checkup, consultation..."
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleBookAppointment(false)}
                  disabled={loading || !bookingData.date || !bookingData.reason}
                >
                  {loading ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Confirmation Dialog */}
      <QueueConfirmationDialog
        open={showQueueDialog}
        onOpenChange={setShowQueueDialog}
        doctorName={selectedDoctor?.name || ''}
        date={bookingData.date}
        onConfirm={handleJoinQueue}
        onCancel={() => {
          setShowQueueDialog(false);
          setStep('doctor');
        }}
      />
    </div>
  );
}
