-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'error', 'appointment', 'reminder'
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB, -- Additional data like appointment_id, patient_id etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create internal messages table
CREATE TABLE public.internal_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  patient_id UUID, -- Optional reference to patient
  appointment_id UUID, -- Optional reference to appointment
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Internal messages policies
CREATE POLICY "Users can view their messages" 
ON public.internal_messages 
FOR SELECT 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send messages" 
ON public.internal_messages 
FOR INSERT 
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their received messages" 
ON public.internal_messages 
FOR UPDATE 
USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internal_messages_updated_at
BEFORE UPDATE ON public.internal_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create appointment reminders
CREATE OR REPLACE FUNCTION public.create_appointment_reminder(
  appointment_id UUID,
  user_id UUID,
  patient_name TEXT,
  appointment_date DATE,
  appointment_time TIME
) 
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    data
  ) VALUES (
    user_id,
    'Upcoming Appointment Reminder',
    'You have an appointment with ' || patient_name || ' scheduled for ' || appointment_date || ' at ' || appointment_time,
    'appointment',
    jsonb_build_object(
      'appointment_id', appointment_id,
      'patient_name', patient_name,
      'appointment_date', appointment_date,
      'appointment_time', appointment_time
    )
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create function to create follow-up reminders
CREATE OR REPLACE FUNCTION public.create_followup_reminder(
  user_id UUID,
  patient_id UUID,
  patient_name TEXT,
  last_treatment_date DATE,
  days_since_treatment INTEGER
) 
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    data
  ) VALUES (
    user_id,
    'Follow-up Reminder',
    'Patient ' || patient_name || ' may need follow-up care. Last treatment was ' || days_since_treatment || ' days ago on ' || last_treatment_date,
    'reminder',
    jsonb_build_object(
      'patient_id', patient_id,
      'patient_name', patient_name,
      'last_treatment_date', last_treatment_date,
      'days_since_treatment', days_since_treatment
    )
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;