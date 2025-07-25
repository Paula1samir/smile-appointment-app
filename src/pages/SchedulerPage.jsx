import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Plus, User, FileText, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
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
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Scheduler
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Manage daily appointments
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="action-button">
                  <Plus className="h-4 w-4" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      Schedule New Appointment
                    </DialogTitle>
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
                  <Button type="submit" className="w-full action-button">
                    Schedule Appointment
                  </Button>
                </form>
                </motion.div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="form-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="form-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Appointments for {selectedDate}
                </CardTitle>
                <CardDescription>
                  {appointments.length} appointment(s) scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {appointments.length === 0 ? (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No appointments scheduled for this date.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {appointments.map((appointment, index) => (
                        <motion.div 
                          key={appointment.id} 
                          className="appointment-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
                                  <Clock className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-semibold text-gray-900">{appointment.appointment_time}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-600 rounded-lg flex items-center justify-center">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-medium text-gray-800">{appointment.patients?.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {appointment.status === 'scheduled' && (
                                <>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                      className="hover:bg-success hover:text-success-foreground transition-colors"
                                    >
                                      Complete
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                      className="hover:bg-error hover:text-error-foreground transition-colors"
                                    >
                                      Cancel
                                    </Button>
                                  </motion.div>
                                </>
                              )}
                              <span className={`status-badge ${
                                appointment.status === 'completed' ? 'status-completed' :
                                appointment.status === 'cancelled' ? 'status-cancelled' :
                                'status-scheduled'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                            <div>
                              <p><strong className="text-gray-900">Doctor:</strong> Dr. {appointment.profiles?.full_name}</p>
                              <p><strong className="text-gray-900">Treatment:</strong> {appointment.treatment}</p>
                              {appointment.tooth && <p><strong className="text-gray-900">Tooth:</strong> {appointment.tooth}</p>}
                            </div>
                            <div>
                              {appointment.notes && <p><strong className="text-gray-900">Notes:</strong> {appointment.notes}</p>}
                              <p><strong className="text-gray-900">Phone:</strong> {appointment.patients?.telephone}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <TreatmentHistoryChart
                              patient={appointment.patients}
                              triggerButton={
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Treatment History
                                  </Button>
                                </motion.div>
                              }
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerPage;