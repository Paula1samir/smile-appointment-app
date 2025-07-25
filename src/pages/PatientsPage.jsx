import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
<<<<<<< HEAD
import { Search, Plus, Phone, User, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
=======
import { Search, Plus, Phone, User, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
>>>>>>> parent of 0e5d2c9 (Reverted to commit 670bd8b7f7b9a545de8344645b52af31f7fb64c5)

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
<<<<<<< HEAD
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <div className="text-center">Loading patients...</div>
=======
      <div className="page-container">
        <Navbar />
        <div className="content-wrapper">
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading patients...</p>
          </div>
>>>>>>> parent of 0e5d2c9 (Reverted to commit 670bd8b7f7b9a545de8344645b52af31f7fb64c5)
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
=======
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
>>>>>>> parent of 0e5d2c9 (Reverted to commit 670bd8b7f7b9a545de8344645b52af31f7fb64c5)
          <div>
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Patients
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Manage patient records
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link to="/add-patient">
              <Button className="action-button">
                <Plus className="h-4 w-4" />
                Add Patient
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="search-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="form-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="table-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Patient List
              </CardTitle>
              <CardDescription>
                {filteredPatients.length} patient(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {filteredPatients.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
                      </p>
                      <Link to="/add-patient">
                        <Button className="action-button">
                          <Plus className="h-4 w-4" />
                          Add First Patient
                        </Button>
                      </Link>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
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
                        {filteredPatients.map((patient, index) => {
                          const stats = getPatientStats(patient);
                          return (
                            <motion.tr 
                              key={patient.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.4 }}
                              className="table-row hover:bg-gray-50"
                            >
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="font-medium text-gray-900">{patient.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">{patient.telephone}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-700">{patient.age} years</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-600">
                                  {patient.health_condition || 'Not specified'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="bg-gray-50">
                                    {stats.totalAppointments} total
                                  </Badge>
                                  {stats.upcomingAppointments > 0 && (
                                    <Badge variant="default" className="bg-primary text-primary-foreground">
                                      {stats.upcomingAppointments} upcoming
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Link to={`/edit-patient/${patient.id}`}>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                                        Edit
                                      </Button>
                                    </motion.div>
                                  </Link>
                                  <Link to={`/scheduler?patient=${patient.id}`}>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button variant="outline" size="sm" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Book
                                      </Button>
                                    </motion.div>
                                  </Link>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PatientsPage;