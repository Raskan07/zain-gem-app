import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ViewStyle,TextStyle } from 'react-native';

interface StockCardProps {
  title: string;
  value: number;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const StockCard: React.FC<StockCardProps> = ({
  title,
  value,
  iconName,
  style,
  textStyle
}) => {
  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons 
        name={iconName} 
        size={24} 
        color="#00D492" 
        style={styles.icon}
      />
      <Text style={[styles.value ,textStyle]}>{value.toLocaleString()}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    minHeight: 120,
  },
  icon: {
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: 14,
    color: '#888888',
  },
});