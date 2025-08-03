import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting appointment reminders check...');

    // Get tomorrow's date for reminders
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Get appointments for tomorrow
    const { data: appointments, error: appointmentsError } = await supabaseClient
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        doctor_id,
        patients (
          id,
          name
        )
      `)
      .eq('appointment_date', tomorrowStr)
      .eq('status', 'scheduled');

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${appointments?.length || 0} appointments for tomorrow`);

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No appointments found for tomorrow',
          reminders_sent: 0 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    let remindersSent = 0;

    // Create reminders for each appointment
    for (const appointment of appointments) {
      try {
        console.log(`Creating reminder for appointment ${appointment.id}`);
        
        const { error: reminderError } = await supabaseClient
          .rpc('create_appointment_reminder', {
            appointment_id: appointment.id,
            user_id: appointment.doctor_id,
            patient_name: appointment.patients?.name || 'Unknown Patient',
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time
          });

        if (reminderError) {
          console.error(`Error creating reminder for appointment ${appointment.id}:`, reminderError);
        } else {
          remindersSent++;
          console.log(`Reminder created for appointment ${appointment.id}`);
        }
      } catch (error) {
        console.error(`Failed to create reminder for appointment ${appointment.id}:`, error);
      }
    }

    // Check for follow-up reminders (patients with last treatment > 30 days ago)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: followUpCandidates, error: followUpError } = await supabaseClient
      .from('surgery_logs')
      .select(`
        patient_id,
        date,
        patients (
          id,
          name
        )
      `)
      .lte('date', thirtyDaysAgoStr)
      .order('date', { ascending: false });

    if (!followUpError && followUpCandidates) {
      // Group by patient and get the most recent treatment date
      const patientLastTreatment = new Map();
      
      followUpCandidates.forEach(log => {
        if (!patientLastTreatment.has(log.patient_id)) {
          patientLastTreatment.set(log.patient_id, log);
        }
      });

      // Get all doctors for follow-up notifications
      const { data: doctors, error: doctorsError } = await supabaseClient
        .from('profiles')
        .select('user_id, full_name')
        .eq('role', 'doctor');

      if (!doctorsError && doctors) {
        for (const [patientId, lastLog] of patientLastTreatment) {
          const daysSinceTreatment = Math.floor(
            (new Date().getTime() - new Date(lastLog.date).getTime()) / (1000 * 60 * 60 * 24)
          );

          // Only send reminder if it's been exactly 30, 60, or 90 days
          if ([30, 60, 90].includes(daysSinceTreatment)) {
            for (const doctor of doctors) {
              try {
                const { error: followUpReminderError } = await supabaseClient
                  .rpc('create_followup_reminder', {
                    user_id: doctor.user_id,
                    patient_id: patientId,
                    patient_name: lastLog.patients?.name || 'Unknown Patient',
                    last_treatment_date: lastLog.date,
                    days_since_treatment: daysSinceTreatment
                  });

                if (!followUpReminderError) {
                  remindersSent++;
                  console.log(`Follow-up reminder created for patient ${patientId} to doctor ${doctor.full_name}`);
                }
              } catch (error) {
                console.error(`Failed to create follow-up reminder:`, error);
              }
            }
          }
        }
      }
    }

    console.log(`Total reminders sent: ${remindersSent}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${remindersSent} reminders`,
        reminders_sent: remindersSent 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error in appointment-reminders function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
})