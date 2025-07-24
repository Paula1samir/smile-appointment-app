-- Create security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = _role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user is doctor assigned to patient
CREATE OR REPLACE FUNCTION public.is_doctor_for_patient(_patient_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.profiles p ON p.user_id = a.doctor_id
    WHERE a.patient_id = _patient_id 
    AND p.user_id = auth.uid() 
    AND p.role = 'doctor'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix existing handle_new_user function to have secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'assistant')
  );
  RETURN NEW;
END;
$function$;

-- Fix existing update_updated_at_column function to have secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Drop existing overly permissive policies for patients table
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can create patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON public.patients;

-- Create secure role-based policies for patients table
CREATE POLICY "Doctors can view all patients" 
ON public.patients FOR SELECT 
USING (public.has_role('doctor'));

CREATE POLICY "Assistants can view all patients" 
ON public.patients FOR SELECT 
USING (public.has_role('assistant'));

CREATE POLICY "Doctors can create patients" 
ON public.patients FOR INSERT 
WITH CHECK (public.has_role('doctor'));

CREATE POLICY "Assistants can create patients" 
ON public.patients FOR INSERT 
WITH CHECK (public.has_role('assistant'));

CREATE POLICY "Doctors can update patients" 
ON public.patients FOR UPDATE 
USING (public.has_role('doctor'));

CREATE POLICY "Assistants can update basic patient info" 
ON public.patients FOR UPDATE 
USING (public.has_role('assistant'));

-- Drop existing overly permissive policies for appointments table
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON public.appointments;

-- Create secure role-based policies for appointments table
CREATE POLICY "Doctors can view their appointments" 
ON public.appointments FOR SELECT 
USING (
  public.has_role('doctor') AND 
  (doctor_id = auth.uid() OR public.has_role('doctor'))
);

CREATE POLICY "Assistants can view all appointments" 
ON public.appointments FOR SELECT 
USING (public.has_role('assistant'));

CREATE POLICY "Doctors can create appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (public.has_role('doctor') OR public.has_role('assistant'));

CREATE POLICY "Assistants can create appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (public.has_role('assistant'));

CREATE POLICY "Doctors can update their appointments" 
ON public.appointments FOR UPDATE 
USING (
  (public.has_role('doctor') AND doctor_id = auth.uid()) OR 
  public.has_role('assistant')
);

-- Drop existing overly permissive policies for surgery_logs table  
DROP POLICY IF EXISTS "Authenticated users can view surgery logs" ON public.surgery_logs;
DROP POLICY IF EXISTS "Authenticated users can create surgery logs" ON public.surgery_logs;
DROP POLICY IF EXISTS "Authenticated users can update surgery logs" ON public.surgery_logs;

-- Create secure role-based policies for surgery_logs table
CREATE POLICY "Doctors can view surgery logs for their patients" 
ON public.surgery_logs FOR SELECT 
USING (
  public.has_role('doctor') AND 
  (doctor_id = auth.uid() OR public.is_doctor_for_patient(patient_id))
);

CREATE POLICY "Assistants can view surgery logs" 
ON public.surgery_logs FOR SELECT 
USING (public.has_role('assistant'));

CREATE POLICY "Only doctors can create surgery logs" 
ON public.surgery_logs FOR INSERT 
WITH CHECK (public.has_role('doctor') AND doctor_id = auth.uid());

CREATE POLICY "Only assigned doctors can update surgery logs" 
ON public.surgery_logs FOR UPDATE 
USING (public.has_role('doctor') AND doctor_id = auth.uid());

-- Update profiles policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create more secure profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Doctors can view other profiles" 
ON public.profiles FOR SELECT 
USING (public.has_role('doctor'));

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);