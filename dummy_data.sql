-- Dummy Data for Rento App
-- User IDs: 095e6e17-f718-438b-9f07-4cb899f04864, 616c83eb-e56b-404e-b91a-0f3c5737be7d, e6e7ac7f-ba5f-406e-a862-2ae00e912383

-- Insert dummy profiles (if not already exists)
INSERT INTO profiles (id, email, name, phone, created_at, updated_at, current_mode)
VALUES 
  ('095e6e17-f718-438b-9f07-4cb899f04864', 'john.lender@example.com', 'John Smith', '+1234567890', NOW(), NOW(), 'lender'),
  ('616c83eb-e56b-404e-b91a-0f3c5737be7d', 'sarah.renter@example.com', 'Sarah Johnson', '+1234567891', NOW(), NOW(), 'renter'),
  ('e6e7ac7f-ba5f-406e-a862-2ae00e912383', 'mike.both@example.com', 'Mike Wilson', '+1234567892', NOW(), NOW(), 'lender')
ON CONFLICT (id) DO NOTHING;

-- Insert categories (if they don't already exist)
INSERT INTO categories (name, description, created_at)
VALUES 
  ('Electronics', 'Phones, laptops, cameras, etc.', NOW()),
  ('Vehicles', 'Cars, bikes, scooters', NOW()),
  ('Sports', 'Sports equipment and gear', NOW()),
  ('Tools', 'Power tools, hand tools, equipment', NOW()),
  ('Home & Garden', 'Furniture, appliances, garden tools', NOW()),
  ('Events', 'Party supplies, decorations', NOW()),
  ('Other', 'Miscellaneous items', NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert rental items with real images from Unsplash
INSERT INTO rental_items (id, title, description, price, image_url, location, category, owner_id, is_available, created_at, updated_at, pickup_method)
VALUES 
  -- Electronics
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
   'MacBook Pro 16" M3', 
   'Latest MacBook Pro with M3 chip, 32GB RAM, 1TB SSD. Perfect for professional work, video editing, and development. Includes charger and original box.',
   85.00,
   'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop',
   'San Francisco, CA',
   'Electronics',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   true,
   NOW() - INTERVAL '5 days',
   NOW() - INTERVAL '5 days',
   'renter_pickup'),

  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 
   'Canon EOS R5 Camera', 
   'Professional mirrorless camera with 45MP sensor. Great for photography and videography. Includes 24-70mm lens, extra batteries, and memory cards.',
   120.00,
   'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
   'Los Angeles, CA',
   'Electronics',
   'e6e7ac7f-ba5f-406e-a862-2ae00e912383',
   true,
   NOW() - INTERVAL '3 days',
   NOW() - INTERVAL '3 days',
   'owner_delivery'),

  ('c3d4e5f6-a7b8-9012-cdef-345678901234', 
   'DJI Mavic Air 2 Drone', 
   'Professional drone with 4K camera, 34-minute flight time. Perfect for aerial photography and videography. Includes controller and carrying case.',
   95.00,
   'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=600&fit=crop',
   'Austin, TX',
   'Electronics',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   true,
   NOW() - INTERVAL '7 days',
   NOW() - INTERVAL '7 days',
   'renter_pickup'),

  -- Vehicles
  ('d4e5f6a7-b8c9-0123-defa-456789012345',
   'Tesla Model 3 Performance',
   'Electric sedan with autopilot, premium interior, and supercharger access. Perfect for weekend trips or daily commuting. Fully charged and ready to go.',
   180.00,
   'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
   'Seattle, WA',
   'Vehicles',
   'e6e7ac7f-ba5f-406e-a862-2ae00e912383',
   true,
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '2 days',
   'renter_pickup'),

  ('e5f6a7b8-c9d0-1234-efab-567890123456',
   'Harley Davidson Street Glide',
   'Classic touring motorcycle with comfortable seating for two. Includes helmets, jackets, and touring bags. Perfect for scenic rides and adventures.',
   150.00,
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
   'Miami, FL',
   'Vehicles',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   true,
   NOW() - INTERVAL '4 days',
   NOW() - INTERVAL '4 days',
   'renter_pickup'),

  -- Sports Equipment
  ('f6a7b8c9-d0e1-2345-fabc-678901234567',
   'Professional Surfboard Set',
   'High-performance surfboard with wetsuit and accessories. Perfect for intermediate to advanced surfers. Includes board wax and leash.',
   75.00,
   'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
   'San Diego, CA',
   'Sports',
   'e6e7ac7f-ba5f-406e-a862-2ae00e912383',
   true,
   NOW() - INTERVAL '6 days',
   NOW() - INTERVAL '6 days',
   'renter_pickup'),

  ('a7b8c9d0-e1f2-3456-abcd-789012345678',
   'Mountain Bike - Trek Full Suspension',
   'High-end mountain bike perfect for trails and off-road adventures. Recently serviced with new tires. Includes helmet and repair kit.',
   65.00,
   'https://images.unsplash.com/photo-1544191696-15693072ea5a?w=800&h=600&fit=crop',
   'Denver, CO',
   'Sports',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   true,
   NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 day',
   'renter_pickup'),

  -- Tools
  ('b8c9d0e1-f2a3-4567-bcde-890123456789',
   'Professional Power Tool Set',
   'Complete set including drill, circular saw, reciprocating saw, and accessories. Perfect for home renovation projects. All tools are cordless.',
   55.00,
   'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&h=600&fit=crop',
   'Phoenix, AZ',
   'Tools',
   'e6e7ac7f-ba5f-406e-a862-2ae00e912383',
   true,
   NOW() - INTERVAL '8 days',
   NOW() - INTERVAL '8 days',
   'owner_delivery'),

  -- Home & Garden
  ('c9d0e1f2-a3b4-5678-cdef-901234567890',
   'Outdoor Party Tent 20x20',
   'Large waterproof tent perfect for outdoor events, weddings, and parties. Includes stakes, ropes, and setup instructions. Seats up to 40 people.',
   90.00,
   'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop',
   'Atlanta, GA',
   'Home & Garden',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   true,
   NOW() - INTERVAL '9 days',
   NOW() - INTERVAL '9 days',
   'renter_pickup'),

  -- Events
  ('d0e1f2a3-b4c5-6789-defa-012345678901',
   'DJ Equipment Package',
   'Professional DJ setup with mixer, speakers, microphones, and lighting. Perfect for parties, weddings, and events. Includes music library.',
   200.00,
   'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
   'Las Vegas, NV',
   'Events',
   'e6e7ac7f-ba5f-406e-a862-2ae00e912383',
   true,
   NOW() - INTERVAL '10 days',
   NOW() - INTERVAL '10 days',
   'owner_delivery'),

  -- Other
  ('e1f2a3b4-c5d6-7890-efab-123456789012',
   'Camping Gear Complete Set',
   'Everything you need for camping: 4-person tent, sleeping bags, camping chairs, portable stove, and cooler. Perfect for weekend getaways.',
   80.00,
   'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&h=600&fit=crop',
   'Portland, OR',
   'Other',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   true,
   NOW() - INTERVAL '11 days',
   NOW() - INTERVAL '11 days',
   'renter_pickup');

