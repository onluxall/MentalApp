import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_TIME_KEY = '@MindFlow:screenTime';
const SCREEN_TIME_START_KEY = '@MindFlow:screenTimeStart';
const LAST_ACTIVE_DATE_KEY = '@MindFlow:lastActiveDate';

const ScreenTime = {
  getPermissionsAsync: async () => ({ granted: true, canAskAgain: true, status: 'granted' }),
  
  requestPermissionsAsync: async () => ({ granted: true, canAskAgain: true, status: 'granted' }),
  
  startTracking: async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      const lastActiveDate = await AsyncStorage.getItem(LAST_ACTIVE_DATE_KEY);
      if (lastActiveDate !== today) {
        await AsyncStorage.setItem(SCREEN_TIME_KEY, '0');
        await AsyncStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
      }
      
      await AsyncStorage.setItem(SCREEN_TIME_START_KEY, now.getTime().toString());
      
      return true;
    } catch (error) {
      console.error('Error starting screen time tracking:', error);
      return false;
    }
  },
  
  stopTracking: async () => {
    try {
      const startTimeStr = await AsyncStorage.getItem(SCREEN_TIME_START_KEY);
      if (!startTimeStr) return false;
      
      const startTime = parseInt(startTimeStr, 10);
      const now = Date.now();
      const elapsedTime = now - startTime;
      
      const screenTimeStr = await AsyncStorage.getItem(SCREEN_TIME_KEY) || '0';
      const totalScreenTime = parseInt(screenTimeStr, 10) + elapsedTime;
      
      await AsyncStorage.setItem(SCREEN_TIME_KEY, totalScreenTime.toString());
      
      return true;
    } catch (error) {
      console.error('Error stopping screen time tracking:', error);
      return false;
    }
  },
  
  getScreenTimeAsync: async (startDate: Date, endDate: Date): Promise<number> => {
    try {
      if (Platform.OS === 'web') {
        return 3 * 60 * 60 * 1000 + 24 * 60 * 1000; 
      }
      
      const screenTimeStr = await AsyncStorage.getItem(SCREEN_TIME_KEY) || '0';
      let screenTime = parseInt(screenTimeStr, 10);
      
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