import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer 
      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-800 py-4 px-6 mt-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              © 2024 DentalCare Clinic Management System
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Created and edited by</span>
            <motion.div
              className="flex items-center space-x-1 font-semibold text-primary dark:text-primary-300"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Heart className="h-4 w-4 text-red-500" />
              <span>Eng. Paula Samir</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer; 