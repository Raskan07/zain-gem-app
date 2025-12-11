import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Props {
  current: number;
  previous: number;
}

export const StonesSoldComparison = ({ current, previous }: Props) => {
  const maxVal = Math.max(current, previous, 1);
  const currentPercent = (current / maxVal) * 100;
  const previousPercent = (previous / maxVal) * 100;

  // Animations
  const currentWidth = useSharedValue(0);
  const previousWidth = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    currentWidth.value = withDelay(300, withSpring(currentPercent, { damping: 12 }));
    previousWidth.value = withDelay(100, withSpring(previousPercent, { damping: 12 }));
    opacity.value = withTiming(1, { duration: 800 });
  }, [current, previous]);

  const currentBarStyle = useAnimatedStyle(() => ({
    width: `${currentWidth.value}%`,
  }));

  const previousBarStyle = useAnimatedStyle(() => ({
    width: `${previousWidth.value}%`,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withTiming(opacity.value === 1 ? 0 : 20) }]
  }));

  const growth = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
  const isPositive = growth >= 0;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={['rgba(20,20,30,0.8)', 'rgba(10,10,15,0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="diamond-stone" size={24} color="#06d455ff" />
          </View>
          <View>
            <Text style={styles.title}>Stones Sold</Text>
            <Text style={styles.subtitle}>Volume Analytics</Text>
          </View>
          
          <View style={[styles.badge, { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
            <Ionicons name={isPositive ? "caret-up" : "caret-down"} size={14} color={isPositive ? "#10b981" : "#ef4444"} />
            <Text style={[styles.badgeText, { color: isPositive ? "#10b981" : "#ef4444" }]}>
              {Math.abs(growth).toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Previous Month Bar */}
        <View style={styles.barGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.labelText}>Previous Month</Text>
            <Text style={styles.valueText}>{previous}</Text>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.bar, { backgroundColor: '#0ab5e0ff' }, previousBarStyle]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>

        {/* Current Month Bar (Neon) */}
        <View style={styles.barGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.labelText, { color: '#fff' }]}>Current Month</Text>
            <Text style={[styles.valueText, { color: '#06d455ff', textShadowColor: 'rgba(6, 182, 212, 0.5)', textShadowRadius: 10 }]}>
              {current}
            </Text>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.bar, { backgroundColor: '#06d455ff' }, currentBarStyle]}>
               {/* Glow Effect */}
               <View style={styles.glow} />
               <LinearGradient
                colors={['rgba(255, 255, 255, 0.63)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>

        {/* Grid Lines Decoration */}
        

      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    padding: 20,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  barGroup: {
    marginBottom: 16,
    zIndex: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  labelText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
  valueText: {
    color: '#d1d5db',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono', // or any monospaced font if available
  },
  track: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 6,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#06b6d4',
    opacity: 0.6,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    opacity: 0.1,
    zIndex: 1,
    pointerEvents: 'none',
  },
  gridLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#fff',
  }
});
