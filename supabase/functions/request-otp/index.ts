import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestOTPRequest {
  email: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: RequestOTPRequest = await req.json();

    // Validate email format
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get client IP address for rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check rate limits
    const { data: rateLimitCheck } = await supabase.rpc('check_password_reset_rate_limit', {
      _email: email.toLowerCase(),
      _ip_address: clientIp,
      _attempt_type: 'request_otp'
    });

    if (rateLimitCheck && !rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for ${email} from IP ${clientIp}`);
      return new Response(
        JSON.stringify({ error: rateLimitCheck.reason }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    const resend = new Resend(resendApiKey);

    // Check if user exists (prevent user enumeration with generic error)
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Log attempt even for non-existent users to track abuse
      await supabase.rpc('log_password_reset_attempt', {
        _email: email.toLowerCase(),
        _ip_address: clientIp,
        _attempt_type: 'request_otp',
        _success: false
      });
      
      // Use generic message to prevent user enumeration
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "If an account exists with this email, you will receive a password reset code." 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up expired OTPs
    await supabase.rpc('cleanup_expired_otps');
    
    // Invalidate any existing OTPs for this email
    await supabase
      .from('password_reset_otps')
      .update({ used: true })
      .eq('email', email.toLowerCase())
      .eq('used', false);

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('password_reset_otps')
      .insert({
        email: email.toLowerCase(),
        otp_code: otp,
        expires_at: expiryTime.toISOString(),
      });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      
      // Log failed attempt
      await supabase.rpc('log_password_reset_attempt', {
        _email: email.toLowerCase(),
        _ip_address: clientIp,
        _attempt_type: 'request_otp',
        _success: false
      });
      
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send OTP via email
    const { error: emailError } = await resend.emails.send({
      from: "DentalCare <onboarding@resend.dev>",
      to: [email],
      subject: "Password Reset OTP - DentalCare",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password for your DentalCare account. Please use the following One-Time Password (OTP) to complete the process:</p>
          
          <div style="background: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">${otp}</h1>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This OTP will expire in <strong>10 minutes</strong></li>
            <li>Do not share this code with anyone</li>
            <li>If you didn't request this password reset, please ignore this email</li>
          </ul>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>The DentalCare Team</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      
      // Log failed attempt
      await supabase.rpc('log_password_reset_attempt', {
        _email: email.toLowerCase(),
        _ip_address: clientIp,
        _attempt_type: 'request_otp',
        _success: false
      });
      
      return new Response(
        JSON.stringify({ error: "Failed to send OTP email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log successful attempt
    await supabase.rpc('log_password_reset_attempt', {
      _email: email.toLowerCase(),
      _ip_address: clientIp,
      _attempt_type: 'request_otp',
      _success: true
    });

    console.log(`OTP sent successfully to ${email} from IP ${clientIp}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "If an account exists with this email, you will receive a password reset code." 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in request-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
