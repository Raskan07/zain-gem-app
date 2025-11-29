import { Stone, formatCurrency } from '@/constants/data';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImageViewerModal } from '../image-viewer-modal';

interface StoneDetailsModalProps {
  stone: Stone | null;
  visible: boolean;
  onClose: () => void;
}

export const StoneDetailsModal: React.FC<StoneDetailsModalProps> = ({ stone, visible, onClose }) => {
  if (!stone) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  const DetailRow = ({ label, value, valueStyle }: { label: string; value: string | number; valueStyle?: any }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
    </View>
  );

  const date = stone.createdAt ? new Date(stone.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }) : '';

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
            <TouchableOpacity style={styles.bookButton}>
              <Text style={{ color: '#000', fontSize: 18, fontWeight: '600' }}>Download</Text>
              <MaterialCommunityIcons name="download" size={20} color="#000" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
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
    maxHeight: '80%',
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
  bookButton: {
    backgroundColor: '#24F07D',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
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