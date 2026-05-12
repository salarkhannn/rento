import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { getPendingVerifications, updateVerificationStatus } from '@/lib/queries';
import { Profile } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import Button from '@/ui/components/Button';
import { router } from 'expo-router';

export default function VerificationQueueScreen() {
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const data = await getPendingVerifications();
      setPendingUsers(data);
    } catch (error) {
      console.error('Error loading verification queue:', error);
      Alert.alert('Error', 'Failed to load verification queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadQueue();
  };

  const handleApprove = async (user: Profile) => {
    Alert.alert(
      'Approve Verification',
      `Are you sure you want to approve ${user.name || user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: async () => {
            setProcessing(true);
            try {
              await updateVerificationStatus(user.id, 'verified');
              Alert.alert('Success', 'User verified successfully');
              loadQueue();
              setSelectedUser(null);
            } catch (error) {
              console.error('Error approving user:', error);
              Alert.alert('Error', 'Failed to approve user');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      await updateVerificationStatus(selectedUser.id, 'rejected', rejectReason.trim());
      Alert.alert('Success', 'Verification rejected');
      setRejectModalVisible(false);
      setRejectReason('');
      setSelectedUser(null);
      loadQueue();
    } catch (error) {
      console.error('Error rejecting user:', error);
      Alert.alert('Error', 'Failed to reject user');
    } finally {
      setProcessing(false);
    }
  };

  const renderItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => setSelectedUser(item)}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.userName}>{item.name || 'No Name'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
      </View>
      <Text style={styles.date}>Submitted: {new Date(item.updated_at || item.created_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingUsers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color={Colors.text.disabled} />
            <Text style={styles.emptyText}>Queue is empty!</Text>
            <Text style={styles.emptySubtext}>All pending verifications have been processed.</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={!!selectedUser && !rejectModalVisible}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedUser(null)} hitSlop={8}>
              <Ionicons name="close" size={28} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Review Verification</Text>
            <View style={{ width: 28 }} />
          </View>

          {selectedUser && (
            <View style={styles.modalContent}>
              <View style={styles.userInfoSection}>
                <Text style={styles.sectionTitle}>User Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{selectedUser.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{selectedUser.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>DOB:</Text>
                  <Text style={styles.infoValue}>{selectedUser.dob || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.idSection}>
                <Text style={styles.sectionTitle}>Government ID</Text>
                {selectedUser.cnic_url ? (
                  <Image 
                    source={{ uri: selectedUser.cnic_url }} 
                    style={styles.idImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.noImage}>
                    <Text>No ID image uploaded</Text>
                  </View>
                )}
              </View>

              <View style={styles.actions}>
                <Button 
                  title="Approve" 
                  onPress={() => handleApprove(selectedUser)}
                  variant="filled"
                  color="colored"
                  style={styles.actionButton}
                  disabled={processing}
                />
                <Button 
                  title="Reject" 
                  onPress={() => setRejectModalVisible(true)}
                  variant="outline"
                  color="colored"
                  style={[styles.actionButton, styles.rejectButton]}
                  disabled={processing}
                />
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        visible={rejectModalVisible}
        animationType="fade"
        transparent={true}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Rejection Reason</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., ID image is blurry, Name mismatch"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogAction}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogAction, styles.confirmAction]}
                onPress={handleReject}
                disabled={processing}
              >
                <Text style={styles.confirmText}>{processing ? 'Processing...' : 'Confirm Reject'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    ...typography.bodyEmphasized,
  },
  userEmail: {
    ...typography.caption1Regular,
    color: Colors.text.secondary,
  },
  date: {
    ...typography.caption2Regular,
    color: Colors.text.tertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...typography.title3Emphasized,
    marginTop: 16,
    color: Colors.text.secondary,
  },
  emptySubtext: {
    ...typography.bodyRegular,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    ...typography.title3Emphasized,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    ...typography.headlineMedium,
    marginBottom: 12,
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    ...typography.bodyEmphasized,
    color: Colors.text.secondary,
  },
  infoValue: {
    flex: 1,
    ...typography.bodyRegular,
  },
  idSection: {
    flex: 1,
    marginTop: 20,
  },
  idImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  noImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 40,
  },
  actionButton: {
    flex: 1,
  },
  rejectButton: {
    borderColor: '#ff3b30',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  dialogTitle: {
    ...typography.headlineEmphasized,
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  dialogAction: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    ...typography.bodyEmphasized,
    color: Colors.text.secondary,
  },
  confirmAction: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
  },
  confirmText: {
    ...typography.bodyEmphasized,
    color: '#fff',
  },
});
