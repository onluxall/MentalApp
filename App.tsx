import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import DeviceDataService from './src/services/DeviceDataService';
import DateTransitionService from './src/services/DateTransitionService';

export default function App() {
  const [notificationPermission, setNotificationPermission] = useState(false);

  // Request notification permissions
  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestNotificationPermissions();
    }
  }, []);

  // Initialize device services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize date transition service
        await DateTransitionService.initialize();
        
        // Add notification handler for midnight transitions
        const subscription = Notifications.addNotificationReceivedListener((notification) => {
          // Check if it's a midnight transition notification
          if (notification.request.content.data?.type === 'midnight-transition') {
            // Refresh data when midnight notification is received
            DateTransitionService.checkDateTransition();
          }
        });
        
        return () => {
          // Clean up
          subscription.remove();
          DeviceDataService.cleanup();
          DateTransitionService.cleanup();
        };
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };
    
    initializeServices();
  }, []);

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // Only ask if permissions have not already been determined
      if (existingStatus !== 'granted') {
        // Show explanation dialog on iOS to improve chances of permission approval
        if (Platform.OS === 'ios') {
          Alert.alert(
            'Notifications Permission',
            'MindFlow needs to access notifications to track your digital wellness and alert you about daily updates.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Continue', 
                onPress: async () => {
                  const { status } = await Notifications.requestPermissionsAsync();
                  finalStatus = status;
                  setNotificationPermission(status === 'granted');
                }
              }
            ]
          );
        } else {
          // For Android, directly request permissions
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          setNotificationPermission(status === 'granted');
        }
      } else {
        setNotificationPermission(true);
      }
      
      // Configure notification handler
      if (finalStatus === 'granted') {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  )
}


//BACKEND TEAM: Consider these integration points:
//- Add global authentication state management here
//- Implement token storage/retrieval for persistent login
//- Add global loading state for API calls
//- Consider adding error handling middleware for API responses