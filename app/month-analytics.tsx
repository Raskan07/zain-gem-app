import { db } from '@/lib/firebase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { StonesSoldComparison } from '@/components/analytics/StonesSoldComparison';
import { BarChart } from 'react-native-gifted-charts';



export default function MonthAnalyticsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  
  const [analytics, setAnalytics] = useState({
    current: { totalSales: 0, totalInvestment: 0, totalProfit: 0, stonesSold: 0 },
    previous: { totalSales: 0, totalInvestment: 0, totalProfit: 0, stonesSold: 0 }
  });

  useEffect(() => {
    fetchAllAnalytics();
  }, [date]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const currentStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const currentEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      
      const prevDate = new Date(date);
      prevDate.setMonth(date.getMonth() - 1);
      const prevStart = new Date(prevDate.getFullYear(), prevDate.getMonth(), 1);
      const prevEnd = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0, 23, 59, 59);

      const [currentMetrics, prevMetrics] = await Promise.all([
        getMetricsForRange(currentStart, currentEnd),
        getMetricsForRange(prevStart, prevEnd)
      ]);

      setAnalytics({
        current: currentMetrics,
        previous: prevMetrics
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
      Alert.alert("Error", "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const getMetricsForRange = async (start: Date, end: Date) => {
      let sales = 0;
      let investment = 0;
      let profit = 0;
      let count = 0;

      // Helper to check if date is in range
      const isInRange = (d: Date | null) => d && d >= start && d <= end;

      // 1. Fetch Stones (Investment)
      const stonesSnapshot = await getDocs(collection(db, 'stones'));
      stonesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
        if (isInRange(createdAt)) {
            investment += parseFloat(data.totalCost) || 0;
        }
      });

      // 2. Fetch Archives (Sales, Profit, Investment)
      const archivesSnapshot = await getDocs(collection(db, 'archives'));
      archivesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const saleDate = data.sellingDate instanceof Timestamp ? data.sellingDate.toDate() : 
                         (data.paymentReceivingDate instanceof Timestamp ? data.paymentReceivingDate.toDate() : null);
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;

        if (isInRange(createdAt)) {
             let cost = parseFloat(data.totalCost);
             if (isNaN(cost)) {
                 const sp = parseFloat(data.sellingPrice) || 0;
                 const mp = parseFloat(data.myProfit) || 0;
                 cost = sp - mp;
             }
             investment += cost;
        }

        if (isInRange(saleDate)) {
            sales += parseFloat(data.sellingPrice) || 0;
            profit += parseFloat(data.myProfit) || 0;
            count++;
        }
      });

      // 3. Fetch Remainders (Sales, Profit, Investment)
      const remaindersSnapshot = await getDocs(collection(db, 'remainders'));
      remaindersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const saleDate = data.sellingDate instanceof Timestamp ? data.sellingDate.toDate() : null;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;

        if (isInRange(createdAt)) {
             let cost = parseFloat(data.totalCost) || 0;
             investment += cost;
        }

        if (isInRange(saleDate)) {
            const sellingPrice = parseFloat(data.sellingPrice) || 0;
            let itemProfit = 0;

            if (data.myProfit !== undefined) {
                itemProfit = parseFloat(data.myProfit) || 0;
            } else if (data.totalCost !== undefined) {
                const cost = parseFloat(data.totalCost) || 0;
                itemProfit = sellingPrice - cost;
            }
            
            sales += sellingPrice;
            profit += itemProfit;
            if (sellingPrice > 0) {
                count++;
            }
        }
      });

      return { totalSales: sales, totalInvestment: investment, totalProfit: profit, stonesSold: count };
  };

  const navMonth = (acc: number) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + acc);
    setDate(newDate);
  };

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatMonth = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const validationMax = (val: number) => showComparison ? val : 0;


  const [showComparison, setShowComparison] = useState(false);

  // ... (existing code)

  const chartData = [
    ...(showComparison ? [{
      value: analytics.previous.totalSales,
      label: 'Sales',
      spacing: 4,
      labelWidth: 40,
      labelTextStyle: { color: 'gray', fontSize: 12 },
      frontColor: 'rgba(16, 185, 129, 0.3)', // Faded Green
    }] : []),
    {
      value: analytics.current.totalSales,
      label: showComparison ? '' : 'Sales',
      spacing: 24,
      labelWidth: 40,
      labelTextStyle: { color: 'gray', fontSize: 12 },
      frontColor: '#10b981', // Green
    },
    ...(showComparison ? [{
      value: analytics.previous.totalInvestment,
      label: 'Invest',
      spacing: 4,
      labelWidth: 40,
      labelTextStyle: { color: 'gray', fontSize: 12 },
      frontColor: 'rgba(59, 130, 246, 0.3)', // Faded Blue
    }] : []),
    {
      value: analytics.current.totalInvestment,
      label: showComparison ? '' : 'Invest',
      spacing: 24,
      labelWidth: 40,
      labelTextStyle: { color: 'gray', fontSize: 12 },
      frontColor: '#3b82f6', // Blue
    },
    ...(showComparison ? [{
      value: analytics.previous.totalProfit,
      label: 'Profit',
      spacing: 4,
      labelWidth: 40,
      labelTextStyle: { color: 'gray', fontSize: 12 },
      frontColor: 'rgba(139, 92, 246, 0.3)', // Faded Purple
    }] : []),
    {
      value: analytics.current.totalProfit,
      label: showComparison ? '' : 'Profit',
      spacing: 24,
      labelWidth: 40,
      labelTextStyle: { color: 'gray', fontSize: 12 },
      frontColor: '#8b5cf6', // Purple
    },
  ];

  return (
    <LinearGradient 
      colors={['#1a1a1a', '#000000']} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Month Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => navMonth(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateDisplay}>
            <MaterialCommunityIcons name="calendar-month" size={24} color="#10b981" />
            <Text style={styles.dateText}>{formatMonth(date)}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navMonth(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {showPicker && (
            <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChange}
            />
        )}

        {loading ? (
            <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
        ) : (
            <View style={styles.cardsContainer}>

               {/* Total Sales */}
                <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.card}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Total Sales</Text>
                        <MaterialCommunityIcons name="cash-multiple" size={24} color="#fff" />
                    </View>
                    <Text style={styles.cardValue}>LKR {analytics.current.totalSales.toLocaleString()}</Text>
                    <Text style={styles.cardSubtitle}>Based on selling date</Text>
                </LinearGradient>

                {/* Total Investment */}
                <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    style={styles.card}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Total Investment</Text>
                        <MaterialCommunityIcons name="safe" size={24} color="#fff" />
                    </View>
                    <Text style={styles.cardValue}>LKR {analytics.current.totalInvestment.toLocaleString()}</Text>
                    <Text style={styles.cardSubtitle}>Cost of acquired items</Text>
                </LinearGradient>

                {/* Profit or Loss */}
                <LinearGradient
                    colors={analytics.current.totalProfit >= 0 ? ['#8b5cf6', '#7c3aed'] : ['#ef4444', '#b91c1c']}
                    style={styles.card}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Total Profit</Text>
                        <MaterialCommunityIcons name={analytics.current.totalProfit >= 0 ? "trending-up" : "trending-down"} size={24} color="#fff" />
                    </View>
                    <Text style={styles.cardValue}>LKR {analytics.current.totalProfit.toLocaleString()}</Text>
                    <Text style={styles.cardSubtitle}>{analytics.current.totalProfit >= 0 ? "Net Profit" : "Net Loss"}</Text>
                </LinearGradient>


                
                {/* Chart Section */}
                <View style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', paddingVertical: 20 }]}>
                  <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, paddingHorizontal: 10, alignItems: 'center' }}>
                     <View>
                        <Text style={[styles.cardTitle, { color: '#fff', fontSize: 18, marginBottom: 4 }]}>Overview</Text>
                        <Text style={{ color: '#888', fontSize: 12 }}>Performance Metrics</Text>
                     </View>
                     
                     <TouchableOpacity 
                        onPress={() => setShowComparison(!showComparison)}
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            backgroundColor: showComparison ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            gap: 6
                        }}
                     >
                        <Text style={{ color: showComparison ? '#10b981' : '#aaa', fontSize: 12, fontWeight: '600' }}>
                            {showComparison ? 'Compare ON' : 'Compare OFF'}
                        </Text>
                        <MaterialCommunityIcons 
                            name={showComparison ? "toggle-switch" : "toggle-switch-off"} 
                            size={24} 
                            color={showComparison ? "#10b981" : "#aaa"} 
                        />
                     </TouchableOpacity>
                  </View>

                  <BarChart
                    data={chartData}
                    barWidth={showComparison ? 16 : 28}
                    spacing={showComparison ? 12 : 40}
                    height={220}
                    width={320} // Fixed width to prevent layout crash
                    roundedTop
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: '#666', fontSize: 10 }}
                    noOfSections={4}
                    maxValue={Math.max(
                        analytics.current.totalSales, validationMax(analytics.previous.totalSales),
                        analytics.current.totalInvestment, validationMax(analytics.previous.totalInvestment),
                        analytics.current.totalProfit, validationMax(analytics.previous.totalProfit)
                    ) * 1.1 || 1000}
                    isAnimated
                    renderTooltip={(item: any, index: number) => {
                        return (
                          <View
                            style={{
                              marginBottom: 20,
                              backgroundColor: '#333',
                              padding: 6,
                              borderRadius: 4,
                            }}>
                            <Text style={{ color: '#fff', fontSize: 12 }}>{item.value.toLocaleString()}</Text>
                          </View>
                        );
                      }}
                  />
                  
                  {/* Legend */}
                  {showComparison && (
                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 12, height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 }} />
                            <Text style={{ color: '#aaa', fontSize: 12 }}>Previous Month</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: 3 }} />
                            <Text style={{ color: '#aaa', fontSize: 12 }}>Current Month</Text>
                        </View>
                    </View>
                  )}
                </View>

                {/* Stones Sold Futuristic Comparison */}
                <StonesSoldComparison 
                    current={analytics.current.stonesSold} 
                    previous={analytics.previous.stonesSold} 
                />

                

               

            </View>
        )}

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#111', 
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 8,
  },
  navButton: {
    padding: 12,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  cardValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});
