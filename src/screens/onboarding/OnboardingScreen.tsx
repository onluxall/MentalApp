import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Switch,
  ScrollView,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Onboarding: undefined;
  Assessment: undefined;
  Evaluation: { answers: { [key: number]: number } };
  TaskSelection: { selectedCategories: string[], recommendations: any[] };
  Home: { selectedTasks: number[] };
  TaskDetail: { taskId: number };
};

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

type Props = {
  navigation: OnboardingScreenNavigationProp;
};

type OnboardingStep = {
  title: string;
  description: string;
  icon: string;
  type: 'intro' | 'motivation' | 'notification' | 'preferences';
  subtext?: string;
};

const OnboardingScreen = ({ navigation }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStyle, setNotificationStyle] = useState<'discreet' | 'encouraging'>('encouraging');
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [motivationalQuotes, setMotivationalQuotes] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const steps: OnboardingStep[] = [
    {
      title: 'Welcome to MindFlow',
      description: 'Your journey to better mental wellness starts here. We\'re excited to be part of your growth!',
      icon: '🌟',
      type: 'intro',
      subtext: 'Take a deep breath. You\'ve made a great choice.',
    },
    {
      title: 'Your Wellness Journey',
      description: 'Every small step counts. We\'ll help you build healthy habits and celebrate your progress.',
      icon: '🌱',
      type: 'intro',
      subtext: 'Remember: Progress, not perfection.',
    },
    {
      title: 'Daily Motivation',
      description: 'Start each day with positive affirmations and gentle reminders to take care of yourself.',
      icon: '💫',
      type: 'motivation',
      subtext: 'You are stronger than you think.',
    },
    {
      title: 'Stay Connected',
      description: 'Choose how you\'d like to receive gentle reminders and encouragement on your journey.',
      icon: '🔔',
      type: 'notification',
      subtext: 'We\'re here to support you, your way.',
    },
    {
      title: 'Your Preferences',
      description: 'Customize your experience to make it work best for you. Your comfort matters.',
      icon: '⚙️',
      type: 'preferences',
      subtext: 'This is your safe space.',
    },
  ];

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      if (notificationsEnabled) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permissions not granted');
        } else {
          await Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: notificationStyle === 'encouraging',
              shouldSetBadge: false,
              shouldShowBanner: true,
              shouldShowList: true,
              severity: 'default'
            }),
          });
        }
      }
      navigation.navigate('Assessment');
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // Change step
        setCurrentStep(prev => prev + 1);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const renderStep = (step: OnboardingStep) => {
    return (
      <Animated.View
        style={[
          styles.stepContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.icon}>{step.icon}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>
        {step.subtext && <Text style={styles.subtext}>{step.subtext}</Text>}

        {step.type === 'motivation' && (
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationTitle}>Daily Affirmations</Text>
            <View style={styles.affirmationCard}>
              <Text style={styles.affirmationText}>
                "Every day is a new opportunity to grow and heal."
              </Text>
            </View>
            <View style={styles.affirmationCard}>
              <Text style={styles.affirmationText}>
                "I am worthy of peace and happiness."
              </Text>
            </View>
          </View>
        )}

        {step.type === 'notification' && (
          <View style={styles.settingsContainer}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive gentle reminders and encouragement
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#6200ee' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>
            
            {notificationsEnabled && (
              <>
                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Notification Style</Text>
                    <Text style={styles.settingDescription}>
                      Choose how you'd like to be reminded
                    </Text>
                  </View>
                  <View style={styles.styleButtons}>
                    <TouchableOpacity
                      style={[
                        styles.styleButton,
                        notificationStyle === 'discreet' && styles.styleButtonActive,
                      ]}
                      onPress={() => setNotificationStyle('discreet')}
                    >
                      <Text style={[
                        styles.styleButtonText,
                        notificationStyle === 'discreet' && styles.styleButtonTextActive,
                      ]}>Discreet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.styleButton,
                        notificationStyle === 'encouraging' && styles.styleButtonActive,
                      ]}
                      onPress={() => setNotificationStyle('encouraging')}
                    >
                      <Text style={[
                        styles.styleButtonText,
                        notificationStyle === 'encouraging' && styles.styleButtonTextActive,
                      ]}>Encouraging</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Daily Wellness Check-in</Text>
                    <Text style={styles.settingDescription}>
                      Gentle reminders to track your mood
                    </Text>
                  </View>
                  <Switch
                    value={dailyReminders}
                    onValueChange={setDailyReminders}
                    trackColor={{ false: '#767577', true: '#6200ee' }}
                    thumbColor={dailyReminders ? '#ffffff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Weekly Progress</Text>
                    <Text style={styles.settingDescription}>
                      Celebrate your achievements
                    </Text>
                  </View>
                  <Switch
                    value={weeklyReports}
                    onValueChange={setWeeklyReports}
                    trackColor={{ false: '#767577', true: '#6200ee' }}
                    thumbColor={weeklyReports ? '#ffffff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Motivational Quotes</Text>
                    <Text style={styles.settingDescription}>
                      Daily inspiration and positive affirmations
                    </Text>
                  </View>
                  <Switch
                    value={motivationalQuotes}
                    onValueChange={setMotivationalQuotes}
                    trackColor={{ false: '#767577', true: '#6200ee' }}
                    thumbColor={motivationalQuotes ? '#ffffff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Achievement Alerts</Text>
                    <Text style={styles.settingDescription}>
                      Celebrate your milestones and progress
                    </Text>
                  </View>
                  <Switch
                    value={achievementAlerts}
                    onValueChange={setAchievementAlerts}
                    trackColor={{ false: '#767577', true: '#6200ee' }}
                    thumbColor={achievementAlerts ? '#ffffff' : '#f4f3f4'}
                  />
                </View>
              </>
            )}
          </View>
        )}

        {step.type === 'preferences' && (
          <View style={styles.preferencesContainer}>
            <TouchableOpacity style={styles.preferenceButton}>
              <Text style={styles.preferenceButtonText}>Dark Mode</Text>
              <Text style={styles.preferenceButtonSubtext}>Coming soon - For comfortable night-time use</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.preferenceButton}>
              <Text style={styles.preferenceButtonText}>Voice Input</Text>
              <Text style={styles.preferenceButtonSubtext}>Coming soon - Share your thoughts naturally</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.preferenceButton}>
              <Text style={styles.preferenceButtonText}>Accessibility Options</Text>
              <Text style={styles.preferenceButtonSubtext}>Coming soon - Making wellness accessible to all</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderStep(steps[currentStep])}
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentStep && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentStep === steps.length - 1 ? 'Begin Your Journey' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  stepContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
    textShadowColor: 'rgba(98, 0, 238, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  motivationContainer: {
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 12,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  affirmationCard: {
    backgroundColor: '#f8f0ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6d6ff',
    shadowColor: '#6200ee',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  affirmationText: {
    fontSize: 15,
    color: '#6200ee',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  settingsContainer: {
    width: '100%',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  styleButtons: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 2,
  },
  styleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  styleButtonActive: {
    backgroundColor: '#6200ee',
    shadowColor: '#6200ee',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  styleButtonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  styleButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  preferencesContainer: {
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 12,
  },
  preferenceButton: {
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  preferenceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  preferenceButtonSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: '#6200ee',
    width: 20,
    shadowColor: '#6200ee',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#6200ee',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default OnboardingScreen; 