import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Phone, User, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          appointments (
            id,
            appointment_date,
            status
          )
        `)
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telephone.includes(searchTerm)
  );

  const getPatientStats = (patient) => {
    const appointments = patient.appointments || [];
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const upcomingAppointments = appointments.filter(apt => 
      apt.status === 'scheduled' && new Date(apt.appointment_date) >= new Date()
    ).length;

    return { totalAppointments, completedAppointments, upcomingAppointments };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-6">
          <div className="text-center">Loading patients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground">Manage patient records</p>
          </div>
          <Link to="/add-patient">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Search by name or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient List</CardTitle>
            <CardDescription>
              {filteredPatients.length} patient(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
                </p>
                <Link to="/add-patient">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Patient
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Health Condition</TableHead>
                    <TableHead>Appointments</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => {
                    const stats = getPatientStats(patient);
                    return (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{patient.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{patient.telephone}</span>
                          </div>
                        </TableCell>
                        <TableCell>{patient.age} years</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {patient.health_condition || 'Not specified'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {stats.totalAppointments} total
                            </Badge>
                            {stats.upcomingAppointments > 0 && (
                              <Badge variant="default">
                                {stats.upcomingAppointments} upcoming
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link to={`/edit-patient/${patient.id}`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Link to={`/scheduler?patient=${patient.id}`}>
                              <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-1" />
                                Book
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientsPage;