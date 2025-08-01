import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, User } from 'lucide-react';
import Layout from '@/components/Layout';

const AddPatientPage = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    telephone: '',
    age: '',
    health_condition: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        .insert([{
          ...formData,
          age: parseInt(formData.age)
        }]);

      if (error) throw error;

      toast({
        title: t('addPatient.success'),
        description: t('addPatient.patientAddedSuccessfully'),
      });

      navigate('/patients');
    } catch (error) {
      toast({
        title: t('addPatient.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>

    <div className="min-h-screen ">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/patients')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('addPatient.backToPatients')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('addPatient.addNewPatient')}</h1>
            <p className="text-muted-foreground">{t('addPatient.registerNewPatient')}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {t('addPatient.patientInformation')}
              </CardTitle>
              <CardDescription>
                {t('addPatient.fillPatientDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('addPatient.fullName')}</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('forms.enterPatientName')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">{t('addPatient.telephone')}</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder={t('forms.enterPhoneNumber')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">{t('patients.age')} *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder={t('addPatient.enterPatientsAge')}
                    required
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="health_condition">{t('addPatient.healthConditionOptional')}</Label>
                  <Textarea
                    id="health_condition"
                    name="health_condition"
                    value={formData.health_condition}
                    onChange={handleChange}
                    placeholder={t('addPatient.healthConditionPlaceholder')}
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/patients')}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      t('addPatient.saving')
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t('patients.addPatient')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default AddPatientPage;