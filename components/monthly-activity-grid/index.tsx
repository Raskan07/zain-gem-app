import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Define interface locally if not exported, or export from index.tsx and import.
// Better to define locally or in a shared types file.
// For now, I'll redefine compatible interface to avoid circular imports.
interface StoneData {
  id: string;
  name: string;
  status: string;
  count?: number; // handle dynamic
  type?: 'stone' | 'remainder' | 'both' | 'none';
  dayNumber?: number;
  date?: Date;
}

// Redefine to match what is passed
interface ActivityDataItem {
  date: Date;
  dayNumber: number;
  stones: any[];
  remainders: any[];
  count: number;
  type: 'stone' | 'remainder' | 'both' | 'none';
}

interface MonthlyActivityGridProps {
  data: ActivityDataItem[];
  selectedDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onShowMonthSelector: () => void;
  onActivityPress: (activity: ActivityDataItem) => void;
}

export const MonthlyActivityGrid: React.FC<MonthlyActivityGridProps> = ({
  data,
  selectedDate,
  onNavigateMonth,
  onShowMonthSelector,
  onActivityPress,
}) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const cellSize = (width - 80) / 7;

  return (
    <View style={styles.activityGridContainer}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => onNavigateMonth('prev')} style={styles.monthNavButton}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onShowMonthSelector} style={styles.monthTitle}>
          <Text style={styles.monthTitleText}>{monthName}</Text>
          <Ionicons name="chevron-down" size={16} color="#888" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => onNavigateMonth('next')} style={styles.monthNavButton}>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Days of week labels */}
      <View style={styles.weekLabels}>
        {daysOfWeek.map((day, i) => (
          <Text key={i} style={[styles.weekLabel, { width: cellSize }]}>
            {day.substring(0, 1)}
          </Text>
        ))}
      </View>

      {/* Activity grid */}
      <View style={styles.gridRows}>
        {Array.from({ length: Math.ceil(data.length / 7) }).map((_, weekIndex) => (
          <View key={weekIndex} style={styles.gridRow}>
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dataIndex = weekIndex * 7 + dayIndex;
              const activity = data[dataIndex];
              
              if (!activity) return <View key={dayIndex} style={{ width: cellSize, height: cellSize }} />;

              const isCurrentMonth = activity.dayNumber > 0;
              const isToday = activity.date.toDateString() === new Date().toDateString();
              
              let bgColor = isCurrentMonth ? '#2a2a2a' : '#1a1a1a';
              if (activity.count > 0) {
                if (activity.type === 'both') {
                  bgColor = '#FCD34D';
                } else if (activity.type === 'stone') {
                  bgColor = '#10b981';
                } else if (activity.type === 'remainder') {
                  bgColor = '#8b5cf6';
                }
              }

              return (
                <TouchableOpacity
                  key={dayIndex}
                  onPress={() => isCurrentMonth && onActivityPress(activity)}
                  activeOpacity={activity.count > 0 ? 0.7 : 1}
                  style={{ width: cellSize, height: cellSize, padding: 2 }}
                >
                  <View
                    style={[
                      styles.gridCell,
                      { backgroundColor: bgColor },
                      isToday && styles.todayCell,
                    ]}
                  >
                    {isCurrentMonth && (
                      <Text style={[
                        styles.dayNumber,
                        activity.count > 0 && styles.dayNumberActive,
                        isToday && styles.dayNumberToday,
                      ]}>
                        {activity.dayNumber}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activityGridContainer: {
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 4,
  },
  monthTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  weekLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabel: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
  },
  gridRows: {
    gap: 0,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: '#10b981',
  },
  dayNumber: {
    color: '#666',
    fontSize: 12,
  },
  dayNumberActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  dayNumberToday: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
