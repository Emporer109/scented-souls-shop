import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, User, Shield } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .regex(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'Please enter a valid email address with a proper domain'
  );

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters');

const fullNameSchema = z
  .string()
  .trim()
  .min(1, 'Full name is required')
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name must be less than 100 characters');

const phoneNumberSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number');

const Auth = () => {
  const { user, isAdmin, signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; phoneNumber?: string }>({});

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (user) {
    // If admin login was selected and user is admin, redirect to admin page
    if (loginType === 'admin' && isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const emailResult = emailSchema.safeParse(email.trim());
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin) {
      const fullNameResult = fullNameSchema.safeParse(fullName);
      if (!fullNameResult.success) {
        newErrors.fullName = fullNameResult.error.errors[0].message;
      }

      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const phoneResult = phoneNumberSchema.safeParse(cleanPhone);
      if (!phoneResult.success) {
        newErrors.phoneNumber = phoneResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully signed in',
          });
          // Redirect based on login type - the redirect will happen via useEffect when isAdmin updates
          if (loginType === 'admin') {
            // Wait a moment for isAdmin to update, then navigate
            setTimeout(() => {
              navigate('/admin');
            }, 500);
          }
        }
      } else {
        const { error } = await signUp(email, password, fullName, phoneNumber);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to Luxury Perfumes',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="inline-block">
            <span className="font-display text-3xl text-primary">Luxury</span>
            <span className="font-elegant text-2xl text-foreground ml-2">Perfumes</span>
          </a>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-xl p-8 animate-fade-in-up">
          {/* Login Type Tabs */}
          <Tabs value={loginType} onValueChange={(v) => setLoginType(v as 'user' | 'admin')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                User
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <h1 className="font-display text-2xl text-foreground text-center mb-2">
            {loginType === 'admin' ? 'Admin Login' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h1>
          <p className="font-body text-muted-foreground text-center mb-8">
            {loginType === 'admin' 
              ? 'Sign in to access admin panel' 
              : (isLogin ? 'Sign in to access your account' : 'Join our exclusive fragrance community')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && loginType === 'user' && (
              <>
                <div>
                  <Label htmlFor="fullName" className="font-body text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1.5 bg-input border-border focus:border-primary"
                    required
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="font-body text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your 10-digit phone number"
                    className="mt-1.5 bg-input border-border focus:border-primary"
                    required
                  />
                  {errors.phoneNumber && (
                    <p className="text-destructive text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="font-body text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1.5 bg-input border-border focus:border-primary"
                required
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="font-body text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1.5 bg-input border-border focus:border-primary"
                required
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loginType === 'admin' ? 'Sign In as Admin' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          {loginType === 'user' && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <span className="text-primary font-medium">
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </span>
              </button>
            </div>
          )}

          {loginType === 'admin' && (
            <p className="mt-6 text-center font-body text-sm text-muted-foreground">
              Only users with admin privileges can access the admin panel.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;