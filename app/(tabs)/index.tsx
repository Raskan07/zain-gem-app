import { StyleSheet, Text } from 'react-native';

import { Box } from '@/components/ui/box';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';


export default function TabOneScreen() {
  const route = useRouter();
  const { verified } = useLocalSearchParams();

  useEffect(() => {
    // If not verified (no query param), redirect to greeting
    if (verified !== '1') {
      route.replace('/screens/greeting');
    }
  }, [verified]);

  return (
   <Box className="bg-primary-500 p-5">
    <Text className='text-xl'>Hello world</Text>
   </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
