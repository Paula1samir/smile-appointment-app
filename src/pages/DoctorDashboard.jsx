import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, Activity, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ToothDiagram from '@/components/ToothDiagram';
import SurgeryLogForm from '@/components/SurgeryLogForm';
import PatientTreatmentHistory from '@/components/PatientTreatmentHistory';

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

  useEffect(() => {
    fetchStats();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchSurgeryLogs();
    }
  }, [selectedPatient]);

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
  };

  const StatCard = ({ title, value, description, icon: Icon, className }) => (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Welcome back, Dr. {profile?.full_name}
          </h1>
          <p className="text-muted-foreground">
            Doctor Dashboard - Treatment Management
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            description="Scheduled for today"
            icon={Calendar}
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            description="In the system"
            icon={Users}
          />
          <StatCard
            title="Upcoming Appointments"
            value={stats.upcomingAppointments}
            description="Next 7 days"
            icon={Clock}
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            description="Appointments finished"
            icon={Activity}
          />
        </div>

        <Tabs defaultValue="treatment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="treatment">Treatment Management</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="treatment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Patient Selection
                </CardTitle>
                <CardDescription>
                  Select a patient to view their dental chart and add treatment logs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Patient</label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.telephone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chart Type</label>
                    <div className="flex space-x-2">
                      <Button
                        variant={!isChild ? "default" : "outline"}
                        onClick={() => setIsChild(false)}
                        size="sm"
                      >
                        Adult
                      </Button>
                      <Button
                        variant={isChild ? "default" : "outline"}
                        onClick={() => setIsChild(true)}
                        size="sm"
                      >
                        Child
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedPatientData && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{selectedPatientData.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Age: {selectedPatientData.age} | Phone: {selectedPatientData.telephone}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {isChild ? 'Child Chart' : 'Adult Chart'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedPatient && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <ToothDiagram
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks for doctors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Review Today's Schedule</h3>
                    <p className="text-sm text-muted-foreground">Check upcoming appointments and patient notes</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Update Treatment Plans</h3>
                    <p className="text-sm text-muted-foreground">Modify patient treatment information</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Add Surgery Logs</h3>
                    <p className="text-sm text-muted-foreground">Record completed treatments and procedures</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates in the clinic</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">System Status:</span>
                      <span className="text-green-600 ml-2">All systems operational</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Last Backup:</span>
                      <span className="text-muted-foreground ml-2">Today at 3:00 AM</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Active Users:</span>
                      <span className="text-muted-foreground ml-2">Online now</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;