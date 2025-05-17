import { Platform, AppState } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenTime from './screenTime';

// Define interface for wellness data
export interface WellnessData {
  screenTime: string;
  notifications: number;
  sessionGoal: string;
  focusScore: number;
  batteryLevel?: number;
}

// Keys for storing focus session data
const FOCUS_SESSION_KEY = '@MindFlow:focusSessions';
const FOCUS_GOAL_KEY = '@MindFlow:focusGoal';

class DeviceDataService {
  private appStateSubscription: any = null;

  constructor() {
    // Setup app state change listener to track screen time
    this.setupAppStateListener();
  }

  // Set up app state listener to track screen time
  private setupAppStateListener() {
    if (Platform.OS !== 'web') {
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    }
  }

  // Handle app state changes to track screen time
  private handleAppStateChange = async (nextAppState: string) => {
    if (nextAppState === 'active') {
      // App has come to the foreground, start tracking
      await ScreenTime.startTracking();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App has gone to the background, stop tracking and save elapsed time
      await ScreenTime.stopTracking();
    }
  };

  // Get screen time usage
  async getScreenTime(): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        // Return mock data for web testing
        return '3h 24m';
      }
      
      // Get screen time for today
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const usage = await ScreenTime.getScreenTimeAsync(startOfDay, now);
      
      // Format the screen time (milliseconds to hours and minutes)
      const totalMinutes = Math.floor(usage / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error getting screen time:', error);
      // Fallback to stored value or default
      return '0h 0m';
    }
  }
  
  // Get notification count for today
  async getNotificationCount(): Promise<number> {
    try {
      if (Platform.OS === 'web') {
        // Return mock data for web testing
        return 37;
      }
      
      // Check notification permissions
      const settings = await Notifications.getPermissionsAsync();
      
      if (!settings.granted) {
        const permission = await Notifications.requestPermissionsAsync();
        if (!permission.granted) {
          throw new Error('Notification permission not granted');
        }
      }
      
      // On iOS, we can get delivery notifications
      if (Platform.OS === 'ios') {
        const deliveredNotifications = await Notifications.getPresentedNotificationsAsync();
        return deliveredNotifications.length;
      }
      
      // For Android, we need a different approach - using delivered notifications count
      // This is an approximation, as Android doesn't provide exact API for notification count
      const count = await AsyncStorage.getItem('@MindFlow:notificationCount');
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting notification count:', error);
      return 0;
    }
  }
  
  // Get focus session goal
  async getFocusSessionGoal(): Promise<string> {
    try {
      const goal = await AsyncStorage.getItem(FOCUS_GOAL_KEY);
      return goal || '25m'; // Default to 25 minutes
    } catch (error) {
      console.error('Error getting focus session goal:', error);
      return '25m';
    }
  }
  
  // Set focus session goal
  async setFocusSessionGoal(goal: string): Promise<void> {
    try {
      await AsyncStorage.setItem(FOCUS_GOAL_KEY, goal);
    } catch (error) {
      console.error('Error setting focus session goal:', error);
    }
  }
  
  // Record a completed focus session
  async recordFocusSession(durationInMinutes: number): Promise<void> {
    try {
      // Get existing sessions
      const sessionsJson = await AsyncStorage.getItem(FOCUS_SESSION_KEY);
      const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
      
      // Add new session
      sessions.push({
        timestamp: new Date().toISOString(),
        duration: durationInMinutes
      });
      
      // Save updated sessions
      await AsyncStorage.setItem(FOCUS_SESSION_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error recording focus session:', error);
    }
  }
  
  // Get total focus time for today
  async getTodayFocusTime(): Promise<number> {
    try {
      const sessionsJson = await AsyncStorage.getItem(FOCUS_SESSION_KEY);
      if (!sessionsJson) return 0;
      
      const sessions = JSON.parse(sessionsJson);
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Filter sessions from today and sum durations
      return sessions
        .filter((session: any) => new Date(session.timestamp) >= startOfDay)
        .reduce((total: number, session: any) => total + session.duration, 0);
    } catch (error) {
      console.error('Error getting today focus time:', error);
      return 0;
    }
  }
  
  // Get battery level
  async getBatteryLevel(): Promise<number> {
    try {
      if (Platform.OS === 'web') {
        // Return mock data for web testing
        return 75;
      }
      
      const level = await Battery.getBatteryLevelAsync();
      return Math.round(level * 100);
    } catch (error) {
      console.error('Error getting battery level:', error);
      return 100;
    }
  }
  
  // Calculate focus score based on various metrics
  async calculateFocusScore(): Promise<number> {
    try {
      if (Platform.OS === 'web') {
        // Return mock data for web testing
        return 76;
      }
      
      // Get today's focus time in minutes
      const focusTime = await this.getTodayFocusTime();
      
      // Get screen time in minutes
      const screenTimeStr = await this.getScreenTime();
      const screenTimeMatch = screenTimeStr.match(/(\d+)h\s+(\d+)m/);
      const screenTimeMinutes = screenTimeMatch 
        ? parseInt(screenTimeMatch[1], 10) * 60 + parseInt(screenTimeMatch[2], 10)
        : 0;
      
      // Get notification count
      const notificationCount = await this.getNotificationCount();
      
      // Calculate score components
      const maxFocusTime = 120; // Target: 2 hours of focus time
      const focusScore = Math.min(100, (focusTime / maxFocusTime) * 100);
      
      const maxScreenTime = 180; // Target: Max 3 hours screen time
      const screenTimeScore = Math.max(0, 100 - (screenTimeMinutes / maxScreenTime) * 100);
      
      const maxNotifications = 50; // Target: Max 50 notifications
      const notificationScore = Math.max(0, 100 - (notificationCount / maxNotifications) * 100);
      
      // Calculate weighted average (adjust weights as needed)
      const totalScore = (focusScore * 0.4) + (screenTimeScore * 0.3) + (notificationScore * 0.3);
      
      return Math.round(totalScore);
    } catch (error) {
      console.error('Error calculating focus score:', error);
      return 50; // Default score
    }
  }
  
  // Get all wellness data
  async getWellnessData(): Promise<WellnessData> {
    if (Platform.OS === 'web') {
      // Return mock data for web testing
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
  
  // Set up notification listener to track notifications
  setupNotificationTracking() {
    if (Platform.OS === 'web') return; // Skip on web
    
    // Set up notification received listener
    const subscription = Notifications.addNotificationReceivedListener(() => {
      // Increment notification count in storage
      this.incrementNotificationCount();
    });
    
    return subscription;
  }
  
  // Increment notification count
  private async incrementNotificationCount() {
    try {
      const countStr = await AsyncStorage.getItem('@MindFlow:notificationCount');
      const count = countStr ? parseInt(countStr, 10) + 1 : 1;
      await AsyncStorage.setItem('@MindFlow:notificationCount', count.toString());
    } catch (error) {
      console.error('Error incrementing notification count:', error);
    }
  }
  
  // Reset notification count (call this at midnight)
  async resetNotificationCount() {
    try {
      await AsyncStorage.setItem('@MindFlow:notificationCount', '0');
    } catch (error) {
      console.error('Error resetting notification count:', error);
    }
  }

  // Clean up resources when app is closing
  cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

export default new DeviceDataService(); 