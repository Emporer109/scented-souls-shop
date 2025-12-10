import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firebaseServerKey = Deno.env.get('FIREBASE_SERVER_KEY');
    if (!firebaseServerKey) {
      throw new Error('FIREBASE_SERVER_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, productTitle, quantity }: NotificationPayload = await req.json();
    console.log('Received notification request:', { userId, productTitle, quantity });

    // Fetch all admin FCM tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('admin_fcm_tokens')
      .select('fcm_token');

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No admin tokens found');
      return new Response(
        JSON.stringify({ message: 'No admin tokens registered' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending notifications to ${tokens.length} admin(s)`);

    // Send notification to each admin
    const results = await Promise.all(
      tokens.map(async ({ fcm_token }) => {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${firebaseServerKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: fcm_token,
            notification: {
              title: '🛒 New Cart Activity!',
              body: `A customer added ${quantity}x "${productTitle}" to their cart`,
              icon: '/favicon.ico',
            },
            data: {
              userId,
              productTitle,
              quantity: quantity.toString(),
              timestamp: new Date().toISOString(),
            },
          }),
        });

        const result = await response.json();
        console.log('FCM response:', result);
        return result;
      })
    );

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-cart-notification:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
