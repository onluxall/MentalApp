import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.date}>Friday, May 16</Text>
          </View>
          
          {/* Daily streak card */}
          <View style={styles.streakCard}>
            <Text style={styles.streakTitle}>Your current streak</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakCount}>1</Text>
              <Text style={styles.streakLabel}>day</Text>
            </View>
            <Text style={styles.streakMessage}>Let's keep building your motivation!</Text>
          </View>
          
          {/* Today's tasks */}
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          
          {/* Sample tasks - in a real app, these would come from your selected tasks */}
          <TouchableOpacity style={styles.taskCard}>
            <View style={styles.taskIconContainer}>
              <Text style={styles.taskIcon}>☀️</Text>
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>Morning Routine Builder</Text>
              <Text style={styles.taskDescription}>Create a consistent morning routine to start your day with purpose.</Text>
              <View style={styles.taskProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: '0%' }]} />
                </View>
                <Text style={styles.taskStatus}>Not started</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.taskCard}>
            <View style={styles.taskIconContainer}>
              <Text style={styles.taskIcon}>📝</Text>
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>Daily Priority Setting</Text>
              <Text style={styles.taskDescription}>Identify your top 3 priorities for tomorrow.</Text>
              <View style={styles.taskProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: '0%' }]} />
                </View>
                <Text style={styles.taskStatus}>Not started</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.taskCard}>
            <View style={styles.taskIconContainer}>
              <Text style={styles.taskIcon}>🙏</Text>
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>Gratitude Practice</Text>
              <Text style={styles.taskDescription}>Write down three things you're grateful for today.</Text>
              <View style={styles.taskProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: '0%' }]} />
                </View>
                <Text style={styles.taskStatus}>Not started</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Motivational Quote */}
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "Motivation is what gets you started. Habit is what keeps you going."
            </Text>
            <Text style={styles.quoteAuthor}>- Jim Ryun</Text>
          </View>
          
          {/* For demo purposes, a button to go back to start */}
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.restartButtonText}>Restart Demo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Continuation of HomeScreen.tsx styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  streakCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  streakLabel: {
    fontSize: 20,
    color: '#666',
    marginLeft: 5,
  },
  streakMessage: {
    fontSize: 14,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 15,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e6f7e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  taskIcon: {
    fontSize: 20,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginRight: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  taskStatus: {
    fontSize: 12,
    color: '#888',
  },
  quoteCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 15,
    padding: 20,
    margin: 20,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#2E7D32',
    marginBottom: 10,
    lineHeight: 26,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  restartButton: {
    backgroundColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  restartButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default HomeScreen;