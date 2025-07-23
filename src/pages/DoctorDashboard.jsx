import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, Activity, User, FileText, Stethoscope, TrendingUp } from 'lucide-react';
import ToothChart from '@/components/ToothChart';
import SurgeryLogForm from '@/components/SurgeryLogForm';
import PatientTreatmentHistory from '@/components/PatientTreatmentHistory';
import TreatmentHistoryModal from '@/components/TreatmentHistoryModal';
import PatientSearchSelect from '@/components/PatientSearchSelect';
import Layout from '@/components/Layout';

const DoctorDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    upcomingAppointments: 0,
    completedToday: 0
  });
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedTooth, setSelectedTooth] = useState('');
  const [isChild, setIsChild] = useState(false);
  const [surgeryLogs, setSurgeryLogs] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [selectedAppointmentPatient, setSelectedAppointmentPatient] = useState(null);
  const [treatmentHistoryModalOpen, setTreatmentHistoryModalOpen] = useState(false);
  const [treatmentHistoryPatient, setTreatmentHistoryPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchPatients();
    fetchTodayAppointments();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchSurgeryLogs();
    }
  }, [selectedPatient]);

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (id, name, age, telephone, health_condition)
        `)
        .eq('appointment_date', today)
        .eq('status', 'scheduled')
        .order('appointment_time');

      if (error) throw error;
      setTodayAppointments(data || []);
    } catch (error) {
      console.error('Error fetching today appointments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayAppts } = await supabase
        .from('appointments')
        .select('*, patients(*)')
        .eq('appointment_date', today);

      const { data: patients } = await supabase
        .from('patients')
        .select('*');

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const { data: upcomingAppts } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', today)
        .lte('appointment_date', nextWeek.toISOString().split('T')[0]);

      const { data: completedToday } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', today)
        .eq('status', 'completed');

      setStats({
        todayAppointments: todayAppts?.length || 0,
        totalPatients: patients?.length || 0,
        upcomingAppointments: upcomingAppts?.length || 0,
        completedToday: completedToday?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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

  const fetchSurgeryLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('surgery_logs')
        .select('*')
        .eq('patient_id', selectedPatient);

      if (error) throw error;
      setSurgeryLogs(data || []);
    } catch (error) {
      console.error('Error fetching surgery logs:', error);
    }
  };

  const handleToothSelect = (toothNumber) => {
    setSelectedTooth(selectedTooth === toothNumber ? '' : toothNumber);
  };

  const handleSurgeryLogSuccess = () => {
    fetchSurgeryLogs();
    setSelectedTooth('');
    fetchTodayAppointments();
  };

  const handleAppointmentPatientSelect = (appointment) => {
    setSelectedAppointmentPatient(appointment);
    setSelectedPatient(appointment.patient_id);
    setIsChild(appointment.patients?.age < 12);
  };

  const handleShowTreatmentHistory = (patient) => {
    setTreatmentHistoryPatient(patient);
    setTreatmentHistoryModalOpen(true);
  };

  const StatCard = ({ title, value, description, icon: Icon, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="cursor-pointer"
    >
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 rounded-full -mr-10 -mt-10`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</CardTitle>
          <div className={`p-3 ${color} rounded-xl shadow-soft`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-1">{loading ? '...' : value}</div>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">
                Welcome back, Dr. {profile?.full_name}
              </h1>
              <p className="page-subtitle">
                Treatment Management System • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center shadow-soft">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            description="Scheduled for today"
            icon={Calendar}
            color="bg-primary"
            delay={0.1}
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            description="In the system"
            icon={Users}
            color="bg-accent"
            delay={0.2}
          />
          <StatCard
            title="Upcoming"
            value={stats.upcomingAppointments}
            description="Next 7 days"
            icon={Clock}
            color="bg-blue-500"
            delay={0.3}
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            description="Appointments finished"
            icon={TrendingUp}
            color="bg-green-500"
            delay={0.4}
          />
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Tabs defaultValue="treatment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="treatment" className="rounded-lg font-semibold">Treatment Management</TabsTrigger>
              <TabsTrigger value="today-schedule" className="rounded-lg font-semibold">Today's Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="treatment" className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key="treatment-content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-primary" />
                        Patient Selection
                      </CardTitle>
                      <CardDescription>
                        Select a patient to view their dental chart and add treatment logs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <PatientSearchSelect
                            selectedPatientId={selectedPatient}
                            onPatientSelect={setSelectedPatient}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Chart Type</label>
                          <div className="flex space-x-2">
                            <Button
                              variant={!isChild ? "default" : "outline"}
                              onClick={() => setIsChild(false)}
                              size="sm"
                              className="flex-1"
                            >
                              Adult
                            </Button>
                            <Button
                              variant={isChild ? "default" : "outline"}
                              onClick={() => setIsChild(true)}
                              size="sm"
                              className="flex-1"
                            >
                              Child
                            </Button>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedPatientData && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">{selectedPatientData.name}</h3>
                                <p className="text-sm text-gray-600">
                                  Age: {selectedPatientData.age} | Phone: {selectedPatientData.telephone}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-white">
                                {isChild ? 'Child Chart' : 'Adult Chart'}
                              </Badge>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>

                  <AnimatePresence>
                    {selectedPatient && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="grid gap-6 lg:grid-cols-2"
                      >
                        <div className="space-y-6">
                          <ToothChart
                            isChild={isChild}
                            onToothSelect={handleToothSelect}
                            selectedTooth={selectedTooth}
                            surgeryLogs={surgeryLogs}
                          />
                          
                          <SurgeryLogForm
                            patientId={selectedPatient}
                            selectedTooth={selectedTooth}
                            onSuccess={handleSurgeryLogSuccess}
                          />
                        </div>

                        <PatientTreatmentHistory
                          patientId={selectedPatient}
                          selectedTooth={selectedTooth}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="today-schedule" className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key="schedule-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-6 md:grid-cols-2"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        Today's Appointments
                      </CardTitle>
                      <CardDescription>
                        {todayAppointments.length} scheduled appointment(s) for today
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <AnimatePresence>
                        {todayAppointments.length === 0 ? (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-500 text-center py-8"
                          >
                            No appointments scheduled for today
                          </motion.p>
                        ) : (
                          todayAppointments.map((appointment, index) => (
                            <motion.div
                              key={appointment.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`appointment-card p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                                selectedAppointmentPatient?.id === appointment.id 
                                  ? 'bg-primary-50 border-primary-200 shadow-soft' 
                                  : 'hover:bg-gray-50 border-gray-200'
                              }`}
                              onClick={() => handleAppointmentPatientSelect(appointment)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900">{appointment.patients?.name}</h3>
                                <Badge variant="outline" className="bg-white">
                                  {appointment.appointment_time}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Treatment:</strong> {appointment.treatment}</p>
                                {appointment.tooth && <p><strong>Tooth:</strong> {appointment.tooth}</p>}
                                <p><strong>Age:</strong> {appointment.patients?.age} years</p>
                                <p><strong>Phone:</strong> {appointment.patients?.telephone}</p>
                              </div>
                              <div className="mt-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowTreatmentHistory(appointment.patients);
                                  }}
                                  className="w-full"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Treatment History
                                </Button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>

                  <AnimatePresence>
                    {selectedAppointmentPatient && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <User className="h-5 w-5 mr-2 text-primary" />
                              Patient Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-semibold text-gray-700">Name</p>
                                <p className="text-gray-900">{selectedAppointmentPatient.patients?.name}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700">Age</p>
                                <p className="text-gray-900">{selectedAppointmentPatient.patients?.age} years</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700">Phone</p>
                                <p className="text-gray-900">{selectedAppointmentPatient.patients?.telephone}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700">Treatment</p>
                                <p className="text-gray-900">{selectedAppointmentPatient.treatment}</p>
                              </div>
                            </div>
                            {selectedAppointmentPatient.tooth && (
                              <div>
                                <p className="font-semibold text-gray-700 text-sm">Tooth</p>
                                <p className="text-gray-900">{selectedAppointmentPatient.tooth}</p>
                              </div>
                            )}
                            {selectedAppointmentPatient.patients?.health_condition && (
                              <div>
                                <p className="font-semibold text-gray-700 text-sm">Health Condition</p>
                                <p className="text-gray-900">{selectedAppointmentPatient.patients.health_condition}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <PatientTreatmentHistory
                          patientId={selectedAppointmentPatient.patient_id}
                          selectedTooth={selectedAppointmentPatient.tooth}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {selectedAppointmentPatient && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid gap-6 lg:grid-cols-2"
                  >
                    <div className="space-y-6">
                      <ToothChart
                        isChild={isChild}
                        onToothSelect={handleToothSelect}
                        selectedTooth={selectedTooth}
                        surgeryLogs={surgeryLogs}
                      />
                      
                      <SurgeryLogForm
                        patientId={selectedAppointmentPatient.patient_id}
                        selectedTooth={selectedTooth}
                        onSuccess={handleSurgeryLogSuccess}
                      />
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Stethoscope className="h-5 w-5 mr-2 text-primary" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            supabase
                              .from('appointments')
                              .update({ status: 'completed' })
                              .eq('id', selectedAppointmentPatient.id)
                              .then(() => {
                                fetchTodayAppointments();
                                setSelectedAppointmentPatient(null);
                              });
                          }}
                        >
                          Mark Appointment Complete
                        </Button>
                        <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-xl">
                          <p>Use the tooth diagram to select specific teeth and add treatment logs.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Treatment History Modal */}
        <TreatmentHistoryModal
          isOpen={treatmentHistoryModalOpen}
          onClose={() => setTreatmentHistoryModalOpen(false)}
          patient={treatmentHistoryPatient}
        />
      </div>
    </Layout>
  );
};

export default DoctorDashboard;