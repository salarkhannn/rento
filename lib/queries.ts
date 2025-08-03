import { supabase, RentalItem, Booking, Profile, Category, Wishlist } from "./supabase";

// Rental Item Queries
export const getRentalItems = async (): Promise<RentalItem[]> => {
    const { data, error } = await supabase
        .from('rental_items')
        .select(`
            *,
            owner:profiles!owner_id(*)    
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const getRentalItem = async (id: string) : Promise<RentalItem | null> => {
    const { data, error } = await supabase
        .from('rental_items')
        .select(`
            *,
            owner:profiles!owner_id(*)    
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const createRentalItem = async (item: Omit<RentalItem, 'id' | 'created_at' | 'updated_at' | 'owner'>): Promise<RentalItem> => {
    const { data, error } = await supabase
        .from('rental_items')
        .insert(item)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Booking quries
export const getMyBookings = async (): Promise<Booking[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            item:rental_items!item_id(*)    
        `)
        .eq('renter_id', user.id)
        .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
};

export const getItemBookings = async (itemId: string): Promise<Booking[]> => {
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            item:rental_items!item_id(*)
        `)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const createBooking = async (booking: {
    item_id: string;
    renter_id?: string;
    start_date: string;
    end_date: string;
    total_price: number;
    message?: string;
}): Promise<Booking> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
    .from('bookings')
    .insert({
        ...booking,
        renter_id: user.id,
    })
    .select(`
        *,
        item:rental_items!item_id(*)
    `)
    .single();

    if (error) throw error;
    return data;
};

export const updateBookingStatus = async (
    bookingId: string,
    status: Booking['status']
): Promise<Booking> => {

    const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Listing bookings
export const getMyListings = async (): Promise<RentalItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('rental_items')
        .select(`
            *,
            owner:profiles!owner_id(*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}


export const getLenderBookings = async (lenderId: string): Promise<Booking[]> => {
    const { data: items, error: itemsError } = await supabase
        .from('rental_items')
        .select('id')
        .eq('owner_id', lenderId);

    if (itemsError) throw itemsError;
    if (!items || items.length === 0) return [];

    const itemIds = items.map(item => item.id);

    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(
            `
            *,
            renter:profiles!renter_id(*),
            item:rental_items!item_id(*)
        `
        )
        .in('item_id', itemIds)
        .order('created_at', { ascending: false });

    if (bookingsError) throw bookingsError;
    return bookings || [];
};


export const updateRentalItem = async (itemId: string, updates: Partial<RentalItem>) => {
    const { error } = await supabase
        .from('rental_items')
        .update(updates)
        .eq('id', itemId);

    if (error) throw error;
}

export const deleteRentalItem = async (itemId: string): Promise<void> => {
    const { error } = await supabase
        .from('rental_items')
        .delete()
        .eq('id', itemId);

    if (error) throw error;
}

// Profile queries
export const getProfile = async (): Promise<Profile |null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) throw error;
    return data;
};

export const updateProfile = async (updates: Partial<Profile>): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Wishlist queries
export const getWishlistItems = async (): Promise<RentalItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('wishlist')
        .select(`
            item:rental_items!item_id(
                *,
                owner:profiles!owner_id(*)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data?.map((w: any) => w.item).filter(Boolean) || []) as RentalItem[];
};

export const addToWishlist = async (itemId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First check if item is already in wishlist to prevent duplicates
    const { data: existing, error: checkError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .maybeSingle();

    if (checkError) throw checkError;
    
    // If item is already in wishlist, don't add it again
    if (existing) {
        return; // Already in wishlist, no need to add
    }

    const { error } = await supabase
        .from('wishlist')
        .insert({
            user_id: user.id,
            item_id: itemId
        });

    if (error) throw error;
};

export const removeFromWishlist = async (itemId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);

    if (error) throw error;
};

export const isInWishlist = async (itemId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .maybeSingle();

    if (error) {
        console.error('Error checking wishlist status:', error);
        return false;
    }
    return !!data;
};


// Category queries
export const getCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) throw error;
    return data || [];
};

// Image Upload
export const uploadImage = async (
    file: Blob,
    filename: string,
    folder: string = 'items'
): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const filePath = `${folder}/${user.id}/${filename}`;

    const { error } = await supabase.storage
        .from('rental-images')
        .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
        .from('rental-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
};