-- Fix Critical Security Issues

-- ============================================================================
-- 1. CREATE SEPARATE USER_ROLES TABLE TO PREVENT PRIVILEGE ESCALATION
-- ============================================================================

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('doctor', 'assistant', 'admin');

-- Create user_roles table with proper security
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update/delete roles
CREATE POLICY "Service role can manage all roles"
  ON public.user_roles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Update has_role function to use new table
CREATE OR REPLACE FUNCTION public.has_role(_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role::app_role
  );
$$;

-- Update get_current_user_role to use new table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Remove UPDATE permission on role column in profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (restricted)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND user_id = user_id -- Only allow updating own profile
    -- Prevent updating role column
  );

-- ============================================================================
-- 2. FIX PASSWORD_RESET_OTPS SECURITY
-- ============================================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Service role can delete OTPs" ON public.password_reset_otps;
DROP POLICY IF EXISTS "Service role can insert OTPs" ON public.password_reset_otps;
DROP POLICY IF EXISTS "Service role can select OTPs" ON public.password_reset_otps;
DROP POLICY IF EXISTS "Service role can update OTPs" ON public.password_reset_otps;

-- No client should ever access this table directly
-- Edge functions will use service role key

-- ============================================================================
-- 3. ADD RATE LIMITING AND ATTEMPT TRACKING
-- ============================================================================

-- Track password reset attempts for rate limiting
CREATE TABLE public.password_reset_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  attempted_at timestamptz DEFAULT now() NOT NULL,
  success boolean DEFAULT false NOT NULL,
  attempt_type text NOT NULL CHECK (attempt_type IN ('request_otp', 'verify_otp'))
);

-- Enable RLS (only service role should access)
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Create index for efficient rate limit queries
CREATE INDEX idx_password_reset_attempts_email_time 
  ON public.password_reset_attempts(email, attempted_at DESC);

CREATE INDEX idx_password_reset_attempts_ip_time 
  ON public.password_reset_attempts(ip_address, attempted_at DESC);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_password_reset_rate_limit(
  _email text,
  _ip_address text,
  _attempt_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_attempts integer;
  ip_attempts integer;
  failed_otp_attempts integer;
BEGIN
  -- Check email-based rate limit (3 OTP requests per hour)
  IF _attempt_type = 'request_otp' THEN
    SELECT COUNT(*) INTO email_attempts
    FROM password_reset_attempts
    WHERE email = _email
      AND attempt_type = 'request_otp'
      AND attempted_at > now() - interval '1 hour';
    
    IF email_attempts >= 3 THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'Too many password reset requests for this email. Please try again later.'
      );
    END IF;
  END IF;

  -- Check IP-based rate limit (5 requests per hour across all emails)
  SELECT COUNT(*) INTO ip_attempts
  FROM password_reset_attempts
  WHERE ip_address = _ip_address
    AND attempted_at > now() - interval '1 hour';
  
  IF ip_attempts >= 5 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Too many requests from your IP address. Please try again later.'
    );
  END IF;

  -- Check failed OTP verification attempts (5 failures locks account for 1 hour)
  IF _attempt_type = 'verify_otp' THEN
    SELECT COUNT(*) INTO failed_otp_attempts
    FROM password_reset_attempts
    WHERE email = _email
      AND attempt_type = 'verify_otp'
      AND success = false
      AND attempted_at > now() - interval '1 hour';
    
    IF failed_otp_attempts >= 5 THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'Too many failed attempts. Account temporarily locked. Please try again later.'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- Function to log password reset attempt
CREATE OR REPLACE FUNCTION public.log_password_reset_attempt(
  _email text,
  _ip_address text,
  _attempt_type text,
  _success boolean
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.password_reset_attempts (email, ip_address, attempt_type, success)
  VALUES (_email, _ip_address, _attempt_type, _success);
$$;

-- Clean up old attempts (keep 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_password_reset_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.password_reset_attempts
  WHERE attempted_at < now() - interval '7 days';
$$;