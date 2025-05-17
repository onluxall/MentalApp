import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import DeviceDataService from './DeviceDataService';
import axios from 'axios';

// Task name for background task
const MIDNIGHT_TRANSITION_TASK = 'MIDNIGHT_TRANSITION_TASK';
// Key for storing the last active date
const LAST_ACTIVE_DATE_KEY = '@MindFlow:lastActiveDate';
// Key for midnight notification ID
const MIDNIGHT_NOTIFICATION_ID = 'midnight-transition';

class DateTransitionService {
  // Initialize the service
  async initialize() {
    try {
      // Register the background fetch task
      await this.registerBackgroundTask();
      
      // Schedule the midnight notification
      await this.scheduleMidnightNotification();
      
      // Check for date transition on app start
      await this.checkDateTransition();
    } catch (error) {
      console.error('Error initializing date transition service:', error);
    }
  }

  // Register background task for midnight transition
  private async registerBackgroundTask() {
    if (Platform.OS === 'web') return;

    // Define the background task
    TaskManager.defineTask(MIDNIGHT_TRANSITION_TASK, async () => {
      try {
        const didTransition = await this.checkDateTransition();
        
        // If date transition occurred, return success
        return didTransition 
          ? BackgroundFetch.BackgroundFetchResult.NewData
          : BackgroundFetch.BackgroundFetchResult.NoData;
      } catch (error) {
        console.error('Error in background task:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    // Register the background fetch task
    await BackgroundFetch.registerTaskAsync(MIDNIGHT_TRANSITION_TASK, {
      minimumInterval: 60 * 15, // 15 minutes minimum
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  // Schedule a notification to trigger at midnight
  async scheduleMidnightNotification() {
    if (Platform.OS === 'web') return;

    try {
      // Request permissions if needed
      const { granted } = await Notifications.getPermissionsAsync();
      if (!granted) {
        const { granted: newGranted } = await Notifications.requestPermissionsAsync();
        if (!newGranted) return;
      }

      // Cancel any existing midnight notification
      await Notifications.cancelScheduledNotificationAsync(MIDNIGHT_NOTIFICATION_ID);

      // Calculate time to next midnight
      const now = new Date();
      const midnight = new Date();
      midnight.setDate(now.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      
      // Calculate seconds to midnight
      const secondsToMidnight = Math.floor((midnight.getTime() - now.getTime()) / 1000);

      // Schedule the notification - using daily trigger at midnight (00:00)
      await Notifications.scheduleNotificationAsync({
        identifier: MIDNIGHT_NOTIFICATION_ID,
        content: {
          title: 'New Day in MindFlow',
          body: 'Your tasks and daily goals have been refreshed. Start a new productive day!',
          sound: 'default',
          data: { type: 'midnight-transition' },
        },
        trigger: {
          hour: 0,
          minute: 0,
          repeats: true,
          channelId: 'default',
        },
      });

      console.log(`Midnight notification scheduled for 00:00 daily`);
    } catch (error) {
      console.error('Error scheduling midnight notification:', error);
    }
  }

  // Check if a date transition has occurred and handle it
  async checkDateTransition(): Promise<boolean> {
    try {
      // Get today's date in YYYY-MM-DD format
      const now = new Date();
      const today = this.formatDate(now);
      
      // Get the last active date
      const lastActiveDate = await AsyncStorage.getItem(LAST_ACTIVE_DATE_KEY);
      
      // If last active date is different from today or doesn't exist, we need to handle the transition
      if (!lastActiveDate || lastActiveDate !== today) {
        await this.handleDateTransition();
        
        // Update the last active date
        await AsyncStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking date transition:', error);
      return false;
    }
  }

  // Handle the date transition
  private async handleDateTransition() {
    try {
      // 1. Reset notification count
      await DeviceDataService.resetNotificationCount();
      
      // 2. Reset screen time tracking
      await this.resetScreenTimeTracking();
      
      // 3. Refresh tasks from API
      await this.refreshTasks();
      
      // 4. Reset daily note limit
      await this.resetDailyNoteLimit();
      
      // 5. Schedule new midnight notification for tomorrow
      await this.scheduleMidnightNotification();
      
      console.log('Date transition handled successfully');
    } catch (error) {
      console.error('Error handling date transition:', error);
    }
  }

  // Reset screen time tracking
  private async resetScreenTimeTracking() {
    try {
      // This uses the direct AsyncStorage key from the ScreenTime service
      await AsyncStorage.setItem('@MindFlow:screenTime', '0');
    } catch (error) {
      console.error('Error resetting screen time tracking:', error);
    }
  }

  // Refresh tasks from API
  private async refreshTasks() {
    try {
      const user_id = await AsyncStorage.getItem('@MindFlow:userId') || 'user_123'; // Default for testing
      
      // Send a request to refresh tasks for the new day
      // This endpoint should handle streak calculations and new day tasks
      await axios.post(`http://localhost:8000/api/tasks/${user_id}/refresh-day`);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  }

  // Reset daily note limit
  private async resetDailyNoteLimit() {
    try {
      await AsyncStorage.setItem('@MindFlow:dailyNoteSubmitted', 'false');
    } catch (error) {
      console.error('Error resetting daily note limit:', error);
    }
  }

  // Format date as YYYY-MM-DD
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  // Clean up resources
  async cleanup() {
    if (Platform.OS !== 'web') {
      try {
        // Unregister background task
        await BackgroundFetch.unregisterTaskAsync(MIDNIGHT_TRANSITION_TASK);
        
        // Cancel scheduled notification
        await Notifications.cancelScheduledNotificationAsync(MIDNIGHT_NOTIFICATION_ID);
      } catch (error) {
        console.error('Error cleaning up date transition service:', error);
      }
    }
  }
}

export default new DateTransitionService(); 