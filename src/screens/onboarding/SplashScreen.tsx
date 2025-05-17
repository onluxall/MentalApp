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

    const checkUserStatus = async () => {
      try {
        const hasCompletedAssessment = await AsyncStorage.getItem('hasCompletedAssessment');
        
        setTimeout(() => {
          if (hasCompletedAssessment === 'true') {
            navigation.replace('Main');
          } else {
            navigation.replace('Login');
          }
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error checking user status:', error);
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