import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Plus, User, FileText } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import PatientSearchSelect from '@/components/PatientSearchSelect';
import TreatmentHistoryChart from '@/components/TreatmentHistoryChart';

const SchedulerPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    treatment: '',
    tooth: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (id, name, telephone, age, health_condition),
          profiles (full_name)
        `)
        .eq('appointment_date', selectedDate)
        .order('appointment_time');

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor')
        .order('full_name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
       const { error } = await supabase
         .from('appointments')
         .insert([{
           ...formData,
           appointment_date: formData.appointment_date || selectedDate
         }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment scheduled successfully!",
      });

      setIsDialogOpen(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        treatment: '',
        tooth: '',
        notes: ''
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Appointment marked as ${status}`,
      });

      fetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const isTimeSlotBooked = (time) => {
    return appointments.some(apt => apt.appointment_time === time);
  };

  const timeSlots = generateTimeSlots();

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Scheduler</h1>
            <p className="text-muted-foreground">Manage daily appointments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Fill in the details to schedule a new appointment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <PatientSearchSelect
                  selectedPatientId={formData.patient_id}
                  onPatientSelect={(patientId) => setFormData({...formData, patient_id: patientId})}
                />
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor</Label>
                  <Select value={formData.doctor_id} onValueChange={(value) => setFormData({...formData, doctor_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.user_id} value={doctor.user_id}>
                          Dr. {doctor.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select value={formData.appointment_time} onValueChange={(value) => setFormData({...formData, appointment_time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem 
                          key={time} 
                          value={time}
                          disabled={isTimeSlotBooked(time)}
                        >
                          {time} {isTimeSlotBooked(time) ? '(Booked)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="appointment_date">Appointment Date</Label>
                   <Input
                     id="appointment_date"
                     type="date"
                     value={formData.appointment_date || selectedDate}
                     onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="treatment">Treatment</Label>
                   <Select value={formData.treatment} onValueChange={(value) => setFormData({...formData, treatment: value})}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select treatment" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Scaling & polishing">Scaling & polishing</SelectItem>
                       <SelectItem value="Whitening">Whitening</SelectItem>
                       <SelectItem value="Extraction tooth">Extraction tooth</SelectItem>
                       <SelectItem value="Extraction remaining roots">Extraction remaining roots</SelectItem>
                       <SelectItem value="Extraction wisdom tooth">Extraction wisdom tooth</SelectItem>
                       <SelectItem value="Surgical extraction">Surgical extraction</SelectItem>
                       <SelectItem value="Composite restoration">Composite restoration</SelectItem>
                       <SelectItem value="Amalgam restoration">Amalgam restoration</SelectItem>
                       <SelectItem value="Glass ionomer restoration">Glass ionomer restoration</SelectItem>
                       <SelectItem value="Root canal with composite restoration">Root canal with composite restoration</SelectItem>
                       <SelectItem value="Root canal with amalgam restoration">Root canal with amalgam restoration</SelectItem>
                       <SelectItem value="Root canal with GI restoration">Root canal with GI restoration</SelectItem>
                       <SelectItem value="Pulpotomy">Pulpotomy</SelectItem>
                       <SelectItem value="Pulpectomy">Pulpectomy</SelectItem>
                       <SelectItem value="Composite restoration child">Composite restoration child</SelectItem>
                       <SelectItem value="Ss crown">Ss crown</SelectItem>
                       <SelectItem value="Space maintainer">Space maintainer</SelectItem>
                       <SelectItem value="Post & core">Post & core</SelectItem>
                       <SelectItem value="Upper denture">Upper denture</SelectItem>
                       <SelectItem value="Lower denture">Lower denture</SelectItem>
                       <SelectItem value="Removable teeth">Removable teeth</SelectItem>
                       <SelectItem value="Porcelain crown">Porcelain crown</SelectItem>
                       <SelectItem value="Zirconia crown">Zirconia crown</SelectItem>
                       <SelectItem value="E-max crown">E-max crown</SelectItem>
                       <SelectItem value="Veneers">Veneers</SelectItem>
                       <SelectItem value="Cement crown">Cement crown</SelectItem>
                       <SelectItem value="Implant">Implant</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="tooth">Tooth (Optional)</Label>
                  <Input
                    id="tooth"
                    value={formData.tooth}
                    onChange={(e) => setFormData({...formData, tooth: e.target.value})}
                    placeholder="e.g., Upper left molar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Schedule Appointment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Appointments for {selectedDate}
              </CardTitle>
              <CardDescription>
                {appointments.length} appointment(s) scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No appointments scheduled for this date.
                </p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.appointment_time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.patients?.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              >
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                         <div className="mt-2 text-sm text-muted-foreground">
                         <p><strong>Doctor:</strong> Dr. {appointment.profiles?.full_name}</p>
                         <p><strong>Treatment:</strong> {appointment.treatment}</p>
                         {appointment.tooth && <p><strong>Tooth:</strong> {appointment.tooth}</p>}
                         {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                         <p><strong>Phone:</strong> {appointment.patients?.telephone}</p>
                       </div>
                       <div className="mt-3">
                         <TreatmentHistoryChart
                           patient={appointment.patients}
                           triggerButton={
                             <Button size="sm" variant="outline">
                               <FileText className="h-4 w-4 mr-2" />
                               Treatment History
                             </Button>
                           }
                         />
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SchedulerPage;