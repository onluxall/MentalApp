import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screen time tracking keys
const SCREEN_TIME_KEY = '@MindFlow:screenTime';
const SCREEN_TIME_START_KEY = '@MindFlow:screenTimeStart';
const LAST_ACTIVE_DATE_KEY = '@MindFlow:lastActiveDate';

/**
 * Custom module for screen time tracking.
 * Since there's no direct expo-screen-time module, we'll implement a basic version
 * that tracks app usage time as a proxy for screen time.
 */
const ScreenTime = {
  // Check if we have permission (always returns true as this is a simulated API)
  getPermissionsAsync: async () => ({ granted: true, canAskAgain: true, status: 'granted' }),
  
  // Request permission (always returns true as this is a simulated API)
  requestPermissionsAsync: async () => ({ granted: true, canAskAgain: true, status: 'granted' }),
  
  // Start tracking screen time
  startTracking: async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      // Check if we need to reset the counter for a new day
      const lastActiveDate = await AsyncStorage.getItem(LAST_ACTIVE_DATE_KEY);
      if (lastActiveDate !== today) {
        await AsyncStorage.setItem(SCREEN_TIME_KEY, '0');
        await AsyncStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
      }
      
      // Save current timestamp as start time
      await AsyncStorage.setItem(SCREEN_TIME_START_KEY, now.getTime().toString());
      
      return true;
    } catch (error) {
      console.error('Error starting screen time tracking:', error);
      return false;
    }
  },
  
  // Stop tracking and save elapsed time
  stopTracking: async () => {
    try {
      const startTimeStr = await AsyncStorage.getItem(SCREEN_TIME_START_KEY);
      if (!startTimeStr) return false;
      
      const startTime = parseInt(startTimeStr, 10);
      const now = Date.now();
      const elapsedTime = now - startTime;
      
      // Get existing screen time for today
      const screenTimeStr = await AsyncStorage.getItem(SCREEN_TIME_KEY) || '0';
      const totalScreenTime = parseInt(screenTimeStr, 10) + elapsedTime;
      
      // Save updated screen time
      await AsyncStorage.setItem(SCREEN_TIME_KEY, totalScreenTime.toString());
      
      return true;
    } catch (error) {
      console.error('Error stopping screen time tracking:', error);
      return false;
    }
  },
  
  // Get screen time between start and end date
  getScreenTimeAsync: async (startDate: Date, endDate: Date): Promise<number> => {
    try {
      if (Platform.OS === 'web') {
        // Return simulated data for web testing
        return 3 * 60 * 60 * 1000 + 24 * 60 * 1000; // 3h 24m
      }
      
      const screenTimeStr = await AsyncStorage.getItem(SCREEN_TIME_KEY) || '0';
      let screenTime = parseInt(screenTimeStr, 10);
      
      // Add current session if tracking is active
      const startTimeStr = await AsyncStorage.getItem(SCREEN_TIME_START_KEY);
      if (startTimeStr) {
        const startTime = parseInt(startTimeStr, 10);
        const now = Date.now();
        screenTime += (now - startTime);
      }
      
      return screenTime;
    } catch (error) {
      console.error('Error getting screen time:', error);
      return 0;
    }
  },
  
  // Reset screen time tracking
  resetTracking: async () => {
    try {
      await AsyncStorage.setItem(SCREEN_TIME_KEY, '0');
      return true;
    } catch (error) {
      console.error('Error resetting screen time tracking:', error);
      return false;
    }
  }
};

export default ScreenTime; 