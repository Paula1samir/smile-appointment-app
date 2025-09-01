-- Fix critical security vulnerability in password_reset_otps table
-- Remove the overly permissive policy that allows public access to OTP codes

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "System can manage OTPs" ON public.password_reset_otps;

-- Create secure policies that only allow system functions to access OTPs
-- These policies will allow edge functions (running with service role) to manage OTPs
-- but prevent regular users from accessing sensitive OTP data

-- Allow system/service role to insert OTPs (for request-otp function)
CREATE POLICY "Service role can insert OTPs"
ON public.password_reset_otps
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow system/service role to select OTPs (for reset-password function)
CREATE POLICY "Service role can select OTPs"
ON public.password_reset_otps
FOR SELECT
TO service_role
USING (true);

-- Allow system/service role to update OTPs (for marking as used)
CREATE POLICY "Service role can update OTPs"
ON public.password_reset_otps
FOR UPDATE
TO service_role
USING (true);

-- Allow system/service role to delete expired OTPs (for cleanup)
CREATE POLICY "Service role can delete OTPs"
ON public.password_reset_otps
FOR DELETE
TO service_role
USING (true);

-- No policies for regular authenticated users - they should not access OTPs directly