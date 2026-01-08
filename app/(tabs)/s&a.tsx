import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  
  // State for settings toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Load initial settings
  useEffect(() => {
    (async () => {
        const bioEnabled = await SecureStore.getItemAsync('biometrics_enabled');
        setBiometricsEnabled(bioEnabled === 'true');
    })();
  }, []);

  const toggleNotifications = () => setNotificationsEnabled(previousState => !previousState);
  
  const toggleBiometrics = async () => {
      const newValue = !biometricsEnabled;
      setBiometricsEnabled(newValue);
      await SecureStore.setItemAsync('biometrics_enabled', String(newValue));
  };

  const toggleDarkMode = () => setDarkModeEnabled(previousState => !previousState);
  const toggleEmail = () => setEmailNotifications(previousState => !previousState);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: () => console.log("Signed out") }
      ]
    );
  };

  const QuickAction = ({ icon, label, color, onPress }: { icon: any, label: string, color: string, onPress?: () => void }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <LinearGradient
        colors={[color, '#1A1A1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickActionGradient}
      >
        <View style={styles.quickActionIconContainer}>
          {icon}
        </View>
        <Text style={styles.quickActionText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const SettingItem = ({ 
    icon, 
    label, 
    subLabel, 
    onPress, 
    type = 'link', 
    value = false, 
    onValueChange,
    iconColor = '#fff',
    iconBg = '#333'
  }: { 
    icon: any, 
    label: string, 
    subLabel?: string, 
    onPress?: () => void, 
    type?: 'link' | 'toggle' | 'info',
    value?: boolean,
    onValueChange?: () => void,
    iconColor?: string,
    iconBg?: string
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={type === 'toggle' ? onValueChange : onPress} 
      disabled={type === 'info'}
      activeOpacity={type === 'info' ? 1 : 0.7}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subLabel && <Text style={styles.settingSubLabel}>{subLabel}</Text>}
      </View>
      
      {type === 'toggle' && (
        <Switch
          trackColor={{ false: "#333", true: "#24F07D" }}
          thumbColor={value ? "#fff" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={onValueChange}
          value={value}
        />
      )}
      
      {type === 'link' && (
        <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
      )}

      {type === 'info' && value && (
         <Text style={styles.infoText}>{String(value)}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', '#111', '#000']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header Profile Card */}
          <LinearGradient
            colors={['#1A1A1A', '#000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrapper}>
                <Image 
                  source={{ uri: 'https://ui-avatars.com/api/?name=Zain+Gem&background=24F07D&color=000&size=128' }} 
                  style={styles.avatar} 
                />
                <View style={styles.statusBadge} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Zain Gem</Text>
                <Text style={styles.profileEmail}>admin@zaingem.com</Text>
                <View style={styles.membershipBadge}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.goldGradient}
                  >
                    <Text style={styles.membershipText}>PRO MEMBER</Text>
                  </LinearGradient>
                </View>
              </View>
              <TouchableOpacity style={styles.editProfileBtn}>
                <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>128</Text>
                <Text style={styles.statLabel}>Stones</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>$45k</Text>
                <Text style={styles.statLabel}>Sales</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>5.0</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Actions Grid */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <QuickAction 
              icon={<MaterialCommunityIcons name="wallet-outline" size={24} color="#fff" />} 
              label="Wallet"
              color="#2a2a2a"
            />
            <QuickAction 
              icon={<MaterialCommunityIcons name="history" size={24} color="#fff" />} 
              label="History"
              color="#2a2a2a"
            />
             <QuickAction 
              icon={<MaterialCommunityIcons name="chart-line" size={24} color="#fff" />} 
              label="Analytics"
              color="#2a2a2a"
              onPress={() => router.push('/month-analytics')}
            />
            <QuickAction 
              icon={<MaterialCommunityIcons name="lifebuoy" size={24} color="#fff" />} 
              label="Help"
              color="#2a2a2a"
            />
          </View>

          {/* Settings Groups */}
          
          {/* GENERAL */}
          <SectionHeader title="General" />
          <View style={styles.settingsGroup}>
            <SettingItem 
              icon={<Ionicons name="person-outline" size={20} color="#6C5CE7" />}
              iconBg="rgba(108, 92, 231, 0.15)"
              label="Personal Information"
              subLabel="Manage name, email, and phone"
            />
            <SettingItem 
              icon={<MaterialCommunityIcons name="notebook-outline" size={20} color="#FF9F43" />}
              iconBg="rgba(255, 159, 67, 0.15)"
              label="Gem Notes"
              subLabel="View your private notes"
              onPress={() => router.push('/gem-notes')}
            />
            <SettingItem 
              icon={<Ionicons name="notifications-outline" size={20} color="#00CEC9" />}
              iconBg="rgba(0, 206, 201, 0.15)"
              label="Push Notifications"
              type="toggle"
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
            />
             <SettingItem 
              icon={<MaterialCommunityIcons name="email-outline" size={20} color="#FD79A8" />}
              iconBg="rgba(253, 121, 168, 0.15)"
              label="Email Updates"
              type="toggle"
              value={emailNotifications}
              onValueChange={toggleEmail}
            />
             <SettingItem 
              icon={<Ionicons name="moon-outline" size={20} color="#A29BFE" />}
              iconBg="rgba(162, 155, 254, 0.15)"
              label="Dark Mode"
              type="toggle"
              value={darkModeEnabled}
              onValueChange={toggleDarkMode}
            />
          </View>

          {/* SECURITY */}
          <SectionHeader title="Security" />
          <View style={styles.settingsGroup}>
            <SettingItem 
              icon={<Ionicons name="finger-print" size={20} color="#24F07D" />}
              iconBg="rgba(36, 240, 125, 0.15)"
              label="Biometric ID"
              subLabel="Use FaceID/TouchID to login"
              type="toggle"
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
            />
            <SettingItem 
              icon={<Ionicons name="lock-closed-outline" size={20} color="#FDCB6E" />}
              iconBg="rgba(253, 203, 110, 0.15)"
              label="Change Password"
            />
            <SettingItem 
              icon={<MaterialCommunityIcons name="shield-check-outline" size={20} color="#74B9FF" />}
              iconBg="rgba(116, 185, 255, 0.15)"
              label="Two-Factor Auth"
              type="link"
            />
          </View>

          {/* PREFERENCES & DATA */}
          <SectionHeader title="Data & Storage" />
          <View style={styles.settingsGroup}>
            <SettingItem 
              icon={<MaterialCommunityIcons name="database-outline" size={20} color="#FF7675" />}
              iconBg="rgba(255, 118, 117, 0.15)"
              label="Export Data"
              subLabel="Download your inventory as CSV"
            />
             <SettingItem 
              icon={<Ionicons name="cloud-upload-outline" size={20} color="#0984e3" />}
              iconBg="rgba(9, 132, 227, 0.15)"
              label="Backup Now"
              subLabel="Last backup: 2 hours ago"
            />
          </View>

          {/* SUPPORT */}
          <SectionHeader title="Support" />
          <View style={styles.settingsGroup}>
            <SettingItem 
              icon={<Ionicons name="document-text-outline" size={20} color="#dfe6e9" />}
              iconBg="rgba(223, 230, 233, 0.15)"
              label="Terms of Service"
            />
            <SettingItem 
              icon={<Ionicons name="shield-checkmark-outline" size={20} color="#dfe6e9" />}
              iconBg="rgba(223, 230, 233, 0.15)"
              label="Privacy Policy"
            />
             <SettingItem 
              icon={<Ionicons name="information-circle-outline" size={20} color="#dfe6e9" />}
              iconBg="rgba(223, 230, 233, 0.15)"
              label="About"
              type="info"
              // @ts-ignore
              value="v1.0.0"
            />
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          
          <View style={styles.footerSpace} />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  
  // Profile Card
  profileCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#24F07D',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#24F07D',
    borderWidth: 3,
    borderColor: '#1A1A1A',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  profileEmail: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 8,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  goldGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membershipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  editProfileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Quick Actions
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    marginLeft: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickAction: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  quickActionIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ccc',
  },

  // Settings
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginLeft: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsGroup: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubLabel: {
    fontSize: 12,
    color: '#888',
  },
  infoText: {
    color: '#666',
    fontSize: 14,
  },

  // Footer
  signOutButton: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: 'rgba(255, 77, 79, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 79, 0.3)',
  },
  signOutText: {
    color: '#FF4D4F',
    fontSize: 16,
    fontWeight: '700',
  },
  footerSpace: {
    height: 40,
  },
});
