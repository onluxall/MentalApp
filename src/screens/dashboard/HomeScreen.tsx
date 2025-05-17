import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, ActivityIndicator, Animated, Easing } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';

//BACKEND TEAM: The home screen needs these endpoints:
//- GET /api/tasks/user - To fetch user's current tasks
//- GET /api/progress/streak - To get user's current streak
//- POST /api/tasks/complete/{taskId} - To mark a task as complete
//- GET /api/quotes - (Optional) To fetch motivational quotes

type RootStackParamList = {
  Home: { selectedTasks: number[] };
  Login: undefined;
  TaskDetail: { taskId: number };
  TaskSelection: undefined;
  Assessment: undefined;
  Onboarding: undefined;
  Splash: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
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

// New types for daily notes
type DailyNote = {
  note_id: number;
  user_id: string;
  message: string;
  created_at: string;
  likes: number;
  category?: string;
  mood?: string;
};

type StreakInfo = {
  current_streak: number;
  longest_streak: number;
  streak_status: string;
  streak_message: string;
  today_completed: number;
  today_total: number;
  all_tasks_completed_today: boolean;
};

type CompletionStatus = {
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  all_completed: boolean;
};

type TaskResponse = {
  tasks: any[];
  streak_info: StreakInfo;
  completion_status: CompletionStatus;
};

const HomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedTasks = [1, 3, 5] } = route.params || {}; //Default tasks if none provided
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({
    current_streak: 0,
    longest_streak: 0,
    streak_status: 'no_streak',
    streak_message: 'Complete all tasks today to start a streak!',
    today_completed: 0,
    today_total: 0,
    all_tasks_completed_today: false
  });
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    total_tasks: 0,
    completed_tasks: 0,
    completion_percentage: 0,
    all_completed: false
  });
  const [dailyNote, setDailyNote] = useState<string>('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [randomNote, setRandomNote] = useState<DailyNote | null>(null);
  const [noteCategory, setNoteCategory] = useState<string>('motivation');
  const [noteMood, setNoteMood] = useState<string>('grateful');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [progressAnim] = useState(new Animated.Value(0));
  const [taskAnimations] = useState<{[key: number]: Animated.Value}>({});
  const [cardAnim] = useState(new Animated.Value(1));
  const [taskScaleAnim] = useState<{[key: number]: Animated.Value}>({});
  
  // Fetch tasks and progress on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Only fetch user data, don't reset progress
        await fetchUserData();
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load data. Please try again.');
      }
    };
    
    initializeData();
  }, []);

  // Add a cleanup effect to reset streak on unmount
  useEffect(() => {
    return () => {
      // Reset streak info when component unmounts
      setStreakInfo({
        current_streak: 0,
        longest_streak: 0,
        streak_status: 'no_streak',
        streak_message: 'Complete all tasks today to start a streak!',
        today_completed: 0,
        today_total: 0,
        all_tasks_completed_today: false
      });
    };
  }, []);

  // Update fetchUserData to handle task display properly
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const user_id = 'user_123';

      // Fetch tasks and streak info
      const tasksResponse = await axios.get<TaskResponse>(`http://localhost:8000/api/tasks/${user_id}`);
      
      // Update streak info
      const streakData = tasksResponse.data.streak_info;
      setStreakInfo({
        current_streak: streakData.current_streak || 0,
        longest_streak: streakData.longest_streak || 0,
        streak_status: streakData.streak_status || 'no_streak',
        streak_message: streakData.streak_message || 'Complete all tasks today to start a streak!',
        today_completed: streakData.today_completed || 0,
        today_total: streakData.today_total || 0,
        all_tasks_completed_today: streakData.all_tasks_completed_today || false
      });

      // Update tasks and completion status
      if (tasksResponse.data.tasks && Array.isArray(tasksResponse.data.tasks)) {
        setTasks(tasksResponse.data.tasks);
        setCompletionStatus(tasksResponse.data.completion_status);
      } else {
        setError('Invalid task data received');
      }
      
      setLoading(false);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to load tasks. Please try again.');
      setLoading(false);
      throw error;
    }
  };

  // Initialize animation values for tasks
  useEffect(() => {
    tasks.forEach(task => {
      if (!taskAnimations[task.task_id]) {
        taskAnimations[task.task_id] = new Animated.Value(task.status === 'completed' ? 1 : 0);
      }
    });
  }, [tasks]);

  // Animate progress bar
  useEffect(() => {
    const progressValue = streakInfo.today_total > 0 
      ? streakInfo.today_completed / streakInfo.today_total 
      : 0;
      
    Animated.timing(progressAnim, {
      toValue: progressValue,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [streakInfo.today_completed, streakInfo.today_total]);

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
  
  // Update toggleTaskCompletion to handle the response
  const toggleTaskCompletion = async (taskId: number) => {
    try {
      const user_id = 'user_123';
      const response = await axios.post(`http://localhost:8000/api/tasks/${user_id}/complete/${taskId}`);
      
      if (response.data.progress) {
        const progress = response.data.progress;
        
        // Update streak info with values from backend
        setStreakInfo({
          current_streak: progress.current_streak,
          longest_streak: progress.longest_streak,
          streak_status: progress.streak_status,
          streak_message: progress.streak_message,
          today_completed: progress.today_completed,
          today_total: progress.today_total,
          all_tasks_completed_today: progress.all_tasks_completed_today
        });

        // Update tasks
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.task_id === taskId 
              ? { ...task, status: response.data.task.status }
              : task
          )
        );

        // Animate changes
        requestAnimationFrame(() => {
          // Animate task progress
          if (taskAnimations[taskId]) {
            Animated.timing(taskAnimations[taskId], {
              toValue: response.data.task.status === 'completed' ? 1 : 0,
              duration: 300,
              useNativeDriver: false,
              easing: Easing.out(Easing.ease),
            }).start();
          }

          // Animate overall progress
          Animated.timing(progressAnim, {
            toValue: progress.today_completed / progress.today_total,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease),
          }).start();
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  // Fetch random note on component mount
  useEffect(() => {
    fetchRandomNote();
  }, []);

  const fetchRandomNote = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/notes/random', {
        params: {
          user_id: 'user_123', // TODO: Replace with actual user ID
          exclude_own: true
        }
      });
      setRandomNote(response.data);
    } catch (error) {
      console.error('Error fetching random note:', error);
    }
  };

  const handleSubmitNote = async () => {
    if (!dailyNote.trim() || dailyNote.length < 10) {
      setNoteError('Note must be at least 10 characters long');
      return;
    }

    setIsSubmittingNote(true);
    setNoteError(null);

    try {
      await axios.post('http://localhost:8000/api/notes/daily', {
        user_id: 'user_123', // TODO: Replace with actual user ID
        message: dailyNote.trim(),
        category: noteCategory,
        mood: noteMood,
        is_public: true
      });

      setDailyNote('');
      setShowNoteModal(false);
      fetchRandomNote(); // Refresh random note
    } catch (error: any) {
      if (error.response?.status === 400) {
        setNoteError('You can only create one note per day');
      } else {
        setNoteError('Failed to create note. Please try again.');
      }
    } finally {
      setIsSubmittingNote(false);
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
          
          {/* Progress Card with Streak */}
          <View style={[
            styles.progressCard,
            streakInfo.current_streak > 0 && styles.progressCardIncreased,
            streakInfo.streak_status === 'decreased' && styles.progressCardDecreased,
            (streakInfo.streak_status === 'no_streak' || streakInfo.current_streak === 0) && styles.progressCardNoStreak
          ]}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <View style={[
                styles.streakBadge,
                streakInfo.current_streak > 0 && styles.streakBadgeActive
              ]}>
                <Text style={[
                  styles.streakBadgeText,
                  streakInfo.current_streak > 0 && styles.streakBadgeTextActive
                ]}>
                  {streakInfo.current_streak} 🔥
                </Text>
              </View>
            </View>
            
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressCount}>
                    {streakInfo.today_completed}/{streakInfo.today_total}
                  </Text>
                </View>
                <Text style={styles.progressLabel}>tasks completed</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progress, 
                      { 
                        width: `${(streakInfo.today_completed / streakInfo.today_total) * 100}%`
                      }
                    ]} 
                  />
                </View>
                <View style={styles.progressMarkers}>
                  {[...Array(streakInfo.today_total)].map((_, i) => (
                    <View key={i} style={styles.progressMarker} />
                  ))}
                </View>
              </View>
            </View>

            {/* Status Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.progressMessage}>
                {streakInfo.streak_message}
              </Text>
              {streakInfo.longest_streak > 0 && (
                <Text style={styles.longestStreak}>
                  Best streak: {streakInfo.longest_streak} days
                </Text>
              )}
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchUserData}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : tasks.length > 0 ? (
            tasks.map((task) => {
              return (
                <TouchableOpacity 
                  key={task.task_id} 
                  style={[
                    styles.taskCard,
                    task.status === 'completed' && styles.taskCardCompleted
                  ]}
                  onPress={() => toggleTaskCompletion(task.task_id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.taskIconContainer}>
                    <Text style={styles.taskIcon}>
                      {task.category === 'habits' ? '🔄' : 
                       task.category === 'emotions' ? '😌' : 
                       task.category === 'productivity' ? '⏱️' : 
                       task.category === 'discipline' ? '🎯' : 
                       task.category === 'mindset' ? '🧠' : '📝'}
                    </Text>
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDescription}>{task.description}</Text>
                    <View style={styles.taskMeta}>
                      <Text style={styles.taskDifficulty}>Difficulty: {task.difficulty}</Text>
                      <Text style={styles.taskDuration}>Duration: {task.estimated_duration}</Text>
                    </View>
                    <View style={styles.taskProgress}>
                      <View style={styles.progressBar}>
                        <Animated.View 
                          style={[
                            styles.progress, 
                            { 
                              width: taskAnimations[task.task_id]?.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%']
                              }) || '0%'
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.taskStatus}>
                        {task.status === 'completed' ? 'Completed' : 'Not started'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {streakInfo.streak_message === "Please complete task selection to start your journey!"
                  ? "You need to select your tasks first!"
                  : "No tasks for today."}
              </Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  if (streakInfo.streak_message === "Please complete task selection to start your journey!") {
                    navigation.navigate('TaskSelection');
                  } else {
                    navigation.navigate('Login');
                  }
                }}
              >
                <Text style={styles.buttonText}>
                  {streakInfo.streak_message === "Please complete task selection to start your journey!"
                    ? "Select Tasks"
                    : "Start Assessment"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Daily Note Section */}
          <View style={styles.dailyNoteSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Note</Text>
              <TouchableOpacity 
                style={styles.addNoteButton}
                onPress={() => setShowNoteModal(true)}
              >
                <Text style={styles.addNoteButtonText}>+ Add Note</Text>
              </TouchableOpacity>
            </View>

            {randomNote ? (
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>{randomNote.message}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteMeta}>
                    {randomNote.category && `#${randomNote.category} `}
                    {randomNote.mood && `#${randomNote.mood}`}
                  </Text>
                  <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={fetchRandomNote}
                  >
                    <Text style={styles.refreshButtonText}>🔄 New Note</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyNoteCard}>
                <Text style={styles.emptyNoteText}>No notes available yet</Text>
                <TouchableOpacity 
                  style={styles.addNoteButton}
                  onPress={() => setShowNoteModal(true)}
                >
                  <Text style={styles.addNoteButtonText}>Be the first to share!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

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

          {/* Note Creation Modal */}
          <Modal
            visible={showNoteModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowNoteModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Share Your Daily Note</Text>
                
                <TextInput
                  style={styles.noteInput}
                  multiline
                  placeholder="What's on your mind today? (min. 10 characters)"
                  value={dailyNote}
                  onChangeText={setDailyNote}
                  maxLength={500}
                />

                <View style={styles.noteOptions}>
                  <View style={styles.optionContainer}>
                    <Text style={styles.optionLabel}>Category:</Text>
                    <View style={styles.categoryButtons}>
                      {['motivation', 'gratitude', 'reflection'].map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryButton,
                            noteCategory === cat && styles.categoryButtonSelected
                          ]}
                          onPress={() => setNoteCategory(cat)}
                        >
                          <Text style={[
                            styles.categoryButtonText,
                            noteCategory === cat && styles.categoryButtonTextSelected
                          ]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.optionContainer}>
                    <Text style={styles.optionLabel}>Mood:</Text>
                    <View style={styles.moodButtons}>
                      {['grateful', 'happy', 'inspired'].map((mood) => (
                        <TouchableOpacity
                          key={mood}
                          style={[
                            styles.moodButton,
                            noteMood === mood && styles.moodButtonSelected
                          ]}
                          onPress={() => setNoteMood(mood)}
                        >
                          <Text style={[
                            styles.moodButtonText,
                            noteMood === mood && styles.moodButtonTextSelected
                          ]}>
                            {mood}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {noteError && (
                  <Text style={styles.errorText}>{noteError}</Text>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowNoteModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.submitButton,
                      (!dailyNote.trim() || isSubmittingNote) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmitNote}
                    disabled={!dailyNote.trim() || isSubmittingNote}
                  >
                    {isSubmittingNote ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.submitButtonText}>Share Note</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  streakBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  streakBadgeActive: {
    backgroundColor: '#f0e6ff',
    borderColor: '#6200ee',
  },
  streakBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  streakBadgeTextActive: {
    color: '#6200ee',
  },
  progressSection: {
    width: '100%',
    marginBottom: 20,
  },
  progressInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  progressCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progress: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: 4,
  },
  progressMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  progressMarker: {
    width: 2,
    height: 6,
    backgroundColor: '#ccc',
    borderRadius: 1,
  },
  messageContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressMessage: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 5,
  },
  longestStreak: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  progressCardIncreased: {
    backgroundColor: '#f1f8e9',
    borderColor: '#4CAF50',
  },
  progressCardDecreased: {
    backgroundColor: '#fff8e1',
    borderColor: '#FFA000',
  },
  progressCardNoStreak: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
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
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  taskDifficulty: {
    fontSize: 12,
    color: '#888',
  },
  taskDuration: {
    fontSize: 12,
    color: '#888',
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
  dailyNoteSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addNoteButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addNoteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteMeta: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    color: '#6200ee',
    fontSize: 14,
  },
  emptyNoteCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  emptyNoteText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
  },
  noteOptions: {
    marginBottom: 20,
  },
  optionContainer: {
    marginBottom: 15,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonSelected: {
    backgroundColor: '#6200ee',
  },
  categoryButtonText: {
    color: '#666',
  },
  categoryButtonTextSelected: {
    color: 'white',
  },
  moodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  moodButtonSelected: {
    backgroundColor: '#6200ee',
  },
  moodButtonText: {
    color: '#666',
  },
  moodButtonTextSelected: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;