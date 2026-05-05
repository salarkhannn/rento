import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra;

export const supabaseUrl = extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

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
export type PaymentStatus = 'pending' | 'escrow' | 'released' | 'refunded';
export type PickupMethod = 'owner_delivery' | 'renter_pickup' | 'courier_supported';
export type UserMode = 'renter' | 'lender';
export type NotificationType =
    | 'booking_request'
    | 'booking_approved'
    | 'booking_rejected'
    | 'booking_cancelled'
    | 'new_message'
    | 'listing_deleted';

export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

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
    cnic_url?: string;
    verification_status?: VerificationStatus;
    is_verified?: boolean;
    verification_message?: string;
    failed_login_attempts?: number;
    locked_until?: string;
}

export interface Wishlist {
    id: string;
    user_id: string;
    item_id: string;
    created_at: string;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    sender?: Profile;
    receiver?: Profile;
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
    auto_accept?: boolean;
    late_fee_per_day?: number;
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
    payment_status?: PaymentStatus;
    check_in_photos?: string[];
    check_out_photos?: string[];
    late_fee?: number;
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

export interface Review {
    id: string;
    item_id: string;
    reviewer_id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer?: Profile;
}

export interface Wishlist {
    id: string;
    user_id: string;
    item_id: string;
    created_at: string;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}