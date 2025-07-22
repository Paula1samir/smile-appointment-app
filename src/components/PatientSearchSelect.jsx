import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientSearchSelect = ({ selectedPatientId, onPatientSelect, onNewPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.telephone.includes(searchTerm)
      );
      setFilteredPatients(filtered);
      setShowResults(true);
    } else {
      setFilteredPatients([]);
      setShowResults(false);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handlePatientSelect = (patient) => {
    onPatientSelect(patient.id);
    setSearchTerm(patient.name);
    setShowResults(false);
  };

  const handleNewPatient = () => {
    if (onNewPatient) {
      onNewPatient();
    } else {
      navigate('/add-patient');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="patient-search">Patient</Label>
      <div className="relative">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="patient-search"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {showResults && filteredPatients.length > 0 && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
                <CardContent className="p-0">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.telephone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          <Button type="button" variant="outline" onClick={handleNewPatient}>
            <Plus className="h-4 w-4 mr-2" />
            New Patient
          </Button>
        </div>
        
        {selectedPatient && !showResults && (
          <div className="mt-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{selectedPatient.name}</p>
                <p className="text-sm text-muted-foreground">{selectedPatient.telephone}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSearchSelect;