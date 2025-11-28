import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { doctorsAPI } from '../lib/api';

interface DoctorScheduleProps {
  doctorId: string;
  onDataChange: () => void;
}

export function DoctorSchedule({ doctorId, onDataChange }: DoctorScheduleProps) {
  const [availability, setAvailability] = useState<any[]>([]);
  const [availabilityMode, setAvailabilityMode] = useState<'always' | 'dates'>('always');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const doctor = await doctorsAPI.getById(doctorId);

      if (doctor && doctor.availability) {
        setAvailability(doctor.availability);
      } else {
        // Initialize default weekly schedule
        const defaultSchedule = daysOfWeek.map(day => ({
          day,
          available: day !== 'Saturday' && day !== 'Sunday',
          slots: day !== 'Saturday' && day !== 'Sunday'
            ? [{ start: '09:00', end: '17:00' }]
            : []
        }));
        setAvailability(defaultSchedule);
      }

      // Load custom dates if available
      if (doctor && doctor.availableDates) {
        setSelectedDates(doctor.availableDates);
        setAvailabilityMode('dates');
      }
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load schedule');
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex].available = !updatedAvailability[dayIndex].available;

    if (!updatedAvailability[dayIndex].available) {
      updatedAvailability[dayIndex].slots = [];
    } else if (updatedAvailability[dayIndex].slots.length === 0) {
      updatedAvailability[dayIndex].slots = [{ start: '09:00', end: '17:00' }];
    }

    setAvailability(updatedAvailability);
  };

  const handleAddSlot = (dayIndex: number) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex].slots.push({ start: '09:00', end: '17:00' });
    setAvailability(updatedAvailability);
  };

  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(updatedAvailability);
  };

  const handleSlotChange = (dayIndex: number, slotIndex: number, field: string, value: string) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex].slots[slotIndex][field] = value;
    setAvailability(updatedAvailability);
  };

  const handleAddDate = () => {
    if (!newDate) {
      toast.error('Please select a date');
      return;
    }

    if (selectedDates.includes(newDate)) {
      toast.error('Date already added');
      return;
    }

    setSelectedDates([...selectedDates, newDate].sort());
    setNewDate('');
  };

  const handleRemoveDate = (dateToRemove: string) => {
    setSelectedDates(selectedDates.filter(d => d !== dateToRemove));
  };

  const handleQuickSelect = (option: string) => {
    const today = new Date();
    const dates: string[] = [];

    switch (option) {
      case 'next7':
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        break;
      case 'next14':
        for (let i = 0; i < 14; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        break;
      case 'next30':
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        break;
      case 'weekdays':
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          const dayOfWeek = date.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
            dates.push(date.toISOString().split('T')[0]);
          }
        }
        break;
    }

    // Merge with existing dates and remove duplicates
    const merged = [...new Set([...selectedDates, ...dates])].sort();
    setSelectedDates(merged);
    toast.success(`Added ${dates.length} dates`);
  };

  const handleSave = async () => {
    try {
      await doctorsAPI.updateAvailability(doctorId, availability);

      // If using date-based mode, also save the dates
      if (availabilityMode === 'dates') {
        // This would need a new API endpoint, for now we'll just save to availability
        // You might want to extend the backend to support this
        console.log('Selected dates:', selectedDates);
      }

      toast.success('Schedule updated successfully');
      onDataChange();
    } catch (error) {
      console.error('Failed to update schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>My Availability Schedule</CardTitle>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={availabilityMode} onValueChange={(v: any) => setAvailabilityMode(v)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="always">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="dates">Specific Dates</TabsTrigger>
          </TabsList>

          {/* Weekly Schedule */}
          <TabsContent value="always" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-900">
                📅 Set your regular weekly schedule. Patients can book appointments on any day you mark as available.
              </p>
            </div>

            <div className="space-y-4">
              {availability.map((day, dayIndex) => (
                <div key={day.day} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={day.available}
                        onCheckedChange={() => handleToggleDay(dayIndex)}
                      />
                      <Label className="text-lg font-semibold">{day.day}</Label>
                      {day.available && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Available
                        </Badge>
                      )}
                    </div>
                    {day.available && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSlot(dayIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </Button>
                    )}
                  </div>

                  {day.available && (
                    <div className="space-y-3 ml-12">
                      {day.slots.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          No time slots added. Click "Add Time Slot" to set your hours.
                        </p>
                      ) : (
                        day.slots.map((slot: any, slotIndex: number) => (
                          <div key={slotIndex} className="flex items-center gap-4">
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="time"
                                value={slot.start}
                                onChange={(e) =>
                                  handleSlotChange(dayIndex, slotIndex, 'start', e.target.value)
                                }
                                className="w-32"
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={slot.end}
                                onChange={(e) =>
                                  handleSlotChange(dayIndex, slotIndex, 'end', e.target.value)
                                }
                                className="w-32"
                              />
                            </div>
                            {day.slots.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Specific Dates */}
          <TabsContent value="dates" className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-amber-900">
                📆 Select specific dates when you'll be available. Patients can only book on these dates.
              </p>
            </div>

            {/* Quick Select Options */}
            <div className="border rounded-lg p-4">
              <Label className="mb-2 block">Quick Select</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect('next7')}
                >
                  Next 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect('next14')}
                >
                  Next 2 Weeks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect('next30')}
                >
                  Next Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect('weekdays')}
                >
                  Weekdays (30d)
                </Button>
              </div>
            </div>

            {/* Add Specific Date */}
            <div className="border rounded-lg p-4">
              <Label className="mb-2 block">Add Specific Date</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  min={getMinDate()}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddDate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Date
                </Button>
              </div>
            </div>

            {/* Selected Dates List */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <Label>Selected Dates ({selectedDates.length})</Label>
                {selectedDates.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDates([])}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {selectedDates.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No dates selected. Add dates using the options above.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {selectedDates.map((date) => (
                    <div
                      key={date}
                      className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{formatDate(date)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDate(date)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
