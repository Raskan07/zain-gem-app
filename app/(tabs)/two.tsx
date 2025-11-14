import { BalanceCard } from '@/components/ui/balance-card';
import { SearchBar } from '@/components/ui/search-bar';
import { StockGrid } from '@/components/ui/stock-grid';
import { Stone, StoneCard } from '@/components/ui/stone-card';
import { StoneDetailsModal } from '@/components/ui/stone-details-modal';
import { stonesCollection } from '@/lib/firebase';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TabTwoScreen() {
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

  React.useEffect(() => {
    // Listen for real-time updates
    const q = query(stonesCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data: Stone[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stone));
      setStones(data);
    });
    return () => unsubscribe();
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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceSection}>
            <BalanceCard
              balance={stones.reduce((sum, s) => sum + (s.totalCost || 0), 0).toLocaleString()}
              subtitle="Total Investment"
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
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

          {/* Stones List */}
          <View style={styles.stonesList}>
            {filteredStones.length === 0 ? (
              <Text style={{ color: '#fff', textAlign: 'center', marginTop: 16 }}>No stones found.</Text>
            ) : (
              filteredStones.map(stone => (
                <StoneCard
                  key={stone.id}
                  stone={stone}
                  onPress={handleStonePress}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Stone Details Modal */}
      <StoneDetailsModal
        stone={selectedStone}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
