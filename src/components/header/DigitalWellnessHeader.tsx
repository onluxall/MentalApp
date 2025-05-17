import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DeviceDataService, { WellnessData } from '../../services/DeviceDataService';

interface DigitalWellnessHeaderProps {
  userName?: string;
  streakCount?: number;
  taskCompletion?: number;
}

const DigitalWellnessHeader: React.FC<DigitalWellnessHeaderProps> = ({ 
  userName = 'Friend',
  streakCount = 0,
  taskCompletion = 0
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [wellnessOpacity] = useState(new Animated.Value(0));
  const [usageStats, setUsageStats] = useState<WellnessData>({
    screenTime: '0h 0m',
    notifications: 0,
    sessionGoal: '25m',
    focusScore: 50
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const loadDeviceData = async () => {
    setIsLoading(true);
    try {
      const data = await DeviceDataService.getWellnessData();
      setUsageStats(data);
    } catch (error) {
      console.error('Error loading wellness data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeviceData();
  
    const subscription = DeviceDataService.setupNotificationTracking();
  
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDeviceData();
    }, [])
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const hours = now.getHours();
      const minutes = now.getMinutes();
      if (hours === 0 && minutes === 0) {
        DeviceDataService.resetNotificationCount();
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    if (hour >= 18 && hour < 22) return "Good evening";
    return "Good night";
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return currentTime.toLocaleDateString('en-US', options);
  };

  const getWellnessQuote = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 10) return "Morning mindfulness sets the tone for your day";
    if (hour >= 10 && hour < 14) return "Stay hydrated and take regular breaks";
    if (hour >= 14 && hour < 18) return "How are you feeling? Take a moment to check in";
    if (hour >= 18 && hour < 22) return "Wind down by limiting screen time";
    return "Time to rest your mind and body";
  };

  const getFocusScoreColor = () => {
    if (usageStats.focusScore >= 80) return '#4CAF50';
    if (usageStats.focusScore >= 60) return '#FFA000';
    return '#F44336';
  };

  const toggleWellnessModal = () => {
    if (showWellnessModal) {
      Animated.timing(wellnessOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowWellnessModal(false));
    } else {
      setShowWellnessModal(true);
      loadDeviceData();
      Animated.timing(wellnessOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getGreeting()}, {userName}</Text>
            <Text style={styles.date}>{getFormattedDate()}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.wellnessButton}
            onPress={toggleWellnessModal}
          >
            <View style={[styles.focusScoreCircle, { borderColor: getFocusScoreColor() }]}>
              <Text style={[styles.focusScoreText, { color: getFocusScoreColor() }]}>
                {usageStats.focusScore}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.insightBar}>
          <View style={styles.insightItem}>
            <Ionicons name="flame-outline" size={18} color="#FF9500" />
            <Text style={styles.insightText}>{streakCount} day streak</Text>
          </View>
          <View style={styles.insightDivider} />
          <View style={styles.insightItem}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
            <Text style={styles.insightText}>{taskCompletion}% completed</Text>
          </View>
          <View style={styles.insightDivider} />
          <View style={styles.insightItem}>
            <Ionicons name="phone-portrait-outline" size={18} color="#007AFF" />
            <Text style={styles.insightText}>{usageStats.screenTime}</Text>
          </View>
        </View>

        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>{getWellnessQuote()}</Text>
        </View>
      </View>

      <Modal
        visible={showWellnessModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => toggleWellnessModal()}
      >
        <Animated.View 
          style={[styles.modalOverlay, { opacity: wellnessOpacity }]}
          onTouchEnd={() => toggleWellnessModal()}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Digital Wellness</Text>
            
            <View style={styles.wellnessSection}>
              <View style={styles.wellnessItem}>
                <View style={styles.wellnessIconContainer}>
                  <Ionicons name="time-outline" size={24} color="#007AFF" />
                </View>
                <View style={styles.wellnessDetails}>
                  <Text style={styles.wellnessLabel}>Screen Time</Text>
                  <Text style={styles.wellnessValue}>{usageStats.screenTime}</Text>
                </View>
              </View>
              
              <View style={styles.wellnessItem}>
                <View style={styles.wellnessIconContainer}>
                  <Ionicons name="notifications-outline" size={24} color="#FF9500" />
                </View>
                <View style={styles.wellnessDetails}>
                  <Text style={styles.wellnessLabel}>Notifications</Text>
                  <Text style={styles.wellnessValue}>{usageStats.notifications} today</Text>
                </View>
              </View>
              
              <View style={styles.wellnessItem}>
                <View style={styles.wellnessIconContainer}>
                  <Ionicons name="timer-outline" size={24} color="#4CAF50" />
                </View>
                <View style={styles.wellnessDetails}>
                  <Text style={styles.wellnessLabel}>Focus Session</Text>
                  <Text style={styles.wellnessValue}>{usageStats.sessionGoal}</Text>
                </View>
              </View>
              
              <View style={styles.wellnessItem}>
                <View style={[
                  styles.wellnessIconContainer, 
                  { backgroundColor: `${getFocusScoreColor()}20` }
                ]}>
                  <Ionicons name="analytics-outline" size={24} color={getFocusScoreColor()} />
                </View>
                <View style={styles.wellnessDetails}>
                  <Text style={styles.wellnessLabel}>Focus Score</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${usageStats.focusScore}%`,
                            backgroundColor: getFocusScoreColor()
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.wellnessValue, { color: getFocusScoreColor() }]}>
                      {usageStats.focusScore}/100
                    </Text>
                  </View>
                </View>
              </View>

              {/* Add Battery Level to Modal */}
              {usageStats.batteryLevel !== undefined && Platform.OS !== 'web' && (
                <View style={styles.wellnessItem}>
                  <View style={[
                    styles.wellnessIconContainer, 
                    { backgroundColor: 'rgba(76, 175, 80, 0.1)' } // Green color for battery
                  ]}>
                    <Ionicons name="battery-half-outline" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.wellnessDetails}>
                    <Text style={styles.wellnessLabel}>Battery Level</Text>
                    <Text style={styles.wellnessValue}>{usageStats.batteryLevel}%</Text>
                  </View>
                </View>
              )}

            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => toggleWellnessModal()}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#6200ee',
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  wellnessButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusScoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  insightBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    marginTop: 15,
    marginHorizontal: 20,
    paddingVertical: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightDivider: {
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  insightText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  quoteContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
  },
  quoteText: {
    color: 'white',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 20,
    textAlign: 'center',
  },
  wellnessSection: {
    marginBottom: 20,
  },
  wellnessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  wellnessIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  wellnessDetails: {
    flex: 1,
  },
  wellnessLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  wellnessValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  closeButton: {
    alignSelf: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DigitalWellnessHeader; 