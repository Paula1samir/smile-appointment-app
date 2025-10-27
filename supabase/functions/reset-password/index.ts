import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

// Validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^[0-9]{6}$/;
const PASSWORD_MIN_LENGTH = 8;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, newPassword }: ResetPasswordRequest = await req.json();

    // Validate required fields
    if (!email || !otp || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Email, OTP, and new password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate OTP format (6 digits)
    if (typeof otp !== 'string' || !OTP_REGEX.test(otp)) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate password strength
    if (typeof newPassword !== 'string' || newPassword.length < PASSWORD_MIN_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check rate limits (account lockout after too many failed attempts)
    const { data: rateLimitCheck } = await supabase.rpc('check_password_reset_rate_limit', {
      _email: email.toLowerCase(),
      _ip_address: clientIp,
      _attempt_type: 'verify_otp'
    });

    if (rateLimitCheck && !rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for password reset: ${email} from IP ${clientIp}`);
      return new Response(
        JSON.stringify({ error: rateLimitCheck.reason }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify OTP
    const { data: otpData, error: otpError } = await supabase
      .from('password_reset_otps')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('otp_code', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpData) {
      console.log(`Invalid OTP attempt for ${email} from IP ${clientIp}`);
      
      // Log failed attempt
      await supabase.rpc('log_password_reset_attempt', {
        _email: email.toLowerCase(),
        _ip_address: clientIp,
        _attempt_type: 'verify_otp',
        _success: false
      });
      
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user by email
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Log failed attempt
      await supabase.rpc('log_password_reset_attempt', {
        _email: email.toLowerCase(),
        _ip_address: clientIp,
        _attempt_type: 'verify_otp',
        _success: false
      });
      
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      
      // Log failed attempt
      await supabase.rpc('log_password_reset_attempt', {
        _email: email.toLowerCase(),
        _ip_address: clientIp,
        _attempt_type: 'verify_otp',
        _success: false
      });
      
      return new Response(
        JSON.stringify({ error: "Failed to update password" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark OTP as used
    await supabase
      .from('password_reset_otps')
      .update({ used: true })
      .eq('id', otpData.id);

    // Log successful password reset
    await supabase.rpc('log_password_reset_attempt', {
      _email: email.toLowerCase(),
      _ip_address: clientIp,
      _attempt_type: 'verify_otp',
      _success: true
    });

    // Clean up expired OTPs
    await supabase.rpc('cleanup_expired_otps');

    console.log(`Password reset successfully for ${email} from IP ${clientIp}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);