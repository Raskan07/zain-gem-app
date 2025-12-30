import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BiometricAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const appState = useRef(AppState.currentState);
  const isAuthenticating = useRef(false);
  const lastSuccessAuth = useRef(0);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      
      if (compatible) {
        authenticate();
      } else {
        setIsAuthenticated(true); 
      }
    })();
  }, []);

  // Re-lock on app backgrounding
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
         // App came to foreground
         const now = Date.now();
         const timeSinceLastAuth = now - lastSuccessAuth.current;

         // Only lock if:
         // 1. Biometrics are supported
         // 2. We are not currently authenticating (prompt open)
         // 3. We didn't JUST authenticate successfully (grace period of 2 seconds)
         if (isBiometricSupported && !isAuthenticating.current && timeSinceLastAuth > 2000) {
             console.log("App foregrounded, locking...");
             setIsAuthenticated(false);
             authenticate();
         }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isBiometricSupported]);


  const authenticate = async () => {
    if (isAuthenticating.current) return;
    
    try {
      isAuthenticating.current = true;
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
         Alert.alert("Security", "No biometric authentication found. App is unsecured.");
         setIsAuthenticated(true);
         isAuthenticating.current = false;
         return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Zain Gem',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false, 
        cancelLabel: 'Cancel'
      });

      if (result.success) {
        setIsAuthenticated(true);
        lastSuccessAuth.current = Date.now();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Biometric Error:", error);
      setIsAuthenticated(false);
    } finally {
        setTimeout(() => {
            isAuthenticating.current = false;
        }, 1000);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <LinearGradient
      colors={['#0f172a', '#000000']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="shield-lock-outline" size={80} color="#10b981" />
        </View>
        
        <Text style={styles.title}>Zain Gem Locked</Text>
        <Text style={styles.subtitle}>Authentication required to access business data</Text>

        <TouchableOpacity onPress={authenticate} style={styles.button}>
            <MaterialCommunityIcons name="fingerprint" size={28} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>Unlock</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 30,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 50,
    textAlign: 'center',
    maxWidth: '80%',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
