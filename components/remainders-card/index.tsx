import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

interface RemaindersCardProps {
  data: Remainder;
  onPress: () => void;
}

export const RemaindersCard: React.FC<RemaindersCardProps> = ({ data, onPress }) => {
  const getDaysLeft = (date: Timestamp) => {
    if (!date) return { text: 'No Date', color: '#888' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = date.toDate();
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, color: '#ef4444' };
    if (diffDays === 0) return { text: 'Due Today', color: '#f59e0b' };
    return { text: `${diffDays} days left`, color: '#10b981' };
  };

  const daysLeft = getDaysLeft(data.paymentReceivingDate);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={['#3a3a3a', '#202020']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="diamond-stone" size={20} color="#8b5cf6" />
            <Text style={styles.stoneName}>{data.stoneName}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${daysLeft.color}20` }]}>
            <Text style={[styles.badgeText, { color: daysLeft.color }]}>{daysLeft.text}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Buyer</Text>
              <Text style={styles.value}>{data.buyerName}</Text>
            </View>
            <View style={[styles.infoItem, styles.alignRight]}>
              <Text style={styles.label}>Selling Price</Text>
              <Text style={styles.price}>LKR {data.sellingPrice.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
            <Text style={styles.ownerText}>Owner: {data.ownerName}</Text>
             <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stoneName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#eee',
    fontWeight: '500',
  },
  price: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: 'bold',
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.05)',
      paddingTop: 12,
  },
  ownerText: {
      fontSize: 12,
      color: '#666',
  }
});
