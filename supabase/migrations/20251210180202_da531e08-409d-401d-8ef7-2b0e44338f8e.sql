-- Create table to store admin FCM tokens
CREATE TABLE public.admin_fcm_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  device_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, fcm_token)
);

-- Enable RLS
ALTER TABLE public.admin_fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can manage their own tokens
CREATE POLICY "Admins can insert their own tokens"
ON public.admin_fcm_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view their own tokens"
ON public.admin_fcm_tokens
FOR SELECT
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete their own tokens"
ON public.admin_fcm_tokens
FOR DELETE
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_admin_fcm_tokens_updated_at
BEFORE UPDATE ON public.admin_fcm_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();