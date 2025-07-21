/*
  # Add age column to surgery_logs table

  1. Changes
    - Add `age` column to `surgery_logs` table to store patient age at time of treatment
    - Set default value and make it nullable for backward compatibility

  2. Security
    - No changes to RLS policies needed
*/

-- Add age column to surgery_logs table
ALTER TABLE public.surgery_logs 
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Add comment to document the column
COMMENT ON COLUMN public.surgery_logs.age IS 'Patient age at the time of treatment';