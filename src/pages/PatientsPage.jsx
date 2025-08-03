import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Phone, User, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Layout from '@/components/Layout';


const PatientsPage = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
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
      <Layout>

      <div className="min-h-screen bg-background">
        <div className="p-6">
          <div className="text-center">{t('patients.loadingPatients')}</div>
        </div>
      </div>
      </Layout>
    );
  }

  return (
    <Layout>

    <div className="min-h-screen ">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t('patients.patients')}</h1>
            <p className="text-muted-foreground">{t('patients.managePatientRecords')}</p>
          </div>
          <Link to="/add-patient">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('patients.addPatient')}
            </Button>
          </Link>
        </div>

        <Card className="mb-6 mt-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              {t('patients.searchPatients')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder={t('patients.searchByNameOrPhone')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{t('patients.patientList')}</CardTitle>
            <CardDescription>
              {filteredPatients.length} {t('patients.patientsFound')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? t('patients.noPatientsFound') : t('patients.noPatientsRegistered')}
                </p>
                <Link to="/add-patient">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('patients.addFirstPatient')}
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('patients.patient')}</TableHead>
                    <TableHead>{t('patients.contact')}</TableHead>
                    <TableHead>{t('patients.age')}</TableHead>
                    <TableHead>{t('patients.healthCondition')}</TableHead>
                    <TableHead>{t('patients.appointments')}</TableHead>
                    <TableHead>{t('patients.actions')}</TableHead>
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
                        <TableCell>{patient.age} {t('patients.years')}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {patient.health_condition || t('patients.notSpecified')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {stats.totalAppointments} {t('patients.total')}
                            </Badge>
                            {stats.upcomingAppointments > 0 && (
                              <Badge variant="default">
                                {stats.upcomingAppointments} {t('patients.upcoming')}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link to={`/patient-profile/${patient.id}`}>
                              <Button variant="outline" size="sm">
                                <User className="h-4 w-4 mr-1" />
                                {t('patients.viewProfile')}
                              </Button>
                            </Link>
                            <Link to={`/edit-patient/${patient.id}`}>
                              <Button variant="outline" size="sm">
                                {t('patients.edit')}
                              </Button>
                            </Link>
                            <Link to={`/scheduler?patient=${patient.id}`}>
                              <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-1" />
                                {t('patients.book')}
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
    </Layout>
  );
};

export default PatientsPage;