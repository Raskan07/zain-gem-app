
import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActionButton } from '../action-button';
import { Card } from '../card';




interface BalanceCardProps {
  balance: string;
  subtitle?: string;
  totalStones?: number;
  inStock?: number;
  sold?: number;
  pending?: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance, 
  subtitle,

}) => {
  const router = useRouter();

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} className='border '>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <View className='p-2 bg-white/40 flex flex-row items-center px-3 gap-2 rounded-full border   '>
            <AntDesign name="plus" size={18} color="#000000" />
            <Text className=' text-md text-gray-700  '>Create</Text>
          </View>        </View>
      </View>

      <View style={styles.content}>
        <MaterialCommunityIcons name="cards-diamond-outline" size={120} color="black" />
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.balance}>LKR {balance}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        <ActionButton
            title="Analytics"
            variant='secondary'
            style={styles.s}

              
             />
         <ActionButton
            title="Reports"
            backgroundColor='#1FD872'
              
             />
      </View>


    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.tint,
    padding: 20,
  },
  s:{
    flex:1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop:20,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
    marginBottom: 20,
  },
  balance: {
    fontSize: 35,
    fontWeight: '700',
    color: '#000',
    fontFamily:"Orbitron",
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 10,
    marginTop:10
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  actionButtonText: {
    color: '#000',
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
});