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
  Stethoscope
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
    }
  ].filter(item => !item.doctorOnly || profile?.role === 'doctor');

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        className={`
          fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full bg-white border-${isRTL ? 'l' : 'r'} border-gray-200 z-50 shadow-soft-lg dark:bg-gray-900 dark:border-gray-800
          ${isOpen ? 'w-80' : `w-80 ${isRTL ? 'translate-x-full' : '-translate-x-full'} lg:w-20 lg:translate-x-0`}
          lg:relative lg:z-auto
        `}
      >
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <motion.div 
                className={`flex items-center gap-3 ${isOpen ? 'lg:flex' : 'lg:justify-center'}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
                </motion.div>
                <AnimatePresence>
                  {(isOpen || window.innerWidth < 1024) && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h1 className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">DentalCare</h1>
                      <p className="text-sm text-gray-600 font-medium dark:text-gray-300">Clinic Management</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                {/* Desktop toggle button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden lg:block"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </motion.div>
                
                {/* Mobile close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  className="lg:hidden rounded-xl"
                >
                  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-white dark:bg-gray-900">
            <AnimatePresence>
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ delay: index * 0.1 }}
                >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center ${isRTL ? 'gap-3 flex-row-reverse' : 'gap-3'} px-4 py-3 rounded-xl
                        nav-item group relative overflow-hidden
                        ${isActive 
                          ? 'bg-primary text-white shadow-md dark:bg-primary-800' 
                          : 'hover:bg-primary-50 text-gray-700 hover:text-primary dark:hover:bg-gray-800 dark:text-gray-100 dark:hover:text-primary-300'
                        }
                        ${!isOpen && 'lg:justify-center lg:px-3'}
                        transition-all duration-200
                      `}
                      onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                    >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0"
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    
                    <AnimatePresence>
                      {(isOpen || window.innerWidth < 1024) && (
                        <motion.div 
                          className="min-w-0 flex-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="font-semibold">{item.label}</div>
                          <div className="text-xs opacity-80 truncate">{item.description}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Tooltip for collapsed state */}
                    {!isOpen && (
                      <div className="absolute left-full ml-3 px-3 py-2 bg-primary text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden lg:block shadow-lg dark:bg-gray-800">
                        {item.label}
                        <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-primary rotate-45 dark:bg-gray-800" />
                      </div>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800">
            <motion.div 
              className={`flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 ${!isOpen && 'lg:justify-center'}`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <AnimatePresence>
                {(isOpen || window.innerWidth < 1024) && (
                  <motion.div 
                    className="min-w-0 flex-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">{user?.email}</div>
                    <div className="text-xs text-gray-600 capitalize dark:text-gray-300">{profile?.role || 'User'}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={`w-full mt-3 justify-start text-error hover:text-error hover:bg-error-50 dark:hover:bg-error-900 ${!isOpen && 'lg:justify-center lg:px-3'}`}
              >
                <LogOut className="w-4 h-4" />
                <AnimatePresence>
                  {(isOpen || window.innerWidth < 1024) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                                        {t('navigation.logout')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;