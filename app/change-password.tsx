import ModernOTP from '@/components/ModernOTP';
import { setPasscode, verifyPasscode } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TouchableWithoutFeedback, Vibration, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

type Step = 'VERIFY_OLD' | 'ENTER_NEW' | 'CONFIRM_NEW';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('VERIFY_OLD');
  
  // Controlled Input State
  const [otpValue, setOtpValue] = useState('');
  
  // Stored values for logic
  const [newPasscode, setNewPasscode] = useState('');
  
  // UI states
  const [isSecure, setIsSecure] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Auto-clear input when step changes
  useEffect(() => {
    setOtpValue('');
    setError('');
  }, [step]);

  const handleVerifyOld = async (code: string) => {
    // Prevent double submission
    if (code.length !== 6) return;

    const isValid = await verifyPasscode(code);
    if (isValid) {
      setStep('ENTER_NEW');
    } else {
      Vibration.vibrate();
      setError('Incorrect passcode');
      setOtpValue(''); // Clear input on error
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleEnterNew = (code: string) => {
    setNewPasscode(code);
    // Slight delay for better UX
    setTimeout(() => {
        setStep('CONFIRM_NEW');
    }, 200);
  };

  const handleConfirmNew = async (code: string) => {
    if (code === newPasscode) {
      await setPasscode(code);
      Keyboard.dismiss();
      setShowSuccessModal(true);
      Vibration.vibrate([0, 50, 50, 50]); 
    } else {
      Vibration.vibrate();
      setError('Passcodes do not match');
      setOtpValue(''); // Clear to retry
      setTimeout(() => {
        setError('');
        setStep('ENTER_NEW'); // Reset to enter new
        setNewPasscode('');
      }, 1500);
    }
  };

  const handleComplete = (code: string) => {
    if (step === 'VERIFY_OLD') handleVerifyOld(code);
    if (step === 'ENTER_NEW') handleEnterNew(code);
    if (step === 'CONFIRM_NEW') handleConfirmNew(code);
  };

  const currentTitle = () => {
    switch(step) {
      case 'VERIFY_OLD': return "Enter Old Passcode";
      case 'ENTER_NEW': return "Create New Passcode";
      case 'CONFIRM_NEW': return "Confirm New Passcode";
    }
  };

  const currentDescription = () => {
    switch(step) {
      case 'VERIFY_OLD': return "Please enter your current passcode to proceed.";
      case 'ENTER_NEW': return "Enter a new 6-digit passcode.";
      case 'CONFIRM_NEW': return "Re-enter the code to confirm.";
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black px-6 pt-12">
        {/* Header */}
        <View className="flex-row items-center mb-6">
            <Pressable 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center bg-[#1A1A1A] rounded-full mr-4 border border-[#333]"
            >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
            </Pressable>
            <Text style={{ fontFamily: 'Orbitron' }} className="text-xl text-white font-bold ml-2">
            Security
            </Text>
        </View>

        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className="flex-1"
        >
            <Animated.View 
                key={step} // Triggers animation on step change
                entering={FadeInDown.springify().damping(20)} 
                className="items-center mt-10"
            >
            <View className="items-center mb-10">
                <View className="w-16 h-16 rounded-3xl bg-[#1A1A1A] items-center justify-center mb-6 border border-[#333] shadow-lg shadow-teal-500/10">
                <Ionicons 
                    name={step === 'VERIFY_OLD' ? "shield-checkmark-outline" : "lock-closed-outline"} 
                    size={30} 
                    color={step === 'VERIFY_OLD' ? '#FDCB6E' : '#24F07D'} 
                />
                </View>
                <Text className="text-2xl font-bold text-white mb-2 text-center">{currentTitle()}</Text>
                <Text className="text-gray-400 text-center max-w-[80%] leading-5">{currentDescription()}</Text>
            </View>

            {/* Controlled Custom OTP Input */}
            <ModernOTP 
                value={otpValue}
                onChange={setOtpValue}
                maxLength={6}
                isSecure={isSecure}
                error={!!error}
                onComplete={handleComplete}
            />

            {/* Error Feedback */}
            {error ? (
                <Animated.View entering={FadeInUp} className="mt-8 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/50">
                <Text className="text-red-500 font-medium">{error}</Text>
                </Animated.View>
            ) : null}

            {/* Hold to Reveal */}
            <Pressable
                className="mt-12 p-4 active:opacity-50 items-center justify-center"
                onPressIn={() => setIsSecure(false)}
                onPressOut={() => setIsSecure(true)}
                hitSlop={20}
            >
                <Ionicons name={isSecure ? "eye-off-outline" : "eye-outline"} size={26} color="#666" />
                <Text className="text-[#666] text-xxs mt-2 font-bold tracking-widest uppercase">Hold to Reveal</Text>
            </Pressable>
            </Animated.View>
        </KeyboardAvoidingView>

        {/* Success Modal */}
        <Modal transparent visible={showSuccessModal} animationType="fade">
            <View className="flex-1 bg-black/90 items-center justify-center p-6">
            <Animated.View 
                entering={ZoomIn.duration(400)} 
                className="bg-[#1A1A1A] w-full max-w-sm rounded-[32px] p-8 items-center border border-[#333]"
            >
                <View className="w-20 h-20 bg-[#24F07D]/20 rounded-full items-center justify-center mb-6 border border-[#24F07D]/30">
                    <Ionicons name="checkmark" size={40} color="#24F07D" />
                </View>
                
                <Text className="text-2xl font-bold text-white mb-2 text-center">All Set!</Text>
                <Text className="text-gray-400 text-center mb-8 leading-6">
                Your passcode has been updated.{'\n'}Use the new code to log in.
                </Text>

                <Pressable 
                onPress={() => {
                    setShowSuccessModal(false);
                    router.back();
                }}
                className="w-full"
                >
                <LinearGradient
                    colors={['#24F07D', '#1CB55C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full py-4 rounded-2xl items-center shadow-lg shadow-teal-500/20"
                >
                    <Text className="text-black font-bold text-lg">Continue</Text>
                </LinearGradient>
                </Pressable>
            </Animated.View>
            </View>
        </Modal>
        </View>
    </TouchableWithoutFeedback>
  );
}
