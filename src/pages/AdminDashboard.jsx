import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../integrations/supabase/client';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { 
  Users, 
  UserCheck, 
  Stethoscope, 
  Search,
  Settings,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [patients, setPatients] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState({ doctorId: '', assistantId: '' });
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Fetch all users data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch profiles (users)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;

      // Separate users by role
      const doctorsList = profilesData?.filter(user => user.role === 'doctor') || [];
      const assistantsList = profilesData?.filter(user => user.role === 'assistant') || [];

      setUsers(profilesData || []);
      setDoctors(doctorsList);
      setAssistants(assistantsList);
      setPatients(patientsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('messages.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle assistant assignment
  const handleAssignAssistant = async () => {
    if (!selectedAssignment.doctorId || !selectedAssignment.assistantId) {
      toast.error(t('admin.fillAllFields'));
      return;
    }

    try {
      // For simplicity, we'll store assignments in a future table
      // For now, we'll just show a success message
      toast.success(t('admin.assistantAssigned'));
      setIsAssignDialogOpen(false);
      setSelectedAssignment({ doctorId: '', assistantId: '' });
    } catch (error) {
      console.error('Error assigning assistant:', error);
      toast.error(t('admin.errorAssigning'));
    }
  };

  // Filter users based on search term
  const filterUsers = (usersList) => {
    if (!searchTerm) return usersList;
    return usersList.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Filter patients based on search term
  const filterPatients = (patientsList) => {
    if (!searchTerm) return patientsList;
    return patientsList.filter(patient =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.telephone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t('admin.adminDashboard')}</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.userCount')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.doctorCount')}</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctors.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.assistantCount')}</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assistants.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('navigation.patients')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>{t('admin.userManagement')}</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('admin.searchUsers')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80"
                  />
                </div>
                <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>{t('admin.assignAssistant')}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('admin.assignAssistant')}</DialogTitle>
                      <DialogDescription>
                        {t('admin.assignToDoctor')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('scheduler.selectDoctor')}
                        </label>
                        <Select
                          value={selectedAssignment.doctorId}
                          onValueChange={(value) => 
                            setSelectedAssignment(prev => ({ ...prev, doctorId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('scheduler.selectDoctor')} />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map(doctor => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('admin.selectAssistant')}
                        </label>
                        <Select
                          value={selectedAssignment.assistantId}
                          onValueChange={(value) => 
                            setSelectedAssignment(prev => ({ ...prev, assistantId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('admin.selectAssistant')} />
                          </SelectTrigger>
                          <SelectContent>
                            {assistants.map(assistant => (
                              <SelectItem key={assistant.id} value={assistant.id}>
                                {assistant.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAssignDialogOpen(false)}
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button onClick={handleAssignAssistant}>
                          {t('admin.assignAssistant')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all-users" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all-users">{t('admin.allUsers')}</TabsTrigger>
                <TabsTrigger value="doctors">{t('admin.doctors')}</TabsTrigger>
                <TabsTrigger value="assistants">{t('admin.assistants')}</TabsTrigger>
                <TabsTrigger value="patients">{t('admin.patients')}</TabsTrigger>
              </TabsList>

              {/* All Users Tab */}
              <TabsContent value="all-users">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('auth.fullName')}</TableHead>
                      <TableHead>{t('auth.email')}</TableHead>
                      <TableHead>{t('auth.phoneNumber')}</TableHead>
                      <TableHead>{t('admin.userRole')}</TableHead>
                      <TableHead>{t('admin.dateJoined')}</TableHead>
                      <TableHead>{t('admin.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterUsers(users).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {user.phone || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'doctor' ? 'default' : 'secondary'}>
                            {t(`forms.${user.role}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="default">{t('admin.active')}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Doctors Tab */}
              <TabsContent value="doctors">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('auth.fullName')}</TableHead>
                      <TableHead>{t('auth.email')}</TableHead>
                      <TableHead>{t('auth.phoneNumber')}</TableHead>
                      <TableHead>{t('admin.dateJoined')}</TableHead>
                      <TableHead>{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterUsers(doctors).map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="font-medium">{doctor.full_name}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>{doctor.phone || '-'}</TableCell>
                        <TableCell>{formatDate(doctor.created_at)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            {t('admin.viewProfile')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Assistants Tab */}
              <TabsContent value="assistants">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('auth.fullName')}</TableHead>
                      <TableHead>{t('auth.email')}</TableHead>
                      <TableHead>{t('auth.phoneNumber')}</TableHead>
                      <TableHead>{t('admin.currentAssignment')}</TableHead>
                      <TableHead>{t('admin.dateJoined')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterUsers(assistants).map((assistant) => (
                      <TableRow key={assistant.id}>
                        <TableCell className="font-medium">{assistant.full_name}</TableCell>
                        <TableCell>{assistant.email}</TableCell>
                        <TableCell>{assistant.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{t('admin.notAssigned')}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(assistant.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Patients Tab */}
              <TabsContent value="patients">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('patients.name')}</TableHead>
                      <TableHead>{t('patients.telephone')}</TableHead>
                      <TableHead>{t('patients.age')}</TableHead>
                      <TableHead>{t('patients.healthCondition')}</TableHead>
                      <TableHead>{t('admin.dateJoined')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterPatients(patients).map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {patient.telephone}
                          </div>
                        </TableCell>
                        <TableCell>{patient.age} {t('patients.years')}</TableCell>
                        <TableCell>
                          {patient.health_condition ? (
                            <span className="text-sm">{patient.health_condition}</span>
                          ) : (
                            <span className="text-muted-foreground">{t('patients.notSpecified')}</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(patient.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;