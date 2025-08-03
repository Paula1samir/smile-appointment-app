import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import PatientTreatmentHistory from '@/components/PatientTreatmentHistory';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Upload, 
  Download, 
  Printer, 
  Phone, 
  User, 
  Clock,
  Heart,
  FileImage,
  Plus,
  Eye
} from 'lucide-react';

const PatientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_doctor_id_fkey (full_name)
        `)
        .eq('patient_id', id)
        .order('appointment_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

      // Set medical notes from health condition
      setMedicalNotes(patientData.health_condition || '');

    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error(t('patientProfile.errorFetchingData'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ health_condition: medicalNotes })
        .eq('id', id);

      if (error) throw error;
      toast.success(t('patientProfile.notesSaved'));
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error(t('patientProfile.errorSavingNotes'));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // For now, we'll store file info in local state
      // In a real app, you'd upload to Supabase Storage
      const fileInfo = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      };
      
      setFiles(prev => [...prev, fileInfo]);
      toast.success(t('patientProfile.fileUploaded'));
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(t('patientProfile.errorUploadingFile'));
    } finally {
      setUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate and download patient profile data
    const profileData = {
      patient,
      appointments,
      medicalNotes,
      files,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(profileData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patient-${patient?.name}-profile.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getAppointmentStatus = (appointment) => {
    const today = new Date();
    const appointmentDate = new Date(appointment.appointment_date);
    
    if (appointment.status === 'completed') return 'completed';
    if (appointment.status === 'cancelled') return 'cancelled';
    if (appointmentDate < today) return 'past';
    return 'upcoming';
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'upcoming': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'past': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <div className="p-6">
            <div className="text-center">{t('common.loading')}</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <div className="p-6">
            <div className="text-center">{t('patientProfile.patientNotFound')}</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background print:bg-white">
        <div className="p-6 print:p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 print:mb-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/patients')}
                className="print:hidden"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
              <div>
                <h1 className="text-3xl font-bold print:text-2xl">{patient.name}</h1>
                <p className="text-muted-foreground print:text-gray-600">
                  {t('patientProfile.patientProfile')}
                </p>
              </div>
            </div>
            <div className="flex space-x-2 print:hidden">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                {t('patientProfile.print')}
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                {t('patientProfile.download')}
              </Button>
            </div>
          </div>

          {/* Patient Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {t('patientProfile.patientInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium">{t('patients.age')}</p>
                  <p className="text-muted-foreground">{patient.age} {t('patients.years')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('patients.contact')}</p>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{patient.telephone}</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">{t('patientProfile.registeredDate')}</p>
                  <p className="text-muted-foreground">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 print:hidden">
              <TabsTrigger value="history">{t('patientProfile.treatmentHistory')}</TabsTrigger>
              <TabsTrigger value="appointments">{t('patientProfile.appointments')}</TabsTrigger>
              <TabsTrigger value="notes">{t('patientProfile.medicalNotes')}</TabsTrigger>
              <TabsTrigger value="files">{t('patientProfile.files')}</TabsTrigger>
            </TabsList>

            {/* Treatment History */}
            <TabsContent value="history" className="print:block">
              <PatientTreatmentHistory patientId={id} />
            </TabsContent>

            {/* Appointments */}
            <TabsContent value="appointments" className="print:block">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    {t('patientProfile.appointmentHistory')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {t('patientProfile.noAppointments')}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('scheduler.date')}</TableHead>
                          <TableHead>{t('scheduler.time')}</TableHead>
                          <TableHead>{t('scheduler.treatment')}</TableHead>
                          <TableHead>{t('scheduler.doctor')}</TableHead>
                          <TableHead>{t('scheduler.status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{appointment.appointment_time}</TableCell>
                            <TableCell>{appointment.treatment}</TableCell>
                            <TableCell>
                              Dr. {appointment.profiles?.full_name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(getAppointmentStatus(appointment))}>
                                {t(`scheduler.${getAppointmentStatus(appointment)}`)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical Notes */}
            <TabsContent value="notes" className="print:block">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    {t('patientProfile.medicalNotesAndConditions')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={t('patientProfile.enterMedicalNotes')}
                    value={medicalNotes}
                    onChange={(e) => setMedicalNotes(e.target.value)}
                    rows={6}
                    className="print:border-none print:p-0"
                  />
                  <Button onClick={handleSaveNotes} className="print:hidden">
                    {t('common.save')} {t('patientProfile.notes')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Files */}
            <TabsContent value="files" className="print:block">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileImage className="h-5 w-5 mr-2" />
                      {t('patientProfile.filesAndDocuments')}
                    </div>
                    <div className="print:hidden">
                      <input
                        type="file"
                        id="fileUpload"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      />
                      <Button 
                        onClick={() => document.getElementById('fileUpload')?.click()}
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? t('patientProfile.uploading') : t('patientProfile.uploadFile')}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {files.length === 0 ? (
                    <div className="text-center py-8">
                      <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t('patientProfile.noFilesUploaded')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <Card key={file.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileImage className="h-6 w-6 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="print:hidden">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PatientProfilePage;