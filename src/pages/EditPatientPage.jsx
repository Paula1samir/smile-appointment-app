import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, User, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';

const EditPatientPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    telephone: '',
    age: '',
    health_condition: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          telephone: data.telephone,
          age: data.age.toString(),
          health_condition: data.health_condition || ''
        });
      }
    } catch (error) {
      toast({
        title: t('messages.error'),
        description: t('editPatient.patientNotFound'),
        variant: "destructive",
      });
      navigate('/patients');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('patients')
        .update({
          ...formData,
          age: parseInt(formData.age)
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('messages.success'),
        description: t('editPatient.patientUpdated'),
      });

      navigate('/patients');
    } catch (error) {
      toast({
        title: t('messages.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('messages.success'),
        description: t('editPatient.patientDeleted'),
      });

      navigate('/patients');
    } catch (error) {
      toast({
        title: t('messages.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (initialLoading) {
    return (
        <div className="p-6">
          <div className="text-center">{t('editPatient.loadingPatientData')}</div>
        </div>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/patients')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('editPatient.backToPatients')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('editPatient.editPatient')}</h1>
            <p className="text-muted-foreground">{t('editPatient.updatePatientInformation')}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {t('editPatient.patientInformation')}
              </CardTitle>
              <CardDescription>
                {t('editPatient.updatePatientDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('editPatient.fullName')}</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('editPatient.enterPatientName')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">{t('editPatient.telephone')}</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder={t('editPatient.enterPhoneNumber')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">{t('editPatient.age')}</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder={t('editPatient.enterAge')}
                    required
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="health_condition">{t('editPatient.healthCondition')}</Label>
                  <Textarea
                    id="health_condition"
                    name="health_condition"
                    value={formData.health_condition}
                    onChange={handleChange}
                    placeholder={t('editPatient.healthConditionPlaceholder')}
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between pt-6">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" type="button">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('editPatient.deletePatient')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('editPatient.deletePatient')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('editPatient.deleteConfirmation')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <div className="flex items-center space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/patients')}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        t('editPatient.saving')
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t('editPatient.updatePatient')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EditPatientPage;