import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, User, Mail, Phone, Save, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone_number')
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      setFullName(data?.full_name || '');
      setPhoneNumber(data?.phone_number || '');
      setEmail(data?.email || user?.email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setEmail(user?.email || '');
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

  const handleSave = async () => {
    if (!user) return;

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone_number: phoneNumber || null })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter your 10-digit phone number"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                10-digit phone number for order notifications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed from here
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
