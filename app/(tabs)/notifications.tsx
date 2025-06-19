import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { 
    getUserNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification,
    Notification 
} from '@/lib/notificationQueries';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await getUserNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
            Alert.alert('Error', 'Failed to load notifications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications();
    };

    const handleNotificationPress = async (notification: Notification) => {
        if (!notification.read) {
            await markNotificationAsRead(notification.id);
            setNotifications(prev => 
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            );
        }

        // Navigate based on notification type
        switch (notification.type) {
            case 'booking_request':
                if (notification.data.item_id) {
                    router.push(`/manage-listing/${notification.data.item_id}`);
                }
                break;
            case 'booking_approved':
            case 'booking_rejected':
            case 'booking_cancelled':
                router.push('/bookings');
                break;
            default:
                break;
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            Alert.alert('Error', 'Failed to mark notifications as read');
        }
    };

    const handleDeleteNotification = async (notificationId: string) => {
        try {
            await deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            Alert.alert('Error', 'Failed to delete notification');
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.notificationCard,
                !item.read && styles.unreadNotification
            ]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.notificationContent}>
                <Text style={[styles.title, !item.read && styles.unreadText]}>
                    {item.title}
                </Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.timestamp}>
                    {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString()}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNotification(item.id)}
            >
                <Text style={styles.deleteButtonText}>✕</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading notifications...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {notifications.some(n => !n.read) && (
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Text style={styles.markAllButton}>Mark all as read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    markAllButton: {
        color: '#2f95dc',
        fontSize: 14,
        fontWeight: '600',
    },
    notificationCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 4,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: '#2f95dc',
        backgroundColor: '#f8f9ff',
    },
    notificationContent: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    unreadText: {
        color: '#000',
        fontWeight: 'bold',
    },
    message: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    deleteButtonText: {
        color: '#999',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});