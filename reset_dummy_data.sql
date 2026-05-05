-- 1. CLEANUP: Delete existing data to start fresh
DELETE FROM public.notifications;
DELETE FROM public.wishlist;
DELETE FROM public.messages;
DELETE FROM public.bookings;
DELETE FROM public.rental_items;

-- 2. CATEGORIES
INSERT INTO public.categories (name, description, icon_url)
VALUES 
  ('Electronics', 'Gadgets, cameras, and computers', 'camera'),
  ('Vehicles', 'Cars, bikes, and scooters', 'car'),
  ('Tools', 'Power tools and DIY equipment', 'wrench'),
  ('Sports', 'Outdoor and indoor sports gear', 'basketball'),
  ('Home', 'Furniture and appliances', 'home')
ON CONFLICT (name) DO NOTHING;

-- 3. RENTAL ITEMS (Owned by Ace: 0c72bc33-ffb9-473a-b47e-075e58788f5f)
INSERT INTO public.rental_items (id, title, description, price, image_url, location, category, owner_id, pickup_method, latitude, longitude, is_available)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sony A7IV Camera', 'Professional mirrorless camera with 24-70mm lens.', 75.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', 'San Francisco', 'Electronics', '0c72bc33-ffb9-473a-b47e-075e58788f5f', 'renter_pickup', 37.7749, -122.4194, true),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Electric Mountain Bike', 'High-performance e-bike for trail riding.', 45.00, 'https://images.unsplash.com/photo-1532298229144-0ee0c9e9ad58', 'Los Angeles', 'Sports', '0c72bc33-ffb9-473a-b47e-075e58788f5f', 'owner_delivery', 34.0522, -118.2437, true),
  ('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Heavy Duty Drill', 'Cordless impact drill with extra batteries.', 15.00, 'https://images.unsplash.com/photo-1504148455328-c376907d081c', 'New York', 'Tools', '0c72bc33-ffb9-473a-b47e-075e58788f5f', 'renter_pickup', 40.7128, -74.0060, true);

-- 4. BOOKINGS (Renter: Salar: 0da0e65f-96fe-4d71-9b31-222ceb8cc386)
INSERT INTO public.bookings (id, item_id, renter_id, start_date, end_date, status, total_price)
VALUES 
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '0da0e65f-96fe-4d71-9b31-222ceb8cc386', CURRENT_DATE + 2, CURRENT_DATE + 5, 'PENDING', 225.00),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-345678901234', '0da0e65f-96fe-4d71-9b31-222ceb8cc386', CURRENT_DATE - 10, CURRENT_DATE - 8, 'COMPLETED', 30.00);

-- 5. WISHLIST (Salar: 0da0e65f-96fe-4d71-9b31-222ceb8cc386)
INSERT INTO public.wishlist (user_id, item_id)
VALUES 
  ('0da0e65f-96fe-4d71-9b31-222ceb8cc386', 'b2c3d4e5-f6a7-8901-bcde-f23456789012');

-- 6. MESSAGES
INSERT INTO public.messages (sender_id, receiver_id, content)
VALUES 
  ('0da0e65f-96fe-4d71-9b31-222ceb8cc386', '0c72bc33-ffb9-473a-b47e-075e58788f5f', 'Hey Ace! Is the Sony A7IV available for next week?'),
  ('0c72bc33-ffb9-473a-b47e-075e58788f5f', '0da0e65f-96fe-4d71-9b31-222ceb8cc386', 'Hey Salar! Yes it is. Feel free to book it through the app.');

-- 7. NOTIFICATIONS
INSERT INTO public.notifications (user_id, title, message, type)
VALUES 
  ('0c72bc33-ffb9-473a-b47e-075e58788f5f', 'New Booking Request', 'Salar sent a request for your Sony A7IV Camera', 'booking_request');
