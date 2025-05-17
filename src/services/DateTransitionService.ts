import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import DeviceDataService from './DeviceDataService';
import axios from 'axios';

const MIDNIGHT_TRANSITION_TASK = 'MIDNIGHT_TRANSITION_TASK';
const LAST_ACTIVE_DATE_KEY = '@MindFlow:lastActiveDate';
const MIDNIGHT_NOTIFICATION_ID = 'midnight-transition';

class DateTransitionService {
  async initialize() {
    try {
      await this.registerBackgroundTask();
      
      await this.scheduleMidnightNotification();
      
      await this.checkDateTransition();
    } catch (error) {
      console.error('Error initializing date transition service:', error);
    }
  }

  private async registerBackgroundTask() {
    if (Platform.OS === 'web') return;

    TaskManager.defineTask(MIDNIGHT_TRANSITION_TASK, async () => {
      try {
        const didTransition = await this.checkDateTransition();
        
        return didTransition 
          ? BackgroundFetch.BackgroundFetchResult.NewData
          : BackgroundFetch.BackgroundFetchResult.NoData;
      } catch (error) {
        console.error('Error in background task:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    await BackgroundFetch.registerTaskAsync(MIDNIGHT_TRANSITION_TASK, {
      minimumInterval: 60 * 15, 
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  async scheduleMidnightNotification() {
    if (Platform.OS === 'web') return;

    try {
      const { granted } = await Notifications.getPermissionsAsync();
      if (!granted) {
        const { granted: newGranted } = await Notifications.requestPermissionsAsync();
        if (!newGranted) return;
      }

      await Notifications.cancelScheduledNotificationAsync(MIDNIGHT_NOTIFICATION_ID);

      const now = new Date();
      const midnight = new Date();
      midnight.setDate(now.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      
      const secondsToMidnight = Math.floor((midnight.getTime() - now.getTime()) / 1000);

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

  async checkDateTransition(): Promise<boolean> {
    try {
      const now = new Date();
      const today = this.formatDate(now);
      
      const lastActiveDate = await AsyncStorage.getItem(LAST_ACTIVE_DATE_KEY);
      
      if (!lastActiveDate || lastActiveDate !== today) {
        await this.handleDateTransition();
        
        await AsyncStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking date transition:', error);
      return false;
    }
  }

  private async handleDateTransition() {
    try {
      await DeviceDataService.resetNotificationCount();
      
      await this.resetScreenTimeTracking();
      
      await this.refreshTasks();
      
      await this.resetDailyNoteLimit();
      
      await this.scheduleMidnightNotification();
      
      console.log('Date transition handled successfully');
    } catch (error) {
      console.error('Error handling date transition:', error);
    }
  }

  private async resetScreenTimeTracking() {
    try {
      await AsyncStorage.setItem('@MindFlow:screenTime', '0');
    } catch (error) {
      console.error('Error resetting screen time tracking:', error);
    }
  }

  private async refreshTasks() {
    try {
      const user_id = await AsyncStorage.getItem('@MindFlow:userId') || 'user_123'; 
      
      await axios.post(`http://localhost:8000/api/tasks/${user_id}/refresh-day`);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  }

  private async resetDailyNoteLimit() {
    try {
      await AsyncStorage.setItem('@MindFlow:dailyNoteSubmitted', 'false');
    } catch (error) {
      console.error('Error resetting daily note limit:', error);
    }
  }

  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  async cleanup() {
    if (Platform.OS !== 'web') {
      try {
        await BackgroundFetch.unregisterTaskAsync(MIDNIGHT_TRANSITION_TASK);
      
        await Notifications.cancelScheduledNotificationAsync(MIDNIGHT_NOTIFICATION_ID);
      } catch (error) {
        console.error('Error cleaning up date transition service:', error);
      }
    }
  }
}

export default new DateTransitionService(); 