import { Platform, AppState } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenTime from './screenTime';

export interface WellnessData {
  screenTime: string;
  notifications: number;
  sessionGoal: string;
  focusScore: number;
  batteryLevel?: number;
}

const FOCUS_SESSION_KEY = '@MindFlow:focusSessions';
const FOCUS_GOAL_KEY = '@MindFlow:focusGoal';

class DeviceDataService {
  private appStateSubscription: any = null;

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    if (Platform.OS !== 'web') {
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    }
  }

  private handleAppStateChange = async (nextAppState: string) => {
    if (nextAppState === 'active') {
      await ScreenTime.startTracking();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      await ScreenTime.stopTracking();
    }
  };

  async getScreenTime(): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        return '3h 24m';
      }
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const usage = await ScreenTime.getScreenTimeAsync(startOfDay, now);
    
      const totalMinutes = Math.floor(usage / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error getting screen time:', error);
      return '0h 0m';
    }
  }
  
  async getNotificationCount(): Promise<number> {
    try {
      if (Platform.OS === 'web') {
        return 37;
      }
      
      const settings = await Notifications.getPermissionsAsync();
      
      if (!settings.granted) {
        const permission = await Notifications.requestPermissionsAsync();
        if (!permission.granted) {
          throw new Error('Notification permission not granted');
        }
      }
      
      if (Platform.OS === 'ios') {
        const deliveredNotifications = await Notifications.getPresentedNotificationsAsync();
        return deliveredNotifications.length;
      }
      
      const count = await AsyncStorage.getItem('@MindFlow:notificationCount');
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting notification count:', error);
      return 0;
    }
  }
  
  async getFocusSessionGoal(): Promise<string> {
    try {
      const goal = await AsyncStorage.getItem(FOCUS_GOAL_KEY);
      return goal || '25m'; // Default to 25 minutes
    } catch (error) {
      console.error('Error getting focus session goal:', error);
      return '25m';
    }
  }

  async setFocusSessionGoal(goal: string): Promise<void> {
    try {
      await AsyncStorage.setItem(FOCUS_GOAL_KEY, goal);
    } catch (error) {
      console.error('Error setting focus session goal:', error);
    }
  }
  
  async recordFocusSession(durationInMinutes: number): Promise<void> {
    try {
      const sessionsJson = await AsyncStorage.getItem(FOCUS_SESSION_KEY);
      const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
      
      sessions.push({
        timestamp: new Date().toISOString(),
        duration: durationInMinutes
      });
      
      await AsyncStorage.setItem(FOCUS_SESSION_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error recording focus session:', error);
    }
  }
  
  async getTodayFocusTime(): Promise<number> {
    try {
      const sessionsJson = await AsyncStorage.getItem(FOCUS_SESSION_KEY);
      if (!sessionsJson) return 0;
      
      const sessions = JSON.parse(sessionsJson);
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      return sessions
        .filter((session: any) => new Date(session.timestamp) >= startOfDay)
        .reduce((total: number, session: any) => total + session.duration, 0);
    } catch (error) {
      console.error('Error getting today focus time:', error);
      return 0;
    }
  }
  
  async getBatteryLevel(): Promise<number> {
    try {
      if (Platform.OS === 'web') {
        return 75;
      }
      
      const level = await Battery.getBatteryLevelAsync();
      return Math.round(level * 100);
    } catch (error) {
      console.error('Error getting battery level:', error);
      return 100;
    }
  }
  
  async calculateFocusScore(): Promise<number> {
    try {
      if (Platform.OS === 'web') {
        return 76;
      }
      
      const focusTime = await this.getTodayFocusTime();
      
      const screenTimeStr = await this.getScreenTime();
      const screenTimeMatch = screenTimeStr.match(/(\d+)h\s+(\d+)m/);
      const screenTimeMinutes = screenTimeMatch 
        ? parseInt(screenTimeMatch[1], 10) * 60 + parseInt(screenTimeMatch[2], 10)
        : 0;
      
      const notificationCount = await this.getNotificationCount();
      
      const maxFocusTime = 120; 
      const focusScore = Math.min(100, (focusTime / maxFocusTime) * 100);
      
      const maxScreenTime = 180; 
      const screenTimeScore = Math.max(0, 100 - (screenTimeMinutes / maxScreenTime) * 100);
      
      const maxNotifications = 50; 
      const notificationScore = Math.max(0, 100 - (notificationCount / maxNotifications) * 100);

      const totalScore = (focusScore * 0.4) + (screenTimeScore * 0.3) + (notificationScore * 0.3);
      
      return Math.round(totalScore);
    } catch (error) {
      console.error('Error calculating focus score:', error);
      return 50; 
    }
  }

  async getWellnessData(): Promise<WellnessData> {
    if (Platform.OS === 'web') {
      return {
        screenTime: '3h 24m',
        notifications: 37,
        sessionGoal: '25m',
        focusScore: 76
      };
    }
    
    const [screenTime, notifications, sessionGoal, focusScore, batteryLevel] = await Promise.all([
      this.getScreenTime(),
      this.getNotificationCount(),
      this.getFocusSessionGoal(),
      this.calculateFocusScore(),
      this.getBatteryLevel()
    ]);
    
    return {
      screenTime,
      notifications,
      sessionGoal,
      focusScore,
      batteryLevel
    };
  }
  
  setupNotificationTracking() {
    if (Platform.OS === 'web') return; 
  
    const subscription = Notifications.addNotificationReceivedListener(() => {
      this.incrementNotificationCount();
    });
    
    return subscription;
  }
  
  private async incrementNotificationCount() {
    try {
      const countStr = await AsyncStorage.getItem('@MindFlow:notificationCount');
      const count = countStr ? parseInt(countStr, 10) + 1 : 1;
      await AsyncStorage.setItem('@MindFlow:notificationCount', count.toString());
    } catch (error) {
      console.error('Error incrementing notification count:', error);
    }
  }
  
  async resetNotificationCount() {
    try {
      await AsyncStorage.setItem('@MindFlow:notificationCount', '0');
    } catch (error) {
      console.error('Error resetting notification count:', error);
    }
  }

  cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

export default new DeviceDataService(); 