import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();

  const QuickAction = ({ icon, label, color = '#333' }: { icon: any, label: string, color?: string }) => (
    <TouchableOpacity style={[styles.quickAction, { backgroundColor: color }]}>
      <View style={styles.quickActionIcon}>
        {icon}
      </View>
      <Text style={styles.quickActionText}>{label}</Text>
    </TouchableOpacity>
  );

  const SettingItem = ({ icon, label, subLabel, onPress, color = '#fff' }: { icon: any, label: string, subLabel?: string, onPress?: () => void, color?: string }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingLabel, { color }]}>{label}</Text>
        {subLabel && <Text style={styles.settingSubLabel}>{subLabel}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Zain Gem</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={14} color="#000" />
              <Text style={styles.ratingText}>5.00</Text>
            </View>
          </View>
          <View style={styles.avatarContainer}>
             <Image 
               source={{ uri: 'https://ui-avatars.com/api/?name=Zain+Gem&background=24F07D&color=000&size=128' }} 
               style={styles.avatar} 
             />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <QuickAction 
            icon={<MaterialCommunityIcons name="lifebuoy" size={24} color="#fff" />} 
            label="Help" 
          />
           <QuickAction 
            icon={<MaterialCommunityIcons name="wallet" size={24} color="#fff" />} 
            label="Wallet" 
          />
           <QuickAction 
            icon={<MaterialCommunityIcons name="history" size={24} color="#fff" />} 
            label="Activity" 
          />
        </View>

        {/* Promo/Feature Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#1A1A1A', '#222']}
            style={styles.banner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Pro Dashboard</Text>
              <Text style={styles.bannerText}>View detailed analytics and export monthly reports.</Text>
            </View>
            <MaterialCommunityIcons name="chart-box-outline" size={40} color="#24F07D" style={{ opacity: 0.8 }} />
          </LinearGradient>
        </View>
        
        {/* Settings List */}
        <View style={styles.section}>
          <SettingItem 
            icon={<MaterialCommunityIcons name="cog" size={22} color="#fff" />}
            label="Settings"
          />
          <SettingItem 
            icon={<MaterialCommunityIcons name="message-text" size={22} color="#fff" />}
            label="Messages"
          />
          <SettingItem 
            icon={<MaterialCommunityIcons name="notebook" size={22} color="#fff" />}
            label="Notes"
            subLabel="Manage your stone notes and templates"
            onPress={() => {}}
          />
           <SettingItem 
            icon={<MaterialCommunityIcons name="briefcase" size={22} color="#fff" />}
            label="Inventory Settings"
            subLabel="Manage categories and costs"
          />
          <SettingItem 
            icon={<MaterialCommunityIcons name="account" size={22} color="#fff" />}
            label="Manage Account"
          />
           <SettingItem 
            icon={<MaterialCommunityIcons name="information" size={22} color="#fff" />}
            label="Legal"
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>v1.0.0 (Build 2025.12.15)</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ratingText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  avatarContainer: {
    shadowColor: '#24F07D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#111',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickAction: {
    width: '31%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  bannerContent: {
    flex: 1,
    marginRight: 16,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingIconContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  settingSubLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  signOutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FF4D4F',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  versionText: {
    color: '#444',
    fontSize: 12,
  },
});
