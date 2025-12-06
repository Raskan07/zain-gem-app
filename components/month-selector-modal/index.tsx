import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface MonthSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectMonth: (year: number, month: number) => void;
}

export const MonthSelectorModal: React.FC<MonthSelectorModalProps> = ({
  visible,
  onClose,
  selectedDate,
  onSelectMonth,
}) => {
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleSelectMonth = (monthIndex: number) => {
    onSelectMonth(selectedYear, monthIndex);
    onClose();
  };

  const handleToday = () => {
    const today = new Date();
    onSelectMonth(today.getFullYear(), today.getMonth());
    onClose();
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
              <Text style={styles.headerTitle}>Select Month</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Quick Action */}
              <TouchableOpacity onPress={handleToday} style={styles.todayButton}>
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.todayGradient}
                >
                  <Ionicons name="today" size={20} color="#fff" />
                  <Text style={styles.todayText}>Jump to Today</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Year Selector */}
              <View style={styles.yearSelector}>
                <Text style={styles.sectionTitle}>Year</Text>
                <View style={styles.yearGrid}>
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      style={[
                        styles.yearButton,
                        selectedYear === year && styles.yearButtonActive
                      ]}
                    >
                      <Text style={[
                        styles.yearText,
                        selectedYear === year && styles.yearTextActive
                      ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Month Selector */}
              <View style={styles.monthSelector}>
                <Text style={styles.sectionTitle}>Month</Text>
                <View style={styles.monthGrid}>
                  {months.map((month, index) => {
                    const isCurrentMonth = 
                      selectedYear === selectedDate.getFullYear() && 
                      index === selectedDate.getMonth();
                    
                    return (
                      <Animated.View 
                        key={month} 
                        entering={FadeIn.delay(index * 30)}
                      >
                        <TouchableOpacity
                          onPress={() => handleSelectMonth(index)}
                          style={[
                            styles.monthButton,
                            isCurrentMonth && styles.monthButtonActive
                          ]}
                        >
                          {isCurrentMonth ? (
                            <LinearGradient
                              colors={['#8b5cf6', '#7c3aed']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.monthButtonGradient}
                            >
                              <Text style={styles.monthTextActive}>{month}</Text>
                            </LinearGradient>
                          ) : (
                            <Text style={styles.monthText}>{month}</Text>
                          )}
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
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
    maxHeight: '75%',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  todayButton: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  todayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  todayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  yearSelector: {
    marginBottom: 24,
  },
  yearGrid: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  yearButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  yearButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
  },
  yearText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#888',
  },
  yearTextActive: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  monthSelector: {
    marginBottom: 20,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  monthButton: {
    width: '31%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  monthButtonActive: {
    // Active styling handled by gradient
  },
  monthButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    paddingVertical: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  monthTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
