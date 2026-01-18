import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
  productTitle: string;
  quantity: number;
  price: number;
}

interface CheckoutPayload {
  userId: string;
  cartItems: CartItem[];
  totalPrice: number;
}

// Simple UUID validation
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Sanitize string for HTML (prevent XSS in emails)
function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify the user's JWT using getUser
    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: userError } = await authSupabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authenticatedUserId = user.id;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL is not configured');
    }

    const resend = new Resend(resendApiKey);
    const payload = await req.json();

    // Input validation
    const { userId, cartItems, totalPrice }: CheckoutPayload = payload;

    if (!userId || !isValidUUID(userId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid userId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the authenticated user matches the userId in the request
    if (authenticatedUserId !== userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Cannot checkout for another user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid cartItems: must be array with 1-50 items' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each cart item
    for (const item of cartItems) {
      if (!item.productTitle || typeof item.productTitle !== 'string' || item.productTitle.length > 200) {
        return new Response(
          JSON.stringify({ error: 'Invalid product title' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return new Response(
          JSON.stringify({ error: 'Invalid quantity' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (typeof item.price !== 'number' || item.price <= 0 || item.price > 1000000) {
        return new Response(
          JSON.stringify({ error: 'Invalid price' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (typeof totalPrice !== 'number' || totalPrice <= 0 || totalPrice > 10000000) {
      return new Response(
        JSON.stringify({ error: 'Invalid totalPrice' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing checkout notification:', { userId, itemCount: cartItems.length, totalPrice });

    // Use service key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, phone_number')
      .eq('id', userId)
      .maybeSingle();

    const customerName = sanitizeHtml(profile?.full_name || 'A customer');
    const customerEmail = sanitizeHtml(profile?.email || 'Unknown');
    const customerPhone = sanitizeHtml(profile?.phone_number || 'Not provided');
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Build items list HTML with sanitized content
    const itemsHtml = cartItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${sanitizeHtml(item.productTitle)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827; text-align: right;">₹${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: 'Order Notifications <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `🎉 New Order from ${customerName} - ₹${totalPrice.toFixed(2)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #c9a227 0%, #daa520 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New Order Received!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              <strong>${customerName}</strong> has completed a checkout.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">Customer Details</h3>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Name:</strong> ${customerName}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> ${customerEmail}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Phone:</strong> ${customerPhone}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Time:</strong> ${timestamp}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 10px; text-align: left; color: #374151;">Product</th>
                    <th style="padding: 10px; text-align: center; color: #374151;">Qty</th>
                    <th style="padding: 10px; text-align: right; color: #374151;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: #c9a227;">
                    <td colspan="2" style="padding: 15px; color: white; font-weight: bold;">Total</td>
                    <td style="padding: 15px; color: white; font-weight: bold; text-align: right;">₹${totalPrice.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
              This is an automated notification from Luxury Perfumes.
            </p>
          </div>
        </div>
      `,
    });

    console.log('Checkout email sent successfully:', emailResponse);

    // Clear the cart after successful checkout
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error clearing cart:', deleteError);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing checkout:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
