import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supbase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Types
export interface Profile {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
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
    created_at: string;
    updated_at: string;
    owner?: Profile;
    is_available?: boolean;
}

export interface Booking {
    id: string;
    item_id: string;
    renter_id: string;
    start_date: string;
    end_date: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    total_price: number;
    message?: string;
    created_at: string;
    updated_at: string;
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