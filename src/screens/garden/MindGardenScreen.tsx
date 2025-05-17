import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import GrowingPlant from '../../components/garden/GrowingPlant';

// Interface for achievement data structure
interface Achievement {
  id: string;
  text: string;
  type: string;
  threshold: number;
  icon: string;
  completed: boolean;
  completion_date: string | null;
}

const MindGardenScreen = () => {
  // No longer need plantStage, will use streak directly in GrowingPlant
  const [animatedScale] = useState(new Animated.Value(1));
  const [animatedOpacity] = useState(new Animated.Value(1));
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch streak and achievement data
  const fetchData = async () => {
    try {
      setLoading(true);
      const user_id = 'user_123'; // Use same user ID as other screens
      
      // Fetch streak data
      const streakResponse = await axios.get(`http://localhost:8000/api/tasks/${user_id}`);
      if (streakResponse.data && streakResponse.data.streak_info) {
        const streakData = streakResponse.data.streak_info;
        setStreak(streakData.current_streak || 0);
      }
      
      // Fetch achievement data
      const achievementsResponse = await axios.get(`http://localhost:8000/api/achievements/${user_id}`);
      if (achievementsResponse.data && achievementsResponse.data.achievements) {
        setAchievements(achievementsResponse.data.achievements);
      }
    } catch (error) {
      console.error('Error fetching garden data:', error);
      setError('Failed to load garden data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Animation for scale effect (keep this for container animation)
  useEffect(() => {
    Animated.sequence([
      Animated.timing(animatedScale, {
        toValue: 1.1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animatedScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [streak]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#e6f7ff', '#ccefff']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Your Mind Garden</Text>
          <Text style={styles.subtitle}>
            {loading ? 'Loading streak data...' : `${streak} day streak - Keep it growing!`}
          </Text>
          
          <View style={styles.plantContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Animated.View>
                  <Text style={styles.loadingText}>Growing your garden...</Text>
                </Animated.View>
              </View>
            ) : (
              <Animated.View style={styles.plantWrapper}>
                {/* Replace emoji with GrowingPlant component */}
                <GrowingPlant 
                  streak={streak} 
                  maxStreak={30}
                  size={280}
                  animate={true}
                />
              </Animated.View>
            )}
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <Text style={styles.achievementsTitle}>Achievements</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading achievements...</Text>
          ) : (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalAchievementsContainer}>
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <View 
                    key={achievement.id} 
                    style={[
                      styles.achievementLeaf,
                      achievement.completed ? styles.completedLeaf : styles.incompleteLeaf
                    ]}
                  >
                    <Text style={styles.achievementText}>
                      {achievement.icon} {achievement.text}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noAchievementsText}>
                  Complete tasks and maintain streaks to earn achievements!
                </Text>
              )}
            </ScrollView>
          )}
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>How It Works</Text>
            <Text style={styles.infoText}>
              Your plant grows as you maintain your daily streak.
              Complete all your tasks each day to keep your streak going!
              The leaves represent achievements you've earned along the way.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Remove styles for plantEmoji as it's no longer needed
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    marginBottom: 30,
  },
  plantContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  plantWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  achievementsContainer: {
    paddingHorizontal: 10,
    marginBottom: 30,
    marginTop: 15,
  },
  horizontalAchievementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  achievementLeaf: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 6,
    marginVertical: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  completedLeaf: {
    backgroundColor: '#e8f5e9',
  },
  incompleteLeaf: {
    backgroundColor: '#f5f5f5',
  },
  achievementText: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
  },
  noAchievementsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  infoContainer: {
    backgroundColor: '#f1f8e9',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 30,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default MindGardenScreen; 