-- Insert bookings with various statuses
INSERT INTO bookings (id, item_id, renter_id, start_date, end_date, status, total_price, created_at, updated_at)
VALUES
  -- Confirmed bookings
  ('f2a3b4c5-d6e7-8901-fabc-345678901234',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   '2025-08-15',
   '2025-08-18',
   'CONFIRMED',
   255.00,
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '1 day'),

  ('a3b4c5d6-e7f8-9012-abcd-456789012345',
   'd4e5f6a7-b8c9-0123-defa-456789012345',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   '2025-08-20',
   '2025-08-22',
   'CONFIRMED',
   360.00,
   NOW() - INTERVAL '3 days',
   NOW() - INTERVAL '2 days'),

  -- Pending bookings
  ('b4c5d6e7-f8a9-0123-bcde-567890123456',
   'b2c3d4e5-f6a7-8901-bcde-f23456789012',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   '2025-08-25',
   '2025-08-27',
   'PENDING',
   240.00,
   NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 day'),

  ('c5d6e7f8-a9b0-1234-cdef-678901234567',
   'f6a7b8c9-d0e1-2345-fabc-678901234567',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   '2025-08-30',
   '2025-09-02',
   'PENDING',
   225.00,
   NOW() - INTERVAL '12 hours',
   NOW() - INTERVAL '12 hours'),

  -- Completed bookings
  ('d6e7f8a9-b0c1-2345-defa-789012345678',
   'a7b8c9d0-e1f2-3456-abcd-789012345678',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   '2025-07-28',
   '2025-07-30',
   'COMPLETED',
   130.00,
   NOW() - INTERVAL '12 days',
   NOW() - INTERVAL '10 days'),

  ('e7f8a9b0-c1d2-3456-efab-890123456789',
   'b8c9d0e1-f2a3-4567-bcde-890123456789',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   '2025-07-20',
   '2025-07-25',
   'COMPLETED',
   275.00,
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '15 days'),

  -- Cancelled booking
  ('f8a9b0c1-d2e3-4567-fabc-901234567890',
   'c3d4e5f6-a7b8-9012-cdef-345678901234',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   '2025-08-12',
   '2025-08-14',
   'CANCELLED',
   190.00,
   NOW() - INTERVAL '5 days',
   NOW() - INTERVAL '4 days');

-- Insert wishlist items
INSERT INTO wishlist (id, user_id, item_id, created_at)
VALUES
  ('a9b0c1d2-e3f4-5678-abcd-345678901234', '616c83eb-e56b-404e-b91a-0f3c5737be7d', 'd0e1f2a3-b4c5-6789-defa-012345678901', NOW() - INTERVAL '3 days'),
  ('b0c1d2e3-f4a5-6789-bcde-456789012345', '616c83eb-e56b-404e-b91a-0f3c5737be7d', 'e1f2a3b4-c5d6-7890-efab-123456789012', NOW() - INTERVAL '5 days'),
  ('c1d2e3f4-a5b6-7890-cdef-567890123456', '616c83eb-e56b-404e-b91a-0f3c5737be7d', 'c9d0e1f2-a3b4-5678-cdef-901234567890', NOW() - INTERVAL '7 days'),
  ('d2e3f4a5-b6c7-8901-defa-678901234567', 'e6e7ac7f-ba5f-406e-a862-2ae00e912383', 'a7b8c9d0-e1f2-3456-abcd-789012345678', NOW() - INTERVAL '2 days'),
  ('e3f4a5b6-c7d8-9012-efab-789012345678', 'e6e7ac7f-ba5f-406e-a862-2ae00e912383', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW() - INTERVAL '4 days');

-- Insert some messages between users
INSERT INTO messages (id, sender_id, receiver_id, content, is_read, created_at, updated_at)
VALUES
  ('f4a5b6c7-d8e9-0123-fabc-345678901234',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   'Hi! I''m interested in renting your MacBook Pro. Is it still available for August 15-18?',
   true,
   NOW() - INTERVAL '3 days',
   NOW() - INTERVAL '3 days'),

  ('a5b6c7d8-e9f0-1234-abcd-456789012345',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   'Yes, it''s available! The laptop is in excellent condition. I can meet you at a coffee shop in downtown SF for pickup.',
   true,
   NOW() - INTERVAL '3 days' + INTERVAL '2 hours',
   NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),

  ('b6c7d8e9-f0a1-2345-bcde-567890123456',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   'Perfect! That works for me. Should I bring anything specific for the pickup?',
   true,
   NOW() - INTERVAL '3 days' + INTERVAL '4 hours',
   NOW() - INTERVAL '3 days' + INTERVAL '4 hours'),

  ('c7d8e9f0-a1b2-3456-cdef-678901234567',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   'Just bring a valid ID and the security deposit. I''ll have the charger and original box ready.',
   false,
   NOW() - INTERVAL '3 days' + INTERVAL '6 hours',
   NOW() - INTERVAL '3 days' + INTERVAL '6 hours'),

  ('d8e9f0a1-b2c3-4567-defa-789012345678',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   'e6e7ac7f-ba5f-406e-a862-2ae00e912383',
   'Is your Tesla Model 3 available for a weekend trip? Looking at August 20-22.',
   true,
   NOW() - INTERVAL '4 days',
   NOW() - INTERVAL '4 days'),

  ('e9f0a1b2-c3d4-5678-efab-890123456789',
   'e6e7ac7f-ba5f-406e-a862-2ae00e912383',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   'Absolutely! The car is fully charged and ready. I can show you all the features before you take it. Where are you planning to go?',
   false,
   NOW() - INTERVAL '4 days' + INTERVAL '3 hours',
   NOW() - INTERVAL '4 days' + INTERVAL '3 hours');

-- Insert notifications
INSERT INTO notifications (id, user_id, title, message, type, data, read, created_at, updated_at)
VALUES
  ('f0a1b2c3-d4e5-6789-fabc-345678901234',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   'New Booking Request',
   'Sarah Johnson wants to book your MacBook Pro for August 15-18',
   'booking_request',
   '{"booking_id": "f2a3b4c5-d6e7-8901-fabc-345678901234", "item_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"}',
   true,
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '1 day'),

  ('a1b2c3d4-e5f6-7890-abcd-456789012345',
   '616c83eb-e56b-404e-b91a-0f3c5737be7d',
   'Booking Approved!',
   'Your booking for MacBook Pro has been approved',
   'booking_approved',
   '{"booking_id": "f2a3b4c5-d6e7-8901-fabc-345678901234", "item_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"}',
   true,
   NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 day'),

  ('b2c3d4e5-f6a7-8901-bcde-567890123456',
   'e6e7ac7f-ba5f-406e-a862-2ae00e912383',
   'New Message',
   'You have a new message from Sarah Johnson',
   'new_message',
   '{"sender_id": "616c83eb-e56b-404e-b91a-0f3c5737be7d"}',
   false,
   NOW() - INTERVAL '4 days',
   NOW() - INTERVAL '4 days'),

  ('c3d4e5f6-a7b8-9012-cdef-678901234567',
   '095e6e17-f718-438b-9f07-4cb899f04864',
   'Booking Request Pending',
   'Sarah Johnson wants to book your Mountain Bike',
   'booking_request',
   '{"booking_id": "d6e7f8a9-b0c1-2345-defa-789012345678", "item_id": "a7b8c9d0-e1f2-3456-abcd-789012345678"}',
   false,
   NOW() - INTERVAL '12 hours',
   NOW() - INTERVAL '12 hours');
