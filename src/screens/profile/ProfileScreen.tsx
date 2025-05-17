import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

type SettingItem = {
  id: string;
  title: string;
  type: 'switch' | 'navigation';
  value?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const ProfileScreen = () => {
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    joinDate: '2023-09-15',
    streakCount: 0,
    tasksCompleted: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const user_id = 'user_123';
      const response = await axios.get(`http://localhost:8000/api/tasks/${user_id}`);
      
      if (response.data) {
        if (response.data.streak_info) {
          setUser(prevUser => ({
            ...prevUser,
            streakCount: response.data.streak_info.current_streak || 0
          }));
        }
        
        const progressResponse = await axios.get(`http://localhost:8000/api/progress/${user_id}`);
        if (progressResponse.data && progressResponse.data.total_stats) {
          setUser(prevUser => ({
            ...prevUser,
            tasksCompleted: progressResponse.data.total_stats.total_tasks_completed || prevUser.tasksCompleted
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'notifications',
      title: 'Push Notifications',
      type: 'switch',
      value: true,
      icon: 'notifications',
      color: '#4CAF50'
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      type: 'switch',
      value: false,
      icon: 'moon',
      color: '#673AB7'
    },
    {
      id: 'privacy',
      title: 'Privacy',
      type: 'navigation',
      icon: 'shield-checkmark',
      color: '#2196F3'
    },
    {
      id: 'account',
      title: 'Account',
      type: 'navigation',
      icon: 'person',
      color: '#FF9800'
    },
    {
      id: 'help',
      title: 'Help & Support',
      type: 'navigation',
      icon: 'help-circle',
      color: '#00BCD4'
    },
    {
      id: 'about',
      title: 'About',
      type: 'navigation',
      icon: 'information-circle',
      color: '#9E9E9E'
    }
  ]);

  const handleToggleSetting = (id: string) => {
    setSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.id === id ? { ...setting, value: !setting.value } : setting
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/lego/1.jpg' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {loading ? <ActivityIndicator size="small" color="#6200ee" /> : user.tasksCompleted}
              </Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {loading ? <ActivityIndicator size="small" color="#6200ee" /> : user.streakCount}
              </Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {settings.map(setting => (
            <View key={setting.id} style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                <Ionicons name={setting.icon} size={24} color={setting.color} />
              </View>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              {setting.type === 'switch' ? (
                <Switch
                  value={setting.value}
                  onValueChange={() => handleToggleSetting(setting.id)}
                  trackColor={{ false: '#d1d1d1', true: '#81c784' }}
                  thumbColor={setting.value ? '#4CAF50' : '#f5f5f5'}
                />
              ) : (
                <TouchableOpacity>
                  <Ionicons name="chevron-forward" size={24} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#6200ee',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    padding: 10,
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    marginTop: 5,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff5252',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  }
});

export default ProfileScreen; 