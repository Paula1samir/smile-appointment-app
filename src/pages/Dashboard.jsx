import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
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

  const StatCard = ({ title, value, description, icon: Icon, className }) => (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Welcome back, Dr/ {profile?.full_name}
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'doctor' ? 'Doctor Dashboard' : 'Assistant Dashboard'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 dashboard-reports p-6">
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            description="Scheduled for today"
            icon={Calendar}
            className="StatCard"
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            description="In the system"
            icon={Users}
            color="bg-accent"
            delay={0.2}
          />
          <StatCard
            title="Upcoming"
            value={stats.upcomingAppointments}
            description="Next 7 days"
            icon={Clock}
            color="bg-blue-500"
            delay={0.3}
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            description="Appointments finished"
            icon={TrendingUp}
            color="bg-green-500"
            delay={0.4}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for {profile?.role}s</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.role === 'doctor' ? (
                <>
                  <div className="p-4 border rounded-lg quick-action">
                    <h3 className="font-medium">Review Today's Schedule</h3>
                    <p className="text-sm text-muted-foreground">Check upcoming appointments and patient notes</p>
                  </div>
                  <div className="p-4 border rounded-lg quick-action">
                    <h3 className="font-medium">Update Treatment Plans</h3>
                    <p className="text-sm text-muted-foreground">Modify patient treatment information</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 border rounded-lg quick-action">
                    <h3 className="font-medium">Schedule Appointments</h3>
                    <p className="text-sm text-muted-foreground">Book new patient appointments</p>
                  </div>
                  <div className="p-4 border rounded-lg quick-action">
                    <h3 className="font-medium">Add New Patients</h3>
                    <p className="text-sm text-muted-foreground">Register new patients in the system</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates in the clinic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm system-status">
                  <span className="font-medium">System Status:</span>
                  <span className="text-green-600 ml-2">All systems operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Last Backup</span>
                  <span className="text-sm text-gray-500">Today, 3:00 AM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Active Users</span>
                  <span className="text-sm text-gray-500">1 online</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 text-center">
                    All systems operational
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;