import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
<<<<<<< HEAD
import { ArrowLeft, Save, User } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
=======
import { ArrowLeft, Save, User, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
>>>>>>> parent of 0e5d2c9 (Reverted to commit 670bd8b7f7b9a545de8344645b52af31f7fb64c5)

const AddPatientPage = () => {
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
        title: "Success",
        description: "Patient added successfully!",
      });

      navigate('/patients');
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
<<<<<<< HEAD
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/patients')}
            className="mr-4"
=======
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <motion.div 
          className="flex items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
>>>>>>> parent of 0e5d2c9 (Reverted to commit 670bd8b7f7b9a545de8344645b52af31f7fb64c5)
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate('/patients')}
              className="mr-6 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
          </motion.div>
          <div>
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Add New Patient
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Register a new patient in the system
            </motion.p>
          </div>
        </motion.div>

        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="form-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
              <CardDescription>
                Fill in the patient details below. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter patient's full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Telephone *</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter patient's age"
                    required
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="health_condition">Health Condition</Label>
                  <Textarea
                    id="health_condition"
                    name="health_condition"
                    value={formData.health_condition}
                    onChange={handleChange}
                    placeholder="Enter any health conditions, allergies, medications, or medical history (optional)"
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/patients')}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button type="submit" disabled={loading} className="action-button">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Add Patient
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AddPatientPage;