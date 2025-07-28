import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, changeLanguage, isRTL } = useLanguage();

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    changeLanguage(newLanguage);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLanguageToggle}
        className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200"
        aria-label="Switch language"
      >
        <div className="flex items-center space-x-1">
          <Languages className="w-4 h-4" />
          <span className="text-xs font-medium">
            {language === 'en' ? 'العربية' : 'EN'}
          </span>
        </div>
      </Button>
    </motion.div>
  );
};

export default LanguageSwitcher;