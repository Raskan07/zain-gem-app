import { db, storage } from '@/lib/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { addDoc, collection, getDocs, limit, orderBy, query, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const STONE_NAMES = [
  "Sapphire", "Spinel", "Ruby", "TSV", "Mahange", "Crysoberal", 
  "Emerald", "Diamond", "Amethyst", "Topaz", "Garnet", "Peridot", 
  "Aquamarine", "Tourmaline", "Zircon", "Other"
];

const STATUS_OPTIONS = ["In Stock", "Pending", "Sold"];
const TREATMENT_OPTIONS = ["Natural", "Heat", "Electric"];

export default function AddStoneScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [weightInRough, setWeightInRough] = useState('');
  
  // Costs
  const [stoneCost, setStoneCost] = useState('');
  const [cuttingCost, setCuttingCost] = useState('');
  const [polishCost, setPolishCost] = useState('');
  const [treatmentCost, setTreatmentCost] = useState('');
  const [otherCost, setOtherCost] = useState('');
  
  // Sales
  const [priceToSell, setPriceToSell] = useState('');
  const [soldPrice, setSoldPrice] = useState('');
  
  // Dropdowns
  const [status, setStatus] = useState('In Stock');
  const [treatment, setTreatment] = useState('Natural');
  const [isFocusName, setIsFocusName] = useState(false);
  const [isFocusStatus, setIsFocusStatus] = useState(false);
  const [isFocusTreatment, setIsFocusTreatment] = useState(false);
  
  // Images
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Calculated Values
  const [totalCost, setTotalCost] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);

  // Calculate Total Cost
  useEffect(() => {
    const total = (parseFloat(stoneCost) || 0) +
                  (parseFloat(cuttingCost) || 0) +
                  (parseFloat(polishCost) || 0) +
                  (parseFloat(treatmentCost) || 0) +
                  (parseFloat(otherCost) || 0);
    setTotalCost(total);
  }, [stoneCost, cuttingCost, polishCost, treatmentCost, otherCost]);

  // Calculate Profit/Loss
  useEffect(() => {
    const sold = parseFloat(soldPrice) || 0;
    if (sold > 0) {
      setProfitLoss(sold - totalCost);
    } else {
      setProfitLoss(0);
    }
  }, [soldPrice, totalCost]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const uploadImagesToFirebase = async () => {
    const uploadedUrls: string[] = [];
    
    for (const uri of images) {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const storageRef = ref(storage, `stones/${Date.now()}_${filename}`);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);
      } catch (error) {
        console.error("Error uploading image: ", error);
        Alert.alert("Upload Error", "Failed to upload one or more images.");
      }
    }
    return uploadedUrls;
  };

  

  const generateCustomId = async () => {
    try {
      const q = query(collection(db, "stones"), orderBy("customIdNum", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      
      let nextNum = 1;
      if (!querySnapshot.empty) {
        const lastDoc = querySnapshot.docs[0].data();
        nextNum = (lastDoc.customIdNum || 0) + 1;
      }
      
      const customId = nextNum.toString().padStart(3, '0');
      return { customId, customIdNum: nextNum };
    } catch (error) {
      console.error("Error generating ID: ", error);
      return { customId: "001", customIdNum: 1 };
    }
  };

  const handleSubmit = async () => {
    if (!name || !weight) {
      Alert.alert("Missing Fields", "Please enter at least Name and Weight.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Images
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploading(true);
        imageUrls = await uploadImagesToFirebase();
        setUploading(false);
      }

      // 2. Generate ID
      const { customId, customIdNum } = await generateCustomId();

      // 3. Create Stone Object
      const newStone = {
        customId,
        customIdNum,
        name,
        weight: parseFloat(weight) || 0,
        weightInRough: parseFloat(weightInRough) || 0,
        stoneCost: parseFloat(stoneCost) || 0,
        cuttingCost: parseFloat(cuttingCost) || 0,
        polishCost: parseFloat(polishCost) || 0,
        treatmentCost: parseFloat(treatmentCost) || 0,
        otherCost: parseFloat(otherCost) || 0,
        totalCost,
        priceToSell: parseFloat(priceToSell) || 0,
        soldPrice: parseFloat(soldPrice) || 0,
        profitLoss,
        status,
        treatment,
        images: imageUrls,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // 4. Save to Firestore
      await addDoc(collection(db, "stones"), newStone);

      Alert.alert("Success", "Stone added successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Error adding stone: ", error);
      Alert.alert("Error", "Failed to add stone. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Stone</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Basic Info */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <Dropdown
              style={[styles.dropdown, isFocusName && { borderColor: 'blue' }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              containerStyle={styles.dropdownContainer}
              itemTextStyle={styles.itemTextStyle}
              activeColor="#333"
              data={STONE_NAMES.map(opt => ({ label: opt, value: opt }))}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocusName ? 'Select Stone Name' : '...'}
              searchPlaceholder="Search..."
              mode="modal"
              value={name}
              onFocus={() => setIsFocusName(true)}
              onBlur={() => setIsFocusName(false)}
              onChange={item => {
                setName(item.value);
                setIsFocusName(false);
              }}
              renderLeftIcon={() => (
                <AntDesign
                  style={styles.icon}
                  color={isFocusName ? 'blue' : 'black'}
                  name="safety"
                  size={20}
                />
              )}
              renderItem={(item) => (
                <View style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                </View>
              )}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <InputField label="Weight (ct)" value={weight} onChangeText={setWeight} />
            </View>
            <View style={styles.halfInput}>
              <InputField label="Rough Weight" value={weightInRough} onChangeText={setWeightInRough} />
            </View>
          </View>

          {/* Dropdowns */}
          <View style={styles.row}>
             <View style={styles.halfInput}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Status</Text>
                  <Dropdown
                    style={[styles.dropdown, isFocusStatus && { borderColor: 'blue' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    containerStyle={styles.dropdownContainer}
                    itemTextStyle={styles.itemTextStyle}
                    activeColor="#333"
                    data={STATUS_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocusStatus ? 'Select Status' : '...'}
                    searchPlaceholder="Search..."
                    mode="modal"
                    value={status}
                    onFocus={() => setIsFocusStatus(true)}
                    onBlur={() => setIsFocusStatus(false)}
                    onChange={item => {
                      setStatus(item.value);
                      setIsFocusStatus(false);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocusStatus ? 'blue' : 'black'}
                        name="safety"
                        size={20}
                      />
                    )}
                    renderItem={(item) => (
                      <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>{item.label}</Text>
                      </View>
                    )}
                  />
                </View>
             </View>
             <View style={styles.halfInput}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Treatment</Text>
                  <Dropdown
                    style={[styles.dropdown, isFocusTreatment && { borderColor: 'blue' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    containerStyle={styles.dropdownContainer}
                    itemTextStyle={styles.itemTextStyle}
                    activeColor="#333"
                    data={TREATMENT_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocusTreatment ? 'Select Treatment' : '...'}
                    searchPlaceholder="Search..."
                    mode="modal"
                    value={treatment}
                    onFocus={() => setIsFocusTreatment(true)}
                    onBlur={() => setIsFocusTreatment(false)}
                    onChange={item => {
                      setTreatment(item.value);
                      setIsFocusTreatment(false);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocusTreatment ? 'blue' : 'black'}
                        name="safety"
                        size={20}
                      />
                    )}
                    renderItem={(item) => (
                      <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>{item.label}</Text>
                      </View>
                    )}
                  />
                </View>
             </View>
          </View>

          {/* Costs */}
          <Text style={styles.sectionTitle}>Costs (LKR)</Text>
          <InputField label="Stone Cost" value={stoneCost} onChangeText={setStoneCost} />
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <InputField label="Cutting Cost" value={cuttingCost} onChangeText={setCuttingCost} />
            </View>
            <View style={styles.halfInput}>
              <InputField label="Polish Cost" value={polishCost} onChangeText={setPolishCost} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <InputField label="Treatment Cost" value={treatmentCost} onChangeText={setTreatmentCost} />
            </View>
            <View style={styles.halfInput}>
              <InputField label="Other Cost" value={otherCost} onChangeText={setOtherCost} />
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Cost:</Text>
            <Text style={styles.summaryValue}>{totalCost.toLocaleString()} LKR</Text>
          </View>

          {/* Sales */}
          <Text style={styles.sectionTitle}>Sales Info (LKR)</Text>
          <InputField label="Price to Sell" value={priceToSell} onChangeText={setPriceToSell} />
          <InputField label="Sold Price" value={soldPrice} onChangeText={setSoldPrice} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Profit / Loss:</Text>
            <Text style={[styles.summaryValue, { color: profitLoss >= 0 ? '#24F07D' : '#FF4D4F' }]}>
              {profitLoss.toLocaleString()} LKR
            </Text>
          </View>

          

          {/* Images */}
          <Text style={styles.sectionTitle}>Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <MaterialCommunityIcons name="camera-plus" size={32} color="#666" />
              <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                  <MaterialCommunityIcons name="close-circle" size={24} color="#FF4D4F" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>Save Stone</Text>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const InputField = ({ 
  label, 
  value, 
  onChangeText, 
  keyboardType = 'numeric', 
  placeholder = '' 
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor="#666"
    />
  </View>
);




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24F07D',
    marginTop: 20,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#888',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  dropdownTrigger: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  placeholderText: {
    color: '#666',
  },
  dropdown: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
    height: 56,
  },
  dropdownContainer: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333',
    borderRadius: 12,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#666',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#fff',
  },
  iconStyle: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  icon: {
    marginRight: 5,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    borderWidth: 0,
  },
  itemTextStyle: {
    color: '#fff',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
    marginRight: 15,
  },
  addImageText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#24F07D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownItem: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
});
