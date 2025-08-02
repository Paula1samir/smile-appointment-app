import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Plus, User, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PatientSearchSelect from '@/components/PatientSearchSelect';
import TreatmentHistoryChart from '@/components/TreatmentHistoryChart';
import Layout from '@/components/Layout';


const SchedulerPage = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
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
        title: t('messages.success'),
        description: t('messages.appointmentScheduled'),
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
        title: t('messages.error'),
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
        title: t('messages.success'),
        description: `${t('schedulerActions.appointmentMarkedAs')} ${t(`appointmentStatus.${status}`)}`,
      });

      fetchAppointments();
    } catch (error) {
      toast({
        title: t('messages.error'),
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
        <Layout>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-50/30">
      <div className="p-6 ">
        <div className="flex items-center justify-between mb-6 animate-fade-in-up SchedulerFirstComponent">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">{t('scheduler.scheduler')}</h1>
            <p className="text-muted-foreground">{t('scheduler.manageDailyAppointments')}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="animate-fade-in-right">
                <Plus className="h-4 w-4 mr-2" />
                {t('scheduler.scheduleAppointment')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] animate-zoom-in">
              <DialogHeader>
                <DialogTitle>{t('scheduler.scheduleNewAppointment')}</DialogTitle>
                <DialogDescription>
                  {t('scheduler.fillDetailsToSchedule')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <PatientSearchSelect
                  selectedPatientId={formData.patient_id}
                  onPatientSelect={(patientId) => setFormData({...formData, patient_id: patientId})}
                />
                <div className="space-y-2">
                  <Label htmlFor="doctor">{t('appointments.selectDoctor')}</Label>
                  <Select value={formData.doctor_id} onValueChange={(value) => setFormData({...formData, doctor_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('scheduler.selectDoctor')} />
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
                  <Label htmlFor="time">{t('appointments.appointmentTime')}</Label>
                  <Select value={formData.appointment_time} onValueChange={(value) => setFormData({...formData, appointment_time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('scheduler.selectTime')} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem 
                          key={time} 
                          value={time}
                          disabled={isTimeSlotBooked(time)}
                        >
                          {time} {isTimeSlotBooked(time) ? t('scheduler.booked') : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="appointment_date">{t('scheduler.appointmentDate')}</Label>
                   <Input
                     id="appointment_date"
                     type="date"
                     value={formData.appointment_date || selectedDate}
                     onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="treatment">{t('appointments.treatment')}</Label>
                   <Select value={formData.treatment} onValueChange={(value) => setFormData({...formData, treatment: value})}>
                     <SelectTrigger>
                       <SelectValue placeholder={t('scheduler.selectTreatment')} />
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
                  <Label htmlFor="tooth">{t('scheduler.toothOptional')}</Label>
                  <Input
                    id="tooth"
                    value={formData.tooth}
                    onChange={(e) => setFormData({...formData, tooth: e.target.value})}
                    placeholder={t('scheduler.toothPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">{t('scheduler.notesOptional')}</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder={t('scheduler.additionalNotes')}
                  />
                </div>
                <Button type="submit" className="w-full animate-fade-in-up" >
                  {t('scheduler.scheduleAppointment')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3" style={{marginTop:'10px'}}>
          <Card className="animate-fade-in-left">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                {t('scheduler.selectDate')}
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

          <Card className="md:col-span-2 animate-fade-in-right SchedulerThirdComponent">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                {t('scheduler.appointmentsFor')} {selectedDate}
              </CardTitle>
              <CardDescription>
                {appointments.length} {t('scheduler.appointmentsScheduled')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 animate-fade-in">
                  {t('scheduler.noAppointmentsScheduled')}
                </p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment, index) => (
                    <div key={appointment.id} className="border rounded-lg p-4 appointment-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
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
                                className="hover-lift"
                              >
                                {t('schedulerActions.complete')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                className="hover-lift"
                              >
                                {t('schedulerActions.cancel')}
                              </Button>
                            </>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-primary-100 text-primary-800'
                          }`}>
                             {t(`appointmentStatus.${appointment.status}`)}
                           </span>
                        </div>
                      </div>
                         <div className="mt-2 text-sm text-muted-foreground">
                         <p><strong>{t('schedulerActions.doctor')}:</strong> Dr. {appointment.profiles?.full_name}</p>
                         <p><strong>{t('schedulerActions.treatment')}:</strong> {appointment.treatment}</p>
                         {appointment.tooth && <p><strong>{t('schedulerActions.tooth')}:</strong> {appointment.tooth}</p>}
                         {appointment.notes && <p><strong>{t('schedulerActions.notes')}:</strong> {appointment.notes}</p>}
                         <p><strong>{t('schedulerActions.phone')}:</strong> {appointment.patients?.telephone}</p>
                       </div>
                       <div className="mt-3">
                         <TreatmentHistoryChart
                           patient={appointment.patients}
                           triggerButton={
                              <Button size="sm" variant="outline" className="hover-lift">
                                <FileText className="h-4 w-4 mr-2" />
                                {t('schedulerActions.treatmentHistory')}
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
    </div>
        </Layout>

  );
};

export default SchedulerPage;