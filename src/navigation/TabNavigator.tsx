import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/dashboard/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import MindGardenScreen from '../screens/garden/MindGardenScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

type TabParamList = {
  Home: { selectedTasks?: number[] };
  MindGarden: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MindGarden') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen as any} 
        initialParams={{selectedTasks: [1, 3, 5]}}
      />
      <Tab.Screen name="MindGarden" component={MindGardenScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator; 