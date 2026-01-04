import { AddNoteModal } from '@/components/gem-notes/AddNoteModal';
import { db } from '@/lib/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  date: Timestamp;
  createdAt: Timestamp;
  isCompleted: boolean;
}

export default function GemNotesScreen() {
  const router = useRouter();
  
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'all'>('day');
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Generate days for the horizontal calendar (e.g., current month)
  const days = useMemo(() => {
    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const result = [];
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        result.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));
    }
    return result;
  }, [selectedDate]); 

  // Fetch Notes
  useEffect(() => {
    const notesRef = collection(db, "notes");
    const q = query(notesRef, orderBy("date", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(fetchedNotes);
    });

    return () => unsubscribe();
  }, []);

  // Filter notes for selected date OR show all
  const filteredNotes = useMemo(() => {
    if (viewMode === 'all') {
        return notes;
    }
    return notes.filter(note => {
      const noteDate = note.date.toDate();
      return (
        noteDate.getDate() === selectedDate.getDate() &&
        noteDate.getMonth() === selectedDate.getMonth() &&
        noteDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [notes, selectedDate, viewMode]);

  // Actions
  const handleAddNote = async (noteData: any) => {
    try {
      if (editingNote) {
        // Update
        const noteRef = doc(db, "notes", editingNote.id);
        await updateDoc(noteRef, {
            title: noteData.title,
            content: noteData.content,
            color: noteData.color,
            date: Timestamp.fromDate(noteData.date),
        });
      } else {
        // Add
        await addDoc(collection(db, "notes"), {
            ...noteData,
            date: Timestamp.fromDate(noteData.date),
            createdAt: Timestamp.now(),
            isCompleted: false,
        });
      }
      setEditingNote(null);
    } catch (error) {
        console.error("Error saving note:", error);
        Alert.alert("Error", "Could not save note.");
    }
  };

  const handleToggleComplete = async (note: Note) => {
    try {
        const noteRef = doc(db, "notes", note.id);
        await updateDoc(noteRef, { isCompleted: !note.isCompleted });
    } catch (e) {
        console.error(e);
    }
  };

  const handleDelete = (note: Note) => {
    Alert.alert(
        "Delete Note",
        "Are you sure you want to delete this note?",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive", 
                onPress: async () => {
                    await deleteDoc(doc(db, "notes", note.id));
                }
            }
        ]
    );
  };

  const openAddModal = () => {
    setEditingNote(null);
    setModalVisible(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setModalVisible(true);
  };

  // Components
  const DateItem = ({ date }: { date: Date }) => {
    const isSelected = date.getDate() === selectedDate.getDate();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return (
        <TouchableOpacity 
            style={[styles.dateItem, isSelected && styles.selectedDateItem]}
            onPress={() => {
                setSelectedDate(date);
                setViewMode('day'); // Switch back to day view when picking a date
            }}
        >
            <Text style={[styles.dayName, isSelected && styles.selectedDateText]}>{dayName}</Text>
            <Text style={[styles.dayNum, isSelected && styles.selectedDateText]}>{date.getDate()}</Text>
        </TouchableOpacity>
    );
  };

  const NoteCard = ({ note }: { note: Note }) => {
    const date = note.date.toDate();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isLight = note.color === '#ffffff' || note.color === '#FFD700' || note.color === '#24F07D';
    
    // Show full date in 'All' view
    const dateStr = viewMode === 'all' ? date.toLocaleDateString() : '';

    return (
        <TouchableOpacity 
            style={[styles.noteCard, { backgroundColor: note.color, opacity: note.isCompleted ? 0.6 : 1 }]}
            onPress={() => openEditModal(note)}
            onLongPress={() => handleDelete(note)}
            activeOpacity={0.9}
        >
            <View style={styles.noteHeader}>
                <View style={{flexDirection: 'row', gap: 6}}>
                     {viewMode === 'all' && (
                         <Text style={[styles.noteTime, { color: isLight ? '#000' : '#fff', opacity: 0.6 }]}>{dateStr}</Text>
                     )}
                     <Text style={[styles.noteTime, { color: isLight ? '#000' : '#fff' }]}>{timeStr}</Text>
                </View>
                <TouchableOpacity onPress={() => handleToggleComplete(note)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                     <MaterialCommunityIcons 
                        name={note.isCompleted ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                        size={24} 
                        color={isLight ? '#000' : '#fff'} 
                     />
                </TouchableOpacity>
            </View>
            <Text style={[styles.noteTitle, { color: isLight ? '#000' : '#fff', textDecorationLine: note.isCompleted ? 'line-through' : 'none' }]}>
                {note.title}
            </Text>
            {note.content ? (
                <Text style={[styles.noteContent, { color: isLight ? '#333' : '#ddd' }]} numberOfLines={2}>
                    {note.content}
                </Text>
            ) : null}
            
            <View style={styles.noteFooter}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(note)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={isLight ? '#000' : '#fff'} style={{ opacity: 0.7 }} />
                </TouchableOpacity>
                 <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(note)}>
                    <MaterialCommunityIcons name="pencil" size={20} color={isLight ? '#000' : '#fff'} style={{ opacity: 0.7 }} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', '#111', '#000']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.monthTitle}>
                {viewMode === 'all' ? 'All Notes' : selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setViewMode(prev => prev === 'day' ? 'all' : 'day')}
          >
            <MaterialCommunityIcons 
                name={viewMode === 'day' ? "note-multiple-outline" : "calendar-today"} 
                size={22} 
                color={viewMode === 'all' ? '#24F07D' : '#fff'} 
            />
          </TouchableOpacity>
        </View>

        {/* Calendar Strip - Hide if in All mode */}
        {viewMode === 'day' && (
            <View style={styles.calendarStripContainer}>
                <FlatList
                    data={days}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => <DateItem date={item} />}
                    keyExtractor={(item) => item.toISOString()}
                    contentContainerStyle={styles.calendarStripContent}
                    getItemLayout={(data, index) => ({ length: 60, offset: 60 * index, index })}
                    initialScrollIndex={Math.max(0, selectedDate.getDate() - 3)} // Center roughly
                />
            </View>
        )}

        {/* Content */}
        <View style={styles.content}>
            <Text style={styles.sectionTitle}>
                {viewMode === 'all' ? 'All Notes List' : (selectedDate.getDate() === new Date().getDate() ? "Today's Notes" : `Notes for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}`)}
            </Text>
            
            {filteredNotes.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="notebook-outline" size={64} color="#333" />
                    <Text style={styles.emptyText}>No notes found</Text>
                    <Text style={styles.emptySubtext}>Tap + to add a new note.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredNotes}
                    renderItem={({ item }) => <NoteCard note={item} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.notesList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>

        <TouchableOpacity style={styles.fab} onPress={openAddModal}>
            <LinearGradient
                colors={['#24F07D', '#00b894']}
                style={styles.fabGradient}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#000" />
            </LinearGradient>
        </TouchableOpacity>

      </SafeAreaView>

      <AddNoteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddNote}
        initialDate={selectedDate}
        initialNote={editingNote}
        isEditing={!!editingNote}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  calendarStripContainer: {
    height: 90,
    marginBottom: 10,
  },
  calendarStripContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateItem: {
    width: 50,
    height: 80,
    borderRadius: 25,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedDateItem: {
    backgroundColor: '#24F07D',
    borderColor: '#24F07D',
    transform: [{ scale: 1.05 }],
  },
  dayName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedDateText: {
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  notesList: {
    paddingBottom: 100,
  },
  noteCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTime: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    shadowColor: '#24F07D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

