import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { getConversations, getUnreadMessageCount } from '@/lib/queries';
import { Message } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import { ConditionalAuthGuard } from '@/components/ConditionalAuthGuard';

export default function MessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread'>('All');

  useEffect(() => {
    if (user) {
      loadConversations();
      loadUnreadCount();
    } else {
      // Clear data when user signs out
      setConversations([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await getUnreadMessageCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    await loadUnreadCount();
  };

  const getOtherUser = (message: Message) => {
    return message.sender_id === user?.id ? message.receiver : message.sender;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const openConversation = (message: Message) => {
    const otherUser = getOtherUser(message);
    console.log('Opening conversation with message:', message.id);
    console.log('Other user object:', JSON.stringify(otherUser, null, 2));
    
    if (otherUser) {
      const userName = otherUser.name || 
                      (otherUser.first_name ? `${otherUser.first_name} ${otherUser.last_name || ''}` : null) || 
                      otherUser.email?.split('@')[0] || 
                      'User';
      
      console.log(`Navigating to /conversation/${otherUser.id} with name ${userName}`);
      router.push(`/conversation/${otherUser.id}?name=${encodeURIComponent(userName)}`);
    } else {
      console.error('Cannot open conversation: otherUser is null');
      Alert.alert('Error', 'Could not identify the other user in this conversation.');
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (activeFilter === 'Unread') {
      return !conversation.is_read && conversation.receiver_id === user?.id;
    }
    return true;
  });

  const renderConversationItem = ({ item }: { item: Message }) => {
    const otherUser = getOtherUser(item);
    const isUnread = !item.is_read && item.receiver_id === user?.id;
    
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => openConversation(item)}
      >
        <View style={styles.avatarContainer}>
          {otherUser?.avatar_url ? (
            <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.userName}>
              {otherUser?.name || 
               (otherUser?.first_name ? `${otherUser.first_name} ${otherUser.last_name || ''}` : null) || 
               otherUser?.email?.split('@')[0] || 
               'User'}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(item.created_at)}
            </Text>
          </View>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.content}
          </Text>
        </View>
        
        {isUnread && <View style={styles.unreadDot} testID="unread-dot" />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </View>
    );
  }

  return (
    <ConditionalAuthGuard 
      requireAuth={true} 
      message="Please sign in to view your messages."
    >
      <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'All' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('All')}
        >
          <Text style={[styles.filterText, activeFilter === 'All' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'Unread' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('Unread')}
        >
          <Text style={[styles.filterText, activeFilter === 'Unread' && styles.activeFilterText]}>
            Unread
          </Text>
        </TouchableOpacity>
      </View>

      {filteredConversations.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={Colors.text.disabled} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Start a conversation by contacting item owners
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          testID="flat-list"
        />
      )}
    </View>
    </ConditionalAuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background.primary,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
  },
  activeFilterButton: {
    backgroundColor: Colors.brand.primary,
  },
  filterText: {
    ...typography.footnoteRegular,
    color: Colors.text.secondary,
  },
  activeFilterText: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    ...typography.title3Emphasized,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  defaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.calloutEmphasized,
    color: Colors.text.secondary,
  },
  messageContent: {
    flex: 1,
    marginRight: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    ...typography.calloutEmphasized,
    color: Colors.text.primary,
    flex: 1,
  },
  timestamp: {
    ...typography.caption1Regular,
    color: Colors.text.tertiary,
  },
  messageText: {
    ...typography.footnoteRegular,
    color: Colors.text.secondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.primary,
  },
});
