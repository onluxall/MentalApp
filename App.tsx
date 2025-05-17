import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import DeviceDataService from './src/services/DeviceDataService';
import DateTransitionService from './src/services/DateTransitionService';

export default function App() {
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestNotificationPermissions();
    }
  }, []);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await DateTransitionService.initialize();
        
        const subscription = Notifications.addNotificationReceivedListener((notification) => {
          if (notification.request.content.data?.type === 'midnight-transition') {
            DateTransitionService.checkDateTransition();
          }
        });
        
        return () => {
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

  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
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
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          setNotificationPermission(status === 'granted');
        }
      } else {
        setNotificationPermission(true);
      }
      
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