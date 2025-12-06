import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface FilterTab {
  id: string;
  label: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        
        return (
          <Animated.View key={tab.id} entering={FadeIn.delay(index * 50)}>
            <TouchableOpacity
              onPress={() => onTabChange(tab.id)}
              style={styles.tabButton}
            >
              {isActive ? (
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed', '#6366f1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGradient}
                >
                  <Text style={styles.activeTabText}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <Text style={styles.inactiveTabText}>{tab.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },
  tabButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeTabGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  inactiveTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  inactiveTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
  },
});
