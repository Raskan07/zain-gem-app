import { db } from '@/lib/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Timestamp, addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ImageViewerModal } from '../ui/image-viewer-modal';

const { width } = Dimensions.get('window');

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

interface RemaindersDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onDataChange?: () => void;
  data: Remainder | null;
}

export const RemaindersDetailsModal: React.FC<RemaindersDetailsModalProps> = ({ visible, onClose, onDataChange, data }) => {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form states
  const [editBuyerName, setEditBuyerName] = useState('');
  const [editBuyerType, setEditBuyerType] = useState<'chinese' | 'local'>('chinese');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editSellingPrice, setEditSellingPrice] = useState('');
  const [editPartyReceives, setEditPartyReceives] = useState('');
  const [editStoneCost, setEditStoneCost] = useState('');
  const [editSellingDate, setEditSellingDate] = useState(new Date());
  const [editPaymentDate, setEditPaymentDate] = useState(new Date());
  const [showEditSellingPicker, setShowEditSellingPicker] = useState(false);
  const [showEditPaymentPicker, setShowEditPaymentPicker] = useState(false);

  // Load data into edit form when edit mode is enabled
  useEffect(() => {
    if (data && isEditMode) {
      setEditBuyerName(data.buyerName || '');
      setEditBuyerType(data.buyerType as 'chinese' | 'local');
      setEditOwnerName(data.ownerName || '');
      setEditSellingPrice(data.sellingPrice?.toString() || '');
      setEditPartyReceives(data.partyReceives?.toString() || '');
      setEditStoneCost(data.stoneCost?.toString() || '');
      setEditSellingDate(data.sellingDate?.toDate() || new Date());
      setEditPaymentDate(data.paymentReceivingDate?.toDate() || new Date());
    }
  }, [isEditMode, data]);

  if (!data) return null;

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysLeft = (date: Timestamp) => {
    if (!date) return { text: 'No Date', color: '#888' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = date.toDate();
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)} Days Overdue`, color: '#ef4444' };
    if (diffDays === 0) return { text: 'Due Today', color: '#f59e0b' };
    return { text: `${diffDays} Days Left`, color: '#10b981' };
  };

  const daysLeft = data ? getDaysLeft(data.paymentReceivingDate) : { text: '', color: '' };

  const calculateEditProfit = () => {
    const sell = parseFloat(editSellingPrice) || 0;
    const cost = parseFloat(editStoneCost) || 0;
    const party = parseFloat(editPartyReceives) || 0;
    return sell - cost - party;
  };

  const handleSaveEdit = async () => {
    if (!data) return;

    try {
      setIsSaving(true);

      const durationInDays = Math.ceil((editPaymentDate.getTime() - editSellingDate.getTime()) / (1000 * 60 * 60 * 24));

      const updatedData = {
        buyerName: editBuyerType === 'local' ? editBuyerName : '',
        buyerType: editBuyerType,
        durationInDays: durationInDays > 0 ? durationInDays : 0,
        myProfit: calculateEditProfit(),
        ownerName: editOwnerName,
        partyReceives: parseFloat(editPartyReceives) || 0,
        paymentReceivingDate: Timestamp.fromDate(editPaymentDate),
        sellingDate: Timestamp.fromDate(editSellingDate),
        sellingPrice: parseFloat(editSellingPrice) || 0,
        stoneCost: parseFloat(editStoneCost) || 0,
        updatedAt: serverTimestamp(),
      };

      const remainderRef = doc(db, 'remainders', data.id);
      await updateDoc(remainderRef, updatedData);

      Alert.alert('Success', 'Remainder updated successfully');
      setIsEditMode(false);
      
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error updating remainder:', error);
      Alert.alert('Error', 'Failed to update remainder. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaymentReceived = async () => {
    if (!data) return;

    Alert.alert(
      'Confirm Payment Received',
      `Are you sure you want to mark payment as received for ${data.stoneName}? This will move the record to archives.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            try {
              setIsArchiving(true);

              // Add to archives collection
              const archivesRef = collection(db, 'archives');
              await addDoc(archivesRef, {
                ...data,
                archivedAt: serverTimestamp(),
                paymentReceivedDate: serverTimestamp(),
                originalId: data.id,
              });

              // Delete from remainders collection
              const remainderRef = doc(db, 'remainders', data.id);
              await deleteDoc(remainderRef);

              Alert.alert('Success', 'Payment marked as received and moved to archives.');
              
              // Refresh data and close modal
              if (onDataChange) {
                onDataChange();
              }
              onClose();
            } catch (error) {
              console.error('Error archiving remainder:', error);
              Alert.alert('Error', 'Failed to archive the remainder. Please try again.');
            } finally {
              setIsArchiving(false);
            }
          },
        },
      ]
    );
  };

  const generatePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #000000; }
              h1 { color: #000000; border-bottom: 2px solid #eee; padding-bottom: 10px; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 14px; font-weight: bold; color: #000000; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
              .label { color: #000000; font-size: 12px; }
              .value { font-weight: bold; font-size: 14px; color: #000000; }
              .price { color: #000000; }
              .overdue { color: #ef4444; }
              .due-today { color: #f59e0b; }
              img { max-width: 100%; border-radius: 8px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <h1>${data.stoneName}</h1>
            <p style="font-size: 12px; color: #666;">Status: ${data.status.toUpperCase()}</p>
            
            <div class="section">
              <div class="section-title">Financials</div>
              <div class="row"><span class="label">Selling Price</span><span class="value price">LKR ${Number(data.sellingPrice).toLocaleString()}</span></div>
              <div class="row"><span class="label">My Profit</span><span class="value price">LKR ${Number(data.myProfit).toLocaleString()}</span></div>
              <div class="row"><span class="label">Party Receives</span><span class="value price">LKR ${Number(data.partyReceives).toLocaleString()}</span></div>
              <div class="row"><span class="label">Stone Cost</span><span class="value price">LKR ${Number(data.stoneCost).toLocaleString()}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Transaction Details</div>
              <div class="row"><span class="label">Buyer Name</span><span class="value">${data.buyerName}</span></div>
              <div class="row"><span class="label">Buyer Type</span><span class="value">${data.buyerType}</span></div>
              <div class="row"><span class="label">Owner Name</span><span class="value">${data.ownerName}</span></div>
              <div class="row"><span class="label">Stone Owner</span><span class="value">${data.stoneOwner}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Timeline</div>
              <div class="row"><span class="label">Selling Date</span><span class="value">${formatDate(data.sellingDate)}</span></div>
              <div class="row"><span class="label">Payment Due</span><span class="value">${formatDate(data.paymentReceivingDate)}</span></div>
              <div class="row"><span class="label">Duration</span><span class="value">${data.durationInDays} Days</span></div>
            </div>

            <div class="section">
              <div class="section-title">Stone Info</div>
              <div class="row"><span class="label">Stone Name</span><span class="value">${data.stoneName}</span></div>
              <div class="row"><span class="label">Weight</span><span class="value">${data.stoneWeight} crt</span></div>
            </div>

            ${data.receiptImage ? `
              <div class="section">
                <div class="section-title">Receipt</div>
                <img src="${data.receiptImage}" />
              </div>
            ` : ''}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const DetailItem = ({ label, value, icon, isPrice = false, color = '#fff' }: any) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <MaterialCommunityIcons name={icon} size={20} color="#888" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, { color: isPrice ? '#10b981' : color }]}>
          {isPrice ? `LKR ${Number(value).toLocaleString()}` : value}
        </Text>
      </View>
    </View>
  );

  const EditInput = ({ label, value, onChangeText, keyboardType = 'default', placeholder = '' }: any) => (
    <View style={styles.editInputContainer}>
      <Text style={styles.editLabel}>{label}</Text>
      <TextInput
        style={styles.editInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#666"
      />
    </View>
  );

  const EditDateInput = ({ label, date, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.editInputContainer}>
      <Text style={styles.editLabel}>{label}</Text>
      <View style={styles.editDateDisplay}>
        <Text style={styles.editDateText}>{date.toLocaleDateString()}</Text>
        <MaterialCommunityIcons name="calendar" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#121212', '#000000']}
            style={styles.modalContent}
          >
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>{data.stoneName}</Text>
                <Text style={styles.headerSubtitle}>{isEditMode ? 'EDIT MODE' : data.status.toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {!isEditMode ? (
                  <>
                    {/* View Mode */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Financials</Text>
                      <View style={styles.grid}>
                        <DetailItem label="Selling Price" value={data.sellingPrice} icon="cash" isPrice />
                        <DetailItem label="My Profit" value={data.myProfit} icon="cash-plus" isPrice />
                        <DetailItem label="Party Receives" value={data.partyReceives} icon="hand-coin" isPrice />
                        <DetailItem label="Stone Cost" value={data.stoneCost} icon="tag-outline" isPrice />
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Transaction Details</Text>
                      <DetailItem label="Buyer Name" value={data.buyerName || 'N/A'} icon="account" />
                      <DetailItem label="Buyer Type" value={data.buyerType} icon="account-group" />
                      <DetailItem label="Owner Name" value={data.ownerName || 'N/A'} icon="crown" />
                      <DetailItem label="Stone Owner" value={data.stoneOwner} icon="account-tie" />
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Timeline</Text>
                      <DetailItem label="Selling Date" value={formatDate(data.sellingDate)} icon="calendar" />
                      <DetailItem label="Payment Due" value={formatDate(data.paymentReceivingDate)} icon="calendar-clock" color="#f59e0b" />
                      <DetailItem label="Time Remaining" value={daysLeft.text} icon="clock-outline" color={daysLeft.color} />
                      <DetailItem label="Duration" value={`${data.durationInDays} Days`} icon="timer-sand" />
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Stone Info</Text>
                      <DetailItem label="Stone Name" value={data.stoneName} icon="diamond-stone" />
                      <DetailItem label="Weight" value={`${data.stoneWeight} crt`} icon="weight" />
                    </View>

                    {data.receiptImage ? (
                       <View style={styles.section}>
                          <Text style={styles.sectionTitle}>Receipt</Text>
                          <TouchableOpacity onPress={() => setIsViewerVisible(true)}>
                            <Image source={{ uri: data.receiptImage }} style={styles.receiptImage} resizeMode="cover" />
                          </TouchableOpacity>
                       </View>
                    ) : null}

                    <TouchableOpacity 
                      style={[styles.downloadButton, isGeneratingPdf && styles.downloadButtonDisabled]} 
                      onPress={generatePdf}
                      disabled={isGeneratingPdf}
                    >
                      {isGeneratingPdf ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <>
                          <Text style={styles.downloadButtonText}>Download PDF</Text>
                          <MaterialCommunityIcons name="file-pdf-box" size={24} color="#000" />
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Action Buttons with Gradients */}
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity 
                        style={[styles.actionButtonWrapper, { flex: 1, marginRight: 6 }]}
                        onPress={handlePaymentReceived}
                        disabled={isArchiving}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#10b981', '#059669']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.actionButton, isArchiving && styles.actionButtonDisabled]}
                        >
                          {isArchiving ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <MaterialCommunityIcons name="cash-check" size={20} color="#fff" />
                              <Text style={styles.actionButtonText}>Payment Received</Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.actionButtonWrapper, { flex: 1, marginLeft: 6 }]}
                        onPress={() => setIsEditMode(true)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#6366f1', '#4f46e5']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.actionButton}
                        >
                          <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Edit</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Edit Mode */}
                    <View style={styles.editSection}>
                      <Text style={styles.sectionTitle}>Buyer Details</Text>
                      <View style={styles.toggleContainer}>
                        <TouchableOpacity 
                          style={[styles.toggleButton, editBuyerType === 'chinese' && styles.toggleActive]}
                          onPress={() => setEditBuyerType('chinese')}
                        >
                          <Text style={[styles.toggleText, editBuyerType === 'chinese' && styles.toggleTextActive]}>Chinese</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.toggleButton, editBuyerType === 'local' && styles.toggleActive]}
                          onPress={() => setEditBuyerType('local')}
                        >
                          <Text style={[styles.toggleText, editBuyerType === 'local' && styles.toggleTextActive]}>Local</Text>
                        </TouchableOpacity>
                      </View>
                      {editBuyerType === 'local' && (
                        <EditInput 
                          label="Buyer Name" 
                          value={editBuyerName} 
                          onChangeText={setEditBuyerName}
                          placeholder="Enter buyer name"
                        />
                      )}
                    </View>

                    <View style={styles.editSection}>
                      <Text style={styles.sectionTitle}>Financials</Text>
                      <EditInput 
                        label="Selling Price (LKR)" 
                        value={editSellingPrice} 
                        onChangeText={setEditSellingPrice}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <EditInput 
                        label="Party Receives (LKR)" 
                        value={editPartyReceives} 
                        onChangeText={setEditPartyReceives}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <EditInput 
                        label="Stone Cost (LKR)" 
                        value={editStoneCost} 
                        onChangeText={setEditStoneCost}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <View style={styles.profitDisplay}>
                        <Text style={styles.profitLabel}>Estimated Profit</Text>
                        <Text style={[styles.profitValue, { color: calculateEditProfit() >= 0 ? '#10b981' : '#ef4444' }]}>
                          LKR {calculateEditProfit().toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.editSection}>
                      <Text style={styles.sectionTitle}>Timeline</Text>
                      <EditDateInput 
                        label="Selling Date" 
                        date={editSellingDate} 
                        onPress={() => setShowEditSellingPicker(true)} 
                      />
                      <EditDateInput 
                        label="Payment Due Date" 
                        date={editPaymentDate} 
                        onPress={() => setShowEditPaymentPicker(true)} 
                      />
                      <View style={styles.profitDisplay}>
                        <Text style={styles.profitLabel}>Duration</Text>
                        <Text style={styles.profitValue}>
                          {Math.max(0, Math.ceil((editPaymentDate.getTime() - editSellingDate.getTime()) / (1000 * 60 * 60 * 24)))} Days
                        </Text>
                      </View>

                      {showEditSellingPicker && (
                        <DateTimePicker
                          value={editSellingDate}
                          mode="date"
                          display="default"
                          onChange={(event, date) => {
                            setShowEditSellingPicker(false);
                            if (date) setEditSellingDate(date);
                          }}
                        />
                      )}
                      
                      {showEditPaymentPicker && (
                        <DateTimePicker
                          value={editPaymentDate}
                          mode="date"
                          display="default"
                          onChange={(event, date) => {
                            setShowEditPaymentPicker(false);
                            if (date) setEditPaymentDate(date);
                          }}
                        />
                      )}
                    </View>

                    <View style={styles.editSection}>
                      <Text style={styles.sectionTitle}>Owner Details</Text>
                      <EditInput 
                        label="Owner Name" 
                        value={editOwnerName} 
                        onChangeText={setEditOwnerName}
                        placeholder="Enter owner name"
                      />
                    </View>

                    {/* Edit Action Buttons */}
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity 
                        style={[styles.actionButtonWrapper, { flex: 1, marginRight: 6 }]}
                        onPress={() => setIsEditMode(false)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#6b7280', '#4b5563']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.actionButton}
                        >
                          <MaterialCommunityIcons name="close" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.actionButtonWrapper, { flex: 1, marginLeft: 6 }]}
                        onPress={handleSaveEdit}
                        disabled={isSaving}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#10b981', '#059669']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.actionButton, isSaving && styles.actionButtonDisabled]}
                        >
                          {isSaving ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                              <Text style={styles.actionButtonText}>Save Changes</Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                <ImageViewerModal
                  visible={isViewerVisible}
                  imageUrl={data.receiptImage}
                  onClose={() => setIsViewerVisible(false)}
                />

              </ScrollView>
            </KeyboardAvoidingView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  downloadButton: {
    backgroundColor: '#24F07D',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    gap: 8,
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  downloadButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Edit Mode Styles
  editSection: {
    marginBottom: 24,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  editInputContainer: {
    marginBottom: 16,
  },
  editLabel: {
    color: '#ccc',
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editDateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editDateText: {
    color: '#fff',
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  toggleText: {
    color: '#999',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#000',
  },
  profitDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  profitLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profitValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
