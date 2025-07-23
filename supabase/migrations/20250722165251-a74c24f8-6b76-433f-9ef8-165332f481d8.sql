-- Add foreign key constraint to link surgery_logs with profiles
ALTER TABLE public.surgery_logs 
ADD CONSTRAINT surgery_logs_doctor_id_fkey 
FOREIGN KEY (doctor_id) REFERENCES public.profiles(user_id);