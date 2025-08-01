import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Activity, TrendingUp, ArrowRight, Plus, Stethoscope } from 'lucide-react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import  "./Dashboard.css"
const Dashboard = () => {
  const { profile } = useAuth();
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
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

  const StatCard = ({ title, value, description, icon: Icon, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="cursor-pointer"
      style={{width:'300px',margin:'10px'} }
    >
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 rounded-full -mr-10 -mt-10`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</CardTitle>
          <div className={`p-3 ${color} rounded-xl shadow-soft`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-100 mb-1">{loading ? '...' : value}</div>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, to, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link to={to}>
        <Card className="h-full hover:shadow-soft-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`p-3 ${color} rounded-xl shadow-soft group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-100 mb-2 group-hover:text-primary transition-colors duration-200">{title}</h3>
                <p className="text-sm text-gray-600 mb-3">{description}</p>
                <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                  <span>{t('dashboard.getStarted')}</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="page-header">
            <div>
              <h1 className="page-title">
                {t('dashboard.welcomeBackDr')} 
                <span style={{fontWeight:'bolder'}}>{profile?.full_name}</span>
              </h1>
              <p className="page-subtitle">
                {profile?.role === 'doctor' ? t('dashboard.doctorDashboard') : t('dashboard.assistantDashboard')} 
              </p>
                {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className='StatCard'>
          <StatCard
            title={t('dashboard.todaysAppointments')}
            value={stats.todayAppointments}
            description={t('dashboard.scheduledForToday')}
            icon={Calendar}
            color="bg-primary"
            delay={0.1}
            
            
          />
          <StatCard
            title={t('dashboard.totalPatients')}
            value={stats.totalPatients}
            description={t('dashboard.inTheSystem')}
            icon={Users}
            color="bg-accent"
            delay={0.2}
          />
          <StatCard
            title={t('dashboard.upcomingAppointments')}
            value={stats.upcomingAppointments}
            description={t('dashboard.next7Days')}
            icon={Clock}
            color="bg-primary"
            delay={0.3}
          />
          <StatCard
            title={t('dashboard.completedToday')}
            value={stats.completedToday}
            description={t('dashboard.appointmentsFinished')}
            icon={TrendingUp}
            color="bg-green-500"
            delay={0.4}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="md:col-span-2 lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  {t('dashboard.quickActions')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.commonTasksFor')} {profile?.role}s
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {profile?.role === 'doctor' ? (
                    <>
                      <QuickActionCard
                        title={t('dashboard.treatmentManagement')}
                        description={t('dashboard.accessPatientCharts')}
                        icon={Stethoscope}
                        to="/doctor-dashboard"
                        color="bg-primary"
                        delay={0.6}
                      />
                      <QuickActionCard
                        title={t('dashboard.todaysSchedule')}
                        description={t('dashboard.reviewAppointments')}
                        icon={Calendar}
                        to="/scheduler"
                        color="bg-accent"
                        delay={0.7}
                      />
                    </>
                  ) : (
                    <>
                      <QuickActionCard
                        title={t('dashboard.scheduleAppointments')}
                        description={t('dashboard.bookNewAppointments')}
                        icon={Calendar}
                        to="/scheduler"
                        color="bg-primary"
                        delay={0.6}
                      />
                      <QuickActionCard
                        title={t('dashboard.managePatients')}
                        description={t('dashboard.viewEditRecords')}
                        icon={Users}
                        to="/patients"
                        color="bg-accent"
                        delay={0.7}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{marginTop:'10px'}}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-accent" />
                  {t('dashboard.systemStatus')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.currentSystemInfo')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('dashboard.systemStatus')}</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse-soft" />
                    <span className="text-sm text-green-600 font-medium">{t('dashboard.systemStatusOnline')}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('dashboard.lastBackup')}</span>
                  <span className="text-sm text-gray-500">{t('dashboard.todayBackup')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('dashboard.activeUsers')}</span>
                  <span className="text-sm text-gray-500">{t('dashboard.oneOnline')}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 text-center">
                    {t('dashboard.allSystemsOperational')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;