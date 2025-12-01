import { RemaindersCard } from '@/components/remainders-card';
import { RemaindersDetailsModal } from '@/components/remainders-details-modal';
import { SearchBar } from '@/components/ui/search-bar';
import { db } from '@/lib/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function OldArchivesScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [archivesList, setArchivesList] = useState<Remainder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRemainder, setSelectedRemainder] = useState<Remainder | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      const archivesRef = collection(db, 'archives');
      const snapshot = await getDocs(archivesRef);
      
      const fetchedArchives: Remainder[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data() as Omit<Remainder, 'id'>;
        fetchedArchives.push({ ...data, id: doc.id });
      });

      setArchivesList(fetchedArchives);

    } catch (error) {
      console.error("Error fetching archives data:", error);
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

  return (
    <LinearGradient 
      colors={['#1a1a1a', '#000000']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Old Archives</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <SearchBar 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          placeholder="Search archives..."
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <Text style={styles.sectionTitle}>Archived Remainders</Text>
        
        <View style={styles.listContainer}>
          {archivesList
            .filter(item => 
              item.stoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => (
              <RemaindersCard 
                key={item.id} 
                data={item} 
                onPress={() => {
                  setSelectedRemainder(item);
                  setModalVisible(true);
                }} 
              />
            ))}
            {archivesList.length === 0 && !loading && (
                <Text style={styles.emptyText}>No archives found.</Text>
            )}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <RemaindersDetailsModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        data={selectedRemainder} 
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
    paddingBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyText: {
      color: '#888',
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
  }
});
