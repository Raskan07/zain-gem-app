import { BalanceCard } from '@/components/ui/balance-card';
import { SearchBar } from '@/components/ui/search-bar';
import { StockGrid } from '@/components/ui/stock-grid';
import { StoneCard } from '@/components/ui/stone-card';
import { StoneDetailsModal } from '@/components/ui/stone-details-modal';
import { Stone } from '@/constants/data';
import { stonesCollection } from '@/lib/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const statusTabs = [
    { key: 'all', label: 'All Status' },
    { key: 'In Stock', label: 'In Stock' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Sold', label: 'Sold' },
  ];
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stones, setStones] = useState<Stone[]>([]);
  const [selectedStone, setSelectedStone] = useState<Stone | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    // Listen for real-time updates
    const q = query(stonesCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data: Stone[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stone));
      setStones(data);
    });
    return () => unsubscribe();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Since we are using onSnapshot, data is already real-time.
    // We'll just simulate a refresh delay for UX.
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredStones = React.useMemo(() => {
    return stones.filter(stone => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (stone.name?.toLowerCase() || '').includes(query) || (stone.customId?.toLowerCase() || '').includes(query);
      const matchesStatus = selectedStatus === 'all' || stone.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedStatus, stones]);

  const handleStonePress = (stone: Stone) => {
    setSelectedStone(stone);
    setModalVisible(true);
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <FlatList
        data={filteredStones}
        keyExtractor={item => item.id ?? item.customId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        renderItem={({ item: stone }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <StoneCard
              key={stone.id}
              stone={stone}
              onPress={handleStonePress}
            />
          </View>
        )}
        ListHeaderComponent={
          <>
            {/* Balance Card */}
            <View style={styles.balanceSection}>
                <BalanceCard
                  balance={stones.reduce((sum, s) => sum + (s.totalCost || 0), 0).toLocaleString()}
                  subtitle="Total Investment"
                  onAddPress={() => router.push('/add-stone')}
                />
            </View>

            {/* Stones Updates */}
            <View style={styles.gridSection}>
              <StockGrid
                totalStones={stones.length}
                inStock={stones.filter(s => s.status === 'In Stock').length}
                sold={stones.filter(s => s.status === 'Sold').length}
                pending={stones.filter(s => s.status === 'Pending').length}
              />
            </View>

            {/* Search and Filters */}
            <View style={styles.listSection}>
              <View>
                <Text className="text-white text-[39px]" style={{ fontFamily: 'Orbitron' }}>
                  Stones
                </Text>
              </View>
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

              {/* Status Tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
                {statusTabs.map(tab => (
                  <Text
                    key={tab.key}
                    style={[styles.tab, selectedStatus === tab.key && styles.tabSelected]}
                    onPress={() => setSelectedStatus(tab.key)}
                  >
                    {tab.label}
                  </Text>
                ))}
              </ScrollView>
            </View>
          </>
        }
        ListEmptyComponent={
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 16 }}>No stones found.</Text>
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      {/* Stone Details Modal */}
      <StoneDetailsModal
        stone={selectedStone}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    paddingBottom: 20,
  },
  balanceSection: {
    padding: 16,
    marginBottom: 8,
  },
  gridSection: {
    padding: 16,
    marginBottom: 16,
  },
  listSection: {
    padding: 16,
    gap: 16,
  },
  stonesList: {
    gap: 12,
    paddingVertical: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    gap: 8,
  },
  tab: {
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#222',
    marginRight: 8,
    fontSize: 16,
    overflow: 'hidden',
  },
  tabSelected: {
    backgroundColor: '#fff',
    color: '#000',
    fontWeight: 'bold',
  },
  pagerView: {
    height: 320,
    marginTop: 8,
  },
});
