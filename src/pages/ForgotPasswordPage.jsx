import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: email, 2: otp + password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('request-otp', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: t('messages.success'),
        description: t('forgotPassword.otpSent'),
      });
      
      setStep(2);
    } catch (error) {
      toast({
        title: t('messages.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: t('messages.error'),
        description: t('profile.passwordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { 
          email, 
          otp, 
          newPassword 
        }
      });

      if (error) throw error;

      toast({
        title: t('messages.success'),
        description: t('forgotPassword.passwordReset'),
      });
      
      navigate('/auth');
    } catch (error) {
      toast({
        title: t('messages.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center">
              <KeyRound className="h-6 w-6 mr-2" />
              {t('forgotPassword.resetPassword')}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? t('forgotPassword.enterEmailDesc')
                : t('forgotPassword.enterOtpDesc')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {t('auth.email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('forgotPassword.enterEmail')}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('forgotPassword.sendingOtp') : t('forgotPassword.sendOtp')}
                </Button>
                
                <div className="text-center">
                  <Link 
                    to="/auth" 
                    className="text-sm text-primary hover:underline flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {t('forgotPassword.backToLogin')}
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">{t('forgotPassword.otpCode')}</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={t('forgotPassword.enterOtp')}
                    maxLength={6}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    {t('profile.newPassword')}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('profile.enterNewPassword')}
                    minLength={6}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('profile.confirmNewPassword')}
                    minLength={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('forgotPassword.resetting') : t('forgotPassword.resetPassword')}
                </Button>
                
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setStep(1)}
                    className="text-sm"
                  >
                    {t('forgotPassword.changeEmail')}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;