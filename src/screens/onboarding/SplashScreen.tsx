import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

const SplashScreen = ({ navigation }: Props) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

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

    // Navigate to Login screen after animation
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
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