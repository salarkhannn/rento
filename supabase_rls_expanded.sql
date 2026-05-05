-- 1. CATEGORIES (Publicly readable)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for categories" ON public.categories;
CREATE POLICY "Allow public read access for categories" ON public.categories FOR SELECT USING (true);

-- 2. RENTAL ITEMS (Publicly readable)
ALTER TABLE public.rental_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for rental items" ON public.rental_items;
CREATE POLICY "Allow public read access for rental items" ON public.rental_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow owners to manage items" ON public.rental_items;
CREATE POLICY "Allow owners to manage items" ON public.rental_items FOR ALL USING (auth.uid() = owner_id);

-- 3. BOOKINGS (Renter or Owner only)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT 
USING (auth.uid() = renter_id OR auth.uid() IN (SELECT owner_id FROM rental_items WHERE id = item_id));
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
CREATE POLICY "Users can create their own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = renter_id);

-- 4. MESSAGES (Sender or Receiver only)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 5. WISHLIST (User only)
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlist;
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- 6. NOTIFICATIONS (User only)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
