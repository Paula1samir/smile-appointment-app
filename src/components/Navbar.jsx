import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import NotificationCenter from '@/components/NotificationCenter';
import { Calendar, Users, Plus, LogOut, User, Stethoscope, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="font-bold text-lg bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
        DentalCare
      </div>
      <div className="flex items-center space-x-2">
        <NotificationCenter />
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 bg-gray-100 dark:bg-gray-800 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;