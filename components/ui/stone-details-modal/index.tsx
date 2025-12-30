import { Stone, formatCurrency } from '@/constants/data';
import { db } from '@/lib/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImageViewerModal } from '../image-viewer-modal';

interface StoneDetailsModalProps {
  stone: Stone | null;
  visible: boolean;
  onClose: () => void;
}

export const StoneDetailsModal: React.FC<StoneDetailsModalProps> = ({ stone, visible, onClose }) => {
  const router = useRouter();
  if (!stone) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  const handleMarkAsSold = async () => {
    if (!stone.id) return;

    Alert.alert(
      "Mark as Sold",
      "Are you sure you want to mark this stone as Sold?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Mark Sold", 
          onPress: async () => {
            try {
              setIsLoading(true);
              const stoneRef = doc(db, 'stones', stone.id!);
              await updateDoc(stoneRef, {
                status: 'Sold',
                updatedAt: new Date().toISOString()
              });
              Alert.alert("Success", "Stone marked as sold");
              onClose();
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to update status");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    onClose();
    router.push({
      pathname: '/add-stone',
      params: { stoneId: stone.id }
    });
  };

  const DetailRow = ({ label, value, valueStyle }: { label: string; value: string | number; valueStyle?: any }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
    </View>
  );

  const formatDate = (dateValue: any) => {
    if (!dateValue) return '';
    
    let date: Date;
    
    // Handle Firestore Timestamp
    if (dateValue?.toDate) {
      date = dateValue.toDate();
    } else if (dateValue?.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const date = formatDate(stone.createdAt);
  const purchaseDate = formatDate(stone.purchaseDate);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>{stone.name}</Text>
            <TouchableOpacity style={styles.closeButton}>
              <MaterialCommunityIcons name="bookmark-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setIsViewerVisible(true)} activeOpacity={0.9} style={{ width: '100%' }}>
                <Image
                  source={{ uri: stone.images[0]}}
                  style={{ width: '100%', height: 220, borderRadius: 16 }}
                  resizeMode="cover"
                  onLoadStart={() => setIsLoading(true)}
                  onLoadEnd={() => setIsLoading(false)}
                />
                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#24F07D" />
                  </View>
                )}
              </TouchableOpacity>
              
              <ImageViewerModal
                visible={isViewerVisible}
                imageUrl={stone.images[0]}
                onClose={() => setIsViewerVisible(false)}
              />

              <View style={{
                position: 'absolute', bottom: 16, left: 16, borderRadius: 12, padding: 12, backgroundColor:
                  stone.status === 'Sold' ? '#FF4D4F' :
                    stone.status === 'In Stock' ? '#52C41A' :
                      stone.status === 'In Process' ? '#FFD700' :
                        '#ccc',
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 14, 
                      fontWeight: 'bold',
                    }}
                  >
                    {stone.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Stone info</Text>
              <DetailRow label="ID" value={stone.customId} />
              <DetailRow label="Name" value={stone.name} />
              <DetailRow label="Weight (Rough)" value={`${stone.weightInRough}ct`} />
              <DetailRow label="Weight" value={`${stone.weight}ct`} />
              <DetailRow label="Treatment" value={stone.treatment} />
              <DetailRow label="Date" value={date} />
              <DetailRow label="Purchase Date" value={purchaseDate} />
              {stone.notes ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={[styles.detailValue, { textAlign: 'left', marginTop: 4, color: '#ccc' }]}>
                    {stone.notes}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Costs</Text>
              <DetailRow label="Stone Cost" value={formatCurrency(stone.stoneCost)} />
              <DetailRow label="Cutting Cost" value={formatCurrency(stone.cuttingCost)} />
              <DetailRow label="Polish Cost" value={formatCurrency(stone.polishCost)} />
              <DetailRow label="Treatment Cost" value={formatCurrency(stone.treatmentCost)} />
              <DetailRow label="Other Cost" value={formatCurrency(stone.otherCost)} />
              <DetailRow label="Total Cost" value={formatCurrency(stone.totalCost)} />
            </View>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Sale Info</Text>
              <DetailRow label="Price to Sell" value={formatCurrency(stone.priceToSell)} />
              <DetailRow label="Sold Price" value={formatCurrency(stone.soldPrice)} />
              <DetailRow label="Profit/Loss" value={formatCurrency(stone.profitLoss)} valueStyle={{
                color: stone.profitLoss > 0 ? '#24F07D' : '#FF4D4F'
              }} />
            </View>
            <View style={{ gap: 12, marginTop: 16 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity 
                  style={{ flex: 1 }}
                  onPress={handleMarkAsSold}
                >
                  <LinearGradient
                    colors={['#FF4D4F', '#fa0f0bff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionButtonText}>Mark as Sold</Text>
                    <MaterialCommunityIcons name="tag-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ flex: 1 }}
                  onPress={handleEdit}
                >
                  <LinearGradient
                    colors={['#0059ffff', '#3498db']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionButtonText}>Edit Stone</Text>
                    <MaterialCommunityIcons name="pencil-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => {/* Handle download logic if any */}}>
                 <LinearGradient
                    colors={['#24F07D', '#52c41a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bookButton}
                  >
                  <Text style={{ color: '#000', fontSize: 18, fontWeight: '600' }}>Download</Text>
                  <MaterialCommunityIcons name="download" size={20} color="#000" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    fontSize: 16,
    color: '#888888',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00D492',
    marginTop: 12,
    marginBottom: 8,
  },
  bookButton: { // Removed background color as it is now in LinearGradient
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: { // Removed background color as it is now in LinearGradient
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600'
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 18, 18, 0.5)',
  },
});


// fix 
// invalid date shown 