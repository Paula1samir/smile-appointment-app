import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  UserPlus, 
  Users, 
  Settings, 
  LogOut,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { 
      path: '/doctor-dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      description: 'Overview and quick actions'
    },
    { 
      path: '/scheduler', 
      icon: Calendar, 
      label: 'Scheduler',
      description: 'Manage appointments'
    },
    { 
      path: '/patients', 
      icon: Users, 
      label: 'Patients',
      description: 'Patient records'
    },
    { 
      path: '/add-patient', 
      icon: UserPlus, 
      label: 'Add Patient',
      description: 'Register new patient'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:w-20 lg:translate-x-0'}
        lg:relative lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${isOpen ? 'lg:flex' : 'lg:justify-center'}`}>
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary-foreground" />
                </div>
                {(isOpen || window.innerWidth < 1024) && (
                  <div>
                    <h1 className="font-bold text-lg text-foreground">DentalCare</h1>
                    <p className="text-sm text-muted-foreground">Clinic Management</p>
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  nav-item group relative
                  ${isActive ? 'active bg-primary text-primary-foreground' : 'hover:bg-muted'}
                  ${!isOpen && 'lg:justify-center lg:px-3'}
                `}
                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(isOpen || window.innerWidth < 1024) && (
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-70 truncate">{item.description}</div>
                  </div>
                )}
                
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-foreground text-background text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden lg:block">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-muted ${!isOpen && 'lg:justify-center'}`}>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              {(isOpen || window.innerWidth < 1024) && (
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{user?.email}</div>
                  <div className="text-xs text-muted-foreground">Dentist</div>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`w-full mt-2 justify-start text-destructive hover:text-destructive hover:bg-destructive/10 ${!isOpen && 'lg:justify-center lg:px-3'}`}
            >
              <LogOut className="w-4 h-4" />
              {(isOpen || window.innerWidth < 1024) && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;