import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function PrimaryButton({ title, onPress, loading, disabled, className = '' }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      className={
        `flex-row items-center justify-center py-4 px-6 rounded-2xl bg-teal-400 shadow-lg ` +
        `border border-teal-300 ${disabled || loading ? 'opacity-60' : 'opacity-100'} ` +
        className
      }>
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white text-lg font-semibold">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
