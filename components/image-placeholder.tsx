import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

export const ImagePlaceholder = () => (
  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#555' }}>
    <FontAwesome5 name="plus" size={16} color="#aaa" />
  </View>
);
