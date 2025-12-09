import { ActivityDetailModal } from '@/components/activity-detail-modal';
import { FilterTabs } from '@/components/filter-tabs';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { MetricCard } from '@/components/metric-card';
import { MonthlyActivityGrid } from '@/components/monthly-activity-grid';
import { RecentItemsList } from '@/components/recent-items-list';
import { RemaindersDetailsModal } from '@/components/remainders-details-modal';
import { SearchBar } from '@/components/ui/search-bar';
import { StoneDetailsModal } from '@/components/ui/stone-details-modal';
import { Stone } from '@/constants/data';
import { db } from '@/lib/firebase';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface StoneData {
  id: string;
  name: string;
  status: string;
  priceToSell: number;
  treatment: string;
  customId: string;
}

interface RemainderData {
  id: string;
  stoneName: string;
  buyerName: string;
  sellingPrice: number;
  paymentDate: Date;
  daysLeft: number;
  status: string;
  sellingDate?: Date; // Added for correct date tracking
}

// Interface matching RemaindersDetailsModal expectations
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

export interface EnhancedActivityData {
  date: Date;
  dayNumber: number;
  stones: StoneData[];
  remainders: RemainderData[];
  count: number;
  type: 'stone' | 'remainder' | 'both' | 'none';
}

interface DashboardMetrics {
  totalStones: number;
  inStockStones: number;
  activeRemainders: number;
  inventoryValue: number;
  totalInvestment: number;
  totalSales: number;
  pendingPayments: number;
  receivedPayments: number;
  totalProfit: number;
  activityRate: number;
  currentStreak: number;
  activeDays: number;
}

interface RecentItem {
  id: string;
  name: string;
  date: Date;
  status: string;
  type: 'stone' | 'remainder';
  stoneData?: Stone;
  remainderData?: Remainder;
}

