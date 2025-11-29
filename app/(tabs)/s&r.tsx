import { db } from '@/lib/firebase';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

interface DashboardMetrics {
  totalRemainders: number;
  pendingCount: number;
  overdueCount: number;
  totalValue: number;
  nextPaymentDue: string;
}

export default function StonesRemaindersScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRemainders: 0,
    pendingCount: 0,
    overdueCount: 0,
    totalValue: 0,
    nextPaymentDue: 'No Due',
  });

  const fetchData = async () => {
    try {
      const remaindersRef = collection(db, 'remainders');
      const snapshot = await getDocs(remaindersRef);
      
      let totalRemainders = 0;
      let pendingCount = 0;
      let overdueCount = 0;
      let totalValue = 0;
      let nextPaymentDate: Date | null = null;
      
      const now = new Date();

      snapshot.docs.forEach(doc => {
        const data = doc.data() as Omit<Remainder, 'id'>;
        const paymentDate = data.paymentReceivingDate instanceof Timestamp ? data.paymentReceivingDate.toDate() : null;
        
        totalRemainders++;
        
        if (data.status === 'pending') {
          totalValue += (data.sellingPrice || 0);
          
          if (paymentDate) {
            // Check for overdue vs pending
            if (paymentDate < now) {
              overdueCount++;
            } else {
              pendingCount++;
            }

            // Find next payment due (earliest future date)
            if (paymentDate > now) {
              if (!nextPaymentDate || paymentDate < nextPaymentDate) {
                nextPaymentDate = paymentDate;
              }
            }
          } else {
             // If no date, default to pending? Or ignore? 
             // Assuming pending if no date is specified, or maybe overdue?
             // For now, let's count as pending if no date, to be safe.
             pendingCount++;
          }
        }
      });

      const getRelativeTime = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(date);
        target.setHours(0, 0, 0, 0);
        
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return `in ${diffDays} days`;
      };

      setMetrics({
        totalRemainders,
        pendingCount,
        overdueCount,
        totalValue,
        nextPaymentDue: nextPaymentDate ? getRelativeTime(nextPaymentDate) : (pendingCount > 0 ? 'Pending' : 'All Clear'),
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const Card = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    colors, 
    delay, 
    fullWidth = false,
    height = 180
  }: { 
    title: string, 
    value: string | number, 
    subtitle?: string, 
    icon: any, 
    colors: [string, string, ...string[]], 
    delay: number,
    fullWidth?: boolean,
    height?: number
  }) => (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify()} 
      style={[
        styles.cardContainer, 
        fullWidth ? styles.fullWidth : styles.halfWidth,
        { height }
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardValue}>{value}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>

        {/* Decorative Background Element */}
        <MaterialCommunityIcons 
          name="chart-bubble" 
          size={120} 
          color="rgba(255,255,255,0.05)" 
          style={styles.bgIcon} 
        />
      </LinearGradient>
    </Animated.View>
  );

  return (
    <LinearGradient 
      colors={['#1a1a1a', '#000000']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Admin</Text>
          <Text style={styles.headerTitle}>Stones Reminders</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <ImagePlaceholder />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <View style={styles.grid}>
          {/* Total Remainders */}
          <Card 
            title="Total Remainders"
            value={metrics.totalRemainders}
            subtitle="In Stock"
            icon={<MaterialCommunityIcons name="diamond-stone" size={24} color="#fff" />}
            colors={['#6366f1', '#8b5cf6']}
            delay={100}
          />

          {/* Pending */}
          <Card 
            title="Pending"
            value={metrics.pendingCount}
            subtitle="Awaiting Action"
            icon={<MaterialCommunityIcons name="clock-outline" size={24} color="#fff" />}
            colors={['#f59e0b', '#d97706']}
            delay={200}
          />

          {/* Total Value (Full Width) */}
          <Card 
            title="Total Value"
            value={`LKR ${metrics.totalValue.toLocaleString()}`}
            subtitle="Inventory Worth"
            icon={<FontAwesome5 name="coins" size={24} color="#fff" />}
            colors={['#10b981', '#059669']}
            delay={300}
            fullWidth
            height={160}
          />

          {/* Overdue */}
          <Card 
            title="Overdue"
            value={metrics.overdueCount}
            subtitle="Action Needed"
            icon={<MaterialCommunityIcons name="alert-circle-outline" size={24} color="#fff" />}
            colors={['#ef4444', '#dc2626']}
            delay={400}
          />

          {/* Next Payment Due */}
          <Card 
            title="Next Payment"
            value={metrics.nextPaymentDue}
            subtitle="Upcoming"
            icon={<Ionicons name="calendar-outline" size={24} color="#fff" />}
            colors={['#8b5cf6', '#7c3aed']}
            delay={500}
          />
        </View>

        
        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const ImagePlaceholder = () => (
  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#555' }}>
    <FontAwesome5 name="plus" size={16} color="#aaa" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  fullWidth: {
    width: '100%',
  },
  halfWidth: {
    width: (width - 44) / 2, // 16 padding * 2 + 12 gap = 44
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)', // Works on web, ignored on native
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: 4,
  },
  cardContent: {
    zIndex: 1,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  bgIcon: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    opacity: 0.5,
  },
});
