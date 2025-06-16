import { supabase, RentalItem, Booking, Profile, Category } from "./supabase";

// Rental Item Queries
export const getRentalItems = async (): Promise<RentalItem[]> => {
    const { data, error } = await supabase
        .from('rental_items')
        .select(`
            *,
            owner:profile(*)    
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
            owner:profile(*)    
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data || [];
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
            item:rental_items(*)    
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
            item:rental_items(*)
        `)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const createBooking = async (booking: {
    item_id: string;
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
        item:rental_items(*)
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

// Profile queries
export const getProfile = async (): Promise<Profile |null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profile')
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
        .from('profile')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
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