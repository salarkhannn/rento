import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});


export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PickupMethod = 'owner_delivery' | 'renter_pickup' | 'courier_supported';
export type UserMode = 'renter' | 'lender';
export type NotificationType =
    | 'booking_request'
    | 'booking_approved'
    | 'booking_rejected'
    | 'booking_cancelled'
    | 'new_message'
    | 'listing_deleted';

export interface Profile {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    push_token?: string;
    first_name?: string;
    last_name?: string;
    dob?: string;
    current_mode?: UserMode;
}

export interface Wishlist {
    id: string;
    user_id: string;
    item_id: string;
    created_at: string;
}

export interface RentalItem {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url?: string;
    location: string;
    category: string;
    owner_id: string;
    is_available?: boolean;
    created_at: string;
    updated_at: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    available_from?: string;
    available_to?: string;
    pickup_method?: PickupMethod;
    owner?: Profile;
}

export interface Booking {
    id: string;
    item_id: string;
    renter_id: string;
    start_date: string;
    end_date: string;
    status: BookingStatus;
    total_price: number;
    created_at: string;
    updated_at: string;
    message?: string;
    item?: RentalItem;
    renter?: Profile;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    icon_url?: string;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id?: string;
    title: string;
    message: string;
    type: NotificationType;
    data?: Record<string, any>;
    read?: boolean;
    created_at: string;
    updated_at: string;
}
