import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, X } from 'lucide-react';
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
      <DialogContent className="overflow-hidden p-0 max-w-none border-0">
        {/* Mobile: 320px - 768px */}
        <div className="block sm:hidden w-[95vw] h-[85vh] max-w-[400px] max-h-[600px] bg-white rounded-lg shadow-2xl">
          <DialogHeader className="sticky top-0 bg-white z-10 p-3 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center text-base">
                <FileText className="h-4 w-4 mr-2" />
                <span>History - {patient.name}</span>
          </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
        </DialogHeader>
        
          <div className="flex-1 overflow-y-auto h-full">
            <div className="flex flex-col space-y-3 p-3 min-h-full">
              {/* Patient Info Card */}
              <Card className="flex-shrink-0">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 gap-3 text-xs">
                <div>
                  <p className="font-medium">Age</p>
                  <p className="text-muted-foreground">{patient.age} years</p>
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground break-all">{patient.telephone}</p>
                    </div>
                    {patient.health_condition && (
                      <div>
                        <p className="font-medium">Health Condition</p>
                        <p className="text-muted-foreground">{patient.health_condition}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tooth Chart */}
              <div className="flex-shrink-0">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[600px]">
                    <ToothChart 
                      isChild={patient.age < 12}
                      surgeryLogs={history}
                      showHistory={true}
                      onToothSelect={setSelectedTooth}
                      selectedTooth={selectedTooth}
                    />
                  </div>
                </div>
              </div>

              {/* Treatment Details and History */}
              <div className="grid grid-cols-1 gap-3 flex-1">
                {selectedTooth && (
                  <Card className="order-2 flex-shrink-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Tooth {selectedTooth} - Treatment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getToothTreatments(selectedTooth).length > 0 ? (
                        <div className="space-y-2">
                          {getToothTreatments(selectedTooth).map((treatment, index) => (
                            <div key={index} className="border-l-4 border-red-500 pl-3">
                              <p className="font-medium text-xs">{treatment.treatment_performed}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(treatment.date).toLocaleDateString()}
                              </p>
                              {treatment.profiles?.full_name && (
                                <p className="text-xs">
                                  <strong>Doctor:</strong> Dr. {treatment.profiles.full_name}
                                </p>
                              )}
                              {treatment.notes && (
                                <p className="text-xs mt-1">{treatment.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-xs">No treatments recorded for this tooth</p>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                <Card className="order-1 flex-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">All Previous Treatments</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto max-h-[40vh]">
                    {loading ? (
                      <div className="text-center py-4 text-sm">Loading treatment history...</div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No previous treatments recorded
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((treatment) => (
                          <div key={treatment.id} className="border rounded-lg p-3">
                            <div className="flex flex-col gap-2 mb-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium text-xs">
                                  {new Date(treatment.date).toLocaleDateString()}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs w-fit">
                                Tooth {treatment.tooth_number}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs">
                                <strong>Treatment:</strong> {treatment.treatment_performed}
                              </p>
                              {treatment.profiles?.full_name && (
                                <p className="text-xs">
                                  <strong>Doctor:</strong> Dr. {treatment.profiles.full_name}
                                </p>
                              )}
                              {treatment.notes && (
                                <p className="text-xs">
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
          </div>
        </div>

        {/* Tablet: 768px - 1024px */}
        <div className="hidden sm:block lg:hidden w-[90vw] h-[80vh] max-w-[800px] max-h-[700px] bg-white rounded-lg shadow-2xl">
          <DialogHeader className="sticky top-0 bg-white z-10 p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2" />
                <span>Treatment History - {patient.name}</span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto h-full">
            <div className="flex flex-col space-y-4 p-4 min-h-full">
              {/* Patient Info Card */}
              <Card className="flex-shrink-0">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Age</p>
                      <p className="text-muted-foreground">{patient.age} years</p>
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground break-all">{patient.telephone}</p>
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

              {/* Tooth Chart */}
              <div className="flex-shrink-0">
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
          </div>

              {/* Treatment Details and History */}
              <div className="grid grid-cols-1 gap-4 flex-1">
            {selectedTooth && (
                  <Card className="order-2 flex-shrink-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Tooth {selectedTooth} - Treatment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {getToothTreatments(selectedTooth).length > 0 ? (
                    <div className="space-y-3">
                      {getToothTreatments(selectedTooth).map((treatment, index) => (
                        <div key={index} className="border-l-4 border-red-500 pl-4">
                              <p className="font-medium text-sm">{treatment.treatment_performed}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(treatment.date).toLocaleDateString()}
                          </p>
                          {treatment.profiles?.full_name && (
                            <p className="text-sm">
                              <strong>Doctor:</strong> Dr. {treatment.profiles.full_name}
                            </p>
                          )}
                          {treatment.notes && (
                                <p className="text-sm mt-1">{treatment.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                        <p className="text-muted-foreground text-sm">No treatments recorded for this tooth</p>
                  )}
                </CardContent>
              </Card>
            )}
            
                <Card className="order-1 flex-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">All Previous Treatments</CardTitle>
              </CardHeader>
                  <CardContent className="overflow-y-auto max-h-[50vh]">
                {loading ? (
                      <div className="text-center py-4 text-sm">Loading treatment history...</div>
                ) : history.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No previous treatments recorded
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {history.map((treatment) => (
                          <div key={treatment.id} className="border rounded-lg p-4">
                            <div className="flex flex-row items-center justify-between gap-2 mb-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">
                                  {new Date(treatment.date).toLocaleDateString()}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs w-fit">
                                Tooth {treatment.tooth_number}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm">
                                <strong>Treatment:</strong> {treatment.treatment_performed}
                              </p>
                              {treatment.profiles?.full_name && (
                                <p className="text-sm">
                                  <strong>Doctor:</strong> Dr. {treatment.profiles.full_name}
                                </p>
                              )}
                              {treatment.notes && (
                                <p className="text-sm">
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
          </div>
        </div>

        {/* Desktop: 1024px+ */}
        <div className="hidden lg:block w-[85vw] h-[85vh] max-w-[1200px] max-h-[800px] bg-white rounded-lg shadow-2xl">
          <DialogHeader className="sticky top-0 bg-white z-10 p-6 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center text-xl">
                <FileText className="h-6 w-6 mr-3" />
                <span>Treatment History - {patient.name}</span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto h-full">
            <div className="flex flex-col space-y-6 p-6 min-h-full">
              {/* Patient Info Card */}
              <Card className="flex-shrink-0">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="font-medium">Age</p>
                      <p className="text-muted-foreground">{patient.age} years</p>
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground break-all">{patient.telephone}</p>
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

              {/* Tooth Chart */}
              <div className="flex-shrink-0">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[900px]">
                    <ToothChart 
                      isChild={patient.age < 12}
                      surgeryLogs={history}
                      showHistory={true}
                      onToothSelect={setSelectedTooth}
                      selectedTooth={selectedTooth}
                    />
                  </div>
                </div>
              </div>

              {/* Treatment Details and History */}
              <div className="grid grid-cols-2 gap-6 flex-1">
                {selectedTooth && (
                  <Card className="sticky top-6 flex-shrink-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Tooth {selectedTooth} - Treatment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getToothTreatments(selectedTooth).length > 0 ? (
                        <div className="space-y-4">
                          {getToothTreatments(selectedTooth).map((treatment, index) => (
                            <div key={index} className="border-l-4 border-red-500 pl-4">
                              <p className="font-medium text-sm">{treatment.treatment_performed}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(treatment.date).toLocaleDateString()}
                              </p>
                              {treatment.profiles?.full_name && (
                                <p className="text-sm">
                                  <strong>Doctor:</strong> Dr. {treatment.profiles.full_name}
                                </p>
                              )}
                              {treatment.notes && (
                                <p className="text-sm mt-1">{treatment.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No treatments recorded for this tooth</p>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                <Card className="flex-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">All Previous Treatments</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto max-h-[60vh]">
                    {loading ? (
                      <div className="text-center py-4 text-sm">Loading treatment history...</div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                    No previous treatments recorded
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((treatment) => (
                      <div key={treatment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">
                              {new Date(treatment.date).toLocaleDateString()}
                            </span>
                          </div>
                              <Badge variant="outline" className="text-xs w-fit">
                            Tooth {treatment.tooth_number}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                              <p className="text-sm">
                            <strong>Treatment:</strong> {treatment.treatment_performed}
                          </p>
                          {treatment.profiles?.full_name && (
                                <p className="text-sm">
                              <strong>Doctor:</strong> Dr. {treatment.profiles.full_name}
                            </p>
                          )}
                          {treatment.notes && (
                                <p className="text-sm">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TreatmentHistoryChart;