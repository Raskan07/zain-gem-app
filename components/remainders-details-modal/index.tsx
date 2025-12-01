import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Remainder {
  id: string;
  buyerName: string;
  buyerType: string;
  createdAt: Timestamp;
  durationInDays: number;
  myProfit: number;
  ownerName: string;
  partyReceives: number;
  paymentReceivingDate: Timestamp;
  receiptImage: string;
  sellingDate: Timestamp;
  sellingPrice: number;
  status: string;
  stoneCost: number;
  stoneName: string;
  stoneOwner: string;
  stoneWeight: number;
  updatedAt: Timestamp;
}

interface RemaindersDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  data: Remainder | null;
}

export const RemaindersDetailsModal: React.FC<RemaindersDetailsModalProps> = ({ visible, onClose, data }) => {
  if (!data) return null;

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysLeft = (date: Timestamp) => {
    if (!date) return { text: 'No Date', color: '#888' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = date.toDate();
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)} Days Overdue`, color: '#ef4444' };
    if (diffDays === 0) return { text: 'Due Today', color: '#f59e0b' };
    return { text: `${diffDays} Days Left`, color: '#10b981' };
  };

  const daysLeft = data ? getDaysLeft(data.paymentReceivingDate) : { text: '', color: '' };

  const DetailItem = ({ label, value, icon, isPrice = false, color = '#fff' }: any) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <MaterialCommunityIcons name={icon} size={20} color="#888" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, { color: isPrice ? '#10b981' : color }]}>
          {isPrice ? `LKR ${Number(value).toLocaleString()}` : value}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1a1a1a', '#000000']}
            style={styles.modalContent}
          >
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>{data.stoneName}</Text>
                <Text style={styles.headerSubtitle}>{data.status.toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              {/* Financials Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Financials</Text>
                <View style={styles.grid}>
                  <DetailItem label="Selling Price" value={data.sellingPrice} icon="cash" isPrice />
                  <DetailItem label="My Profit" value={data.myProfit} icon="cash-plus" isPrice />
                  <DetailItem label="Party Receives" value={data.partyReceives} icon="hand-coin" isPrice />
                  <DetailItem label="Stone Cost" value={data.stoneCost} icon="tag-outline" isPrice />
                </View>
              </View>

              {/* Transaction Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Transaction Details</Text>
                <DetailItem label="Buyer Name" value={data.buyerName} icon="account" />
                <DetailItem label="Buyer Type" value={data.buyerType} icon="account-group" />
                <DetailItem label="Owner Name" value={data.ownerName} icon="crown" />
                <DetailItem label="Stone Owner" value={data.stoneOwner} icon="account-tie" />
              </View>

              {/* Dates & Duration */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Timeline</Text>
                <DetailItem label="Selling Date" value={formatDate(data.sellingDate)} icon="calendar" />
                <DetailItem label="Payment Due" value={formatDate(data.paymentReceivingDate)} icon="calendar-clock" color="#f59e0b" />
                <DetailItem label="Time Remaining" value={daysLeft.text} icon="clock-outline" color={daysLeft.color} />
                <DetailItem label="Duration" value={`${data.durationInDays} Days`} icon="timer-sand" />
              </View>

              {/* Stone Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stone Info</Text>
                <DetailItem label="Stone Name" value={data.stoneName} icon="diamond-stone" />
                <DetailItem label="Weight" value={`${data.stoneWeight} crt`} icon="weight" />
              </View>

              {/* Receipt Image */}
              {data.receiptImage ? (
                 <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Receipt</Text>
                    <Image source={{ uri: data.receiptImage }} style={styles.receiptImage} resizeMode="cover" />
                 </View>
              ) : null}

            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#333',
  }
});
