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
    <BottomSheetModalProvider>
      <ImageBackground
        source={require('@/assets/images/local/bg.jpeg')}
        className="flex-1"
        imageStyle={{ resizeMode: 'cover' }}>
        {/* translucent overlay to improve contrast */}
        <View className="flex-1 bg-black/30 justify-end px-6">
          <View className="mt-8 h-[40vh] justify-center">
            <Text style={{ fontFamily: 'Orbitron' }} className="text-7xl md:text-7xl text-white font-extrabold">Trust.</Text>
            <Text style={{ fontFamily: 'Orbitron' }} className="text-7xl md:text-7xl text-white font-extrabold mt-1">Build.</Text>
            <Text style={{ fontFamily: 'Orbitron' }} className="text-7xl md:text-7xl text-white font-extrabold mt-1">Create.</Text>
          </View>

          <View className="flex-1 justify-end pb-12">
            <Text className="text-md  text-white/60 mt-6 uppercase  h-[8vh]  w-full text-center"> where brilliance meets precision. Manage your gemstones with elegance, insight, and control.</Text>
            <PrimaryButton 
              title="Get Started →" 
              onPress={() => router.push('/screens/verify')} 
            />
          </View>
        </View>

        <OTPBottomSheet
          isVisible={showOTP}
          onClose={() => setShowOTP(false)}
          onSuccess={handleVerificationSuccess}
        />
      </ImageBackground>
    </BottomSheetModalProvider>
  );
};

export default Auth;

const styles = StyleSheet.create({});