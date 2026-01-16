import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';

export function PushNotificationPrompt() {
  const { user } = useAuth();
  const { isSupported, permission, requestPermission, isLoading } = usePushNotifications();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this
    const dismissed = localStorage.getItem('push-notification-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    // Show prompt after a short delay for better UX
    if (user && isSupported && permission === 'default' && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 500); // Reduced from 2000ms for faster appearance
      return () => clearTimeout(timer);
    }
  }, [user, isSupported, permission, isDismissed]);

  const handleEnable = async () => {
    await requestPermission();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('push-notification-dismissed', 'true');
  };

  if (!showPrompt || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-in-up">
      <div className="bg-card rounded-lg p-4 shadow-xl border border-primary/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-display text-foreground text-sm font-semibold mb-1">
              Enable Notifications
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Get notified about your orders and exclusive offers!
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="gold"
                onClick={handleEnable}
                disabled={isLoading}
                className="text-xs"
              >
                {isLoading ? 'Enabling...' : 'Enable'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs text-muted-foreground"
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
