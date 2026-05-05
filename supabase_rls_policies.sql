-- 1. Enable Row Level Security on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy: Allow users to view their own profile
-- This is necessary for getProfile() to work
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 3. Create Policy: Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Create Policy: Allow the service role/trigger to insert profiles
-- (Needed if you are using the handle_new_user trigger)
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
CREATE POLICY "System can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- 5. Fix for existing users (Run this if you are already logged in)
-- Replace the values below with your actual data from the Supabase Auth tab
-- INSERT INTO public.profiles (id, email, name, first_name, last_name)
-- VALUES ('YOUR_ACTUAL_USER_ID_HERE', 'your@email.com', 'Your Name', 'First', 'Last')
-- ON CONFLICT (id) DO NOTHING;
