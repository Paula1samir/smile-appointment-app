import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Menu, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import Logo from '@/images/Logo.png';
import { useTheme } from '@/contexts/ThemeContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -20
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-white/20 dark:border-gray-800 shadow-lg sticky top-0 z-30">
          <div className="flex items-center justify-between p-3 sm:p-4" style={{direction:'rtl'}}>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <img src={Logo} alt="Logo" className="h-6 w-6 sm:h-8 sm:w-8" style={{width:'80px',height:'80px'}}/>
              </motion.div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent truncate dark:from-primary-300 dark:to-primary-500">
                DentalCare
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <motion.main 
          className="flex-1 overflow-auto text-gray-900 dark:text-gray-100"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {children || <Outlet />}
        </motion.main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;