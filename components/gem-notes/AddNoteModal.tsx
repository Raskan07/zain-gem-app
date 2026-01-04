import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Note {
  id?: string;
  title: string;
  content: string;
  color: string;
  date: Timestamp | Date;
  isCompleted?: boolean;
}

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id'>) => Promise<void>;
  initialDate?: Date;
  initialNote?: Note | null;
  isEditing?: boolean;
}

const COLORS = [
  '#FFD700', // Gold/Yellow
  '#FF4D4F', // Red
  '#24F07D', // Green (Brand)
  '#0984e3', // Blue
  '#a29bfe', // Purple
  '#ffffff', // White
  '#2d3436', // Dark
];

export const AddNoteModal = ({ visible, onClose, onSave, initialDate, initialNote, isEditing = false }: AddNoteModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [date, setDate] = useState(new Date());
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialNote && isEditing) {
        setTitle(initialNote.title);
        setContent(initialNote.content);
        setSelectedColor(initialNote.color);
        const noteDate = initialNote.date instanceof Timestamp ? initialNote.date.toDate() : initialNote.date;
        setDate(noteDate);
      } else {
        // Reset for new note
        setTitle('');
        setContent('');
        setSelectedColor(COLORS[0]);
        setDate(initialDate || new Date());
      }
    }
  }, [visible, initialNote, isEditing, initialDate]);

  const handleSave = async () => {
    if (!title.trim()) {
        // Simple validation visualization could be added here
        return;
    }
    
    await onSave({
      title,
      content,
      color: selectedColor,
      date: date,
    });
    onClose();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
     if (selectedDate) {
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setDate(newDate);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.modalTitle}>{isEditing ? "Edit Note" : "New Note"}</Text>
                <TouchableOpacity onPress={onClose}>
                    <MaterialCommunityIcons name="close" size={24} color="#aaa" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Inputs */}
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter title"
                    placeholderTextColor="#666"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>Content</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter details..."
                    placeholderTextColor="#666"
                    value={content}
                    onChangeText={setContent}
                    multiline
                />

                {/* Date & Time */}
                <Text style={styles.label}>When?</Text>
                <View style={styles.dateTimeRow}>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <MaterialCommunityIcons name="calendar" size={20} color="#ccc" />
                        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
                        <MaterialCommunityIcons name="clock-outline" size={20} color="#ccc" />
                        <Text style={styles.dateText}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
                
                {showTimePicker && (
                  <DateTimePicker
                    value={date}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                  />
                )}

                {/* Color Picker */}
                <Text style={styles.label}>Color Marker</Text>
                <View style={styles.colorRow}>
                    {COLORS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorCircle,
                                { backgroundColor: color },
                                selectedColor === color && styles.selectedColor
                            ]}
                            onPress={() => setSelectedColor(color)}
                        >
                            {selectedColor === color && (
                                <MaterialCommunityIcons 
                                    name="check" 
                                    size={16} 
                                    color={color === '#ffffff' ? '#000' : (color === '#FFD700' || color === '#24F07D' ? '#000' : '#fff')} 
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <LinearGradient
                        colors={['#24F07D', '#009456']}
                        style={styles.saveGradient}
                    >
                        <Text style={styles.saveText}>{isEditing ? "Update" : "Save Note"}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    gap: 8,
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  footer: {
    flexDirection: 'row',
    marginTop: 'auto',
    paddingTop: 20,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
