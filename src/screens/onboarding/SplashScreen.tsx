import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

const SplashScreen = ({ navigation }: Props) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start the animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if user has completed assessment before
    const checkUserStatus = async () => {
      try {
        // In a real app, you would check AsyncStorage or an API
        const hasCompletedAssessment = await AsyncStorage.getItem('hasCompletedAssessment');
        
        setTimeout(() => {
          if (hasCompletedAssessment === 'true') {
            // User has completed assessment, go directly to Main
            navigation.replace('Main');
          } else {
            // First-time user, go to Login
            navigation.replace('Login');
          }
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error checking user status:', error);
        // Default to Login on error
        setTimeout(() => {
          navigation.replace('Login');
          setIsLoading(false);
        }, 2000);
      }
    };

    checkUserStatus();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.title}>MindFlow</Text>
        <Text style={styles.subtitle}>Your mental wellness companion</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
});

export default SplashScreen; 