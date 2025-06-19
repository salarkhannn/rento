import { supabase } from './supabase';
import { createNotification, NotificationTemplates, NotificationType, NotificationData } from './notifications';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    data: NotificationData;
    read: boolean;
    created_at: string;
    updated_at: string;
}

// Get user notifications
export async function getUserNotifications(limit: number = 50): Promise<Notification[]> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log('No authenticated user found');
            return [];
        }

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getUserNotifications:', error);
        throw error;
    }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ 
                read: true, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', notificationId);

        if (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in markNotificationAsRead:', error);
        throw error;
    }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('Not authenticated');
        }

        const { error } = await supabase
            .from('notifications')
            .update({ 
                read: true, 
                updated_at: new Date().toISOString() 
            })
            .eq('user_id', user.id)
            .eq('read', false);

        if (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in markAllNotificationsAsRead:', error);
        throw error;
    }
}

// Get unread notification count
export async function getUnreadNotificationCount(): Promise<number> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return 0;
        }

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('read', false);

        if (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Error in getUnreadNotificationCount:', error);
        return 0;
    }
}

// Delete notification
export async function deleteNotification(notificationId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteNotification:', error);
        throw error;
    }
}

// Notification event handlers
export async function handleBookingRequest(bookingId: string, itemId: string, renterId: string): Promise<void> {
    try {
        console.log('handleBookingRequest called with:', { bookingId, itemId, renterId });

        // Validate inputs
        if (!bookingId || !itemId || !renterId) {
            console.error('Missing required parameters for handleBookingRequest:', { bookingId, itemId, renterId });
            return;
        }

        // Get item details and owner info separately for better error handling
        const { data: item, error: itemError } = await supabase
            .from('rental_items')
            .select(`
                id,
                title,
                owner_id,
                owner:profiles!rental_items_owner_id_fkey (
                    id,
                    name
                )
            `)
            .eq('id', itemId)
            .single();

        if (itemError) {
            console.error('Error fetching item for notification:', itemError);
            return;
        }

        if (!item) {
            console.error('Item not found for notification:', itemId);
            return;
        }

        console.log('Item fetched:', item);

        // Check if owner data exists
        if (!item.owner_id) {
            console.error('Owner not found for item:', itemId);
            return;
        }

        // Get renter info
        const { data: renter, error: renterError } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('id', renterId)
            .single();

        if (renterError) {
            console.error('Error fetching renter for notification:', renterError);
            return;
        }

        if (!renter) {
            console.error('Renter not found for notification:', renterId);
            return;
        }

        console.log('Renter fetched:', renter);

        // Create notification for the item owner
        const template = NotificationTemplates.bookingRequest(
            item.title, 
            renter.name || 'Someone'
        );

        console.log('Creating notification for owner:', item.owner_id);

        await createNotification(
            item.owner_id,
            template.title,
            template.message,
            'booking_request',
            {
                booking_id: bookingId,
                item_id: itemId,
                user_id: renterId
            }
        );

        console.log('Booking request notification sent successfully');
    } catch (error) {
        console.error('Error handling booking request notification:', error);
        console.error('Error details:', {
            bookingId,
            itemId,
            renterId,
            error: error
        });
    }
}

export async function handleBookingStatusChange(bookingId: string, status: string): Promise<void> {
    try {
        console.log('handleBookingStatusChange called with:', { bookingId, status });

        // Get booking with proper error handling
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select(`*`)
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) {
            console.error('Error fetching booking details:', bookingError);
            return;
        }

        console.log('Booking found:', booking);

        // Get item details
        const { data: item, error: itemError } = await supabase
            .from('rental_items')
            .select('id, title, owner_id')
            .eq('id', booking.item_id)
            .single();

        if (itemError || !item) {
            console.error('Error fetching item details:', itemError);
            return;
        }

        // Get owner info
        const { data: owner, error: ownerError } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('id', item.owner_id)
            .maybeSingle();

        if (ownerError || !owner) {
            console.error('Error fetching owner details:', ownerError);
            return;
        }

        // Get renter info
        console.log('Fetching renter details for booking:', booking.renter_id);
        const { data: renter, error: renterError } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('id', booking.renter_id)
            .maybeSingle();

        if (renterError || !renter) {
            console.error('Renter not found for booking:', booking.renter_id);
            console.error('Error fetching renter details:', renterError);
            return;
        }

                // Use fallback names in case a profile is missing
        const ownerName = owner?.name || 'The Owner';
        const renterName = renter?.name || 'A Renter';

        if (renterError) {
            console.error('Error fetching renter details:', renterError);
        }
        if (ownerError) {
            console.error('Error fetching owner details:', ownerError);
        }

        console.log('All data fetched successfully');

        let template;
        let notificationType: NotificationType;
        let targetUserId: string;

        switch (status) {
            case 'CONFIRMED':
                template = NotificationTemplates.bookingApproved(
                    item.title,
                    ownerName
                );
                notificationType = 'booking_approved';
                targetUserId = booking.renter_id;
                break;
            case 'CANCELLED':
                // Correctly determine who is cancelling by checking the current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    console.error('Could not determine current user for cancellation notification.');
                    return;
                }

                if (user.id === item.owner_id) {
                    // Owner is rejecting the booking
                    console.log('Booking rejected by owner');
                    template = NotificationTemplates.bookingRejected(
                        item.title,
                        ownerName
                    );
                    notificationType = 'booking_rejected';
                    targetUserId = booking.renter_id; // Notify the renter
                } else if (user.id === booking.renter_id) {
                    // Renter is cancelling the booking
                    console.log('Booking cancelled by renter');
                    template = NotificationTemplates.bookingCancelled(
                        item.title,
                        renterName
                    );
                    notificationType = 'booking_cancelled';
                    targetUserId = item.owner_id; // Notify the owner
                } else {
                    console.error('User performing cancellation is neither the owner nor the renter.');
                    return;
                }
                break;
            default:
                console.log('Unknown booking status:', status);
                return;
        }

        console.log('Creating notification for user:', targetUserId);

        await createNotification(
            targetUserId,
            template.title,
            template.message,
            notificationType,
            { booking_id: bookingId, item_id: booking.item_id }
        );

        console.log('Booking status change notification sent successfully');
    } catch (error) {
        console.error('Error handling booking status change notification:', error);
    }
}

export async function handleListingDeletion(itemId: string): Promise<void> {
    try {
        // Get all active bookings for this item
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                item:rental_items(title),
                renter:profiles(*)
            `)
            .eq('item_id', itemId)
            .in('status', ['PENDING', 'CONFIRMED']);

        if (error) {
            console.error('Error fetching bookings for deleted listing:', error);
            return;
        }

        // Notify all affected renters
        for (const booking of bookings || []) {
            const template = NotificationTemplates.listingDeleted(booking.item.title);
            
            await createNotification(
                booking.renter_id,
                template.title,
                template.message,
                'listing_deleted',
                { item_id: itemId, booking_id: booking.id }
            );
        }
    } catch (error) {
        console.error('Error handling listing deletion notifications:', error);
    }
}