import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  userId: string;
  productTitle: string;
  quantity: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL is not configured');
    }

    const resend = new Resend(resendApiKey);
    const { userId, productTitle, quantity }: NotificationPayload = await req.json();
    
    console.log('Sending email notification:', { userId, productTitle, quantity });

    // Get user info
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .maybeSingle();

    const customerName = profile?.full_name || 'A customer';
    const customerEmail = profile?.email || 'Unknown';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const emailResponse = await resend.emails.send({
      from: 'Cart Notifications <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `🛒 New Cart Activity - ${productTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🛒 New Cart Activity!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              <strong>${customerName}</strong> added an item to their cart.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Product:</td>
                  <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${productTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Quantity:</td>
                  <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${quantity}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Customer Email:</td>
                  <td style="padding: 10px 0; color: #111827; font-size: 14px;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Time:</td>
                  <td style="padding: 10px 0; color: #111827; font-size: 14px;">${timestamp}</td>
                </tr>
              </table>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
              This is an automated notification from your store.
            </p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending email notification:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
