import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';





// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  }
});

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 4,
          backgroundColor: '#1A1A1A',
          marginBottom:15,
          borderRadius: 25,
          height: 65,
          ...styles.shadow,
          width:"99%",
          alignItems:"center",
        },
        tabBarItemStyle: {
          marginTop: 10,
        }
      }}>
      <Tabs.Screen
      name="index"
      options={{
        title: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <View style={focused ? {
            backgroundColor: '#2A2A2A',
            padding: 2 ,
            borderRadius: 5,
            width: 40,
            alignItems: 'center',
            justifyContent: 'center',
            height: 40,
          } : {}}>
            <Feather name="home" color={color} size={24} />
          </View>
        ),
        headerRight: () => (
        <Link href="/modal" asChild>
          <Pressable>
          {({ pressed }) => (
            <FontAwesome
            name="info-circle"
            size={25}
            color={Colors[colorScheme ?? 'light'].text}
            style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
          )}
          </Pressable>
        </Link>
        ),
      }}
      />
      <Tabs.Screen
      name="two"
      options={{
        title: 'Stones',
        tabBarIcon: ({ color, focused }) => (
          <View style={focused ? {
            backgroundColor: '#2A2A2A',
            padding: 2 ,
            borderRadius: 5,
            width: 40,
            alignItems: 'center',
            justifyContent: 'center',
            height: 40,
          } : {}}>
            <Ionicons name="diamond-outline" color={color} size={24} />
          </View>
        ),
      }}
      />
      <Tabs.Screen
      name="s&r"
      options={{
        title: 'S&R',
        tabBarIcon: ({ color, focused }) => (
          <View style={focused ? {
            backgroundColor: '#2A2A2A',
            padding: 2 ,
            borderRadius: 5,
            width: 40,
            alignItems: 'center',
            justifyContent: 'center',
            height: 40,
          } : {}}>
            <FontAwesome6 name="filter-circle-dollar" color={color} size={22} />
          </View>
        ),
      }}
      />
      <Tabs.Screen
      name="s&a"
      options={{
        title: 'S&A',
        tabBarIcon: ({ color, focused }) => (
          <View style={focused ? {
            backgroundColor: '#2A2A2A',
            padding: 2 ,
            borderRadius: 5,
            width: 40,
            alignItems: 'center',
            justifyContent: 'center',
            height: 40,
          } : {}}>
            <Feather name="bar-chart-2" color={color} size={24} />
          </View>
        ),
      }}
      />
    </Tabs>
  );
}
