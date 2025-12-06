import { ActivityDetailModal } from '@/components/activity-detail-modal';
import { FilterTabs } from '@/components/filter-tabs';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { RecentItemsList } from '@/components/recent-items-list';
import { SearchBar } from '@/components/ui/search-bar';
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
}

interface EnhancedActivityData {
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
    activityRate: 0,
    currentStreak: 0,
    activeDays: 0,
  });

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
      const allStonesMap: Map<string, StoneData & { createdAt: Date }> = new Map();

      stonesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalStones++;
        
        if (data.status === 'In Stock') {
          inStockStones++;
          inventoryValue += (data.priceToSell || 0);
        }

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

      const remaindersRef = collection(db, 'remainders');
      const remaindersSnapshot = await getDocs(remaindersRef);
      
      let activeRemainders = 0;
      const allRemaindersMap: Map<string, RemainderData & { createdAt: Date }> = new Map();

      remaindersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        
        if (data.status === 'pending') {
          activeRemainders++;
        }

        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
        const paymentDate = data.paymentDate instanceof Timestamp ? data.paymentDate.toDate() : new Date(data.paymentDate);
        const today = new Date();
        const daysLeft = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const remainderData: RemainderData & { createdAt: Date } = {
          id: doc.id,
          stoneName: data.stoneName || 'Unnamed',
          buyerName: data.buyerName || 'Unknown',
          sellingPrice: data.sellingPrice || 0,
          paymentDate,
          daysLeft,
          status: data.status || 'pending',
          createdAt,
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
    allRemainders: Map<string, RemainderData & { createdAt: Date }>,
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
      
      // Filter stones created on this day
      const dayStones: StoneData[] = [];
      allStones.forEach((stone) => {
        const stoneDate = new Date(stone.createdAt);
        stoneDate.setHours(0, 0, 0, 0);
        if (stoneDate.getTime() === currentDate.getTime()) {
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
      
      // Filter remainders created on this day
      const dayRemainders: RemainderData[] = [];
      allRemainders.forEach((remainder) => {
        const remainderDate = new Date(remainder.createdAt);
        remainderDate.setHours(0, 0, 0, 0);
        if (remainderDate.getTime() === currentDate.getTime()) {
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
    if (item.type === 'stone') {
      router.push('/two');
    } else {
      router.push('/s&r');
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
      return activityData.map(day => ({
        ...day,
        count: day.stones.length,
        type: 'stone' as const,
      }));
    } else if (activeFilter === 'remainders') {
      return activityData.map(day => ({
        ...day,
        count: day.remainders.length,
        type: 'remainder' as const,
      }));
    }
    return activityData;
  };

  const filteredActivityData = getFilteredActivityData();

  const MonthlyActivityGrid = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const cellSize = (width - 60) / 7;

    return (
      <View style={styles.activityGridContainer}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.monthNavButton}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setShowMonthSelector(true)} style={styles.monthTitle}>
            <Text style={styles.monthTitleText}>{monthName}</Text>
            <Ionicons name="chevron-down" size={16} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.monthNavButton}>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Days of week labels */}
        <View style={styles.weekLabels}>
          {daysOfWeek.map((day, i) => (
            <Text key={i} style={[styles.weekLabel, { width: cellSize }]}>
              {day.substring(0, 1)}
            </Text>
          ))}
        </View>

        {/* Activity grid */}
        <View style={styles.gridRows}>
          {Array.from({ length: Math.ceil(filteredActivityData.length / 7) }).map((_, weekIndex) => (
            <View key={weekIndex} style={styles.gridRow}>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dataIndex = weekIndex * 7 + dayIndex;
                const activity = filteredActivityData[dataIndex];
                
                if (!activity) return <View key={dayIndex} style={{ width: cellSize, height: cellSize }} />;

                const isCurrentMonth = activity.dayNumber > 0;
                const isToday = activity.date.toDateString() === new Date().toDateString();
                
                let bgColor = isCurrentMonth ? '#2a2a2a' : '#1a1a1a';
                if (activity.count > 0) {
                  if (activity.type === 'both') {
                    bgColor = '#FCD34D';
                  } else if (activity.type === 'stone') {
                    bgColor = '#10b981';
                  } else if (activity.type === 'remainder') {
                    bgColor = '#8b5cf6';
                  }
                }

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    onPress={() => isCurrentMonth && handleActivityCellPress(activity)}
                    activeOpacity={activity.count > 0 ? 0.7 : 1}
                    style={{ width: cellSize, height: cellSize, padding: 2 }}
                  >
                    <View
                      style={[
                        styles.gridCell,
                        { backgroundColor: bgColor },
                        isToday && styles.todayCell,
                      ]}
                    >
                      {isCurrentMonth && (
                        <Text style={[
                          styles.dayNumber,
                          activity.count > 0 && styles.dayNumberActive,
                          isToday && styles.dayNumberToday,
                        ]}>
                          {activity.dayNumber}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

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

          <MonthlyActivityGrid />

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
          <TouchableOpacity 
            onPress={() => handleMetricCardPress('total')}
            activeOpacity={0.8}
          >
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.metricCard}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricGradient}
              >
                <MaterialCommunityIcons name="diamond-stone" size={32} color="#fff" />
                <Text style={styles.metricValue}>{metrics.totalStones}</Text>
                <Text style={styles.metricLabel}>Total Stones</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleMetricCardPress('inStock')}
            activeOpacity={0.8}
          >
            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.metricCard}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricGradient}
              >
                <MaterialCommunityIcons name="package-variant" size={32} color="#fff" />
                <Text style={styles.metricValue}>{metrics.inStockStones}</Text>
                <Text style={styles.metricLabel}>In Stock</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleMetricCardPress('remainders')}
            activeOpacity={0.8}
          >
            <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.metricCard}>
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricGradient}
              >
                <MaterialCommunityIcons name="clock-outline" size={32} color="#fff" />
                <Text style={styles.metricValue}>{metrics.activeRemainders}</Text>
                <Text style={styles.metricLabel}>Active Remainders</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleMetricCardPress('value')}
            activeOpacity={0.8}
          >
            <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.metricCard}>
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricGradient}
              >
                <FontAwesome5 name="coins" size={28} color="#fff" />
                <Text style={styles.metricValue}>LKR {(metrics.inventoryValue / 1000).toFixed(0)}K</Text>
                <Text style={styles.metricLabel}>Inventory Value</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
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
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  activityCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  activitySubtitle: {
    color: '#888',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  activityGridContainer: {
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  monthTitleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  weekLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabel: {
    color: '#888',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  gridRows: {
    gap: 3,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 3,
  },
  gridCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  dayNumber: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  dayNumberActive: {
    color: '#fff',
  },
  dayNumberToday: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  doneButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noteButton: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  metricCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionCardGradient: {
    padding: 16,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
});
