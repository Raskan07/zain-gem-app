import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle, ViewStyle , View } from 'react-native';

interface StockCardProps {
  title: string;
  value: number;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: [string, string, ...string[]];
}

export const StockCard: React.FC<StockCardProps> = ({
  title,
  value,
  iconName,
  style,
  textStyle,
  gradientColors
}) => {
  return (
    <LinearGradient 
      colors={gradientColors || ['#1a1a1a', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }} style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
        name={iconName} 
        size={24} 
        color="#fff" 
        style={styles.icon}
      />
      </View>
    
      <Text style={[styles.value ,textStyle]}>{value.toLocaleString()}</Text>
      <Text style={styles.title}>{title}</Text>
    </LinearGradient>
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
    color: '#fffafaff',
  },
    iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)', // Works on web, ignored on native
    marginBottom:10
  },
   bgIcon: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    opacity: 0.5,
  },
});