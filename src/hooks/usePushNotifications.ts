import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (isSupported && user) {
      registerServiceWorker();
    }
  }, [isSupported, user]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    setIsLoading(true);
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await subscribeToPush();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user]);

  const subscribeToPush = async () => {
    if (!user || !VAPID_PUBLIC_KEY) {
      console.warn('User not logged in or VAPID key not configured');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
      
      setSubscription(pushSubscription);
      
      // Save to database
      const subscriptionJSON = pushSubscription.toJSON();
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionJSON.endpoint!,
          p256dh: subscriptionJSON.keys!.p256dh,
          auth: subscriptionJSON.keys!.auth,
        }, {
          onConflict: 'user_id,endpoint'
        });
      
      if (error) {
        console.error('Error saving subscription:', error);
        throw error;
      }
      
      console.log('Push subscription saved successfully');
      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  };

  const unsubscribe = useCallback(async () => {
    if (!subscription || !user) return;
    
    setIsLoading(true);
    
    try {
      await subscription.unsubscribe();
      
      // Remove from database
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);
      
      setSubscription(null);
    } catch (error) {
      console.error('Error unsubscribing:', error);
    } finally {
      setIsLoading(false);
    }
  }, [subscription, user]);

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    unsubscribe,
  };
}
