import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Save } from 'lucide-react';

const SurgeryLogForm = ({ patientId, selectedTooth, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    tooth_number: selectedTooth || '',
    treatment_performed: '',
    notes: ''
  });
  const [patientInfo, setPatientInfo] = useState(null);

  // Update tooth number when selectedTooth changes
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tooth_number: selectedTooth || ''
    }));
  }, [selectedTooth]);

  // Fetch patient age when patientId changes
  React.useEffect(() => {
    if (patientId) {
      fetchPatientInfo();
    }
  }, [patientId]);

  const fetchPatientInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('age, name')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      if (data) {
        setPatientInfo(data);
      }
    } catch (error) {
      console.error('Error fetching patient info:', error);
    }
  };

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const treatments = [
    'Scaling & polishing',
    'Whitening',
    'Extraction tooth',
    'Extraction remaining roots',
    'Extraction wisdom tooth',
    'Surgical extraction',
    'Composite restoration',
    'Amalgam restoration',
    'Glass ionomer restoration',
    'Root canal with composite restoration',
    'Root canal with amalgam restoration',
    'Root canal with GI restoration',
    'Pulpotomy',
    'Pulpectomy',
    'Composite restoration child',
    'Ss crown',
    'Space maintainer',
    'Post & core',
    'Upper denture',
    'Lower denture',
    'Removable teeth',
    'Porcelain crown',
    'Zirconia crown',
    'E-max crown',
    'Veneers',
    'Cement crown',
    'Implant'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('surgery_logs')
        .insert([{
          date: formData.date,
          tooth_number: formData.tooth_number,
          treatment_performed: formData.treatment_performed,
          notes: formData.notes || null,
          patient_id: patientId,
          doctor_id: profile.user_id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Surgery log added successfully!",
      });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        tooth_number: '',
        treatment_performed: '',
        notes: ''
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Surgery/Treatment Log</CardTitle>
        {patientInfo && (
          <div className="text-sm text-muted-foreground">
            Patient: <span className="font-medium">{patientInfo.name}</span> | 
            Age: <span className="font-medium">{patientInfo.age} years</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tooth_number">Tooth Number</Label>
              <Input
                id="tooth_number"
                value={formData.tooth_number}
                onChange={(e) => setFormData({...formData, tooth_number: e.target.value})}
                placeholder="e.g., 1, 2, A, B"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="treatment">Treatment Performed</Label>
            <Select 
              value={formData.treatment_performed} 
              onValueChange={(value) => setFormData({...formData, treatment_performed: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select treatment" />
              </SelectTrigger>
              <SelectContent>
                {treatments.map((treatment) => (
                  <SelectItem key={treatment} value={treatment}>
                    {treatment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes about the procedure"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Add Surgery Log
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SurgeryLogForm;