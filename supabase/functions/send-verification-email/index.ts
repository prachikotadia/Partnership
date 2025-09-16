import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code, type, template } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Send email using Resend (you can replace with your preferred email service)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Partnership App <noreply@yourdomain.com>',
        to: [email],
        subject: getEmailSubject(type),
        html: template,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error(`Email service error: ${emailResponse.statusText}`)
    }

    const emailData = await emailResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: emailData.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to send email',
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function getEmailSubject(type: string): string {
  const subjects = {
    login: 'Your Login Verification Code',
    register: 'Welcome! Verify Your Email Address',
    password_reset: 'Reset Your Password',
    two_factor: 'Two-Factor Authentication Code'
  }
  return subjects[type] || 'Verification Code'
}
