import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export type NotificationType = 
    | 'booking_request' 
    | 'booking_approved' 
    | 'booking_rejected' 
    | 'booking_cancelled' 
    | 'new_message' 
    | 'listing_deleted';

export interface NotificationData {
    booking_id?: string;
    item_id?: string;
    message_id?: string;
    user_id?: string;
    action?: 'booking_created' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled' | 'listing_deleted';
}

// Check if we're running in Expo Go
function isExpoGo(): boolean {
    return Constants.executionEnvironment === 'storeClient';
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    // Skip push notifications in Expo Go
    if (isExpoGo()) {
        console.log('Push notifications are not supported in Expo Go. Use a development build instead.');
        return null;
    }

    let token: string | null = null;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }
        
        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? 
                             Constants.easConfig?.projectId;
            
            if (!projectId) {
                console.log('No project ID found for push notifications');
                return null;
            }
            
            const expoPushToken = await Notifications.getExpoPushTokenAsync({
                projectId,
            });
            token = expoPushToken.data;
        } catch (error) {
            console.error('Error getting push token:', error);
            return null;
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function saveNotificationToken(token: string): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log('No user found when saving notification token');
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .update({ push_token: token })
            .eq('id', user.id);
        
        if (error) {
            console.error('Error saving notification token:', error);
        } else {
            console.log('Notification token saved successfully');
        }
    } catch (error) {
        console.error('Error in saveNotificationToken:', error);
    }
}

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    data?: NotificationData
): Promise<void> {
    try {
        // Always create the database notification
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                data: data || {}
            });

        if (error) {
            console.error('Error creating notification:', error);
            return;
        }

        // Send local notification for immediate feedback
        await scheduleLocalNotification(title, message, 2, data);

        // Only send push notification if not in Expo Go
        if (!isExpoGo()) {
            await sendPushNotification(userId, title, message, data);
        } else {
            console.log('Skipping push notification in Expo Go - using local notification instead');
            // Show local notification for immediate feedback in Expo Go
            await scheduleLocalNotification(title, message, 1, data);
        }
    } catch (error) {
        console.error('Error in createNotification:', error);
    }
}

export async function sendPushNotification(
    userId: string,
    title: string,
    message: string,
    data?: NotificationData
): Promise<void> {
    // Skip push notifications in Expo Go
    if (isExpoGo()) {
        console.log('Push notifications not available in Expo Go');
        return;
    }

    try {
        // Get user's push token
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('push_token')
            .eq('id', userId)
            .single();

        if (error || !profile?.push_token) {
            console.log('No push token found for user:', userId);
            return;
        }

        // Send push notification via Expo's push service
        const pushMessage = {
            to: profile.push_token,
            sound: 'default',
            title,
            body: message,
            data: data || {},
        };

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pushMessage),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Push notification sent successfully:', result);
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}

// Notification templates
export const NotificationTemplates = {
    bookingRequest: (itemTitle: string, renterName: string) => ({
        title: '🔔 New Booking Request',
        message: `${renterName} wants to rent your "${itemTitle}"`
    }),
    
    bookingApproved: (itemTitle: string, ownerName: string) => ({
        title: '✅ Booking Approved',
        message: `${ownerName} approved your booking for "${itemTitle}"`
    }),
    
    bookingRejected: (itemTitle: string, ownerName: string) => ({
        title: '❌ Booking Rejected',
        message: `${ownerName} rejected your booking for "${itemTitle}"`
    }),
    
    bookingCancelled: (itemTitle: string, userName: string) => ({
        title: '🚫 Booking Cancelled',
        message: `${userName} cancelled the booking for "${itemTitle}"`
    }),
    
    newMessage: (senderName: string) => ({
        title: '💬 New Message',
        message: `${senderName} sent you a message`
    }),
    
    listingDeleted: (itemTitle: string) => ({
        title: '🗑️ Listing Deleted',
        message: `Your booking for "${itemTitle}" was cancelled because the listing was deleted`
    })
};

// Local notification helpers
export async function scheduleLocalNotification(
    title: string, 
    body: string, 
    seconds: number = 0,
    data?: NotificationData
): Promise<void> {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
                data: data || {},
            },
            trigger: seconds > 0 ? {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds,
                repeats: false,
            } : null,
        });
    } catch (error) {
        console.error('Error scheduling local notification:', error);
    }
}

// Helper function to handle notification setup
export async function initializeNotifications(): Promise<void> {
    try {
        // Always request notification permissions for local notifications
        const { status } = await Notifications.requestPermissionsAsync();
        
        if (status !== 'granted') {
            console.log('Notification permissions not granted');
            return;
        }

        if (isExpoGo()) {
            console.log('Running in Expo Go - Push notifications disabled. Local notifications enabled.');
        } else {
            console.log('Running in development build - Initializing push notifications');
            const token = await registerForPushNotificationsAsync();
            if (token) {
                await saveNotificationToken(token);
            }
        }
    } catch (error) {
        console.error('Error initializing notifications:', error);
    }
}