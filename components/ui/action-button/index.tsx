import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ActionButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  backgroundColor?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  backgroundColor
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'secondary' ? styles.secondaryButton : styles.primaryButton,
        backgroundColor && { backgroundColor },
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'secondary' ? styles.secondaryText : styles.primaryText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#00D492',
  },
  secondaryButton: {
    backgroundColor: '#2A2A2A',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '400',
  },
  primaryText: {
    color: '#000000',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
});