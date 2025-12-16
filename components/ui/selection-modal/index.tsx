import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

interface Option {
  label: string;
  value: string;
}

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: Option) => void;
  data: Option[];
  title: string;
  searchPlaceholder?: string;
  selectedValue?: string;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  data,
  title,
  searchPlaceholder = "Search...",
  selectedValue
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const handleSelect = (item: Option) => {
    onSelect(item);
    onClose();
    setSearchQuery(''); 
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
           <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
           
           <KeyboardAvoidingView 
             behavior={Platform.OS === "ios" ? "padding" : "height"}
             style={styles.keyboardView}
           >
             <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  {/* Header */}
                  <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                      <MaterialCommunityIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* Search */}
                  <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder={searchPlaceholder}
                      placeholderTextColor="#666"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                         <MaterialCommunityIcons name="close-circle" size={18} color="#666" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* List */}
                  <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.value}
                    style={styles.list}
                    showsVerticalScrollIndicator={true}
                    renderItem={({ item }) => {
                        const isSelected = item.value === selectedValue;
                        return (
                          <TouchableOpacity 
                            style={[styles.optionItem, isSelected && styles.selectedOption]} 
                            onPress={() => handleSelect(item)}
                          >
                            <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                              {item.label}
                            </Text>
                            {isSelected && (
                                <MaterialCommunityIcons name="check" size={20} color="#24F07D" />
                            )}
                          </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No results found</Text>
                        </View>
                    }
                  />
                </View>
             </TouchableWithoutFeedback>
           </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.51,
    shadowRadius: 13.16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  closeButton: {
    padding: 4
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 44,
    borderWidth: 1,
    borderColor: '#333'
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: 44
  },
  list: {
    flexGrow: 0
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  selectedOption: {
      backgroundColor: 'rgba(36, 240, 125, 0.1)'
  },
  optionText: {
    fontSize: 16,
    color: '#ddd'
  },
  selectedOptionText: {
      color: "#24F07D",
      fontWeight: '600'
  },
  emptyContainer: {
      padding: 24,
      alignItems: 'center'
  },
  emptyText: {
      color: '#666',
      fontSize: 14
  }
});
