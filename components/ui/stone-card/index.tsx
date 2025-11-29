import { formatCurrency, formatDate, Stone } from '@/constants/data';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StoneCardProps {
  stone: Stone;
  onPress: (stone: Stone) => void;
}

export const StoneCard: React.FC<StoneCardProps> = ({ stone, onPress }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(stone)}
      className='flex flex-row items-center '
    >
      <View style={styles.imageContainer}>
        {stone.images && stone.images.length > 0 ? (
          <>
            <Image 
              source={{ uri: stone.images[0] }} 
              style={styles.image}
              resizeMode="cover"
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
            />
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#f5f5f5ff" />
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderImage} />
        )}
        <View style={[styles.statusBadge, (styles as any)[`status_${stone.status.toLowerCase()}`]]}>
          <Text style={styles.statusText}>{stone.status}</Text>
        </View>
      </View>

      <View className='p-2 h-full w-[80%]'>
        {/* date and id */}
        <View className='flex flex-row items-center justify-between'>
          <Text className='text-gray-300 text-md'>
            #{stone.customId ?? stone.id?.slice(-3)}
          </Text>
          <Text className='mr-10 text-gray-300 text-md'>
            {formatDate(stone.createdAt)}
          </Text>
        </View>

        {/* name and price */}
        <View className='w-full mt-5 flex flex-row items-center justify-between'>
          <Text className='text-white text-lg'>{stone.name}</Text>
          <Text className='text-lg mr-10 text-[#24F07D]'>
            {formatCurrency(stone.totalCost)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>         
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    gap:10
  },
  imageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
  },
  content: {
     height:"80%",
     width:"100%",
     padding:5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap:5
  },
  idText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  status_sold: {
    backgroundColor: '#DC2626',
  },
  'status_in stock': {
    backgroundColor: '#059669',
  },
  'status_in process': {
    backgroundColor: '#D97706',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  date: {
    color: '#888888',
    fontSize: 12,
  },
  footer: {
    marginTop: 4,
  },
  totalCost: {
    color: '#00D492',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
  },
});