interface ActivityItem {
  id: string;
  name: string;
  type: 'stone' | 'remainder';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { verified } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [activityData, setActivityData] = useState<EnhancedActivityData[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<EnhancedActivityData | null>(null);
  const [recentStones, setRecentStones] = useState<RecentItem[]>([]);
  const [recentRemainders, setRecentRemainders] = useState<RecentItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalStones: 0,
    inStockStones: 0,
    activeRemainders: 0,
    inventoryValue: 0,
    totalInvestment: 0,
    totalSales: 0,
    pendingPayments: 0,
    receivedPayments: 0,
    totalProfit: 0,
    activityRate: 0,
    currentStreak: 0,
    activeDays: 0,
  });

  const [selectedRecentStone, setSelectedRecentStone] = useState<Stone | null>(null);
  const [showStoneModal, setShowStoneModal] = useState(false);
  
  const [selectedRecentRemainder, setSelectedRecentRemainder] = useState<Remainder | null>(null);
  const [showRemainderModal, setShowRemainderModal] = useState(false);

  useEffect(() => {
    if (verified !== '1') {
      router.replace('/screens/greeting');
    }
  }, [verified]);

  const fetchData = async () => {
    try {
      const stonesRef = collection(db, 'stones');
      const stonesSnapshot = await getDocs(stonesRef);
      
      let totalStones = 0;
      let inStockStones = 0;
      let inventoryValue = 0;
      let totalInvestment = 0;
      const allStonesMap: Map<string, StoneData & { createdAt: Date }> = new Map();

      stonesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalStones++;
        
        if (data.status === 'In Stock') {
          inStockStones++;
          inventoryValue += (data.priceToSell || 0);
        }
        
        // Total Investment includes ALL stones
        totalInvestment += (data.totalCost || data.stoneCost || 0);

        // Stones collection uses createdAt
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());

        const stoneData: StoneData & { createdAt: Date } = {
          id: doc.id,
          name: data.name || 'Unnamed Stone',
          status: data.status || 'Unknown',
          priceToSell: data.priceToSell || 0,
          treatment: data.treatment || 'None',
          customId: data.customId || '',
          createdAt,
        };
        allStonesMap.set(doc.id, stoneData);
      });

      // Mapping for Full Stone Data (for Modal)
      const allFullStonesMap: Map<string, Stone> = new Map();
      stonesSnapshot.docs.forEach(doc => {
         const data = doc.data();
         // Ensure all required fields for Stone interface are present
         const fullStone: Stone = {
             id: doc.id,
             customId: data.customId || '',
             customIdNum: data.customIdNum || 0,
             name: data.name || '',
             weight: data.weight || 0,
             weightInRough: data.weightInRough || 0,
             stoneCost: data.stoneCost || 0,
             cuttingCost: data.cuttingCost || 0,
             polishCost: data.polishCost || 0,
             treatmentCost: data.treatmentCost || 0,
             otherCost: data.otherCost || 0,
             totalCost: data.totalCost || 0,
             priceToSell: data.priceToSell || 0,
             soldPrice: data.soldPrice || 0,
             profitLoss: data.profitLoss || 0,
             status: data.status || '',
             treatment: data.treatment || '',
             images: data.images || [],
             createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
             updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
         };
         allFullStonesMap.set(doc.id, fullStone);
      });

      // Fetch remainders from both 'remainders' and 'archives' collections
      const remaindersRef = collection(db, 'remainders');
      const remaindersSnapshot = await getDocs(remaindersRef);
      
      const archivesRef = collection(db, 'archives');
      const archivesSnapshot = await getDocs(archivesRef);
      
      let activeRemainders = 0;
      let totalSales = 0;
      let pendingPayments = 0;
      let receivedPayments = 0;
      let totalProfit = 0;

      const allRemaindersMap: Map<string, RemainderData & { createdAt: Date; sellingDate?: Date }> = new Map();
      const allFullRemaindersMap: Map<string, Remainder> = new Map(); // For Modal


      // Process remainders collection
      remaindersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const sellingPrice = data.sellingPrice || 0;
        const profit = data.myProfit || 0;
        
        if (data.status === 'pending') {
          activeRemainders++;
          pendingPayments += sellingPrice;
        }

        // Add to totals as per requirement (Total Sales = Archives + Remainders)
        totalSales += sellingPrice;
        totalProfit += profit;

        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
        const paymentDate = data.paymentDate instanceof Timestamp ? data.paymentDate.toDate() : new Date(data.paymentDate);
        // User wants sellingDate
        const sellingDate = data.sellingDate instanceof Timestamp ? data.sellingDate.toDate() : undefined;
        
        const today = new Date();
        const daysLeft = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const remainderData: RemainderData & { createdAt: Date; sellingDate?: Date } = {
          id: doc.id,
          stoneName: data.stoneName || 'Unnamed',
          buyerName: data.buyerName || 'Unknown',
          sellingPrice: sellingPrice,
          paymentDate,
          daysLeft,
          status: data.status || 'pending',
          createdAt,
          sellingDate,
        };
        allRemaindersMap.set(doc.id, remainderData);
      });

      // Process archives collection
      archivesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const sellingPrice = data.sellingPrice || 0;
        const profit = data.myProfit || 0;

        receivedPayments += sellingPrice;
        totalSales += sellingPrice;
        totalProfit += profit;

        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
        const paymentDate = data.paymentReceivingDate instanceof Timestamp ? data.paymentReceivingDate.toDate() : new Date(data.paymentReceivingDate || data.paymentDate);
        // User wants sellingDate
        const sellingDate = data.sellingDate instanceof Timestamp ? data.sellingDate.toDate() : undefined;

        const today = new Date();
        const daysLeft = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const remainderData: RemainderData & { createdAt: Date; sellingDate?: Date } = {
          id: doc.id,
          stoneName: data.stoneName || 'Unnamed',
          buyerName: data.buyerName || 'Unknown',
          sellingPrice: sellingPrice,
          paymentDate,
          daysLeft,
          status: 'completed', // Archives are completed
          createdAt,
          sellingDate,
        };
        allRemaindersMap.set(doc.id, remainderData);
      });

      // Generate recent items
      const recentStonesData: RecentItem[] = Array.from(allStonesMap.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(stone => ({
          id: stone.id,
          name: stone.name,
          date: stone.createdAt,
          status: stone.status,
          type: 'stone' as const,
          stoneData: allFullStonesMap.get(stone.id)
        }));

      const recentRemaindersData: RecentItem[] = Array.from(allRemaindersMap.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(remainder => ({
          id: remainder.id,
          name: remainder.stoneName,
          date: remainder.createdAt,
          status: remainder.status,
          type: 'remainder' as const,
          remainderData: allFullRemaindersMap.get(remainder.id)
        }));

      setRecentStones(recentStonesData);
      setRecentRemainders(recentRemaindersData);

      // Generate monthly activity grid with real data
      const activityGrid = generateMonthlyActivityGrid(allStonesMap, allRemaindersMap, selectedDate);
      const { activeDays, activityRate, currentStreak } = calculateActivityMetrics(activityGrid);

      setActivityData(activityGrid);
      setMetrics({
        totalStones,
        inStockStones,
        activeRemainders,
        inventoryValue,
        totalInvestment,
        totalSales,
        pendingPayments,
        receivedPayments,
        totalProfit,
        activityRate,
        currentStreak,
        activeDays,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMonthlyActivityGrid = (
    allStones: Map<string, StoneData & { createdAt: Date }>,
    allRemainders: Map<string, RemainderData & { createdAt: Date; sellingDate?: Date }>,
    date: Date
  ): EnhancedActivityData[] => {
    const grid: EnhancedActivityData[] = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    // Add padding days from previous month
    for (let i = 0; i < firstDay; i++) {
      grid.push({
        date: new Date(year, month, -firstDay + i + 1),
        dayNumber: 0,
        stones: [],
        remainders: [],
        count: 0,
        type: 'none',
      });
    }
    
    // Add days of current month with real data
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);
      
      // Filter stones created on this day (Strictly createdAt per user request)
      const dayStones: StoneData[] = [];
      allStones.forEach((stone) => {
        const createdDate = new Date(stone.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        
        if (createdDate.getTime() === currentDate.getTime()) {
          dayStones.push({
            id: stone.id,
            name: stone.name,
            status: stone.status,
            priceToSell: stone.priceToSell,
            treatment: stone.treatment,
            customId: stone.customId,
          });
        }
      });
      
      // Filter remainders based on SELLING DATE 
      const dayRemainders: RemainderData[] = [];
      allRemainders.forEach((remainder) => {
        // User explicitly asked for sellingDate for remainders/archives
        // If sellingDate is missing, what should we do? 
        // User said "archives and remainder collection use sellingDate".
        // If it's missing, it won't show on the calendar as a sale.
        // I will fallback to createdAt only if sellingDate is absolutely missing to show *something*, 
        // but primarily rely on sellingDate.
        
        const targetDate = remainder.sellingDate ? new Date(remainder.sellingDate) : undefined;
        
        if (targetDate) {
            targetDate.setHours(0, 0, 0, 0);
            if (targetDate.getTime() === currentDate.getTime()) {
              dayRemainders.push({
                id: remainder.id,
                stoneName: remainder.stoneName,
                buyerName: remainder.buyerName,
                sellingPrice: remainder.sellingPrice,
                paymentDate: remainder.paymentDate,
                daysLeft: remainder.daysLeft,
                status: remainder.status,
              });
            }
        }
      });
      
      let type: 'stone' | 'remainder' | 'both' | 'none' = 'none';
      if (dayStones.length > 0 && dayRemainders.length > 0) type = 'both';
      else if (dayStones.length > 0) type = 'stone';
      else if (dayRemainders.length > 0) type = 'remainder';
      
      grid.push({
        date: currentDate,
        dayNumber: day,
        stones: dayStones,
        remainders: dayRemainders,
        count: dayStones.length + dayRemainders.length,
        type,
      });
    }
    
    return grid;
  };

  const calculateActivityMetrics = (grid: EnhancedActivityData[]) => {
    const activeDays = grid.filter(d => d.count > 0).length;
    const activityRate = grid.length > 0 ? Math.round((activeDays / grid.length) * 100) : 0;
    
    let currentStreak = 0;
    for (let i = grid.length - 1; i >= 0; i--) {
      if (grid[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { activeDays, activityRate, currentStreak };
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `Today, ${today.toLocaleDateString('en-US', options)}`;
  };

  const handleActivityCellPress = (activity: EnhancedActivityData) => {
    if (activity.count > 0) {
      setSelectedActivity(activity);
      setShowActivityModal(true);
    }
  };

  const handleMetricCardPress = (type: 'total' | 'inStock' | 'remainders' | 'value') => {
    switch (type) {
      case 'total':
        router.push('/two');
        break;
      case 'inStock':
        router.push('/two?filter=In Stock');
        break;
      case 'remainders':
        router.push('/s&r?filter=pending');
        break;
      case 'value':
        router.push('/two?sort=value');
        break;
    }
  };

  const handleRecentItemPress = (item: RecentItem) => {
    if (item.type === 'stone' && item.stoneData) {
      setSelectedRecentStone(item.stoneData);
      setShowStoneModal(true);
    } else if (item.type === 'remainder' && item.remainderData) {
      setSelectedRecentRemainder(item.remainderData);
      setShowRemainderModal(true);
    }
  };

  const handleMonthSelect = (year: number, month: number) => {
    setSelectedDate(new Date(year, month, 1));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const filterTabs = [
    { id: 'all', label: 'All Activity' },
    { id: 'stones', label: 'Stones Only' },
    { id: 'remainders', label: 'Remainders Only' },
  ];

  const getFilteredActivityData = () => {
    if (activeFilter === 'stones') {
      // Only show days that have stones, keep original data structure
      return activityData.map(day => {
        if (day.stones.length > 0) {
          return {
            ...day,
            // Keep only stones, clear remainders for this view
            remainders: [],
            count: day.stones.length,
            type: 'stone' as const,
          };
        }
        // Return empty day if no stones
        return {
          ...day,
          stones: [],
          remainders: [],
          count: 0,
          type: 'none' as const,
        };
      });
    } else if (activeFilter === 'remainders') {
      // Only show days that have remainders, keep original data structure
      return activityData.map(day => {
        if (day.remainders.length > 0) {
          return {
            ...day,
            // Keep only remainders, clear stones for this view
            stones: [],
            count: day.remainders.length,
            type: 'remainder' as const,
          };
        }
        // Return empty day if no remainders
        return {
          ...day,
          stones: [],
          remainders: [],
          count: 0,
          type: 'none' as const,
        };
      });
    }
    return activityData;
  };

  const filteredActivityData = getFilteredActivityData();

  return (
    <LinearGradient 
      colors={['#1a1a1a', '#000000']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ImagePlaceholder />
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <SearchBar 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          placeholder="Search Stones & Remainders..."
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <FilterTabs 
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
        />

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityTitleRow}>
              <MaterialCommunityIcons name="calendar-month" size={24} color="#fff" />
              <Text style={styles.activityTitle}>Monthly Activity</Text>
            </View>
            <Text style={styles.activitySubtitle}>Track your daily progress</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metrics.activeDays}</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metrics.activityRate}%</Text>
              <Text style={styles.statLabel}>Activity Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metrics.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>

          <MonthlyActivityGrid 
            data={filteredActivityData}
            selectedDate={selectedDate}
            onNavigateMonth={navigateMonth}
            onShowMonthSelector={() => setShowMonthSelector(true)}
            onActivityPress={handleActivityCellPress}
          />

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.doneButton} onPress={() => router.push('/two')}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="list" size={20} color="#fff" />
                <Text style={styles.buttonText}>View All Stones</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.noteButton} onPress={() => router.push('/s&r')}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.metricsGrid}>
          {/* Row 1 */}
          <View style={styles.metricRow}>
            <MetricCard
              title="Total Investment"
              value={`LKR ${(metrics.totalInvestment / 1000).toFixed(0)}K`}
              icon={<MaterialCommunityIcons name="safe" size={32} color="#fff" />}
              colors={['#3b82f6', '#2563eb', '#1d4ed8']}
              delay={200}
              onPress={() => handleMetricCardPress('inStock')}
            />
            <MetricCard
              title="Total Sales"
              value={`LKR ${(metrics.totalSales / 1000).toFixed(0)}K`}
              icon={<MaterialCommunityIcons name="cash-multiple" size={32} color="#fff" />}
              colors={['#10b981', '#059669', '#047857']}
              delay={300}
              onPress={() => router.push('/s&r')}
            />
          </View>

          {/* Row 2 */}
          <View style={styles.metricRow}>
            <MetricCard
              title="Pending Payments"
              value={`LKR ${(metrics.pendingPayments / 1000).toFixed(0)}K`}
              icon={<MaterialCommunityIcons name="clock-alert-outline" size={32} color="#fff" />}
              colors={['#f59e0b', '#d97706', '#b45309']}
              delay={400}
              onPress={() => handleMetricCardPress('remainders')}
            />
            <MetricCard
              title="Received Payments"
              value={`LKR ${(metrics.receivedPayments / 1000).toFixed(0)}K`}
              icon={<MaterialCommunityIcons name="check-circle-outline" size={32} color="#fff" />}
              colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
              delay={500}
              onPress={() => router.push('/s&r?filter=completed')} // Assuming there's a completed filter or similar
            />
          </View>

          {/* Row 3 */}
          <View style={styles.metricRow}>
            <MetricCard
              title="Total Profit"
              value={`LKR ${(metrics.totalProfit / 1000).toFixed(0)}K`}
              icon={<FontAwesome5 name="coins" size={28} color="#fff" />}
              colors={['#ef4444', '#dc2626', '#b91c1c']}
              delay={600}
              onPress={() => {}}
             
            />
             <MetricCard
              title="Inventory Value"
              value={`LKR ${(metrics.inventoryValue / 1000).toFixed(0)}K`}
              icon={<MaterialCommunityIcons name="treasure-chest" size={32} color="#fff" />}
              colors={['#ec4899', '#db2777', '#be185d']}
              delay={700}
              onPress={() => handleMetricCardPress('value')}
            />
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/add-stone')}
          >
            <LinearGradient
              colors={['#10b981', '#14b8a6', '#06b6d4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionCardGradient}
            >
              <View style={styles.actionCardContent}>
                <View style={styles.actionIconContainer}>
                  <MaterialCommunityIcons name="diamond-stone" size={28} color="#fff" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Add New Stone</Text>
                  <Text style={styles.actionSubtitle}>Add a new gem to inventory</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/add-remainder')}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionCardGradient}
            >
              <View style={styles.actionCardContent}>
                <View style={styles.actionIconContainer}>
                  <MaterialCommunityIcons name="clock-plus-outline" size={28} color="#fff" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Add Remainder</Text>
                  <Text style={styles.actionSubtitle}>Track payment reminders</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <RecentItemsList 
            items={recentStones}
            type="stone"
            onItemPress={handleRecentItemPress}
            onViewAll={() => router.push('/two')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <RecentItemsList 
            items={recentRemainders}
            type="remainder"
            onItemPress={handleRecentItemPress}
            onViewAll={() => router.push('/s&r')}
          />
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {selectedActivity && (
        <ActivityDetailModal 
          visible={showActivityModal}
          onClose={() => setShowActivityModal(false)}
          date={selectedActivity.date}
          stones={selectedActivity.stones.map(s => ({ id: s.id, name: s.name, type: 'stone' as const }))}
          remainders={selectedActivity.remainders.map(r => ({ id: r.id, name: r.stoneName, type: 'remainder' as const }))}
        />
      )}

      {showMonthSelector && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event: any, date?: Date) => {
            setShowMonthSelector(false);
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      )}

      {/* Stone Details Modal */}
      <StoneDetailsModal
        visible={showStoneModal}
        stone={selectedRecentStone}
        onClose={() => setShowStoneModal(false)}
      />

      {/* Remainder Details Modal */}
      <RemaindersDetailsModal
        visible={showRemainderModal}
        data={selectedRecentRemainder}
        onClose={() => setShowRemainderModal(false)}
        onDataChange={fetchData} 
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  activityCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 16,
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },
  activityHeader: {
    marginBottom: 20,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  activitySubtitle: {
    color: '#888',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  doneButton: {
    flex: 3, 
    borderRadius: 12,
    overflow: 'hidden',
  },
  noteButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  metricsGrid: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  metricCard: {
    width: (width - 44) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    height: 120,
  },
  metricGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionCardGradient: {
    padding: 16,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
});
