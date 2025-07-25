import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';
import ToothChart from './ToothChart';

const TreatmentHistoryChart = ({ patient, triggerButton }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedTooth, setSelectedTooth] = useState(null);
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

  const getToothTreatments = (toothNumber) => {
    return history.filter(log => log.tooth_number === toothNumber);
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="w-[95vw] h-[90vh] md:w-[90vw] lg:w-[85vw] xl:w-[80vw] overflow-hidden p-0" style={{
        maxWidth: '1400px',
        margin: 'auto'
      }}>
        <DialogHeader className="sticky top-0 bg-background z-10 p-4 border-b">
          <DialogTitle className="flex items-center text-lg md:text-xl">
            <FileText className="h-5 w-5 mr-2" />
            Treatment History - {patient.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Patient Info Card - Make it responsive */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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

          {/* Tooth Chart - Add responsive container */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[768px]">
              <ToothChart 
                isChild={patient.age < 12}
                surgeryLogs={history}
                showHistory={true}
                onToothSelect={setSelectedTooth}
                selectedTooth={selectedTooth}
              />
            </div>
          </div>

          {/* Rest of the cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedTooth && (
              <Card className="lg:sticky lg:top-4">
                <CardHeader>
                  <CardTitle>Tooth {selectedTooth} - Treatment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {getToothTreatments(selectedTooth).length > 0 ? (
                    <div className="space-y-3">
                      {getToothTreatments(selectedTooth).map((treatment, index) => (
                        <div key={index} className="border-l-4 border-red-500 pl-4">
                          <p className="font-medium">{treatment.treatment_performed}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(treatment.date).toLocaleDateString()}
                          </p>
                          {treatment.profiles?.full_name && (
                            <p className="text-sm">
                              <strong>Doctor:</strong> Dr. {treatment.profiles.full_name}
                            </p>
                          )}
                          {treatment.notes && (
                            <p className="text-sm">{treatment.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No treatments recorded for this tooth</p>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>All Previous Treatments</CardTitle>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TreatmentHistoryChart;