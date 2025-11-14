import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ style, children }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});