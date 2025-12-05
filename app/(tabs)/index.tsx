import { ImagePlaceholder } from '@/components/image-placeholder';
import { SearchBar } from '@/components/ui/search-bar';
import { db } from '@/lib/firebase';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ActivityData {
  date: Date;
  type: 'stone' | 'remainder' | 'both';
  count: number;
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { verified } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
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
    // If not verified (no query param), redirect to greeting
    if (verified !== '1') {
      router.replace('/screens/greeting');
    }
  }, [verified]);

  const fetchData = async () => {
    try {
      // Fetch stones data
      const stonesRef = collection(db, 'stones');
      const stonesSnapshot = await getDocs(stonesRef);
      
      let totalStones = 0;
      let inStockStones = 0;
      let inventoryValue = 0;
      const stoneActivities: { date: Date }[] = [];

      stonesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalStones++;
        
        if (data.status === 'In Stock') {
          inStockStones++;
          inventoryValue += (data.priceToSell || 0);
        }

        // Track creation date for activity
        if (data.createdAt) {
          const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
          stoneActivities.push({ date });
        }
      });

      // Fetch remainders data
      const remaindersRef = collection(db, 'remainders');
      const remaindersSnapshot = await getDocs(remaindersRef);
      
      let activeRemainders = 0;
      const remainderActivities: { date: Date }[] = [];

      remaindersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        
        if (data.status === 'pending') {
          activeRemainders++;
        }

        // Track creation date for activity
        if (data.createdAt) {
          const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
          remainderActivities.push({ date });
        }
      });

      // Generate activity grid for last 56 days (8 weeks)
      const activityGrid = generateActivityGrid(stoneActivities, remainderActivities);
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

  const generateActivityGrid = (
    stoneActivities: { date: Date }[],
    remainderActivities: { date: Date }[]
  ): ActivityData[] => {
    const grid: ActivityData[] = [];
    const today = new Date();
    
    // Generate last 56 days
    for (let i = 55; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const stoneCount = stoneActivities.filter(a => {
        const actDate = new Date(a.date);
        actDate.setHours(0, 0, 0, 0);
        return actDate.getTime() === date.getTime();
      }).length;

      const remainderCount = remainderActivities.filter(a => {
        const actDate = new Date(a.date);
        actDate.setHours(0, 0, 0, 0);
        return actDate.getTime() === date.getTime();
      }).length;

      let type: 'stone' | 'remainder' | 'both' = 'stone';
      if (stoneCount > 0 && remainderCount > 0) type = 'both';
      else if (remainderCount > 0) type = 'remainder';

      grid.push({
        date,
        type,
        count: stoneCount + remainderCount,
      });
    }

    return grid;
  };

  const calculateActivityMetrics = (grid: ActivityData[]) => {
    const activeDays = grid.filter(d => d.count > 0).length;
    const activityRate = Math.round((activeDays / grid.length) * 100);
    
    // Calculate current streak from today backwards
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
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `Today, ${today.toLocaleDateString('en-US', options)}`;
  };

  const ActivityGrid = () => {
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const weeks = 8;
    const cellSize = (width - 80) / 8; // Adjust for padding

    return (
      <View style={styles.activityGridContainer}>
        {/* Days of week labels */}
        <View style={styles.weekLabels}>
          {daysOfWeek.map((day, i) => (
            <Text key={i} style={[styles.weekLabel, { width: cellSize }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Activity grid */}
        <View style={styles.gridRows}>
          {Array.from({ length: weeks }).map((_, weekIndex) => (
            <View key={weekIndex} style={styles.gridRow}>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dataIndex = weekIndex * 7 + dayIndex;
                const activity = activityData[dataIndex];
                
                let bgColor = '#2a2a2a'; // Default dark
                if (activity && activity.count > 0) {
                  if (activity.type === 'both') {
                    bgColor = '#FCD34D'; // Yellow for both
                  } else if (activity.type === 'stone') {
                    bgColor = '#10b981'; // Green for stones
                  } else {
                    bgColor = '#8b5cf6'; // Purple for remainders
                  }
                }

                return (
                  <View
                    key={dayIndex}
                    style={[
                      styles.gridCell,
                      { 
                        width: cellSize - 4, 
                        height: cellSize - 4,
                        backgroundColor: bgColor 
                      }
                    ]}
                  />
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
      {/* Header */}
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

      {/* Search Bar */}
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
        {/* Activity Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityTitleRow}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={24} color="#fff" />
              <Text style={styles.activityTitle}>Recent Activity</Text>
            </View>
            <Text style={styles.activitySubtitle}>Last 8 weeks</Text>
          </View>

          {/* Stats Row */}
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

          {/* Activity Grid */}
          <ActivityGrid />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.doneButton}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>View All</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.noteButton}>
              <MaterialCommunityIcons name="note-plus-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Metrics Cards */}
        <View style={styles.metricsGrid}>
          {/* Total Stones */}
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

          {/* In Stock */}
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

          {/* Active Remainders */}
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

          {/* Inventory Value */}
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
        </View>

        {/* Quick Actions */}
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

        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingBottom: 16,
    paddingTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  activityCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#888',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  activityGridContainer: {
    marginBottom: 20,
  },
  weekLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  gridRows: {
    gap: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 4,
  },
  gridCell: {
    borderRadius: 4,
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
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  noteButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: (width - 44) / 2,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  metricGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
});
