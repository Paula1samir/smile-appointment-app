import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  UserPlus,
  Users,
  Settings,
  LogOut,
  Activity,
  Menu,
  X,
  Stethoscope,
  User,
  CalendarDays,
  Shield
} from 'lucide-react';
import { Button } from './ui/button';
import Logo from '@/images/Logo.png';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, signOut, profile } = useAuth();
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: t('navigation.dashboard'),
      description: 'Overview and analytics'
    },
    {
      path: '/doctor-dashboard',
      icon: Stethoscope,
      label: 'Treatment',
      description: 'Patient treatment management',
      doctorOnly: true
    },
    {
      path: '/scheduler',
      icon: Calendar,
      label: t('navigation.scheduler'),
      description: 'Manage appointments'
    },
    {
      path: '/calendar',
      icon: CalendarDays,
      label: t('calendar.calendar'),
      description: 'Calendar view with drag-and-drop'
    },
    {
      path: '/patients',
      icon: Users,
      label: t('navigation.patients'),
      description: 'Patient records'
    },
    {
      path: '/add-patient',
      icon: UserPlus,
      label: t('navigation.addPatient'),
      description: 'Register new patient'
    },
    {
      path: '/admin',
      icon: Shield,
      label: t('admin.adminDashboard'),
      description: 'User management and system administration',
      adminOnly: true
    },
    {
      path: '/profile',
      icon: User,
      label: t('navigation.profile'),
      description: 'Account settings'
    }
  ].filter(item =>
    (!item.doctorOnly || profile?.role === 'doctor') &&
    (!item.adminOnly || profile?.role === 'admin')
  );

  return (
    <aside className="sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg flex-shrink-0">
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
              <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">DentalCare</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Clinic Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-white dark:bg-gray-900">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                nav-item group relative overflow-hidden
                ${isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }
                transition-all duration-200
              `}
            >
              <div className="flex-shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{item.label}</div>
                <div className="text-xs opacity-80 truncate">{item.description}</div>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate text-gray-900 dark:text-white">{user?.email}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{profile?.role || 'User'}</div>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full mt-3 justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-2">{t('navigation.logout')}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;