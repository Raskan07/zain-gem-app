import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ImageViewerModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ visible, imageUrl, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [pinned, setPinned] = useState(false);

  if (!imageUrl) return null;

  const downloadImage = async () => {
    try {
      setLoading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save images to your gallery.');
        setLoading(false);
        return;
      }

      const filename = imageUrl.split('/').pop() || 'stone_image.jpg';
      const fileUri = FileSystem.documentDirectory + filename;

      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('ZainGem', asset, false);

      Alert.alert('Success', 'Image saved to gallery!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to download image.');
    } finally {
      setLoading(false);
    }
  };

  const shareImage = async () => {
    try {
      setLoading(true);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        setLoading(false);
        return;
      }

      const filename = imageUrl.split('/').pop() || 'stone_image.jpg';
      const fileUri = FileSystem.documentDirectory + filename;
      
      // Check if file exists, if not download it
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
         await FileSystem.downloadAsync(imageUrl, fileUri);
      }

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to share image.');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = () => {
    setPinned(!pinned);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={30} color="white" />
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={downloadImage} disabled={loading}>
            <MaterialCommunityIcons name="download" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={shareImage} disabled={loading}>
            <MaterialCommunityIcons name="share-variant" size={28} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={togglePin}>
            <MaterialCommunityIcons name={pinned ? "pin" : "pin-outline"} size={28} color={pinned ? "#24F07D" : "white"} />
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#24F07D" />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  imageContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
    marginTop: 20,
  },
  actionButton: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
