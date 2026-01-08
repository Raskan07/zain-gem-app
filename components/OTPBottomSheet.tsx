import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

import { verifyPasscode } from '@/lib/auth';

const OTP_LENGTH = 6;

export default function OTPBottomSheet({ isVisible, onClose, onSuccess }: Props) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  
  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleOtpChange = async (value: string, index: number) => {
    const newOtp = otp.split('');
    newOtp[index] = value;
    const updatedOtp = newOtp.join('');
    setOtp(updatedOtp);
    setError('');

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    if (updatedOtp.length === OTP_LENGTH) {
      const isValid = await verifyPasscode(updatedOtp);
      if (isValid) {
        onSuccess();
      } else {
        setError('Invalid code. Please try again.');
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['50%']}
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: '#1A1A1A' }}
      handleIndicatorStyle={{ backgroundColor: '#666' }}
    >
      <View className="flex-1 px-6 pt-6">
        <Text style={{ fontFamily: 'Orbitron' }} className="text-2xl text-white font-bold mb-2">
          Let's verify your number
        </Text>
        <Text className="text-gray-400 mb-8">
          We've sent a 4-digit code to your phone.{'\n'}
          It'll auto-verify once entered.
        </Text>

        <View className="flex-row justify-between mb-8">
          {Array(OTP_LENGTH).fill(0).map((_, index) => (
            <TextInput
              key={index}
              ref={el => { inputRefs.current[index] = el }}
              className="w-12 h-12 border-2 rounded-lg text-center text-xl text-white bg-[#2A2A2A] border-gray-700 mx-1"
              maxLength={1}
              keyboardType="number-pad"
              value={otp[index] || ''}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        {error ? (
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        ) : null}

        <Pressable 
          onPress={() => setOtp('')}
          className="flex-row justify-center"
        >
          <Text className="text-teal-400">
            Didn't receive the code? <Text className="font-bold">Resend</Text>
          </Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}