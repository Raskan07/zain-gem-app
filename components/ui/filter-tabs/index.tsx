import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type FilterType = 'all' | 'inStock' | 'pending' | 'sold';

interface FilterTabsProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, selectedFilter === 'all' && styles.selectedTab]}
        onPress={() => onFilterChange('all')}
      >
        <Text style={[styles.tabText, selectedFilter === 'all' && styles.selectedText]}>
          All Stones
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedFilter === 'inStock' && styles.selectedTab]}
        onPress={() => onFilterChange('inStock')}
      >
        <Text style={[styles.tabText, selectedFilter === 'inStock' && styles.selectedText]}>
          In Stock
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedFilter === 'pending' && styles.selectedTab]}
        onPress={() => onFilterChange('pending')}
      >
        <Text style={[styles.tabText, selectedFilter === 'pending' && styles.selectedText]}>
          Pending
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedFilter === 'sold' && styles.selectedTab]}
        onPress={() => onFilterChange('sold')}
      >
        <Text style={[styles.tabText, selectedFilter === 'sold' && styles.selectedText]}>
          Sold
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTab: {
    backgroundColor: '#00D492',
  },
  tabText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    color: '#000000',
    fontWeight: '600',
  },
});