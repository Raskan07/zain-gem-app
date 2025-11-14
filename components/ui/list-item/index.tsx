import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ListItemProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  rightText?: string;
  showArrow?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  title,
  subtitle,
  rightText,
  showArrow = true,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <Feather name={icon} size={20} color="#00D492" />
        </View>
      )}
      <View style={styles.contentContainer}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.rightContainer}>
          {rightText && <Text style={styles.rightText}>{rightText}</Text>}
          {showArrow && (
            <Feather name="chevron-right" size={20} color="#666" style={styles.arrow} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    color: '#666666',
    fontSize: 13,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    color: '#00D492',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  arrow: {
    marginLeft: 4,
  },
});