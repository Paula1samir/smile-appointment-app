import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';
import VisualToothHistory from './VisualToothHistory';

const TreatmentHistoryModal = ({ isOpen, onClose, patient }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && patient) {
      fetchHistory();
    }
  }, [isOpen, patient]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('surgery_logs')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('patient_id', patient.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching treatment history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Treatment History - {patient.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Age</p>
                  <p className="text-muted-foreground">{patient.age} years</p>
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{patient.telephone}</p>
                </div>
                {patient.health_condition && (
                  <div className="col-span-2">
                    <p className="font-medium">Health Condition</p>
                    <p className="text-muted-foreground">{patient.health_condition}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visual Tooth History */}
          <VisualToothHistory 
            patientAge={patient.age}
            surgeryLogs={history}
          />

          {/* Treatment History List */}
          <Card>
            <CardHeader>
              <CardTitle>Previous Treatments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading treatment history...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No previous treatments recorded
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((treatment) => (
                    <div key={treatment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(treatment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant="outline">
                          Tooth {treatment.tooth_number}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p>
                          <strong>Treatment:</strong> {treatment.treatment_performed}
                        </p>
                        {treatment.profiles?.full_name && (
                          <p>
                            <strong>Doctor:</strong> Dr. {treatment.profiles.full_name}
                          </p>
                        )}
                        {treatment.notes && (
                          <p>
                            <strong>Notes:</strong> {treatment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TreatmentHistoryModal;