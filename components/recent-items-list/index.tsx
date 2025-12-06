import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface RecentItem {
  id: string;
  name: string;
  date: Date;
  status: string;
  type: 'stone' | 'remainder';
}

interface RecentItemsListProps {
  items: RecentItem[];
  type: 'stone' | 'remainder';
  onItemPress: (item: RecentItem) => void;
  onViewAll: () => void;
}

export const RecentItemsList: React.FC<RecentItemsListProps> = ({
  items,
  type,
  onItemPress,
  onViewAll,
}) => {
  const isStone = type === 'stone';
  const gradientColors = isStone 
    ? ['#10b981', '#14b8a6'] as const
    : ['#8b5cf6', '#7c3aed'] as const;
  const iconName = isStone ? 'diamond-stone' : 'clock-outline';
  const title = isStone ? 'Recent Stones' : 'Recent Remainders';

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconContainer}
          >
            <MaterialCommunityIcons name={iconName} size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      {/* Items List */}
      {items.length > 0 ? (
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <Animated.View 
              key={item.id} 
              entering={FadeInRight.delay(index * 50).springify()}
            >
              <TouchableOpacity
                style={styles.itemCard}
                onPress={() => onItemPress(item)}
              >
                <View style={styles.itemLeft}>
                  <LinearGradient
                    colors={[...gradientColors, gradientColors[0]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.itemIconContainer}
                  >
                    <MaterialCommunityIcons name={iconName} size={18} color="#fff" />
                  </LinearGradient>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
                      <View style={styles.dot} />
                      <Text style={styles.itemStatus}>{item.status}</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name={iconName} size={32} color="#444" />
          <Text style={styles.emptyText}>No recent {isStone ? 'stones' : 'remainders'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemDate: {
    fontSize: 12,
    color: '#888',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#666',
  },
  itemStatus: {
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
