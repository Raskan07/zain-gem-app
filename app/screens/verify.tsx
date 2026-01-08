import { cn } from '@/utils/cn';
import { useRouter } from 'expo-router';
import type { OTPInputRef } from 'input-otp-native';
import { OTPInput, type SlotProps } from 'input-otp-native';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { verifyPasscode } from '@/lib/auth';

const LENGTH = 6;

export default function Verify() {
  const router = useRouter();
  const [error, setError] = useState('');
  const inputRef = useRef<OTPInputRef>(null);

  const handleComplete = async (code: string) => {
    const isValid = await verifyPasscode(code);
    if (isValid) {
      // success -> go to index (tabs)
      // pass a query param so the tabs index knows verification just happened
      router.replace('/(tabs)?verified=1');
    } else {
      setError('Invalid code. Please try again.');
      inputRef.current?.clear();
    }
  };

  const clearAll = () => {
    inputRef.current?.clear();
    setError('');
  };

  return (
    <View className="flex-1 bg-black p-6 justify-center">
      <Text style={{ fontFamily: 'Orbitron' }} className="text-2xl text-white font-bold mb-2 text-center">
        Let's verify your number
      </Text>
      <Text className="text-gray-400 text-center mb-6">
        We've sent a 6-digit code to your phone. It'll auto-verify once entered.
      </Text>

      <OTPInput
        ref={inputRef}
        onComplete={handleComplete}
        maxLength={LENGTH}
        keyboardType="number-pad"
        render={({ slots }) => (
          <View className="flex-row items-center justify-center my-4">
            <View className="flex-row">
              {slots.slice(0, 3).map((slot, idx) => (
                <Slot key={idx} {...slot} index={idx} />
              ))}
            </View>
            <DashSeparator />
            <View className="flex-row">
              {slots.slice(3).map((slot, idx) => (
                <Slot key={idx} {...slot} index={idx + 3} />
              ))}
            </View>
          </View>
        )}
      />

      {error ? <Text className="text-red-500 text-center mb-4">{error}</Text> : null}

      <View className="items-center">
        <Pressable onPress={clearAll} className="mb-4">
          <Text className="text-teal-400">
            Didn't receive the code? <Text className="font-bold text-white">Resend</Text>
          </Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/')} className="bg-gray-800 px-6 py-3 rounded-2xl">
          <Text className="text-white">Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Slot({ char, isActive, hasFakeCaret, index }: SlotProps & { index: number }) {
  const isFirst = index === 0;
  const isLast = index === 2 || index === 5;
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (char !== null) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    } else {
      translateY.value = 20;
      opacity.value = 0;
    }
  }, [char]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <View
      className={cn(
        'w-12 h-16 items-center justify-center',
        'border border-gray-700 bg-gray-900',
        {
          'rounded-r-xl': isLast,
          'rounded-l-xl': isFirst,
          'border-teal-400 bg-gray-800': isActive,
        }
      )}
    >
      <Animated.View style={animatedStyle}>
        {char !== null && (
          <Text className="text-2xl font-medium text-white">{char}</Text>
        )}
      </Animated.View>
      {hasFakeCaret && <Caret />}
    </View>
  );
}

function DashSeparator() {
  return (
    <View className="w-8 items-center justify-center">
      <View className="w-2 h-0.5 bg-gray-700 rounded-sm" />
    </View>
  );
}

function Caret() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="absolute w-full h-full items-center justify-center">
      <Animated.View
        className="w-0.5 h-8 bg-teal-400 rounded-full"
        style={animatedStyle}
      />
    </View>
  );
}
