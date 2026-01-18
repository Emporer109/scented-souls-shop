import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  userId: string;
  userEmail?: string;
  notifyAdmin: boolean;
  userNotification?: {
    title: string;
    body: string;
    url?: string;
  };
  adminNotification?: {
    title: string;
    body: string;
    url?: string;
  };
}

interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Simple UUID validation
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Validate and truncate notification content
function validateNotification(notification: { title: string; body: string; url?: string }): boolean {
  if (!notification.title || typeof notification.title !== 'string' || notification.title.length > 100) {
    return false;
  }
  if (!notification.body || typeof notification.body !== 'string' || notification.body.length > 500) {
    return false;
  }
  if (notification.url && (typeof notification.url !== 'string' || notification.url.length > 500)) {
    return false;
  }
  return true;
}

async function sendSimplePush(
  subscription: PushSubscriptionRecord,
  notification: { title: string; body: string; url?: string }
): Promise<boolean> {
  try {
    console.log('Attempting to send push to:', subscription.endpoint);
    
    const payload = JSON.stringify(notification);
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'TTL': '86400',
        'Content-Type': 'text/plain',
        'Urgency': 'normal',
      },
      body: payload,
    });
    
    console.log('Push response status:', response.status);
    
    if (response.status >= 200 && response.status < 300) {
      console.log('Push sent successfully');
      return true;
    } else if (response.status === 410 || response.status === 404) {
      console.log('Subscription expired or invalid');
      return false;
    } else {
      const text = await response.text();
      console.log('Push failed:', response.status, text);
      return false;
    }
  } catch (error) {
    console.error('Error sending push:', error);
    return false;
  }
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

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: PushPayload = await req.json();
    
    // Input validation
    if (!payload.userId || !isValidUUID(payload.userId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid userId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the authenticated user matches the userId in the request
    if (authenticatedUserId !== payload.userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Cannot send notifications for another user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate notification content
    if (payload.userNotification && !validateNotification(payload.userNotification)) {
      return new Response(
        JSON.stringify({ error: 'Invalid userNotification content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payload.adminNotification && !validateNotification(payload.adminNotification)) {
      return new Response(
        JSON.stringify({ error: 'Invalid adminNotification content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received push notification request:', JSON.stringify(payload));

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const results = {
      userNotificationSent: false,
      adminNotificationSent: false,
    };

    // Send notification to the user
    if (payload.userId && payload.userNotification) {
      const { data: userSubs, error: userSubsError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', payload.userId);

      if (!userSubsError && userSubs && userSubs.length > 0) {
        for (const sub of userSubs as PushSubscriptionRecord[]) {
          const sent = await sendSimplePush(sub, payload.userNotification);
          if (sent) results.userNotificationSent = true;
        }
      }
    }

    // Send notification to admins
    if (payload.notifyAdmin && payload.adminNotification) {
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        const adminIds = adminRoles.map((r: { user_id: string }) => r.user_id);
        
        const { data: adminSubs } = await supabase
          .from('push_subscriptions')
          .select('*')
          .in('user_id', adminIds);

        if (adminSubs && adminSubs.length > 0) {
          for (const sub of adminSubs as PushSubscriptionRecord[]) {
            const sent = await sendSimplePush(sub, payload.adminNotification);
            if (sent) results.adminNotificationSent = true;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error in send-push-notification:', err.message || error);
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
