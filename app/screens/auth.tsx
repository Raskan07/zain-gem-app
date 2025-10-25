import OTPBottomSheet from '@/components/OTPBottomSheet';
import PrimaryButton from '@/components/PrimaryButton';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

const Auth = () => {
  const [showOTP, setShowOTP] = useState(false);
  const router = useRouter();

  const handleVerificationSuccess = () => {
    setShowOTP(false);
    // Navigate to main app after successful verification
    router.replace('/(tabs)');
  };

  return (
      <ImageBackground
        source={require('@/assets/images/local/bg.jpeg')}
        className="flex-1"
        imageStyle={{ resizeMode: 'cover' }}>
        {/* translucent overlay to improve contrast */}
        

     
      </ImageBackground>
  );
};

export default Auth;

const styles = StyleSheet.create({});