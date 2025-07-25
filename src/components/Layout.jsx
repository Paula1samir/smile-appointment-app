import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-50/30 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-20'}`}>
        {/* Enhanced Mobile header */}
        <motion.header 
          className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 flex items-center justify-between shadow-soft"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl hover:bg-primary/10 transition-colors duration-200"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </motion.div>
          <motion.h1 
            className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            DentalCare
          </motion.h1>
          <div className="w-10" /> {/* Spacer for balance */}
        </motion.header>

        {/* Enhanced Main content */}
        <motion.main 
          className="flex-1 relative overflow-hidden"
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out"
          transition={pageTransition}
        >
          <motion.div
            className="absolute inset-0 opacity-5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            transition={{ duration: 2 }}
            style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(29, 78, 216, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
            }}
          />
          <div className="relative z-10">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;