import { Stone } from '@/constants/data';
import { db } from '@/lib/firebase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { RemaindersDetailsModal } from '../remainders-details-modal';
import { StoneDetailsModal } from '../ui/stone-details-modal';

interface ActivityItem {
  id: string;
  name: string;
  type: 'stone' | 'remainder';
}

interface ActivityDetailModalProps {
  visible: boolean;
  onClose: () => void;
  date: Date;
  stones: ActivityItem[];
  remainders: ActivityItem[];
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  visible,
  onClose,
  date,
  stones,
  remainders,
}) => {
  const router = useRouter();
  const [selectedStone, setSelectedStone] = useState<Stone | null>(null);
  const [selectedRemainder, setSelectedRemainder] = useState<any | null>(null);
  const [showStoneModal, setShowStoneModal] = useState(false);
  const [showRemainderModal, setShowRemainderModal] = useState(false);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleStonePress = async (stoneId: string) => {
    try {
      const stoneDoc = await getDoc(doc(db, 'stones', stoneId));
      if (stoneDoc.exists()) {
        const stoneData = { id: stoneDoc.id, ...stoneDoc.data() } as Stone;
        setSelectedStone(stoneData);
        setShowStoneModal(true);
      }
    } catch (error) {
      console.error('Error fetching stone:', error);
    }
  };

  const handleRemainderPress = async (remainderId: string) => {
    try {
      const remainderDoc = await getDoc(doc(db, 'remainders', remainderId));
      if (remainderDoc.exists()) {
        const remainderData = { id: remainderDoc.id, ...remainderDoc.data() };
        setSelectedRemainder(remainderData);
        setShowRemainderModal(true);
      }
    } catch (error) {
      console.error('Error fetching remainder:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <Animated.View entering={SlideInDown.springify()} style={styles.modalContainer}>
          <LinearGradient
            colors={['#1f1f1f', '#1a1a1a']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons name="calendar-check" size={24} color="#fff" />
                <View>
                  <Text style={styles.headerTitle}>Activity Details</Text>
                  <Text style={styles.headerDate}>{formatDate(date)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Stones Section */}
              {stones.length > 0 && (
                <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sectionBadge}
                    >
                      <MaterialCommunityIcons name="diamond-stone" size={16} color="#fff" />
                      <Text style={styles.sectionBadgeText}>{stones.length}</Text>
                    </LinearGradient>
                    <Text style={styles.sectionTitle}>Stones Added</Text>
                  </View>
                  
                  {stones.map((stone, index) => (
                    <TouchableOpacity
                      key={stone.id}
                      onPress={() => handleStonePress(stone.id)}
                      activeOpacity={0.7}
                    >
                      <Animated.View 
                        entering={FadeIn.delay(150 + index * 50)}
                        style={styles.itemCard}
                      >
                        <View style={styles.itemIcon}>
                          <MaterialCommunityIcons name="diamond-stone" size={20} color="#10b981" />
                        </View>
                        <Text style={styles.itemName}>{stone.name}</Text>
                        <TouchableOpacity style={styles.itemArrow}>
                          <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                      </Animated.View>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}

              {/* Remainders Section */}
              {remainders.length > 0 && (
                <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={['#8b5cf6', '#7c3aed']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sectionBadge}
                    >
                      <MaterialCommunityIcons name="clock-outline" size={16} color="#fff" />
                      <Text style={styles.sectionBadgeText}>{remainders.length}</Text>
                    </LinearGradient>
                    <Text style={styles.sectionTitle}>Remainders Added</Text>
                  </View>
                  
                  {remainders.map((remainder, index) => (
                    <TouchableOpacity
                      key={remainder.id}
                      onPress={() => handleRemainderPress(remainder.id)}
                      activeOpacity={0.7}
                    >
                      <Animated.View 
                        entering={FadeIn.delay(250 + index * 50)}
                        style={styles.itemCard}
                      >
                        <View style={styles.itemIcon}>
                          <MaterialCommunityIcons name="clock-outline" size={20} color="#8b5cf6" />
                        </View>
                        <Text style={styles.itemName}>{remainder.name}</Text>
                        <TouchableOpacity style={styles.itemArrow}>
                          <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                      </Animated.View>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}

              {/* Empty State */}
              {stones.length === 0 && remainders.length === 0 && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="calendar-blank" size={48} color="#444" />
                  <Text style={styles.emptyText}>No activity on this day</Text>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  onClose();
                  router.push('/two');
                }}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="diamond-stone" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>View All Stones</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  onClose();
                  router.push('/s&r');
                }}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>View Remainders</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Stone Details Modal */}
      <StoneDetailsModal
        stone={selectedStone}
        visible={showStoneModal}
        onClose={() => setShowStoneModal(false)}
      />

      {/* Remainder Details Modal */}
      <RemaindersDetailsModal
        data={selectedRemainder}
        visible={showRemainderModal}
        onClose={() => setShowRemainderModal(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  itemArrow: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
