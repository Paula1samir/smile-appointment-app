import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="space-y-3">
      <Label htmlFor="patient-search" className="text-sm font-semibold text-gray-700" >Patient</Label>
      <div className="relative">
        <div className="flex space-x-3">
          <div className="relative flex-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Input
              style={{direction:'rtl'}}
                id="patient-search"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-300 focus:shadow-glow hover:shadow-soft"
              />
            </motion.div>
            
            <AnimatePresence>
              {showResults && filteredPatients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto shadow-soft-lg border-2 border-gray-100">
                    <CardContent className="p-0">
                      {filteredPatients.map((patient, index) => (
                        <motion.div
                          key={patient.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 cursor-pointer hover:bg-primary-50 border-b last:border-b-0 transition-all duration-200 hover:scale-[1.02]"
                          onClick={() => handlePatientSelect(patient)}
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex-shrink-0"
                            >
                              <User className="h-5 w-5 text-primary" />
                            </motion.div>
                            <div>
                              <p className="font-semibold text-gray-100">{patient.name}</p>
                              <p className="text-sm text-gray-600">{patient.telephone}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleNewPatient}
              className="floating-button bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-primary/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Patient
            </Button>
          </motion.div>
        </div>
        
        <AnimatePresence>
          {selectedPatient && !showResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200 shadow-soft"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex-shrink-0"
                >
                  <User className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedPatient.name}</p>
                  <p className="text-sm text-gray-600">{selectedPatient.telephone}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatientSearchSelect;