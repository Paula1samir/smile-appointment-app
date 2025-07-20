import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Plus, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="text-xl font-bold text-primary">
            Dental Clinic
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link to="/scheduler">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Scheduler</span>
              </Button>
            </Link>
            <Link to="/patients">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Patients</span>
              </Button>
            </Link>
            <Link to="/add-patient">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Patient</span>
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {profile?.full_name} ({profile?.role})
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;