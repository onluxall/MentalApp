import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

//BACKEND TEAM: The home screen needs these endpoints:
//- GET /api/tasks/user - To fetch user's current tasks
//- GET /api/progress/streak - To get user's current streak
//- POST /api/tasks/complete/{taskId} - To mark a task as complete
//- GET /api/quotes - (Optional) To fetch motivational quotes

type RootStackParamList = {
  Home: { selectedTasks: number[] };
  Login: undefined;
  TaskDetail: { taskId: number };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
};

//Temporary task data
//BACKEND TEAM: Replace this with API data
const TASK_DETAILS: { [key: number]: any } = {
  1: {
    title: "Morning Routine Builder",
    description: "Create a consistent morning routine to start your day with purpose.",
    icon: "☀️",
    category: "habits"
  },
  2: {
    title: "Evening Wind Down",
    description: "Develop an evening routine to improve sleep and prepare for tomorrow.",
    icon: "🌙",
    category: "habits"
  },
  3: {
    title: "Emotion Journaling",
    description: "Write down three emotions you felt today and their triggers.",
    icon: "📝",
    category: "emotions"
  },
  4: {
    title: "Mindfulness Practice",
    description: "Practice 5 minutes of mindful breathing.",
    icon: "🧘",
    category: "emotions"
  },
  5: {
    title: "Task Batching",
    description: "Group similar tasks together for better efficiency.",
    icon: "📊",
    category: "productivity"
  }
};

//List of motivational quotes. we can expand it
const QUOTES = [
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Small daily improvements are the key to staggering long-term results.",
    author: "Anonymous"
  }
];

const HomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedTasks = [1, 3, 5] } = route.params || {}; //Default tasks if none provided
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [currentStreak, setCurrentStreak] = useState(1);
  
  //BACKEND TEAM: Implement actual logic to fetch user streak and completed tasks
  useEffect(() => {
    //Simulating data fetch from backend
    //In a real app, you would fetch this data from the backend API
    const fetchUserData = async () => {
      try {
        //Mock data
        setCurrentStreak(1);
        setCompletedTasks([]);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  //get today's date
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);
  
  //time-based greeting
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  };
  
  //random quote
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  
  //here we have to handle task completion
  const toggleTaskCompletion = (taskId: number) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
      
      //BACKEND TEAM: Add API call to mark task as completed
      //Example: api.markTaskCompleted(taskId);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          
          {/*Daily streak card*/}
          <View style={styles.streakCard}>
            <Text style={styles.streakTitle}>Your current streak</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakCount}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>{currentStreak === 1 ? "day" : "days"}</Text>
            </View>
            <Text style={styles.streakMessage}>Let's keep building your motivation!</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          
          {selectedTasks.length > 0 ? (
            selectedTasks.map((taskId) => {
              const task = TASK_DETAILS[taskId];
              if (!task) return null;
              
              const isCompleted = completedTasks.includes(taskId);
              
              return (
                <TouchableOpacity 
                  key={taskId} 
                  style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
                  onPress={() => toggleTaskCompletion(taskId)}
                >
                  <View style={styles.taskIconContainer}>
                    <Text style={styles.taskIcon}>{task.icon}</Text>
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDescription}>{task.description}</Text>
                    <View style={styles.taskProgress}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progress, 
                            { width: isCompleted ? '100%' : '0%' }
                          ]} 
                        />
                      </View>
                      <Text style={styles.taskStatus}>
                        {isCompleted ? 'Completed' : 'Not started'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tasks selected for today.</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.buttonText}>Start Over</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "{randomQuote.text}"
            </Text>
            <Text style={styles.quoteAuthor}>- {randomQuote.author}</Text>
          </View>

          {/*For demo purposes, a button to go back to start */}
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
  taskCardCompleted: {
    backgroundColor: '#f1f8f1',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
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
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;