import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colors: readonly [string, string, ...string[]];
  onPress?: () => void;
  delay?: number;
  fullWidth?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  colors, 
  onPress, 
  delay = 0,
  fullWidth = false 
}: MetricCardProps) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, fullWidth && styles.fullWidth]}
    >
      <Animated.View 
        entering={FadeInDown.delay(delay).springify()} 
        style={styles.card}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {icon}
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    height: 140,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
});
