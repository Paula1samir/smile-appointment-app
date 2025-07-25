import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock, TrendingUp, Activity, Plus, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    upcomingAppointments: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's appointments
      const { data: todayAppts } = await supabase
        .from('appointments')
        .select('*, patients(*)')
        .eq('appointment_date', today);

      // Get total patients
      const { data: patients } = await supabase
        .from('patients')
        .select('*');

      // Get upcoming appointments (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const { data: upcomingAppts } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', today)
        .lte('appointment_date', nextWeek.toISOString().split('T')[0]);

      // Get completed appointments today
      const { data: completedToday } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', today)
        .eq('status', 'completed');

      setStats({
        todayAppointments: todayAppts?.length || 0,
        totalPatients: patients?.length || 0,
        upcomingAppointments: upcomingAppts?.length || 0,
        completedToday: completedToday?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, description, icon: Icon, color = "bg-white", delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="cursor-pointer"
    >
      <Card className={`stat-card border-0 shadow-soft hover:shadow-soft-lg transition-all duration-300 ${color}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Icon className="h-5 w-5 text-primary" />
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-3xl font-bold text-gray-900 mb-1"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.div>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <motion.div 
          className="page-header-modern"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Welcome back, Dr/ {profile?.full_name}
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {profile?.role === 'doctor' ? 'Doctor Dashboard' : 'Assistant Dashboard'}
          </motion.p>
        </motion.div>

        <div className="stats-grid">
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            description="Scheduled for today"
            icon={Calendar}
            delay={0.1}
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            description="In the system"
            icon={Users}
            delay={0.2}
          />
          <StatCard
            title="Upcoming"
            value={stats.upcomingAppointments}
            description="Next 7 days"
            icon={Clock}
            delay={0.3}
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            description="Appointments finished"
            icon={TrendingUp}
            delay={0.4}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="form-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks for {profile?.role}s</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.role === 'doctor' ? (
                  <>
                    <Link to="/doctor-dashboard">
                      <motion.div 
                        className="p-4 border border-gray-100 rounded-xl quick-action bg-gradient-to-r from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100 transition-all duration-300 cursor-pointer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-primary" />
                          Treatment Management
                        </h3>
                        <p className="text-sm text-gray-600">Manage patient treatments and medical history</p>
                      </motion.div>
                    </Link>
                    <Link to="/scheduler">
                      <motion.div 
                        className="p-4 border border-gray-100 rounded-xl quick-action bg-gradient-to-r from-accent-50 to-primary-50 hover:from-accent-100 hover:to-primary-100 transition-all duration-300 cursor-pointer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-accent" />
                          Review Today's Schedule
                        </h3>
                        <p className="text-sm text-gray-600">Check upcoming appointments and patient notes</p>
                      </motion.div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/scheduler">
                      <motion.div 
                        className="p-4 border border-gray-100 rounded-xl quick-action bg-gradient-to-r from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100 transition-all duration-300 cursor-pointer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          Schedule Appointments
                        </h3>
                        <p className="text-sm text-gray-600">Book new patient appointments</p>
                      </motion.div>
                    </Link>
                    <Link to="/add-patient">
                      <motion.div 
                        className="p-4 border border-gray-100 rounded-xl quick-action bg-gradient-to-r from-accent-50 to-primary-50 hover:from-accent-100 hover:to-primary-100 transition-all duration-300 cursor-pointer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          <Plus className="h-4 w-4 text-accent" />
                          Add New Patients
                        </h3>
                        <p className="text-sm text-gray-600">Register new patients in the system</p>
                      </motion.div>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="form-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates in the clinic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center justify-between p-3 bg-success-50 rounded-xl border border-success-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-900">System Status</span>
                    </div>
                    <span className="text-sm text-success font-medium">All systems operational</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center justify-between py-2 border-b border-gray-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <span className="text-sm font-medium text-gray-700">Last Backup</span>
                    <span className="text-sm text-gray-600">Today, 3:00 AM</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center justify-between py-2 border-b border-gray-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <span className="text-sm font-medium text-gray-700">Active Users</span>
                    <span className="text-sm text-gray-600">1 online</span>
                  </motion.div>
                  <motion.div 
                    className="pt-3 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    <div className="text-xs text-gray-500">
                      All systems operational ✓
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;