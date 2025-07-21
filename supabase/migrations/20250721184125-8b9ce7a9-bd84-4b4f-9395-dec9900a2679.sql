-- Create surgery_logs table for tracking treatment history
CREATE TABLE public.surgery_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    date DATE NOT NULL,
    tooth_number TEXT NOT NULL,
    treatment_performed TEXT NOT NULL,
    doctor_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.surgery_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for surgery_logs
CREATE POLICY "Authenticated users can view surgery logs" 
ON public.surgery_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create surgery logs" 
ON public.surgery_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update surgery logs" 
ON public.surgery_logs 
FOR UPDATE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_surgery_logs_updated_at
BEFORE UPDATE ON public.surgery_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();