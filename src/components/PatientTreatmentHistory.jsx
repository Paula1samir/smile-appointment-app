import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';

const PatientTreatmentHistory = ({ patientId, selectedTooth }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchHistory();
    }
  }, [patientId, selectedTooth]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('surgery_logs')
        .select(`
          *,
          profiles!surgery_logs_doctor_id_fkey (full_name),
          patients!surgery_logs_patient_id_fkey (name, age)
        `)
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (selectedTooth) {
        query = query.eq('tooth_number', selectedTooth);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching treatment history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Treatment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Treatment History {selectedTooth && `- Tooth ${selectedTooth}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {selectedTooth 
              ? `No treatment history for tooth ${selectedTooth}` 
              : 'No treatment history found for this patient'
            }
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{log.date}</span>
                    {(log.age || log.patients?.age) && (
                      <span className="text-xs text-muted-foreground">
                        (Age: {log.age || log.patients.age})
                      </span>
                    )}
                  </div>
                  <Badge variant="outline">Tooth {log.tooth_number}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{log.treatment_performed}</p>
                  <p className="text-sm text-muted-foreground">
                    Dr. {log.profiles?.full_name}
                  </p>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Notes:</strong> {log.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientTreatmentHistory;