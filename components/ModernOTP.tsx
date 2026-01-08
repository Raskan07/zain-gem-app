import { cn } from '@/utils/cn';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

interface ModernOTPProps {
  maxLength?: number;
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
  isSecure?: boolean;
  value: string;
  error?: boolean;
}

export default function ModernOTP({ 
    maxLength = 6, 
    onComplete, 
    onChange, 
    isSecure = false, 
    value, 
    error 
}: ModernOTPProps) {
  
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleChangeText = (text: string) => {
    onChange?.(text);
    if (text.length === maxLength) {
        onComplete?.(text);
    }
  };

  return (
    <View className="items-center justify-center w-full">
      {/* Hidden Input Layer */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        maxLength={maxLength}
        keyboardType="number-pad"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={StyleSheet.absoluteFillObject}
        // Important: Make it invisible but touchable if needed (though we use a Pressable overlay usually)
        // putting it "behind" visually but handling focus via the Pressable below is cleanest
        className="opacity-0 z-0 h-20" 
        caretHidden
      />

      {/* Visible UI Layer */}
      <Pressable onPress={handlePress} className="flex-row gap-3 z-10 bg-transparent">
        {Array.from({ length: maxLength }).map((_, index) => (
          <Slot
            key={index}
            char={value[index]}
            isActive={isFocused && index === value.length}
            isSecure={isSecure}
            hasError={error}
          />
        ))}
      </Pressable>
    </View>
  );
}

function Slot({ char, isActive, isSecure, hasError }: { char?: string, isActive: boolean, isSecure: boolean, hasError?: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
          withSequence(
              withTiming(1.05, { duration: 500 }),
              withTiming(1, { duration: 500 })
          ),
          -1, 
          true
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={cn(
        'w-12 h-14 items-center justify-center rounded-xl border-2 bg-[#1A1A1A]',
        isActive 
          ? 'border-[#24F07D] shadow-[0_0_15px_rgba(36,240,125,0.2)]' 
          : hasError ? 'border-red-500' : 'border-[#333]',
      )}
    >
      {char ? (
        <Animated.Text 
            entering={FadeIn}
            className={cn("text-2xl font-bold text-white", isSecure && "text-3xl mt-1")}
        >
            {isSecure ? '•' : char}
        </Animated.Text>
      ) : (
         /* Placeholder dot for empty slots if desired, or just blank */
         isActive && <View className="w-2 h-0.5 bg-[#24F07D]" />
      )}
    </Animated.View>
  );
}
