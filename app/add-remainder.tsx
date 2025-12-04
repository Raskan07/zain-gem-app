import { db, storage } from '@/lib/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


export default function AddRemainderScreen() {
  const [loading, setLoading] = useState(false);

  
  // Logic 1: Stone Source
  const [stoneSource, setStoneSource] = useState<'inventory' | 'manual'>('inventory');
  const [customId, setCustomId] = useState('');
  const [stoneLoading, setStoneLoading] = useState(false);
  
  // Logic 2: Ownership
  const [ownership, setOwnership] = useState<'mine' | 'thirdParty'>('mine');
  const [ownerName, setOwnerName] = useState('');

  // Logic 3: Buyer
  const [buyerType, setBuyerType] = useState<'chinese' | 'local'>('chinese');
  const [buyerName, setBuyerName] = useState('');

  // Form Fields
  const [stoneName, setStoneName] = useState('');
  const [stoneWeight, setStoneWeight] = useState('');
  const [stoneCost, setStoneCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [partyReceives, setPartyReceives] = useState('0');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Dates
  const [sellingDate, setSellingDate] = useState(new Date());
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [showSellingPicker, setShowSellingPicker] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);



  const fetchStoneByCustomId = async () => {
    if (!customId.trim()) {
      Alert.alert('Error', 'Please enter a Custom ID');
      return;
    }

    setStoneLoading(true);
    try {
      const stonesRef = collection(db, 'stones');
      const q = query(stonesRef, where('customId', '==', customId.trim()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const stoneData = snapshot.docs[0].data();
        setStoneName(stoneData.name || '');
        setStoneWeight(stoneData.weight?.toString() || '');
        setStoneCost(stoneData.stoneCost?.toString() || '');
        Alert.alert('Success', 'Stone data loaded!');
      } else {
        Alert.alert('Not Found', 'No stone found with this Custom ID');
        setStoneName('');
        setStoneWeight('');
        setStoneCost('');
      }
    } catch (error) {
      console.error('Error fetching stone:', error);
      Alert.alert('Error', 'Failed to fetch stone data');
    } finally {
      setStoneLoading(false);
    }
  };



  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `receipts/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const calculateProfit = () => {
    const sell = parseFloat(sellingPrice) || 0;
    const cost = parseFloat(stoneCost) || 0;
    const party = parseFloat(partyReceives) || 0;
    return sell - cost - party;
  };

  const handleSubmit = async () => {
    if (!stoneName || !sellingPrice) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (receiptImage) {
        imageUrl = await uploadImage(receiptImage);
      }

      const durationInDays = Math.ceil((paymentDate.getTime() - sellingDate.getTime()) / (1000 * 60 * 60 * 24));

      const remainderData = {
        buyerName: buyerType === 'local' ? buyerName : '',
        buyerType: buyerType,
        createdAt: Timestamp.now(),
        durationInDays: durationInDays > 0 ? durationInDays : 0,
        myProfit: calculateProfit(),
        ownerName: ownership === 'thirdParty' ? ownerName : '',
        partyReceives: parseFloat(partyReceives) || 0,
        paymentReceivingDate: Timestamp.fromDate(paymentDate),
        receiptImage: imageUrl,
        sellingDate: Timestamp.fromDate(sellingDate),
        sellingPrice: parseFloat(sellingPrice) || 0,
        status: 'pending',
        stoneCost: parseFloat(stoneCost) || 0,
        stoneName: stoneName,
        stoneOwner: ownership === 'mine' ? 'me' : ownerName,
        stoneWeight: parseFloat(stoneWeight) || 0,
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'remainders'), remainderData);
      Alert.alert('Success', 'Remainder created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating remainder:', error);
      Alert.alert('Error', 'Failed to create remainder');
    } finally {
      setLoading(false);
    }
  };

  const DateInput = ({ label, date, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dateDisplay}>
        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        <MaterialCommunityIcons name="calendar" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>New Remainder</Text>
        </View>

        {/* Logic 1: Stone Source */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stone Details</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, stoneSource === 'inventory' && styles.toggleActive]}
              onPress={() => setStoneSource('inventory')}
            >
              <Text style={[styles.toggleText, stoneSource === 'inventory' && styles.toggleTextActive]}>By ID</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, stoneSource === 'manual' && styles.toggleActive]}
              onPress={() => setStoneSource('manual')}
            >
              <Text style={[styles.toggleText, stoneSource === 'manual' && styles.toggleTextActive]}>Manual Entry</Text>
            </TouchableOpacity>
          </View>

          {stoneSource === 'inventory' && (
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Custom ID</Text>
                <TextInput 
                  style={styles.input} 
                  value={customId} 
                  onChangeText={setCustomId}
                  placeholder="e.g. 001"
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity 
                style={styles.loadButton} 
                onPress={fetchStoneByCustomId}
                disabled={stoneLoading}
              >
                {stoneLoading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.loadButtonText}>Load</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Stone Name</Text>
            <TextInput 
              style={[styles.input, stoneSource === 'inventory' && styles.readOnlyInput]} 
              value={stoneName} 
              onChangeText={setStoneName}
              placeholder="Enter stone name"
              placeholderTextColor="#999"
              editable={stoneSource === 'manual'}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Weight (ct)</Text>
              <TextInput 
                style={[styles.input, stoneSource === 'inventory' && styles.readOnlyInput]} 
                value={stoneWeight} 
                onChangeText={setStoneWeight}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#999"
                editable={stoneSource === 'manual'}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Cost (LKR)</Text>
              <TextInput 
                style={[styles.input, stoneSource === 'inventory' && styles.readOnlyInput]} 
                value={stoneCost} 
                onChangeText={setStoneCost}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
                editable={stoneSource === 'manual'}
              />
            </View>
          </View>
        </View>

        {/* Logic 2: Ownership */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ownership</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, ownership === 'mine' && styles.toggleActive]}
              onPress={() => setOwnership('mine')}
            >
              <Text style={[styles.toggleText, ownership === 'mine' && styles.toggleTextActive]}>Mine</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, ownership === 'thirdParty' && styles.toggleActive]}
              onPress={() => setOwnership('thirdParty')}
            >
              <Text style={[styles.toggleText, ownership === 'thirdParty' && styles.toggleTextActive]}>Third Party</Text>
            </TouchableOpacity>
          </View>

          {ownership === 'thirdParty' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Owner Name</Text>
              <TextInput 
                style={styles.input} 
                value={ownerName} 
                onChangeText={setOwnerName}
                placeholder="Enter owner name"
                placeholderTextColor="#666"
              />
            </View>
          )}
        </View>

        {/* Logic 3: Buyer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buyer Details</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, buyerType === 'chinese' && styles.toggleActive]}
              onPress={() => setBuyerType('chinese')}
            >
              <Text style={[styles.toggleText, buyerType === 'chinese' && styles.toggleTextActive]}>Chinese</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, buyerType === 'local' && styles.toggleActive]}
              onPress={() => setBuyerType('local')}
            >
              <Text style={[styles.toggleText, buyerType === 'local' && styles.toggleTextActive]}>Local</Text>
            </TouchableOpacity>
          </View>

          {buyerType === 'local' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Buyer Name</Text>
              <TextInput 
                style={styles.input} 
                value={buyerName} 
                onChangeText={setBuyerName}
                placeholder="Enter buyer name"
                placeholderTextColor="#666"
              />
            </View>
          )}
        </View>

        {/* Financials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financials</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Selling Price (LKR)</Text>
            <TextInput 
              style={styles.input} 
              value={sellingPrice} 
              onChangeText={setSellingPrice}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Party Receives (LKR)</Text>
            <TextInput 
              style={styles.input} 
              value={partyReceives} 
              onChangeText={setPartyReceives}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>Estimated Profit</Text>
            <Text style={[styles.summaryValue, { color: calculateProfit() >= 0 ? '#10b981' : '#ef4444' }]}>
              LKR {calculateProfit().toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <DateInput 
            label="Selling Date" 
            date={sellingDate} 
            onPress={() => setShowSellingPicker(true)} 
          />
          <DateInput 
            label="Payment Due Date" 
            date={paymentDate} 
            onPress={() => setShowPaymentPicker(true)} 
          />
          
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>
              {Math.max(0, Math.ceil((paymentDate.getTime() - sellingDate.getTime()) / (1000 * 60 * 60 * 24)))} Days
            </Text>
          </View>

          {showSellingPicker && (
            <DateTimePicker
              value={sellingDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowSellingPicker(false);
                if (date) setSellingDate(date);
              }}
            />
          )}
          
          {showPaymentPicker && (
            <DateTimePicker
              value={paymentDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowPaymentPicker(false);
                if (date) setPaymentDate(date);
              }}
            />
          )}
        </View>

        {/* Receipt Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt Image</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {receiptImage ? (
              <Image source={{ uri: receiptImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons name="camera-plus" size={32} color="#666" />
                <Text style={styles.placeholderText}>Tap to upload receipt</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Create Remainder</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981', // Emerald Green
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#ccc',
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  readOnlyInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: '#aaa',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  loadButton: {
    backgroundColor: '#f59e0b', // Amber
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  dateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePicker: {
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#24F07D',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
