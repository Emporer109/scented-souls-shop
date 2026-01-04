import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
  productTitle: string;
  quantity: number;
  price: number;
}

interface UserNotificationPayload {
  userEmail: string;
  userName: string;
  cartItems: CartItem[];
  totalPrice: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(resendApiKey);
    const { userEmail, userName, cartItems, totalPrice }: UserNotificationPayload = await req.json();
    
    console.log('Sending checkout confirmation to user:', { userEmail, userName, totalPrice });

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Build items list HTML
    const itemsHtml = cartItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${item.productTitle}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827; text-align: right;">₹${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: 'Luxury Perfumes <onboarding@resend.dev>',
      to: [userEmail],
      subject: `🎉 Order Confirmed - Thank You for Shopping with Us!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
          <div style="background: linear-gradient(135deg, #c9a227 0%, #daa520 100%); padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Order!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your order has been successfully placed</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Dear <strong>${userName}</strong>,
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              We're thrilled to confirm your order from Luxury Perfumes. Here's a summary of your purchase:
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; color: #374151; font-weight: 600;">Product</th>
                    <th style="padding: 12px; text-align: center; color: #374151; font-weight: 600;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: linear-gradient(135deg, #c9a227 0%, #daa520 100%);">
                    <td colspan="2" style="padding: 15px; color: white; font-weight: bold; font-size: 16px;">Total Amount</td>
                    <td style="padding: 15px; color: white; font-weight: bold; text-align: right; font-size: 16px;">₹${totalPrice.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>📞 What's Next?</strong><br>
                Our team will contact you shortly to confirm your order and arrange delivery.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
              <strong>Order Date:</strong> ${timestamp}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Thank you for choosing Luxury Perfumes!<br>
              If you have any questions, please contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              © 2024 Luxury Perfumes. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    console.log('User confirmation email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending user notification:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});