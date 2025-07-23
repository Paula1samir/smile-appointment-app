-- Add foreign key constraint to link surgery_logs with patients
ALTER TABLE public.surgery_logs 
ADD CONSTRAINT surgery_logs_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(id);