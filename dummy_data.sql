-- Dummy Data for Rento App
-- This script handles auth.users first to satisfy foreign key constraints.

-- 0. Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Insert into auth.users (Credentials: password123)
-- This allows the IDs to exist so profiles can reference them.
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES
  ('095e6e17-f718-438b-9f07-4cb899f04864', '00000000-0000-0000-0000-000000000000', 'owner@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"John","last_name":"Owner"}', now(), now(), 'authenticated', 'authenticated'),
  ('616c83eb-e56b-404e-b91a-0f3c5737be7d', '00000000-0000-0000-0000-000000000000', 'renter@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Jane","last_name":"Renter"}', now(), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Categories
INSERT INTO public.categories (name, description, icon_url)
VALUES 
  ('Electronics', 'Gadgets, cameras, and computers', 'camera'),
  ('Vehicles', 'Cars, bikes, and scooters', 'car'),
  ('Tools', 'Power tools and DIY equipment', 'wrench'),
  ('Sports', 'Outdoor and indoor sports gear', 'basketball'),
  ('Home', 'Furniture and appliances', 'home')
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Profiles
-- If you have the 'handle_new_user' trigger enabled, these might already exist.
-- ON CONFLICT handles both cases.
INSERT INTO public.profiles (id, email, name, first_name, last_name, current_mode)
VALUES 
  ('095e6e17-f718-438b-9f07-4cb899f04864', 'owner@example.com', 'John Owner', 'John', 'Owner', 'lender'),
  ('616c83eb-e56b-404e-b91a-0f3c5737be7d', 'renter@example.com', 'Jane Renter', 'Jane', 'Renter', 'renter')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Rental Items
-- We use static UUIDs here so they can be referenced by bookings and wishlist later
INSERT INTO public.rental_items (id, title, description, price, image_url, location, category, owner_id, pickup_method, latitude, longitude)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sony A7IV Camera', 'Professional mirrorless camera with 24-70mm lens.', 75.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', 'San Francisco', 'Electronics', '095e6e17-f718-438b-9f07-4cb899f04864', 'renter_pickup', 37.7749, -122.4194),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Electric Mountain Bike', 'High-performance e-bike for trail riding.', 45.00, 'https://images.unsplash.com/photo-1532298229144-0ee0c9e9ad58', 'Los Angeles', 'Sports', '095e6e17-f718-438b-9f07-4cb899f04864', 'owner_delivery', 34.0522, -118.2437),
  ('c3d4e5f6-a7b8-9012-cdef-345678901234', 'Heavy Duty Drill', 'Cordless impact drill with extra batteries.', 15.00, 'https://images.unsplash.com/photo-1504148455328-c376907d081c', 'New York', 'Tools', '095e6e17-f718-438b-9f07-4cb899f04864', 'renter_pickup', 40.7128, -74.0060)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Bookings
INSERT INTO public.bookings (item_id, renter_id, start_date, end_date, status, total_price)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '616c83eb-e56b-404e-b91a-0f3c5737be7d', CURRENT_DATE + 1, CURRENT_DATE + 3, 'PENDING', 150.00)
ON CONFLICT DO NOTHING;

-- 6. Insert Messages
INSERT INTO public.messages (sender_id, receiver_id, content)
VALUES 
  ('616c83eb-e56b-404e-b91a-0f3c5737be7d', '095e6e17-f718-438b-9f07-4cb899f04864', 'Is the camera available this weekend?'),
  ('095e6e17-f718-438b-9f07-4cb899f04864', '616c83eb-e56b-404e-b91a-0f3c5737be7d', 'Yes, it is! Feel free to send a booking request.');

-- 7. Insert Wishlist Items
INSERT INTO public.wishlist (user_id, item_id)
VALUES 
  ('616c83eb-e56b-404e-b91a-0f3c5737be7d', 'b2c3d4e5-f6a7-8901-bcde-f23456789012')
ON CONFLICT DO NOTHING;

-- 8. Insert Notifications
INSERT INTO public.notifications (user_id, title, message, type)
VALUES 
  ('095e6e17-f718-438b-9f07-4cb899f04864', 'New Booking Request', 'You have a new request for the Sony A7IV Camera', 'booking_request');
