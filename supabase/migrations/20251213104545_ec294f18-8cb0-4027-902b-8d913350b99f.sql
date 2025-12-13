-- Add phone_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN phone_number text;

-- Update the handle_new_user function to include phone_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone_number'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;